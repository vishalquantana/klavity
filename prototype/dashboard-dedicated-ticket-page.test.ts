// KLA-563 — full dedicated ticket page (design-spec §4/§6.6/§6.7/§9/§10).
// The dedicated page is the shareable surface: a hash route #tickets/<id> (the closest equivalent the
// dashboard's hash router uses to /:project/tickets/:key) that renders a single ticket DIRECTLY from a
// single-ticket fetch — the board is NEVER mounted. String-assertion + brace-extraction style, matching
// the other dashboard-*.test.ts guards (this behaviour lives in the live dashboard DOM / poll wiring
// that jsdom can't drive, so we assert the shipped source is wired the required way), plus one
// functional harness proving the hash deep link opens exactly once (no reopen loop).

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

// ── §4/§9: route mechanism — hash #tickets/<id>, single-ticket fetch, board never mounts ───────────
test("dedicated page activates the Tickets view WITHOUT mounting the board (full mode)", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  // Panel keeps the board mounted behind it (nv.click); the dedicated page must not.
  expect(fn).toContain('window.__klavTktPageOpen = true')
  expect(fn).toContain('document.body.classList.add("tkt-page-open")')
  // The old unconditional nv.click() that force-mounted the board is now panel-only.
  expect(fn).toContain('if (panel) {')
  expect(fn).toContain(`const nv = document.querySelector('.side .nv[data-go="tickets"]'); if (nv) nv.click()`)
})

test("renderTicketsView early-returns (no board fetch/DOM) while the dedicated page is open", () => {
  const fn = extractFn(HTML, "function renderTicketsView()")
  expect(fn).toContain("if (window.__klavTktPageOpen) {")
  // still binds the filter bar first so Back-to-board restores the exact filter state
  expect(fn).toContain("tktFilterBarBind()")
  // the early-return skips fetchAndRenderTktBoard / fetchAndRenderTktList
  const idxGuard = fn.indexOf("__klavTktPageOpen")
  const idxFetch = fn.indexOf("fetchAndRenderTktBoard")
  expect(idxGuard).toBeGreaterThan(-1)
  expect(idxGuard).toBeLessThan(idxFetch)
})

test("the boot hash router handles #tickets/<id> and suppresses the board mount", () => {
  expect(HTML).toContain("var deepTkt=init.match(/^tickets\\/(.+)$/);")
  expect(HTML).toContain("else if(deepTkt){window.__klavTktPageOpen=true;setView('tickets');}")
})

test("the shareable canonical URL is the adaptive share link /t/<id>", () => {
  const fn = extractFn(HTML, "function ticketPageUrl(id)")
  // Share-viewer onboarding: Copy link now produces the adaptive /t/<id> URL (member → full ticket,
  // colleague without access → redacted teaser + email unblur), NOT the in-dashboard hash route.
  expect(fn).toContain('"/t/" + encodeURIComponent(String(id))')
  expect(fn).not.toContain('u.hash = "tickets/"')
})

// ── §6.6: breadcrumb + header (type · key · status pill · back · copy · prev/next) ─────────────────
test("dedicated page renders a Project › Tickets › KEY breadcrumb wired back to the board", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(fn).toContain('crumb.className = "tkt-crumb"')
  expect(fn).toContain('crumb.setAttribute("aria-label", "Breadcrumb")')
  expect(fn).toContain('class="tkt-crumb-cur" aria-current="page"')
  // breadcrumb links go back to the board (exact state preserved in-memory)
  expect(fn).toContain('crumb.querySelectorAll(".tkt-crumb-link").forEach(a => a.addEventListener("click", closeSingleTicket))')
})

test("header row has type · key · status pill · Back to board · Copy link · prev/next", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(fn).toContain('ph.className = "tkt-page-head"')
  expect(fn).toContain('class="tkt-page-key"')
  expect(fn).toContain("statusPillHtml(t.status)")            // status pill (dot + text, never color-only)
  expect(fn).toContain('data-act="back"')
  expect(fn).toContain('data-act="copy"')
  expect(fn).toContain('data-act="prev"')
  expect(fn).toContain('data-act="next"')
  // back-to-board label reflects the active board/list view
  expect(fn).toContain('const backLbl = _tktView === "board" ? "← Back to board" : "← Back to list"')
})

test("prev/next steps through the board's filtered+ordered ids, disabled at the ends", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(fn).toContain("const ids = _tktOrderedVisibleIds()")
  expect(fn).toContain("const hasPrev = cur > 0, hasNext = cur >= 0 && cur < ids.length - 1")
  expect(fn).toContain('openSingleTicket(ids[cur - 1], "full")')
  expect(fn).toContain('openSingleTicket(ids[cur + 1], "full")')
  // ordered id list mirrors the board filter predicate + column order
  const ord = extractFn(HTML, "function _tktOrderedVisibleIds()")
  expect(ord).toContain("tktMatchesSelectFilters(t)")
  expect(ord).toContain("kanbanKeyForStatus(t.status)")
  expect(ord).toContain("KANBAN_COLS")
})

test("Copy link copies the canonical hash URL", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(fn).toContain("await copyText(ticketPageUrl(id))")
})

// ── panel ⤢ expand navigates to this dedicated route ──────────────────────────────────────────────
test("panel expand (⤢) navigates to the dedicated full-page route", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(fn).toContain('ph.querySelector(\'[data-act="expand"]\').addEventListener("click", () => openSingleTicket(id, "full"))')
})

