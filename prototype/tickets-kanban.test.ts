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
  // #636: board is a horizontal-scroll flex row (columns keep a fixed width instead of squishing),
  // and both status dots are styled.
  expect(html).toContain('.kanban{display:flex;flex-wrap:nowrap')
  expect(html).toContain('overflow-x:auto')
  // KLA-719: columns now grow to fill (flex:1 1 300px) but never squish below 300px
  // thanks to min-width:300px — the "don't squish" intent is preserved via min-width.
  expect(html).toContain('.kb-col{flex:1 1 300px')
  expect(html).toContain('min-width:300px')
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
  // KLA-562: signature gained an optional `mode` ("panel" default / "full" for deep links).
  expect(html).toContain('async function openSingleTicket(id, mode)')
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
  expect(html).toContain("assigneePickerHtml(t)")
  expect(html).toContain("patchTicketAssignee(ticketId, assignee)")
  expect(html).toContain('body: JSON.stringify({ assignee: assignee || null, notes: notes || null })')
})

test("Tickets list exposes multi-select and bulk actions", () => {
  expect(html).toContain('bar.id = "tktBulkBar"')
  expect(html).toContain('cbAll.className = "tl-cb-all"')
  expect(html).toContain('cb.className = "tl-cb"')
  expect(html).toContain('/tickets/bulk')
  // JTBD 2.14: bulk mutations now route through applyBulkAction (undo-guarded), which reads the
  // current selection into `ids` before PATCHing.
  expect(html).toContain("const ids = [..._bulkSelected]")
  expect(html).toContain("applyBulkAction(projId, body")
  expect(html).toContain('id="bulkStatus"')
  expect(html).toContain('id="bulkPriority"')
  expect(html).toContain('id="bulkAssignee"')
  expect(html).toContain('id="bulkAssign"')
  expect(html).toContain('id="bulkClearAssignee"')
  expect(html).toContain('id="bulkAddLabel"')
  expect(html).toContain('id="bulkRemoveLabel"')
  expect(html).toContain('id="bulkClose"')
})

test("JTBD 2.14: bulk mutations are guarded by an undo toast that restores prior values", () => {
  // Every bulk action shows a result toast with an Undo affordance...
  // #704: signature gained an optional `optimistic` handler for the instant board path.
  expect(html).toContain("async function applyBulkAction(projId, body, onDone, optimistic)")
  expect(html).toContain("function bulkResultToast(")
  expect(html).toContain('class="tg-toast-undo"')
  // ...and undo replays the API's per-ticket `prior` values (grouped by value) rather than guessing.
  expect(html).toContain("async function bulkUndo(projId, prior, field)")
  expect(html).toContain("Array.isArray(data.prior)")
  // Non-reversible label ops get an explicit confirm instead of a silent instant mutation.
  expect(html).toContain("if (!confirm(")
})

test("JTBD 2.14: partial bulk failures are surfaced, not silently dropped", () => {
  // The API's per-ticket failures array is read and rendered as a summary with linkable ticket ids.
  expect(html).toContain("Array.isArray(data.failures)")
  expect(html).toContain("${okCount} updated, ${failedIds.length} failed")
  expect(html).toContain('class="tg-toast-fails"')
  expect(html).toContain("openSingleTicket(id)")
})

test("JTBD 2.14: selection survives pagination and filter changes (clears only on explicit clear/project switch)", () => {
  // Paginate handlers no longer wipe the selection set.
  expect(html).toContain("_tktListState.page--; fetchAndRenderTktList()")
  expect(html).toContain("_tktListState.page++; fetchAndRenderTktList()")
  expect(html).not.toContain("_bulkSelected.clear(); _tktListState.page--")
  expect(html).not.toContain("_bulkSelected.clear(); _tktListState.page++")
  // Filter-change handler no longer clears the selection either.
  expect(html).not.toContain("_bulkSelected.clear()  // filter change clears selection")
})

test("JTBD 2.14: kanban board supports card multi-select feeding the shared bulk bar", () => {
  // Each card carries a hover-revealed checkbox and can be shift-click range-selected...
  expect(html).toContain('class="kb-card-cb"')
  expect(html).toContain("const applyRangeTo = (target, on)")
  expect(html).toContain("ev.shiftKey")
  // ...and the same buildBulkBar drives the board via an onDone/onClear re-render.
  // #704: the board also passes an `optimistic` handler so bulk changes apply instantly.
  expect(html).toContain("buildBulkBar(board, projId, { onDone: rerenderBoard, onClear: rerenderBoard, optimistic: boardBulkOptimistic })")
  expect(html).toContain("syncKbSelectionUi = ()")
})

test("#704: board bulk actions are OPTIMISTIC — apply locally + PATCH in the background, no blocking await", () => {
  // The optimistic handler mutates local state + the DOM and returns a revert closure...
  expect(html).toContain("function boardBulkOptimistic(body, ids)")
  // ...status changes MOVE the card to the target column, priority swaps the sev rail, and the shared
  // card-meta builder repaints the badges — all without a full board rebuild.
  expect(html).toContain("function kbCardMetaHtml(t)")
  expect(html).toContain("function kbSyncColumnCounts()")
  expect(html).toContain("targetList.appendChild(card)")
  expect(html).toContain("meta.innerHTML = kbCardMetaHtml(t)")
  // The PATCH fires in the background (not awaited before the UI updates) and reverts on hard failure.
  expect(html).toContain("async function bulkPatchRequest(projId, ids, body)")
  expect(html).toContain("applied.revertLocal(); klavToast(\"Couldn't update — reverted.\", true)")
  // The optimistic toast keeps the Undo affordance (local revert + background PATCH of prior values).
  expect(html).toContain("function bulkOptimisticToast(count, label, applied, projId)")
  expect(html).toContain("await bulkUndo(projId, priorObjs, applied.field)")
  // The liveness-poll guard (#510) still brackets the in-flight request.
  expect(html).toContain("window.__klavMutating++")
})

test("#690: the description label is ALWAYS 'Description' — never relabeled 'Steps to reproduce'", () => {
  // descriptionBlockHtml no longer sniffs the body for steps; the label is a constant.
  expect(html).toContain('const label = "Description"')
  expect(html).not.toContain('const label = isSteps ? "Steps to reproduce" : "Description"')
  // The inline editor's save path no longer re-derives a Steps-vs-Description label either.
  expect(html).not.toContain('lblEl.textContent = isSteps ? "Steps to reproduce" : "Description"')
})

test("#705: inline description editor auto-grows with the same typography (no fixed 'tiny box')", () => {
  // The textarea grows to its content on input and has no shrinking max-height / fixed min-height.
  expect(html).toContain('ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"')
  expect(html).toContain('ta.addEventListener("input", autoGrow)')
  expect(html).not.toContain("min-height:104px;max-height:360px")
  // Same read-view typography: 14px / 1.5 line-height, pre-wrap, transparent (no reflow on edit).
  expect(html).toContain(".tkt-desc-ta{display:block;width:100%;box-sizing:border-box;background:transparent")
  expect(html).toContain("resize:none;min-height:0;height:auto;overflow:hidden")
  // Optimistic save on blur / Cmd+Enter, Esc cancels.
  expect(html).toContain('ta.addEventListener("blur", () => { if (!done) commit() })')
  expect(html).toContain('ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)')
  expect(html).toContain('if (ev.key === "Escape")')
})
