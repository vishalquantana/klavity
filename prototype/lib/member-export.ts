// prototype/lib/member-export.ts — Member-roster export WITH POLICY (JTBD 5.8 / KLAVITYKLA-287).
//
// Data-governance feature (ties to GDPR / CASA work). Two policy axes, both enforced here so the
// server route stays a thin wire-up and the rules are unit-testable in isolation:
//
//   1. AUTHORIZATION — only an effective project "admin" (i.e. account owner/admin, or an explicit
//      project admin) may export the roster. Plain members and anonymous callers are denied (403).
//   2. FIELD POLICY / PII MINIMIZATION — an export contains ONLY the allow-listed field set
//      (email, role, joined_at, status). Every other attribute a member row may carry — internal ids,
//      who invited them, account/project ids, names, IPs, user-agents, attribution — is dropped and
//      can never leak into the CSV/JSON.
//
// Pure functions (no DB, no network) so the enforcement is hermetically testable.

// The ONLY fields an export may contain, in canonical order (drives the CSV header too).
export const MEMBER_EXPORT_FIELDS = ["email", "role", "joined_at", "status"] as const
export type MemberExportField = (typeof MEMBER_EXPORT_FIELDS)[number]

// Fields that must NEVER appear in an export. Documented for auditors / the CASA evidence pack; the
// allow-list above is what actually enforces exclusion (we only ever copy allow-listed keys), but a
// test asserts none of these survive so a future refactor can't accidentally widen the surface.
export const MEMBER_EXPORT_EXCLUDED_FIELDS = [
  "id", "invited_by", "invitedBy", "account_id", "accountId", "project_id", "projectId",
  "name", "ip", "user_agent", "userAgent", "attribution", "referer", "referrer",
] as const

export type MemberExportAccess = "admin" | "member" | null

// A raw roster row as it comes off the DB (membersOfProject). May carry extra/sensitive keys — the
// policy ignores everything except the allow-listed fields.
export type RawMember = {
  email: string
  role: string
  createdAt: number
  status?: string | null
  [k: string]: unknown
}

// A policy-clean export row: exactly the allow-listed fields, nothing else.
export type MemberExportRow = { email: string; role: string; joined_at: string; status: string }

// AUTHORIZATION policy: only effective admins (owner/admin) may export.
export function canExportMembers(access: MemberExportAccess): boolean {
  return access === "admin"
}

// FIELD policy: project only the allow-listed fields; derive joined_at from createdAt; default status
// to "active" (project_members has no pending state — a row exists iff the member was added).
export function applyMemberExportPolicy(members: RawMember[]): MemberExportRow[] {
  return members.map((m) => ({
    email: String(m.email ?? ""),
    role: String(m.role ?? ""),
    joined_at: Number.isFinite(Number(m.createdAt)) ? new Date(Number(m.createdAt)).toISOString() : "",
    status: m.status != null && String(m.status).trim() !== "" ? String(m.status) : "active",
  }))
}

// RFC-4180 cell quoting + CSV/formula-injection neutralization (a leading =,+,-,@ is prefixed with a
// single quote so spreadsheet apps don't execute it — relevant because email/role are user-supplied).
function csvCell(value: string): string {
  let s = value
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'
  return s
}

export function membersToCsv(rows: MemberExportRow[]): string {
  const header = MEMBER_EXPORT_FIELDS.join(",")
  const lines = rows.map((r) => MEMBER_EXPORT_FIELDS.map((f) => csvCell(String(r[f] ?? ""))).join(","))
  return [header, ...lines].join("\r\n") + "\r\n"
}

export type MemberExportResult =
  | { ok: false; status: 403; error: string }
  | { ok: true; rows: MemberExportRow[] }

// One-call policy gate used by the route: enforce authorization, then field policy.
export function buildMemberExport(access: MemberExportAccess, members: RawMember[]): MemberExportResult {
  if (!canExportMembers(access)) {
    return { ok: false, status: 403, error: "Only owners and admins can export the member list." }
  }
  return { ok: true, rows: applyMemberExportPolicy(members) }
}
