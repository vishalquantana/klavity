// F-01 DEV-04 + DEV-05: run test cases (typically generated from a requirements document) as a QUEUE —
// one after another, no click per test case — and validate each run's actual behaviour against the
// test case's expected result.
//
// Per item:
//   • test case has no AutoSim yet → RECORD it (runAuthorNow). The objective handed to the AutoSim
//     carries the steps + preconditions + expected result + requirement, so the drive's own "done"
//     verifier checks the expected result before it may finish (DEV-04).
//   • test case already has an AutoSim → REPLAY it (runWalkNow) — the recorded script, incl. its asserts.
//   • The server allows one AutoSim recording at a time: a busy slot (WalkBusyError/AuthorBusyError)
//     is waited out (polled), never failed.
//   • Then VALIDATE (DEV-05): an LLM compares the expected result with the evidence the run left (last
//     page text, step log, the drive's own verification) → passed / failed / blocked + observed
//     behaviour + reason; deterministic fallback when no model is available. Evidence (screenshots,
//     verification report, PDF) is stored on the item.
// Runs are persisted, so the queue survives a restart (resumeRequirementRuns re-queues interrupted items).
import { db, recordAiCall } from "./db"
import type { TestCase } from "./autosim-projects"

const s = (v: any) => (v == null ? "" : String(v))
const pj = <T>(v: any, d: T): T => { try { return v ? JSON.parse(String(v)) : d } catch { return d } }

export type ItemStatus = "queued" | "running" | "passed" | "failed" | "blocked" | "error" | "cancelled"
export type RunStatus = "queued" | "running" | "cancelling" | "done" | "cancelled"

const BUSY_POLL_MS = 10_000
const BUSY_MAX_MS = 90 * 60_000          // give up waiting for a free AutoSim slot after 90 min
const SESSION_POLL_MS = 3_000
const SESSION_MAX_MS = 60 * 60_000       // a single recording may take long; cap at 60 min
const WALK_MAX_MS = 30 * 60_000
const CANCEL_GRACE_MS = 30_000          // after Stop: how long the current AutoSim may take to wind down
const JUDGE_MODEL = process.env.KLAV_REQ_JUDGE_MODEL || "openai/gpt-4o-mini"

// ── Objective handed to the AutoSim (DEV-04) ──────────────────────────────────────────────────────
export function buildObjective(tc: Pick<TestCase, "description" | "preconditions" | "expectedResult">, req?: { ref: string; title: string } | null): string {
  const parts = [tc.description.trim()]
  if (tc.preconditions.trim()) parts.push(`Preconditions (make sure these hold before you start): ${tc.preconditions.trim()}`)
  if (tc.expectedResult.trim()) parts.push(`Expected result (before finishing, confirm this is actually shown/true in the application): ${tc.expectedResult.trim()}`)
  if (req) parts.push(`This checks requirement ${req.ref}: ${req.title}`)
  return parts.filter(Boolean).join("\n\n")
}

// ── Validation (DEV-05) ───────────────────────────────────────────────────────────────────────────
export interface Observation {
  mode: "record" | "replay"
  outcome: "completed" | "stalled" | "needs_auth" | "error" | "cancelled" | "timeout"
  objectiveVerified: boolean | null
  verdict: "green" | "amber" | "red" | null
  stallReason: string | null
  lastUrl: string | null
  pageText: string
  stepNotes: string[]
}
export interface Validation { status: Exclude<ItemStatus, "queued" | "running">; observed: string; reason: string }

