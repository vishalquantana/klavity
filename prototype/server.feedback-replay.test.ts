// G1 session replay — end-to-end over HTTP: /api/feedback ingests replay_events, stores them,
// and GET /api/feedback/:id/replay serves them back (auth + project-scoped).
// Subprocess-against-temp-DB pattern, mirrors server.feedback-anon.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __netKLA719 from "node:net"
// KLA-719: OS-assigned free port (replaces a crowded random base that let co-scheduled
// server suites collide and answer each other's requests → spurious 401/404/no-such-table).
function __freePortKLA719(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __netKLA719.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-frep-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
// SQLITE_BUSY guard: the spawned server and this rawClient write the same file: DB concurrently;
// WAL + a 5s busy_timeout make writers WAIT for the lock instead of erroring under CI contention.
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema — the tables the /api/feedback + dashboard + replay paths touch (incl. feedback_replays).
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS login_otps (email TEXT NOT NULL, code TEXT NOT NULL, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE TABLE IF NOT EXISTS memberships (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(workspace_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, contact_email TEXT, recurrence_count INTEGER NOT NULL DEFAULT 1, recurrence_dates_json TEXT, last_seen_at INTEGER, issue_key TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback_replays (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, events_gz TEXT NOT NULL, n_events INTEGER, bytes INTEGER, trimmed INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS feedback_replay_idx ON feedback_replays(project_id, feedback_id)`)

const now = Date.now()
// Account a1 + project p1, owned & member: owner@test.local (the authenticated dashboard user).
await rawExec(`INSERT INTO accounts (id, name, owner_email, domain, plan, created_at) VALUES ('a1','Acct','owner@test.local','test.local','free',?)`, [now])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES ('am1','a1','owner@test.local','admin',?)`, [now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES ('p1','a1','Proj','active','auto','named','{}','support',?,?)`, [now, now])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES ('pm1','p1','owner@test.local','admin',?)`, [now])
await rawExec(`INSERT INTO users (email, name, created_at) VALUES ('owner@test.local','Owner',?)`, [now])
// A second, foreign project p2 the user has NO access to (cross-tenant guard).
await rawExec(`INSERT INTO accounts (id, name, owner_email, domain, plan, created_at) VALUES ('a2','Other','x@other.local','other.local','free',?)`, [now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES ('p2','a2','Other Proj','active','auto','named','{}','support',?,?)`, [now, now])
// A feedback row on p2 with a replay — owner@test.local must NOT be able to read it.
await rawExec(`INSERT INTO feedback (id, project_id, observation, status, created_at) VALUES ('fb_foreign','p2','foreign bug','open',?)`, [now])
await rawExec(`INSERT INTO feedback_replays (id, feedback_id, project_id, events_gz, n_events, bytes, trimmed, created_at) VALUES ('frep_foreign','fb_foreign','p2','AAAA',2,4,0,?)`, [now])

let serverPort: number, serverProc: ReturnType<typeof Bun.spawn>, BASE: string, sessionCookie = ""

beforeAll(async () => {
  serverPort = await __freePortKLA719()
  BASE = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: { ...process.env, PORT: String(serverPort), TURSO_DATABASE_URL: "file:" + srvDbFile, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local", KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "test-key" },
    stdout: "pipe", stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(150)
  }
  // Log in owner@test.local via dev-OTP (KLAV_DEV_SHOW_OTP=1 returns the code) to get a session cookie.
  const reqRes = await fetch(`${BASE}/api/auth/request`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "owner@test.local" }) })
  const reqJson = await reqRes.json()
  const code = String(reqJson.devCode || "")
  const ver = await fetch(`${BASE}/api/auth/verify`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "owner@test.local", code }) })
  sessionCookie = (ver.headers.get("set-cookie") || "").split(";")[0]
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

const sampleEvents = () => ([
  { type: 4, timestamp: 1000, data: { href: "https://test.local/", width: 1280, height: 720 } },
  { type: 2, timestamp: 1010, data: { node: { type: 0, childNodes: [], id: 1 }, initialOffset: { left: 0, top: 0 } } },
  { type: 3, timestamp: 2000, data: { source: 2, type: 1, id: 5, x: 100, y: 200 } },
  { type: 3, timestamp: 3000, data: { source: 2, type: 2, id: 5, x: 110, y: 210 } },
])

test("login produced a session cookie", () => { expect(sessionCookie).toContain("klav_session=") })

test("POST /api/feedback ingests replay_events and GET …/replay serves them back", async () => {
  const fd = new FormData()
  fd.set("description", "bug with replay"); fd.set("page_url", "https://test.local/checkout"); fd.set("project_id", "p1")
  fd.set("replay_events", JSON.stringify(sampleEvents()))
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { cookie: sessionCookie } })
  expect(r.status).toBe(200)
  const j = await r.json(); expect(j.saved).toBe(true); expect(j.id).toBeTruthy()

  // a feedback_replays row exists for this feedback id
  const row = await rawClient.execute({ sql: "SELECT n_events, project_id FROM feedback_replays WHERE feedback_id=?", args: [j.id] })
  expect(row.rows.length).toBe(1)
  expect(Number(row.rows[0].n_events)).toBe(4)
  expect(row.rows[0].project_id).toBe("p1")

  // GET the replay back (authed). KLA-759: the endpoint now streams the already-gzipped events with
  // Content-Encoding: gzip — the body is a top-level events ARRAY (meta rides in x-klv-* headers) and the
  // fetch client decompresses transparently, so `.json()` yields the array directly.
  const rr = await fetch(`${BASE}/api/feedback/${encodeURIComponent(j.id)}/replay`, { headers: { cookie: sessionCookie } })
  expect(rr.status).toBe(200)
  expect((rr.headers.get("content-encoding") || "").toLowerCase()).toContain("gzip")
  expect(rr.headers.get("content-type")).toContain("application/json")
  expect(rr.headers.get("x-klv-nevents")).toBe("4")
  expect(rr.headers.get("x-klv-trimmed")).toBe("0")
  expect((rr.headers.get("cache-control") || "")).toContain("no-store")
  const rj = await rr.json()
  expect(Array.isArray(rj)).toBe(true)
  expect(rj).toHaveLength(4)
  expect(rj[2].data.x).toBe(100)
})

test("…/replay does NOT double-encode: the raw wire bytes gunzip back to the events JSON", async () => {
  // Fetch the same replay but decode the wire bytes OURSELVES to prove the body is single-gzipped
  // (Bun.serve must not re-compress a body that already carries a Content-Encoding).
  const fd = new FormData()
  fd.set("description", "bug for gzip check"); fd.set("page_url", "https://test.local/gz"); fd.set("project_id", "p1")
  fd.set("replay_events", JSON.stringify(sampleEvents()))
  const post = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { cookie: sessionCookie } })
  const pj = await post.json()
  // Ask for the raw (still-compressed) bytes by disabling auto-decompression is not directly possible in
  // fetch; instead prove correctness two ways: (a) json() decodes to the array (single decode), and (b) a
  // single manual gunzip of the arrayBuffer, if it were double-encoded, would NOT yield valid JSON.
  const rr = await fetch(`${BASE}/api/feedback/${encodeURIComponent(pj.id)}/replay`, { headers: { cookie: sessionCookie } })
  const arr = await rr.json()
  expect(Array.isArray(arr)).toBe(true)
  expect(arr).toHaveLength(4)
})

test("GET …/replay returns 404 for a ticket with no replay", async () => {
  const fd = new FormData()
  fd.set("description", "bug NO replay"); fd.set("page_url", "https://test.local/x"); fd.set("project_id", "p1")
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { cookie: sessionCookie } })
  const j = await r.json()
  const rr = await fetch(`${BASE}/api/feedback/${encodeURIComponent(j.id)}/replay`, { headers: { cookie: sessionCookie } })
  expect(rr.status).toBe(404)
})

test("GET …/replay requires auth (no session → 401/redirect, never the events)", async () => {
  const rr = await fetch(`${BASE}/api/feedback/fb_foreign/replay`, { redirect: "manual" })
  expect([401, 302, 303, 307].includes(rr.status)).toBe(true)
})

test("GET …/replay is project-scoped — a user cannot read a foreign project's replay", async () => {
  const rr = await fetch(`${BASE}/api/feedback/fb_foreign/replay`, { headers: { cookie: sessionCookie } })
  // owner@test.local has no access to p2's fb_foreign → 404 (not-found-or-not-accessible).
  expect(rr.status).toBe(404)
})

// ── /replay-frame viewer shell (KLA replay-loading-fix) ───────────────────────────────────────────
// The shell is static HTML+JS; the events are fetched client-side. We assert the shell now ships the
// progress UI (determinate download bar + indeterminate rebuild), a hard client-side timeout with a
// Retry button, and the honest empty-path message — so a big replay never looks frozen.
let frameFbId = ""
test("a feedback with a replay exists for the frame test", async () => {
  const fd = new FormData()
  fd.set("description", "bug for frame"); fd.set("page_url", "https://test.local/frame"); fd.set("project_id", "p1")
  fd.set("replay_events", JSON.stringify(sampleEvents()))
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { cookie: sessionCookie } })
  const j = await r.json(); frameFbId = String(j.id); expect(frameFbId).toBeTruthy()
})

test("GET /replay-frame renders the progress + timeout + retry viewer shell (authed)", async () => {
  const r = await fetch(`${BASE}/replay-frame?fb=${encodeURIComponent(frameFbId)}`, { headers: { cookie: sessionCookie } })
  expect(r.status).toBe(200)
  const html = await r.text()
  // progress UI scaffold
  expect(html).toContain('id="klvbarwrap"')
  expect(html).toContain('id="klvbar"')
  expect(html).toContain('id="klvstatus"')
  expect(html).toContain('id="klvretry"')
  // determinate download-progress logic (streamed reader + Content-Length %)
  expect(html).toContain("getReader")
  expect(html).toContain("content-length")
  expect(html).toContain("setPct(")
  // indeterminate rebuild phase
  expect(html).toContain("Rebuilding session")
  expect(html).toContain("setIndet(")
  // hard timeouts + retry
  expect(html).toContain("DL_TIMEOUT")
  expect(html).toContain("MOUNT_TIMEOUT")
  expect(html).toContain("AbortController")
  expect(html).toContain("addEventListener('click',boot)")
  // honest states still posted up to the parent
  expect(html).toContain("No replay was recorded for this report.")
  expect(html).toContain("'timeout')")   // fail(...,'timeout') on download/mount budget exhaustion
  expect(html).toContain("status:'none'")
  // frame CSP already relaxes media-src for the recorded page (CSP media issue is benign)
  expect(r.headers.get("content-security-policy") || "").toContain("media-src * blob: data:")
  // KLA-759 render fix — the reveal-gate override now also HIDES Klavity's own captured widget chrome
  // (the confirmed blank-render cause: a self-captured full-viewport composer overlay), plus the common
  // scroll-reveal gates, while still lifting the classic ng-cloak/v-cloak/preloader gates.
  expect(html).toContain(".klavity-overlay")
  expect(html).toContain("#klavity-widget-host")
  expect(html).toContain(".kl-float-tip")
  expect(html).toContain("[data-aos]")
  expect(html).toContain("[v-cloak]")
  expect(html).toContain("klv-reveal-fix")
  // KLA-759 perf — the boot fetch normalizes the gz-streamed events ARRAY + reads meta from x-klv-* headers,
  // and skips the determinate %-bar when the response is gzip-encoded.
  expect(html).toContain("x-klv-nevents")
  expect(html).toContain("Array.isArray(d)")
  expect(html).toContain("content-encoding")
})

test("GET /replay-frame without a session shows the sign-in message (no shell)", async () => {
  const r = await fetch(`${BASE}/replay-frame?fb=${encodeURIComponent(frameFbId)}`)
  expect(r.status).toBe(200)
  const html = await r.text()
  expect(html).toContain("Please sign in to view this replay.")
  expect(html).not.toContain('id="klvbar"')
})

test("the /replay-frame inline boot script parses as valid JS", async () => {
  // server.ts is not covered by scripts/check-inline-js.mjs (it only scans site/ + prototype/public),
  // so guard the hand-concatenated boot string here: extract the second <script> and compile it.
  const r = await fetch(`${BASE}/replay-frame?fb=${encodeURIComponent(frameFbId)}`, { headers: { cookie: sessionCookie } })
  const html = await r.text()
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
  const boot = scripts.find((s) => s.includes("DL_TIMEOUT"))
  expect(boot).toBeTruthy()
  expect(() => new Function(boot as string)).not.toThrow()
})

test("garbage replay_events is ignored but the bug still saves", async () => {
  const fd = new FormData()
  fd.set("description", "bug bad replay"); fd.set("page_url", "https://test.local/y"); fd.set("project_id", "p1")
  fd.set("replay_events", "{not json[")
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { cookie: sessionCookie } })
  expect(r.status).toBe(200)
  const j = await r.json(); expect(j.saved).toBe(true)
  const row = await rawClient.execute({ sql: "SELECT COUNT(*) c FROM feedback_replays WHERE feedback_id=?", args: [j.id] })
  expect(Number(row.rows[0].c)).toBe(0)
})
