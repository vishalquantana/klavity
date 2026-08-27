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

const { db, applySchema, migrateV2, insertFeedback, updateFeedbackTitle, setFeedbackObservation, updateFeedbackMeta, upsertPersona, deletePersona } = await import("./db")
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

  // Residual b: monotonic. If the stored updated_at is already in the FUTURE (clock rollback / same-ms),
  // MAX(updated_at+1, now) must STILL strictly advance it (→ old+1), never leave it unchanged.
  test("updated_at is MONOTONIC — a future/same-ms value still advances (old+1)", async () => {
    const id = await insertFeedback({ projectId: PROJECT, observation: "x", source: "widget", reportType: "bug" } as any)
    const future = Date.now() + 5_000_000 // far ahead of `now`
    await db!.execute({ sql: "UPDATE feedback SET updated_at=? WHERE id=?", args: [future, id] })
    await setFeedbackObservation(id, PROJECT, "edited again")
    const after = await updatedAt(id)
    // NEG-CONTROL: a plain `updated_at = now` would REGRESS to `now` (< future) → stale-again; MAX(old+1,now)
    // yields old+1.
    expect(after!).toBe(future + 1)
  })
})

describe("C2-5 round-4 — updateFeedbackMeta + beyond-version-max monotonicity", () => {
  // (a) the normal dashboard PATCH must bust the card even under a frozen/rolled-back clock.
  test("updateFeedbackMeta advances updated_at beyond a future value (frozen-clock PATCH still busts)", async () => {
    const id = await insertFeedback({ projectId: PROJECT, observation: "x", source: "widget", reportType: "bug" } as any)
    const future = Date.now() + 5_000_000
    await db!.execute({ sql: "UPDATE feedback SET updated_at=? WHERE id=?", args: [future, id] })
    await updateFeedbackMeta(PROJECT, id, { priority: "high" })
    const after = await updatedAt(id)
    // NEG-CONTROL: plain `updated_at = now` would REGRESS to now (< future) → stale card. Monotonic → future+1.
    expect(after!).toBe(future + 1)
  })

  // (b) a dominant last_seen_at (recurrence) must not leave the version (MAX of all three) unchanged.
  test("edit with dominant last_seen_at still advances the version beyond last_seen_at", async () => {
    const id = await insertFeedback({ projectId: PROJECT, observation: "x", source: "widget", reportType: "bug" } as any)
    const lastSeen = Date.now() + 9_000_000 // recurrence pushed last_seen_at far into the future
    await db!.execute({ sql: "UPDATE feedback SET updated_at=?, last_seen_at=? WHERE id=?", args: [1_000, lastSeen, id] })
    await updateFeedbackTitle(id, PROJECT, "AI title")
    const after = await updatedAt(id)
    // NEG-CONTROL: MAX(updated_at+1, now) would give ~now < last_seen_at → version (=last_seen_at) UNCHANGED
    // → stale card. Beyond-max monotonic → last_seen_at+1, so the version strictly advances.
    expect(after!).toBe(lastSeen + 1)
  })
})

describe("C2-5 residual a — persona edits/deletes bust the linked Sim OG card", () => {
  const persona = (name: string) => ({ name, role: "Buyer", type: "user", initials: "SX", accent: "#123456", summary: "", insights: [] } as any)

  test("upsertPersona (edit) advances updated_at on every feedback that cites the Sim", async () => {
    const simId = "sim_edit_" + Math.random().toString(36).slice(2)
    await upsertPersona(simId, PROJECT, persona("Sarah Chen"))
    const id = await insertFeedback({ projectId: PROJECT, simId, source: "sim", reportType: "bug", observation: "finding" } as any)
    await db!.execute({ sql: "UPDATE feedback SET updated_at=? WHERE id=?", args: [1_000, id] })
    const before = await updatedAt(id)
    await upsertPersona(simId, PROJECT, persona("Sarah C. (edited)")) // edit the persona name
    const after = await updatedAt(id)
    // NEG-CONTROL: pre-fix, only personas.updated_at moved → the Sim card stayed cached with the OLD name.
    expect(after!).toBeGreaterThan(before!)
  })

  test("deletePersona advances updated_at on every citing feedback (re-render as generic Sim)", async () => {
    const simId = "sim_del_" + Math.random().toString(36).slice(2)
    await upsertPersona(simId, PROJECT, persona("Temp Sim"))
    const id = await insertFeedback({ projectId: PROJECT, simId, source: "sim", reportType: "bug", observation: "finding" } as any)
    await db!.execute({ sql: "UPDATE feedback SET updated_at=? WHERE id=?", args: [1_000, id] })
    const before = await updatedAt(id)
    await deletePersona(simId, PROJECT)
    const after = await updatedAt(id)
    expect(after!).toBeGreaterThan(before!)
  })
})
