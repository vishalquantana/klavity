// server.sim-run-now-panel.test.ts
//
// JTBD 6.10 (KLAVITYKLA-300): "Run a review now" wired into the post-add Sim panel.
//
// Two-part coverage:
//   1. SERVER — /api/dashboard now exposes active.siteUrl so the Add-a-Sim success panel
//      can prefill the "Run a review now" URL with the project's configured site. A project
//      without a site_url must return null (never crash, never leak another project's URL).
//   2. CLIENT (static) — the post-add success panel HTML+JS must offer "Run a review now"
//      as the PRIMARY action (calling the authed /api/sim/preview branch), prefill the URL
//      from state.active.siteUrl, keep extension/widget/AutoSim as secondary, and render
//      errors inline (no dead-end).
//
// Hermetic: spawns a real server subprocess against a fresh temp DB. Rows are seeded AFTER
// the server starts (so initDb() creates the schema first, incl. projects.site_url).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB ───────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-run-now-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(91)).toString("base64")

// ── Fixture ids ─────────────────────────────────────────────────────────────────
const USER_EMAIL = `runnow-user-${ts}@test.local`
const USER_SID = `sess_runnow_${ts}`
const ACCOUNT_ID = `acct_runnow_${ts}`
const PROJ_WITH_URL = `proj_url_${ts}`
const PROJ_NO_URL = `proj_nourl_${ts}`
const SITE_URL = "https://runnow-product.example.com"

// ── Spawn the server ──────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string
let rawClient: ReturnType<typeof createClient>

beforeAll(async () => {
  serverPort = 42100 + Math.floor(Math.random() * 700)
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

  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(200)
  }

  // Seed AFTER the server has run initDb() so the schema (incl. projects.site_url) exists.
  rawClient = createClient({ url: "file:" + srvDbFile })
  await rawClient.execute("PRAGMA busy_timeout=5000")
  const NOW = Date.now()
  async function rawExec(sql: string, args: any[] = []) {
    await rawClient.execute({ sql, args })
  }

  await rawExec(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [USER_EMAIL, NOW])
  await rawExec(`INSERT OR IGNORE INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`,
    [ACCOUNT_ID, "Run-Now Test Workspace", USER_EMAIL, NOW])
  await rawExec(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`am_runnow_${ts}`, ACCOUNT_ID, USER_EMAIL, "owner", NOW])

  // Project WITH a configured site_url — seeded first so it's the default project.
  await rawExec(
    `INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, site_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJ_WITH_URL, ACCOUNT_ID, "Product With URL", "active", "auto", 200, "named", SITE_URL, NOW, NOW])
  await rawExec(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [`pm_url_${ts}`, PROJ_WITH_URL, USER_EMAIL, "admin", null, NOW])

  // Project WITHOUT a site_url — must return active.siteUrl === null.
  await rawExec(
    `INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, site_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJ_NO_URL, ACCOUNT_ID, "Product No URL", "active", "auto", 200, "named", null, NOW + 1, NOW + 1])
  await rawExec(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [`pm_nourl_${ts}`, PROJ_NO_URL, USER_EMAIL, "admin", null, NOW + 1])

  await rawExec(`INSERT OR IGNORE INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    [USER_SID, USER_EMAIL, NOW, NOW + 86400_000])
}, 20000)

afterAll(() => {
  serverProc?.kill()
  rawClient?.close()
})

function authHeader(sid: string) { return { Cookie: `klav_session=${sid}` } }

// =============================================================================
// SERVER: /api/dashboard exposes active.siteUrl for the run-now URL prefill
// =============================================================================
test("dashboard: active.siteUrl is the project's configured site_url", async () => {
  const r = await fetch(`${BASE}/api/dashboard?project=${encodeURIComponent(PROJ_WITH_URL)}`,
    { headers: authHeader(USER_SID) })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(body.active?.id).toBe(PROJ_WITH_URL)
  expect(body.active?.siteUrl).toBe(SITE_URL)
})

test("dashboard: active.siteUrl is null when the project has no site_url (never crashes)", async () => {
  const r = await fetch(`${BASE}/api/dashboard?project=${encodeURIComponent(PROJ_NO_URL)}`,
    { headers: authHeader(USER_SID) })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(body.active?.id).toBe(PROJ_NO_URL)
  expect(body.active?.siteUrl).toBeNull()
})

// =============================================================================
// CLIENT (static): the post-add success panel wires "Run a review now"
// =============================================================================
const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

test("success panel exposes a Run-a-review-now URL input + button", () => {
  expect(HTML).toContain('id="smRunUrl"')
  expect(HTML).toContain('id="smRunGo"')
  expect(HTML).toContain("Run a review now")
})

test("Run-a-review-now calls the authed /api/sim/preview branch with url + projectId", () => {
  // The run-now handler must POST to /api/sim/preview with a projectId (the authenticated
  // branch that runs all Sims and persists results) — not the ephemeral onboarding path.
  const i = HTML.indexOf("async function runReviewNow(")
  expect(i).toBeGreaterThan(-1)
  const region = HTML.slice(i, i + 2000)
  expect(region).toContain('"/api/sim/preview"')
  expect(region).toContain("projectId:pid")
})

test("Run-a-review-now prefills the URL from the active project's siteUrl", () => {
  // showSuccessPanel must prefill #smRunUrl from state.active.siteUrl (via projSiteUrl()).
  expect(HTML).toContain("state.active.siteUrl")
  const i = HTML.indexOf("function showSuccessPanel(")
  expect(i).toBeGreaterThan(-1)
  const region = HTML.slice(i, i + 900)
  expect(region).toContain("projSiteUrl()")
})

test("Run-a-review-now renders errors inline in the panel (no dead-end)", () => {
  const i = HTML.indexOf("async function runReviewNow(")
  const region = HTML.slice(i, i + 2000)
  // On a bad URL / AI failure the server error is written into the inline #smRunMsg node.
  expect(HTML).toContain('id="smRunMsg"')
  expect(region).toContain("msg.textContent")
})

test("extension/widget/AutoSim remain available as SECONDARY actions", () => {
  // All three secondary routes still exist...
  expect(HTML).toContain('id="smNextExt"')
  expect(HTML).toContain('id="smNextWidget"')
  expect(HTML).toContain('id="smNextAutosim"')
  // ...but the extension link is no longer flagged the primary action (run-now is now primary).
  expect(HTML).not.toContain('class="sm-next-step is-primary"')
})

test("Run-a-review-now offers a 'View all in Sims' landing so results are visible after", () => {
  expect(HTML).toContain('id="smRunViewAll"')
  const i = HTML.indexOf('$("smRunViewAll").onclick')
  expect(i).toBeGreaterThan(-1)
  const region = HTML.slice(i, i + 300)
  expect(region).toContain('setView("sims")')
})
