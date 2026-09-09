// KLA-764 / KLA-777 / KLA-779 — dashboard data-integrity guards.
// String-assertion style (matches the other dashboard-*.test.ts guards): the behaviours live in the
// live dashboard DOM / poll wiring that jsdom can't drive, so we assert the shipped source is wired
// the required way. Server-side (KLA-779) is a source-limit assertion on server.ts.

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

// ── KLA-764: project switcher must survive a transient empty/failed revalidation ───────────────
test("KLA-764: load() never overwrites good state with a transient EMPTY payload", () => {
  const fn = extractFn(HTML, "async function load()")
  // The empty-payload guard mirrors refreshAll's KLA-717 shape: bail if fresh data has no projects/
  // active but we already hold projects.
  expect(fn).toContain("data.projects.length === 0 && !data.active")
  expect(fn).toContain("state.projects.length > 0) return")
  // NEGATIVE CONTROL: the guard must sit BEFORE the `state = data` overwrite, or it can't protect it.
  const guardIdx = fn.indexOf("state.projects.length > 0) return")
  const assignIdx = fn.indexOf("state = data")
  expect(guardIdx).toBeGreaterThan(-1)
  expect(assignIdx).toBeGreaterThan(-1)
  expect(guardIdx).toBeLessThan(assignIdx)
})

test("KLA-764: load() retries a hard failure instead of blanking the switcher on the first blip", () => {
  const fn = extractFn(HTML, "async function load()")
  // A bounded retry loop (not a single fetch) so one flaky response can't wipe the switcher.
  expect(fn).toMatch(/for\s*\(let attempt = 0; attempt < 3; attempt\+\+\)/)
  // It must only retry true failures, not spin forever on a valid empty (new-user) payload.
  expect(fn).toContain("if (data && !data.error) break")
})

// ── KLA-777: priority change must patch the board's warm cache, mirroring the status handler ───
test("KLA-777: priority-change handler patches _tktBoardTickets (not just state.tickets)", () => {
  // The priority picker's change handler lives just after the KLA-199 marker.
  const i = HTML.indexOf("const priSelEl = detailEl.querySelector(\".tkt-pri-sel\")")
  expect(i).toBeGreaterThan(-1)
  const region = HTML.slice(i, i + 1600)
  // Mirrors the status handler: find the board ticket and set its priority.
  expect(region).toContain("const bt = (_tktBoardTickets || []).find(x => String(x.id) === String(ticketId))")
  expect(region).toContain("if (bt) bt.priority = newPri")
  // And it should compare ids with String() coercion (matches the status handler; avoids type drift).
  expect(region).toContain("(state.tickets || []).find(x => String(x.id) === String(ticketId))")
})

// ── KLA-779: dashboard ticket feed must not cap below the "20+" the board can show ─────────────
test("KLA-779: /api/dashboard ticket feed is raised from 12 so assignee filters see 20+", () => {
  // The overview feed → state.tickets. It used to be limit:12 which starved "My items".
  expect(SERVER).not.toContain("listFeedback(projectId, { limit: 12 })")
  expect(SERVER).toContain("listFeedback(projectId, { limit: 50 })")
})

// ── KLA-779 (structural): a cold board must load the FULL 200-row set before "My items"/assignee
// filters render, instead of filtering the tiny state.tickets fallback (opencode round-1 finding). ──
test("KLA-779: renderTicketsKanban triggers the full board fetch when the board cache is cold", () => {
  const fn = extractFn(HTML, "function renderTicketsKanban(")
  // When called with no boardTickets arg AND the board cache is empty AND a project is selected AND no
  // fetch is in flight, it kicks off fetchAndRenderTktBoard() so filters run over the 200-row set.
  expect(fn).toContain("_tktBoardTickets.length === 0 && projId && !_tktBoardState.loading")
  expect(fn).toContain("fetchAndRenderTktBoard()")
  // And the guard must sit BEFORE the sourceTickets fallback so the fetch is kicked off on the cold render.
  const trigIdx = fn.indexOf("fetchAndRenderTktBoard()")
  const srcIdx = fn.indexOf("const sourceTickets =")
  expect(trigIdx).toBeGreaterThan(-1)
  expect(srcIdx).toBeGreaterThan(trigIdx)
})
