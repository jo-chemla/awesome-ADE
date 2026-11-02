#!/usr/bin/env python3
"""Fetch GitHub activity stats, persist history, and refresh the README leaderboard."""

from __future__ import annotations

import datetime as dt
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
TOOLS_DIR = ROOT / "content" / "tools"
STATS_DIR = ROOT / "stats"
DAILY_PATH = STATS_DIR / "daily.json"
HISTORY_PATH = STATS_DIR / "stats-history.json"
STAR_HISTORY_PATH = STATS_DIR / "star-history.json"
README_PATH = ROOT / "README.md"

START = "<!-- DAILY_TABLE:START -->"
END = "<!-- DAILY_TABLE:END -->"


def github_get(url: str, token: str | None = None):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "awesome-ADE-daily-stats",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    for attempt in range(4):
        try:
            with urlopen(Request(url, headers=headers), timeout=30) as response:
                return json.load(response)
        except HTTPError as exc:
            if exc.code in (403, 429) and attempt < 3:
                retry_after = exc.headers.get("Retry-After")
                time.sleep(int(retry_after) if retry_after and retry_after.isdigit() else 2 ** attempt)
                continue
            raise


def parse_frontmatter(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"^---\s*\n(.*?)\n---\s*(?:\n|$)", text, re.S | re.M)
    if not match:
        raise ValueError(f"No frontmatter in {path}")
    data: dict[str, object] = {}
    current_map: dict[str, str] | None = None
    for line in match.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith("  ") and current_map is not None:
            key, value = line.strip().split(":", 1)
            current_map[key.strip()] = scalar(value.strip())
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key, value = key.strip(), value.strip()
        if not value:
            current_map = {}
            data[key] = current_map
        else:
            current_map = None
            data[key] = scalar(value)
    return data


def scalar(value: str):
    value = value.split(" #", 1)[0].strip()
    if value in ("null", "~"):
        return None
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    return value


def repo_path(github: object) -> str | None:
    if not github or not isinstance(github, str):
        return None
    match = re.match(r"https?://github\.com/([^/]+/[^/]+?)/?$", github.strip())
    return match.group(1) if match else None


def fetch_stats(repo: str, token: str | None) -> dict[str, object]:
    info = github_get(f"https://api.github.com/repos/{repo}", token)
    contributions: list[int] = []
    page = 1
    while page <= 10:
        rows = github_get(
            f"https://api.github.com/repos/{repo}/contributors?per_page=100&page={page}&anon=true",
            token,
        )
        if not isinstance(rows, list) or not rows:
            break
        contributions.extend(int(row.get("contributions", 0)) for row in rows if isinstance(row, dict))
        if len(rows) < 100:
            break
        page += 1
    return {
        "stars": int(info.get("stargazers_count", 0)),
        "pushedAt": info.get("pushed_at", ""),
        "c20": sum(n >= 20 for n in contributions),
        "c100": sum(n >= 100 for n in contributions),
    }


def fetch_star_days(repo: str, token: str | None) -> dict[dt.date, int]:
    """Stars gained per day, over the repo's whole life."""
    days: dict[dt.date, int] = {}
    # The endpoint serves 30 weeks a page, newest first, and stops at page 100.
    for page in range(1, 101):
        weeks = github_get(
            f"https://api.github.com/repos/{repo}/stargazers/history?per_page=30&page={page}",
            token,
        )
        for week in weeks:
            start = dt.datetime.fromtimestamp(week["week"], dt.timezone.utc).date()
            for offset, stars in enumerate(week["days"]):
                days[start + dt.timedelta(days=offset)] = stars
        if len(weeks) < 30:
            break
    return days


def update_star_history(tools: list[dict[str, object]], token: str | None, today: dt.date) -> None:
    """Write each tool's cumulative stars per week, for the site's chart."""
    previous = {"weeks": [], "tools": {}}
    if STAR_HISTORY_PATH.exists():
        previous = json.loads(STAR_HISTORY_PATH.read_text(encoding="utf-8"))

    days_by_key: dict[str, dict[dt.date, int]] = {}
    failed: list[str] = []
    for tool in tools:
        key = str(tool.get("key", ""))
        repo = repo_path(tool.get("github"))
        if not repo:
            continue
        try:
            days_by_key[key] = fetch_star_days(repo, token)
        except Exception as exc:
            print(f"warning: star history for {key}: {exc}", file=sys.stderr)
            failed.append(key)
    if not days_by_key:
        return

    first_day = min(day for days in days_by_key.values() for day in days)
    sundays = first_day - dt.timedelta(days=(first_day.weekday() + 1) % 7)
    samples: list[dt.date] = []
    while sundays < today:
        samples.append(sundays)
        sundays += dt.timedelta(days=7)
    samples.append(today)

    series: dict[str, list[int]] = {}
    for key, days in days_by_key.items():
        ordered = sorted(days.items())
        total = index = 0
        values = []
        for sample in samples:
            while index < len(ordered) and ordered[index][0] <= sample:
                total += ordered[index][1]
                index += 1
            values.append(total)
        series[key] = values

    # Start once a second tool has traction, or one old repo stretches the axis
    # across years where it is the only line.
    start = next(
        i for i in range(len(samples))
        if sum(values[i] >= 100 for values in series.values()) >= 2 or i == len(samples) - 1
    )
    weeks = [sample.isoformat() for sample in samples[start:]]
    tools_out = {key: values[start:] for key, values in sorted(series.items())}

    # A tool whose fetch failed keeps its last known values, aligned on date.
    old_weeks = previous.get("weeks", [])
    for key in failed:
        old = dict(zip(old_weeks, previous.get("tools", {}).get(key, [])))
        if old:
            known = 0
            values = []
            for week in weeks:
                known = old.get(week, known)
                values.append(known)
            tools_out[key] = values

    lines = ",\n".join(f"    {json.dumps(key)}: {json.dumps(values)}" for key, values in tools_out.items())
    STAR_HISTORY_PATH.write_text(
        f'{{\n  "weeks": {json.dumps(weeks)},\n  "tools": {{\n{lines}\n  }}\n}}\n',
        encoding="utf-8",
    )


