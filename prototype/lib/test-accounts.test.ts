import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

process.env.KLAV_SECRET = Buffer.alloc(32, 7).toString("base64")
const file = join(tmpdir(), `klav-tacc-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import { reconnectDb, applySchema } from "./db"
import { createTestAccount, listTestAccounts, getTestAccountByName, getTestAccountSecret, deleteTestAccount, isTestAccountEmail } from "./test-accounts"

beforeAll(async () => { await applySchema(reconnectDb("file:" + file)) })

const P = "proj_tacc"

test("create + list never exposes the secret; get-secret decrypts", async () => {
  const id = await createTestAccount(P, { name: "admin", loginEmail: "vishal@quantana.com.au", password: "s3cret-pw", createdBy: "vishal@quantana.com.au" })
  expect(id.startsWith("tacc_")).toBe(true)
  const list = await listTestAccounts(P)
  expect(list.length).toBe(1)
  expect(list[0].name).toBe("admin")
  expect(JSON.stringify(list)).not.toContain("s3cret-pw")
  const sec = await getTestAccountSecret(P, "admin")
  expect(sec).toEqual({ loginEmail: "vishal@quantana.com.au", password: "s3cret-pw" })
})

test("stored blob is ciphertext, not plaintext", async () => {
  const { db } = await import("./db")
  const r = await db!.execute({ sql: "SELECT password_enc FROM test_accounts WHERE project_id=?", args: [P] })
  expect(String((r.rows[0] as any).password_enc)).not.toContain("s3cret-pw")
})

test("duplicate name in a project rejects; same name in another project ok", async () => {
  await expect(createTestAccount(P, { name: "admin", loginEmail: "x@y.z", password: "p" })).rejects.toThrow()
  const other = await createTestAccount("proj_other", { name: "admin", loginEmail: "x@y.z", password: "p" })
  expect(other.startsWith("tacc_")).toBe(true)
})

test("project scoping: other project cannot read the secret", async () => {
  expect(await getTestAccountSecret("proj_stranger", "admin")).toBeNull()
  expect(await getTestAccountByName("proj_stranger", "admin")).toBeNull()
})

test("isTestAccountEmail matches any project's login_email", async () => {
  const probeProj = "proj_tacc_probe"
  await createTestAccount(probeProj, { name: "probe", loginEmail: "tacc-probe@example.com", password: "pw" })
  expect(await isTestAccountEmail("tacc-probe@example.com")).toBe(true)
  expect(await isTestAccountEmail("TACC-Probe@example.com")).toBe(true)
  expect(await isTestAccountEmail("nobody@example.com")).toBe(false)
})

test("delete is project-scoped and idempotent-false on miss", async () => {
  const [acc] = await listTestAccounts(P)
  expect(await deleteTestAccount("proj_stranger", acc.id)).toBe(false)
  expect(await deleteTestAccount(P, acc.id)).toBe(true)
  expect((await listTestAccounts(P)).length).toBe(0)
})
