/**
 * Diagnostic 4: check console errors + manually call go(1) vs onclick click.
 */
import { chromium } from "playwright"

const BASE = "https://klavity.quantana.top"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

// Capture console errors
const errors: string[] = []
page.on("console", msg => {
  if (msg.type() === "error") errors.push(msg.text())
})
page.on("pageerror", e => errors.push("PageError: " + String(e)))

await page.goto(BASE + "/onboarding", { timeout: 15000 })

console.log("--- Before click ---")
console.log("step1 classes:", await page.locator(".panel.step[data-s='1']").getAttribute("class"))

// Check if go() is accessible globally
const goType = await page.evaluate(() => typeof (window as any).go)
console.log("typeof window.go:", goType)

// Check if cur is accessible
const curValue = await page.evaluate(() => {
  try { return (window as any).cur } catch(e) { return "error: " + e }
})
console.log("window.cur:", curValue)

// Click the button
await page.locator(".panel.step[data-s='0'] button.btn-indigo").click({ timeout: 5000 })
console.log("--- After click ---")
console.log("step1 classes:", await page.locator(".panel.step[data-s='1']").getAttribute("class"))
console.log("step0 classes:", await page.locator(".panel.step[data-s='0']").getAttribute("class"))

// Check cur after click
const curAfter = await page.evaluate(() => {
  try { return (window as any).cur } catch(e) { return "error: " + e }
})
console.log("window.cur after click:", curAfter)

// Manually call go(1) via JavaScript
const goResult = await page.evaluate(() => {
  try {
    (window as any).go(1)
    return "go(1) called successfully"
  } catch(e) {
    return "go(1) threw: " + String(e)
  }
})
console.log("Manual go(1):", goResult)
console.log("--- After manual go(1) ---")
console.log("step1 classes:", await page.locator(".panel.step[data-s='1']").getAttribute("class"))
console.log("step0 classes:", await page.locator(".panel.step[data-s='0']").getAttribute("class"))
console.log("#email visible:", await page.locator("#email").isVisible())

console.log("\nConsole errors:", errors)

await browser.close()
