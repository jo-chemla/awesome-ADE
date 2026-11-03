// Screenshots the stars chart as a 1200x630 social preview image.
// Usage: node .github/scripts/og-image.mjs <site url> <output png>
// Uses the Chrome already installed, on GitHub's runners or locally.
import { chromium } from "playwright-core"

const [url, output] = process.argv.slice(2)
const CHART = "section:has(svg[role=img])"

const browser = await chromium.launch({ channel: "chrome" })
try {
  // 1000x525 at 1.2x, so the chart's text stays readable as a small thumbnail.
  const page = await browser.newPage({
    viewport: { width: 1000, height: 525 },
    deviceScaleFactor: 1.2,
    colorScheme: "dark",
  })
  await page.goto(url)
  await page.locator(CHART).waitFor()

  await page.addStyleTag({
    content: `
      ${CHART} {
        position: fixed;
        inset: 0;
        z-index: 50;
        width: 100% !important;
        margin: 0;
        padding: 18px 28px;
        background: var(--background);
      }
      ${CHART} > div:first-child > p,
      ${CHART} [role=group] { display: none; }
      ${CHART} h2 { font-size: 20px; }
    `,
  })
  await page.locator(`${CHART} h2`).evaluate((heading) => {
    heading.textContent = "Agentic Dev Environments: GitHub stars over time"
  })
  // The chart measures its width with a ResizeObserver, so let it redraw.
  await page.waitForFunction(
    (selector) => document.querySelector(`${selector} svg[role=img]`).clientWidth > 900,
    CHART,
  )
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: output })
} finally {
  await browser.close()
}
