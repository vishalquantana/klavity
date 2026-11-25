// KD-2878: a dropped Turso socket ("The socket connection was closed unexpectedly") used to fail the whole request.
// Reads are retried once; writes never (a write whose socket dropped may already have been applied).
import { test, expect } from "bun:test"
process.env.TURSO_DATABASE_URL = ""   // don't connect anywhere: we only use the pure helpers + a fake client
const { isTransientDbError, isReadOnlySql, instrumentClient } = await import("./db")

const SOCKET = new Error("The socket connection was closed unexpectedly. For more information, pass `verbose: true` in the second argument to fetch()")

test("recognises dropped-connection errors, not real SQL errors", () => {
  expect(isTransientDbError(SOCKET)).toBe(true)
  expect(isTransientDbError(Object.assign(new Error("x"), { code: "ECONNRESET" }))).toBe(true)
  expect(isTransientDbError(Object.assign(new Error("request failed"), { cause: new Error("fetch failed") }))).toBe(true)
  expect(isTransientDbError(new Error("SQLITE_ERROR: no such column: foo"))).toBe(false)
  expect(isTransientDbError(new Error("UNIQUE constraint failed: users.email"))).toBe(false)
})

test("only reads are considered safe to repeat", () => {
  expect(isReadOnlySql("SELECT * FROM feedback WHERE id=?")).toBe(true)
  expect(isReadOnlySql("  \n select 1")).toBe(true)
  expect(isReadOnlySql("-- comment\nSELECT 1")).toBe(true)
  expect(isReadOnlySql("PRAGMA table_info(users)")).toBe(true)
  expect(isReadOnlySql("WITH x AS (SELECT 1) SELECT * FROM x")).toBe(true)
  for (const w of ["INSERT INTO t VALUES (1)", "UPDATE t SET a=1", "DELETE FROM t", "WITH x AS (SELECT 1) INSERT INTO t SELECT * FROM x", "CREATE TABLE t (a)", ""]) {
    expect(isReadOnlySql(w)).toBe(false)
  }
})

function fakeClient(failures: number, err = SOCKET) {
  let calls = 0
  const c: any = { execute: async () => { calls++; if (calls <= failures) throw err; return { rows: [{ ok: 1 }] } } }
  return { client: instrumentClient(c), calls: () => calls }
}

test("a read that hits a dropped socket is retried once and succeeds", async () => {
  const { client, calls } = fakeClient(1)
  const r = await client.execute({ sql: "SELECT 1", args: [] })
  expect(r.rows[0]).toEqual({ ok: 1 })
  expect(calls()).toBe(2)
})

test("a read that keeps failing gives up after one retry", async () => {
  const { client, calls } = fakeClient(5)
  await expect(client.execute("SELECT 1")).rejects.toThrow("socket connection was closed")
  expect(calls()).toBe(2)
})

test("writes and real SQL errors are not retried", async () => {
  const w = fakeClient(1)
  await expect(w.client.execute("INSERT INTO t VALUES (1)")).rejects.toThrow("socket connection was closed")
  expect(w.calls()).toBe(1)
  const sqlErr = fakeClient(1, new Error("SQLITE_ERROR: no such table: t"))
  await expect(sqlErr.client.execute("SELECT * FROM t")).rejects.toThrow("no such table")
  expect(sqlErr.calls()).toBe(1)
})
