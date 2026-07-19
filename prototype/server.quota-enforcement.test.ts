// KLA-306/307: flag-gated free-plan quota enforcement at the two creation choke points
// (POST /api/projects, POST /api/personas). The flag is a server-process env var
// (KLAV_BILLING_ENFORCEMENT=1), so this file spawns TWO app servers over the SAME database —
// one with enforcement ON, one with it OFF (the prod default) — the env save/restore analogue
// for a subprocess-driven test. Order matters: the 402 assertions run first, the flag-off
// success assertions run last (they actually create rows).
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-quota-${RUN}.db`)
const NOW = Date.now()

const FREE_OWNER = `quota-free-${RUN}@test.local`
const FREE_SID = `sess_quota_free_${RUN}`
const FREE_ACCOUNT = `acct_quota_free_${RUN}`
const FREE_PROJECT = `proj_quota_free_${RUN}`

const PRO_OWNER = `quota-pro-${RUN}@test.local`
const PRO_SID = `sess_quota_pro_${RUN}`
const PRO_ACCOUNT = `acct_quota_pro_${RUN}`
const PRO_PROJECT = `proj_quota_pro_${RUN}`

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

let enfProc: ReturnType<typeof Bun.spawn>
let offProc: ReturnType<typeof Bun.spawn>
let ENF_BASE = ""
let OFF_BASE = ""

function spawnApp(port: number, enforcement: boolean) {
  return Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(83)).toString("base64"),
      KLAV_BASE_URL: `http://localhost:${port}`,
      KLAV_ALLOWED_DOMAINS: "test.local",
      ...(enforcement ? { KLAV_BILLING_ENFORCEMENT: "1" } : { KLAV_BILLING_ENFORCEMENT: "" }),
    },
    stdout: "ignore",
    stderr: "ignore",
  })
}

async function waitUp(base: string) {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${base}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) return
    await Bun.sleep(150)
  }
  throw new Error(`server at ${base} did not come up`)
}

beforeAll(async () => {
  // OS-assigned free ports (NOT a hardcoded random range): this shared workspace often has
  // orphaned/parallel-agent `bun server.ts` processes listening in the 47xxx range, and a
  // collision makes waitUp() greet a FOREIGN server over a different DB → every request 401s.
  // Hold both probe sockets open simultaneously so the second can't be handed the first's port.
  const probeA = Bun.serve({ port: 0, fetch: () => new Response("") })
  const probeB = Bun.serve({ port: 0, fetch: () => new Response("") })
  const enfPort = probeA.port
  const offPort = probeB.port
  probeA.stop(true)
  probeB.stop(true)
  ENF_BASE = `http://localhost:${enfPort}`
  OFF_BASE = `http://localhost:${offPort}`
  enfProc = spawnApp(enfPort, true)
  await waitUp(ENF_BASE) // first process owns migrations; start the second only once schema exists
  offProc = spawnApp(offPort, false)
  await waitUp(OFF_BASE)

  // FREE account: 1 project + 1 Sim — exactly AT the free quotas (projects:1, sims:1).
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [FREE_OWNER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [FREE_SID, FREE_OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [FREE_ACCOUNT, "Quota Free", FREE_OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_free_${RUN}`, FREE_ACCOUNT, FREE_OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", [FREE_PROJECT, FREE_ACCOUNT, "Free Project", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_free_${RUN}`, FREE_PROJECT, FREE_OWNER, "admin", null, NOW])
  await exec(
    "INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [`sim_free_${RUN}`, FREE_PROJECT, "Existing Sim", "QA", "client", "ES", "violet", "seeded", "[]", NOW, NOW],
  )

  // PRO account: 1 project + 1 Sim — well UNDER the pro quotas (projects:5, sims:5).
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [PRO_OWNER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [PRO_SID, PRO_OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [PRO_ACCOUNT, "Quota Pro", PRO_OWNER, NOW])
  await exec("UPDATE accounts SET plan='pro' WHERE id=?", [PRO_ACCOUNT])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_pro_${RUN}`, PRO_ACCOUNT, PRO_OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", [PRO_PROJECT, PRO_ACCOUNT, "Pro Project", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_pro_${RUN}`, PRO_PROJECT, PRO_OWNER, "admin", null, NOW])
  await exec(
    "INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [`sim_pro_${RUN}`, PRO_PROJECT, "Pro Sim", "QA", "client", "PS", "violet", "seeded", "[]", NOW, NOW],
  )
})

afterAll(() => {
  enfProc?.kill()
  offProc?.kill()
  raw.close()
  rmDb()
})

function authed(base: string, sid: string, path: string, init: RequestInit = {}) {
  return fetch(`${base}${path}`, { ...init, headers: { cookie: `klav_session=${sid}`, ...(init.headers || {}) } })
}

function postJson(base: string, sid: string, path: string, body: unknown) {
  return authed(base, sid, path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
}

// ── Enforcement ON ──────────────────────────────────────────────────────────────────────────────

test("flag on: free account at project quota gets 402 quota_exceeded from POST /api/projects", async () => {
  const r = await postJson(ENF_BASE, FREE_SID, "/api/projects", { name: "Second Project" })
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("quota_exceeded")
  expect(body.upgradeUrl).toBe("/dashboard?upgrade=pro")
  expect(String(body.error)).toContain("free")
})

test("flag on: free account at Sim quota gets 402 quota_exceeded from POST /api/personas", async () => {
  const r = await postJson(ENF_BASE, FREE_SID, `/api/personas?project=${FREE_PROJECT}`, { name: "Second Sim", role: "Buyer" })
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("quota_exceeded")
  expect(body.upgradeUrl).toBe("/dashboard?upgrade=pro")
  expect(String(body.error)).toContain("free")
  // Nothing was created.
  const sims = await raw.execute({ sql: "SELECT COUNT(*) AS n FROM personas WHERE project_id=?", args: [FREE_PROJECT] })
  expect(Number((sims.rows[0] as any).n)).toBe(1)
})

test("flag on: the dedup guard still returns an existing Sim (200, not 402)", async () => {
  // Same normalized name+role as the seeded Sim — must short-circuit BEFORE the quota check.
  const r = await postJson(ENF_BASE, FREE_SID, `/api/personas?project=${FREE_PROJECT}`, { name: "existing sim", role: "qa" })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.existing).toBe(true)
})

test("flag on: pro account under quota can create a project and a Sim", async () => {
  const p = await postJson(ENF_BASE, PRO_SID, "/api/projects", { name: "Pro Second Project" })
  expect(p.status).toBe(201)

  const s = await postJson(ENF_BASE, PRO_SID, `/api/personas?project=${PRO_PROJECT}`, { name: "Pro Second Sim", role: "Buyer" })
  expect(s.status).toBe(201)
})

// ── Enforcement OFF (prod default) — the exact same free-account creations succeed ─────────────

test("flag off: free account at quota can still create a project (default behavior unchanged)", async () => {
  const r = await postJson(OFF_BASE, FREE_SID, "/api/projects", { name: "Second Project" })
  expect(r.status).toBe(201)
})

test("flag off: free account at quota can still create a Sim (default behavior unchanged)", async () => {
  const r = await postJson(OFF_BASE, FREE_SID, `/api/personas?project=${FREE_PROJECT}`, { name: "Second Sim", role: "Buyer" })
  expect(r.status).toBe(201)
})
