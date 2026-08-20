// Connector field mapping task 1: feedback.report_type persists the kind ("bug" | "feature")
// chosen at submit so exports can pick a Jira issue type per kind. Verifies insertFeedback writes
// it and feedbackById reads it back (both camelCase and the snake_case feedbackToTicketPayload uses).
import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-report-kind-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import { applySchema, feedbackById, insertFeedback, reconnectDb } from "./db"

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
})

test("feedback persists report_type and reads it back", async () => {
  const id = await insertFeedback({ projectId: "p1", observation: "x", priority: "medium", reportType: "feature" })
  const fb = await feedbackById("p1", id)
  expect(fb?.reportType).toBe("feature")
  expect(fb?.report_type).toBe("feature")
})

test("report_type is null when not provided (back-compat)", async () => {
  const id = await insertFeedback({ projectId: "p1", observation: "y", priority: "medium" })
  const fb = await feedbackById("p1", id)
  expect(fb?.reportType).toBe(null)
  expect(fb?.report_type).toBe(null)
})

// PX4 #411: report_type now also carries "task"/"query"; feedbackById reads them back unchanged so
// feedbackToTicketPayload can pass them to resolveIssueType.
test("feedback persists task/query report_type and reads it back", async () => {
  const tId = await insertFeedback({ projectId: "p1", observation: "t", priority: "medium", reportType: "task" })
  expect((await feedbackById("p1", tId))?.report_type).toBe("task")
  const qId = await insertFeedback({ projectId: "p1", observation: "q", priority: "medium", reportType: "query" })
  expect((await feedbackById("p1", qId))?.report_type).toBe("query")
})

// PX4 #411/#425: explicit Title + non-image file attachment descriptors persist and read back.
test("feedback persists an explicit title and attachment descriptors", async () => {
  const attachments = [{ key: "attachments/abc.pdf", filename: "invoice.pdf", contentType: "application/pdf", size: 2048 }]
  const id = await insertFeedback({ projectId: "p1", observation: "body first line", priority: "medium", reportType: "bug", title: "Explicit Title", attachments })
  const fb: any = await feedbackById("p1", id)
  expect(fb?.title).toBe("Explicit Title")
  expect(fb?.attachments).toEqual(attachments)
})

test("title + attachments are null/absent when not provided (back-compat)", async () => {
  const id = await insertFeedback({ projectId: "p1", observation: "z", priority: "medium" })
  const fb: any = await feedbackById("p1", id)
  expect(fb?.title).toBe(null)
  expect(fb?.attachments).toBe(null)
})
