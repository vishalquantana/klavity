// server.report-clarity.route.test.ts
// Report-clarity helper backend (the "password-strength, for bug reports"):
//   * GET  /api/projects/:id/config exposes the per-project reportClarity flag (DEFAULT on).
//   * POST /api/report/clarity returns the heuristic { score, coverage, level } PLUS a single cheap-LLM
//     `tip` (the LLM is MOCKED via a local OpenRouter stand-in pointed at by OPENROUTER_ENDPOINT).
//   * A Great report spends NO LLM call (tip stays null) — the heuristic gate mirrors the client.
//   * A project with report_clarity = 0 is walled with 403 (never spends an AI call).

import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-clarity-cfg-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(57)).toString("base64")
const PORT = 46100 + Math.floor(Math.random() * 200)
const LLM_PORT = PORT + 1
const BASE = `http://localhost:${PORT}`

const ACCT = `acct_clr_${RUN}`
const PROJ = `proj_clr_${RUN}`
const PROJ_OFF = `proj_clroff_${RUN}`
const PROJ_CAP = `proj_clrcap_${RUN}`   // PX4 #476: dedicated project to exercise the per-project daily cap
const ADMIN = `clr-admin-${RUN}@test.local`
// PX4 #476: small per-project daily clarity cap so the test can exhaust it in a few calls.
const CLARITY_CAP = 3

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

let appProc: ReturnType<typeof Bun.spawn>
// A tiny OpenRouter stand-in: records how many times it was called and returns a fixed JSON tip in the
// OpenRouter chat-completions shape ({ choices:[{message:{content}}], usage }).
let llmCalls = 0
let lastLlmBody: any = null   // KLAVITYKLA-492: capture the last prompt so tests can assert its instructions
const llm = Bun.serve({
  port: LLM_PORT,
  async fetch(req) {
    llmCalls++
    try { lastLlmBody = await req.json() } catch { lastLlmBody = null }
    return Response.json({
      choices: [{ message: { content: JSON.stringify({ tip: "'Not working' is hard to act on - what did you expect instead?" }) } }],
      usage: { prompt_tokens: 42, completion_tokens: 12, cost: 0.0001 },
    })
  },
})
function lastSystemPrompt(): string {
  const msgs = (lastLlmBody && Array.isArray(lastLlmBody.messages)) ? lastLlmBody.messages : []
  return msgs.filter((m: any) => m?.role === "system").map((m: any) => String(m?.content || "")).join("\n")
}

async function seed() {
  const now = Date.now()
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [ADMIN, now])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Clarity Test", ADMIN, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, ADMIN, "owner", now])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Clarity Project", "active", "auto", 200, "named", now, now])
  // Second project with the helper explicitly disabled (report_clarity = 0).
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ_OFF, ACCT, "Clarity Off Project", "active", "auto", 200, "named", now, now])
  await exec("UPDATE projects SET report_clarity = 0 WHERE id = ?", [PROJ_OFF])
  // Third project for the per-project daily-cap test (helper on, default).
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ_CAP, ACCT, "Clarity Cap Project", "active", "auto", 200, "named", now, now])
}

function postClarity(body: any, xff?: string) {
  return fetch(`${BASE}/api/report/clarity`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(xff ? { "x-forwarded-for": xff } : {}) },
    body: JSON.stringify(body),
  })
}

beforeAll(async () => {
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
      // Mock the LLM: real key + endpoint pointed at our local stand-in.
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_ENDPOINT: `http://localhost:${LLM_PORT}/v1/chat/completions`,
      // PX4 #476: tiny per-project daily clarity cap so the cap test can exhaust it.
      KLAV_CLARITY_PROJECT_DAILY: String(CLARITY_CAP),
    },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  await seed()
})

afterAll(() => { appProc?.kill(); llm.stop(true); raw.close(); rmDb() })

test("GET /config exposes reportClarity:true by default", async () => {
  const r = await fetch(`${BASE}/api/projects/${PROJ}/config`)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.reportClarity).toBe(true)
})

