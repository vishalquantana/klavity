// KD-3144: a report still waiting for review (status "new", e.g. Sim Report QPQ-SIM-58) shows Accept and Dismiss
// on BOTH the ticket preview panel and the full ticket page — the same actions as the Sim Reports list.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extract(name: string) {
  const start = html.indexOf("function " + name + "(")
  let i = html.indexOf("{", start), depth = 0
  for (; i < html.length; i++) { if (html[i] === "{") depth++; else if (html[i] === "}" && --depth === 0) break }
  return html.slice(start, i + 1)
}
const actionsHtml = new Function("kicon", `${extract("tktNeedsReview")}\n${extract("tktReviewActionsHtml")}\nreturn tktReviewActionsHtml`)(() => "") as (t: any) => string

test("Accept + Dismiss only for reports waiting for review", () => {
  const h = actionsHtml({ status: "new", simSeqNum: 58 })
  expect(h).toContain('data-act="accept"')
  expect(h).toContain('data-act="dismiss"')
  for (const st of ["open", "in_progress", "done", "dismissed"]) expect(actionsHtml({ status: st })).toBe("")
  expect(actionsHtml(null)).toBe("")
})

test("both the preview panel and the full page render and wire them", () => {
  const render = extract("_renderSingleTicket")
  expect((render.match(/\+ tktReviewActionsHtml\(t\)/g) || []).length).toBe(2)
  expect((render.match(/wireTktReviewActions\(ph, t, id\)/g) || []).length).toBe(2)
})

test("they reuse the Sim Reports list actions; Accept re-renders as Open, Dismiss returns to the list", () => {
  const wire = extract("wireTktReviewActions")
  expect(wire).toContain("await tgAccept([String(id)], null, acc)")
  expect(wire).toContain("await tgDismiss([String(id)], dis)")
  expect(wire).toContain('setStatus("open")')
  expect(wire).toContain("tktRenderReusing(() => _renderSingleTicket(id))")
  expect(wire).toContain('setStatus("dismissed")')
  expect(wire).toContain("closeSingleTicket()")
  // nothing changes locally when the server call fails (tgAccept/tgDismiss show the retry message)
  expect(wire).toContain("if (!res || !res.ok) return")
})

// KD-3144 follow-up: the buttons are ONLY for Sim Reports, and they show on the first (cached) paint.
test("normal tickets never get Accept / Dismiss, even while still new", () => {
  expect(actionsHtml({ status: "new" })).toBe("")                       // human Snap / normal ticket
  expect(actionsHtml({ status: "new", simId: null, simSeqNum: null })).toBe("")
  expect(actionsHtml({ status: "new", simId: "sim_1" })).toContain('data-act="accept"')
  expect(actionsHtml({ status: "new", simSeqNum: 12 })).toContain('data-act="dismiss"')
})

test("Sim Reports rows (from /triage, no status field) are seeded as new so the buttons show at once", () => {
  const cockpit = extract("openReportCockpit")
  expect(cockpit).toContain('!t.status ? { ...t, status: "new" }')
  const seed = extract("_tktSeedFromCaches")
  expect(seed).toContain('status: "new"')
  // seeding a triage row with no status makes it a reviewable Sim Report
  const row = { id: "fb_1", simId: "sim_1", simSeqNum: 7 }
  const seeded = !(row as any).status ? { ...row, status: "new" } : row
  expect(actionsHtml(seeded)).toContain('data-act="accept"')
})
