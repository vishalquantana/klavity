// Regression guard for two dashboard.html changes (#709 + #708).
//
// #709: the Snap view must offer the browser (Chrome) extension as an
//       alternative capture path (not just the report-widget snippet), and
//       its subtitle must no longer imply the extension is unavailable.
// #708: the collapsed sidebar brand must be wide enough to show the full
//       28x28 "K" spark (was width:24px → an ~8px sliver).
//
// Pins the surface-level markers so a future stale-base merge can't silently
// revert them.

import { test, expect } from "bun:test"

const DASHBOARD = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

const EXT_URL = "https://chromewebstore.google.com/detail/olahjdcgbdjajbfmgnakjlehgjdmaene"

// Extract just the Snap view block so we assert the link lives HERE.
const snapStart = DASHBOARD.indexOf('id="snapView"')
const snapEnd = DASHBOARD.indexOf("<!-- Metrics row", snapStart)
const SNAP_VIEW = DASHBOARD.slice(snapStart, snapEnd)

// ── #709: extension offered inside the Snap view ──────────────────────────────
test("#709: snapView offers the Chrome extension as a capture path", () => {
  expect(snapStart).toBeGreaterThan(-1)
  expect(snapEnd).toBeGreaterThan(snapStart)
  expect(SNAP_VIEW).toContain(EXT_URL)
  expect(SNAP_VIEW).toContain("Install the browser extension")
  expect(SNAP_VIEW).toContain("Get the extension →")
})

test("#709: snapView keeps the widget embed + live detection intact", () => {
  // The existing widget path must not be broken by the new extension card.
  expect(SNAP_VIEW).toContain('id="snapViewSnippet"')
  expect(SNAP_VIEW).toContain('id="snapViewDetect"')
  expect(SNAP_VIEW).toContain('id="snapViewCopyAI"')
})

test("#709: Snap subtitle no longer implies the extension is unavailable", () => {
  const sub = DASHBOARD.slice(
    DASHBOARD.indexOf('class="snap-view-sub"'),
    DASHBOARD.indexOf("</p>", DASHBOARD.indexOf('class="snap-view-sub"')),
  )
  expect(sub).not.toContain("no extension")
  expect(sub.toLowerCase()).toContain("extension")
})

// ── #708: collapsed brand wide enough for the 28px spark ──────────────────────
test("#708: collapsed brand width ≥ spark (28px), not an 8px sliver", () => {
  // Spark is 28px square.
  const sparkM = DASHBOARD.match(/\.brand \.spark\{width:(\d+)px/)
  expect(sparkM).not.toBeNull()
  const spark = Number(sparkM![1])
  expect(spark).toBe(28)

  const brandM = DASHBOARD.match(/body\.side-collapsed \.side \.brand\{width:(\d+)px/)
  expect(brandM).not.toBeNull()
  const brandW = Number(brandM![1])
  // Border-box: 28 spark + 8 + 8 horizontal padding = 44 → spark fully shows.
  expect(brandW).toBeGreaterThanOrEqual(spark)
  expect(brandW).not.toBe(24)
})
