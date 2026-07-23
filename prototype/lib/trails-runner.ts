// Layer C: the RUNNER — the smallest runnable end-to-end Trail walk.
// Zero-LLM deterministic replay (Tier 0 = cached resolved selector) + Tier 1 self-heal
// (multi-candidate fallback: cached selector -> role+accessible-name -> visible text ->
//  data-testid -> structural domPath). NO LLM/vision here: Tier 2 only records an AMBER
// 'needs-vision' run_step, it NEVER fabricates a heal and NEVER silent-greens.
//
// Trust guardrails (spec §6): diagnosis-first, confidence-gated (heal lands at >=0.9),
// healing never overrides a checkpoint, fail-loud (removed actionable element -> RED).
//
// Project-scoped: projectId is the first arg of every persisted call and every query.
import type { Browser, BrowserContext, Page, Locator } from "playwright"
import { acquirePlaywrightBrowser, playwrightContextOptionsForTrailViewport, startCdpScreencast, BrowserLaunchError, harRecordContextOptions, applyHarReplay, startContextTracing, stopContextTracing, type PlaywrightBrowserHandle } from "./trails-browser-page"
import { getHarForTrail, saveWalkArtifact } from "./trails-har"
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join as joinPath } from "node:path"
import { uploadScreenshotMeta } from "./s3"
import type { FailureKind, Fingerprint, Tier, Verdict, TrailStep } from "./trails-types"
import { expandModuleSteps } from "./trails-modules"
import {
  getTrail, listTrailSteps, getCacheForStep, upsertLocatorCache,
  startWalk, addRunStep, mergeRunStepEvidence, finishWalk, recordFinding,
  resolveEnvironmentUrl, pauseWalk, resumeWalk, getWalk,
} from "./trails"
import { touchWalkHeartbeat, db, incrementUsageMeter } from "./db"
import { checkQuotaForProject } from "./quota"
import { stepCacheKey } from "./trails-crystallize"
import { decideFromVision, type VisionResolver, type VisionInput, type VisionResult, type VisionDecision } from "./trails-vision"
import { setupReplayCapture, saveReplay, type ReplayCapture } from "./trails-replay"
import { hasCredRef, resolveCredRefs, type CredResolver } from "./trails-creds"
import { contentSigFor } from "./trails-findings-dedup"
import { captureKrefSnapshot, stableSelectorFor, structuralPathFor, isKrefSelector, recordedStepState } from "./trails-snapshot"
import { clickWithTransitionFallback } from "./trails-click"
import { matchesMock } from "./trails-browser-page"
import type { NetworkMock } from "./trails-browser-page"
import { notifyWalkRed } from "./walk-red-alert"
import { maybeAutoFileWalkFindings } from "./trails-findings-gate"
import { endLiveWatchRun, publishLiveWatchFrame, startLiveWatchRun } from "./trails-live-watch"
import { WalkEvidenceCollector, type EvidenceOffsets, type WalkEvidenceSummary } from "./trails-walk-evidence"

export interface WalkOptions {
  _resolvedCreds?: Set<string>
  /** Concrete URL to walk against (overrides the trail's baseUrl). file:// or http(s)://. */
  fixtureUrl: string
  headless?: boolean
  /**
   * Tier-2 vision resolver (Layer D). INJECTABLE: a mock in tests, the real OpenRouter adapter in
   * prod. When ABSENT the runner behaves exactly like Layer C (RED + needsVision on exhaustion) —
   * backward-compatible. When present, an exhausted step hands off to vision (heal/regression/low-conf).
   */
  vision?: VisionResolver
  /** Confidence gate for a vision heal (spec §6.3). Default 0.9. */
  confidenceGate?: number
  /**
   * Optional per-project weighted model-mix override, forwarded to the resolver ctx. When absent the
   * resolver uses DEFAULT_WEIGHTS. Wired here for a future per-project read (opsadmin model mix).
   */
  visionWeights?: Record<string, number>
  /**
   * Plan E2 — OPT-IN, DEFAULT-OFF rrweb session-replay capture. When true, the runner injects the
   * rrweb recorder (via an explicit BrowserContext + addInitScript) and collects per-page event
   * segments, persisting them after finishWalk. Capture is best-effort/try-caught: a recorder failure
   * yields no replay but NEVER fails or slows the Walk. With it OFF, behavior is byte-identical to
   * Layer C/D (no context, no binding, no extra work) so the engine suite is unchanged.
   */
  replay?: boolean
  /**
   * Plan G — prod-safety. Extra args forwarded to `chromium.launch({ args })`; production callers
   * pass CHROMIUM_PROD_ARGS (--single-process, --no-sandbox, --disable-dev-shm-usage,
   * --disable-gpu, --no-zygote, etc.).
   */
  launchArgs?: string[]
  /**
   * Plan G — prod-safety. A hard wall-clock budget (ms) for the WHOLE walk. Checked at the top of each
   * step; when exceeded the step loop stops and the Walk finalizes `red` with `summary.error =
   * "deadline_exceeded"`. Absent (the test default) = no budget = unchanged behavior. Default in prod
   * is 120000ms (see lib/trails-trigger.ts), never set here so the engine suite is unaffected.
   */
  deadlineMs?: number
  /**
   * Plan G — trigger reconciliation. When present, the runner ADOPTS this pre-created Walk row (from
   * runWalkNow's startWalk) instead of calling startWalk itself, so the run_steps / replay / verdict
   * all land on the runId the caller already holds. Absent (every existing caller) → unchanged: the
   * runner mints its own runId. This is the single seam that lets a triggered walk and the route share
   * one runId without touching any finalize/replay logic below.
   */
  runId?: string
  /**
   * ADR-0001: resolves {{cred:...}} placeholders in a type-step's actionValue at fill time.
   * INJECTABLE (fake in tests). Default = resolveCredRefs (real test_accounts lookup). The resolved
   * value goes ONLY into locator.fill — evidence/run_steps keep the placeholder.
   */
  credResolver?: CredResolver
  /**
   * Draft-gate (AutoSims F1): when true, the runner records run_steps as normal (evidence is
   * preserved) but NEVER calls recordFinding. Effective rule: auto-set to true when trail.status
   * === "draft" (see walkTrail entry). Callers may also pass it explicitly (e.g. for a
   * Verification Walk triggered before a Trail is activated).
   */
  suppressFindings?: boolean
  /**
   * PDF task 1 — OPT-IN per-step screenshot capture. DEFAULT-OFF. When true, after each
   * actionable step's action settles the runner captures a jpeg (quality 45), records the
   * run_step immediately, then queues shotUploader work off the step/deadline path. The returned
   * key is patched into the step's evidence as `screenshotKey`.
   * Capture is SKIPPED for navigate/wait steps (no meaningful state to capture).
   * Failures are best-effort: a try/catch ensures a capture/upload failure NEVER fails a step —
   * evidence just lacks the key.
   */
  stepShots?: boolean
  /**
   * Injectable screenshot uploader. Signature: (bytes: Uint8Array, contentType: string) =>
   * Promise<{ key: string }>. Default (when stepShots=true and this is absent) = the real S3
   * uploader adapted from uploadScreenshotMeta. In tests, pass a fake that never touches S3.
   */
  shotUploader?: (bytes: Uint8Array, contentType: string) => Promise<{ key: string }>
  /**
   * KLA-100 mid-run cancel. When the signal is aborted the runner stops at the NEXT step boundary
   * (between steps, after the current Playwright action finishes) and finalizes the walk RED with
   * summary.error = "cancelled". Absent (all existing callers) → unchanged behavior.
   */
  signal?: AbortSignal
  /**
   * KLA-111: Optional network stubs/blocks for the walk. Each entry matches browser requests by URL
   * pattern (exact string, glob "**" or RegExp) and either returns a canned response (stub) or
   * aborts the request (block). Installed before the first page navigation so the initial load is
   * also intercepted. Absent (all existing callers) → no interception, byte-identical behavior.
   */
  networkMocks?: NetworkMock[]
  /**
   * KLA-68: per-step retry budget. When a step action throws (transient failure — slow load, race
   * condition, brief unresponsiveness), the runner retries the action up to this many additional
   * times with a fixed backoff before declaring the step RED. Each retry re-uses the already-resolved
   * locator so the element-resolution cost is paid only once. Default 2. Set to 0 to disable.
   */
  stepRetries?: number
  /**
   * KLA-93: optional named environment to run against. When set, the runner resolves the
   * environment's baseUrl from the trail and uses it instead of `fixtureUrl`. The name is also
   * recorded on the trail_runs row. Absent → use fixtureUrl unchanged (backward-compatible).
   */
  environmentName?: string | null

  // ── KLA-104: pause/resume for secret (2FA / OTP / OAuth tokens) ──────────────────
  /**
   * Map of key → secret value PRE-LOADED before the walk starts (e.g. from test-account store or
   * caller injection). When a `pauseForSecret` step's actionValue matches a key, the secret is
   * used immediately without pausing. Keys can be `{{cred:name:otp}}` placeholders or bare labels.
   */
  injectedSecrets?: Record<string, string>
  /**
   * Async callback invoked when a `pauseForSecret` step cannot find the secret in `injectedSecrets`.
   * The runner passes `{ stepIdx, actionValue }` and waits for the returned Promise to resolve with
   * the secret string. This is the low-latency path (e.g. in-process test helpers); the
   * DB-poll/HTTP path is used when this is absent and the walk must pause for a human response.
   */
  secretResolver?: (ctx: { stepIdx: number; actionValue: string | null }) => Promise<string>

  // ── KLAVITYKLA-126: AutoSim environment determinism + trace artifact (all OPT-IN, DEFAULT-OFF) ──
  /**
   * Enable HAR-based network determinism for this Trail. When on, the runner RECORDS a HAR on the
   * FIRST GREEN walk of the trail (persisted via walk_artifacts) and, on every subsequent walk where a
   * HAR already exists, REPLAYS network from it (Playwright context.routeFromHAR) so the same trail can
   * no longer green/red on live backend state alone. Record and replay are mutually exclusive per walk
   * (a trail with a stored HAR replays; one without records on its next green). Falls back to the
   * KLAV_AUTOSIM_HAR=1 env flag so prod opt-in needs no caller change. All HAR I/O is best-effort:
   * a record/replay failure logs a warning and the walk proceeds against live network, unchanged.
   */
  har?: boolean
  /**
   * routeFromHAR miss policy when `har` replay is active. 'fallback' (default) lets an unmatched
   * request hit the live network; 'abort' is strict determinism (unmatched → network error). Falls
   * back to KLAV_AUTOSIM_HAR_NOTFOUND=abort.
   */
  harNotFound?: "abort" | "fallback"
  /**
   * Enable a Playwright trace (screenshots + DOM snapshots + actions) for this walk, stored alongside
   * walk replays in walk_artifacts (kind='trace') and openable via `npx playwright show-trace`. Falls
   * back to the KLAV_AUTOSIM_TRACE=1 env flag. Best-effort: a tracing failure never changes the verdict.
   */
  trace?: boolean
}

/**
 * KLAVITYKLA-126: resolve the opt-in environment-determinism flags for a walk. Pure + exported so the
 * record-vs-replay decision is unit-testable without a browser. Precedence: explicit WalkOptions win,
 * else the KLAV_AUTOSIM_* env flag. `harExists` (did this Trail already record a HAR?) picks record vs
 * replay: a trail with a stored HAR replays from it; one without records on its next green walk.
 */
