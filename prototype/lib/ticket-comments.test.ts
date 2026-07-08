import { test, expect, beforeAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-ticket-comments-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const {
  reconnectDb, applySchema, insertFeedback, insertTicketComment, listTicketComments,
  insertActivity, addTicketExport, ticketActivityTimeline,
} = await import("./db")

let db: any
const PROJECT_ID = "proj_ticket_comments"
const AUTHOR = "commenter@test.local"
let feedbackId = ""

beforeAll(async () => {
  db = reconnectDb("file:" + file)
  await applySchema(db)
  feedbackId = await insertFeedback({ projectId: PROJECT_ID, observation: "Checkout breaks", priority: "high" })
})

test("ticket comments insert and list oldest-first", async () => {
  const first = await insertTicketComment(feedbackId, AUTHOR, "First note")
  await Bun.sleep(2)
  const second = await insertTicketComment(feedbackId, AUTHOR, "Second note")
  const rows = await listTicketComments(feedbackId)
  expect(rows.map(r => r.id)).toEqual([first.id, second.id])
  expect(rows[0]).toMatchObject({ feedbackId, author: AUTHOR, body: "First note" })
})

test("ticketActivityTimeline interleaves comments, activity, and connector exports chronologically", async () => {
  const fid = await insertFeedback({ projectId: PROJECT_ID, observation: "Timeline bug", priority: "medium" })
  await db.execute({
    sql: "INSERT INTO ticket_comments (id,feedback_id,author,body,created_at) VALUES (?,?,?,?,?)",
    args: ["tc_t1", fid, AUTHOR, "Investigating", 1000],
  })
  await db.execute({
    sql: "INSERT INTO activity_events (id,project_id,type,actor_email,feedback_id,meta_json,created_at) VALUES (?,?,?,?,?,?,?)",
    args: ["evt_t2", PROJECT_ID, "ticket_status_changed", AUTHOR, fid, JSON.stringify({ from: "new", to: "open" }), 2000],
  })
  await db.execute({
    sql: "INSERT INTO ticket_comments (id,feedback_id,author,body,created_at) VALUES (?,?,?,?,?)",
    args: ["tc_t3", fid, AUTHOR, "Filed upstream", 3000],
  })
  await addTicketExport({
    feedbackId: fid, projectId: PROJECT_ID, connectorId: "conn_1", type: "github",
    externalKey: "GH-7", externalUrl: "https://github.test/issues/7", status: "ok", error: null, createdBy: AUTHOR,
  })
  const items = await ticketActivityTimeline(PROJECT_ID, fid)
  expect(items.slice(0, 3).map(i => i.id)).toEqual(["tc_t1", "evt_t2", "tc_t3"])
  expect(items.some(i => i.kind === "ticket_export" && i.meta.connectorType === "github" && i.meta.externalKey === "GH-7")).toBe(true)
})

test("applySchema creates ticket_comments on an established DB", async () => {
  const oldFile = join(tmpdir(), `klav-ticket-comments-old-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
  const c = createClient({ url: "file:" + oldFile })
  await c.execute("CREATE TABLE schema_meta (key TEXT PRIMARY KEY, value TEXT)")
  await applySchema(c)
  const cols = await c.execute("PRAGMA table_info(ticket_comments)")
  expect(cols.rows.map((r: any) => String(r.name))).toEqual(["id", "feedback_id", "author", "body", "created_at"])
  c.close()
})
