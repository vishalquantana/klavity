// Bug: no back navigation anywhere in the AutoSims → Projects & Test Cases flow.
// Every level gets a "← Back to <parent>" button, and a run's Report page returns to its test case.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const asp = readFileSync(join(import.meta.dir, "public/vendor/autosim-projects.js"), "utf8")
const walk = readFileSync(join(import.meta.dir, "public/autosims-walk.html"), "utf8")

test("each Projects & Test Cases level renders a back button to its parent", () => {
  expect(asp).toContain("function crumbs(items, back)")
  expect(asp).toContain('class="asp-back"')
  // Project → project list; test case → that project's Test Cases tab.
  // The Projects list is top level (the AUTOSIMS tab goes back), so it has no back link.
  expect(asp).not.toContain("label: 'Back to AutoSims'")
  expect(asp).toContain("{ to: { asp: 'list' }, label: 'Back to Projects' }")
  expect(asp).toContain("{ to: { asp: p.id, tab: 'test-cases' }, label: 'Back to Test Cases' }")
})

test("a run's Report link carries the test case URL so the report can go back to it", () => {
  expect(asp).toContain("'&from=' + encodeURIComponent(urlFor({ asp: cur.project.id, tc: tc.id }))")
})

test("the walk report page has a back button that only trusts same-site /dashboard return paths", () => {
  expect(walk).toContain('id="backLink"')
  expect(walk).toContain('l.textContent="Back to test case"')
  const guard = /\/\^\\\/dashboard\(\?:\[\?#\]\|\$\)\//
  expect(walk).toMatch(guard)
  // The guard rejects off-site / scheme URLs (no open redirect) and accepts the dashboard deep link.
  const re = /^\/dashboard(?:[?#]|$)/
  expect(re.test("/dashboard?project=p&asp=a&asp_tc=t#autosims")).toBe(true)
  for (const bad of ["//evil.com/dashboard", "https://evil.com/dashboard", "javascript:alert(1)", "/dashboardx", "/dashboard.evil.com"]) {
    expect(re.test(bad)).toBe(false)
  }
})
