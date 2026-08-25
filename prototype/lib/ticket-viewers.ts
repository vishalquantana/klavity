// Shared-ticket viewer onboarding — access resolution + per-ticket grants.
// The canonical share URL /t/:ref branches on ticketViewAccess(); the teaser is redacted server-side
// so a no-access caller never receives the description/screenshot. Viewers are free & unlimited and
// (in Phase 1) always per-ticket — a project-wide 'viewer' row is Phase 2 (auto_join/upgrade).
import { db, projectById, projectAccess, normalizeShareMode } from "./db"

export type TicketViewAccess = "full" | "teaser" | "pending" | "login"

// Grant (or re-affirm) a per-ticket viewer. Idempotent on (feedback_id,email): a repeat grant updates
// the status (e.g. pending_approval → active on admin approve, Phase 2) rather than erroring.
export async function grantTicketViewer(input: {
  feedbackId: string
  projectId: string
  email: string
  status?: "active" | "pending_approval"
  grantedBy?: string | null
}): Promise<void> {
  const email = String(input.email || "").trim().toLowerCase()
  const status = input.status ?? "active"
  await db!.execute({
    sql: `INSERT INTO ticket_viewers (id,feedback_id,project_id,email,status,granted_by,created_at)
          VALUES (?,?,?,?,?,?,?)
          ON CONFLICT(feedback_id,email) DO UPDATE SET status=excluded.status`,
    args: ["tv_" + crypto.randomUUID(), input.feedbackId, input.projectId, email, status, input.grantedBy ?? null, Date.now()],
  })
}

export async function ticketViewerStatus(feedbackId: string, email: string): Promise<"active" | "pending_approval" | null> {
  const r = await db!.execute({
    sql: "SELECT status FROM ticket_viewers WHERE feedback_id=? AND email=? LIMIT 1",
    args: [feedbackId, String(email || "").trim().toLowerCase()],
  })
  if (!r.rows.length) return null
  return String((r.rows[0] as any).status) === "pending_approval" ? "pending_approval" : "active"
}

export async function isActiveTicketViewer(feedbackId: string, email: string): Promise<boolean> {
  return (await ticketViewerStatus(feedbackId, email)) === "active"
}

// The access matrix (spec §3/§13). sessionEmail may be null (anon).
export async function ticketViewAccess(feedbackId: string, sessionEmail: string | null): Promise<TicketViewAccess> {
  const fb = await db!.execute({ sql: "SELECT project_id FROM feedback WHERE id=? LIMIT 1", args: [feedbackId] })
  if (!fb.rows.length) return "login" // unknown ticket — safest; the /t/:ref route 404s before rendering
  const projectId = String((fb.rows[0] as any).project_id)
  const email = sessionEmail ? String(sessionEmail).trim().toLowerCase() : null

  if (email) {
    // 1) Project member/admin → always full (projectAccess returns null for a 'viewer' row — Task 3).
    if (await projectAccess(email, projectId)) return "full"
    // 2) Project-wide viewer (Phase 2 auto_join/upgrade creates these) → full.
    const pv = await db!.execute({
      sql: "SELECT 1 FROM project_members WHERE project_id=? AND email=? AND project_role='viewer' LIMIT 1",
      args: [projectId, email],
    })
    if (pv.rows.length) return "full"
    // 3) Per-ticket grant.
    const tv = await ticketViewerStatus(feedbackId, email)
    if (tv === "active") return "full"
    if (tv === "pending_approval") return "pending"
  }

  // 4) No access → branch on the project's share_mode.
  const proj = await projectById(projectId)
  const mode = normalizeShareMode(proj?.shareMode)
  if (mode === "public") return "full"
  if (mode === "off") return "login"
  return "teaser" // teaser | approval | auto_join all show the teaser to a no-access caller
}