/** Deterministic verdict from the AutoSim's own signals (also the fallback when no model is available). */
export function baselineValidation(o: Observation): Validation {
  const lastStep = o.stepNotes[o.stepNotes.length - 1] || ""
  if (o.outcome === "cancelled") return { status: "cancelled", observed: "", reason: "Run cancelled." }
  if (o.outcome === "needs_auth") return { status: "blocked", observed: o.lastUrl ? `Stopped at a login page (${o.lastUrl}).` : "Stopped at a login page.", reason: "The AutoSim needs login credentials for this test case." }
  if (o.outcome === "timeout") return { status: "error", observed: lastStep, reason: "The run did not finish in time." }
  if (o.outcome === "error") return { status: "error", observed: lastStep, reason: o.stallReason || "The AutoSim could not run." }
  if (o.mode === "replay") {
    if (o.verdict === "green") return { status: "passed", observed: "The recorded flow replayed and every check passed.", reason: "All recorded steps and checks passed." }
    if (o.verdict === "amber") return { status: "passed", observed: "The recorded flow replayed; some steps needed automatic fixes.", reason: "Checks passed after self-healing (review the report)." }
    return { status: "failed", observed: lastStep || "The replay failed.", reason: o.stallReason || "A recorded step or check failed." }
  }
  if (o.outcome === "completed" && o.objectiveVerified) return { status: "passed", observed: lastStep || "The AutoSim completed the flow.", reason: "The AutoSim verified the expected result before finishing." }
  return { status: "failed", observed: lastStep || (o.lastUrl ? `Ended on ${o.lastUrl}` : ""), reason: o.stallReason || "The expected result was not reached." }
}

/** LLM comparison of expected vs actual from the run's evidence. Falls back to the baseline. */
export async function judgeAgainstExpected(input: {
  testCase: Pick<TestCase, "name" | "description" | "preconditions" | "expectedResult">
  observation: Observation; projectId: string; actorEmail: string | null; fetchImpl?: typeof fetch
}): Promise<Validation> {
  const { testCase: tc, observation: o } = input
  const base = baselineValidation(o)
  // Nothing to compare against, a run that never really executed, or a deterministic replay: the
  // AutoSim's own signals ARE the result.
  if (!tc.expectedResult.trim() || o.mode === "replay" || ["cancelled", "needs_auth", "error", "timeout"].includes(o.outcome)) return base
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return base
  const system = `You are a QA validator. Compare what a browser automation run actually observed in the application with the EXPECTED RESULT of a test case.
Return ONLY JSON: {"verdict":"passed"|"failed"|"blocked","observed":string,"reason":string}
- passed: the evidence shows the expected result happened.
- failed: the application behaved differently from the expected result (a real defect or mismatch).
- blocked: the run could not get far enough to judge (missing data, environment problem, the agent got stuck before the relevant step).
"observed" = one or two sentences describing what the application actually showed. "reason" = why you chose the verdict. Base it ONLY on the evidence.`
  const user = [
    `TEST CASE: ${tc.name}`,
    tc.preconditions.trim() ? `PRECONDITIONS: ${tc.preconditions.trim()}` : "",
    `STEPS:\n${tc.description.trim()}`,
    `EXPECTED RESULT: ${tc.expectedResult.trim()}`,
    `RUN OUTCOME: ${o.outcome}${o.objectiveVerified ? " (the automation's own check confirmed the objective)" : ""}${o.stallReason ? ` — stopped because: ${o.stallReason}` : ""}`,
    `LAST URL: ${o.lastUrl || "unknown"}`,
    `LAST STEPS:\n${o.stepNotes.slice(-15).join("\n") || "(none)"}`,
    `FINAL PAGE CONTENT (truncated):\n${o.pageText.slice(0, 6000) || "(not captured)"}`,
  ].filter(Boolean).join("\n\n")
  let ok = true, inT: number | null = null, outT: number | null = null
  try {
    const resp = await (input.fetchImpl ?? fetch)("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`, "HTTP-Referer": "https://klavity.in" },
      body: JSON.stringify({ model: JUDGE_MODEL, messages: [{ role: "system", content: system }, { role: "user", content: user }], response_format: { type: "json_object" }, max_tokens: 400 }),
    })
    if (!resp.ok) { ok = false; return base }
    const data: any = await resp.json()
    inT = data.usage?.prompt_tokens ?? null; outT = data.usage?.completion_tokens ?? null
    const raw = JSON.parse(String(data.choices?.[0]?.message?.content || "{}").replace(/^```(?:json)?\s*|\s*```$/g, ""))
    const v = raw?.verdict
    if (v !== "passed" && v !== "failed" && v !== "blocked") { ok = false; return base }
    return { status: v, observed: s(raw.observed).slice(0, 1000) || base.observed, reason: s(raw.reason).slice(0, 1000) || base.reason }
  } catch { ok = false; return base }
  finally {
    recordAiCall({ type: "requirements-validate", feature: "requirements-validate", model: JUDGE_MODEL, projectId: input.projectId, actorEmail: input.actorEmail, inputTokens: inT, outputTokens: outT, ok }).catch(() => {})
  }
}

