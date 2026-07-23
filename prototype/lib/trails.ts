import { db } from "./db"
import type { Trail, TrailEnvironment, TrailStep, TrailStatus, StepAction, Fingerprint, TrailViewport, Checkpoint, PersonaVerdict } from "./trails-types"
import type { WalkJudgment } from "./trails-judge"
import { computeFindingSeverity } from "./trails-findings-severity"
import { normalizeTrailViewport, parseTrailViewportJson } from "./trails-viewport"

function uid(prefix: string): string { return prefix + crypto.randomUUID() }
function j<T>(v: T | null | undefined): string | null { return v == null ? null : JSON.stringify(v) }
function pj<T>(s: unknown): T | null { return s ? (JSON.parse(String(s)) as T) : null }

function rowToTrail(r: any): Trail {
  return {
    id: r.id, projectId: r.project_id, name: r.name, intent: r.intent, baseUrl: r.base_url,
    viewport: parseTrailViewportJson(r.viewport_json),
    baselineRef: r.baseline_ref ?? null, authorKind: r.author_kind, status: r.status,
    createdBy: r.created_by ?? null, createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
    stepVersion: r.step_version == null ? 1 : Number(r.step_version),
    schedule: r.schedule_cron ?? null,
    scheduleTz: r.schedule_tz ?? null,
    scheduledLastRunAt: r.scheduled_last_run_at == null ? null : Number(r.scheduled_last_run_at),
    judgePersonaId: r.judge_persona_id ?? null,
    objectiveVerified: r.objective_verified == null ? null : !!r.objective_verified,
    environments: pj<TrailEnvironment[]>(r.environments_json) ?? [],
  }
}

/**
 * KLA-93: resolve the effective base URL for a run given an optional named environment.
 * Returns the environment's baseUrl when found, or the trail's default baseUrl.
 * Throws when a name is given but not found — that's always a caller error.
 */
export function resolveEnvironmentUrl(trail: Trail, environmentName?: string | null): string {
  if (!environmentName) return trail.baseUrl
  const env = trail.environments.find((e) => e.name === environmentName)
  if (!env) throw new Error(`environment "${environmentName}" not found on trail ${trail.id}`)
  return env.baseUrl
}

export async function createTrail(
  projectId: string,
  input: { name: string; intent?: string; baseUrl: string; viewport?: TrailViewport | string | null; authorKind?: Trail["authorKind"]; createdBy?: string; objectiveVerified?: boolean | null; environments?: TrailEnvironment[]; judgePersonaId?: string | null },
): Promise<string> {
  const id = uid("trl_"); const now = Date.now()
  const viewport = normalizeTrailViewport(input.viewport)
  await db!.execute({
    sql: `INSERT INTO trails (id, project_id, name, intent, base_url, viewport_json, baseline_ref, author_kind, status, created_by, created_at, updated_at, objective_verified, environments_json, judge_persona_id)
          VALUES (?, ?, ?, ?, ?, ?, NULL, ?, 'draft', ?, ?, ?, ?, ?, ?)`,
    args: [id, projectId, input.name, input.intent ?? "", input.baseUrl, j(viewport), input.authorKind ?? "human", input.createdBy ?? null, now, now, input.objectiveVerified === undefined ? null : (input.objectiveVerified === null ? null : (input.objectiveVerified ? 1 : 0)), input.environments?.length ? j(input.environments) : null, input.judgePersonaId ?? null],
  })
  return id
}

export async function getTrail(projectId: string, id: string): Promise<Trail | null> {
  const r = await db!.execute({ sql: `SELECT * FROM trails WHERE project_id=? AND id=?`, args: [projectId, id] })
  return r.rows.length ? rowToTrail(r.rows[0]) : null
}

/** The special creator tag used to mark seeded demo/dogfood trails. */
export const DEMO_TRAIL_CREATOR = "demo@klavity"

/**
 * List trails for a project.
 * By default demo trails (created_by = DEMO_TRAIL_CREATOR) are excluded so they never
 * surface in real users' listings. Pass `{ includeDemo: true }` only from seed/admin code.
 */
export async function listTrails(projectId: string, opts: { includeDemo?: boolean } = {}): Promise<Trail[]> {
  const { includeDemo = false } = opts
  const sql = includeDemo
    ? `SELECT * FROM trails WHERE project_id=? ORDER BY created_at DESC`
    : `SELECT * FROM trails WHERE project_id=? AND (created_by IS NULL OR created_by != ?) ORDER BY created_at DESC`
  const args = includeDemo ? [projectId] : [projectId, DEMO_TRAIL_CREATOR]
  const r = await db!.execute({ sql, args })
  return r.rows.map(rowToTrail)
}

export async function setTrailStatus(projectId: string, id: string, status: TrailStatus): Promise<void> {
  await db!.execute({ sql: `UPDATE trails SET status=?, updated_at=? WHERE project_id=? AND id=?`, args: [status, Date.now(), projectId, id] })
}

