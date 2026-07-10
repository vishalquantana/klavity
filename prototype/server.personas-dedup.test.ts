// Persona dedup tests: POST /api/personas must not produce two rows for the same
// (normalized name, role) pair within a project. GET /api/personas must collapse
// any pre-existing duplicates on the read-side as well.
// Uses the same subprocess-against-temp-DB pattern as server.sim-profile.test.ts.
import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-personas-dedup-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(99)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema (mirrors what other test files set up)
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, sim_class TEXT, side TEXT, goals_json TEXT, expertise TEXT, temperament TEXT, voice TEXT, watchfor_json TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trait_events (id TEXT PRIMARY KEY, trait_id TEXT NOT NULL, sim_id TEXT NOT NULL, transcript_id TEXT NOT NULL, op TEXT NOT NULL, before_text TEXT, after_text TEXT, quote TEXT NOT NULL, quote_offset INTEGER, speaker TEXT, source_date INTEGER NOT NULL, reason TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS transcripts (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT, raw_text TEXT NOT NULL, source_date INTEGER NOT NULL, speakers_json TEXT, added_by TEXT NOT NULL, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS persona_edits (id TEXT PRIMARY KEY, persona_id TEXT NOT NULL, project_id TEXT NOT NULL, field TEXT NOT NULL, before_val TEXT, after_val TEXT, actor TEXT, created_at INTEGER NOT NULL)`)

const ADMIN_EMAIL = "vishal@quantana.com.au"
const ADMIN_SID = `sess_dup_${ts}`
const ACCOUNT_ID = `acct_dup_${ts}`
const PROJECT_ID = `proj_dup_${ts}`
const OTHER_PROJECT_ID = `proj_dup_other_${ts}`
const NOW = Date.now()

// Pre-seeded duplicate personas in PROJECT_ID to test read-side dedup:
// Two rows with the same name+role — simulates Charantra-style pre-existing dupes.
const DUPE_SIM_A = `sim_dupa_${ts}`  // earlier
const DUPE_SIM_B = `sim_dupb_${ts}`  // later dup

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Dup Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_dup_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJECT_ID, ACCOUNT_ID, "Charantra", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_dup_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [OTHER_PROJECT_ID, ACCOUNT_ID, "Other Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_dup_other_${ts}`, OTHER_PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
  [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// Seed two identical personas (same name+role) directly into the DB to test read-side dedup.
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [DUPE_SIM_A, PROJECT_ID, "Priya", "Customer Support Lead", "client", "PR", "#6366f1", "First row", "[]", NOW - 2000, NOW - 2000])
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [DUPE_SIM_B, PROJECT_ID, "Priya", "Customer Support Lead", "client", "PR", "#6366f1", "Duplicate row", "[]", NOW - 1000, NOW - 1000])

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 43100 + Math.floor(Math.random() * 800)
  BASE = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe", stderr: "pipe",
  })
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(200)
  }
})
afterAll(() => { serverProc?.kill(); rawClient.close() })

