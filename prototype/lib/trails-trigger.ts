// Plan G — the thin on-demand walk trigger. runWalkNow reserves the single walk-slot (else throws
// WalkBusyError), creates the Walk row, returns its runId to the caller IMMEDIATELY, and drives the
// actual walk in the BACKGROUND (holding the slot for the whole walk). A walk crash NEVER propagates
// to the caller / server event loop: it finalizes the run RED and releases the slot.
//
// The walk fn is INJECTABLE (deps.walk) so unit tests run with a stub (no browser); the default
// realWalk drives the Trail's own baseUrl with prod-safe Chromium + replay capture, adopting the
// pre-created runId so the run_steps / replay / verdict all land on the runId the caller holds.
// Vision (Tier-2) is OFF in realWalk; a flagged Trail (the regression demo) opts in via a custom
// deps.walk that calls walkTrail with a vision resolver.
import { withWalkSlot, WalkBusyError, CHROMIUM_PROD_ARGS, setCurrentWalkRunId, getCurrentWalkAbortSignal } from "./trails-browser"
import { ToolError } from "./mcp/tool-error"
import { getTrail, startWalk, finishWalk, getWalk } from "./trails"
import { walkTrail } from "./trails-runner"
import type { Verdict } from "./trails-types"
import { configuredVisionResolver } from "./trails-vision"
import { maybeAutoFileWalkFindings } from "./trails-findings-gate"
import { projectById } from "./db"
import { projectEntitlement } from "./entitlement"
import { db as sharedDb } from "./db"
// KLA-547: the first AutoSim walk is a conversion milestone — emitted through the shared taxonomy
// helper (funnel_events row + PostHog mirror) so AutoSim adoption is queryable next to first_report.
import { trackMilestone } from "./funnel"

export type WalkFn = (projectId: string, trailId: string, runId: string) => Promise<{ verdict: Verdict; llmCalls: number; summary?: Record<string, unknown> }>

const WALK_DEADLINE_MS = 120_000

// KLA-547: how many AutoSim walks has this project run before now? Best-effort read of the durable
// trail_runs table (the same store startWalk inserts into); any error reads as "not first" so a DB
// hiccup suppresses the milestone instead of double-firing it on a later walk.
async function defaultPriorWalkCount(projectId: string): Promise<number> {
  try {
    const r = await sharedDb!.execute({
      sql: "SELECT COUNT(*) AS n FROM trail_runs WHERE project_id=?",
      args: [projectId],
    })
    return Number((r.rows[0] as any)?.n ?? 1)
  } catch {
    return 1 // fail closed: treat as "walks exist" → no milestone fire
  }
}

/**
 * KLA-547: emit `first_autosim` when this walk is the project's FIRST (priorWalkCount === 0).
 *
 * MUST be called with a count captured BEFORE startWalk inserts the current run's row — otherwise
 * a genuine first walk counts itself (>=1) and the milestone can never fire. Exported so the gate
 * is unit-testable without touching trails/db singletons. Never throws; an analytics failure must
 * not reach the walk slot or the caller's response path.
 */
export async function maybeEmitFirstAutosim(
  projectId: string,
  runId: string,
  trigger: "manual" | "scheduled",
  priorWalkCount: number,
): Promise<void> {
  if (priorWalkCount !== 0) return
  try {
    await trackMilestone(sharedDb, {
      milestone: "first_autosim",
      projectId,
      props: { trigger, sim_run_id: runId },
    })
  } catch { /* non-fatal by contract */ }
}

// Default real walk: drive the Trail's own baseUrl with prod-safe Chromium + replay capture, ADOPTING
// the pre-created runId so everything lands on the caller's runId. Tier-2 vision self-heal is enabled
// when OpenRouter is configured (and KLAV_AUTOSIM_VISION_SELFHEAL is not set to 0); the resolver itself
// is daily-spend capped.
// stepShots:true enables per-step jpeg captures (PDF task 1); the default S3 uploader is used
// (injected via walkTrail default; try/catch ensures S3-absent local envs never fail a step).
const realWalk: WalkFn = async (projectId, trailId, runId) => {
  const trail = await getTrail(projectId, trailId)
  if (!trail) return { verdict: "red", llmCalls: 0, summary: { error: `trail ${trailId} not found in project ${projectId}` } }
  const vision = configuredVisionResolver()
  const signal = getCurrentWalkAbortSignal() ?? undefined
  const s = await walkTrail(projectId, trailId, {
    fixtureUrl: trail.baseUrl, replay: true, launchArgs: CHROMIUM_PROD_ARGS, deadlineMs: WALK_DEADLINE_MS, runId,
    stepShots: true, signal, liveWatch: true,
    ...(vision ? { vision } : {}),
  })
  return { verdict: s.verdict, llmCalls: s.llmCalls, summary: { ...(s.reasons.length ? { reasons: s.reasons } : {}) } }
}

