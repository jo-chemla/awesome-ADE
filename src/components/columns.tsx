import type { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"

import type { PlatformStatus, Tool } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DataTableColumnHeader } from "@/components/data-table-column-header"

function PlatformBadge({ status }: { status: PlatformStatus }) {
  const map: Record<PlatformStatus, { label: string; className: string }> = {
    full: { label: "Full", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
    beta: { label: "Beta", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
    none: { label: "—", className: "bg-transparent text-muted-foreground font-normal" },
    unknown: { label: "?", className: "bg-transparent text-muted-foreground italic font-normal" },
  }
  const { label, className } = map[status]
  return <Badge className={cn("rounded-full", className)}>{label}</Badge>
}

const PLATFORM_STATUS_DOT: Record<PlatformStatus, string> = {
  full: "bg-green-500",
  beta: "bg-amber-500",
  none: "bg-transparent ring-1 ring-inset ring-muted-foreground/30",
  unknown: "bg-transparent ring-1 ring-inset ring-muted-foreground/30",
}

const PLATFORM_LABELS: { id: keyof Tool["pf"]; letter: string; title: string }[] = [
  { id: "windows", letter: "W", title: "Windows" },
  { id: "linux", letter: "L", title: "Linux" },
  { id: "macos", letter: "M", title: "macOS" },
  { id: "android", letter: "A", title: "Android" },
  { id: "ios", letter: "I", title: "iOS" },
]

// Folded-group stand-in for the 5 individual platform columns — one compact
// dot per OS instead of 5 full badge columns, so "Platform Support" can
// collapse to roughly the width of a single column.
function PlatformSummaryCell({ pf }: { pf: Tool["pf"] }) {
  return (
    <div className="flex items-center gap-1.5">
      {PLATFORM_LABELS.map(({ id, letter, title }) => (
        <span
          key={id}
          title={`${title}: ${pf[id]}`}
          className="flex items-center gap-0.5 text-[10px] text-muted-foreground"
        >
          <span className={cn("h-2 w-2 rounded-full", PLATFORM_STATUS_DOT[pf[id]])} />
          {letter}
        </span>
      ))}
    </div>
  )
}

function platformColumn(
  id: keyof Tool["pf"],
  title: string
): ColumnDef<Tool> {
  return {
    id,
    accessorFn: (row) => row.pf[id],
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={title} />
    ),
    cell: ({ getValue }) => <PlatformBadge status={getValue() as PlatformStatus} />,
    filterFn: (row, columnId, filterValue: string[]) =>
      filterValue.includes(row.getValue(columnId) as string),
    enableSorting: false,
  }
}

function featureColumn(id: keyof Tool, title: string): ColumnDef<Tool> {
  return {
    id,
    accessorFn: (row) => row[id],
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={title} />
    ),
    cell: ({ getValue }) => (
      <div className="max-w-[220px] min-w-[180px] text-xs whitespace-normal text-muted-foreground">
        {getValue() as string}
      </div>
    ),
    enableSorting: false,
  }
}

// Which leaf columns to hide/show when a group header's fold toggle is
// clicked — read by DataTable, which owns the columnVisibility state.
export const FOLD_CONFIG: Record<string, { expandedOnly: string[]; collapsedOnly: string[] }> = {
  activity: { expandedOnly: ["contributors", "updated"], collapsedOnly: [] },
  platform: {
    expandedOnly: ["windows", "linux", "macos", "android", "ios"],
    collapsedOnly: ["platformSummary"],
  },
}

export const columns: ColumnDef<Tool>[] = [
  {
    id: "identity",
    header: "Identity",
    columns: [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tool" />
        ),
        filterFn: "includesString",
        cell: ({ row }) => (
          <div className="flex min-w-[160px] flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold">{row.original.name}</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 cursor-pointer">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="text-xs leading-relaxed">
                  <row.original.Notes />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-3 text-xs">
              <a
                className="text-blue-600 hover:underline dark:text-blue-400"
                href={row.original.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Website
              </a>
              {row.original.github ? (
                <a
                  className="text-blue-600 hover:underline dark:text-blue-400"
                  href={row.original.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              ) : (
                <span className="text-muted-foreground">no repo</span>
              )}
            </div>
            <Badge variant="outline" className="w-fit font-normal">
              {row.original.license}
            </Badge>
          </div>
        ),
      },
      {
        id: "category",
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ getValue }) => (
          <Badge variant="secondary" className="font-normal">
            {getValue() as string}
          </Badge>
        ),
        filterFn: (row, columnId, filterValue: string[]) =>
          filterValue.includes(row.getValue(columnId) as string),
        enableSorting: false,
      },
    ],
  },
  {
    id: "activity",
    header: "Activity",
    columns: [
      {
        id: "stars",
        accessorKey: "stars",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="★ Stars" />
        ),
        cell: ({ getValue }) => {
          const v = getValue() as number | null
          return (
            <span className="font-mono text-sm tabular-nums">
              {v != null ? v.toLocaleString() : "—"}
            </span>
          )
        },
        filterFn: (row, columnId, filterValue: number) =>
          (row.getValue(columnId) as number | null ?? -1) >= filterValue,
        sortUndefined: "last",
      },
      {
        id: "contributors",
        accessorFn: (row) => row.c20,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Contrib ≥20" />
        ),
        cell: ({ row }) => {
          const { c20, c100 } = row.original
          if (c20 == null) return <span className="text-muted-foreground">—</span>
          return (
            <span className="font-mono text-sm tabular-nums">
              {c20}{" "}
              <span
                className="rounded bg-muted px-1 text-xs text-muted-foreground"
                title="contributors with >=100 lifetime commits"
              >
                {c100} @ ≥100
              </span>
            </span>
          )
        },
        sortUndefined: "last",
      },
      {
        id: "updated",
        accessorKey: "updatedLabel",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Last updated" />
        ),
        cell: ({ getValue }) => (
          <span className="text-sm">{getValue() as string}</span>
        ),
      },
    ],
  },
  {
    id: "platform",
    header: "Platform Support",
    columns: [
      {
        id: "platformSummary",
        header: "Platforms",
        cell: ({ row }) => <PlatformSummaryCell pf={row.original.pf} />,
        enableSorting: false,
      },
      platformColumn("windows", "Win"),
      platformColumn("linux", "Linux"),
      platformColumn("macos", "macOS"),
      platformColumn("android", "Android"),
      platformColumn("ios", "iOS"),
    ],
  },
  {
    id: "features",
    header: "Feature Matrix",
    columns: [
      featureColumn("parallel", "Parallel agents"),
      featureColumn("isolation", "Worktree / isolation"),
      featureColumn("locality", "Local vs cloud"),
      featureColumn("mobileCtl", "Mobile control"),
    ],
  },
]
