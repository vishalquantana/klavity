// QA mode (team-gated per-page bug view + close). Two endpoints, both AUTHENTICATED and gated on
// project membership (reporters/anonymous never reach them):
//   GET  /api/projects/:id/page-bugs?url=<full-url>  → this page's bugs + {open,inProgress,done} counts
//   POST /api/feedback/:id/qa-close { resolution? }  → mark Done + best-effort external-tracker close
//
// Hermetic pattern mirrors server.export-policy.test.ts / server.connectors.test.ts: a dedicated temp
// DB file seeded via a raw createClient, a real server subprocess, and a local Bun.serve fake Jira so
// the tracker transition can be asserted end-to-end (loopback is allowed for connectors in test).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-qamode-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, resolved_at INTEGER, seq_num INTEGER, title TEXT, contact_email TEXT, report_url TEXT, annotations_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)

const NOW = Date.now()
const ADMIN_EMAIL = `admin-${ts}@test.local`
const MEMBER_EMAIL = `member-${ts}@test.local`
const OUTSIDER_EMAIL = `outsider-${ts}@test.local`
const ADMIN_SID = `sess_admin_${ts}`
const MEMBER_SID = `sess_member_${ts}`
const OUTSIDER_SID = `sess_outsider_${ts}`
const ACCOUNT_ID = `acct_${ts}`
const PROJECT_ID = `proj_${ACCOUNT_ID}`
const OTHER_ACCOUNT_ID = `acctX_${ts}`
const OTHER_PROJECT_ID = `projX_${OTHER_ACCOUNT_ID}`

for (const e of [ADMIN_EMAIL, MEMBER_EMAIL, OUTSIDER_EMAIL]) {
  await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [e, NOW])
}
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Team WS", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_admin_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_member_${ts}`, ACCOUNT_ID, MEMBER_EMAIL, "member", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "Default", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_member_${ts}`, PROJECT_ID, MEMBER_EMAIL, "member", ADMIN_EMAIL, NOW])
// A separate account/project the OUTSIDER owns, so they are a legitimate logged-in Klavity user with
// NO access to PROJECT_ID — the exact "signed-in non-member" the team gate must reject.
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [OTHER_ACCOUNT_ID, "Other WS", OUTSIDER_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_out_${ts}`, OTHER_ACCOUNT_ID, OUTSIDER_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [OTHER_PROJECT_ID, OTHER_ACCOUNT_ID, "OtherProj", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_out_${ts}`, OTHER_PROJECT_ID, OUTSIDER_EMAIL, "admin", null, NOW])

for (const [sid, email] of [[ADMIN_SID, ADMIN_EMAIL], [MEMBER_SID, MEMBER_EMAIL], [OUTSIDER_SID, OUTSIDER_EMAIL]] as const) {
  await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [sid, email, NOW, NOW + 86400_000])
}