export async function deleteTrail(projectId: string, id: string): Promise<void> {
  const runIds = await db!.execute({ sql: `SELECT id FROM trail_runs WHERE project_id=? AND trail_id=?`, args: [projectId, id] })
  for (const row of runIds.rows) {
    const runId = String((row as any).id)
    await db!.execute({ sql: `DELETE FROM walk_replays WHERE project_id=? AND run_id=?`, args: [projectId, runId] })
    await db!.execute({ sql: `DELETE FROM walk_judgments WHERE project_id=? AND run_id=?`, args: [projectId, runId] }).catch(() => {})
  }
  await db!.execute({ sql: `DELETE FROM run_steps WHERE project_id=? AND trail_id=?`, args: [projectId, id] })
  await db!.execute({ sql: `DELETE FROM findings WHERE project_id=? AND trail_id=?`, args: [projectId, id] })
  await db!.execute({ sql: `DELETE FROM trail_runs WHERE project_id=? AND trail_id=?`, args: [projectId, id] })
  await db!.execute({ sql: `DELETE FROM locator_cache WHERE project_id=? AND trail_id=?`, args: [projectId, id] })
  await db!.execute({ sql: `DELETE FROM trail_steps WHERE project_id=? AND trail_id=?`, args: [projectId, id] })
  await db!.execute({ sql: `DELETE FROM trails WHERE project_id=? AND id=?`, args: [projectId, id] })
}

export type TrailPatch = { name?: string; status?: TrailStatus; schedule?: string | null; scheduleTz?: string | null; viewport?: TrailViewport | string | null; judgePersonaId?: string | null; environments?: TrailEnvironment[] }

export async function updateTrail(projectId: string, id: string, patch: TrailPatch): Promise<boolean> {
  const r = await db!.execute({ sql: `SELECT id FROM trails WHERE project_id=? AND id=?`, args: [projectId, id] })
  if (!r.rows.length) return false
  const sets: string[] = []
  const args: (string | number | null)[] = []
  if (patch.name != null) { sets.push("name=?"); args.push(patch.name) }
  if (patch.status != null) { sets.push("status=?"); args.push(patch.status) }
  if ("schedule" in patch) { sets.push("schedule_cron=?"); args.push(patch.schedule ?? null) }
  if ("scheduleTz" in patch) { sets.push("schedule_tz=?"); args.push(patch.scheduleTz ?? null) }
  if ("viewport" in patch) { sets.push("viewport_json=?"); args.push(j(normalizeTrailViewport(patch.viewport))) }
  if ("judgePersonaId" in patch) { sets.push("judge_persona_id=?"); args.push(patch.judgePersonaId ?? null) }
  if ("environments" in patch) { sets.push("environments_json=?"); args.push(patch.environments?.length ? j(patch.environments) : null) }
  if (!sets.length) return true
  sets.push("updated_at=?"); args.push(Date.now())
  args.push(projectId, id)
  await db!.execute({ sql: `UPDATE trails SET ${sets.join(", ")} WHERE project_id=? AND id=?`, args })
  return true
}

export async function listAllScheduledTrails(): Promise<Trail[]> {
  // Demo trails are excluded: they are seeded for internal fixture/dogfood use only and must not
  // run on a production cron schedule visible to real accounts.
  const r = await db!.execute({
    sql: `SELECT * FROM trails WHERE schedule_cron IS NOT NULL AND status='active' AND (created_by IS NULL OR created_by != ?)`,
    args: [DEMO_TRAIL_CREATOR],
  })
  return r.rows.map(rowToTrail)
}

export async function touchScheduledLastRunAt(projectId: string, trailId: string, ts: number): Promise<void> {
  await db!.execute({ sql: `UPDATE trails SET scheduled_last_run_at=?, updated_at=? WHERE project_id=? AND id=?`, args: [ts, ts, projectId, trailId] })
}

function rowToStep(r: any): TrailStep {
  return {
    id: r.id, trailId: r.trail_id, projectId: r.project_id, idx: Number(r.idx),
    action: r.action as StepAction, actionValue: r.action_value ?? null,
    target: pj<Fingerprint>(r.target_json), checkpoint: pj<Checkpoint>(r.checkpoint_json),
    createdAt: Number(r.created_at),
    ...(r.timeout_ms != null ? { timeoutMs: Number(r.timeout_ms) } : {}),
  }
}

async function bumpStepVersion(projectId: string, trailId: string): Promise<void> {
  await db!.execute({
    sql: `UPDATE trails SET step_version = step_version + 1, updated_at = ? WHERE project_id = ? AND id = ?`,
    args: [Date.now(), projectId, trailId],
  })
}

export async function addTrailStep(
  projectId: string, trailId: string,
  input: { idx: number; action: StepAction; actionValue?: string; target?: Fingerprint; checkpoint?: Checkpoint; timeoutMs?: number },
): Promise<string> {
  const id = uid("tstep_")
  await db!.execute({
    sql: `INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, timeout_ms, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, trailId, projectId, input.idx, input.action, input.actionValue ?? null, j(input.target), j(input.checkpoint), input.timeoutMs ?? null, Date.now()],
  })
  await bumpStepVersion(projectId, trailId)
  return id
}

export async function listTrailSteps(projectId: string, trailId: string): Promise<TrailStep[]> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_steps WHERE project_id=? AND trail_id=? ORDER BY idx ASC`, args: [projectId, trailId] })
  return r.rows.map(rowToStep)
}

/**
 * B.10 (KLA-250): fetch a single trail step by id (project-scoped). Used by the enriched
 * GET /api/expectations/:id route to resolve an enforced guard's step → its Trail id + idx, so the
 * board can show "Trail name · step N of M" instead of a raw ts_ UUID. Returns null when missing.
 */
