// lib/deleted-tickets.ts — "Deleted tickets" recycle bin (view + restore).
//
// Deleting a ticket still HARD-deletes it exactly as before (deleteTicketsBulk), so every existing ticket
// query, count and export keeps behaving the same. What's new: in the SAME write batch, a full copy of the
// ticket row and its per-ticket rows is stored in `deleted_tickets`, so it can be listed and restored.
//
// Restore re-inserts the saved rows (only the columns that still exist in the current schema) and re-links
// the ticket's submission keys. Pending export jobs (export_outbox / export_requests) are deliberately NOT
// restored — they would silently re-send the ticket to Jira/Linear/etc. Entries expire after RETENTION_DAYS.

import type { Client, InStatement } from "@libsql/client"

export const RETENTION_DAYS = 30
const RETENTION_MS = RETENTION_DAYS * 86_400_000

/** Per-ticket tables (all keyed by feedback_id) copied on delete and put back on restore. */
export const RESTORABLE_CHILD_TABLES = [
  "ticket_comments", "ticket_labels", "ticket_exports", "activity_events", "feedback_occurrences",
  "feedback_replays", "ticket_viewers", "ticket_assignment_invites",
] as const

type Row = Record<string, unknown>
export interface TicketSnapshot {
  v: 1
  feedback: Row
  children: Record<string, Row[]>
  submissionKeys: string[]
}
export interface DeletedTicket {
  feedbackId: string
  seqNum: number | null
  title: string
  status: string | null
  priority: string | null
  deletedBy: string | null
  deletedAt: number
  expiresAt: number
}

// ── schema (idempotent, additive) ───────────────────────────────────────────────────────────
const ensured = new WeakSet<Client>()
export async function ensureDeletedTicketsTable(c: Client): Promise<void> {
  if (ensured.has(c)) return
  await c.execute(
    `CREATE TABLE IF NOT EXISTS deleted_tickets (
       project_id TEXT NOT NULL,
       feedback_id TEXT NOT NULL,
       seq_num INTEGER,
       title TEXT,
       deleted_by TEXT,
       deleted_at INTEGER NOT NULL,
       snapshot_json TEXT NOT NULL,
       PRIMARY KEY (project_id, feedback_id)
     )`,
  )
  await c.execute("CREATE INDEX IF NOT EXISTS deleted_tickets_proj_idx ON deleted_tickets (project_id, deleted_at)")
  ensured.add(c)
}

// ── JSON-safe values (BLOBs / bigints survive the round trip) ───────────────────────────────
function encodeValue(v: unknown): unknown {
  if (typeof v === "bigint") return { $big: v.toString() }
  if (v instanceof ArrayBuffer) return { $b64: Buffer.from(new Uint8Array(v)).toString("base64") }
  if (ArrayBuffer.isView(v)) return { $b64: Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString("base64") }
  return v
}
function decodeValue(v: any): any {
  if (v && typeof v === "object") {
    if (typeof v.$big === "string") return BigInt(v.$big)
    if (typeof v.$b64 === "string") return new Uint8Array(Buffer.from(v.$b64, "base64"))
  }
  return v
}
function plainRow(r: any, columns: string[]): Row {
  const o: Row = {}
  for (const col of columns) o[col] = encodeValue(r[col])
  return o
}

/** One-line label for the list: the ticket's title, falling back to its observation text. */
export function ticketTitleOf(f: Row): string {
  const t = String((f.title as string) || (f.observation as string) || "").replace(/\s+/g, " ").trim()
  return t.length > 160 ? t.slice(0, 157) + "…" : t || "Untitled ticket"
}

async function safeSelect(c: Client, sql: string, args: any[]): Promise<{ rows: any[]; columns: string[] }> {
  try {
    const r = await c.execute({ sql, args })
    return { rows: r.rows as any[], columns: r.columns as string[] }
  } catch { return { rows: [], columns: [] } } // a table missing on an older schema just isn't copied
}

/**
 * Read everything needed to restore `ids` later and return the INSERT statements that store it.
 * The caller puts them in the SAME batch as the delete, so a ticket is never gone without a copy.
 */
