// A replay whose browser dies mid-walk (infra) is run once more on a fresh browser; real step failures, deadlines and cancels are not.
// Dev 2026-11-16: green through step 9, then "Target page, context or browser has been closed" -> red, though the same trail replayed fine minutes later.
import { describe, test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-walk-retry-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-walk-retry-test-32bytes!").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const { walkTrailWithBrowserRetry } = await import("./trails-runner")
const trails = await import("./trails")

const ok = (runId: string): any => ({ runId, verdict: "green", llmCalls: 0, steps: [], healedCount: 0, reasons: [] })
const lost = (runId: string): any => ({ runId, verdict: "red", llmCalls: 0, steps: [], healedCount: 0, reasons: ["lost browser"], failureKind: "crash", browserLost: true })
const base: any = { fixtureUrl: "https://example.com" }

describe("walkTrailWithBrowserRetry", () => {
  test("browser lost on the first attempt -> runs once more and returns the retry's result", async () => {
    const seen: any[] = []
    const fn = async (_p: string, _t: string, o: any) => { seen.push(o); return seen.length === 1 ? lost("walk_1") : ok("walk_2") }
    const r = await walkTrailWithBrowserRetry("p", "t", { ...base }, fn)
    expect(r.verdict).toBe("green")
    expect(r.runId).toBe("walk_2")
    expect(seen.length).toBe(2)
    expect(seen[0]._deferInfraAlert).toBe(true)      // the first attempt's "lost the browser" alert is held back
    expect(seen[1]._deferInfraAlert).toBeUndefined() // the retry alerts normally if it fails too
  })

  test("only ONE retry: a second browser loss is returned as the result", async () => {
    let n = 0
    const fn = async () => { n++; return lost("walk_" + n) }
    const r = await walkTrailWithBrowserRetry("p", "t", { ...base }, fn)
    expect(n).toBe(2)
    expect(r.browserLost).toBe(true)
    expect(r.runId).toBe("walk_2")
  })

  test("a normal result (green or a real red) is never retried", async () => {
    let n = 0
    const red: any = { runId: "w", verdict: "red", llmCalls: 0, steps: [], healedCount: 0, reasons: ["selector gone"], failureKind: "regression" }
    await walkTrailWithBrowserRetry("p", "t", { ...base }, async () => { n++; return ok("w") })
    await walkTrailWithBrowserRetry("p", "t", { ...base }, async () => { n++; return red })
    expect(n).toBe(2)
  })

  test("a cancelled walk is not retried even if the browser dropped", async () => {
    const ac = new AbortController(); ac.abort()
    let n = 0
    await walkTrailWithBrowserRetry("p", "t", { ...base, signal: ac.signal }, async () => { n++; return lost("w") })
    expect(n).toBe(1)
  })

  test("with a pre-created runId the SAME Walk row is re-armed for the retry", async () => {
    const { trail } = await (async () => ({ trail: await trails.createTrail("proj_retry", { name: "t", intent: "i", baseUrl: "https://example.com" } as any) }))()
    const trailId = (trail as any).id ?? trail
    const runId = await trails.startWalk("proj_retry", trailId)
    await trails.addRunStep("proj_retry", { runId, trailId, stepId: "s1", idx: 0, tier: "cache", verdict: "green" })
    await trails.finishWalk("proj_retry", runId, { status: "red", llmCalls: 0, summary: { error: "browser closed" } })
    let n = 0
    let stepsAtRetry = -1, statusAtRetry = ""
    const fn = async (_p: string, _t: string, _o: any) => {
      n++
      if (n === 1) return lost(runId)
      stepsAtRetry = (await trails.listRunSteps("proj_retry", runId)).length
      statusAtRetry = String((await trails.getWalk("proj_retry", runId))?.status)
      return ok(runId)
    }
    const r = await walkTrailWithBrowserRetry("proj_retry", trailId, { ...base, runId }, fn)
    expect(r.verdict).toBe("green")
    expect(stepsAtRetry).toBe(0)            // the crashed attempt's step rows are gone
    expect(statusAtRetry).toBe("running")   // and the row is running again, not frozen red
  })
})
