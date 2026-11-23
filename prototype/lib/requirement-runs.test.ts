// F-01: requirements storage (DEV-02), the run queue (DEV-04) and validation (DEV-05) — hermetic DB,
// fake AutoSim engine (no browser, no LLM).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-reqruns-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.alloc(32, 7).toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
let db: any
beforeAll(async () => { db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const asp = await import("./autosim-projects")
const store = await import("./requirements-store")
const runs = await import("./requirement-runs")
const { normalizeExtract } = await import("./requirements-extract")

const P = "proj_req"
const extraction = () => normalizeExtract({
  documentTitle: "Spec", startUrl: "https://app.test/login",
  requirements: [
    { ref: "R1", title: "Login", description: "Users log in", section: "3.1", quote: "shall log in", expectedResult: "Dashboard shown" },
    { ref: "R2", title: "Logout", description: "Users log out", section: "3.2", expectedResult: "Login page shown" },
    { ref: "R3", title: "Unclear", description: "Fast", ambiguous: true, clarification: "How fast?" },
  ],
  scenarios: [
    { title: "Valid login", requirementRefs: ["R1"], preconditions: "Account exists", steps: "1. Open login\n2. Sign in", expectedResult: "Dashboard shown" },
    { title: "Logout", requirementRefs: ["R2"], steps: "1. Click avatar\n2. Log out", expectedResult: "Login page shown" },
  ],
}, "spec.pdf")

async function setup() {
  const ap = await asp.createAutosimProject(P, { name: "Site " + Math.random() })
  const saved = await store.saveExtraction(P, ap, { filename: "spec.pdf", contentType: "application/pdf", sizeBytes: 10, sourceKey: null, result: extraction(), createdBy: "qa@x.test" })
  const out = await store.createTestCasesFromScenarios(P, ap, saved.docId, ["TS-001", "TS-002"].map((ref, i) => ({
    scenarioId: saved.scenarioIds[ref], name: ["Valid login", "Logout"][i], steps: "1. Do it\n2. Check it",
    preconditions: i ? "" : "Account exists", expectedResult: ["Dashboard shown", "Login page shown"][i], startUrl: "https://app.test/login",
  })), { testAccountId: null, groupId: null, status: "active" }, "qa@x.test")
  return { ap, saved, tcIds: out.created.map(c => c.testCaseId), out }
}

// Fake engine: records "crystallize" with objectiveVerified; replays go green.
function fakeDeps(over: Partial<import("./requirement-runs").RunnerDeps> = {}) {
  const calls: any = { author: [] as any[], walk: [] as string[], busyLeft: 1 }
  const sessions = new Map<string, any>()
  let clock = 1_000_000
  const deps: Partial<import("./requirement-runs").RunnerDeps> = {
    getTestCase: asp.getTestCase, currentTrailId: asp.currentTrailId,
    requirementFor: async (pid, tc) => { const q = await store.requirementForTestCase(pid, tc); return q ? { ref: q.ref, title: q.title } : null },
    testAccountName: async () => "admin",
    preflightRecord: async () => null,
    runAuthor: async (_pid, req) => {
      if (calls.busyLeft-- > 0) { const e = new Error("busy"); e.name = "AuthorBusyError"; throw e }   // one busy slot, waited out
      calls.author.push(req)
      const id = "auth_" + calls.author.length
      sessions.set(id, { polls: 0, req })
      return { sessionId: id }
    },
    getAuthorSession: async (_pid, id) => {
      const s = sessions.get(id); s.polls++
      if (s.polls < 2) return { status: "running", steps: [] }
      return { status: "crystallized", objectiveVerified: true, verificationVerdict: "green", verificationRunId: "walk_v_" + id, trailId: "trl_" + id, stallReason: null,
        steps: [{ idx: 0, op: "navigate", url: "https://app.test/login", rationale: "open", ok: true }, { idx: 1, op: "assert", url: "https://app.test/home", rationale: "dashboard visible", ok: true, screenshotKey: "k1", krefSnapshot: "[k1] Dashboard  Welcome back" }] }
    },
    cancelAuthor: () => true,
    runWalk: async (_pid, trailId) => { calls.walk.push(trailId); return { runId: "walk_" + trailId } },
    getWalk: async () => ({ status: "green" }),
    listRunSteps: async () => [{ idx: 0, verdict: "green" }],
    cancelWalk: () => true,
    judge: async (i) => runs.baselineValidation(i.observation),
    sleep: async (ms) => { clock += ms },
    now: () => clock,
    ...over,
  }
  return { deps, calls }
}

test("DEV-02: extraction is stored with REQ ids, source refs and scenario→requirement→test case links", async () => {
  const { ap, saved, tcIds, out } = await setup()
  expect(out.failed).toEqual([])
  expect(Object.keys(saved.requirementIds)).toEqual(["REQ-001", "REQ-002", "REQ-003"])
  const d = await store.docDetail(P, ap, saved.docId)
  expect(d!.doc).toMatchObject({ filename: "spec.pdf", title: "Spec", startUrl: "https://app.test/login" })
  expect(d!.requirements.map(r => [r.ref, r.section, r.status])).toEqual([["REQ-001", "3.1", "not_run"], ["REQ-002", "3.2", "not_run"], ["REQ-003", "", "no_tests"]])
  expect(d!.requirements[0].quote).toBe("shall log in")
  expect(d!.requirements[2]).toMatchObject({ ambiguous: true, clarification: "How fast?" })
  expect(d!.requirements[0].testCases.map(t => t.id)).toEqual([tcIds[0]])
  expect(d!.scenarios[0]).toMatchObject({ ref: "TS-001", testCaseId: tcIds[0], requirementIds: [saved.requirementIds["REQ-001"]] })
  // DEV-03 on the test case itself
  const tc = await asp.getTestCase(P, tcIds[0])
  expect(tc).toMatchObject({ preconditions: "Account exists", expectedResult: "Dashboard shown", requirementId: saved.requirementIds["REQ-001"] })
  // A scenario can only become one test case.
  const again = await store.createTestCasesFromScenarios(P, ap, saved.docId, [{ scenarioId: saved.scenarioIds["TS-001"], name: "x", steps: "", preconditions: "", expectedResult: "", startUrl: "https://a.test" }], { testAccountId: null, groupId: null, status: "active" }, "qa@x.test")
  expect(again.failed[0].error).toContain("already created")
  // Tenant isolation: another Klavity project can't read it.
  expect(await store.docDetail("proj_other", ap, saved.docId)).toBeNull()
})

test("DEV-04: buildObjective hands steps + preconditions + expected result + requirement to the AutoSim", () => {
  const o = runs.buildObjective({ description: "1. Open\n2. Sign in", preconditions: "Account exists", expectedResult: "Dashboard shown" }, { ref: "REQ-001", title: "Login" })
  expect(o).toContain("1. Open\n2. Sign in")
  expect(o).toContain("Preconditions (make sure these hold before you start): Account exists")
  expect(o).toContain("Expected result (before finishing, confirm this is actually shown/true in the application): Dashboard shown")
  expect(o).toContain("This checks requirement REQ-001: Login")
  expect(runs.buildObjective({ description: "Just steps here", preconditions: "", expectedResult: "" })).toBe("Just steps here")
})

test("DEV-04/05: queue records each test case one after another (waiting out a busy slot) and validates", async () => {
  const { ap, saved, tcIds } = await setup()
  const runId = await runs.createRun(P, ap, tcIds, { docId: saved.docId, createdBy: "qa@x.test" })
  await expect(runs.createRun(P, ap, tcIds, { createdBy: "x" })).rejects.toThrow("already in progress")
  const { deps, calls } = fakeDeps()
  await runs.kickRun(P, runId, deps)
  const run = await runs.getRun(P, ap, runId)
  expect(run!.status).toBe("done")
  expect(run!.items!.map(i => [i.testCaseName, i.status, i.mode])).toEqual([["Valid login", "passed", "record"], ["Logout", "passed", "record"]])
  expect(calls.author.length).toBe(2)                                  // busy once, then both recorded in order
  expect(calls.author[0].objective).toContain("Expected result (before finishing")
  expect(calls.author[0].objective).toContain("REQ-001")
  expect(calls.author[0]).toMatchObject({ baseUrl: "https://app.test/login", testCaseId: tcIds[0] })
  const ev = run!.items![0].evidence
  expect(ev).toMatchObject({ mode: "record", verificationRunId: "walk_v_auth_1", objectiveVerified: true, reportUrl: "/autosims/walk/walk_v_auth_1" })
  expect(ev.screenshots).toEqual([{ idx: 1, url: "/api/trails/author/auth_1/steps/1/screenshot" }])
  expect(run!.items![0].expectedResult).toBe("Dashboard shown")
  // Per-requirement roll-up now reflects the results.
  const d = await store.docDetail(P, ap, saved.docId)
  expect(d!.requirements.map(r => r.status)).toEqual(["passed", "passed", "no_tests"])
  expect((await runs.testCaseValidations(P, tcIds[0]))[0].status).toBe("passed")
})

test("DEV-04: a test case that already has an AutoSim is replayed; a red replay fails with the failing step", async () => {
  const { ap, tcIds } = await setup()
  await db.execute({ sql: "INSERT INTO trails (id,project_id,name,base_url,status,test_case_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)", args: ["trl_existing_" + ap, P, "x", "https://app.test", "active", tcIds[0], 1, 1] })
  const runId = await runs.createRun(P, ap, [tcIds[0]], { createdBy: null })
  const { deps, calls } = fakeDeps({ getWalk: async () => ({ status: "red" }), listRunSteps: async () => [{ idx: 0, verdict: "green" }, { idx: 1, verdict: "red", diagnosis: "selector-drift" }] })
  await runs.kickRun(P, runId, deps)
  const it = (await runs.getRun(P, ap, runId))!.items![0]
  expect(calls.author.length).toBe(0)
  expect(calls.walk).toEqual(["trl_existing_" + ap])
  expect(it).toMatchObject({ mode: "replay", status: "failed" })
  expect(it.reason).toBe("Step 2 failed (selector-drift).")
  expect(it.evidence.failedSteps).toEqual([{ idx: 1, diagnosis: "selector-drift" }])
})

test("blocked / error outcomes and cancelling a run", async () => {
  const { ap, tcIds } = await setup()
  // needs_auth → blocked; plan gate → blocked
  let runId = await runs.createRun(P, ap, tcIds, { createdBy: null })
  let n = 0
  const { deps } = fakeDeps({
    preflightRecord: async () => (n++ === 1 ? "AutoSim limit reached" : null),
    getAuthorSession: async () => ({ status: "needs_auth", steps: [{ idx: 0, url: "https://app.test/login", op: "navigate", rationale: "", ok: true }] }),
  })
  await runs.kickRun(P, runId, deps)
  let items = (await runs.getRun(P, ap, runId))!.items!
  expect(items.map(i => [i.status, i.reason])).toEqual([["blocked", "The AutoSim needs login credentials for this test case."], ["blocked", "AutoSim limit reached"]])

  // cancel before it starts → everything cancelled
  runId = await runs.createRun(P, ap, tcIds, { createdBy: null })
  expect(await runs.cancelRun(P, ap, runId)).toBe(true)
  await runs.kickRun(P, runId, fakeDeps().deps)
  const run = await runs.getRun(P, ap, runId)
  expect(run!.status).toBe("cancelled")
  expect(run!.items!.every(i => i.status === "cancelled")).toBe(true)
  expect(await runs.cancelRun(P, ap, runId)).toBe(false)
})

test("resume after restart: an interrupted 'running' item is re-queued and the run completes", async () => {
  const { ap, tcIds } = await setup()
  const runId = await runs.createRun(P, ap, [tcIds[0]], { createdBy: null })
  await db.execute({ sql: "UPDATE autosim_requirement_runs SET status='running' WHERE id=?", args: [runId] })
  await db.execute({ sql: "UPDATE autosim_requirement_run_items SET status='running' WHERE run_id=?", args: [runId] })
  await db.execute({ sql: "UPDATE autosim_requirement_run_items SET status='queued', started_at=NULL WHERE project_id=? AND run_id=? AND status='running'", args: [P, runId] })
  await runs.kickRun(P, runId, fakeDeps().deps)
  expect((await runs.getRun(P, ap, runId))!.items![0].status).toBe("passed")
})

test("rollupRequirementStatus", () => {
  const v = (status: any) => ({ status } as any)
  expect(store.rollupRequirementStatus([])).toBe("no_tests")
  expect(store.rollupRequirementStatus([null, null])).toBe("not_run")
  expect(store.rollupRequirementStatus([v("passed"), v("passed")])).toBe("passed")
  expect(store.rollupRequirementStatus([v("passed"), v("failed")])).toBe("failed")
  expect(store.rollupRequirementStatus([v("passed"), null])).toBe("partial")
  expect(store.rollupRequirementStatus([v("blocked"), null])).toBe("blocked")
})

test("DEV-05: LLM judge compares expected vs observed; falls back to the AutoSim's own signals", async () => {
  const tc = { name: "Login", description: "1. Sign in", preconditions: "", expectedResult: "Dashboard shown" }
  const obs: any = { mode: "record", outcome: "completed", objectiveVerified: true, verdict: "green", stallReason: null, lastUrl: "https://app.test/home", pageText: "Error: invalid password", stepNotes: ["1. click Sign in — submit"] }
  const saved = process.env.OPENROUTER_API_KEY
  process.env.OPENROUTER_API_KEY = "k"
  let sent: any
  const fetchImpl = (async (_u: any, init: any) => { sent = JSON.parse(init.body); return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ verdict: "failed", observed: "An invalid password error is shown.", reason: "Dashboard never appeared." }) } }] })) }) as any
  const v = await runs.judgeAgainstExpected({ testCase: tc, observation: obs, projectId: P, actorEmail: null, fetchImpl })
  expect(v).toEqual({ status: "failed", observed: "An invalid password error is shown.", reason: "Dashboard never appeared." })
  expect(sent.messages[1].content).toContain("EXPECTED RESULT: Dashboard shown")
  expect(sent.messages[1].content).toContain("Error: invalid password")
  // Bad model output → baseline
  const bad = (async () => new Response(JSON.stringify({ choices: [{ message: { content: "{\"verdict\":\"maybe\"}" } }] }))) as any
  expect((await runs.judgeAgainstExpected({ testCase: tc, observation: obs, projectId: P, actorEmail: null, fetchImpl: bad })).status).toBe("passed")
  // Replays / needs_auth never call the model
  let called = false
  const spy = (async () => { called = true; return new Response("{}") }) as any
  expect((await runs.judgeAgainstExpected({ testCase: tc, observation: { ...obs, outcome: "needs_auth" }, projectId: P, actorEmail: null, fetchImpl: spy })).status).toBe("blocked")
  expect((await runs.judgeAgainstExpected({ testCase: tc, observation: { ...obs, mode: "replay", verdict: "red" }, projectId: P, actorEmail: null, fetchImpl: spy })).status).toBe("failed")
  expect(called).toBe(false)
  if (saved === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = saved
})

