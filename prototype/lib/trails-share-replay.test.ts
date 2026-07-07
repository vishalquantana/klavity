// KLA-84: replay wired into report/share path.
//
// Tests:
//   (A) run WITH replay → runsWithReplay detects it, replayUrl is built correctly
//   (B) run WITHOUT replay → runsWithReplay returns empty set → replayUrl null
//   (C) resolveShareToken + getReplay → replay data retrievable through share token
//   (D) resolveShareToken + getReplay for run with no replay → null (endpoint would 404)

import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-kla84-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")

let projectId: string
let trailId: string
let runId: string

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)

  projectId = "proj_kla84_" + Math.random().toString(36).slice(2)
  trailId = "trail_kla84_" + Math.random().toString(36).slice(2)
  runId = "run_kla84_" + Math.random().toString(36).slice(2)

  await db.execute({
    sql: `INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
    args: [projectId, "acct_kla84", "KLA-84 Test Project", Date.now(), Date.now()],
  })
  await db.execute({
    sql: `INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [trailId, projectId, "Test Trail", "smoke test", "https://example.com", "human", "active", Date.now(), Date.now()],
  })
  await db.execute({
    sql: `INSERT INTO trail_runs (id, trail_id, project_id, status, started_at, finished_at) VALUES (?,?,?,?,?,?)`,
    args: [runId, trailId, projectId, "green", Date.now() - 5000, Date.now()],
  })
})

const BASE = "https://klavity.in"

// ── (A) run WITH replay → replayUrl present ──────────────────────────────────
test("(A) KLA-84: run with replay → share mint flow exposes non-null replayUrl", async () => {
  const { saveReplay, runsWithReplay } = await import("./trails-replay")
  const { mintShareToken } = await import("./trails-share")

  await saveReplay(projectId, runId, [{ idx: 0, url: "https://example.com", events: [{ type: 4 }] }])

  const token = await mintShareToken(projectId, runId)
  const replaySet = await runsWithReplay(projectId, [runId])

  // Simulate what the share mint endpoint does
  const replayUrl = replaySet.has(runId) ? BASE + "/shared/walk-replay/" + token : null

  expect(replayUrl).not.toBeNull()
  expect(replayUrl).toMatch(/\/shared\/walk-replay\/[a-f0-9]{64}$/)
})

// ── (B) run WITHOUT replay → replayUrl null ──────────────────────────────────
test("(B) KLA-84: run without replay → replayUrl is null", async () => {
  const { runsWithReplay } = await import("./trails-replay")

  const noReplayRunId = "run_noreplay_" + Math.random().toString(36).slice(2)
  const replaySet = await runsWithReplay(projectId, [noReplayRunId])
  const replayUrl = replaySet.has(noReplayRunId) ? BASE + "/shared/walk-replay/sometoken" : null

  expect(replayUrl).toBeNull()
})

// ── (C) resolveShareToken + getReplay → segments returned ────────────────────
test("(C) KLA-84: share token resolves and replay segments are retrievable", async () => {
  const { mintShareToken, resolveShareToken } = await import("./trails-share")
  const { getReplay } = await import("./trails-replay")

  const token = await mintShareToken(projectId, runId)
  const resolved = await resolveShareToken(token)
  expect(resolved).not.toBeNull()
  expect(resolved!.runId).toBe(runId)

  // Simulate GET /shared/walk-replay/:token handler
  const segments = await getReplay(resolved!.projectId, resolved!.runId)
  expect(segments).not.toBeNull()
  expect(segments!.length).toBeGreaterThan(0)
  expect(segments![0].url).toBe("https://example.com")
})

// ── (D) resolveShareToken + getReplay for run with no replay → null ───────────
test("(D) KLA-84: getReplay returns null for run with no replay (handler returns 404)", async () => {
  const { reconnectDb } = await import("./db")
  const db = reconnectDb("file:" + file)
  const { mintShareToken, resolveShareToken } = await import("./trails-share")
  const { getReplay } = await import("./trails-replay")

  const emptyRunId = "run_empty_" + Math.random().toString(36).slice(2)
  await db.execute({
    sql: `INSERT INTO trail_runs (id, trail_id, project_id, status, started_at) VALUES (?,?,?,?,?)`,
    args: [emptyRunId, trailId, projectId, "green", Date.now()],
  })

  const token = await mintShareToken(projectId, emptyRunId)
  const resolved = await resolveShareToken(token)
  expect(resolved).not.toBeNull()

  const segments = await getReplay(resolved!.projectId, resolved!.runId)
  expect(segments).toBeNull()
})
