// KLAVITYKLA-187: dedicated Sim-creation page GET /sim/new.
// Serves the dashboard app (which opens the Add-a-Sim surface client-side when the path is
// /sim/new); anon → redirect to /login. Hermetic subprocess pattern mirroring
// server.autosims-page.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { readFileSync } from "node:fs"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-sim-new-page-${ts}.db`)

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

// ── Seed a session ────────────────────────────────────────────────────────────
const USER_EMAIL = `snp-${ts}@test.local`
const USER_SID = `sess_snp_${ts}`
const NOW = Date.now()
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [USER_EMAIL, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [USER_SID, USER_EMAIL, NOW, NOW + 86400_000])

// ── Spawn the server on a random port ─────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string
const authedCookie = `klav_session=${USER_SID}`

beforeAll(async () => {
  serverPort = 47000 + Math.floor(Math.random() * 1000)
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

// ── Static source assertions ──────────────────────────────────────────────────
const dashSrc = readFileSync(new URL("../prototype/public/dashboard.html", import.meta.url), "utf8")

test("dashboard.html: Add-a-Sim surface is addressable at /sim/new", () => {
  expect(dashSrc).toContain('const SIM_NEW_PATH="/sim/new"')
  expect(dashSrc).toContain("function atSimNew()")
  expect(dashSrc).toContain("function simNewUrl(mode)")
})

test("dashboard.html: openers navigate to the page and preserve all three modes", () => {
  // openSimModal pushes /sim/new onto history
  expect(dashSrc).toContain('history.pushState(null,"",simNewUrl(mode))')
  // three-mode openers route through openSimModal with the mode preselected
  expect(dashSrc).toContain('window.openSimModalSite = function(){ window.openSimModal("site") }')
  expect(dashSrc).toContain('window.openSimModalCall = function(){ window.openSimModal("call") }')
  // describe/site/call are all still valid panes
  expect(dashSrc).toContain('PANE_ORDER={describe:"describe",site:"site",call:"call"}')
})

test("dashboard.html: landing on /sim/new opens the surface (deep-link) and Back closes it", () => {
  // maybeOpenCreateSim honours the path + ?mode=
  expect(dashSrc).toContain("if(atSimNew()){ want=true; mode=PANE_ORDER[qp.get(\"mode\")]||\"describe\"; }")
  // popstate handler wires Back/forward to open/close the surface
  expect(dashSrc).toContain('window.addEventListener("popstate"')
})

// ── Route tests ───────────────────────────────────────────────────────────────
test("GET /sim/new serves the dashboard for a session; anon redirects to /login", async () => {
  const authed = await fetch(`${base}/sim/new`, { headers: { cookie: authedCookie }, redirect: "manual" })
  expect(authed.status).toBe(200)
  const body = await authed.text()
  // Served the dashboard app (contains the Add-a-Sim surface markup).
  expect(body).toContain('id="simOv"')

  const anon = await fetch(`${base}/sim/new`, { redirect: "manual" })
  expect(anon.status).toBe(302)
  expect(anon.headers.get("location")).toBe("/login")
})

test("GET /sim/new/ (trailing slash) and ?mode= also serve the dashboard for a session", async () => {
  const slash = await fetch(`${base}/sim/new/`, { headers: { cookie: authedCookie }, redirect: "manual" })
  expect(slash.status).toBe(200)
  const withMode = await fetch(`${base}/sim/new?mode=call`, { headers: { cookie: authedCookie }, redirect: "manual" })
  expect(withMode.status).toBe(200)
  expect(await withMode.text()).toContain('id="simOv"')
})
