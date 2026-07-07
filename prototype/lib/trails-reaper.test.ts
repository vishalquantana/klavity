// KLA-55: crash reaper + heartbeat — tests for boot recovery and stale-heartbeat sweep.
// All tests use an isolated file-based DB (standard test pattern).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-reaper-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-reaper-test-32bytesecrr").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
const {
  sweepOrphanedWalks, sweepOrphanedAuthorSessions,
  sweepStaleWalks, sweepStaleAuthorSessions,
  touchWalkHeartbeat, touchAuthorHeartbeat,
} = await import("./db")
const T = await import("./trails")

// db is captured here so tests always use the client set up by beforeAll — NOT the module
// singleton (which is undefined at top-level-await time, before beforeAll runs).
let testDb: any
beforeAll(async () => { testDb = reconnectDb("file:" + file); await applySchema(testDb); await migrateV2(testDb) })

// ── helpers ───────────────────────────────────────────────────────────────────────────────────────

async function insertRunningWalk(projectId: string, trailId: string): Promise<string> {
  // Insert a trail first (FK-less but keeps data consistent)
  await testDb.execute({ sql: `INSERT OR IGNORE INTO trails (id,project_id,name,intent,base_url,author_kind,status,created_at,updated_at) VALUES (?,?,'T','','https://x.test','human','active',1,1)`, args: [trailId, projectId] })
  return await T.startWalk(projectId, trailId, "manual")
}

async function insertRunningAuthorSession(projectId: string): Promise<string> {
  const id = "auth_" + crypto.randomUUID()
  const now = Date.now()
  await testDb.execute({
    sql: `INSERT INTO author_sessions (id,project_id,name,objective,base_url,status,created_by,created_at,updated_at) VALUES (?,?,'N','O','https://x.test','running',null,?,?)`,
    args: [id, projectId, now, now],
  })
  return id
}

async function walkStatus(runId: string): Promise<string | null> {
  const r = await testDb.execute({ sql: `SELECT status FROM trail_runs WHERE id=?`, args: [runId] })
  return r.rows.length ? String((r.rows[0] as any).status) : null
}
async function sessionStatus(id: string): Promise<string | null> {
  const r = await testDb.execute({ sql: `SELECT status FROM author_sessions WHERE id=?`, args: [id] })
  return r.rows.length ? String((r.rows[0] as any).status) : null
}
async function walkLastBeat(runId: string): Promise<number | null> {
  const r = await testDb.execute({ sql: `SELECT last_beat_at FROM trail_runs WHERE id=?`, args: [runId] })
  if (!r.rows.length) return null
  const v = (r.rows[0] as any).last_beat_at
  return v == null ? null : Number(v)
}
async function sessionLastBeat(id: string): Promise<number | null> {
  const r = await testDb.execute({ sql: `SELECT last_beat_at FROM author_sessions WHERE id=?`, args: [id] })
  if (!r.rows.length) return null
  const v = (r.rows[0] as any).last_beat_at
  return v == null ? null : Number(v)
}

// ── Boot recovery: walks ──────────────────────────────────────────────────────────────────────────

test("sweepOrphanedWalks: running walks become red with error message on boot", async () => {
  const runId = await insertRunningWalk("proj_boot", "trl_boot1")
  expect(await walkStatus(runId)).toBe("running")
  const { swept } = await sweepOrphanedWalks(testDb)
  expect(swept).toBeGreaterThanOrEqual(1)
  expect(await walkStatus(runId)).toBe("red")
  // finishWalk should have set finished_at
  const r = await testDb.execute({ sql: `SELECT finished_at, summary_json FROM trail_runs WHERE id=?`, args: [runId] })
  const row = r.rows[0] as any
  expect(Number(row.finished_at)).toBeGreaterThan(0)
  expect(String(row.summary_json)).toContain("restart")
})

test("sweepOrphanedWalks: already-finished walks are not touched", async () => {
  const runId = await insertRunningWalk("proj_boot", "trl_boot2")
  // Manually finish it first
  await T.finishWalk("proj_boot", runId, { status: "green", llmCalls: 0 })
  const { swept } = await sweepOrphanedWalks(testDb)
  // Still green — not re-swept
  expect(await walkStatus(runId)).toBe("green")
})

test("sweepOrphanedWalks: returns swept count of 0 when nothing is running", async () => {
  // Drain any remaining running walks first
  await sweepOrphanedWalks(testDb)
  const { swept } = await sweepOrphanedWalks(testDb)
  expect(swept).toBe(0)
})

// ── Boot recovery: author sessions ───────────────────────────────────────────────────────────────

test("sweepOrphanedAuthorSessions: running sessions become failed on boot", async () => {
  const sid = await insertRunningAuthorSession("proj_boot2")
  const { swept } = await sweepOrphanedAuthorSessions(testDb)
  expect(swept).toBeGreaterThanOrEqual(1)
  expect(await sessionStatus(sid)).toBe("failed")
  const r = await testDb.execute({ sql: `SELECT stall_reason FROM author_sessions WHERE id=?`, args: [sid] })
  expect(String((r.rows[0] as any).stall_reason)).toContain("restart")
})

// ── Heartbeat: touches ────────────────────────────────────────────────────────────────────────────

test("touchWalkHeartbeat sets last_beat_at on the walk row", async () => {
  const runId = await insertRunningWalk("proj_beat", "trl_beat1")
  expect(await walkLastBeat(runId)).toBeNull()
  const before = Date.now()
  await touchWalkHeartbeat(runId, testDb)
  const beat = await walkLastBeat(runId)
  expect(beat).not.toBeNull()
  expect(beat!).toBeGreaterThanOrEqual(before)
})

