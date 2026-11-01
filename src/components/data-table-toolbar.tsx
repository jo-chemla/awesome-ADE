import type { ReactTable } from "@tanstack/react-table"
import { X } from "lucide-react"

import type { ToolTableFeatures } from "@/lib/table-features"
import type { Tool } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  CategoryFilter,
  LicenseFilter,
  NameFilter,
  PlatformsFilter,
  PushedFilter,
  StarsFilter,
} from "@/components/column-filters"

interface DataTableToolbarProps {
  table: ReactTable<ToolTableFeatures, Tool>
}

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  const isFiltered = table.state.columnFilters.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <NameFilter table={table} />
      <CategoryFilter table={table} />
      <PlatformsFilter table={table} />
      <StarsFilter table={table} />
      <PushedFilter table={table} />
      <LicenseFilter table={table} />
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