// ── Persistence ───────────────────────────────────────────────────────────────────────────────────
export interface RunItem {
  id: string; runId: string; position: number; testCaseId: string; testCaseName: string; status: ItemStatus
  mode: string | null; authorSessionId: string | null; trailId: string | null; walkRunId: string | null
  expectedResult: string; observed: string; reason: string; evidence: any; startedAt: number | null; finishedAt: number | null
}
export interface RequirementRun {
  id: string; autosimProjectId: string; docId: string | null; status: RunStatus; createdBy: string | null
  createdAt: number; startedAt: number | null; finishedAt: number | null
  counts: Record<string, number>; total: number; items?: RunItem[]
}
const rowToItem = (r: any): RunItem => ({
  id: s(r.id), runId: s(r.run_id), position: Number(r.position), testCaseId: s(r.test_case_id), testCaseName: s(r.tc_name),
  status: s(r.status) as ItemStatus, mode: r.mode ? s(r.mode) : null,
  authorSessionId: r.author_session_id ? s(r.author_session_id) : null, trailId: r.trail_id ? s(r.trail_id) : null, walkRunId: r.walk_run_id ? s(r.walk_run_id) : null,
  expectedResult: s(r.expected_result), observed: s(r.observed), reason: s(r.reason), evidence: pj(r.evidence_json, null),
  startedAt: r.started_at == null ? null : Number(r.started_at), finishedAt: r.finished_at == null ? null : Number(r.finished_at),
})

/** status 400 = bad request (no / foreign test cases), 409 = a run is already in progress. */
export class RunConflictError extends Error { constructor(m: string, public status = 409) { super(m); this.name = "RunConflictError" } }

/** Queue a run of the given test cases (in the given order). One active run per AutoSim project. */
export async function createRun(projectId: string, apId: string, testCaseIds: string[], opts: { docId?: string | null; createdBy: string | null }): Promise<string> {
  const ids = [...new Set(testCaseIds.map(String))]
  if (!ids.length) throw new RunConflictError("Pick at least one test case to run.", 400)
  const own = await db!.execute({ sql: `SELECT id, expected_result FROM autosim_test_cases WHERE project_id=? AND autosim_project_id=? AND id IN (${ids.map(() => "?").join(",")})`, args: [projectId, apId, ...ids] })
  const exp = new Map(own.rows.map((r: any) => [s(r.id), s(r.expected_result)]))
  if (exp.size !== ids.length) throw new RunConflictError("Some of these test cases do not belong to this project.", 400)
  if (await activeRun(projectId, apId)) throw new RunConflictError("A requirements run is already in progress for this project. Wait for it to finish or cancel it.")
  const runId = "areqrun_" + crypto.randomUUID(), t = Date.now()
  await db!.batch([
    { sql: `INSERT INTO autosim_requirement_runs (id,project_id,autosim_project_id,doc_id,status,created_by,created_at) VALUES (?,?,?,?,?,?,?)`, args: [runId, projectId, apId, opts.docId ?? null, "queued", opts.createdBy, t] },
    ...ids.map((tcId, i) => ({
      sql: `INSERT INTO autosim_requirement_run_items (id,run_id,project_id,position,test_case_id,status,expected_result) VALUES (?,?,?,?,?,?,?)`,
      args: ["areqitem_" + crypto.randomUUID(), runId, projectId, i, tcId, "queued", exp.get(tcId) ?? ""],
    })),
  ], "write")
  return runId
}

