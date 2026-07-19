// KLAVITYKLA-225 (JTBD 7.11): the overview trend chart + drill-down is wired into dashboard.html.
// Guards the markup + client wiring so a future refactor can't silently drop the card, the range
// toggle, the SVG renderer, or the drill-down deep-link.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

test("trend card, range toggle, legend and drill panel exist in the overview", () => {
  expect(html).toContain('id="trendCard"')
  expect(html).toContain('id="trendRange"')
  expect(html).toContain('data-days="30"')
  expect(html).toContain('data-days="90"')
  expect(html).toContain('id="trendChart"')
  expect(html).toContain('id="trendLegend"')
  expect(html).toContain('id="trendDrill"')
  // Trend card lives on the overview view.
  const card = html.slice(html.indexOf('id="trendCard"') - 120, html.indexOf('id="trendCard"'))
  expect(card).toContain('data-view="overview"')
})

test("client fetches the trends aggregate and drill endpoint, and renders an accessible SVG", () => {
  expect(html).toContain("async function loadTrends()")
  expect(html).toContain("/api/dashboard/trends?days=")
  expect(html).toContain("async function drillTrend(")
  expect(html).toContain("/api/dashboard/trends?day=")
  // Accessible inline SVG (role=img + aria-label), no chart library.
  expect(html).toContain('class="trend-chart" viewBox')
  expect(html).toContain('role="img"')
  // Drill rows deep-link into the ticket detail.
  expect(html).toContain("function openTicketById(")
})