export interface WalkArtifactPlan {
  harRecordMode: boolean
  harReplayMode: boolean
  traceEnabled: boolean
  harNotFound: "abort" | "fallback"
}
export function planWalkArtifacts(
  opts: Pick<WalkOptions, "har" | "trace" | "harNotFound">,
  harExists: boolean,
  env: Record<string, string | undefined> = process.env,
): WalkArtifactPlan {
  const harEnabled = opts.har ?? (env.KLAV_AUTOSIM_HAR === "1")
  const traceEnabled = opts.trace ?? (env.KLAV_AUTOSIM_TRACE === "1")
  const harNotFound: "abort" | "fallback" =
    opts.harNotFound ?? (env.KLAV_AUTOSIM_HAR_NOTFOUND === "abort" ? "abort" : "fallback")
  return {
    harRecordMode: harEnabled && !harExists,
    harReplayMode: harEnabled && harExists,
    traceEnabled,
    harNotFound,
  }
}

export interface WalkStepSummary {
  stepId: string
  idx: number
  tier: Tier
  verdict: Verdict
  healed: boolean
  failureKind?: FailureKind
}

export interface WalkSummary {
  runId: string
  verdict: Verdict
  /**
    * Count of Tier-2 vision model calls (Layer D), a `number`. 0 on the zero-LLM hot path / no
    * resolver. Both success and error-path vision calls are ledgered in ai_calls (type 'reheal');
    * errors have ok=false so cost accounting stays complete even when a Tier-2 call fails (KLA-123).
   */
  llmCalls: number
  steps: WalkStepSummary[]
  healedCount: number
  /**
   * KLA-74: browser diagnostics captured during the walk. Only present when at least one event
   * was captured. Surfaced in the walk detail page so failures show WHY (not just that) they failed.
   */
  evidence?: WalkEvidenceSummary
  /**
   * Human-readable reason(s) for a RED verdict. Always non-empty when verdict is 'red', so callers
   * of `finishWalk` always see WHY the walk ended red — never a silent or blank RED (KLAVITYKLA-48).
   */
  reasons: string[]
  failureKind?: FailureKind
}

const CACHE_CONFIDENCE = 1.0
// KLA-68: fixed backoff between per-step retries (ms). Short enough not to blow the walk deadline
// while giving a transiently-slow page time to settle before the next attempt.
export const STEP_RETRY_BACKOFF_MS = 500
// KLA-68: default number of retries per step. Callers can override via WalkOptions.stepRetries.
export const DEFAULT_STEP_RETRIES = 2

/**
 * KLA-68: Run `action` up to `maxRetries + 1` times, waiting `backoffMs` between attempts.
 * `shouldStop()` is checked before each retry — when it returns true the loop exits early
 * (deadline guard). Returns `undefined` on success, the last caught error on exhaustion.
 * Exported for focused unit testing of the retry policy without needing a browser.
 */
export async function withStepRetry(
  action: () => Promise<void>,
  maxRetries: number,
  backoffMs: number,
  shouldStop: () => boolean,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
  isRetryable: (error: unknown) => boolean = () => true,
): Promise<unknown | undefined> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      if (shouldStop()) break
      await sleep(backoffMs)
    }
    try {
      await action()
      return undefined  // success
    } catch (e) {
      lastError = e
      if (!isRetryable(e)) break
    }
  }
  return lastError  // undefined only if loop never ran, which can't happen (attempt 0 always runs)
}

function isRetryableStepError(error: unknown): boolean {
  const msg = String((error as any)?.message || error)
  return !msg.includes("transition_regression") && !msg.includes("target_not_visible_after_prior_red")
}

// Tier-1 candidate confidence varies by signal strength so Layer D's future >=0.9 gate has real
// signal (not a flat tautology). With fix #1 ALL heals are AMBER regardless of confidence; this is
// purely to differentiate signal quality for the later confidence gate.
type CandidateSignal = "role+name" | "text" | "testid" | "domPath"
const SIGNAL_CONFIDENCE: Record<CandidateSignal, number> = {
  "role+name": 0.95, // role + accessible-name: strongest semantic anchor
  testid: 0.92,
  text: 0.88,
  domPath: 0.8, // structural: weakest, most brittle
}

