// KD-2875: every Sim card on the Sims page shows ITS OWN latest feedback + true count.
//
// Before: /api/dashboard built `simFeedback` from the project's newest 36 Sim observations in TOTAL, so a Sim whose reports were
// older than those 36 (or crowded out by one busy Sim) came back with no entry and its card read "No feedback yet from this Sim."
// Now: one per-Sim query (newest ≤3 per Sim + the true total, exposed as sims[].feedbackCount).
//
// Hermetic: spawns a real server against a fresh temp DB (same pattern as server.perf-shell-observations.test.ts).
import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-simfb-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")
const USER_EMAIL = `simfb-user-${ts}@test.local`
const USER_SID = `sess_simfb_${ts}`
const ACCOUNT_ID = `acct_simfb_${ts}`
const PROJ = `proj_simfb_${ts}`
const BUSY = `sim_busy_${ts}`      // 40 NEWER observations — used to crowd everyone else out of the project-wide top 36
const OLD = `sim_old_${ts}`        // 2 OLDER observations — the card that used to say "No feedback yet"
const NONE = `sim_none_${ts}`      // genuinely no feedback
const OFF = `sim_off_${ts}`        // deactivated Sim with past feedback — must still show it
const MERGED = `sim_merged_${ts}`  // only a merged-away report — not counted

let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string
let rawClient: ReturnType<typeof createClient>

beforeAll(async () => {
  const port = await freePort()
  BASE = `http://localhost:${port}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + srvDbFile, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local", KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe", stderr: "pipe",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(200)
  }
  rawClient = createClient({ url: "file:" + srvDbFile })
  await rawClient.execute("PRAGMA busy_timeout=5000")
  const NOW = Date.now()
  const x = (sql: string, args: any[] = []) => rawClient.execute({ sql, args })
  await x(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [USER_EMAIL, NOW])
  await x(`INSERT OR IGNORE INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "SimFb Workspace", USER_EMAIL, NOW])
  await x(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_simfb_${ts}`, ACCOUNT_ID, USER_EMAIL, "owner", NOW])
  await x(`INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJ, ACCOUNT_ID, "SimFb Product", "active", "auto", 200, "named", NOW, NOW])
  await x(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_simfb_${ts}`, PROJ, USER_EMAIL, "admin", null, NOW])
  await x(`INSERT OR IGNORE INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [USER_SID, USER_EMAIL, NOW, NOW + 86400_000])
  for (const [id, name, active] of [[BUSY, "Busy Sim", 1], [OLD, "Old Sim", 1], [NONE, "Quiet Sim", 1], [OFF, "Deactivated Sim", 0], [MERGED, "Merged Sim", 1]] as const)
    await x(`INSERT OR IGNORE INTO personas (id, project_id, name, role, type, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, PROJ, name, "Tester", "sim", active, NOW, NOW])
  const fb = (id: string, sim: string, text: string, at: number, merged: string | null = null) =>
    x(`INSERT OR IGNORE INTO feedback (id, project_id, sim_id, observation, url_path, created_at, merged_into) VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, PROJ, sim, text, "/page", at, merged])
  for (let i = 0; i < 40; i++) await fb(`fb_busy_${ts}_${i}`, BUSY, `Busy observation ${i}`, NOW + 10_000 + i)
  await fb(`fb_old_a_${ts}`, OLD, "Old Sim older observation", NOW - 90_000)
  await fb(`fb_old_b_${ts}`, OLD, "Old Sim newest observation", NOW - 80_000)
  await fb(`fb_off_${ts}`, OFF, "Deactivated Sim past observation", NOW - 70_000)
  await fb(`fb_merged_${ts}`, MERGED, "merged away", NOW - 60_000, `fb_busy_${ts}_0`)
}, 25000)

afterAll(() => { serverProc?.kill(); rawClient?.close() })

async function dash() {
  const r = await fetch(`${BASE}/api/dashboard?project=${encodeURIComponent(PROJ)}`, { headers: { Cookie: `klav_session=${USER_SID}` } })
  expect(r.status).toBe(200)
  return await r.json() as any
}

test("KD-2875 a Sim with older feedback still shows its latest observation (not crowded out by a busy Sim)", async () => {
  const b = await dash()
  const old = b.simFeedback[OLD] || []
  expect(old.length).toBe(2)
  expect(old[0].text).toBe("Old Sim newest observation")        // newest first — what the card shows inline
  expect(old[0].urlPath).toBe("/page")
})

test("KD-2875 a deactivated Sim keeps showing its past feedback", async () => {
  const b = await dash()
  expect((b.simFeedback[OFF] || []).map((o: any) => o.text)).toEqual(["Deactivated Sim past observation"])
})

test("KD-2875 sims[].feedbackCount is the TRUE total, even when the per-Sim list is capped", async () => {
  const b = await dash()
  const count = (id: string) => b.sims.find((s: any) => s.id === id)?.feedbackCount
  expect(count(BUSY)).toBe(40)                                     // 40 reports, only a few rows shipped
  expect((b.simFeedback[BUSY] || []).length).toBeLessThanOrEqual(3)
  expect(count(OLD)).toBe(2)
  expect(count(OFF)).toBe(1)
})

test("KD-2875 a Sim with no feedback (or only merged-away reports) stays empty", async () => {
  const b = await dash()
  for (const id of [NONE, MERGED]) {
    expect(b.simFeedback[id]).toBeUndefined()
    expect(b.sims.find((s: any) => s.id === id)?.feedbackCount).toBe(0)
  }
})
