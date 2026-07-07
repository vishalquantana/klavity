// AutoSims F1 — the LLM-drive authoring engine. Loop: screenshot+DOM → model proposes ONE action →
// validate selector resolves to EXACTLY ONE element → execute with Playwright auto-wait → record a
// TrajectoryStep. On "done": crystallize → DRAFT trail → zero-LLM Verification Walk (suppressed
// findings) → outcome. On "stall"/caps/errors: stalled outcome with the exact reason (stop-show-
// refine UX). Secrets: the model only ever sees {{cred:...}} placeholders (credFields); values are
// resolved at fill time and never logged (history/trajectory keep the placeholder).
import { crystallize, type Trajectory, type TrajectoryStep } from "./trails-crystallize"
import { setTrailStatus } from "./trails"
import { walkTrail } from "./trails-runner"
import { hasCredRef, resolveCredRefs, type CredResolver } from "./trails-creds"
import { getTestAccountByName } from "./test-accounts"
import { sha256hex } from "./crypto"
import { withWalkSlot, CHROMIUM_PROD_ARGS } from "./trails-browser"
import { acquireBrowser } from "./trails-browser-page"
import { db } from "./db"
import type { AuthorModel, AuthorAction } from "./trails-author-model"
import { isKrefSelector } from "./trails-snapshot"
import type { StepAction } from "./trails-types"
import { configuredVisionResolver, type VisionResolver } from "./trails-vision"

const AUTOSIM_MAX_STEPS_DEFAULT = 40
const AUTOSIM_MAX_COST_USD_DEFAULT = 0.15
const AUTOSIM_MAX_MS_DEFAULT = 300_000

export const AUTHOR_MAX_STEPS = Number(process.env.AUTOSIM_MAX_STEPS) || AUTOSIM_MAX_STEPS_DEFAULT
export const AUTHOR_MAX_COST_USD = Number(process.env.AUTOSIM_MAX_COST_USD) || AUTOSIM_MAX_COST_USD_DEFAULT
export const AUTOSIM_DEADLINE_MS_DEFAULT = Number(process.env.AUTOSIM_MAX_MS) || AUTOSIM_MAX_MS_DEFAULT
const MAX_CONSECUTIVE_MISSES = 3
const ACTION_TIMEOUT = 10_000

/** Strip ephemeral kref attribute references from strings before persisting or adding to history.
 *  Conveys which ref failed without embedding the literal data-kref attr (which is stale by the
 *  next model call anyway since every iteration re-captures and renumbers refs). */
const dekref = (s: string) => s.replace(/\[data-kref="(e\d+)"\]/g, "snapshot ref $1")

export interface AuthorRequest { name: string; objective: string; baseUrl: string; testAccountName?: string; createdBy?: string }
export interface AuthorStepLog { idx: number; op: string; selector: string | null; value: string | null; url: string; rationale: string; ok: boolean; error?: string }
export interface AuthorOutcome {
  status: "crystallized" | "stalled" | "failed"
  trailId: string | null; verificationRunId: string | null
  verificationVerdict: "green" | "amber" | "red" | null
  steps: AuthorStepLog[]; stallReason: string | null; llmCalls: number; costUsd: number
}

const OP2ACTION: Record<string, StepAction> = { navigate: "navigate", click: "click", type: "type", select: "select", assert: "assert", wait: "wait" }

