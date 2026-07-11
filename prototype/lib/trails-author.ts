// AutoSims F1 — the LLM-drive authoring engine. Loop: screenshot+DOM → model proposes ONE action →
// validate selector resolves to EXACTLY ONE element → execute with Playwright auto-wait → record a
// TrajectoryStep. On "done": crystallize → DRAFT trail → zero-LLM Verification Walk (suppressed
// findings) → outcome. On "stall"/caps/errors: stalled outcome with the exact reason (stop-show-
// refine UX). Secrets: the model only ever sees {{cred:...}} placeholders (credFields); values are
// resolved at fill time and never logged (history/trajectory keep the placeholder).
import { crystallize, type Trajectory, type TrajectoryStep } from "./trails-crystallize"
import { deleteTrail, setTrailStatus } from "./trails"
import { walkTrail } from "./trails-runner"
import { hasCredRef, resolveCredRefs, type CredResolver } from "./trails-creds"
import { getTestAccountByName } from "./test-accounts"
import { sha256hex } from "./crypto"
import { withWalkSlot, withAuthorSlot, CHROMIUM_PROD_ARGS, setCurrentAuthorSessionId, getCurrentAuthorAbortSignal, WalkBusyError } from "./trails-browser"
import { startLiveWatchRun, publishLiveWatchFrame, endLiveWatchRun } from "./trails-live-watch"
import { acquireBrowser, type BrowserHandle } from "./trails-browser-page"
import { db, projectById, touchAuthorHeartbeat } from "./db"
import { uploadScreenshotMeta } from "./s3"
import type { AuthorModel, AuthorAction, ObjectiveVerifier, ObjectiveVerificationResult } from "./trails-author-model"
import { ModelCallError, openRouterObjectiveVerifier } from "./trails-author-model"
import { isKrefSelector } from "./trails-snapshot"
import type { StepAction, TrailViewport } from "./trails-types"
import { normalizeTrailViewport } from "./trails-viewport"
import { configuredVisionResolver, type VisionResolver } from "./trails-vision"
import { notifyAutosimNeedsAuth } from "./autosim-auth-alert"
import {
  loadAutosimAuthConfig,
  autosimAuthCredFields,
  withAutosimAuthCreds,
  establishAutosimSession,
  type DecryptedAutosimAuthConfig,
} from "./autosim-auth-exec"

const AUTOSIM_MAX_STEPS_DEFAULT = 40
const AUTOSIM_MAX_COST_USD_DEFAULT = 0.15
const AUTOSIM_MAX_MS_DEFAULT = 300_000

export const AUTHOR_MAX_STEPS = Number(process.env.AUTOSIM_MAX_STEPS) || AUTOSIM_MAX_STEPS_DEFAULT
export const AUTHOR_MAX_COST_USD = Number(process.env.AUTOSIM_MAX_COST_USD) || AUTOSIM_MAX_COST_USD_DEFAULT
export const AUTOSIM_DEADLINE_MS_DEFAULT = Number(process.env.AUTOSIM_MAX_MS) || AUTOSIM_MAX_MS_DEFAULT
const MAX_CONSECUTIVE_MISSES = 3

// KLA-56: retry config for transient model/API errors (429, 5xx, timeout).
// Up to MAX_API_RETRIES attempts per model call with exponential back-off.
// The back-off delay for attempt i (0-based) = MODEL_RETRY_BASE_MS * 2^i.
const MAX_API_RETRIES = 3
const MODEL_RETRY_BASE_MS = 1_000
const ACTION_TIMEOUT = 10_000
// KLA-129: stall if the exact same action (op+selector+value+url) fires this many consecutive
// times without a different action in between — the model is stuck re-doing the same step.
const LOOP_STALL_N = 3
// How many consecutive iterations with NO page-state change (same URL + same DOM hash) before
// we inject a nudge message asking the model to try a different action. Reset on any real change.
const NO_OP_NUDGE_AFTER = 1  // nudge on the 2nd no-change iteration
const NO_OP_AUTO_ADVANCE_AFTER = 2  // attempt auto-click of submit on 3rd no-change iteration
export const NEEDS_AUTH_RESUME_TTL_MS = 7 * 24 * 3600 * 1000
// Submit-like controls to try for auto-advance, in priority order.
const SUBMIT_CANDIDATES = [
  'button[type="submit"]',
  'input[type="submit"]',
  'button:has-text("Send me a code")',
  'button:has-text("Sign in")',
  'button:has-text("Log in")',
  'button:has-text("Login")',
  'button:has-text("Continue")',
  'button:has-text("Next")',
  'button:has-text("Submit")',
  'button:has-text("Verify")',
  'button:has-text("Confirm")',
  'button:has-text("Proceed")',
  'button[data-testid*="submit"]',
  'button[data-testid*="login"]',
  'button[data-testid*="sign-in"]',
  'form button:not([type="button"])',
]

/** Strip ephemeral kref attribute references from strings before persisting or adding to history.
 *  Conveys which ref failed without embedding the literal data-kref attr (which is stale by the
 *  next model call anyway since every iteration re-captures and renumbers refs). */
const dekref = (s: string) => s.replace(/\[data-kref="(e\d+)"\]/g, "snapshot ref $1")

function isAnalysisObjective(objective: string): boolean {
  return /\b(analy[sz]e|analysis|audit|review|inspect|evaluate|assess|suggest(?:[-\s_]+improvements?)?|recommend(?:ations?)?|improvements?)\b/i
    .test(objective)
}

function onlyInitialNavigate(traj: TrajectoryStep[]): boolean {
  return traj.length === 1 && traj[0]?.action === "navigate"
}

function analysisCheckpointDescription(objective: string): string {
  const trimmed = objective.replace(/\s+/g, " ").trim()
  return trimmed
    ? `Analysis objective completed: ${trimmed.slice(0, 220)}`
    : "Analysis objective completed"
}

export interface AuthorRequest { name: string; objective: string; baseUrl: string; viewport?: TrailViewport | string | null; testAccountName?: string; createdBy?: string }
export interface AuthorStepLog { idx: number; op: string; selector: string | null; value: string | null; url: string; rationale: string; ok: boolean; error?: string; screenshotKey?: string; krefSnapshot?: string }
export interface AuthorOutcome {
  status: "crystallized" | "stalled" | "failed" | "needs_auth"
  trailId: string | null; verificationRunId: string | null
  verificationVerdict: "green" | "amber" | "red" | null
  steps: AuthorStepLog[]; stallReason: string | null; llmCalls: number; costUsd: number
  objectiveVerified?: boolean | null
}

/** KLA-57: Checkpoint — partial drive state persisted after each step so a stalled run is resumable. */
export interface AuthorCheckpoint {
  /** Accumulated trajectory steps (including the initial navigate). */
  traj: TrajectoryStep[]
  /** LLM conversation history (human-readable action log). */
  history: string[]
  /** Steps completed so far (loop index continues from here on resume). */
  stepIdx: number
  /** Total model calls consumed. Counts against the per-run budget on resume. */
  llmCalls: number
  /** Total cost incurred. Counts against AUTHOR_MAX_COST_USD on resume. */
  costUsd: number
  /** URL the browser was at when the checkpoint was written. Resume navigates here first. */
  lastUrl: string
}

