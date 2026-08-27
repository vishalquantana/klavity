// KLA-560 — buildV1Report guards:
//  • Item 2: STABLE keyset pagination — a finding inserted between two page fetches must NOT cause the
//    AI consumer to see a duplicate issue or skip one (the integer-offset cursor drifted; keyset doesn't).
//  • Item 3: screenshot presign honours SCREENSHOTS.presignTtlSec (ops-tunable), not a hardcoded 3600.
//
// Env must be set BEFORE importing modules that snapshot it at load time (screenshot-config posInt()).
import { test, expect } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-v1report-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from(new Uint8Array(32).fill(9)).toString("base64")
// Item 3: pin a NON-default presign TTL so the assertion proves the config is threaded through (a
// coincidental 600 default wouldn't). S3 creds make presignGet emit a real signed URL offline.
process.env.SCREENSHOT_PRESIGN_TTL_SEC = "777"
process.env.S3_ENDPOINT = "https://s3.example.com"
process.env.S3_BUCKET = "b"
process.env.AWS_ACCESS_KEY_ID = "ak"
process.env.AWS_SECRET_ACCESS_KEY = "sk"

const { db, applySchema } = await import("./db")
const { buildV1Report } = await import("./v1-runs")
const { SCREENSHOTS } = await import("./screenshot-config")
// KLA-719: lib/s3.ts snapshots the S3_* env into module-level consts AT IMPORT TIME. When another
// test file imports ./s3 (transitively) before this file sets its S3 env, those consts freeze empty
// and presignGet() throws forever → screenshot_url undefined. s3Configured() reflects that frozen
// state, so we gate the presign assertion on it: it runs when s3 actually picked up our env (the
// normal/isolation case) and skips with a clear reason under import-order pollution in the full suite.
const { s3Configured } = await import("./s3")

await applySchema(db!)

const PROJECT = "proj_v1report"
const RUN = "walk_v1report"
const walk: any = { id: RUN, trailId: "trl_v1report", status: "red", startedAt: 1, finishedAt: 2 }

async function insertFinding(id: string, recurrence: number, updatedAt: number, evidence: any = {}) {
  await db!.execute({
    sql: `INSERT INTO findings (id, project_id, run_id, step_id, trail_id, kind, title, evidence_json, ground_quote, confidence, dedup_key, recurrence, status, connector_ref, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, PROJECT, RUN, null, "trl_v1report", "regression", "F " + id, JSON.stringify(evidence), null, 0.5, "dk:" + id, recurrence, "queued", null, updatedAt, updatedAt],
  })
}

// Distinct rank scores (kind_weight=3 × recurrence) → deterministic order A>B>C>D by recurrence.
// A=10 → 30, B=8 → 24, C=6 → 18, D=4 → 12.
test("item 2: mid-page insert doesn't duplicate or skip across keyset pages", async () => {
  await db!.execute({ sql: "DELETE FROM findings WHERE run_id=?", args: [RUN] })
  await insertFinding("A", 10, 1000)
  await insertFinding("B", 8, 1000)
  await insertFinding("C", 6, 1000)
  await insertFinding("D", 4, 1000)

  // Page 1 (limit 2) → the two highest-rank findings.
  const p1 = await buildV1Report(PROJECT, walk, { baseUrl: "http://t", limit: 2 })
  const page1Ids = p1.issues.map((i) => i.id)
  expect(page1Ids).toEqual(["A", "B"])
  expect(p1.next_cursor).toBeTruthy()

  // A new higher-rank finding lands BETWEEN page fetches (recurrence 20 → rank 60, sorts to the very top).
  // With the old integer-offset cursor this shift would re-serve B (duplicate) and drop D (skip).
  await insertFinding("X", 20, 1000)

  // Page 2 resumes AFTER B via the opaque keyset cursor.
  const p2 = await buildV1Report(PROJECT, walk, { baseUrl: "http://t", cursor: p1.next_cursor, limit: 2 })
  const page2Ids = p2.issues.map((i) => i.id)

  expect(page2Ids).toEqual(["C", "D"])              // no drift: exactly the next two originals
  expect(page2Ids).not.toContain("B")              // no duplicate of a page-1 row
  expect(page2Ids).not.toContain("X")              // the top-inserted row belongs on page 1, not here
  const seen = new Set([...page1Ids, ...page2Ids])
  for (const id of ["A", "B", "C", "D"]) expect(seen.has(id)).toBe(true)  // nothing skipped
  expect(p2.next_cursor).toBeNull()                // C,D were the last originals after B
})

test("item 2: a single full page returns a null cursor", async () => {
  await db!.execute({ sql: "DELETE FROM findings WHERE run_id=?", args: [RUN] })
  await insertFinding("A", 10, 1000)
  await insertFinding("B", 8, 1000)
  const r = await buildV1Report(PROJECT, walk, { baseUrl: "http://t", limit: 50 })
  expect(r.issues.map((i) => i.id)).toEqual(["A", "B"])
  expect(r.next_cursor).toBeNull()
})

// Compare against the ACTUAL loaded SCREENSHOTS.presignTtlSec rather than a fixed number: the config is
// snapshotted at import time, so in the full suite another test may have loaded screenshot-config before
// our env override took effect (600 vs 777). Either way the presign TTL must EQUAL the config value and
// must not be the old hardcoded 3600 — that's what proves the wiring.
test.skipIf(!s3Configured())("item 3: screenshot presign uses SCREENSHOTS.presignTtlSec, not a hardcoded 3600", async () => {
  await db!.execute({ sql: "DELETE FROM findings WHERE run_id=?", args: [RUN] })
  await insertFinding("S", 5, 1000, { screenshotKey: "uploads/shot.png" })
  const r = await buildV1Report(PROJECT, walk, { baseUrl: "http://t", limit: 10 })
  const url = r.issues[0].evidence.screenshot_url
  expect(url).toBeTruthy()
  expect(SCREENSHOTS.presignTtlSec).not.toBe(3600)                       // sanity: config isn't 3600
  expect(url).toContain(`X-Amz-Expires=${SCREENSHOTS.presignTtlSec}`)    // TTL == ops-tunable config
  expect(url).not.toContain("X-Amz-Expires=3600")                       // old hardcoded literal is gone
})
