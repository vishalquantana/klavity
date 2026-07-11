import { beforeAll, expect, test } from "bun:test"
import { join } from "node:path"
import { tmpdir } from "node:os"

const file = join(tmpdir(), `klav-author-analysis-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-test-secret-key-32bytes").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
const { authorTrail } = await import("./trails-author")
const T = await import("./trails")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

function fakeBrowser() {
  let currentUrl = "https://app.test/start"
  const page = {
    url: () => currentUrl,
    goto: async (url: string) => { currentUrl = url },
    screenshotJpeg: async () => "",
    krefSnapshot: async () => "<main><h1>Pricing</h1><p>Plans and checkout copy.</p></main>",
    count: async () => 0,
    fingerprint: async () => ({}),
    stableSelector: async () => null,
    click: async () => {},
    fill: async () => {},
    selectOption: async () => {},
    hover: async () => {},
    keyPress: async () => {},
    clearField: async () => {},
    assertVisible: async () => {},
    waitMs: async () => {},
    mockNetwork: async () => {},
  }
  return {
    kind: "fake",
    newPage: async () => page,
    close: async () => {},
  } as any
}

async function assertImmediateAnalysisObjectiveCrystallizes(objective: string) {
  const projectId = `proj_analysis_${Math.random().toString(36).slice(2)}`
  const seenLogs: any[][] = []
  let verificationStepCount = -1

  const out = await authorTrail(projectId, {
    name: "Analyse pricing",
    objective,
    baseUrl: "https://app.test/pricing",
  }, {
    browserFactory: async () => fakeBrowser(),
    model: async () => ({
      action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "analysis complete" },
      costUsd: 0.001,
    }),
    verifier: async () => ({ achieved: true, reason: "page loaded for analysis", costUsd: 0.001 }),
    verificationWalk: async (p, trailId) => {
      verificationStepCount = (await T.listTrailSteps(p, trailId)).length
      return { runId: "walk_analysis", verdict: "green", llmCalls: 0, steps: [], healedCount: 0, reasons: [] } as any
    },
    onStep: (logs) => { seenLogs.push([...logs]) },
  })

  expect(out.status).toBe("crystallized")
  expect(out.trailId).toBeTruthy()
  expect(out.objectiveVerified).toBe(true)
  expect(verificationStepCount).toBe(2)

  const steps = await T.listTrailSteps(projectId, out.trailId!)
  expect(steps.map((s) => s.action)).toEqual(["navigate", "assert"])
  expect(steps[1].target).toBeNull()
  expect(steps[1].checkpoint?.description).toContain("Analysis objective completed")
  expect(steps[1].checkpoint?.description).toContain(objective.slice(0, 40))

  expect(out.steps).toHaveLength(1)
  expect(out.steps[0]).toMatchObject({ op: "assert", selector: null, ok: true })
  expect(seenLogs.at(-1)?.[0]?.op).toBe("assert")
}

test("analysis objective with immediate done crystallizes a runnable checkpoint step", async () => {
  await assertImmediateAnalysisObjectiveCrystallizes("analyse the pricing page and report friction")
})

test("suggest-improvements objective with immediate done crystallizes a runnable checkpoint step", async () => {
  await assertImmediateAnalysisObjectiveCrystallizes("suggest-improvements for the signup flow")
})