async function runCounts(projectId: string, runId: string) {
  const r = await db!.execute({ sql: `SELECT status, COUNT(*) AS n FROM autosim_requirement_run_items WHERE project_id=? AND run_id=? GROUP BY status`, args: [projectId, runId] })
  const counts: Record<string, number> = {}; let total = 0
  for (const x of r.rows as any[]) { counts[s(x.status)] = Number(x.n); total += Number(x.n) }
  return { counts, total }
}
const rowToRun = (r: any) => ({
  id: s(r.id), autosimProjectId: s(r.autosim_project_id), docId: r.doc_id ? s(r.doc_id) : null, status: s(r.status) as RunStatus,
  createdBy: r.created_by ? s(r.created_by) : null, createdAt: Number(r.created_at),
  startedAt: r.started_at == null ? null : Number(r.started_at), finishedAt: r.finished_at == null ? null : Number(r.finished_at),
})

export async function getRun(projectId: string, apId: string, runId: string, withItems = true): Promise<RequirementRun | null> {
  const r = await db!.execute({ sql: `SELECT * FROM autosim_requirement_runs WHERE project_id=? AND autosim_project_id=? AND id=?`, args: [projectId, apId, runId] })
  if (!r.rows.length) return null
  const run: RequirementRun = { ...rowToRun(r.rows[0]), ...(await runCounts(projectId, runId)) }
  if (withItems) {
    const it = await db!.execute({
      sql: `SELECT i.*, t.name AS tc_name FROM autosim_requirement_run_items i LEFT JOIN autosim_test_cases t ON t.id=i.test_case_id AND t.project_id=i.project_id
            WHERE i.project_id=? AND i.run_id=? ORDER BY i.position`,
      args: [projectId, runId],
    })
    run.items = it.rows.map(rowToItem)
  }
  return run
}
export async function listRuns(projectId: string, apId: string, limit = 20): Promise<RequirementRun[]> {
  const r = await db!.execute({ sql: `SELECT * FROM autosim_requirement_runs WHERE project_id=? AND autosim_project_id=? ORDER BY created_at DESC LIMIT ?`, args: [projectId, apId, limit] })
  const out: RequirementRun[] = []
  for (const row of r.rows) out.push({ ...rowToRun(row), ...(await runCounts(projectId, s((row as any).id))) })
  return out
}
export async function activeRun(projectId: string, apId: string): Promise<RequirementRun | null> {
  const r = await db!.execute({ sql: `SELECT id FROM autosim_requirement_runs WHERE project_id=? AND autosim_project_id=? AND status IN ('queued','running','cancelling') ORDER BY created_at DESC LIMIT 1`, args: [projectId, apId] })
  return r.rows.length ? getRun(projectId, apId, s((r.rows[0] as any).id), true) : null
}
export async function cancelRun(projectId: string, apId: string, runId: string): Promise<boolean> {
  const r = await db!.execute({ sql: `UPDATE autosim_requirement_runs SET status='cancelling' WHERE project_id=? AND autosim_project_id=? AND id=? AND status IN ('queued','running')`, args: [projectId, apId, runId] })
  return r.rowsAffected > 0
}
/** Latest item for each of a test case's runs (newest first) — the test case page's validation history. */
export async function testCaseValidations(projectId: string, testCaseId: string, limit = 10): Promise<RunItem[]> {
  const r = await db!.execute({
    sql: `SELECT i.*, t.name AS tc_name FROM autosim_requirement_run_items i LEFT JOIN autosim_test_cases t ON t.id=i.test_case_id AND t.project_id=i.project_id
          WHERE i.project_id=? AND i.test_case_id=? AND i.status NOT IN ('queued') ORDER BY COALESCE(i.finished_at, i.started_at) DESC LIMIT ?`,
    args: [projectId, testCaseId, limit],
  })
  return r.rows.map(rowToItem)
}

const setItem = (projectId: string, id: string, patch: Record<string, any>) => {
  const keys = Object.keys(patch)
  return db!.execute({ sql: `UPDATE autosim_requirement_run_items SET ${keys.map(k => `${k}=?`).join(",")} WHERE project_id=? AND id=?`, args: [...keys.map(k => patch[k]), projectId, id] })
}
const runStatusNow = async (projectId: string, runId: string): Promise<RunStatus | null> => {
  const r = await db!.execute({ sql: `SELECT status FROM autosim_requirement_runs WHERE project_id=? AND id=?`, args: [projectId, runId] })
  return r.rows.length ? (s((r.rows[0] as any).status) as RunStatus) : null
}

