// P1 regression guard — Slack deep-link (?ticket=<id>) re-open loop.
//
// Repro: user opens a ticket via a Slack deep link (/dashboard?ticket=<id>), lands on it, then
// clicks Settings / navigates elsewhere. maybeOpenDeepLinkTicket() is invoked from refreshAll(),
// which runs on the KLA-510 dashboard-liveness ~25s poll AND on window-focus/tab-visible. Because
// the old code read ?ticket= and unconditionally re-opened the ticket every time (no once-per-load
// guard), every poll/focus force-navigated the user back to the ticket — a continuous loop.
//
// Fix (this test proves it):
//  1. One-shot guard `_deepLinkTicketConsumed` — auto-open happens on the FIRST successful find,
//     never again on subsequent refreshAll() poll/focus re-invocations, within a page load.
//  2. The async fetch branch commits the guard before fetching and bails if the user navigated away
//     (window.__klavDeepLinkNavAway) so a slow fetch can't yank them back.
//  3. setView() strips ?ticket= when leaving the tickets view (openSingleTicket re-adds it on every
//     render, so this is what keeps a later reload from dragging the user back).
//
// Harness note: these functions can't be driven through jsdom easily (they depend on the live
// dashboard DOM + poll wiring), so we brace-extract maybeOpenDeepLinkTicket() from dashboard.html
// and execute it in an injected sandbox (spying openSingleTicket). This exercises the REAL shipped
// source — not a re-implementation — which is the smallest unit that actually proves no-reopen.

import { test, expect } from "bun:test"

const DASH = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

// Anchored, brace-matched extraction (same technique as the other dashboard-*.test.ts guards).
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

const FN_SRC = extractFn(DASH, "function maybeOpenDeepLinkTicket()")

// Build a fresh sandboxed maybeOpenDeepLinkTicket with injected deps. Each harness has its own
// `_deepLinkTicketConsumed` (declared inside the factory), mirroring a fresh page load.
function makeHarness(state: any, search: string, fetchImpl?: any) {
  const calls: string[] = []
  const openSingleTicket = (id: any) => { calls.push(String(id)) }
  const location = { search }
  const win: any = { __klavDeepLinkNavAway: false }
  const fetch = fetchImpl || (() => Promise.resolve({ ok: false, json: () => Promise.resolve(null) }))
  const factory = new Function(
    "openSingleTicket", "state", "location", "fetch", "window",
    "let _deepLinkTicketConsumed = false;\n" + FN_SRC + "\nreturn maybeOpenDeepLinkTicket;"
  )
  const fn = factory(openSingleTicket, state, location, fetch, win)
  return { fn, calls, win }
}

test("P1: ?ticket= present, ticket in state — opens ONCE on first invoke, NOT again on poll/focus", () => {
  const state = { active: { id: "p1" }, tickets: [{ id: "T9" }] }
  const h = makeHarness(state, "?ticket=T9")

  h.fn()                                  // initial load path — should open
  expect(h.calls).toEqual(["T9"])         // first-time deep link still opens

  h.fn()                                  // simulate the ~25s liveness poll refreshAll()
  h.fn()                                  // simulate a window-focus / tab-visible refreshAll()
  expect(h.calls).toEqual(["T9"])         // guard held: NO re-open on subsequent refreshes (loop killed)
})

test("P1: no ?ticket= param — never opens anything (unaffected browsing)", () => {
  const state = { active: { id: "p1" }, tickets: [{ id: "T9" }] }
  const h = makeHarness(state, "?project=p1")
  h.fn(); h.fn()
  expect(h.calls).toEqual([])
})

test("first-time deep link with ticket NOT in initial payload — fetches then opens once", async () => {
  const report = { id: "T42", title: "Deep report" }
  const fetchImpl = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ report }) })
  const state: any = { active: { id: "p1" }, tickets: [] }
  const h = makeHarness(state, "?ticket=T42", fetchImpl)

  h.fn()                                  // load path — ticket absent, so it fetches
  h.fn()                                  // concurrent poll — guard already committed, must NOT fetch/open again
  await new Promise(r => setTimeout(r, 0))
  await new Promise(r => setTimeout(r, 0))
  expect(h.calls).toEqual(["T42"])        // opened exactly once after the single fetch resolved
})

test("async fetch that resolves after the user navigated away does NOT yank them back", async () => {
  const report = { id: "T7", title: "Late report" }
  const fetchImpl = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ report }) })
  const state: any = { active: { id: "p1" }, tickets: [] }
  const h = makeHarness(state, "?ticket=T7", fetchImpl)

  h.fn()                                  // starts the fetch
  h.win.__klavDeepLinkNavAway = true      // user clicks Settings while the fetch is in flight
  await new Promise(r => setTimeout(r, 0))
  await new Promise(r => setTimeout(r, 0))
  expect(h.calls).toEqual([])             // fetch resolved but did NOT open — user stays where they navigated
})

// --- Source-level guards that the sticky-URL half of the fix is wired (string assertions, since
//     these live in a separate <script> IIFE that can't be brace-extracted in isolation). ---

test("setView() strips the ?ticket= param when leaving the tickets view", () => {
  const setView = extractFn(DASH, "function setView(v){")
  expect(setView).toContain("_u.searchParams.delete('ticket')")
  expect(setView).toContain("if(v!=='tickets')")
})

// KLA-560: the nav-away flag now lives INSIDE setView() so every caller — programmatic setView(...)
// calls too, not just the sidebar handler — marks the deep-link as left. Guarded by __klavSetViewReady
// so the very first (initial-load) setView doesn't pre-empt a legitimate boot ?ticket= deep-link open.
test("setView() marks the deep-link as left for any non-tickets view (covers programmatic callers)", () => {
  const setView = extractFn(DASH, "function setView(v){")
  expect(setView).toContain("window.__klavDeepLinkNavAway=true")
  expect(setView).toContain("v!=='tickets'")
  // First-load guard present so the boot deep-link open (which runs after the initial setView) survives.
  expect(setView).toContain("window.__klavSetViewReady")
})
