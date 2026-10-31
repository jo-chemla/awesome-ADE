import { useEffect } from "react"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"

import type { Tool } from "@/lib/types"
import { PLATFORMS, licenseFamily } from "@/lib/tool-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { PlatformBadge } from "@/components/columns"

const FEATURES: { key: keyof Tool; label: string }[] = [
  { key: "parallel", label: "Parallel agents" },
  { key: "isolation", label: "Worktree / isolation" },
  { key: "locality", label: "Local vs cloud" },
  { key: "remote", label: "Remote access" },
  { key: "mobileCtl", label: "Mobile control" },
]

interface ToolSheetProps {
  // Rows in the table's current filter and sort order, so prev/next follow
  // what the reader sees rather than the alphabetical source order.
  tools: Tool[]
  selectedKey: string | null
  onSelect: (key: string | null) => void
}

export function ToolSheet({ tools, selectedKey, onSelect }: ToolSheetProps) {
  const index = tools.findIndex((t) => t.key === selectedKey)
  const tool = index >= 0 ? tools[index] : undefined
  const prev = index > 0 ? tools[index - 1] : undefined
  const next = index >= 0 && index < tools.length - 1 ? tools[index + 1] : undefined

  // A filter change can drop the open tool from the list; close rather than
  // show a row the table no longer contains.
  useEffect(() => {
    if (selectedKey && index < 0) onSelect(null)
  }, [selectedKey, index, onSelect])

  useEffect(() => {
    if (!tool) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if ((event.key === "ArrowDown" || event.key === "j") && next) {
        event.preventDefault()
        onSelect(next.key)
      } else if ((event.key === "ArrowUp" || event.key === "k") && prev) {
        event.preventDefault()
        onSelect(prev.key)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [tool, prev, next, onSelect])

  return (
    <Sheet open={!!tool} onOpenChange={(open) => !open && onSelect(null)}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        {tool && (
          <>
            <SheetHeader className="gap-2 border-b pr-12">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">{tool.name}</SheetTitle>
                <div className="ml-auto flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    disabled={!prev}
                    onClick={() => prev && onSelect(prev.key)}
                    aria-label="Previous tool"
                    title="Previous tool (↑ or k)"
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    disabled={!next}
                    onClick={() => next && onSelect(next.key)}
                    aria-label="Next tool"
                    title="Next tool (↓ or j)"
                  >
                    <ChevronDown />
                  </Button>
                </div>
              </div>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-normal">{tool.category}</Badge>
                  <Badge variant="outline" className="font-normal" title={tool.license}>
                    {licenseFamily(tool.license)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {index + 1} of {tools.length}
                  </span>
                </div>
              </SheetDescription>
              <div className="flex gap-4 text-sm">
                <a
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website <ExternalLink className="size-3" />
                </a>
                {tool.github ? (
                  <a
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                    href={tool.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">No public repo</span>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-5 p-4 text-sm">
              <section className="grid grid-cols-3 gap-3">
                <Stat label="★ Stars" value={tool.stars?.toLocaleString() ?? "—"} />
                <Stat
                  label="Contributors ≥20"
                  value={tool.c20 != null ? `${tool.c20} (${tool.c100} ≥100)` : "—"}
                />
                <Stat label="Last push" value={tool.updatedLabel} />
              </section>

              <section className="space-y-2">
                <SectionTitle>Platforms</SectionTitle>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map(({ id, label }) => (
                    <div key={id} className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <PlatformBadge status={tool.pf[id]} />
                    </div>
                  ))}
                </div>
                {tool.pfNote && (
                  <p className="text-xs text-muted-foreground">{tool.pfNote}</p>
                )}
              </section>

              <Separator />

              <section className="space-y-3">
                {FEATURES.map(({ key, label }) => (
                  <div key={key} className="space-y-0.5">
                    <SectionTitle>{label}</SectionTitle>
                    <p className="leading-relaxed">{String(tool[key] ?? "—")}</p>
                  </div>
                ))}
              </section>

              <Separator />

              <section className="space-y-2">
                <SectionTitle>Notes</SectionTitle>
                <div className="leading-relaxed text-muted-foreground [&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-xs [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2 [&_ul]:mb-2">
                  <tool.Notes />
                </div>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-sm tabular-nums">{value}</div>
    </div>
  )
}
