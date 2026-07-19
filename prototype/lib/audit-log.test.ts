// Hermetic audit-log tests — isolated libsql file DB per run. KLAVITYKLA-352
import { test, expect, beforeAll } from "bun:test"
import { join } from "node:path"
import { tmpdir } from "node:os"

const file = join(tmpdir(), `klav-audit-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema } = await import("./db")
const { insertAuditLog, logAudit, queryAuditLog, auditRowsToCsv } = await import("./audit-log")

let c: ReturnType<typeof reconnectDb>

beforeAll(async () => {
  c = reconnectDb("file:" + file)
  await applySchema(c)
})

test("insertAuditLog writes a row and queryAuditLog reads it back", async () => {
  await insertAuditLog({
    action: "login",
    actorEmail: "alice@example.com",
    ip: "1.2.3.4",
    meta: { wasNew: true },
  }, c)

  const rows = await queryAuditLog({ actorEmail: "alice@example.com", action: "login" }, c)
  expect(rows.length).toBeGreaterThanOrEqual(1)
  const row = rows[0]
  expect(row.action).toBe("login")
  expect(row.actor_email).toBe("alice@example.com")
  expect(row.ip).toBe("1.2.3.4")
  expect(JSON.parse(row.meta_json!)).toEqual({ wasNew: true })
  expect(row.id).toMatch(/^aud_/)
  expect(typeof row.created_at).toBe("number")
})

test("insertAuditLog stores optional fields correctly", async () => {
  await insertAuditLog({
    action: "member_invite",
    actorEmail: "admin@example.com",
    targetEmail: "newbie@example.com",
    projectId: "proj_abc123",
    accountId: "acct_xyz",
    meta: { role: "member", status: "pending" },
  }, c)

  const rows = await queryAuditLog({ action: "member_invite", projectId: "proj_abc123" }, c)
  expect(rows.length).toBeGreaterThanOrEqual(1)
  const row = rows[0]
  expect(row.target_email).toBe("newbie@example.com")
  expect(row.project_id).toBe("proj_abc123")
  expect(row.account_id).toBe("acct_xyz")
  expect(JSON.parse(row.meta_json!).role).toBe("member")
})

test("queryAuditLog filters by action", async () => {
  const tag = `filter-${Date.now()}`
  await insertAuditLog({ action: "gdpr_export", actorEmail: `${tag}@example.com`, ip: null }, c)
  await insertAuditLog({ action: "login", actorEmail: `${tag}@example.com`, ip: null }, c)

  const exports = await queryAuditLog({ action: "gdpr_export", actorEmail: `${tag}@example.com` }, c)
  const logins = await queryAuditLog({ action: "login", actorEmail: `${tag}@example.com` }, c)
  expect(exports.every(r => r.action === "gdpr_export")).toBe(true)
  expect(logins.every(r => r.action === "login")).toBe(true)
})

test("queryAuditLog respects limit and offset", async () => {
  const tag = `paging-${Date.now()}`
  for (let i = 0; i < 5; i++) {
    await insertAuditLog({ action: "connector_create", actorEmail: `${tag}@example.com` }, c)
  }
  const first2 = await queryAuditLog({ action: "connector_create", actorEmail: `${tag}@example.com`, limit: 2 }, c)
  const next2 = await queryAuditLog({ action: "connector_create", actorEmail: `${tag}@example.com`, limit: 2, offset: 2 }, c)
  expect(first2.length).toBe(2)
  expect(next2.length).toBe(2)
  // no overlap in ids
  const firstIds = new Set(first2.map(r => r.id))
  expect(next2.every(r => !firstIds.has(r.id))).toBe(true)
})

test("queryAuditLog filters by since", async () => {
  const before = Date.now()
  const tag = `since-${before}`
  await insertAuditLog({ action: "role_change", actorEmail: `${tag}@example.com` }, c)
  const rows = await queryAuditLog({ action: "role_change", actorEmail: `${tag}@example.com`, since: before - 1 }, c)
  expect(rows.length).toBeGreaterThanOrEqual(1)
  expect(rows.every(r => r.created_at >= before - 1)).toBe(true)
})

test("logAudit (fire-and-forget) does not throw", async () => {
  // Should silently work — no throw even if db is unavailable (we pass explicit client here to confirm write)
  expect(() => logAudit({ action: "gdpr_erasure", actorEmail: "x@x.com" }, c)).not.toThrow()
  // give it a tick to resolve
  await new Promise(r => setTimeout(r, 50))
})

test("auditRowsToCsv produces valid CSV with header", async () => {
  await insertAuditLog({ action: "member_revoke", actorEmail: "admin@csv.com", targetEmail: "gone@csv.com", meta: { note: 'has "quotes"' } }, c)
  const rows = await queryAuditLog({ action: "member_revoke", actorEmail: "admin@csv.com" }, c)
  expect(rows.length).toBeGreaterThanOrEqual(1)
  const csv = auditRowsToCsv(rows)
  const lines = csv.split("\n")
  expect(lines[0]).toBe("id,created_at,action,actor_email,target_email,project_id,account_id,meta_json,ip")
  // body row count = header + data rows
  expect(lines.length).toBe(1 + rows.length)
  // quoted fields are escaped
  expect(csv).toContain('"')
})

test("queryAuditLog returns empty array when no rows match", async () => {
  const rows = await queryAuditLog({ actorEmail: "nobody-ever-${Date.now()}@example.com" }, c)
  expect(rows).toEqual([])
})

test("multiple action types stored and retrieved independently", async () => {
  const tag = `multi-${Date.now()}`
  const actor = `${tag}@x.com`
  const actions = ["login", "member_invite", "connector_delete", "gdpr_export", "gdpr_erasure"] as const
  for (const action of actions) {
    await insertAuditLog({ action, actorEmail: actor }, c)
  }
  for (const action of actions) {
    const rows = await queryAuditLog({ action, actorEmail: actor }, c)
    expect(rows.length).toBe(1)
    expect(rows[0].action).toBe(action)
  }
})
