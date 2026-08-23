# ADE Comparison Table

A comparison of agentic development environments. The daily section is an **activity-only GitHub leaderboard**; the feature matrix is static and foldable.

**[Live site →](https://jo-chemla.github.io/awesome-ADE/)**

**Table implementation:** Adapted from the [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/data-table), powered by [TanStack Table](https://tanstack.com/table) and modified for this project as a fully client-side implementation.

Great resources:
- [andyrewlee/awesome-agent-orchestrators](https://github.com/andyrewlee/awesome-agent-orchestrators)
- [Picrew/awesome-agent-harness](https://github.com/Picrew/awesome-agent-harness)

## GitHub activity leaderboard

The leaderboard is regenerated daily from the GitHub API and keeps historical snapshots in [`stats/stats-history.json`](./stats/stats-history.json). It includes only tools with a public GitHub repository.

<!-- DAILY_TABLE:START -->
## GitHub activity leaderboard — 2026-08-23

Ranked by GitHub stars. Activity fields are fetched daily from the GitHub API.

| # | Tool | ★ Stars | Contributors ≥20 | Contributors ≥100 | Last push |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | [Warp 2.0](https://github.com/warpdotdev/warp) | 64,453 | 23 | 4 | today |
| 2 | [Orca](https://github.com/stablyai/orca) | 51,357 | 12 | 6 | today |
| 3 | [Herder (herdr)](https://github.com/herdrdev/herdr) | 31,626 | 4 | 1 | today |
| 4 | [t3 code](https://github.com/pingdotgg/t3code) | 20,086 | 9 | 2 | today |
| 5 | [Paseo](https://github.com/getpaseo/paseo) | 14,705 | 5 | 3 | yesterday |
| 6 | [Claude Code UI (CloudCLI)](https://github.com/siteboon/claudecodeui) | 13,394 | 2 | 2 | yesterday |
| 7 | [Superset](https://github.com/superset-sh/superset) | 13,236 | 5 | 3 | today |
| 8 | [Agent Orchestrator (AO)](https://github.com/Untrivial-ai/agent-orchestrator) | 9,870 | 25 | 5 | today |
| 9 | [OpenChamber](https://github.com/openchamber/openchamber) | 9,106 | 11 | 3 | yesterday |
| 10 | [Emdash](https://github.com/generalaction/emdash) | 5,466 | 16 | 5 | 2d ago |
| 11 | [Automaker](https://github.com/AutoMaker-Org/automaker) | 3,215 | 10 | 4 | 2026-05-22 |
| 12 | [bb](https://github.com/get-bb/bb) | 2,560 | 4 | 4 | today |
| 13 | [Mux](https://github.com/coder/mux) | 1,978 | 10 | 5 | today |
| 14 | [Jean](https://github.com/coollabsio/jean) | 1,195 | 3 | 1 | 3d ago |
| 15 | [pi-gui](https://github.com/minghinmatthewlam/pi-gui) | 870 | 1 | 1 | 26d ago |
| 16 | [omg.dev](https://github.com/BennyKok/omg.dev) | 477 | 2 | 2 | today |
| 17 | [49Agents](https://github.com/alpbahadur/49Agents) | 405 | 2 | 1 | 3d ago |
| 18 | [ADE](https://github.com/arul28/ADE) | 90 | 1 | 1 | today |

[Raw daily JSON](./stats/daily.json) · [Full stats history](./stats/stats-history.json)
<!-- DAILY_TABLE:END -->

<details>
<summary><strong>Feature matrix</strong></summary>

The feature matrix is static and maintained through the individual files in [`content/tools/`](./content/tools).

| Tool | Category | Platforms | Parallel agents | Isolation | Local / cloud | Mobile control |
| --- | --- | --- | --- | --- | --- | --- |
| [49Agents](https://github.com/alpbahadur/49Agents) | Visual canvas | W ✓ · L ✓ · M ✓ | Visualizes multiple agent instances on one infinite zoomable 2D canvas | Not explicitly documented as git-worktree-based | Both — self-host on one machine or a Tailscale cluster, hosted app coming soon | No |
| [ADE](https://github.com/arul28/ADE) | CLI orchestrator | W β · L β · M ✓ · I ✓ | Isolated git worktrees per agent is the core design | Explicitly isolated git worktrees | Both — brain on any machine, controlled via web/desktop/terminal/mobile | iOS explicitly confirmed; Android unconfirmed |
| [Agent Orchestrator (AO)](https://github.com/Untrivial-ai/agent-orchestrator) | CLI orchestrator | M ✓ | Fleet of worker agents across 25+ harnesses | Each worker agent gets its own git worktree | Local; mobile companion monitors/notifies | Monitoring/notifications via mobile companion |
| [Automaker](https://github.com/AutoMaker-Org/automaker) | Agentic development studio | W ✓ · L ✓ · M ✓ | Multi-agent task execution from a Kanban-style feature board | Git worktree isolation | Local/self-hosted | No dedicated native mobile app stated |
| [bb](https://github.com/get-bb/bb) | CLI orchestrator | W β · L β · M ✓ | Multiple concurrent agent threads and delegation across providers | Independent execution context per thread | Local-first, plus remote-machine access | No |
| [Claude Code UI (CloudCLI)](https://github.com/siteboon/claudecodeui) | Terminal + cloud IDE | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | Multiple coding agents side by side | Per-user/session isolated container or local process | Both — self-hosted or hosted cloud service | Full mobile PWA |
| [Emdash](https://github.com/generalaction/emdash) | Agent multiplexer | W ✓ · L ✓ · M ✓ | Multiple coding agents in parallel | Dedicated git worktree and branch per task | Both — local projects and remote machines | No dedicated native mobile app stated |
| [Herder (herdr)](https://github.com/herdrdev/herdr) | Terminal multiplexer | W β · L ✓ · M ✓ | Terminal multiplexer for N parallel CLI agents | Native `herdr worktree create` | Local, with `--remote` SSH | No |
| [Jean](https://github.com/coollabsio/jean) | CLI orchestrator | W ✓ · L ✓ · M ✓ | Claude Code, Codex, Cursor CLI, and OpenCode as pluggable backends | Native git worktree per chat session | Local desktop app + headless server mode | No |
| [Mux](https://github.com/coder/mux) | Agent multiplexer | L ✓ · M ✓ | Multiple AI coding agents in parallel | Local dirs, git worktrees, or remote SSH workspaces | Both — local and remote compute over SSH | Responsive browser UI in server mode |
| [OpenChamber](https://github.com/openchamber/openchamber) | Agent workspace | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | Multi-run supports up to five models | Optional per-run git worktrees | Both — local workstation/server and remote access | Native iOS/Android + Web/PWA |
| [Orca](https://github.com/stablyai/orca) | CLI orchestrator | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | 30+ simultaneous CLI agents, session forking | Native git worktree per task | Both — local, remote/self-hosted servers, experimental cloud VM sandboxes | iOS + Android |
| [Paseo](https://github.com/getpaseo/paseo) | CLI orchestrator | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | Agents across multiple devices | Git worktree per agent run | Both — daemon on laptop, home server, or VPS/VM | Native iOS + Android |
| [pi-gui](https://github.com/minghinmatthewlam/pi-gui) | CLI orchestrator | L ✓ · M ✓ | Multi-workspace sessions per project folder | Not explicitly documented as git-worktree-based | Local desktop app | No |
| [Superset](https://github.com/superset-sh/superset) | CLI orchestrator | L ✓ · M ✓ · A β | Designed for 10–100+ simultaneous agents | Isolated git worktree per agent/task | Both — local + Remote Workspaces | Android app in beta |
| [t3 code](https://github.com/pingdotgg/t3code) | CLI orchestrator | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | Multi-agent orchestration via Agent + Workflow tools | Git worktree isolation | Local execution, remote control-plane | Native iOS + Android |
| [Warp 2.0](https://github.com/warpdotdev/warp) | Terminal + cloud IDE | W ✓ · L ✓ · M ✓ | Native multi-agent + Oz cloud orchestration | Oz uses Docker-based sandbox isolation | Both — local terminal + cloud orchestration | No |

</details>

## How the data works

- **Static feature fields** — name, website/repo links, license, platform support, and feature descriptions — live in `content/tools/`, one `.mdx` file per tool.
- **Daily activity fields** — GitHub stars, contributors ≥20 commits, contributors ≥100 commits, and last-push date — are fetched by the scheduled GitHub Action and stored in `stats/daily.json` and `stats/stats-history.json`.
- Tools without a public GitHub repository are excluded from the leaderboard and activity JSON.

## Contributing a tool

Add a new tool by adding one file, `content/tools/<key>.mdx`:

```mdx
---
key: my-tool
name: "My Tool"
category: "CLI orchestrator"
website: "https://example.com"
github: "https://github.com/org/repo"
license: "MIT, open source"
platform:
  windows: full
  linux: full
  macos: full
  android: none
  ios: none
parallel: "One line on how it handles concurrent agents"
isolation: "One line on its worktree/sandbox model"
locality: "One line: local, cloud, or both"
remote: "One line on remote/SSH support"
mobileCtl: "One line on mobile app support, or \"No\""
---

Optional free-form note shown in a popover on that row.
```

Open a PR — no code changes needed for a new row. To correct an existing entry, edit its file directly.

## Local development

```sh
pnpm install
pnpm dev
```

## Deploying your own copy

1. Push this repo to GitHub.
2. In **Settings → Pages**, set **Source** to "GitHub Actions".
3. Push to `main` — [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) builds the Vite app and deploys `dist/` to GitHub Pages automatically.

The daily GitHub Action uses the repository's `GITHUB_TOKEN`; visitor-side live API fetching on the site remains separate from the historical leaderboard.