export async function getTrailStepById(projectId: string, stepId: string): Promise<TrailStep | null> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_steps WHERE project_id=? AND id=?`, args: [projectId, stepId] })
  return r.rows.length ? rowToStep(r.rows[0]) : null
}

import type { LocatorCacheRow } from "./trails-types"

function rowToCache(r: any): LocatorCacheRow {
  return {
    id: r.id, projectId: r.project_id, trailId: r.trail_id, stepId: r.step_id,
    cacheKey: r.cache_key, resolvedSelector: r.resolved_selector, fingerprint: pj<Fingerprint>(r.fingerprint_json),
    confidence: Number(r.confidence), source: r.source, createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  }
}

export async function upsertLocatorCache(
  projectId: string,
  input: { trailId: string; stepId: string; cacheKey: string; resolvedSelector: string; fingerprint?: Fingerprint; confidence?: number; source?: "crystallize" | "heal" },
): Promise<string> {
  const id = uid("lc_"); const now = Date.now()
  await db!.execute({
    sql: `INSERT INTO locator_cache (id, project_id, trail_id, step_id, cache_key, resolved_selector, fingerprint_json, confidence, source, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(project_id, step_id) DO UPDATE SET
            cache_key=excluded.cache_key,
            resolved_selector=excluded.resolved_selector,
            fingerprint_json=excluded.fingerprint_json,
            confidence=excluded.confidence,
            source=excluded.source,
            updated_at=excluded.updated_at`,
    args: [id, projectId, input.trailId, input.stepId, input.cacheKey, input.resolvedSelector, j(input.fingerprint), input.confidence ?? 1.0, input.source ?? "crystallize", now, now],
  })
  return id
}

export async function getLocatorByKey(projectId: string, key: string): Promise<LocatorCacheRow | null> {
  const r = await db!.execute({ sql: `SELECT * FROM locator_cache WHERE project_id=? AND cache_key=?`, args: [projectId, key] })
  return r.rows.length ? rowToCache(r.rows[0]) : null
}

export async function getCacheForStep(projectId: string, stepId: string): Promise<LocatorCacheRow | null> {
  const r = await db!.execute({ sql: `SELECT * FROM locator_cache WHERE project_id=? AND step_id=? ORDER BY updated_at DESC LIMIT 1`, args: [projectId, stepId] })
  return r.rows.length ? rowToCache(r.rows[0]) : null
}

import type { Walk, RunStep, Verdict, Tier, FailureClass } from "./trails-types"

function rowToWalk(r: any): Walk {
  return {
    id: r.id, trailId: r.trail_id, projectId: r.project_id, trigger: r.trigger,
    status: r.status, llmCalls: Number(r.llm_calls),
    trailVersion: r.trail_version == null ? 1 : Number(r.trail_version),
    summary: pj<Record<string, unknown>>(r.summary_json),
    startedAt: Number(r.started_at), finishedAt: r.finished_at == null ? null : Number(r.finished_at),
    environmentName: r.environment_name ?? null,
    replayCostUsd: r.replay_cost_usd == null ? null : Number(r.replay_cost_usd),
  }
}

function rowToRunStep(r: any): RunStep {
  return {
    id: r.id, runId: r.run_id, trailId: r.trail_id, stepId: r.step_id, projectId: r.project_id,
    idx: Number(r.idx), tier: r.tier as Tier, verdict: r.verdict as Verdict, confidence: Number(r.confidence),
    diagnosis: (r.diagnosis ?? null) as FailureClass | null, healed: Number(r.healed) === 1,
    evidence: pj<Record<string, unknown>>(r.evidence_json), createdAt: Number(r.created_at),
  }
}

export async function startWalk(
  projectId: string,
  trailId: string,
  trigger: "manual" = "manual",
  /** KLA-93: optional named environment to run against. Recorded on the walk row; null = default baseUrl. */
  environmentName?: string | null,
): Promise<string> {
  const id = uid("walk_")
  // Pin the Trail's current step_version so this Walk always shows the steps it actually ran against,
  // even if the Trail is edited later. DEFAULT 1 handles rows written before this column existed.
  const tv = await db!.execute({ sql: `SELECT step_version FROM trails WHERE project_id=? AND id=?`, args: [projectId, trailId] })
  const trailVersion = tv.rows.length ? (Number((tv.rows[0] as any).step_version) || 1) : 1
  await db!.execute({
    sql: `INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, summary_json, trail_version, environment_name, started_at, finished_at)
          VALUES (?, ?, ?, ?, 'running', 0, NULL, ?, ?, ?, NULL)`,
    args: [id, trailId, projectId, trigger, trailVersion, environmentName ?? null, Date.now()],
  })
  return id
}

export async function recordSkippedScheduledRun(
  projectId: string,
  trailId: string,
  status: "skipped" | "missed",
  /**
   * KLA-216: optional reason + retry outcome preserved on the skipped/missed row (stored in
   * summary_json). Lets the Walks list and coverage surface explain WHY a scheduled run didn't
   * happen (e.g. "slot busy for the entire retry window", how many retries were attempted).
   */
  detail?: Record<string, unknown>,
): Promise<string> {
  const id = uid("walk_")
  const tv = await db!.execute({ sql: `SELECT step_version FROM trails WHERE project_id=? AND id=?`, args: [projectId, trailId] })
  const trailVersion = tv.rows.length ? (Number((tv.rows[0] as any).step_version) || 1) : 1
  const now = Date.now()
  await db!.execute({
    sql: `INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, summary_json, trail_version, environment_name, started_at, finished_at)
          VALUES (?, ?, ?, 'scheduled', ?, 0, ?, ?, NULL, ?, ?)`,
    args: [id, trailId, projectId, status, j(detail ?? null), trailVersion, now, now],
  })
  return id
}

export async function addRunStep(
  projectId: string,
  input: { runId: string; trailId: string; stepId: string; idx: number; tier: Tier; verdict: Verdict; confidence?: number; diagnosis?: FailureClass; healed?: boolean; evidence?: Record<string, unknown> },
): Promise<string> {
  const id = uid("rstep_")
  await db!.execute({
    sql: `INSERT INTO run_steps (id, run_id, trail_id, step_id, project_id, idx, tier, verdict, confidence, diagnosis, healed, evidence_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, input.runId, input.trailId, input.stepId, projectId, input.idx, input.tier, input.verdict, input.confidence ?? 0, input.diagnosis ?? null, input.healed ? 1 : 0, j(input.evidence), Date.now()],
  })
  return id
}

