// KLAVITYKLA-126 — AutoSim environment determinism + trace artifact.
// Covers three layers without a real browser:
//   1. walk_artifacts storage round-trip (gzip + project scoping) — HAR keyed by trail, trace by run.
//   2. planWalkArtifacts record-vs-replay decision (default-off, env flags, opts override, existence).
//   3. the Playwright-layer helpers (harRecordContextOptions shape + routeFromHAR / tracing calls on a
//      fake BrowserContext) — the record/replay path is exercised against a mocked browser layer.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-har-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
let db: any
beforeAll(async () => {
  db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

const H = await import("./trails-har")
const BP = await import("./trails-browser-page")
const { planWalkArtifacts } = await import("./trails-runner")

// ── 1. storage round-trip ────────────────────────────────────────────────────────────────────────
test("saveWalkArtifact/getHarForTrail round-trips + compresses + is project/trail-scoped", async () => {
  // A HAR is a JSON blob; use a realistic-ish repetitive body so gzip clearly shrinks it.
  const har = Buffer.from(JSON.stringify({ log: { entries: Array.from({ length: 40 }, () => ({ request: { url: "https://api.example.com/flags" }, response: { status: 200, content: { text: "{\"dark\":true}" } } })) } }))
  await H.saveWalkArtifact({ projectId: "proj_H", kind: "har", trailId: "trail_1", runId: "run_a", bytes: har })

  expect(await H.hasHarForTrail("proj_H", "trail_1")).toBe(true)
  const got = await H.getHarForTrail("proj_H", "trail_1")
  expect(got).not.toBeNull()
  expect(got!.equals(har)).toBe(true)

  // cross-project + cross-trail reads never leak
  expect(await H.hasHarForTrail("proj_OTHER", "trail_1")).toBe(false)
  expect(await H.getHarForTrail("proj_H", "trail_nope")).toBeNull()
  expect(await H.hasHarForTrail("proj_H", "trail_nope")).toBe(false)

  // compression: stored base64(gzip) is shorter than the raw JSON
  const row = await db.execute({ sql: "SELECT artifact_gz, byte_size, kind FROM walk_artifacts WHERE trail_id=? AND kind='har'", args: ["trail_1"] })
  expect(String(row.rows[0].kind)).toBe("har")
  expect(Number(row.rows[0].byte_size)).toBe(har.byteLength)
  expect(String(row.rows[0].artifact_gz).length).toBeLessThan(har.byteLength)
})

test("saveWalkArtifact/getTraceForRun round-trips a trace blob, run-scoped", async () => {
  const trace = Buffer.from("PKfake-trace-zip-bytes".repeat(20)) // stand-in zip bytes
  await H.saveWalkArtifact({ projectId: "proj_H", kind: "trace", runId: "run_t", bytes: trace })
  const got = await H.getTraceForRun("proj_H", "run_t")
  expect(got!.equals(trace)).toBe(true)
  expect(await H.getTraceForRun("proj_H", "run_none")).toBeNull()
  // a trace is not a HAR — hasHarForTrail must not see it
  expect(await H.getHarForTrail("proj_H", "run_t")).toBeNull()
})

test("latest HAR wins when a trail records more than once", async () => {
  const v1 = Buffer.from("HAR-VERSION-ONE")
  const v2 = Buffer.from("HAR-VERSION-TWO-newer")
  await H.saveWalkArtifact({ projectId: "proj_H2", kind: "har", trailId: "trail_x", bytes: v1 })
  await new Promise((r) => setTimeout(r, 2)) // ensure a distinct created_at
  await H.saveWalkArtifact({ projectId: "proj_H2", kind: "har", trailId: "trail_x", bytes: v2 })
  const got = await H.getHarForTrail("proj_H2", "trail_x")
  expect(got!.toString()).toBe("HAR-VERSION-TWO-newer")
})

// ── 2. planWalkArtifacts decision logic ────────────────────────────────────────────────────────────
test("planWalkArtifacts: default-off leaves every artifact mode disabled", () => {
  const plan = planWalkArtifacts({}, false, {})
  expect(plan.harRecordMode).toBe(false)
  expect(plan.harReplayMode).toBe(false)
  expect(plan.traceEnabled).toBe(false)
  expect(plan.harNotFound).toBe("fallback")
})

test("planWalkArtifacts: HAR enabled RECORDS when no HAR exists, REPLAYS when one exists", () => {
  const noHar = planWalkArtifacts({ har: true }, false, {})
  expect(noHar.harRecordMode).toBe(true)
  expect(noHar.harReplayMode).toBe(false)

  const withHar = planWalkArtifacts({ har: true }, true, {})
  expect(withHar.harRecordMode).toBe(false)
  expect(withHar.harReplayMode).toBe(true)
})

test("planWalkArtifacts: env flags drive record/replay/trace when opts are absent", () => {
  const env = { KLAV_AUTOSIM_HAR: "1", KLAV_AUTOSIM_TRACE: "1", KLAV_AUTOSIM_HAR_NOTFOUND: "abort" }
  const rec = planWalkArtifacts({}, false, env)
  expect(rec.harRecordMode).toBe(true)
  expect(rec.traceEnabled).toBe(true)
  expect(rec.harNotFound).toBe("abort")
  const rep = planWalkArtifacts({}, true, env)
  expect(rep.harReplayMode).toBe(true)
})

test("planWalkArtifacts: explicit opts override env flags", () => {
  const env = { KLAV_AUTOSIM_HAR: "1", KLAV_AUTOSIM_TRACE: "1" }
  const plan = planWalkArtifacts({ har: false, trace: false }, false, env)
  expect(plan.harRecordMode).toBe(false)
  expect(plan.harReplayMode).toBe(false)
  expect(plan.traceEnabled).toBe(false)
})

// ── 3. Playwright-layer helpers (mocked context) ───────────────────────────────────────────────────
test("harRecordContextOptions embeds bodies + records full mode at the given path", () => {
  const opts = BP.harRecordContextOptions("/tmp/x/record.har") as any
  expect(opts.recordHar.path).toBe("/tmp/x/record.har")
  expect(opts.recordHar.content).toBe("embed")
  expect(opts.recordHar.mode).toBe("full")
})

test("applyHarReplay calls routeFromHAR with the notFound policy; tracing start/stop delegate", async () => {
  const calls: any = { routeFromHAR: null, traceStart: null, traceStop: null }
  const fakeContext: any = {
    routeFromHAR: async (path: string, o: any) => { calls.routeFromHAR = { path, o } },
    tracing: {
      start: async (o: any) => { calls.traceStart = o },
      stop: async (o: any) => { calls.traceStop = o },
    },
  }
  await BP.applyHarReplay(fakeContext, "/tmp/replay.har", "abort")
  expect(calls.routeFromHAR.path).toBe("/tmp/replay.har")
  expect(calls.routeFromHAR.o.url).toBe("**/*")
  expect(calls.routeFromHAR.o.notFound).toBe("abort")
  expect(calls.routeFromHAR.o.update).toBe(false)

  // default notFound is the safe 'fallback'
  await BP.applyHarReplay(fakeContext, "/tmp/replay.har")
  expect(calls.routeFromHAR.o.notFound).toBe("fallback")

  await BP.startContextTracing(fakeContext)
  expect(calls.traceStart.screenshots).toBe(true)
  expect(calls.traceStart.snapshots).toBe(true)

  await BP.stopContextTracing(fakeContext, "/tmp/trace.zip")
  expect(calls.traceStop.path).toBe("/tmp/trace.zip")
})
