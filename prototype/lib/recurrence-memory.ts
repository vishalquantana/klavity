// lib/recurrence-memory.ts
// Computes a "RecurrenceMemory" for a feedback row: how many times was this issue seen,
// when, by whom (Sim or human reporter), and whether an expectation has been corroborated.
// Pure helpers (ordinal, buildSummary) are exported separately for unit testing without a DB.
import type { Client } from "@libsql/client"

export type RecurrenceMemory = {
  feedbackId: string
  issueKey: string | null
  count: number                    // 1 = first seen, 2 = first recurrence, etc.
  firstSeenAt: number              // created_at of the original row (ms)
  lastSeenAt: number               // most recent recurrence timestamp (ms)
  dates: number[]                  // all recurrence timestamps from recurrence_dates_json
  regressed: boolean               // true when this issue was reported again after resolution
  resolvedAt: number | null        // best-known resolution timestamp for the cluster
  occurrences: RecurrenceOccurrence[]
  expectationId: string | null     // linked expectation ID if the issue reached the spine
  expectationStatus: string | null // candidate | validated | enforced | retired
  citedSimId: string | null        // Sim ID if originally filed by a Sim (virtual customer)
  citedSimName: string | null      // Sim display name, looked up from personas
  summary: string                  // human-readable: "3rd occurrence. First filed by Alice (Sim) on 2026-06-10."
}

export type RecurrenceOccurrence = {
  feedbackId: string
  seenAt: number
  status: string
  urlPath: string | null
  observation: string | null
  title: string | null
}

export type ProjectRecurringIssue = RecurrenceMemory & {
  title: string | null
  priority: string | null
}

/** ordinal(2) → "2nd", ordinal(11) → "11th", ordinal(21) → "21st" */
export function ordinal(n: number): string {
  const abs = Math.abs(n)
  const mod100 = abs % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  switch (abs % 10) {
    case 1: return `${n}st`
    case 2: return `${n}nd`
    case 3: return `${n}rd`
    default: return `${n}th`
  }
}

/** Build the human-readable summary string. Pure — testable without a DB. */
export function buildSummary(count: number, firstSeenAt: number, citedSimName: string | null): string {
  const dateStr = new Date(firstSeenAt).toISOString().slice(0, 10)
  const reporter = citedSimName ? `by ${citedSimName} (Sim)` : `by a previous reporter`
  if (count <= 1) return `First occurrence filed ${reporter} on ${dateStr}.`
  return `${ordinal(count)} occurrence. First filed ${reporter} on ${dateStr}.`
}

/**
 * Build the full RecurrenceMemory for a feedback row.
 * Reads: recurrence columns, linked expectation (via issue_key → dedup_key), Sim name.
 * Returns null when the feedback row doesn't exist in this project.
 */
export async function buildRecurrenceMemory(
  c: Client,
  feedbackId: string,
  projectId: string,
): Promise<RecurrenceMemory | null> {
  const target = await c.execute({
    sql: `SELECT * FROM feedback WHERE id=? AND project_id=?`,
    args: [feedbackId, projectId],
  })
  if (!target.rows.length) return null
  const t = target.rows[0] as any
  const issueKey: string | null = t.issue_key != null ? String(t.issue_key) : null
  const rows = issueKey
    ? (await c.execute({
      sql: `SELECT * FROM feedback WHERE project_id=? AND issue_key=? ORDER BY created_at ASC`,
      args: [projectId, issueKey],
    })).rows as any[]
    : [t]

  const memory = await memoryFromRows(c, projectId, rows, feedbackId)
  return memory
}

export async function listProjectRecurringIssues(
  c: Client,
  projectId: string,
  opts: { limit?: number } = {},
): Promise<ProjectRecurringIssue[]> {
  const limit = Math.min(200, Math.max(1, opts.limit ?? 50))
  const r = await c.execute({
    sql: `SELECT * FROM feedback
          WHERE project_id=?
            AND ((issue_key IS NOT NULL AND issue_key!='') OR COALESCE(recurrence_count,1)>1)
          ORDER BY created_at ASC
          LIMIT 1000`,
    args: [projectId],
  })

  const groups = new Map<string, any[]>()
  for (const row of r.rows as any[]) {
    const key = row.issue_key != null && String(row.issue_key)
      ? `issue:${String(row.issue_key)}`
      : `feedback:${String(row.id)}`
    const rows = groups.get(key) ?? []
    rows.push(row)
    groups.set(key, rows)
  }

  const out: ProjectRecurringIssue[] = []
  for (const rows of groups.values()) {
    const memory = await memoryFromRows(c, projectId, rows)
    if (!memory) continue
    if (memory.count <= 1 && !memory.regressed) continue
    const first = rows[0] as any
    out.push({
      ...memory,
      title: titleFromRow(first),
      priority: (first.priority ?? first.severity) != null ? String(first.priority ?? first.severity) : null,
    })
  }

  out.sort((a, b) => {
    if (Number(b.regressed) !== Number(a.regressed)) return Number(b.regressed) - Number(a.regressed)
    if (b.count !== a.count) return b.count - a.count
    return b.lastSeenAt - a.lastSeenAt
  })
  return out.slice(0, limit)
}