export async function mergeRunStepEvidence(projectId: string, runStepId: string, patch: Record<string, unknown>): Promise<void> {
  const r = await db!.execute({
    sql: `SELECT evidence_json FROM run_steps WHERE project_id=? AND id=?`,
    args: [projectId, runStepId],
  })
  if (!r.rows.length) return
  const existing = pj<Record<string, unknown>>((r.rows[0] as any).evidence_json) ?? {}
  await db!.execute({
    sql: `UPDATE run_steps SET evidence_json=? WHERE project_id=? AND id=?`,
    args: [j({ ...existing, ...patch }), projectId, runStepId],
  })
}

export async function finishWalk(projectId: string, runId: string, input: { status: Verdict; llmCalls: number; summary?: Record<string, unknown> }): Promise<void> {
  // KLAVITYKLA-364: stamp the MEASURED cost-per-replay. A replay makes zero LLM calls unless a cached
  // selector fails and a Tier-1 self-heal fires (ai_calls type='reheal', linked by run_id). Summing
  // this run's reheal costs is the true $/replay (0 for a fully-cached deterministic replay). Computed
  // in the same UPDATE so it's atomic with finish and needs no second write.
  await db!.execute({
    sql: `UPDATE trail_runs
          SET status=?, llm_calls=?, summary_json=?, finished_at=?,
              replay_cost_usd = COALESCE((SELECT SUM(cost_usd) FROM ai_calls WHERE run_id=? AND type='reheal'), 0)
          WHERE project_id=? AND id=?`,
    args: [input.status, input.llmCalls, j(input.summary), Date.now(), runId, projectId, runId],
  })
}

export async function getWalk(projectId: string, runId: string): Promise<Walk | null> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_runs WHERE project_id=? AND id=?`, args: [projectId, runId] })
  return r.rows.length ? rowToWalk(r.rows[0]) : null
}

/**
 * KLA-104: Pause a running walk, storing an opaque key the caller must echo when resuming.
 * Called by resolvePauseSecret inside the runner; returns the key so the runner can poll on it.
 */
export async function pauseWalk(
  projectId: string, runId: string, secretKey: string,
): Promise<void> {
  await db!.execute({
    sql: `UPDATE trail_runs SET status='paused', paused_secret_key=? WHERE project_id=? AND id=?`,
    args: [secretKey, projectId, runId],
  })
}

/**
 * KLA-104: Resume a paused walk. The caller must supply the exact secretKey registered during
 * pause AND the secret value. On success sets status back to 'running', stores the secret value
 * in paused_secret_key so the polling runner can read it, then clears it.
 * Returns false when runId not found, wrong key, or walk not currently paused.
 */
export async function resumeWalk(
  projectId: string, runId: string, secretKey: string, secretValue: string,
): Promise<boolean> {
  const r = await db!.execute({
    sql: `SELECT status, paused_secret_key FROM trail_runs WHERE project_id=? AND id=?`,
    args: [projectId, runId],
  })
  if (!r.rows.length) return false
  const row = r.rows[0] as any
  if (row.status !== "paused" || row.paused_secret_key !== secretKey) return false
  // Store the resolved secret in paused_secret_key so the polling runner sees it,
  // switch status back to running.  Runner clears the column after reading.
  await db!.execute({
    sql: `UPDATE trail_runs SET status='running', paused_secret_key=? WHERE project_id=? AND id=?`,
    args: [secretValue, projectId, runId],
  })
  return true
}

export async function listRunSteps(projectId: string, runId: string): Promise<RunStep[]> {
  const r = await db!.execute({ sql: `SELECT * FROM run_steps WHERE project_id=? AND run_id=? ORDER BY idx ASC`, args: [projectId, runId] })
  return r.rows.map(rowToRunStep)
}

// Returns the evidence blob for the first run_step matching (projectId, runId, stepId).
// Used by realFiler to look up a step's screenshotKey for ticket attachments.
export async function getRunStepEvidence(projectId: string, runId: string, stepId: string): Promise<Record<string, unknown> | null> {
  const r = await db!.execute({
    sql: `SELECT evidence_json FROM run_steps WHERE project_id=? AND run_id=? AND step_id=? ORDER BY idx DESC LIMIT 1`,
    args: [projectId, runId, stepId],
  })
  if (!r.rows.length) return null
  try { return JSON.parse(String((r.rows[0] as any).evidence_json || "{}")) } catch { return null }
}

export async function countRunSteps(projectId: string, runId: string): Promise<number> {
  const r = await db!.execute({ sql: `SELECT COUNT(*) as n FROM run_steps WHERE project_id=? AND run_id=?`, args: [projectId, runId] })
  return Number((r.rows[0] as any)?.n ?? 0)
}

export async function countTrailSteps(projectId: string, trailId: string): Promise<number> {
  const r = await db!.execute({ sql: `SELECT COUNT(*) as n FROM trail_steps WHERE project_id=? AND trail_id=?`, args: [projectId, trailId] })
  return Number((r.rows[0] as any)?.n ?? 0)
}

export async function listWalks(projectId: string, trailId: string): Promise<Walk[]> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_runs WHERE project_id=? AND trail_id=? ORDER BY started_at DESC`, args: [projectId, trailId] })
  return r.rows.map(rowToWalk)
}