const OP2ACTION: Record<string, StepAction> = { navigate: "navigate", click: "click", type: "type", select: "select", assert: "assert", wait: "wait", hover: "hover", keyPress: "keyPress", clearField: "clearField" }

export async function authorTrail(
  projectId: string, req: AuthorRequest,
  opts: {
    model: AuthorModel; headless?: boolean; launchArgs?: string[]
    credResolver?: CredResolver; onStep?: (log: AuthorStepLog[]) => void | Promise<void>
    driveDeadlineMs?: number; textFirst?: boolean; verificationVision?: VisionResolver | false
    browserFactory?: typeof acquireBrowser; verificationWalk?: typeof walkTrail
    shotUploader?: (bytes: Uint8Array, contentType: string) => Promise<{ key: string }>
    verifier?: ObjectiveVerifier
    /**
     * KLA-56: injectable sleep for retry back-off. Default = real setTimeout-based sleep.
     * Tests inject `() => Promise.resolve()` to avoid real delays.
     */
    sleepMs?: (ms: number) => Promise<void>
    /**
     * KLA-55: called at the top of each drive iteration to update the author session heartbeat.
     * Wired by runAuthorNow to touchAuthorHeartbeat(sessionId). Best-effort: errors are swallowed.
     */
    onHeartbeat?: () => void | Promise<void>
    /**
     * KLA-57: prior checkpoint to resume from. Browser navigates to checkpoint.lastUrl and the
     * drive loop continues from checkpoint.stepIdx with accumulated traj/history/cost.
     */
    checkpoint?: AuthorCheckpoint
    /**
     * KLA-57: called after each completed step (and on stall) with the full current checkpoint.
     * Wired by runAuthorNow to persist checkpoint_json so a stalled run is resumable.
     */
    onCheckpoint?: (cp: AuthorCheckpoint) => void | Promise<void>
    /**
     * KLA-151: abort signal to cancel the drive at the next step boundary.
     * Wired by runAuthorNow via cancelCurrentAuthor / withAuthorSlot.
     */
    abortSignal?: AbortSignal
    /**
     * KLA-150: live screencast callback. Called with a base64-JPEG data URL after each
     * step screenshot so the UI can show what the AI is seeing in near-real-time.
     */
    onLiveFrame?: (dataUrl: string) => void
    /**
     * KLA-179: called when the driver encounters an auth gate, before suspending.
     * Used to fire a throttled founder-style email + Slack alert.
     */
    onNeedsAuth?: (url: string, rationale: string) => void | Promise<void>
  },
): Promise<AuthorOutcome> {
  // Text-first is the DEFAULT (bench 2026-07-04: arm B ~50% cheaper, 6/6 green verdicts vs arm A
  // screenshot-every-step). Happy-path steps run text-only; a miss escalates by re-attaching the
  // screenshot (see `includeShot` below). Kill-switch: KLAV_AUTHOR_TEXT_FIRST=0 reverts to arm A.
  const textFirst = opts.textFirst ?? process.env.KLAV_AUTHOR_TEXT_FIRST !== "0"
  // KLA-102: per-project instructions injected into the authoring prompt for trail context.
  let projectInstructions: string | undefined
  let projectAuthStatus = "unregistered"
  try {
    const proj = await projectById(projectId)
    projectInstructions = proj?.instructionsMd ?? undefined
    projectAuthStatus = String(proj?.autosimAuthStatus || "unregistered")
  } catch { /* best-effort; missing instructions is not fatal */ }
  const viewport = normalizeTrailViewport(req.viewport)
  const credFields: string[] = []
  if (req.testAccountName) {
    const acc = await getTestAccountByName(projectId, req.testAccountName)
    if (!acc) return { status: "failed", trailId: null, verificationRunId: null, verificationVerdict: null, steps: [], stallReason: `unknown test account: ${req.testAccountName}`, llmCalls: 0, costUsd: 0 }
    credFields.push(`{{cred:${acc.name}:email}}`, `{{cred:${acc.name}:password}}`)
    // When the test-OTP bypass is active, expose the :otp placeholder so the author model can fill
    // in the fixed code (666666) without triggering a real OTP email or hitting the rate limit.
    if (process.env.KLAV_TEST_OTP) credFields.push(`{{cred:${acc.name}:otp}}`)
  }
  // KLA-184 (AT6): perform the project's REGISTERED auth method at run start so the walk continues
  // authenticated instead of pausing at the login gate (KLA-179). Decrypt-at-execution ONLY —
  // fixed_otp exposes email+otp placeholders for the drive model to fill (secrets resolved at
  // fill-time, never in the LLM payload); mint_link is established directly below via the browser.
  let autosimAuth: DecryptedAutosimAuthConfig | null = null
  try { autosimAuth = await loadAutosimAuthConfig(projectId) } catch { autosimAuth = null }
  if (autosimAuth) credFields.push(...autosimAuthCredFields(autosimAuth))
  const credResolver = withAutosimAuthCreds(opts.credResolver ?? resolveCredRefs, autosimAuth)
  const sleepMs = opts.sleepMs ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  // KLA-57: pre-populate drive state from checkpoint on resume; fresh start otherwise.
  const cp = opts.checkpoint
  const log: AuthorStepLog[] = cp ? cp.traj.slice(1).map((_, i) => ({
    // Synthesize minimal log entries for already-completed steps so UI shows prior progress.
    // Full step details were persisted as steps_json on the original session; the new session
    // session's steps_json is kept in sync via onStep.
    idx: i, op: "resumed", selector: null, value: null, url: cp.lastUrl, rationale: "(resumed from checkpoint)", ok: true,
  })) : []
  const history: string[] = cp ? [...cp.history] : []
  const traj: TrajectoryStep[] = cp ? [...cp.traj] : []
  let llmCalls = cp ? cp.llmCalls : 0
  let costUsd = cp ? cp.costUsd : 0
  let misses = 0
  let lastSuccessKey: string | null = null, consecutiveSuccessKey = 0
  // No-op stagnation tracking: detects when the page URL + DOM hash doesn't change across
  // iterations (the previous action had no visible effect). noOpCount resets on any real change.
  let prevIterDomKey: string | null = null
  let noOpCount = 0
  const startIdx = cp ? cp.stepIdx : 0

  const snapshotCheckpoint = (url: string): AuthorCheckpoint => ({
    traj: [...traj], history: [...history], stepIdx: log.length,
    llmCalls, costUsd, lastUrl: url,
  })
  let objectiveVerified = false
  // Overall drive deadline. Without it a single hung page op (a crashed Chromium can make
  // page.content()/screenshot never settle) held the shared walk slot INDEFINITELY — observed
  // live on prod 2026-07-04: dead browser, slot stuck, every walk/authoring 409ing until a
  // service restart. Every per-iteration op below is also individually bounded.
  const driveDeadlineMs = opts.driveDeadlineMs ?? AUTOSIM_DEADLINE_MS_DEFAULT
  const deadlineAt = Date.now() + driveDeadlineMs
  const bounded = <T>(p: Promise<T>, ms: number, what: string): Promise<T> =>
    Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`${what} timed out after ${ms}ms`)), ms))])
  // Browser via the adapter seam: local Playwright by default; Puppeteer→remote (Steel) when
  // AUTOSIM_CDP_URL is set (moves the browser off the 1GB box). Behavior-identical on the default.
  const launchArgs = Array.from(new Set([...CHROMIUM_PROD_ARGS, ...(opts.launchArgs ?? [])]))
  let handle: BrowserHandle | null = await (opts.browserFactory ?? acquireBrowser)({
    headless: opts.headless,
    launchArgs,
    watchdogMs: driveDeadlineMs + 30_000,
  })
  const closeHandle = async () => {
    if (!handle) return
    const h = handle
    handle = null
    await h.close().catch(() => {})
  }
  const stall = async (why: string, currentUrl?: string, finalStatus: "stalled" | "needs_auth" = "stalled"): Promise<AuthorOutcome> => {
    // KLA-57: persist checkpoint before closing so the session is resumable.
    if (opts.onCheckpoint) {
      try { await opts.onCheckpoint(snapshotCheckpoint(currentUrl ?? req.baseUrl)) } catch {}
    }
    // KLA-57: crystallize whatever we have when we stall with > 1 step (skip pure-navigate-only runs).
    // This gives the user a reviewable partial draft trail even when the drive didn't finish.
    let partialTrailId: string | null = null
    if (traj.length > 1) {
      try {
        const partialTrajectory: Trajectory = {
          name: req.name, intent: req.objective, baseUrl: req.baseUrl,
          viewport: normalizeTrailViewport(req.viewport), authorKind: "llm",
          createdBy: req.createdBy, steps: traj,
        }
        const r = await crystallize(projectId, partialTrajectory)
        await setTrailStatus(projectId, r.trailId, "draft")
        partialTrailId = r.trailId
      } catch { /* best-effort; a crystallize failure must never re-throw from stall */ }
    }
    await closeHandle()
    return { status: finalStatus, trailId: partialTrailId, verificationRunId: null, verificationVerdict: null, steps: log, stallReason: why, llmCalls, costUsd, objectiveVerified }
  }
  try {
    const page = await handle!.newPage(viewport)
    // KLA-184 (AT6): mint_link branch — establish the session cookie by hitting the signed mint link
    // BEFORE the first recorded navigation, then leave that token-bearing URL immediately (below) so
    // it never lands in the trajectory/history/LLM payload (ADR-0001). Re-run on resume too: a fresh
    // browser has no cookie, so the checkpoint URL would otherwise bounce back to the login gate.
    if (autosimAuth?.method === "mint_link") {
      await establishAutosimSession(page, autosimAuth, req.baseUrl)
    }
    if (cp) {
      // KLA-57: resume — navigate to where the prior drive stalled. The traj/history are already
      // pre-populated from the checkpoint; we skip re-recording the initial navigate step.
      await page.goto(cp.lastUrl, 20_000)
    } else {
      await page.goto(req.baseUrl, 20_000)
      // Record the initial navigation as the first TrajectoryStep so the crystallized Trail starts
      // with a navigate action pointing at the baseUrl (gives the runner a concrete starting point).
      const initSnap = await bounded(page.krefSnapshot(), 15_000, "snapshot capture")
      traj.push({ action: "navigate", actionValue: req.baseUrl, url: page.url(), domHash: sha256hex(initSnap) })
    }
    for (let idx = startIdx; idx < AUTHOR_MAX_STEPS; idx++) {
      // KLA-55: heartbeat — signals the crash-reaper that this session is still alive. Best-effort.
      opts.onHeartbeat?.()
      if (costUsd >= AUTHOR_MAX_COST_USD) return await stall(`authoring budget cap $${AUTHOR_MAX_COST_USD} reached after ${llmCalls} model calls`, page.url())
      if (opts.abortSignal?.aborted) return await stall("cancelled by user", page.url())
      if (Date.now() > deadlineAt) return await stall(`authoring drive deadline exceeded (${Math.round(driveDeadlineMs / 1000)}s) after ${log.length} steps`, page.url())
      const includeShot = !textFirst || misses > 0
      const screenshotB64 = includeShot
        ? await bounded(page.screenshotJpeg(60, 15_000), 20_000, "screenshot")
        : ""
      // KLA-150: publish live frame so the UI can show what the AI sees before deciding.
      if (screenshotB64) try { opts.onLiveFrame?.(`data:image/jpeg;base64,${screenshotB64}`) } catch {}
      const dom = await bounded(page.krefSnapshot(), 15_000, "snapshot capture")
      // No-op stagnation guard: if the page URL + DOM hash hasn't changed since the last iteration
      // the previous action had no visible effect (e.g. re-typing the same field value, clicking
      // something that didn't respond). Inject an escalating nudge so the model tries a different
      // action rather than fixating on the same no-op step until the stall-reroll gives up.
      {
        // Strip kref attribute numbers before hashing — they are renumbered every capture and would
        // make every iteration look different even when the real page content is identical.
        const domWithoutKrefs = dom.replace(/data-kref="e\d+"/g, 'data-kref="??"')
        const iterDomKey = `${page.url()}|${sha256hex(domWithoutKrefs)}`
        if (prevIterDomKey !== null && iterDomKey === prevIterDomKey && log.length > 0) {
          noOpCount++
          if (noOpCount >= NO_OP_AUTO_ADVANCE_AFTER) {
            // Third+ no-change iteration: try clicking the most likely submit control before
            // falling back to model guidance. This handles the "stuck on type, never clicks submit"
            // pattern observed live on the login form (2026-07-08 dogfood session).
            let autoAdvanced = false
            for (const sel of SUBMIT_CANDIDATES) {
              try {
                const n = await bounded(page.count(sel), 5_000, "auto-advance count")
                if (n === 1) {
                  await bounded(page.click(sel, ACTION_TIMEOUT), ACTION_TIMEOUT + 2_000, "auto-advance click")
                  history.push(`(auto-advance: the page was not changing — clicked the most likely submit control "${sel}" to progress the flow; check the new page state)`)
                  noOpCount = 0
                  autoAdvanced = true
                  break
                }
              } catch { /* try next candidate */ }
            }
            if (!autoAdvanced) {
              history.push(`(IMPORTANT: the page has not changed for ${noOpCount} actions in a row — you are stuck. Choose a completely different action, e.g. click the submit, "Send me a code", "Continue", or "Next" button to advance the flow)`)
            }
          } else {
            history.push(`(NOTICE: the previous action did not change the page — it may have had no effect. Choose a DIFFERENT action to progress, e.g. click the form submit or "Send me a code" button instead of re-entering the same field)`)
          }
        } else {
          noOpCount = 0
        }
        prevIterDomKey = iterDomKey
      }
      // KLA-56: retry transient model/API errors (429, 5xx, timeout) with exponential back-off.
      // Fatal errors (budget exhausted, 401/403) stall immediately with a distinct reason.
      // Generic (non-ModelCallError) throws are treated as retryable — one network blip must not
      // kill an entire authoring run.
      // KLA-69: hoist modelInput + modelCtx out of inner block so the stall-reroll can reuse them.
      const modelInput = { objective: req.objective, pageUrl: page.url(), screenshotB64, mediaType: "image/jpeg", domSnapshot: dom, history, credFields }
      const modelCtx = { projectId, email: req.createdBy ?? null, projectInstructions }
      let r!: { action: AuthorAction; costUsd: number }
      {
        let lastErr: unknown = null
        let succeeded = false
        for (let attempt = 0; attempt < MAX_API_RETRIES; attempt++) {
          try {
            r = await bounded(opts.model(modelInput, modelCtx), 120_000, "author model call")
            succeeded = true
            break
          } catch (e: any) {
            if (e instanceof ModelCallError) {
              if (e.budgetExhausted) return await stall(`budget_exhausted: daily AI budget reached after ${llmCalls} model calls`, page.url())
              if (!e.retryable) return await stall(`model auth error: ${e.message}`, page.url())
            }
            lastErr = e
            if (attempt < MAX_API_RETRIES - 1) await sleepMs(MODEL_RETRY_BASE_MS * Math.pow(2, attempt))
          }
        }
        if (!succeeded) {
          // All retry attempts exhausted — count as a miss so the consecutive-miss cap eventually
          // stalls rather than looping forever. This mirrors parse-error treatment (KLAVITYKLA-48 #1).
          misses++
          const errMsg = (lastErr as any)?.message || String(lastErr)
          history.push(`(model call failed after ${MAX_API_RETRIES} attempts: ${errMsg} — retrying from last state)`)
          if (misses >= MAX_CONSECUTIVE_MISSES) return await stall(`stuck after ${misses} failed model calls; last error: ${errMsg}`, page.url())
          continue
        }
      }
      llmCalls++; costUsd += r.costUsd || 0
      // KLA-69: `let` so the stall second-opinion block can replace the action with a reroll result.
      let a = r.action
      // KLA-179: the model classifies the current page as an auth gate (login form / OTP prompt /
      // OAuth-only wall) as one extra field on the action it already returns — no extra LLM call.
      // When there's no verified auth method to get past it, we PAUSE (not fail): suspend in the
      // resumable `needs_auth` state (stall() persists the checkpoint = step position + trajectory +
      // url + cost, so a later /autosims resume continues from here) and fire a throttled alert.
      // FUTURE (sim-public-pages-only opt-out): a project could opt its Sims into public-pages-only
      // exploration, in which case an auth gate is an expected boundary — end the run cleanly ("done
      // exploring the public surface") instead of pausing + alerting. Not wired yet; default is pause.
      if (a.isAuthGate && projectAuthStatus !== "verified") {
        if (opts.onNeedsAuth) await opts.onNeedsAuth(page.url(), a.rationale || "stopped at auth gate")
        return await stall(a.rationale || "stopped at auth gate", page.url(), "needs_auth")
      }
      if (a.op === "stall" && a.parseError) {
        // KLAVITYKLA-48 #1: a malformed reply is a bad ROLL, not a dead end — one garbage JSON
        // response was killing otherwise-good multi-step attempts. Treat it exactly like a failed
        // action: count a consecutive miss, tell the model, and let it try again.
        misses++
        history.push(`(your last reply was invalid: ${a.rationale} — respond with ONE strict JSON action object)`)
        if (misses >= MAX_CONSECUTIVE_MISSES) return await stall(`stuck after ${misses} malformed model replies; last: ${a.rationale}`, page.url())
        continue
      }
      if (a.op === "stall") {
        // KLA-69: deliberate stall — get a second opinion before accepting it as final.
        // One spurious stall (model confused by a loading state, ambiguous page) must not kill an
        // otherwise-green walk. Re-roll once with a nudge; cap at one retry to bound cost.
        const firstRationale = a.rationale || "model stalled"
        history.push(`(you returned "stall": "${firstRationale}" — if you are truly blocked stall again; otherwise try a different approach on this page)`)
        try {
          const r2 = await bounded(opts.model(modelInput, modelCtx), 120_000, "author model call (stall reroll)")
          llmCalls++; costUsd += r2.costUsd || 0
          if (r2.action.op !== "stall") {
            if (r2.action.parseError) {
              // Reroll returned a parse-error stall — count as miss and continue outer loop.
              misses++
              history.push(`(reroll reply was invalid: ${r2.action.rationale} — respond with ONE strict JSON action object)`)
              if (misses >= MAX_CONSECUTIVE_MISSES) return await stall(`stuck after ${misses} malformed model replies; last: ${r2.action.rationale}`, page.url())
              continue
            }
            // Reroll produced a valid action — proceed with it instead of stalling.
            a = r2.action
          } else {
            // Both rolls say stall — accept the second roll's rationale as the final word.
            return await stall(r2.action.rationale || firstRationale, page.url())
          }
        } catch {
          // Reroll itself threw (network/timeout/budget) — accept the original stall rather than
          // spending more budget on a broken path.
          return await stall(firstRationale, page.url())
        }
      }
      if (a.op === "done") {
        let verifyResult: ObjectiveVerificationResult
        try {
          const verifier = opts.verifier ?? openRouterObjectiveVerifier
          verifyResult = await bounded(verifier({
            objective: req.objective,
            pageUrl: page.url(),
            domSnapshot: dom,
          }, { projectId, email: req.createdBy ?? null }), 120_000, "objective verification call")
          llmCalls++
          costUsd += verifyResult.costUsd || 0
        } catch (verifyErr: any) {
          misses++
          const errMsg = verifyErr?.message || String(verifyErr)
          history.push(`(objective verification failed: ${errMsg} — retrying done from last state)`)
          if (misses >= MAX_CONSECUTIVE_MISSES) return await stall(`stuck after verifier error: ${errMsg}`, page.url())
          continue
        }

        if (verifyResult.achieved) {
          if (onlyInitialNavigate(traj) && isAnalysisObjective(req.objective)) {
            const checkpoint = { description: analysisCheckpointDescription(req.objective) }
            traj.push({ action: "assert", checkpoint, url: page.url(), domHash: sha256hex(dom) })
            const entry: AuthorStepLog = {
              idx: log.length,
              op: "assert",
              selector: null,
              value: null,
              url: page.url(),
              rationale: checkpoint.description,
              ok: true,
              krefSnapshot: dom.length > 50000 ? dom.slice(0, 50000) + "\n...[TRUNCATED]" : dom,
            }
            log.push(entry)
            await opts.onStep?.(log)
            if (opts.onCheckpoint) {
              try { await opts.onCheckpoint(snapshotCheckpoint(page.url())) } catch {}
            }
          }
          objectiveVerified = true
          break
        } else {
          misses++
          history.push(`(verification failed: your proposed 'done' action was rejected because the objective has not been achieved yet: ${verifyResult.reason || "unknown reason"} — continue until the objective is fully achieved)`)
          if (misses >= MAX_CONSECUTIVE_MISSES) return await stall(`stuck after ${misses} failed verification attempts; last: ${verifyResult.reason}`, page.url())
          continue
        }
      }
      const entry: AuthorStepLog = { idx: log.length, op: a.op, selector: a.selector, value: a.value, url: page.url(), rationale: a.rationale, ok: false }
      let entryDom = dom
      let persistSelector: string | null = a.selector ?? null
      let actionFp: any = null
      try {
        // Hoisted to the try-scope: the KLA-129 loop guard (successKey, below) reads persistSelector
        // OUTSIDE the else-block where it was assigned. The loop-recovery change declared it with
        // `let` inside that block, so the drive crashed at runtime with "persistSelector is not
        // defined" (tsc would have caught it; the merge-train doesn't run tsc).
        if (a.op === "wait") {
          const ms = Math.min(Math.max(Number(a.value) || 1000, 500), 15_000)
          await page.waitMs(ms)
          traj.push({ action: "wait", actionValue: String(ms), url: page.url(), domHash: sha256hex(dom) })
        } else if (a.op === "navigate") {
          await page.goto(a.url!, 20_000)
          traj.push({ action: "navigate", actionValue: a.url!, url: page.url(), domHash: sha256hex(dom) })
        } else {
          const n = await bounded(page.count(a.selector!), 10_000, "locator.count")
          if (n !== 1) throw new Error(`selector "${a.selector}" matched ${n} elements (need exactly 1)`)
          const fp = await bounded(page.fingerprint(a.selector!), 10_000, "fingerprint capture")
          actionFp = fp
          // Stabilize the selector BEFORE the action so we never persist a brittle path.
          // kref attrs are ephemeral (renumbered every capture) — MUST replace.
          // Non-kref selectors emitted by the model (e.g. `.submit-btn`) can also be fragile;
          // prefer id / data-testid / aria-label anchors when stableSelector finds one.
          const stable = await bounded(page.stableSelector(a.selector!), 10_000, "stable selector").catch(() => null)
          persistSelector = isKrefSelector(a.selector)
            ? (stable ?? fp.domPath ?? a.selector!)
            : (stable ?? a.selector!)
          if (a.op === "click") await page.click(a.selector!, ACTION_TIMEOUT)
          else if (a.op === "type") {
            const raw = a.value ?? ""
            await page.fill(a.selector!, hasCredRef(raw) ? await credResolver(projectId, raw) : raw, ACTION_TIMEOUT)
          } else if (a.op === "select") await page.selectOption(a.selector!, a.value ?? "", ACTION_TIMEOUT)
          else if (a.op === "assert") await page.assertVisible(a.selector!, ACTION_TIMEOUT)
          else if (a.op === "hover") await page.hover(a.selector!, ACTION_TIMEOUT)
          else if (a.op === "keyPress") await page.keyPress(a.selector!, a.value ?? "Enter", ACTION_TIMEOUT)
          else if (a.op === "clearField") await page.clearField(a.selector!, ACTION_TIMEOUT)
          traj.push({
            action: OP2ACTION[a.op], actionValue: a.op === "type" || a.op === "select" || a.op === "keyPress" ? a.value ?? undefined : undefined,
            target: { ...fp, resolvedSelector: persistSelector },
            checkpoint: a.op === "assert" ? { description: a.checkpoint || a.rationale || "checkpoint" } : undefined,
            url: page.url(), domHash: sha256hex(dom),
          })
          // Update entry + history with the stable selector so the model context never sees krefs
          entry.selector = persistSelector
        }
        // Loop guard (KLA-129): if the same action fires LOOP_STALL_N consecutive times without a
        // different action in between, the model is stuck re-doing the same step — break out now
        // rather than spinning to AUTHOR_MAX_STEPS and crystallizing a useless trail.
        // Use persistSelector (stable, non-kref) + current page URL so kref renumbering across
        // iterations doesn't defeat this guard — `a.selector` carries ephemeral kref refs that
        // change every capture even when the targeted element is logically the same.
        const successKey = `${a.op}|${persistSelector ?? a.selector ?? ""}|${a.value ?? ""}|${page.url()}`
        if (successKey === lastSuccessKey) {
          consecutiveSuccessKey++
          if (consecutiveSuccessKey >= LOOP_STALL_N) {
            const safeSelector = a.selector && isKrefSelector(a.selector) ? dekref(a.selector) : a.selector
            entry.ok = true
            try {
              const b64 = await page.screenshotJpeg(45, 10_000)
              if (b64 && b64.length > 0) {
                try { opts.onLiveFrame?.(`data:image/jpeg;base64,${b64}`) } catch {}
                const bytes = Buffer.from(b64, "base64")
                const upload = opts.shotUploader ? await opts.shotUploader(bytes, "image/jpeg") : await uploadScreenshotMeta(bytes, "image/jpeg")
                entry.screenshotKey = upload.key
              }
            } catch {}
            entry.krefSnapshot = dom.length > 50000 ? dom.slice(0, 50000) + "\n...[TRUNCATED]" : dom
            log.push(entry); await opts.onStep?.(log)
            return await stall(
              `progress stall: '${a.op}' on '${safeSelector ?? a.url ?? "page"}' repeated ${consecutiveSuccessKey + 1}× without state change — refine the objective to include the next step`,
              page.url(),
            )
          }
        } else {
          lastSuccessKey = successKey
          consecutiveSuccessKey = 0
        }
        entry.ok = true; misses = 0
        history.push(`${a.op}${entry.selector ? " " + entry.selector : ""}${a.op === "navigate" ? " " + a.url : ""} — ok`)
      } catch (e: any) {
        const msg = String(e?.message || e)
        const safeMsg = dekref(msg)
        const safeSelector = a.selector && isKrefSelector(a.selector) ? dekref(a.selector) : a.selector
        entry.error = safeMsg
        entry.selector = safeSelector
        let recoveredSideEffect = false
        if (a.op === "click" && actionFp) {
          try {
            const afterDom = await bounded(page.krefSnapshot(), 15_000, "snapshot capture after failed click")
            const norm = (s: string) => s.replace(/data-kref="e\d+"/g, 'data-kref="??"')
            const changed = page.url() !== entry.url || sha256hex(norm(afterDom)) !== sha256hex(norm(dom))
            if (changed) {
              traj.push({
                action: OP2ACTION[a.op], actionValue: undefined,
                target: { ...actionFp, resolvedSelector: persistSelector ?? safeSelector ?? undefined },
                url: page.url(), domHash: sha256hex(dom),
              })
              entry.selector = persistSelector ?? safeSelector
              entry.error = undefined
              entry.ok = true
              misses = 0
              entryDom = afterDom
              history.push(`${a.op}${entry.selector ? " " + entry.selector : ""} — ok (page changed after action timeout)`)
              recoveredSideEffect = true
            }
          } catch { /* fall through to normal failed-action handling */ }
        }
        if (!recoveredSideEffect) {
          misses++
          history.push(`${a.op}${safeSelector ? " " + safeSelector : ""} — FAILED: ${safeMsg}`)
          if (misses >= MAX_CONSECUTIVE_MISSES) {
          try {
            const b64 = await page.screenshotJpeg(45, 10_000)
            if (b64 && b64.length > 0) {
              try { opts.onLiveFrame?.(`data:image/jpeg;base64,${b64}`) } catch {}
              const bytes = Buffer.from(b64, "base64")
              const upload = opts.shotUploader ? await opts.shotUploader(bytes, "image/jpeg") : await uploadScreenshotMeta(bytes, "image/jpeg")
              entry.screenshotKey = upload.key
            }
          } catch {}
          entry.krefSnapshot = dom.length > 50000 ? dom.slice(0, 50000) + "\n...[TRUNCATED]" : dom
          log.push(entry); await opts.onStep?.(log); return await stall(`stuck after ${misses} failed attempts; last: ${safeMsg}`, page.url())
          }
        }
      }
      try {
        const b64 = await page.screenshotJpeg(45, 10_000)
        if (b64 && b64.length > 0) {
          try { opts.onLiveFrame?.(`data:image/jpeg;base64,${b64}`) } catch {}
          const bytes = Buffer.from(b64, "base64")
          const upload = opts.shotUploader ? await opts.shotUploader(bytes, "image/jpeg") : await uploadScreenshotMeta(bytes, "image/jpeg")
          entry.screenshotKey = upload.key
        }
      } catch (err) {
        console.warn("[trails-author] step screenshot upload failed:", String(err))
      }
      entry.krefSnapshot = entryDom.length > 50000 ? entryDom.slice(0, 50000) + "\n...[TRUNCATED]" : entryDom
      log.push(entry)
      await opts.onStep?.(log)
      // KLA-57: persist checkpoint after each step so a subsequent stall or crash has a recovery point.
      if (opts.onCheckpoint) {
        try { await opts.onCheckpoint(snapshotCheckpoint(page.url())) } catch {}
      }
    }
    await closeHandle()
    if (!traj.length) return { status: "stalled", trailId: null, verificationRunId: null, verificationVerdict: null, steps: log, stallReason: "model finished without performing any step", llmCalls, costUsd, objectiveVerified }
    const trajectory: Trajectory = { name: req.name, intent: req.objective, baseUrl: req.baseUrl, viewport, authorKind: "llm", createdBy: req.createdBy, steps: traj, objectiveVerified }
    const { trailId } = await crystallize(projectId, trajectory)
    await setTrailStatus(projectId, trailId, "draft")
    // Verification Walk: zero-LLM rehearsal; draft status suppresses findings (Task 4), but pass
    // the flag explicitly too — a Verification Walk never files regardless of trail status.
    const vision = opts.verificationVision === false ? undefined : (opts.verificationVision ?? configuredVisionResolver())
    let v: Awaited<ReturnType<typeof walkTrail>>
    try {
      v = await (opts.verificationWalk ?? walkTrail)(projectId, trailId, {
        fixtureUrl: req.baseUrl, suppressFindings: true, credResolver, deadlineMs: 180_000,
        launchArgs, headless: opts.headless,
        ...(vision ? { vision } : {}),
      })
    } catch (verificationErr: any) {
      try {
        await deleteTrail(projectId, trailId)
      } catch (cleanupErr: any) {
        console.warn("[trails-author] verification failed and draft cleanup failed:", String(cleanupErr?.message || cleanupErr))
        await setTrailStatus(projectId, trailId, "archived").catch(() => {})
      }
      const reason = String(verificationErr?.message || verificationErr)
      return { status: "failed", trailId: null, verificationRunId: null, verificationVerdict: null, steps: log, stallReason: reason, llmCalls, costUsd, objectiveVerified }
    }
    // I1: skip means "inconclusive / no steps ran" — map to amber, not red, so an empty
    // Verification Walk never looks like a regression to the reviewer.
    return { status: "crystallized", trailId, verificationRunId: v.runId, verificationVerdict: v.verdict === "skip" ? "amber" : v.verdict, steps: log, stallReason: null, llmCalls, costUsd, objectiveVerified }
  } catch (e: any) {
    await closeHandle()
    return { status: "failed", trailId: null, verificationRunId: null, verificationVerdict: null, steps: log, stallReason: String(e?.message || e), llmCalls, costUsd, objectiveVerified }
  }
}

