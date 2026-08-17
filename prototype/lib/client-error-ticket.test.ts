// BugHerd sub-project A, task 2: fingerprint + create/bump/mask recorder.
// Hermetic: points module's `db` singleton at a fresh local libsql file by setting
// TURSO_DATABASE_URL *before* importing ./db (matches db.sso-state.test.ts pattern).
//
// IMPORTANT: do NOT destructure `db` from the module import — that captures a one-time
// snapshot of the (possibly not-yet-repointed) singleton. bun runs all test files in ONE
// process and interleaves their top-level `await import`/`beforeAll` scheduling, so another
// file's reconnectDb() can repoint the shared singleton between this file's own setup and its
// tests. db.ts's own functions (used by client-error-ticket.ts) always read the *live*
// singleton, so our local helpers must too: capture the Client returned by our own
// reconnectDb() call, and re-assert it in beforeEach so cross-file interleaving can never leave
// us pointed at another file's database for any given test.
import { test, expect, beforeAll, beforeEach } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-clienterrticket-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2, updateFeedbackMeta } = await import("./db")
const { clientErrorSignature, severityFor, recordClientError } = await import("./client-error-ticket")

let db: any

beforeAll(async () => {
  db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

beforeEach(() => {
  db = reconnectDb("file:" + file)
})

async function getObservation(id: string): Promise<string | null> {
  const res = await db!.execute({ sql: "SELECT observation FROM feedback WHERE id = ?", args: [id] })
  const row = res.rows[0] as any
  return row ? String(row.observation) : null
}

async function getRow(id: string): Promise<{ status: string; recurrenceCount: number; clientContext: any } | null> {
  const res = await db!.execute({ sql: "SELECT status, recurrence_count, client_context_json FROM feedback WHERE id = ?", args: [id] })
  const row = res.rows[0] as any
  if (!row) return null
  return {
    status: String(row.status),
    recurrenceCount: Number(row.recurrence_count) || 0,
    clientContext: row.client_context_json ? JSON.parse(String(row.client_context_json)) : null,
  }
}

async function countBySignature(projectId: string, signature: string): Promise<number> {
  const res = await db!.execute({
    sql: "SELECT COUNT(*) AS n FROM feedback WHERE project_id = ? AND signature = ?",
    args: [projectId, signature],
  })
  const row = res.rows[0] as any
  return Number(row?.n ?? 0)
}

test("signature is stable per (project,message,topframe,pageUrl) and project-scoped", () => {
  const e = { kind: "error", message: "x is not a function", stack: "at f (a.js:1:2)\nat g", pageUrl: "https://s.com/a" } as any
  expect(clientErrorSignature("p1", e)).toBe(clientErrorSignature("p1", { ...e, message: "x is not a function " }))
  expect(clientErrorSignature("p1", { ...e, message: "x is not a function, code 42" }))
    .toBe(clientErrorSignature("p1", { ...e, message: "x is not a function, code 99" }))
  expect(clientErrorSignature("p1", e)).not.toBe(clientErrorSignature("p2", e))
})

test("severity: uncaught error > 5xx network > console.error", () => {
  expect(severityFor({ kind: "error" } as any)).toBe("high")
  expect(severityFor({ kind: "unhandledrejection" } as any)).toBe("high")
  expect(severityFor({ kind: "network", status: 500 } as any)).toBe("medium")
  expect(severityFor({ kind: "network", status: 0 } as any)).toBe("medium")
  expect(severityFor({ kind: "network", status: 404 } as any)).toBe("low")
  expect(severityFor({ kind: "console.error" } as any)).toBe("low")
})

test("first occurrence creates a fb_ ticket; second bumps recurrence, not a new ticket", async () => {
  const pid = "proj_cet1"
  const e = { kind: "error", message: "boom user@x.com", stack: "at f", pageUrl: "https://s.com/p" } as any
  const a = await recordClientError(pid, e, {}, { atMs: 1000 })
  expect(a.created).toBe(true)
  expect(a.id.startsWith("fb_")).toBe(true)

  const b = await recordClientError(pid, e, {}, { atMs: 2000 })
  expect(b.created).toBe(false)
  expect(b.id).toBe(a.id)

  const signature = clientErrorSignature(pid, e)
  expect(await countBySignature(pid, signature)).toBe(1)
})

test("overCap drop path: new signature, no prior ticket -> no row inserted", async () => {
  const pid = "proj_cet3"
  const e = { kind: "error", message: "over cap boom", stack: "at h", pageUrl: "https://s.com/overcap" } as any
  const signature = clientErrorSignature(pid, e)

  expect(await countBySignature(pid, signature)).toBe(0)

  const result = await recordClientError(pid, e, {}, { atMs: 1, overCap: true })
  expect(result.created).toBe(false)
  expect(result.id).toBe("")

  expect(await countBySignature(pid, signature)).toBe(0)
})

test("PII in the message is masked before persistence", async () => {
  const pid = "proj_cet2"
  const { id } = await recordClientError(
    pid,
    { kind: "error", message: "fail for user@example.com", pageUrl: "https://s.com" } as any,
    {},
    { atMs: 1 }
  )
  const observation = await getObservation(id)
  expect(observation).not.toBeNull()
  expect(observation).not.toContain("user@example.com")
})

// I2: URL secrets (session/auth/otp/etc query params) must be redacted, not just PII-masked —
// maskPii alone doesn't know about query-string secret keys.
test("URL secrets in a network-error message are redacted before persistence", async () => {
  const pid = "proj_cet_i2"
  const e = {
    kind: "network",
    message: "0 https://api.example.com/sync?session=abc&otp=123&ok=1",
    pageUrl: "https://s.com/checkout",
    status: 0,
  } as any
  const { id } = await recordClientError(pid, e, {}, { atMs: 1 })
  const observation = await getObservation(id)
  expect(observation).not.toBeNull()
  expect(observation).not.toContain("session=abc")
  expect(observation).not.toContain("otp=123")
  expect(observation).toContain("session=REDACTED")
  expect(observation).toContain("otp=REDACTED")
  // Non-secret params survive untouched.
  expect(observation).toContain("ok=1")
})

test("URL secrets inside the persisted clientContext are also redacted", async () => {
  const pid = "proj_cet_i2_ctx"
  const e = { kind: "error", message: "boom", pageUrl: "https://s.com/p" } as any
  const ctx = { networkFailures: [{ url: "https://api.example.com/x?token=SECRETVALUE&code=999", status: 500 }] }
  const { id } = await recordClientError(pid, e, ctx, { atMs: 1 })
  const row = await getRow(id)
  expect(row).not.toBeNull()
  const url = row!.clientContext?.networkFailures?.[0]?.url
  expect(url).toBeDefined()
  expect(String(url)).not.toContain("SECRETVALUE")
  expect(String(url)).not.toContain("999")
  expect(String(url)).toContain("token=REDACTED")
  expect(String(url)).toContain("code=REDACTED")
})

// I3: a recurrence of an error whose ticket already got resolved/closed must RE-OPEN it, not
// just silently bump the recurrence counter on a dead ticket.
test("recurrence on a resolved ticket re-opens it and bumps recurrence", async () => {
  const pid = "proj_cet_i3"
  const e = { kind: "error", message: "reopen me", stack: "at f", pageUrl: "https://s.com/reopen" } as any

  const first = await recordClientError(pid, e, {}, { atMs: 1000 })
  expect(first.created).toBe(true)

  // Simulate a human resolving the ticket.
  await updateFeedbackMeta(pid, first.id, { status: "done" })
  const resolved = await getRow(first.id)
  expect(resolved?.status).toBe("done")

  const second = await recordClientError(pid, e, {}, { atMs: 2000 })
  expect(second.created).toBe(false)
  expect(second.id).toBe(first.id)

  const after = await getRow(first.id)
  expect(after?.status).toBe("open")
  expect(after?.recurrenceCount).toBeGreaterThanOrEqual(2)
})

test("recurrence on a dismissed ticket also re-opens it", async () => {
  const pid = "proj_cet_i3b"
  const e = { kind: "error", message: "reopen me too", pageUrl: "https://s.com/reopen2" } as any

  const first = await recordClientError(pid, e, {}, { atMs: 1000 })
  await updateFeedbackMeta(pid, first.id, { status: "dismissed" })

  const second = await recordClientError(pid, e, {}, { atMs: 2000 })
  expect(second.created).toBe(false)

  const after = await getRow(first.id)
  expect(after?.status).toBe("open")
})

// M5: the stack must be retrievable from the persisted row (previously only used for the
// signature hash, then dropped).
test("a scrubbed stack is persisted and retrievable from clientContext", async () => {
  const pid = "proj_cet_m5"
  const e = {
    kind: "error",
    message: "stack test",
    stack: "Error: stack test\n    at handler (https://s.com/app.js:10:5)\n    at run user@example.com",
    pageUrl: "https://s.com/p",
  } as any
  const { id } = await recordClientError(pid, e, {}, { atMs: 1 })
  const row = await getRow(id)
  expect(row).not.toBeNull()
  const stack = row!.clientContext?.clientErrorStack
  expect(typeof stack).toBe("string")
  expect(stack).toContain("handler")
  expect(stack).toContain("app.js")
  // PII inside the stack is still masked like everything else in clientContext.
  expect(stack).not.toContain("user@example.com")
})
