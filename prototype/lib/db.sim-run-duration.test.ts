// KLAVITYKLA-371 — sim_runs must record a TRUE start and a TRUE finish.
//
// The bug: insertSimRun stamped created_at = Date.now() at INSERT time and defaulted
// finished_at to that same `now`. Every caller inserts the row AFTER the work completes,
// so created_at === finished_at and all 31 production runs reported a 0.0s duration —
// making the "~30 seconds" marketing claim unverifiable and latency regressions invisible.
//
// The fix: callers pass `startedAt` (captured before the work began), finished_at is no
// longer defaulted to now (omit ⇒ NULL ⇒ run in progress), and rowToSimRun exposes a
// derived durationMs.
//
// Hermetic: file-backed libsql DB, no network, no production data.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-simrun-duration-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2, insertSimRun, finishSimRun, getSimRun, listSimRuns, previousSimRunForUrl } =
  await import("./db")
const client = reconnectDb("file:" + file)

beforeAll(async () => {
  await applySchema(client)
  await migrateV2(client)
})

const PROJECT = "proj_simrun_dur"

test("a run started and finished at different times reports a NON-ZERO duration", async () => {
  const startedAt = Date.now() - 32_000   // work began 32s ago
  const finishedAt = startedAt + 32_000   // and took 32s

  const id = await insertSimRun({
    projectId: PROJECT, url: "https://example.com/pricing",
    status: "done", reactions: [], actorEmail: "vishal@quantana.com.au",
    startedAt, finishedAt,
  })

  const run = await getSimRun(id)
  expect(run).not.toBeNull()
  // created_at is the TRUE start, not the insert moment.
  expect(run!.createdAt).toBe(startedAt)
  expect(run!.finishedAt).toBe(finishedAt)
  // The regression guard: this was 0 before the fix.
  expect(run!.durationMs).toBe(32_000)
  expect(run!.durationMs).toBeGreaterThan(0)
})

test("REGRESSION: omitting startedAt no longer collapses duration to 0 for a real finish", async () => {
  // Even without an explicit startedAt, a finishedAt in the future of the insert must
  // produce a positive duration — finished_at is never silently pinned to created_at.
  const id = await insertSimRun({
    projectId: PROJECT, url: "https://example.com/no-start",
    status: "done", finishedAt: Date.now() + 5_000,
  })
  const run = await getSimRun(id)
  expect(run!.durationMs).toBeGreaterThan(0)
})

test("an IN-PROGRESS run has a null finish and a null duration", async () => {
  const startedAt = Date.now()
  const id = await insertSimRun({
    projectId: PROJECT, url: "https://example.com/in-progress",
    status: "done", startedAt,
    // finishedAt deliberately omitted — the run has not completed.
  })

  const run = await getSimRun(id)
  expect(run!.createdAt).toBe(startedAt)
  expect(run!.finishedAt).toBeNull()   // NOT defaulted to now
  expect(run!.durationMs).toBeNull()   // in-progress ⇒ unknown, not 0
})

test("finishSimRun closes out an in-progress run with a true finish + real duration", async () => {
  const startedAt = Date.now() - 18_000
  const id = await insertSimRun({
    projectId: PROJECT, url: "https://example.com/finish-later", startedAt,
  })
  expect((await getSimRun(id))!.durationMs).toBeNull()

  const finishedAt = startedAt + 18_000
  await finishSimRun(id, { status: "done", reactions: [{ simId: "s1", simName: "Ada" }], finishedAt })

  const run = await getSimRun(id)
  expect(run!.finishedAt).toBe(finishedAt)
  expect(run!.durationMs).toBe(18_000)
  expect(run!.status).toBe("done")
  expect(run!.reactions).toEqual([{ simId: "s1", simName: "Ada" }])
})

test("finishSimRun can record an error terminal state", async () => {
  const startedAt = Date.now() - 4_000
  const id = await insertSimRun({ projectId: PROJECT, url: "https://example.com/boom", startedAt })
  await finishSimRun(id, { status: "error", errorMsg: "Vision model crashed", finishedAt: startedAt + 4_000 })

  const run = await getSimRun(id)
  expect(run!.status).toBe("error")
  expect(run!.errorMsg).toBe("Vision model crashed")
  expect(run!.durationMs).toBe(4_000)
})

test("a negative skew never produces a negative duration", async () => {
  // Defensive: clock skew or a bad backfill must clamp to 0, not report nonsense.
  const startedAt = Date.now()
  const id = await insertSimRun({
    projectId: PROJECT, url: "https://example.com/skew",
    startedAt, finishedAt: startedAt - 5_000,
  })
  expect((await getSimRun(id))!.durationMs).toBe(0)
})

test("CONSUMERS handle a null finish: listSimRuns and previousSimRunForUrl", async () => {
  const proj = "proj_simrun_consumers"
  const base = Date.now() - 100_000

  // An older FINISHED run and a newer IN-PROGRESS run of the same URL.
  const finishedId = await insertSimRun({
    projectId: proj, url: "https://example.com/same", status: "done", reactions: [],
    startedAt: base, finishedAt: base + 27_000,
  })
  const runningId = await insertSimRun({
    projectId: proj, url: "https://example.com/same", status: "done", reactions: [],
    startedAt: base + 60_000,
  })

  // listSimRuns must not throw and must expose durationMs on both shapes.
  const runs = await listSimRuns(proj, 20)
  expect(runs.length).toBe(2)
  const byId = new Map(runs.map((r) => [r.id, r]))
  expect(byId.get(finishedId)!.durationMs).toBe(27_000)
  expect(byId.get(runningId)!.durationMs).toBeNull()
  expect(byId.get(runningId)!.finishedAt).toBeNull()
  // Newest-first ordering by the true start still holds.
  expect(runs[0].id).toBe(runningId)

  // The diff baseline lookup still resolves the earlier same-url run.
  const running = byId.get(runningId)!
  const prev = await previousSimRunForUrl(proj, running.url, running.createdAt, running.id)
  expect(prev).not.toBeNull()
  expect(prev!.id).toBe(finishedId)
  expect(prev!.durationMs).toBe(27_000)
})

test("durationMs is observable across runs so a latency regression is detectable", async () => {
  const proj = "proj_simrun_regression"
  const base = Date.now() - 500_000
  await insertSimRun({ projectId: proj, url: "https://example.com/r", startedAt: base, finishedAt: base + 28_000 })
  await insertSimRun({ projectId: proj, url: "https://example.com/r", startedAt: base + 100_000, finishedAt: base + 100_000 + 95_000 })

  const runs = await listSimRuns(proj, 20)
  const durations = runs.map((r) => r.durationMs!).sort((a, b) => a - b)
  expect(durations).toEqual([28_000, 95_000])
  // A 3.4x slowdown is now visible in the data — the whole point of the ticket.
  expect(durations[1] / durations[0]).toBeGreaterThan(3)
})
