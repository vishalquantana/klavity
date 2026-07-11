// Regression guard for KLAVITYKLA-299: default-project stickiness.
//
// Bug: /api/dashboard without ?project= always resolved to the user's FIRST project ("Default
// Project") ignoring the user's previously selected project. Both the cookie-based server fallback
// and the client-side dashTargetProjId() fix are tested here.
//
// Server-side: when the ?project= param is absent, the klav_proj cookie is used as a fallback.
//   Visiting /api/dashboard with a valid klav_proj cookie returns that project, not the first one.
// Server-side: each successful /api/dashboard response sets a Set-Cookie: klav_proj= header.
// Client-side: dashTargetProjId() prefers the URL param, then falls back to localStorage last key.
//
// Hermetic — spawns a real server subprocess against a fresh temp DB. Rows are seeded AFTER
// the server starts (so initDb() creates the schema first, avoiding column-mismatch crashes).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-stickiness-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

// ── Fixture ids (computed at module level so test closures can reference them) ─
const USER_EMAIL = `sticky-user-${ts}@test.local`
const USER_SID = `sess_sticky_${ts}`
const ACCOUNT_ID = `acct_sticky_${ts}`
const PROJECT_A_ID = `proj_sticky_a_${ts}`
const PROJECT_B_ID = `proj_sticky_b_${ts}`

// ── Spawn the server ──────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string
let rawClient: ReturnType<typeof createClient>

