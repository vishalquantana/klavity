// AutoSims F1 — the LLM-drive authoring engine. Loop: screenshot+DOM → model proposes ONE action →
// validate selector resolves to EXACTLY ONE element → execute with Playwright auto-wait → record a
// TrajectoryStep. On "done": crystallize → DRAFT trail → zero-LLM Verification Walk (suppressed
// findings) → outcome. On "stall"/caps/errors: stalled outcome with the exact reason (stop-show-
// refine UX). Secrets: the model only ever sees {{cred:...}} placeholders (credFields); values are
// resolved at fill time and never logged (history/trajectory keep the placeholder).
import { chromium, type Page } from "playwright"
import { crystallize, type Trajectory, type TrajectoryStep } from "./trails-crystallize"
import { setTrailStatus } from "./trails"
import { walkTrail } from "./trails-runner"
import { hasCredRef, resolveCredRefs, type CredResolver } from "./trails-creds"
import { getTestAccountByName } from "./test-accounts"
import { sha256hex } from "./crypto"
import { withWalkSlot, CHROMIUM_PROD_ARGS } from "./trails-browser"
import { db } from "./db"
import type { AuthorModel, AuthorAction } from "./trails-author-model"
import type { Fingerprint, StepAction } from "./trails-types"

export const AUTHOR_MAX_STEPS = 40
export const AUTHOR_MAX_COST_USD = 0.15
const DOM_CAP = 16_000
const MAX_CONSECUTIVE_MISSES = 3
const ACTION_TIMEOUT = 10_000

export interface AuthorRequest { name: string; objective: string; baseUrl: string; testAccountName?: string; createdBy?: string }
export interface AuthorStepLog { idx: number; op: string; selector: string | null; value: string | null; url: string; rationale: string; ok: boolean; error?: string }
export interface AuthorOutcome {
  status: "crystallized" | "stalled" | "failed"
  trailId: string | null; verificationRunId: string | null
  verificationVerdict: "green" | "amber" | "red" | null
  steps: AuthorStepLog[]; stallReason: string | null; llmCalls: number; costUsd: number
}

async function captureFingerprint(page: Page, selector: string): Promise<Fingerprint> {
  return await page.locator(selector).first().evaluate((el: Element) => {
    const tag = el.tagName.toLowerCase()
    const roleMap: Record<string, string> = { button: "button", a: "link", input: "textbox", select: "combobox", textarea: "textbox" }
    const text = (el.textContent || "").trim().slice(0, 80)
    const accName = el.getAttribute("aria-label") || (el as any).placeholder || text
    let path = "", cur: Element | null = el
    for (let d = 0; cur && d < 4; d++) {
      let i = 1, sib = cur.previousElementSibling
      while (sib) { if (sib.tagName === cur.tagName) i++; sib = sib.previousElementSibling }
      path = cur.tagName.toLowerCase() + ":nth-of-type(" + i + ")" + (path ? ">" + path : "")
      cur = cur.parentElement
    }
    return {
      role: el.getAttribute("role") || roleMap[tag] || undefined,
      accessibleName: accName || undefined, text: text || undefined,
      testId: el.getAttribute("data-testid") || undefined, domPath: path,
    }
  })
}

const OP2ACTION: Record<string, StepAction> = { navigate: "navigate", click: "click", type: "type", select: "select", assert: "assert", wait: "wait" }

