// KD-3090 — Overview metric cards (Feedback received / Sims / Teammates / Tickets filed) refresh on their own.
// String-assertion style (matches the other dashboard-*.test.ts guards): the poll wiring lives in the live
// dashboard DOM that jsdom can't drive, so we assert the shipped source is wired the required way.

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const SERVER = await Bun.file(import.meta.dir + "/server.ts").text()

function extractFn(src: string, marker: string): string {
  const i = src.indexOf(marker)
  if (i < 0) throw new Error("marker not found: " + marker)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + marker)
}

test("server: /dashboard-counts is routed through the member-gated project matcher", () => {
  const matcher = SERVER.split("\n").find(l => l.includes("const projMatch = path.match("))!
  expect(matcher).toContain("\\/dashboard-counts")
  expect(SERVER).toContain('sub === "/dashboard-counts"')
})

test("server: /dashboard-counts uses the same sources as /api/dashboard (counts + personas + members)", () => {
  const i = SERVER.indexOf('sub === "/dashboard-counts"')
  const block = SERVER.slice(i, i + 600)
  expect(block).toContain("dashboardCounts(proj.id)")
  expect(block).toContain("listPersonas(proj.id)")
  expect(block).toContain("membersOfProject(proj.id)")
  expect(block).toContain("sims: personas.length")
  expect(block).toContain("team: members.length")
})

test("client: statsTick is NOT paused by dashLiveBusy (the reason the cards went stale)", () => {
  const fn = extractFn(HTML, "async function statsTick()")
  expect(fn).not.toContain("dashLiveBusy")
  expect(fn).toContain("/dashboard-counts")
  expect(fn).toContain("document.hidden")              // still idle when the tab is hidden
  expect(fn).toContain('!== "overview"')                // only while the cards are on screen
  expect(fn).toContain("curProjId() !== pid")          // drops a response for a project switched away from
})

test("client: statsTick runs on an interval, on focus and on tab-visible", () => {
  const init = extractFn(HTML, "(function initDashLiveness()")
  expect(init).toContain("setInterval(statsTick, 10000)")
  expect(init).toContain('addEventListener("focus", statsTick)')
  expect(init).toMatch(/visibilitychange[^\n]*statsTick\(\)/)
})

test("client: entering Overview re-reads the metric cards", () => {
  expect(HTML).toMatch(/if \(v === 'overview'\) \{[\s\S]{0,400}window\.klavRefreshStats\(\)/)
})

test("client: renderStats prefers a counts read newer than the applied dashboard payload", () => {
  const fn = extractFn(HTML, "function renderStats()")
  expect(fn).toContain("_liveStats.at > _dashLastAppliedRequestAt")
  expect(fn).toContain("_liveStats.pid === _pidNow")
  for (const id of ["stFeedback", "stSims", "stTeam", "stTickets"]) expect(fn).toContain(`setT("${id}", pick(live.`)
})