const cookie = () => `klav_session=${ADMIN_SID}`
const api = (path: string, method = "GET", body?: any) =>
  fetch(`${BASE}${path}`, {
    method,
    headers: { Cookie: cookie(), ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })

// ── Read-side dedup ──────────────────────────────────────────────────────────

test("GET /api/personas collapses pre-existing duplicate name+role rows, keeping only the earliest", async () => {
  const res = await api(`/api/personas?project=${PROJECT_ID}`)
  expect(res.status).toBe(200)
  const body = await res.json()
  const priyaRows = body.personas.filter((p: any) =>
    p.name === "Priya" && p.role === "Customer Support Lead"
  )
  // Even though two rows exist in the DB, only one should be returned.
  expect(priyaRows.length).toBe(1)
  // The earliest-created row is kept (DUPE_SIM_A).
  expect(priyaRows[0].id).toBe(DUPE_SIM_A)
})

// ── Write-side dedup ─────────────────────────────────────────────────────────

test("POST /api/personas creating a persona for the first time returns 201", async () => {
  const res = await api(`/api/personas?project=${PROJECT_ID}`, "POST", {
    name: "Arjun Mehta", role: "Product Manager",
    initials: "AM", accent: "#f59e0b", summary: "New persona", insights: [],
  })
  expect(res.status).toBe(201)
  const body = await res.json()
  expect(body.persona.name).toBe("Arjun Mehta")
  expect(body.persona.role).toBe("Product Manager")
  expect(body.existing).toBeUndefined()
})

test("POST /api/personas with the same name+role does NOT create a second row", async () => {
  // First call — baseline count after previous test created Arjun.
  const beforeRes = await api(`/api/personas?project=${PROJECT_ID}`)
  const beforeBody = await beforeRes.json()
  const countBefore = beforeBody.personas.length

  // Attempt to add the same persona again (exact same name+role).
  const dupRes = await api(`/api/personas?project=${PROJECT_ID}`, "POST", {
    name: "Arjun Mehta", role: "Product Manager",
    initials: "AM", accent: "#333333", summary: "Duplicate attempt", insights: [],
  })
  // Should succeed (200 not 409) and signal the existing row.
  expect(dupRes.status).toBe(200)
  const dupBody = await dupRes.json()
  expect(dupBody.existing).toBe(true)
  expect(dupBody.persona.name).toBe("Arjun Mehta")

  // List must still have the same count — no new row.
  const afterRes = await api(`/api/personas?project=${PROJECT_ID}`)
  const afterBody = await afterRes.json()
  expect(afterBody.personas.length).toBe(countBefore)
})

test("POST /api/personas dedup is case and whitespace insensitive", async () => {
  // "arjun  mehta" (extra space, lowercase) should hit the same Arjun Mehta row.
  const dupRes = await api(`/api/personas?project=${PROJECT_ID}`, "POST", {
    name: "  arjun  mehta  ", role: "product manager",
    initials: "AM", accent: "#000000", summary: "Case-insensitive dup", insights: [],
  })
  expect(dupRes.status).toBe(200)
  const dupBody = await dupRes.json()
  expect(dupBody.existing).toBe(true)
})

test("POST /api/personas same name but DIFFERENT role creates a new persona", async () => {
  const res = await api(`/api/personas?project=${PROJECT_ID}`, "POST", {
    name: "Arjun Mehta", role: "Engineering Lead",
    initials: "AM", accent: "#f59e0b", summary: "Different role same name", insights: [],
  })
  expect(res.status).toBe(201)
  const body = await res.json()
  expect(body.persona.role).toBe("Engineering Lead")
  expect(body.existing).toBeUndefined()
})

// ── Cross-tenant isolation ───────────────────────────────────────────────────

test("POST /api/personas same name+role in a DIFFERENT project creates a new persona (no cross-tenant dedup)", async () => {
  // Add a persona to OTHER_PROJECT_ID — even though PROJECT_ID already has "Priya / Customer Support Lead",
  // the same name in a different project is NOT a duplicate.
  const res = await api(`/api/personas?project=${OTHER_PROJECT_ID}`, "POST", {
    name: "Priya", role: "Customer Support Lead",
    initials: "PR", accent: "#6366f1", summary: "Different project", insights: [],
  })
  expect(res.status).toBe(201)
  const body = await res.json()
  expect(body.persona.name).toBe("Priya")
  // Confirm it's in the other project only.
  expect(body.persona.projectId).toBe(OTHER_PROJECT_ID)
  expect(body.existing).toBeUndefined()
})

// ── PUT (edit) still works ───────────────────────────────────────────────────

test("PUT /api/personas/:id can rename a persona without collision with dedup", async () => {
  // First create a fresh persona.
  const createRes = await api(`/api/personas?project=${PROJECT_ID}`, "POST", {
    name: "Deepa Nair", role: "QA Engineer",
    initials: "DN", accent: "#10b981", summary: "QA persona", insights: [],
  })
  expect(createRes.status).toBe(201)
  const created = (await createRes.json()).persona
  const pid = created.id

  // Now rename it via PUT.
  const putRes = await api(`/api/personas/${pid}?project=${PROJECT_ID}`, "PUT", {
    name: "Deepa Nair (Senior)", role: "QA Engineer",
    initials: "DN", accent: "#10b981", summary: "Renamed", insights: [],
  })
  expect(putRes.status).toBe(200)

  // Confirm rename is visible in the list.
  const listRes = await api(`/api/personas?project=${PROJECT_ID}`)
  const listBody = await listRes.json()
  const found = listBody.personas.find((p: any) => p.id === pid)
  expect(found?.name).toBe("Deepa Nair (Senior)")
})