// Escape a string for safe embedding inside a double-quoted CSS attribute selector value.
// Backslash first, then double-quote (e.g. data-testid value containing a `"`).
function escAttr(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

// Thrown when no tier can resolve the target to exactly-one actionable element.
export class ElementGone extends Error {
  constructor(public readonly fp: Fingerprint | null) {
    super("element gone: no tier resolved the target")
  }
}

// Thrown when the cached selector matches >1 element — a crystallize data-quality issue,
// NOT a heal candidate. Healing an ambiguous selector would silently act on an arbitrary
// match; instead we fail loud with a recordable finding so the author can fix the selector.
class AmbiguousSelector extends Error {
  constructor(public readonly selector: string, public readonly matchCount: number) {
    super(`ambiguous selector "${selector}" matched ${matchCount} elements`)
  }
}

// Verdict ordering: worst wins for the Walk roll-up.
const SEVERITY: Record<Verdict, number> = { green: 0, skip: 0, amber: 1, red: 2 }
function worse(a: Verdict, b: Verdict): Verdict {
  return SEVERITY[b] > SEVERITY[a] ? b : a
}

export function failureKindForThrownError(_error: unknown): FailureKind {
  return "crash"
}

export function failureKindForExpectationFailure(): FailureKind {
  return "regression"
}

export function tagRedEvidence<T extends Record<string, unknown>>(failureKind: FailureKind, evidence: T): T & { failureKind: FailureKind } {
  return { ...evidence, failureKind }
}

function worseFailureKind(a: FailureKind | null, b: FailureKind): FailureKind {
  return a === "crash" || b === "crash" ? "crash" : "regression"
}

// ── Human-readable verdict/finding text helpers ──────────────────────────────
//
// These produce plain-English descriptions of what AutoSim steps do and what
// went wrong, so that non-technical users can understand walk results without
// needing to parse internal action codes or selector strings.

const ACTION_VERB: Record<string, string> = {
  click:        "clicking",
  type:         "typing into",
  select:       "selecting from",
  assert:       "checking",
  hover:        "hovering over",
  keyPress:     "pressing a key on",
  clearField:   "clearing",
  navigate:     "navigating to",
  wait:         "waiting",
  pauseForSecret: "filling in",
  callModule:   "running module",
}

/**
 * Returns a human-readable step description, e.g.:
 *   click + "Add to cart"  → 'clicking "Add to cart"'
 *   assert + "Order confirmed" → 'checking "Order confirmed"'
 *   navigate (no name)     → 'navigating'
 */
export function humanStepDescription(action: string, name?: string | null): string {
  const verb = ACTION_VERB[action] ?? action
  return name ? `${verb} "${name}"` : verb
}

/**
 * One-line walk-failure reason for a step that went RED. Plain English — no
 * internal codes, no terse labels like "step 0 (click): RED". Used in the
 * Walk summary `reasons` array (surfaced in the Slack alert and the walk-detail
 * page).
 */
export function humanRedReason(stepIdx: number, action: string, name?: string | null): string {
  const desc = humanStepDescription(action, name)
  if (action === "assert") {
    return `Step ${stepIdx + 1}: the check "${name ?? "condition"}" failed — the expected state wasn't found on the page.`
  }
  return `Step ${stepIdx + 1}: ${desc} — the action could not be completed.`
}

// A locator "resolves" iff it matches exactly one element. Visibility is checked by the action
// (Playwright auto-waits for actionability); for assert we require visible explicitly.
async function uniquelyResolves(loc: Locator): Promise<boolean> {
  return (await loc.count()) === 1
}

// Intent verification (spec §6.2: confirm we found the RIGHT element, never just "an element").
// A heal candidate is only acceptable if the resolved element is consistent with the target's
// declared role. This is what stops the silent-false-green where a removed <button>Sign in</button>
// "heals" to the surviving <h1>Sign in</h1> heading by text — different role => reject the candidate.
export async function roleConsistent(loc: Locator, expectedRole: string | undefined): Promise<boolean> {
  if (!expectedRole) return true
  try {
    const tag = await loc.evaluate((el: Element) => el.tagName.toLowerCase())
    const explicit = await loc.getAttribute("role")
    if (explicit && explicit === expectedRole) return true
    // Minimal implicit-role map for the roles this layer exercises.
    const implicit: Record<string, string[]> = {
      button: ["button"],
      textbox: ["input", "textarea"],
      heading: ["h1", "h2", "h3", "h4", "h5", "h6"],
      link: ["a"],
    }
    return (implicit[expectedRole] ?? []).includes(tag)
  } catch {
    return false
  }
}

interface ResolveResult {
  tier: Exclude<Tier, "none">
  selector: string | null // the selector to persist as the new cache value (null = role/text/etc locator, encode it)
  locator: Locator
  healed: boolean
  confidence: number
  /** Which Tier-1 signal matched (only set on a heal). */
  candidateSignal?: CandidateSignal
}

// Build a stable CSS selector to persist for a healed element so the NEXT walk is Tier 0 again.
// Prefer id, then data-testid, then the role+name candidate re-expressed structurally; never persist
// a brittle nth-child if a stable handle exists.
async function persistableSelector(page: Page, loc: Locator): Promise<string | null> {
  try {
    return await loc.evaluate((el: Element) => {
      // esc must be inlined: this runs in the page context, not the runner module scope.
      const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
      if (el.id) return "#" + CSS.escape(el.id)
      const tid = el.getAttribute("data-testid")
      if (tid) return `[data-testid="${esc(tid)}"]`
      const al = el.getAttribute("aria-label")
      if (al) return `${el.tagName.toLowerCase()}[aria-label="${esc(al)}"]`
      return null
    })
  } catch {
    return null
  }
}

// KLA-71: normalize a URL to origin+pathname for same-page comparison. Query params and
// fragments can legitimately vary within a single "page"; we only care about the path.
function samePageUrl(a: string, b: string): boolean {
  try {
    const ua = new URL(a); const ub = new URL(b)
    return ua.origin === ub.origin && ua.pathname === ub.pathname
  } catch {
    return a === b  // non-parseable (e.g. data:, about:blank) → exact match
  }
}

// Tier 0 -> Tier 1 candidate ladder. Returns the first tier whose candidate uniquely resolves.
// Order: cached selector (Tier 0) -> role+name -> text -> testid -> structural domPath (Tier 1).
//
// KLA-71: expectedUrl is captured before entering this function (page.url() at step start).
// Any Tier-1 candidate is rejected if page.url() has navigated away (cross-page heal guard).
// role+name signal now also enforces roleConsistent for belt-and-suspenders parity with signals 2-4.
export async function resolveTarget(
  page: Page,
  cachedSelector: string | null,
  fp: Fingerprint | null,
  expectedUrl?: string,
): Promise<ResolveResult> {
  // Tier 0: the cached concrete selector, verbatim. Zero work, zero heal.
  if (cachedSelector) {
    const loc = page.locator(cachedSelector)
    const count = await loc.count()
    if (count === 1) {
      return { tier: "cache", selector: cachedSelector, locator: loc, healed: false, confidence: CACHE_CONFIDENCE }
    }
    // count > 1: the selector is AMBIGUOUS — healing an arbitrary match is unsafe.
    // Throw immediately so the caller records a clear 'ambiguous_selector' finding.
    // count = 0: element may have drifted legitimately → fall through to Tier-1 healing.
    if (count > 1) throw new AmbiguousSelector(cachedSelector, count)
  }

  // Tier 1 multi-candidate semantic fallback (no LLM). Each must uniquely resolve.
  // KLA-71 cross-page guard: page must still be at the expected URL before accepting any candidate.
  if (fp) {
    // 1. role + accessible-name (the faithful accname signal, strongest semantic anchor).
    // KLA-71: roleConsistent added for parity with signals 2-4 (belt-and-suspenders on top of
    // getByRole's own ARIA role filter). Cross-page guard applied before returning.
    if (fp.role && fp.accessibleName) {
      const loc = page.getByRole(fp.role as any, { name: fp.accessibleName, exact: true })
      if (await uniquelyResolves(loc) && (await roleConsistent(loc, fp.role)) && (!expectedUrl || samePageUrl(page.url(), expectedUrl))) {
        return { tier: "candidate", selector: await persistableSelector(page, loc), locator: loc, healed: true, confidence: SIGNAL_CONFIDENCE["role+name"], candidateSignal: "role+name" }
      }
    }
    // 2. visible text — but only if the resolved element's role matches the target's (intent
    //    verification): a removed <button> must NOT heal onto a same-text <h1>.
    if (fp.text) {
      const loc = page.getByText(fp.text, { exact: true })
      if ((await uniquelyResolves(loc)) && (await roleConsistent(loc, fp.role)) && (!expectedUrl || samePageUrl(page.url(), expectedUrl))) {
        return { tier: "candidate", selector: await persistableSelector(page, loc), locator: loc, healed: true, confidence: SIGNAL_CONFIDENCE.text, candidateSignal: "text" }
      }
    }
    // 3. data-testid (escape embedded backslash/double-quote in the value)
    if (fp.testId) {
      const tidSel = `[data-testid="${escAttr(fp.testId)}"]`
      const loc = page.locator(tidSel)
      if ((await uniquelyResolves(loc)) && (await roleConsistent(loc, fp.role)) && (!expectedUrl || samePageUrl(page.url(), expectedUrl))) {
        return { tier: "candidate", selector: tidSel, locator: loc, healed: true, confidence: SIGNAL_CONFIDENCE.testid, candidateSignal: "testid" }
      }
    }
    // 4. structural domPath
    if (fp.domPath) {
      const loc = page.locator(fp.domPath)
      if ((await uniquelyResolves(loc)) && (await roleConsistent(loc, fp.role)) && (!expectedUrl || samePageUrl(page.url(), expectedUrl))) {
        return { tier: "candidate", selector: fp.domPath, locator: loc, healed: true, confidence: SIGNAL_CONFIDENCE.domPath, candidateSignal: "domPath" }
      }
    }
  }

  throw new ElementGone(fp)
}

// Default real uploader: wraps uploadScreenshotMeta to conform to the injectable (bytes, ct) => {key} sig.
async function defaultShotUploader(bytes: Uint8Array, contentType: string): Promise<{ key: string }> {
  const meta = await uploadScreenshotMeta(bytes, contentType)
  return { key: meta.key }
}

/**
 * Best-effort per-step screenshot capture. Called AFTER an actionable step's action has settled.
 * Returns jpeg bytes on success, undefined on any failure (try/catch — never fails a step).
 * Upload is intentionally NOT done here: KLA-83 keeps S3 I/O off the step/deadline path.
 */
async function maybeCaptureShot(page: Page, opts: WalkOptions): Promise<{ bytes: Uint8Array; contentType: "image/jpeg" } | undefined> {
  if (!opts.stepShots) return undefined
  try {
    const buf = await page.screenshot({ type: "jpeg", quality: 45 })
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
    return { bytes, contentType: "image/jpeg" }
  } catch {
    // Best-effort: capture failure must never fail a step.
    return undefined
  }
}

export interface StepShotUploadQueue {
  enqueue: (runStepId: string, bytes: Uint8Array, contentType: string) => boolean
  drain: () => Promise<void>
  pending: () => number
}

function positiveInt(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

export function createStepShotUploadQueue(
  projectId: string,
  uploader: (bytes: Uint8Array, contentType: string) => Promise<{ key: string }>,
  patchEvidence: (projectId: string, runStepId: string, patch: Record<string, unknown>) => Promise<void> = mergeRunStepEvidence,
  options?: { concurrency?: number; maxBuffered?: number },
): StepShotUploadQueue {
  const concurrency = positiveInt(options?.concurrency ?? process.env.KLAV_STEP_SHOT_UPLOAD_CONCURRENCY, 4)
  const maxBuffered = positiveInt(options?.maxBuffered ?? process.env.KLAV_STEP_SHOT_UPLOAD_MAX_BUFFERED, 64)
  const queue: Array<{ runStepId: string; bytes: Uint8Array; contentType: string }> = []
  const idleResolvers: Array<() => void> = []
  let active = 0

  const notifyIdle = () => {
    if (active !== 0 || queue.length !== 0) return
    const resolvers = idleResolvers.splice(0)
    for (const resolve of resolvers) resolve()
  }

  const pump = () => {
    while (active < concurrency && queue.length) {
      const job = queue.shift()!
      active++
      ;(async () => {
        try {
          const result = await uploader(job.bytes, job.contentType)
          if (result?.key) {
            await patchEvidence(projectId, job.runStepId, { screenshotKey: result.key })
          }
        } catch {
          // Best-effort: upload/patch failure must never affect the walk.
        } finally {
          active--
          pump()
          notifyIdle()
        }
      })()
    }
  }

  return {
    enqueue(runStepId, bytes, contentType) {
      if (active + queue.length >= maxBuffered) return false
      queue.push({ runStepId, bytes, contentType })
      pump()
      return true
    },
    async drain() {
      if (active === 0 && queue.length === 0) return
      await new Promise<void>((resolve) => idleResolvers.push(resolve))
    },
    pending() {
      return active + queue.length
    },
  }
}

// KLA-111: apply NetworkMock entries to a Playwright Page via page.route().
// `mock.url` is treated as a substring: any request whose full URL contains it is intercepted.
// For "stub" mocks, route.fulfill() returns the canned response; for "block", route.abort() drops it.
// Called once before the initial navigation so all requests (including subresources) are covered.
async function applyNetworkMocks(page: Page, mocks: NetworkMock[]) {
  for (const mock of mocks) {
    const raw = mock as any
    const pattern = (url: URL) => matchesMock(mock.url, url.href)
    if (raw.block || raw.action === "block") {
      await page.route(pattern, (route) => route.abort())
    } else {
      const stub = raw.stub ?? raw
      await page.route(pattern, (route) => route.fulfill({
        status: stub.status ?? 200,
        contentType: stub.contentType ?? "application/json",
        headers: stub.headers ?? {},
        body: stub.body ?? "",
      }))
    }
  }
}

/**
 * Walk a crystallized Trail against a real page. Project-scoped.
 * Opens the page once, replays each step (Tier 0 cache -> Tier 1 heal), evaluates checkpoints,
 * writes run_steps + the Walk verdict via Layer A, returns a summary. Zero LLM.
 */
export async function walkTrail(projectId: string, trailId: string, opts: WalkOptions): Promise<WalkSummary> {
  const trail = await getTrail(projectId, trailId)
  if (!trail) throw new Error(`trail ${trailId} not found in project ${projectId}`)
  // KLA-93: if an environment name is given, resolve its baseUrl and use it as the walk URL.
  // Throws early (before the browser is acquired) when the name is not found on this trail.
  if (opts.environmentName) {
    opts = { ...opts, fixtureUrl: resolveEnvironmentUrl(trail, opts.environmentName) }
  }
  // Draft-gate (AutoSims F1): draft Trails and explicit Verification Walks never file Findings.
  // Evidence (run_steps) is still captured so the author can review what happened.
  opts = { ...opts, suppressFindings: opts.suppressFindings ?? (trail.status === "draft"), _resolvedCreds: new Set<string>() }
  // KLA-106: expand callModule steps inline before walking. Pure DB read, backward-compatible:
  // a trail with no callModule steps is returned unchanged by expandModuleSteps.
  const rawSteps = await listTrailSteps(projectId, trailId)
  const steps = await expandModuleSteps(projectId, rawSteps)

  // Adopt a pre-created Walk row (Plan G trigger) so run_steps/replay/verdict share the caller's runId;
  // otherwise mint our own as before (every existing caller). No behavior change when runId is absent.
  const runId = opts.runId ?? (await startWalk(projectId, trailId, "manual", opts.environmentName))

  // Browser via the seam: local Playwright by default; connectOverCDP → remote (Steel) when
  // AUTOSIM_CDP_URL is set (moves the walk off the 1GB box). bh.close() handles Steel release.
  //
  // KLA — INSTANT-RED FIX: browser acquisition happens BEFORE the walk try/finally below, so a launch
  // failure (Chromium missing/OOM on the 1GB box, or an unreachable remote CDP) used to escape walkTrail
  // entirely and be finalized by runWalkNow's generic catch with NO failureKind — indistinguishable from
  // a real regression, and with an empty walk report. Catch it here: the run row already exists, so we
  // finalize it RED as a CRASH (infra), with the actionable BrowserLaunchError message surfaced verbatim.
  let bh: PlaywrightBrowserHandle
  try {
    bh = await acquirePlaywrightBrowser({ headless: opts.headless, launchArgs: opts.launchArgs })
  } catch (e) {
    const msg = e instanceof BrowserLaunchError ? e.message : `Could not start the walk browser: ${String((e as any)?.message ?? e)}`
    const reasons = [msg]
    await finishWalk(projectId, runId, {
      status: "red",
      llmCalls: 0,
      summary: { reasons, failureKind: "crash", error: msg, browserUnavailable: true },
    }).catch(() => {})
    notifyWalkRed({ trailName: trail.name, trailId, projectId, runId, reasons, at: Date.now(), failureKind: "crash", browserUnavailable: true }).catch(() => {})
    return { runId, verdict: "red", llmCalls: 0, steps: [], healedCount: 0, reasons, failureKind: "crash" }
  }
  const browser: Browser = bh.browser
  const stepSummaries: WalkStepSummary[] = []
  let walkVerdict: Verdict = "green"
  let healedCount = 0
  let llmCalls = 0
  // Red-reason ledger (KLAVITYKLA-48): every RED verdict must carry a human-readable reason so the
  // Walk summary is never silent. Reasons accumulate per-step and are surfaced in `finishWalk` below.
  const redReasons: string[] = []
  // Plan G hard per-walk deadline: a wall-clock budget checked at the top of each step. Infinity = off.
  const deadline = opts.deadlineMs ? Date.now() + opts.deadlineMs : Infinity
  let deadlineHit = false
  let cancelledBySignal = false
  let redFailureKind: FailureKind | null = null
  const shotUploads = opts.stepShots
    ? createStepShotUploadQueue(projectId, opts.shotUploader ?? defaultShotUploader)
    : null

  // Plan G prod-safety — make the deadline a REAL ceiling, not just a between-steps check. A single
  // live-network navigation (initial goto OR a navigate step) must NOT be allowed to hang on
  // Playwright's 30s default and pin the single walk-slot + the browser on the 1GB box. Bound EVERY
  // page operation (nav + waitFor + screenshot/content) to opTimeout: capped at <=15s, floored at 3s.
  const opTimeout = Math.max(3000, Math.min(15000, opts.deadlineMs ?? 120000))

  // ── Plan E2: opt-in rrweb capture. DEFAULT-OFF leaves everything below byte-identical (no context,
  // no binding). When on, we open an explicit BrowserContext so setupReplayCapture can inject the
  // recorder + a binding; the page lives in that context. ALL capture is best-effort/try-caught. ──
  let context: BrowserContext | null = null
  let capture: ReplayCapture | null = null
  let stopLiveScreencast: (() => Promise<void>) | null = null
  let liveWatchEnded = false
  const contextOptions = playwrightContextOptionsForTrailViewport(trail.viewport)
  const closeLiveWatch = (message = "ended") => {
    if (!opts.liveWatch || liveWatchEnded) return
    liveWatchEnded = true
    endLiveWatchRun(projectId, runId, message)
  }

  // ── KLAVITYKLA-126: environment-determinism artifacts (opt-in HAR record/replay + Playwright trace).
  // Decide record-vs-replay ONCE up front (record on first green when no HAR yet; replay when one
  // exists). All artifact I/O is best-effort: a failure logs + falls back to unchanged live behavior.
  let harExists = false
  const harEnabledEarly = opts.har ?? (process.env.KLAV_AUTOSIM_HAR === "1")
  if (harEnabledEarly) {
    try { harExists = (await getHarForTrail(projectId, trailId)) != null } catch { harExists = false }
  }
  const artifactPlan = planWalkArtifacts(opts, harExists)
  const artifactsActive = artifactPlan.harRecordMode || artifactPlan.harReplayMode || artifactPlan.traceEnabled
  let artifactDir: string | null = null
  let harRecordPath: string | null = null
  let harReplayPath: string | null = null
  let tracePath: string | null = null
  let tracingStarted = false
  let sawSuccessfulFinish = false
  if (artifactsActive) {
    try {
      artifactDir = await mkdtemp(joinPath(tmpdir(), "klav-autosim-artifact-"))
      if (artifactPlan.harRecordMode) harRecordPath = joinPath(artifactDir, "record.har")
      if (artifactPlan.traceEnabled) tracePath = joinPath(artifactDir, "trace.zip")
      if (artifactPlan.harReplayMode) {
        // Materialize the stored HAR to a temp file so routeFromHAR can read it.
        const harBytes = await getHarForTrail(projectId, trailId)
        if (harBytes && harBytes.byteLength > 0) {
          harReplayPath = joinPath(artifactDir, "replay.har")
          await writeFile(harReplayPath, harBytes)
        }
      }
    } catch (e) {
      console.warn("[trails-artifact] artifact temp setup failed, walking without HAR/trace:", String(e))
      artifactDir = null; harRecordPath = null; harReplayPath = null; tracePath = null
    }
  }

  const needContext = opts.replay || contextOptions || artifactsActive
  if (needContext) {
    try {
      // Merge viewport options with the HAR-record option (recordHar must be set at newContext time).
      const mergedContextOptions = {
        ...(contextOptions ?? {}),
        ...(harRecordPath ? harRecordContextOptions(harRecordPath) : {}),
      }
      context = await browser.newContext(mergedContextOptions as any)
    } catch (e) {
      console.warn("[trails-context] browser context setup failed, walking with a default page:", String(e))
      context = null
      harRecordPath = null; tracePath = null
    }
    // KLA-126: install HAR replay + start tracing on the fresh context (best-effort; never fail a walk).
    if (context && harReplayPath) {
      try { await applyHarReplay(context, harReplayPath, artifactPlan.harNotFound) }
      catch (e) { console.warn("[trails-har] routeFromHAR replay setup failed (continuing live):", String(e)) }
    }
    if (context && artifactPlan.traceEnabled) {
      try { await startContextTracing(context); tracingStarted = true }
      catch (e) { console.warn("[trails-trace] tracing.start failed (continuing without trace):", String(e)) }
    }
    if (context && opts.replay) {
      try {
        capture = await setupReplayCapture(context)
      } catch (e) {
        console.warn("[trails-replay] capture setup failed, walking without replay:", String(e))
        // Only tear the context down if nothing else still needs it (viewport / HAR / tracing).
        if (!contextOptions && !artifactsActive) { try { await context.close() } catch {}; context = null }
        capture = null
      }
    } else {
      capture = null
    }
  }

  // KLAVITYKLA-126: finalize env-determinism artifacts. Best-effort: never changes the walk verdict.
  // Order matters — stop tracing (writes the zip) and CLOSE the context (flushes the recorded HAR to
  // disk) BEFORE reading either file back. HAR is persisted ONLY on a clean GREEN finish (first-green
  // baseline); the trace is persisted on any completed walk (green/red) for debugging.
  const finalizeArtifacts = async () => {
    if (!artifactsActive) return
    try {
      if (context && tracingStarted && tracePath) {
        try { await stopContextTracing(context, tracePath) } catch (e) { console.warn("[trails-trace] tracing.stop failed:", String(e)) }
      }
      if (context) { try { await context.close() } catch {} } // flush recorded HAR to disk
      context = null
      if (tracePath) {
        try {
          const bytes = await readFile(tracePath)
          if (bytes.byteLength > 0) await saveWalkArtifact({ projectId, kind: "trace", runId, bytes })
        } catch (e) { console.warn("[trails-trace] trace persist failed:", String(e)) }
      }
      if (harRecordPath && sawSuccessfulFinish && walkVerdict === "green") {
        try {
          const bytes = await readFile(harRecordPath)
          if (bytes.byteLength > 0) await saveWalkArtifact({ projectId, kind: "har", trailId, runId, bytes })
        } catch (e) { console.warn("[trails-har] HAR persist failed:", String(e)) }
      }
    } finally {
      if (artifactDir) { try { await rm(artifactDir, { recursive: true, force: true }) } catch {} }
    }
  }

  // KLA-74: hoisted so the catch block can include diagnostics even on walk crash.
  const evCol = new WalkEvidenceCollector()

  try {
    const page: Page = context ? await context.newPage() : await browser.newPage()
    if (opts.liveWatch) {
      startLiveWatchRun(projectId, runId)
      try {
        stopLiveScreencast = await startCdpScreencast(page, (frame) => {
          publishLiveWatchFrame(projectId, runId, frame.dataUrl)
        })
      } catch (e) {
        closeLiveWatch("screencast unavailable")
        console.warn("[trails-live-watch] screencast unavailable, continuing walk:", String(e))
      }
    }
    // Cap EVERY default page operation/navigation at opTimeout so nothing falls back to Playwright's
    // 30s default. The initial goto below is bounded explicitly too (belt-and-braces). A goto timeout
    // THROWS — it is inside this try, so it finalizes the walk RED via the catch below, never a hang.
    page.setDefaultNavigationTimeout(opTimeout)
    page.setDefaultTimeout(opTimeout)

    // KLA-74: attach evidence collector. Best-effort — a failure here never affects the walk.
    try { evCol.attach(page) } catch (e) { console.warn("[trails-evidence] attach failed:", String(e)) }

    // KLA-111: install network mocks BEFORE the first navigation so the initial page load is intercepted.
    if (opts.networkMocks?.length) {
      await page.route("**/*", (route) => {
        const reqUrl = route.request().url()
        for (const mock of opts.networkMocks!) {
          if (!matchesMock(mock.url, reqUrl)) continue
          const raw = mock as any
          if (raw.block || raw.action === "block") { route.abort("blockedbyclient").catch(() => {}); return }
          const stub = raw.stub ?? raw
          route.fulfill({
            status: stub.status ?? 200,
            contentType: stub.contentType ?? "text/plain",
            headers: stub.headers ?? {},
            body: stub.body ?? "",
          }).catch(() => {})
          return
        }
        route.continue().catch(() => {})
      })
    }
    await page.goto(opts.fixtureUrl, { timeout: opTimeout })

    // Track the document URL across steps so a full-page navigation (click-driven or explicit
    // navigate) becomes a segment boundary: flush the page just LEFT, tagged with the idx of the
    // step that triggered the nav, then the next page records into a fresh buffer.
    let segUrl = page.url()
    let segIdx = 0

    for (const step of steps) {
      // KLA-55: heartbeat — updated at the top of each step so the stale reaper knows this walk
      // is still alive. Best-effort: a failed touch never stops the walk.
      touchWalkHeartbeat(runId).catch(() => {})
      // Plan G prod-safety: a hard per-walk deadline. If the wall-clock budget is blown, STOP the walk
      // (don't run this or any further step) and roll the verdict to RED — the page-too-slow / runaway
      // case can't pin the shared 1GB box. The browser is still closed in the `finally` below.
      if (Date.now() > deadline) { walkVerdict = "red"; deadlineHit = true; break }
      // KLA-61: a step that would start with under ~1s remaining is skipped with deadline_exceeded
      if (deadline - Date.now() < 1000) { walkVerdict = "red"; deadlineHit = true; break }
      // KLA-100: cancel signal check — stop at the next step boundary after the abort fires.
      if (opts.signal?.aborted) { walkVerdict = "red"; cancelledBySignal = true; break }

      // Drain the CURRENTLY-SHOWN document's rrweb buffer into the current segment BEFORE running the
      // step — if this step navigates, the boundary flush below seals exactly this page's events.
      if (capture) {
        try { await capture.drain(page) } catch (e) { console.warn("[trails-replay] pre-step drain failed:", String(e)) }
      }

      const evBefore = evCol.offsets()
      const stepStart = Date.now()
      const { tier, verdict, healed, llmCalls: stepLlm, failureKind } = await runOneStep(projectId, runId, trail.id, page, step, opts, opTimeout, deadline, { col: evCol, before: evBefore, start: stepStart }, shotUploads, walkVerdict === "red")
      stepSummaries.push({ stepId: step.id, idx: step.idx, tier, verdict, healed, ...(failureKind ? { failureKind } : {}) })
      if (healed) healedCount++
      llmCalls += stepLlm
      walkVerdict = worse(walkVerdict, verdict)
      // KLAVITYKLA-48: every RED must carry a reason — accumulate per-step so the Walk summary is never silent.
      if (verdict === "red") {
        redReasons.push(humanRedReason(step.idx, step.action, step.target?.accessibleName))
        redFailureKind = worseFailureKind(redFailureKind, failureKind ?? failureKindForExpectationFailure())
      }

      if (capture) {
        try {
          const nowUrl = page.url()
          if (nowUrl !== segUrl) {
            // The page navigated during this step → seal the page we just left as a segment, then
            // the new document (which re-ran the rrweb init script) begins at the NEXT step's idx.
            await capture.flush(segIdx, segUrl, page)
            segUrl = nowUrl
            segIdx = step.idx + 1
          }
        } catch (e) {
          console.warn("[trails-replay] segment flush failed (continuing):", String(e))
        }
      }
    }

    // Seal the final page (still loaded → poll the live page so its async snapshot is captured).
    if (capture) {
      try { await capture.flush(segIdx, page.url(), page, true) } catch (e) {
        console.warn("[trails-replay] final flush failed:", String(e))
      }
    }

    // KLA-74: include browser diagnostics in the walk summary when anything was captured.
    const evSummary = evCol.hasEvidence() ? evCol.summary() : null
    const walkFailureKind = walkVerdict === "red"
      ? (deadlineHit || cancelledBySignal ? failureKindForThrownError(deadlineHit ? "deadline_exceeded" : "cancelled") : redFailureKind ?? failureKindForExpectationFailure())
      : null
    await finishWalk(projectId, runId, {
      status: walkVerdict,
      llmCalls,
      // browserKind (KLA-278): which browser actually ran the walk — "local", "steel:<region>",
      // "cdp-remote", or "local-fallback" (remote endpoint was down → we fell back so the guard
      // still ran). Surfacing it here makes the Steel↔local fallback VISIBLE on the walk report.
      summary: { healedCount, stepCount: steps.length, browserKind: bh.kind, ...(walkFailureKind ? { failureKind: walkFailureKind } : {}), ...(deadlineHit ? { error: "deadline_exceeded" } : cancelledBySignal ? { error: "cancelled" } : {}), ...(evSummary ? { evidence: evSummary } : {}) },
    })

    if (walkVerdict === "red") {
      notifyWalkRed({ trailName: trail.name, trailId, projectId, runId, reasons: redReasons, at: Date.now(), failureKind: walkFailureKind ?? undefined }).catch(() => {})
    }

    // KLA-94: opt-in auto-file. Runs after finishWalk so the walk is already settled. Best-effort:
    // a filing failure leaves findings queued for human review and never changes the walk verdict.
    maybeAutoFileWalkFindings(projectId, runId).catch(() => {})

    // Persist the replay AFTER finishWalk. Best-effort: a save failure never changes the Walk result.
    if (capture && capture.segments.length) {
      try { await saveReplay(projectId, runId, capture.segments, opts._resolvedCreds) } catch (e) {
        console.warn("[trails-replay] saveReplay failed:", String(e))
      }
    }
    // KLAVITYKLA-126: mark a clean finish so the first-green HAR baseline is recorded only here.
    sawSuccessfulFinish = true
    return { runId, verdict: walkVerdict, llmCalls, steps: stepSummaries, healedCount, reasons: redReasons, ...(walkFailureKind ? { failureKind: walkFailureKind } : {}), ...(evSummary ? { evidence: evSummary } : {}) }
  } catch (e) {
    // Anything thrown (e.g. an unreachable fixtureUrl) must STILL finalize the run — never leave it
    // 'running'. The Walk is RED and the error is recorded in the summary for the trace viewer.
    const redReasons: string[] = [`walk failed: ${String(e)}`]
    const evSummaryCatch = evCol.hasEvidence() ? evCol.summary() : null
    await finishWalk(projectId, runId, {
      status: "red",
      llmCalls,
      summary: { ...redReasons.length ? { reasons: redReasons } : {}, failureKind: failureKindForThrownError(e), error: String(e), browserKind: bh.kind, ...(evSummaryCatch ? { evidence: evSummaryCatch } : {}) },
    })
    notifyWalkRed({ trailName: trail.name, trailId, projectId, runId, reasons: redReasons, at: Date.now(), failureKind: failureKindForThrownError(e) }).catch(() => {})
    return { runId, verdict: "red", llmCalls, steps: stepSummaries, healedCount, reasons: redReasons, failureKind: failureKindForThrownError(e), ...(evSummaryCatch ? { evidence: evSummaryCatch } : {}) }
  } finally {
    // Usage meter (KLAVITYKLA-305): one 'autosim_walk' event per completed AutoSim/Trail walk
    // (any verdict). MEASUREMENT ONLY — fire-and-forget, never awaited, never blocks the walk.
    // Reached whether the walk ran green, red, or threw, so it matches "guarded AutoSim flows" 1:1.
    // A browser-launch failure returns early above (before this try), so nothing is metered there.
    void incrementUsageMeter({ metric: "autosim_walk", projectId })
    // Quota signal (KLAVITYKLA-306): read-only degrade check — non-blocking, ship-dark.
    // When KLAV_ENFORCE_QUOTA is off (default) this always returns allow=true and has no effect.
    void checkQuotaForProject(projectId, "autosim_walk").then((q) => {
      if (q.degraded) console.warn(`[quota] autosim_walk degraded for project ${projectId}: ${q.reason}`)
    }).catch(() => {})
    if (stopLiveScreencast) {
      try { await stopLiveScreencast() } catch {}
    }
    closeLiveWatch()
    // KLAVITYKLA-126: stop tracing + flush/persist HAR + trace BEFORE closing the browser (the context
    // must still be alive to write the artifacts to disk). No-op when no artifact flag is active.
    await finalizeArtifacts()
    await bh.close()
    if (shotUploads) await shotUploads.drain()
  }
}

interface OneStepResult { tier: Tier; verdict: Verdict; healed: boolean; llmCalls: number; failureKind?: FailureKind }

// KLA-74: evidence context threaded into runOneStep + callees so they can inject
// durationMs + per-step browser events into every addRunStep evidence blob.
type EvCtx = { col: WalkEvidenceCollector; before: EvidenceOffsets; start: number } | null
type StepRunFn = (input: Parameters<typeof addRunStep>[1]) => ReturnType<typeof addRunStep>

// ── KLA-104: pause/resume-for-secret ─────────────────────────────────────────────────────────────
/**
 * Resolves the secret for a `pauseForSecret` step. Resolution priority:
 *   1. opts.injectedSecrets[actionValue] — instant (test injection or pre-loaded test account value)
 *   2. opts.secretResolver({ stepIdx, actionValue }) — async callback (in-process test helper)
 *   3. DB pause + poll loop — walk status set to "paused"; HTTP caller calls POST /resume
 *
 * Returns the resolved secret string, or null on timeout/error (step goes RED).
 */
const PAUSE_POLL_MS = 500
const PAUSE_MAX_WAIT_MS = 10 * 60 * 1000  // 10 min hard cap; deadline also bounds this

async function resolvePauseSecret(
  projectId: string,
  runId: string,
  step: TrailStep,
  opts: WalkOptions,
  deadline: number,
): Promise<string | null> {
  const key = step.actionValue ?? ""

  // Path 1: injected secret (fastest — no I/O, no pause)
  if (opts.injectedSecrets && key in opts.injectedSecrets) {
    return opts.injectedSecrets[key]
  }

  // Path 2: async callback resolver (in-process; e.g. test helper or server-side lookup)
  if (opts.secretResolver) {
    try {
      return await opts.secretResolver({ stepIdx: step.idx, actionValue: step.actionValue })
    } catch (e) {
      console.warn("[KLA-104] secretResolver threw:", e)
      return null
    }
  }

  // Path 3: DB-backed pause + HTTP poll
  // Generate an opaque challenge key the resume endpoint must echo back.
  const challengeKey = `pfs_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  await pauseWalk(projectId, runId, challengeKey)

  const giveUpAt = Math.min(Date.now() + PAUSE_MAX_WAIT_MS, deadline)
  while (Date.now() < giveUpAt) {
    await new Promise<void>((r) => setTimeout(r, PAUSE_POLL_MS))
    const row = await getWalk(projectId, runId)
    if (!row) break  // walk was deleted
    if (row.status === "running") {
      // resumeWalk wrote the secret into paused_secret_key and flipped status=running.
      // Read the raw column value via a direct DB query so we get it before the runner
      // re-polls (getWalk doesn't expose paused_secret_key to keep Walk interface clean).
      const r = await db!.execute({
        sql: "SELECT paused_secret_key FROM trail_runs WHERE project_id=? AND id=?",
        args: [projectId, runId],
      })
      const secretValue = r.rows.length ? String((r.rows[0] as any).paused_secret_key ?? "") : ""
      // Clear the column now that we have the value.
      await db!.execute({
        sql: "UPDATE trail_runs SET paused_secret_key=NULL WHERE project_id=? AND id=?",
        args: [projectId, runId],
      })
      return secretValue || null
    }
    // status=paused → keep polling; any other status (red/green) → walk was killed
    if (row.status !== "paused") break
  }
  console.warn("[KLA-104] resolvePauseSecret timed out or walk terminated for runId:", runId)
  return null
}

// Execute a single step. Records exactly one run_step. Never silent-greens a break.

async function runOneStep(
  projectId: string,
  runId: string,
  trailId: string,
  page: Page,
  step: TrailStep,
  opts: WalkOptions,
  opTimeout: number,
  deadline: number,
  evCtx: EvCtx = null,
  shotUploads: StepShotUploadQueue | null = null,
  priorRed = false,
): Promise<OneStepResult> {
  // KLA-61: dynamically adjust page timeouts based on remaining walk deadline
  const currentTimeout = Math.max(0, Math.min(opTimeout, deadline - Date.now()))
  page.setDefaultNavigationTimeout(currentTimeout)
  page.setDefaultTimeout(currentTimeout)
  // KLA-74: wrapper that prepends durationMs + per-step browser events to every addRunStep evidence blob.
  // Built once here and passed down to runVisionTier2 / fileAmberHeal so all paths are covered.
  const addStepRun = (input: Parameters<typeof addRunStep>[1]) => {
    const se = evCtx ? evCtx.col.stepEvidence(evCtx.before, evCtx.start) : { durationMs: 0 }
    const diagExtra: Record<string, unknown> = { durationMs: se.durationMs }
    if (se.consoleLogs?.length)     diagExtra.consoleLogs     = se.consoleLogs
    if (se.pageErrors?.length)      diagExtra.pageErrors      = se.pageErrors
    if (se.failedRequests?.length)  diagExtra.failedRequests  = se.failedRequests
    if (se.failedResponses?.length) diagExtra.failedResponses = se.failedResponses
    return addRunStep(projectId, { ...input, evidence: { ...diagExtra, ...(input.evidence ?? {}) } })
  }
  const addStepRunWithShot = async (input: Parameters<typeof addRunStep>[1]) => {
    const shot = await maybeCaptureShot(page, opts)
    const runStepId = await addStepRun(input)
    if (shot) shotUploads?.enqueue(runStepId, shot.bytes, shot.contentType)
    return runStepId
  }
  const fixtureUrl = opts.fixtureUrl
  const stepPageUrl = page.url()
  const recordedStep = (selector: string | null | undefined, target?: Fingerprint | null) =>
    recordedStepState(step, selector, stepPageUrl, target)
  // A callModule step that survived expansion (unknown/empty module) → record RED so the author
  // sees it rather than crashing the whole walk with an unhandled action.
  if (step.action === "callModule") {
    await addStepRun({
      runId, trailId, stepId: step.id, idx: step.idx, tier: "none", verdict: "red", confidence: 0, healed: false,
      evidence: tagRedEvidence(failureKindForExpectationFailure(), { action: "callModule", error: "module not expanded — module missing or empty", actionValue: step.actionValue }),
    })
    return { tier: "none", verdict: "red", healed: false, llmCalls: 0, failureKind: failureKindForExpectationFailure() }
  }
  // navigate / wait have no element to resolve.
  if (step.action === "navigate") {
    // In Layer C the whole walk is scoped to fixtureUrl; re-navigate to it (origin already loaded).
    // Bound the nav at opTimeout (Plan G) so a live-network navigate step can't hang on the 30s default.
    await page.goto(step.actionValue && /^https?:|^file:/.test(step.actionValue) ? step.actionValue : fixtureUrl, { timeout: currentTimeout })
    await addStepRun({
      runId, trailId, stepId: step.id, idx: step.idx, tier: "none", verdict: "green", confidence: 1, healed: false,
      evidence: { action: "navigate", recordedStep: recordedStep(null, null), resultUrl: page.url() },
    })
    return { tier: "none", verdict: "green", healed: false, llmCalls: 0 }
  }
  if (step.action === "wait") {
    // An authored wait's actionValue is EXPLICIT intent (the author model chose it for a reason —
    // e.g. an async login round-trip or an AI extraction) — honor it as a minimum, THEN settle on
    // networkidle. networkidle alone was instantly satisfied when the triggering fetch hadn't
    // started yet (observed live 2026-07-04: replay navigated cookie-less mid-login → bounced to
    // /login and the walk cascaded RED). Capped so a bad value can't blow the walk deadline.
    const minMs = Math.min(Math.max(Number(step.actionValue) || 0, 0), 15_000)
    const remaining = Math.max(0, deadline - Date.now())
    const waitMs = Math.min(minMs, remaining)
    if (waitMs > 0) await page.waitForTimeout(waitMs)
    const postWaitRemaining = Math.max(0, deadline - Date.now())
    await page.waitForLoadState("networkidle", { timeout: Math.min(opTimeout, postWaitRemaining) }).catch(() => {})
    await addStepRun({
      runId, trailId, stepId: step.id, idx: step.idx, tier: "none", verdict: "green", confidence: 1, healed: false,
      evidence: { action: "wait", recordedStep: recordedStep(null, null) },
    })
    return { tier: "none", verdict: "green", healed: false, llmCalls: 0 }
  }
  if (step.action === "pauseForSecret") {
    // KLA-104: Pause the walk, wait for a secret (OTP/OAuth token) then resume.
    const secretValue = await resolvePauseSecret(projectId, runId, step, opts, deadline)
    await addStepRun({
      runId, trailId, stepId: step.id, idx: step.idx, tier: "none",
      verdict: secretValue === null ? "red" : "green", confidence: secretValue === null ? 0 : 1,
      healed: false,
      evidence: {
        action: "pauseForSecret",
        actionValue: step.actionValue,
        resolved: secretValue !== null,
        recordedStep: recordedStep(null, null),
      },
    })
    if (secretValue === null) {
      return { tier: "none", verdict: "red", healed: false, llmCalls: 0, failureKind: "crash" }
    }
    return { tier: "none", verdict: "green", healed: false, llmCalls: 0 }
  }

  // The cached selector is the single source of truth (lives in locator_cache, not step.target).

  const cacheRow = await getCacheForStep(projectId, step.id)
  const cachedSelector = cacheRow?.resolvedSelector ?? null
  // Fingerprint signals for Tier 1: prefer the cache row's, fall back to the step's stored target.
  const fp: Fingerprint | null = cacheRow?.fingerprint ?? step.target ?? null

  const isAssert = step.action === "assert"
  // urlMatches asserts against page.url(), not an element — run it directly without resolveTarget.
  if (isAssert && step.checkpoint && step.checkpoint.kind === "urlMatches") {
    try {
      const re = new RegExp(step.checkpoint.regex!)
      for (let i = 0; i < 50; i++) { // poll up to ~5s for navigations to settle
        if (re.test(page.url())) break
        const loopTimeout = Math.max(0, Math.min(100, deadline - Date.now()))
        if (loopTimeout === 0) throw new Error("deadline exceeded")
        await page.waitForTimeout(loopTimeout)
      }
      if (!re.test(page.url())) throw new Error(`checkpoint urlMatches failed: "${page.url()}" did not match /${step.checkpoint.regex}/`)
    } catch {
      // KLA-82: emit a heuristic Finding for urlMatches failures so they appear in reports.
      const verdict: Verdict = "red"
      await addStepRunWithShot({ runId, trailId, stepId: step.id, idx: step.idx, tier: "none", verdict, confidence: 1, diagnosis: "regression", healed: false,
        evidence: tagRedEvidence(failureKindForExpectationFailure(), { reason: "checkpoint_failed", checkpoint: step.checkpoint?.description ?? null, recordedStep: recordedStep(null, fp) }),
      })
      return { tier: "none", verdict, healed: false, llmCalls: 0, failureKind: failureKindForExpectationFailure() }
    }
    await addStepRunWithShot({ runId, trailId, stepId: step.id, idx: step.idx, tier: "none", verdict: "green", confidence: 1, healed: false,
      evidence: { checkpoint: step.checkpoint?.description ?? null, recordedStep: recordedStep(null, fp) },
    })
    return { tier: "none", verdict: "green", healed: false, llmCalls: 0 }
  }

  // A checkpoint-only assert (no target at all) is a soft pass that keeps the flow runnable (mirrors codegen).
  if (isAssert && !cachedSelector && !fp) {
    await addStepRunWithShot({
      runId, trailId, stepId: step.id, idx: step.idx, tier: "none", verdict: "green", confidence: 1, healed: false,
      evidence: {
        checkpoint: step.checkpoint?.description ?? null,
        recordedStep: recordedStep(null, null),
      },
    })
    return { tier: "none", verdict: "green", healed: false, llmCalls: 0 }
  }

  let resolved: ResolveResult
  try {
    resolved = await resolveTarget(page, cachedSelector, fp, stepPageUrl)
  } catch (e) {
    if (e instanceof AmbiguousSelector) {
      // The crystallized selector matched N>1 elements — this is a data-quality problem,
      // not a healer opportunity. Record a deduped 'regression' finding so the author sees
      // exactly which selector to fix, then fail this step RED immediately.
      const title = `Selector matched ${e.matchCount} elements instead of one — AutoSim can't tell which "${e.selector}" to act on. Update the Trail to target a unique element.`
      if (!opts.suppressFindings) {
        await recordFinding(projectId, {
          runId, trailId, stepId: step.id,
          kind: "regression", title,
          evidence: tagRedEvidence(failureKindForExpectationFailure(), { selector: e.selector, matchCount: e.matchCount, stepAction: step.action }),
          confidence: 1.0,
          dedupKey: `ambiguous_selector:${trailId}:${step.id}`,
          contentSig: contentSigFor({ kind: "regression", selector: e.selector, urlPath: page.url() }),
          urlPath: page.url(),
        })
      }
      // PDF task 1: best-effort screenshot to capture the failure state.
      await addStepRunWithShot({
        runId, trailId, stepId: step.id, idx: step.idx,
        tier: "cache", verdict: "red", confidence: 1, diagnosis: "locator_drift", healed: false,
        evidence: {
          failureKind: failureKindForExpectationFailure(),
          reason: "ambiguous_selector",
          selector: e.selector,
          matchCount: e.matchCount,
          recordedStep: recordedStep(e.selector, fp),
        },
      })
      return { tier: "cache", verdict: "red", healed: false, llmCalls: 0, failureKind: failureKindForExpectationFailure() }
    }
    if (e instanceof ElementGone) {
      // All deterministic tiers (0/1) are exhausted. Diagnosis-first: this is locator_drift we could
      // not safely heal without a model.
      //
      // Layer D Tier-2: if an injectable vision resolver is provided, hand off to it. The resolver
      // sees a screenshot + DOM snapshot + the step intent/target/candidate-selectors and decides
      // heal / regression / low-confidence. decideFromVision applies the spec §6 trust gates:
      //   - heal           → AMBER (never green, §6.3) + role-consistency re-check (§6.2) + act
      //                       + persist healed selector + reviewable evidence diff (§6.4).
      //   - regression     → RED + grounded, deduped finding (kind 'regression', auto-file-eligible).
      //   - amber_low_conf → AMBER + queue-only finding (kind 'amber_heal'); never act on an
      //                       unconfirmed target (§6.3).
      // §6.5 (healing never overrides a checkpoint): if the gone step is an ASSERT, runVisionTier2
      // short-circuits at its TOP to a hard RED 'regression' BEFORE consulting the model — an assert
      // whose target could not be deterministically resolved is a checkpoint failure, never a heal
      // and never an amber_heal, regardless of what vision would classify.
      if (opts.vision) {
        return await runVisionTier2(projectId, runId, trailId, page, step, opts, fp, cachedSelector, isAssert, opTimeout, deadline, addStepRun)
      }
      // No resolver → unchanged Layer C behavior: RED + needs-vision handoff marker (never green).
      // KLA-82: emit a heuristic Finding even without a vision resolver so the failure is NEVER
      // invisible in reports. Uses step fingerprint + page URL as the dedup key.
      const verdict: Verdict = "red"
      if (!opts.suppressFindings) {
        const targetName = fp?.accessibleName ?? fp?.text ?? step.action
        const roleHint = step.target?.role ? ` (${step.target.role})` : ""
        const title = `Can't find "${targetName}"${roleHint} on the page — the element may have been removed or renamed.`
        await recordFinding(projectId, {
          runId, trailId, stepId: step.id, kind: "regression", title,
          evidence: tagRedEvidence(failureKindForExpectationFailure(), { reason: "element_gone", fingerprint: fp, cachedSelector, action: step.action, pageUrl: stepPageUrl }),
          // B.13: groundQuote is a synthesized diagnostic (self-referential title), NOT a verbatim
          // page-text quote — mark unverified so external tickets relabel it "Reason:" not "Grounded:".
          groundQuote: title, groundQuoteVerified: false, confidence: 0.7,
          dedupKey: `${trailId}:${step.id}:element-gone`,
          contentSig: contentSigFor({ kind: "regression", fp, urlPath: stepPageUrl }),
          urlPath: stepPageUrl,
        })
      }
      // PDF task 1: best-effort screenshot to capture the failure state.
      await addStepRunWithShot({
        runId, trailId, stepId: step.id, idx: step.idx,
        tier: "vision", verdict, confidence: 0, diagnosis: "locator_drift", healed: false,
        evidence: {
          failureKind: failureKindForExpectationFailure(),
          reason: "element_gone",
          needsVision: true,
          fingerprint: fp,
          cachedSelector,
          checkpoint: step.checkpoint?.description ?? null,
          recordedStep: recordedStep(cachedSelector, fp),
        },
      })
      return { tier: "vision", verdict, healed: false, llmCalls: 0, failureKind: failureKindForExpectationFailure() }
    }
    throw e
  }

  // KLA-67: adaptive action timeout — honor a per-step override when the Trail author set one,
  // else derive from the remaining deadline budget. Floor 5s / ceil 15s prevents both instant
  // timeouts on nearly-exhausted budgets and unbounded hangs on unconstrained walks.
  const remainingBudget = deadline - Date.now()
  const actionTimeout = step.timeoutMs != null
    ? Math.max(0, Math.min(step.timeoutMs, remainingBudget))
    : Math.max(5000, Math.min(15000, remainingBudget))

  // KLA-68: per-step retry via withStepRetry. On a transient action failure, back off and retry
  // up to opts.stepRetries (default DEFAULT_STEP_RETRIES) additional times before going RED.
  // The resolved locator is reused — element-resolution cost is paid only once per step.
  const maxRetries = step.action === "assert" ? 0 : (opts.stepRetries ?? DEFAULT_STEP_RETRIES)
  const lastActionError = await withStepRetry(
    async () => {
      // Perform the action (Playwright auto-waits for actionability — the "test DNA" we deliberately keep).
      // Bounded timeout: actionability that never clears is a real break, not a reason to hang.
      switch (step.action) {
        case "type": {
          const raw = step.actionValue ?? ""
          const val = hasCredRef(raw) ? await (opts.credResolver ?? resolveCredRefs)(projectId, raw) : raw
          if (hasCredRef(raw) && opts._resolvedCreds) {
            opts._resolvedCreds.add(val)
          }
          await resolved.locator.fill(val, { timeout: actionTimeout })
          break
        }
        case "click":
          if (priorRed && !(await resolved.locator.isVisible().catch(() => false))) {
            throw new Error("target_not_visible_after_prior_red")
          }
          await clickWithTransitionFallback(resolved.locator, actionTimeout, actionTimeout)
          break
        case "select":
          await resolved.locator.selectOption(step.actionValue ?? "", { timeout: actionTimeout })
          break
        case "hover":
          await resolved.locator.hover({ timeout: actionTimeout })
          break
        case "keyPress":
          await resolved.locator.press(step.actionValue ?? "Enter", { timeout: actionTimeout })
          break
        case "clearField":
          await resolved.locator.clear({ timeout: actionTimeout })
          break
        case "assert": {
          // Hard checkpoint: the element must be visible. Never overridden by healing.
          const kind = (step.checkpoint && step.checkpoint.kind) || "visible"
          switch (kind) {
            case "textEquals": {
              await resolved.locator.waitFor({ state: "visible", timeout: actionTimeout })
              const actual = (await resolved.locator.allInnerTexts()).join(" ").trim()
              if (actual !== step.checkpoint!.value) throw new Error(`checkpoint textEquals failed: expected "${step.checkpoint.value}" got "${actual}"`)
              break
            }
            case "textContains": {
              await resolved.locator.waitFor({ state: "visible", timeout: actionTimeout })
              const actual = (await resolved.locator.allInnerTexts()).join(" ").trim()
              if (!actual.includes(step.checkpoint!.value)) throw new Error(`checkpoint textContains failed: "${step.checkpoint.value}" not in "${actual}"`)
              break
            }
            case "urlMatches": {
              // URL assertions use the page url, not a locator. Poll briefly so transient navigations settle.
              await resolved.locator.waitFor({ state: "visible", timeout: actionTimeout }).catch(() => {})
              const re = new RegExp(step.checkpoint!.regex!)
              if (!re.test(page.url())) throw new Error(`checkpoint urlMatches failed: "${page.url()}" did not match ${step.checkpoint.regex}`)
              break
            }
            case "elementCount": {
              await resolved.locator.waitFor({ state: "visible", timeout: actionTimeout }).catch(() => {})
              const n = await resolved.locator.count()
              if (n !== step.checkpoint!.count) throw new Error(`checkpoint elementCount failed: expected ${step.checkpoint.count} got ${n}`)
              break
            }
            default: // "visible" or unknown — fall through to the visible check.
              await resolved.locator.waitFor({ state: "visible", timeout: actionTimeout })
          }
          break
        }
      }
    },
    maxRetries,
    STEP_RETRY_BACKOFF_MS,
    () => Date.now() + STEP_RETRY_BACKOFF_MS >= deadline,
    (ms) => page.waitForTimeout(ms),
    isRetryableStepError,
  )

  if (lastActionError !== undefined) {
    // All retry attempts exhausted — the element resolved but the action/assertion failed -> RED.
    const verdict: Verdict = "red"
    if (!opts.suppressFindings) {
      const title = isAssert
        ? `Check failed — "${step.checkpoint?.description ?? fp?.accessibleName ?? fp?.text ?? "expected condition"}" was not met on the page.`
        : `Could not complete ${humanStepDescription(step.action, fp?.accessibleName)} — the interaction failed after retrying.`
      await recordFinding(projectId, {
        runId, trailId, stepId: step.id, kind: "regression", title,
        evidence: tagRedEvidence(failureKindForExpectationFailure(), { reason: isAssert ? "checkpoint_failed" : "action_failed", action: step.action, selector: resolved.selector, checkpoint: step.checkpoint?.description ?? null, pageUrl: stepPageUrl }),
        // B.13: self-referential title, not verified page text → unverified.
        groundQuote: title, groundQuoteVerified: false, confidence: 0.8,
        dedupKey: `${trailId}:${step.id}:${isAssert ? "checkpoint-failed" : "action-failed"}`,
        contentSig: contentSigFor({ kind: "regression", fp, urlPath: stepPageUrl }),
        urlPath: stepPageUrl,
      })
    }
    // PDF task 1: best-effort screenshot even on action failure (shows the failure state).
    await addStepRunWithShot({
      runId, trailId, stepId: step.id, idx: step.idx,
      tier: resolved.tier, verdict, confidence: resolved.confidence, diagnosis: isAssert ? "regression" : "interaction_change", healed: false,
      evidence: {
        failureKind: failureKindForExpectationFailure(),
        reason: isAssert ? "checkpoint_failed" : "action_failed",
        error: String((lastActionError as any)?.message || lastActionError),
        checkpoint: step.checkpoint?.description ?? null,
        recordedStep: recordedStep(resolved.selector, fp),
      },
    })
    return { tier: resolved.tier, verdict, healed: false, llmCalls: 0, failureKind: failureKindForExpectationFailure() }
  }

  // Capture the pre-heal selector BEFORE the upsert overwrites it (heal-as-reviewable-diff, §6.4).
  const fromSelector = cachedSelector ?? cacheRow?.resolvedSelector ?? null

  // Heal persistence: a Tier 1 candidate hit is written back to the cache (per (project_id, step_id),
  // ON CONFLICT updates in place) so the next Walk is deterministic Tier 0 again — heal-as-cache-update.
  // Persist UNCONDITIONALLY when healed && selector: if no cache row existed, upsert a fresh one so a
  // step never re-heals forever (fix #3). The cache_key is recomputed via the crystallize convention.
  if (resolved.healed && resolved.selector) {
    const cKey = cacheRow?.cacheKey ?? (await stepCacheKey(projectId, trailId, step, resolved.selector))
    await upsertLocatorCache(projectId, {
      trailId,
      stepId: step.id,
      cacheKey: cKey,
      resolvedSelector: resolved.selector,
      fingerprint: fp ?? undefined,
      confidence: resolved.confidence,
      source: "heal",
    })
  }

  // spec §6.3: a healed-but-unconfirmed step is AMBER, never GREEN. The action still executed; the
  // Walk rolls up to AMBER (worst-of). A non-healed cache/Tier-0 hit stays GREEN.
  const verdict: Verdict = resolved.healed ? "amber" : "green"

  // spec §6.4: persist the reviewable diff into the run_step evidence (recoverable from/to selectors).
  const evidence: Record<string, unknown> = resolved.healed
    ? {
        healed: true,
        fromSelector,
        toSelector: resolved.selector,
        tier: resolved.tier,
        confidence: resolved.confidence,
        candidateSignal: resolved.candidateSignal,
        checkpoint: step.checkpoint?.description ?? null,
        recordedStep: recordedStep(resolved.selector, fp),
      }
    : {
        selector: resolved.selector,
        healed: false,
        checkpoint: step.checkpoint?.description ?? null,
        recordedStep: recordedStep(resolved.selector, fp),
      }

  await addStepRunWithShot({
    runId, trailId, stepId: step.id, idx: step.idx,
    tier: resolved.tier, verdict, confidence: resolved.confidence,
    diagnosis: resolved.healed ? "locator_drift" : undefined, healed: resolved.healed,
    evidence,
  })
  return { tier: resolved.tier, verdict, healed: resolved.healed, llmCalls: 0 }
}

