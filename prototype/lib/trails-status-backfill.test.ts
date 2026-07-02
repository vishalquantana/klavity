// AutoSims F1 — C1 regression fix: trails_status_backfill_2026_07_03
// Hermetic local libsql. Tests the backfillTrailStatus guard logic:
//   (a) pre-existing draft trail with no author_session → promoted to active
//   (b) draft trail referenced by an author_sessions row → stays draft (intentional LLM draft)
//   (c) already-active trail → stays active
//   Second run is a no-op (marker respected); a new draft-no-session trail created between runs
//   is NOT activated by the second run.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-trail-backfill-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2, backfillTrailStatus } = await import("./db")

const db = reconnectDb("file:" + file)

beforeAll(async () => {
  await applySchema(db)
  await migrateV2(db)
})

function now() { return Date.now() }

async function insertTrail(id: string, status: "draft" | "active") {
  await db.execute({
    sql: `INSERT INTO trails (id, project_id, name, intent, base_url, status, created_at, updated_at)
          VALUES (?, 'proj_backfill', ?, '', 'https://test/', ?, ?, ?)`,
    args: [id, id, status, now(), now()],
  })
}

async function insertAuthorSession(sessionId: string, trailId: string) {
  await db.execute({
    sql: `INSERT INTO author_sessions (id, project_id, name, objective, base_url, status, created_at, updated_at, trail_id)
          VALUES (?, 'proj_backfill', 'n', 'o', 'https://test/', 'crystallized', ?, ?, ?)`,
    args: [sessionId, now(), now(), trailId],
  })
}

async function getTrailStatus(id: string): Promise<string | null> {
  const r = await db.execute({ sql: "SELECT status FROM trails WHERE id=?", args: [id] })
  return r.rows.length ? String((r.rows[0] as any).status) : null
}

test("C1 backfill: pre-existing draft (no session) → active, draft with session → stays draft, active → stays active", async () => {
  // (a) Pre-existing draft trail with no author_session
  await insertTrail("trail_pre_draft", "draft")
  // (b) Draft trail referenced by an author_sessions row (intentional LLM draft)
  await insertTrail("trail_llm_draft", "draft")
  await insertAuthorSession("sess_llm", "trail_llm_draft")
  // (c) Already-active trail
  await insertTrail("trail_active", "active")

  const { activated } = await backfillTrailStatus(db)

  expect(activated).toBe(1)                        // only trail_pre_draft promoted
  expect(await getTrailStatus("trail_pre_draft")).toBe("active")   // (a) promoted
  expect(await getTrailStatus("trail_llm_draft")).toBe("draft")    // (b) protected
  expect(await getTrailStatus("trail_active")).toBe("active")      // (c) unchanged
})

test("C1 backfill: second run is a no-op (marker respected); new draft-no-session NOT activated", async () => {
  // Add a fresh draft trail with no session AFTER the first backfill
  await insertTrail("trail_post_backfill_draft", "draft")

  // Second run of backfillTrailStatus — marker should stop it cold
  const { activated } = await backfillTrailStatus(db)

  expect(activated).toBe(0)                        // marker prevents re-running
  // The trail created after the first backfill is NOT activated
  expect(await getTrailStatus("trail_post_backfill_draft")).toBe("draft")
})
