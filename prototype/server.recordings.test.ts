// KLAVITYKLA-438 "Record me" (Phase 1) — recordings storage.
// Exercises the db seam the /api/feedback intake writes to: a report carrying recording descriptors
// persists a recordings_json row that reads back as a parsed array (with the stable per-recording `id`
// a Phase 2 transcript will reference). Uses the reconnectDb+applySchema temp-DB pattern (server.dedup).
import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { reconnectDb, applySchema, insertFeedback, feedbackById } from "./lib/db"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const dbFile = join(tmpdir(), `klav-recordings-${ts}.db`)
const rawClient = createClient({ url: "file:" + dbFile })
const NOW = Date.now()
const P = `proj_rec_${ts}`

beforeAll(async () => {
  reconnectDb("file:" + dbFile)
  const c = createClient({ url: "file:" + dbFile })
  await applySchema(c) // creates feedback + ALTERs recordings_json in, exactly like initDb on prod
  c.close()
  await rawClient.execute({
    sql: `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
    args: [],
  })
  await rawClient.execute({ sql: `INSERT OR IGNORE INTO projects (id, account_id, name, created_at, updated_at) VALUES (?,?,?,?,?)`, args: [P, "acct_test", "Rec Project", NOW, NOW] })
})

afterAll(() => { rawClient.close() })

test("recordings_json column exists on the feedback table", async () => {
  const info = await rawClient.execute("PRAGMA table_info(feedback)")
  const cols = info.rows.map((r: any) => String(r.name))
  expect(cols).toContain("recordings_json")
})

test("a report with a recording persists a recordings_json row that reads back parsed", async () => {
  const rec = {
    id: "rec_abc123",
    key: "klavity/attachments/2026/rec.webm",
    contentType: "video/webm",
    bytes: 15 * 1024 * 1024,
    durationMs: 41000,
    w: 1280, h: 720,
    screenOnly: false,
  }
  const id = await insertFeedback({
    projectId: P,
    observation: "coupon does nothing on mobile cart",
    recordings: [rec],
  })
  // Raw column is JSON-serialized (not null).
  const raw = await rawClient.execute({ sql: "SELECT recordings_json FROM feedback WHERE id=?", args: [id] })
  expect(raw.rows[0]).toBeTruthy()
  const stored = JSON.parse(String((raw.rows[0] as any).recordings_json))
  expect(stored).toHaveLength(1)
  expect(stored[0].id).toBe("rec_abc123") // stable Phase 2 transcript ref survives the round-trip
  expect(stored[0].durationMs).toBe(41000)

  // The enriched read object exposes it as a parsed array.
  const row = await feedbackById(P, id)
  expect(Array.isArray(row.recordings)).toBe(true)
  expect(row.recordings[0].key).toBe(rec.key)
  expect(row.recordings[0].screenOnly).toBe(false)
})

test("a report with no recording leaves recordings_json null (back-compat)", async () => {
  const id = await insertFeedback({ projectId: P, observation: "no clip here" })
  const raw = await rawClient.execute({ sql: "SELECT recordings_json FROM feedback WHERE id=?", args: [id] })
  expect((raw.rows[0] as any).recordings_json).toBeNull()
  const row = await feedbackById(P, id)
  expect(row.recordings == null || (Array.isArray(row.recordings) && row.recordings.length === 0)).toBe(true)
})
