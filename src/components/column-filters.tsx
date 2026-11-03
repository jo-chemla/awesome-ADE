import type { Table } from "@tanstack/react-table"

import type { ToolTableFeatures } from "@/lib/table-features"
import type { Tool } from "@/lib/types"
import {
  PLATFORMS,
  PUSHED_WINDOWS,
  licenseFamily,
  pushedWithinDays,
  type PlatformId,
} from "@/lib/tool-filters"
import { STATIC_TOOLS } from "@/lib/load-tools"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { DataTableStarsFilter } from "@/components/data-table-stars-filter"
import { HeaderFilterButton } from "@/components/header-filter-button"

// Each filter renders either as a toolbar button or as a funnel in its
// column header. Both read and write the same column filter, so they stay
// in sync.

// The core table type: header contexts hand out this, not the React one.
type ToolTable = Table<ToolTableFeatures, Tool>

interface FilterProps {
  table: ToolTable
  variant?: "toolbar" | "header"
}

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

export function NameFilter({ table, variant = "toolbar" }: FilterProps) {
  const column = table.getColumn("name")
  const value = (column?.getFilterValue() as string) ?? ""
  const input = (
    <Input
      placeholder="Filter by name..."
      value={value}
      onChange={(event) => column?.setFilterValue(event.target.value)}
      className={variant === "header" ? "h-8" : "h-8 w-full sm:w-[160px] lg:w-[220px]"}
    />
  )
  if (variant === "toolbar") return input
  return (
    <Popover>
      <PopoverTrigger asChild>
        <HeaderFilterButton title="name" active={value !== ""} />
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-2" align="start">
        {input}
      </PopoverContent>
    </Popover>
  )
}

export function CategoryFilter({ table, variant }: FilterProps) {
  return (
    <DataTableFacetedFilter
      column={table.getColumn("category")}
      title="Category"
      options={CATEGORY_OPTIONS}
      variant={variant}
    />
  )
}

export function PlatformsFilter({ table, variant }: FilterProps) {
  const column = table.getColumn("platforms")
  // Platforms combine with AND, so an option's count is how many rows would
  // remain if it were added to the current selection. The faceted row model
  // already applies every other column's filter.
  const selected = (column?.getFilterValue() as PlatformId[] | undefined) ?? []
  const rows = column?.getFacetedRowModel().rows ?? []
  const counts = new Map<string, number>()
  for (const { id } of PLATFORMS) {
    const wanted = [...selected, id]
    counts.set(
      id,
      rows.filter((row) => {
        const supported = row.getValue("platforms") as PlatformId[]
        return wanted.every((p) => supported.includes(p))
      }).length,
    )
  }
  return (
    <DataTableFacetedFilter
      column={column}
      title="Runs on"
      options={PLATFORM_OPTIONS}
      counts={counts}
      hint="Shows tools that support every selected platform. Beta counts."
      variant={variant}
    />
  )
}

export function StarsFilter({ table, variant }: FilterProps) {
  return <DataTableStarsFilter column={table.getColumn("stars")} variant={variant} />
}

export function PushedFilter({ table, variant }: FilterProps) {
  const column = table.getColumn("pushed")
  // Each push window counts the rows the other filters leave that were
  // pushed within it.
  const rows = column?.getFacetedRowModel().rows ?? []
  const counts = new Map<string, number>(
    PUSHED_WINDOWS.map(({ value }) => [
      value,
      rows.filter((row) =>
        pushedWithinDays(row.getValue("pushed") as string | null, Number(value)),
      ).length,
    ]),
  )
  return (
    <DataTableFacetedFilter
      column={column}
      title="Last push"
      options={PUSHED_OPTIONS}
      counts={counts}
      single={PUSHED_SINGLE}
      hint="Based on daily GitHub data."
      variant={variant}
    />
  )
}

export function LicenseFilter({ table, variant }: FilterProps) {
  return (
    <DataTableFacetedFilter
      column={table.getColumn("license")}
      title="License"
      options={LICENSE_OPTIONS}
      variant={variant}
    />
  )
}
