import { useCallback, useMemo, useState } from "react"
import { ChevronsLeftRight, ChevronsRightLeft } from "lucide-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
  type Updater,
  flexRender,
  useTable,
} from "@tanstack/react-table"
import { useQueryStates } from "nuqs"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table-pagination"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { StarHistoryChart } from "@/components/star-history-chart"
import { ToolSheet } from "@/components/tool-sheet"
import { FILTER_ONLY_COLUMNS, FOLD_CONFIG } from "@/components/columns"
import { toolTableFeatures, type ToolTableFeatures } from "@/lib/table-features"
import { filtersFromUrl, tableUrlParsers, urlFromFilters } from "@/lib/table-url-state"
import type { Tool } from "@/lib/types"
import { cn } from "@/lib/utils"

// Groups start coalesced to their single most-telling column (★ Stars for
// Activity, a compact per-OS dot row for Platform Support) — click a group
// header's toggle to see every underlying column, or link to it with ?expand=.
function foldedFromExpanded(expanded: string[] | null): Record<string, boolean> {
  return Object.fromEntries(
    Object.keys(FOLD_CONFIG).map((id) => [id, !expanded?.includes(id)]),
  )
}

const HIDDEN_FILTER_COLUMNS: ColumnVisibilityState = Object.fromEntries(
  FILTER_ONLY_COLUMNS.map((id) => [id, false]),
)

function visibilityFromFold(folded: Record<string, boolean>): ColumnVisibilityState {
  const visibility: ColumnVisibilityState = { ...HIDDEN_FILTER_COLUMNS }
  for (const [groupId, config] of Object.entries(FOLD_CONFIG)) {
    const isFolded = folded[groupId]
    for (const id of config.expandedOnly) visibility[id] = !isFolded
    for (const id of config.collapsedOnly) visibility[id] = isFolded
  }
  return visibility
}

interface DataTableProps {
  columns: ColumnDef<ToolTableFeatures, Tool>[]
  data: Tool[]
}

export function DataTable({ columns, data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "stars", desc: true },
  ])
  // Filters and fold state live in the URL, so any view can be shared as a link.
  const [urlState, setUrlState] = useQueryStates(tableUrlParsers)
  const columnFilters = useMemo(() => filtersFromUrl(urlState), [urlState])
  const foldedGroups = useMemo(() => foldedFromExpanded(urlState.expand), [urlState.expand])
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(() =>
    visibilityFromFold(foldedFromExpanded(urlState.expand)),
  )
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  function toggleFold(groupId: string) {
    const next = { ...foldedGroups, [groupId]: !foldedGroups[groupId] }
    const expanded = Object.keys(FOLD_CONFIG).filter((id) => !next[id])
    setUrlState({ expand: expanded.length ? expanded : null })
    setColumnVisibility((prev) => ({ ...prev, ...visibilityFromFold(next) }))
  }

  const table = useTable({
    features: toolTableFeatures,
    data,
    columns,
    getRowId: (row) => row.key,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) =>
      setUrlState(urlFromFilters(typeof updater === "function" ? updater(columnFilters) : updater)),
    onColumnVisibilityChange: (updater) =>
      // Filter-only columns stay hidden whatever a header menu asks for.
      setColumnVisibility((prev) => ({
        ...(typeof updater === "function" ? updater(prev) : updater),
        ...HIDDEN_FILTER_COLUMNS,
      })),
    initialState: { pagination: { pageIndex: 0, pageSize: 50 } },
  })

  // Every row that survives the filters, in sort order and across all pages,
  // so the sheet can step past the edge of the current page.
  const sortedRows = table.getSortedRowModel().rows
  const visibleTools = useMemo(() => sortedRows.map((row) => row.original), [sortedRows])
  const onSelect = useCallback((key: string | null) => setSelectedKey(key), [])
  const filteredRows = table.getFilteredRowModel().rows
  const filteredTools = useMemo(() => filteredRows.map((row) => row.original), [filteredRows])

  return (
    <div className="space-y-2">
      <DataTableToolbar table={table} />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup, groupIndex) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isGroupRow = groupIndex === 0
                  const foldable = isGroupRow ? FOLD_CONFIG[header.column.id] : undefined
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={foldable ? () => toggleFold(header.column.id) : undefined}
                      title={
                        foldable
                          ? (foldedGroups[header.column.id] ? "Show all columns" : "Collapse columns")
                          : undefined
                      }
                      className={
                        isGroupRow
                          ? cn(
                              "bg-muted/50 text-center text-[10px] font-semibold tracking-wide text-muted-foreground uppercase",
                              foldable && "cursor-pointer select-none hover:bg-muted",
                            )
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {foldable && (
                            foldedGroups[header.column.id] ? (
                              <ChevronsLeftRight className="h-3 w-3" />
                            ) : (
                              <ChevronsRightLeft className="h-3 w-3" />
                            )
                          )}
                        </span>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.id === selectedKey ? "selected" : undefined}
                  className="cursor-pointer"
                  tabIndex={0}
                  title="Show details"
                  onClick={() => setSelectedKey(row.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setSelectedKey(row.id)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No tools match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <StarHistoryChart tools={filteredTools} />
      <ToolSheet tools={visibleTools} selectedKey={selectedKey} onSelect={onSelect} />
    </div>
  )
}