export async function authorTrail(
  projectId: string, req: AuthorRequest,
  opts: { model: AuthorModel; headless?: boolean; launchArgs?: string[]; credResolver?: CredResolver; onStep?: (log: AuthorStepLog[]) => void | Promise<void>; driveDeadlineMs?: number },
): Promise<AuthorOutcome> {
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
  const deadlineAt = Date.now() + (opts.driveDeadlineMs ?? 300_000)
  const bounded = <T>(p: Promise<T>, ms: number, what: string): Promise<T> =>
    Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`${what} timed out after ${ms}ms`)), ms))])
  const browser = await chromium.launch({ headless: opts.headless ?? true, args: opts.launchArgs ?? [] })
  const stall = async (why: string): Promise<AuthorOutcome> => {
    await browser.close().catch(() => {})
    return { status: "stalled", trailId: null, verificationRunId: null, verificationVerdict: null, steps: log, stallReason: why, llmCalls, costUsd }
  }
  try {
    const page = await browser.newPage()
    await page.goto(req.baseUrl, { timeout: 20_000, waitUntil: "domcontentloaded" })
    // Record the initial navigation as the first TrajectoryStep so the crystallized Trail starts
    // with a navigate action pointing at the baseUrl (gives the runner a concrete starting point).
    {
      const initDom = (await page.content()).slice(0, DOM_CAP)
      traj.push({ action: "navigate", actionValue: req.baseUrl, url: page.url(), domHash: sha256hex(initDom) })
    }
    for (let idx = 0; idx < AUTHOR_MAX_STEPS; idx++) {
      if (costUsd >= AUTHOR_MAX_COST_USD) return await stall(`authoring budget cap $${AUTHOR_MAX_COST_USD} reached after ${llmCalls} model calls`)
      if (Date.now() > deadlineAt) return await stall(`authoring drive deadline exceeded (${Math.round((opts.driveDeadlineMs ?? 300_000) / 1000)}s) after ${log.length} steps`)
      const screenshotB64 = (await bounded(page.screenshot({ type: "jpeg", quality: 60, timeout: 15_000 }), 20_000, "screenshot")).toString("base64")
      const dom = (await bounded(page.content(), 15_000, "page.content")).slice(0, DOM_CAP)
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
          await page.waitForTimeout(ms)
          traj.push({ action: "wait", actionValue: String(ms), url: page.url(), domHash: sha256hex(dom) })
        } else if (a.op === "navigate") {
          await page.goto(a.url!, { timeout: 20_000, waitUntil: "domcontentloaded" })
          traj.push({ action: "navigate", actionValue: a.url!, url: page.url(), domHash: sha256hex(dom) })
        } else {
          const loc = page.locator(a.selector!)
          const n = await loc.count()
          if (n !== 1) throw new Error(`selector "${a.selector}" matched ${n} elements (need exactly 1)`)
          const fp = await captureFingerprint(page, a.selector!)
          if (a.op === "click") await loc.click({ timeout: ACTION_TIMEOUT })
          else if (a.op === "type") {
            const raw = a.value ?? ""
            await loc.fill(hasCredRef(raw) ? await credResolver(projectId, raw) : raw, { timeout: ACTION_TIMEOUT })
          } else if (a.op === "select") await loc.selectOption(a.value ?? "", { timeout: ACTION_TIMEOUT })
          else if (a.op === "assert") await loc.waitFor({ state: "visible", timeout: ACTION_TIMEOUT })
          traj.push({
            action: OP2ACTION[a.op], actionValue: a.op === "type" || a.op === "select" ? a.value ?? undefined : undefined,
            target: { ...fp, resolvedSelector: a.selector! },
            checkpoint: a.op === "assert" ? { description: a.checkpoint || a.rationale || "checkpoint" } : undefined,
            url: page.url(), domHash: sha256hex(dom),
          })
        }
        entry.ok = true; misses = 0
        history.push(`${a.op}${a.selector ? " " + a.selector : ""}${a.op === "navigate" ? " " + a.url : ""} — ok`)
      } catch (e: any) {
        const msg = String(e?.message || e)
        entry.error = msg; misses++
        history.push(`${a.op}${a.selector ? " " + a.selector : ""} — FAILED: ${msg}`)
        if (misses >= MAX_CONSECUTIVE_MISSES) { log.push(entry); await opts.onStep?.(log); return await stall(`stuck after ${misses} failed attempts; last: ${msg}`) }
      }
      log.push(entry)
      await opts.onStep?.(log)
    }
    await browser.close().catch(() => {})
    if (!traj.length) return { status: "stalled", trailId: null, verificationRunId: null, verificationVerdict: null, steps: log, stallReason: "model finished without performing any step", llmCalls, costUsd }
    const trajectory: Trajectory = { name: req.name, intent: req.objective, baseUrl: req.baseUrl, authorKind: "llm", createdBy: req.createdBy, steps: traj }
    const { trailId } = await crystallize(projectId, trajectory)
    await setTrailStatus(projectId, trailId, "draft")
    // Verification Walk: zero-LLM rehearsal; draft status suppresses findings (Task 4), but pass
    // the flag explicitly too — a Verification Walk never files regardless of trail status.
    const v = await walkTrail(projectId, trailId, {
      fixtureUrl: req.baseUrl, suppressFindings: true, credResolver,
      launchArgs: opts.launchArgs, headless: opts.headless,
    })
    // I1: skip means "inconclusive / no steps ran" — map to amber, not red, so an empty
    // Verification Walk never looks like a regression to the reviewer.
    return { status: "crystallized", trailId, verificationRunId: v.runId, verificationVerdict: v.verdict === "skip" ? "amber" : v.verdict, steps: log, stallReason: null, llmCalls, costUsd }
  } catch (e: any) {
    await browser.close().catch(() => {})
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
