import type { ReactTable } from "@tanstack/react-table"
import type { ToolTableFeatures } from "@/lib/table-features"
import type { Tool } from "@/lib/types"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps {
  table: ReactTable<ToolTableFeatures, Tool>
}

export function DataTablePagination({ table }: DataTablePaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2 px-2 py-3">
      <div className="text-muted-foreground w-full text-sm sm:w-auto sm:flex-1">
        {table.getFilteredRowModel().rows.length} of{" "}
        {table.getCoreRowModel().rows.length} tool(s) shown.
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:w-auto sm:justify-start sm:gap-x-6 lg:gap-x-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            Rows<span className="hidden sm:inline"> per page</span>
          </p>
          <Select
            value={`${table.state.pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.state.pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap sm:w-[100px]">
          Page {table.state.pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
