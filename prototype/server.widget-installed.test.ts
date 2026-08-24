// KLA-547 — route-level integration test for the widget_installed milestone.
//
// The unit tests (analytics-taxonomy / analytics-emit-points) prove the taxonomy + gates. This file
// proves the SERVER WIRING executes: a real server subprocess on an isolated SQLite DB, driven
// through POST /api/widget/ping, must persist exactly ONE funnel_events `widget_installed` row —
// on the first external-host ping only; never for repeat pings or own-host (dogfood) pings.
// Harness mirrors server.v1-runs.test.ts (spawn `bun run server.ts`, TURSO_DATABASE_URL=file:...).
import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient, type Client } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-widget-inst-srv-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(91)).toString("base64")

const rawClient: Client = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema the boot needs before applySchema covers the rest (mirrors v1-runs harness).
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)

// Fixture project whose widget will "phone home".
const ACCOUNT_ID = `acct_wi_${ts}`
const PROJECT_ID = `proj_wi_${ts}`
const NOW = Date.now()
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "WI Workspace", null, NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, 'active', 'auto', 200, 'named', ?, ?)`, [PROJECT_ID, ACCOUNT_ID, NOW, NOW, NOW])

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 45300 + Math.floor(Math.random() * 400)
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
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(150)
  }
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

function ping(origin: string): Promise<Response> {
  return fetch(`${BASE}/api/widget/ping`, {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({ project_id: PROJECT_ID }),
  })
}

async function widgetInstalledRowCount(): Promise<number> {
  const r = await rawClient.execute({ sql: `SELECT COUNT(*) AS n FROM funnel_events WHERE event='widget_installed'`, args: [] })
  return Number((r.rows[0] as any).n ?? 0)
}

test("first external-host ping persists exactly one funnel_events widget_installed row", async () => {
  const res = await ping("https://acme-customer.example")
  expect(res.status).toBe(200)
  const body: any = await res.json().catch(() => ({}))
  expect(body.ok).toBe(true)

  // The emit is fire-and-forget (void trackMilestone(...)); poll briefly for the row to land.
  let n = 0
  for (let i = 0; i < 40 && n === 0; i++) {
    await Bun.sleep(100)
    n = await widgetInstalledRowCount()
  }
  expect(n).toBe(1)

  // Props carry the derived host (from the reflected Origin header, not attacker-supplied body text).
  const r = await rawClient.execute({ sql: `SELECT props_json FROM funnel_events WHERE event='widget_installed'`, args: [] })
  expect(String((r.rows[0] as any).props_json)).toContain("acme-customer.example")
})

test("repeat pings from the same host do NOT re-fire the milestone", async () => {
  await ping("https://acme-customer.example")
  await ping("https://acme-customer.example")
  await Bun.sleep(300)
  expect(await widgetInstalledRowCount()).toBe(1)
})

test("a second external host does NOT fire again (milestone is per-project, first-ever)", async () => {
  const res = await ping("https://other-shop.example")
  expect(res.status).toBe(200)
  await Bun.sleep(300)
  expect(await widgetInstalledRowCount()).toBe(1)
})

test("own-host (dogfooding) pings are acknowledged but never recorded as installs", async () => {
  // Origin == the spawned server's own host → the handler returns {ok:true} BEFORE any recording.
  // (No body `host`: the handler's Origin-derived host already matches its own-host set, so nothing
  // is recorded and the milestone can't fire.)
  const res = await ping(BASE)
  expect(res.status).toBe(200)
  const body: any = await res.json().catch(() => ({}))
  expect(body.ok).toBe(true)
  await Bun.sleep(300)
  expect(await widgetInstalledRowCount()).toBe(1)
  // And the widget_pings store gained no row for it either — still just acme-customer.example
  // plus other-shop.example (recorded by the earlier per-project-first test, but NOT this own host).
  const r = await rawClient.execute({
    sql: `SELECT COUNT(*) AS n FROM widget_pings WHERE project_id=? AND host='localhost'`,
    args: [PROJECT_ID],
  })
  expect(Number((r.rows[0] as any).n)).toBe(0)
})