// ── author sessions (poll surface for the UI) ────────────────────────────────────────────────
export interface AuthorSession {
  id: string; projectId: string; name: string; objective: string; baseUrl: string
  testAccount: string | null
  status: "running" | "crystallized" | "stalled" | "failed" | "needs_auth" | "resuming"
  steps: AuthorStepLog[]; stallReason: string | null; trailId: string | null
  verificationRunId: string | null; verificationVerdict: string | null
  llmCalls: number; costUsd: number; createdBy: string | null; createdAt: number; updatedAt: number
  /** KLA-57: session this was resumed from, if any. */
  resumedFrom: string | null
  /** Session currently claiming this paused/stalled checkpoint for resume, if any. */
  resumedBy: string | null
  /** KLA-57: latest drive-state checkpoint (traj+history+cost+url). Null until first step. */
  checkpoint: AuthorCheckpoint | null
  objectiveVerified: boolean | null
}

export async function createAuthorSession(projectId: string, req: AuthorRequest, resumedFrom?: string | null, idOverride?: string): Promise<string> {
  const id = idOverride ?? "auth_" + crypto.randomUUID()
  const now = Date.now()
  await db!.execute({
    sql: `INSERT INTO author_sessions (id,project_id,name,objective,base_url,test_account,status,created_by,resumed_from,created_at,updated_at,objective_verified)
          VALUES (?,?,?,?,?,?,'running',?,?,?,?,0)`,
    args: [id, projectId, req.name, req.objective, req.baseUrl, req.testAccountName ?? null, req.createdBy ?? null, resumedFrom ?? null, now, now],
  })
  return id
}

