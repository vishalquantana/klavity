// KLA — shared mapping + guards for the project-scoped Tickets API (/api/v1/tickets) and the
// matching MCP tools. The REST routes (server.ts) and the MCP tools (lib/mcp/tools.ts) both build
// their responses from mapTicketToV1 so the two surfaces never drift. These helpers reuse the
// existing lib/db query fns (listTicketsPaginated, feedbackById, labelsForFeedbackBatch, …) — they
// do NOT reimplement any query.
import { projectAccess } from "./db"

export const V1_TICKET_STATUSES = ["new", "open", "in_progress", "done", "dismissed"] as const
export const V1_TICKET_PRIORITIES = ["urgent", "high", "medium", "low"] as const

export type V1Label = { id: string; name: string; color: string }
export type V1Ticket = {
  id: string
  seq_num: number | null
  title: string
  description: string | null
  status: string
  priority: string | null
  assignee: string | null
  source: "sim" | "manual" | "human"
  labels: V1Label[]
  recurrence: number
  created_at: number
  updated_at: number | null
}

// Normalize + validate an assignee email exactly like server.ts's normalizeAssigneeEmail:
// null/undefined/empty → null (no assignee); a malformed value → "" (caller rejects with 400);
// a valid address → the lower-cased email.
export function normalizeV1Assignee(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const email = String(value).trim().toLowerCase()
  if (!email) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ""
}

// Mirror of server.ts canAssignTicketTo: any member may assign to a fellow member; assigning to a
// NON-member requires the actor to be a project admin.
export async function canAssignV1(
  projectId: string,
  actorAccess: "admin" | "member" | null,
  assignee: string | null,
): Promise<boolean> {
  if (!assignee) return true
  if (actorAccess === "admin") return true
  return !!(await projectAccess(assignee, projectId).catch(() => null))
}

// Derive the clean {sim|manual|human} source from a feedback row (works for both the paginated-list
// projection and the feedbackById projection — both carry simId + a raw/normalized `source`).
export function v1TicketSource(row: any): "sim" | "manual" | "human" {
  if (row?.simId != null) return "sim"
  return String(row?.source || "") === "manual" ? "manual" : "human"
}

// The single canonical v1 ticket shape. `row` is either a listTicketsPaginated ticket or a
// feedbackById row; `labels` is the LabelRow[] for that ticket. Internal field names are mapped to
// the stable snake_case API names here so REST + MCP emit identical payloads.
export function mapTicketToV1(row: any, labels: Array<{ id: string; name: string; color: string }> = []): V1Ticket {
  const title = row?.title != null && String(row.title).trim()
    ? String(row.title)
    : (row?.suggestedBug?.title || row?.observation || "Untitled report")
  return {
    id: String(row.id),
    seq_num: row?.seqNum != null ? Number(row.seqNum) : null,
    title: String(title),
    description: row?.observation != null ? String(row.observation) : null,
    status: row?.status != null ? String(row.status) : "open",
    priority: row?.priority != null ? String(row.priority) : null,
    assignee: row?.assignee != null ? String(row.assignee) : null,
    source: v1TicketSource(row),
    labels: (labels || []).map((l) => ({ id: String(l.id), name: String(l.name), color: String(l.color) })),
    recurrence: Number(row?.recurrence ?? row?.recurrenceCount ?? 1),
    created_at: Number(row.createdAt),
    updated_at: row?.updatedAt != null ? Number(row.updatedAt) : null,
  }
}
