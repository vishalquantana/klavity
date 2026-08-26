import { test, expect } from "bun:test"
import { readFileSync } from "fs"

// Regression guard (#679a recurred 3x): the assignee avatar (.tkt-av, incl. the
// unassigned "?" state) must be a locked 20px circle that NO flex/grid parent can
// stretch into an oval — in the ticket panel, the 3-col properties rail, everywhere.
const css = readFileSync(new URL("./public/dashboard.html", import.meta.url), "utf8")
const rule = css.match(/\.tkt-av\{[^}]*\}/)?.[0] || ""

test(".tkt-av rule exists", () => { expect(rule.length).toBeGreaterThan(0) })
test(".tkt-av hard-locks both axes to 20px (no ellipse possible)", () => {
  for (const dim of ["width:20px", "height:20px", "min-width:20px", "max-width:20px", "min-height:20px", "max-height:20px"]) {
    expect(rule).toContain(dim)
  }
  expect(rule).toContain("aspect-ratio:1/1")
  expect(rule).toContain("border-radius:50%")
  expect(rule).toContain("flex:none")
  expect(rule).toContain("align-self:center") // can't be stretched by an align-items:stretch parent
})
