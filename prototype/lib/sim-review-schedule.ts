// lib/sim-review-schedule.ts
// KLA-254 — Scheduled Sim reviews per client project.
//
// Design:
//   • Each project can have N sim_review_schedules (frequency: daily | weekly, target URL,
//     optional Sim subset).
//   • `runDueSchedules(opts)` queries all enabled schedules whose next_run_at <= now,
//     runs them one by one through the SAME pipeline as /api/sim/preview (authenticated
//     projectId path), and advances next_run_at after each fire.
//   • Caller wires up a periodic tick (setInterval or the /api/sim-review-schedules/tick
//     endpoint). A real cron every 5–60 min is a natural follow-up.
//   • Tenant-safe: each schedule row is project_id-scoped; listDueSimReviewSchedules
//     fetches all due, and we re-verify project existence before running.
//
// Intentional v1 simplifications:
//   • No distributed lock: double-fire risk is low since the tick is periodic and
//     touchSimReviewScheduleRan advances next_run_at before returning.
//     (A future migration can add a "running" status for extra safety.)
//   • "weekly" cadence = exactly 7 days from last run — no day-of-week preference.
//     A follow-up can expose a cron expression for full control.

import type { Client } from "@libsql/client"
import {
  listDueSimReviewSchedules, touchSimReviewScheduleRan, listPersonas,
  insertScreenshot, insertSimRun, type SimReviewScheduleRow,
} from "./db"
import { runSimReviews, splitUrl, buildSimRunSummary } from "./sim-review"
import { screenshotUrl } from "./sim-preview"
import { safeFetch } from "./safe-fetch"

// Injectable dependencies so the runner can be fully unit-tested without a browser or LLM.
export interface ScheduleRunDeps {
  /** Screenshot a URL; returns { imageB64, mediaType }. */
  takeScreenshot: (url: string) => Promise<{ imageB64: string; mediaType: string }>
  /** React fn forwarded to runSimReviews. */
  reactFn: Parameters<typeof runSimReviews>[0]["reactFn"]
  /** Citation resolver forwarded to runSimReviews. */
  resolveCitationsFn: Parameters<typeof runSimReviews>[0]["resolveCitationsFn"]
  /** libSQL client (may be null in tests with no DB). */
  db: Client | null
  /** Optional: store screenshot bytes — if omitted, a no-s3-* id is generated. */
  storeScreenshot?: (bytes: Buffer, mediaType: string, projectId: string) => Promise<string>
}

export interface ScheduleRunResult {
  scheduleId: string
  projectId: string
  url: string
  simCount: number
  totalObservations: number
  simRunId: string | null
  skipped?: string   // reason when the schedule was not run (e.g. "no Sims")
}

