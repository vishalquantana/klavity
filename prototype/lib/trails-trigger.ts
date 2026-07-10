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
import { getTrail, startWalk, finishWalk, getWalk } from "./trails"
import { walkTrail } from "./trails-runner"
import type { Verdict } from "./trails-types"
import { configuredVisionResolver } from "./trails-vision"
import { maybeAutoFileWalkFindings } from "./trails-findings-gate"

export type WalkFn = (projectId: string, trailId: string, runId: string) => Promise<{ verdict: Verdict; llmCalls: number; summary?: Record<string, unknown> }>

const WALK_DEADLINE_MS = 120_000

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
  deps?: { walk?: WalkFn; trigger?: "manual" | "scheduled"; environmentName?: string | null },
): Promise<{ runId: string }> {
  const trail = await getTrail(projectId, trailId)
  if (!trail) throw new Error("trail not found")
  if (trail.status === "paused") throw new Error("trail is paused")

  const trigger = deps?.trigger ?? "manual"
  const environmentName = deps?.environmentName ?? null

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
  })

  // Surface a synchronous WalkBusyError (or a startWalk failure) to the caller; otherwise resolve as
  // soon as the run row exists. The background `slotHeld` keeps running; swallow its settle so a
  // late finalize can't raise an unhandled rejection (the inner try/catch already finalized the run).
  slotHeld.catch((err) => { rejectStart(err) })
  slotHeld.then(() => {}, () => {})

  const runId = await started
  return { runId }
}
