import { useEffect, useMemo, useRef, useState } from "react"
import { parseAsStringLiteral, useQueryState } from "nuqs"

import starHistory from "../../stats/star-history.json"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Tool } from "@/lib/types"

const { weeks, tools: seriesByKey } = starHistory as {
  weeks: string[]
  tools: Record<string, number[]>
}

const HEIGHT = 440
const MARGIN = { top: 12, bottom: 24, left: 40 }
const LABELS_WIDTH = 146
const LABEL_LEADER = 10
const LABELS_MIN_WIDTH = 520
const LABEL_GAP = 14
const SERIES_COUNT = 5
const GRID_STARS = [1_000, 10_000, 100_000]
const MIN_STARS = 100
const TOOLTIP_ROWS = 6
const SCALES = ["log", "linear"] as const
const PILL_GAP = 17

const times = weeks.map((week) => Date.parse(week))
const lastValue = (key: string) => seriesByKey[key]?.at(-1) ?? 0
const maxStars = Math.max(300_000, ...Object.keys(seriesByKey).map((key) => lastValue(key) * 1.2))

// The overall top 5 own their color for good, so a filter never repaints a
// tool that stays visible. Slots they leave free go to the next visible tools.
const OVERALL_TOP = Object.keys(seriesByKey)
  .sort((a, b) => lastValue(b) - lastValue(a))
  .slice(0, SERIES_COUNT)

function assignColors(visibleKeys: string[]) {
  const colors = new Map<string, string>()
  OVERALL_TOP.forEach((key, slot) => {
    if (visibleKeys.includes(key)) colors.set(key, `var(--series-${slot + 1})`)
  })
  const free = OVERALL_TOP.flatMap((key, slot) =>
    visibleKeys.includes(key) ? [] : [`var(--series-${slot + 1})`],
  )
  const others = visibleKeys
    .filter((key) => !colors.has(key))
    .sort((a, b) => lastValue(b) - lastValue(a))
  others.slice(0, free.length).forEach((key, i) => colors.set(key, free[i]))
  return colors
}

// Round gridlines from 0 up past `max`, about four of them.
function linearTicks(max: number) {
  const rough = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 5, 10].find((m) => m * magnitude >= rough)! * magnitude
  const count = Math.ceil(max / step)
  return Array.from({ length: count + 1 }, (_, i) => i * step)
}

function shortName(name: string) {
  return name.replace(/ \(.*\)$/, "")
}

function formatStars(stars: number) {
  if (stars >= 100_000) return `${Math.round(stars / 1000)}k`
  if (stars >= 1000) return `${(stars / 1000).toFixed(1)}k`
  return String(stars)
}