/** Run one due schedule. Returns a result summary. Never throws — errors are caught and returned as skipped. */
async function runOneSchedule(
  schedule: SimReviewScheduleRow,
  deps: ScheduleRunDeps,
  nowMs: number,
): Promise<ScheduleRunResult> {
  const base: Pick<ScheduleRunResult, "scheduleId" | "projectId" | "url"> = {
    scheduleId: schedule.id,
    projectId: schedule.projectId,
    url: schedule.targetUrl,
  }

  try {
    // Load the project's Sims (or subset).
    let allSims = await listPersonas(schedule.projectId)
    if (schedule.simIds && schedule.simIds.length > 0) {
      const simIdSet = new Set(schedule.simIds)
      allSims = allSims.filter((s) => simIdSet.has(s.id))
    }
    if (!allSims.length) {
      await touchSimReviewScheduleRan(schedule.id, nowMs, schedule.frequency)
      return { ...base, simCount: 0, totalObservations: 0, simRunId: null, skipped: "no Sims" }
    }

    // Screenshot the target URL.
    let shot: { imageB64: string; mediaType: string }
    try {
      shot = await deps.takeScreenshot(schedule.targetUrl)
    } catch (e: any) {
      console.warn(`[sim-schedule] screenshot failed for schedule ${schedule.id}:`, e?.message || e)
      // Don't advance next_run_at — retry on next tick.
      return { ...base, simCount: 0, totalObservations: 0, simRunId: null, skipped: `screenshot error: ${e?.message || "unknown"}` }
    }

    // Store screenshot (best-effort; if storeScreenshot not provided, use a placeholder id).
    let screenshotId: string
    if (deps.storeScreenshot) {
      try {
        const bytes = Buffer.from(shot.imageB64, "base64")
        screenshotId = await deps.storeScreenshot(bytes, shot.mediaType, schedule.projectId)
      } catch (e: any) {
        console.warn("[sim-schedule] screenshot storage skipped:", e?.message || e)
        screenshotId = "no-s3-sched-" + Date.now().toString(36)
      }
    } else {
      screenshotId = "no-s3-sched-" + Date.now().toString(36)
    }

    const { urlHost, urlPath } = splitUrl(schedule.targetUrl)
    const actorEmail = schedule.createdBy  // scheduled runs are attributed to the schedule creator
    const seenKeys = allSims.map((s) => `sched:${schedule.id}:${s.id}:${urlPath || "/"}`)

    const reviews = await runSimReviews({
      projectId: schedule.projectId,
      urlPath, urlHost, pageUrl: schedule.targetUrl,
      imageB64: shot.imageB64, mediaType: shot.mediaType,
      targetSims: allSims,
      actorEmail,
      screenshotId,
      seenKeys,
      seenHashes: new Set(),
      sessionId: undefined,
      mode: "all",
      adhoc: true,   // scheduled = full fresh scan, no session dedup
      reactFn: deps.reactFn,
      resolveCitationsFn: deps.resolveCitationsFn,
      markSeen: () => {},
      db: deps.db,
    })

    // Persist a sim_runs record so the dashboard shows run history.
    let simRunId: string | null = null
    if (deps.db) {
      try {
        simRunId = await insertSimRun({
          projectId: schedule.projectId,
          url: schedule.targetUrl,
          simIds: schedule.simIds,
          screenshotId,
          reactions: reviews,
          actorEmail,
          label: `Scheduled (${schedule.frequency})`,
          status: "done",
          finishedAt: Date.now(),
        })
      } catch (e: any) {
        console.warn("[sim-schedule] sim_runs insert skipped:", e?.message || e)
      }
    }

    // Advance next_run_at AFTER successful run.
    await touchSimReviewScheduleRan(schedule.id, nowMs, schedule.frequency)

    const { simCount, totalObservations } = buildSimRunSummary(reviews)
    console.log(`[sim-schedule] schedule=${schedule.id} project=${schedule.projectId} url=${schedule.targetUrl} sims=${simCount} obs=${totalObservations}`)
    return { ...base, simCount, totalObservations, simRunId }
  } catch (e: any) {
    console.warn(`[sim-schedule] runOneSchedule error for schedule ${schedule.id}:`, e?.message || e)
    return { ...base, simCount: 0, totalObservations: 0, simRunId: null, skipped: `error: ${e?.message || "unknown"}` }
  }
}

export interface RunDueOptions extends ScheduleRunDeps {
  /** Timestamp to compare against next_run_at. Defaults to Date.now(). */
  nowMs?: number
}

/**
 * Run all enabled schedules that are due (next_run_at <= now).
 * Called by the /api/sim-review-schedules/tick endpoint or a setInterval cron tick.
 *
 * Returns an array of per-schedule results. Never throws.
 *
 * Follow-up: wire this to a real OS-level cron (or the trail scheduler setInterval) so it
 * fires automatically every hour without needing an external POST to /tick.
 */
export async function runDueSchedules(opts: RunDueOptions): Promise<ScheduleRunResult[]> {
  const nowMs = opts.nowMs ?? Date.now()
  let due: SimReviewScheduleRow[]
  try {
    due = await listDueSimReviewSchedules(nowMs)
  } catch (e: any) {
    console.warn("[sim-schedule] listDueSimReviewSchedules failed:", e?.message || e)
    return []
  }
  if (!due.length) return []

  const results: ScheduleRunResult[] = []
  for (const schedule of due) {
    const result = await runOneSchedule(schedule, opts, nowMs)
    results.push(result)
  }
  return results
}

/**
 * Build the real-browser + real-LLM ScheduleRunDeps from the production server context.
 * Call this in server.ts when wiring up the /tick endpoint.
 *
 * @param reactFn - from reactToPage (server.ts)
 * @param resolveCitationsFn - from resolveCitations (server.ts)
 * @param dbClient - the shared Turso client
 * @param storeScreenshotFn - optional; persists screenshot bytes to S3 and returns screenshotId
 */
export function buildProductionDeps(
  reactFnArg: ScheduleRunDeps["reactFn"],
  resolveCitationsFnArg: ScheduleRunDeps["resolveCitationsFn"],
  dbClient: Client | null,
  storeScreenshotFn?: ScheduleRunDeps["storeScreenshot"],
): ScheduleRunDeps {
  return {
    takeScreenshot: screenshotUrl,
    reactFn: reactFnArg,
    resolveCitationsFn: resolveCitationsFnArg,
    db: dbClient,
    storeScreenshot: storeScreenshotFn,
  }
}
