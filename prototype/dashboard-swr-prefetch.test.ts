// #652 — idle prefetch of the likely-next dashboard views (Tickets → Triage).
//
// After the current view paints, an idle pass warms the caches the likely-next views READ so a
// view-switch paints instantly with no skeleton:
//   • Tickets → in-memory board cache (_tktBoardTickets/_tktBoardProjId) + a "tickets:"+pid SWR marker
//   • Triage  → SWR key "triage:"+pid (renderTriage()'s swrSection paints it on entry)
//   • Sims    → NOT prefetched (state.sims already ships with /api/dashboard)
//
// These tests pin the REAL shipped prefetch unit (extracted from dashboard.html, not re-implemented)
// and prove: (1) a prefetch writes the exact key/board the target view reads WITHOUT navigating, and
// (2) a key that is already fresh in SWR (or an already-warm board) is NOT re-fetched. Deterministic —
// no DOM, no real network.

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

// ── Extract the actual shipped source unit (anchored, brace-matched) ──────────
function extractFn(src: string, startSig: string): string {
  const i = src.indexOf(startSig)
  if (i < 0) throw new Error("source not found: " + startSig)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + startSig)
}
const prefetchTargetSrc = extractFn(HTML, "async function _prefetchTarget(")

type FetchCall = { url: string; opts: any }
// Build the real _prefetchTarget in a sandbox where its collaborators (fetch, swr*, curProjId and the
// in-memory board vars) are all stubbed/observable. Returns the fn plus handles to inspect side effects.
function buildSandbox(opts: {
  swrCache?: Record<string, unknown>          // pre-seeded SWR keys (a present key == "fresh")
  boardTickets?: unknown[]                     // pre-seeded in-memory board cache
  boardProjId?: string | null
  triageResp?: unknown                         // JSON returned by the /triage fetch
  ticketsResp?: unknown                        // JSON returned by the /tickets fetch
  curPidAfterFetch?: string                    // simulate a project switch: curProjId() flips to this after a fetch
}) {
  const swrCache: Record<string, unknown> = { ...(opts.swrCache || {}) }
  const fetchCalls: FetchCall[] = []
  const writes: { key: string; data: unknown }[] = []
  let curPid = "proj_1"

  const stubFetch = async (url: string, o: any) => {
    fetchCalls.push({ url, opts: o })
    if (opts.curPidAfterFetch) curPid = opts.curPidAfterFetch     // model a mid-flight project switch
    const isTriage = url.indexOf("/triage") >= 0
    return {
      ok: true,
      json: async () => (isTriage ? opts.triageResp : opts.ticketsResp),
    }
  }
  const stubSwrRead = (k: string) => (k in swrCache ? swrCache[k] : null)
  const stubSwrWrite = (k: string, data: unknown) => { writes.push({ key: k, data }); swrCache[k] = data }
  const stubCurProjId = () => curPid

  // Declare the module-scope board vars the extracted fn reads/writes, then return the fn AND a getter
  // so the test can observe how the prefetch mutated the in-memory board cache.
  const factory = new Function(
    "fetch", "swrRead", "swrWrite", "curProjId", "__boardTickets", "__boardProjId",
    `let _tktBoardTickets = __boardTickets;
     let _tktBoardProjId = __boardProjId;
     ${prefetchTargetSrc}
     return { _prefetchTarget, board: () => ({ tickets: _tktBoardTickets, projId: _tktBoardProjId }) };`,
  )
  const mod = factory(
    stubFetch, stubSwrRead, stubSwrWrite, stubCurProjId,
    opts.boardTickets ?? [], opts.boardProjId ?? null,
  )
  return { prefetchTarget: mod._prefetchTarget as Function, board: mod.board as () => any, fetchCalls, writes }
}

// =============================================================================
// 1 · Prefetch WRITES the exact key each view reads — without navigating there
// =============================================================================
test("#652 prefetch(tickets) warms the in-memory board + writes the tickets:<pid> SWR marker", async () => {
  const tickets = [{ id: "t1" }, { id: "t2" }]
  const s = buildSandbox({ ticketsResp: { tickets, total: 2 } })
  const issued = await s.prefetchTarget("tickets", "proj_1", undefined)

  expect(issued).toBe(true)                                   // a real network prefetch happened
  // It fetched the FULL board (all statuses, limit 200) — exactly what fetchAndRenderTktBoard() fetches.
  expect(s.fetchCalls.length).toBe(1)
  expect(s.fetchCalls[0].url).toContain("/api/projects/proj_1/tickets?")
  expect(s.fetchCalls[0].url).toContain("status=new%2Copen%2Cin_progress%2Cdone%2Cdismissed")
  expect(s.fetchCalls[0].url).toContain("limit=200")
  // The in-memory board cache renderTicketsView() reads is now warm for this project (no skeleton on entry).
  expect(s.board().projId).toBe("proj_1")
  expect(s.board().tickets).toEqual(tickets)
  // And the freshness marker is written under the exact key the next idle pass checks.
  expect(s.writes).toEqual([{ key: "tickets:proj_1", data: tickets }])
})

