// Snap routing (human-Snap auto-file vs review-first) — HTTP integration tests.
// Verifies:
//  1. autofile mode (DEFAULT): a HUMAN Snap (POST /api/feedback, no sim_id) with an auto_copy tracker
//     exports to the tracker IMMEDIATELY on submit — reusing the existing auto-copy path.
//  2. review mode: a human Snap does NOT auto-export on submit; the manual export endpoint
//     (POST /api/feedback/:id/export) still sends it.
//  3. Sim/AutoSim reports are UNAFFECTED: a report attributed to a Sim (sim_id set) does NOT autofile
//     on submit even in autofile mode (it keeps its triage-gated behavior).
//  4. The setting persists + defaults to autofile via GET /api/projects/:id/snap-routing.
//
// Pattern mirrors server.triage-autocopy.test.ts: spawn the real server against a fresh temp DB,
// exercise via HTTP. applySchema (run on boot) ALTER-adds the snap_routing column to the seeded
// projects table (default 'autofile').

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { sha256hex } from "./lib/crypto"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-snap-routing-${ts}.db`)

const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(55)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// Minimal schema (mirrors server.triage-autocopy.test.ts). applySchema fills the rest on boot.
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'new', assignee TEXT, notes TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_texports_feedback ON ticket_exports(feedback_id)`)