beforeAll(async () => {
  serverPort = 41200 + Math.floor(Math.random() * 800)
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

  // Wait until the server is ready (max 15s)
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(200)
  }

  // Seed data AFTER server has run initDb() so schema is correct.
  rawClient = createClient({ url: "file:" + srvDbFile })
  await rawClient.execute("PRAGMA busy_timeout=5000")

  const NOW = Date.now()
  async function rawExec(sql: string, args: any[] = []) {
    await rawClient.execute({ sql, args })
  }

  await rawExec(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [USER_EMAIL, NOW])
  await rawExec(`INSERT OR IGNORE INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`,
    [ACCOUNT_ID, "Stickiness Test Workspace", USER_EMAIL, "free", NOW])
  await rawExec(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`am_sticky_${ts}`, ACCOUNT_ID, USER_EMAIL, "owner", NOW])

  // Project A — seeded first so it is the "first accessible project" fallback
  await rawExec(
    `INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, autosim_auth_status, billing_plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJECT_A_ID, ACCOUNT_ID, "Default Project", "active", "auto", 200, "named", "unregistered", "free", NOW, NOW])
  await rawExec(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [`pm_a_${ts}`, PROJECT_A_ID, USER_EMAIL, "admin", null, NOW])

  // Project B — the "other" project the user switches to
  await rawExec(
    `INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, autosim_auth_status, billing_plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJECT_B_ID, ACCOUNT_ID, "Client Project B", "active", "auto", 200, "named", "unregistered", "free", NOW + 1, NOW + 1])
  await rawExec(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [`pm_b_${ts}`, PROJECT_B_ID, USER_EMAIL, "admin", null, NOW + 1])

  await rawExec(`INSERT OR IGNORE INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    [USER_SID, USER_EMAIL, NOW, NOW + 86400_000])
}, 20000 /* bun:test beforeAll timeout */)

afterAll(() => {
  serverProc?.kill()
  rawClient?.close()
})

function authHeader(sid: string) { return { Cookie: `klav_session=${sid}` } }

// ── Helper: parse Set-Cookie header for klav_proj ────────────────────────────
function extractProjCookie(r: Response): string | null {
  const raw = r.headers.get("set-cookie") || ""
  const m = raw.match(/klav_proj=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

// =============================================================================
// 1. ?project= param explicitly supplied → resolved, Set-Cookie klav_proj set
// =============================================================================
test("dashboard: explicit ?project= resolves the requested project", async () => {
  const r = await fetch(`${BASE}/api/dashboard?project=${encodeURIComponent(PROJECT_B_ID)}`,
    { headers: authHeader(USER_SID) })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(body.active?.id).toBe(PROJECT_B_ID)
  expect(body.active?.name).toBe("Client Project B")
})

test("dashboard: successful response sets Set-Cookie: klav_proj to the resolved project", async () => {
  const r = await fetch(`${BASE}/api/dashboard?project=${encodeURIComponent(PROJECT_B_ID)}`,
    { headers: authHeader(USER_SID) })
  expect(r.status).toBe(200)
  const proj = extractProjCookie(r)
  expect(proj).toBe(PROJECT_B_ID)
})

// =============================================================================
// 2. No ?project= + no cookie → first project (legacy behaviour preserved)
// =============================================================================
test("dashboard: no param, no cookie → first accessible project (Project A)", async () => {
  const r = await fetch(`${BASE}/api/dashboard`, { headers: authHeader(USER_SID) })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  // Without any hint the server falls back to the first project.
  expect(body.active?.id).toBe(PROJECT_A_ID)
})

// =============================================================================
// 3. STICKINESS: no ?project= + klav_proj cookie set to Project B → Project B returned
// =============================================================================
test("dashboard: no ?project= param but klav_proj cookie → resolves the cookie's project (stickiness fix)", async () => {
  // Simulate a return visit: no URL param, but the browser has klav_proj from a previous session.
  const cookies = `klav_session=${USER_SID}; klav_proj=${encodeURIComponent(PROJECT_B_ID)}`
  const r = await fetch(`${BASE}/api/dashboard`, { headers: { Cookie: cookies } })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  // Must return Project B (the user's last selection) — NOT Project A (the first/default).
  expect(body.active?.id).toBe(PROJECT_B_ID)
  expect(body.active?.name).toBe("Client Project B")
})

// =============================================================================
// 4. ?project= param overrides a klav_proj cookie (explicit always wins)
// =============================================================================
test("dashboard: explicit ?project= overrides a stale klav_proj cookie", async () => {
  // Cookie says B, param says A → A wins.
  const cookies = `klav_session=${USER_SID}; klav_proj=${encodeURIComponent(PROJECT_B_ID)}`
  const r = await fetch(
    `${BASE}/api/dashboard?project=${encodeURIComponent(PROJECT_A_ID)}`,
    { headers: { Cookie: cookies } },
  )
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(body.active?.id).toBe(PROJECT_A_ID)
  // Response must update the cookie to A.
  expect(extractProjCookie(r)).toBe(PROJECT_A_ID)
})

// =============================================================================
// 5. Stale/unknown klav_proj cookie → resolveProject returns null → 403
//    (the client's retry-without-cookie logic handles this gracefully)
// =============================================================================
test("dashboard: stale/unknown klav_proj cookie returns 403 (client retries without cookie)", async () => {
  const cookies = `klav_session=${USER_SID}; klav_proj=${encodeURIComponent("proj_does_not_exist_xyz")}`
  const r = await fetch(`${BASE}/api/dashboard`, { headers: { Cookie: cookies } })
  // resolveProject with an unknown project id returns null → 403. The client's load()
  // detects data.error + (pid !== activeProjectParam()) and retries without the stale key.
  expect(r.status).toBe(403)
})

// =============================================================================
// 6. Client-side: dashTargetProjId() prefers URL param then localStorage
//    (deterministic — no DOM, no network; extracts the real function from dashboard.html)
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

// Build a minimal sandbox for dashTargetProjId + activeProjectParam
function buildDashTarget(urlSearch: string, localStorageVal: string | null) {
  const activeProjectParamSrc = extractFn(HTML, "function activeProjectParam(")
  const dashTargetSrc = extractFn(HTML, "function dashTargetProjId(")
  const DASH_LAST_KEY = (HTML.match(/const DASH_LAST_KEY = "([^"]+)"/) || [])[1] || "klav:dash:last"
  const fakeLocation = { search: urlSearch }
  const fakeLocalStorage = {
    _data: localStorageVal !== null ? { [DASH_LAST_KEY]: localStorageVal } : {} as Record<string, string>,
    getItem(k: string) { return this._data[k] ?? null },
  }
  const fn = new Function(
    "location", "localStorage", "DASH_LAST_KEY",
    `${activeProjectParamSrc}\n${dashTargetSrc}\nreturn dashTargetProjId;`,
  )
  return fn(fakeLocation, fakeLocalStorage, DASH_LAST_KEY) as () => string | null
}

test("client dashTargetProjId: URL param wins over localStorage", () => {
  const fn = buildDashTarget("?project=proj_url_wins", "proj_from_localStorage")
  expect(fn()).toBe("proj_url_wins")
})

test("client dashTargetProjId: localStorage last key used when no URL param", () => {
  const fn = buildDashTarget("", "proj_from_localStorage")
  expect(fn()).toBe("proj_from_localStorage")
})

test("client dashTargetProjId: returns null when neither URL param nor localStorage key set", () => {
  const fn = buildDashTarget("", null)
  expect(fn()).toBeNull()
})

test("client: load() uses dashTargetProjId() (not just activeProjectParam()) to build the request", () => {
  // Guard: the load() function must call dashTargetProjId() for the pid used in the API call,
  // NOT activeProjectParam() directly (which ignores localStorage).
  const loadSrc = extractFn(HTML, "async function load(")
  // The fixed load() must call dashTargetProjId() for its primary pid.
  expect(loadSrc).toContain("dashTargetProjId()")
  // Guard: must NOT use activeProjectParam() as the primary pid. It may appear
  // in the stale-cookie retry guard and the history.replaceState guard — that's ok.
  // Key assertion: dashTargetProjId() is called for the main fetch.
  const lines = loadSrc.split("\n")
  const mainFetchLine = lines.find(l => l.includes("/api/dashboard") && l.includes("encodeURIComponent(pid)"))
  expect(mainFetchLine).toBeTruthy()
  // The pid on that line must come from dashTargetProjId, not activeProjectParam.
  // We verify by checking that dashTargetProjId() is assigned to a variable named pid before the fetch.
  expect(loadSrc).toMatch(/const pid = dashTargetProjId\(\)/)
})

test("client: refreshAll() uses dashTargetProjId() (stickiness on triage actions)", () => {
  const refreshSrc = extractFn(HTML, "async function refreshAll(")
  expect(refreshSrc).toContain("dashTargetProjId()")
  expect(refreshSrc).toMatch(/const pid = dashTargetProjId\(\)/)
})

test("client: load() updates URL via history.replaceState when no ?project= param was in URL", () => {
  // Guard: after a successful load from localStorage, the URL must be updated so the selection
  // is bookmarkable and doesn't bounce on the next reload.
  const loadSrc = extractFn(HTML, "async function load(")
  expect(loadSrc).toContain("history.replaceState")
  // The guard condition: only replaces URL when no ?project= was in the URL.
  expect(loadSrc).toContain("activeProjectParam()")
})
