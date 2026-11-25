// KD-983: a ticket opened right after it was filed from the widget showed no Jira link until a page
// refresh. Autofile runs in the background (AI title first, then the tracker create), so the open-ticket
// fetch landed before the export existed and nothing ever asked again.
//
// The fix: the server marks the ticket export-pending from the moment it is saved until the export
// settles, GET /api/feedback/:id reports it as `exportPending`, and the open ticket re-checks while it is
// pending, swapping in only the badge strip so a half-typed comment is never rebuilt (KD-239).
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const SERVER = await Bun.file(import.meta.dir + "/server.ts").text()

const fnBody = (src: string, header: string) => {
  const i = src.indexOf(header)
  expect(i).toBeGreaterThan(-1)
  return src.slice(i, i + 4000)
}

test("the single-ticket read reports whether the background export is still running", () => {
  expect(SERVER).toContain("exportPending: isExportInflight(fid)")
})

test("autoCopyFeedback marks the ticket pending and always clears it when done", () => {
  const body = fnBody(SERVER, "function autoCopyFeedback(")
  expect(body).toContain("markExportInflight(feedbackId)")
  const full = SERVER.slice(SERVER.indexOf("function autoCopyFeedback("), SERVER.indexOf("function autoCopyOnTriageAccept("))
  expect(full).toMatch(/finally \{\s*clearExportInflight\(feedbackId\)/)
})

test("widget autofile is pending from save time, since the AI title runs before the export", () => {
  expect(SERVER).toContain("if (willAutofile) markExportInflight(fbEnrichId)")
  // every autofile no-op path clears it, so a review-mode / Sim ticket never shows "Filing…"
  const body = fnBody(SERVER, "function autoFileHumanSnap(")
  expect(body).toContain("if (simId) { clearExportInflight(feedbackId); return }")
  expect(body).toContain('if (mode !== "autofile") { clearExportInflight(feedbackId); return }')
})

test("pending entries self-expire so a missed clear can't leave a ticket pending forever", () => {
  const body = fnBody(SERVER, "function isExportInflight(")
  expect(body).toContain("exp < Date.now()")
  expect(SERVER).toMatch(/const EXPORT_INFLIGHT_TTL_MS = \d/)
})

test("opening a pending ticket starts the re-check", () => {
  const body = fnBody(HTML, "async function openSingleTicket(")
  expect(body).toContain("if (fresh.exportPending) pollTicketExports(id)")
})

test("the re-check swaps only the badge strip, never re-rendering the whole ticket", () => {
  const body = fnBody(HTML, "function pollTicketExports(")
  expect(body).toContain("__setExports(exportsNow, pending)")
  expect(body).not.toContain("_renderSingleTicket(")
  // stops once the export settles, and is bounded
  expect(body).toContain("if (pending) pollTicketExports(id, attempt + 1)")
  expect(body).toContain("if (attempt >= TKT_EXPORT_POLL_MAX) return")
  // stops when the ticket is closed or a different one is open
  expect(body).toContain("if (!openDetail()) return")
})

test("the badge strip is drawn by one renderer, re-used for the in-place swap, with Retry re-wired", () => {
  expect(HTML).toContain("let badgesHtml = exportBadgesHtml(exports, !!t.exportPending)")
  const setter = fnBody(HTML, "detailEl.__setExports = (list, pending) => {")
  expect(setter).toContain("box.innerHTML = exportBadgesHtml(list || [], !!pending)")
  expect(setter).toContain("wireExportRetries()")
})

test("while pending (and nothing filed yet) the strip says the ticket is being filed", () => {
  const body = fnBody(HTML, "const exportBadgesHtml = (list, pending) => {")
  expect(body).toContain('pending && !list.some(exp => exp.status === "ok")')
  expect(body).toContain('class="exp-badge exp-pending"')
})
