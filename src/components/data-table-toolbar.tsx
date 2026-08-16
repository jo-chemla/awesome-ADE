import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { STATIC_TOOLS } from "@/lib/load-tools"

const CATEGORY_OPTIONS = Array.from(new Set(STATIC_TOOLS.map((t) => t.category))).map(
  (c) => ({ label: c, value: c })
)

const PLATFORM_STATUS_OPTIONS = [
  { label: "Full", value: "full" },
  { label: "Beta", value: "beta" },
]

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const starsColumn = table.getColumn("stars")

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <Input
        placeholder="Filter by name..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="h-8 w-[160px] lg:w-[220px]"
      />
      <Input
        type="number"
        placeholder="Min ★ stars"
        min={0}
        step={1000}
        value={(starsColumn?.getFilterValue() as number) ?? ""}
        onChange={(event) => {
          const v = event.target.value
          starsColumn?.setFilterValue(v === "" ? undefined : Number(v))
        }}
        className="h-8 w-[130px]"
      />
      {table.getColumn("category") && (
        <DataTableFacetedFilter
          column={table.getColumn("category")}
          title="Category"
          options={CATEGORY_OPTIONS}
        />
      )}
      {table.getColumn("windows") && (
        <DataTableFacetedFilter
          column={table.getColumn("windows")}
          title="Windows"
          options={PLATFORM_STATUS_OPTIONS}
        />
      )}
      {table.getColumn("android") && (
        <DataTableFacetedFilter
          column={table.getColumn("android")}
          title="Android"
          options={PLATFORM_STATUS_OPTIONS}
        />
      )}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3"
        >
          Reset
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  )
}