export async function snapshotStatements(c: Client, projectId: string, ids: string[], actor: string | null, now = Date.now()): Promise<InStatement[]> {
  if (!ids.length) return []
  await ensureDeletedTicketsTable(c)
  const q = ids.map(() => "?").join(",")
  const fb = await safeSelect(c, `SELECT * FROM feedback WHERE project_id=? AND id IN (${q})`, [projectId, ...ids])
  const children: Record<string, Map<string, Row[]>> = {}
  for (const table of RESTORABLE_CHILD_TABLES) {
    const r = await safeSelect(c, `SELECT * FROM ${table} WHERE feedback_id IN (${q})`, ids)
    const byId = new Map<string, Row[]>()
    for (const row of r.rows) {
      const fid = String(row.feedback_id)
      if (!byId.has(fid)) byId.set(fid, [])
      byId.get(fid)!.push(plainRow(row, r.columns))
    }
    children[table] = byId
  }
  const keys = await safeSelect(c, `SELECT feedback_id, submission_key FROM submission_keys WHERE project_id=? AND feedback_id IN (${q})`, [projectId, ...ids])
  const stmts: InStatement[] = []
  for (const row of fb.rows) {
    const id = String(row.id)
    const feedback = plainRow(row, fb.columns)
    const snap: TicketSnapshot = {
      v: 1,
      feedback,
      children: Object.fromEntries(RESTORABLE_CHILD_TABLES.map((t) => [t, children[t].get(id) || []])),
      submissionKeys: keys.rows.filter((k) => String(k.feedback_id) === id).map((k) => String(k.submission_key)),
    }
    stmts.push({
      sql: `INSERT INTO deleted_tickets (project_id, feedback_id, seq_num, title, deleted_by, deleted_at, snapshot_json)
            VALUES (?,?,?,?,?,?,?)
            ON CONFLICT(project_id, feedback_id) DO UPDATE SET seq_num=excluded.seq_num, title=excluded.title,
              deleted_by=excluded.deleted_by, deleted_at=excluded.deleted_at, snapshot_json=excluded.snapshot_json`,
      args: [projectId, id, row.seq_num != null ? Number(row.seq_num) : null, ticketTitleOf(feedback), actor, now, JSON.stringify(snap)],
    })
  }
  return stmts
}

/** Drop bin entries older than the retention window. */
export async function purgeExpiredDeletedTickets(c: Client, projectId: string, now = Date.now()): Promise<void> {
  await ensureDeletedTicketsTable(c)
  await c.execute({ sql: "DELETE FROM deleted_tickets WHERE project_id=? AND deleted_at < ?", args: [projectId, now - RETENTION_MS] })
}

export async function listDeletedTickets(c: Client, projectId: string, now = Date.now()): Promise<DeletedTicket[]> {
  await purgeExpiredDeletedTickets(c, projectId, now)
  const r = await c.execute({
    sql: "SELECT feedback_id, seq_num, title, deleted_by, deleted_at, snapshot_json FROM deleted_tickets WHERE project_id=? ORDER BY deleted_at DESC LIMIT 500",
    args: [projectId],
  })
  return r.rows.map((x: any) => {
    let f: Row = {}
    try { f = (JSON.parse(String(x.snapshot_json)) as TicketSnapshot).feedback || {} } catch { /* keep defaults */ }
    const deletedAt = Number(x.deleted_at)
    return {
      feedbackId: String(x.feedback_id),
      seqNum: x.seq_num != null ? Number(x.seq_num) : null,
      title: String(x.title || "Untitled ticket"),
      status: f.status != null ? String(f.status) : null,
      priority: f.priority != null ? String(f.priority) : null,
      deletedBy: x.deleted_by != null ? String(x.deleted_by) : null,
      deletedAt,
      expiresAt: deletedAt + RETENTION_MS,
    }
  })
}

async function columnsOf(c: Client, table: string): Promise<Set<string>> {
  try {
    const r = await c.execute(`PRAGMA table_info(${table})`)
    return new Set(r.rows.map((x: any) => String(x.name)))
  } catch { return new Set() }
}

