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

import { ticketViewAccess, grantTicketViewer, ticketViewerStatus } from "./ticket-viewers"

// Seed: an owner (member/admin), a project-wide viewer, a per-ticket active viewer, a pending viewer,
// and a stranger — against one feedback row, exercised across share_modes.
const OWNER = "owner-tv@test.local"
const PVIEWER = "pviewer-tv@test.local"     // project_members role 'viewer'
const TVIEWER = "tviewer-tv@test.local"     // active ticket_viewers grant
const PENDING = "pending-tv@test.local"     // pending_approval ticket_viewers grant
const STRANGER = "stranger-tv@test.local"
const FID = "fb_" + "a".repeat(8) + "-" + "b".repeat(4) + "-" + "c".repeat(4) + "-" + "d".repeat(4) + "-" + "e".repeat(12)

beforeAll(async () => {
  const now = Date.now()
  await db!.execute({ sql: "INSERT INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)", args: ["am_tv_owner", ACCOUNT, OWNER, "owner", now] })
  await db!.execute({ sql: "INSERT INTO project_members (id,project_id,email,project_role,invited_by,created_at) VALUES (?,?,?,?,?,?)", args: ["pm_tv_owner", PROJECT, OWNER, "admin", null, now] })
  await db!.execute({ sql: "INSERT INTO project_members (id,project_id,email,project_role,invited_by,created_at) VALUES (?,?,?,?,?,?)", args: ["pm_tv_pv", PROJECT, PVIEWER, "viewer", null, now] })
  await db!.execute({ sql: "INSERT INTO feedback (id,project_id,observation,status,created_at) VALUES (?,?,?,?,?)", args: [FID, PROJECT, "secret repro steps", "open", now] })
  await grantTicketViewer({ feedbackId: FID, projectId: PROJECT, email: TVIEWER, status: "active" })
  await grantTicketViewer({ feedbackId: FID, projectId: PROJECT, email: PENDING, status: "pending_approval" })
})

async function setMode(mode: string) {
  await db!.execute({ sql: "UPDATE projects SET share_mode=? WHERE id=?", args: [mode, PROJECT] })
}

test("member/admin resolves full in every share_mode (even off)", async () => {
  for (const m of ["teaser", "public", "approval", "auto_join", "off"]) {
    await setMode(m)
    expect(await ticketViewAccess(FID, OWNER)).toBe("full")
  }
})

test("project-wide viewer resolves full in every share_mode", async () => {
  for (const m of ["teaser", "public", "off"]) {
    await setMode(m)
    expect(await ticketViewAccess(FID, PVIEWER)).toBe("full")
  }
})

test("active per-ticket viewer resolves full; pending resolves pending", async () => {
  await setMode("teaser")
  expect(await ticketViewAccess(FID, TVIEWER)).toBe("full")
  expect(await ticketViewAccess(FID, PENDING)).toBe("pending")
})

test("no-access caller branches on share_mode", async () => {
  await setMode("teaser");    expect(await ticketViewAccess(FID, STRANGER)).toBe("teaser")
  await setMode("approval");  expect(await ticketViewAccess(FID, STRANGER)).toBe("teaser")
  await setMode("auto_join"); expect(await ticketViewAccess(FID, STRANGER)).toBe("teaser")
  await setMode("public");    expect(await ticketViewAccess(FID, STRANGER)).toBe("full")
  await setMode("off");       expect(await ticketViewAccess(FID, STRANGER)).toBe("login")
})

test("anon (null session) branches on share_mode identically", async () => {
  await setMode("teaser"); expect(await ticketViewAccess(FID, null)).toBe("teaser")
  await setMode("public"); expect(await ticketViewAccess(FID, null)).toBe("full")
  await setMode("off");    expect(await ticketViewAccess(FID, null)).toBe("login")
  await setMode("teaser") // restore default for later tasks
})

test("ticketViewerStatus reflects the grant status", async () => {
  expect(await ticketViewerStatus(FID, TVIEWER)).toBe("active")
  expect(await ticketViewerStatus(FID, PENDING)).toBe("pending_approval")
  expect(await ticketViewerStatus(FID, STRANGER)).toBeNull()
})
