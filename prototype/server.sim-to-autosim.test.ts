// KLAVITYKLA-461: Convert a Sim -> an AutoSim.
// Covers POST /api/sims/:id/autosim-objective (AI/fallback objective) and POST /api/sims/:id/autosim
// (kicks off the existing author path seeded with persona + objective + scope + weekly + source link).
// Subprocess-against-temp-DB pattern (mirrors server.sim-profile.test.ts / server.trails-author.route.test.ts).
import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-sim2autosim-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(19)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', site_url TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, sim_class TEXT, side TEXT, goals_json TEXT, watchfor_json TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
// Trails + author_sessions so runAuthorNow can create a session row.
await rawExec(`CREATE TABLE IF NOT EXISTS trails (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, intent TEXT NOT NULL DEFAULT '', base_url TEXT NOT NULL, viewport_json TEXT, baseline_ref TEXT, author_kind TEXT NOT NULL DEFAULT 'human', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, step_version INTEGER NOT NULL DEFAULT 1, schedule_cron TEXT, scheduled_last_run_at INTEGER, schedule_tz TEXT, judge_persona_id TEXT, attachments_json TEXT, objective_verified INTEGER, environments_json TEXT, source_sim_id TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_steps (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, action TEXT NOT NULL, action_value TEXT, target_json TEXT, checkpoint_json TEXT, timeout_ms INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS author_sessions (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, objective TEXT NOT NULL, base_url TEXT NOT NULL, test_account TEXT, status TEXT NOT NULL DEFAULT 'running', steps_json TEXT NOT NULL DEFAULT '[]', stall_reason TEXT, trail_id TEXT, verification_run_id TEXT, verification_verdict TEXT, llm_calls INTEGER NOT NULL DEFAULT 0, cost_usd REAL NOT NULL DEFAULT 0, created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ai_calls (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, type TEXT NOT NULL, model TEXT, account_id TEXT, feature TEXT, actor_email TEXT, project_id TEXT, input_tokens INTEGER, output_tokens INTEGER, cost_usd REAL, ok INTEGER, run_id TEXT)`)

const ADMIN_EMAIL = `vishal@quantana.com.au`
const ADMIN_SID = `sess_s2a_${ts}`
const ACCOUNT_ID = `acct_s2a_${ts}`
const PROJECT_ID = `proj_s2a_${ts}`
const OTHER_ACCOUNT = `acct_o_${ts}`
const OTHER_PROJECT = `proj_o_${ts}`
const OTHER_EMAIL = `outsider-${ts}@test.local`
const OTHER_SID = `sess_o_${ts}`
const SIM_ID = `sim_s2a_${ts}`
const NOSITE_PROJECT = `proj_ns_${ts}` // admin-owned project with NO site_url (missing-scope case)
const SIM_NS = `sim_ns_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OTHER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "S2A Workspace", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [OTHER_ACCOUNT, "Other Workspace", OTHER_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_s2a_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_o_${ts}`, OTHER_ACCOUNT, OTHER_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, site_url, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`, [PROJECT_ID, ACCOUNT_ID, "S2A Project", "active", "auto", 200, "named", "https://app.charantra.com", NOW, NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)`, [OTHER_PROJECT, OTHER_ACCOUNT, "Other Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_s2a_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_o_${ts}`, OTHER_PROJECT, OTHER_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [OTHER_SID, OTHER_EMAIL, NOW, NOW + 86400_000])

// The Sim: a CFO persona with a pain + a want in insights_json.
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [SIM_ID, PROJECT_ID, "Sarah Chen", "CFO", "client", "SC", "#6366f1", "Evaluates business outcomes",
   JSON.stringify([{ kind: "pain", text: "unclear reports" }, { kind: "want", text: "fast Q2 numbers" }]), NOW, NOW])
// A second admin-owned project with NO site_url + a Sim, to exercise the "scope required" 400.
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)`, [NOSITE_PROJECT, ACCOUNT_ID, "No Site Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_ns_${ts}`, NOSITE_PROJECT, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [SIM_NS, NOSITE_PROJECT, "Dana Ops", "Operator", "internal", "DO", "#d98324", "Hands-on", "[]", NOW, NOW])

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 44000 + Math.floor(Math.random() * 1000)
  BASE = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "",
    },
    stdout: "pipe", stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(150)
  }
})
afterAll(() => { serverProc?.kill(); rawClient.close() })