export async function authorTrail(
  projectId: string, req: AuthorRequest,
  opts: { model: AuthorModel; headless?: boolean; launchArgs?: string[]; credResolver?: CredResolver; onStep?: (log: AuthorStepLog[]) => void | Promise<void>; driveDeadlineMs?: number; textFirst?: boolean; verificationVision?: VisionResolver | false },
): Promise<AuthorOutcome> {
  // Text-first is the DEFAULT (bench 2026-07-04: arm B ~50% cheaper, 6/6 green verdicts vs arm A
  // screenshot-every-step). Happy-path steps run text-only; a miss escalates by re-attaching the
  // screenshot (see `includeShot` below). Kill-switch: KLAV_AUTHOR_TEXT_FIRST=0 reverts to arm A.
  const textFirst = opts.textFirst ?? process.env.KLAV_AUTHOR_TEXT_FIRST !== "0"
  const credResolver = opts.credResolver ?? resolveCredRefs
  const credFields: string[] = []
  if (req.testAccountName) {
    const acc = await getTestAccountByName(projectId, req.testAccountName)
    if (!acc) return { status: "failed", trailId: null, verificationRunId: null, verificationVerdict: null, steps: [], stallReason: `unknown test account: ${req.testAccountName}`, llmCalls: 0, costUsd: 0 }
    credFields.push(`{{cred:${acc.name}:email}}`, `{{cred:${acc.name}:password}}`)
  }
  const log: AuthorStepLog[] = []
  const history: string[] = []
  const traj: TrajectoryStep[] = []
  let llmCalls = 0, costUsd = 0, misses = 0
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
  const handle = await acquireBrowser({ headless: opts.headless, launchArgs: opts.launchArgs })
  const stall = async (why: string): Promise<AuthorOutcome> => {
    await handle.close()
    return { status: "stalled", trailId: null, verificationRunId: null, verificationVerdict: null, steps: log, stallReason: why, llmCalls, costUsd }
  }
  try {
    const page = await handle.newPage()
    await page.goto(req.baseUrl, 20_000)
    // Record the initial navigation as the first TrajectoryStep so the crystallized Trail starts
    // with a navigate action pointing at the baseUrl (gives the runner a concrete starting point).
    {
      const initSnap = await bounded(page.krefSnapshot(), 15_000, "snapshot capture")
      traj.push({ action: "navigate", actionValue: req.baseUrl, url: page.url(), domHash: sha256hex(initSnap) })
    }
    for (let idx = 0; idx < AUTHOR_MAX_STEPS; idx++) {
      if (costUsd >= AUTHOR_MAX_COST_USD) return await stall(`authoring budget cap $${AUTHOR_MAX_COST_USD} reached after ${llmCalls} model calls`)
      if (Date.now() > deadlineAt) return await stall(`authoring drive deadline exceeded (${Math.round(driveDeadlineMs / 1000)}s) after ${log.length} steps`)
      const includeShot = !textFirst || misses > 0
      const screenshotB64 = includeShot
        ? await bounded(page.screenshotJpeg(60, 15_000), 20_000, "screenshot")
        : ""
      const dom = await bounded(page.krefSnapshot(), 15_000, "snapshot capture")
      let r: { action: AuthorAction; costUsd: number }
      try {
        r = await bounded(opts.model({ objective: req.objective, pageUrl: page.url(), screenshotB64, mediaType: "image/jpeg", domSnapshot: dom, history, credFields }, { projectId, email: req.createdBy ?? null }), 120_000, "author model call")
      } catch (e: any) { return await stall(`author model error: ${e?.message || e}`) }
      llmCalls++; costUsd += r.costUsd || 0
      const a = r.action
      if (a.op === "stall" && a.parseError) {
        // KLAVITYKLA-48 #1: a malformed reply is a bad ROLL, not a dead end — one garbage JSON
        // response was killing otherwise-good multi-step attempts. Treat it exactly like a failed
        // action: count a consecutive miss, tell the model, and let it try again.
        misses++
        history.push(`(your last reply was invalid: ${a.rationale} — respond with ONE strict JSON action object)`)
        if (misses >= MAX_CONSECUTIVE_MISSES) return await stall(`stuck after ${misses} malformed model replies; last: ${a.rationale}`)
        continue
      }
      if (a.op === "stall") return await stall(a.rationale || "model stalled")
      if (a.op === "done") break
      const entry: AuthorStepLog = { idx: log.length, op: a.op, selector: a.selector, value: a.value, url: page.url(), rationale: a.rationale, ok: false }
      try {
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
          // Convert kref selector to a stable form BEFORE the action — kref attrs are ephemeral
          // (renumbered every capture) and a click may navigate (removing the element). stableSelector
          // returns null when no stable handle exists; fallback to fp.domPath, then original selector.
          let persistSelector = a.selector!
          if (isKrefSelector(a.selector)) {
            persistSelector = (await bounded(page.stableSelector(a.selector!), 10_000, "stable selector").catch(() => null)) ?? fp.domPath ?? a.selector!
          }
          if (a.op === "click") await page.click(a.selector!, ACTION_TIMEOUT)
          else if (a.op === "type") {
            const raw = a.value ?? ""
            await page.fill(a.selector!, hasCredRef(raw) ? await credResolver(projectId, raw) : raw, ACTION_TIMEOUT)
          } else if (a.op === "select") await page.selectOption(a.selector!, a.value ?? "", ACTION_TIMEOUT)
          else if (a.op === "assert") await page.assertVisible(a.selector!, ACTION_TIMEOUT)
          traj.push({
            action: OP2ACTION[a.op], actionValue: a.op === "type" || a.op === "select" ? a.value ?? undefined : undefined,
            target: { ...fp, resolvedSelector: persistSelector },
            checkpoint: a.op === "assert" ? { description: a.checkpoint || a.rationale || "checkpoint" } : undefined,
            url: page.url(), domHash: sha256hex(dom),
          })
          // Update entry + history with the stable selector so the model context never sees krefs
          entry.selector = persistSelector
        }
        entry.ok = true; misses = 0
        history.push(`${a.op}${entry.selector ? " " + entry.selector : ""}${a.op === "navigate" ? " " + a.url : ""} — ok`)
      } catch (e: any) {
        const msg = String(e?.message || e)
        const safeMsg = dekref(msg)
        const safeSelector = a.selector && isKrefSelector(a.selector) ? dekref(a.selector) : a.selector
        entry.error = safeMsg
        entry.selector = safeSelector
        misses++
        history.push(`${a.op}${safeSelector ? " " + safeSelector : ""} — FAILED: ${safeMsg}`)
        if (misses >= MAX_CONSECUTIVE_MISSES) { log.push(entry); await opts.onStep?.(log); return await stall(`stuck after ${misses} failed attempts; last: ${safeMsg}`) }
      }
      log.push(entry)
      await opts.onStep?.(log)
    }
    await handle.close()
    if (!traj.length) return { status: "stalled", trailId: null, verificationRunId: null, verificationVerdict: null, steps: log, stallReason: "model finished without performing any step", llmCalls, costUsd }
    const trajectory: Trajectory = { name: req.name, intent: req.objective, baseUrl: req.baseUrl, authorKind: "llm", createdBy: req.createdBy, steps: traj }
    const { trailId } = await crystallize(projectId, trajectory)
    await setTrailStatus(projectId, trailId, "draft")
    // Verification Walk: zero-LLM rehearsal; draft status suppresses findings (Task 4), but pass
    // the flag explicitly too — a Verification Walk never files regardless of trail status.
    const vision = opts.verificationVision === false ? undefined : (opts.verificationVision ?? configuredVisionResolver())
    const v = await walkTrail(projectId, trailId, {
      fixtureUrl: req.baseUrl, suppressFindings: true, credResolver, deadlineMs: 180_000,
      launchArgs: opts.launchArgs, headless: opts.headless,
      ...(vision ? { vision } : {}),
    })
    // I1: skip means "inconclusive / no steps ran" — map to amber, not red, so an empty
    // Verification Walk never looks like a regression to the reviewer.
    return { status: "crystallized", trailId, verificationRunId: v.runId, verificationVerdict: v.verdict === "skip" ? "amber" : v.verdict, steps: log, stallReason: null, llmCalls, costUsd }
  } catch (e: any) {
    await handle.close()
    return { status: "failed", trailId: null, verificationRunId: null, verificationVerdict: null, steps: log, stallReason: String(e?.message || e), llmCalls, costUsd }
  }
}