// ── Layer D Tier-2: vision-LLM re-resolution at the Tier-0/1-exhausted point ──
// Always counts as exactly one model call (llmCalls: 1). Reuses the existing roleConsistent() gate,
// upsertLocatorCache, recordFinding, and addRunStep — no duplication. NEVER green: a heal is AMBER.
async function runVisionTier2(
  projectId: string,
  runId: string,
  trailId: string,
  page: Page,
  step: TrailStep,
  opts: WalkOptions,
  fp: Fingerprint | null,
  cachedSelector: string | null,
  isAssert: boolean,
  opTimeout: number,
  deadline: number,
  addStepRun: StepRunFn = (i) => addRunStep(projectId, i),
): Promise<OneStepResult> {
  const gate = opts.confidenceGate ?? 0.9
  const stepPageUrl = page.url()
  const recordedStep = (selector: string | null | undefined, target?: Fingerprint | null) =>
    recordedStepState(step, selector, stepPageUrl, target)

  // §6.5 — HARD checkpoint guardrail, BEFORE any model I/O. Reaching the vision tier means Tier-0/1
  // exhausted the deterministic resolvers: the assert's target is GONE. Healing never overrides a
  // checkpoint, so this is a regression (RED), auto-file-eligible — NEVER a heal, NEVER amber_heal,
  // regardless of what the model would classify (moved / low-confidence / restyled). No model call.
  if (isAssert) {
    const targetLabel = fp?.accessibleName ?? fp?.text ?? step.checkpoint?.description ?? step.action
    const title = `"${targetLabel}" is no longer on the page — this check can't pass because the element it was looking for has disappeared.`
    if (!opts.suppressFindings) {
      await recordFinding(projectId, {
        runId, trailId, stepId: step.id, kind: "regression", title,
        evidence: tagRedEvidence(failureKindForExpectationFailure(), { reason: "checkpoint_gone", target: fp, pageUrl: opts.fixtureUrl, checkpoint: step.checkpoint?.description ?? null }),
        // B.13: self-referential title, not verified page text → unverified.
        groundQuote: title, groundQuoteVerified: false, confidence: 1,
        dedupKey: `${trailId}:${step.id}:checkpoint-gone`,
        // Checkpoint-gone is a report-critical failure for this recorded assertion. Do not collapse
        // it across trails by content signature, or a later red walk can lose its run-scoped finding.
        contentSig: null,
        urlPath: stepPageUrl,
      })
    }
    await addStepRun({
      runId, trailId, stepId: step.id, idx: step.idx,
      tier: "vision", verdict: "red", confidence: 1, diagnosis: "regression", healed: false,
      evidence: tagRedEvidence(failureKindForExpectationFailure(), { reason: "checkpoint_gone", target: fp, cachedSelector, needsVision: false, checkpoint: step.checkpoint?.description ?? null, recordedStep: recordedStep(cachedSelector, fp) }),
    })
    return { tier: "vision", verdict: "red", healed: false, llmCalls: 0, failureKind: failureKindForExpectationFailure() }
  }

  // Per-step resilience (production hardening): a bad/timed-out/malformed vision response — at the
  // screenshot/content capture, the resolver call, or decideFromVision — must fail only THIS step,
  // not abort the whole remaining walk into a generic error RED. Wrap the lot; on any throw emit a
  // single RED run_step for this step (tier:'vision', needsVision:true, evidence.error) and let the
  // walk loop continue with the remaining steps. Never silent-greens; never queue-heals.
  let dom: string
  let result: VisionResult
  let decision: VisionDecision
  try {
    const currentTimeout = Math.max(0, Math.min(opTimeout, deadline - Date.now()))
    const shot = (await page.screenshot({ timeout: currentTimeout })).toString("base64")
    // page.content() takes no per-call timeout in this Playwright version; it is already governed by
    // the page-level setDefaultTimeout(opTimeout) set in walkTrail. screenshot IS bounded explicitly.
    dom = await page.content()
    // Capture the kref snapshot for the MODEL payload. data-kref attrs are stamped on the live page
    // now; they remain valid until the next captureKrefSnapshot call (which renumbers). Do NOT
    // re-capture between here and the act block — it would invalidate any kref the model returns.
    const modelDom = await captureKrefSnapshot(page)
    const candidateSelectors: string[] = []
    if (cachedSelector) candidateSelectors.push(cachedSelector)
    if (fp?.testId) candidateSelectors.push(`[data-testid="${escAttr(fp.testId)}"]`)
    if (fp?.domPath) candidateSelectors.push(fp.domPath)

    const visionInput: VisionInput = {
      screenshotB64: shot,
      mediaType: "image/png",
      domSnapshot: modelDom,
      pageUrl: opts.fixtureUrl,
      intent: step.checkpoint?.description ?? step.action,
      action: step.action,
      target: fp ?? {},
      candidateSelectors,
    }
    // KLAVITYKLA-364: pass runId so the reheal's ai_calls row is attributable to THIS replay run —
    // finishWalk later sums those rows into trail_runs.replay_cost_usd (measured $/replay).
    result = await opts.vision!(visionInput, { projectId, weights: opts.visionWeights, runId })
    decision = decideFromVision(result, gate)
  } catch (e) {
    await addStepRun({
      runId, trailId, stepId: step.id, idx: step.idx,
      tier: "vision", verdict: "red", confidence: 0, diagnosis: "runtime_error", healed: false,
      evidence: tagRedEvidence(failureKindForThrownError(e), { reason: "vision_error", needsVision: true, error: String(e), target: fp, checkpoint: step.checkpoint?.description ?? null, recordedStep: recordedStep(cachedSelector, fp) }),
    })
    return { tier: "vision", verdict: "red", healed: false, llmCalls: 0, failureKind: failureKindForThrownError(e) }
  }

  const domExcerpt = dom.slice(0, 2000)

  // ── regression: do NOT act → RED + grounded, deduped finding (auto-file-eligible kind) ──
  if (decision.outcome === "regression") {
    const goneName = fp?.accessibleName ?? fp?.text ?? step.action
    const title = `"${goneName}" no longer exists on the page — AutoSim inspected the page visually and confirmed the element is gone.`
    if (!opts.suppressFindings) {
      await recordFinding(projectId, {
        runId, trailId, stepId: step.id, kind: "regression", title,
        evidence: tagRedEvidence(failureKindForExpectationFailure(), { rationale: decision.rationale, target: fp, pageUrl: opts.fixtureUrl, domExcerpt }),
        // B.13: the vision rationale is the model's explanation, not a verbatim page-text quote → unverified.
        groundQuote: decision.rationale, groundQuoteVerified: false, confidence: decision.confidence,
        dedupKey: `${trailId}:${step.id}:gone`,
        contentSig: contentSigFor({ kind: "regression", fp, urlPath: stepPageUrl }),
        urlPath: stepPageUrl,
      })
    }
    await addStepRun({
      runId, trailId, stepId: step.id, idx: step.idx,
      tier: "vision", verdict: "red", confidence: decision.confidence, diagnosis: "regression", healed: false,
      evidence: tagRedEvidence(failureKindForExpectationFailure(), { reason: "vision_regression", classification: result.classification, rationale: decision.rationale, target: fp, needsVision: false, checkpoint: step.checkpoint?.description ?? null, recordedStep: recordedStep(cachedSelector, fp) }),
    })
    return { tier: "vision", verdict: "red", healed: false, llmCalls: 1, failureKind: failureKindForExpectationFailure() }
  }

  // ── heal: confirm intent (role consistency, §6.2), act, AMBER, persist + reviewable diff ──
  if (decision.outcome === "heal" && decision.selector) {
    const loc = page.locator(decision.selector)
    // KLA-67: adaptive timeout mirrors runOneStep — honors per-step override, else budget-derived.
    const remainingForHeal = deadline - Date.now()
    const ACTION_TIMEOUT = step.timeoutMs != null
      ? Math.max(0, Math.min(step.timeoutMs, remainingForHeal))
      : Math.max(5000, Math.min(15000, remainingForHeal))
    const ok =
      (await uniquelyResolves(loc)) &&
      (await roleConsistent(loc, fp?.role)) &&
      // Defense-in-depth: asserts already short-circuit to RED at the top of this fn (§6.5); this is
      // a redundant belt so an assert can never reach the heal/act path even if that guard changes.
      !isAssert
    if (ok) {
      // Convert any kref selector to a stable one BEFORE the act: a click may navigate away,
      // making the page (and its stamped data-kref attrs) unavailable for stableSelectorFor after.
      // data-kref must never be persisted (spec §1 invariant).
      //
      // Fallback chain for a kref selector:
      //   stableSelectorFor(loc)   → #id / [data-testid] / tag[aria-label]
      //   fp?.domPath              → stored structural path from fingerprint (old trails)
      //   structuralPathFor(loc)   → live 4-level tag:nth-of-type path (bare elements)
      //   null                     → all failed; skip upsertLocatorCache (next walk re-heals)
      //                              and use a descriptive dekref'd form in evidence.
      let persistSelector: string | null = decision.selector
      let skipPersist = false
      if (isKrefSelector(decision.selector)) {
        const stable = await stableSelectorFor(loc).catch(() => null)
        const structural = stable == null ? await structuralPathFor(loc).catch(() => null) : null
        persistSelector = stable ?? fp?.domPath ?? structural ?? null
        if (persistSelector === null) {
          // All fallbacks exhausted — act on the element (best-effort) but NEVER store a kref.
          // The next walk will simply re-heal: graceful, invariant-safe.
          skipPersist = true
        }
      }
      try {
        switch (step.action) {
          case "type": {
            const raw = step.actionValue ?? ""
            const val = hasCredRef(raw) ? await (opts.credResolver ?? resolveCredRefs)(projectId, raw) : raw
            if (hasCredRef(raw) && opts._resolvedCreds) {
              opts._resolvedCreds.add(val)
            }
            await loc.fill(val, { timeout: ACTION_TIMEOUT }); break
          }
          case "click": await clickWithTransitionFallback(loc, ACTION_TIMEOUT, ACTION_TIMEOUT); break
          case "select": await loc.selectOption(step.actionValue ?? "", { timeout: ACTION_TIMEOUT }); break
          case "hover": await loc.hover({ timeout: ACTION_TIMEOUT }); break
          case "keyPress": await loc.press(step.actionValue ?? "Enter", { timeout: ACTION_TIMEOUT }); break
          case "clearField": await loc.clear({ timeout: ACTION_TIMEOUT }); break
        }
        // Persist the healed selector so the NEXT walk is Tier 0 again (heal-as-cache-update, §6.4).
        // SKIP when persistSelector is null (kref with no stable fallback) — invariant: no kref stored.
        if (!skipPersist && persistSelector !== null) {
          const cacheRow = await getCacheForStep(projectId, step.id)
          const cKey = cacheRow?.cacheKey ?? (await stepCacheKey(projectId, trailId, step, persistSelector))
          await upsertLocatorCache(projectId, {
            trailId, stepId: step.id, cacheKey: cKey, resolvedSelector: persistSelector,
            fingerprint: fp ?? undefined, confidence: decision.confidence, source: "heal",
          })
        }
        // evidence.toSelector: use the stable selector when available; otherwise a descriptive
        // dekref'd form so the run_step evidence is human-readable and never embeds a raw kref.
        const toSelectorEvidence = persistSelector ?? decision.selector.replace(/\[data-kref="(e\d+)"\]/, "snapshot ref $1")
        await addStepRun({
          runId, trailId, stepId: step.id, idx: step.idx,
          tier: "vision", verdict: "amber", confidence: decision.confidence, diagnosis: "locator_drift", healed: true,
          evidence: {
            healed: true, fromSelector: cachedSelector, toSelector: toSelectorEvidence,
            tier: "vision", confidence: decision.confidence, candidateSignal: "vision",
            rationale: decision.rationale, classification: result.classification,
            checkpoint: step.checkpoint?.description ?? null,
            recordedStep: recordedStep(toSelectorEvidence, fp),
          },
        })
        return { tier: "vision", verdict: "amber", healed: true, llmCalls: 1 }
      } catch {
        // The vision selector resolved + was role-consistent but the action itself failed — fall
        // through to the low-confidence/unconfirmed handling below (never a silent green).
      }
    }
    // Resolver claimed a heal but we could NOT confirm it (no unique match / wrong role / action
    // failed). Treat as unconfirmed → AMBER + queue-only finding; do NOT act, do NOT persist.
    return await fileAmberHeal(projectId, runId, trailId, step, opts, fp, decision.rationale, decision.confidence, result.classification, stepPageUrl, decision.selector ?? cachedSelector, addStepRun)
  }

  // ── amber_low_conf: never act on an unconfirmed target → AMBER + queue-only finding ──
  return await fileAmberHeal(projectId, runId, trailId, step, opts, fp, decision.rationale, decision.confidence, result.classification, stepPageUrl, decision.selector ?? cachedSelector)
}