const cookie = (sid: string) => ({ Cookie: `klav_session=${sid}`, "content-type": "application/json" })
const post = (path: string, sid: string, body: any) =>
  fetch(`${BASE}${path}`, { method: "POST", headers: cookie(sid), body: JSON.stringify(body) })

// ── AI objective suggestion ─────────────────────────────────────────────────
test("POST /api/sims/:id/autosim-objective returns a persona-grounded objective", async () => {
  const r = await post(`/api/sims/${SIM_ID}/autosim-objective?project=${PROJECT_ID}`, ADMIN_SID, {})
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(typeof d.objective).toBe("string")
  expect(d.objective.length).toBeGreaterThanOrEqual(10)
  // With no OpenRouter key the endpoint returns the deterministic persona-derived fallback.
  expect(d.source).toBe("fallback")
  expect(d.objective.toLowerCase()).toContain("cfo")
  expect(d.objective).toContain("flag anything")
})

test("objective suggestion: 401 unauth, 404 unknown sim, 400 no project", async () => {
  expect((await fetch(`${BASE}/api/sims/${SIM_ID}/autosim-objective?project=${PROJECT_ID}`, { method: "POST" })).status).toBe(401)
  expect((await post(`/api/sims/ghost/autosim-objective?project=${PROJECT_ID}`, ADMIN_SID, {})).status).toBe(404)
  // A member of another account cannot resolve this project.
  expect((await post(`/api/sims/${SIM_ID}/autosim-objective?project=${PROJECT_ID}`, OTHER_SID, {})).status).toBe(400)
})

// ── Convert to AutoSim ──────────────────────────────────────────────────────
// NOTE: a successful convert kicks off the real author drive, which holds the single walk slot. Only
// ONE test may reach the 202 path (a second would 409 "already running"); the rest assert pre-kickoff
// validation. This success test also proves the two defaults (scope -> project site_url, freq -> weekly).
test("POST /api/sims/:id/autosim creates the AutoSim seeded with persona + objective + default scope + weekly + source link", async () => {
  const r = await post(`/api/sims/${SIM_ID}/autosim?project=${PROJECT_ID}`, ADMIN_SID, {
    objective: "Sign in, open the Q2 revenue dashboard, check the total is obvious and correct, flag anything confusing.",
    // base_url omitted -> defaults to the project's site_url; frequency omitted -> defaults to weekly.
  })
  expect(r.status).toBe(202)
  const d = await r.json()
  expect(typeof d.sessionId).toBe("string")
  expect(d.sourceSimId).toBe(SIM_ID)
  expect(d.frequency).toBe("weekly")
  expect(d.schedule).toBe("0 9 * * 1")
  // The author session row exists immediately, seeded as this Sim's objective + default scope.
  const s = await rawClient.execute({ sql: "SELECT * FROM author_sessions WHERE id=?", args: [d.sessionId] })
  expect(s.rows.length).toBe(1)
  expect(String(s.rows[0].objective)).toContain("Q2 revenue dashboard")
  expect(String(s.rows[0].base_url)).toBe("https://app.charantra.com") // project site_url default
  expect(String(s.rows[0].name)).toContain("Sarah Chen")
})

test("convert: 401 unauth, 404 unknown sim, 400 cross-account, 400 missing scope", async () => {
  expect((await fetch(`${BASE}/api/sims/${SIM_ID}/autosim?project=${PROJECT_ID}`, { method: "POST" })).status).toBe(401)
  expect((await post(`/api/sims/ghost/autosim?project=${PROJECT_ID}`, ADMIN_SID, { objective: "a".repeat(20), base_url: "https://x.io" })).status).toBe(404)
  // Cross-account caller cannot resolve the project.
  expect((await post(`/api/sims/${SIM_ID}/autosim?project=${PROJECT_ID}`, OTHER_SID, { objective: "a".repeat(20) })).status).toBe(400)
  // Admin-owned project with no site_url and no body url -> scope is required (400, before any kickoff).
  expect((await post(`/api/sims/${SIM_NS}/autosim?project=${NOSITE_PROJECT}`, ADMIN_SID, { objective: "a".repeat(20) })).status).toBe(400)
})