// ── Runner ────────────────────────────────────────────────────────────────────────────────────────
export interface RunnerDeps {
  getTestCase(projectId: string, id: string): Promise<TestCase | null>
  currentTrailId(projectId: string, testCaseId: string): Promise<string | null>
  requirementFor(projectId: string, tc: TestCase): Promise<{ ref: string; title: string } | null>
  testAccountName(projectId: string, accountId: string): Promise<string | null>
  /** Plan / quota gate before a NEW recording; returns a user-facing reason when not allowed. */
  preflightRecord(projectId: string): Promise<string | null>
  runAuthor(projectId: string, req: any): Promise<{ sessionId: string }>
  getAuthorSession(projectId: string, id: string): Promise<any | null>
  cancelAuthor(sessionId: string): boolean
  runWalk(projectId: string, trailId: string): Promise<{ runId: string }>
  getWalk(projectId: string, runId: string): Promise<any | null>
  listRunSteps(projectId: string, runId: string): Promise<any[]>
  cancelWalk(runId: string): boolean
  judge(input: Parameters<typeof judgeAgainstExpected>[0]): Promise<Validation>
  sleep(ms: number): Promise<void>
  now(): number
}

let _defaultDeps: RunnerDeps | null = null
async function defaultDeps(): Promise<RunnerDeps> {
  if (_defaultDeps) return _defaultDeps
  const [aspM, author, trigger, trails, browser, store, accounts, viewport] = await Promise.all([
    import("./autosim-projects"), import("./trails-author"), import("./trails-trigger"), import("./trails"),
    import("./trails-browser"), import("./requirements-store"), import("./test-accounts"), import("./trails-viewport"),
  ])
  _defaultDeps = {
    getTestCase: aspM.getTestCase,
    currentTrailId: aspM.currentTrailId,
    requirementFor: async (pid, tc) => { const q = await store.requirementForTestCase(pid, tc); return q ? { ref: q.ref, title: q.title } : null },
    testAccountName: async (pid, id) => { const a = await accounts.getTestAccountById(pid, id); return a ? String(a.name) : null },
    preflightRecord: async () => null,
    runAuthor: (pid, req) => author.runAuthorNow(pid, { ...req, viewport: viewport.normalizeTrailViewport({ preset: "desktop", width: 1920, height: 1080 }) }),
    getAuthorSession: author.getAuthorSession,
    cancelAuthor: browser.cancelCurrentAuthor,
    runWalk: (pid, trailId) => trigger.runWalkNow(pid, trailId),
    getWalk: trails.getWalk,
    listRunSteps: trails.listRunSteps,
    cancelWalk: browser.cancelCurrentWalk,
    judge: judgeAgainstExpected,
    sleep: (ms) => new Promise(r => setTimeout(r, ms)),
    now: () => Date.now(),
  }
  return _defaultDeps
}
/** Server wiring: plan/quota gate for new recordings (kept out of this module to avoid importing server code). */
export function setRecordPreflight(fn: (projectId: string) => Promise<string | null>): void {
  defaultDeps().then(d => { d.preflightRecord = fn }).catch(() => {})
}

const _active = new Set<string>()
export function isRunActive(runId: string): boolean { return _active.has(runId) }

/** Start processing a run in the background (no-op if this process is already processing it). */
export function kickRun(projectId: string, runId: string, deps?: Partial<RunnerDeps>): Promise<void> {
  if (_active.has(runId)) return Promise.resolve()
  _active.add(runId)
  return (async () => {
    const d = { ...(await defaultDeps()), ...(deps || {}) } as RunnerDeps
    await processRun(projectId, runId, d)
  })().catch(e => console.error(`[requirement-runs] run ${runId} crashed:`, e?.message || e)).finally(() => _active.delete(runId))
}

