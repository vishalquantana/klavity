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
    try { evidence.screenshot_url = presignGet(String(shotKey), 3600) } catch { /* link is best-effort */ }
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

/**
 * Build the AI-consumable report for a run. Paginates over this run's findings with an integer offset
 * cursor. `next_cursor` is null when the last page was returned. Ordering follows listFindings' rank
 * (recurrence × kind-severity, then newest-first) so the most important issues page first.
 */
export async function buildV1Report(
  projectId: string,
  walk: Walk,
  opts: { baseUrl: string; cursor?: string | null; limit?: number },
): Promise<{ run_id: string; verdict: string | null; issues: V1Issue[]; next_cursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200)
  const offset = Math.max(Number.parseInt(String(opts.cursor ?? "0"), 10) || 0, 0)

  // Fetch limit+1 to know whether another page exists without a separate COUNT.
  const rows = await listFindings(projectId, { runId: walk.id, limit: limit + 1, offset })
  const hasMore = rows.length > limit
  const pageRows = hasMore ? rows.slice(0, limit) : rows

  // One replay-existence check for the whole run (not per issue).
  let hasReplay = false
  try { hasReplay = (await runsWithReplay(projectId, [walk.id])).has(walk.id) } catch { /* best-effort */ }

  const issues = pageRows.map((f) => mapFindingToIssue(f, { baseUrl: opts.baseUrl, runId: walk.id, hasReplay }))
  const next_cursor = hasMore ? String(offset + limit) : null

  return {
    run_id: walk.id,
    verdict: v1VerdictForWalk(walk.status),
    issues,
    next_cursor,
  }
}
