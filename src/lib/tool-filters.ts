import type { PlatformStatus, Tool } from "@/lib/types"

// Pure helpers shared by the filter columns, the toolbar and the detail
// sheet, kept free of React so the filter semantics live in one place.

export type PlatformId = keyof Tool["pf"]

export const PLATFORMS: { id: PlatformId; letter: string; label: string }[] = [
  { id: "windows", letter: "W", label: "Windows" },
  { id: "linux", letter: "L", label: "Linux" },
  { id: "macos", letter: "M", label: "macOS" },
  { id: "android", letter: "A", label: "Android" },
  { id: "ios", letter: "I", label: "iOS" },
]

// Beta counts as supported: the filter answers "can I run it on X today?".
export function isSupported(status: PlatformStatus) {
  return status === "full" || status === "beta"
}

export function supportedPlatforms(pf: Tool["pf"]): PlatformId[] {
  return PLATFORMS.filter(({ id }) => isSupported(pf[id])).map(({ id }) => id)
}

// "MIT, open source" and "AGPL-3.0 (core UI)" both reduce to the license
// itself, so the filter offers one option per license family.
export function licenseFamily(license: string) {
  return license.split(/,| \(/)[0].trim()
}

export const PUSHED_WINDOWS = [
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
] as const

export function pushedWithinDays(pushedAt: string | null, days: number, now = Date.now()) {
  if (!pushedAt) return false
  const age = now - new Date(pushedAt).getTime()
  return age >= 0 && age <= days * 86_400_000
}

// Stars span three orders of magnitude, so the slider moves along log10
// and snaps each end to a readable round number.
export const STARS_LOG_MIN = 2 // 100
export const STARS_LOG_MAX = 6 // 1,000,000

export function starsFromLog(log: number) {
  const raw = 10 ** log
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(raw)) - 1)
  return Math.round(raw / magnitude) * magnitude
}

export function formatStars(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 && n < 10_000 ? 1 : 0)}k`
  return String(n)
}