async function processRun(projectId: string, runId: string, d: RunnerDeps): Promise<void> {
  await db!.execute({ sql: `UPDATE autosim_requirement_runs SET status='running', started_at=COALESCE(started_at,?) WHERE project_id=? AND id=? AND status='queued'`, args: [d.now(), projectId, runId] })
  for (;;) {
    const st = await runStatusNow(projectId, runId)
    if (!st || st === "done" || st === "cancelled") return
    if (st === "cancelling") {
      await db!.batch([
        { sql: `UPDATE autosim_requirement_run_items SET status='cancelled', reason='Run cancelled before this test case started.', finished_at=? WHERE project_id=? AND run_id=? AND status='queued'`, args: [d.now(), projectId, runId] },
        { sql: `UPDATE autosim_requirement_runs SET status='cancelled', finished_at=? WHERE project_id=? AND id=?`, args: [d.now(), projectId, runId] },
      ], "write")
      return
    }
    const next = await db!.execute({ sql: `SELECT * FROM autosim_requirement_run_items WHERE project_id=? AND run_id=? AND status='queued' ORDER BY position LIMIT 1`, args: [projectId, runId] })
    if (!next.rows.length) {
      await db!.execute({ sql: `UPDATE autosim_requirement_runs SET status='done', finished_at=? WHERE project_id=? AND id=? AND status IN ('running','queued')`, args: [d.now(), projectId, runId] })
      // A cancel that landed after the last item finished still ends as "cancelled" on the next pass.
      if ((await runStatusNow(projectId, runId)) === "cancelling") continue
      return
    }
    const run = await db!.execute({ sql: `SELECT created_by FROM autosim_requirement_runs WHERE project_id=? AND id=?`, args: [projectId, runId] })
    await runItem(projectId, runId, rowToItem(next.rows[0]), (run.rows[0] as any)?.created_by ?? null, d)
  }
}

const cancelled = async (projectId: string, runId: string) => (await runStatusNow(projectId, runId)) === "cancelling"

/** Call a slot-taking starter, waiting out "another AutoSim is running" (one recording at a time). */
async function acquire<T>(projectId: string, runId: string, start: () => Promise<T>, d: RunnerDeps): Promise<T | "cancelled" | "timeout"> {
  const until = d.now() + BUSY_MAX_MS
  for (;;) {
    try { return await start() }
    catch (e: any) {
      if (e?.name !== "WalkBusyError" && e?.name !== "AuthorBusyError") throw e
      if (await cancelled(projectId, runId)) return "cancelled"
      if (d.now() > until) return "timeout"
      await d.sleep(BUSY_POLL_MS)
    }
  }
}

async function finish(projectId: string, item: RunItem, v: Validation, evidence: any, d: RunnerDeps) {
  await setItem(projectId, item.id, { status: v.status, observed: v.observed, reason: v.reason, evidence_json: evidence ? JSON.stringify(evidence) : null, finished_at: d.now() })
}

async function runItem(projectId: string, runId: string, item: RunItem, actor: string | null, d: RunnerDeps): Promise<void> {
  await setItem(projectId, item.id, { status: "running", started_at: d.now(), observed: "", reason: "" })
  const tc = await d.getTestCase(projectId, item.testCaseId)
  if (!tc) return finish(projectId, item, { status: "error", observed: "", reason: "This test case was deleted." }, null, d)
  await setItem(projectId, item.id, { expected_result: tc.expectedResult })
  try {
    const trailId = await d.currentTrailId(projectId, tc.id)
    if (trailId) return await replayItem(projectId, runId, item, tc, trailId, actor, d)
    return await recordItem(projectId, runId, item, tc, actor, d)
  } catch (e: any) {
    console.warn(`[requirement-runs] item ${item.id}: ${e?.message || e}`)
    return finish(projectId, item, { status: "error", observed: "", reason: String(e?.message || e).slice(0, 300) }, null, d)
  }
}