// ── Bugs on the target page (host app.example.com, path /dashboard) — one per status bucket. ──
const HOST = "app.example.com"
const FB_OPEN = `fb_open_${ts}`         // status open        → counts.open
const FB_DONE = `fb_done_${ts}`         // status done        → counts.done
const FB_INPROG = `fb_inprog_${ts}`     // status in_progress → counts.inProgress, captured at "/dashboard/" (trailing slash)
const FB_OTHER = `fb_other_${ts}`       // DIFFERENT page (/settings) — must NOT appear
const FB_CLOSE = `fb_close_${ts}`       // separate page (/billing) used only by the qa-close tests
const REGION = { x: 0.25, y: 0.4, w: 0.1, h: 0.05 }
async function seedFeedback(id: string, path: string, status: string, extra: Record<string, any> = {}) {
  await rawExec(
    `INSERT INTO feedback (id, project_id, actor_email, url_host, url_path, observation, priority, severity, status, notes, annotations_json, title, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, PROJECT_ID, extra.actor ?? `reporter-${ts}@ext.example`, HOST, path, extra.observation ?? `bug at ${path}`,
     extra.priority ?? "high", extra.severity ?? null, status, extra.notes ?? null,
     extra.annotations ?? null, extra.title ?? null, NOW],
  )
}
await seedFeedback(FB_OPEN, "/dashboard", "open", { annotations: JSON.stringify([{ w: 1440, h: 900, shapes: [], region: REGION }]), title: "Save button misaligned" })
await seedFeedback(FB_DONE, "/dashboard", "done")
await seedFeedback(FB_INPROG, "/dashboard/", "in_progress")
await seedFeedback(FB_OTHER, "/settings", "open")
await seedFeedback(FB_CLOSE, "/billing", "open", { observation: "billing bug to close" })

let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string
// Fake Jira: records the transition calls so the qa-close test can assert the tracker was hit.
let jira: ReturnType<typeof Bun.serve>
let jiraGetHits = 0
let jiraPostHits = 0
let jiraLastKey = ""

beforeAll(async () => {
  jira = Bun.serve({
    port: 0,
    async fetch(req) {
      const u = new URL(req.url)
      if (u.pathname.endsWith("/transitions") && req.method === "GET") {
        jiraGetHits++
        jiraLastKey = u.pathname.split("/").slice(-2)[0]
        return new Response(JSON.stringify({ transitions: [{ id: "31", name: "Done", to: { name: "Done" } }] }), { status: 200, headers: { "content-type": "application/json" } })
      }
      if (u.pathname.endsWith("/transitions") && req.method === "POST") {
        jiraPostHits++
        return new Response(null, { status: 204 })
      }
      return new Response("{}", { status: 200, headers: { "content-type": "application/json" } })
    },
  })
  const jiraHost = `http://localhost:${jira.port}`
  // A Jira connector (has a real transitionIssue capability) + a successful export of FB_CLOSE, so
  // qa-close has an external issue to transition. `done_status` names the target workflow state.
  const CONNECTOR_ID = `conn_${ts}`
  await rawExec(
    `INSERT INTO connectors (id, project_id, type, name, config, auto_copy, enabled, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [CONNECTOR_ID, PROJECT_ID, "jira", "Acme Jira",
     JSON.stringify({ host: jiraHost, email: "svc@acme.test", token: "jira-token", project_key: "PROJ", done_status: "Done" }),
     0, 1, NOW, ADMIN_EMAIL],
  )
  await rawExec(
    `INSERT INTO ticket_exports (id, feedback_id, project_id, connector_id, type, external_key, external_url, status, error, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [`exp_${ts}`, FB_CLOSE, PROJECT_ID, CONNECTOR_ID, "jira", "PROJ-1", `${jiraHost}/browse/PROJ-1`, "ok", null, NOW, ADMIN_EMAIL],
  )

  const serverPort = 35000 + Math.floor(Math.random() * 1000)
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
      KLAV_TEST_ALLOW_LOOPBACK: "1",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  jira?.stop(true)
  rawClient.close()
})

function api(method: string, path: string, sid: string | null, body?: any) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(sid ? { Cookie: `klav_session=${sid}` } : {}) },
    body: body != null ? JSON.stringify(body) : undefined,
  })
}
const pageUrl = (u: string) => `/api/projects/${PROJECT_ID}/page-bugs?url=${encodeURIComponent(u)}`

// ── GET /page-bugs ───────────────────────────────────────────────────────────