export async function updateAuthorSession(projectId: string, id: string, patch: Partial<Pick<AuthorSession, "status" | "steps" | "stallReason" | "trailId" | "verificationRunId" | "verificationVerdict" | "llmCalls" | "costUsd" | "checkpoint" | "objectiveVerified">>): Promise<void> {
  const sets: string[] = ["updated_at=?"]; const args: any[] = [Date.now()]
  if (patch.status !== undefined) { sets.push("status=?"); args.push(patch.status) }
  if (patch.steps !== undefined) { sets.push("steps_json=?"); args.push(JSON.stringify(patch.steps)) }
  if (patch.stallReason !== undefined) { sets.push("stall_reason=?"); args.push(patch.stallReason) }
  if (patch.trailId !== undefined) { sets.push("trail_id=?"); args.push(patch.trailId) }
  if (patch.verificationRunId !== undefined) { sets.push("verification_run_id=?"); args.push(patch.verificationRunId) }
  if (patch.verificationVerdict !== undefined) { sets.push("verification_verdict=?"); args.push(patch.verificationVerdict) }
  if (patch.objectiveVerified !== undefined) { sets.push("objective_verified=?"); args.push(patch.objectiveVerified === null ? null : (patch.objectiveVerified ? 1 : 0)) }
  if (patch.llmCalls !== undefined) { sets.push("llm_calls=?"); args.push(patch.llmCalls) }
  if (patch.costUsd !== undefined) { sets.push("cost_usd=?"); args.push(patch.costUsd) }
  if (patch.checkpoint !== undefined) { sets.push("checkpoint_json=?"); args.push(patch.checkpoint === null ? null : JSON.stringify(patch.checkpoint)) }
  args.push(projectId, id)
  await db!.execute({ sql: `UPDATE author_sessions SET ${sets.join(",")} WHERE project_id=? AND id=?`, args })
}