test("deleting a test case unlinks its scenario; deleting the document keeps test cases", async () => {
  const { ap, saved, tcIds } = await setup()
  await asp.deleteTestCase(P, ap, tcIds[0])
  let d = await store.docDetail(P, ap, saved.docId)
  expect(d!.scenarios[0].testCaseId).toBeNull()
  expect(await store.deleteDoc(P, ap, saved.docId)).toBe(true)
  expect(await store.getDoc(P, ap, saved.docId)).toBeNull()
  expect((await asp.getTestCase(P, tcIds[1]))!.requirementId).toBeNull()
})

test("Stop during a recording: an orphaned drive is not waited on; a live one gets a short grace, then the run stops", async () => {
  for (const live of [false, true]) {
    const { ap, tcIds } = await setup()
    const runId = await runs.createRun(P, ap, tcIds, { createdBy: null })
    let polls = 0, cancelCalls = 0
    const { deps } = fakeDeps({
      runAuthor: async () => ({ sessionId: "auth_forever_" + live }),
      getAuthorSession: async () => {
        if (++polls === 2) await db.execute({ sql: "UPDATE autosim_requirement_runs SET status='cancelling' WHERE id=?", args: [runId] })
        return { status: "running", steps: [] }                      // the drive never ends on its own
      },
      cancelAuthor: () => { cancelCalls++; return live },              // live = this process owns the drive
    })
    await runs.kickRun(P, runId, deps)
    const run = (await runs.getRun(P, ap, runId))!
    expect(run.status).toBe("cancelled")
    expect(run.items!.map(i => i.status)).toEqual(["cancelled", "cancelled"])
    expect(cancelCalls).toBe(1)
    // orphaned → stops right after the cancel is seen; live → only after the ~30s grace (fake clock)
    expect(polls).toBe(live ? 13 : 2)
  }
})
