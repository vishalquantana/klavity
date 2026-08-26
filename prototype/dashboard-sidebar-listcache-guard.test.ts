import { test, expect } from "bun:test"
import { readFileSync } from "fs"

// Guards for #719 (collapsed sidebar shows the real logo icon, not the letter "K", and hides
// wordmark/nav labels cleanly) + #720 (Tickets LIST view caches via SWR + lazy-loads rows).
const html = readFileSync(new URL("./public/dashboard.html", import.meta.url), "utf8")

// ── #719 ────────────────────────────────────────────────────────────────────────────────────────
test("#719: brand spark renders the logo SVG, not a bare letter 'K' text node", () => {
  // Every .brand should carry an inline <svg> mark and NOT the old `<span class="spark">K</span>`.
  expect(html).not.toContain('<span class="spark">K</span>')
  // Both the sidebar brand and the mobile bar-brand use the dot-grid favicon svg inside the spark.
  const sparkSvgCount = (html.match(/<span class="spark"><svg /g) || []).length
  expect(sparkSvgCount).toBeGreaterThanOrEqual(2)
})

test("#719: wordmark is a .brand-word span that is hidden when the rail is collapsed", () => {
  expect(html).toContain('<span class="brand-word">Klavity</span>')
  expect(html).toContain("body.side-collapsed .side .brand-word{display:none}")
})

test("#719: collapsed nav labels are fully hidden (font-size:0), not clipped to a sliver", () => {
  // The .nv gets font-size:0 when collapsed so the bare text-node label collapses entirely,
  // and the icon rail is centered.
  const nvRules = [...html.matchAll(/body\.side-collapsed \.side \.nv\{([^}]*)\}/g)].map(m => m[1])
  const iconRailRule = nvRules.find(r => r.includes("font-size:0")) || ""
  expect(iconRailRule).toContain("font-size:0")
  expect(iconRailRule).toContain("justify-content:center")
  // Counts + path tags are removed outright when collapsed.
  expect(html).toContain("body.side-collapsed .side .nv .ct,body.side-collapsed .side .nv .cl-path-tag{display:none}")
})

// ── #720 ────────────────────────────────────────────────────────────────────────────────────────
test("#720: the list view reads + writes an SWR cache keyed per project/filter/page", () => {
  const fn = html.match(/async function fetchAndRenderTktList\(\)[\s\S]*?\n}\n/)?.[0] || ""
  expect(fn.length).toBeGreaterThan(0)
  expect(fn).toContain('const cacheKey = "tktlist:"')
  expect(fn).toContain("swrRead(cacheKey)")
  expect(fn).toContain("swrWrite(cacheKey")
})

test("#720: revalidation respects the __klavMutating poll-pause guard", () => {
  const fn = html.match(/async function fetchAndRenderTktList\(\)[\s\S]*?\n}\n/)?.[0] || ""
  expect(fn).toContain("window.__klavMutating > 0")
})

test("#720: list rows lazy-load in batches via IntersectionObserver", () => {
  const fn = html.match(/function renderTktList\([\s\S]*?\n}\n/)?.[0] || ""
  expect(fn).toContain("appendLazyBatch")
  expect(fn).toContain("IntersectionObserver")
  expect(fn).toContain("LAZY_BATCH")
})
