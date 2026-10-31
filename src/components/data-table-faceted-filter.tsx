import type { Column } from "@tanstack/react-table"
import type { ToolTableFeatures } from "@/lib/table-features"
import type { Tool } from "@/lib/types"
import { CheckIcon, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface DataTableFacetedFilterProps {
  // Pinned to the tool table's feature set: TanStack v9 types are invariant
  // in TFeatures, so a component generic over it could call no feature API.
  column?: Column<ToolTableFeatures, Tool>
  title?: string
  options: { label: string; value: string; icon?: React.ReactNode }[]
  // Counts per option. Defaults to the column's faceted unique values, which
  // only works when each row holds a single value.
  counts?: Map<string, number>
  // One value at a time, stored as `toFilterValue(value)` instead of an array.
  single?: { toFilterValue: (value: string) => unknown; fromFilterValue: (filter: unknown) => string }
  // Short line under the options, e.g. how several selections combine.
  hint?: string
}

export function DataTableFacetedFilter({
  column,
  title,
  options,
  counts,
  single,
  hint,
}: DataTableFacetedFilterProps) {
  const facets = counts ?? column?.getFacetedUniqueValues()
  const filterValue = column?.getFilterValue()
  const selectedValues = new Set<string>(
    filterValue == null
      ? []
      : single
        ? [single.fromFilterValue(filterValue)]
        : (filterValue as string[]),
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="size-3.5" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (single) {
                        column?.setFilterValue(
                          isSelected ? undefined : single.toFilterValue(option.value),
                        )
                        return
                      }
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      )
                    }}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center border border-primary",
                        single ? "rounded-full" : "rounded-sm",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="size-3.5" />
                    </div>
                    {option.icon}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {hint && (
              <p className="px-2 pb-2 text-[11px] text-muted-foreground">{hint}</p>
            )}
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
