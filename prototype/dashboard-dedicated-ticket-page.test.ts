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

// ── #681: ONE compact header row (← All Tickets · project · #ref · status · copy · prev/next) ───────
test("dedicated page collapses the breadcrumb into a single compact header row (no separate breadcrumb)", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  // #681: the tall Project › Tickets › KEY breadcrumb + duplicate key row are gone — one compact row only.
  expect(fn).not.toContain('crumb.className = "tkt-crumb"')
  expect(fn).not.toContain('crumb.setAttribute("aria-label", "Breadcrumb")')
  // project name is shown inline on the single header row instead of a breadcrumb crumb
  expect(fn).toContain('class="tkt-page-proj"')
  // the "← All Tickets" back link returns to the board (state preserved in-memory)
  expect(fn).toContain('ph.querySelector(\'[data-act="back"]\').addEventListener("click", closeSingleTicket)')
})

test("compact header row has back link + project + key · status pill · Copy link · prev/next", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(fn).toContain('ph.className = "tkt-page-head"')
  expect(fn).toContain('class="tkt-back-link"')               // "← All Tickets" back link
  expect(fn).toContain("All Tickets")
  expect(fn).toContain('class="tkt-page-proj"')               // project name inline
  expect(fn).toContain('class="tkt-page-key"')                // single #ref (no duplicate)
  expect(fn).toContain("statusPillHtml(t.status)")            // status pill (dot + text, never color-only)
  expect(fn).toContain('data-act="back"')
  expect(fn).toContain('data-act="copy"')
  expect(fn).toContain('data-act="prev"')
  expect(fn).toContain('data-act="next"')
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

// ── #707: 3-column resizable Plane-style layout on the dedicated page ───────────────────────────────
test("#707: the dedicated page wraps title+detail in a contained paper card (not naked on the bg)", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  // page mode wraps head + detail in a .tkt3-card; the panel keeps appending them straight to `single`.
  expect(fn).toContain('card.className = "tkt3-card"')
  expect(fn).toContain("card.appendChild(head)")
  expect(fn).toContain("card.appendChild(detailEl)")
  // the paper card uses the app's own white surface token (--ink-2), not a pasted palette.
  expect(HTML).toContain(".tkt3-card{background:var(--ink-2)")
  // the image-left grid class is now panel-only (the page uses the 3-col grid instead).
  expect(fn).toContain('if (t.screenshotId && panel) detailEl.classList.add("single-has-shot")')
})

test("#707: buildTktDetail renders a 3-col grid (screenshot | description+activity | properties) on the full page only", () => {
  const fn = extractFn(HTML, "function buildTktDetail(t, admin, onChange, isSingle = false)")
  // gated to the full page (isSingle & NOT the slide-over panel) so the panel/board-expand are unchanged.
  expect(fn).toContain('const _pageThreeCol = isSingle && (typeof _tktSingleMode !== "undefined" && _tktSingleMode !== "panel")')
  expect(fn).toContain('<div class="t3-cols">')
  expect(fn).toContain('class="t3-col t3-left"')
  expect(fn).toContain('class="t3-col t3-mid"')
  expect(fn).toContain('class="t3-col t3-right"')
  expect(fn).toContain('class="t3-gutter" data-g="1"')
  expect(fn).toContain('class="t3-gutter" data-g="2"')
  // the activity/comments mount point in the middle column
  expect(fn).toContain('class="t3-activity-mount"')
  // Enhance + Attach tools under the description
  expect(fn).toContain("t3-enh-btn")
  expect(fn).toContain("t3-attach-btn")
  expect(fn).toContain("if (_pageThreeCol) wireT3Resize(detailEl)")
})

test("#707: the two drag gutters resize + PERSIST both column widths to localStorage (clamped)", () => {
  const fn = extractFn(HTML, "function wireT3Resize(detailEl)")
  expect(fn).toContain('"klav:tkt3col:c1"')
  expect(fn).toContain('"klav:tkt3col:c3"')
  expect(fn).toContain("--t3c1")
  expect(fn).toContain("--t3c3")
  expect(fn).toContain("clamp(startC1 + dx, 200, 560)")
  expect(fn).toContain("clamp(startC3 - dx, 200, 520)")
  expect(fn).toContain("pointerdown")
  expect(fn).toContain("pointermove")
  // restores persisted widths on open
  expect(fn).toContain("localStorage.getItem")
  // below ~900px the grid collapses to a stack and hides the gutters
  expect(HTML).toContain("#ticketSingle.tkt-page .t3-cols{display:block}")
  expect(HTML).toContain("#ticketSingle.tkt-page .t3-gutter{display:none}")
})

