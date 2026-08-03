// KLAVITYKLA — consumeSsoState() race-condition fix.
// Hermetic: points module's `db` singleton at a fresh LOCAL libsql file by setting
// TURSO_DATABASE_URL *before* importing ./db (matches db.connectors.test.ts pattern).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-ssostate-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2, createSsoState, consumeSsoState } = await import("./db")

let db: any
beforeAll(async () => {
  db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

test("consuming the same state twice: second call returns null", async () => {
  const state = `st_twice_${Date.now()}`
  await createSsoState(state, "acct_twice", "nonce_twice", Date.now() + 600_000)

  const first = await consumeSsoState(state)
  expect(first).toEqual({ accountId: "acct_twice", nonce: "nonce_twice" })

  const second = await consumeSsoState(state)
  expect(second).toBeNull()
})

test("concurrent consume of the same state: exactly one caller succeeds", async () => {
  const state = `st_concurrent_${Date.now()}`
  await createSsoState(state, "acct_concurrent", "nonce_concurrent", Date.now() + 600_000)

  const results = await Promise.all(
    Array.from({ length: 10 }, () => consumeSsoState(state)),
  )
  const succeeded = results.filter((r) => r !== null)
  expect(succeeded).toHaveLength(1)
  expect(succeeded[0]).toEqual({ accountId: "acct_concurrent", nonce: "nonce_concurrent" })
})

test("an expired state returns null and is deleted (not replayable later)", async () => {
  const state = `st_expired_${Date.now()}`
  await createSsoState(state, "acct_expired", "nonce_expired", Date.now() - 1_000)

  const result = await consumeSsoState(state)
  expect(result).toBeNull()

  // The row must be gone, not merely rejected — otherwise it could be replayed once expiry
  // logic changes, or would linger forever since nothing else prunes it on this path.
  const row = await db.execute({ sql: "SELECT 1 FROM sso_states WHERE state=?", args: [state] })
  expect(row.rows).toHaveLength(0)
})
