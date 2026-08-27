// KLA-739 (C2-5) — the OG cache version folds MAX(updated_at,last_seen_at,created_at). For that to bust
// the immutable PNG on a card-visible edit, the two async content mutators MUST advance updated_at.
// NEG-CONTROL: without the fix, updateFeedbackTitle / setFeedbackObservation leave updated_at unchanged
// (an async AI-title job after the fallback-title pre-render → stale 1yr PNG). These assert it advances.

import { test, expect, describe } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}_${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-og-c2-5-${RUN}.db`)
for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} }

process.env.TURSO_DATABASE_URL = "file:" + DB_FILE
process.env.TURSO_AUTH_TOKEN = ""

const { db, applySchema, migrateV2, insertFeedback, updateFeedbackTitle, setFeedbackObservation } = await import("./db")
await applySchema(db!)
await migrateV2(db!)

const PROJECT = "proj_c2_5"

async function updatedAt(id: string): Promise<number | null> {
  const r = await db!.execute({ sql: "SELECT updated_at FROM feedback WHERE id=? LIMIT 1", args: [id] })
  const v = (r.rows[0] as any)?.updated_at
  return v == null ? null : Number(v)
}

describe("C2-5 — card-visible mutators advance updated_at (OG cache-bust)", () => {
  test("updateFeedbackTitle advances updated_at (async AI title busts the OG key)", async () => {
    // Screenshot-only report inserted with NO title → the async title job will fill it later.
    const id = await insertFeedback({ projectId: PROJECT, observation: "screenshot-only body", source: "widget", reportType: "bug" } as any)
    // Simulate the fallback-title OG pre-render already having happened against the current version.
    await db!.execute({ sql: "UPDATE feedback SET updated_at=? WHERE id=?", args: [1_000, id] })
    const before = await updatedAt(id)
    const ok = await updateFeedbackTitle(id, PROJECT, "AI-generated real title")
    expect(ok).toBe(true)
    const after = await updatedAt(id)
    // NEG-CONTROL: pre-fix `after` would still be 1000 (title changed, version inputs unchanged → stale PNG).
    expect(after).not.toBeNull()
    expect(after!).toBeGreaterThan(before!)
  })

  test("setFeedbackObservation advances updated_at (edited description busts the OG key)", async () => {
    const id = await insertFeedback({ projectId: PROJECT, observation: "orig body", source: "widget", reportType: "bug" } as any)
    await db!.execute({ sql: "UPDATE feedback SET updated_at=? WHERE id=?", args: [1_000, id] })
    const before = await updatedAt(id)
    await setFeedbackObservation(id, PROJECT, "edited body with new visible content")
    const after = await updatedAt(id)
    expect(after).not.toBeNull()
    expect(after!).toBeGreaterThan(before!)
  })
})
