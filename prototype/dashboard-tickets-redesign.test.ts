// KLA-562 Tickets redesign — guards for the quick-filter chips (Stage 1) and the Jira-style
// right-side detail panel + preserved deep-link full-page route (Stage 2). String-assertion style,
// matching the other dashboard-*.test.ts guards (these behaviours live in the live dashboard DOM /
// poll wiring that jsdom can't drive, so we assert the shipped source is wired the required way).

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

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

// ── Stage 1: quick-filter chips ────────────────────────────────────────────────────────────────
test("quick-filter chip row renders the five chips + advanced-filter toggle", () => {
  expect(HTML).toContain('id="tktQuickChips"')
  ;["all", "mine", "unassigned", "high", "auto"].forEach(q => expect(HTML).toContain(`data-q="${q}"`))
  expect(HTML).toContain('id="tktMoreFilters"')
  // The five always-visible dropdowns are now collapsed by default.
  expect(HTML).toContain('class="tkt-fb hide" id="tktFilterBar"')
})

test("chips map onto the EXISTING _tktFilters predicate fields (no rebuilt filtering)", () => {
  const fn = extractFn(HTML, "function tktQuickToFilters(q)")
  expect(fn).toContain('_tktFilters.assignee = (state && state.email)')      // mine
  expect(fn).toContain('_tktFilters.assignee = "__unassigned__"')            // unassigned
  expect(fn).toContain('_tktFilters.priority = "urgent,high"')               // high (urgent OR high)
  expect(fn).toContain('_tktFilters.source = "sim"')                         // auto-filed
})

test("board predicate OR-matches a comma priority preset so the High chip reuses tktMatchesSelectFilters", () => {
  const fn = extractFn(HTML, "function tktMatchesSelectFilters(t)")
  expect(fn).toContain('String(f.priority).split(",")')
  expect(fn).toContain("wantP.includes(t.priority)")
})

test("colored source chip helper covers sim / manual / human (widget)", () => {
  const kind = extractFn(HTML, "function ticketSourceKind(t)")
  expect(kind).toContain('t.source === "manual"')
  expect(kind).toContain('t.simName || t.source === "sim"')
  const chip = extractFn(HTML, "function srcChipHtml(t)")
  expect(chip).toContain('src-chip src-')
})

// ── Stage 2: right-side detail panel + preserved deep-link route ─────────────────────────────────
test("single-ticket opens as a panel by default; board/list is NOT hidden in panel mode", () => {
  expect(HTML).toContain('let _tktSingleMode = "panel"')
  const render = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(render).toContain('const panel = _tktSingleMode === "panel"')
  expect(render).toContain('single.classList.add("tkt-panel")')
  expect(render).toContain('document.body.classList.add("tkt-panel-open")')
  // Board/list/toolbar are only hidden on the full-page route, never in panel mode.
  expect(render).toContain("if (!panel) {")
  expect(render).toContain('board.classList.add("hide")')
})

test("deep link (?ticket=) still opens ONCE, on the full-page route", () => {
  const fn = extractFn(HTML, "function maybeOpenDeepLinkTicket()")
  // one-shot guard preserved
  expect(fn).toContain("if (_deepLinkTicketConsumed) return")
  expect(fn).toContain("_deepLinkTicketConsumed = true")
  // nav-away guard preserved on the async branch
  expect(fn).toContain("if (window.__klavDeepLinkNavAway) return")
  // shared deep links render the dedicated full-page route
  expect(fn).toContain('openSingleTicket(ticketId, "full")')
})

test("panel has a close + full-page control, a scrim, and Esc-to-close", () => {
  expect(HTML).toContain('scrim.id = "tktPanelScrim"')   // scrim is created lazily in ensurePanelScrim()
  const render = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(render).toContain('data-act="close"')
  expect(render).toContain('openSingleTicket(id, "full")')   // "Full page" expand button
  const scrim = extractFn(HTML, "function ensurePanelScrim()")
  expect(scrim).toContain('e.key === "Escape"')
  expect(scrim).toContain("closeSingleTicket()")
})

test("closing the panel tears down the panel state and does not re-render the board it never hid", () => {
  const fn = extractFn(HTML, "function closeSingleTicket()")
  expect(fn).toContain('const wasPanel = single && single.classList.contains("tkt-panel")')
  expect(fn).toContain('document.body.classList.remove("tkt-panel-open")')
  expect(fn).toContain("if (!wasPanel) renderTicketsView()")
  // deep-link param still stripped on close (KLA-200)
  expect(fn).toContain('u.searchParams.delete("ticket")')
})

// ── Preserved invariant: dashLiveBusy suppresses the ~25s poll while a ticket is open ───────────
test("liveness poll is suppressed while a ticket detail (panel or full) is open", () => {
  const fn = extractFn(HTML, "function dashLiveBusy()")
  expect(fn).toContain('$("ticketSingle")')
  expect(fn).toContain("single.children.length")
})
