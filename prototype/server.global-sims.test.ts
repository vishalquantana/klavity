// Global Sims v1 tests: verifies that Sims marked is_global=1 in project A appear in project B
// when A and B share the same account/owner — and NEVER leak to a different owner's projects.
// Also verifies: isGlobal flag in the response, dedup policy (local wins), toggle via PUT,
// and that a global Sim appears once in its own home project.
//
// Uses the subprocess-against-temp-DB pattern (matches server.personas-dedup.test.ts).
import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-global-sims-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema (mirrors server.personas-dedup.test.ts).
// NOTE: personas table here does NOT include is_global — initDb adds it via ALTER on boot.
// This exercises the migration path (ALTER TABLE adding the column to a pre-existing table).
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
// personas WITHOUT is_global — initDb migration adds it via ALTER TABLE.
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, sim_class TEXT, side TEXT, goals_json TEXT, expertise TEXT, temperament TEXT, voice TEXT, watchfor_json TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trait_events (id TEXT PRIMARY KEY, trait_id TEXT NOT NULL, sim_id TEXT NOT NULL, transcript_id TEXT NOT NULL, op TEXT NOT NULL, before_text TEXT, after_text TEXT, quote TEXT NOT NULL, quote_offset INTEGER, speaker TEXT, source_date INTEGER NOT NULL, reason TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS transcripts (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT, raw_text TEXT NOT NULL, source_date INTEGER NOT NULL, speakers_json TEXT, added_by TEXT NOT NULL, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS persona_edits (id TEXT PRIMARY KEY, persona_id TEXT NOT NULL, project_id TEXT NOT NULL, field TEXT NOT NULL, before_val TEXT, after_val TEXT, actor TEXT, created_at INTEGER NOT NULL)`)

const NOW = Date.now()

// ── Account A (owner: alice) — two projects share this account ──
const ALICE_EMAIL  = `alice-gs-${ts}@example.test`
const ALICE_SID    = `sess_alice_${ts}`
const ACCT_A       = `acct_a_${ts}`
const PROJ_A1      = `proj_a1_${ts}`   // home project for global Sims
const PROJ_A2      = `proj_a2_${ts}`   // sibling project — should see global Sims

// ── Account B (owner: bob) — entirely separate tenant ──
const BOB_EMAIL    = `bob-gs-${ts}@example.test`
const BOB_SID      = `sess_bob_${ts}`
const ACCT_B       = `acct_b_${ts}`
const PROJ_B       = `proj_b_${ts}`    // must NOT see Account A's global Sims

// ── Sim IDs ──
// GLOBAL_SIM: unique name/role — will be marked global; must appear in PROJ_A2, not PROJ_B.
const GLOBAL_SIM   = `sim_global_${ts}`
// GLOBAL_SIM2: a second global Sim, also unique name/role (used for toggle test).
const GLOBAL_SIM2  = `sim_global2_${ts}`
// LOCAL_SIM: project-scoped Sim in PROJ_A1 — must NOT appear in PROJ_A2.
const LOCAL_SIM    = `sim_local_${ts}`
// CLASH_SIM: PROJ_A2 has its own Sim with the SAME name+role as GLOBAL_SIM2.
//            Tests the "local wins" dedup: the own row wins, global is suppressed.
const CLASH_SIM    = `sim_clash_${ts}`
// BOB_SIM: a Sim in PROJ_B — must never appear in PROJ_A*.
const BOB_SIM      = `sim_bob_${ts}`

// ── Users & sessions ──
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ALICE_EMAIL, NOW])
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [BOB_EMAIL, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ALICE_SID, ALICE_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [BOB_SID, BOB_EMAIL, NOW, NOW + 86400_000])

// ── Account A setup ──
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCT_A, "Alice Workspace", ALICE_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_a_${ts}`, ACCT_A, ALICE_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJ_A1, ACCT_A, "Alice Project 1", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_a1_${ts}`, PROJ_A1, ALICE_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJ_A2, ACCT_A, "Alice Project 2", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_a2_${ts}`, PROJ_A2, ALICE_EMAIL, "admin", null, NOW])

// ── Account B setup ──
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCT_B, "Bob Workspace", BOB_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_b_${ts}`, ACCT_B, BOB_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJ_B, ACCT_B, "Bob Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_b_${ts}`, PROJ_B, BOB_EMAIL, "admin", null, NOW])