function formatDate(time: number) {
  return new Date(time).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

function quarterTicks(everyMonths: number) {
  const ticks: number[] = []
  const first = new Date(times[0])
  let year = first.getUTCFullYear()
  let month = Math.ceil((first.getUTCMonth() + 1) / everyMonths) * everyMonths
  for (;;) {
    const tick = Date.UTC(year, month, 1)
    if (tick > times[times.length - 1]) return ticks
    if (tick >= times[0]) ticks.push(tick)
    month += everyMonths
    if (month >= 12) {
      month -= 12
      year += 1
    }
  }
}

// Pushes end-of-line labels apart so close series stay readable, keeping them
// inside the plot's height.
function spreadLabels<T extends { y: number }>(labels: T[], maxY: number, gap = LABEL_GAP) {
  const sorted = [...labels].sort((a, b) => a.y - b.y)
  for (let i = 1; i < sorted.length; i++) {
    sorted[i].y = Math.max(sorted[i].y, sorted[i - 1].y + gap)
  }
  const overflow = (sorted.at(-1)?.y ?? 0) - maxY
  if (overflow > 0) {
    sorted[sorted.length - 1].y = maxY
    for (let i = sorted.length - 2; i >= 0; i--) {
      sorted[i].y = Math.min(sorted[i].y, sorted[i + 1].y - gap)
    }
  }
  return sorted
}

// An estimate, enough to keep pills inside the chart and clear of the tooltip.
function pillWidth(name: string) {
  return name.length * 6 + 26
}

interface StarHistoryChartProps {
  // The rows the table's filters leave, across all pages.
  tools: Tool[]
}

export function StarHistoryChart({ tools }: StarHistoryChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const [scale, setScale] = useQueryState(
    "scale",
    parseAsStringLiteral(SCALES).withDefault("log"),
  )

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // A finger lifting leaves the chart without any pointer moving away, so on
  // touch the crosshair stays until a tap lands elsewhere.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setHoverIndex(null)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  const visible = useMemo(
    () =>
      tools
        .filter((tool) => seriesByKey[tool.key])
        .map((tool) => ({ key: tool.key, name: shortName(tool.name) })),
    [tools],
  )
  const colors = useMemo(() => assignColors(visible.map((tool) => tool.key)), [visible])

  const showLabels = width >= LABELS_MIN_WIDTH
  const right = showLabels ? LABELS_WIDTH : 12
  const plotRight = Math.max(MARGIN.left + 1, width - right)
  const plotBottom = HEIGHT - MARGIN.bottom

  const x = (time: number) =>
    MARGIN.left + ((time - times[0]) / (times[times.length - 1] - times[0])) * (plotRight - MARGIN.left)
  // The log scale stays fixed so filtering doesn't move the lines. A linear one
  // fits the visible tools, or the small ones would flatten against the axis.
  const gridStars =
    scale === "linear"
      ? linearTicks(Math.max(1, ...visible.flatMap((tool) => seriesByKey[tool.key])))
      : GRID_STARS
  const linearMax = gridStars[gridStars.length - 1]
  const y = (stars: number) => {
    const share =
      scale === "linear"
        ? stars / linearMax
        : (Math.log10(stars) - Math.log10(MIN_STARS)) / (Math.log10(maxStars) - Math.log10(MIN_STARS))
    return MARGIN.top + (1 - share) * (plotBottom - MARGIN.top)
  }

  const lines = visible
    .flatMap((tool) => {
      const points = seriesByKey[tool.key].flatMap((stars, i) =>
        stars >= MIN_STARS ? [`${x(times[i]).toFixed(1)} ${y(stars).toFixed(1)}`] : [],
      )
      return points.length > 0 ? [{ ...tool, d: `M${points.join("L")}`, color: colors.get(tool.key) }] : []
    })
    // Colored lines draw last, over the grey ones.
    .sort((a, b) => Number(!!a.color) - Number(!!b.color))

  const colored = visible
    .filter((tool) => colors.has(tool.key))
    .sort((a, b) => lastValue(b.key) - lastValue(a.key))
  const greyCount = visible.length - colored.length

  const labels = showLabels
    ? spreadLabels(
        visible
          .filter((tool) => lastValue(tool.key) >= MIN_STARS)
          .map((tool) => ({ ...tool, lineY: y(lastValue(tool.key)), y: y(lastValue(tool.key)) + 4 })),
        plotBottom,
        Math.min(LABEL_GAP, (plotBottom - MARGIN.top) / Math.max(1, visible.length)),
      )
    : []

  const ticks = quarterTicks(width < LABELS_MIN_WIDTH ? 6 : 3)

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const left = event.currentTarget.getBoundingClientRect().left
    const pointer = event.clientX - left
    let nearest = 0
    times.forEach((time, i) => {
      if (Math.abs(x(time) - pointer) < Math.abs(x(times[nearest]) - pointer)) nearest = i
    })
    setHoverIndex(nearest)
  }

  const allHoverRows =
    hoverIndex === null
      ? []
      : visible
          .map((tool) => ({ ...tool, stars: seriesByKey[tool.key][hoverIndex] }))
          .filter((row) => row.stars > 0)
          .sort((a, b) => b.stars - a.stars)
  const hoverX = hoverIndex === null ? 0 : x(times[hoverIndex])

  // One pill per line crossing the crosshair. They stay centered on it so the
  // pointer can reach any of them by moving straight up or down.
  const pillRows = allHoverRows.filter((row) => row.stars >= MIN_STARS)
  const pills = spreadLabels(
    pillRows.map((row) => ({ ...row, pointY: y(row.stars), y: y(row.stars) })),
    plotBottom,
    Math.min(PILL_GAP, (plotBottom - MARGIN.top) / Math.max(1, pillRows.length)),
  )
  // The pointer can stay put while its pill goes away, when a tool has too few
  // stars at the hovered week.
  const selectedKey = pills.some((pill) => pill.key === hoverKey) ? hoverKey : null

  // The selected tool joins the tooltip even when it ranks below the top rows.
  const hoverRows = allHoverRows.filter(
    (row, i) => i < TOOLTIP_ROWS || row.key === selectedKey,
  )
  const pillReach = Math.max(0, ...pills.map((pill) => pillWidth(pill.name) / 2))
  const tooltipOffset = pillReach + 8
  // The pills name the same lines, and would cover these labels near the right.
  const labelsCovered = pills.length > 0 && hoverX + pillReach > plotRight

  return (
    <section className="mx-auto w-full space-y-2 pt-4 lg:w-3/4">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">GitHub stars over time</h2>
          <div role="group" aria-label="Chart scale" className="flex shrink-0 rounded-md border p-0.5">
            {SCALES.map((option) => (
              <Button
                key={option}
                variant={scale === option ? "secondary" : "ghost"}
                size="sm"
                className="h-6 rounded-sm px-2 text-xs font-normal capitalize"
                aria-pressed={scale === option}
                onClick={() => setScale(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Following the table's filters. Refreshed daily from GitHub's star history, which
          only counts current stars.
          <span className="sm:hidden"> Tap the chart to name its lines.</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs">
        {colored.map((tool) => (
          <span key={tool.key} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-3.5 rounded-full" style={{ background: colors.get(tool.key) }} />
            {tool.name}
          </span>
        ))}
        {greyCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-3.5 rounded-full bg-muted-foreground/50" />
            {greyCount} other{greyCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div
        ref={containerRef}
        className="relative cursor-default touch-pan-y"
        onPointerDown={(event) => {
          if (event.pointerType === "touch") setHoverKey(null)
          onPointerMove(event)
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch") setHoverIndex(null)
        }}
      >
        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No star history for these filters.
          </p>
        ) : (
          width > 0 && (
            <svg
              width={width}
              height={HEIGHT}
              role="img"
              aria-label={`GitHub stars over time for the tools in the table, on a ${scale} scale`}
              className="block"
            >
              {gridStars.map((stars) => (
                <g key={stars}>
                  <line
                    x1={MARGIN.left}
                    x2={plotRight}
                    y1={y(stars)}
                    y2={y(stars)}
                    stroke="var(--muted-foreground)"
                    strokeOpacity={0.4}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={MARGIN.left - 8}
                    y={y(stars) + 4}
                    textAnchor="end"
                    className="fill-muted-foreground text-[11px]"
                  >
                    {stars >= 1000 ? `${stars / 1000}k` : stars}
                  </text>
                </g>
              ))}
              {ticks.map((tick) => (
                <text
                  key={tick}
                  x={x(tick)}
                  y={HEIGHT - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {new Date(tick).toLocaleDateString("en", {
                    month: "short",
                    year: "2-digit",
                    timeZone: "UTC",
                  })}
                </text>
              ))}
              {[...lines]
                .sort((a, b) => Number(a.key === selectedKey) - Number(b.key === selectedKey))
                .map((line) => {
                  const selected = line.key === selectedKey
                  return (
                    <path
                      key={line.key}
                      d={line.d}
                      fill="none"
                      stroke={line.color ?? (selected ? "var(--foreground)" : "var(--muted-foreground)")}
                      strokeOpacity={selected ? 1 : !line.color ? 0.35 : selectedKey ? 0.5 : 1}
                      strokeWidth={selected ? 2.5 : line.color ? 2 : 1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )
                })}
              {!labelsCovered &&
                labels.map((label) => (
                  <g key={label.key}>
                    {/* On a linear scale most lines end near zero, so a leader from
                        there would read as the line itself spiking at the end. */}
                    {scale === "linear" ? (
                      <circle
                        cx={plotRight + LABEL_LEADER - 3}
                        cy={label.y - 4}
                        r={2.5}
                        fill={colors.get(label.key) ?? "var(--muted-foreground)"}
                      />
                    ) : (
                      <line
                        x1={plotRight}
                        x2={plotRight + LABEL_LEADER}
                        y1={label.lineY}
                        y2={label.y - 4}
                        stroke={colors.get(label.key) ?? "var(--muted-foreground)"}
                        strokeOpacity={colors.has(label.key) ? 0.8 : 0.35}
                      />
                    )}
                    <text
                      x={plotRight + LABEL_LEADER + 3}
                      y={label.y}
                      className={cn(
                        "text-[11px]",
                        colors.has(label.key) ? "fill-foreground" : "fill-muted-foreground",
                      )}
                    >
                      {label.name} {formatStars(lastValue(label.key))}
                    </text>
                  </g>
                ))}
              {hoverIndex !== null && (
                <line
                  x1={hoverX}
                  x2={hoverX}
                  y1={MARGIN.top}
                  y2={plotBottom}
                  stroke="var(--foreground)"
                  strokeOpacity={0.4}
                />
              )}
              {pills.map((pill) => (
                <circle
                  key={pill.key}
                  cx={hoverX}
                  cy={pill.pointY}
                  r={2.5}
                  fill={colors.get(pill.key) ?? "var(--muted-foreground)"}
                />
              ))}
            </svg>
          )
        )}
        {pills.map((pill) => {
          const half = pillWidth(pill.name) / 2
          return (
            <div
              key={pill.key}
              className={cn(
                "absolute z-10 inline-flex h-4 -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border bg-popover px-1.5 text-[10px] leading-none text-popover-foreground",
                pill.key === selectedKey && "z-20 border-foreground font-bold",
              )}
              style={{
                left: Math.min(Math.max(hoverX, half), width - half),
                top: pill.y,
              }}
              onPointerEnter={() => setHoverKey(pill.key)}
              onPointerLeave={(event) => {
                if (event.pointerType !== "touch") setHoverKey(null)
              }}
              onPointerDown={(event) => {
                event.stopPropagation()
                setHoverKey(pill.key)
              }}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: colors.get(pill.key) ?? "var(--muted-foreground)" }}
              />
              {pill.name}
            </div>
          )
        })}
        {hoverIndex !== null && hoverRows.length > 0 && (
          <div
            className={cn(
              "pointer-events-none absolute z-30 min-w-44 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-sm",
              // On a narrow chart it would cover the pills, so it sits above the plot.
              showLabels ? "top-2" : "inset-x-0 bottom-full mb-1",
            )}
            style={
              !showLabels
                ? undefined
                : hoverX > width / 2
                  ? { right: Math.min(width - hoverX + tooltipOffset, width - 176) }
                  : { left: Math.min(hoverX + tooltipOffset, width - 176) }
            }
          >
            <div className="mb-1 font-semibold">{formatDate(times[hoverIndex])}</div>
            {hoverRows.map((row) => (
              <div
                key={row.key}
                className={cn(
                  "flex items-center justify-between gap-3",
                  row.key === selectedKey && "font-bold",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-0.5 w-2.5 rounded-full"
                    style={{ background: colors.get(row.key) ?? "var(--muted-foreground)" }}
                  />
                  {row.name}
                </span>
                <span className="font-mono tabular-nums">{row.stars.toLocaleString("en")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
