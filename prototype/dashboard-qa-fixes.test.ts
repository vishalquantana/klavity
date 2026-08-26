// Regression guards for the dashboard QA cluster (KLAVITYKLA-510..518, -197).
// dashboard.html is a large vanilla-JS SPA with no module exports, so — following the
// established dashboard-*.test.ts convention — we assert against the shipped source. Each
// assertion pins the exact fix so a future theirs-wins merge can't silently drop it.

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

// ── KLAVITYKLA-510 · live refresh layer ───────────────────────────────────────
test("KLA-510: liveness refreshes on focus + visibilitychange", () => {
  expect(HTML).toContain('window.addEventListener("focus", dashLiveTick)')
  expect(HTML).toContain('document.addEventListener("visibilitychange"')
})
test("KLA-510: a guarded ~25s poll runs while visible", () => {
  expect(HTML).toContain("setInterval(dashLiveTick, 25000)")
})
test("KLA-510: relative-time labels re-tick via data-ago", () => {
  expect(HTML).toContain("function retickAgo()")
  expect(HTML).toContain('document.querySelectorAll("[data-ago]")')
  expect(HTML).toContain("setInterval(retickAgo,")
  // the triage row timestamp carries the epoch so the ticker can re-run ago()
  expect(HTML).toContain('data-ago="${Number(t.createdAt)}"')
})
test("KLA-510: poll skips while a mutation / modal / detail is in flight", () => {
  expect(HTML).toContain("function dashLiveBusy()")
  expect(HTML).toContain("if (window.__klavMutating > 0) return true")
  // tgBulkPatch brackets the network mutation with the guard counter
  expect(HTML).toContain("window.__klavMutating++")
  expect(HTML).toContain("window.__klavMutating--")
})

// ── KLAVITYKLA-511 · new report immediately in New reports ─────────────────────
test("KLA-511: submit busts the triage SWR entry and re-renders", () => {
  expect(HTML).toContain("function swrInvalidate(")
  // inside the widget submit handler
  const on = HTML.indexOf('window.Klavity.on("submit"')
  expect(on).toBeGreaterThan(-1)
  const region = HTML.slice(on, on + 800)
  expect(region).toContain('swrInvalidate("triage:" + _pid)')
  expect(region).toContain("renderTriage()")
})

// ── KLAVITYKLA-512 · accept-as-bug feedback ────────────────────────────────────
test("KLA-512: accept shows a toast with a link into Tickets", () => {
  const i = HTML.indexOf("async function tgAccept(")
  const region = HTML.slice(i, i + 900)
  expect(region).toContain("moved to Open in Tickets")
  expect(region).toContain("openSingleTicket(")
})

// ── KLAVITYKLA-513 · null-priority default = medium, uniformly ─────────────────
test("KLA-513: detail picker defaults missing priority to medium (not urgent)", () => {
  expect(HTML).toContain('const curPri = t.priority || "medium"')
})
test("KLA-513: triage row select uses the same medium default", () => {
  expect(HTML).toContain('s===(t.priority||"medium")')
})

// ── KLAVITYKLA-514 · per-view header ───────────────────────────────────────────
test("KLA-514: greeting is scoped per view (applyViewHeader)", () => {
  expect(HTML).toContain("function applyViewHeader(")
  expect(HTML).toContain("const VIEW_TITLES = {")
  // render() defers to the current view instead of hard-coding the greeting
  expect(HTML).toContain('applyViewHeader(document.body.getAttribute("data-view") || "overview")')
  // setView() re-titles on navigation
  expect(HTML).toContain("if(typeof applyViewHeader==='function')applyViewHeader(v);")
})

// ── KLAVITYKLA-515 · merge always available ────────────────────────────────────
test("KLA-515: merge control moved out of the occurrence timeline", () => {
  expect(HTML).toContain("function buildMergeControl(")
  // #718: the occurrence timeline + merge control are now grouped into one coherent footer.
  expect(HTML).toContain("_footer.appendChild(buildMergeControl(t.id))")
  // the old prompt()-based merge button is gone from the occurrence timeline
  expect(HTML).not.toContain('class="btn btn-ghost btn-sm tkt-occ-merge"')
  expect(HTML).not.toContain('window.prompt("Ticket id to merge')
  // it now uses a searchable picker
  expect(HTML).toContain('class="tkt-merge-input')
})

// ── KLAVITYKLA-516 · synthesized first timeline row ────────────────────────────
test("KLA-516: timeline synthesizes a virtual 'report_received' first row", () => {
  expect(HTML).toContain("report_received:")
  expect(HTML).toContain("function synthFirstItem()")
  expect(HTML).toContain("function buildTimelineSection(ticketId, report)")
  // #707: on the 3-col page the activity timeline mounts INTO the middle column; the panel/legacy
  // layout falls back to appending it below the detail (|| single).
  expect(HTML).toContain("_tlMount.appendChild(buildTimelineSection(t.id, t))")
})

// ── KLAVITYKLA-197 · icon copy-to-AI confirmation ──────────────────────────────
test("KLA-197: icon copy variant shows a toast", () => {
  const i = HTML.indexOf("async function copyTicketToAI(")
  const region = HTML.slice(i, i + 1400)
  expect(region).toContain("klavToast(")
  expect(region).toContain("Copied a fix-ready AI prompt")
})

// ── KLAVITYKLA-518 · thumb-first ticket screenshot ─────────────────────────────
test("KLA-518: ticket detail requests ?thumb=1 first, then upgrades to full", () => {
  const i = HTML.indexOf("async function loadTktShot(")
  const region = HTML.slice(i, i + 2400)
  expect(region).toContain('?thumb=1')
  // lazily upgrades to the full-resolution image afterwards
  expect(region).toContain("Lazily upgrade to the full image")
})