test("#707: comment composer supports @mentions (dropdown from projectMemberEmails) + ⌘↵ send", () => {
  const fn = extractFn(HTML, "function buildTimelineSection(ticketId, report)")
  expect(fn).toContain('placeholder="Leave a comment… @ to tag"')
  expect(fn).toContain('class="t3-mention hide"')
  expect(fn).toContain("projectMemberEmails()")
  expect(fn).toContain("function pickMention(i)")
  expect(fn).toContain('const insert = "@" + m.handle + " "')
  // ⌘↵ / Ctrl↵ submits the comment
  expect(fn).toContain("ev.metaKey || ev.ctrlKey")
  // posted mentions render highlighted
  expect(HTML).toContain("function renderCommentBody(text)")
  expect(HTML).toContain('<span class="t3-m">@')
})

test("#707: Enhance-with-AI wires the existing /api/report/enhance endpoint with optimistic apply", () => {
  const fn = extractFn(HTML, "function buildTktDetail(t, admin, onChange, isSingle = false)")
  expect(fn).toContain('fetch("/api/report/enhance"')
  // optimistic save reuses the same guarded PATCH { observation } path + revert-on-fail
  expect(fn).toContain("window.__klavMutating++")
  expect(fn).toContain("Enhanced draft couldn’t be saved — reverted.")
})

// ── §10: accessibility ────────────────────────────────────────────────────────────────────────────
test("icon/action buttons carry aria-labels; panel is role=dialog with focus management", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  expect(fn).toContain('aria-label="Previous ticket"')
  expect(fn).toContain('aria-label="Next ticket"')
  expect(fn).toContain('aria-label="Copy link to this ticket"')
  expect(fn).toContain('aria-label="Close ticket detail"')
  expect(fn).toContain('aria-label="Expand to full, shareable page"')
  expect(fn).toContain('aria-label="Back to all tickets (Esc)"')
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

// ── #681: the board's "Tickets" page heading must be hidden on the dedicated ticket page ────────────
test("the Tickets page heading (.content>.head) is hidden on the dedicated ticket page", () => {
  // the greeting/title block (#hello + #lead) lives in .content>.head; it must not leak above the ticket
  expect(HTML).toContain("body.tkt-page-open .content>.head")
})

// ── #679b: exactly ONE assignee control (redesigned avatar picker) — no legacy open input/Clear row ──
test("ticket detail renders only the redesigned avatar assignee control (no legacy .tkt-assignee-row)", () => {
  // #678: assigneePickerHtml is now single-purpose (the detail-panel avatar control) — the on-card
  // `compact` variant was removed, so the signature is assigneePickerHtml(t).
  const picker = extractFn(HTML, "function assigneePickerHtml(t)")
  // #716: the redesigned control — avatar + email opens a Linear/Plane-style picker popover (search +
  // member list + Unassigned + Invite). The hidden `.assignee-inp` model + Clear are preserved.
  expect(picker).toContain('class="tkt-assignee-ctrl-wrap"')
  expect(picker).toContain('class="tkt-assignee-pop hide"')
  expect(picker).toContain('class="assignee-inp tkt-assignee-input"')
  // the legacy always-open assignee row was removed from the markup entirely
  expect(HTML).not.toContain('class="tkt-assignee-row"')
  expect(HTML).not.toContain(".tkt-assignee-row{")
  // both routes build the detail via the SAME buildTktDetail (single assignee UI everywhere)
  const detail = extractFn(HTML, "function buildTktDetail(t, admin, onChange, isSingle = false)")
  expect(detail).toContain("assigneePickerHtml(t)")
})

// ── #679a: the assignee avatar is a fixed circle (never a stretched oval) ───────────────────────────
test("assignee avatar (.tkt-av) is locked to a circular aspect (equal w/h + aspect-ratio + flex:none)", () => {
  const i = HTML.indexOf(".tkt-av{")
  expect(i).toBeGreaterThan(-1)
  const rule = HTML.slice(i, HTML.indexOf("}", i) + 1)
  expect(rule).toContain("aspect-ratio:1/1")
  expect(rule).toContain("flex:none")
  expect(rule).toContain("border-radius:50%")
  // equal explicit width & height (both 20px)
  expect(rule).toContain("width:20px")
  expect(rule).toContain("height:20px")
})

// ── #679/#705 edit-mode: the description textarea sits BELOW the label and AUTO-GROWS with content ──
test("editable-description textarea is a same-typography auto-grow field (no fixed 'tiny box')", () => {
  expect(HTML).toContain(".tkt-desc-edit-wrap{display:block;margin-top:2px}")
  const i = HTML.indexOf(".tkt-desc-ta{")
  const rule = HTML.slice(i, HTML.indexOf("}", i) + 1)
  expect(rule).toContain("display:block")
  // #705: grows to fit content (JS sets height=scrollHeight) — no fixed min/max that shrinks text.
  expect(rule).toContain("min-height:0")
  expect(rule).toContain("height:auto")
  expect(rule).toContain("overflow:hidden")
  expect(rule).not.toContain("min-height:104px")
  expect(rule).not.toContain("max-height:360px")
  // Same read-view typography so clicking Edit doesn't reflow the block.
  expect(rule).toContain("font-size:14px")
  expect(rule).toContain("line-height:1.5")
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