test("POST /api/report/clarity returns heuristic coverage + a mocked LLM tip for a vague report", async () => {
  llmCalls = 0
  const r = await postClarity({ projectId: PROJ, text: "the coupon code is not working on my mobile cart" })
  expect(r.status).toBe(200)
  const body = await r.json()
  // Heuristic contract
  expect(typeof body.score).toBe("number")
  expect(body.coverage).toHaveProperty("problem")
  expect(body.coverage).toHaveProperty("expected")
  expect(body.coverage).toHaveProperty("repro")
  expect(["needs", "good", "great"]).toContain(body.level)
  // Mocked LLM tip
  expect(body.tip).toContain("hard to act on")
  expect(llmCalls).toBe(1)
})

test("KLAVITYKLA-492: forwards the already-captured context and tells the coach to NEVER ask for it", async () => {
  llmCalls = 0
  lastLlmBody = null
  const r = await postClarity({
    projectId: PROJ,
    text: "the coupon code is not working on my mobile cart",
    pageUrl: "https://shop.example.com/cart",
    images: 2,
    client: { browser: "Chrome", browserVersion: "141", os: "macOS", screen: "2560x1440", viewport: "1280x800", deviceType: "desktop" },
  })
  expect(r.status).toBe(200)
  expect(llmCalls).toBe(1)
  const sys = lastSystemPrompt()
  // The instruction must forbid asking for anything Klavity already captures.
  expect(sys).toContain("NEVER ask the reporter for the URL")
  expect(sys.toLowerCase()).toContain("screenshot")
  expect(sys.toLowerCase()).toContain("browser")
  // The forwarded context is summarised into the prompt so the model knows exactly what's already present.
  expect(sys).toContain("https://shop.example.com/cart")
  expect(sys).toContain("2 screenshots")
  expect(sys).toContain("Chrome")
  expect(sys).toContain("2560x1440")
})

test("a Great report spends NO LLM call (tip null) — heuristic gate mirrors the client", async () => {
  llmCalls = 0
  const great = "On /checkout I enter SAVE10 and tap Apply. Nothing happens. I expected the total to drop 10%."
  const r = await postClarity({ projectId: PROJ, text: great })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.level).toBe("great")
  expect(body.tip).toBeNull()
  expect(llmCalls).toBe(0)
})

test("a project with report_clarity disabled is walled with 403 and spends no AI call", async () => {
  llmCalls = 0
  const r = await postClarity({ projectId: PROJ_OFF, text: "the coupon code is not working on my mobile cart" })
  expect(r.status).toBe(403)
  expect(llmCalls).toBe(0)
})

// PX4 #476: a project over its per-project daily clarity cap is rejected WITHOUT an LLM call, and a
// forged/rotated X-Forwarded-For does not buy a fresh budget (the cap is keyed on projectId, not IP).
test("a project over its daily clarity cap is rejected (no LLM call); forged XFF can't bypass", async () => {
  llmCalls = 0
  const vague = "the coupon code is not working on my mobile cart"
  // Exhaust the cap with CLARITY_CAP vague reports, each from a DIFFERENT forged client IP.
  for (let i = 0; i < CLARITY_CAP; i++) {
    const r = await postClarity({ projectId: PROJ_CAP, text: vague }, `203.0.113.${i + 1}`)
    expect(r.status).toBe(200)
  }
  expect(llmCalls).toBe(CLARITY_CAP)

  // One more from YET ANOTHER forged IP: the per-project cap still blocks it, and no LLM call is made.
  const over = await postClarity({ projectId: PROJ_CAP, text: vague }, "198.51.100.77")
  expect(over.status).toBe(429)
  const body = await over.json()
  // Heuristic still rides the 429 body so the composer meter never breaks.
  expect(typeof body.score).toBe("number")
  expect(body.tip).toBeNull()
  // Crucially: the over-cap request did NOT spend an LLM call.
  expect(llmCalls).toBe(CLARITY_CAP)
})

test("an unknown project returns 404", async () => {
  const r = await postClarity({ projectId: "proj_does_not_exist", text: "not working at all here" })
  expect(r.status).toBe(404)
})

test("a missing projectId returns 400", async () => {
  const r = await postClarity({ text: "not working" })
  expect(r.status).toBe(400)
})