async function recordItem(projectId: string, runId: string, item: RunItem, tc: TestCase, actor: string | null, d: RunnerDeps) {
  await setItem(projectId, item.id, { mode: "record" })
  const blocked = (reason: string) => finish(projectId, item, { status: "blocked", observed: "", reason }, null, d)
  if (!tc.startUrl) return blocked("The test case has no Start URL.")
  if (tc.description.trim().length < 10) return blocked("The test case has no execution steps.")
  let testAccountName: string | undefined
  if (tc.testAccountId) {
    const n = await d.testAccountName(projectId, tc.testAccountId)
    if (!n) return blocked("The test case's credentials no longer exist.")
    testAccountName = n
  }
  const gate = await d.preflightRecord(projectId)
  if (gate) return blocked(gate)
  const req = await d.requirementFor(projectId, tc)
  const started = await acquire(projectId, runId, () => d.runAuthor(projectId, {
    name: tc.name.slice(0, 80), objective: buildObjective(tc, req), baseUrl: tc.startUrl,
    testAccountName, createdBy: actor ?? undefined, testCaseId: tc.id,
  }), d)
  if (started === "cancelled") return finish(projectId, item, { status: "cancelled", observed: "", reason: "Run cancelled while waiting for another AutoSim to finish." }, null, d)
  if (started === "timeout") return finish(projectId, item, { status: "error", observed: "", reason: "Another AutoSim kept the recorder busy for too long." }, null, d)
  const sid = started.sessionId
  await setItem(projectId, item.id, { author_session_id: sid })

  // Wait for the recording to finish (cancel it if the run is cancelled).
  const until = d.now() + SESSION_MAX_MS
  let sess: any = null, cancelAsked = false, timedOut = false, cancelAt = 0
  for (;;) {
    sess = await d.getAuthorSession(projectId, sid)
    if (sess && sess.status !== "running" && sess.status !== "resuming") break
    if (!cancelAsked && await cancelled(projectId, runId)) {
      cancelAsked = true; cancelAt = d.now()
      // Stop: signal the drive (it halts at its next step). If this process isn't running that drive (e.g. it
      // was orphaned by a restart) nothing will ever end it — don't wait on it.
      if (!d.cancelAuthor(sid)) break
    }
    // A stop must take effect promptly: give the drive a short grace to wind down, then move on regardless.
    if (cancelAsked && d.now() - cancelAt > CANCEL_GRACE_MS) break
    if (d.now() > until) { timedOut = true; d.cancelAuthor(sid); break }
    await d.sleep(SESSION_POLL_MS)
  }
  const steps: any[] = Array.isArray(sess?.steps) ? sess.steps : []
  const last = steps[steps.length - 1]
  const outcome: Observation["outcome"] = timedOut ? "timeout"
    : !sess ? "error"
    : sess.status === "crystallized" ? "completed"
    : sess.status === "needs_auth" ? "needs_auth"
    : sess.status === "failed" ? "error"
    : (cancelAsked || /cancel/i.test(s(sess.stallReason))) ? "cancelled" : "stalled"
  const obs: Observation = {
    mode: "record", outcome,
    objectiveVerified: sess?.objectiveVerified ?? null,
    verdict: (sess?.verificationVerdict as any) ?? null,
    stallReason: sess?.stallReason ?? null,
    lastUrl: last?.url ?? null,
    pageText: lastPageText(steps),
    stepNotes: steps.map(stepNote),
  }
  const v = await d.judge({ testCase: tc, observation: obs, projectId, actorEmail: actor })
  const shots = steps.filter(x => x?.screenshotKey).slice(-3).map(x => ({ idx: x.idx, url: `/api/trails/author/${encodeURIComponent(sid)}/steps/${x.idx}/screenshot` }))
  const vr = sess?.verificationRunId ?? null
  if (sess?.trailId) await setItem(projectId, item.id, { trail_id: sess.trailId, walk_run_id: vr })
  return finish(projectId, item, v, {
    mode: "record", authorSessionId: sid, trailId: sess?.trailId ?? null, verificationRunId: vr,
    verificationVerdict: obs.verdict, objectiveVerified: obs.objectiveVerified, stallReason: obs.stallReason, lastUrl: obs.lastUrl,
    screenshots: shots,
    reportUrl: vr ? `/autosims/walk/${encodeURIComponent(vr)}` : null,
    pdfUrl: vr ? `/api/trails/walks/${encodeURIComponent(vr)}/report.pdf` : null,
  }, d)
}

