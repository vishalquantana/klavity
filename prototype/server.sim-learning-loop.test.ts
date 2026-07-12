// JTBD 3.13 (KLAVITYKLA-265): close the feedback→Sim learning loop.
//   1. GET /api/sims/:id/profile returns per-Sim accept-rate stats from real triage outcomes.
//   2. PATCH /api/feedback/:id { status:"dismissed", reason } writes a dismiss trait event on the
//      originating Sim (visible in GET /api/sims/:id/evolution) for each cited trait.
//   3. PUT /api/personas/:id with a new v3 core (goals/watchFor/voice) records versioned persona_edits.
//   4. PUT /api/sims/:id/traits/:tid can change kind/priority/area, not just text.
// Subprocess-against-temp-DB pattern (mirrors server.sim-profile.test.ts).
import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-simloop-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }
async function rawAll(sql: string, args: any[] = []) { return (await rawClient.execute({ sql, args })).rows }

await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS fb_sim_idx ON feedback (sim_id, created_at)`)
// personas WITH v3 core columns (goals_json / expertise / temperament / voice / watchfor_json)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, goals_json TEXT, expertise TEXT, temperament TEXT, voice TEXT, watchfor_json TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS persona_edits (id TEXT PRIMARY KEY, persona_id TEXT NOT NULL, project_id TEXT NOT NULL, field TEXT NOT NULL, before_val TEXT, after_val TEXT, actor TEXT NOT NULL, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
// trait_events with the same additive columns applySchema ALTERs on (verified/area/issue_type/priority/actor)
// so the server's insertTraitEvent (which writes all of them) succeeds against this hermetic DB.
await rawExec(`CREATE TABLE IF NOT EXISTS trait_events (id TEXT PRIMARY KEY, trait_id TEXT NOT NULL, sim_id TEXT NOT NULL, transcript_id TEXT NOT NULL, op TEXT NOT NULL, before_text TEXT, after_text TEXT, quote TEXT NOT NULL, quote_offset INTEGER, verified INTEGER, speaker TEXT, source_date INTEGER NOT NULL, reason TEXT, area TEXT, issue_type TEXT, priority TEXT, actor TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS transcripts (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT, raw_text TEXT NOT NULL, source_date INTEGER NOT NULL, speakers_json TEXT, added_by TEXT NOT NULL, created_at INTEGER NOT NULL)`)

const ADMIN_EMAIL = `vishal@quantana.com.au`
const ADMIN_SID = `sess_sl_${ts}`
const ACCOUNT_ID = `acct_sl_${ts}`
const PROJECT_ID = `proj_sl_${ts}`
const SIM_ID = `sim_sl_${ts}`
const TX_ID = `tx_sl_${ts}`
const TRAIT_ID = `trait_sl_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "SL Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_sl_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "SL Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_sl_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, goals_json, voice, watchfor_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  [SIM_ID, PROJECT_ID, "Sarah Chen", "Procurement Lead", "client", "SC", "#6366f1", "Efficiency-obsessed buyer", "[]",
   JSON.stringify(["reduce time to approve"]), "terse and impatient", JSON.stringify(["slow flows"]), NOW, NOW])

