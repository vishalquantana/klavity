// DB-backed tests for consumeSsoState — the SSO anti-CSRF state row must be single-use.
// consumeSsoState is `DELETE ... RETURNING` so a row is burned atomically: no double-spend,
// no concurrent double-consume, and expired rows are removed even when they don't return a login.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { reconnectDb, applySchema, createSsoState, consumeSsoState } from "./lib/db"

let db: import("@libsql/client").Client

beforeAll(async () => {
  const file = join(tmpdir(), `klav-ssostate-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
  db = reconnectDb("file:" + file)
  await applySchema(db)
})

test("consumeSsoState: first consume returns the row, second returns null (single-use)", async () => {
  const state = "state_single_use"
  await createSsoState(state, "acc_1", "nonce_1", Date.now() + 60_000)

  const first = await consumeSsoState(state)
  expect(first).not.toBeNull()
  expect(first!.accountId).toBe("acc_1")
  expect(first!.nonce).toBe("nonce_1")

  // Row was burned — a replay finds nothing.
  const second = await consumeSsoState(state)
  expect(second).toBeNull()

  // And it's gone from the table.
  const r = await db.execute({ sql: "SELECT 1 FROM sso_states WHERE state=?", args: [state] })
  expect(r.rows.length).toBe(0)
})

test("consumeSsoState: two concurrent consumes — exactly one wins", async () => {
  const state = "state_concurrent"
  await createSsoState(state, "acc_2", "nonce_2", Date.now() + 60_000)

  const [a, b] = await Promise.all([consumeSsoState(state), consumeSsoState(state)])

  const nonNull = [a, b].filter((x) => x !== null)
  const nullish = [a, b].filter((x) => x === null)
  expect(nonNull.length).toBe(1)
  expect(nullish.length).toBe(1)
  expect(nonNull[0]!.accountId).toBe("acc_2")
  expect(nonNull[0]!.nonce).toBe("nonce_2")

  // Row is consumed regardless of who won.
  const r = await db.execute({ sql: "SELECT 1 FROM sso_states WHERE state=?", args: [state] })
  expect(r.rows.length).toBe(0)
})

test("consumeSsoState: an already-expired state returns null and is removed", async () => {
  const state = "state_expired"
  await createSsoState(state, "acc_3", "nonce_3", Date.now() - 1_000)

  expect(await consumeSsoState(state)).toBeNull()

  // Even though it returned null (expired), the row was still burned by the DELETE.
  const r = await db.execute({ sql: "SELECT 1 FROM sso_states WHERE state=?", args: [state] })
  expect(r.rows.length).toBe(0)
})
