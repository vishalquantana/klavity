import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-trails-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")

let db: any
beforeAll(async () => {
  db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

test("applySchema creates all six Trail tables", async () => {
  const names = ["trails", "trail_steps", "locator_cache", "trail_runs", "run_steps", "findings"]
  for (const n of names) {
    const r = await db.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      args: [n],
    })
    expect(r.rows.length, `table ${n} should exist`).toBe(1)
  }
})

test("locator_cache enforces a UNIQUE cache_key", async () => {
  const idx = await db.execute({
    sql: "SELECT name FROM sqlite_master WHERE type='index' AND name='lc_key_uq'",
    args: [],
  })
  expect(idx.rows.length).toBe(1)
})
