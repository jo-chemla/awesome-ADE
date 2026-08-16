import { useEffect, useMemo, useState } from "react"

import { DataTable } from "@/components/data-table"
import { columns } from "@/components/columns"
import { STATIC_TOOLS } from "@/lib/load-tools"
import { fetchLiveStats, formatUpdatedLabel, type LiveStats } from "@/lib/github-live"
import type { Tool } from "@/lib/types"

// Set once you've pushed this to your own GitHub repo — see .env.example.
// Left unset, the "contribute" link is just hidden rather than pointing
// somewhere wrong.
const REPO_URL = import.meta.env.VITE_REPO_URL as string | undefined

export default function App() {
  // Keyed by tool key, undefined = still loading, null = fetch failed/no repo.
  const [live, setLive] = useState<Record<string, LiveStats | null>>({})

  useEffect(() => {
    let cancelled = false
    STATIC_TOOLS.forEach((tool) => {
      fetchLiveStats(tool.github).then((stats) => {
        if (!cancelled) setLive((prev) => ({ ...prev, [tool.key]: stats }))
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  const data: Tool[] = useMemo(
    () =>
      STATIC_TOOLS.map((tool) => {
        const stats = live[tool.key]
        const loaded = tool.key in live
        return {
          ...tool,
          pf: tool.platform,
          stars: stats?.stars ?? null,
          c20: stats?.c20 ?? null,
          c100: stats?.c100 ?? null,
          updatedLabel: stats
            ? formatUpdatedLabel(stats.pushedAt)
            : tool.github
              ? loaded
                ? "—" // fetch resolved to null: offline, rate-limited, or no repo
                : "loading…"
              : (tool.updatedLabel ?? "no public repo"),
        }
      }),
    [live],
  )

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold">
          Agentic Dev Environments — feature &amp; activity comparison
        </h1>
        <p className="mt-1 max-w-[75ch] text-sm text-muted-foreground">
          Stars and contributor counts are fetched live from the GitHub API in
          your browser on every page load (contributor count = lifetime
          commits &ge;20, with &ge;100 shown as a secondary tag, bot/automation
          accounts included since they reflect real commit history). Feature
          and platform columns come from each project's own docs/site,
          committed as data in this repo.
          {REPO_URL && (
            <>
              {" "}
              <a
                className="text-blue-600 hover:underline dark:text-blue-400"
                href={`${REPO_URL}/tree/main/content/tools`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contribute or correct an entry →
              </a>
            </>
          )}
        </p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  )
}
