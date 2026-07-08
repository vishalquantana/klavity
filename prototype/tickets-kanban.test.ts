import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

test("Tickets view defaults to the board and reuses the shared filter bar", () => {
  expect(html).toContain('let _tktView = "board"')
  expect(html).toContain('id="tktBoardBtn"')
  expect(html).toContain('id="tktFilterBar"')
  expect(html).toContain('id="fbStatus"')
  expect(html).toContain('id="ticketsKanban"')
})

test("Tickets kanban has New, Open, In Progress, and collapsed Closed columns", () => {
  expect(html).toContain('{ key: "new",')
  expect(html).toContain('label: "New"')
  expect(html).toContain('{ key: "open",')
  expect(html).toContain('label: "Open"')
  expect(html).toContain('{ key: "in_progress",')
  expect(html).toContain('label: "In Progress"')
  expect(html).toContain('{ key: "closed",')
  expect(html).toContain('label: "Closed"')
  expect(html).toContain('statuses: ["done", "dismissed"]')
  expect(html).toContain('kanbanKeyForStatus(t.status)')
})

test("Tickets kanban fetch includes all board statuses by default and supports Closed filter", () => {
  expect(html).toContain('return view === "board" ? "new,open,in_progress,done,dismissed" : ""')
  expect(html).toContain('if (_tktFilters.status === "closed") return "done,dismissed"')
  expect(html).toContain('<option value="closed">Closed</option>')
})

test("Dragging a ticket across columns PATCHes feedback status; same-column drag is ignored", () => {
  expect(html).toContain('if (!toKey || fromKey === toKey) return')
  expect(html).toContain('cardEl.setAttribute("draggable", "true")')
  expect(html).toContain('dataTransfer.setData("application/x-klav-ticket-status", col.key)')
  expect(html).toContain('moveTicketColumn(ticketId, fromKey, col.key)')
  expect(html).toContain('fetch(`/api/feedback/${encodeURIComponent(ticketId)}`')
  expect(html).toContain('body: JSON.stringify({ status: col.status })')
})

test("Tickets board and detail expose a member-backed assignee picker", () => {
  expect(html).toContain('id="tktAssigneeOptions"')
  expect(html).toContain("function projectMemberEmails()")
  expect(html).toContain('list="tktAssigneeOptions"')
  expect(html).toContain("assigneePickerHtml(t, true)")
  expect(html).toContain("patchTicketAssignee(ticketId, next)")
  expect(html).toContain('body: JSON.stringify({ assignee: assignee || null, notes: notes || null })')
})
