// KLA-71: Tier-1 heal role-consistency + cross-page guard unit tests.
// Uses real Playwright (headless Chromium). Each test exercises resolveTarget in isolation.
//
// Three scenarios:
//   (A) different-role candidate rejected  — text signal finds <h1> for a button fp → ElementGone
//   (B) cross-page candidate rejected      — page navigated away → ElementGone
//   (C) same-role same-page accepted       — drifted selector, correct role on correct page → healed
import { test, expect, beforeAll, afterAll } from "bun:test"
import { chromium, type Browser } from "playwright"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

import { resolveTarget, ElementGone } from "./trails-runner"
import type { Fingerprint } from "./trails-types"

const fixture = (name: string) => pathToFileURL(resolve(import.meta.dir, "../test-fixtures", name)).href

let browser: Browser
beforeAll(async () => { browser = await chromium.launch({ headless: true }) })
afterAll(async () => { await browser.close() })

// ── (A) Different-role candidate rejected ────────────────────────────────────────────────────────
// The fingerprint describes a <button>, but the page now has <h1>Submit Order</h1> with the same
// text. Tier-1 text signal must reject it because roleConsistent("heading", "button") → false.
// Signal 1 (role+name) also won't find a button, so we fall through to text, which rejects too.
// Result: all signals fail → ElementGone.
test("(A) KLA-71: Tier-1 text signal rejects a different-role candidate (h1 for button fp)", async () => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(fixture("heal-wrong-role.html"))
  const expectedUrl = page.url()

  const fp: Fingerprint = {
    role: "button",
    accessibleName: "Submit Order",
    text: "Submit Order",
    testId: undefined,
    domPath: undefined,
  }
  // No cached selector (Tier 0 miss). Tier 1 must reject the <h1> and throw ElementGone.
  await expect(resolveTarget(page, null, fp, expectedUrl)).rejects.toBeInstanceOf(ElementGone)
  await ctx.close()
})

// ── (B) Cross-page candidate rejected ────────────────────────────────────────────────────────────
// The fingerprint was crystallized on page A. The page has since navigated to page B (which also
// has the same button). resolveTarget must reject because page.url() ≠ expectedUrl.
test("(B) KLA-71: cross-page candidate rejected when page has navigated away", async () => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  // Start on the "correct" page A (heal-correct.html) and capture expectedUrl.
  await page.goto(fixture("heal-correct.html"))
  const expectedUrl = page.url()  // page A

  // Simulate navigation to a different page B (heal-cross-page.html) before Tier-1 runs.
  await page.goto(fixture("heal-cross-page.html"))
  // page.url() is now page B — different from expectedUrl (page A).

  const fp: Fingerprint = {
    role: "button",
    text: "Submit Order",
    testId: "submit-btn",
    domPath: undefined,
  }
  // Page B also has a matching button, but the URL guard must reject it.
  await expect(resolveTarget(page, null, fp, expectedUrl)).rejects.toBeInstanceOf(ElementGone)
  await ctx.close()
})

// ── (C) Same-role same-page accepted ─────────────────────────────────────────────────────────────
// The fingerprint describes a button whose cached selector has drifted (old id changed).
// The page now has <button data-testid="submit-btn">Submit Order</button>. Tier-1 must
// heal successfully via testid or role+name signal because role and page both match.
test("(C) KLA-71: same-role same-page candidate accepted (selector drifted, role intact)", async () => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(fixture("heal-correct.html"))
  const expectedUrl = page.url()

  const fp: Fingerprint = {
    role: "button",
    accessibleName: "Submit Order",
    text: "Submit Order",
    testId: "submit-btn",
    domPath: undefined,
  }
  // cachedSelector is the OLD (drifted) id — Tier 0 misses.
  const result = await resolveTarget(page, "#old-submit-btn-gone", fp, expectedUrl)
  expect(result.healed).toBe(true)
  expect(result.tier).toBe("candidate")
  await ctx.close()
})
