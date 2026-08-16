# ADE Comparison Table

A filterable, sortable comparison table of agentic dev environments (AI
coding-agent orchestrators, terminal multiplexers, visual canvases, and
editor-integrated harnesses): platform support, isolation model, and
GitHub activity, side by side.

**[Live site →]([#](https://jo-chemla.github.io/awesome-ADE/))** *(update this link once deployed — see below)*

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
