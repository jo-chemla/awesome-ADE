import { useState } from "react"
import type { Column } from "@tanstack/react-table"
import { PlusCircle } from "lucide-react"

import type { ToolTableFeatures } from "@/lib/table-features"
import type { Tool } from "@/lib/types"
import {
  STARS_LOG_MAX,
  STARS_LOG_MIN,
  formatStars,
  starsFromLog,
} from "@/lib/tool-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { HeaderFilterButton } from "@/components/header-filter-button"

const STEP = 0.05
const MIN_STARS = starsFromLog(STARS_LOG_MIN)
const MAX_STARS = starsFromLog(STARS_LOG_MAX)

const FULL_RANGE = [STARS_LOG_MIN, STARS_LOG_MAX]

interface DataTableStarsFilterProps {
  column?: Column<ToolTableFeatures, Tool>
  variant?: "toolbar" | "header"
}

// Two-thumb range over GitHub stars. The filter value is [min, max] in
// stars; dragging both thumbs back to the ends clears it.
export function DataTableStarsFilter({ column, variant = "toolbar" }: DataTableStarsFilterProps) {
  const range = column?.getFilterValue() as [number, number] | undefined

  // The thumbs keep their exact log position locally. Deriving it back from
  // the rounded star counts would pull a thumb behind its last keyboard
  // step, so arrow keys could never move past the first step.
  const [logValue, setLogValue] = useState(FULL_RANGE)
  // Follow changes made elsewhere: Reset, or the same filter opened from the
  // toolbar or the column header. Skip our own updates, which already match.
  const [lastRange, setLastRange] = useState(range)
  if (range !== lastRange) {
    setLastRange(range)
    if (!range) setLogValue(FULL_RANGE)
    else if (range[0] !== starsFromLog(logValue[0]) || range[1] !== starsFromLog(logValue[1]))
      setLogValue([Math.log10(range[0]), Math.log10(range[1])])
  }

  function onValueChange(next: number[]) {
    const [lo, hi] = next
    setLogValue(next)
    const atEnds = lo <= STARS_LOG_MIN && hi >= STARS_LOG_MAX
    column?.setFilterValue(atEnds ? undefined : [starsFromLog(lo), starsFromLog(hi)])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {variant === "header" ? (
          <HeaderFilterButton title="stars" active={!!range} />
        ) : (
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="size-3.5" />
          ★ Stars
          {range && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {formatStars(range[0])} – {formatStars(range[1])}
              </Badge>
            </>
          )}
        </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[260px] space-y-3" align="start">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">GitHub stars</span>
          <span className="font-mono text-muted-foreground tabular-nums">
            {formatStars(range?.[0] ?? MIN_STARS)} – {formatStars(range?.[1] ?? MAX_STARS)}
          </span>
        </div>
        <Slider
          min={STARS_LOG_MIN}
          max={STARS_LOG_MAX}
          step={STEP}
          value={logValue}
          onValueChange={onValueChange}
          aria-label="GitHub stars range"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {[2, 3, 4, 5, 6].map((log) => (
            <span key={log}>{formatStars(10 ** log)}</span>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Log scale. Tools whose stars haven't loaded are hidden while this is set.
        </p>
        {range && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-full"
            onClick={() => column?.setFilterValue(undefined)}
          >
            Clear filter
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