// ── Seed Sims directly into the DB WITHOUT is_global (the migration adds the column) ──
// GLOBAL_SIM: unique "Red Hat / Threat Modeller" — will be marked global via PUT. No clash in A2.
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [GLOBAL_SIM, PROJ_A1, "Red Hat", "Threat Modeller", "client", "RH", "#ef4444", "Security lens", "[]", NOW - 5000, NOW - 5000])
// GLOBAL_SIM2: "Black Hat / Adversarial Tester" — also global; CLASH_SIM in A2 has the same name+role.
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [GLOBAL_SIM2, PROJ_A1, "Black Hat", "Adversarial Tester", "client", "BH", "#7c3aed", "Tries to break things", "[]", NOW - 4000, NOW - 4000])
// LOCAL_SIM: project-scoped — must NOT appear in A2.
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [LOCAL_SIM, PROJ_A1, "Priya Kumar", "Product Manager", "client", "PK", "#6366f1", "Optimizes flows", "[]", NOW - 3000, NOW - 3000])
// CLASH_SIM in A2: "Black Hat / Adversarial Tester" — same name+role as GLOBAL_SIM2 → local wins.
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [CLASH_SIM, PROJ_A2, "Black Hat", "Adversarial Tester", "client", "BH", "#ef4444", "Project A2's own Black Hat", "[]", NOW - 2000, NOW - 2000])
// BOB_SIM in PROJ_B: must never appear in Alice's projects.
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [BOB_SIM, PROJ_B, "Eve Attacker", "Penetration Tester", "client", "EA", "#dc2626", "Bob's sim", "[]", NOW - 1000, NOW - 1000])

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
  const deadline = Date.now() + 14_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(200)
  }
})
afterAll(() => { serverProc?.kill(); rawClient.close() })

async function getPersonas(projectId: string, sessionCookie: string) {
  const r = await fetch(`${BASE}/api/personas?project=${projectId}`, {
    headers: { Cookie: `klav_session=${sessionCookie}` },
  })
  expect(r.status).toBe(200)
  return (await r.json()).personas as any[]
}

