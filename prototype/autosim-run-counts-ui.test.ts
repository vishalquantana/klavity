// Execution results: "<executed>/<total> executed" + a breakdown that adds up (passed · fixed · failed · needs review · not run).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const js = readFileSync(join(import.meta.dir, "public/vendor/autosim-projects.js"), "utf8")
const s = js.indexOf("function runStepsSummary(r) {")
let i = js.indexOf("{", s), depth = 0
for (; i < js.length; i++) { if (js[i] === "{") depth++; else if (js[i] === "}" && --depth === 0) break }
const esc = (x: string) => String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[c])
const summary = new Function("esc", js.slice(s, i + 1) + "; return runStepsSummary")(esc) as (r: any) => string
const text = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()

test("ticket example 1: 12 steps, 9 clean + 3 fixed → 12/12 executed", () => {
  expect(text(summary({ steps: 12, executed: 12, passed: 9, healed: 3, review: 0, failed: 0, notRun: 0 }))).toBe("12/12 executed 9 passed · 3 fixed")
})
test("ticket example 2: 17 steps, 10 + 3 fixed + 3 failed, 1 not run → 16/17 executed", () => {
  expect(text(summary({ steps: 17, executed: 16, passed: 10, healed: 3, review: 0, failed: 3, notRun: 1 }))).toBe("16/17 executed 10 passed · 3 fixed · 3 failed · 1 not run")
})
test("tooltip states the formula and that fixed counts as executed", () => {
  expect(summary({ steps: 4, executed: 4, passed: 4, healed: 0, review: 0, failed: 0, notRun: 0 })).toContain("Fixed = ran and passed after Klavity repaired a changed selector (counts as executed).")
})
