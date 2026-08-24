// KLA-550 — /api/v1/runs mapping layer. Turns the internal Walk + findings model into the
// documented, AI-consumable REST shapes returned by the v1 API. Pure-ish: the only side effects are
// read-only DB lookups (findings, replay presence) and best-effort S3 presigns for screenshots.
//
// Design notes:
//  • We POPULATE only fields we actually have today and leave the rest ABSENT (never fabricate
//    expected/actual/repro/suggested_fix). The schema is forward-compatible: consumers should treat
//    every optional field as "may appear later".
//  • Verdict/status mapping mirrors the /api/ci/runs contract: terminal walk verdicts (green/amber/
//    red/skip) → completed; running/paused/needs_auth → in-progress; the cancelled marker → cancelled.

import type { Finding, Walk } from "./trails-types"
import { listFindings } from "./trails"
import { severityForKind, findingSelector } from "./trails-findings-gate"
import { runsWithReplay } from "./trails-replay"
import { presignGet } from "./s3"
import { SCREENSHOTS } from "./screenshot-config"

export type V1RunStatus = "queued" | "running" | "completed" | "failed" | "cancelled"

const TERMINAL_VERDICTS = new Set(["green", "amber", "red", "skip"])

/**
 * Map an internal Walk row's status onto the v1 lifecycle.
 *  - green/amber/skip  → completed (verdict carries the nuance)
 *  - red               → failed (a regression/blocking issue was found)
 *  - running           → running
 *  - queued            → queued  (only used transiently right after create; walks start 'running')
 *  - paused/needs_auth → running (still in-flight from the caller's perspective)
 *  - cancelled         → cancelled
 */
export function v1StatusForWalk(walkStatus: string): V1RunStatus {
  if (walkStatus === "red") return "failed"
  if (walkStatus === "green" || walkStatus === "amber" || walkStatus === "skip") return "completed"
  if (walkStatus === "cancelled") return "cancelled"
  if (walkStatus === "queued") return "queued"
  // running | paused | needs_auth | anything unknown → treat as in-progress.
  return "running"
}

/** The terminal verdict (green/amber/red/skip) or null while the walk is still in-flight. */
export function v1VerdictForWalk(walkStatus: string): string | null {
  return TERMINAL_VERDICTS.has(walkStatus) ? walkStatus : null
}

/** Shape the status payload for GET /api/v1/runs/:id. `git` is the parsed metadata (or null). */
export async function buildV1RunStatus(
  projectId: string,
  walk: Walk,
  git: Record<string, unknown> | null,
): Promise<Record<string, unknown>> {
  const status = v1StatusForWalk(walk.status)
  const verdict = v1VerdictForWalk(walk.status)

  // counts_by_severity — the highest-leverage at-a-glance summary. Derived from this run's findings,
  // keyed by the finding's computed priority (falling back to kind-derived severity for legacy rows).
  const counts: Record<string, number> = {}
  try {
    const findings = await listFindings(projectId, { runId: walk.id, limit: 10_000 })
    for (const f of findings) {
      const sev = (f.priority ?? severityForKind(f.kind)).toLowerCase()
      counts[sev] = (counts[sev] ?? 0) + 1
    }
  } catch { /* summary is best-effort — never fail the status read over it */ }

  return {
    run_id: walk.id,
    trail_id: walk.trailId,
    status,
    verdict,
    // progress: absent for now — the engine reports no incremental step count to the caller yet.
    summary: { counts_by_severity: counts },
    started_at: walk.startedAt,
    finished_at: walk.finishedAt,
    git: git ?? null,
  }
}

/** One issue in the machine-readable report. Optional fields are omitted when we have no value. */
export interface V1Issue {
  id: string
  title: string
  severity: string
  priority: string
  target: { url?: string; selector?: string; dom_snippet?: string }
  expected?: string
  actual?: string
  repro?: { steps?: string[]; script_url?: string }
  evidence: {
    screenshot_url?: string
    replay_url?: string
    console?: unknown
    network?: unknown
    timestamp?: number
  }
  suggested_fix?: { description?: string; likely_files?: string[]; repo_ref?: string }
  ground_quote?: string
}

function mapFindingToIssue(
  f: Finding,
  ctx: { baseUrl: string; runId: string; hasReplay: boolean },
): V1Issue {
  const ev = (f.evidence ?? {}) as Record<string, unknown>
  const severity = (f.priority ?? severityForKind(f.kind)).toLowerCase()

  // target — the affected element. url comes from whichever page-url key the finding class populated;
  // selector reuses the shared findingSelector() resolver (ambiguous-selector / element-gone / heal).
  const target: V1Issue["target"] = {}
  const url = (ev.pageUrl as string) || (ev.url as string) || (ev.stepPageUrl as string) || ""
  if (url) target.url = String(url)
  const sel = findingSelector(f)
  if (sel) target.selector = sel
  const domSnippet = (ev.domSnippet as string) || (ev.dom as string) || ""
  if (domSnippet) target.dom_snippet = String(domSnippet)

  // evidence — screenshot presigned best-effort; replay linked only when a recording exists for the run.
  const evidence: V1Issue["evidence"] = {}
  const shotKey = ev.screenshotKey as string | undefined
  if (shotKey) {
    // KLA-560: honour the ops-tunable presign TTL (SCREENSHOTS.presignTtlSec, default 600) instead of a
    // hardcoded 3600 — mirrors every other presign surface so a shortened GET lifetime applies here too.
    try { evidence.screenshot_url = presignGet(String(shotKey), SCREENSHOTS.presignTtlSec) } catch { /* link is best-effort */ }
  }
  if (ctx.hasReplay) evidence.replay_url = `${ctx.baseUrl}/api/trails/walks/${ctx.runId}/replay`
  if (ev.console != null) evidence.console = ev.console
  if (ev.network != null) evidence.network = ev.network
  evidence.timestamp = f.createdAt

  const issue: V1Issue = {
    id: f.id,
    title: f.title,
    severity,
    priority: severity,
    target,
    evidence,
  }
  // ground_quote — only when present; the verified/unverified nuance is exposed via the CI/report UI,
  // here we surface the raw quote so an AI agent can cite the exact page text.
  if (f.groundQuote) issue.ground_quote = f.groundQuote
  // expected/actual/repro/suggested_fix are deliberately absent: the findings model doesn't carry them
  // as discrete fields today. Follow-up work can populate them once the engine emits structured repro.
  return issue
}

