import type { ReactTable } from "@tanstack/react-table"
import { X } from "lucide-react"

import type { ToolTableFeatures } from "@/lib/table-features"
import type { Tool } from "@/lib/types"
import {
  PLATFORMS,
  PUSHED_WINDOWS,
  licenseFamily,
  pushedWithinDays,
  type PlatformId,
} from "@/lib/tool-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { DataTableStarsFilter } from "@/components/data-table-stars-filter"
import { STATIC_TOOLS } from "@/lib/load-tools"

const toOptions = (values: string[]) =>
  Array.from(new Set(values))
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }))

const CATEGORY_OPTIONS = toOptions(STATIC_TOOLS.map((t) => t.category))
const LICENSE_OPTIONS = toOptions(STATIC_TOOLS.map((t) => licenseFamily(t.license)))
const PLATFORM_OPTIONS = PLATFORMS.map(({ id, label }) => ({ label, value: id }))
const PUSHED_OPTIONS = PUSHED_WINDOWS.map(({ value, label }) => ({ value, label }))

const PUSHED_SINGLE = {
  toFilterValue: (value: string) => Number(value),
  fromFilterValue: (filter: unknown) => String(filter),
}

interface DataTableToolbarProps {
  table: ReactTable<ToolTableFeatures, Tool>
}

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  const isFiltered = table.state.columnFilters.length > 0
  const platformsColumn = table.getColumn("platforms")

  // Platforms combine with AND, so an option's count is how many rows would
  // remain if it were added to the current selection. The faceted row model
  // already applies every other column's filter.
  const selectedPlatforms = (platformsColumn?.getFilterValue() as PlatformId[] | undefined) ?? []
  const platformCounts = new Map<string, number>()
  for (const { id } of PLATFORMS) {
    const wanted = [...selectedPlatforms, id]
    const count = (platformsColumn?.getFacetedRowModel().rows ?? []).filter((row) => {
      const supported = row.getValue("platforms") as PlatformId[]
      return wanted.every((p) => supported.includes(p))
    }).length
    platformCounts.set(id, count)
  }

  // Each push window counts the rows the other filters leave that were
  // pushed within it.
  const pushedColumn = table.getColumn("pushed")
  const pushedRows = pushedColumn?.getFacetedRowModel().rows ?? []
  const pushedCounts = new Map<string, number>(
    PUSHED_WINDOWS.map(({ value }) => [
      value,
      pushedRows.filter((row) =>
        pushedWithinDays(row.getValue("pushed") as string | null, Number(value)),
      ).length,
    ]),
  )

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
      <DataTableFacetedFilter
        column={table.getColumn("category")}
        title="Category"
        options={CATEGORY_OPTIONS}
      />
      <DataTableFacetedFilter
        column={platformsColumn}
        title="Runs on"
        options={PLATFORM_OPTIONS}
        counts={platformCounts}
        hint="Shows tools that support every selected platform. Beta counts."
      />
      <DataTableStarsFilter column={table.getColumn("stars")} />
      <DataTableFacetedFilter
        column={pushedColumn}
        title="Last push"
        options={PUSHED_OPTIONS}
        counts={pushedCounts}
        single={PUSHED_SINGLE}
        hint="Based on live GitHub data."
      />
      <DataTableFacetedFilter
        column={table.getColumn("license")}
        title="License"
        options={LICENSE_OPTIONS}
      />
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
