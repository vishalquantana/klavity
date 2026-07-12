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

test("Tickets kanban splits Closed into separate Done and Dismissed columns (KLA-206)", () => {
  expect(html).toContain('{ key: "new",')
  expect(html).toContain('label: "New"')
  expect(html).toContain('{ key: "open",')
  expect(html).toContain('label: "Open"')
  expect(html).toContain('{ key: "in_progress",')
  expect(html).toContain('label: "In Progress"')
  // Done and Dismissed are now distinct columns, each mapping a single status,
  // so a fixed bug and dismissed noise are visually separate and drag can produce either.
  expect(html).toContain('{ key: "done",')
  expect(html).toContain('label: "Done"')
  expect(html).toContain('statuses: ["done"]')
  expect(html).toContain('{ key: "dismissed",')
  expect(html).toContain('label: "Dismissed"')
  expect(html).toContain('statuses: ["dismissed"]')
  // The collapsed "closed" column is gone.
  expect(html).not.toContain('{ key: "closed",')
  expect(html).not.toContain('label: "Closed",         statuses: ["done", "dismissed"]')
  expect(html).toContain('kanbanKeyForStatus(t.status)')
})

test("kanbanKeyForStatus routes done and dismissed to distinct keys (KLA-206)", () => {
  // done maps to the "done" column, dismissed to the "dismissed" column — no shared "closed" key.
  expect(html).toContain('if (status === "done") return "done"')
  expect(html).toContain('if (status === "dismissed") return "dismissed"')
  expect(html).not.toContain('return "closed"')
  // Grid widened to fit the extra column, and both dots are styled.
  expect(html).toContain('grid-template-columns:repeat(5,minmax(0,1fr))')
  expect(html).toContain('.kb-dot-done{')
  expect(html).toContain('.kb-dot-dismissed{')
})

test("Ticket detail status control exposes the full state machine incl. New + Dismissed (KLA-206)", () => {
  // Un-dismissing / re-triaging back to New or Open is one click from detail.
  expect(html).toContain('const statuses = ["new", "open", "in_progress", "done", "dismissed"]')
})

test("Opening single-ticket detail fetches fresh state from GET /api/feedback/:id (KLA-206)", () => {
  // openSingleTicket must GET the ticket and merge onto cached state so stale in-memory
  // list data (status/priority changed elsewhere) is reflected on open.
  expect(html).toContain('async function openSingleTicket(id)')
  expect(html).toContain('_renderSingleTicket(id)')
  expect(html).toContain('fetch("/api/feedback/" + encodeURIComponent(id))')
  expect(html).toContain('state.tickets[ix] = { ...state.tickets[ix], ...fresh }')
})

test("Ticket detail priority editor persists via PATCH and is timeline-tracked (KLA-206)", () => {
  // Priority is editable from detail and the change is logged to the activity timeline.
  expect(html).toContain('class="tkt-pri-sel')
  expect(html).toContain('body: JSON.stringify({ priority: newPri })')
  expect(html).toContain('ticket_priority_changed:')
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

test("Tickets list exposes multi-select and bulk actions", () => {
  expect(html).toContain('bar.id = "tktBulkBar"')
  expect(html).toContain('cbAll.className = "tl-cb-all"')
  expect(html).toContain('cb.className = "tl-cb"')
  expect(html).toContain('/tickets/bulk')
  expect(html).toContain("body.ticketIds = [..._bulkSelected]")
  expect(html).toContain('id="bulkStatus"')
  expect(html).toContain('id="bulkPriority"')
  expect(html).toContain('id="bulkAssignee"')
  expect(html).toContain('id="bulkAssign"')
  expect(html).toContain('id="bulkClearAssignee"')
  expect(html).toContain('id="bulkAddLabel"')
  expect(html).toContain('id="bulkRemoveLabel"')
  expect(html).toContain('id="bulkClose"')
})