function insertFor(table: string, row: Row, live: Set<string>, mode: "plain" | "ignore"): InStatement | null {
  const cols = Object.keys(row).filter((k) => live.has(k))
  if (!cols.length) return null
  return {
    sql: `INSERT ${mode === "ignore" ? "OR IGNORE " : ""}INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
    args: cols.map((k) => decodeValue(row[k]) as any),
  }
}

export type RestoreResult =
  | { ok: true; feedbackId: string; seqNum: number | null; renumbered: boolean }
  | { ok: false; status: 404 | 409; error: string }

/** Put a deleted ticket (and its comments, labels, activity, …) back. Removes it from the bin. */
export async function restoreDeletedTicket(c: Client, projectId: string, feedbackId: string): Promise<RestoreResult> {
  await ensureDeletedTicketsTable(c)
  const r = await c.execute({ sql: "SELECT snapshot_json FROM deleted_tickets WHERE project_id=? AND feedback_id=?", args: [projectId, feedbackId] })
  if (!r.rows.length) return { ok: false, status: 404, error: "This deleted ticket was not found (it may have expired or already been restored)." }
  let snap: TicketSnapshot
  try { snap = JSON.parse(String((r.rows[0] as any).snapshot_json)) } catch { return { ok: false, status: 409, error: "This deleted ticket can't be restored (its saved copy is unreadable)." } }
  const live = await c.execute({ sql: "SELECT 1 FROM feedback WHERE id=?", args: [feedbackId] })
  if (live.rows.length) return { ok: false, status: 409, error: "A ticket with this id already exists." }

  const feedback: Row = { ...snap.feedback, project_id: projectId }
  // Ticket numbers come from a counter that only goes up, so the original number is normally free. If it
  // was taken anyway (e.g. a legacy renumber), give the restored ticket the next number instead of failing.
  let seqNum = feedback.seq_num != null ? Number(decodeValue(feedback.seq_num)) : null
  let renumbered = false
  const stmts: InStatement[] = []
  if (seqNum != null) {
    const taken = await c.execute({ sql: "SELECT 1 FROM feedback WHERE project_id=? AND seq_num=?", args: [projectId, seqNum] })
    if (taken.rows.length) {
      const bump = await c.execute({ sql: "UPDATE projects SET ticket_seq = COALESCE(ticket_seq,0) + 1 WHERE id=? RETURNING ticket_seq", args: [projectId] }).catch(() => null)
      const next = bump && bump.rows.length ? Number((bump.rows[0] as any).ticket_seq) : null
      const max = await c.execute({ sql: "SELECT COALESCE(MAX(seq_num),0)+1 AS n FROM feedback WHERE project_id=?", args: [projectId] })
      seqNum = Math.max(next ?? 0, Number((max.rows[0] as any).n))
      feedback.seq_num = seqNum
      renumbered = true
    }
  }
  const fbIns = insertFor("feedback", feedback, await columnsOf(c, "feedback"), "plain")
  if (!fbIns) return { ok: false, status: 409, error: "This deleted ticket can't be restored." }
  stmts.push(fbIns)
  for (const table of RESTORABLE_CHILD_TABLES) {
    const rows = (snap.children && snap.children[table]) || []
    if (!rows.length) continue
    const cols = await columnsOf(c, table)
    if (!cols.size) continue
    // OR IGNORE: a row that somehow already exists (same primary key) must not block the whole restore.
    for (const row of rows) { const s = insertFor(table, row, cols, "ignore"); if (s) stmts.push(s) }
  }
  const keys = Array.isArray(snap.submissionKeys) ? snap.submissionKeys : []
  if (keys.length) {
    stmts.push({
      sql: `UPDATE submission_keys SET feedback_id=? WHERE project_id=? AND feedback_id IS NULL AND submission_key IN (${keys.map(() => "?").join(",")})`,
      args: [feedbackId, projectId, ...keys],
    })
  }
  stmts.push({ sql: "DELETE FROM deleted_tickets WHERE project_id=? AND feedback_id=?", args: [projectId, feedbackId] })
  await c.batch(stmts, "write")
  return { ok: true, feedbackId, seqNum, renumbered }
}
