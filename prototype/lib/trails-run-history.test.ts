// KLA-85: unit tests for listTrailRunHistory — per-trail run history query.
// Uses a real hermetic SQLite DB (no spawned server, no browser).
import { test, expect, beforeAll, describe } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-run-hist-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

const T = await import("./trails")

// ── helpers ────────────────────────────────────────────────────────────────────────────────────────

async function makeTrail(proj: string): Promise<string> {
  return T.createTrail(proj, { name: "History Trail", baseUrl: "https://app.test/" })
}

async function makeRun(
  proj: string,
  trailId: string,
  status: "green" | "amber" | "red",
  startedAt: number,
  durationMs: number,
  stepCount = 0,
): Promise<string> {
  const runId = await T.startWalk(proj, trailId)
  // Override started_at + finished_at by finishing immediately with known timestamps.
  // startWalk inserts with Date.now(); finishWalk only sets finished_at. We patch started_at
  // directly by finishing with a known offset, then re-reading via getWalk.
  // Simpler: just finishWalk — it sets finished_at = Date.now() which we can't control in tests.
  // Instead, we insert run_steps and use finishWalk, accepting that durationMs is approximate.
  // For ordering tests we need predictable started_at — so we use addRunStep + DB insert helper.
  // Since trails.ts exposes startWalk (which inserts started_at = Date.now()), we rely on the
  // insertion order for newest-first ordering tests rather than pinning exact ms values.
  await T.finishWalk(proj, runId, { status, llmCalls: 0 })
  // Seed step_count via addRunStep
  for (let i = 0; i < stepCount; i++) {
    await T.addRunStep(proj, {
      runId, trailId, stepId: `step_${i}`, idx: i,
      tier: "none", verdict: status === "green" ? "green" : "red",
    })
  }
  return runId
}

// ── tests ──────────────────────────────────────────────────────────────────────────────────────────

describe("listTrailRunHistory", () => {
  test("returns runs for a trail newest-first", async () => {
    const proj = "proj_hist_order"
    const trailId = await makeTrail(proj)

    const id1 = await makeRun(proj, trailId, "green", Date.now(), 100)
    // Tiny sleep to ensure different started_at timestamps (startWalk uses Date.now()).
    await Bun.sleep(5)
    const id2 = await makeRun(proj, trailId, "amber", Date.now(), 200)
    await Bun.sleep(5)
    const id3 = await makeRun(proj, trailId, "red", Date.now(), 300)

    const runs = await T.listTrailRunHistory(proj, trailId)

    expect(runs.length).toBe(3)
    // Newest-first: id3 > id2 > id1
    expect(runs[0].runId).toBe(id3)
    expect(runs[1].runId).toBe(id2)
    expect(runs[2].runId).toBe(id1)
    // Status is preserved
    expect(runs[0].status).toBe("red")
    expect(runs[1].status).toBe("amber")
    expect(runs[2].status).toBe("green")
  })

  test("limit caps the number of results returned", async () => {
    const proj = "proj_hist_limit"
    const trailId = await makeTrail(proj)

    for (let i = 0; i < 5; i++) {
      await makeRun(proj, trailId, "green", Date.now(), 50)
      await Bun.sleep(2)
    }

    const all = await T.listTrailRunHistory(proj, trailId, 10)
    expect(all.length).toBe(5)

    const capped = await T.listTrailRunHistory(proj, trailId, 3)
    expect(capped.length).toBe(3)
    // With limit=3 we should get the 3 newest
    const uncapped = await T.listTrailRunHistory(proj, trailId)
    expect(capped[0].runId).toBe(uncapped[0].runId)
    expect(capped[1].runId).toBe(uncapped[1].runId)
    expect(capped[2].runId).toBe(uncapped[2].runId)
  })

  test("includes stepCount per run", async () => {
    const proj = "proj_hist_steps"
    const trailId = await makeTrail(proj)

    const id = await makeRun(proj, trailId, "green", Date.now(), 100, 4)
    const runs = await T.listTrailRunHistory(proj, trailId, 1)

    expect(runs[0].runId).toBe(id)
    expect(runs[0].stepCount).toBe(4)
  })

  test("durationMs is non-null for finished runs and null for running ones", async () => {
    const proj = "proj_hist_dur"
    const trailId = await makeTrail(proj)

    // A finished run
    const finId = await makeRun(proj, trailId, "green", Date.now(), 500)
    // A still-running run (only startWalk, no finishWalk)
    const runningId = await T.startWalk(proj, trailId)

    const all = await T.listTrailRunHistory(proj, trailId)
    const finished = all.find(r => r.runId === finId)
    const running = all.find(r => r.runId === runningId)

    expect(finished).toBeDefined()
    expect(typeof finished!.durationMs).toBe("number")
    expect(finished!.durationMs).toBeGreaterThanOrEqual(0)

    expect(running).toBeDefined()
    expect(running!.durationMs).toBeNull()
    expect(running!.status).toBe("running")
  })

  test("returns empty array for a trail with no runs", async () => {
    const proj = "proj_hist_empty"
    const trailId = await makeTrail(proj)
    const runs = await T.listTrailRunHistory(proj, trailId)
    expect(runs).toEqual([])
  })

  test("is scoped to the project — runs from another project's trail are invisible", async () => {
    const projA = "proj_hist_idor_A"
    const projB = "proj_hist_idor_B"
    const trailA = await makeTrail(projA)
    const trailB = await makeTrail(projB)

    await makeRun(projA, trailA, "green", Date.now(), 100)
    await makeRun(projB, trailB, "red", Date.now(), 200)

    // projA sees only its own run
    const forA = await T.listTrailRunHistory(projA, trailA)
    expect(forA.length).toBe(1)
    expect(forA[0].status).toBe("green")

    // projA querying projB's trail returns nothing (trail belongs to projB)
    const crossQuery = await T.listTrailRunHistory(projA, trailB)
    expect(crossQuery.length).toBe(0)
  })
})
