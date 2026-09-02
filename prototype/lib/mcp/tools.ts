// KLA-550 — MCP tool registry. Each tool wraps the SAME lib functions the v1 REST routes call
// (no HTTP round-trip). Every tool is scoped to the authenticated token's project via requireProject.
// One responsibility: define + execute tools; the JSON-RPC framing lives in ./rpc.
import { runWalkNow } from "../trails-trigger"
import { runAuthorNow, getAuthorSession } from "../trails-author"
import { getWalk, listRecentWalks } from "../trails"
import { buildV1RunStatus, buildV1Report } from "../v1-runs"
import { buildAuthoredRunStatus } from "../v1-authored"
import {
  insertFeedback, updateFeedbackMeta, insertActivity, feedbackById,
  listTicketsPaginated, labelsForFeedbackBatch, labelsForFeedback,
  listTicketComments, insertTicketComment, ticketActivityTimeline,
} from "../db"
import {
  mapTicketToV1, canAssignV1, normalizeV1Assignee, V1_TICKET_STATUSES, V1_TICKET_PRIORITIES,
} from "../v1-tickets"
import { ToolError } from "./tool-error"

// Re-export so existing importers of tools.ts keep working; canonical definition lives in tool-error.ts
// (a dependency-free leaf) so the AutoSim engine can throw ToolError too without an import cycle.
export { ToolError }

// The acting user's email (from the kci_ token) rides in ctx so ticket create/update/comment tools
// attribute activity + notifications to a real actor. Optional so run-only callers stay unaffected.
//
// `access` is the LIVE project membership ("admin"|"member") resolved by the /mcp entrypoint via
// projectAccess() (C1-1). The ticket tools use it for canAssignV1 — a null-access actor (revoked
// member) never reaches here because the entrypoint rejects it, but the tools still refuse to let a
// null actor assign as defense-in-depth.
//
// `hooks` are OPTIONAL side-effect callbacks injected by the server.ts /mcp handler (dependency
// injection to avoid an import cycle: server.ts owns autoCopyFeedback / notifyTicketAssignee /
// pushCommentToLinkedIssues / syncTicketFields / autoCopyOnTriageAccept). The tools call
// ctx.hooks?.onX(...) AFTER their DB writes so MCP create/update/comment fire the SAME tracker +
// notification side effects as the REST routes (C2-2). Pure run-only callers pass no hooks.
export interface McpToolHooks {
  onTicketCreated?(feedbackId: string, info: { priority: string; assignee: string | null; title: string }): void
  onTicketComment?(feedbackId: string, text: string, commentId: string): void
  onTicketUpdated?(feedbackId: string, info: { prevRow: any; meta: Record<string, any> }): void
  // Enrich a ticket row with attachments + replay availability (REST parity for get_ticket, C3-3).
  enrichTicket?(row: any): Promise<{ attachments: Array<{ name: string | null; url: string | null; content_type: string | null }>; replay_url: string | null }>
}
export interface McpToolCtx { projectId: string; email?: string; access?: "admin" | "member" | null; hooks?: McpToolHooks }
export interface McpTool {
  name: string
  description: string
  inputSchema: object
  handler(args: any, ctx: McpToolCtx): Promise<any>
}

// The token's project is authoritative. A tool arg `project_id` must match it (IDOR guard) — this
// throws BEFORE any I/O, so a cross-project call never touches the DB or engine.
function requireProject(args: any, ctx: McpToolCtx): string {
  const p = String(args?.project_id || "")
  if (!p) throw new ToolError("project_id is required")
  if (p !== ctx.projectId) throw new ToolError("project_id does not match the authenticated token's project")
  return p
}

// The acting user email from the token. Ticket create/update/comment tools attribute to it.
function actor(ctx: McpToolCtx): string {
  return String(ctx.email || "")
}