function rowToAuthorSession(row: any): AuthorSession {
  let steps: AuthorStepLog[] = []
  try { steps = JSON.parse(String(row.steps_json || "[]")) } catch {}
  let checkpoint: AuthorCheckpoint | null = null
  try { if (row.checkpoint_json) checkpoint = JSON.parse(String(row.checkpoint_json)) } catch {}
  return {
    id: String(row.id), projectId: String(row.project_id), name: String(row.name), objective: String(row.objective),
    baseUrl: String(row.base_url), testAccount: row.test_account ? String(row.test_account) : null,
    status: String(row.status) as AuthorSession["status"], steps,
    stallReason: row.stall_reason ? String(row.stall_reason) : null,
    trailId: row.trail_id ? String(row.trail_id) : null,
    verificationRunId: row.verification_run_id ? String(row.verification_run_id) : null,
    verificationVerdict: row.verification_verdict ? String(row.verification_verdict) : null,
    llmCalls: Number(row.llm_calls), costUsd: Number(row.cost_usd),
    createdBy: row.created_by ? String(row.created_by) : null,
    createdAt: Number(row.created_at), updatedAt: Number(row.updated_at),
    resumedFrom: row.resumed_from ? String(row.resumed_from) : null,
    resumedBy: row.resumed_by ? String(row.resumed_by) : null,
    checkpoint,
    objectiveVerified: row.objective_verified == null ? null : !!row.objective_verified,
  }
}