// ── KLA-560: stable keyset pagination over a run's findings ──────────────────────────────────────
// The report pages findings in listFindings' canonical rank order (recurrence × kind-weight DESC,
// updated_at DESC). The old INTEGER-OFFSET cursor DRIFTED: a finding inserted between two page fetches
// shifted every subsequent offset, so an AI consumer paging the report saw duplicate issues or skipped
// past ones entirely. We switch to a VALUE-based keyset: the cursor encodes the last emitted finding's
// rank tuple (rankScore, updated_at) PLUS its id as a total-order tiebreak, and the next page resumes
// at the first finding strictly AFTER that key. An insert positioned before the cursor no longer
// shifts the rows that come after it, so no duplicates and no skips.
//
// listFindings only exposes limit/offset (not a keyset WHERE), so we fetch the run's ranked findings
// and slice in JS — the same full-run read buildV1RunStatus already performs. Findings-per-run is
// bounded, so this stays cheap while making the page sequence deterministic across concurrent inserts.

const KIND_WEIGHT: Record<string, number> = { regression: 3, amber_heal: 2 }

/** Composite rank score mirroring listFindings' SQL: kind_weight × MAX(recurrence, 1). */
function findingRankScore(f: Finding): number {
  return (KIND_WEIGHT[f.kind] ?? 1) * Math.max(f.recurrence ?? 0, 1)
}

interface RankKey { r: number; u: number; i: string }

function findingKey(f: Finding): RankKey {
  return { r: findingRankScore(f), u: f.updatedAt, i: f.id }
}

/**
 * Total order matching listFindings' ORDER BY (rankScore DESC, updated_at DESC) with id DESC as a
 * deterministic final tiebreak. Returns <0 when `a` sorts BEFORE `b` (pages earlier), >0 when after.
 */
function compareKey(a: RankKey, b: RankKey): number {
  if (a.r !== b.r) return b.r - a.r          // higher rankScore first
  if (a.u !== b.u) return b.u - a.u          // newer updated_at first
  return a.i < b.i ? 1 : a.i > b.i ? -1 : 0  // higher id first (stable tiebreak)
}

function encodeCursor(k: RankKey): string {
  return Buffer.from(JSON.stringify(k), "utf8").toString("base64url")
}

function decodeCursor(cursor: string): RankKey | null {
  try {
    const o = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"))
    if (o && typeof o.r === "number" && typeof o.u === "number" && typeof o.i === "string") {
      return { r: o.r, u: o.u, i: o.i }
    }
  } catch { /* malformed / legacy integer cursor → fall through to first page */ }
  return null
}

/**
 * Build the AI-consumable report for a run. Paginates over this run's findings with a STABLE keyset
 * cursor (see note above): the opaque `next_cursor` string resumes at the first finding after the last
 * one returned, so a mid-page insert can't duplicate or skip issues. `next_cursor` is null on the last
 * page. Ordering follows listFindings' rank (recurrence × kind-severity, then newest-first).
 */
export async function buildV1Report(
  projectId: string,
  walk: Walk,
  opts: { baseUrl: string; cursor?: string | null; limit?: number },
): Promise<{ run_id: string; verdict: string | null; issues: V1Issue[]; next_cursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200)

  // Fetch the run's findings in canonical rank order, then keyset-slice in JS (see note above). The
  // SQL ORDER BY has no id tiebreak, so equal-rank / equal-updated_at rows can arrive in an arbitrary
  // order — re-sort with the total order so the keyset boundary is deterministic.
  const rows = await listFindings(projectId, { runId: walk.id, limit: 10_000 })
  rows.sort((a, b) => compareKey(findingKey(a), findingKey(b)))

  const after = opts.cursor ? decodeCursor(String(opts.cursor)) : null
  const start = after ? rows.findIndex((f) => compareKey(findingKey(f), after) > 0) : 0
  const from = start < 0 ? rows.length : start   // cursor at/after the end → empty final page
  const pageRows = rows.slice(from, from + limit)
  const hasMore = from + limit < rows.length

  // One replay-existence check for the whole run (not per issue).
  let hasReplay = false
  try { hasReplay = (await runsWithReplay(projectId, [walk.id])).has(walk.id) } catch { /* best-effort */ }

  const issues = pageRows.map((f) => mapFindingToIssue(f, { baseUrl: opts.baseUrl, runId: walk.id, hasReplay }))
  const next_cursor = hasMore && pageRows.length
    ? encodeCursor(findingKey(pageRows[pageRows.length - 1]))
    : null

  return {
    run_id: walk.id,
    verdict: v1VerdictForWalk(walk.status),
    issues,
    next_cursor,
  }
}
