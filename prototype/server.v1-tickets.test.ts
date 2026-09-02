// KLA — /api/v1/tickets REST API tests via the subprocess-server harness (modeled on
// server.v1-runs.test.ts). Covers: list (shape + filter), create (201 + appears in list), get
// (enriched shape + attachments field), update (status persists), comments (add + list), activity,
// auth rejection (missing/invalid token → 401), and a cross-project ticket id → 404 (IDOR guard).

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __net from "node:net"
function __freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-v1tickets-srv-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// ── Schema (only the tables this suite seeds pre-boot; the booting server adds `feedback` + the rest
// via applySchema/migrations, so we seed the project-B feedback row AFTER boot). ──
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens (email)`)

// ── Fixtures ──
const ADMIN_EMAIL = `admin-tik-${ts}@test.local`
const ADMIN_SID = `sess_admin_tik_${ts}`
const ACCOUNT_ID = `acct_tik_${ts}`
const PROJECT_ID = `proj_tik_${ACCOUNT_ID}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Tik Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_tik_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "Tik Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_tik_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// ── Second project B (IDOR target — ADMIN is NOT a member). Its feedback row is seeded post-boot. ──
const ACCOUNT_B_ID = `acct_tik_b_${ts}`
const PROJECT_B_ID = `proj_tik_b_${ts}`
const OWNER_B_EMAIL = `ownerB-tik-${ts}@test.local`
const FEEDBACK_B_ID = `fb_tik_b_${ts}`
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_B_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_B_ID, "Other", OWNER_B_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_tik_b_${ts}`, ACCOUNT_B_ID, OWNER_B_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_B_ID, ACCOUNT_B_ID, "Other Project", "active", "auto", 200, "named", NOW, NOW])

// ── Spawn the server ──
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = await __freePort()
  BASE = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(150)
  }
  // Seed the project-B feedback row now that applySchema has created the full `feedback` table.
  await rawExec(
    `INSERT INTO feedback (id, project_id, observation, status, source, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [FEEDBACK_B_ID, PROJECT_B_ID, "cross-project ticket B", "open", "manual", NOW],
  )
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

function cookie(sid: string) { return `klav_session=${sid}` }
function bearer(tok: string) { return `Bearer ${tok}` }

// Mint a kci_ token for ADMIN/PROJECT_ID (v1 reuses the CI tokens).
let CI_TOKEN: string
beforeAll(async () => {
  const r = await fetch(`${BASE}/api/ci/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie(ADMIN_SID) },
    body: JSON.stringify({ project: PROJECT_ID }),
  })
  const b = await r.json() as any
  CI_TOKEN = b.token
})

// ── Auth ──

test("GET /api/v1/tickets — 401 without a bearer token", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets`)
  expect(r.status).toBe(401)
  const b = await r.json() as any
  expect(b.error.code).toBe("unauthorized")
  expect(typeof b.error.request_id).toBe("string")
})

test("GET /api/v1/tickets — 401 with an invalid bearer token", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets`, { headers: { Authorization: bearer("kci_bogus_token_xyz") } })
  expect(r.status).toBe(401)
})

// ── Create + list ──

let CREATED_ID: string

test("POST /api/v1/tickets — 400 when title is missing", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ assignee: ADMIN_EMAIL }),
  })
  expect(r.status).toBe(400)
})

test("POST /api/v1/tickets — 400 when assignee is missing (#541)", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ title: "no assignee" }),
  })
  expect(r.status).toBe(400)
})

test("POST /api/v1/tickets — 201 create returns ticket_id", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ title: "Login button unresponsive", description: "clicking does nothing", priority: "high", assignee: ADMIN_EMAIL }),
  })
  expect(r.status).toBe(201)
  const b = await r.json() as any
  expect(typeof b.ticket_id).toBe("string")
  CREATED_ID = b.ticket_id
})

test("GET /api/v1/tickets — list has the created ticket in clean v1 shape", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(Array.isArray(b.tickets)).toBe(true)
  expect(typeof b.total).toBe("number")
  expect(b.page).toBe(1)
  expect(b.limit).toBe(50)
  const t = b.tickets.find((x: any) => x.id === CREATED_ID)
  expect(t).toBeTruthy()
  expect(t.title).toBe("Login button unresponsive")
  expect(t.description).toBe("clicking does nothing")
  expect(t.priority).toBe("high")
  expect(t.status).toBe("open")
  expect(t.assignee).toBe(ADMIN_EMAIL)
  expect(t.source).toBe("manual")
  expect(Array.isArray(t.labels)).toBe(true)
  expect(typeof t.created_at).toBe("number")
})

test("GET /api/v1/tickets — priority filter narrows the result", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets?priority=low`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.tickets.find((x: any) => x.id === CREATED_ID)).toBeFalsy()
})

// ── Get single (enriched) ──

test("GET /api/v1/tickets/:id — enriched shape with attachments + replay_url + comments_count", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.id).toBe(CREATED_ID)
  expect(b.title).toBe("Login button unresponsive")
  expect(Array.isArray(b.attachments)).toBe(true)
  expect(b.comments_count).toBe(0)
  expect("replay_url" in b).toBe(true)
})

test("GET /api/v1/tickets/:id — 404 for unknown ticket", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets/fb_nope_${ts}`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(404)
})

test("GET /api/v1/tickets/:id — cross-project ticket id → 404 (IDOR guard)", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets/${FEEDBACK_B_ID}`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(404)
})

