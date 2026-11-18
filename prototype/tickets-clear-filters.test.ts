// Bug: Tickets "Clear filters" stayed visible after the "All" quick chip removed every filter.
// The chips (and the search box) changed _tktFilters without re-evaluating the button; now every
// filter-changing path goes through syncTktClearBtn() → hasActiveTktFilters().
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")

function fnBody(name: string): string {
  const start = html.indexOf(`function ${name}(`)
  expect(start).toBeGreaterThan(-1)
  return html.slice(start, html.indexOf("\n          }", start))
}

test("quick chips (incl. All) re-evaluate the Clear filters button", () => {
  expect(fnBody("applyQuickChip")).toContain("syncTktClearBtn()")
})

test("dropdowns, initial load and the search box all use the same check", () => {
  expect(fnBody("onTktFilterUpdated")).toContain("syncTktClearBtn()")
  expect(fnBody("tktFilterBarBind")).toContain("syncTktClearBtn()")
  expect(html).toMatch(/_tktFilters\.search = si\.value\.trim\(\)\s+syncTktClearBtn\(\)/)
  // No leftover copy of the old inline hasFilter check that could drift out of sync.
  expect(html).not.toContain("const hasFilter = (")
})

test("hasActiveTktFilters: no filters → hidden; any filter or search → shown", () => {
  const src = fnBody("hasActiveTktFilters") + "\n          }"
  const make = (f: Record<string, unknown>) =>
    new Function("_tktFilters", `${src}; return hasActiveTktFilters()`)(f) as boolean
  const none = { status: [], priority: [], label: [], assignee: [], source: [], search: "" }
  expect(make(none)).toBe(false)                                  // after the "All" chip
  expect(make({ ...none, search: "   " })).toBe(false)
  expect(make({ ...none, status: ["open"] })).toBe(true)
  expect(make({ ...none, priority: ["urgent", "high"] })).toBe(true) // "High priority" chip
  expect(make({ ...none, search: "login" })).toBe(true)
  expect(make({ status: "", priority: "", label: "", assignee: "", source: "", search: "" })).toBe(false) // pre-init shape
})