// Recent Walks across the whole project (any trail), newest-first. Powers the Trails dashboard.
export async function listRecentWalks(projectId: string, limit = 20): Promise<Walk[]> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_runs WHERE project_id=? ORDER BY started_at DESC LIMIT ?`, args: [projectId, limit] })
  return r.rows.map(rowToWalk)
}

/**
 * KLA-216: Per-project schedule-health coverage over a window. Counts scheduled walk occurrences and
 * how many actually ran, so "guarded daily" is never silently false: a schedule that quietly skipped
 * runs shows e.g. "13 of 14 scheduled walks ran". A run "ran" if it reached any real terminal/active
 * state; it did NOT run if it was recorded skipped or missed. `sinceMs` defaults to 7 days ago.
 */
export interface ScheduleCoverage {
  scheduled: number   // total scheduled occurrences in the window (ran + skipped + missed)
  ran: number         // occurrences that actually launched a walk
  skipped: number     // occurrences recorded skipped (slot busy for the whole retry window)
  missed: number      // occurrences recorded missed (launch error)
  coverage: number | null // ran / scheduled; null when nothing was scheduled in the window
}

export async function computeScheduleCoverage(projectId: string, sinceMs?: number): Promise<ScheduleCoverage> {
  const since = sinceMs ?? Date.now() - 7 * 24 * 3600 * 1000
  const r = await db!.execute({
    sql: `SELECT status, COUNT(*) AS n FROM trail_runs
          WHERE project_id=? AND trigger='scheduled' AND started_at>=?
          GROUP BY status`,
    args: [projectId, since],
  })
  let scheduled = 0, skipped = 0, missed = 0
  for (const row of r.rows as any[]) {
    const n = Number(row.n || 0)
    scheduled += n
    if (row.status === "skipped") skipped += n
    else if (row.status === "missed") missed += n
  }
  const ran = scheduled - skipped - missed
  return { scheduled, ran, skipped, missed, coverage: scheduled > 0 ? ran / scheduled : null }
}

// KLA-158: Paginated walk list for the All Walks page. Returns walks + total count in one round-trip.
export async function listWalksPaged(
  projectId: string,
  page: number,
  limit: number,
): Promise<{ walks: Walk[]; total: number }> {
  const offset = (page - 1) * limit
  const [r, countR] = await Promise.all([
    db!.execute({
      sql: `SELECT * FROM trail_runs WHERE project_id=? ORDER BY started_at DESC LIMIT ? OFFSET ?`,
      args: [projectId, limit, offset],
    }),
    db!.execute({
      sql: `SELECT COUNT(*) as cnt FROM trail_runs WHERE project_id=?`,
      args: [projectId],
    }),
  ])
  return { walks: r.rows.map(rowToWalk), total: Number((countR.rows[0] as any).cnt) }
}

export interface TrailRunHistoryEntry {
  runId: string
  status: "running" | "green" | "amber" | "red"
  startedAt: number
  durationMs: number | null  // null when the run is still in progress
  stepCount: number
}

// KLA-85: per-trail run history, newest-first, bounded by limit. Each entry carries enough
// data for a history table (timestamp, verdict badge, duration, step count) without loading
// the full run_steps payload. stepCount is a correlated subquery — efficient for the
// expected page sizes (limit ≤ 100).
export async function listTrailRunHistory(
  projectId: string,
  trailId: string,
  limit = 20,
): Promise<TrailRunHistoryEntry[]> {
  const r = await db!.execute({
    sql: `SELECT
            tr.id,
            tr.status,
            tr.started_at,
            tr.finished_at,
            (SELECT COUNT(*) FROM run_steps rs WHERE rs.run_id = tr.id AND rs.project_id = tr.project_id) AS step_count
          FROM trail_runs tr
          WHERE tr.project_id = ? AND tr.trail_id = ?
          ORDER BY tr.started_at DESC
          LIMIT ?`,
    args: [projectId, trailId, limit],
  })
  return r.rows.map((row: any) => ({
    runId: row.id,
    status: row.status as TrailRunHistoryEntry["status"],
    startedAt: Number(row.started_at),
    durationMs: row.finished_at != null ? Number(row.finished_at) - Number(row.started_at) : null,
    stepCount: Number(row.step_count),
  }))
}

import type { Finding, FindingKind, FindingStatus } from "./trails-types"

function rowToFinding(r: any): Finding {
  return {
    id: r.id, projectId: r.project_id, runId: r.run_id, stepId: r.step_id ?? null, trailId: r.trail_id,
    kind: r.kind as FindingKind, title: r.title, evidence: pj<Record<string, unknown>>(r.evidence_json),
    groundQuote: r.ground_quote ?? null,
    groundQuoteVerified: r.ground_quote_verified == null ? null : Number(r.ground_quote_verified) === 1,
    confidence: Number(r.confidence), dedupKey: r.dedup_key,
    contentSig: r.content_sig ?? null,
    recurrence: Number(r.recurrence),
    priority: r.priority ?? null,
    status: r.status as FindingStatus, connectorRef: r.connector_ref ?? null,
    connectorError: r.connector_error ?? null,
    createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  }
}

export async function recordFinding(
  projectId: string,
  input: { runId: string; trailId: string; stepId?: string; kind: FindingKind; title: string; evidence?: Record<string, unknown>; groundQuote?: string; groundQuoteVerified?: boolean | null; confidence: number; dedupKey: string; contentSig?: string | null; status?: FindingStatus; urlPath?: string | null },
): Promise<{ id: string; deduped: boolean; recurrence: number }> {
  // ── Cross-trail content dedup (KLA-77) ─────────────────────────────────────
  // If a content sig matches an existing finding in this project (regardless of which Trail or
  // step produced it), collapse onto that row with a recurrence bump rather than inserting a
  // duplicate. This catches same-bug-seen-from-two-trails and post-re-crystallization repeats.
  // The per-step dedupKey fast path below still handles the intra-trail case atomically.
  if (input.contentSig) {
    const existing = await db!.execute({
      sql: `SELECT id, recurrence FROM findings WHERE project_id=? AND content_sig=? LIMIT 1`,
      args: [projectId, input.contentSig],
    })
    if (existing.rows.length) {
      const row = existing.rows[0] as any
      const now = Date.now()
      const recurrence = Number(row.recurrence) + 1
      // KLA-81: recompute priority with the updated recurrence count.
      const severity = computeFindingSeverity({ kind: input.kind, confidence: input.confidence, recurrence })
      await db!.execute({
        sql: `UPDATE findings SET recurrence=?, priority=?, updated_at=? WHERE id=?`,
        args: [recurrence, severity, now, String(row.id)],
      })
      const id = String(row.id)
      try {
        const { ingestFinding } = await import("./expectations-ingest")
        const expId = await ingestFinding(db!, { projectId, findingId: id, title: input.title, dedupKey: input.dedupKey, urlPath: input.urlPath ?? null, sourceQuote: input.groundQuote ?? null, sourceQuoteVerified: input.groundQuoteVerified ?? null })
        // KLA-243: link finding → expectation if not already set.
        if (expId) {
          await db!.execute({ sql: `UPDATE findings SET expectation_id=? WHERE id=? AND expectation_id IS NULL`, args: [expId, id] })
        }
      } catch (e) { console.warn(`[expectations] recordFinding content-dedup ingest skipped:`, String(e)) }
      return { id, deduped: true, recurrence }
    }
  }

  // ── Per-step dedup: ATOMIC INSERT ON CONFLICT(project_id, dedup_key) ───────
  // INSERT the new finding; if (project_id, dedup_key) already exists (any status —
  // including 'dismissed', which is the §6 anti-slop guarantee), bump recurrence instead of
  // inserting a duplicate. Status is intentionally NOT updated so dismissed rows stay dismissed.
  // The UNIQUE INDEX finding_dedup_uq (added in applySchema migration) makes this atomic.
  const candidateId = uid("find_"); const now = Date.now()
  // KLA-81: compute initial priority (recurrence=1 for new rows; bumped rows recompute below).
  const initialSeverity = computeFindingSeverity({ kind: input.kind, confidence: input.confidence, recurrence: 1 })
  // B.13: ground_quote_verified is 1 only when the caller has verified the quote against captured
  // page text; NULL when unknown/self-referential so the ticket body relabels it "Reason:" not "Grounded:".
  const gqVerified = input.groundQuoteVerified == null ? null : (input.groundQuoteVerified ? 1 : 0)
  await db!.execute({
    sql: `INSERT INTO findings (id, project_id, run_id, step_id, trail_id, kind, title, evidence_json, ground_quote, ground_quote_verified, confidence, dedup_key, content_sig, recurrence, priority, status, connector_ref, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, NULL, ?, ?)
          ON CONFLICT(project_id, dedup_key) DO UPDATE SET
            recurrence = findings.recurrence + 1,
            updated_at = excluded.updated_at`,
    args: [candidateId, projectId, input.runId, input.stepId ?? null, input.trailId, input.kind, input.title, j(input.evidence), input.groundQuote ?? null, gqVerified, input.confidence, input.dedupKey, input.contentSig ?? null, initialSeverity, input.status ?? "queued", now, now],
  })
  const row = await db!.execute({
    sql: `SELECT id, recurrence FROM findings WHERE project_id=? AND dedup_key=?`,
    args: [projectId, input.dedupKey],
  })
  const id = String((row.rows[0] as any).id)
  const recurrence = Number((row.rows[0] as any).recurrence)
  const deduped = id !== candidateId
  // KLA-81: if this was a dedup bump, recompute priority with the new recurrence count.
  if (deduped) {
    const severity = computeFindingSeverity({ kind: input.kind, confidence: input.confidence, recurrence })
    await db!.execute({ sql: `UPDATE findings SET priority=? WHERE id=?`, args: [severity, id] })
  }
  try {
    const { ingestFinding } = await import("./expectations-ingest")
    const expId = await ingestFinding(db!, { projectId, findingId: id, title: input.title, dedupKey: input.dedupKey, urlPath: input.urlPath ?? null, sourceQuote: input.groundQuote ?? null, sourceQuoteVerified: input.groundQuoteVerified ?? null })
    // KLA-243: link finding → expectation if not already set.
    if (expId) {
      await db!.execute({ sql: `UPDATE findings SET expectation_id=? WHERE id=? AND expectation_id IS NULL`, args: [expId, id] })
    }
  } catch (e) { console.warn(`[expectations] recordFinding ${deduped ? "dedup " : ""}ingest skipped:`, String(e)) }
  return { id, deduped, recurrence }
}

export async function listFindings(
  projectId: string,
  opts?: { status?: FindingStatus; runId?: string; limit?: number; offset?: number },
): Promise<Finding[]> {
  const limit = Math.min(Math.max(opts?.limit ?? DEFAULT_FINDINGS_LIMIT, 1), MAX_FINDINGS_LIMIT)
  const offset = opts?.offset ?? 0
  const where: string[] = []
  const args: (string | number)[] = [projectId]
  if (opts?.status) { where.push("status=?"); args.push(opts.status) }
  if (opts?.runId) { where.push("run_id=?"); args.push(opts.runId) }
  // KLA-87: surface the findings that matter most first. Rank by recurrence × kind severity —
  // a bug seen many times, or a hard regression, should sit at the top of the review queue rather
  // than whatever was merely touched last. kind_weight mirrors trails-findings-severity ordering
  // (regression 3 > amber_heal 2 > visual 1). updated_at DESC is the final tiebreak so equal-rank
  // findings still read newest-first (preserves the old behavior within a rank bucket).
  const r = await db!.execute({
    sql: `SELECT * FROM findings WHERE project_id=?${where.length ? " AND " + where.join(" AND ") : ""}
          ORDER BY
            (CASE kind WHEN 'regression' THEN 3 WHEN 'amber_heal' THEN 2 ELSE 1 END) * MAX(recurrence, 1) DESC,
            updated_at DESC
          LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  })
  return r.rows.map(rowToFinding)
}

