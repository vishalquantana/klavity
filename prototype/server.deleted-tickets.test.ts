// "Deleted tickets" bin: deleting still removes the ticket from every list, but a copy is kept for 30 days and
// can be listed (GET /tickets/deleted) and restored (POST /tickets/deleted/:id/restore) with its comments + labels.
import { afterAll, beforeAll, expect, test } from "bun:test"
import * as net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-deleted-tickets-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(91)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch { } } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

const OWNER = `dt-owner-${RUN}@test.local`
const OUTSIDER = `dt-out-${RUN}@test.local`
const SID = `sess_dt_owner_${RUN}`
const SID_OUT = `sess_dt_out_${RUN}`
const ACCT = `acct_dt_${RUN}`
const PROJ = `proj_dt_${RUN}`
const OTHER = `proj_dt_other_${RUN}`
const FID = `fb_dt_${RUN}`
const FID2 = `fb_dt2_${RUN}`
const LABEL = `lbl_dt_${RUN}`
const NOW = Date.now()
let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

beforeAll(async () => {
  const port = await freePort()
  BASE = `http://localhost:${port}`
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET,
      KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_TEST_ALLOW_LOOPBACK: "1", KLAV_MAIL_FROM: "",
    },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OUTSIDER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_OUT, OUTSIDER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "DT", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_dt_${RUN}`, ACCT, OWNER, "owner", NOW])
  for (const p of [PROJ, OTHER]) {
    await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [p, ACCT, p, "active", "auto", 200, "named", NOW, NOW])
    await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${p}`, p, OWNER, "admin", null, NOW])
  }
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, seq_num, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [FID, PROJ, "Breadcrumb link fails", "high", "in_progress", 41, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, seq_num, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [FID2, PROJ, "Second ticket", "low", "open", 42, NOW])
  await exec("INSERT INTO labels (id, project_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)", [LABEL, PROJ, "Bug", "#ef4444", NOW])
  await exec("INSERT INTO ticket_labels (label_id, feedback_id, created_at) VALUES (?, ?, ?)", [LABEL, FID, NOW])
  await exec("INSERT INTO ticket_comments (id, feedback_id, author, body, created_at) VALUES (?, ?, ?, ?, ?)", [`c_dt_${RUN}`, FID, OWNER, "Repro on Chrome", NOW])
})

afterAll(() => { proc?.kill(); raw.close(); rmDb() })

const req = (method: string, path: string, body?: any, sid = SID) => fetch(`${BASE}${path}`, {
  method, headers: { "Content-Type": "application/json", Cookie: `klav_session=${sid}` },
  body: body === undefined ? undefined : JSON.stringify(body),
})
const count = async (sql: string, args: any[]) => Number(((await raw.execute({ sql, args })).rows[0] as any).n)

test("delete → ticket is gone from feedback but listed in Deleted tickets", async () => {
  const r = await req("DELETE", `/api/projects/${PROJ}/tickets/bulk`, { ticketIds: [FID] })
  expect(r.status).toBe(200)
  expect(await count("SELECT COUNT(*) AS n FROM feedback WHERE id=?", [FID])).toBe(0)
  expect(await count("SELECT COUNT(*) AS n FROM ticket_comments WHERE feedback_id=?", [FID])).toBe(0)

  const list = await req("GET", `/api/projects/${PROJ}/tickets/deleted`)
  expect(list.status).toBe(200)
  const d = await list.json()
  expect(d.retentionDays).toBe(30)
  expect(d.tickets).toHaveLength(1)
  expect(d.tickets[0]).toMatchObject({ feedbackId: FID, seqNum: 41, title: "Breadcrumb link fails", status: "in_progress", priority: "high", deletedBy: OWNER })
  expect(d.tickets[0].expiresAt - d.tickets[0].deletedAt).toBe(30 * 86400_000)
})

test("the bin is project-scoped and member-only", async () => {
  const other = await (await req("GET", `/api/projects/${OTHER}/tickets/deleted`)).json()
  expect(other.tickets).toEqual([])
  expect((await req("POST", `/api/projects/${OTHER}/tickets/deleted/${FID}/restore`)).status).toBe(404)
  expect((await req("GET", `/api/projects/${PROJ}/tickets/deleted`, undefined, SID_OUT)).status).toBe(403)
  expect((await req("POST", `/api/projects/${PROJ}/tickets/deleted/${FID}/restore`, undefined, SID_OUT)).status).toBe(403)
})

test("restore brings the ticket back with its number, status, comments and labels", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/tickets/deleted/${FID}/restore`)
  expect(r.status).toBe(200)
  expect(await r.json()).toMatchObject({ ok: true, ticketId: FID, seqNum: 41, renumbered: false })
  const row = (await raw.execute({ sql: "SELECT project_id, observation, status, priority, seq_num FROM feedback WHERE id=?", args: [FID] })).rows[0] as any
  expect(row).toMatchObject({ project_id: PROJ, observation: "Breadcrumb link fails", status: "in_progress", priority: "high", seq_num: 41 })
  expect(await count("SELECT COUNT(*) AS n FROM ticket_comments WHERE feedback_id=?", [FID])).toBe(1)
  expect(await count("SELECT COUNT(*) AS n FROM ticket_labels WHERE feedback_id=? AND label_id=?", [FID, LABEL])).toBe(1)
  // Gone from the bin; restoring twice is a clean 404.
  expect((await (await req("GET", `/api/projects/${PROJ}/tickets/deleted`)).json()).tickets).toEqual([])
  expect((await req("POST", `/api/projects/${PROJ}/tickets/deleted/${FID}/restore`)).status).toBe(404)
})

test("a restored ticket whose number was taken gets a fresh one instead of failing", async () => {
  expect((await req("DELETE", `/api/projects/${PROJ}/tickets/bulk`, { ticketIds: [FID2] })).status).toBe(200)
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, seq_num, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [`fb_dt_taker_${RUN}`, PROJ, "Took #42", "low", "open", 42, NOW])
  const r = await req("POST", `/api/projects/${PROJ}/tickets/deleted/${FID2}/restore`)
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.renumbered).toBe(true)
  expect(d.seqNum).toBeGreaterThan(42)
  expect(await count("SELECT COUNT(*) AS n FROM feedback WHERE id=?", [FID2])).toBe(1)
})

test("expired entries (older than 30 days) are dropped from the bin", async () => {
  expect((await req("DELETE", `/api/projects/${PROJ}/tickets/bulk`, { ticketIds: [FID] })).status).toBe(200)
  await exec("UPDATE deleted_tickets SET deleted_at=? WHERE feedback_id=?", [NOW - 31 * 86400_000, FID])
  expect((await (await req("GET", `/api/projects/${PROJ}/tickets/deleted`)).json()).tickets).toEqual([])
  expect((await req("POST", `/api/projects/${PROJ}/tickets/deleted/${FID}/restore`)).status).toBe(404)
})
