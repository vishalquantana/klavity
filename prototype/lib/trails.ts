import { db } from "./db"
import type { Trail, TrailStep, TrailStatus, StepAction, Fingerprint, TrailViewport } from "./trails-types"
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
    scheduledLastRunAt: r.scheduled_last_run_at == null ? null : Number(r.scheduled_last_run_at),
    judgePersonaId: r.judge_persona_id ?? null,
  }
}

export async function createTrail(
  projectId: string,
  input: { name: string; intent?: string; baseUrl: string; viewport?: TrailViewport | string | null; authorKind?: Trail["authorKind"]; createdBy?: string },
): Promise<string> {
  const id = uid("trl_"); const now = Date.now()
  const viewport = normalizeTrailViewport(input.viewport)
  await db!.execute({
    sql: `INSERT INTO trails (id, project_id, name, intent, base_url, viewport_json, baseline_ref, author_kind, status, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, NULL, ?, 'draft', ?, ?, ?)`,
    args: [id, projectId, input.name, input.intent ?? "", input.baseUrl, j(viewport), input.authorKind ?? "human", input.createdBy ?? null, now, now],
  })
  return id
}

export async function getTrail(projectId: string, id: string): Promise<Trail | null> {
  const r = await db!.execute({ sql: `SELECT * FROM trails WHERE project_id=? AND id=?`, args: [projectId, id] })
  return r.rows.length ? rowToTrail(r.rows[0]) : null
}

export async function listTrails(projectId: string): Promise<Trail[]> {
  const r = await db!.execute({ sql: `SELECT * FROM trails WHERE project_id=? ORDER BY created_at DESC`, args: [projectId] })
  return r.rows.map(rowToTrail)
}

export async function setTrailStatus(projectId: string, id: string, status: TrailStatus): Promise<void> {
  await db!.execute({ sql: `UPDATE trails SET status=?, updated_at=? WHERE project_id=? AND id=?`, args: [status, Date.now(), projectId, id] })
}

export type TrailPatch = { name?: string; status?: TrailStatus; schedule?: string | null; viewport?: TrailViewport | string | null }

export async function updateTrail(projectId: string, id: string, patch: TrailPatch): Promise<boolean> {
  const r = await db!.execute({ sql: `SELECT id FROM trails WHERE project_id=? AND id=?`, args: [projectId, id] })
  if (!r.rows.length) return false
  const sets: string[] = []
  const args: (string | number | null)[] = []
  if (patch.name != null) { sets.push("name=?"); args.push(patch.name) }
  if (patch.status != null) { sets.push("status=?"); args.push(patch.status) }
  if ("schedule" in patch) { sets.push("schedule_cron=?"); args.push(patch.schedule ?? null) }
  if ("viewport" in patch) { sets.push("viewport_json=?"); args.push(j(normalizeTrailViewport(patch.viewport))) }
  if (!sets.length) return true
  sets.push("updated_at=?"); args.push(Date.now())
  args.push(projectId, id)
  await db!.execute({ sql: `UPDATE trails SET ${sets.join(", ")} WHERE project_id=? AND id=?`, args })
  return true
}

export async function listAllScheduledTrails(): Promise<Trail[]> {
  const r = await db!.execute({ sql: `SELECT * FROM trails WHERE schedule_cron IS NOT NULL AND status='active'`, args: [] })
  return r.rows.map(rowToTrail)
}

export async function touchScheduledLastRunAt(projectId: string, trailId: string, ts: number): Promise<void> {
  await db!.execute({ sql: `UPDATE trails SET scheduled_last_run_at=?, updated_at=? WHERE project_id=? AND id=?`, args: [ts, ts, projectId, trailId] })
}

