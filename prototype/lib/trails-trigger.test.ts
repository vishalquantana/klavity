// Plan G Task 3 — runWalkNow trigger unit tests with a STUB walk fn (no browser). Proves: returns a
// runId immediately + finalizes the verdict in the background; a 2nd concurrent call → WalkBusyError
// when the pool is exhausted (KLA-53: pool+queue); a walk that throws finalizes RED + releases the
// slot (crash isolation); unknown trail throws.
import { test, expect, beforeAll, beforeEach } from "bun:test"
import { tmpdir } from "node:os"; import { join } from "node:path"
const file = join(tmpdir(), `klav-trigger-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
const { reconnectDb, applySchema, migrateV2 } = await import("./db")
let db: any
beforeAll(async () => { db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })
const T = await import("./trails")
const DB = await import("./db")
const { runWalkNow } = await import("./trails-trigger")
const { WalkBusyError, isWalkInFlight, cancelCurrentWalk, _resetWalkPoolForTest } = await import("./trails-browser")

// Default: concurrency=1, queue=0 so existing WalkBusyError tests behave as before.
beforeEach(() => { _resetWalkPoolForTest(1, 0) })

async function seedTrail() {
  return T.createTrail("proj_t", { name: "T", baseUrl: "https://app.test/", authorKind: "llm" })
}
const waitFor = async (pred: () => Promise<boolean>) => { for (let i = 0; i < 100; i++) { if (await pred()) return; await new Promise(r => setTimeout(r, 20)) } throw new Error("timeout") }

test("runWalkNow returns a runId immediately and finalizes the verdict in the background", async () => {
  const trail = await seedTrail()
  const okWalk = async (_p: string, _t: string, _r: string) => ({ verdict: "green" as const, llmCalls: 0 })
  const { runId } = await runWalkNow("proj_t", trail, { walk: okWalk })
  expect(runId).toMatch(/^walk_/)
  await waitFor(async () => (await T.getWalk("proj_t", runId))?.status === "green")
  expect(isWalkInFlight()).toBe(false)
})

test("a 2nd runWalkNow while one is in flight throws WalkBusyError", async () => {
  const trail = await seedTrail()
  let release: () => void = () => {}; const gate = new Promise<void>(r => { release = r })
  const slowWalk = async () => { await gate; return { verdict: "green" as const, llmCalls: 0 } }
  const first = await runWalkNow("proj_t", trail, { walk: slowWalk })
  expect(first.runId).toBeTruthy()
  await expect(runWalkNow("proj_t", trail, { walk: async () => ({ verdict: "green" as const, llmCalls: 0 }) })).rejects.toBeInstanceOf(WalkBusyError)
  release()
  await waitFor(async () => (await T.getWalk("proj_t", first.runId))?.status === "green")
})

test("a walk that throws finalizes the run red and releases the slot (crash isolation)", async () => {
  const trail = await seedTrail()
  const { runId } = await runWalkNow("proj_t", trail, { walk: async () => { throw new Error("kaboom") } })
  await waitFor(async () => (await T.getWalk("proj_t", runId))?.status === "red")
  expect(isWalkInFlight()).toBe(false)
})

test("runWalkNow throws on an unknown trail", async () => {
  await expect(runWalkNow("proj_t", "trl_nope")).rejects.toThrow()
})

test("runWalkNow throws on a paused trail", async () => {
  const trail = await seedTrail()
  await T.updateTrail("proj_t", trail, { status: "paused" })
  await expect(runWalkNow("proj_t", trail)).rejects.toThrow("trail is paused")
})

// KLA-53: pool+queue — queued walk starts once a slot frees
test("runWalkNow queues a 2nd walk when pool=1 queue=1, resolves runId after slot opens", async () => {
  _resetWalkPoolForTest(1, 1)
  const trail = await seedTrail()
  let releaseFirst!: () => void
  const gate = new Promise<void>((r) => { releaseFirst = r })
  const slowWalk = async () => { await gate; return { verdict: "green" as const, llmCalls: 0 } }
  const fastWalk = async () => ({ verdict: "green" as const, llmCalls: 0 })
  // Start first walk — occupies the single slot
  const first = await runWalkNow("proj_t", trail, { walk: slowWalk })
  expect(first.runId).toMatch(/^walk_/)

  // Start second walk — queues (doesn't throw because queue has room)
  const secondProm = runWalkNow("proj_t", trail, { walk: fastWalk })
  // 3rd call should throw — pool+queue both full
  await expect(runWalkNow("proj_t", trail, { walk: fastWalk })).rejects.toBeInstanceOf(WalkBusyError)

  // Release the first walk → second dequeues and runs
  releaseFirst()
  await waitFor(async () => (await T.getWalk("proj_t", first.runId))?.status === "green")
  const second = await secondProm
  expect(second.runId).toMatch(/^walk_/)
  await waitFor(async () => (await T.getWalk("proj_t", second.runId))?.status === "green")
  expect(isWalkInFlight()).toBe(false)
})

// KLA-100: cancelCurrentWalk fires the signal that reaches the walk fn
test("cancelCurrentWalk aborts the in-flight walk and the run finalizes red", async () => {
  const trail = await seedTrail()
  let capturedSignal: AbortSignal | undefined
  const holdingWalk = async (_p: string, _t: string, runId: string) => {
    // The trigger sets currentWalkRunId before calling the walk fn; grab the signal here.
    capturedSignal = (await import("./trails-browser")).getCurrentWalkAbortSignal() ?? undefined
    // Simulate work: wait until the signal aborts, then propagate cancellation.
    await new Promise<void>((res) => {
      if (capturedSignal?.aborted) { res(); return }
      capturedSignal?.addEventListener("abort", () => res(), { once: true })
      setTimeout(res, 5000) // safety fallback
    })
    return { verdict: "red" as const, llmCalls: 0, summary: { error: "cancelled" } }
  }
  const { runId } = await runWalkNow("proj_t", trail, { walk: holdingWalk })
  expect(runId).toMatch(/^walk_/)
  // Give the walk fn a tick to register the signal
  await new Promise((r) => setTimeout(r, 10))
  const didFire = cancelCurrentWalk(runId)
  expect(didFire).toBe(true)
  await waitFor(async () => (await T.getWalk("proj_t", runId))?.status === "red")
  const walk = await T.getWalk("proj_t", runId)
  expect((walk?.summary as any)?.error).toBe("cancelled")
  expect(isWalkInFlight()).toBe(false)
})

test("rich summary survives when walk fn already calls finishWalk (KLA-65 regression)", async () => {
  const trail = await seedTrail()
  // Mock a walk fn that simulates walkTrail by calling finishWalk before returning
  const walkFailingToMerge = async (projectId: string, trailId: string, runId: string) => {
    await T.finishWalk(projectId, runId, {
      status: "green",
      llmCalls: 2,
      summary: { healedCount: 5, stepCount: 10 }
    })
    return { verdict: "green" as const, llmCalls: 2, summary: { reasons: ["some-reason"] } }
  }

  const { runId } = await runWalkNow("proj_t", trail, { walk: walkFailingToMerge })
  await waitFor(async () => (await T.getWalk("proj_t", runId))?.status === "green")

  const finalWalk = await T.getWalk("proj_t", runId)
  expect(finalWalk).toBeTruthy()
  expect(finalWalk!.summary).toBeTruthy()
  expect((finalWalk!.summary as any).healedCount).toBe(5)
  expect((finalWalk!.summary as any).stepCount).toBe(10)
})

// KLA-112: maybeAutoFileWalkFindings is wired into the walk runner — after runWalkNow the gate
// fires best-effort. With flag ON and no connector realFiler returns null (walk stays green/red,
// no error). Proves: (1) wiring doesn't throw, (2) walk finalizes, (3) finding is queued with no
// connector error (i.e. realFiler ran and returned null, not an error).
test("KLA-112: wiring fires after walk — flag ON, no connector, finding stays queued cleanly", async () => {
  const proj = "proj_kla112_smoke"
  await db.execute({
    sql: "INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, observability_mode, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
    args: [proj, "acct_k112", "kla112", "active", "auto", "named", Date.now(), Date.now()],
  })
  await DB.setProjectTrailsAutofile(proj, true)
  const trail = await T.createTrail(proj, { name: "T112", baseUrl: "https://app.test/", authorKind: "llm" })

  let findingId = ""
  const walkSeedsFinding = async (projectId: string, trailId: string, runId: string) => {
    const { id } = await T.recordFinding(projectId, {
      runId, trailId, kind: "regression", title: "gone", confidence: 0.95, dedupKey: "k112_smoke",
    })
    findingId = id
    return { verdict: "red" as const, llmCalls: 0 }
  }

  const { runId } = await runWalkNow(proj, trail, { walk: walkSeedsFinding })
  await waitFor(async () => (await T.getWalk(proj, runId))?.status === "red")
  // Give the best-effort maybeAutoFileWalkFindings call time to settle.
  await new Promise((r) => setTimeout(r, 50))

  // No connector → realFiler returned null → finding queued, no connectorError set.
  const f = (await T.listFindings(proj)).find((x) => x.id === findingId)
  expect(f?.status).toBe("queued")
  expect(f?.connectorError).toBeNull()
})

