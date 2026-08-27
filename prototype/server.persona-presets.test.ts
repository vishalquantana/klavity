// #643: Preset Sim library tests. GET /api/personas/presets must return the 5 well-formed QA
// reviewer presets, each shaped so the one-click Add flow (POST /api/personas) accepts it. We also
// POST a preset back and confirm it persists with simSource:'preset'.
// Uses the same subprocess-against-temp-DB pattern as server.personas-dedup.test.ts.
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

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-presets-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(99)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, sim_class TEXT, side TEXT, goals_json TEXT, expertise TEXT, temperament TEXT, voice TEXT, watchfor_json TEXT, sim_source TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS persona_edits (id TEXT PRIMARY KEY, persona_id TEXT NOT NULL, project_id TEXT NOT NULL, field TEXT NOT NULL, before_val TEXT, after_val TEXT, actor TEXT, created_at INTEGER NOT NULL)`)

const ADMIN_EMAIL = "vishal@quantana.com.au"
const ADMIN_SID = `sess_pre_${ts}`
const ACCOUNT_ID = `acct_pre_${ts}`
const PROJECT_ID = `proj_pre_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Preset Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_pre_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJECT_ID, ACCOUNT_ID, "Preset Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_pre_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
  [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = await __freePortKLA719()
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

const HEX = /^#[0-9a-fA-F]{6}$/
const EXPECTED = ["grammar-spelling", "ui-alignment", "colour-branding", "accessibility", "cta-clarity"]

test("GET /api/personas/presets returns the 5 well-formed QA reviewer presets", async () => {
  const res = await api(`/api/personas/presets`)
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(Array.isArray(body.presets)).toBe(true)
  expect(body.presets.length).toBe(5)
  expect(body.presets.map((p: any) => p.presetId).sort()).toEqual([...EXPECTED].sort())
  for (const p of body.presets) {
    expect(typeof p.name).toBe("string"); expect(p.name.length).toBeGreaterThan(0)
    expect(typeof p.role).toBe("string"); expect(p.role.length).toBeGreaterThan(0)
    expect(p.simClass).toBe("user")   // QA reviewers operate the product hands-on
    expect(p.side).toBe("internal")   // internal QA reviewers, not customers
    expect(HEX.test(p.accent)).toBe(true)
    expect(p.summary.length).toBeGreaterThan(20)
    // core drives reactToPage — must carry concrete goals + watchFor
    expect(Array.isArray(p.core.goals)).toBe(true); expect(p.core.goals.length).toBeGreaterThan(0)
    expect(Array.isArray(p.core.watchFor)).toBe(true); expect(p.core.watchFor.length).toBeGreaterThan(0)
    expect(typeof p.core.voice).toBe("string"); expect(typeof p.core.temperament).toBe("string")
  }
})

test("the colour & branding preset carries the Venus Pro final-state colour rule", async () => {
  const res = await api(`/api/personas/presets`)
  const body = await res.json()
  const brand = body.presets.find((p: any) => p.presetId === "colour-branding")
  expect(brand).toBeTruthy()
  const blob = (brand.summary + " " + brand.core.watchFor.join(" ") + " " + brand.insights.map((i: any) => i.text).join(" ")).toLowerCase()
  expect(blob).toContain("orange")
  expect(blob).toContain("green")
  expect(blob).toContain("final")   // the completed/final-state rule
})

test("GET /api/personas/presets requires auth", async () => {
  const res = await fetch(`${BASE}/api/personas/presets`)   // no cookie
  expect(res.status).toBe(401)
})

test("one-click adding a preset persists it via POST /api/personas stamped simSource:'preset'", async () => {
  const listRes = await api(`/api/personas/presets`)
  const { presets } = await listRes.json()
  const preset = presets.find((p: any) => p.presetId === "accessibility")
  // Mirror the dashboard saveSim() payload for a preset card.
  const addRes = await api(`/api/personas?project=${PROJECT_ID}`, "POST", {
    name: preset.name, role: preset.role,
    simClass: preset.simClass, side: preset.side, core: preset.core,
    initials: preset.initials, accent: preset.accent, summary: preset.summary,
    insights: preset.insights, simSource: "preset",
  })
  expect(addRes.status).toBe(201)
  const { persona } = await addRes.json()
  expect(persona.name).toBe(preset.name)
  expect(persona.simClass).toBe("user")
  expect(persona.side).toBe("internal")
  expect(persona.simSource).toBe("preset")
  expect(Array.isArray(persona.core.watchFor)).toBe(true)
  expect(persona.core.watchFor.length).toBeGreaterThan(0)
})