async function replayItem(projectId: string, runId: string, item: RunItem, tc: TestCase, trailId: string, actor: string | null, d: RunnerDeps) {
  await setItem(projectId, item.id, { mode: "replay", trail_id: trailId })
  const started = await acquire(projectId, runId, () => d.runWalk(projectId, trailId), d)
  if (started === "cancelled") return finish(projectId, item, { status: "cancelled", observed: "", reason: "Run cancelled while waiting for another AutoSim to finish." }, null, d)
  if (started === "timeout") return finish(projectId, item, { status: "error", observed: "", reason: "Another AutoSim kept the runner busy for too long." }, null, d)
  const wid = started.runId
  await setItem(projectId, item.id, { walk_run_id: wid })
  const until = d.now() + WALK_MAX_MS
  let walk: any = null, cancelAsked = false, timedOut = false, cancelAt = 0
  for (;;) {
    walk = await d.getWalk(projectId, wid)
    if (walk && walk.status !== "running" && walk.status !== "paused") break
    if (!cancelAsked && await cancelled(projectId, runId)) {
      cancelAsked = true; cancelAt = d.now()
      if (!d.cancelWalk(wid)) break   // not running in this process → nothing to wait for
    }
    if (cancelAsked && d.now() - cancelAt > CANCEL_GRACE_MS) break
    if (d.now() > until) { timedOut = true; d.cancelWalk(wid); break }
    await d.sleep(SESSION_POLL_MS)
  }
  const rsteps = await d.listRunSteps(projectId, wid).catch(() => [])
  const failedSteps = rsteps.filter((x: any) => x.verdict === "red").map((x: any) => ({ idx: x.idx, diagnosis: x.diagnosis ?? null }))
  const st = s(walk?.status)
  const obs: Observation = {
    mode: "replay",
    outcome: timedOut ? "timeout" : cancelAsked ? "cancelled" : !walk ? "error" : st === "skipped" ? "error" : "completed",
    objectiveVerified: null,
    verdict: st === "green" || st === "amber" || st === "red" ? st : null,
    stallReason: failedSteps.length ? `Step ${failedSteps[0].idx + 1} failed${failedSteps[0].diagnosis ? ` (${failedSteps[0].diagnosis})` : ""}.` : (st === "skipped" ? "The run was skipped." : null),
    lastUrl: null, pageText: "",
    stepNotes: rsteps.map((x: any) => `${x.idx + 1}. ${x.verdict}${x.healed ? " (fixed automatically)" : ""}${x.diagnosis ? ` — ${x.diagnosis}` : ""}`),
  }
  const v = await d.judge({ testCase: tc, observation: obs, projectId, actorEmail: actor })
  return finish(projectId, item, v, {
    mode: "replay", trailId, walkRunId: wid, verdict: obs.verdict, failedSteps, steps: rsteps.length,
    reportUrl: `/autosims/walk/${encodeURIComponent(wid)}`, pdfUrl: `/api/trails/walks/${encodeURIComponent(wid)}/report.pdf`,
  }, d)
}

function stepNote(x: any): string {
  const target = x?.selector ? ` ${String(x.selector).slice(0, 80)}` : ""
  return `${Number(x?.idx) + 1}. ${s(x?.op)}${target} — ${s(x?.rationale).slice(0, 200)}${x?.ok === false ? ` (FAILED: ${s(x?.error).slice(0, 120)})` : ""}`
}
/** Text of the last page the AutoSim saw (from the newest step that captured a snapshot). */
function lastPageText(steps: any[]): string {
  for (let i = steps.length - 1; i >= 0; i--) {
    const k = steps[i]?.krefSnapshot
    if (typeof k === "string" && k.trim()) return k.replace(/\[k\d+\]/g, "").replace(/[ \t]+/g, " ").slice(0, 8000)
  }
  return ""
}

/** On boot: continue runs that were in flight when the server stopped (their running item restarts). */
export async function resumeRequirementRuns(): Promise<number> {
  const r = await db!.execute({ sql: `SELECT id, project_id, status FROM autosim_requirement_runs WHERE status IN ('queued','running','cancelling')`, args: [] })
  for (const row of r.rows as any[]) {
    await db!.execute({ sql: `UPDATE autosim_requirement_run_items SET status='queued', started_at=NULL WHERE project_id=? AND run_id=? AND status='running'`, args: [s(row.project_id), s(row.id)] })
    kickRun(s(row.project_id), s(row.id))
  }
  return r.rows.length
}