// ── Fixtures ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `vishal@quantana.com.au`
const ADMIN_SID = `sess_sr_admin_${ts}`
const ACCOUNT_ID = `acct_sr_${ts}`
const PROJECT_ID = `proj_sr_${ts}`
const SIM_ID = `sim_sr_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "SR Test Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_sr_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJECT_ID, ACCOUNT_ID, "SR Test Project", "active", "auto", 200, "named", "{}", "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_sr_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
// A Sim persona so a report can be attributed to it (sim_id) and prove Sim reports are unaffected.
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [SIM_ID, PROJECT_ID, "Test Sim", "buyer", "client", NOW, NOW])

// ── Server spawn ────────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 47000 + Math.floor(Math.random() * 1000)
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
      KLAV_TEST_ALLOW_LOOPBACK: "1",
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
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function authHeader(sid: string) { return { Authorization: `Bearer ${sid}`, Cookie: `klav_session=${sid}` } }
async function api(method: string, path: string, body: any, sid: string) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader(sid) },
    body: body != null ? JSON.stringify(body) : undefined,
  })
}
async function exportRows(connectorId: string) {
  const r = await rawClient.execute({
    sql: "SELECT status, feedback_id FROM ticket_exports WHERE connector_id=? ORDER BY rowid ASC",
    args: [connectorId],
  })
  return r.rows as any[]
}
async function waitForExport(connectorId: string, count = 1, waitMs = 4000): Promise<any[]> {
  const deadline = Date.now() + waitMs
  while (Date.now() < deadline) {
    const rows = await exportRows(connectorId)
    if (rows.length >= count) return rows
    await Bun.sleep(60)
  }
  return exportRows(connectorId)
}
async function submitHumanSnap(desc: string, extra: Record<string, string> = {}) {
  const fd = new FormData()
  fd.set("description", desc)
  fd.set("project_id", PROJECT_ID)
  for (const [k, v] of Object.entries(extra)) fd.set(k, v)
  return fetch(`${BASE}/api/feedback`, { method: "POST", headers: authHeader(ADMIN_SID), body: fd })
}
// #534 hardening: an ANONYMOUS cross-origin widget submit — no session cookie, no bearer token, and an
// Origin that differs from the server's base origin. This is the anonWidgetAllowed path (default report
// gate is 'anonymous'; Turnstile is unconfigured in the test env so it is a no-op). Provenance is NOT
// trusted, so a connector-less autofile must NOT advance it onto the Tickets board.
async function submitAnonWidgetSnap(desc: string, extra: Record<string, string> = {}) {
  const fd = new FormData()
  fd.set("description", desc)
  fd.set("project_id", PROJECT_ID)
  for (const [k, v] of Object.entries(extra)) fd.set(k, v)
  return fetch(`${BASE}/api/feedback`, {
    method: "POST",
    headers: { Origin: "https://widget-customer.example" },   // cross-origin, unauthenticated
    body: fd,
  })
}
async function feedbackStatus(fid: string): Promise<string | null> {
  const r = await rawClient.execute({ sql: "SELECT status FROM feedback WHERE id=?", args: [fid] })
  return r.rows.length ? String((r.rows[0] as any).status) : null
}
async function waitForStatus(fid: string, target: string, waitMs = 4000): Promise<string | null> {
  const deadline = Date.now() + waitMs
  let last: string | null = null
  while (Date.now() < deadline) {
    last = await feedbackStatus(fid)
    if (last === target) return last
    await Bun.sleep(60)
  }
  return last
}
async function ticketsContain(fid: string): Promise<boolean> {
  const r = await api("GET", `/api/projects/${PROJECT_ID}/tickets`, null, ADMIN_SID)
  const d = await r.json()
  return Array.isArray(d.tickets) && d.tickets.some((t: any) => t.id === fid)
}
// A high-entropy, mutually-dissimilar description per submit. The suggested-bug dedup collapses
// reports whose title/observation trigram similarity ≥ 0.82 (lib/dedup.ts), and it looks across the
// recent 50 rows regardless of URL — so near-identical test descriptions would merge into one row and
// silently defeat the per-report assertions. Two UUIDs keep any two of these well under threshold.
function uniqueDesc(label: string): string {
  return `${label} ${crypto.randomUUID()} ${crypto.randomUUID()}`
}
// Test isolation: auto-copy connectors accumulate on the shared project across tests, so a fresh
// human Snap would fan out to leftover connectors (with stale/relaunched receivers) and pollute the
// per-test export assertions. Remove every existing connector so each KLA-524 test files only to the
// single connector it just created.
async function clearConnectors() {
  const r = await api("GET", `/api/projects/${PROJECT_ID}/connectors`, null, ADMIN_SID)
  const d = await r.json().catch(() => ({}))
  const list: any[] = Array.isArray(d.connectors) ? d.connectors : []
  for (const c of list) {
    await api("DELETE", `/api/projects/${PROJECT_ID}/connectors/${c.id}`, null, ADMIN_SID)
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

// The setting defaults to autofile (fresh project, column added by applySchema on boot).
test("snap-routing defaults to autofile and persists a POST'd change", async () => {
  const g = await api("GET", `/api/projects/${PROJECT_ID}/snap-routing`, null, ADMIN_SID)
  expect(g.status).toBe(200)
  const gd = await g.json()
  expect(gd.snapRouting).toBe("autofile")
  expect(gd.modes).toEqual(["autofile", "review"])

  const p = await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  expect(p.status).toBe(200)
  expect((await p.json()).snapRouting).toBe("review")

  const g2 = await api("GET", `/api/projects/${PROJECT_ID}/snap-routing`, null, ADMIN_SID)
  expect((await g2.json()).snapRouting).toBe("review")

  // Restore to autofile for the following tests.
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
})

// AUTOFILE (default): a human Snap with an auto_copy tracker exports on SUBMIT.
test("autofile mode: human Snap auto-files to the tracker on submit", async () => {
  let hits = 0
  const recv = Bun.serve({ port: 0, fetch() { hits++; return new Response(JSON.stringify({ id: "af1" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "SR Autofile Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fr = await submitHumanSnap(`autofile human snap ${ts}`)
    expect(fr.ok).toBe(true)

    const landed = await waitForExport(cid, 1, 5000)
    expect(landed.length).toBe(1)
    expect(String(landed[0].status)).toBe("ok")
    expect(hits).toBe(1)
  } finally { recv.stop(true) }
}, 15000)

// REVIEW mode: a human Snap does NOT auto-export on submit; manual export sends it.
test("review mode: human Snap does not auto-export on submit; manual export sends it", async () => {
  let hits = 0
  const recv = Bun.serve({ port: 0, fetch() { hits++; return new Response(JSON.stringify({ id: "rv1" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "SR Review Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fr = await submitHumanSnap(`review human snap ${ts}`)
    expect(fr.ok).toBe(true)
    const fid = (await fr.json()).id
    expect(fid).toBeTruthy()

    // No auto-export on submit in review mode.
    await Bun.sleep(900)
    expect(hits).toBe(0)
    expect((await exportRows(cid)).length).toBe(0)

    // Manual "Send to Jira": POST /api/feedback/:id/export sends it now.
    const ex = await api("POST", `/api/feedback/${fid}/export`, { connectorId: cid }, ADMIN_SID)
    expect(ex.status).toBe(200)
    const landed = await waitForExport(cid, 1, 5000)
    expect(landed.length).toBe(1)
    expect(String(landed[0].status)).toBe("ok")
    expect(hits).toBe(1)
  } finally { recv.stop(true) }
}, 15000)

// Sim/AutoSim reports are UNAFFECTED: attributed to a Sim, no autofile on submit even in autofile mode.
test("autofile mode: a Sim-attributed report does NOT auto-file on submit", async () => {
  let hits = 0
  const recv = Bun.serve({ port: 0, fetch() { hits++; return new Response(JSON.stringify({ id: "sim1" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "SR Sim Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)

    // Report attributed to a Sim persona → sim_id set → NOT a human Snap → no autofile on submit.
    const fr = await submitHumanSnap(`sim attributed report ${ts}`, { sim_id: SIM_ID })
    expect(fr.ok).toBe(true)

    await Bun.sleep(900)
    expect(hits).toBe(0)
  } finally { recv.stop(true) }
}, 15000)

// PX4 #472: a report carrying an UNREGISTERED sim_id (deleted persona / cross-project / adhoc run) must
// NOT be mis-classified as a Human Snap and auto-filed. The server coerces the unknown sim_id → null for
// attribution (A01/IDOR), but the autofile gate must key off the RAW sim_id, so autofile stays OFF.
test("autofile mode: a report with an UNREGISTERED sim_id does NOT auto-file on submit", async () => {
  let hits = 0
  const recv = Bun.serve({ port: 0, fetch() { hits++; return new Response(JSON.stringify({ id: "ghost1" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "SR Ghost-Sim Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)

    // sim_id present but NOT a registered persona on this project → still a bot/sim report, not human.
    const fr = await submitHumanSnap(`unregistered sim report ${ts}`, { sim_id: `sim_ghost_${ts}` })
    expect(fr.ok).toBe(true)

    await Bun.sleep(900)
    expect(hits).toBe(0)
  } finally { recv.stop(true) }
}, 15000)

// PX4 #472 control: a genuine human Snap (no sim_id, no sim/autosim source) with a NON-human source
// marker also stays OFF; and the plain human Snap (covered above) DOES file. This asserts the source
// marker path.
test("autofile mode: a report with source=autosim does NOT auto-file even with no sim_id", async () => {
  let hits = 0
  const recv = Bun.serve({ port: 0, fetch() { hits++; return new Response(JSON.stringify({ id: "autosim1" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "SR AutoSim-Source Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)

    const fr = await submitHumanSnap(`autosim source report ${ts}`, { source: "autosim" })
    expect(fr.ok).toBe(true)

    await Bun.sleep(900)
    expect(hits).toBe(0)
  } finally { recv.stop(true) }
}, 15000)

// ── KLAVITYKLA-524: autofile success advances new → open so the Snap appears in Tickets ──────────

// A SUCCESSFUL autofile in autofile mode moves the report out of "New Reports" (status='new') into the
// Tickets list (status='open', which listTicketsPaginated includes). The "Filed to Jira" tracker key is
// still recorded on the row.
test("KLA-524 autofile success: advances new→open and the Snap shows in the Tickets list", async () => {
  const recv = Bun.serve({ port: 0, fetch() { return new Response(JSON.stringify({ id: "KLA524-OK" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
    await clearConnectors()
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "KLA524 OK Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fr = await submitHumanSnap(uniqueDesc(`kla524-ok`), { page_url: `https://kla524.example/ok/${ts}` })
    expect(fr.ok).toBe(true)
    const fid = (await fr.json()).id
    expect(fid).toBeTruthy()

    // The report starts life un-triaged ('new')...
    // ...then the successful external file advances it to 'open'.
    const landed = await waitForExport(cid, 1, 5000)
    expect(landed.length).toBe(1)
    expect(String(landed[0].status)).toBe("ok")

    const status = await waitForStatus(fid, "open", 5000)
    expect(status).toBe("open")

    // It now appears in the Tickets list (which excludes status='new').
    expect(await ticketsContain(fid)).toBe(true)
  } finally { recv.stop(true) }
}, 15000)

