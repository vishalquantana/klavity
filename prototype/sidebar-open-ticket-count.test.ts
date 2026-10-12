// KD-265: the sidebar "Tickets" badge is the number of OPEN tickets in the whole project (server-side count). It used to mirror
// the "Recent tickets" card, which only sees the newest 50 tickets, so it disagreed with the board (e.g. 21 vs 185).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { reconnectDb, initDb, db, dashboardCounts, invalidateDashboardCache, insertFeedback, updateFeedbackMeta } from "./lib/db"

const dbFile = join(tmpdir(), `klav-sidebar-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
beforeAll(async () => { reconnectDb("file:" + dbFile); await initDb() })

async function ticket(pid: string, status: string, mergedInto: string | null = null) {
  const id = await insertFeedback({ projectId: pid, observation: "t " + status, actorEmail: "u@x.io" })
  await db!.execute({ sql: "UPDATE feedback SET status=?, merged_into=? WHERE id=?", args: [status, mergedInto, id] })
  return id
}

test("openTickets counts every ticket still being worked on — not new, dismissed, done, closed or merged-away", async () => {
  const pid = "proj_open_" + Math.random().toString(36).slice(2)
  for (const s of ["open", "open", "in_progress", "blocked", "ready_for_deployment", "deployed", "qa_review"]) await ticket(pid, s)
  for (const s of ["new", "new", "dismissed", "done", "closed"]) await ticket(pid, s)
  const root = await ticket(pid, "open")
  await ticket(pid, "open", root)                          // folded into another ticket — never counted
  const c = await dashboardCounts(pid)
  expect(c.openTickets).toBe(7 + 1)
})
test("it counts the whole project, not just the newest 50", async () => {
  const pid = "proj_many_" + Math.random().toString(36).slice(2)
  for (let i = 0; i < 60; i++) await ticket(pid, "open")
  expect((await dashboardCounts(pid)).openTickets).toBe(60)
})
test("a status change shows up in the count straight away (cache is invalidated)", async () => {
  const pid = "proj_move_" + Math.random().toString(36).slice(2)
  const a = await ticket(pid, "open"); await ticket(pid, "open")
  expect((await dashboardCounts(pid)).openTickets).toBe(2)
  await updateFeedbackMeta(pid, a, { status: "done" })
  expect((await dashboardCounts(pid)).openTickets).toBe(1)
  invalidateDashboardCache(pid)
})

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
test("the sidebar badge reads the server count and is no longer mirrored from the Recent-tickets card", () => {
  expect(HTML).toContain("state.counts && state.counts.openTickets")
  expect(HTML).toContain('$("navTicketCount")')
  expect(HTML).not.toContain("mirror('ticketCount', 'navTicketCount')")
})

// ── live update: a status change in the UI moves the badge straight away (no waiting for the next poll) ──
function extractFn(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
function makeCounter(openTickets: number | null) {
  const painted: number[] = []
  const state: any = { counts: openTickets == null ? {} : { openTickets } }
  const fn = new Function("state", "syncSidebarCounts", extractFn(HTML, "function openCountOnStatusChange(") + "; return openCountOnStatusChange")(state, () => painted.push(state.counts.openTickets)) as (f: any, t: any, n?: number) => void
  return { state, painted, change: fn }
}
test("moving a ticket between to-do, open, in progress, done and dismissed nudges the open count and repaints the badge", () => {
  const c = makeCounter(10)
  c.change("new", "open");          expect(c.state.counts.openTickets).toBe(11)     // to do -> open: +1
  c.change("open", "in_progress");  expect(c.state.counts.openTickets).toBe(11)     // both open work: unchanged
  c.change("in_progress", "done");  expect(c.state.counts.openTickets).toBe(10)     // finished: -1
  c.change("done", "open");         expect(c.state.counts.openTickets).toBe(11)     // re-opened: +1
  c.change("open", "dismissed");    expect(c.state.counts.openTickets).toBe(10)
  c.change("open", "new");          expect(c.state.counts.openTickets).toBe(9)      // back to to-do: -1
  expect(c.painted).toEqual([11, 10, 11, 10, 9])                                    // repainted only when it moved
})
test("it handles bulk moves (n), undo (swap from/to), unknown status as open, and never goes below zero", () => {
  const c = makeCounter(2)
  c.change("new", "open", 3);  expect(c.state.counts.openTickets).toBe(5)
  c.change("open", "new", 3);  expect(c.state.counts.openTickets).toBe(2)
  c.change(null, "done");      expect(c.state.counts.openTickets).toBe(1)           // a status-less ticket counts as open
  c.change("open", "done", 5); expect(c.state.counts.openTickets).toBe(0)           // clamped
})
test("it does nothing until the server count has loaded", () => {
  const c = makeCounter(null)
  c.change("new", "open")
  expect(c.painted).toEqual([])
})
test("every UI path that changes a status calls it: details dropdown, drag, bulk (+undo), re-open, triage accept", () => {
  const calls = HTML.split("openCountOnStatusChange(").length - 1
  expect(calls).toBeGreaterThanOrEqual(9)                                    // 1 definition + the call sites
  for (const marker of [
    "openCountOnStatusChange(_prevStatus, newStatus)",
    "openCountOnStatusChange(_oldStatus, col.status)",
    "openCountOnStatusChange(col.status, _oldStatus)",
    'prior.forEach(p => openCountOnStatusChange(p.value, newVal))',
    'prior.forEach(p => openCountOnStatusChange(newVal, p.value))',
    'openCountOnStatusChange(t.status, "open")',
    'openCountOnStatusChange("new", "open", removed.length || ids.length)',
    'openCountOnStatusChange("open", "new", removed.length || ids.length)',
  ]) expect(HTML).toContain(marker)
})
