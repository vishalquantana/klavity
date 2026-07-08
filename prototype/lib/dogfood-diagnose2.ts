/**
 * Diagnostic 2: check selector count immediately after page.goto() (no networkidle wait),
 * matching the runner's exact conditions.
 */
import { chromium } from "playwright"

const BASE = "https://klavity.in"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
page.setDefaultNavigationTimeout(15000)
page.setDefaultTimeout(15000)

console.log(`Navigating to ${BASE}/onboarding (no networkidle wait) …`)
await page.goto(BASE + "/onboarding", { timeout: 15000 })
// This is what the runner does: just goto, no extra wait

const checks: Array<[string, string]> = [
  ["h1", "h1 heading"],
  [".panel.step[data-s='0'] h1", "step 0 h1"],
  [".cta button.btn-indigo", ".cta button"],
  ["#email", "email input"],
]

for (const [sel, label] of checks) {
  const count = await page.locator(sel).count()
  const visible = count > 0 ? await page.locator(sel).first().isVisible() : false
  console.log(`  [${count}] ${label} (${sel}) — visible: ${visible}`)
}

// Check if the page url changed (redirect?)
console.log(`  URL after goto: ${page.url()}`)

await browser.close()
console.log("Done.")
