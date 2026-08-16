declare module "*.mdx" {
  import type { ComponentType } from "react"
  import type { ToolFrontmatter } from "@/lib/types"

  export const frontmatter: ToolFrontmatter
  const MDXContent: ComponentType
  export default MDXContent
}