await rawExec(`INSERT INTO transcripts (id, project_id, title, raw_text, source_date, speakers_json, added_by, created_at) VALUES (?,?,?,?,?,?,?,?)`,
  [TX_ID, PROJECT_ID, "Sarah onboarding call", "Sarah: Approvals take forever.", NOW - 1000, JSON.stringify(["Sarah"]), ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO sim_traits (id, sim_id, project_id, kind, text, status, strength, src_transcript_id, src_quote, src_speaker, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  [TRAIT_ID, SIM_ID, PROJECT_ID, "pain", "Wants faster approvals", "active", 1, TX_ID, "Approvals take forever", "Sarah", NOW, NOW])
await rawExec(`INSERT INTO trait_events (id, trait_id, sim_id, transcript_id, op, quote, source_date, created_at) VALUES (?,?,?,?,?,?,?,?)`,
  [`evt_sl_${ts}`, TRAIT_ID, SIM_ID, TX_ID, "create", "Approvals take forever", NOW - 1000, NOW])

// Feedback across triage outcomes: 2 confirmed, 1 dismissed, 1 pending → accept rate = 2 / (2+1) = 0.666…
await rawExec(`INSERT INTO feedback (id, project_id, sim_id, observation, priority, suggested_bug_json, status, created_at) VALUES (?,?,?,?,?,?,?,?)`,
  [`fb_c1_${ts}`, PROJECT_ID, SIM_ID, "checkout dead", "low", JSON.stringify({ title: "Checkout CTA dead" }), "in_progress", NOW - 40])
await rawExec(`INSERT INTO feedback (id, project_id, sim_id, observation, priority, suggested_bug_json, status, created_at) VALUES (?,?,?,?,?,?,?,?)`,
  [`fb_c2_${ts}`, PROJECT_ID, SIM_ID, "form broken", "low", JSON.stringify({ title: "Form broken" }), "done", NOW - 35])
await rawExec(`INSERT INTO feedback (id, project_id, sim_id, observation, priority, suggested_bug_json, status, created_at) VALUES (?,?,?,?,?,?,?,?)`,
  [`fb_d1_${ts}`, PROJECT_ID, SIM_ID, "colour off", "low", JSON.stringify({ title: "Brand colour off" }), "dismissed", NOW - 20])
await rawExec(`INSERT INTO feedback (id, project_id, sim_id, observation, priority, suggested_bug_json, status, created_at) VALUES (?,?,?,?,?,?,?,?)`,
  [`fb_p1_${ts}`, PROJECT_ID, SIM_ID, "still queued", "low", JSON.stringify({ title: "Still in queue" }), "new", NOW - 10])
// A still-open (untriaged is 'new', this one is accepted 'open') finding that cites the trait — we will
// dismiss THIS one with a reason and expect a trait event on TRAIT_ID.
const DISMISS_FB = `fb_dz_${ts}`
await rawExec(`INSERT INTO feedback (id, project_id, sim_id, observation, priority, suggested_bug_json, cited_trait_ids_json, status, created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
  [DISMISS_FB, PROJECT_ID, SIM_ID, "approvals still slow", "low", JSON.stringify({ title: "Approvals slow again" }), JSON.stringify([TRAIT_ID]), "new", NOW - 5])

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
      KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "test-key",
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

const authCookie = () => `klav_session=${ADMIN_SID}`
const get = (path: string) => fetch(`${BASE}${path}`, { headers: { Cookie: authCookie() } })
const send = (method: string, path: string, body: any) =>
  fetch(`${BASE}${path}`, { method, headers: { Cookie: authCookie(), "Content-Type": "application/json" }, body: JSON.stringify(body) })

// ── AC1: per-Sim accept-rate stat from real triage outcomes ─────────────────────────────────────
test("profile returns accept-rate derived from real triage outcomes", async () => {
  const res = await get(`/api/sims/${SIM_ID}/profile?project=${PROJECT_ID}`)
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body.acceptRate).toBeTruthy()
  // 2 confirmed, 1 dismissed, 2 pending (the 'new' queued one + the DISMISS_FB not yet dismissed).
  expect(body.acceptRate.accepted).toBe(2)
  expect(body.acceptRate.dismissed).toBe(1)
  expect(body.acceptRate.decided).toBe(3)
  expect(body.acceptRate.rate).toBeCloseTo(2 / 3, 5)
  // pending rows are excluded from the rate denominator
  expect(body.acceptRate.pending).toBe(2)
})

// ── AC2: dismiss-with-reason writes a trait event visible in the Sim's evolution history ─────────
test("dismissing a Sim finding with a reason writes a dismiss event on the cited trait", async () => {
  // Sanity: no dismiss events on the trait yet.
  const before = await rawAll(`SELECT * FROM trait_events WHERE sim_id=? AND op='edit'`, [SIM_ID])
  expect(before.length).toBe(0)

  const res = await send("PATCH", `/api/feedback/${DISMISS_FB}?project=${PROJECT_ID}`, {
    status: "dismissed", reason: "Design intentionally uses this brand colour — not a bug.",
  })
  expect(res.status).toBe(200)

  // The reason now appears as an event in the Sim's evolution timeline.
  const evoRes = await get(`/api/sims/${SIM_ID}/evolution?project=${PROJECT_ID}`)
  expect(evoRes.status).toBe(200)
  const evo = await evoRes.json()
  const dismissEvt = evo.events.find((e: any) => e.reason && e.reason.startsWith("dismiss:"))
  expect(dismissEvt).toBeTruthy()
  expect(dismissEvt.traitId).toBe(TRAIT_ID)
  expect(dismissEvt.reason).toContain("brand colour")
  expect(dismissEvt.op).toBe("edit")

  // The trait itself was NOT mutated (still active, same text) — dismissal is append-only.
  const traitRow: any = (await rawAll(`SELECT status, text FROM sim_traits WHERE id=?`, [TRAIT_ID]))[0]
  expect(traitRow.status).toBe("active")
  expect(traitRow.text).toBe("Wants faster approvals")
})

test("dismissing without a reason writes no trait event", async () => {
  // Insert a second cited finding to dismiss with no reason.
  const fb2 = `fb_dz2_${ts}`
  await rawExec(`INSERT INTO feedback (id, project_id, sim_id, observation, priority, cited_trait_ids_json, status, created_at) VALUES (?,?,?,?,?,?,?,?)`,
    [fb2, PROJECT_ID, SIM_ID, "no-reason dismiss", "low", JSON.stringify([TRAIT_ID]), "new", NOW - 3])
  const before = (await rawAll(`SELECT COUNT(*) AS n FROM trait_events WHERE sim_id=? AND op='edit'`, [SIM_ID]))[0] as any
  const res = await send("PATCH", `/api/feedback/${fb2}?project=${PROJECT_ID}`, { status: "dismissed" })
  expect(res.status).toBe(200)
  const after = (await rawAll(`SELECT COUNT(*) AS n FROM trait_events WHERE sim_id=? AND op='edit'`, [SIM_ID]))[0] as any
  expect(Number(after.n)).toBe(Number(before.n)) // unchanged
})

// ── AC3: core (goals/watchFor/voice) editable post-extraction, with versioned history ────────────
test("editing the v3 core records versioned persona_edits for goals/watchFor/voice", async () => {
  const res = await send("PUT", `/api/personas/${SIM_ID}?project=${PROJECT_ID}`, {
    name: "Sarah Chen", role: "Procurement Lead", summary: "Efficiency-obsessed buyer", accent: "#6366f1",
    core: {
      goals: ["reduce time to approve", "avoid manual re-keying"], // added one
      voice: "warmer, still direct",                                // changed
      watchFor: ["slow flows"],                                     // unchanged
      expertise: "", temperament: "",
    },
  })
  expect(res.status).toBe(200)

  const editsRes = await get(`/api/personas/${SIM_ID}/edits?project=${PROJECT_ID}`)
  expect(editsRes.status).toBe(200)
  const edits = (await editsRes.json()).edits
  const changed = new Set(edits.map((e: any) => e.field))
  expect(changed.has("goals")).toBe(true)
  expect(changed.has("voice")).toBe(true)
  // watchFor did not change → no spurious edit row
  expect(changed.has("watchFor")).toBe(false)

  const voiceEdit = edits.find((e: any) => e.field === "voice")
  expect(voiceEdit.beforeVal).toBe("terse and impatient")
  expect(voiceEdit.afterVal).toBe("warmer, still direct")

  // The core actually persisted and reads back on the profile.
  const prof = await (await get(`/api/sims/${SIM_ID}/profile?project=${PROJECT_ID}`)).json()
  expect(prof.sim.core.voice).toBe("warmer, still direct")
  expect(prof.sim.core.goals).toContain("avoid manual re-keying")
})

// ── AC4: trait inline-edit can change kind/priority/area, not just text ──────────────────────────
test("trait PUT can change kind/priority/area", async () => {
  const res = await send("PUT", `/api/sims/${SIM_ID}/traits/${TRAIT_ID}?project=${PROJECT_ID}`, {
    text: "Wants faster approvals", kind: "want", priority: "high", area: "approvals",
  })
  expect(res.status).toBe(200)
  const trait = (await res.json()).trait
  expect(trait.kind).toBe("want")
  expect(trait.priority).toBe("high")
  expect(trait.area).toBe("approvals")

  const row: any = (await rawAll(`SELECT kind, priority, area FROM sim_traits WHERE id=?`, [TRAIT_ID]))[0]
  expect(row.kind).toBe("want")
  expect(row.priority).toBe("high")
  expect(row.area).toBe("approvals")
})