// ── author sessions (poll surface for the UI) ────────────────────────────────────────────────
export interface AuthorSession {
  id: string; projectId: string; name: string; objective: string; baseUrl: string
  testAccount: string | null; status: "running" | "crystallized" | "stalled" | "failed"
  steps: AuthorStepLog[]; stallReason: string | null; trailId: string | null
  verificationRunId: string | null; verificationVerdict: string | null
  llmCalls: number; costUsd: number; createdBy: string | null; createdAt: number; updatedAt: number
}

export async function createAuthorSession(projectId: string, req: AuthorRequest): Promise<string> {
  const id = "auth_" + crypto.randomUUID()
  const now = Date.now()
  await db!.execute({
    sql: `INSERT INTO author_sessions (id,project_id,name,objective,base_url,test_account,status,created_by,created_at,updated_at)
          VALUES (?,?,?,?,?,?,'running',?,?,?)`,
    args: [id, projectId, req.name, req.objective, req.baseUrl, req.testAccountName ?? null, req.createdBy ?? null, now, now],
  })
  return id
}

export async function updateAuthorSession(projectId: string, id: string, patch: Partial<Pick<AuthorSession, "status" | "steps" | "stallReason" | "trailId" | "verificationRunId" | "verificationVerdict" | "llmCalls" | "costUsd">>): Promise<void> {
  const sets: string[] = ["updated_at=?"]; const args: any[] = [Date.now()]
  if (patch.status !== undefined) { sets.push("status=?"); args.push(patch.status) }
  if (patch.steps !== undefined) { sets.push("steps_json=?"); args.push(JSON.stringify(patch.steps)) }
  if (patch.stallReason !== undefined) { sets.push("stall_reason=?"); args.push(patch.stallReason) }
  if (patch.trailId !== undefined) { sets.push("trail_id=?"); args.push(patch.trailId) }
  if (patch.verificationRunId !== undefined) { sets.push("verification_run_id=?"); args.push(patch.verificationRunId) }
  if (patch.verificationVerdict !== undefined) { sets.push("verification_verdict=?"); args.push(patch.verificationVerdict) }
  if (patch.llmCalls !== undefined) { sets.push("llm_calls=?"); args.push(patch.llmCalls) }
  if (patch.costUsd !== undefined) { sets.push("cost_usd=?"); args.push(patch.costUsd) }
  args.push(projectId, id)
  await db!.execute({ sql: `UPDATE author_sessions SET ${sets.join(",")} WHERE project_id=? AND id=?`, args })
}