test("touchWalkHeartbeat is a no-op on finished walks (does not throw)", async () => {
  const runId = await insertRunningWalk("proj_beat", "trl_beat2")
  await T.finishWalk("proj_beat", runId, { status: "green", llmCalls: 0 })
  // Should not throw
  await expect(touchWalkHeartbeat(runId, testDb)).resolves.toBeUndefined()
})

test("touchAuthorHeartbeat sets last_beat_at on the session row", async () => {
  const sid = await insertRunningAuthorSession("proj_beat2")
  expect(await sessionLastBeat(sid)).toBeNull()
  const before = Date.now()
  await touchAuthorHeartbeat(sid, testDb)
  const beat = await sessionLastBeat(sid)
  expect(beat).not.toBeNull()
  expect(beat!).toBeGreaterThanOrEqual(before)
})

// ── Stale-heartbeat reaper ────────────────────────────────────────────────────────────────────────

test("sweepStaleWalks: reaps running walk with old heartbeat", async () => {
  const runId = await insertRunningWalk("proj_stale", "trl_stale1")
  // Manually set an ancient beat
  const ancient = Date.now() - 10 * 60 * 1000  // 10 minutes ago
  await testDb.execute({ sql: `UPDATE trail_runs SET last_beat_at=? WHERE id=?`, args: [ancient, runId] })
  const { swept } = await sweepStaleWalks(testDb, 3 * 60 * 1000)
  expect(swept).toBeGreaterThanOrEqual(1)
  expect(await walkStatus(runId)).toBe("red")
})

test("sweepStaleWalks: does NOT reap running walk with recent heartbeat", async () => {
  const runId = await insertRunningWalk("proj_stale", "trl_stale2")
  await touchWalkHeartbeat(runId, testDb)  // fresh beat
  const { swept } = await sweepStaleWalks(testDb, 3 * 60 * 1000)
  // This walk should survive (beat is < 3min ago)
  expect(await walkStatus(runId)).toBe("running")
})

test("sweepStaleWalks: does NOT reap running walk with NO heartbeat (pre-KLA-55 row)", async () => {
  const runId = await insertRunningWalk("proj_stale", "trl_stale3")
  // No beat set — leave it null
  const { swept } = await sweepStaleWalks(testDb, 3 * 60 * 1000)
  // Pre-heartbeat rows are exempt from the stale sweep (only boot sweep handles them)
  expect(await walkStatus(runId)).toBe("running")
})

test("sweepStaleWalks: reaper sets finished_at and summary error message", async () => {
  const runId = await insertRunningWalk("proj_stale", "trl_stale4")
  const ancient = Date.now() - 10 * 60 * 1000
  await testDb.execute({ sql: `UPDATE trail_runs SET last_beat_at=? WHERE id=?`, args: [ancient, runId] })
  await sweepStaleWalks(testDb, 3 * 60 * 1000)
  const r = await testDb.execute({ sql: `SELECT finished_at, summary_json FROM trail_runs WHERE id=?`, args: [runId] })
  const row = r.rows[0] as any
  expect(Number(row.finished_at)).toBeGreaterThan(0)
  expect(String(row.summary_json)).toMatch(/crash|stale|heartbeat|process/i)
})

test("sweepStaleAuthorSessions: reaps running session with stale heartbeat", async () => {
  const sid = await insertRunningAuthorSession("proj_stale2")
  const ancient = Date.now() - 10 * 60 * 1000
  await testDb.execute({ sql: `UPDATE author_sessions SET last_beat_at=? WHERE id=?`, args: [ancient, sid] })
  const { swept } = await sweepStaleAuthorSessions(testDb, 3 * 60 * 1000)
  expect(swept).toBeGreaterThanOrEqual(1)
  expect(await sessionStatus(sid)).toBe("failed")
})

test("sweepStaleAuthorSessions: does NOT reap session with recent heartbeat", async () => {
  const sid = await insertRunningAuthorSession("proj_stale2")
  await touchAuthorHeartbeat(sid, testDb)  // fresh beat
  await sweepStaleAuthorSessions(testDb, 3 * 60 * 1000)
  expect(await sessionStatus(sid)).toBe("running")
})

test("sweepStaleAuthorSessions: does NOT reap session with no heartbeat (pre-KLA-55)", async () => {
  const sid = await insertRunningAuthorSession("proj_stale2")
  // No beat
  await sweepStaleAuthorSessions(testDb, 3 * 60 * 1000)
  expect(await sessionStatus(sid)).toBe("running")
})

test("sweepStaleAuthorSessions: sets stall_reason on reaped session", async () => {
  const sid = await insertRunningAuthorSession("proj_stale3")
  const ancient = Date.now() - 10 * 60 * 1000
  await testDb.execute({ sql: `UPDATE author_sessions SET last_beat_at=? WHERE id=?`, args: [ancient, sid] })
  await sweepStaleAuthorSessions(testDb, 3 * 60 * 1000)
  const r = await testDb.execute({ sql: `SELECT stall_reason FROM author_sessions WHERE id=?`, args: [sid] })
  expect(String((r.rows[0] as any).stall_reason)).toMatch(/crash|stale|heartbeat/i)
})

// ── startCrashReaper returns a clearable handle ───────────────────────────────────────────────────

test("startCrashReaper returns an object with a stop() method", async () => {
  const { startCrashReaper } = await import("./trails-reaper")
  const handle = startCrashReaper(testDb, 60_000)
  expect(typeof handle.stop).toBe("function")
  handle.stop()  // must not throw
})