// AMBER + queue-only (kind 'amber_heal') finding for a healed-but-unconfirmed step (§6.3 / Layer E
// auto-file convention). The element is NOT acted on and the cache is NOT mutated.
async function fileAmberHeal(
  projectId: string, runId: string, trailId: string, step: TrailStep, opts: WalkOptions,
  fp: Fingerprint | null, rationale: string, confidence: number, classification: string,
  pageUrl: string, selector: string | null | undefined,
  addStepRun: StepRunFn = (i) => addRunStep(projectId, i),
): Promise<OneStepResult> {
  if (!opts.suppressFindings) {
    await recordFinding(projectId, {
      runId, trailId, stepId: step.id, kind: "amber_heal",
      title: `AutoSim found a possible match for "${fp?.accessibleName ?? fp?.text ?? step.action}" but wasn't confident enough to act — please review.`,
      evidence: { rationale, target: fp, pageUrl: opts.fixtureUrl, classification },
      // B.13: the vision rationale is the model's explanation, not a verbatim page-text quote → unverified.
      groundQuote: rationale, groundQuoteVerified: false, confidence, dedupKey: `${trailId}:${step.id}:lowconf`,
      contentSig: contentSigFor({ kind: "amber_heal", fp, urlPath: pageUrl }),
      urlPath: pageUrl,
    })
  }
  await addStepRun({
    runId, trailId, stepId: step.id, idx: step.idx,
    tier: "vision", verdict: "amber", confidence, diagnosis: "locator_drift", healed: false,
    evidence: {
      reason: "vision_low_confidence",
      classification,
      rationale,
      needsVision: false,
      checkpoint: step.checkpoint?.description ?? null,
      recordedStep: recordedStepState(step, selector, pageUrl, fp),
    },
  })
  return { tier: "vision", verdict: "amber", healed: false, llmCalls: 1 }
}
