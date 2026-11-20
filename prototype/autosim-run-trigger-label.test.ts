// KD-3107: the AutoSim runs table must say how a run started (you / schedule / CI / API),
// and CI- or API-started runs must not be recorded as "manual".
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const js = readFileSync(join(import.meta.dir, "public/vendor/autosim-projects.js"), "utf8").replace(/\r\n/g, "\n")
const server = readFileSync(join(import.meta.dir, "server.ts"), "utf8")

function loadTriggerCell() {
  const start = js.indexOf("  var TRIGGER = {")
  const end = js.indexOf("  function fmtDur(")
  const esc = (s: any) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c])
  return new Function("esc", js.slice(start, end) + "\nreturn triggerCell")(esc) as (t: string) => string
}

test("runs table header is 'Started by', not the raw 'Trigger'", () => {
  expect(js).toContain(">Started by</th>")
  expect(js).not.toContain("<th>Trigger</th>")
  expect(js).not.toContain("esc(r.trigger)")
})

test("each trigger renders a readable label with an explanatory tooltip", () => {
  const cell = loadTriggerCell()
  expect(cell("manual")).toContain(">You<")
  expect(cell("scheduled")).toContain(">Schedule<")
  expect(cell("scheduled")).toContain("automatically")
  expect(cell("ci")).toContain(">CI pipeline<")
  expect(cell("api")).toContain(">API<")
  expect(cell("weird")).toContain(">weird<")
  expect(cell("")).toContain(">–<")
})

test("CI and public-API routes record their own trigger instead of the 'manual' default", () => {
  expect(server).toContain('runWalkNow(ciProject, trailId, { trigger: "ci" })')
  expect(server).toContain('runWalkNow(projectId, trailId, { trigger: "api" })')
})
