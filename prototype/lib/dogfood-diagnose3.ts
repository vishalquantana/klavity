/**
 * Diagnostic 3: simulate the exact runner sequence for Trail 2.
 * Click the intro button and check if #email becomes visible.
 */
import { chromium } from "playwright"

const BASE = "https://klavity.in"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
page.setDefaultNavigationTimeout(15000)
page.setDefaultTimeout(15000)

console.log("goto /onboarding…")
await page.goto(BASE + "/onboarding", { timeout: 15000 })
console.log("URL:", page.url())

// Step 0: assert h1 (as runner would)
const h1Count = await page.locator(".panel.step[data-s='0'] h1").count()
console.log(`h1 count: ${h1Count}, visible: ${h1Count > 0 ? await page.locator(".panel.step[data-s='0'] h1").isVisible() : false}`)

// Step 1: click the intro button
console.log("clicking .cta button.btn-indigo…")
await page.locator(".panel.step[data-s='0'] button.btn-indigo").click({ timeout: 5000 })
console.log("click done")

// Step 2: wait (simulate runner's wait step)
console.log("waitForLoadState(networkidle)…")
await page.waitForLoadState("networkidle").catch(() => console.log("networkidle timed out, continuing"))

// Step 3: check #email
const emailCount = await page.locator("#email").count()
const emailVisible = emailCount > 0 ? await page.locator("#email").isVisible() : false
console.log(`#email count=${emailCount}, visible=${emailVisible}`)

// Check step 1 panel visibility
const step1Visible = await page.locator(".panel.step[data-s='1']").isVisible()
console.log(`step 1 panel visible: ${step1Visible}`)
const step1HasHide = await page.locator(".panel.step[data-s='1']").getAttribute("class")
console.log(`step 1 classes: ${step1HasHide}`)

// Check step 0 panel
const step0HasHide = await page.locator(".panel.step[data-s='0']").getAttribute("class")
console.log(`step 0 classes: ${step0HasHide}`)

// Try to wait for #email to be visible
console.log("waiting for #email to be visible (5s timeout)…")
try {
  await page.locator("#email").waitFor({ state: "visible", timeout: 5000 })
  console.log("#email became visible!")
} catch (e) {
  console.log(`#email did NOT become visible within 5s: ${String(e).slice(0, 100)}`)
  // Check if it's in a currently hidden element
  const hidden = await page.locator("#email").evaluate((el) => {
    let node: Element | null = el
    while (node) {
      const style = window.getComputedStyle(node)
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return { hidden: true, tag: node.tagName, id: node.id, className: node.className, display: style.display }
      }
      node = node.parentElement
    }
    return { hidden: false }
  })
  console.log(`#email visibility chain: ${JSON.stringify(hidden)}`)
}

await browser.close()