async function putPersona(id: string, projectId: string, body: any, sessionCookie: string) {
  return fetch(`${BASE}/api/personas/${encodeURIComponent(id)}?project=${projectId}`, {
    method: "PUT", headers: { Cookie: `klav_session=${sessionCookie}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

// ── Helper to mark a Sim global/not via PUT ──
async function setGlobal(simId: string, projectId: string, isGlobal: boolean, cookie: string) {
  const all = await getPersonas(projectId, cookie)
  const sim = all.find((s: any) => s.id === simId)
  expect(sim).toBeDefined()
  const r = await putPersona(simId, projectId, {
    name: sim.name, role: sim.role, summary: sim.summary || "",
    type: sim.type || "client", initials: sim.initials || "",
    accent: sim.accent || "#6366f1", insights: sim.insights || [], isGlobal,
  }, cookie)
  expect(r.status).toBe(200)
  expect((await r.json()).ok).toBe(true)
}

// ── 1. Baseline: before marking global, Sims are project-scoped ────────────────────────────────

test("before marking global, GLOBAL_SIM is absent from sibling PROJ_A2", async () => {
  const sims = await getPersonas(PROJ_A2, ALICE_SID)
  expect(sims.some((s: any) => s.id === GLOBAL_SIM)).toBe(false)
  // A2 only has its own CLASH_SIM at this point
  expect(sims.some((s: any) => s.id === CLASH_SIM)).toBe(true)
})

test("isGlobal defaults to false for normal project-scoped Sims", async () => {
  const sims = await getPersonas(PROJ_A1, ALICE_SID)
  const local = sims.find((s: any) => s.id === LOCAL_SIM)
  expect(local).toBeDefined()
  expect(local.isGlobal).toBe(false)
})

test("every persona in GET /api/personas carries isGlobal boolean", async () => {
  const sims = await getPersonas(PROJ_A1, ALICE_SID)
  expect(sims.length).toBeGreaterThan(0)
  for (const s of sims) {
    expect(typeof s.isGlobal).toBe("boolean")
  }
})

// ── 2. Toggle isGlobal=true via PUT ────────────────────────────────────────────────────────────

test("PUT isGlobal:true sets the flag; home project reflects isGlobal:true", async () => {
  await setGlobal(GLOBAL_SIM, PROJ_A1, true, ALICE_SID)
  // Also mark GLOBAL_SIM2 as global so we can test local-wins separately
  await setGlobal(GLOBAL_SIM2, PROJ_A1, true, ALICE_SID)

  const a1Sims = await getPersonas(PROJ_A1, ALICE_SID)
  expect(a1Sims.find((s: any) => s.id === GLOBAL_SIM)?.isGlobal).toBe(true)
  expect(a1Sims.find((s: any) => s.id === GLOBAL_SIM2)?.isGlobal).toBe(true)
})

// ── 3. Global Sim appears in sibling project ────────────────────────────────────────────────────
// GLOBAL_SIM ("Red Hat / Threat Modeller") has a unique name that doesn't clash with any A2 Sim.

test("GLOBAL_SIM appears in sibling PROJ_A2 with isGlobal:true", async () => {
  const sims = await getPersonas(PROJ_A2, ALICE_SID)
  const found = sims.find((s: any) => s.id === GLOBAL_SIM)
  expect(found).toBeDefined()
  expect(found.isGlobal).toBe(true)
})

test("GLOBAL_SIM appears exactly once in PROJ_A2 (no duplicates from UNION)", async () => {
  const sims = await getPersonas(PROJ_A2, ALICE_SID)
  const matches = sims.filter((s: any) => s.id === GLOBAL_SIM)
  expect(matches.length).toBe(1)
})

test("GLOBAL_SIM appears exactly once in its own home PROJ_A1 (not double-shown)", async () => {
  const sims = await getPersonas(PROJ_A1, ALICE_SID)
  const matches = sims.filter((s: any) => s.id === GLOBAL_SIM)
  expect(matches.length).toBe(1)
})

// ── 4. Tenant isolation — Bob's project never sees Alice's globals ──────────────────────────────

test("GLOBAL_SIM does NOT appear in Bob's project (cross-tenant isolation)", async () => {
  const sims = await getPersonas(PROJ_B, BOB_SID)
  expect(sims.some((s: any) => s.id === GLOBAL_SIM)).toBe(false)
  // Even the name shouldn't leak; ensure only Bob's own Sims are present
  expect(sims.some((s: any) => s.id === BOB_SIM)).toBe(true)
})

test("Bob's Sim does NOT appear in Alice's projects", async () => {
  const a1Sims = await getPersonas(PROJ_A1, ALICE_SID)
  const a2Sims = await getPersonas(PROJ_A2, ALICE_SID)
  expect(a1Sims.some((s: any) => s.id === BOB_SIM)).toBe(false)
  expect(a2Sims.some((s: any) => s.id === BOB_SIM)).toBe(false)
})

// ── 5. LOCAL_SIM (is_global=0) does NOT appear in sibling project ──────────────────────────────

test("LOCAL_SIM (is_global=0) does NOT appear in sibling PROJ_A2", async () => {
  const sims = await getPersonas(PROJ_A2, ALICE_SID)
  expect(sims.some((s: any) => s.id === LOCAL_SIM)).toBe(false)
})

// ── 6. Local-wins dedup: PROJ_A2 has own "Black Hat / Adversarial Tester" = CLASH_SIM.
//       GLOBAL_SIM2 has the same name+role — it must be suppressed (CLASH_SIM wins). ──────────────

test("when PROJ_A2 has its own Sim matching a global's name+role, the local Sim wins", async () => {
  const sims = await getPersonas(PROJ_A2, ALICE_SID)
  const blackHats = sims.filter((s: any) =>
    s.name === "Black Hat" && s.role === "Adversarial Tester"
  )
  // Only ONE "Black Hat / Adversarial Tester" in the list.
  expect(blackHats.length).toBe(1)
  // It must be the project's own CLASH_SIM, not the global GLOBAL_SIM2.
  expect(blackHats[0].id).toBe(CLASH_SIM)
  // The local one is NOT marked isGlobal.
  expect(blackHats[0].isGlobal).toBe(false)
})

test("GLOBAL_SIM2 is suppressed in PROJ_A2 due to local-wins dedup", async () => {
  const sims = await getPersonas(PROJ_A2, ALICE_SID)
  // GLOBAL_SIM2 should not appear; CLASH_SIM covers that identity.
  expect(sims.some((s: any) => s.id === GLOBAL_SIM2)).toBe(false)
})

// ── 7. Toggle isGlobal off — removes Sim from sibling projects ──────────────────────────────────

test("toggling isGlobal:false removes GLOBAL_SIM from sibling PROJ_A2", async () => {
  // First confirm it's there.
  let sims = await getPersonas(PROJ_A2, ALICE_SID)
  expect(sims.some((s: any) => s.id === GLOBAL_SIM)).toBe(true)

  // Toggle off.
  await setGlobal(GLOBAL_SIM, PROJ_A1, false, ALICE_SID)

  // Now PROJ_A2 should no longer see GLOBAL_SIM.
  sims = await getPersonas(PROJ_A2, ALICE_SID)
  expect(sims.some((s: any) => s.id === GLOBAL_SIM)).toBe(false)
})

test("after toggle-off, isGlobal is false on the home-project row", async () => {
  const sims = await getPersonas(PROJ_A1, ALICE_SID)
  const sim = sims.find((s: any) => s.id === GLOBAL_SIM)
  expect(sim).toBeDefined()
  expect(sim.isGlobal).toBe(false)
})

// ── 8. PUT isGlobal on a foreign project's Sim is rejected (access control) ────────────────────

test("Alice cannot PUT isGlobal on Bob's Sim (access control: wrong tenant)", async () => {
  // Alice requests PROJ_B which she has no access to → resolveProject returns null → 400.
  const r = await putPersona(BOB_SIM, PROJ_B, {
    name: "Eve Attacker", role: "Penetration Tester", summary: "hacked",
    type: "client", initials: "EA", accent: "#dc2626", insights: [], isGlobal: true,
  }, ALICE_SID)
  expect([400, 404]).toContain(r.status)
})

test("Bob cannot PUT isGlobal on Alice's Sim (access control: wrong tenant)", async () => {
  // Bob cannot access PROJ_A1.
  const r = await putPersona(GLOBAL_SIM, PROJ_A1, {
    name: "Red Hat", role: "Threat Modeller", summary: "still alice's",
    type: "client", initials: "RH", accent: "#ef4444", insights: [], isGlobal: true,
  }, BOB_SID)
  expect([400, 404]).toContain(r.status)
})