const DEFAULT_FINDINGS_LIMIT = 500
const MAX_FINDINGS_LIMIT = 10_000

// KLAVITYKLA-72: narrow single-finding lookup — WHERE id=? (project-scoped) instead of loading the
// whole project findings table and JS `.find()`-ing for one row. O(1) index hit vs O(n) per finding.
// Callers (fileFindingById / dismissFinding) that previously did `listFindings(projectId).find(...)`
// use this so they no longer scan the whole project once finding history accumulates.
export async function findFindingById(projectId: string, id: string): Promise<Finding | null> {
  const r = await db!.execute({
    sql: `SELECT * FROM findings WHERE project_id=? AND id=? LIMIT 1`,
    args: [projectId, id],
  })
  return r.rows.length ? rowToFinding(r.rows[0]) : null
}

// KLAVITYKLA-72: narrow per-run lookup — WHERE run_id=? bounds the scan to one walk's findings
// instead of loading every finding in the project and JS-filtering by runId. Optional status filter
// pushes the `status='queued'` predicate into SQL too. Ordered by created_at so processing is stable.
// Deliberately does NOT touch listFindings' ORDER BY / limits (KLA-87 owns those).
export async function findingsByRunId(
  projectId: string,
  runId: string,
  opts?: { status?: FindingStatus },
): Promise<Finding[]> {
  const where = ["project_id=?", "run_id=?"]
  const args: (string | number)[] = [projectId, runId]
  if (opts?.status) { where.push("status=?"); args.push(opts.status) }
  const r = await db!.execute({
    sql: `SELECT * FROM findings WHERE ${where.join(" AND ")} ORDER BY created_at ASC`,
    args,
  })
  return r.rows.map(rowToFinding)
}

