// server.transcripts-apply.test.ts
//
// Tests for POST /api/transcripts/apply — persist the approved subset of a Task 6 preview stash.
// LLM-free: no OPENROUTER_API_KEY, no extract/reconcile calls. Strategy mirrors
// server.transcripts-lines.test.ts: spawn `bun run server.ts` against a fresh temp `file:` DB, wait
// for it to boot (schema applied via initDb — pending_transcripts, personas, sim_traits, trait_events,
// reconcile_runs all exist), then seed a project/session/Sim/trait + a pending_transcripts row directly
// through @libsql/client, and hit the route over HTTP.

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __netKLA719 from "node:net"
// KLA-719: OS-assigned free port (replaces a crowded random base that let co-scheduled
// server suites collide and answer each other's requests → spurious 401/404/no-such-table).
function __freePortKLA719(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __netKLA719.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Temp DB ───────────────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-tx-apply-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(88)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })

// ── Server subprocess ─────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

const NOW = Date.now()
const OWNER = `owner-${ts}@test.local`
const SID = `sess_${ts}`
const ACCT = `acct_${ts}`
const PROJ = `proj_${ts}`
const SIM = `sim_seed_${ts}`
const TRAIT = `trait_seed_${ts}`
let previewId: string

const RAW_TEXT = "00:00:05 Sarah: alpha here\n00:00:09 Sarah: beta here"

beforeAll(async () => {
  serverPort = await __freePortKLA719()
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
      OPENROUTER_API_KEY: "", // must never be called — this route is LLM-free
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
    await Bun.sleep(150)
  }

  // ── Seed AFTER boot so initDb's full schema (pending_transcripts, personas, sim_traits, trait_events,
  // reconcile_runs, sessions, accounts, projects, project_members) already exists. ──
  await rawClient.execute({
    sql: "INSERT INTO users (email, created_at) VALUES (?, ?)",
    args: [OWNER, NOW],
  })
  await rawClient.execute({
    sql: "INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)",
    args: [ACCT, "TX Apply Test", OWNER, NOW],
  })
  await rawClient.execute({
    sql: "INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [`am_${ts}`, ACCT, OWNER, "owner", NOW],
  })
  await rawClient.execute({
    sql: "INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [PROJ, ACCT, "Proj", "active", "auto", 500, "named", NOW, NOW],
  })
  await rawClient.execute({
    sql: "INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [`pm_${ts}`, PROJ, OWNER, "owner", null, NOW],
  })
  await rawClient.execute({
    sql: "INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)",
    args: [SID, OWNER, NOW, NOW + 86400_000],
  })

  // Sim (personas row) — minimal columns; matches lib/db.ts personas schema.
  await rawClient.execute({
    sql: "INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [SIM, PROJ, "Sarah", "Ops Lead", "client", "SA", "#6366f1", "", JSON.stringify([]), null, NOW, NOW],
  })

  // One pre-existing active trait for the Sim (not strictly required by the "add" ops below, but
  // exercises listTraits/current-set loading like a real Sim would have).
  await rawClient.execute({
    sql: `INSERT INTO sim_traits (id, sim_id, project_id, kind, text, status, strength, src_transcript_id, src_quote, src_quote_offset, src_speaker, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [TRAIT, SIM, PROJ, "pain", "pre-existing pain", "active", 1, "tr_seed", "pre-existing quote", 0, "Sarah", NOW, NOW],
  })

  // Pending transcript stash — one "existing" group with TWO add-ops, opIds "0:0" and "0:1".
  // Quotes are exact substrings of RAW_TEXT so groundQuote resolves offsets deterministically:
  //   "alpha here" starts inside the 00:00:05 line → offsetToTime → 5
  //   "beta here"  starts inside the 00:00:09 line → offsetToTime → 9
  const stashGroups = [
    {
      kind: "existing",
      groupIndex: 0,
      simId: SIM,
      ops: [
        { op: "add", kind: "pain", text: "Alpha finding", quote: "alpha here", speaker: "Sarah" },
        { op: "add", kind: "want", text: "Beta finding", quote: "beta here", speaker: "Sarah" },
      ],
    },
  ]
  const lines = [
    { speaker: "Sarah", text: "alpha here", tsSeconds: 5, charStart: 0, charEnd: 26 },
    { speaker: "Sarah", text: "beta here", tsSeconds: 9, charStart: 27, charEnd: RAW_TEXT.length },
  ]
  const payload = { rawText: RAW_TEXT, title: "Seeded Transcript", sourceDate: NOW, lines, groups: stashGroups }
  previewId = "pt_" + Math.random().toString(36).slice(2)
  await rawClient.execute({
    sql: "INSERT INTO pending_transcripts (id, project_id, payload_json, created_at) VALUES (?, ?, ?, ?)",
    args: [previewId, PROJ, JSON.stringify(payload), NOW],
  })
}, 20000)

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

test("apply requires auth", async () => {
  const r = await fetch(`${BASE}/api/transcripts/apply?project=${PROJ}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ previewId, approvedOpIds: ["0:0"], approvedProposalIds: [] }),
  })
  expect(r.status).toBe(401)
})

test("apply persists only approved ops and stamps timestamps", async () => {
  const r = await fetch(`${BASE}/api/transcripts/apply?project=${PROJ}`, {
    method: "POST",
    headers: { "content-type": "application/json", Cookie: `klav_session=${SID}` },
    body: JSON.stringify({ previewId, approvedOpIds: ["0:0"], approvedProposalIds: [] }),
  })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.applied.ops).toBe(1)
  expect(d.applied.newSims).toBe(0)
  expect(typeof d.transcriptId).toBe("string")

  // Exactly ONE new trait row for sim_seed matching "%alpha%", with src_quote_ts stamped to 5.
  const alphaRows = await rawClient.execute({
    sql: "SELECT src_quote_ts FROM sim_traits WHERE sim_id=? AND text LIKE ?",
    args: [SIM, "%Alpha%"],
  })
  expect(alphaRows.rows.length).toBe(1)
  expect(Number(alphaRows.rows[0].src_quote_ts)).toBe(5)

  // The "%beta%" op was NOT applied (not in approvedOpIds).
  const betaRows = await rawClient.execute({
    sql: "SELECT id FROM sim_traits WHERE sim_id=? AND text LIKE ?",
    args: [SIM, "%Beta%"],
  })
  expect(betaRows.rows.length).toBe(0)

  // The pending row was deleted.
  const p = await rawClient.execute({ sql: "SELECT id FROM pending_transcripts WHERE id=?", args: [previewId] })
  expect(p.rows.length).toBe(0)
})

test("re-applying a deleted preview 404s (stash consumed)", async () => {
  const r = await fetch(`${BASE}/api/transcripts/apply?project=${PROJ}`, {
    method: "POST",
    headers: { "content-type": "application/json", Cookie: `klav_session=${SID}` },
    body: JSON.stringify({ previewId, approvedOpIds: ["0:0"], approvedProposalIds: [] }),
  })
  expect(r.status).toBe(404)
})
