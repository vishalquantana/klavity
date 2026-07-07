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
import { acquirePlaywrightBrowser, playwrightContextOptionsForTrailViewport, startCdpScreencast } from "./trails-browser-page"
import { uploadScreenshotMeta } from "./s3"
import type { Fingerprint, Tier, Verdict, TrailStep, NetworkMock } from "./trails-types"
import {
  getTrail, listTrailSteps, getCacheForStep, upsertLocatorCache,
  startWalk, addRunStep, finishWalk, recordFinding,
} from "./trails"
import { stepCacheKey } from "./trails-crystallize"
import { decideFromVision, type VisionResolver, type VisionInput, type VisionResult, type VisionDecision } from "./trails-vision"
import { setupReplayCapture, saveReplay, type ReplayCapture } from "./trails-replay"
import { hasCredRef, resolveCredRefs, type CredResolver } from "./trails-creds"
import { captureKrefSnapshot, stableSelectorFor, structuralPathFor, isKrefSelector, recordedStepState } from "./trails-snapshot"
import { clickWithTransitionFallback } from "./trails-click"
import { notifyWalkRed } from "./walk-red-alert"
import { endLiveWatchRun, publishLiveWatchFrame, startLiveWatchRun } from "./trails-live-watch"

export interface WalkOptions {
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
   * Plan G — prod-safety. Extra args forwarded verbatim to `chromium.launch({ args })` (the 1GB box
   * uses CHROMIUM_PROD_ARGS: --single-process --no-sandbox --disable-dev-shm-usage --disable-gpu
   * --no-zygote). Absent (the test default) launches with no extra args — byte-identical to before.
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
   * actionable step's action settles the runner captures a jpeg (quality 45) and uploads it via
   * shotUploader. The returned key is merged into the step's evidence as `screenshotKey`.
   * Capture is SKIPPED for navigate/wait steps (no meaningful state to capture).
   * Failures are best-effort: a try/catch ensures a capture/upload failure NEVER fails or slows
   * a step — evidence just lacks the key.
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
   * KLA-111: network stubs/blocks applied to the page before the initial navigation.
   * Each mock intercepts requests whose URL matches `mock.url` (substring or ** glob):
   *   - "stub": return a canned response (status/body/contentType/headers).
   *   - "block": abort the request (simulates offline/ad-blocking).
   * Absent or empty → no interception (byte-identical to all existing callers).
   */
  networkMocks?: NetworkMock[]
  /**
   * KLA-79 live-watch: best-effort CDP Page.startScreencast frame streaming for the in-flight walk.
   * Frames stay in-process and are exposed by the authenticated /live SSE route. Off by default for
   * tests/direct callers; runWalkNow enables it for dashboard-triggered walks.
   */
  liveWatch?: boolean
}

export interface WalkStepSummary {
  stepId: string
  idx: number
  tier: Tier
  verdict: Verdict
  healed: boolean
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
   * Human-readable reason(s) for a RED verdict. Always non-empty when verdict is 'red', so callers
   * of `finishWalk` always see WHY the walk ended red — never a silent or blank RED (KLAVITYKLA-48).
   */
  reasons: string[]
}

