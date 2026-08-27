// KLA-739 (round 8) — MANDATORY real Bun+Playwright integration test for renderOgPng().
//
// Round 7 replaced the render path with chromium.launchServer()+chromium.connect(); connect() to a local
// BrowserServer TIMES OUT under Bun 1.3.14 (works under Node), so every OG render hit the 20s deadline →
// served the default card AND held the shared withPdfSlot ~20s (starving PDF/AutoSims). The hermetic unit
// tests injected a FAKE browser and never exercised the real launch, so the break shipped to prod.
//
// This test drives the REAL renderOgPng() (chromium.launch() under Bun) and asserts it returns genuine
// PNG bytes within the deadline. It is the guard that would have caught the regression.

import { test, expect } from "bun:test"
import { renderOgPng } from "./og-render"

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] // \x89PNG\r\n\x1a\n

test("renderOgPng() returns real PNG bytes under Bun+Playwright (chromium.launch path)", async () => {
  const html =
    `<!doctype html><html><head><meta charset="utf-8"></head>` +
    `<body style="width:1200px;height:630px;margin:0;background:#120d1c;color:#fff;font:48px sans-serif">` +
    `Klavity OG render OK</body></html>`
  const started = Date.now()
  const png = await renderOgPng(html)
  const elapsed = Date.now() - started

  expect(png).toBeInstanceOf(Uint8Array)
  // A real 1200×630 @2x screenshot is many KB — NOT the 1×1 transparent placeholder / default fallback.
  expect(png.length).toBeGreaterThan(1000)
  expect(Array.from(png.slice(0, 8))).toEqual(PNG_MAGIC)
  // Must complete well within the 20s render deadline (round-7's connect-timeout hit the full 20s).
  expect(elapsed).toBeLessThan(20_000)
}, 60_000)