export async function setFindingStatus(projectId: string, id: string, status: FindingStatus, connectorRef?: string): Promise<void> {
  try {
    await db!.execute({
      sql: `UPDATE findings
            SET status=?,
                connector_ref=COALESCE(?, connector_ref),
                connector_error=CASE WHEN ? IN ('filed','auto_filed') THEN NULL ELSE connector_error END,
                updated_at=?
            WHERE project_id=? AND id=?`,
      args: [status, connectorRef ?? null, status, Date.now(), projectId, id],
    })
  } catch (e) {
    if (!String((e as any)?.message || e).includes("connector_error")) throw e
    await db!.execute({
      sql: `UPDATE findings SET status=?, connector_ref=COALESCE(?, connector_ref), updated_at=? WHERE project_id=? AND id=?`,
      args: [status, connectorRef ?? null, Date.now(), projectId, id],
    })
  }
}

export async function setFindingConnectorError(projectId: string, id: string, error: string): Promise<void> {
  try {
    await db!.execute({
      sql: `UPDATE findings SET connector_error=?, updated_at=? WHERE project_id=? AND id=?`,
      args: [error, Date.now(), projectId, id],
    })
  } catch (e) {
    if (!String((e as any)?.message || e).includes("connector_error")) throw e
  }
}

// Insert an assert-type trail step at afterStepIdx+1. Returns the new "ts_"-prefixed step id.
// Used by the enforce/confirm graduation endpoint to crystallize a validated expectation into a
// deterministic Playwright assertion in an existing Trail.
// `checkpoint` accepts either the full Checkpoint (any of the 5 kinds — visible / textEquals /
// textContains / urlMatches / elementCount) or, for backward compatibility with older callers,
// a bare description string (persisted as a "visible" checkpoint). KLA-244: all 5 kinds now
// round-trip through checkpoint_json instead of being flattened to "visible".
export async function insertAssertStep(
  projectId: string,
  trailId: string,
  afterStepIdx: number,
  target: Record<string, string>,
  checkpoint: Checkpoint | string,
): Promise<string> {
  const cp: Checkpoint = typeof checkpoint === "string"
    ? { kind: "visible", description: checkpoint }
    : { kind: "visible", ...checkpoint }
  const id = "ts_" + crypto.randomUUID()
  await db!.execute({
    sql: `UPDATE trail_steps SET idx = idx + 1 WHERE project_id=? AND trail_id=? AND idx >= ?`,
    args: [projectId, trailId, afterStepIdx + 1],
  })
  await db!.execute({
    sql: `INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, trailId, projectId, afterStepIdx + 1, "assert", null,
           JSON.stringify(target), JSON.stringify(cp), Date.now()],
  })
  await bumpStepVersion(projectId, trailId)
  return id
}

export async function deleteTrailStep(projectId: string, stepId: string): Promise<void> {
  const r = await db!.execute({ sql: `SELECT trail_id FROM trail_steps WHERE id=? AND project_id=?`, args: [stepId, projectId] })
  await db!.execute({ sql: `DELETE FROM trail_steps WHERE id=? AND project_id=?`, args: [stepId, projectId] })
  if (r.rows.length) await bumpStepVersion(projectId, String((r.rows[0] as any).trail_id))
}

/**
 * KLAVITYKLA-275: reorder a draft trail's steps to match `orderedIds` exactly, reassigning each
 * step's idx to its 0-based position in the list. The id set must match the trail's current steps
 * one-for-one — a wrong length, a duplicate id, or any id that isn't a current step of this trail
 * writes NOTHING and returns false (fail-loud; never a partial reorder). On success bumps
 * step_version once so a subsequent re-verify walk runs against the new order. (tstep_trail_idx is a
 * NON-unique index, so reassigning idx in place needs no parking phase.)
 */
export async function reorderTrailSteps(projectId: string, trailId: string, orderedIds: string[]): Promise<boolean> {
  const current = await listTrailSteps(projectId, trailId)
  if (current.length === 0 || current.length !== orderedIds.length) return false
  if (new Set(orderedIds).size !== orderedIds.length) return false // duplicate id
  const currentIds = new Set(current.map((s) => s.id))
  for (const id of orderedIds) if (!currentIds.has(id)) return false // unknown / cross-trail id
  // All-or-nothing for real: the N idx writes AND the step_version bump go out as ONE transaction,
  // so a mid-flight failure can never leave a half-reordered trail (or a bumped version with the
  // old order) visible to a concurrently-starting walk.
  const stmts = orderedIds.map((id, i) => ({
    sql: `UPDATE trail_steps SET idx=? WHERE id=? AND project_id=?`,
    args: [i, id, projectId] as unknown[],
  }))
  stmts.push({
    sql: `UPDATE trails SET step_version = step_version + 1, updated_at = ? WHERE project_id = ? AND id = ?`,
    args: [Date.now(), projectId, trailId] as unknown[],
  })
  await db!.batch(stmts as any, "write")
  return true
}

// `target` (B.9 / KLA-249): repoint an existing step's locator in place — used by the "Edit guard"
// path to adjust an enforced assert step's target without deleting-and-recreating the step (which
// would destroy the expectation's enforced history). Only applied when present in the patch.
export type StepPatch = { actionValue?: string | null; checkpoint?: Checkpoint | null; target?: Record<string, string> | null }

export async function updateTrailStep(projectId: string, stepId: string, patch: StepPatch): Promise<boolean> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_steps WHERE id=? AND project_id=?`, args: [stepId, projectId] })
  if (!r.rows.length) return false
  const row = r.rows[0]
  const newActionValue = "actionValue" in patch ? (patch.actionValue ?? null) : row.action_value
  const newCheckpoint = "checkpoint" in patch ? (patch.checkpoint == null ? null : JSON.stringify(patch.checkpoint)) : row.checkpoint_json
  const newTarget = "target" in patch ? (patch.target == null ? null : JSON.stringify(patch.target)) : row.target_json
  await db!.execute({
    sql: `UPDATE trail_steps SET action_value=?, checkpoint_json=?, target_json=? WHERE id=? AND project_id=?`,
    args: [newActionValue, newCheckpoint, newTarget, stepId, projectId],
  })
  await bumpStepVersion(projectId, String(row.trail_id))
  return true
}