export async function getAuthorSession(projectId: string, id: string): Promise<AuthorSession | null> {
  const r = await db!.execute({ sql: `SELECT * FROM author_sessions WHERE project_id=? AND id=?`, args: [projectId, id] })
  if (!r.rows.length) return null
  return rowToAuthorSession(r.rows[0])
}

/**
 * KLA-152: List recent resumable sessions that have a checkpoint or a partial draft trail.
 * KLA-179: `needs_auth` (paused at an auth gate) is resumable too — surface it alongside `stalled`
 * so the AT2 router (/autosims) can offer "give it a key and resume".
 *
 * NOTE (KLA-179 zombie-resume guard / pause-TTL): resumability here is bounded by a 7-day recency
 * window — an abandoned `needs_auth` session ages out of this list and is NOT swept by the stale
 * reaper (which only touches status='running'; see sweepStaleAuthorSessions in db.ts), so a paused
 * Sim never gets falsely marked 'failed'. FUTURE: a dedicated pause-TTL should transition very old
 * `needs_auth` rows to an explicit 'expired' state (rather than leaving them paused forever), and a
 * resume must guard against double-resume (a session already resumed_from-linked should not spawn a
 * second concurrent drive off the same checkpoint).
 */
export async function listStalledAuthorSessions(projectId: string, limit = 10): Promise<AuthorSession[]> {
  const since = Date.now() - NEEDS_AUTH_RESUME_TTL_MS
  const r = await db!.execute({
    sql: `SELECT * FROM author_sessions
          WHERE project_id=? AND status IN ('stalled','needs_auth')
            AND updated_at >= ?
            AND (checkpoint_json IS NOT NULL OR trail_id IS NOT NULL)
          ORDER BY updated_at DESC LIMIT ?`,
    args: [projectId, since, limit],
  })
  return r.rows.map(rowToAuthorSession)
}

