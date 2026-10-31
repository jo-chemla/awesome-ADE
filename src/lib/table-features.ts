import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table"

// TanStack Table v9 bundles nothing implicitly: every feature, row model and
// named filter/sort function the table uses is registered here once. Custom
// filters live inline on their columns, so only the names a column refers
// to by string need an entry below.
export const toolTableFeatures = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),

  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),

  columnFacetingFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),

  columnVisibilityFeature,

  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),

  filterFns: {
    includesString: filterFn_includesString,
  },
  // 'auto' sorting resolves to one of these for string columns; numbers
  // fall back to the basic comparator, which is what the stars column wants.
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
})

export type ToolTableFeatures = typeof toolTableFeatures
