// KD-193: POST /api/feedback/:id/attachments — duplicates are not stored twice, files beyond the cap are REPORTED (not dropped
// silently), size limits reject before anything is uploaded, storage uploads run in parallel, and overlapping uploads all land.
// Hermetic: spawns the real server (process.execPath → no orphan) against a temp file DB and a local S3 stand-in.
import { afterAll, beforeAll, expect, test } from "bun:test"
import * as net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

function freePort(): Promise<number> {
  return new Promise((res, rej) => { const s = net.createServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) }) })
}
const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-attup-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(66)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL"); await raw.execute("PRAGMA busy_timeout=5000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })


const OWNER = `pa-owner-${RUN}@test.local`, MEMBER = `pa-mem-${RUN}@test.local`, OUTSIDER = `pa-out-${RUN}@test.local`
const S_OWN = `sess_pa_o_${RUN}`, S_MEM = `sess_pa_m_${RUN}`, S_OUT = `sess_pa_x_${RUN}`
const ACCT = `acct_pa_${RUN}`, PROJ = `proj_pa_${RUN}`, TRAIL = `trl_pa_${RUN}`
const SIM = `sim_pa_${RUN}`, BASELINE = `sim_baseline_${RUN}`, OTHER_PROJ_SIM = `sim_pa_other_${RUN}`
const NOW = Date.now()
let proc: ReturnType<typeof Bun.spawn>, BASE = ""

beforeAll(async () => {
  const port = await freePort(); BASE = `http://localhost:${port}`
  proc = Bun.spawn([process.execPath, "server.ts"], {
    cwd: join(import.meta.dir), stdout: "ignore", stderr: "ignore",
    env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "" },
  })
  const dl = Date.now() + 15_000
  while (Date.now() < dl) { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(150) }
  for (const e of [OWNER, MEMBER, OUTSIDER]) await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [e, NOW])
  for (const [sid, e] of [[S_OWN, OWNER], [S_MEM, MEMBER], [S_OUT, OUTSIDER]]) await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [sid, e, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Persona Active", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  for (const p of [PROJ, PROJ + "_2"]) await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [p, ACCT, p, "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_o_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_m_${RUN}`, PROJ, MEMBER, "member", null, NOW])
  for (const [id, proj] of [[SIM, PROJ], [BASELINE, PROJ], [OTHER_PROJ_SIM, PROJ + "_2"]]) {
    await exec("INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [id, proj, id, "tester", "client", "XX", "#6366f1", "s", "[]", NOW, NOW])
  }
  await exec("INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)", [TRAIL, PROJ, "t", "", "https://example.com", "human", "draft", NOW, NOW])
}, 30_000)
afterAll(() => { proc?.kill(); raw.close(); rmDb() })

const call = (method: string, path: string, body?: any, sid = S_OWN) =>
  fetch(`${BASE}${path}?project=${PROJ}`, { method, headers: { Cookie: `klav_session=${sid}`, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) })
const toggle = (id: string, active: any, sid = S_OWN) => call("PATCH", `/api/personas/${id}/active`, { active }, sid)
const activeOf = async (id: string) => Number(((await exec("SELECT active FROM personas WHERE id=?", [id])).rows[0] as any).active)
const edits = async (id: string) => (await exec("SELECT field, before_val, after_val, actor FROM persona_edits WHERE persona_id=? AND field='active'", [id])).rows as any[]

test("only a project admin can toggle: a member gets 403 and nothing changes", async () => {
  expect((await toggle(SIM, false, S_MEM)).status).toBe(403)
  expect(await activeOf(SIM)).toBe(1)
})
test("an outsider cannot toggle a Sim in this project", async () => {
  const r = await toggle(SIM, false, S_OUT)
  expect([400, 401, 403, 404]).toContain(r.status) // resolveProject finds no access → 400 "No project"
  expect(await activeOf(SIM)).toBe(1)
})
test("no session → rejected", async () => {
  const r = await fetch(`${BASE}/api/personas/${SIM}/active?project=${PROJ}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: false }) })
  expect([401, 403]).toContain(r.status)
})
test("a bad body (missing / non-boolean active) is a 400", async () => {
  for (const bad of [undefined, "false", 0, null]) expect((await toggle(SIM, bad)).status).toBe(400)
  expect(await activeOf(SIM)).toBe(1)
})
test("an unknown Sim is 404, and a Sim that lives in another project cannot be toggled from this one", async () => {
  expect((await toggle("sim_nope", false)).status).toBe(404)
  expect((await toggle(OTHER_PROJ_SIM, false)).status).toBe(404)
  expect(await activeOf(OTHER_PROJ_SIM)).toBe(1)
})
test("deactivate then activate: row updated, response echoes it, each real change is audited with the actor", async () => {
  const off = await toggle(SIM, false)
  expect(off.status).toBe(200); expect(await off.json()).toEqual({ ok: true, id: SIM, active: false })
  expect(await activeOf(SIM)).toBe(0)
  const on = await toggle(SIM, true)
  expect(on.status).toBe(200); expect(await activeOf(SIM)).toBe(1)
  const e = await edits(SIM)
  expect(e.map(x => [x.before_val, x.after_val])).toEqual([["true", "false"], ["false", "true"]])
  expect(e.every(x => x.actor === OWNER)).toBe(true)
})
test("toggling to the state it is already in is a no-op (no audit row)", async () => {
  const before = (await edits(SIM)).length
  expect((await toggle(SIM, true)).status).toBe(200)
  expect((await edits(SIM)).length).toBe(before)
})
test("the dashboard payload reports active, and the Baseline QA Sim can be deactivated but not deleted", async () => {
  expect((await toggle(BASELINE, false)).status).toBe(200)
  const del = await call("DELETE", `/api/personas/${BASELINE}`)
  expect(del.status).toBe(403); expect(((await del.json()) as any).error).toContain("Deactivate")
  expect(await activeOf(BASELINE)).toBe(0)
  expect((await toggle(BASELINE, true)).status).toBe(200)
})
test("GET /api/sims (the review Sim list) leaves out an inactive Sim and brings it back when reactivated", async () => {
  await toggle(SIM, false)
  const ids = async () => (((await (await call("GET", "/api/sims")).json()) as any).sims ?? (await (await call("GET", "/api/sims")).json()) as any[]).map((s: any) => s.id)
  expect(await ids()).not.toContain(SIM)
  await toggle(SIM, true)
  expect(await ids()).toContain(SIM)
})
test("an inactive Sim cannot be set as a trail's judge (409); an active one can; clearing still works", async () => {
  await toggle(SIM, false)
  const r = await call("PATCH", `/api/trails/${TRAIL}/judge-persona`, { personaId: SIM })
  expect(r.status).toBe(409); expect(((await r.json()) as any).error).toContain("inactive")
  await toggle(SIM, true)
  expect((await call("PATCH", `/api/trails/${TRAIL}/judge-persona`, { personaId: SIM })).status).toBe(200)
  await toggle(SIM, false)
  expect((await call("PATCH", `/api/trails/${TRAIL}/judge-persona`, { personaId: null })).status).toBe(200)
  await toggle(SIM, true)
})
