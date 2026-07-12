// JTBD 2.8 — Bulk + evidence-rich triage. Hermetic subprocess server + isolated libsql DB.
//
// Proves the acceptance criteria that ride on the wire (the UI wiring is exercised in dashboard.html):
//   1. Bulk-accepting N triage rows creates/updates all N in ONE request → the inbox count drops by N.
//   2. Dismiss (single + bulk) moves rows to status='dismissed' (out of the inbox).
//   3. Undo restores the dismissed reports to status='new' → they reappear in the inbox.
// All three lean on the existing PATCH /api/projects/:id/tickets/bulk endpoint the triage inbox now
// drives (status:"open"+priority for accept, status:"dismissed" for dismiss, status:"new" for undo).
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-triage-bulk-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(88)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `tgb-owner-${RUN}@test.local`
const SID = `sess_tgb_${RUN}`
const ACCT = `acct_tgb_${RUN}`
const PROJ = `proj_tgb_${RUN}`
const NOW = Date.now()

// Six brand-new (status='new') triage reports.
const NEW_IDS = Array.from({ length: 6 }, (_, i) => `fb_tgb_new_${i}_${RUN}`)

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

beforeAll(async () => {
  const port = 47600 + Math.floor(Math.random() * 300)
  BASE = `http://localhost:${port}`
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
    },
    stdout: "ignore",
    stderr: "ignore",
  })
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }

  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Triage Bulk", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_tgb_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Triage Bulk Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_tgb_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  // Insert six status='new' reports (i.e. untriaged, in the inbox).
  for (let i = 0; i < NEW_IDS.length; i++) {
    await exec(
      "INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [NEW_IDS[i], PROJ, `Triage report ${i}`, "medium", "new", NOW - i * 1000],
    )
  }
})

afterAll(() => {
  proc?.kill()
  raw.close()
  rmDb()
})

function req(method: string, path: string, body?: any) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: `klav_session=${SID}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

async function triageIds(): Promise<string[]> {
  const r = await req("GET", `/api/projects/${PROJ}/triage`)
  expect(r.status).toBe(200)
  const d = await r.json()
  return (d.triage || []).map((t: any) => String(t.id))
}

test("triage inbox starts with all six new reports", async () => {
  const ids = await triageIds()
  expect(ids.length).toBe(6)
  for (const id of NEW_IDS) expect(ids).toContain(id)
})

test("bulk-accept N triage rows updates all N in one request and drops the inbox count by N", async () => {
  const before = await triageIds()
  const accept = NEW_IDS.slice(0, 3)  // accept the first three
  const r = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: accept,
    status: "open",
    priority: "high",
  })
  expect(r.status).toBe(200)
  expect(await r.json()).toMatchObject({ ok: true, updated: 3 })

  // All three are now status='open' with the bulk-applied priority.
  const rows = await raw.execute({
    sql: `SELECT id, status, priority FROM feedback WHERE id IN (${accept.map(() => "?").join(",")})`,
    args: accept,
  })
  for (const row of rows.rows as any[]) {
    expect(row.status).toBe("open")
    expect(row.priority).toBe("high")
  }

  // Inbox shrank by exactly 3, and none of the accepted ids remain.
  const after = await triageIds()
  expect(after.length).toBe(before.length - 3)
  for (const id of accept) expect(after).not.toContain(id)
})

test("bulk-dismiss removes rows from the inbox and undo (status=new) restores them", async () => {
  const before = await triageIds()          // three remaining
  const dismiss = before.slice(0, 2)         // dismiss two of them

  const dr = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: dismiss,
    status: "dismissed",
  })
  expect(dr.status).toBe(200)
  expect(await dr.json()).toMatchObject({ ok: true, updated: 2 })

  const afterDismiss = await triageIds()
  expect(afterDismiss.length).toBe(before.length - 2)
  for (const id of dismiss) expect(afterDismiss).not.toContain(id)

  // Undo — restore to status='new'. This is exactly what the undo toast fires.
  const ur = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: dismiss,
    status: "new",
  })
  expect(ur.status).toBe(200)
  expect(await ur.json()).toMatchObject({ ok: true, updated: 2 })

  const afterUndo = await triageIds()
  expect(afterUndo.length).toBe(before.length)
  for (const id of dismiss) expect(afterUndo).toContain(id)
})

test("single dismiss + undo round-trips one report through the inbox", async () => {
  const before = await triageIds()
  const one = before[0]

  await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, { ticketIds: [one], status: "dismissed" })
  let now = await triageIds()
  expect(now).not.toContain(one)
  expect(now.length).toBe(before.length - 1)

  await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, { ticketIds: [one], status: "new" })
  now = await triageIds()
  expect(now).toContain(one)
  expect(now.length).toBe(before.length)
})
