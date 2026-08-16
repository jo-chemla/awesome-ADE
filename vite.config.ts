import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { fileURLToPath, URL } from 'url'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built site works unmodified whether it's served at
  // a domain root or under a GitHub Pages project-page subpath.
  base: './',
  plugins: [
    // Must run before @vitejs/plugin-react — it turns content/tools/*.mdx
    // into plain JS modules (frontmatter export + compiled body component)
    // that react() then never needs to touch.
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }) },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
