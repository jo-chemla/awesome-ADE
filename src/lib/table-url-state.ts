import type { ColumnFiltersState } from "@tanstack/react-table"
import {
  type inferParserType,
  parseAsArrayOf,
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs"

import { FOLD_CONFIG } from "@/components/columns"
import { STATIC_TOOLS } from "@/lib/load-tools"
import { PLATFORMS, PUSHED_WINDOWS, licenseFamily, type PlatformId } from "@/lib/tool-filters"

// The shareable table state: ?os=windows,android&minStars=15000&expand=platform.
// Literal parsers drop values the table doesn't know (a renamed category in an
// old link), so a stale URL widens the results instead of emptying them.
export const tableUrlParsers = {
  q: parseAsString,
  category: parseAsArrayOf(parseAsStringLiteral(STATIC_TOOLS.map((t): string => t.category))),
  os: parseAsArrayOf(parseAsStringLiteral(PLATFORMS.map((p) => p.id))),
  minStars: parseAsInteger,
  maxStars: parseAsInteger,
  pushed: parseAsNumberLiteral(PUSHED_WINDOWS.map((w) => Number(w.value))),
  license: parseAsArrayOf(parseAsStringLiteral(STATIC_TOOLS.map((t) => licenseFamily(t.license)))),
  expand: parseAsArrayOf(parseAsStringLiteral(Object.keys(FOLD_CONFIG))),
}

type TableUrlState = inferParserType<typeof tableUrlParsers>

export function filtersFromUrl(url: TableUrlState): ColumnFiltersState {
  const filters: ColumnFiltersState = []
  if (url.q) filters.push({ id: "name", value: url.q })
  if (url.category?.length) filters.push({ id: "category", value: url.category })
  if (url.os?.length) filters.push({ id: "platforms", value: url.os })
  if (url.minStars != null || url.maxStars != null) {
    filters.push({ id: "stars", value: [url.minStars ?? 0, url.maxStars ?? Infinity] })
  }
  if (url.pushed != null) filters.push({ id: "pushed", value: url.pushed })
  if (url.license?.length) filters.push({ id: "license", value: url.license })
  return filters
}

export function urlFromFilters(filters: ColumnFiltersState) {
  const value = (id: string) => filters.find((f) => f.id === id)?.value
  const stars = value("stars") as [number, number] | undefined
  return {
    q: (value("name") as string | undefined) || null,
    category: (value("category") as string[] | undefined) ?? null,
    os: (value("platforms") as PlatformId[] | undefined) ?? null,
    // An open end of the range stays out of the URL.
    minStars: stars && stars[0] > 0 ? stars[0] : null,
    maxStars: stars && Number.isFinite(stars[1]) ? stars[1] : null,
    pushed: (value("pushed") as number | undefined) ?? null,
    license: (value("license") as string[] | undefined) ?? null,
  }
}
