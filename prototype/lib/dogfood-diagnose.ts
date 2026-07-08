/**
 * Quick diagnostic: launch Chromium, navigate to prod onboarding, check which selectors resolve.
 */
import { chromium } from "playwright"

const BASE = "https://klavity.in"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

console.log(`Navigating to ${BASE}/onboarding …`)
await page.goto(BASE + "/onboarding")
await page.waitForLoadState("networkidle")

const title = await page.title()
console.log(`Page title: ${title}`)
console.log(`URL: ${page.url()}`)

const checks: Array<[string, string]> = [
  ["h1", "h1 heading"],
  [".panel.step[data-s='0'] h1", "step 0 h1 (attr selector single-quote)"],
  ['[data-s="0"] h1', "step 0 h1 (attr selector double-quote)"],
  ["button.btn-indigo", "any btn-indigo button"],
  [".cta button.btn-indigo", ".cta button"],
  ["#email", "email input"],
  ["#projectName", "projectName input"],
  ["#createBtn", "createBtn button"],
  [".panel.step", "all .panel.step divs"],
  [".panel.step.hide", "hidden step panels"],
]

for (const [sel, label] of checks) {
  try {
    const count = await page.locator(sel).count()
    const visible = count > 0 ? await page.locator(sel).first().isVisible() : false
    console.log(`  [${count}] ${label} (${sel}) — first visible: ${visible}`)
  } catch (e) {
    console.log(`  [ERR] ${label} (${sel}) — ${String(e).slice(0, 80)}`)
  }
}

// Check what text is on the page
const bodyText = await page.locator("body").innerText()
const firstLines = bodyText.split("\n").filter(l => l.trim()).slice(0, 10)
console.log("\nFirst visible text lines on the page:")
for (const line of firstLines) {
  console.log(`  "${line.trim()}"`)
}

await browser.close()
console.log("\nDone.")
