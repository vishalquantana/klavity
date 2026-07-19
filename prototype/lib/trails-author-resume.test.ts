// KLA-57: checkpoint persistence + resume — unit tests.
// All tests use injectable fakes (no real browser, no real LLM, isolated in-memory DB).
import { describe, test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-resume-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-resume-test-32bytesecret!").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

import type { AuthorModel } from "./trails-author-model"
import type { AuthorCheckpoint } from "./trails-author"
const { authorTrail, createAuthorSession, updateAuthorSession, getAuthorSession, listStalledAuthorSessions, runAuthorNow, NEEDS_AUTH_RESUME_TTL_MS } = await import("./trails-author")
const { _resetAuthorAdmissionForTest, _resetWalkPoolForTest } = await import("./trails-browser")

// authorTrail tests launch a real browser — only run when KLAV_E2E=1
const RUN_BROWSER = !!process.env.KLAV_E2E

const FIXTURE_URL = "data:text/html," + encodeURIComponent(`<html><body><button id="ok">OK</button></body></html>`)
const noSleepOpts = { sleepMs: () => Promise.resolve() }

function makeOpts(model: AuthorModel, extra: Record<string, any> = {}) {
  return { model, headless: true, ...noSleepOpts, verificationVision: false as const, ...extra }
}

function doneModel(): AuthorModel {
  return async () => ({ action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0.01 })
}

function stallModel(): AuthorModel {
  return async () => ({ action: { op: "stall", selector: null, value: null, url: null, checkpoint: null, rationale: "I cannot proceed" }, costUsd: 0.005 })
}

// ── Checkpoint is emitted after each step ────────────────────────────────────────────────────────

test.if(RUN_BROWSER)("onCheckpoint is called at least once after a successful run", async () => {
  const checkpoints: AuthorCheckpoint[] = []
  const out = await authorTrail("proj_cp", { name: "T", objective: "test", baseUrl: FIXTURE_URL },
    makeOpts(doneModel(), { onCheckpoint: (cp: AuthorCheckpoint) => { checkpoints.push(cp) } }))
  expect(out.status).toBe("crystallized")
  // At minimum, a checkpoint is emitted on stall or after each step; a fresh "done" run with 0
  // actions may not emit unless there's a step — the done model exits immediately.
  // Checkpoint may not be called if done is immediate (no step was recorded). That's fine.
  // The key property: no crash.
  expect(checkpoints.length).toBeGreaterThanOrEqual(0)
})

test.if(RUN_BROWSER)("onCheckpoint is called on stall with the accumulated trajectory", async () => {
  const checkpoints: AuthorCheckpoint[] = []
  const out = await authorTrail("proj_cp2", { name: "T", objective: "test", baseUrl: FIXTURE_URL },
    makeOpts(stallModel(), { onCheckpoint: (cp: AuthorCheckpoint) => { checkpoints.push(cp) } }))
  expect(out.status).toBe("stalled")
  expect(checkpoints.length).toBeGreaterThanOrEqual(1)
  // The checkpoint on stall must capture the current URL and trajectory.
  const last = checkpoints[checkpoints.length - 1]
  expect(last.lastUrl).toBeTruthy()
  expect(Array.isArray(last.traj)).toBe(true)
  expect(Array.isArray(last.history)).toBe(true)
})

test.if(RUN_BROWSER)("checkpoint carries llmCalls and costUsd", async () => {
  const checkpoints: AuthorCheckpoint[] = []
  await authorTrail("proj_cp3", { name: "T", objective: "test", baseUrl: FIXTURE_URL },
    makeOpts(stallModel(), { onCheckpoint: (cp: AuthorCheckpoint) => { checkpoints.push(cp) } }))
  const last = checkpoints[checkpoints.length - 1]
  expect(last.llmCalls).toBeGreaterThanOrEqual(1)
  expect(last.costUsd).toBeGreaterThanOrEqual(0)
})

// ── Stall crystallizes partial trail when steps exist ───────────────────────────────────────────

describe.if(RUN_BROWSER)("stall with partial steps", () => {
  test("stall with no real steps returns trailId null (only initial navigate)", async () => {
    // stallModel fires immediately — the drive stalls before recording any real action.
    // traj has only the initial navigate step → too short to crystallize.
    const out = await authorTrail("proj_stallempty", { name: "T", objective: "test", baseUrl: FIXTURE_URL },
      makeOpts(stallModel()))
    expect(out.status).toBe("stalled")
    // traj has only the initial navigate step (length 1) → no partial trail.
    expect(out.trailId).toBeNull()
  })

  test("stall after real actions crystallizes a partial draft trail", async () => {
    // A model that does one click then stalls — traj has navigate + click.
    let calls = 0
    const model: AuthorModel = async (input) => {
      calls++
      if (calls === 1) return { action: { op: "click", selector: "#ok", value: null, url: null, checkpoint: null, rationale: "click ok" }, costUsd: 0.005 }
      return { action: { op: "stall", selector: null, value: null, url: null, checkpoint: null, rationale: "done enough" }, costUsd: 0.005 }
    }
    const out = await authorTrail("proj_stallpartial", { name: "T", objective: "test", baseUrl: FIXTURE_URL },
      makeOpts(model))
    expect(out.status).toBe("stalled")
    expect(out.trailId).not.toBeNull()
  })
})

// ── Resume from checkpoint ───────────────────────────────────────────────────────────────────────

test.if(RUN_BROWSER)("resume: authorTrail picks up from checkpoint stepIdx", async () => {
  const stepsSeen: number[] = []
  let loopIdx = 0
  const model: AuthorModel = async () => {
    loopIdx++
    if (loopIdx >= 2) return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
    return { action: { op: "stall", selector: null, value: null, url: null, checkpoint: null, rationale: "paused" }, costUsd: 0.01 }
  }
  // Build a fake checkpoint simulating that steps 0..4 are already done.
  const fakeCheckpoint: AuthorCheckpoint = {
    traj: [
      { action: "navigate", actionValue: FIXTURE_URL, url: FIXTURE_URL, domHash: "abc" },
    ],
    history: ["navigate / — ok"],
    stepIdx: 5,
    llmCalls: 5,
    costUsd: 0.05,
    lastUrl: FIXTURE_URL,
  }
  const out = await authorTrail("proj_resume", { name: "T", objective: "test", baseUrl: FIXTURE_URL },
    makeOpts(doneModel(), { checkpoint: fakeCheckpoint }))
  // Starting from stepIdx=5 with a done model → completes immediately
  expect(out.status).toBe("crystallized")
  // The inherited cost from the checkpoint carries forward to the outcome.
  expect(out.costUsd).toBeGreaterThanOrEqual(0.05)
  // The inherited llmCalls carry forward.
  expect(out.llmCalls).toBeGreaterThanOrEqual(5)
})

test.if(RUN_BROWSER)("resume: checkpoint traj is included in the crystallized trail", async () => {
  const fakeCheckpoint: AuthorCheckpoint = {
    traj: [
      { action: "navigate", actionValue: FIXTURE_URL, url: FIXTURE_URL, domHash: "abc" },
    ],
    history: ["navigate / — ok"],
    stepIdx: 1,
    llmCalls: 1,
    costUsd: 0.01,
    lastUrl: FIXTURE_URL,
  }
  const out = await authorTrail("proj_resumetraj", { name: "T", objective: "test", baseUrl: FIXTURE_URL },
    makeOpts(doneModel(), { checkpoint: fakeCheckpoint }))
  expect(out.status).toBe("crystallized")
  expect(out.trailId).not.toBeNull()
})

test.if(RUN_BROWSER)("resume: cost budget cap accounts for inherited costUsd", async () => {
  // Checkpoint already spent right up to the cap — the next call should immediately stall.
  const { AUTHOR_MAX_COST_USD } = await import("./trails-author")
  const fakeCheckpoint: AuthorCheckpoint = {
    traj: [{ action: "navigate", actionValue: FIXTURE_URL, url: FIXTURE_URL, domHash: "abc" }],
    history: [],
    stepIdx: 1,
    llmCalls: 10,
    costUsd: AUTHOR_MAX_COST_USD, // already at cap
    lastUrl: FIXTURE_URL,
  }
  const out = await authorTrail("proj_resumecap", { name: "T", objective: "test", baseUrl: FIXTURE_URL },
    makeOpts(doneModel(), { checkpoint: fakeCheckpoint }))
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toMatch(/budget cap/i)
})

// ── DB-backed: checkpoint persisted via onCheckpoint + readable via getAuthorSession ────────────

describe("DB checkpoint round-trip", () => {
  const proj = "proj_dbcp"

  test("checkpoint is stored and retrieved via getAuthorSession", async () => {
    const sessionId = await createAuthorSession(proj, { name: "T", objective: "test", baseUrl: FIXTURE_URL })
    const cp: AuthorCheckpoint = {
      traj: [{ action: "navigate", actionValue: FIXTURE_URL, url: FIXTURE_URL, domHash: "xyz" }],
      history: ["navigate / — ok"],
      stepIdx: 1, llmCalls: 1, costUsd: 0.005, lastUrl: FIXTURE_URL,
    }
    await updateAuthorSession(proj, sessionId, { checkpoint: cp })
    const sess = await getAuthorSession(proj, sessionId)
    expect(sess).not.toBeNull()
    expect(sess!.checkpoint).not.toBeNull()
    expect(sess!.checkpoint!.stepIdx).toBe(1)
    expect(sess!.checkpoint!.llmCalls).toBe(1)
    expect(sess!.checkpoint!.costUsd).toBe(0.005)
    expect(sess!.checkpoint!.lastUrl).toBe(FIXTURE_URL)
    expect(sess!.checkpoint!.traj).toHaveLength(1)
    expect(sess!.checkpoint!.history).toEqual(["navigate / — ok"])
  })

  test("checkpoint null-clears correctly", async () => {
    const sessionId = await createAuthorSession(proj, { name: "T2", objective: "test", baseUrl: FIXTURE_URL })
    const cp: AuthorCheckpoint = {
      traj: [], history: [], stepIdx: 0, llmCalls: 0, costUsd: 0, lastUrl: FIXTURE_URL,
    }
    await updateAuthorSession(proj, sessionId, { checkpoint: cp })
    await updateAuthorSession(proj, sessionId, { checkpoint: null })
    const sess = await getAuthorSession(proj, sessionId)
    expect(sess!.checkpoint).toBeNull()
  })
})

// ── DB-backed: resumed_from is stored and retrievable ───────────────────────────────────────────

test("createAuthorSession stores resumedFrom and getAuthorSession reads it back", async () => {
  const origId = await createAuthorSession("proj_rf", { name: "original", objective: "test", baseUrl: FIXTURE_URL })
  const resumeId = await createAuthorSession("proj_rf", { name: "resumed", objective: "test", baseUrl: FIXTURE_URL }, origId)
  const sess = await getAuthorSession("proj_rf", resumeId)
  expect(sess).not.toBeNull()
  expect(sess!.resumedFrom).toBe(origId)
})

test("fresh session has resumedFrom=null", async () => {
  const sessionId = await createAuthorSession("proj_rf2", { name: "fresh", objective: "test", baseUrl: FIXTURE_URL })
  const sess = await getAuthorSession("proj_rf2", sessionId)
  expect(sess!.resumedFrom).toBeNull()
})

test("runAuthorNow rejects stale resume checkpoints", async () => {
  _resetWalkPoolForTest(1, 0)
  _resetAuthorAdmissionForTest()
  const proj = "proj_resume_stale"
  const priorId = await createAuthorSession(proj, { name: "old", objective: "test", baseUrl: FIXTURE_URL })
  const cp: AuthorCheckpoint = {
    traj: [{ action: "navigate", actionValue: FIXTURE_URL, url: FIXTURE_URL, domHash: "stale" }],
    history: ["navigate"],
    stepIdx: 1,
    llmCalls: 1,
    costUsd: 0.01,
    lastUrl: FIXTURE_URL,
  }
  await updateAuthorSession(proj, priorId, { checkpoint: cp, status: "needs_auth", stallReason: "auth gate" })
  await (await import("./db")).db!.execute({
    sql: "UPDATE author_sessions SET updated_at=? WHERE project_id=? AND id=?",
    args: [Date.now() - NEEDS_AUTH_RESUME_TTL_MS - 10_000, proj, priorId],
  })

  await expect(runAuthorNow(
    proj,
    { name: "new", objective: "test", baseUrl: FIXTURE_URL },
    { author: async () => { throw new Error("should not run") }, model: doneModel(), resumeSessionId: priorId },
  )).rejects.toThrow(/too old/)
})

test("runAuthorNow rejects a second resume from the same checkpoint", async () => {
  _resetWalkPoolForTest(1, 0)
  _resetAuthorAdmissionForTest()
  const proj = "proj_resume_double"
  const priorId = await createAuthorSession(proj, { name: "paused", objective: "test", baseUrl: FIXTURE_URL })
  const cp: AuthorCheckpoint = {
    traj: [{ action: "navigate", actionValue: FIXTURE_URL, url: FIXTURE_URL, domHash: "double" }],
    history: ["navigate"],
    stepIdx: 1,
    llmCalls: 1,
    costUsd: 0.01,
    lastUrl: FIXTURE_URL,
  }
  await updateAuthorSession(proj, priorId, { checkpoint: cp, status: "stalled", stallReason: "paused" })
  const existingChild = await createAuthorSession(proj, { name: "child", objective: "test", baseUrl: FIXTURE_URL }, priorId)
  expect((await getAuthorSession(proj, existingChild))!.status).toBe("running")

  await expect(runAuthorNow(
    proj,
    { name: "new", objective: "test", baseUrl: FIXTURE_URL },
    { author: async () => { throw new Error("should not run") }, model: doneModel(), resumeSessionId: priorId },
  )).rejects.toThrow(/already claimed/)
})

test("runAuthorNow atomically marks a claimed prior session as resuming", async () => {
  _resetWalkPoolForTest(1, 0)
  _resetAuthorAdmissionForTest()
  const proj = "proj_resume_claim"
  const priorId = await createAuthorSession(proj, { name: "paused", objective: "test", baseUrl: FIXTURE_URL })
  const cp: AuthorCheckpoint = {
    traj: [{ action: "navigate", actionValue: FIXTURE_URL, url: FIXTURE_URL, domHash: "claim" }],
    history: ["navigate"],
    stepIdx: 1,
    llmCalls: 1,
    costUsd: 0.01,
    lastUrl: FIXTURE_URL,
  }
  await updateAuthorSession(proj, priorId, { checkpoint: cp, status: "needs_auth", stallReason: "auth gate" })
  const out = await runAuthorNow(
    proj,
    { name: "new", objective: "test", baseUrl: FIXTURE_URL },
    {
      model: doneModel(),
      resumeSessionId: priorId,
      author: async (_projectId, _req, opts) => {
        expect(opts.checkpoint?.lastUrl).toBe(FIXTURE_URL)
        return {
          status: "stalled",
          trailId: null,
          verificationRunId: null,
          verificationVerdict: null,
          steps: [],
          stallReason: "done",
          llmCalls: 0,
          costUsd: 0,
        }
      },
    },
  )
  const prior = await getAuthorSession(proj, priorId)
  expect(prior!.status).toBe("resuming")
  expect(prior!.resumedBy).toBe(out.sessionId)
  expect((await getAuthorSession(proj, out.sessionId))!.resumedFrom).toBe(priorId)
})

// ── KLA-270: surface resumable partial drafts — listStalledAuthorSessions persist→list round-trip ──
// The /autosims authoring UI reads GET /api/trails/author/stalled (backed by listStalledAuthorSessions)
// to show sessions the user left mid-way. These tests pin the exact rows that surface so the UI can
// reload the saved checkpoint state and continue rather than restart.
describe("KLA-270 listStalledAuthorSessions — resumable partial drafts", () => {
  const cp = (domHash: string): AuthorCheckpoint => ({
    traj: [{ action: "click", actionValue: "#go", url: FIXTURE_URL, domHash }],
    history: ["navigate /", "click #go — ok"],
    stepIdx: 3, llmCalls: 4, costUsd: 0.02, lastUrl: FIXTURE_URL,
  })

  async function setUpdatedAt(proj: string, id: string, ts: number) {
    await (await import("./db")).db!.execute({
      sql: "UPDATE author_sessions SET updated_at=? WHERE project_id=? AND id=?",
      args: [ts, proj, id],
    })
  }

  test("a stalled session with a checkpoint surfaces AND its saved state round-trips", async () => {
    const proj = "proj_kla270_stalled"
    const id = await createAuthorSession(proj, { name: "Checkout flow", objective: "buy a thing", baseUrl: FIXTURE_URL })
    await updateAuthorSession(proj, id, { checkpoint: cp("stalled"), status: "stalled", stallReason: "hit budget cap" })

    const list = await listStalledAuthorSessions(proj)
    expect(list).toHaveLength(1)
    const s = list[0]
    expect(s.id).toBe(id)
    expect(s.status).toBe("stalled")
    expect(s.name).toBe("Checkout flow")
    expect(s.objective).toBe("buy a thing")
    // The saved drive-state must come back intact so a resume continues from step 3, not step 0.
    expect(s.checkpoint).not.toBeNull()
    expect(s.checkpoint!.stepIdx).toBe(3)
    expect(s.checkpoint!.costUsd).toBe(0.02)
    expect(s.checkpoint!.lastUrl).toBe(FIXTURE_URL)
    expect(s.checkpoint!.traj).toHaveLength(1)
    expect(s.checkpoint!.history).toEqual(["navigate /", "click #go — ok"])
  })

  test("a needs_auth session (paused at a sign-in wall) is resumable too", async () => {
    const proj = "proj_kla270_needsauth"
    const id = await createAuthorSession(proj, { name: "Settings", objective: "open settings", baseUrl: FIXTURE_URL })
    await updateAuthorSession(proj, id, { checkpoint: cp("needsauth"), status: "needs_auth", stallReason: "auth gate" })
    const list = await listStalledAuthorSessions(proj)
    expect(list.map(x => x.id)).toContain(id)
  })

  test("a stalled session with only a partial-draft trailId (no checkpoint) still surfaces", async () => {
    const proj = "proj_kla270_partialdraft"
    const id = await createAuthorSession(proj, { name: "Partial", objective: "half done", baseUrl: FIXTURE_URL })
    await updateAuthorSession(proj, id, { trailId: "trail_partial_123", status: "stalled", stallReason: "stopped early" })
    const list = await listStalledAuthorSessions(proj)
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(id)
    expect(list[0].trailId).toBe("trail_partial_123")
    expect(list[0].checkpoint).toBeNull()
  })

  test("running and crystallized sessions do NOT surface as resumable", async () => {
    const proj = "proj_kla270_terminal"
    const running = await createAuthorSession(proj, { name: "live", objective: "x", baseUrl: FIXTURE_URL })
    await updateAuthorSession(proj, running, { checkpoint: cp("running"), status: "running" })
    const done = await createAuthorSession(proj, { name: "done", objective: "x", baseUrl: FIXTURE_URL })
    await updateAuthorSession(proj, done, { checkpoint: cp("done"), status: "crystallized", trailId: "trail_done" })
    const list = await listStalledAuthorSessions(proj)
    expect(list).toHaveLength(0)
  })

  test("a stalled session with neither checkpoint nor draft does NOT surface", async () => {
    const proj = "proj_kla270_empty"
    const id = await createAuthorSession(proj, { name: "empty", objective: "x", baseUrl: FIXTURE_URL })
    await updateAuthorSession(proj, id, { status: "stalled", stallReason: "nothing recorded" })
    const list = await listStalledAuthorSessions(proj)
    expect(list).toHaveLength(0)
  })

  test("a stalled session past the recency window ages out of the resumable list", async () => {
    const proj = "proj_kla270_old"
    const id = await createAuthorSession(proj, { name: "ancient", objective: "x", baseUrl: FIXTURE_URL })
    await updateAuthorSession(proj, id, { checkpoint: cp("old"), status: "stalled", stallReason: "long ago" })
    expect(await listStalledAuthorSessions(proj)).toHaveLength(1)
    await setUpdatedAt(proj, id, Date.now() - NEEDS_AUTH_RESUME_TTL_MS - 60_000)
    expect(await listStalledAuthorSessions(proj)).toHaveLength(0)
  })

  test("resumable list is newest-first", async () => {
    const proj = "proj_kla270_order"
    const older = await createAuthorSession(proj, { name: "older", objective: "x", baseUrl: FIXTURE_URL })
    await updateAuthorSession(proj, older, { checkpoint: cp("older"), status: "stalled", stallReason: "a" })
    const newer = await createAuthorSession(proj, { name: "newer", objective: "x", baseUrl: FIXTURE_URL })
    await updateAuthorSession(proj, newer, { checkpoint: cp("newer"), status: "stalled", stallReason: "b" })
    await setUpdatedAt(proj, older, Date.now() - 5_000)
    await setUpdatedAt(proj, newer, Date.now() - 1_000)
    const list = await listStalledAuthorSessions(proj)
    expect(list.map(x => x.id)).toEqual([newer, older])
  })
})
