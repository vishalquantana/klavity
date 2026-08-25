import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-ticket-viewers-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import { applySchema, db, reconnectDb, normalizeShareMode, projectById } from "./db"

const ACCOUNT = "acct_tv"
const PROJECT = "proj_tv"

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
  const now = Date.now()
  await c.execute({ sql: "INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", args: [ACCOUNT, "TV", "vishal@quantana.com.au", now] })
  await c.execute({ sql: "INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", args: [PROJECT, ACCOUNT, "TV Project", now, now] })
})

test("normalizeShareMode falls back to teaser on junk and echoes known modes", () => {
  expect(normalizeShareMode(undefined)).toBe("teaser")
  expect(normalizeShareMode("nonsense")).toBe("teaser")
  expect(normalizeShareMode("public")).toBe("public")
  expect(normalizeShareMode("off")).toBe("off")
})

test("projects default share_mode is teaser and rowToProject exposes shareMode/shareAllowlist", async () => {
  const p = await projectById(PROJECT)
  expect(p).not.toBeNull()
  expect(p!.shareMode).toBe("teaser")
  expect(p!.shareAllowlist).toBeNull()
})

test("ticket_viewers table accepts a unique (feedback_id,email) grant", async () => {
  const now = Date.now()
  await db!.execute({ sql: "INSERT INTO ticket_viewers (id,feedback_id,project_id,email,status,granted_by,created_at) VALUES (?,?,?,?,?,?,?)", args: ["tv_1", "fb_x", PROJECT, "guest@ex.com", "active", null, now] })
  // Duplicate (feedback_id,email) must violate the UNIQUE constraint.
  let threw = false
  try {
    await db!.execute({ sql: "INSERT INTO ticket_viewers (id,feedback_id,project_id,email,status,granted_by,created_at) VALUES (?,?,?,?,?,?,?)", args: ["tv_2", "fb_x", PROJECT, "guest@ex.com", "active", null, now] })
  } catch { threw = true }
  expect(threw).toBe(true)
})
