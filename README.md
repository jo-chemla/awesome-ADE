# ADE Comparison Table

A filterable, sortable comparison table of agentic dev environments (AI
coding-agent orchestrators, terminal multiplexers, visual canvases, and
editor-integrated harnesses): platform support, isolation model, and
GitHub activity, side by side.

**[Live site →](https://jo-chemla.github.io/awesome-ADE/)** 

Great resources: 
- [andyrewlee/awesome-agent-orchestrators](https://github.com/andyrewlee/awesome-agent-orchestrators)

## How the data works

- **Static, contributable fields** — name, website/repo links, license,
  platform support, and feature descriptions — live in
  [`content/tools/`](./content/tools), one `.mdx` file per tool. Frontmatter
  holds the structured fields the table renders; anything written below the
  `---` is shown as a small note on that row.
- **Live fields** — star count, contributor activity, last-push date — are
  fetched directly from the GitHub REST API in the visitor's browser on
  every page load, cached in `localStorage` for an hour. Nothing here is
  baked in at build time, so the numbers are never stale between deploys.

## Contributing a tool

Add a new tool by adding one file, `content/tools/<key>.mdx`:

```mdx
---
key: my-tool
name: "My Tool"
category: "CLI orchestrator" # or: Terminal multiplexer | Visual canvas | Terminal + cloud IDE | Editor-integrated
website: "https://example.com"
github: "https://github.com/org/repo" # or null if there's no public repo
license: "MIT, open source"
platform:
  windows: full # full | beta | none | unknown
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

Open a PR — no code changes needed for a new row. To correct an existing
entry, edit its file directly.

## Local development

```sh
pnpm install
pnpm dev
```

## Deploying your own copy

1. Push this repo to GitHub.
2. In **Settings → Pages**, set **Source** to "GitHub Actions".
3. Push to `main` — [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
   builds the Vite app and deploys `dist/` to GitHub Pages automatically.

The GitHub API calls are unauthenticated (60 requests/hour per visitor IP),
so no secrets or tokens are needed anywhere in this setup.

<!-- DAILY_TABLE:START -->
## Daily activity snapshot — 2026-08-17

This table is regenerated daily from the GitHub API. `Contrib ≥20` is the number of contributors with at least 20 lifetime commits; `@ ≥100` is the corresponding ≥100 count.

| Tool | Category | ★ Stars | Contrib ≥20 | @ ≥100 | Last updated | Platforms | Parallel agents | Isolation | Local / cloud | Mobile control |
| --- | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| [49Agents](https://github.com/alpbahadur/49Agents) | Visual canvas | 399 | 2 | 1 | today | W=✓ L=✓ M=✓ A=— I=— | Visualizes multiple agent instances on one infinite zoomable 2D canvas | Not explicitly documented as git-worktree-based | Both — self-host on one machine or a Tailscale cluster, hosted app coming soon | No |
| [ADE](https://github.com/arul28/ADE) | CLI orchestrator | 86 | 1 | 1 | today | W=β L=β M=✓ A=— I=✓ | Isolated git worktrees per agent is the core design | Explicitly isolated git worktrees | Both — 'ADE Brain' installs on any machine, controlled via web/desktop/terminal/mobile clients | iOS explicitly confirmed (worktrees/agents/PRs sync to iOS); Android unconfirmed |
| [Agent Orchestrator (AO)](https://github.com/Untrivial-ai/agent-orchestrator) | CLI orchestrator | 9,577 | 25 | 5 | today | W=— L=— M=✓ A=— I=— | Fleet of worker agents (25+ supported harnesses — Claude Code, Codex, Cursor, OpenCode, Copilot, Aider, Goose, Devin, more), coordinated by a main orchestrator agent | Each worker agent spawned into its own git worktree | Local — orchestrator and agents run on your machine; mobile app only monitors/notifies | Monitoring/notifications only, via the mobile companion app |
| [Automaker](https://github.com/AutoMaker-Org/automaker) | Agentic development studio | 3,213 | 10 | 4 | 2026-05-22 | W=✓ L=✓ M=✓ A=— I=— | Multi-agent task execution from a Kanban-style feature board | Git worktree isolation | Local/self-hosted | No dedicated native mobile app stated |
| [bb](https://github.com/get-bb/bb) | CLI orchestrator | 2,172 | 4 | 4 | today | W=β L=β M=✓ A=— I=— | Multiple concurrent agent threads, delegation across providers (Claude, OpenAI, Cursor, etc.) | Each thread keeps its own independent execution context | Local-first, plus remote-machine access | No |
| [Claude Code UI (CloudCLI)](https://github.com/siteboon/claudecodeui) | Terminal + cloud IDE | 13,319 | 2 | 2 | 3d ago | W=✓ L=✓ M=✓ A=✓ I=✓ | Runs Claude Code, Cursor CLI, Codex, Gemini CLI, and OpenCode side by side; each team member gets an isolated container | Per-user/session isolated container (hosted) or local process (self-hosted) | Both — self-host the AGPL-3.0 core, or use the hosted cloudcli.ai service | Full mobile PWA — chat, terminal, file explorer, and git from a phone |
| Zed Delta | Editor-integrated | — | — | — | — | W=✓ L=✓ M=✓ A=— I=— | Unknown — not specifically addressed | Different model — DeltaDB is CRDT-based real-time sync, not git worktrees | Both — native app + browser (WASM) + cloud runners for agent work | No |
| [Emdash](https://github.com/generalaction/emdash) | Agent multiplexer | 5,421 | 16 | 5 | yesterday | W=✓ L=✓ M=✓ A=— I=— | Multiple coding agents in parallel, each in its own Git worktree | Dedicated git worktree and branch per task | Both — local projects and remote machines | No dedicated native mobile app stated |
| [Herder (herdr)](https://github.com/herdrdev/herdr) | Terminal multiplexer | 29,902 | 4 | 1 | today | W=β L=✓ M=✓ A=— I=— | Core purpose — terminal multiplexer for N parallel CLI agents | Native `herdr worktree create` | Local, with `--remote` SSH flag to a remote host | No |
| [Jean](https://github.com/coollabsio/jean) | CLI orchestrator | 1,180 | 3 | 1 | 3d ago | W=✓ L=✓ M=✓ A=— I=— | Runs Claude Code, Codex, Cursor CLI, and OpenCode as pluggable agent backends | Native git worktree per chat session | Local desktop app, with a built-in headless server (browser-accessible) mode | No |
| [Mux](https://github.com/coder/mux) | Agent multiplexer | 1,973 | 10 | 5 | today | W=— L=✓ M=✓ A=— I=— | Multiple AI coding agents in parallel, with multi-model support | Local directories, git worktrees, or remote SSH workspaces | Both — local execution and remote compute over SSH | Responsive browser UI in server mode |
| [OpenChamber](https://github.com/openchamber/openchamber) | Agent workspace | 8,868 | 11 | 3 | today | W=✓ L=✓ M=✓ A=✓ I=✓ | Multi-run supports up to five models, optionally with separate worktrees | Optional per-run git worktrees | Both — local workstation/server and remote access | Native iOS/Android plus Web/PWA for steering sessions, reviewing changes, and terminal access |
| [Orca](https://github.com/stablyai/orca) | CLI orchestrator | 46,971 | 12 | 6 | today | W=✓ L=✓ M=✓ A=✓ I=✓ | 30+ simultaneous CLI agents, session forking | Native git worktree per task | Both — local, remote/self-hosted servers, experimental cloud VM sandboxes | iOS (App Store/TestFlight) + Android (APK) |
| [Paseo](https://github.com/getpaseo/paseo) | CLI orchestrator | 14,014 | 5 | 3 | today | W=✓ L=✓ M=✓ A=✓ I=✓ | Core purpose — agents across multiple devices | Git worktree per agent run | Both — daemon on laptop, home server, or VPS/VM; clients everywhere | Native iOS + Android with desktop feature parity |
| [pi-gui](https://github.com/minghinmatthewlam/pi-gui) | CLI orchestrator | 840 | 1 | 1 | 20d ago | W=— L=✓ M=✓ A=— I=— | Multi-workspace sessions — independent session history per project folder | Not explicitly documented as git-worktree-based | Local desktop app (Electron) | No |
| [Superset](https://github.com/superset-sh/superset) | CLI orchestrator | 12,979 | 5 | 3 | today | W=— L=β M=✓ A=β I=— | Designed for 10-100+ simultaneous agents | Isolated git worktree per agent/task | Both — local + 'Remote Workspaces' via Superset Relay proxy | Android app in beta (per user) |
| [t3 code](https://github.com/pingdotgg/t3code) | CLI orchestrator | 19,006 | 9 | 2 | today | W=✓ L=✓ M=✓ A=✓ I=✓ | Multi-agent orchestration (Agent + Workflow tools), no fixed cap stated | Git worktree isolation | Local execution, remote control-plane | Native iOS + Android |
| [Warp 2.0](https://github.com/warpdotdev/warp) | Terminal + cloud IDE | 64,269 | 23 | 4 | today | W=✓ L=✓ M=✓ A=— I=— | Native multi-agent + \"Oz\" cloud orchestration for hundreds in parallel | Oz: Docker-based sandbox isolation (not literal git worktrees) | Both — local terminal + Oz cloud orchestration platform | No |
| Spotify Xirp | Editor-integrated | — | — | — | — | W=— L=— M=β A=— I=— | 50+ concurrent sessions claimed | Each session in its own isolated worktree | Local (Mac) only, currently | No |

[Raw daily JSON](./stats/daily.json) · [Full stats history](./stats/stats-history.json)
<!-- DAILY_TABLE:END -->
