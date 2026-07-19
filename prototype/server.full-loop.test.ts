// KLAVITYKLA-252 — Full-loop e2e test [JTBD B.12]
//
// Exercises Klavity's core trust loop end-to-end, hermetically, against a booted
// test server on an OS-assigned ephemeral port + a fresh temp DB:
//
//   1. CAPTURE   — an authed reporter submits a bug via POST /api/feedback
//   2. INBOX     — it lands in the un-triaged inbox: GET /api/projects/:id/triage
//                  and is counted by the cross-project inbox: GET /api/inbox
//   3. NOT-YET   — it is NOT yet on the tickets board (still status='new')
//   4. TRIAGE    — a human triage-accepts it: PATCH /api/feedback/:id {status:"open"}
//   5. TICKET    — it now appears as an open ticket: GET /api/projects/:id/tickets
//                  and has DROPPED OUT of the triage queue
//   6. FLOW-BACK — status moves in_progress → done and the final state sticks:
//                  GET /api/feedback/:id reports status='done'
//
// A regression anywhere along this chain (submit persist, triage listing, the
// new→open triage transition, the tickets projection, or status flow-back) fails
// this one test. It is deliberately self-contained so it can run in isolation in
// the shared multi-worktree workspace without colliding with other bun servers.
//
// Pattern (mirrors server.triage-autocopy.test.ts): let the server's own initDb()
// build the FULL schema on an empty temp DB, then seed just the auth fixtures via a
// second libsql client, then drive the loop over HTTP.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-fullloop-${ts}.db`)
const dbUrl = "file:" + srvDbFile

const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(52)).toString("base64")

const ADMIN_EMAIL = `vishal@quantana.com.au`
const ADMIN_SID = `sess_fl_${ts}`
const ACCOUNT_ID = `acct_fl_${ts}`
const PROJECT_ID = `proj_fl_${ts}`

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let rawClient: ReturnType<typeof createClient>
let BASE: string

// Grab a truly free OS-assigned port (bind :0, read the port, release it) rather than
// a fixed range — orphaned bun servers exist in this shared workspace and fixed ports collide.
async function freePort(): Promise<number> {
  const probe = Bun.serve({ port: 0, fetch: () => new Response("ok") })
  const p = probe.port
  probe.stop(true)
  return p
}

beforeAll(async () => {
  serverPort = await freePort()
  BASE = `http://localhost:${serverPort}`

  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort),
      TURSO_DATABASE_URL: dbUrl,
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

  // Wait until the server is serving (initDb + full schema has already run by then —
  // server.ts awaits initDb() at top-level BEFORE Bun.serve()).
  const deadline = Date.now() + 15_000
  let up = false
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) { up = true; break }
    } catch { /* not ready yet */ }
    await Bun.sleep(150)
  }
  if (!up) throw new Error("test server did not come up")

  // Seed the minimal auth graph AFTER boot — the server has already created every table.
  rawClient = createClient({ url: dbUrl })
  await rawClient.execute("PRAGMA journal_mode=WAL")
  await rawClient.execute("PRAGMA busy_timeout=5000")
  const now = Date.now()
  const exec = (sql: string, args: any[] = []) => rawClient.execute({ sql, args })

  await exec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, now])
  await exec(
    `INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`,
    [ACCOUNT_ID, "Full-Loop Workspace", ADMIN_EMAIL, now],
  )
  await exec(
    `INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`am_fl_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", now],
  )
  await exec(
    `INSERT INTO projects (id, account_id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [PROJECT_ID, ACCOUNT_ID, "Full-Loop Project", "active", now, now],
  )
  await exec(
    `INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`pm_fl_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", now],
  )
  await exec(
    `INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    [ADMIN_SID, ADMIN_EMAIL, now, now + 86_400_000],
  )
})

afterAll(() => {
  serverProc?.kill()
  try { rawClient?.close() } catch { /* ignore */ }
})

function authHeader(sid: string) {
  return { Authorization: `Bearer ${sid}`, Cookie: `klav_session=${sid}` }
}

async function api(method: string, path: string, body: any, sid: string) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader(sid) },
    body: body != null ? JSON.stringify(body) : undefined,
  })
}

