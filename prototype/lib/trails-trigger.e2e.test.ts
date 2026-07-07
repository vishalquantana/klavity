// Plan G Task 6 — the trigger driven by the REAL walkTrail (no stub) against the app-served demo
// fixtures (file:// equivalents of /trails-demo/*). Proves runWalkNow produces real verdicts + a saved
// replay end to end:
//   baseline   → GREEN + replay (≥1 segment)
//   drift      → AMBER + a fromSelector→toSelector heal-diff in a run_step's evidence
//   regression → RED + a grounded 'regression' finding via production Tier-2 vision wiring
// Pointing baseUrl at the bundled public/ dir makes seedDemoTrails build
// `${baseUrl}/trails-demo/<variant>/landing.html` resolve to the real served copies — no network.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"; import { join, resolve } from "node:path"; import { pathToFileURL } from "node:url"
const file = join(tmpdir(), `klav-trigger-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })
const T = await import("./trails")
const { seedDemoTrails, DEMO_TRAIL_NAMES } = await import("./trails-demo-seed")
const { runWalkNow } = await import("./trails-trigger")
const { isWalkInFlight } = await import("./trails-browser")
const R = await import("./trails-replay")

// baseUrl = the bundled public/ dir → ${baseUrl}/trails-demo/journey/landing.html resolves to the
// served fixture copies committed in Task 4.
const PUBLIC_ORIGIN = pathToFileURL(resolve(import.meta.dir, "..", "public")).href.replace(/\/+$/, "")
const PROJ = "proj_e2e"

const waitDone = async (runId: string) => {
  for (let i = 0; i < 300; i++) {
    const w = await T.getWalk(PROJ, runId)
    // The single walk-slot releases a microtask AFTER finishWalk writes the row, so also wait for the
    // slot to clear before returning — otherwise the next runWalkNow could race into a WalkBusyError.
    if (w && w.status !== "running" && !isWalkInFlight()) return w
    await new Promise(r => setTimeout(r, 100))
  }
  throw new Error("walk did not finish")
}

let trailIds: Record<string, string>
beforeAll(async () => { trailIds = (await seedDemoTrails(PROJ, PUBLIC_ORIGIN)).trailIds })

test("baseline demo trail → GREEN with a saved replay (≥1 segment)", async () => {
  const { runId } = await runWalkNow(PROJ, trailIds[DEMO_TRAIL_NAMES.baseline])
  const walk = await waitDone(runId)
  expect(walk.status).toBe("green")
  const segs = await R.getReplay(PROJ, runId)
  expect(segs).not.toBeNull()
  expect(segs!.length).toBeGreaterThanOrEqual(1)
}, 60000)

test("drift demo trail → AMBER with a fromSelector→toSelector heal-diff in evidence", async () => {
  const { runId } = await runWalkNow(PROJ, trailIds[DEMO_TRAIL_NAMES.drift])
  const walk = await waitDone(runId)
  expect(walk.status).toBe("amber")
  const steps = await T.listRunSteps(PROJ, runId)
  const healed = steps.find(s => s.healed && (s.evidence as any)?.fromSelector)
  expect(healed).toBeTruthy()
  expect((healed!.evidence as any).fromSelector).toBe("#checkout")
  expect((healed!.evidence as any).toSelector).toBeTruthy()
}, 60000)

test("regression demo trail → production Tier-2 vision runs and records a grounded finding", async () => {
  const prevKey = process.env.OPENROUTER_API_KEY
  const prevFlag = process.env.KLAV_AUTOSIM_VISION_SELFHEAL
  const prevCap = process.env.OPS_DAILY_CAP_USD
  const realFetch = globalThis.fetch
  let visionCalls = 0
  process.env.OPENROUTER_API_KEY = "test-key"
  delete process.env.KLAV_AUTOSIM_VISION_SELFHEAL
  process.env.OPS_DAILY_CAP_USD = "50"
  globalThis.fetch = async () => {
    visionCalls++
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        found: false, selector: null, confidence: 0.95, classification: "removed",
        rationale: "there is no Checkout/pay affordance on the cart page anymore",
      }) } }],
      usage: { prompt_tokens: 100, completion_tokens: 20, cost: 0.001 },
    }), { status: 200 })
  }

  const trailId = trailIds[DEMO_TRAIL_NAMES.regression]
  try {
    const { runId } = await runWalkNow(PROJ, trailId)
    const walk = await waitDone(runId)
    expect(walk.status).toBe("red")
    expect(visionCalls).toBe(1)
    const findings = (await T.listFindings(PROJ)).filter(f => f.runId === runId && f.kind === "regression")
    expect(findings.length).toBeGreaterThanOrEqual(1)
    expect(findings[0].groundQuote).toBeTruthy()
  } finally {
    globalThis.fetch = realFetch
    if (prevKey === undefined) delete process.env.OPENROUTER_API_KEY
    else process.env.OPENROUTER_API_KEY = prevKey
    if (prevFlag === undefined) delete process.env.KLAV_AUTOSIM_VISION_SELFHEAL
    else process.env.KLAV_AUTOSIM_VISION_SELFHEAL = prevFlag
    if (prevCap === undefined) delete process.env.OPS_DAILY_CAP_USD
    else process.env.OPS_DAILY_CAP_USD = prevCap
  }
}, 60000)