// ── KLA-73: Persona-judged walks ──────────────────────────────────────────────

function rowToJudgment(r: any): WalkJudgment {
  return {
    id: String(r.id),
    projectId: String(r.project_id),
    runId: String(r.run_id),
    personaId: String(r.persona_id),
    personaName: String(r.persona_name),
    verdicts: r.verdicts_json ? JSON.parse(String(r.verdicts_json)) : [],
    overallNote: r.overall_note ?? null,
    createdAt: Number(r.created_at),
  }
}

export async function recordWalkJudgment(
  projectId: string,
  input: { runId: string; personaId: string; personaName: string; verdicts: PersonaVerdict[]; overallNote?: string | null },
): Promise<string> {
  const id = uid("wj_")
  await db!.execute({
    sql: `INSERT INTO walk_judgments (id, project_id, run_id, persona_id, persona_name, verdicts_json, overall_note, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, projectId, input.runId, input.personaId, input.personaName, JSON.stringify(input.verdicts), input.overallNote ?? null, Date.now()],
  })
  return id
}

/** Returns the most-recent judgment for a walk, or null if none exists. */
export async function getWalkJudgment(projectId: string, runId: string): Promise<WalkJudgment | null> {
  const r = await db!.execute({
    sql: `SELECT * FROM walk_judgments WHERE project_id=? AND run_id=? ORDER BY created_at DESC LIMIT 1`,
    args: [projectId, runId],
  })
  return r.rows.length ? rowToJudgment(r.rows[0]) : null
}

/** Returns all judgments for a walk (newest first). */
export async function listWalkJudgments(projectId: string, runId: string): Promise<WalkJudgment[]> {
  const r = await db!.execute({
    sql: `SELECT * FROM walk_judgments WHERE project_id=? AND run_id=? ORDER BY created_at DESC`,
    args: [projectId, runId],
  })
  return r.rows.map(rowToJudgment)
}