// Coerce a pagination arg to a finite integer (C3-1). NaN/Infinity/garbage → null so the caller
// rejects with a ToolError instead of passing a poisoned LIMIT/OFFSET binding to the DB.
function finiteIntArg(v: unknown, dflt: number): number | null {
  if (v === undefined || v === null || v === "") return dflt
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

// Load a ticket scoped to the token's project. feedbackById is project-scoped, so a cross-project
// ticket id resolves to null → thrown as an unknown-id error (IDOR guard, mirrors the REST 404).
async function loadOwnedTicket(project: string, id: string): Promise<any> {
  const fid = String(id || "")
  if (!fid) throw new ToolError("ticket_id is required")
  const row = await feedbackById(project, fid).catch(() => null)
  if (!row || String(row.projectId) !== project) throw new ToolError("unknown ticket_id")
  return row
}

export const MCP_TOOLS: McpTool[] = [
  {
    name: "start_qa_run",
    description: "Start an AutoSim walk of an existing Trail. Returns a run_id immediately; poll get_qa_run.",
    inputSchema: { type: "object", required: ["project_id", "trail_id"], properties: {
      project_id: { type: "string" }, trail_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const trailId = String(args.trail_id || "")
      if (!trailId) throw new ToolError("trail_id is required")
      const { runId } = await runWalkNow(project, trailId)
      return { run_id: runId, status: "queued" }
    },
  },
  {
    name: "start_authored_run",
    description: "Start an objective-driven AutoSim: give a URL + natural-language objective, no pre-authored Trail. Returns an authored_run_id; poll get_authored_run.",
    inputSchema: { type: "object", required: ["project_id", "target_url", "objective"], properties: {
      project_id: { type: "string" }, target_url: { type: "string" }, objective: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const objective = String(args.objective || "").trim()
      const baseUrl = String(args.target_url || "").trim()
      if (objective.length < 10) throw new ToolError("objective must be at least 10 chars")
      if (!/^https?:\/\//i.test(baseUrl)) throw new ToolError("target_url must be an http(s) URL")
      const { sessionId } = await runAuthorNow(project, { name: objective.slice(0, 80), objective, baseUrl } as any)
      return { authored_run_id: sessionId, status: "authoring" }
    },
  },
  {
    name: "get_qa_run",
    description: "Get the status/verdict of an AutoSim run by run_id.",
    inputSchema: { type: "object", required: ["project_id", "run_id"], properties: {
      project_id: { type: "string" }, run_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const walk = await getWalk(project, String(args.run_id || ""))
      if (!walk) throw new ToolError("unknown run_id")
      return await buildV1RunStatus(project, walk, null)
    },
  },
  {
    name: "get_qa_report",
    description: "Fetch the structured, AI-consumable bug report for a completed run. Paginated via cursor.",
    inputSchema: { type: "object", required: ["project_id", "run_id"], properties: {
      project_id: { type: "string" }, run_id: { type: "string" }, cursor: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const walk = await getWalk(project, String(args.run_id || ""))
      if (!walk) throw new ToolError("unknown run_id")
      return await buildV1Report(project, walk, { baseUrl: "", cursor: args.cursor ?? null })
    },
  },
  {
    name: "get_authored_run",
    description: "Get the status of an objective-driven authored run (its trail_id + verification_run_id once it completes).",
    inputSchema: { type: "object", required: ["project_id", "authored_run_id"], properties: {
      project_id: { type: "string" }, authored_run_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const s = await getAuthorSession(project, String(args.authored_run_id || ""))
      if (!s) throw new ToolError("unknown authored_run_id")
      return buildAuthoredRunStatus(s)
    },
  },
  {
    name: "list_qa_runs",
    description: "List recent AutoSim runs for the project.",
    inputSchema: { type: "object", required: ["project_id"], properties: { project_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const walks = await listRecentWalks(project)
      const runs = await Promise.all(walks.map(w => buildV1RunStatus(project, w, null)))
      return { runs }
    },
  },
  {
    name: "list_tickets",
    description: "List the project's tickets (bugs/reports). Filter by status, priority, assignee, source (sim|manual|human), label, or free-text q. Paginated.",
    inputSchema: { type: "object", required: ["project_id"], properties: {
      project_id: { type: "string" },
      status: { type: "string", description: "Comma-separated statuses (new|open|in_progress|done|dismissed)" },
      priority: { type: "string", description: "Comma-separated priorities (urgent|high|medium|low)" },
      assignee: { type: "string", description: "Exact assignee email; empty string = unassigned" },
      source: { type: "string", enum: ["sim", "manual", "human"] },
      label: { type: "string" }, q: { type: "string" },
      page: { type: "integer" }, limit: { type: "integer" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const statuses = args.status ? String(args.status).split(",").map((s: string) => s.trim()).filter(Boolean) : []
      const priorities = args.priority ? String(args.priority).split(",").map((s: string) => s.trim()).filter(Boolean) : []
      const assignee = args.assignee !== undefined ? String(args.assignee) : undefined
      const rawSource = String(args.source || "")
      const source = rawSource === "sim" ? "sim" : rawSource === "manual" ? "manual" : rawSource === "human" ? "human" : undefined
      const label = args.label ? String(args.label).trim() : undefined
      const search = args.q ? String(args.q).trim().slice(0, 500) : undefined
      const pageRaw = finiteIntArg(args.page, 1)
      const limitRaw = finiteIntArg(args.limit, 50)
      if (pageRaw === null || limitRaw === null) throw new ToolError("page and limit must be finite numbers")
      const page = Math.min(100_000, Math.max(1, pageRaw))
      const limit = Math.min(200, Math.max(1, limitRaw))
      const result = await listTicketsPaginated(project, { statuses, priorities, assignee, source, label, search, page, limit })
      const ids = result.tickets.map((t: any) => t.id)
      const labelsMap = await labelsForFeedbackBatch(ids)
      const tickets = result.tickets.map((t: any) => mapTicketToV1(t, labelsMap[t.id] || []))
      return { tickets, total: result.total, page: result.page, limit }
    },
  },
  {
    name: "get_ticket",
    description: "Get a single ticket by ticket_id (clean shape + labels).",
    inputSchema: { type: "object", required: ["project_id", "ticket_id"], properties: {
      project_id: { type: "string" }, ticket_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const row = await loadOwnedTicket(project, args.ticket_id)
      const labels = await labelsForFeedback(row.id)
      const commentsCount = (await listTicketComments(row.id).catch(() => [])).length
      const base = { ...mapTicketToV1(row, labels), comments_count: commentsCount }
      // C3-3 REST parity: enrich with attachments + replay availability via the injected hook (the
      // presign/replay logic lives in server.ts). Falls back to the clean shape if no hook is wired.
      if (ctx.hooks?.enrichTicket) {
        const extra = await ctx.hooks.enrichTicket(row).catch(() => ({ attachments: [], replay_url: null }))
        return { ...base, attachments: extra.attachments, replay_url: extra.replay_url }
      }
      return base
    },
  },
  {
    name: "create_ticket",
    description: "Create a ticket. title required; assignee (email) required. Priority defaults to medium.",
    inputSchema: { type: "object", required: ["project_id", "title", "assignee"], properties: {
      project_id: { type: "string" }, title: { type: "string" }, description: { type: "string" },
      priority: { type: "string", enum: ["urgent", "high", "medium", "low"] }, assignee: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const me = actor(ctx)
      // C1-1: the LIVE access resolved by the /mcp entrypoint. A null-access actor never reaches here
      // (entrypoint 403s a revoked member), and canAssignV1 refuses to let a null actor assign.
      const access = ctx.access ?? null
      const title = String(args.title || "").trim()
      if (!title) throw new ToolError("title is required")
      if (title.length > 500) throw new ToolError("title must be 500 characters or fewer")
      const description = String(args.description || "").trim()
      if (description.length > 5000) throw new ToolError("description must be 5000 characters or fewer")
      const priority = (V1_TICKET_PRIORITIES as readonly string[]).includes(args.priority) ? args.priority : "medium"
      const assignee = normalizeV1Assignee(args.assignee)
      if (assignee === "") throw new ToolError("assignee must be a valid email address")
      if (!assignee) throw new ToolError("assignee is required")
      if (!(await canAssignV1(project, access, assignee))) throw new ToolError("Only project admins can assign tickets to non-members")
      const id = await insertFeedback({
        projectId: project, actorEmail: me || null, observation: description || null,
        title, priority, assignee: assignee || null, source: "manual", reportType: "bug",
      })
      // insertFeedback does not persist the assignee column — set it (and open status) here.
      await updateFeedbackMeta(project, id, { status: "open", assignee: assignee || null })
      await insertActivity({ projectId: project, type: "ticket_created", actorEmail: me || null, feedbackId: id, meta: { title, priority, source: "manual" } }).catch(() => {})
      // C2-2: same side effects as REST create — autoCopyFeedback + assignee notification.
      ctx.hooks?.onTicketCreated?.(id, { priority, assignee: assignee || null, title })
      return { ticket_id: id }
    },
  },
  {
    name: "update_ticket",
    description: "Update a ticket: status (new|open|in_progress|done|dismissed), priority, assignee, notes, description.",
    inputSchema: { type: "object", required: ["project_id", "ticket_id"], properties: {
      project_id: { type: "string" }, ticket_id: { type: "string" },
      status: { type: "string", enum: ["new", "open", "in_progress", "done", "dismissed"] },
      priority: { type: "string", enum: ["urgent", "high", "medium", "low"] },
      assignee: { type: "string" }, notes: { type: "string" }, description: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const me = actor(ctx)
      const access = ctx.access ?? null // C1-1: live membership from the entrypoint (see create_ticket).
      const row = await loadOwnedTicket(project, args.ticket_id)
      if (args.status !== undefined && !(V1_TICKET_STATUSES as readonly string[]).includes(args.status)) {
        throw new ToolError(`status must be one of: ${V1_TICKET_STATUSES.join(", ")}`)
      }
      if (args.priority !== undefined && args.priority !== null && !(V1_TICKET_PRIORITIES as readonly string[]).includes(args.priority)) {
        throw new ToolError(`priority must be one of: ${V1_TICKET_PRIORITIES.join(", ")}`)
      }
      const meta: any = {}
      if (args.status !== undefined) meta.status = args.status
      if (args.notes !== undefined) meta.notes = args.notes ?? null
      if (args.priority !== undefined) meta.priority = args.priority ?? null
      if (args.description !== undefined) {
        if (args.description !== null && typeof args.description !== "string") throw new ToolError("description must be a string or null")
        meta.observation = args.description == null ? null : String(args.description).slice(0, 20000)
      }
      if (args.assignee !== undefined) {
        const assignee = normalizeV1Assignee(args.assignee)
        if (assignee === "") throw new ToolError("assignee must be a valid email address")
        if (!(await canAssignV1(project, access, assignee))) throw new ToolError("Only project admins can assign tickets to non-members")
        meta.assignee = assignee
      }
      const updated = await updateFeedbackMeta(project, row.id, meta)
      if (!updated) throw new ToolError("update failed")
      const writes: Promise<any>[] = []
      if (meta.status !== undefined && meta.status !== row.status) writes.push(insertActivity({ projectId: project, type: "ticket_status_changed", actorEmail: me || null, feedbackId: row.id, meta: { from: row.status, to: meta.status } }).catch(() => {}))
      if (meta.priority !== undefined && meta.priority !== row.priority) writes.push(insertActivity({ projectId: project, type: "ticket_priority_changed", actorEmail: me || null, feedbackId: row.id, meta: { from: row.priority, to: meta.priority } }).catch(() => {}))
      if (meta.assignee !== undefined && meta.assignee !== row.assignee) writes.push(insertActivity({ projectId: project, type: "ticket_assignee_changed", actorEmail: me || null, feedbackId: row.id, meta: { from: row.assignee, to: meta.assignee } }).catch(() => {}))
      if (writes.length) await Promise.all(writes)
      // C2-2: same side effects as REST PATCH — syncTicketFields (priority) + assignee notification +
      // autoCopyOnTriageAccept (status). The hook receives the pre-update row + the applied meta.
      ctx.hooks?.onTicketUpdated?.(row.id, { prevRow: row, meta })
      const fresh = (await feedbackById(project, row.id).catch(() => null)) || row
      const labels = await labelsForFeedback(row.id).catch(() => [])
      return { ok: true, ticket: mapTicketToV1(fresh, labels) }
    },
  },
  {
    name: "list_comments",
    description: "List the comments on a ticket.",
    inputSchema: { type: "object", required: ["project_id", "ticket_id"], properties: {
      project_id: { type: "string" }, ticket_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const row = await loadOwnedTicket(project, args.ticket_id)
      const comments = (await listTicketComments(row.id)).map(c => ({ id: c.id, author: c.author, body: c.body, created_at: c.createdAt }))
      return { ticket_id: row.id, comments }
    },
  },
  {
    name: "add_comment",
    description: "Add a comment to a ticket.",
    inputSchema: { type: "object", required: ["project_id", "ticket_id", "body"], properties: {
      project_id: { type: "string" }, ticket_id: { type: "string" }, body: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const me = actor(ctx)
      const row = await loadOwnedTicket(project, args.ticket_id)
      const text = String(args.body || "").trim()
      if (!text) throw new ToolError("body is required")
      if (text.length > 5000) throw new ToolError("body must be 5000 characters or fewer")
      const comment = await insertTicketComment(row.id, me || null, text)
      // C2-2: same side effect as REST comment — push to every linked external tracker.
      ctx.hooks?.onTicketComment?.(row.id, text, comment.id)
      return { comment: { id: comment.id, author: comment.author, body: comment.body, created_at: comment.createdAt } }
    },
  },
  {
    name: "get_ticket_activity",
    description: "Get a ticket's merged comment/activity/connector-export timeline.",
    inputSchema: { type: "object", required: ["project_id", "ticket_id"], properties: {
      project_id: { type: "string" }, ticket_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const row = await loadOwnedTicket(project, args.ticket_id)
      const events = await ticketActivityTimeline(project, row.id)
      return { ticket_id: row.id, events }
    },
  },
]

export function getTool(name: string): McpTool | undefined {
  return MCP_TOOLS.find(t => t.name === name)
}
