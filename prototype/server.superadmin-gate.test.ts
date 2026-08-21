// KLAVITYKLA-486 — end-to-end: the superadmin P&L is OPS_ADMIN_EMAILS-gated (API 403 for non-ops,
// page 404), and the /api/extract + /api/react attribution fixes now write project_id to ai_calls.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB = join(tmpdir(), `klav-sa-gate-${RUN}.db`)
const OPS_EMAIL = `vishal@quantana.com.au`          // ops admin (device test email)
const PLAIN_EMAIL = `plain-${RUN}@test.local`
const SECRET = Buffer.from(new Uint8Array(32).fill(73)).toString("base64")
const PORT = 45300 + Math.floor(Math.random() * 300)
const BASE = `http://localhost:${PORT}`

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB })
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }
async function query(sql: string, args: any[] = []) { return (await raw.execute({ sql, args })).rows }

let srv: ReturnType<typeof Bun.spawn>

async function loginTestOtp(email: string): Promise<string> {
  const r = await fetch(BASE + "/api/auth/verify", {
    method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({ email, code: "666666" }),
  })
  expect(r.status).toBe(200)
  return (r.headers.get("set-cookie") || "").split(";")[0]
}

beforeAll(async () => {
  srv = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local,quantana.com.au",
      KLAV_TEST_OTP: "1",
      KLAV_TEST_OTP_EMAILS: `${OPS_EMAIL},${PLAIN_EMAIL}`,
      OPS_ADMIN_EMAILS: OPS_EMAIL,
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key", // real network call will 401 → recordAiCall failure path (still tags project_id)
    },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try { if ((await fetch(BASE + "/api/health")).ok) break } catch {}
    await Bun.sleep(200)
  }
  // Seed a paid workspace + a converting lead for a non-trivial P&L.
  const NOW = Date.now()
  const AID = `acct_${RUN}`, PID = `proj_${AID}`
  await exec("INSERT INTO accounts (id,name,owner_email,plan,billing_interval,billing_status,created_at) VALUES (?,?,?,?,?,?,?)",
    [AID, "Gate Co", OPS_EMAIL, "team", "month", "active", NOW])
  await exec("INSERT INTO projects (id,account_id,name,created_at,updated_at) VALUES (?,?,?,?,?)", [PID, AID, "Gate Co", NOW, NOW])
  await exec("INSERT INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)", [`am_${RUN}`, AID, OPS_EMAIL, "owner", NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OPS_EMAIL, NOW])
  await exec("INSERT INTO ai_calls (id,created_at,type,model,account_id,project_id,cost_usd,ok) VALUES (?,?,?,?,?,?,?,1)",
    [`ai_${RUN}`, NOW, "react", "m", AID, PID, 0.25])
  await exec("INSERT INTO funnel_events (id,event,email,created_at) VALUES (?,?,?,?)", [`fe_${RUN}`, "lead_captured", OPS_EMAIL, NOW])
  await exec("INSERT INTO ai_calls (id,created_at,type,model,project_id,cost_usd,ok) VALUES (?,?,?,?,?,?,1)",
    [`aimk_${RUN}`, NOW, "cro-analyze", "m", "proj_marketing_presignup", 0.30])
}, 30_000)

afterAll(() => { try { srv?.kill() } catch {} ; raw.close(); rmDb() })

test("non-ops gets 403 from the P&L API and 404 from the page", async () => {
  const plain = await loginTestOtp(PLAIN_EMAIL)
  const api = await fetch(BASE + "/api/superadmin/pl", { headers: { cookie: plain } })
  expect(api.status).toBe(403)
  const page = await fetch(BASE + "/superadmin", { headers: { cookie: plain } })
  expect(page.status).toBe(404)
}, 20_000)

test("an unauthenticated caller is rejected too", async () => {
  const api = await fetch(BASE + "/api/superadmin/pl")
  expect(api.status).toBe(403)
})

test("ops admin sees the P&L (200) with correct MRR / COGS / CAC", async () => {
  const ops = await loginTestOtp(OPS_EMAIL)
  const res = await fetch(BASE + "/api/superadmin/pl", { headers: { cookie: ops } })
  expect(res.status).toBe(200)
  const pl = await res.json()
  expect(pl.summary.mrr).toBe(249)                 // Team monthly
  expect(pl.summary.cogs).toBeGreaterThanOrEqual(0.25)
  const ws = pl.workspaces.find((w: any) => w.owner === OPS_EMAIL)
  expect(ws).toBeTruthy()
  expect(ws.margin).toBeCloseTo(ws.mrr - ws.totalCogs, 6)
  expect(pl.cac.convertedSignups).toBe(1)
  expect(pl.cac.freeToolSpendAllTime).toBeCloseTo(0.30, 6)
  expect(pl.cac.cac).toBeCloseTo(0.30, 6)

  // Page renders for ops.
  const page = await fetch(BASE + "/superadmin", { headers: { cookie: ops } })
  expect(page.status).toBe(200)
  expect(await page.text()).toContain("Per-Workspace P&amp;L")
}, 20_000)

test("/api/extract attributes ai_calls to the caller's project", async () => {
  const ops = await loginTestOtp(OPS_EMAIL)
  const PID = `proj_acct_${RUN}`
  await fetch(BASE + `/api/extract?project=${PID}`, {
    method: "POST", headers: { cookie: ops, "content-type": "application/json" },
    body: JSON.stringify({ transcript: "Customer: this is a long enough transcript to pass the min length gate for extraction." }),
  })
  // The LLM call fails (test key) → recordAiCall failure path still writes project_id. Poll for it.
  let rows: any[] = []
  for (let i = 0; i < 40; i++) {
    rows = await query("SELECT project_id FROM ai_calls WHERE type='extract' AND project_id=?", [PID])
    if (rows.length) break
    await Bun.sleep(100)
  }
  expect(rows.length).toBeGreaterThan(0)
  expect(String(rows[0].project_id)).toBe(PID)
}, 20_000)

test("/api/react attributes ai_calls to the caller's project", async () => {
  const ops = await loginTestOtp(OPS_EMAIL)
  const PID = `proj_acct_${RUN}`
  await fetch(BASE + `/api/react?project=${PID}`, {
    method: "POST", headers: { cookie: ops, "content-type": "application/json" },
    body: JSON.stringify({ persona: { id: "ephemeral" }, imageB64: "iVBORw0KGgo=", mediaType: "image/png", pageUrl: "https://example.test/" }),
  })
  let rows: any[] = []
  for (let i = 0; i < 40; i++) {
    rows = await query("SELECT project_id FROM ai_calls WHERE type='react' AND project_id=? AND created_at > ?", [PID, 0])
    if (rows.length >= 1) break
    await Bun.sleep(100)
  }
  expect(rows.some((r) => String(r.project_id) === PID)).toBe(true)
}, 20_000)
