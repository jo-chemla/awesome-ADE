import dailyStats from "../stats/daily.json"
import { DataTable } from "@/components/data-table"
import { GitHubLink } from "@/components/github-link"
import { ThemeToggle } from "@/components/theme-toggle"
import { columns } from "@/components/columns"
import { STATIC_TOOLS } from "@/lib/load-tools"
import type { Tool } from "@/lib/types"

// A fork can point the links at its own repo — see .env.example.
const REPO_URL =
  (import.meta.env.VITE_REPO_URL as string | undefined) ?? "https://github.com/jo-chemla/awesome-ADE"

function formatUpdatedLabel(pushedAt: string): string {
  if (!pushedAt) return "—"
  const days = Math.floor((Date.now() - new Date(pushedAt).getTime()) / 86_400_000)
  if (days <= 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  return new Date(pushedAt).toISOString().slice(0, 10)
}

const statsByKey = new Map(dailyStats.tools.map((row) => [row.key, row]))

const data: Tool[] = STATIC_TOOLS.map((tool) => {
  const stats = statsByKey.get(tool.key)
  return {
    ...tool,
    pf: tool.platform,
    stars: stats?.stars ?? null,
    c20: stats?.c20 ?? null,
    c100: stats?.c100 ?? null,
    pushedAt: stats?.pushedAt || null,
    updatedLabel: stats
      ? formatUpdatedLabel(stats.pushedAt)
      : tool.github
        ? "—" // Added since the last daily run.
        : (tool.updatedLabel ?? "no public repo"),
  }
})

export default function App() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-lg font-bold sm:text-xl">
            Agentic Dev Environments — feature &amp; activity comparison
          </h1>
          <div className="flex shrink-0 items-center gap-1">
            <GitHubLink href={REPO_URL} />
            <ThemeToggle />
          </div>
        </div>
        <p className="mt-1 max-w-[75ch] text-sm text-muted-foreground">
          Stars and contributor counts are refreshed daily from the GitHub API
          <span className="hidden sm:inline">
            {" "}
            (contributor count = lifetime
            commits &ge;20, with &ge;100 shown as a secondary tag, bot/automation
            accounts included since they reflect real commit history). Feature
            and platform columns come from each project's own docs/site,
            committed as data in this repo
          </span>
          .
          {" "}
          <a
            className="text-blue-600 hover:underline dark:text-blue-400"
            href={`${REPO_URL}/tree/main/content/tools`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contribute or correct an entry →
          </a>
        </p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
