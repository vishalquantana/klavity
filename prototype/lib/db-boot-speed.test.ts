// Tests for fast-boot schema migration (KLA-boot-speed):
// applySchema must issue zero ALTER TABLE statements on an established DB.
// Each ALTER that fires is a round-trip to remote Turso; 50+ serial round-trips ≈ 40s boot.
// After the fix, established DBs complete all column checks in one parallel PRAGMA batch.
import { expect, test, describe, mock } from "bun:test"
import { createClient } from "@libsql/client"
import { applySchema, loadTableColumns } from "./db"

// ── helpers ────────────────────────────────────────────────────────────────────

async function freshDb() {
  return createClient({ url: ":memory:" })
}

// ── loadTableColumns ───────────────────────────────────────────────────────────

describe("loadTableColumns", () => {
  test("returns full column set for an existing table", async () => {
    const c = await freshDb()
    await c.execute("CREATE TABLE foo (id TEXT PRIMARY KEY, name TEXT, val INTEGER)")
    const m = await loadTableColumns(c, ["foo"])
    const cols = m.get("foo")!
    expect(cols.has("id")).toBe(true)
    expect(cols.has("name")).toBe(true)
    expect(cols.has("val")).toBe(true)
    expect(cols.size).toBe(3)
  })

  test("returns empty set for a nonexistent table (no throw)", async () => {
    const c = await freshDb()
    const m = await loadTableColumns(c, ["ghost_table"])
    expect(m.get("ghost_table")?.size).toBe(0)
  })

  test("loads multiple tables in parallel and returns all", async () => {
    const c = await freshDb()
    await c.execute("CREATE TABLE t1 (a TEXT, b TEXT)")
    await c.execute("CREATE TABLE t2 (x INTEGER, y INTEGER, z INTEGER)")
    const m = await loadTableColumns(c, ["t1", "t2", "missing"])
    expect(m.get("t1")?.size).toBe(2)
    expect(m.get("t2")?.size).toBe(3)
    expect(m.get("missing")?.size).toBe(0)
  })
})

// ── applySchema on established DB issues zero ALTERs ──────────────────────────

describe("applySchema — established DB boot speed", () => {
  test("issues zero ALTER TABLE statements when all columns already exist", async () => {
    const c = await freshDb()

    // Round 1: bring the schema fully up to date.
    await applySchema(c)

    // Instrument execute to count ALTER calls.
    const origExecute = c.execute.bind(c)
    let alterCount = 0
    c.execute = (async (sql: any, ...rest: any[]) => {
      const sqlStr = typeof sql === "string" ? sql : sql?.sql ?? ""
      if (/^\s*ALTER\s+TABLE/i.test(sqlStr)) alterCount++
      return origExecute(sql, ...rest)
    }) as any

    // Round 2: simulate a second boot (established DB).
    await applySchema(c)

    expect(alterCount).toBe(0)
  })

  test("applies all expected columns on a fresh DB", async () => {
    const c = await freshDb()
    await applySchema(c)

    // Spot-check a representative column from every table in the ALTER block.
    const checks: Array<[string, string]> = [
      ["sim_traits",      "scope"],
      ["trait_events",    "actor"],
      ["personas",        "sim_class"],
      ["feedback",        "recurrence_count"],
      ["feedback",        "contact_email"],
      ["projects",        "widget_mode"],
      ["projects",        "trails_autofile_enabled"],
      ["trails",          "viewport_json"],
      ["trails",          "step_version"],
      ["trails",          "environments_json"],
      ["trail_runs",      "trail_version"],
      ["trail_runs",      "last_beat_at"],
      ["trail_runs",      "paused_secret_key"],
      ["trail_steps",     "timeout_ms"],
      ["findings",        "connector_error"],
      ["findings",        "content_sig"],
      ["findings",        "severity"],
      ["findings",        "priority"],
      ["findings",        "expectation_id"],    // KLA-243: finding↔expectation linkage
      ["expectations",    "saves_count"],        // KLA-243: guard-caught regression counter
      ["expectations",    "source_ticket_id"],   // KLA-242: guard-this-fix ticket back-link
      ["author_sessions", "checkpoint_json"],
      ["author_sessions", "objective_verified"],
      ["walk_share_tokens", "revoked_at"],
      ["walk_share_tokens", "passcode_hash"],   // KLA-210 (JTBD 7.5): share-manager passcode gate
      ["walk_share_tokens", "last_viewed_at"],  // KLA-210 (JTBD 7.5): view signal
      ["walk_share_tokens", "view_count"],      // KLA-210 (JTBD 7.5): view signal
    ]
    const colMap = await loadTableColumns(c, [...new Set(checks.map(([t]) => t))])
    for (const [table, col] of checks) {
      expect(colMap.get(table)?.has(col)).toBe(true)
    }
  })
})