def load_tools() -> list[dict[str, object]]:
    return [parse_frontmatter(path) for path in sorted(TOOLS_DIR.glob("*.mdx"))]


def fmt_num(value: object) -> str:
    return f"{int(value):,}" if value is not None else "—"


def fmt_date(value: object) -> str:
    if not value:
        return "—"
    try:
        d = dt.datetime.fromisoformat(str(value).replace("Z", "+00:00")).date()
        days = (dt.datetime.now(dt.timezone.utc).date() - d).days
        if days <= 0:
            return "today"
        if days == 1:
            return "yesterday"
        if days < 30:
            return f"{days}d ago"
        return d.isoformat()
    except ValueError:
        return str(value)


def clean_cell(value: object) -> str:
    return str(value or "").replace("|", "\\|").replace("\n", " ").strip()


def make_table(rows: list[dict[str, object]], today: str) -> str:
    rows = sorted(rows, key=lambda x: (x.get("stars") is None, -(x.get("stars") or 0)))
    lines = [
        START,
        f"## GitHub activity leaderboard — {today}",
        "",
        "Ranked by GitHub stars. Activity fields are fetched daily from the GitHub API.",
        "",
        "| # | Tool | ★ Stars | Contributors ≥20 | Contributors ≥100 | Last push |",
        "| ---: | --- | ---: | ---: | ---: | --- |",
    ]
    for i, row in enumerate(rows, 1):
        lines.append(
            f"| {i} | [{clean_cell(row['name'])}]({row['github']}) | "
            f"{fmt_num(row.get('stars'))} | {fmt_num(row.get('c20'))} | "
            f"{fmt_num(row.get('c100'))} | {fmt_date(row.get('pushedAt'))} |"
        )
    lines.extend([
        "",
        "[Raw daily JSON](./stats/daily.json) · [Full stats history](./stats/stats-history.json)",
        END,
    ])
    return "\n".join(lines)


def update_readme(table: str) -> None:
    text = README_PATH.read_text(encoding="utf-8")
    if START in text and END in text:
        pattern = re.escape(START) + r".*?" + re.escape(END)
        text = re.sub(pattern, table, text, count=1, flags=re.S)
    else:
        text = text.rstrip() + "\n\n" + table + "\n"
    README_PATH.write_text(text, encoding="utf-8")


def main() -> int:
    token = os.environ.get("GITHUB_TOKEN")
    today = dt.datetime.now(dt.timezone.utc).date().isoformat()
    generated_at = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    tools = load_tools()
    rows: list[dict[str, object]] = []

    for tool in tools:
        key = str(tool.get("key", ""))
        repo = repo_path(tool.get("github"))
        if not repo:
            print(f"Skipping {key}: no GitHub repository", file=sys.stderr)
            continue
        print(f"Fetching {key}: {repo}", flush=True)
        try:
            stats = fetch_stats(repo, token)
        except Exception as exc:
            print(f"warning: {key}: {exc}", file=sys.stderr)
            stats = {}
        rows.append({
            "key": key,
            "name": str(tool.get("name", key)),
            "github": tool.get("github"),
            **stats,
        })

    snapshot = {"date": today, "generatedAt": generated_at, "tools": rows}
    STATS_DIR.mkdir(exist_ok=True)
    DAILY_PATH.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    history = []
    if HISTORY_PATH.exists():
        history = json.loads(HISTORY_PATH.read_text(encoding="utf-8"))
        if not isinstance(history, list):
            raise ValueError("stats-history.json must contain a JSON array")
    history = [entry for entry in history if entry.get("date") != today]
    history.append(snapshot)
    history.sort(key=lambda entry: entry.get("date", ""))
    HISTORY_PATH.write_text(json.dumps(history, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    update_readme(make_table(rows, today))
    update_star_history(tools, token, dt.date.fromisoformat(today))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
