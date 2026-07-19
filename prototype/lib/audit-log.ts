// Security audit log: durable, append-only record of security-sensitive actions.
// Non-blocking — callers fire-and-forget via logAudit(); a failure never propagates.
// KLAVITYKLA-352
import type { Client } from "@libsql/client"
import { db as sharedDb } from "./db"

export type AuditAction =
  | "login"
  | "member_invite"
  | "member_revoke"
  | "role_change"
  | "connector_create"
  | "connector_update"
  | "connector_delete"
  | "member_export"
  | "gdpr_export"
  | "gdpr_erasure"
  | "project_delete"
  | "account_delete"

export interface AuditEntry {
  action: AuditAction
  actorEmail: string
  targetEmail?: string | null
  projectId?: string | null
  accountId?: string | null
  meta?: Record<string, unknown> | null
  ip?: string | null
}

export interface AuditRow {
  id: string
  created_at: number
  action: string
  actor_email: string
  target_email: string | null
  project_id: string | null
  account_id: string | null
  meta_json: string | null
  ip: string | null
}

function nanoid8(): string {
  const a = new Uint8Array(6)
  crypto.getRandomValues(a)
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function insertAuditLog(entry: AuditEntry, client?: Client): Promise<void> {
  const c = client ?? sharedDb
  if (!c) return
  const id = `aud_${Date.now()}_${nanoid8()}`
  await c.execute({
    sql: `INSERT INTO audit_log
            (id, created_at, action, actor_email, target_email, project_id, account_id, meta_json, ip)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      Date.now(),
      entry.action,
      entry.actorEmail,
      entry.targetEmail ?? null,
      entry.projectId ?? null,
      entry.accountId ?? null,
      entry.meta ? JSON.stringify(entry.meta) : null,
      entry.ip ?? null,
    ],
  })
}

// Fire-and-forget wrapper: never throws, never blocks the caller.
export function logAudit(entry: AuditEntry, client?: Client): void {
  insertAuditLog(entry, client).catch((e: unknown) =>
    console.warn("[audit-log] write failed (non-fatal):", (e as any)?.message ?? e),
  )
}

export interface AuditQueryOpts {
  action?: AuditAction
  actorEmail?: string
  projectId?: string
  accountId?: string
  limit?: number
  offset?: number
  since?: number
}

export async function queryAuditLog(opts: AuditQueryOpts = {}, client?: Client): Promise<AuditRow[]> {
  const c = client ?? sharedDb
  if (!c) return []
  const clauses: string[] = []
  const args: (string | number)[] = []
  if (opts.action) { clauses.push("action = ?"); args.push(opts.action) }
  if (opts.actorEmail) { clauses.push("actor_email = ?"); args.push(opts.actorEmail) }
  if (opts.projectId) { clauses.push("project_id = ?"); args.push(opts.projectId) }
  if (opts.accountId) { clauses.push("account_id = ?"); args.push(opts.accountId) }
  if (opts.since) { clauses.push("created_at >= ?"); args.push(opts.since) }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""
  const limit = Math.min(opts.limit ?? 200, 1000)
  const offset = opts.offset ?? 0
  const res = await c.execute({
    sql: `SELECT * FROM audit_log ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  })
  return res.rows as unknown as AuditRow[]
}

export function auditRowsToCsv(rows: AuditRow[]): string {
  const header = "id,created_at,action,actor_email,target_email,project_id,account_id,meta_json,ip"
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return ""
    const s = String(v)
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const body = rows
    .map((r) =>
      [r.id, r.created_at, r.action, r.actor_email, r.target_email, r.project_id, r.account_id, r.meta_json, r.ip]
        .map(escape)
        .join(","),
    )
    .join("\n")
  return header + "\n" + body
}
