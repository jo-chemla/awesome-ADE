import type { ColumnDef } from "@tanstack/react-table"

import type { PlatformStatus, Tool } from "@/lib/types"
import type { ToolTableFeatures } from "@/lib/table-features"
import {
  PLATFORMS,
  licenseFamily,
  pushedWithinDays,
  supportedPlatforms,
  type PlatformId,
} from "@/lib/tool-filters"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table-column-header"

type ToolColumnDef = ColumnDef<ToolTableFeatures, Tool>

// Links inside a row must not also open the detail sheet the row opens.
const stopRowClick = (event: React.MouseEvent) => event.stopPropagation()

export function PlatformBadge({ status }: { status: PlatformStatus }) {
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

// Folded-group stand-in for the 5 individual platform columns — one compact
// dot per OS instead of 5 full badge columns, so "Platform Support" can
// collapse to roughly the width of a single column.
function PlatformSummaryCell({ pf }: { pf: Tool["pf"] }) {
  return (
    <div className="flex items-center gap-1.5">
      {PLATFORMS.map(({ id, letter, label }) => (
        <span
          key={id}
          title={`${label}: ${pf[id]}`}
          className="flex items-center gap-0.5 text-[10px] text-muted-foreground"
        >
          <span className={cn("h-2 w-2 rounded-full", PLATFORM_STATUS_DOT[pf[id]])} />
          {letter}
        </span>
      ))}
    </div>
  )
}

function platformColumn(id: PlatformId, title: string): ToolColumnDef {
  return {
    id,
    accessorFn: (row) => row.pf[id],
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={title} />
    ),
    cell: ({ getValue }) => <PlatformBadge status={getValue() as PlatformStatus} />,
    enableSorting: false,
  }
}

function featureColumn(id: keyof Tool, title: string): ToolColumnDef {
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

// Columns that exist only to carry a toolbar filter (and its facet counts).
// They are never shown; DataTable pins their visibility to false.
export const FILTER_ONLY_COLUMNS = ["platforms", "license", "pushed"]

// Which leaf columns to hide/show when a group header's fold toggle is
// clicked — read by DataTable, which owns the columnVisibility state.
export const FOLD_CONFIG: Record<string, { expandedOnly: string[]; collapsedOnly: string[] }> = {
  activity: { expandedOnly: ["contributors", "updated"], collapsedOnly: [] },
  platform: {
    expandedOnly: ["windows", "linux", "macos", "android", "ios"],
    collapsedOnly: ["platformSummary"],
  },
}

export const columns: ToolColumnDef[] = [
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
            <span className="font-semibold">{row.original.name}</span>
            <div className="flex gap-3 text-xs">
              <a
                className="text-blue-600 hover:underline dark:text-blue-400"
                href={row.original.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopRowClick}
              >
                Website
              </a>
              {row.original.github ? (
                <a
                  className="text-blue-600 hover:underline dark:text-blue-400"
                  href={row.original.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={stopRowClick}
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
        // [min, max]; a row whose stars haven't loaded can't be placed in a
        // range, so it drops out while the filter is active.
        filterFn: (row, columnId, [min, max]: [number, number]) => {
          const stars = row.getValue(columnId) as number | null
          return stars != null && stars >= min && stars <= max
        },
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
  {
    id: "platforms",
    accessorFn: (row) => supportedPlatforms(row.pf),
    // Every selected platform must be supported: "runs on Windows and iOS".
    filterFn: (row, columnId, selected: PlatformId[]) => {
      const supported = row.getValue(columnId) as PlatformId[]
      return selected.every((id) => supported.includes(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "license",
    accessorFn: (row) => licenseFamily(row.license),
    filterFn: (row, columnId, selected: string[]) =>
      selected.includes(row.getValue(columnId) as string),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "pushed",
    accessorFn: (row) => row.pushedAt,
    // Filter value is a day count; tools without live push data drop out.
    filterFn: (row, columnId, days: number) =>
      pushedWithinDays(row.getValue(columnId) as string | null, days),
    enableSorting: false,
    enableHiding: false,
  },
]