// #534: on a CONNECTOR-LESS project there is no tracker to file to, but an autofiled human Snap must
// still leave "New Reports" and show up on the Tickets board. It should advance new→open even though no
// export happens. (Contrast with the FAILED-export case below, which keeps 'new' for manual retry.)
test("#534 connector-less autofile: advances new→open and shows in the Tickets list", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  await clearConnectors()   // zero auto-copy connectors on this project

  const fr = await submitHumanSnap(uniqueDesc(`kla534-noconn`), { page_url: `https://kla534.example/noconn/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()

  // No connector → no export row is ever written, but the status still advances to 'open'.
  const status = await waitForStatus(fid, "open", 5000)
  expect(status).toBe("open")
  expect(await ticketsContain(fid)).toBe(true)
}, 15000)

// #534 hardening (SECURITY): the connector-less new→open advance must be gated on TRUSTED provenance —
// an AUTHENTICATED workspace member. An ANONYMOUS/public widget submission (anonWidgetAllowed, actor=null)
// must STAY 'new' so it lands in the New-Reports triage inbox (the spam/bot safety net) and never bypasses
// triage onto the board. The submit above (authenticated ADMIN) is the trusted case that DOES advance;
// this is the untrusted case that must NOT. Gate keys off real authentication, not an attacker-controllable
// field (sim_id absence / source string).
test("#534 hardening: ANONYMOUS connector-less autofile STAYS 'new' (triage, not the board)", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  await clearConnectors()   // zero auto-copy connectors on this project

  const fr = await submitAnonWidgetSnap(uniqueDesc(`kla534-anon`), { page_url: `https://kla534.example/anon/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()

  // Give the fire-and-forget autofile hook ample time to (not) advance the row.
  await Bun.sleep(1300)
  expect(await feedbackStatus(fid)).toBe("new")
  expect(await ticketsContain(fid)).toBe(false)
}, 15000)

// #534 hardening control: an AUTHENTICATED workspace member's connector-less autofile report STILL
// advances immediately (trusted provenance). This mirrors the connector-less test above but asserts the
// positive side of the security gate explicitly alongside the anonymous negative case.
test("#534 hardening: AUTHENTICATED-member connector-less autofile advances new→open", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  await clearConnectors()

  const fr = await submitHumanSnap(uniqueDesc(`kla534-authmember`), { page_url: `https://kla534.example/authmember/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()

  expect(await waitForStatus(fid, "open", 5000)).toBe("open")
  expect(await ticketsContain(fid)).toBe(true)
}, 15000)

// #534 hardening: a source='studio-demo' save is quarantine-tagged and must NEVER be classified as a human
// Snap nor promoted onto the Tickets board — it stays 'new' (quarantine) even when submitted by an
// authenticated member. Belt-and-suspenders: studio-demo is in NON_HUMAN_SOURCES and the autofile call site
// is additionally gated on !feedbackSourceTag.
test("#534 hardening: source='studio-demo' stays quarantined ('new'), never autofiled", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  await clearConnectors()

  const fr = await submitHumanSnap(uniqueDesc(`kla534-studiodemo`), { source: "studio-demo", page_url: `https://kla534.example/demo/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()

  await Bun.sleep(1300)
  expect(await feedbackStatus(fid)).toBe("new")
  expect(await ticketsContain(fid)).toBe(false)
}, 15000)

// ── #544 follow-up (Fix 1): priority self-elevation guard ────────────────────────────────────────
// initialFeedbackStatus maps a client-supplied priority of high/urgent straight to status='open', which
// the Tickets board shows (it excludes only 'new'). So an UNTRUSTED (anonymous cross-origin widget) submit
// with priority=high could land DIRECTLY on the board, bypassing every promotion gate. The ingest now
// FORCES status='new' for untrusted/quarantined intake regardless of the claimed priority. These tests run
// in REVIEW mode so no autofile advance can confound the assertion — the observed status is the INSERT
// status only. The priority VALUE is preserved for display/sorting; only its power to seed 'open' is removed.

test("#544 Fix1: ANONYMOUS priority=high starts 'new' (not on the board)", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  await clearConnectors()
  const fr = await submitAnonWidgetSnap(uniqueDesc(`kla544-anon-high`), { priority: "high", page_url: `https://kla544.example/anon/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()
  await Bun.sleep(400)
  expect(await feedbackStatus(fid)).toBe("new")
  expect(await ticketsContain(fid)).toBe(false)
}, 15000)

test("#544 Fix1: studio-demo priority=high stays quarantined ('new')", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  await clearConnectors()
  const fr = await submitHumanSnap(uniqueDesc(`kla544-demo-high`), { source: "studio-demo", priority: "high", page_url: `https://kla544.example/demo/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()
  await Bun.sleep(400)
  expect(await feedbackStatus(fid)).toBe("new")
  expect(await ticketsContain(fid)).toBe(false)
}, 15000)

test("#544 Fix1 control: AUTHENTICATED-member priority=high still starts 'open' (behavior preserved)", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  await clearConnectors()
  const fr = await submitHumanSnap(uniqueDesc(`kla544-auth-high`), { priority: "high", page_url: `https://kla544.example/auth/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()
  await Bun.sleep(400)
  expect(await feedbackStatus(fid)).toBe("open")
  expect(await ticketsContain(fid)).toBe(true)
}, 15000)

test("#544 Fix1 regression guard: ANONYMOUS default priority still 'new'", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  await clearConnectors()
  const fr = await submitAnonWidgetSnap(uniqueDesc(`kla544-anon-default`), { page_url: `https://kla544.example/anondef/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()
  await Bun.sleep(400)
  expect(await feedbackStatus(fid)).toBe("new")
  expect(await ticketsContain(fid)).toBe(false)
}, 15000)

// ── #544 follow-up (Codex round 4): include sim_id in the quarantine predicate ────────────────────
// A report carrying a sim_id is machine/bot intake — isHumanSnap already treats `!!rawSimId` as
// non-human. Previously the priority→status clamp and the recurrence head-source guard omitted sim_id,
// so an authenticated member could POST any sim_id, omit `source`, set priority=high|urgent, and open the
// row directly (trustedProvenance=true, intakeQuarantined=false). The ingest now (1) forces status='new'
// for ANY sim_id intake regardless of priority, and (2) persists a durable canonical source='sim' so the
// recurrence head-quarantine guard blocks marker-less authenticated recurrences. Read the persisted
// `source` column directly to prove the durable canonical marker.
async function feedbackRow(fid: string): Promise<any | null> {
  const r = await rawClient.execute({ sql: "SELECT status, source, recurrence_count FROM feedback WHERE id=?", args: [fid] })
  return r.rows.length ? (r.rows[0] as any) : null
}

// (1) An AUTHENTICATED member POSTing a sim_id with priority=high must start 'new' (NOT on the board),
// and the persisted source must be the canonical quarantine marker 'sim'. Review mode isolates the INSERT
// status (no autofile advance to confound the assertion).
test("#544 round4: AUTHENTICATED sim_id + priority=high starts 'new' with durable source='sim'", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  await clearConnectors()
  const fr = await submitHumanSnap(uniqueDesc(`r4alpha-simclamp`), { sim_id: SIM_ID, priority: "high", page_url: `https://kla544r4.example/sim/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()
  await Bun.sleep(400)
  const row = await feedbackRow(fid)
  expect(String(row.status)).toBe("new")
  expect(String(row.source)).toBe("sim")   // durable canonical quarantine marker
  expect(await ticketsContain(fid)).toBe(false)
}, 15000)

// (2) A head created with ONLY a sim_id (durable source='sim') must NOT be promoted onto the board by 3
// marker-less AUTHENTICATED recurrences — the durable head-source guard (bumpFeedbackRecurrence) blocks it,
// and the intake-quarantine gate also withholds the promotion vouch. Review mode keeps the head 'new' after
// submit #1, isolating the recurrence-promotion path.
test("#544 round4: 3× AUTHENTICATED sim_id recurrences do NOT promote the durable-'sim' head", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  await clearConnectors()
  const desc = uniqueDesc("r4bravo-simrecur")
  const page = `https://kla544r4.example/sim-recur/${ts}`
  let fid = ""
  for (let i = 0; i < 3; i++) {
    const fr = await submitHumanSnap(desc, { sim_id: SIM_ID, page_url: page })
    expect(fr.ok).toBe(true)
    fid = (await fr.json()).id
    expect(fid).toBeTruthy()
  }
  await Bun.sleep(1300)
  const row = await feedbackRow(fid)
  expect(String(row.status)).toBe("new")     // never reached the board
  expect(String(row.source)).toBe("sim")     // durable quarantine marker persisted
  expect(await ticketsContain(fid)).toBe(false)
}, 20000)

// (3) Regression guard: an AUTHENTICATED member with NO sim_id and priority=high must STILL start 'open'
// (the sim_id fix must not touch the ordinary human-report priority→status behavior).
test("#544 round4 regression: AUTHENTICATED no-sim priority=high still starts 'open'", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  await clearConnectors()
  const fr = await submitHumanSnap(uniqueDesc(`r4charlie-humanpriority`), { priority: "high", page_url: `https://kla544r4.example/nosim/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()
  await Bun.sleep(400)
  const row = await feedbackRow(fid)
  expect(String(row.status)).toBe("open")
  expect(row.source == null || String(row.source) === "").toBe(true)  // no quarantine marker persisted
  expect(await ticketsContain(fid)).toBe(true)
}, 15000)

// (4) Regression guard: an ANONYMOUS cross-origin widget submit with priority=high still starts 'new'
// (unchanged from hardening3 — untrusted provenance forces 'new').
test("#544 round4 regression: ANONYMOUS priority=high still starts 'new'", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  await clearConnectors()
  const fr = await submitAnonWidgetSnap(uniqueDesc(`r4delta-anonpriority`), { priority: "high", page_url: `https://kla544r4.example/anon/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()
  await Bun.sleep(400)
  expect(await feedbackStatus(fid)).toBe("new")
  expect(await ticketsContain(fid)).toBe(false)
}, 15000)

// A FAILED autofile (connector create errors) must NOT falsely mark the report filed/open — it stays
// 'new' so it remains in New Reports for manual retry, and is absent from the Tickets list.
test("KLA-524 autofile failure: keeps status='new' and stays out of the Tickets list", async () => {
  const recv = Bun.serve({ port: 0, fetch() { return new Response("upstream boom", { status: 500 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
    await clearConnectors()
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "KLA524 Fail Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fr = await submitHumanSnap(uniqueDesc(`kla524-fail`), { page_url: `https://kla524.example/fail/${ts}` })
    expect(fr.ok).toBe(true)
    const fid = (await fr.json()).id
    expect(fid).toBeTruthy()

    // The autofile attempt is recorded as a FAILED export...
    const landed = await waitForExport(cid, 1, 5000)
    expect(landed.length).toBe(1)
    expect(String(landed[0].status)).toBe("failed")

    // ...and because the create failed, status must NOT advance — stays 'new'.
    await Bun.sleep(600)
    expect(await feedbackStatus(fid)).toBe("new")
    expect(await ticketsContain(fid)).toBe(false)
  } finally { recv.stop(true) }
}, 15000)

// REVIEW mode: even with an enabled auto-copy connector, a human Snap must stay 'new' (manual transfer),
// so the status advance is strictly autofile-mode-only.
test("KLA-524 review mode: keeps status='new' even with a connector configured", async () => {
  const recv = Bun.serve({ port: 0, fetch() { return new Response(JSON.stringify({ id: "KLA524-RV" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
    await clearConnectors()
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "KLA524 Review Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fr = await submitHumanSnap(uniqueDesc(`kla524-review`), { page_url: `https://kla524.example/review/${ts}` })
    expect(fr.ok).toBe(true)
    const fid = (await fr.json()).id
    expect(fid).toBeTruthy()

    // No autofile on submit in review mode → no export, status untouched.
    await Bun.sleep(900)
    expect((await exportRows(cid)).length).toBe(0)
    expect(await feedbackStatus(fid)).toBe("new")
    expect(await ticketsContain(fid)).toBe(false)

    // Restore autofile for any subsequent tests.
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  } finally { recv.stop(true) }
}, 15000)

// ── #534 recurrence hardening (Codex re-review): the recurrence new→open auto-promotion (count≥3) must
// be provenance/quarantine-aware, exactly like the direct connector-less advance. Submitting the SAME
// report 3× dedupes into one cluster head and bumps its recurrence_count to 3 — but only a TRUSTED
// (authenticated-member), non-quarantined recurrence may auto-advance onto the Tickets board. ────────

// (a) 3× ANONYMOUS cross-origin widget report on a connector-less project dedupes into one 'new' row and
// must STAY 'new' — the 3rd occurrence must NOT auto-promote it onto the board (the pre-fix bypass).
test("#534 recurrence: 3× ANONYMOUS connector-less report stays 'new' (never reaches the board)", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  await clearConnectors()
  const desc = uniqueDesc("recur-anon")
  const page = `https://kla534.example/recur-anon/${ts}`
  let fid = ""
  for (let i = 0; i < 3; i++) {
    const fr = await submitAnonWidgetSnap(desc, { page_url: page })
    expect(fr.ok).toBe(true)
    fid = (await fr.json()).id
    expect(fid).toBeTruthy()
  }
  // Give the fire-and-forget recurrence bump ample time to (not) promote.
  await Bun.sleep(1300)
  const r = await rawClient.execute({ sql: "SELECT status, recurrence_count FROM feedback WHERE id=?", args: [fid] })
  expect(String((r.rows[0] as any).status)).toBe("new")
  expect(Number((r.rows[0] as any).recurrence_count)).toBeGreaterThanOrEqual(3)  // it DID recur…
  expect(await ticketsContain(fid)).toBe(false)                                   // …but never reached the board
}, 20000)

// (b) 3× source='studio-demo' (quarantined) dedupes into one quarantined head and must NEVER be promoted
// by recurrence — even though it's submitted by an authenticated member.
test("#534 recurrence: 3× source='studio-demo' stays quarantined ('new'), never promoted", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  await clearConnectors()
  const desc = uniqueDesc("recur-demo")
  const page = `https://kla534.example/recur-demo/${ts}`
  let fid = ""
  for (let i = 0; i < 3; i++) {
    const fr = await submitHumanSnap(desc, { source: "studio-demo", page_url: page })
    expect(fr.ok).toBe(true)
    fid = (await fr.json()).id
    expect(fid).toBeTruthy()
  }
  await Bun.sleep(1300)
  const r = await rawClient.execute({ sql: "SELECT status FROM feedback WHERE id=?", args: [fid] })
  expect(String((r.rows[0] as any).status)).toBe("new")
  expect(await ticketsContain(fid)).toBe(false)
}, 20000)

// (c) control — an AUTHENTICATED member's genuinely-recurring report STILL advances at the threshold.
// Uses review mode so the head stays 'new' after submit #1 (no autofile advance), isolating the
// recurrence-promotion path: submit #3 (count=3, trusted, non-quarantined) advances it to 'open'.
test("#534 recurrence: an AUTHENTICATED-member recurring report still advances at the threshold", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  await clearConnectors()
  const desc = uniqueDesc("recur-auth")
  const page = `https://kla534.example/recur-auth/${ts}`
  let fid = ""
  for (let i = 0; i < 3; i++) {
    const fr = await submitHumanSnap(desc, { page_url: page })
    expect(fr.ok).toBe(true)
    fid = (await fr.json()).id
    expect(fid).toBeTruthy()
  }
  // The 3rd trusted occurrence promotes the un-triaged cluster head onto the board.
  expect(await waitForStatus(fid, "open", 5000)).toBe("open")
  expect(await ticketsContain(fid)).toBe(true)
  // Restore autofile for any subsequent tests.
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
}, 20000)

// ── #534 Fix 2 (Codex re-review): kci_* CI tokens must NOT count as trusted FEEDBACK provenance. A CI
// walk-trigger credential POSTing /api/feedback must not resolve to a non-null actor / trustedProvenance
// and auto-advance a report onto the Tickets board. Only a real ext_ user/extension token (or a session
// cookie) may. Raw session ids and revoked/expired ext_ tokens as Bearer remain rejected. ───────────────

// Submit /api/feedback with an Authorization: Bearer <token> (no session cookie). `origin` optional
// (cross-origin widget path). Uses a unique description so it never dedupes into an earlier test row.
async function submitWithBearer(token: string, desc: string, extra: Record<string, string> = {}, origin?: string) {
  const fd = new FormData()
  fd.set("description", desc)
  fd.set("project_id", PROJECT_ID)
  for (const [k, v] of Object.entries(extra)) fd.set(k, v)
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
  if (origin) headers.Origin = origin
  return fetch(`${BASE}/api/feedback`, { method: "POST", headers, body: fd })
}
// Insert a token row directly (stored as sha256hex, like issueExtensionToken / issueCIToken). Returns the
// RAW token to send as the Bearer credential. expiresAt=null → non-expiring; pass a past ms to expire it.
async function insertToken(prefix: "ext_" | "kci_", opts: { revoked?: boolean; expiresAt?: number | null } = {}): Promise<string> {
  const raw = prefix + crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")
  await rawExec(
    "INSERT INTO extension_tokens (token,email,project_id,created_at,expires_at,revoked) VALUES (?,?,?,?,?,?)",
    [sha256hex(raw), ADMIN_EMAIL, PROJECT_ID, Date.now(), opts.expiresAt ?? null, opts.revoked ? 1 : 0],
  )
  return raw
}

// A valid ext_ token IS trusted feedback provenance → connector-less autofile advances new→open.
test("#534 Fix2: a valid ext_ token advances a connector-less human Snap to 'open' (trusted provenance)", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  await clearConnectors()
  const extTok = await insertToken("ext_")
  const fr = await submitWithBearer(extTok, uniqueDesc("fix2-ext"), { page_url: `https://kla534.example/fix2ext/${ts}` })
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()
  expect(await waitForStatus(fid, "open", 5000)).toBe("open")
  expect(await ticketsContain(fid)).toBe(true)
}, 15000)

// A kci_ CI token must NOT grant trusted feedback provenance. Sent cross-origin (widget path) so a row is
// still persisted via the ANONYMOUS gate — it must land 'new' in triage, NOT advance onto the board.
test("#534 Fix2: a kci_ CI token does NOT trigger the board advance (stays 'new')", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  await clearConnectors()
  const ciTok = await insertToken("kci_")
  const fr = await submitWithBearer(ciTok, uniqueDesc("fix2-kci"),
    { page_url: `https://kla534.example/fix2kci/${ts}` }, "https://widget-customer.example")
  expect(fr.ok).toBe(true)
  const fid = (await fr.json()).id
  expect(fid).toBeTruthy()  // a row IS created via the anon widget path — the CI token was simply ignored
  await Bun.sleep(1300)
  expect(await feedbackStatus(fid)).toBe("new")
  expect(await ticketsContain(fid)).toBe(false)
}, 15000)

// A raw session id presented as a Bearer is rejected (M2). With no Origin it never reaches the anon path,
// so no trusted row is created and nothing advances.
test("#534 Fix2: a raw session id as Bearer is rejected (no trusted advance)", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  await clearConnectors()
  const fr = await submitWithBearer(ADMIN_SID, uniqueDesc("fix2-rawsess"), { page_url: `https://kla534.example/fix2raw/${ts}` })
  expect(fr.ok).toBe(true)
  // Not an ext_ token and not in extension_tokens → bearerEmail null, no Origin → no project resolved → no row.
  expect((await fr.json()).id).toBe("")
}, 15000)

// A revoked/expired ext_ token as Bearer is rejected → no trusted advance (same no-row outcome).
test("#534 Fix2: a revoked or expired ext_ token as Bearer is rejected", async () => {
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
  await clearConnectors()
  const revoked = await insertToken("ext_", { revoked: true })
  const r1 = await submitWithBearer(revoked, uniqueDesc("fix2-revoked"), { page_url: `https://kla534.example/fix2rev/${ts}` })
  expect(r1.ok).toBe(true)
  expect((await r1.json()).id).toBe("")

  const expired = await insertToken("ext_", { expiresAt: Date.now() - 60_000 })
  const r2 = await submitWithBearer(expired, uniqueDesc("fix2-expired"), { page_url: `https://kla534.example/fix2exp/${ts}` })
  expect(r2.ok).toBe(true)
  expect((await r2.json()).id).toBe("")
}, 15000)

// IDEMPOTENCY: an autofiled Snap that is later re-triaged (new→open again) must NOT create a second
// external ticket (the #470 findPriorSuccessfulExport guard) and must not error — it just stays 'open'.
test("KLA-524 idempotency: autofiled-then-triage-accepted files exactly once and stays open", async () => {
  let hits = 0
  const recv = Bun.serve({ port: 0, fetch() { hits++; return new Response(JSON.stringify({ id: "KLA524-IDEM" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
    await clearConnectors()
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "KLA524 Idem Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fr = await submitHumanSnap(uniqueDesc(`kla524-idem`), { page_url: `https://kla524.example/idem/${ts}` })
    expect(fr.ok).toBe(true)
    const fid = (await fr.json()).id
    expect(fid).toBeTruthy()

    // First autofile: one external ticket, advanced to open.
    const landed = await waitForExport(cid, 1, 5000)
    expect(landed.length).toBe(1)
    expect(await waitForStatus(fid, "open", 5000)).toBe("open")
    expect(hits).toBe(1)

    // Re-triage: send it back to 'new' then accept again (new→open) to exercise the triage-accept
    // auto-copy path against the already-filed ticket.
    const back = await api("PATCH", `/api/projects/${PROJECT_ID}/tickets/bulk`, { ticketIds: [fid], status: "new" }, ADMIN_SID)
    expect(back.status).toBe(200)
    const accept = await api("PATCH", `/api/projects/${PROJECT_ID}/tickets/bulk`, { ticketIds: [fid], status: "open" }, ADMIN_SID)
    expect(accept.status).toBe(200)

    // The #470 idempotency guard means NO second external ticket is created, no error, still open.
    await Bun.sleep(900)
    expect(hits).toBe(1)
    expect((await exportRows(cid)).filter(r => String(r.status) === "ok").length).toBe(1)
    expect(await feedbackStatus(fid)).toBe("open")
    expect(await ticketsContain(fid)).toBe(true)
  } finally { recv.stop(true) }
}, 20000)

// KLA-650: the connector export must carry the AI/stamped TITLE, not the raw observation first line.
// The AI auto-title used to race the export and usually lost, so the tracker got the fallback. We now
// (a) order title→export on submit and (b) generate-if-missing on manual export. This test proves the
// export READS the `title` column when it's present (so once the title is stamped, the ticket summary
// is the good title) AND that a title-less row still exports best-effort (never blocked/hung).
test("KLA-650: manual export uses the stamped title column; a title-less row still exports best-effort", async () => {
  let lastTitle: string | null = null
  const recv = Bun.serve({
    port: 0,
    async fetch(req) {
      try { const b: any = await req.json(); lastTitle = b?.ticket?.title ?? null } catch { /* ignore */ }
      return new Response(JSON.stringify({ id: "kla650" }), { status: 201 })
    },
  })
  try {
    // 'review' mode so nothing auto-files on submit — we drive the manual export path explicitly.
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "KLA650 Title Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    // (a) Row whose AI title was already stamped into the `title` column → export must use it, NOT the
    //     raw observation first line (effectiveTicketTitle prefers `title`; runManualExport re-reads it).
    const titledId = `fb_kla650_titled_${ts}`
    await rawExec(
      `INSERT INTO feedback (id, project_id, actor_email, observation, title, status, created_at) VALUES (?,?,?,?,?, 'new', ?)`,
      [titledId, PROJECT_ID, ADMIN_EMAIL, "raw first line that must NOT become the title\nmore body", "Checkout button does nothing on mobile", Date.now()],
    )
    const ex1 = await api("POST", `/api/feedback/${titledId}/export`, { connectorId: cid }, ADMIN_SID)
    expect(ex1.status).toBe(200)
    const landed1 = await waitForExport(cid, 1, 8000)
    expect(landed1.filter(r => String(r.feedback_id) === titledId && String(r.status) === "ok").length).toBe(1)
    expect(lastTitle).toBe("Checkout button does nothing on mobile")

    // (b) Title-less row (only a fallback). generate-if-missing runs (no valid LLM in test → no stamp),
    //     bounded by the timeout, then the export STILL fires best-effort — it must not block or fail.
    const untitledId = `fb_kla650_untitled_${ts}`
    await rawExec(
      `INSERT INTO feedback (id, project_id, actor_email, observation, status, created_at) VALUES (?,?,?,?, 'new', ?)`,
      [untitledId, PROJECT_ID, ADMIN_EMAIL, "Sidebar overlaps the footer on narrow screens", Date.now()],
    )
    const ex2 = await api("POST", `/api/feedback/${untitledId}/export`, { connectorId: cid }, ADMIN_SID)
    expect(ex2.status).toBe(200)
    const landed2 = await waitForExport(cid, 2, 8000)
    expect(landed2.filter(r => String(r.feedback_id) === untitledId && String(r.status) === "ok").length).toBe(1)
  } finally { recv.stop(true) }
}, 25000)