test("page-bugs returns only this-URL bugs for a member, with counts + client shape", async () => {
  const r = await api("GET", pageUrl(`https://${HOST}/dashboard?tab=1#frag`), MEMBER_SID)
  expect(r.status).toBe(200)
  const body = await r.json()
  const ids = body.bugs.map((b: any) => b.id).sort()
  // FB_OPEN, FB_DONE, FB_INPROG (captured at "/dashboard/") match; FB_OTHER (/settings) does not.
  expect(ids).toEqual([FB_DONE, FB_INPROG, FB_OPEN].sort())
  expect(body.counts).toEqual({ open: 1, inProgress: 1, done: 1 })

  const open = body.bugs.find((b: any) => b.id === FB_OPEN)
  expect(open.ref).toBe(FB_OPEN.split("-")[0])
  expect(open.title).toBe("Save button misaligned")   // explicit Title preferred over observation
  expect(open.status).toBe("open")
  expect(open.severity).toBe("high")                   // effective priority
  expect(open.reporterEmail).toBe(`reporter-${ts}@ext.example`)
  expect(typeof open.createdAt).toBe("number")
  expect(open.pageUrl).toContain("/dashboard")
  expect(open.screenshotUrl).toBeNull()                // no screenshot on this row
  expect(open.coords).toEqual(REGION)                  // captured annotation region surfaced as coords

  const done = body.bugs.find((b: any) => b.id === FB_DONE)
  expect(done.coords).toBeUndefined()                  // omitted when the report captured no region
})

test("page-bugs is team-gated: a signed-in NON-member gets 403", async () => {
  const r = await api("GET", pageUrl(`https://${HOST}/dashboard`), OUTSIDER_SID)
  expect(r.status).toBe(403)
})

test("page-bugs requires auth: no session → 401", async () => {
  const r = await api("GET", pageUrl(`https://${HOST}/dashboard`), null)
  expect(r.status).toBe(401)
})

test("page-bugs rejects a missing/invalid url param with 400", async () => {
  const r = await api("GET", `/api/projects/${PROJECT_ID}/page-bugs`, MEMBER_SID)
  expect(r.status).toBe(400)
})

// ── POST /qa-close ───────────────────────────────────────────────────────────

test("qa-close requires auth: no session → 401", async () => {
  const r = await api("POST", `/api/feedback/${FB_CLOSE}/qa-close`, null, {})
  expect(r.status).toBe(401)
})

test("qa-close is team-gated: a non-member cannot close (404, row not accessible)", async () => {
  const r = await api("POST", `/api/feedback/${FB_CLOSE}/qa-close`, OUTSIDER_SID, {})
  expect(r.status).toBe(404)
  // Still open in the DB — the non-member's call changed nothing.
  const row = await rawClient.execute({ sql: "SELECT status FROM feedback WHERE id=?", args: [FB_CLOSE] })
  expect(String((row.rows[0] as any).status)).toBe("open")
})

test("qa-close sets Done + attempts the tracker transition + records who closed it", async () => {
  const beforeGet = jiraGetHits, beforePost = jiraPostHits
  const r = await api("POST", `/api/feedback/${FB_CLOSE}/qa-close`, MEMBER_SID, { resolution: "fixed the padding" })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(body.status).toBe("done")
  expect(body.previousStatus).toBe("open")
  expect(body.tracker.attempted).toBe(1)
  expect(body.tracker.applied).toBe(1)
  expect(body.warning).toBeNull()

  // Feedback row is now Done with resolved_at stamped.
  const row = await rawClient.execute({ sql: "SELECT status, resolved_at, notes FROM feedback WHERE id=?", args: [FB_CLOSE] })
  expect(String((row.rows[0] as any).status)).toBe("done")
  expect(Number((row.rows[0] as any).resolved_at)).toBeGreaterThan(0)
  expect(String((row.rows[0] as any).notes)).toContain("fixed the padding")

  // The external Jira issue was transitioned (GET transitions → POST transition on PROJ-1).
  expect(jiraGetHits).toBeGreaterThan(beforeGet)
  expect(jiraPostHits).toBeGreaterThan(beforePost)
  expect(jiraLastKey).toBe("PROJ-1")

  // Audit trail: an activity event names the closer (session user).
  const act = await rawClient.execute({ sql: "SELECT actor_email, type FROM activity_events WHERE feedback_id=? AND type='ticket_qa_closed'", args: [FB_CLOSE] })
  expect(act.rows.length).toBe(1)
  expect(String((act.rows[0] as any).actor_email)).toBe(MEMBER_EMAIL)
})
