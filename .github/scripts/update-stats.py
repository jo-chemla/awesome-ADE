#!/usr/bin/env python3
"""Fetch GitHub activity stats, persist history, and refresh the README table."""

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
README_PATH = ROOT / "README.md"

START = "<!-- DAILY_TABLE:START -->"
END = "<!-- DAILY_TABLE:END -->"


def github_get(url: str, token: str | None = None):
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "awesome-ADE-daily-stats", "X-GitHub-Api-Version": "2022-11-28"}
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
        rows = github_get(f"https://api.github.com/repos/{repo}/contributors?per_page=100&page={page}&anon=true", token)
        if not isinstance(rows, list) or not rows:
            break
        contributions.extend(int(row.get("contributions", 0)) for row in rows if isinstance(row, dict))
        if len(rows) < 100:
            break
        page += 1
    return {"stars": int(info.get("stargazers_count", 0)), "pushedAt": info.get("pushed_at", ""), "c20": sum(n >= 20 for n in contributions), "c100": sum(n >= 100 for n in contributions)}


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


def platform_summary(platform: object) -> str:
    if not isinstance(platform, dict):
        return ""
    labels = [("W", "windows"), ("L", "linux"), ("M", "macos"), ("A", "android"), ("I", "ios")]
    return " ".join(f"{letter}={'✓' if platform.get(key) == 'full' else 'β' if platform.get(key) == 'beta' else '—'}" for letter, key in labels)


def clean_cell(value: object) -> str:
    return str(value or "").replace("|", "\\|").replace("\n", " ").strip()


def make_table(tools: list[dict[str, object]], stats_by_key: dict[str, dict[str, object]], today: str) -> str:
    lines = [
        START,
        f"## Daily activity snapshot — {today}",
        "",
        "This table is regenerated daily from the GitHub API. `Contrib ≥20` is the number of contributors with at least 20 lifetime commits; `@ ≥100` is the corresponding ≥100 count.",
        "",
        "| Tool | Category | ★ Stars | Contrib ≥20 | @ ≥100 | Last updated | Platforms | Parallel agents | Isolation | Local / cloud | Mobile control |",
        "| --- | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |",
    ]
    for tool in tools:
        key = str(tool.get("key", ""))
        stats = stats_by_key.get(key, {})
        name = clean_cell(tool.get("name", key))
        category = clean_cell(tool.get("category", ""))
        github = tool.get("github") or ""
        name_cell = f"[{name}]({github})" if github else name
        row = [
            name_cell, category, fmt_num(stats.get("stars")), fmt_num(stats.get("c20")), fmt_num(stats.get("c100")),
            fmt_date(stats.get("pushedAt")), platform_summary(tool.get("platform")), clean_cell(tool.get("parallel")),
            clean_cell(tool.get("isolation")), clean_cell(tool.get("locality")), clean_cell(tool.get("mobileCtl")),
        ]
        lines.append("| " + " | ".join(row) + " |")
    lines.extend(["", "[Raw daily JSON](./stats/daily.json) · [Full stats history](./stats/stats-history.json)", END])
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
    stats_by_key: dict[str, dict[str, object]] = {}
    for tool in tools:
        key = str(tool.get("key", ""))
        repo = repo_path(tool.get("github"))
        if not repo:
            continue
        print(f"Fetching {key}: {repo}", flush=True)
        try:
            stats_by_key[key] = fetch_stats(repo, token)
        except Exception as exc:
            print(f"warning: {key}: {exc}", file=sys.stderr)
    snapshot = {"date": today, "generatedAt": generated_at, "tools": [{"key": str(tool.get("key", "")), "name": str(tool.get("name", tool.get("key", ""))), "github": tool.get("github"), **stats_by_key.get(str(tool.get("key", "")), {})} for tool in tools]}
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
    update_readme(make_table(tools, stats_by_key, today))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