function datesFromRow(row: any): number[] {
  let dates: number[] = []
  try { dates = JSON.parse(row.recurrence_dates_json || "[]") } catch { dates = [] }
  if (!Array.isArray(dates)) dates = []
  dates = dates.map((d) => Number(d)).filter((d) => Number.isFinite(d) && d > 0)
  const createdAt = Number(row.created_at)
  if (Number.isFinite(createdAt) && createdAt > 0 && !dates.includes(createdAt)) dates.unshift(createdAt)
  return [...new Set(dates)].sort((a, b) => a - b)
}

function titleFromRow(row: any): string | null {
  try {
    const parsed = JSON.parse(row.suggested_bug_json || "{}")
    const title = String(parsed?.title || "").trim()
    if (title) return title
  } catch {}
  const obs = row.observation != null ? String(row.observation).trim() : ""
  return obs ? obs.slice(0, 90) : null
}

async function memoryFromRows(
  c: Client,
  projectId: string,
  rows: any[],
  feedbackId?: string,
): Promise<RecurrenceMemory | null> {
  if (!rows.length) return null
  rows.sort((a, b) => Number(a.created_at) - Number(b.created_at))
  const first = rows[0] as any
  const issueKey: string | null = first.issue_key != null ? String(first.issue_key) : null
  const simId: string | null = first.sim_id != null ? String(first.sim_id) : null

  const occurrences: RecurrenceOccurrence[] = []
  let count = 0
  let resolvedAt: number | null = null
  for (const row of rows) {
    const rowCount = Math.max(1, Number(row.recurrence_count ?? 1))
    count += rowCount
    const rowDates = datesFromRow(row)
    const status = String(row.status || "open")
    const rowResolvedAt = row.resolved_at != null
      ? Number(row.resolved_at)
      : (status === "done" && row.updated_at != null ? Number(row.updated_at) : null)
    if (rowResolvedAt != null && Number.isFinite(rowResolvedAt)) {
      resolvedAt = resolvedAt == null ? rowResolvedAt : Math.min(resolvedAt, rowResolvedAt)
    }
    for (const seenAt of rowDates) {
      occurrences.push({
        feedbackId: String(row.id),
        seenAt,
        status,
        urlPath: row.url_path != null ? String(row.url_path) : null,
        observation: row.observation != null ? String(row.observation) : null,
        title: titleFromRow(row),
      })
    }
  }

  occurrences.sort((a, b) => a.seenAt - b.seenAt)
  const dates = [...new Set(occurrences.map((o) => o.seenAt))]
  const firstSeenAt = dates[0] ?? Number(first.created_at)
  const lastSeenAt = dates.at(-1) ?? firstSeenAt
  count = Math.max(count, dates.length)
  const regressed = resolvedAt != null && lastSeenAt > resolvedAt

  // Look up the linked expectation via the feedback's issue_key (= dedup_key on expectations).
  // The expectations spine is fed by ingestSnapOrSim which uses the same issueKeyForFeedback.
  let expectationId: string | null = null
  let expectationStatus: string | null = null
  if (issueKey) {
    try {
      const er = await c.execute({
        sql: "SELECT id, status FROM expectations WHERE project_id=? AND dedup_key=? LIMIT 1",
        args: [projectId, issueKey],
      })
      if (er.rows.length) {
        const ev = er.rows[0] as any
        expectationId = String(ev.id)
        expectationStatus = String(ev.status)
      }
    } catch { /* older/minimal DB without expectations: feedback memory still works */ }
  }

  // Look up Sim display name from personas for "cited virtual customer" attribution.
  let citedSimName: string | null = null
  if (simId) {
    try {
      const sr = await c.execute({
        sql: "SELECT name FROM personas WHERE id=? AND project_id=? LIMIT 1",
        args: [simId, projectId],
      })
      if (sr.rows.length) citedSimName = String((sr.rows[0] as any).name)
    } catch { /* older/minimal DB without personas */ }
  }

  const summary = buildSummary(count, firstSeenAt, citedSimName)
  return {
    feedbackId: feedbackId ?? String(first.id),
    issueKey, count, firstSeenAt, lastSeenAt, dates,
    regressed, resolvedAt, occurrences,
    expectationId, expectationStatus,
    citedSimId: simId, citedSimName, summary,
  }
}
