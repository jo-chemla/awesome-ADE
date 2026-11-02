import { useEffect, useMemo, useRef, useState } from "react"

import starHistory from "../../stats/star-history.json"
import type { Tool } from "@/lib/types"

const { weeks, tools: seriesByKey } = starHistory as {
  weeks: string[]
  tools: Record<string, number[]>
}

const HEIGHT = 440
const MARGIN = { top: 12, bottom: 24, left: 40 }
const LABELS_WIDTH = 124
const LABELS_MIN_WIDTH = 520
const LABEL_GAP = 14
const SERIES_COUNT = 5
const GRID_STARS = [1_000, 10_000, 100_000]
const MIN_STARS = 100
const TOOLTIP_ROWS = 6

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
function spreadLabels<T extends { y: number }>(labels: T[], maxY: number) {
  const sorted = [...labels].sort((a, b) => a.y - b.y)
  for (let i = 1; i < sorted.length; i++) {
    sorted[i].y = Math.max(sorted[i].y, sorted[i - 1].y + LABEL_GAP)
  }
  const overflow = (sorted.at(-1)?.y ?? 0) - maxY
  if (overflow > 0) {
    sorted[sorted.length - 1].y = maxY
    for (let i = sorted.length - 2; i >= 0; i--) {
      sorted[i].y = Math.min(sorted[i].y, sorted[i + 1].y - LABEL_GAP)
    }
  }
  return sorted
}

interface StarHistoryChartProps {
  // The rows the table's filters leave, across all pages.
  tools: Tool[]
}

export function StarHistoryChart({ tools }: StarHistoryChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
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
  const y = (stars: number) =>
    MARGIN.top +
    (1 - (Math.log10(stars) - Math.log10(MIN_STARS)) / (Math.log10(maxStars) - Math.log10(MIN_STARS))) *
      (plotBottom - MARGIN.top)

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
        colored
          .filter((tool) => lastValue(tool.key) >= MIN_STARS)
          .map((tool) => ({ ...tool, y: y(lastValue(tool.key)) + 4 })),
        plotBottom,
      )
    : []

  const ticks = quarterTicks(width < LABELS_MIN_WIDTH ? 6 : 3)

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const left = event.currentTarget.getBoundingClientRect().left
    const pointer = event.clientX - left
    let nearest = 0
    times.forEach((time, i) => {
      if (Math.abs(x(time) - pointer) < Math.abs(x(times[nearest]) - pointer)) nearest = i
    })
    setHoverIndex(nearest)
  }

  const hoverRows =
    hoverIndex === null
      ? []
      : visible
          .map((tool) => ({ ...tool, stars: seriesByKey[tool.key][hoverIndex] }))
          .filter((row) => row.stars > 0)
          .sort((a, b) => b.stars - a.stars)
          .slice(0, TOOLTIP_ROWS)
  const hoverX = hoverIndex === null ? 0 : x(times[hoverIndex])

  return (
    <section className="space-y-2 pt-4">
      <div>
        <h2 className="text-sm font-semibold">GitHub stars over time</h2>
        <p className="text-xs text-muted-foreground">
          Log scale, following the table's filters. Refreshed daily from GitHub's star history, which
          only counts current stars.
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
      <div ref={containerRef} className="relative">
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
              aria-label="GitHub stars over time for the tools in the table, on a log scale"
              className="block touch-pan-y"
              onPointerMove={onPointerMove}
              onPointerLeave={() => setHoverIndex(null)}
            >
              {GRID_STARS.map((stars) => (
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
                    {stars / 1000}k
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
              {lines.map((line) => (
                <path
                  key={line.key}
                  d={line.d}
                  fill="none"
                  stroke={line.color ?? "var(--muted-foreground)"}
                  strokeOpacity={line.color ? 1 : 0.35}
                  strokeWidth={line.color ? 2 : 1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {labels.map((label) => (
                <text key={label.key} x={plotRight + 6} y={label.y} className="fill-foreground text-[11px]">
                  {label.name} {formatStars(lastValue(label.key))}
                </text>
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
            </svg>
          )
        )}
        {hoverIndex !== null && hoverRows.length > 0 && (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-sm"
            style={
              hoverX > width / 2 ? { right: width - hoverX + 12 } : { left: hoverX + 12 }
            }
          >
            <div className="mb-1 font-semibold">{formatDate(times[hoverIndex])}</div>
            {hoverRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3">
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