const CACHE_CONFIDENCE = 1.0

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
class ElementGone extends Error {
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

// A locator "resolves" iff it matches exactly one element. Visibility is checked by the action
// (Playwright auto-waits for actionability); for assert we require visible explicitly.
async function uniquelyResolves(loc: Locator): Promise<boolean> {
  return (await loc.count()) === 1
}

// Intent verification (spec §6.2: confirm we found the RIGHT element, never just "an element").
// A heal candidate is only acceptable if the resolved element is consistent with the target's
// declared role. This is what stops the silent-false-green where a removed <button>Sign in</button>
// "heals" to the surviving <h1>Sign in</h1> heading by text — different role => reject the candidate.
async function roleConsistent(loc: Locator, expectedRole: string | undefined): Promise<boolean> {
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

// Tier 0 -> Tier 1 candidate ladder. Returns the first tier whose candidate uniquely resolves.
// Order: cached selector (Tier 0) -> role+name -> text -> testid -> structural domPath (Tier 1).
async function resolveTarget(
  page: Page,
  cachedSelector: string | null,
  fp: Fingerprint | null,
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
  if (fp) {
    // 1. role + accessible-name (the faithful accname signal, strongest semantic anchor)
    if (fp.role && fp.accessibleName) {
      const loc = page.getByRole(fp.role as any, { name: fp.accessibleName, exact: true })
      if (await uniquelyResolves(loc)) {
        return { tier: "candidate", selector: await persistableSelector(page, loc), locator: loc, healed: true, confidence: SIGNAL_CONFIDENCE["role+name"], candidateSignal: "role+name" }
      }
    }
    // 2. visible text — but only if the resolved element's role matches the target's (intent
    //    verification): a removed <button> must NOT heal onto a same-text <h1>.
    if (fp.text) {
      const loc = page.getByText(fp.text, { exact: true })
      if ((await uniquelyResolves(loc)) && (await roleConsistent(loc, fp.role))) {
        return { tier: "candidate", selector: await persistableSelector(page, loc), locator: loc, healed: true, confidence: SIGNAL_CONFIDENCE.text, candidateSignal: "text" }
      }
    }
    // 3. data-testid (escape embedded backslash/double-quote in the value)
    if (fp.testId) {
      const tidSel = `[data-testid="${escAttr(fp.testId)}"]`
      const loc = page.locator(tidSel)
      if ((await uniquelyResolves(loc)) && (await roleConsistent(loc, fp.role))) {
        return { tier: "candidate", selector: tidSel, locator: loc, healed: true, confidence: SIGNAL_CONFIDENCE.testid, candidateSignal: "testid" }
      }
    }
    // 4. structural domPath
    if (fp.domPath) {
      const loc = page.locator(fp.domPath)
      if ((await uniquelyResolves(loc)) && (await roleConsistent(loc, fp.role))) {
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
 * Returns the S3 key on success, undefined on any failure (try/catch — never fails a step).
 * JPEG quality 45 for the PDF plan (compact, readable). Never called for navigate/wait.
 */
async function maybeShot(page: Page, opts: WalkOptions): Promise<string | undefined> {
  if (!opts.stepShots) return undefined
  try {
    const buf = await page.screenshot({ type: "jpeg", quality: 45 })
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
    const uploader = opts.shotUploader ?? defaultShotUploader
    const result = await uploader(bytes, "image/jpeg")
    return result.key
  } catch {
    // Best-effort: upload failure must never fail or slow the step.
    return undefined
  }
}

// KLA-111: apply NetworkMock entries to a Playwright Page via page.route().
// `mock.url` is treated as a substring: any request whose full URL contains it is intercepted.
// For "stub" mocks, route.fulfill() returns the canned response; for "block", route.abort() drops it.
// Called once before the initial navigation so all requests (including subresources) are covered.
async function applyNetworkMocks(page: Page, mocks: NetworkMock[]) {
  for (const mock of mocks) {
    const pattern = (url: URL) => url.href.includes(mock.url)
    if (mock.action === "block") {
      await page.route(pattern, (route) => route.abort())
    } else {
      await page.route(pattern, (route) => route.fulfill({
        status: mock.status ?? 200,
        contentType: mock.contentType ?? "application/json",
        headers: mock.headers ?? {},
        body: mock.body ?? "",
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
  // Draft-gate (AutoSims F1): draft Trails and explicit Verification Walks never file Findings.
  // Evidence (run_steps) is still captured so the author can review what happened.
  opts = { ...opts, suppressFindings: opts.suppressFindings ?? (trail.status === "draft") }
  const steps = await listTrailSteps(projectId, trailId)

  // Adopt a pre-created Walk row (Plan G trigger) so run_steps/replay/verdict share the caller's runId;
  // otherwise mint our own as before (every existing caller). No behavior change when runId is absent.
  const runId = opts.runId ?? (await startWalk(projectId, trailId, "manual"))

  // Browser via the seam: local Playwright by default; connectOverCDP → remote (Steel) when
  // AUTOSIM_CDP_URL is set (moves the walk off the 1GB box). bh.close() handles Steel release.
  const bh = await acquirePlaywrightBrowser({ headless: opts.headless, launchArgs: opts.launchArgs })
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
  if (opts.replay || contextOptions) {
    try {
      context = await browser.newContext(contextOptions as any)
    } catch (e) {
      console.warn("[trails-context] browser context setup failed, walking with a default page:", String(e))
      context = null
    }
    if (context && opts.replay) {
      try {
        capture = await setupReplayCapture(context)
      } catch (e) {
        console.warn("[trails-replay] capture setup failed, walking without replay:", String(e))
        if (!contextOptions) { try { await context.close() } catch {}; context = null }
        capture = null
      }
    } else {
      capture = null
    }
  }

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

    // KLA-111: install network stubs/blocks BEFORE the first navigation so every request
    // (including the initial page load) is covered. Routes persist for the page's lifetime.
    if (opts.networkMocks?.length) {
      await applyNetworkMocks(page, opts.networkMocks)
    }

    await page.goto(opts.fixtureUrl, { timeout: opTimeout })

    // Track the document URL across steps so a full-page navigation (click-driven or explicit
    // navigate) becomes a segment boundary: flush the page just LEFT, tagged with the idx of the
    // step that triggered the nav, then the next page records into a fresh buffer.
    let segUrl = page.url()
    let segIdx = 0

    for (const step of steps) {
      // Plan G prod-safety: a hard per-walk deadline. If the wall-clock budget is blown, STOP the walk
      // (don't run this or any further step) and roll the verdict to RED — the page-too-slow / runaway
      // case can't pin the shared 1GB box. The browser is still closed in the `finally` below.
      if (Date.now() > deadline) { walkVerdict = "red"; deadlineHit = true; break }
      // KLA-100: cancel signal check — stop at the next step boundary after the abort fires.
      if (opts.signal?.aborted) { walkVerdict = "red"; cancelledBySignal = true; break }

      // Drain the CURRENTLY-SHOWN document's rrweb buffer into the current segment BEFORE running the
      // step — if this step navigates, the boundary flush below seals exactly this page's events.
      if (capture) {
        try { await capture.drain(page) } catch (e) { console.warn("[trails-replay] pre-step drain failed:", String(e)) }
      }

      const { tier, verdict, healed, llmCalls: stepLlm } = await runOneStep(projectId, runId, trail.id, page, step, opts, opTimeout)
      stepSummaries.push({ stepId: step.id, idx: step.idx, tier, verdict, healed })
      if (healed) healedCount++
      llmCalls += stepLlm
      walkVerdict = worse(walkVerdict, verdict)
      // KLAVITYKLA-48: every RED must carry a reason — accumulate per-step so the Walk summary is never silent.
      if (verdict === "red") redReasons.push(`step ${step.idx} (${step.action}${step.target?.accessibleName ? ` "${step.target.accessibleName}"` : ""}): RED`)

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

    await finishWalk(projectId, runId, {
      status: walkVerdict,
      llmCalls,
      summary: { healedCount, stepCount: steps.length, ...(deadlineHit ? { error: "deadline_exceeded" } : cancelledBySignal ? { error: "cancelled" } : {}) },
    })

    if (walkVerdict === "red") {
      notifyWalkRed({ trailName: trail.name, trailId, projectId, runId, reasons: redReasons, at: Date.now() }).catch(() => {})
    }

    // Persist the replay AFTER finishWalk. Best-effort: a save failure never changes the Walk result.
    if (capture && capture.segments.length) {
      try { await saveReplay(projectId, runId, capture.segments) } catch (e) {
        console.warn("[trails-replay] saveReplay failed:", String(e))
      }
    }
    return { runId, verdict: walkVerdict, llmCalls, steps: stepSummaries, healedCount, reasons: redReasons }
  } catch (e) {
    // Anything thrown (e.g. an unreachable fixtureUrl) must STILL finalize the run — never leave it
    // 'running'. The Walk is RED and the error is recorded in the summary for the trace viewer.
    const redReasons: string[] = [`walk failed: ${String(e)}`]
    await finishWalk(projectId, runId, {
      status: "red",
      llmCalls,
      summary: { ...redReasons.length ? { reasons: redReasons } : {}, error: String(e) },
    })
    notifyWalkRed({ trailName: trail.name, trailId, projectId, runId, reasons: redReasons, at: Date.now() }).catch(() => {})
    return { runId, verdict: "red", llmCalls, steps: stepSummaries, healedCount, reasons: redReasons }
  } finally {
    if (stopLiveScreencast) {
      try { await stopLiveScreencast() } catch {}
    }
    closeLiveWatch()
    await bh.close()
  }
}

interface OneStepResult { tier: Tier; verdict: Verdict; healed: boolean; llmCalls: number }

// Execute a single step. Records exactly one run_step. Never silent-greens a break.
async function runOneStep(
  projectId: string,
  runId: string,
  trailId: string,
  page: Page,
  step: TrailStep,
  opts: WalkOptions,
  opTimeout: number,
): Promise<OneStepResult> {
  const fixtureUrl = opts.fixtureUrl
  const stepPageUrl = page.url()
  const recordedStep = (selector: string | null | undefined, target?: Fingerprint | null) =>
    recordedStepState(step, selector, stepPageUrl, target)
  // navigate / wait have no element to resolve.
  if (step.action === "navigate") {
    // In Layer C the whole walk is scoped to fixtureUrl; re-navigate to it (origin already loaded).
    // Bound the nav at opTimeout (Plan G) so a live-network navigate step can't hang on the 30s default.
    await page.goto(step.actionValue && /^https?:|^file:/.test(step.actionValue) ? step.actionValue : fixtureUrl, { timeout: opTimeout })
    await addRunStep(projectId, {
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
    if (minMs > 0) await page.waitForTimeout(minMs)
    await page.waitForLoadState("networkidle").catch(() => {})
    await addRunStep(projectId, {
      runId, trailId, stepId: step.id, idx: step.idx, tier: "none", verdict: "green", confidence: 1, healed: false,
      evidence: { action: "wait", recordedStep: recordedStep(null, null) },
    })
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
        await page.waitForTimeout(100)
      }
      if (!re.test(page.url())) throw new Error(`checkpoint urlMatches failed: "${page.url()}" did not match /${step.checkpoint.regex}/`)
    } catch {
      const verdict: Verdict = "red"
      const screenshotKey = await maybeShot(page, opts)
      await addRunStep(projectId, { runId, trailId, stepId: step.id, idx: step.idx, tier: "none", verdict, confidence: 1, diagnosis: "regression", healed: false,
        evidence: { reason: "checkpoint_failed", checkpoint: step.checkpoint?.description ?? null, recordedStep: recordedStep(null, fp), ...(screenshotKey !== undefined ? { screenshotKey } : {}) },
      })
      return { tier: "none", verdict, healed: false, llmCalls: 0 }
    }
    const screenshotKey = await maybeShot(page, opts)
    await addRunStep(projectId, { runId, trailId, stepId: step.id, idx: step.idx, tier: "none", verdict: "green", confidence: 1, healed: false,
      evidence: { checkpoint: step.checkpoint?.description ?? null, recordedStep: recordedStep(null, fp), ...(screenshotKey !== undefined ? { screenshotKey } : {}) },
    })
    return { tier: "none", verdict: "green", healed: false, llmCalls: 0 }
  }

  // A checkpoint-only assert (no target at all) is a soft pass that keeps the flow runnable (mirrors codegen).
  if (isAssert && !cachedSelector && !fp) {
    const screenshotKey = await maybeShot(page, opts)
    await addRunStep(projectId, {
      runId, trailId, stepId: step.id, idx: step.idx, tier: "none", verdict: "green", confidence: 1, healed: false,
      evidence: {
        checkpoint: step.checkpoint?.description ?? null,
        recordedStep: recordedStep(null, null),
        ...(screenshotKey !== undefined ? { screenshotKey } : {}),
      },
    })
    return { tier: "none", verdict: "green", healed: false, llmCalls: 0 }
  }

  let resolved: ResolveResult
  try {
    resolved = await resolveTarget(page, cachedSelector, fp)
  } catch (e) {
    if (e instanceof AmbiguousSelector) {
      // The crystallized selector matched N>1 elements — this is a data-quality problem,
      // not a healer opportunity. Record a deduped 'regression' finding so the author sees
      // exactly which selector to fix, then fail this step RED immediately.
      const title = `Ambiguous selector matched ${e.matchCount} elements: "${e.selector}"`
      if (!opts.suppressFindings) {
        await recordFinding(projectId, {
          runId, trailId, stepId: step.id,
          kind: "regression", title,
          evidence: { selector: e.selector, matchCount: e.matchCount, stepAction: step.action },
          confidence: 1.0,
          dedupKey: `ambiguous_selector:${trailId}:${step.id}`,
        })
      }
      // PDF task 1: best-effort screenshot to capture the failure state.
      const screenshotKey = await maybeShot(page, opts)
      await addRunStep(projectId, {
        runId, trailId, stepId: step.id, idx: step.idx,
        tier: "cache", verdict: "red", confidence: 1, diagnosis: "locator_drift", healed: false,
        evidence: {
          reason: "ambiguous_selector",
          selector: e.selector,
          matchCount: e.matchCount,
          recordedStep: recordedStep(e.selector, fp),
          ...(screenshotKey !== undefined ? { screenshotKey } : {}),
        },
      })
      return { tier: "cache", verdict: "red", healed: false, llmCalls: 0 }
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
        return await runVisionTier2(projectId, runId, trailId, page, step, opts, fp, cachedSelector, isAssert, opTimeout)
      }
      // No resolver → unchanged Layer C behavior: RED + needs-vision handoff marker (never green).
      const verdict: Verdict = "red"
      // PDF task 1: best-effort screenshot to capture the failure state.
      const screenshotKey = await maybeShot(page, opts)
      await addRunStep(projectId, {
        runId, trailId, stepId: step.id, idx: step.idx,
        tier: "vision", verdict, confidence: 0, diagnosis: "locator_drift", healed: false,
        evidence: {
          reason: "element_gone",
          needsVision: true,
          fingerprint: fp,
          cachedSelector,
          checkpoint: step.checkpoint?.description ?? null,
          recordedStep: recordedStep(cachedSelector, fp),
          ...(screenshotKey !== undefined ? { screenshotKey } : {}),
        },
      })
      return { tier: "vision", verdict, healed: false, llmCalls: 0 }
    }
    throw e
  }

  // Perform the action (Playwright auto-waits for actionability — the "test DNA" we deliberately keep).
  // Bounded timeout: actionability that never clears is a real break, not a reason to hang.
  const ACTION_TIMEOUT = 5000
  try {
    switch (step.action) {
      case "type": {
        const raw = step.actionValue ?? ""
        const val = hasCredRef(raw) ? await (opts.credResolver ?? resolveCredRefs)(projectId, raw) : raw
        await resolved.locator.fill(val, { timeout: ACTION_TIMEOUT })
        break
      }
      case "click":
        await clickWithTransitionFallback(resolved.locator, ACTION_TIMEOUT)
        break
      case "select":
        await resolved.locator.selectOption(step.actionValue ?? "", { timeout: ACTION_TIMEOUT })
        break
      case "hover":
        await resolved.locator.hover({ timeout: ACTION_TIMEOUT })
        break
      case "keyPress":
        await resolved.locator.press(step.actionValue ?? "Enter", { timeout: ACTION_TIMEOUT })
        break
      case "clearField":
        await resolved.locator.clear({ timeout: ACTION_TIMEOUT })
        break
      case "assert": {
        // Hard checkpoint: the element must be visible. Never overridden by healing.
        const kind = (step.checkpoint && step.checkpoint.kind) || "visible"
        switch (kind) {
          case "textEquals": {
            await resolved.locator.waitFor({ state: "visible", timeout: 5000 })
            const actual = (await resolved.locator.allInnerTexts()).join(" ").trim()
            if (actual !== step.checkpoint!.value) throw new Error(`checkpoint textEquals failed: expected "${step.checkpoint.value}" got "${actual}"`)
            break
          }
          case "textContains": {
            await resolved.locator.waitFor({ state: "visible", timeout: 5000 })
            const actual = (await resolved.locator.allInnerTexts()).join(" ").trim()
            if (!actual.includes(step.checkpoint!.value)) throw new Error(`checkpoint textContains failed: "${step.checkpoint.value}" not in "${actual}"`)
            break
          }
          case "urlMatches": {
            // URL assertions use the page url, not a locator. Poll briefly so transient navigations settle.
            await resolved.locator.waitFor({ state: "visible", timeout: 5000 }).catch(() => {})
            const re = new RegExp(step.checkpoint!.regex!)
            if (!re.test(page.url())) throw new Error(`checkpoint urlMatches failed: "${page.url()}" did not match ${step.checkpoint.regex}`)
            break
          }
          case "elementCount": {
            await resolved.locator.waitFor({ state: "visible", timeout: 5000 }).catch(() => {})
            const n = await resolved.locator.count()
            if (n !== step.checkpoint!.count) throw new Error(`checkpoint elementCount failed: expected ${step.checkpoint.count} got ${n}`)
            break
          }
          default: // "visible" or unknown — fall through to the visible check.
            await resolved.locator.waitFor({ state: "visible", timeout: 5000 })
        }
        break
      }
    }
  } catch {
    // The element resolved but the action/assertion failed (e.g. checkpoint not visible) -> fail-loud RED.
    const verdict: Verdict = "red"
    // PDF task 1: best-effort screenshot even on action failure (shows the failure state).
    const screenshotKey = await maybeShot(page, opts)
    await addRunStep(projectId, {
      runId, trailId, stepId: step.id, idx: step.idx,
      tier: resolved.tier, verdict, confidence: resolved.confidence, diagnosis: isAssert ? "regression" : "interaction_change", healed: false,
      evidence: {
        reason: isAssert ? "checkpoint_failed" : "action_failed",
        checkpoint: step.checkpoint?.description ?? null,
        recordedStep: recordedStep(resolved.selector, fp),
        ...(screenshotKey !== undefined ? { screenshotKey } : {}),
      },
    })
    return { tier: resolved.tier, verdict, healed: false, llmCalls: 0 }
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

  // PDF task 1: capture a per-step screenshot AFTER the action settles (best-effort).
  const screenshotKey = await maybeShot(page, opts)

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
        ...(screenshotKey !== undefined ? { screenshotKey } : {}),
      }
    : {
        selector: resolved.selector,
        healed: false,
        checkpoint: step.checkpoint?.description ?? null,
        recordedStep: recordedStep(resolved.selector, fp),
        ...(screenshotKey !== undefined ? { screenshotKey } : {}),
      }

  await addRunStep(projectId, {
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
    const title = `Checkpoint target gone: ${fp?.accessibleName ?? fp?.text ?? step.checkpoint?.description ?? step.action}`
    if (!opts.suppressFindings) {
      await recordFinding(projectId, {
        runId, trailId, stepId: step.id, kind: "regression", title,
        evidence: { reason: "checkpoint_gone", target: fp, pageUrl: opts.fixtureUrl, checkpoint: step.checkpoint?.description ?? null },
        groundQuote: title, confidence: 1,
        dedupKey: `${trailId}:${step.id}:checkpoint-gone`,
      })
    }
    await addRunStep(projectId, {
      runId, trailId, stepId: step.id, idx: step.idx,
      tier: "vision", verdict: "red", confidence: 1, diagnosis: "regression", healed: false,
      evidence: { reason: "checkpoint_gone", target: fp, cachedSelector, needsVision: false, checkpoint: step.checkpoint?.description ?? null, recordedStep: recordedStep(cachedSelector, fp) },
    })
    return { tier: "vision", verdict: "red", healed: false, llmCalls: 0 }
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
    const shot = (await page.screenshot({ timeout: opTimeout })).toString("base64")
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
    result = await opts.vision!(visionInput, { projectId, weights: opts.visionWeights })
    decision = decideFromVision(result, gate)
  } catch (e) {
    await addRunStep(projectId, {
      runId, trailId, stepId: step.id, idx: step.idx,
      tier: "vision", verdict: "red", confidence: 0, diagnosis: "runtime_error", healed: false,
      evidence: { reason: "vision_error", needsVision: true, error: String(e), target: fp, checkpoint: step.checkpoint?.description ?? null, recordedStep: recordedStep(cachedSelector, fp) },
    })
    return { tier: "vision", verdict: "red", healed: false, llmCalls: 0 }
  }

  const domExcerpt = dom.slice(0, 2000)

  // ── regression: do NOT act → RED + grounded, deduped finding (auto-file-eligible kind) ──
  if (decision.outcome === "regression") {
    const title = `Target gone: ${fp?.accessibleName ?? fp?.text ?? step.action}`
    if (!opts.suppressFindings) {
      await recordFinding(projectId, {
        runId, trailId, stepId: step.id, kind: "regression", title,
        evidence: { rationale: decision.rationale, target: fp, pageUrl: opts.fixtureUrl, domExcerpt },
        groundQuote: decision.rationale, confidence: decision.confidence,
        dedupKey: `${trailId}:${step.id}:gone`,
      })
    }
    await addRunStep(projectId, {
      runId, trailId, stepId: step.id, idx: step.idx,
      tier: "vision", verdict: "red", confidence: decision.confidence, diagnosis: "regression", healed: false,
      evidence: { reason: "vision_regression", classification: result.classification, rationale: decision.rationale, target: fp, needsVision: false, checkpoint: step.checkpoint?.description ?? null, recordedStep: recordedStep(cachedSelector, fp) },
    })
    return { tier: "vision", verdict: "red", healed: false, llmCalls: 1 }
  }

  // ── heal: confirm intent (role consistency, §6.2), act, AMBER, persist + reviewable diff ──
  if (decision.outcome === "heal" && decision.selector) {
    const loc = page.locator(decision.selector)
    const ACTION_TIMEOUT = 5000
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
            await loc.fill(val, { timeout: ACTION_TIMEOUT }); break
          }
          case "click": await clickWithTransitionFallback(loc, ACTION_TIMEOUT); break
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
        await addRunStep(projectId, {
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
    return await fileAmberHeal(projectId, runId, trailId, step, opts, fp, decision.rationale, decision.confidence, result.classification, stepPageUrl, decision.selector ?? cachedSelector)
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
): Promise<OneStepResult> {
  if (!opts.suppressFindings) {
    await recordFinding(projectId, {
      runId, trailId, stepId: step.id, kind: "amber_heal",
      title: `Low-confidence heal: ${fp?.accessibleName ?? fp?.text ?? step.action}`,
      evidence: { rationale, target: fp, pageUrl: opts.fixtureUrl, classification },
      groundQuote: rationale, confidence, dedupKey: `${trailId}:${step.id}:lowconf`,
    })
  }
  await addRunStep(projectId, {
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
