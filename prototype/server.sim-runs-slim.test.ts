// KD-2877: GET /api/sims/runs?slim=1 returns the list view's fields (issue count + Sim avatars) instead of every Sim's full reactions,
// plus the resolved projectId; without slim the payload is unchanged (full reactions). Hermetic: real server against a temp DB.
import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __net.createServer(); s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB = join(tmpdir(), `klav-simruns-${ts}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")
const EMAIL = `runs-user-${ts}@test.local`, SID = `sess_runs_${ts}`, ACC = `acct_runs_${ts}`, PROJ = `proj_runs_${ts}`
let proc: ReturnType<typeof Bun.spawn>, BASE = "", raw: ReturnType<typeof createClient>

const bigReactions = (n: number) => Array.from({ length: 3 }, (_, i) => ({
  simName: `Sim ${i}`, initials: `S${i}`, accent: "#6366f1",
  observations: Array.from({ length: n }, (_, k) => ({ observation: "x".repeat(400) + k, suggestedBug: k % 2 === 0 ? { title: "bug " + k } : undefined })),
}))

beforeAll(async () => {
  const port = await freePort(); BASE = `http://localhost:${port}`
  proc = Bun.spawn(["bun", "run", "server.ts"], { cwd: import.meta.dir, stdout: "pipe", stderr: "pipe", env: {
    ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE,
    KLAV_ALLOWED_DOMAINS: "test.local", KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "test-key" } })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(200) }
  raw = createClient({ url: "file:" + DB }); await raw.execute("PRAGMA busy_timeout=5000")
  const NOW = Date.now(), x = (sql: string, a: any[] = []) => raw.execute({ sql, args: a })
  await x(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [EMAIL, NOW])
  await x(`INSERT OR IGNORE INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACC, "Runs WS", EMAIL, NOW])
  await x(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_runs_${ts}`, ACC, EMAIL, "owner", NOW])
  await x(`INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJ, ACC, "Runs Product", "active", "auto", 200, "named", NOW, NOW])
  await x(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_runs_${ts}`, PROJ, EMAIL, "admin", null, NOW])
  await x(`INSERT OR IGNORE INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [SID, EMAIL, NOW, NOW + 86400_000])
  for (let i = 0; i < 4; i++)
    await x(`INSERT INTO sim_runs (id, project_id, url, status, sim_ids_json, screenshot_id, reactions_json, label, error_msg, actor_email, created_at, finished_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [`run_${ts}_${i}`, PROJ, `https://shop.test/p${i}`, "done", null, null, JSON.stringify(bigReactions(6)), null, null, EMAIL, NOW - i * 1000, NOW - i * 1000 + 500])
  await x(`INSERT INTO sim_runs (id, project_id, url, status, sim_ids_json, screenshot_id, reactions_json, label, error_msg, actor_email, created_at, finished_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [`run_${ts}_err`, PROJ, "https://shop.test/broken", "error", null, null, null, null, "Page timed out", EMAIL, NOW - 9000, NOW - 8000])
}, 25000)
afterAll(() => { proc?.kill(); raw?.close() })

const get = async (qs: string) => {
  const r = await fetch(`${BASE}/api/sims/runs${qs}`, { headers: { Cookie: `klav_session=${SID}` } })
  const text = await r.text(); return { status: r.status, text, body: JSON.parse(text) as any }
}

test("without slim the payload is unchanged: full reactions per run (plus the additive projectId)", async () => {
  const { status, body } = await get(`?project=${PROJ}`)
  expect(status).toBe(200)
  expect(body.projectId).toBe(PROJ)
  const run = body.runs.find((r: any) => r.id === `run_${ts}_0`)
  expect(run.reactions.length).toBe(3)
  expect(run.slim).toBeUndefined()
})

test("slim=1 returns the list fields (issue count + Sim avatars) with far less data, and no reactions", async () => {
  const full = await get(`?project=${PROJ}`)
  const slim = await get(`?project=${PROJ}&slim=1`)
  expect(slim.status).toBe(200)
  const run = slim.body.runs.find((r: any) => r.id === `run_${ts}_0`)
  expect(run.slim).toBe(true)
  expect("reactions" in run).toBe(false)
  // 3 Sims x 6 observations, every even index carries a suggested bug → 3 per Sim → 9
  expect(run.issueCount).toBe(9)
  expect(run.sims.map((s: any) => s.simName)).toEqual(["Sim 0", "Sim 1", "Sim 2"])
  expect(run.sims[0]).toEqual({ simName: "Sim 0", initials: "S0", accent: "#6366f1" })
  expect(slim.text.length).toBeLessThan(full.text.length / 4)
})

test("slim keeps what an errored run shows, and the project is resolved server-side when none is passed", async () => {
  const { body } = await get(`?slim=1`)
  expect(body.projectId).toBe(PROJ)
  const err = body.runs.find((r: any) => r.id === `run_${ts}_err`)
  expect(err.status).toBe("error")
  expect(err.errorMsg).toBe("Page timed out")
  expect(err.issueCount).toBe(0)
})

test("the full run is still available on demand for the detail pane", async () => {
  const r = await fetch(`${BASE}/api/sims/runs/run_${ts}_1`, { headers: { Cookie: `klav_session=${SID}` } })
  expect(r.status).toBe(200)
  const { run } = await r.json() as any
  expect(run.reactions.length).toBe(3)
  expect(run.reactions[0].observations.length).toBe(6)
})