// ── Update ──

test("PATCH /api/v1/tickets/:id — status change persists + returns v1 shape", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ status: "in_progress" }),
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.ok).toBe(true)
  expect(b.ticket.status).toBe("in_progress")
  // Verify persistence via a fresh GET.
  const g = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}`, { headers: { Authorization: bearer(CI_TOKEN) } })
  const gb = await g.json() as any
  expect(gb.status).toBe("in_progress")
})

test("PATCH /api/v1/tickets/:id — invalid status → 400", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ status: "bogus" }),
  })
  expect(r.status).toBe(400)
})

test("PATCH /api/v1/tickets/:id — cross-project id → 404", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets/${FEEDBACK_B_ID}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ status: "done" }),
  })
  expect(r.status).toBe(404)
})

// ── Comments ──

test("POST + GET /api/v1/tickets/:id/comments — add then list", async () => {
  const p = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ body: "Reproduced on staging." }),
  })
  expect(p.status).toBe(201)
  const pb = await p.json() as any
  expect(pb.comment.body).toBe("Reproduced on staging.")
  expect(pb.comment.author).toBe(ADMIN_EMAIL)

  const g = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}/comments`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(g.status).toBe(200)
  const gb = await g.json() as any
  expect(gb.ticket_id).toBe(CREATED_ID)
  expect(gb.comments.length).toBe(1)
  expect(gb.comments[0].body).toBe("Reproduced on staging.")
})

test("POST /api/v1/tickets/:id/comments — empty body → 400", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ body: "   " }),
  })
  expect(r.status).toBe(400)
})

// ── Activity ──

test("GET /api/v1/tickets/:id/activity — timeline includes the comment + status change", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}/activity`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.ticket_id).toBe(CREATED_ID)
  expect(Array.isArray(b.events)).toBe(true)
  const kinds = b.events.map((e: any) => e.type)
  expect(kinds).toContain("comment")
  expect(kinds).toContain("ticket_status_changed")
})

// ── C3-1 (pagination): non-finite page/limit must 400, not reach the DB (neg-control). ──

test("C3-1: GET /api/v1/tickets?page=NaN → 400 (finite-int guard)", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets?page=NaN`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(400)
  const b = await r.json() as any
  expect(b.error.code).toBe("bad_request")
})

test("C3-1: GET /api/v1/tickets?limit=Infinity → 400", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets?limit=Infinity`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(400)
})

// ── C3-2 (null body): a JSON `null` body must 400, not throw a 500 (neg-control). ──

test("C3-2: POST /api/v1/tickets with body null → 400", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: "null",
  })
  expect(r.status).toBe(400)
  const b = await r.json() as any
  expect(b.error.code).toBe("bad_request")
})

test("C3-2: PATCH /api/v1/tickets/:id with body null → 400", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: "null",
  })
  expect(r.status).toBe(400)
})

// ── C2-3 (replay route): the advertised replay_url must actually stream the gzipped replay. ──

test("C2-3: GET /api/v1/tickets/:id/replay → 200 gzip for a ticket with a replay row", async () => {
  // Seed a feedback_replays row for the created ticket (gzip of an empty events array).
  const gzB64 = Buffer.from(Bun.gzipSync(Buffer.from("[]"))).toString("base64")
  await rawExec(
    `INSERT INTO feedback_replays (id, feedback_id, project_id, events_gz, n_events, trimmed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [`rep_${ts}`, CREATED_ID, PROJECT_ID, gzB64, 0, 0, NOW],
  )
  const r = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}/replay`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(200)
  expect((r.headers.get("content-encoding") || "")).toContain("gzip")
  expect(r.headers.get("x-klv-feedback")).toBe(CREATED_ID)
  // fetch transparently gunzips; the body decodes to the stored events array.
  const body = await r.json() as any
  expect(Array.isArray(body)).toBe(true)
})

test("C2-3: GET /api/v1/tickets/:id/replay — cross-project id → 404 (IDOR guard)", async () => {
  const r = await fetch(`${BASE}/api/v1/tickets/${FEEDBACK_B_ID}/replay`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(404)
})

test("C2-3: GET /api/v1/tickets/:id/replay — ticket with no replay → 404", async () => {
  // A second ticket, no feedback_replays row.
  const c = await fetch(`${BASE}/api/v1/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ title: "no replay ticket", assignee: ADMIN_EMAIL }),
  })
  const noReplayId = (await c.json() as any).ticket_id
  const r = await fetch(`${BASE}/api/v1/tickets/${noReplayId}/replay`, { headers: { Authorization: bearer(CI_TOKEN) } })
  expect(r.status).toBe(404)
})

// ── C2-1 (rate limit): the comment endpoint must throttle (neg-control — was unlimited). Runs LAST
// because it deliberately exhausts the per-project comment limiter for the rest of the minute. ──

test("C2-1: POST /api/v1/tickets/:id/comments — exceeding the limit → 429", async () => {
  let got429 = false
  // The limiter is 60/min/project; fire enough to cross it.
  for (let i = 0; i < 75; i++) {
    const r = await fetch(`${BASE}/api/v1/tickets/${CREATED_ID}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
      body: JSON.stringify({ body: `spam ${i}` }),
    })
    if (r.status === 429) { got429 = true; break }
  }
  expect(got429).toBe(true)
})
