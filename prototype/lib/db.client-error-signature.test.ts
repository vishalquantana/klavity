// BugHerd sub-project A, task 1: DB layer for client-error dedup.
// Hermetic: points module's `db` singleton at a fresh local libsql file by setting
// TURSO_DATABASE_URL *before* importing ./db (matches db.sso-state.test.ts pattern).
//
// beforeEach re-asserts reconnectDb() to our own file so that another test file's
// interleaved top-level setup (bun runs all files in one process) can never leave the
// shared `db` singleton pointed at a different file's database when one of our tests runs.
import { test, expect, beforeAll, beforeEach } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-clienterrsig-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const {
  reconnectDb, applySchema, migrateV2,
  ensureAccount, createProject,
  insertFeedback, findFeedbackBySignature,
  getWidgetConfig, setWidgetConfig,
} = await import("./db")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

beforeEach(() => {
  reconnectDb("file:" + file)
})

test("findFeedbackBySignature returns the row for a project+signature, null otherwise", async () => {
  const [membership] = await ensureAccount("bugherd-sig-acct@quantana.com.au")
  const project = await createProject(membership.workspaceId, "BugHerd Sig Project")
  const otherProject = await createProject(membership.workspaceId, "BugHerd Sig Other Project")

  const id = await insertFeedback({ projectId: project.id, observation: "boom", source: "auto-error", signature: "sig_abc" })

  const hit = await findFeedbackBySignature(project.id, "sig_abc")
  expect(hit?.id).toBe(id)
  expect(hit?.status).toBeTruthy()
  expect(hit?.recurrenceCount).toBe(1)

  expect(await findFeedbackBySignature(project.id, "nope")).toBeNull()
  expect(await findFeedbackBySignature(otherProject.id, "sig_abc")).toBeNull()
})

test("autoCaptureErrors defaults false and round-trips via set/get", async () => {
  const [membership] = await ensureAccount("bugherd-widget-acct@quantana.com.au")
  const project = await createProject(membership.workspaceId, "BugHerd Widget Project")

  const before = await getWidgetConfig(project.id)
  expect(before?.autoCaptureErrors).toBe(false)

  await setWidgetConfig(project.id, { autoCaptureErrors: true })
  const after = await getWidgetConfig(project.id)
  expect(after?.autoCaptureErrors).toBe(true)

  await setWidgetConfig(project.id, { autoCaptureErrors: false })
  const reverted = await getWidgetConfig(project.id)
  expect(reverted?.autoCaptureErrors).toBe(false)
})