export async function getAuthorSession(projectId: string, id: string): Promise<AuthorSession | null> {
  const r = await db!.execute({ sql: `SELECT * FROM author_sessions WHERE project_id=? AND id=?`, args: [projectId, id] })
  if (!r.rows.length) return null
  const row: any = r.rows[0]
  let steps: AuthorStepLog[] = []
  try { steps = JSON.parse(String(row.steps_json || "[]")) } catch {}
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
  }
}

export async function getActiveAuthorSession(projectId: string): Promise<AuthorSession | null> {
  const r = await db!.execute({
    sql: `SELECT * FROM author_sessions WHERE project_id=? AND status='running' ORDER BY created_at DESC LIMIT 1`,
    args: [projectId],
  })
  if (!r.rows.length) return null
  const row: any = r.rows[0]
  let steps: AuthorStepLog[] = []
  try { steps = JSON.parse(String(row.steps_json || "[]")) } catch {}
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
  }
}

/**
 * Fire-and-poll trigger (Plan-G pattern). Holds the single walk slot for the WHOLE attempt
 * (authoring drive + verification walk) — throws WalkBusyError synchronously if slot busy.
 * Mirrors runWalkNow's deferred-promise structure: slot is acquired in this turn (WalkBusyError
 * propagates to the caller before we return), session row is created inside the slot, and the
 * sessionId is resolved back to the caller as soon as the row exists.
 */
export async function runAuthorNow(projectId: string, req: AuthorRequest, deps?: { model?: AuthorModel }): Promise<{ sessionId: string }> {
  const { openRouterAuthorModel } = await import("./trails-author-model")
  const model = deps?.model ?? openRouterAuthorModel

  // Deferred: resolve to sessionId once the DB row exists, reject on slot-busy or session-create error.
  let resolveStarted!: (sessionId: string) => void
  let rejectStart!: (err: unknown) => void
  const started = new Promise<string>((res, rej) => { resolveStarted = res; rejectStart = rej })

  // withWalkSlot throws WalkBusyError SYNCHRONOUSLY (in this turn) when the slot is held, so a 2nd
  // concurrent runAuthorNow rejects on `slotHeld` before it ever resolves `started`. On a free slot
  // the promise runs the whole authoring drive + verification walk in the background; we only await
  // `started` (resolved as soon as the session row exists).
  const slotHeld = withWalkSlot(async () => {
    let sessionId: string
    try {
      sessionId = await createAuthorSession(projectId, req)
    } catch (e) {
      rejectStart(e)
      return
    }
    resolveStarted(sessionId)
    try {
      const out = await authorTrail(projectId, req, {
        model, launchArgs: CHROMIUM_PROD_ARGS,
        onStep: (log) => updateAuthorSession(projectId, sessionId, { steps: log }).catch(() => {}),
      })
      await updateAuthorSession(projectId, sessionId, {
        status: out.status, steps: out.steps, stallReason: out.stallReason, trailId: out.trailId,
        verificationRunId: out.verificationRunId, verificationVerdict: out.verificationVerdict,
        llmCalls: out.llmCalls, costUsd: out.costUsd,
      })
    } catch (e: any) {
      await updateAuthorSession(projectId, sessionId, { status: "failed", stallReason: String(e?.message || e) }).catch(() => {})
    }
  })

  // Surface a synchronous WalkBusyError (or a createAuthorSession failure) to the caller; otherwise
  // resolve as soon as the session row exists. The background `slotHeld` keeps running; swallow its
  // settle so a late finalize can't raise an unhandled rejection.
  slotHeld.catch((err) => { rejectStart(err) })
  slotHeld.then(() => {}, () => {})

  const sessionId = await started
  return { sessionId }
}
