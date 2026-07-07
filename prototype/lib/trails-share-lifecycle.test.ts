// KLA-121: share-token lifecycle — revoke, list, purge.
// Tests:
//   (A) A minted token resolves correctly; revoking it makes resolveShareToken return null.
//   (B) listShareTokens returns active tokens; revoked tokens are not listed.
//   (C) purgeExpiredShareTokens removes expired AND revoked rows; leaves active rows.
//   (D) Revoking a non-existent / already-revoked token returns false (idempotent guard).

import { test, expect, beforeAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomBytes } from "node:crypto"

const ts = `${Date.now()}-${randomBytes(4).toString("hex")}`
const dbFile = join(tmpdir(), `klav-share-lifecycle-${ts}.db`)

// ── Wire in the module-level db ────────────────────────────────────────────
import { reconnectDb, applySchema, migrateV2 } from "./db"

let db: Awaited<ReturnType<typeof reconnectDb>>

beforeAll(async () => {
  db = reconnectDb("file:" + dbFile)
  await applySchema(db)
  await migrateV2(db)

  // Seed minimal project + trail so FK constraints don't complain if FK enforcement is on.
  const NOW = Date.now()
  const acctId = `acct_sl_${ts}`
  const projId = `proj_sl_${ts}`
  const trailId = `trail_sl_${ts}`
  const runId = `run_sl_${ts}`

  await db.execute({ sql: `INSERT INTO users (email, created_at) VALUES (?, ?)`, args: [`sl-${ts}@test.local`, NOW] })
  await db.execute({ sql: `INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, args: [acctId, "SL Workspace", `sl-${ts}@test.local`, NOW] })
  await db.execute({ sql: `INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [projId, acctId, "SL Project", "active", "auto", 200, "named", NOW, NOW] })
  await db.execute({ sql: `INSERT INTO trails (id, project_id, name, base_url, author_kind, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, args: [trailId, projId, "SL Trail", "https://example.com", "human", "active", NOW, NOW] })
  await db.execute({ sql: `INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, started_at, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [runId, trailId, projId, "manual", "green", NOW - 30_000, NOW - 5000] })

  // Store on global so tests can reference
  ;(globalThis as any)._sl = { projId, runId }
})

// Re-import the library functions AFTER reconnectDb so they pick up the patched db module.
const { mintShareToken, resolveShareToken, revokeShareToken, listShareTokens, purgeExpiredShareTokens } =
  await import("./trails-share")

// ── (A) Revoke makes token invalid ─────────────────────────────────────────
test("(A) KLA-121: revoking a share token makes resolveShareToken return null", async () => {
  const { projId, runId } = (globalThis as any)._sl
  const rawToken = await mintShareToken(projId, runId, "tester@test.local")

  // Freshly minted token resolves
  const before = await resolveShareToken(rawToken)
  expect(before).not.toBeNull()
  expect(before!.runId).toBe(runId)

  // Find the token id from the db
  const r = await db.execute({ sql: `SELECT id FROM walk_share_tokens WHERE project_id = ? AND run_id = ? AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1`, args: [projId, runId] })
  expect(r.rows.length).toBeGreaterThan(0)
  const tokenId = String((r.rows[0] as any).id)

  const ok = await revokeShareToken(tokenId)
  expect(ok).toBe(true)

  // After revocation, resolveShareToken returns null
  const after = await resolveShareToken(rawToken)
  expect(after).toBeNull()
})

// ── (B) List returns active tokens, not revoked ones ───────────────────────
test("(B) KLA-121: listShareTokens returns active tokens and excludes revoked", async () => {
  const { projId, runId } = (globalThis as any)._sl

  // Mint two new tokens
  await mintShareToken(projId, runId, "a@test.local")
  await mintShareToken(projId, runId, "b@test.local")

  const listBefore = await listShareTokens(projId, runId)
  const countBefore = listBefore.length
  expect(countBefore).toBeGreaterThanOrEqual(2)

  // Revoke the most recent one
  const toRevoke = listBefore[0].id
  await revokeShareToken(toRevoke)

  const listAfter = await listShareTokens(projId, runId)
  expect(listAfter.length).toBe(countBefore - 1)
  expect(listAfter.find((t) => t.id === toRevoke)).toBeUndefined()
})

// ── (C) Purge removes expired + revoked, leaves active ─────────────────────
test("(C) KLA-121: purgeExpiredShareTokens removes expired and revoked rows, leaves active", async () => {
  const { projId, runId } = (globalThis as any)._sl
  const NOW = Date.now()

  // Insert an already-expired token directly
  const expiredId = `wst_exp_${ts}`
  await db.execute({
    sql: `INSERT INTO walk_share_tokens (id, token_hash, run_id, project_id, created_by, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [expiredId, `deadbeef_expired_${ts}`, runId, projId, null, NOW - 1000, NOW - 2000],
  })

  // Insert a revoked token directly
  const revokedId = `wst_rev_${ts}`
  await db.execute({
    sql: `INSERT INTO walk_share_tokens (id, token_hash, run_id, project_id, created_by, expires_at, created_at, revoked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [revokedId, `deadbeef_revoked_${ts}`, runId, projId, null, NOW + 86400_000, NOW - 1000, NOW - 500],
  })

  // Mint one active token
  const activeRaw = await mintShareToken(projId, runId, "active@test.local")

  const purged = await purgeExpiredShareTokens(NOW)
  expect(purged).toBeGreaterThanOrEqual(2) // at minimum the 2 rows we just inserted

  // The active token must still resolve
  const resolved = await resolveShareToken(activeRaw)
  expect(resolved).not.toBeNull()
  expect(resolved!.runId).toBe(runId)

  // The expired and revoked rows must be gone
  const check = await db.execute({
    sql: `SELECT id FROM walk_share_tokens WHERE id IN (?, ?)`,
    args: [expiredId, revokedId],
  })
  expect(check.rows.length).toBe(0)
})

// ── (D) Revoking already-revoked / non-existent returns false ──────────────
test("(D) KLA-121: revokeShareToken returns false for non-existent or already-revoked token", async () => {
  // Non-existent id
  const r1 = await revokeShareToken("wst_does_not_exist_kla121")
  expect(r1).toBe(false)

  // Already-revoked (from test A — its id was revoked there)
  const { projId, runId } = (globalThis as any)._sl
  const r2 = await db.execute({ sql: `SELECT id FROM walk_share_tokens WHERE project_id = ? AND run_id = ? AND revoked_at IS NOT NULL LIMIT 1`, args: [projId, runId] })
  if (r2.rows.length > 0) {
    const alreadyRevokedId = String((r2.rows[0] as any).id)
    const r3 = await revokeShareToken(alreadyRevokedId)
    expect(r3).toBe(false)
  }
})
