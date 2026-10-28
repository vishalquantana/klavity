import { afterAll, beforeAll, expect, test } from "bun:test"
import * as net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

// KD-221: in-app notifications (top-bar bell). Any update to a ticket notifies its ASSIGNEE — never the person
// who made the change — and the bell reads/marks them via /api/notifications.

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-notifications-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(91)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch { } } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const ADMIN = `ntf-admin-${RUN}@test.local`
const DEV = `ntf-dev-${RUN}@test.local`
const DEV2 = `ntf-dev2-${RUN}@test.local`
const SID = { [ADMIN]: `sess_ntfa_${RUN}`, [DEV]: `sess_ntfd_${RUN}`, [DEV2]: `sess_ntfd2_${RUN}` }
const ACCT = `acct_ntf_${RUN}`
const PROJ = `proj_ntf_${RUN}`
const FID = `fb_ntf_${RUN}`
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

beforeAll(async () => {
  const port = await freePort()
  BASE = `http://localhost:${port}`
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
    },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  for (const e of [ADMIN, DEV, DEV2]) {
    await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [e, NOW])
    await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID[e], e, NOW, NOW + 86400_000])
  }
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Ntf", ADMIN, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, ADMIN, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Notify Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_a_${RUN}`, PROJ, ADMIN, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_d_${RUN}`, PROJ, DEV, "member", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_d2_${RUN}`, PROJ, DEV2, "member", null, NOW])
  await exec("INSERT INTO feedback (id, project_id, title, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [FID, PROJ, "Checkout button broken", "Clicking pay does nothing", "medium", "open", NOW])
})

afterAll(() => { proc?.kill(); raw.close(); rmDb() })

const req = (method: string, path: string, who: string, body?: any) => fetch(`${BASE}${path}`, {
  method, headers: { "Content-Type": "application/json", Cookie: `klav_session=${SID[who]}` },
  body: body === undefined ? undefined : JSON.stringify(body),
})
const inbox = async (who: string) => (await req("GET", "/api/notifications", who)).json()
// Notifications are written fire-and-forget after the response — poll briefly.
async function waitFor(who: string, n: number) {
  for (let i = 0; i < 40; i++) { const d = await inbox(who); if (d.notifications.length >= n) return d; await Bun.sleep(50) }
  return inbox(who)
}

test("assigning a ticket notifies the new assignee, not the admin who assigned it", async () => {
  expect((await req("PATCH", `/api/feedback/${FID}`, ADMIN, { assignee: DEV })).status).toBe(200)
  const d = await waitFor(DEV, 1)
  expect(d.unread).toBe(1)
  expect(d.notifications[0]).toMatchObject({ type: "ticket_assignee_changed", feedbackId: FID, actorEmail: ADMIN, ticketTitle: "Checkout button broken", projectName: "Notify Project", readAt: null })
  expect(d.notifications[0].meta.to).toBe(DEV)
  expect((await inbox(ADMIN)).notifications.length).toBe(0)
})

test("status, priority, description, comment and label updates by others all notify the assignee", async () => {
  await req("PATCH", `/api/feedback/${FID}`, ADMIN, { status: "in_progress" })
  await req("PATCH", `/api/feedback/${FID}`, ADMIN, { priority: "high" })
  await req("PATCH", `/api/feedback/${FID}`, ADMIN, { observation: "Clicking pay does nothing on Safari" })
  expect((await req("POST", `/api/feedback/${FID}/comments`, ADMIN, { body: "Can you take a look today?" })).status).toBe(201)
  const lbl = await (await req("POST", `/api/projects/${PROJ}/labels`, ADMIN, { name: "Payments" })).json()
  await req("POST", `/api/feedback/${FID}/labels`, ADMIN, { labelId: lbl.label.id })
  const d = await waitFor(DEV, 6)
  const types = d.notifications.map((n: any) => n.type)
  for (const t of ["ticket_status_changed", "ticket_priority_changed", "ticket_description_changed", "ticket_commented", "ticket_label_added"]) expect(types).toContain(t)
  expect(d.notifications.find((n: any) => n.type === "ticket_commented").meta.snippet).toBe("Can you take a look today?")
  expect(d.notifications.find((n: any) => n.type === "ticket_label_added").meta.label).toBe("Payments")
  expect(d.unread).toBe(6)
})

test("the assignee's own changes don't notify them", async () => {
  const before = (await inbox(DEV)).notifications.length
  await req("PATCH", `/api/feedback/${FID}`, DEV, { status: "done" })
  await req("POST", `/api/feedback/${FID}/comments`, DEV, { body: "Fixed." })
  await Bun.sleep(300)
  expect((await inbox(DEV)).notifications.length).toBe(before)
})

test("marking one read, then all read, updates the unread count; users only touch their own", async () => {
  const d = await inbox(DEV)
  const first = d.notifications[0].id
  // another user can't mark DEV's notification read
  await req("POST", "/api/notifications/read", DEV2, { ids: [first] })
  expect((await inbox(DEV)).unread).toBe(d.unread)
  const r1 = await (await req("POST", "/api/notifications/read", DEV, { ids: [first] })).json()
  expect(r1).toMatchObject({ ok: true, marked: 1, unread: d.unread - 1 })
  const r2 = await (await req("POST", "/api/notifications/read", DEV, { all: true })).json()
  expect(r2.unread).toBe(0)
  expect((await inbox(DEV)).notifications.every((n: any) => n.readAt != null)).toBe(true)
})

test("reassigning notifies both the new and the previous assignee", async () => {
  await req("PATCH", `/api/feedback/${FID}`, ADMIN, { assignee: DEV2 })
  const d2 = await waitFor(DEV2, 1)
  expect(d2.notifications[0]).toMatchObject({ type: "ticket_assignee_changed" })
  expect(d2.notifications[0].meta).toMatchObject({ from: DEV, to: DEV2 })
  const d = await inbox(DEV)
  expect(d.unread).toBe(1)
  expect(d.notifications[0].meta).toMatchObject({ from: DEV, to: DEV2 })
})

test("creating a ticket assigned to someone else notifies them", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/tickets`, ADMIN, { title: "Search returns nothing", body: "Empty results", priority: "low", assignee: DEV2 })
  expect([200, 201]).toContain(r.status)
  const d = await waitFor(DEV2, 2)
  expect(d.notifications[0]).toMatchObject({ type: "ticket_created", actorEmail: ADMIN, ticketTitle: "Search returns nothing" })
})

test("the notifications API requires sign-in", async () => {
  const r = await fetch(`${BASE}/api/notifications`, { redirect: "manual" })
  expect([401, 302]).toContain(r.status)
})