// ── §6.7: screenshot block — fake-browser chrome + immediate placeholder + "Reported here" ─────────
test("screenshot block wraps a fake-browser chrome, immediate placeholder and Reported-here box", () => {
  const fn = extractFn(HTML, "function wrapScreenshotChrome(detailEl, t)")
  expect(fn).toContain('chrome.className = "tkt-browser"')
  expect(fn).toContain("tkt-tl tkt-tl-r")               // traffic lights
  expect(fn).toContain("tkt-tl tkt-tl-g")
  expect(fn).toContain('class="tkt-browser-url"')       // URL pill of the captured page path
  expect(fn).toContain("Reported here")                 // annotation box
  expect(fn).toContain('class="tkt-shot-sk"')           // immediate skeleton placeholder
  // only the dedicated page dresses the shot; the panel keeps the compact shot. Image still streams in.
  const render = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(render).toContain("if (!panel && t.screenshotId) wrapScreenshotChrome(detailEl, t)")
  expect(render).toContain("loadTktShot(detailEl, t.annotations)")
})

// ── §10: accessibility ────────────────────────────────────────────────────────────────────────────
test("icon/action buttons carry aria-labels; panel is role=dialog with focus management", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(fn).toContain('aria-label="Previous ticket"')
  expect(fn).toContain('aria-label="Next ticket"')
  expect(fn).toContain('aria-label="Copy link to this ticket"')
  expect(fn).toContain('aria-label="Close ticket detail"')
  expect(fn).toContain('aria-label="Expand to full, shareable page"')
  expect(fn).toContain('aria-label="Back to board (Esc)"')
  // panel dialog semantics + focus moves in on open
  expect(fn).toContain('single.setAttribute("role", "dialog"); single.setAttribute("aria-modal", "true")')
  expect(fn).toContain("single.__focusTarget")
  expect(fn).toContain("single.__focusTarget.focus()")
  // focus returns to the invoking control on close
  const close = extractFn(HTML, "function closeSingleTicket()")
  expect(close).toContain("invoker.focus()")
})

test("min 28px hit target for icon-only buttons (CSS)", () => {
  expect(HTML).toContain(".tkt-icon-btn{")
  expect(HTML).toContain("min-width:28px;min-height:28px")
})

// ── deep-link preservation (KLA-553/560): one-shot open, no reopen on poll/focus ──────────────────
test("maybeOpenDeepLinkTicket reads BOTH ?ticket= and the #tickets/<id> hash, keeps the one-shot guard", () => {
  const fn = extractFn(HTML, "function maybeOpenDeepLinkTicket()")
  expect(fn).toContain("if (_deepLinkTicketConsumed) return")   // one-shot guard preserved
  expect(fn).toContain('_hm = (location.hash || "").match(/^#?tickets\\/(.+)$/)')
  expect(fn).toContain('openSingleTicket(ticketId, "full")')
  expect(fn).toContain("if (window.__klavDeepLinkNavAway) return")
})

test("leaving the dedicated page clears both deep-link surfaces (?ticket= AND the hash)", () => {
  const close = extractFn(HTML, "function closeSingleTicket()")
  expect(close).toContain("window.__klavTktPageOpen = false")
  expect(close).toContain('u.searchParams.delete("ticket")')
  expect(close).toContain('u.hash = "tickets"')   // reset to the board hash, not a ticket
  // navigating away via the sidebar also tears the page down (setView)
  const setView = extractFn(HTML, "function setView(v){")
  expect(setView).toContain("if(v!=='tickets'&&window.__klavTktPageOpen){")
  expect(setView).toContain("window.__klavTktPageOpen=false;")
})

// Functional: a #tickets/<id> hash deep link opens ONCE and never re-opens on poll/focus re-invocations.
function extractMaybe(): string { return extractFn(HTML, "function maybeOpenDeepLinkTicket()") }
function makeHarness(state: any, hash: string, search = "") {
  const calls: string[] = []
  const openSingleTicket = (id: any) => { calls.push(String(id)) }
  const location = { search, hash }
  const win: any = { __klavDeepLinkNavAway: false }
  const fetch = () => Promise.resolve({ ok: false, json: () => Promise.resolve(null) })
  const factory = new Function(
    "openSingleTicket", "state", "location", "fetch", "window",
    "let _deepLinkTicketConsumed = false;\n" + extractMaybe() + "\nreturn maybeOpenDeepLinkTicket;"
  )
  return { fn: factory(openSingleTicket, state, location, fetch, win), calls, win }
}

test("#tickets/<id> hash deep link: opens ONCE, NOT again on poll/focus (no reopen loop)", () => {
  const state = { active: { id: "p1" }, tickets: [{ id: "T9" }] }
  const h = makeHarness(state, "#tickets/T9")
  h.fn()
  expect(h.calls).toEqual(["T9"])   // first-time hash deep link opens
  h.fn(); h.fn()                    // ~25s poll + window-focus re-invocations
  expect(h.calls).toEqual(["T9"])   // guard held — no re-open
})

test("no ticket in either the query or the hash — never opens (unaffected browsing)", () => {
  const state = { active: { id: "p1" }, tickets: [{ id: "T9" }] }
  const h = makeHarness(state, "#tickets", "?project=p1")
  h.fn(); h.fn()
  expect(h.calls).toEqual([])
})