test("full loop: submit report → inbox/triage → ticketize → status flows back", async () => {
  const marker = `FULLLOOP-${ts}`
  const description = `Checkout button unresponsive on mobile ${marker}`

  // ── 1. CAPTURE: submit a report the way the widget/extension does (multipart form) ──
  const fd = new FormData()
  fd.set("description", description)
  fd.set("project_id", PROJECT_ID)
  fd.set("page_url", "https://test.local/checkout")
  const submit = await fetch(`${BASE}/api/feedback`, {
    method: "POST",
    headers: authHeader(ADMIN_SID),
    body: fd,
  })
  expect(submit.status).toBe(200)
  const submitBody = await submit.json()
  expect(submitBody.saved).toBe(true)
  const feedbackId = String(submitBody.id)
  expect(feedbackId.length).toBeGreaterThan(0)

  // ── 2. INBOX: the report is in the un-triaged triage queue (status='new') ──
  const triageRes = await api("GET", `/api/projects/${PROJECT_ID}/triage`, null, ADMIN_SID)
  expect(triageRes.status).toBe(200)
  const triage = (await triageRes.json()).triage as any[]
  const queued = triage.find((r) => r.id === feedbackId)
  expect(queued).toBeTruthy()
  expect(String(queued.title)).toContain(marker)

  // cross-project inbox counts it as a new report
  const inboxRes = await api("GET", `/api/inbox`, null, ADMIN_SID)
  expect(inboxRes.status).toBe(200)
  const inbox = await inboxRes.json()
  expect(inbox.totalNew).toBeGreaterThanOrEqual(1)
  const inboxProj = (inbox.projects as any[]).find((p) => p.projectId === PROJECT_ID)
  expect(inboxProj).toBeTruthy()
  expect(inboxProj.newReportCount).toBeGreaterThanOrEqual(1)

  // ── 3. NOT-YET a ticket: the tickets board excludes un-triaged (status='new') rows ──
  const preTickets = await api("GET", `/api/projects/${PROJECT_ID}/tickets`, null, ADMIN_SID)
  expect(preTickets.status).toBe(200)
  const preList = (await preTickets.json()).tickets as any[]
  expect(preList.find((t) => t.id === feedbackId)).toBeFalsy()

  // ── 4. TRIAGE: a human accepts the report → status new→open ──
  const accept = await api("PATCH", `/api/feedback/${feedbackId}`, { status: "open", priority: "high" }, ADMIN_SID)
  expect(accept.status).toBe(200)
  expect((await accept.json()).ok).toBe(true)

  // ── 5. TICKET: it now shows on the tickets board and has left the triage queue ──
  const tickets = await api("GET", `/api/projects/${PROJECT_ID}/tickets`, null, ADMIN_SID)
  expect(tickets.status).toBe(200)
  const ticketList = (await tickets.json()).tickets as any[]
  const ticket = ticketList.find((t) => t.id === feedbackId)
  expect(ticket).toBeTruthy()
  expect(String(ticket.status)).toBe("open")
  expect(String(ticket.priority)).toBe("high")
  expect(String(ticket.title)).toContain(marker)

  const triageAfter = await api("GET", `/api/projects/${PROJECT_ID}/triage`, null, ADMIN_SID)
  const triageAfterList = (await triageAfter.json()).triage as any[]
  expect(triageAfterList.find((r) => r.id === feedbackId)).toBeFalsy()

  // ── 6. FLOW-BACK: status moves through the board and the resolution sticks ──
  const inProg = await api("PATCH", `/api/feedback/${feedbackId}`, { status: "in_progress" }, ADMIN_SID)
  expect(inProg.status).toBe(200)
  const done = await api("PATCH", `/api/feedback/${feedbackId}`, { status: "done" }, ADMIN_SID)
  expect(done.status).toBe(200)

  const finalRes = await api("GET", `/api/feedback/${feedbackId}`, null, ADMIN_SID)
  expect(finalRes.status).toBe(200)
  const report = (await finalRes.json()).report
  expect(String(report.status)).toBe("done")
  expect(String(report.observation)).toContain(marker)
}, 30_000)
