import type { ComponentType } from "react"

export type PlatformStatus = "full" | "beta" | "none" | "unknown"

export type Category =
  | "CLI orchestrator"
  | "Terminal multiplexer"
  | "Visual canvas"
  | "Terminal + cloud IDE"
  | "Editor-integrated"

// Fields a contributor supplies in a content/tools/<key>.mdx frontmatter block.
export interface ToolFrontmatter {
  key: string
  name: string
  category: Category
  website: string
  github: string | null
  license: string
  platform: Record<"windows" | "linux" | "macos" | "android" | "ios", PlatformStatus>
  pfNote?: string
  parallel: string
  isolation: string
  locality: string
  remote: string
  mobileCtl: string
  // Only used for repos GitHub can't track (no public repo) — ignored once
  // a live fetch succeeds.
  updatedLabel?: string
}

// The frontmatter shape, plus the GitHub stats fetched client-side at
// runtime — this is what actually reaches the table.
export interface Tool extends Omit<ToolFrontmatter, "platform" | "updatedLabel"> {
  pf: ToolFrontmatter["platform"]
  stars: number | null
  c20: number | null
  c100: number | null
  updatedLabel: string
  Notes: ComponentType
}
