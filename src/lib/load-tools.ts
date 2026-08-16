import type { ComponentType } from "react"
import type { ToolFrontmatter } from "@/lib/types"

// Every content/tools/<key>.mdx is a contribution unit: frontmatter holds
// the structured fields the table renders, the optional body (compiled to
// a component) holds free-form notes shown in a per-row popover. Adding a
// tool to this comparison is "add one file here" — no code change needed.
const modules = import.meta.glob<{ frontmatter: ToolFrontmatter; default: ComponentType }>(
  "/content/tools/*.mdx",
  { eager: true },
)

export interface StaticTool extends ToolFrontmatter {
  Notes: ComponentType
}

export const STATIC_TOOLS: StaticTool[] = Object.values(modules)
  .map((m) => ({ ...m.frontmatter, Notes: m.default }))
  .sort((a, b) => a.name.localeCompare(b.name))
