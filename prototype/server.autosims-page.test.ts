// Task 8: Page-alias test for GET /autosims (serves trails.html; anon → redirect to /login)
// Hermetic subprocess pattern mirroring server.trails-author.route.test.ts

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { readFileSync } from "node:fs"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-autosims-page-${ts}.db`)

const TEST_SECRET = Buffer.alloc(32, 9).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// ── Minimal schema ────────────────────────────────────────────────────────────
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)

// ── Seed fixtures ─────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `admin-asp-${ts}@test.local`
const ADMIN_SID = `sess_asp_admin_${ts}`
const ACCOUNT_ID = `acct_asp_${ts}`
const PROJECT_ID = `proj_asp_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "ASP Workspace", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_asp_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "ASP Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_asp_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// ── Spawn the server on a random port ─────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string
const adminCookie = `klav_session=${ADMIN_SID}`

beforeAll(async () => {
  serverPort = 46000 + Math.floor(Math.random() * 1000)
  base = `http://localhost:${serverPort}`

  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: base,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
    },
    stdout: "pipe",
    stderr: "pipe",
  })

  // Wait until the server is ready (max 10s)
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready yet */ }
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

// ── Static source assertions (KLA-163) ───────────────────────────────────────

const trailsSrc = readFileSync(new URL("../prototype/public/trails.html", import.meta.url), "utf8")

test("trails.html: precision banner has id=precBanner for zero-trail gating", () => {
  expect(trailsSrc).toContain('id="precBanner"')
})

test("trails.html: walks+queue grid has id=walksGrid for zero-trail gating", () => {
  expect(trailsSrc).toContain('id="walksGrid"')
})

test("trails.html: expectations section wrapped with id=expSection", () => {
  expect(trailsSrc).toContain('id="expSection"')
})

test("trails.html: render() gates precBanner, walksGrid, expSection on hasTrails", () => {
  expect(trailsSrc).toContain("hasTrails")
  expect(trailsSrc).toContain('$("precBanner").style.display')
  expect(trailsSrc).toContain('$("walksGrid").style.display')
  expect(trailsSrc).toContain('$("expSection").style.display')
})

test("trails.html: Trails card heading has id=trailsCardHead for zero-trail gating", () => {
  expect(trailsSrc).toContain('id="trailsCardHead"')
})

// ── Route tests ───────────────────────────────────────────────────────────────

test("GET /autosims serves the AutoSims page for a session; anon redirects to /login", async () => {
  const authed = await fetch(`${base}/autosims`, { headers: { cookie: adminCookie }, redirect: "manual" })
  expect(authed.status).toBe(200)
  expect(await authed.text()).toContain("AutoSims")
  const anon = await fetch(`${base}/autosims`, { redirect: "manual" })
  expect(anon.status).toBe(302)
})