export async function listNeedsAuthSessionsForAutoResume(projectId: string, limit = 5, nowMs = Date.now()): Promise<AuthorSession[]> {
  const since = nowMs - NEEDS_AUTH_RESUME_TTL_MS
  const r = await db!.execute({
    sql: `SELECT s.* FROM author_sessions s
          WHERE s.project_id=? AND s.status='needs_auth'
            AND s.updated_at >= ?
            AND s.checkpoint_json IS NOT NULL
            AND NOT EXISTS (
              SELECT 1 FROM author_sessions child
              WHERE child.project_id=s.project_id AND child.resumed_from=s.id
                AND child.status IN ('running','stalled','needs_auth','crystallized','resuming')
            )
          ORDER BY s.updated_at ASC LIMIT ?`,
    args: [projectId, since, limit],
  })
  return r.rows.map(rowToAuthorSession)
}

export async function getActiveAuthorSession(projectId: string): Promise<AuthorSession | null> {
  const r = await db!.execute({
    sql: `SELECT * FROM author_sessions WHERE project_id=? AND status='running' ORDER BY created_at DESC LIMIT 1`,
    args: [projectId],
  })
  if (!r.rows.length) return null
  return rowToAuthorSession(r.rows[0])
}

function resumeEligibilityError(prior: AuthorSession | null, now = Date.now()): string | null {
  if (!prior) return "resume session not found"
  if (prior.status !== "stalled" && prior.status !== "needs_auth") return "resume session is not paused"
  if (now - prior.updatedAt > NEEDS_AUTH_RESUME_TTL_MS) return "resume session is too old"
  if (!prior.checkpoint) return "resume session has no checkpoint"
  if (prior.resumedBy) return "resume session is already being resumed"
  return null
}

async function claimAuthorResumeSession(projectId: string, priorId: string, childId: string, now = Date.now()): Promise<AuthorSession> {
  const prior = await getAuthorSession(projectId, priorId)
  const invalid = resumeEligibilityError(prior, now)
  if (invalid) throw new Error(invalid)
  const since = now - NEEDS_AUTH_RESUME_TTL_MS
  const r = await db!.execute({
    sql: `UPDATE author_sessions
          SET status='resuming', resumed_by=?, updated_at=?
          WHERE project_id=? AND id=?
            AND status IN ('stalled','needs_auth')
            AND updated_at >= ?
            AND checkpoint_json IS NOT NULL
            AND resumed_by IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM author_sessions child
              WHERE child.project_id=?
                AND child.resumed_from=?
                AND child.status IN ('running','stalled','needs_auth','crystallized','resuming')
            )`,
    args: [childId, now, projectId, priorId, since, projectId, priorId],
  })
  if (Number(r.rowsAffected || 0) <= 0) throw new Error("resume session is already claimed")
  return prior!
}

async function releaseAuthorResumeClaim(projectId: string, priorId: string, childId: string, status: AuthorSession["status"]): Promise<void> {
  if (status !== "stalled" && status !== "needs_auth") return
  await db!.execute({
    sql: `UPDATE author_sessions SET status=?, resumed_by=NULL, updated_at=?
          WHERE project_id=? AND id=? AND status='resuming' AND resumed_by=?`,
    args: [status, Date.now(), projectId, priorId, childId],
  }).catch(() => {})
}

