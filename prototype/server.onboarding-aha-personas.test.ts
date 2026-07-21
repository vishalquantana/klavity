// KLAVITYKLA-291 — Persist aha personas into the newly-created project.
//
// Tests the path: onboarding A1 generates aha personas via POST /api/persona/site → user
// signs up → applyProjectName() resolves projectId → persistAhaPersonas() posts each persona
// to POST /api/personas → project's listPersonas returns them.
//
// This test models the CLIENT-SIDE persistence step (persistAhaPersonas uses the normal
// POST /api/personas endpoint) with a pre-authenticated session and a real project, so we
// can verify the full round-trip: POST personas → GET personas list contains them.
// Also tests the dedup guard: posting the same aha personas a second time (simulating an
// onboarding re-run or page refresh) does NOT create duplicates.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-aha-personas-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(88)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema (same as other test files in this directory)
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
const ADMIN_SID = `sess_aha_${ts}`
const ACCOUNT_ID = `acct_aha_${ts}`
const PROJECT_ID = `proj_aha_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Aha Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_aha_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJECT_ID, ACCOUNT_ID, "My Startup", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_aha_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
  [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 48000 + Math.floor(Math.random() * 800)
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

// ── Aha persona shapes as /api/persona/site would return them ──────────────
// These mirror the shape the LLM returns (and uhShowPersonas stashes into window._ahaPersonas).
const AHA_PERSONAS = [
  {
    name: "Shreya Kapoor",
    role: "Product Manager",
    simClass: "user",
    side: "external",
    initials: "SK",
    accent: "#6366f1",
    summary: "Operates the product daily to track team output.",
    insights: [
      { kind: "pain", text: "Wants faster export", quote: "I need this in CSV now" },
      { kind: "want", text: "Better notifications",  quote: "Why did I miss that update?" },
      { kind: "love", text: "Clean dashboard",       quote: "Love how simple it looks" },
    ],
  },
  {
    name: "Vikram Desai",
    role: "CTO",
    simClass: "client",
    side: "external",
    initials: "VD",
    accent: "#e8843a",
    summary: "Judges technical outcomes and security posture.",
    insights: [
      { kind: "pain", text: "No SSO support",   quote: "We need SAML for the enterprise deal" },
      { kind: "want", text: "Audit logs",        quote: "Who changed that setting?" },
      { kind: "love", text: "API docs quality",  quote: "The docs are actually good" },
    ],
  },
]

// ── Test 1: Aha personas land in the project after persistAhaPersonas() posts them ──
// This is the core regression: before KLAVITYKLA-291 the project had 0 personas after onboarding.
test("onboarding aha personas: project starts empty; POSTing aha personas → listPersonas returns them", async () => {
  // Confirm project starts with zero personas (simulates the state just after sign-up)
  const getEmpty = await api(`/api/personas?project=${PROJECT_ID}`)
  expect(getEmpty.status).toBe(200)
  const emptyBody = await getEmpty.json()
  expect(emptyBody.personas).toHaveLength(0)

  // POST both aha personas — this is exactly what persistAhaPersonas() does in onboarding.html
  for (const persona of AHA_PERSONAS) {
    const res = await api(`/api/personas?project=${PROJECT_ID}`, "POST", persona)
    expect([200, 201]).toContain(res.status)
    const body = await res.json()
    expect(body.persona.name).toBe(persona.name)
    expect(body.persona.simClass).toBe(persona.simClass)
    expect(body.persona.side).toBe(persona.side)
  }

  // Now list them — both must appear
  const getFilled = await api(`/api/personas?project=${PROJECT_ID}`)
  expect(getFilled.status).toBe(200)
  const filledBody = await getFilled.json()
  expect(filledBody.personas).toHaveLength(2)

  const names = filledBody.personas.map((p: any) => p.name)
  expect(names).toContain("Shreya Kapoor")
  expect(names).toContain("Vikram Desai")

  // Confirm simClass+side round-trip correctly (the v3 fields)
  const sk = filledBody.personas.find((p: any) => p.name === "Shreya Kapoor")
  expect(sk.simClass).toBe("user")
  expect(sk.side).toBe("external")

  const vd = filledBody.personas.find((p: any) => p.name === "Vikram Desai")
  expect(vd.simClass).toBe("client")
  expect(vd.side).toBe("external")
})

// ── Test 2: Re-posting the same aha personas (onboarding refresh / retry) → no duplicates ──
// The POST /api/personas dedup guard must prevent double-create on re-run.
test("onboarding aha personas: re-posting same personas on retry does NOT create duplicates", async () => {
  // Project already has 2 personas from the previous test; post again
  for (const persona of AHA_PERSONAS) {
    const res = await api(`/api/personas?project=${PROJECT_ID}`, "POST", persona)
    // dedup guard returns 200 with existing:true, not 201
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.existing).toBe(true)
    expect(body.persona.name).toBe(persona.name)
  }

  // Still exactly 2 personas — no new rows created
  const get = await api(`/api/personas?project=${PROJECT_ID}`)
  expect(get.status).toBe(200)
  const body = await get.json()
  expect(body.personas).toHaveLength(2)
})

// ── Test 3: Aha personas are tenant-scoped — they do NOT appear in a different project ──
test("onboarding aha personas: persisted personas are scoped to their project, not cross-tenant", async () => {
  // Create a second project under the same account
  const OTHER_PROJECT_ID = `proj_aha_other_${ts}`
  await rawExec(
    `INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [OTHER_PROJECT_ID, ACCOUNT_ID, "Other Project", "active", "auto", 200, "named", NOW, NOW]
  )
  await rawExec(
    `INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [`pm_aha_other_${ts}`, OTHER_PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW]
  )

  const get = await api(`/api/personas?project=${OTHER_PROJECT_ID}`)
  expect(get.status).toBe(200)
  const body = await get.json()
  // The aha personas landed in PROJECT_ID, not OTHER_PROJECT_ID
  expect(body.personas).toHaveLength(0)
})
