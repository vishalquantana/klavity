// KLA submit-target: server-side dogfood intake routing on POST /api/feedback.
// When the composer sends feedback_target=klavity, the server files the report into the DESIGNATED
// Klavity intake project (env KLAVITY_INTAKE_PROJECT_ID) instead of the customer's project — resolving the
// real target SERVER-SIDE (the client only ever sends the flag, never a project id → no IDOR). Origin
// context (customer project + page URL) is preserved in the observation. FAIL-SAFE: when the env is unset
// or invalid, the report is NOT dropped or leaked — it stays in the origin project, clearly tagged.
//
// Subprocess-against-temp-DB pattern (mirrors server.feedback-widget.test.ts). We spawn TWO servers over
// one shared WAL DB: one with a VALID KLAVITY_INTAKE_PROJECT_ID (routing + IDOR cases) and one with the env
// UNSET (fail-safe case).
import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-st-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")
const CUSTOMER_ID = `proj_customer_${ts}`
const INTAKE_ID = `proj_klavity_intake_${ts}`
const NOW = Date.now()

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
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`INSERT OR IGNORE INTO accounts (id, name, owner_email, created_at) VALUES (?,?,?,?)`, ["acct_st", "Submit Target", "owner@test.local", NOW])
await rawExec(`INSERT OR IGNORE INTO projects (id, account_id, name, created_at, updated_at) VALUES (?,?,?,?,?)`, [CUSTOMER_ID, "acct_st", "PX4 Project", NOW, NOW])
await rawExec(`INSERT OR IGNORE INTO projects (id, account_id, name, created_at, updated_at) VALUES (?,?,?,?,?)`, [INTAKE_ID, "acct_st", "Klavity Dogfood", NOW, NOW])
// #703: give the CUSTOMER project an enabled auto-copy connector so autofile WOULD export a human Snap
// to the customer's own tracker. The URL is non-routable — the export attempt still writes a
// ticket_exports row (success OR failed), which is all we assert on: a row present = export happened.
const CUSTOMER_CONNECTOR_ID = `conn_${ts}`
await rawExec(
  `INSERT OR IGNORE INTO connectors (id, project_id, type, name, config, auto_copy, enabled, created_at) VALUES (?,?,?,?,?,?,?,?)`,
  [CUSTOMER_CONNECTOR_ID, CUSTOMER_ID, "webhook", "Customer Jira (webhook)", JSON.stringify({ url: "https://webhook.invalid/hook" }), 1, 1, NOW],
)

let procConfigured: ReturnType<typeof Bun.spawn>
let procUnset: ReturnType<typeof Bun.spawn>
let BASE_CFG = ""   // server with KLAVITY_INTAKE_PROJECT_ID set to INTAKE_ID
let BASE_UNSET = "" // server with the env unset (fail-safe path)

function baseEnv(port: number) {
  return {
    ...process.env,
    PORT: String(port),
    TURSO_DATABASE_URL: "file:" + srvDbFile,
    TURSO_AUTH_TOKEN: "",
    KLAV_SECRET: TEST_SECRET,
    KLAV_BASE_URL: `http://localhost:${port}`,
    KLAV_ALLOWED_DOMAINS: "test.local",
    SENDGRID_API_KEY: "",
    KLAV_MAIL_FROM: "",
    OPENROUTER_API_KEY: "test-key",
  } as Record<string, string>
}

async function waitReady(base: string) {
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${base}/favicon.svg`).catch(() => null); if (r && r.status < 500) return } catch {}
    await Bun.sleep(150)
  }
}

beforeAll(async () => {
  const portCfg = 37600 + Math.floor(Math.random() * 300)
  const portUnset = portCfg + 1
  BASE_CFG = `http://localhost:${portCfg}`
  BASE_UNSET = `http://localhost:${portUnset}`
  procConfigured = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: { ...baseEnv(portCfg), KLAV_BASE_URL: BASE_CFG, KLAVITY_INTAKE_PROJECT_ID: INTAKE_ID },
    stdout: "pipe", stderr: "pipe",
  })
  procUnset = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: { ...baseEnv(portUnset), KLAV_BASE_URL: BASE_UNSET }, // no KLAVITY_INTAKE_PROJECT_ID
    stdout: "pipe", stderr: "pipe",
  })
  await Promise.all([waitReady(BASE_CFG), waitReady(BASE_UNSET)])
})

afterAll(() => { procConfigured?.kill(); procUnset?.kill(); rawClient.close() })

async function submit(base: string, opts: { target?: string; desc: string; url: string }) {
  const fd = new FormData()
  fd.set("project_id", CUSTOMER_ID)
  fd.set("description", opts.desc)
  fd.set("page_url", opts.url)
  if (opts.target) fd.set("feedback_target", opts.target)
  // Origin === base makes this a first-party anonymous submit (widget path resolves the project by id).
  const r = await fetch(`${base}/api/feedback`, { method: "POST", headers: { Origin: base }, body: fd })
  expect(r.status).toBe(200)
  return r.json()
}

async function rowById(id: string) {
  const res = await rawClient.execute({ sql: "SELECT project_id, observation FROM feedback WHERE id=?", args: [id] })
  return res.rows[0] as any
}

async function exportCount(feedbackId: string) {
  const res = await rawClient.execute({ sql: "SELECT COUNT(*) AS n FROM ticket_exports WHERE feedback_id=?", args: [feedbackId] })
  return Number((res.rows[0] as any).n)
}

