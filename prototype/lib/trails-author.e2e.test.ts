// AutoSims F1 — authoring engine e2e tests. Hermetic local libsql + KLAV_SECRET.
// Real headless Chromium (Playwright), scripted fake AuthorModel — no network, no OpenRouter.
// Mirrors trails-runner.e2e.test.ts setup conventions.
import { test, expect, beforeAll, beforeEach } from "bun:test"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const file = join(tmpdir(), `klav-author-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
// KLAV_SECRET required by test-accounts (encrypts password at rest); 32 bytes base64.
process.env.KLAV_SECRET = Buffer.from("autosims-test-secret-key-32bytes").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

import { authorTrail, runAuthorNow, getAuthorSession, AUTHOR_MAX_STEPS } from "./trails-author"
import { parseAuthorAction, type AuthorModel } from "./trails-author-model"
import { AuthorBusyError, _resetAuthorAdmissionForTest, _resetWalkPoolForTest } from "./trails-browser"
import { createTestAccount } from "./test-accounts"
import * as T from "./trails"

const P = "proj_author"
const fixtureUrl = (name: string) =>
  pathToFileURL(resolve(import.meta.dir, "../test-fixtures", name)).href

const scripted = (script: any[]): AuthorModel => {
  let i = 0
  return async () => ({ action: { selector: null, value: null, url: null, checkpoint: null, rationale: "r", ...script[Math.min(i++, script.length - 1)] }, costUsd: 0.001 })
}
const LOGIN_SCRIPT = [
  { op: "type", selector: "#email", value: "{{cred:admin:email}}" },
  { op: "type", selector: "#pw", value: "{{cred:admin:password}}" },
  { op: "click", selector: "#signin" },
  { op: "assert", selector: "#welcome", checkpoint: "Logged-in welcome visible" },
  { op: "done" },
]

beforeEach(() => {
  _resetWalkPoolForTest(1, 0)
  _resetAuthorAdmissionForTest()
})

function fakeBrowser(closeSpy: { count: number }) {
  const page = {
    url: () => "https://app.test/",
    goto: async () => {},
    screenshotJpeg: async () => "",
    krefSnapshot: async () => "<button id='go'>Go</button>",
    count: async () => 1,
    fingerprint: async () => ({ role: "button", accessibleName: "Go", domPath: "button:nth-of-type(1)" }),
    stableSelector: async () => "#go",
    click: async () => {},
    fill: async () => {},
    selectOption: async () => {},
    hover: async () => {},
    keyPress: async () => {},
    clearField: async () => {},
    assertVisible: async () => {},
    assertTextEquals: async () => {},
    assertTextContains: async () => {},
    assertUrlMatches: async () => {},
    assertElementCount: async () => {},
    waitMs: async () => {},
    mockNetwork: async () => {},
  }
  return {
    kind: "fake",
    newPage: async () => page,
    close: async () => { closeSpy.count++ },
  } as any
}

test("happy path: authors, crystallizes DRAFT trail, verification walk GREEN, no findings, no secret anywhere", async () => {
  await createTestAccount(P, { name: "admin", loginEmail: "vishal@quantana.com.au", password: "pw-authoring" })
  const out = await authorTrail(P, { name: "Login journey", objective: "log in and see the welcome screen", baseUrl: fixtureUrl("author-mockup.html") }, { model: scripted(LOGIN_SCRIPT) })
  expect(out.status).toBe("crystallized")
  expect(out.verificationVerdict).toBe("green")
  expect(out.llmCalls).toBe(6)
  const trail = await T.getTrail(P, out.trailId!)
  expect(trail!.status).toBe("draft")
  expect(trail!.authorKind).toBe("llm")
  const steps = await T.listTrailSteps(P, out.trailId!)
  expect(steps.length).toBe(5)                      // 4 actions + assert checkpoint
  expect(steps.some((s) => s.action === "assert")).toBe(true)
  const all = JSON.stringify({ steps, out, runSteps: await T.listRunSteps(P, out.verificationRunId!) })
  expect(all).toContain("{{cred:admin:password}}")
  expect(all).not.toContain("pw-authoring")
  expect((await T.listFindings(P)).length).toBe(0)  // draft + verification: nothing filed
}, 60000)

test("bad selector: model gets an error turn, then stalls out after 3 consecutive misses", async () => {
  const out = await authorTrail(P, { name: "x", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { model: scripted([{ op: "click", selector: "#does-not-exist" }]) })
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toContain("#does-not-exist")
  expect(out.trailId).toBeNull()
}, 30000)

test("one malformed model reply is retried, not fatal (KLAVITYKLA-48 #1)", async () => {
  await createTestAccount("proj_badroll", { name: "admin", loginEmail: "a@b.c", password: "p" })
  // First reply is garbage (parse fallback), the rest is the good login script — must crystallize.
  let first = true
  const good = scripted(LOGIN_SCRIPT)
  const flaky: AuthorModel = async (input, ctx) => {
    if (first) { first = false; return { action: parseAuthorAction("]]]not json[[["), costUsd: 0.001 } }
    return good(input, ctx)
  }
  const out = await authorTrail("proj_badroll", { name: "flaky", objective: "log in", baseUrl: fixtureUrl("author-mockup.html") }, { model: flaky })
  expect(out.status).toBe("crystallized")
  expect(out.verificationVerdict).toBe("green")
  expect(out.llmCalls).toBe(7) // 1 bad roll + 5 good + 1 verification
}, 60000)

test("three consecutive malformed replies still stall out", async () => {
  const garbage: AuthorModel = async () => ({ action: parseAuthorAction("not json"), costUsd: 0.001 })
  const out = await authorTrail("proj_badroll2", { name: "x", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { model: garbage })
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toContain("malformed")
}, 30000)

test("model stall op surfaces the rationale", async () => {
  const out = await authorTrail(P, { name: "x", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { model: scripted([{ op: "stall", rationale: "auth wall I cannot pass" }]) })
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toBe("auth wall I cannot pass")
}, 30000)

test("budget cap stalls the attempt", async () => {
  const pricey: AuthorModel = async () => ({ action: { op: "click", selector: "#signin", value: null, url: null, checkpoint: null, rationale: "r" }, costUsd: 0.2 })
  const out = await authorTrail(P, { name: "x", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { model: pricey })
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toContain("budget")
}, 30000)

test("runAuthorNow persists a pollable session that reaches crystallized", async () => {
  await createTestAccount("proj_sess", { name: "admin", loginEmail: "a@b.c", password: "p" })
  const { sessionId } = await runAuthorNow("proj_sess", { name: "s", objective: "log in", baseUrl: fixtureUrl("author-mockup.html"), testAccountName: "admin" }, { model: scripted(LOGIN_SCRIPT) })
  for (let i = 0; i < 120; i++) {
    const s = await getAuthorSession("proj_sess", sessionId)
    if (s!.status !== "running") { expect(s!.status).toBe("crystallized"); expect(s!.trailId).toBeTruthy(); return }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error("session never finished")
}, 60000)

test("runAuthorNow rejects a second active authoring session before creating another browser", async () => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  const holdingAuthor: typeof authorTrail = async () => {
    await gate
    return {
      status: "stalled",
      trailId: null,
      verificationRunId: null,
      verificationVerdict: null,
      steps: [],
      stallReason: "released",
      llmCalls: 0,
      costUsd: 0,
    }
  }

  const first = await runAuthorNow("proj_admit", { name: "s", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { author: holdingAuthor, model: scripted([{ op: "done" }]) })
  await expect(runAuthorNow("proj_admit", { name: "s2", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { author: holdingAuthor, model: scripted([{ op: "done" }]) })).rejects.toBeInstanceOf(AuthorBusyError)

  release()
  for (let i = 0; i < 80; i++) {
    const s = await getAuthorSession("proj_admit", first.sessionId)
    if (s?.status !== "running") { expect(s?.status).toBe("stalled"); return }
    await new Promise((r) => setTimeout(r, 25))
  }
  throw new Error("first author session never released")
})

test("authorTrail closes an acquired browser on model error and before verification", async () => {
  const errored = { count: 0 }
  const bad = await authorTrail("proj_cleanup_err", { name: "x", objective: "o", baseUrl: "https://app.test/" }, {
    model: async () => { throw new Error("model down") },
    browserFactory: async () => fakeBrowser(errored),
    sleepMs: async () => {},
  })
  expect(bad.status).toBe("stalled")
  expect(errored.count).toBe(1)

  const closed = { count: 0 }
  let closeCountAtVerification = -1
  const ok = await authorTrail("proj_cleanup_ok", { name: "x", objective: "o", baseUrl: "https://app.test/" }, {
    model: scripted([{ op: "done" }]),
    browserFactory: async () => fakeBrowser(closed),
    verificationWalk: async () => {
      closeCountAtVerification = closed.count
      return { runId: "walk_fake", verdict: "green", llmCalls: 0, steps: [], healedCount: 0, reasons: [] } as any
    },
  })
  expect(ok.status).toBe("crystallized")
  expect(closeCountAtVerification).toBe(1)
  expect(closed.count).toBe(1)
})

test("verification exception cleans up the already-created draft trail and walk artifacts", async () => {
  const projectId = "proj_verify_cleanup"
  const closed = { count: 0 }
  let createdRunId: string | null = null
  let createdTrailId: string | null = null

  const out = await authorTrail(projectId, { name: "x", objective: "o", baseUrl: "https://app.test/" }, {
    model: scripted([{ op: "done" }]),
    browserFactory: async () => fakeBrowser(closed),
    verifier: async () => ({ achieved: true, evidenceSelector: "#go", reason: null }),
    verificationWalk: async (p, trailId) => {
      createdTrailId = trailId
      createdRunId = await T.startWalk(p, trailId)
      const steps = await T.listTrailSteps(p, trailId)
      await T.addRunStep(p, {
        runId: createdRunId,
        trailId,
        stepId: steps[0].id,
        idx: 0,
        tier: "cache",
        verdict: "green",
      })
      throw new Error("verification exploded")
    },
  })

  expect(out.status).toBe("failed")
  expect(out.trailId).toBeNull()
  expect(out.stallReason).toContain("verification exploded")
  expect(closed.count).toBe(1)
  expect(createdTrailId).toBeTruthy()
  expect(await T.getTrail(projectId, createdTrailId!)).toBeNull()
  expect(await T.listTrails(projectId)).toHaveLength(0)
  expect(await T.getWalk(projectId, createdRunId!)).toBeNull()
  expect(await T.listRunSteps(projectId, createdRunId!)).toHaveLength(0)
})

test("session is project-scoped", async () => {
  const { sessionId } = await runAuthorNow("proj_a1", { name: "s", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { model: scripted([{ op: "stall", rationale: "x" }]) })
  expect(await getAuthorSession("proj_b1", sessionId)).toBeNull()
}, 30000)

test("drive deadline stalls a too-slow authoring run and releases cleanly", async () => {
  const slow: AuthorModel = async () => {
    await new Promise((r) => setTimeout(r, 300))
    return { action: { op: "assert", selector: "h1", value: null, url: null, checkpoint: "still here", rationale: "r" }, costUsd: 0.0001 }
  }
  const out = await authorTrail("proj_deadline", { name: "x", objective: "o", baseUrl: fixtureUrl("author-mockup.html") }, { model: slow, driveDeadlineMs: 900 })
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toContain("deadline")
}, 30000)

test("boot sweep marks orphaned running author_sessions failed", async () => {
  const { reconnectDb: rdb, sweepOrphanedAuthorSessions } = await import("./db")
  const sid = await (await import("./trails-author")).createAuthorSession("proj_sweep", { name: "s", objective: "o".repeat(12), baseUrl: "https://x.y" })
  const { db } = await import("./db")
  const { swept } = await sweepOrphanedAuthorSessions(db!)
  expect(swept).toBeGreaterThanOrEqual(1)
  const s = await getAuthorSession("proj_sweep", sid)
  expect(s!.status).toBe("failed")
  expect(s!.stallReason).toContain("restart")
})

test("persists step artifacts (screenshotKey, krefSnapshot) on every executed step (KLA-75)", async () => {
  const P_ART = "proj_sess_artifacts"
  await createTestAccount(P_ART, { name: "admin", loginEmail: "a@b.c", password: "p" })

  const uploadedKeys: string[] = []
  const shotUploader = async (bytes: Uint8Array) => {
    const key = `shot_${Date.now()}_${uploadedKeys.length}`
    uploadedKeys.push(key)
    return { key }
  }

  let stepLogsReceived: any[] = []
  const onStep = (log: any[]) => {
    stepLogsReceived = log
  }

  const model = scripted([
    { op: "type", selector: "#email", value: "test@domain.com" },
    { op: "click", selector: "#signin" },
    { op: "done" }
  ])

  const out = await authorTrail(
    P_ART,
    { name: "Artifacts Test", objective: "test logging", baseUrl: fixtureUrl("author-mockup.html") },
    {
      model,
      shotUploader,
      onStep,
      headless: true
    }
  )

  expect(out.status).toBe("crystallized")
  expect(out.steps.length).toBe(2)

  for (const step of out.steps) {
    expect(step.screenshotKey).toBeTruthy()
    expect(step.screenshotKey).toMatch(/^shot_\d+_\d+$/)
    expect(step.krefSnapshot).toBeTruthy()
    expect(step.krefSnapshot).toContain("Email")
    expect(step.krefSnapshot!.length).toBeLessThanOrEqual(50015)
  }

  expect(stepLogsReceived.length).toBe(2)
  for (const step of stepLogsReceived) {
    expect(step.screenshotKey).toBeTruthy()
    expect(step.krefSnapshot).toBeTruthy()
  }
}, 60000)

test("runAuthorNow persists step artifacts (screenshotKey, krefSnapshot) in the DB (KLA-75)", async () => {
  const P_DB = "proj_sess_db_artifacts"
  await createTestAccount(P_DB, { name: "admin", loginEmail: "a@b.c", password: "p" })

  const uploadedKeys: string[] = []
  const shotUploader = async (bytes: Uint8Array) => {
    const key = `db_shot_${Date.now()}_${uploadedKeys.length}`
    uploadedKeys.push(key)
    return { key }
  }

  const model = scripted([
    { op: "type", selector: "#email", value: "db@domain.com" },
    { op: "done" }
  ])

  const customAuthor: typeof authorTrail = (projId, r, opts) => {
    return authorTrail(projId, r, { ...opts, shotUploader, headless: true })
  }

  const { sessionId } = await runAuthorNow(
    P_DB,
    { name: "DB Artifacts Test", objective: "test db save", baseUrl: fixtureUrl("author-mockup.html") },
    { model, author: customAuthor }
  )

  let session: any = null
  for (let i = 0; i < 40; i++) {
    session = await getAuthorSession(P_DB, sessionId)
    if (session && session.status !== "running") break
    await new Promise((r) => setTimeout(r, 200))
  }

  expect(session).not.toBeNull()
  expect(session.status).toBe("crystallized")
  expect(session.steps.length).toBe(1)
  
  const step = session.steps[0]
  expect(step.screenshotKey).toBeTruthy()
  expect(step.screenshotKey).toMatch(/^db_shot_\d+_\d+$/)
  expect(step.krefSnapshot).toBeTruthy()
  expect(step.krefSnapshot).toContain("Email")
}, 60000)

test("objective verification: done on wrong page (verification NO) yields stall / no crystallize (KLA-76)", async () => {
  const P_V1 = "proj_verify_wrong"
  await createTestAccount(P_V1, { name: "admin", loginEmail: "a@b.c", password: "p" })

  const model = scripted([
    { op: "type", selector: "#email", value: "test@domain.com" },
    { op: "done" }
  ])

  let verifyCalls = 0
  const verifier = async () => {
    verifyCalls++
    return { achieved: false, evidenceSelector: null, reason: "still on login page" }
  }

  const out = await authorTrail(
    P_V1,
    { name: "Verify Wrong Page Test", objective: "reach dashboard", baseUrl: fixtureUrl("author-mockup.html") },
    {
      model,
      verifier,
      headless: true
    }
  )

  expect(out.status).toBe("stalled")
  expect(out.stallReason).toContain("failed verification attempts")
  expect(out.objectiveVerified).toBe(false)
  expect(out.trailId).toBeTruthy()
  expect(verifyCalls).toBeGreaterThanOrEqual(1)
}, 60000)

test("objective verification: done on right page (verification YES) crystallizes with objectiveVerified recorded (KLA-76)", async () => {
  const P_V2 = "proj_verify_right"
  await createTestAccount(P_V2, { name: "admin", loginEmail: "a@b.c", password: "p" })

  const model = scripted([
    { op: "type", selector: "#email", value: "test@domain.com" },
    { op: "done" }
  ])

  let verifyCalls = 0
  const verifier = async () => {
    verifyCalls++
    return { achieved: true, evidenceSelector: "#welcome", reason: null }
  }

  const out = await authorTrail(
    P_V2,
    { name: "Verify Right Page Test", objective: "reach welcome", baseUrl: fixtureUrl("author-mockup.html") },
    {
      model,
      verifier,
      headless: true
    }
  )

  expect(out.status).toBe("crystallized")
  expect(out.objectiveVerified).toBe(true)
  expect(out.trailId).toBeTruthy()
  expect(verifyCalls).toBe(1)

  const trail = await T.getTrail(P_V2, out.trailId!)
  expect(trail!.objectiveVerified).toBe(true)
}, 60000)

