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
## GitHub activity leaderboard — 2026-10-27

Ranked by GitHub stars. Activity fields are fetched daily from the GitHub API.

| # | Tool | ★ Stars | Contributors ≥20 | Contributors ≥100 | Last push |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | [Orca](https://github.com/stablyai/orca) | 107,424 | 14 | 8 | today |
| 2 | [Warp 2.0](https://github.com/warpdotdev/warp) | 65,721 | 26 | 5 | today |
| 3 | [Herder (herdr)](https://github.com/herdrdev/herdr) | 46,087 | 6 | 3 | yesterday |
| 4 | [AionUi](https://github.com/iOfficeAI/AionUi) | 33,808 | 24 | 10 | 4d ago |
| 5 | [t3 code](https://github.com/pingdotgg/t3code) | 30,602 | 27 | 9 | today |
| 6 | [Happy](https://github.com/slopus/happy) | 24,339 | 7 | 5 | today |
| 7 | [Paseo](https://github.com/getpaseo/paseo) | 22,183 | 5 | 3 | today |
| 8 | [Superset](https://github.com/superset-sh/superset) | 15,608 | 6 | 4 | today |
| 9 | [Claude Code UI (CloudCLI)](https://github.com/siteboon/claudecodeui) | 14,303 | 2 | 2 | today |
| 10 | [Orchestrator.inc (formerly Agent Orchestrator)](https://github.com/OrchestratorInc/agent-orchestrator) | 13,742 | 28 | 11 | today |
| 11 | [OpenChamber](https://github.com/openchamber/openchamber) | 12,224 | 18 | 4 | today |
| 12 | [Emdash](https://github.com/generalaction/emdash) | 6,094 | 16 | 5 | yesterday |
| 13 | [bb](https://github.com/get-bb/bb) | 4,633 | 7 | 5 | today |
| 14 | [MonoCode](https://github.com/hardbeat920/monocode) | 3,445 | 3 | 1 | today |
| 15 | [Automaker](https://github.com/AutoMaker-Org/automaker) | 3,227 | 10 | 4 | 2026-05-22 |
| 16 | [Synara](https://github.com/Emanuele-web04/synara) | 2,138 | 15 | 7 | today |
| 17 | [Xum (formerly Mux)](https://github.com/coder/xum) | 2,060 | 10 | 5 | today |
| 18 | [Jean](https://github.com/coollabsio/jean) | 1,367 | 3 | 1 | today |
| 19 | [pi-gui](https://github.com/minghinmatthewlam/pi-gui) | 1,324 | 3 | 1 | today |
| 20 | [49Agents](https://github.com/alpbahadur/49Agents) | 619 | 2 | 1 | 26d ago |
| 21 | [omg.dev](https://github.com/BennyKok/omg.dev) | 551 | 2 | 2 | today |
| 22 | [ADE](https://github.com/arul28/ADE) | 126 | 1 | 1 | today |

[Raw daily JSON](./stats/daily.json) · [Full stats history](./stats/stats-history.json)
<!-- DAILY_TABLE:END -->

<details>
<summary><strong>Feature matrix</strong></summary>

The feature matrix is static and maintained through the individual files in [`content/tools/`](./content/tools).

| Tool | Category | Platforms | Parallel agents | Isolation | Local / cloud | Mobile control |
| --- | --- | --- | --- | --- | --- | --- |
| [49Agents](https://github.com/alpbahadur/49Agents) | Visual canvas | W ✓ · L ✓ · M ✓ | Visualizes multiple agent instances on one infinite zoomable 2D canvas | Not explicitly documented as git-worktree-based | Both — self-host on one machine or a Tailscale cluster, hosted app coming soon | No |
| [ADE](https://github.com/arul28/ADE) | CLI orchestrator | W β · L β · M ✓ · I ✓ | Isolated git worktrees per agent is the core design | Explicitly isolated git worktrees | Both — 'ADE Brain' installs on any machine, controlled via web/desktop/terminal/mobile clients | iOS explicitly confirmed (worktrees/agents/PRs sync to iOS); Android unconfirmed |
| [AionUi](https://github.com/iOfficeAI/AionUi) | Agent workspace | W ✓ · L ✓ · M ✓ | Parallel sessions with independent context; Leader/Teammate multi-agent mode delegates subtasks via a built-in Team MCP server, external agents (Claude Code, Codex, Gemini CLI) join through ACP | Not git-worktree-based; sessions run in independent contexts on the host | Local desktop app, or WebUI server mode on a LAN/VPS | WebUI from a phone browser plus Telegram/Lark/DingTalk/WeChat bots |
| [Automaker](https://github.com/AutoMaker-Org/automaker) | Agentic development studio | W ✓ · L ✓ · M ✓ | Multi-agent task execution from a Kanban-style feature board | Git worktree isolation | Local/self-hosted | No dedicated native mobile app stated |
| [bb](https://github.com/get-bb/bb) | CLI orchestrator | W β · L β · M ✓ | Multiple concurrent agent threads, delegation across providers (Claude, OpenAI, Cursor, etc.) | Each thread keeps its own independent execution context | Local-first, plus remote-machine access | No |
| [Claude Code UI (CloudCLI)](https://github.com/siteboon/claudecodeui) | Terminal + cloud IDE | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | Runs Claude Code, Cursor CLI, Codex, Gemini CLI, and OpenCode side by side; each team member gets an isolated container | Per-user/session isolated container (hosted) or local process (self-hosted) | Both — self-host the AGPL-3.0 core, or use the hosted cloudcli.ai service | Full mobile PWA — chat, terminal, file explorer, and git from a phone |
| [Emdash](https://github.com/generalaction/emdash) | Agent multiplexer | W ✓ · L ✓ · M ✓ | Multiple coding agents in parallel, each in its own Git worktree | Dedicated git worktree and branch per task | Both — local projects and remote machines | No dedicated native mobile app stated |
| [Happy](https://github.com/slopus/happy) | CLI orchestrator | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | Multi-provider harness (Claude, Codex, Grok) with subagent delegation on any provider; multiple sessions per project | Not explicitly documented as git-worktree-based | Local: agents run on your own hardware; an end-to-end encrypted relay syncs sessions to your phone | Native iOS (App Store) + Android (Google Play) apps, E2E encrypted |
| [Herder (herdr)](https://github.com/herdrdev/herdr) | Terminal multiplexer | W β · L ✓ · M ✓ | Core purpose — terminal multiplexer for N parallel CLI agents | Native `herdr worktree create` | Local, with `--remote` SSH flag to a remote host | No |
| [Jean](https://github.com/coollabsio/jean) | CLI orchestrator | W ✓ · L ✓ · M ✓ | Runs Claude Code, Codex, Cursor CLI, and OpenCode as pluggable agent backends | Native git worktree per chat session | Local desktop app, with a built-in headless server (browser-accessible) mode | No |
| [MonoCode](https://github.com/hardbeat920/monocode) | CLI orchestrator | W ✓ · L ✓ · M ✓ · A β · I β | Each tab is an agent session, split panes side by side; /operator lets an agent open sessions and manage worktrees; experimental cross-project Monos agents with memory and scheduled tasks | Separate git worktree per parallel task | Local desktop app; experimental remote hosts over SSH | Companion iOS/Android app (built from source) paired over QUIC with the desktop: read transcripts, send messages, start sessions, view changes |
| [omg.dev](https://github.com/BennyKok/omg.dev) | CLI orchestrator | L ✓ · M ✓ | Runs Claude Code, Codex, OpenCode, Cursor, Grok, Copilot, and Pi side by side; agents can delegate to subagents | None by design — tmux-backed sessions run directly with shell access on the host machine | Local execution on your own machine/VPS, remote control-plane | Installable web PWA for checking on work, answering prompts, and steering sessions from a phone |
| [OpenChamber](https://github.com/openchamber/openchamber) | Agent workspace | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | Multi-run supports up to five models, optionally with separate worktrees | Optional per-run git worktrees | Both — local workstation/server and remote access | Native iOS/Android plus Web/PWA for steering sessions, reviewing changes, and terminal access |
| [Orca](https://github.com/stablyai/orca) | CLI orchestrator | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | 30+ simultaneous CLI agents, session forking | Native git worktree per task | Both — local, remote/self-hosted servers, experimental cloud VM sandboxes | iOS (App Store/TestFlight) + Android (APK) |
| [Orchestrator.inc (formerly Agent Orchestrator)](https://github.com/OrchestratorInc/agent-orchestrator) | CLI orchestrator | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | Fleet of worker agents (30+ supported harnesses — Claude Code, Codex, Cursor, OpenCode, Copilot, Aider, Goose, Devin, more), coordinated by a main orchestrator agent | Each worker agent spawned into its own git worktree | Both: local desktop (code, worktrees and agents on your machine) or AO Cloud where everything lives in the cloud | Native iPhone (App Store) + Android (Play Store) apps to control agents running on your desktop, answer their questions from your phone |
| [Paseo](https://github.com/getpaseo/paseo) | CLI orchestrator | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | Core purpose — agents across multiple devices | Git worktree per agent run | Both — daemon on laptop, home server, or VPS/VM; clients everywhere | Native iOS + Android with desktop feature parity |
| [pi-gui](https://github.com/minghinmatthewlam/pi-gui) | CLI orchestrator | L ✓ · M ✓ | Multi-workspace sessions — independent session history per project folder | Not explicitly documented as git-worktree-based | Local desktop app (Electron) | No |
| [Superset](https://github.com/superset-sh/superset) | CLI orchestrator | L β · M ✓ · A β | Designed for 10-100+ simultaneous agents | Isolated git worktree per agent/task | Both — local + 'Remote Workspaces' via Superset Relay proxy | Android app in beta (per user) |
| [Synara](https://github.com/Emanuele-web04/synara) | Agent workspace | W ✓ · L ✓ · M ✓ | Parallel threads per project across Codex, Claude Code, Cursor, Antigravity, Grok Build, Factory Droid, OpenCode, Pi and Devin; handoff of a thread to another provider with context | Local checkout or isolated managed git worktree per thread | Local-first desktop app; optional server + web mode | No |
| [t3 code](https://github.com/pingdotgg/t3code) | CLI orchestrator | W ✓ · L ✓ · M ✓ · A ✓ · I ✓ | Multi-agent orchestration (Agent + Workflow tools), no fixed cap stated | Git worktree isolation | Local execution, remote control-plane | Native iOS + Android |
| [Warp 2.0](https://github.com/warpdotdev/warp) | Terminal + cloud IDE | W ✓ · L ✓ · M ✓ | Native multi-agent + "Oz" cloud orchestration for hundreds in parallel | Oz: Docker-based sandbox isolation (not literal git worktrees) | Both — local terminal + Oz cloud orchestration platform | No |
| [Xum (formerly Mux)](https://github.com/coder/xum) | Agent multiplexer | W ✓ · L ✓ · M ✓ | Multiple AI coding agents in parallel, with multi-model support | Local directories, git worktrees, or remote SSH workspaces | Both — local execution and remote compute over SSH | Responsive browser UI in server mode |

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
mobileCtl: "One line on mobile app support, or "No""
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