test("#652 prefetch(triage) writes the exact triage:<pid> key renderTriage() paints from", async () => {
  const payload = { triage: [{ id: "fb1" }, { id: "fb2" }] }
  const s = buildSandbox({ triageResp: payload })
  const issued = await s.prefetchTarget("triage", "proj_1", undefined)

  expect(issued).toBe(true)
  expect(s.fetchCalls.length).toBe(1)
  expect(s.fetchCalls[0].url).toBe("/api/projects/proj_1/triage")
  // renderTriage()'s swrSection reads swrRead("triage:"+pid) and applies (d)=> _triageItems = d.triage,
  // so the whole payload object must be stored under that key.
  expect(s.writes).toEqual([{ key: "triage:proj_1", data: payload }])
})

// =============================================================================
// 2 · An already-FRESH key (or already-warm board) is NOT re-fetched
// =============================================================================
test("#652 prefetch(triage) SKIPS the fetch when triage:<pid> is already fresh in SWR", async () => {
  const s = buildSandbox({ swrCache: { "triage:proj_1": { triage: [{ id: "cached" }] } }, triageResp: { triage: [] } })
  const issued = await s.prefetchTarget("triage", "proj_1", undefined)

  expect(issued).toBe(false)          // short-circuited
  expect(s.fetchCalls.length).toBe(0) // no network
  expect(s.writes.length).toBe(0)     // and the fresh cache was left untouched
})

test("#652 prefetch(tickets) SKIPS the fetch when the board is already warm for this project", async () => {
  const s = buildSandbox({ boardTickets: [{ id: "t1" }], boardProjId: "proj_1", ticketsResp: { tickets: [] } })
  const issued = await s.prefetchTarget("tickets", "proj_1", undefined)

  expect(issued).toBe(false)
  expect(s.fetchCalls.length).toBe(0)
  expect(s.writes.length).toBe(0)
})

test("#652 prefetch(tickets) SKIPS the fetch when a fresh tickets:<pid> marker exists (cold board)", async () => {
  // Board is empty (cold) but the SWR marker is still fresh from a prior idle pass → don't re-fetch.
  const s = buildSandbox({ swrCache: { "tickets:proj_1": [{ id: "t1" }] }, ticketsResp: { tickets: [] } })
  const issued = await s.prefetchTarget("tickets", "proj_1", undefined)

  expect(issued).toBe(false)
  expect(s.fetchCalls.length).toBe(0)
  expect(s.writes.length).toBe(0)
})

// =============================================================================
// 3 · A project switch MID-FLIGHT drops the result (never clobbers the new project)
// =============================================================================
test("#652 prefetch drops its write when the project switches mid-flight", async () => {
  // curProjId() flips to proj_2 the moment the fetch resolves → the proj_1 payload must NOT be cached.
  const s = buildSandbox({ triageResp: { triage: [{ id: "stale" }] }, curPidAfterFetch: "proj_2" })
  const issued = await s.prefetchTarget("triage", "proj_1", undefined)

  expect(issued).toBe(true)           // the fetch did go out…
  expect(s.fetchCalls.length).toBe(1)
  expect(s.writes.length).toBe(0)     // …but its result was discarded (pid re-check failed)
})

// =============================================================================
// 4 · Wiring guards: the prefetch is scheduled/cancelled at the right seams
// =============================================================================
test("#652 setView cancels any in-flight prefetch on nav and schedules a fresh idle pass", () => {
  const setViewSrc = extractFn(HTML, "function setView(")
  expect(setViewSrc).toContain("window.klavCancelPrefetch()")   // abort on navigation (top of setView)
  expect(setViewSrc).toContain("window.klavSchedulePrefetch()") // re-arm at the end
})

test("#652 the initial load() kicks off the first prefetch once the project is known", () => {
  const loadSrc = extractFn(HTML, "async function load(")
  expect(loadSrc).toContain("schedulePrefetch()")
})

test("#652 the scheduler is idle-driven (requestIdleCallback + setTimeout fallback), one pass only", () => {
  const schedSrc = extractFn(HTML, "function schedulePrefetch(")
  expect(schedSrc).toContain("_cancelPrefetch()")          // collapse rapid navs to one pass
  expect(schedSrc).toContain("requestIdleCallback")
  expect(schedSrc).toContain("setTimeout(run, 600)")       // fallback ~600ms
})

test("#652 Sims is intentionally NOT in the prefetch order (state.sims ships with the dashboard)", () => {
  const orderSrc = (HTML.match(/const _PREFETCH_ORDER = \[[^\]]*\]/) || [])[0]
  expect(orderSrc).toBeTruthy()
  expect(orderSrc).toContain('"tickets"')
  expect(orderSrc).toContain('"triage"')
  expect(orderSrc).not.toContain('"sims"')
})