/**
 * Kick off a Trail walk on-demand. Resolves `{ runId }` as soon as the Walk row exists (the caller —
 * the dashboard route — returns immediately and polls for the verdict). A 2nd call while a walk is in
 * flight rejects with WalkBusyError (→ HTTP 409). An unknown trail throws before any slot is taken.
 */
export async function runWalkNow(
  projectId: string,
  trailId: string,
  deps?: {
    walk?: WalkFn
    trigger?: "manual" | "scheduled"
    environmentName?: string | null
    /** KLA-547 test seam: count PRIOR trail_runs rows for this project. Defaults to the shared DB. */
    priorWalkCount?: () => Promise<number>
  },
): Promise<{ runId: string }> {
  const trail = await getTrail(projectId, trailId)
  if (!trail) throw new ToolError("trail not found")
  if (trail.status === "paused") throw new ToolError("trail is paused")
  // Snap-only project gating: a locked project's Trails must never launch a walk — covers the
  // manual-trigger HTTP route AND the scheduler loop (both call runWalkNow), so this is the single
  // enforcement point that keeps a Snap-locked project from burning AI spend via AutoSim.
  const walkProj = await projectById(projectId)
  if (projectEntitlement(walkProj?.planOverride).snapOnly) throw new ToolError("trail is snap-locked")

  const trigger = deps?.trigger ?? "manual"
  const environmentName = deps?.environmentName ?? null

  // KLA-547: count PRIOR trail_runs rows BEFORE startWalk inserts this run's row — after the insert
  // a genuine first walk would already see itself (count >= 1) and the milestone could never fire.
  // A rejected read resolves to 1, which fails closed inside maybeEmitFirstAutosim (no fire) rather
  // than risking a false fire on a later walk.
  const priorWalkCount = await (deps?.priorWalkCount?.(projectId) ?? defaultPriorWalkCount(projectId)).catch(() => 1)

  // A deferred we resolve the instant the Walk row exists, so the caller gets a real runId while the
  // background walk keeps running and HOLDING the slot until it finalizes.
  let resolveStarted!: (runId: string) => void
  let rejectStart!: (err: unknown) => void
  const started = new Promise<string>((res, rej) => { resolveStarted = res; rejectStart = rej })

  // withWalkSlot throws WalkBusyError SYNCHRONOUSLY (in this turn) when the slot is held, so a 2nd
  // concurrent runWalkNow rejects on `slotHeld` before it ever resolves `started`. On a free slot the
  // promise runs the whole walk in the background; we only await `started`.
  const slotHeld = withWalkSlot(async () => {
    let runId: string
    try {
      runId = await startWalk(projectId, trailId, trigger, environmentName)
    } catch (e) {
      rejectStart(e)
      return
    }
    setCurrentWalkRunId(runId)
    resolveStarted(runId)
    // KLA-547: first-AutoSim milestone. This is THE choke point every walk passes through (dashboard
    // button + scheduled cron), gated on the pre-insert prior-walk count captured above, so neither
    // trigger can be missed and a second walk can never re-fire. Fire-and-forget + fully swallowed:
    // an analytics hiccup must not touch the walk slot or the caller's response path.
    void maybeEmitFirstAutosim(projectId, runId, trigger, priorWalkCount)
    const walk = deps?.walk ?? realWalk
    try {
      const { verdict, llmCalls, summary } = await walk(projectId, trailId, runId)
      const currentWalk = await getWalk(projectId, runId)
      if (!currentWalk || currentWalk.status === "running") {
        await finishWalk(projectId, runId, { status: verdict, llmCalls, ...(summary ? { summary } : {}) })
      }
      // KLA-112: auto-file eligible findings best-effort; never propagates into the slot.
      maybeAutoFileWalkFindings(projectId, runId).catch(
        (e) => console.warn(`[trails-findings-gate] maybeAutoFileWalkFindings error for ${runId}: ${String(e?.message ?? e)}`),
      )
    } catch (e: any) {
      // Crash isolation: a walk throw finalizes the run RED + releases the slot, never propagates.
      const currentWalk = await getWalk(projectId, runId).catch(() => null)
      if (!currentWalk || currentWalk.status === "running") {
        // Any throw that escapes the walk itself (e.g. an infra/browser failure that got past the
        // walk's own guards) is a CRASH, not a trail regression — tag it so the report is honest.
        await finishWalk(projectId, runId, { status: "red", llmCalls: 0, summary: { failureKind: "crash", error: String(e?.message || e) } }).catch(() => {})
      }
    }
  }, projectId) // KLA-266: key the walk queue by project for per-project fairness

  // Surface a synchronous WalkBusyError (or a startWalk failure) to the caller; otherwise resolve as
  // soon as the run row exists. The background `slotHeld` keeps running; swallow its settle so a
  // late finalize can't raise an unhandled rejection (the inner try/catch already finalized the run).
  slotHeld.catch((err) => { rejectStart(err) })
  slotHeld.then(() => {}, () => {})

  const runId = await started
  return { runId }
}
