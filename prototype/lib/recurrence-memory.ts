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
  // A.8 receipts: per-occurrence evidence for repeat reports (2..N). The original report's
  // occurrence carries the head row's fields; each deduped repeat carries its OWN verbatim
  // description + screenshot + quote (from feedback_occurrences), so the timeline can show
  // "you said X on date Y, then Y2, then Y3" with each occurrence's real wording and shot.
  occurrenceId: string | null    // feedback_occurrences.id when this row came from a stored receipt
  screenshotId: string | null    // this occurrence's own screenshot (may differ per occurrence)
  sourceQuote: string | null     // this occurrence's own grounded quote, when present
  isOriginal: boolean            // true = the first/original report (the cluster head)
}

export type ProjectRecurringIssue = RecurrenceMemory & {
  title: string | null
  priority: string | null
  impact: RecurrenceImpact   // KLAVITYKLA-236: amplified trust-weight, not a bare count
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

// ── KLAVITYKLA-236: Amplify recurrence, don't count it (JTBD A.5) ──────────────
// A raw tally ("reported 5×") reads as a shrug. The trust wound is what recurrence
// *means*: a promise that keeps breaking. This pure helper escalates a recurring
// issue into an impact tier so the UI can shout louder as the pattern deepens —
// and puts "broke again after we fixed it" (the north-star complaint) at the top.
export type RecurrenceImpactTier = "recurring" | "persistent" | "chronic" | "regression"
export type RecurrenceImpact = {
  level: 1 | 2 | 3 | 4       // visual escalation: 1 = notice, 4 = alarm
  tier: RecurrenceImpactTier
  headline: string           // amplified, trust-weighted line — never a bare number
  score: number              // ranking weight; higher surfaces first
  regressed: boolean
  count: number
}

/**
 * Derive the amplified impact of a recurring/regressed issue. Pure — testable
 * without a DB, and mirrored inline in dashboard.html for graceful client-side
 * fallback. A regression (fixed → broke again) always outranks a mere repeat.
 */
export function recurrenceImpact(input: { count: number; regressed: boolean }): RecurrenceImpact {
  const count = Math.max(1, Math.floor(Number(input.count) || 1))
  const regressed = !!input.regressed
  if (regressed) {
    // A fix that came undone is the deepest wound — always top of the pile,
    // and it stings harder each time it happens.
    const level: 3 | 4 = count >= 3 ? 4 : 3
    return {
      level,
      tier: "regression",
      headline: count >= 2 ? `Broke again after being fixed · ${count}×` : "Broke again after being fixed",
      score: 10_000 + count * 100,
      regressed,
      count,
    }
  }
  if (count >= 5) {
    return { level: 3, tier: "chronic", headline: `Chronic issue · reported ${count}×`, score: 500 + count * 100, regressed, count }
  }
  if (count >= 3) {
    return { level: 2, tier: "persistent", headline: `Keeps coming back · ${count}×`, score: 300 + count * 100, regressed, count }
  }
  return { level: 1, tier: "recurring", headline: "Reported again", score: 100 + count * 100, regressed, count }
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
      impact: recurrenceImpact({ count: memory.count, regressed: memory.regressed }),
    })
  }

  // KLAVITYKLA-236: rank by amplified impact (regressions and deeper patterns rise),
  // then by recency. This keeps the trust-damage at the top instead of just the tally.
  out.sort((a, b) => {
    if (b.impact.score !== a.impact.score) return b.impact.score - a.impact.score
    return b.lastSeenAt - a.lastSeenAt
  })
  return out.slice(0, limit)
}

type OccReceipt = { id: string; seenAt: number; observation: string | null; screenshotId: string | null; sourceQuote: string | null }
/** Stored per-occurrence receipts for a cluster-head feedback row (A.8). [] on missing table/error. */
async function occurrenceReceipts(c: Client, feedbackId: string): Promise<OccReceipt[]> {
  try {
    const r = await c.execute({
      sql: `SELECT id, seen_at, observation, screenshot_id, source_quote
            FROM feedback_occurrences WHERE feedback_id=? ORDER BY seen_at ASC, created_at ASC`,
      args: [feedbackId],
    })
    return (r.rows as any[]).map((x) => ({
      id: String(x.id),
      seenAt: Number(x.seen_at),
      observation: x.observation != null ? String(x.observation) : null,
      screenshotId: x.screenshot_id != null ? String(x.screenshot_id) : null,
      sourceQuote: x.source_quote != null ? String(x.source_quote) : null,
    }))
  } catch { return [] }  // older/minimal DB without feedback_occurrences: memory still works
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
    const urlPath = row.url_path != null ? String(row.url_path) : null
    const rowObservation = row.observation != null ? String(row.observation) : null
    const rowTitle = titleFromRow(row)
    const rowScreenshotId = row.screenshot_id != null ? String(row.screenshot_id) : null
    const rowSourceQuote = row.source_quote != null ? String(row.source_quote) : null
    const createdAt = Number(row.created_at)

    // A.8: stored per-occurrence receipts for repeat reports (2..N) — each keeps its OWN verbatim
    // description + screenshot + quote. Present only for clusters that recurred after A.8 shipped.
    const receipts = await occurrenceReceipts(c, String(row.id))
    const receiptSeenAts = new Set(receipts.map((o) => o.seenAt))

    // Original report → one occurrence from the head row's created_at, carrying the head fields.
    if (Number.isFinite(createdAt) && createdAt > 0) {
      occurrences.push({
        feedbackId: String(row.id), seenAt: createdAt, status, urlPath,
        observation: rowObservation, title: rowTitle,
        occurrenceId: null, screenshotId: rowScreenshotId, sourceQuote: rowSourceQuote,
        isOriginal: true,
      })
    }
    // Each stored receipt → an occurrence with ITS OWN wording/screenshot/quote.
    for (const rec of receipts) {
      occurrences.push({
        feedbackId: String(row.id), seenAt: rec.seenAt, status, urlPath,
        observation: rec.observation ?? rowObservation, title: rowTitle,
        occurrenceId: rec.id, screenshotId: rec.screenshotId ?? null, sourceQuote: rec.sourceQuote ?? null,
        isOriginal: false,
      })
    }
    // Backward-compat: pre-A.8 clusters have recurrence dates but no stored receipts. Emit
    // date-derived occurrences (sharing the head row's text) for any date lacking a receipt.
    for (const seenAt of rowDates) {
      if (seenAt === createdAt) continue          // already emitted as the original
      if (receiptSeenAts.has(seenAt)) continue     // already emitted from a receipt
      occurrences.push({
        feedbackId: String(row.id), seenAt, status, urlPath,
        observation: rowObservation, title: rowTitle,
        occurrenceId: null, screenshotId: rowScreenshotId, sourceQuote: rowSourceQuote,
        isOriginal: false,
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
