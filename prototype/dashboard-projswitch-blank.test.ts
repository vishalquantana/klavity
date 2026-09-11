// KLA-829 — project-switcher blank-page cluster. ONE root cause with a fan-out:
//
// The top-nav command-palette project switcher navigated to /dashboard?project=<id> on select.
// The switcher was built from listProjects(), which returns EVERY project in any account the user
// belongs to — including projects a plain account-MEMBER cannot open (no project_members row). On
// switching to such a project /api/dashboard returned {error:"No access..."}, 403; the client's
// stale-project fallback was skipped on an explicit switch (pid === activeProjectParam()), so state
// stayed null. A null `state` then cascaded:
//   • switcher stuck at "—", page blank, only browser-Back recovered it;
//   • submitNewTicket() threw "Cannot read properties of null (reading 'active')" (prod NPE);
//   • mountReportWidget() (after the early return) never ran → report widget / recorder missing.
//
// Fixes under test:
//   A. SERVER: /api/dashboard builds `projects` from listAccessibleProjects() (mirrors projectAccess),
//      so the switcher never lists a project that would 403 on switch.
//   B. CLIENT: load() recovers from ANY errored project hint (explicit param too) — strips the bad
//      ?project= + retries bare → lands on the first accessible project instead of a dead page.
//   C. CLIENT: null-safety — renderSwitcher/projSwitch* and submitNewTicket guard `state === null`.
//
// Server half spawns a real server subprocess against a fresh temp DB (hermetic). Client half
// extracts the REAL shipped functions out of dashboard.html (no re-implementation).

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-projswitch-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(88)).toString("base64")

const OWNER_EMAIL = `owner-${ts}@test.local`
const USER_EMAIL = `member-${ts}@test.local`        // plain account-member (role "User" in the UI)
const OWNER_SID = `sess_owner_${ts}`
const USER_SID = `sess_user_${ts}`
const ACCOUNT_ID = `acct_${ts}`
const PROJECT_A_ID = `proj_a_${ts}`                 // member HAS an explicit project row → accessible
const PROJECT_B_ID = `proj_b_${ts}`                 // same account, NO member row → NOT accessible

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string
let rawClient: ReturnType<typeof createClient>

beforeAll(async () => {
  serverPort = await freePort()
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

  rawClient = createClient({ url: "file:" + srvDbFile })
  await rawClient.execute("PRAGMA busy_timeout=5000")
  const NOW = Date.now()
  const exec = (sql: string, args: any[] = []) => rawClient.execute({ sql, args })

  await exec(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [OWNER_EMAIL, NOW])
  await exec(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [USER_EMAIL, NOW])
  await exec(`INSERT OR IGNORE INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`,
    [ACCOUNT_ID, "Test Workspace", OWNER_EMAIL, "free", NOW])
  // Owner = account owner; member = plain account member (the reporter's "User" role).
  await exec(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`am_owner_${ts}`, ACCOUNT_ID, OWNER_EMAIL, "owner", NOW])
  await exec(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`am_member_${ts}`, ACCOUNT_ID, USER_EMAIL, "member", NOW])

  // Project A — member has an explicit project_members row (the working "Charantra"-style project).
  await exec(`INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, autosim_auth_status, billing_plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJECT_A_ID, ACCOUNT_ID, "Charantra", "active", "auto", 200, "named", "unregistered", "free", NOW, NOW])
  await exec(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [`pm_a_${ts}`, PROJECT_A_ID, USER_EMAIL, "member", OWNER_EMAIL, NOW])

  // Project B — same account, NO project_members row for the member (a "website"/"nexus"-style
  // project the member can see listed but cannot open). Owner can open it; member cannot.
  await exec(`INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, autosim_auth_status, billing_plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJECT_B_ID, ACCOUNT_ID, "website", "active", "auto", 200, "named", "unregistered", "free", NOW + 1, NOW + 1])

  await exec(`INSERT OR IGNORE INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    [OWNER_SID, OWNER_EMAIL, NOW, NOW + 86400_000])
  await exec(`INSERT OR IGNORE INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    [USER_SID, USER_EMAIL, NOW, NOW + 86400_000])
}, 20000)

afterAll(() => {
  serverProc?.kill()
  rawClient?.close()
})

function auth(sid: string) { return { Cookie: `klav_session=${sid}` } }

// =============================================================================
// SERVER — negative control: the switcher must NOT list a project the member
// cannot open (root cause of the blank-page-on-switch bug).
// =============================================================================
test("KLA-829: member dashboard lists ONLY accessible projects (not the un-openable 'website')", async () => {
  const r = await fetch(`${BASE}/api/dashboard?project=${encodeURIComponent(PROJECT_A_ID)}`, { headers: auth(USER_SID) })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  const ids = (body.projects || []).map((p: any) => p.id)
  expect(ids).toContain(PROJECT_A_ID)        // the member's working project
  // Regression: before the fix `projects` came from listProjects() and included PROJECT_B_ID,
  // which the member can't open → switching there 403'd into a blank dead page.
  expect(ids).not.toContain(PROJECT_B_ID)
})