/**
 * Fire-and-poll trigger (Plan-G pattern). Holds the single walk slot for the WHOLE attempt
 * (authoring drive + verification walk) — throws WalkBusyError synchronously if slot busy.
 * Mirrors runWalkNow's deferred-promise structure: slot is acquired in this turn (WalkBusyError
 * propagates to the caller before we return), session row is created inside the slot, and the
 * sessionId is resolved back to the caller as soon as the row exists.
 *
 * KLA-57: pass `resumeSessionId` to continue a stalled/failed session. The prior session's
 * checkpoint (traj+history+cost+url) is loaded and the drive loop continues from where it left
 * off. A new session row is created that links back via `resumed_from`.
 */
export async function runAuthorNow(
  projectId: string,
  req: AuthorRequest,
  deps?: { model?: AuthorModel; author?: typeof authorTrail; resumeSessionId?: string },
): Promise<{ sessionId: string }> {
  const { openRouterAuthorModel } = await import("./trails-author-model")
  const model = deps?.model ?? openRouterAuthorModel
  const author = deps?.author ?? authorTrail

  const resumeSessionId = deps?.resumeSessionId
  const childSessionId = "auth_" + crypto.randomUUID()

  // Deferred: resolve to sessionId once the DB row exists, reject on slot-busy or session-create error.
  let resolveStarted!: (sessionId: string) => void
  let rejectStart!: (err: unknown) => void
  const started = new Promise<string>((res, rej) => { resolveStarted = res; rejectStart = rej })

  // withWalkSlot throws WalkBusyError SYNCHRONOUSLY (in this turn) when the slot is held, so a 2nd
  // concurrent runAuthorNow rejects on `slotHeld` before it ever resolves `started`. On a free slot
  // the promise runs the whole authoring drive + verification walk in the background; we only await
  // `started` (resolved as soon as the session row exists).
  const slotHeld = withAuthorSlot(() => withWalkSlot(async () => {
    let sessionId: string = childSessionId
    let resumeCheckpoint: AuthorCheckpoint | undefined
    let claimedPrior: { id: string; status: AuthorSession["status"] } | null = null
    try {
      if (resumeSessionId) {
        const prior = await claimAuthorResumeSession(projectId, resumeSessionId, childSessionId)
        resumeCheckpoint = prior.checkpoint!
        claimedPrior = { id: prior.id, status: prior.status }
      }
      sessionId = await createAuthorSession(projectId, req, resumeSessionId ?? null, childSessionId)
    } catch (e) {
      if (claimedPrior) await releaseAuthorResumeClaim(projectId, claimedPrior.id, childSessionId, claimedPrior.status)
      rejectStart(e)
      return
    }
    resolveStarted(sessionId)
    // KLA-151: register sessionId so cancelCurrentAuthor can target this specific drive.
    setCurrentAuthorSessionId(sessionId)
    // KLA-150: open live-watch channel for author session (reuses the walk live-watch infra).
    startLiveWatchRun(projectId, sessionId)
    try {
      const out = await author(projectId, req, {
        model, launchArgs: CHROMIUM_PROD_ARGS,
        onStep: (log) => updateAuthorSession(projectId, sessionId, { steps: log }).catch(() => {}),
        // KLA-55: update heartbeat each iteration so the reaper knows this session is alive.
        onHeartbeat: () => touchAuthorHeartbeat(sessionId).catch(() => {}),
        // KLA-57: persist checkpoint after each step and on stall so the run is resumable.
        onCheckpoint: (cp) => updateAuthorSession(projectId, sessionId, { checkpoint: cp }).catch(() => {}),
        checkpoint: resumeCheckpoint,
        // KLA-151: abort signal wired to the author slot's AbortController.
        abortSignal: getCurrentAuthorAbortSignal() ?? undefined,
        // KLA-150: publish each step screenshot as a live screencast frame.
        onLiveFrame: (dataUrl) => { try { publishLiveWatchFrame(projectId, sessionId, dataUrl) } catch {} },
        // KLA-179: the driver hit an auth gate with no verified auth method — the outcome will be
        // `needs_auth` (paused, resumable). Fire the throttled founder-style "give it a key" alert.
        // Best-effort: a notification failure must never affect the run or its persisted status.
        onNeedsAuth: async (url, rationale) => {
          try {
            const proj = await projectById(projectId)
            await notifyAutosimNeedsAuth({
              projectId,
              projectName: proj?.name ?? req.name,
              accountId: proj?.accountId ?? "",
              sessionId,
              pageUrl: url,
              rationale,
              baseUrl: (process.env.KLAV_BASE_URL || "").replace("klavity.quantana.top", "klavity.in"),
              at: Date.now(),
            })
          } catch (e: any) {
            console.error("autosim needs_auth alert (non-fatal):", e?.message || e)
          }
        },
      })
      await updateAuthorSession(projectId, sessionId, {
        status: out.status, steps: out.steps, stallReason: out.stallReason, trailId: out.trailId,
        verificationRunId: out.verificationRunId, verificationVerdict: out.verificationVerdict,
        llmCalls: out.llmCalls, costUsd: out.costUsd,
        objectiveVerified: out.objectiveVerified,
      })
    } catch (e: any) {
      await updateAuthorSession(projectId, sessionId, { status: "failed", stallReason: String(e?.message || e) }).catch(() => {})
    } finally {
      endLiveWatchRun(projectId, sessionId)
    }
  }))

  // Surface a synchronous WalkBusyError (or a createAuthorSession failure) to the caller; otherwise
  // resolve as soon as the session row exists. The background `slotHeld` keeps running; swallow its
  // settle so a late finalize can't raise an unhandled rejection.
  slotHeld.catch((err) => { rejectStart(err) })
  slotHeld.then(() => {}, () => {})

  const sessionId = await started
  return { sessionId }
}

export type AutoResumeNeedsAuthResult = {
  eligible: number
  resumed: Array<{ fromSessionId: string; sessionId: string }>
  skipped: Array<{ sessionId: string; reason: string }>
  errors: Array<{ sessionId: string; error: string }>
}

export async function autoResumeNeedsAuthSessions(
  projectId: string,
  opts: {
    limit?: number
    nowMs?: number
    runner?: typeof runAuthorNow
  } = {},
): Promise<AutoResumeNeedsAuthResult> {
  const sessions = await listNeedsAuthSessionsForAutoResume(projectId, opts.limit ?? 5, opts.nowMs ?? Date.now())
  const runner = opts.runner ?? runAuthorNow
  const result: AutoResumeNeedsAuthResult = { eligible: sessions.length, resumed: [], skipped: [], errors: [] }
  for (const prior of sessions) {
    if (!prior.checkpoint) {
      result.skipped.push({ sessionId: prior.id, reason: "missing checkpoint" })
      continue
    }
    try {
      const { sessionId } = await runner(projectId, {
        name: prior.name,
        objective: prior.objective,
        baseUrl: prior.baseUrl,
        viewport: null,
        testAccountName: prior.testAccount ?? undefined,
        createdBy: prior.createdBy ?? undefined,
      }, { resumeSessionId: prior.id })
      result.resumed.push({ fromSessionId: prior.id, sessionId })
    } catch (e: any) {
      result.errors.push({ sessionId: prior.id, error: String(e?.message || e) })
      if (e instanceof WalkBusyError) break
    }
  }
  return result
}