function rowToStep(r: any): TrailStep {
  return {
    id: r.id, trailId: r.trail_id, projectId: r.project_id, idx: Number(r.idx),
    action: r.action as StepAction, actionValue: r.action_value ?? null,
    target: pj<Fingerprint>(r.target_json), checkpoint: pj<{ description: string }>(r.checkpoint_json),
    createdAt: Number(r.created_at),
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
  input: { idx: number; action: StepAction; actionValue?: string; target?: Fingerprint; checkpoint?: { description: string } },
): Promise<string> {
  const id = uid("tstep_")
  await db!.execute({
    sql: `INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, trailId, projectId, input.idx, input.action, input.actionValue ?? null, j(input.target), j(input.checkpoint), Date.now()],
  })
  await bumpStepVersion(projectId, trailId)
  return id
}

export async function listTrailSteps(projectId: string, trailId: string): Promise<TrailStep[]> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_steps WHERE project_id=? AND trail_id=? ORDER BY idx ASC`, args: [projectId, trailId] })
  return r.rows.map(rowToStep)
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

export async function startWalk(projectId: string, trailId: string, trigger: "manual" = "manual"): Promise<string> {
  const id = uid("walk_")
  // Pin the Trail's current step_version so this Walk always shows the steps it actually ran against,
  // even if the Trail is edited later. DEFAULT 1 handles rows written before this column existed.
  const tv = await db!.execute({ sql: `SELECT step_version FROM trails WHERE project_id=? AND id=?`, args: [projectId, trailId] })
  const trailVersion = tv.rows.length ? (Number((tv.rows[0] as any).step_version) || 1) : 1
  await db!.execute({
    sql: `INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, summary_json, trail_version, started_at, finished_at)
          VALUES (?, ?, ?, ?, 'running', 0, NULL, ?, ?, NULL)`,
    args: [id, trailId, projectId, trigger, trailVersion, Date.now()],
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

export async function finishWalk(projectId: string, runId: string, input: { status: Verdict; llmCalls: number; summary?: Record<string, unknown> }): Promise<void> {
  await db!.execute({
    sql: `UPDATE trail_runs SET status=?, llm_calls=?, summary_json=?, finished_at=? WHERE project_id=? AND id=?`,
    args: [input.status, input.llmCalls, j(input.summary), Date.now(), projectId, runId],
  })
}

export async function getWalk(projectId: string, runId: string): Promise<Walk | null> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_runs WHERE project_id=? AND id=?`, args: [projectId, runId] })
  return r.rows.length ? rowToWalk(r.rows[0]) : null
}

export async function listRunSteps(projectId: string, runId: string): Promise<RunStep[]> {
  const r = await db!.execute({ sql: `SELECT * FROM run_steps WHERE project_id=? AND run_id=? ORDER BY idx ASC`, args: [projectId, runId] })
  return r.rows.map(rowToRunStep)
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

import type { Finding, FindingKind, FindingStatus } from "./trails-types"

function rowToFinding(r: any): Finding {
  return {
    id: r.id, projectId: r.project_id, runId: r.run_id, stepId: r.step_id ?? null, trailId: r.trail_id,
    kind: r.kind as FindingKind, title: r.title, evidence: pj<Record<string, unknown>>(r.evidence_json),
    groundQuote: r.ground_quote ?? null, confidence: Number(r.confidence), dedupKey: r.dedup_key,
    recurrence: Number(r.recurrence), status: r.status as FindingStatus, connectorRef: r.connector_ref ?? null,
    connectorError: r.connector_error ?? null,
    createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  }
}

export async function recordFinding(
  projectId: string,
  input: { runId: string; trailId: string; stepId?: string; kind: FindingKind; title: string; evidence?: Record<string, unknown>; groundQuote?: string; confidence: number; dedupKey: string; status?: FindingStatus },
): Promise<{ id: string; deduped: boolean; recurrence: number }> {
  // Atomic upsert: INSERT the new finding; if (project_id, dedup_key) already exists (any status —
  // including 'dismissed', which is the §6 anti-slop guarantee), bump recurrence instead of inserting a
  // duplicate. Status is intentionally NOT updated so dismissed rows stay dismissed.
  // The UNIQUE INDEX finding_dedup_uq (added in applySchema migration) makes this a single atomic
  // statement — concurrent calls cannot both INSERT; the loser always hits ON CONFLICT and bumps.
  const candidateId = uid("find_"); const now = Date.now()
  await db!.execute({
    sql: `INSERT INTO findings (id, project_id, run_id, step_id, trail_id, kind, title, evidence_json, ground_quote, confidence, dedup_key, recurrence, status, connector_ref, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NULL, ?, ?)
          ON CONFLICT(project_id, dedup_key) DO UPDATE SET
            recurrence = findings.recurrence + 1,
            updated_at = excluded.updated_at`,
    args: [candidateId, projectId, input.runId, input.stepId ?? null, input.trailId, input.kind, input.title, j(input.evidence), input.groundQuote ?? null, input.confidence, input.dedupKey, input.status ?? "queued", now, now],
  })
  const row = await db!.execute({
    sql: `SELECT id, recurrence FROM findings WHERE project_id=? AND dedup_key=?`,
    args: [projectId, input.dedupKey],
  })
  const id = String((row.rows[0] as any).id)
  const recurrence = Number((row.rows[0] as any).recurrence)
  const deduped = id !== candidateId
  try {
    const { ingestFinding } = await import("./expectations-ingest")
    await ingestFinding(db!, { projectId, findingId: id, title: input.title, dedupKey: input.dedupKey, urlPath: null })
  } catch (e) { console.warn(`[expectations] recordFinding ${deduped ? "dedup " : ""}ingest skipped:`, String(e)) }
  return { id, deduped, recurrence }
}

export async function listFindings(
  projectId: string,
  opts?: { status?: FindingStatus; limit?: number; offset?: number },
): Promise<Finding[]> {
  const limit = Math.min(Math.max(opts?.limit ?? DEFAULT_FINDINGS_LIMIT, 1), MAX_FINDINGS_LIMIT)
  const offset = opts?.offset ?? 0
  const where = opts?.status ? ` AND status=?` : ""
  const args: (string | number)[] = [projectId]
  if (opts?.status) args.push(opts.status)
  const r = await db!.execute({
    sql: `SELECT * FROM findings WHERE project_id=?${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  })
  return r.rows.map(rowToFinding)
}

const DEFAULT_FINDINGS_LIMIT = 500
const MAX_FINDINGS_LIMIT = 10_000

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
export async function insertAssertStep(
  projectId: string,
  trailId: string,
  afterStepIdx: number,
  target: Record<string, string>,
  description: string,
): Promise<string> {
  const id = "ts_" + crypto.randomUUID()
  await db!.execute({
    sql: `UPDATE trail_steps SET idx = idx + 1 WHERE project_id=? AND trail_id=? AND idx >= ?`,
    args: [projectId, trailId, afterStepIdx + 1],
  })
  await db!.execute({
    sql: `INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, trailId, projectId, afterStepIdx + 1, "assert", null,
           JSON.stringify(target), JSON.stringify({ kind: "visible", description }), Date.now()],
  })
  await bumpStepVersion(projectId, trailId)
  return id
}

export async function deleteTrailStep(projectId: string, stepId: string): Promise<void> {
  const r = await db!.execute({ sql: `SELECT trail_id FROM trail_steps WHERE id=? AND project_id=?`, args: [stepId, projectId] })
  await db!.execute({ sql: `DELETE FROM trail_steps WHERE id=? AND project_id=?`, args: [stepId, projectId] })
  if (r.rows.length) await bumpStepVersion(projectId, String((r.rows[0] as any).trail_id))
}

export type StepPatch = { actionValue?: string | null; checkpoint?: { description: string } | null }

export async function updateTrailStep(projectId: string, stepId: string, patch: StepPatch): Promise<boolean> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_steps WHERE id=? AND project_id=?`, args: [stepId, projectId] })
  if (!r.rows.length) return false
  const row = r.rows[0]
  const newActionValue = "actionValue" in patch ? (patch.actionValue ?? null) : row.action_value
  const newCheckpoint = "checkpoint" in patch ? (patch.checkpoint == null ? null : JSON.stringify(patch.checkpoint)) : row.checkpoint_json
  await db!.execute({
    sql: `UPDATE trail_steps SET action_value=?, checkpoint_json=? WHERE id=? AND project_id=?`,
    args: [newActionValue, newCheckpoint, stepId, projectId],
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