test("KLA-829: member switching to an un-openable project still 403s server-side (access guard intact)", async () => {
  const r = await fetch(`${BASE}/api/dashboard?project=${encodeURIComponent(PROJECT_B_ID)}`, { headers: auth(USER_SID) })
  expect(r.status).toBe(403)
})

test("KLA-829: owner still sees ALL account projects (no over-filtering)", async () => {
  const r = await fetch(`${BASE}/api/dashboard?project=${encodeURIComponent(PROJECT_B_ID)}`, { headers: auth(OWNER_SID) })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  const ids = (body.projects || []).map((p: any) => p.id)
  expect(ids).toContain(PROJECT_A_ID)
  expect(ids).toContain(PROJECT_B_ID)
})

// =============================================================================
// CLIENT — extract the REAL shipped functions from dashboard.html.
// =============================================================================
const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

function extractFn(src: string, startSig: string): string {
  const i = src.indexOf(startSig)
  if (i < 0) throw new Error("source not found: " + startSig)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + startSig)
}

function fakeEl() {
  let text = ""
  const attrs: Record<string, string> = {}
  const classes = new Set<string>()
  return {
    get textContent() { return text },
    set textContent(v: string) { text = v },
    innerHTML: "",
    classList: {
      add: (c: string) => classes.add(c),
      remove: (c: string) => classes.delete(c),
      toggle: (c: string, on?: boolean) => { on ? classes.add(c) : classes.delete(c) },
      contains: (c: string) => classes.has(c),
    },
    setAttribute(k: string, v: string) { attrs[k] = v },
    removeAttribute(k: string) { delete attrs[k] },
    addEventListener() {},
    focus() {},
    querySelectorAll() { return [] as any },
    dataset: {} as any,
    _attrs: attrs, _classes: classes,
  }
}

// ── renderSwitcher must not throw with a null state and must render "—" ───────
test("KLA-829: renderSwitcher does not throw when state is null", () => {
  const src = extractFn(HTML, "function renderSwitcher(")
  const els: Record<string, any> = {}
  const $ = (id: string) => (els[id] ||= fakeEl())
  const factory = new Function("$", "state", "projSwitchWire", "projSwitchIsOpen", "projSwitchFilter", "openNewProject", "kicon", "esc",
    `${src}\nreturn renderSwitcher;`)
  const fn = factory($, null, () => {}, () => false, () => {}, () => {}, () => "", (s: string) => s)
  expect(() => fn()).not.toThrow()
  // With no project data the trigger shows the em-dash placeholder, never a crash.
  expect(els.projComboName.textContent).toBe("—")
})

// ── submitNewTicket: null-state guard (the confirmed prod NPE) ────────────────
test("KLA-829: submitNewTicket guards `state === null` (no NPE; falls back to projId assignment)", () => {
  const src = extractFn(HTML, "async function submitNewTicket(")
  // Negative control: before the fix this line was `const projId = state.active && state.active.id`,
  // which throws "Cannot read properties of null (reading 'active')" when state is null. The fix
  // leads with a `state &&` guard so it resolves to undefined → "No project selected." instead.
  expect(src).toMatch(/const projId = state && state\.active && state\.active\.id/)
  // And the undefined projId path shows a user-facing message rather than proceeding.
  expect(src).toContain('"No project selected."')
})

// ── load(): recovers from ANY errored project hint + keeps the switcher alive ─
test("KLA-829: load() recovers from an explicit inaccessible ?project= (strips param + retries bare)", () => {
  const src = extractFn(HTML, "async function load(")
  // Broadened fallback: fires on `data && data.error && pid` (was gated on pid !== activeProjectParam(),
  // which skipped explicit switches and dead-ended the page).
  expect(src).toMatch(/if \(data && data\.error && pid\)/)
  // It strips the bad ?project= from the URL so a refresh doesn't re-hit the same 403.
  expect(src).toContain('u.searchParams.delete("project")')
  // The retry goes bare so the server falls back to the first accessible project.
  expect(src).toContain('fetchWithTimeout("/api/dashboard")')
})

test("KLA-829: load() failure branch keeps the project switcher operable (no dead page)", () => {
  const src = extractFn(HTML, "async function load(")
  // On a cold miss the failure branch must still render the switcher so the user can pick another
  // project WITHOUT the browser Back button.
  const failIdx = src.indexOf("Couldn't load your project")
  expect(failIdx).toBeGreaterThan(-1)
  const tail = src.slice(failIdx)
  expect(tail).toContain('safeRender("switcher", renderSwitcher)')
})

// ── Issue 2: dropdown scroll containment ──────────────────────────────────────
test("KLA-829 Issue 2: .proj-combo-list uses overscroll-behavior:contain", () => {
  expect(HTML).toMatch(/\.proj-combo-list\{[^}]*overscroll-behavior:contain/)
})

test("KLA-829 Issue 2: a non-passive wheel trap stops scroll chaining over a short popover", () => {
  const src = extractFn(HTML, "function projSwitchWire(")
  expect(src).toContain('pop.addEventListener("wheel"')
  expect(src).toContain("e.preventDefault()")
  expect(src).toContain("passive: false")
})
