import { useState } from "react"
import { ChevronsLeftRight, ChevronsRightLeft } from "lucide-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DataTablePagination } from "@/components/data-table-pagination"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { FOLD_CONFIG } from "@/components/columns"

// Groups start coalesced to their single most-telling column (★ Stars for
// Activity, a compact per-OS dot row for Platform Support) — click a group
// header's toggle to see every underlying column.
const INITIAL_FOLDED: Record<string, boolean> = Object.fromEntries(
  Object.keys(FOLD_CONFIG).map((id) => [id, true]),
)

function initialVisibilityFromFold(folded: Record<string, boolean>): VisibilityState {
  const visibility: VisibilityState = {}
  for (const [groupId, config] of Object.entries(FOLD_CONFIG)) {
    const isFolded = folded[groupId]
    for (const id of config.expandedOnly) visibility[id] = !isFolded
    for (const id of config.collapsedOnly) visibility[id] = isFolded
  }
  return visibility
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "stars", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [foldedGroups, setFoldedGroups] = useState(INITIAL_FOLDED)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    initialVisibilityFromFold(INITIAL_FOLDED),
  )

  function toggleFold(groupId: string) {
    const next = { ...foldedGroups, [groupId]: !foldedGroups[groupId] }
    setFoldedGroups(next)
    setColumnVisibility((prev) => ({ ...prev, ...initialVisibilityFromFold(next) }))
  }

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize: 20 } },
  })

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
                      className={
                        isGroupRow
                          ? "bg-muted/50 text-center text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {foldable && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 cursor-pointer normal-case"
                              title={foldedGroups[header.column.id] ? "Show all columns" : "Collapse columns"}
                              onClick={() => toggleFold(header.column.id)}
                            >
                              {foldedGroups[header.column.id] ? (
                                <ChevronsLeftRight className="h-3 w-3" />
                              ) : (
                                <ChevronsRightLeft className="h-3 w-3" />
                              )}
                            </Button>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
                  colSpan={columns.length}
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
    </div>
  )
}
