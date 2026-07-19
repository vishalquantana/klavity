// KLAVITYKLA-288 regression: the legacy personal/inline Plane path must stay dead.
//
// What this guards (each of these was live before the ticket, and a revert would resurrect it):
//   1. POST /api/feedback must make NO outbound tracker call, even when the caller forwards Plane
//      creds in the form (the extension's old "direct mode"). This is the load-bearing assertion:
//      the earlier double-file guard was a band-aid over an inline push that could file a second
//      Plane ticket alongside the connector auto-copy. We prove it with a real loopback receiver
//      and KLAV_TEST_ALLOW_LOOPBACK=1, so a resurrected inline push WOULD reach it and be counted.
//   2. The retired endpoints /api/integration and /api/integration/personal answer 410, and a POST
//      to them writes nothing into the `integrations` table.
//
// Subprocess-against-temp-DB pattern, mirrors server.feedback-widget.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-planelegacy-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")
const ACCOUNT_ID = `acct_planelegacy_${ts}`
const PROJECT_ID = `proj_planelegacy_${ts}`
const OWNER = "owner@test.local"
const SID = `sess_planelegacy_${ts}`
const NOW = Date.now()

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
const rawExec = (sql: string, args: any[] = []) => rawClient.execute({ sql, args })

await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS integrations (scope TEXT NOT NULL, owner_id TEXT NOT NULL, integration TEXT NOT NULL, config_json TEXT NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (scope, owner_id))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)

await rawExec(`INSERT OR IGNORE INTO users (email, name, created_at) VALUES (?,?,?)`, [OWNER, "Owner", NOW])
await rawExec(`INSERT OR IGNORE INTO sessions (id, email, created_at, expires_at) VALUES (?,?,?,?)`, [SID, OWNER, NOW, NOW + 86400000])
await rawExec(`INSERT OR IGNORE INTO accounts (id, name, owner_email, created_at) VALUES (?,?,?,?)`, [ACCOUNT_ID, "Plane Legacy", OWNER, NOW])
await rawExec(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?,?,?,?,?)`, [`am_${ts}`, ACCOUNT_ID, OWNER, "owner", NOW])
await rawExec(`INSERT OR IGNORE INTO projects (id, account_id, name, created_at, updated_at) VALUES (?,?,?,?,?)`, [PROJECT_ID, ACCOUNT_ID, "Plane Legacy Project", NOW, NOW])
await rawExec(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, created_at) VALUES (?,?,?,?,?)`, [`pm_${ts}`, PROJECT_ID, OWNER, "admin", NOW])

// ── Fake Plane: a loopback receiver that counts every inbound request. ─────────
// If the inline push ever comes back, it lands here and planeHits goes above 0.
let planeHits = 0
const planeRecv = Bun.serve({
  port: 0,
  fetch() {
    planeHits++
    return Response.json({ id: "issue-should-never-be-created", sequence_id: 999 })
  },
})
const PLANE_URL = `http://localhost:${planeRecv.port}`

let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  const port = 38200 + Math.floor(Math.random() * 500)
  BASE = `http://localhost:${port}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
      // Loopback deliberately ALLOWED: the SSRF guard must not be what stops the request.
      // We want the inline push (if it existed) to actually reach our receiver.
      KLAV_TEST_ALLOW_LOOPBACK: "1",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  planeRecv.stop(true)
  rawClient.close()
})

test("POST /api/feedback never pushes to Plane inline, even with forwarded creds", async () => {
  const before = planeHits
  const fd = new FormData()
  fd.set("description", "KLA-288: forwarded Plane creds must be ignored")
  fd.set("page_url", "https://test.local/checkout")
  fd.set("project_id", PROJECT_ID)
  fd.set("plane_host", PLANE_URL)
  fd.set("plane_workspace", "acme")
  fd.set("plane_project_id", "plane_proj_1")
  fd.set("plane_token", "plane_tok_legacy")

  const r = await fetch(`${BASE}/api/feedback`, {
    method: "POST",
    headers: { cookie: `klav_session=${SID}` },
    body: fd,
  })
  expect(r.status).toBe(200)
  const j = await r.json()
  expect(j.saved).toBe(true)

  // The discriminating assertion. Forwarded creds used to flip the handler onto the inline-push
  // branch, whose response was the Plane ticket (jira_key + a tracker issue_url) and never the
  // dashboard deep link. Now creds are inert, so an authed reporter ALWAYS gets the deep link back
  // to our own Tickets board and never an external key.
  expect(j.jira_key).toBeUndefined()
  expect(typeof j.issue_url).toBe("string")
  expect(String(j.issue_url).startsWith(`${BASE}/dashboard`)).toBe(true)
  expect(String(j.issue_url)).not.toContain(PLANE_URL)

  // Give a fire-and-forget push time to land before asserting it never happened.
  await Bun.sleep(600)
  expect(planeHits).toBe(before)

  // Nothing was written to the tracker columns either.
  const rows = await rawClient.execute({
    sql: "SELECT plane_issue_key, plane_issue_url FROM feedback WHERE project_id=?",
    args: [PROJECT_ID],
  })
  expect(rows.rows.length).toBeGreaterThan(0)
  for (const row of rows.rows as any[]) {
    expect(row.plane_issue_key ?? null).toBeNull()
    expect(row.plane_issue_url ?? null).toBeNull()
  }
})

test("legacy /api/integration endpoints are retired (410) and accept no writes", async () => {
  const cookie = `klav_session=${SID}`
  for (const p of ["/api/integration", "/api/integration/personal"]) {
    const get = await fetch(`${BASE}${p}?project=${PROJECT_ID}`, { headers: { cookie } })
    expect(get.status).toBe(410)
    const body = await get.json()
    expect(body.retired).toBe(true)

    const form = new FormData()
    form.set("token", "plane_tok_new")
    form.set("workspace", "acme")
    form.set("project_id", "plane_proj_1")
    const post = await fetch(`${BASE}${p}?project=${PROJECT_ID}`, { method: "POST", headers: { cookie }, body: form })
    expect(post.status).toBe(410)
  }
  // The write must not have created an integrations row for either scope.
  const left = await rawClient.execute("SELECT scope, owner_id FROM integrations WHERE integration='plane'")
  expect(left.rows.length).toBe(0)
})