// Autofile export is async fire-and-forget (title job THEN export). Poll a bit for a row to appear.
async function waitForExport(feedbackId: string, timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await exportCount(feedbackId) > 0) return true
    await Bun.sleep(150)
  }
  return false
}

// ── 1. feedback_target=klavity files into KLAVITY_INTAKE_PROJECT_ID, origin context preserved ──
test("feedback_target=klavity routes to the configured intake project and preserves origin context", async () => {
  const j = await submit(BASE_CFG, { target: "klavity", desc: "the Klavity widget itself is broken on our checkout", url: "https://shop.px4.example/checkout" })
  expect(j.saved).toBe(true)
  const row = await rowById(String(j.id))
  expect(row.project_id).toBe(INTAKE_ID)                 // rerouted server-side
  expect(String(row.observation)).toContain("PX4 Project")            // origin project name
  expect(String(row.observation)).toContain("shop.px4.example/checkout") // origin page URL
  expect(String(row.observation)).toContain("the Klavity widget itself is broken") // original text kept
})

// ── 2. Default (no flag) stays in the customer's own project ──
test("a normal report (no feedback_target) stays in the customer project", async () => {
  const j = await submit(BASE_CFG, { desc: "our own checkout button is dead", url: "https://shop.px4.example/cart" })
  expect(j.saved).toBe(true)
  const row = await rowById(String(j.id))
  expect(row.project_id).toBe(CUSTOMER_ID)
  expect(String(row.observation)).not.toContain("intended for Klavity")
})

// ── 3. IDOR: the client can't name the destination project — only the flag routes ──
// The submit form only carries project_id (the customer's own) + the flag. There is NO field a caller can
// set to a Klavity/other project id; the destination is resolved from server env. Proven by: even though
// the client posts project_id=CUSTOMER_ID, the 'klavity' flag lands the row in INTAKE_ID (server-chosen),
// and without the flag it can never reach INTAKE_ID.
test("client cannot route to an arbitrary project — destination is server-resolved from the flag", async () => {
  const routed = await submit(BASE_CFG, { target: "klavity", desc: "tool broke A", url: "https://a.example/x" })
  const notRouted = await submit(BASE_CFG, { desc: "site bug B", url: "https://a.example/y" })
  expect((await rowById(String(routed.id))).project_id).toBe(INTAKE_ID)
  expect((await rowById(String(notRouted.id))).project_id).toBe(CUSTOMER_ID)
  // The customer never gains write access to the intake project except via the server-owned flag path.
})

// ── 4. FAIL-SAFE: intake env unset → report kept in origin project, clearly tagged, never dropped ──
test("unset KLAVITY_INTAKE_PROJECT_ID fails safe: filed in origin project with a clear tag", async () => {
  const j = await submit(BASE_UNSET, { target: "klavity", desc: "widget broken but intake unconfigured", url: "https://shop.px4.example/pay" })
  expect(j.saved).toBe(true)                             // NOT dropped
  const row = await rowById(String(j.id))
  expect(row.project_id).toBe(CUSTOMER_ID)              // fell back to origin (not leaked elsewhere)
  expect(String(row.observation)).toContain("intended for Klavity") // clearly tagged
  expect(String(row.observation)).toContain("widget broken but intake unconfigured")
})

// ── 5. #703 SECURITY: a Klavity-targeted fail-safe report must NOT export to the customer's connector ──
// The customer project has an enabled auto-copy webhook connector. A normal human Snap on that project DOES
// export (control). But a report targeted at Klavity that fell back to the origin project (intake unset)
// must be SUPPRESSED — it was meant for Klavity, so leaking it into the customer's tracker is a breach.
test("#703: control — a normal report on a connector-backed project DOES auto-export", async () => {
  const j = await submit(BASE_UNSET, { desc: "our checkout is broken and needs a ticket", url: "https://shop.px4.example/checkout" })
  expect(j.saved).toBe(true)
  expect((await rowById(String(j.id))).project_id).toBe(CUSTOMER_ID)
  expect(await waitForExport(String(j.id))).toBe(true) // exported to the customer's own connector
}, 20000)

test("#703: a Klavity-targeted report on the fail-safe path does NOT export to the customer connector, but persists", async () => {
  const j = await submit(BASE_UNSET, { target: "klavity", desc: "klavity widget broke, intake unset, must not leak", url: "https://shop.px4.example/pay" })
  expect(j.saved).toBe(true)                                   // persisted, not dropped
  const row = await rowById(String(j.id))
  expect(row.project_id).toBe(CUSTOMER_ID)                     // kept in origin project
  expect(String(row.observation)).toContain("intended for Klavity")
  // Give the async autofile job the SAME budget as the control's successful export, then assert none fired.
  expect(await waitForExport(String(j.id))).toBe(false)        // NO leak into the customer's tracker
  expect(await exportCount(String(j.id))).toBe(0)
}, 20000)

// ── 6. Happy path unchanged: intake SET → routes to intake project, no customer-connector export ──
test("#703: with intake SET the report routes to the intake project (happy path unchanged)", async () => {
  const j = await submit(BASE_CFG, { target: "klavity", desc: "routed to klavity dogfood as normal", url: "https://shop.px4.example/x" })
  expect(j.saved).toBe(true)
  const row = await rowById(String(j.id))
  expect(row.project_id).toBe(INTAKE_ID)                       // rerouted to the intake project
  // The intake project has no connector, so nothing exports to the customer either.
  expect(await waitForExport(String(j.id))).toBe(false)
  expect(await exportCount(String(j.id))).toBe(0)
}, 20000)
