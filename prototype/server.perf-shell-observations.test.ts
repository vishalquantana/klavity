// server.perf-shell-observations.test.ts
//
// Perf tickets #657 + #661.
//
//   #657 — the /dashboard shell (~930KB) must carry a validator so the browser revalidates with a
//          cheap 304 instead of re-downloading the whole shell every navigation. We assert:
//            • GET /dashboard → 200 with an ETag + a revalidate-oriented Cache-Control (never a long
//              immutable max-age), and
//            • a follow-up GET carrying If-None-Match:<that etag> → 304 with an empty body.
//
//   #661 — /api/dashboard previously shipped up to 100 Sim observations per poll though the view only
//          renders the latest one per Sim (+ a count) and slices `saying` to 12. We seed 40 Sim
//          observations for one persona and assert the per-Sim `simFeedback` map is capped (≤36) and
//          `saying` is ≤12, while the rollup flags (hasSimReaction) and counts are preserved.
//
// Hermetic: spawns a real server subprocess against a fresh temp DB; rows seeded AFTER initDb().

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-perf-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

const USER_EMAIL = `perf-user-${ts}@test.local`
const USER_SID = `sess_perf_${ts}`
const ACCOUNT_ID = `acct_perf_${ts}`
const PROJ = `proj_perf_${ts}`
const SIM_ID = `sim_perf_${ts}`
const OBS_COUNT = 40

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string
let rawClient: ReturnType<typeof createClient>

beforeAll(async () => {
  serverPort = 42900 + Math.floor(Math.random() * 500)
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
  const rawExec = (sql: string, args: any[] = []) => rawClient.execute({ sql, args })

  await rawExec(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [USER_EMAIL, NOW])
  await rawExec(`INSERT OR IGNORE INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`,
    [ACCOUNT_ID, "Perf Workspace", USER_EMAIL, NOW])
  await rawExec(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`am_perf_${ts}`, ACCOUNT_ID, USER_EMAIL, "owner", NOW])
  await rawExec(
    `INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJ, ACCOUNT_ID, "Perf Product", "active", "auto", 200, "named", NOW, NOW])
  await rawExec(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [`pm_perf_${ts}`, PROJ, USER_EMAIL, "admin", null, NOW])
  await rawExec(`INSERT OR IGNORE INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    [USER_SID, USER_EMAIL, NOW, NOW + 86400_000])

  // One persona (Sim) + 40 Sim-generated observations for it.
  await rawExec(`INSERT OR IGNORE INTO personas (id, project_id, name, role, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [SIM_ID, PROJ, "Perf Persona", "Shopper", "sim", NOW, NOW])
  for (let i = 0; i < OBS_COUNT; i++) {
    await rawExec(`INSERT OR IGNORE INTO feedback (id, project_id, sim_id, observation, url_path, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [`fb_perf_${ts}_${i}`, PROJ, SIM_ID, `Observation number ${i}`, "/checkout", NOW + i])
  }
}, 20000)

afterAll(() => {
  serverProc?.kill()
  rawClient?.close()
})

const authHeader = (sid: string) => ({ Cookie: `klav_session=${sid}` })

// =============================================================================
// #657 — dashboard shell carries a validator + revalidate cache-control, and a
//         conditional request short-circuits to 304.
// =============================================================================
test("#657 dashboard shell returns an ETag + revalidate Cache-Control", async () => {
  const r = await fetch(`${BASE}/dashboard`, { headers: authHeader(USER_SID) })
  expect(r.status).toBe(200)
  const etag = r.headers.get("etag")
  const cc = (r.headers.get("cache-control") || "").toLowerCase()
  expect(etag).toBeTruthy()
  // Must revalidate — never a long immutable max-age that would pin a stale build after a deploy.
  expect(cc).toContain("must-revalidate")
  expect(cc).not.toContain("immutable")
  expect(cc).not.toMatch(/max-age=\s*[1-9]\d{3,}/) // no multi-thousand-second cache
})

test("#657 conditional GET with matching If-None-Match returns 304 (no re-download)", async () => {
  const first = await fetch(`${BASE}/dashboard`, { headers: authHeader(USER_SID) })
  const etag = first.headers.get("etag")!
  expect(etag).toBeTruthy()
  const second = await fetch(`${BASE}/dashboard`, { headers: { ...authHeader(USER_SID), "If-None-Match": etag } })
  expect(second.status).toBe(304)
  const body = await second.text()
  expect(body.length).toBe(0)
  // The validator is echoed back on the 304 so the browser keeps its cached copy.
  expect(second.headers.get("etag")).toBe(etag)
})

// =============================================================================
// #661 — /api/dashboard caps the per-Sim observation payload; rollups preserved.
// =============================================================================
test("#661 /api/dashboard caps Sim observations (does not ship all 40) yet keeps rollups", async () => {
  const r = await fetch(`${BASE}/api/dashboard?project=${encodeURIComponent(PROJ)}`, { headers: authHeader(USER_SID) })
  expect(r.status).toBe(200)
  const body = await r.json() as any

  // simFeedback: per-Sim map must be capped well below the 40 seeded (limit is 36).
  const perSim = (body.simFeedback && body.simFeedback[SIM_ID]) || []
  expect(Array.isArray(perSim)).toBe(true)
  expect(perSim.length).toBeGreaterThan(0)
  expect(perSim.length).toBeLessThanOrEqual(36)
  expect(perSim.length).toBeLessThan(OBS_COUNT)

  // `saying` feed stays sliced to the ~12 the view renders.
  expect(Array.isArray(body.saying)).toBe(true)
  expect(body.saying.length).toBeLessThanOrEqual(12)

  // Rollup preserved: at least one Sim reaction is still reported.
  expect(body.hasSimReaction).toBe(true)
  expect(body.counts).toBeTruthy()
})
