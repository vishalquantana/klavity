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
