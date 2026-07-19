// ── First-class member invites + invite visibility (JTBD 6.4 / KLAVITYKLA-294) ──
//
// Klavity already had two durable stores that, together, model a "pending member":
//   • project_members            → the durable membership row: role, invited_by, created_at(=invited_at)
//   • ticket_assignment_invites  → the invite LIFECYCLE: status(pending|accepted), last_sent_at(resend),
//                                  accepted_at. Its accept path (acceptPendingTicketAssignmentInvites,
//                                  fired on login) flips status→accepted and preserves the invited role
//                                  because addProjectMember uses ON CONFLICT DO NOTHING.
//
// This module adds the READ + REVOKE surface that made invites "first-class": list who's invited with
// their pending/accepted status, and hard-revoke a still-pending invite. It intentionally does NOT add
// any schema — it composes the two existing tables (KLA-314 owns migrations this round).
//
// A project_members row with a matching pending ticket_assignment_invites row = a PENDING member.
// A project_members row with no invite row, or an accepted one = an ACCEPTED (active) member.
import { db } from "./db"

export type MemberInvite = {
  email: string
  role: "admin" | "member"
  status: "pending" | "accepted"
  invitedBy: string | null
  invitedAt: number
  lastSentAt: number | null
  acceptedAt: number | null
}

// List every roster member of a project with a derived invite status. Members present in
// project_members but with no invite record (e.g. the owner, or seed members) are reported as
// 'accepted' — they are active, not awaiting anything.
export async function listProjectInvites(projectId: string): Promise<MemberInvite[]> {
  const r = await db!.execute({
    sql: `SELECT pm.email        AS email,
                 pm.project_role AS role,
                 pm.invited_by   AS invited_by,
                 pm.created_at   AS invited_at,
                 tai.status      AS inv_status,
                 tai.last_sent_at AS last_sent_at,
                 tai.accepted_at  AS accepted_at
          FROM project_members pm
          LEFT JOIN ticket_assignment_invites tai
            ON tai.project_id = pm.project_id AND tai.email = pm.email
          WHERE pm.project_id = ?
          ORDER BY pm.created_at ASC`,
    args: [projectId],
  })
  return r.rows.map((x: any) => ({
    email: String(x.email),
    role: String(x.role) === "admin" ? "admin" : "member",
    // A pending invite row means "not yet accepted". No row (or accepted) means active.
    status: String(x.inv_status || "") === "pending" ? "pending" : "accepted",
    invitedBy: x.invited_by != null ? String(x.invited_by) : null,
    invitedAt: Number(x.invited_at),
    lastSentAt: x.last_sent_at != null ? Number(x.last_sent_at) : null,
    acceptedAt: x.accepted_at != null ? Number(x.accepted_at) : null,
  }))
}

// Fetch a single still-pending invite (used to guard resend/revoke). Returns null if the person
// has no pending invite on this project (already accepted, never invited, or unknown).
export async function getPendingInvite(projectId: string, email: string): Promise<MemberInvite | null> {
  const norm = email.trim().toLowerCase()
  const all = await listProjectInvites(projectId)
  return all.find(m => m.email === norm && m.status === "pending") || null
}

// Hard-revoke a still-pending invite: drop both the lifecycle row and the (not-yet-accepted)
// membership row so the person disappears from the roster entirely. No-op + false if there is no
// pending invite for this email (never silently removes an accepted/active member).
export async function revokeProjectInvite(projectId: string, email: string): Promise<boolean> {
  const norm = email.trim().toLowerCase()
  const pending = await getPendingInvite(projectId, norm)
  if (!pending) return false
  await db!.execute({
    sql: "DELETE FROM ticket_assignment_invites WHERE project_id=? AND email=? AND status='pending'",
    args: [projectId, norm],
  })
  await db!.execute({
    sql: "DELETE FROM project_members WHERE project_id=? AND email=?",
    args: [projectId, norm],
  })
  return true
}
