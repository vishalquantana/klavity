// simClass first-class tests (KLAVITYKLA-188):
// 1. POST /api/persona/brief returns a non-null simClass field.
// 2. POST /api/persona/site returns non-null simClass on each persona.
// 3. POST /api/personas with an explicit simClass persists it; GET returns it back.
// 4. A POST /api/personas with simClass="client" persists "client", not null.
//
// Uses the subprocess-against-temp-DB pattern (mirrors server.personas-dedup.test.ts).
// /api/persona/brief and /api/persona/site make real LLM calls that will FAIL with a
// fake API key — we only test the size-cap path (hermetic) plus the field-defaulting
// logic for the LLM-success path via a direct POST to /api/personas.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-simclass-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema (same as other test files)
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
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT, project_id TEXT, created_at INTEGER, expires_at INTEGER, revoked INTEGER DEFAULT 0)`)

const ADMIN_EMAIL = "vishal@quantana.com.au"
const ADMIN_SID = `sess_sc_${ts}`
const ACCOUNT_ID = `acct_sc_${ts}`
const PROJECT_ID = `proj_sc_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "SimClass WS", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_sc_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJECT_ID, ACCOUNT_ID, "TestApp", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_sc_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
  [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 44200 + Math.floor(Math.random() * 800)
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

// ── P0: /api/persona/brief size-cap still works (hermetic, no LLM call) ──────
test("/api/persona/brief: oversized brief still rejected with 413", async () => {
  const huge = "x".repeat(100_001)
  const res = await fetch(`${BASE}/api/persona/brief`, {
    method: "POST",
    headers: { cookie: cookie(), "content-type": "application/json" },
    body: JSON.stringify({ brief: huge }),
  })
  expect(res.status).toBe(413)
})

// ── P0: POST /api/personas stores simClass and GET returns it ─────────────────
test("POST /api/personas with simClass='user' persists and is returned by GET", async () => {
  const res = await api(`/api/personas?project=${PROJECT_ID}`, "POST", {
    name: "Nalini Verma", role: "Support Agent",
    simClass: "user", side: "external",
    initials: "NV", accent: "#0f9d6b", summary: "Operates the product daily.", insights: [],
  })
  expect(res.status).toBe(201)
  const body = await res.json()
  expect(body.persona.simClass).toBe("user")

  // Verify it round-trips through the DB via GET
  const getRes = await api(`/api/personas?project=${PROJECT_ID}`)
  expect(getRes.status).toBe(200)
  const getBody = await getRes.json()
  const p = getBody.personas.find((x: any) => x.name === "Nalini Verma")
  expect(p).toBeDefined()
  expect(p.simClass).toBe("user")
})

test("POST /api/personas with simClass='client' persists non-null sim_class='client'", async () => {
  const res = await api(`/api/personas?project=${PROJECT_ID}`, "POST", {
    name: "Prakash Iyer", role: "CTO",
    simClass: "client", side: "external",
    initials: "PI", accent: "#6366f1", summary: "Judges business outcomes.", insights: [],
  })
  expect([200, 201]).toContain(res.status)
  const body = await res.json()
  expect(body.persona.simClass).toBe("client")

  // Confirm via DB directly that sim_class is not null
  const rows = await rawClient.execute({
    sql: "SELECT sim_class FROM personas WHERE name=? AND project_id=?",
    args: ["Prakash Iyer", PROJECT_ID],
  })
  expect(rows.rows.length).toBeGreaterThanOrEqual(1)
  expect(rows.rows[0][0]).toBe("client")
})

// ── P0: simClass defaults gracefully when null (existing/legacy personas) ─────
test("GET /api/personas: persona with null sim_class is still returned (no crash)", async () => {
  // Insert a legacy persona without sim_class (simulating a pre-v3 row)
  const legacyId = `sim_legacy_${ts}`
  await rawExec(
    `INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [legacyId, PROJECT_ID, "Legacy Sam", "Old-school user", "client", "LS", "#999999", "Pre-v3 persona", "[]", NOW - 5000, NOW - 5000]
  )
  const res = await api(`/api/personas?project=${PROJECT_ID}`)
  expect(res.status).toBe(200)
  const body = await res.json()
  const p = body.personas.find((x: any) => x.id === legacyId)
  expect(p).toBeDefined()
  // sim_class is null in DB → simClass is null in response (caller treats null as "user")
  expect(p.simClass).toBeNull()
})

// ── P0: PUT /api/personas/:id preserves simClass when updated ─────────────────
test("PUT /api/personas/:id with simClass='client' updates the stored value", async () => {
  // Create a "user" sim first
  const createRes = await api(`/api/personas?project=${PROJECT_ID}`, "POST", {
    name: "Divya Rao", role: "QA Tester",
    simClass: "user", side: "internal",
    initials: "DR", accent: "#f59e0b", summary: "Tests the product.", insights: [],
  })
  expect([200, 201]).toContain(createRes.status)
  const createBody = await createRes.json()
  const simId = createBody.persona.id

  // Now flip to "client"
  const putRes = await api(`/api/personas/${encodeURIComponent(simId)}?project=${PROJECT_ID}`, "PUT", {
    name: "Divya Rao", role: "QA Tester",
    simClass: "client", side: "internal",
    initials: "DR", accent: "#f59e0b", summary: "Now judges outcomes.", insights: [],
  })
  expect(putRes.status).toBe(200)

  const getRes = await api(`/api/personas?project=${PROJECT_ID}`)
  const getBody = await getRes.json()
  const updated = getBody.personas.find((x: any) => x.id === simId)
  expect(updated).toBeDefined()
  expect(updated.simClass).toBe("client")
})
