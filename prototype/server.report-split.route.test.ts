// server.report-split.route.test.ts
// KD-995 — split ONE "Record me" walkthrough into separate tickets:
//   * POST /api/report/split transcribes the clip (Deepgram stand-in via KLAV_DEEPGRAM_ENDPOINT) and asks the
//     LLM (OpenRouter stand-in via OPENROUTER_ENDPOINT) for every distinct issue → { issues, transcript }.
//   * The transcript is fenced as untrusted data in the prompt.
//   * report_clarity = 0 → 403 (no STT/LLM spend); unknown project → 404; missing project/audio → 400.
//   * An empty transcript returns { issues: [] } WITHOUT an LLM call.
//   * The route is CORS-gated like the other composer endpoints.

import { afterAll, beforeAll, expect, test } from "bun:test"
import * as net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-split-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(61)).toString("base64")
const PORT = await freePort()
const LLM_PORT = await freePort()
const DG_PORT = await freePort()
const BASE = `http://localhost:${PORT}`

const ACCT = `acct_split_${RUN}`
const PROJ = `proj_split_${RUN}`
const PROJ_OFF = `proj_splitoff_${RUN}`
const ADMIN = `split-admin-${RUN}@test.local`

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

const SPOKEN = "First the save button stays disabled. Second, I would love a dark mode."
let dgCalls = 0
let dgTranscript = SPOKEN
const dg = Bun.serve({
  port: DG_PORT,
  async fetch(req) {
    dgCalls++
    await req.arrayBuffer().catch(() => null)
    return Response.json({ metadata: { duration: 20 }, results: { channels: [{ alternatives: [{ transcript: dgTranscript }] }] } })
  },
})

const ISSUES = {
  issues: [
    { title: "Save button stays disabled after editing", description: "Save never enables.", kind: "bug", startSec: 0, endSec: 8 },
    { title: "Add a dark mode", description: "Reporter asks for a dark theme.", kind: "feature", startSec: 8, endSec: 20 },
  ],
}
let llmCalls = 0
let lastLlmBody: any = null
const llm = Bun.serve({
  port: LLM_PORT,
  async fetch(req) {
    llmCalls++
    try { lastLlmBody = await req.json() } catch { lastLlmBody = null }
    return Response.json({ choices: [{ message: { content: JSON.stringify(ISSUES) } }], usage: { prompt_tokens: 100, completion_tokens: 80, cost: 0.0004 } })
  },
})
function lastUserText(): string {
  const msgs = Array.isArray(lastLlmBody?.messages) ? lastLlmBody.messages : []
  const user = msgs.find((m: any) => m?.role === "user")
  return typeof user?.content === "string" ? user.content : ""
}

function postSplit(fields: Record<string, string | Blob | null>, origin?: string) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) if (v != null) fd.append(k, v as any)
  return fetch(`${BASE}/api/report/split`, { method: "POST", body: fd, headers: origin ? { origin } : {} })
}
const clip = () => new Blob([new Uint8Array(2048).fill(7)], { type: "video/webm" })

let appProc: ReturnType<typeof Bun.spawn>
beforeAll(async () => {
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_ENDPOINT: `http://localhost:${LLM_PORT}/v1/chat/completions`,
      DEEPGRAM_API_KEY: "dg-test-key",
      KLAV_DEEPGRAM_ENDPOINT: `http://localhost:${DG_PORT}/v1/listen`,
    },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  const now = Date.now()
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [ADMIN, now])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Split Test", ADMIN, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, ADMIN, "owner", now])
  for (const [id, name] of [[PROJ, "Split"], [PROJ_OFF, "Split Off"]]) {
    await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, ACCT, name, "active", "auto", 200, "named", now, now])
  }
  await exec("UPDATE projects SET report_clarity = 0 WHERE id = ?", [PROJ_OFF])
})

afterAll(() => { appProc?.kill(); llm.stop(true); dg.stop(true); raw.close(); rmDb() })

test("transcribes the clip and returns one issue per narrated problem; transcript is fenced untrusted", async () => {
  dgCalls = 0; llmCalls = 0; dgTranscript = SPOKEN
  const r = await postSplit({ projectId: PROJ, audio: clip(), pageUrl: "https://app.example.com/profile" })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.transcript).toBe(SPOKEN)
  expect(body.issues).toHaveLength(2)
  expect(body.issues[0]).toMatchObject({ title: ISSUES.issues[0].title, kind: "bug" })
  expect(body.issues[1].kind).toBe("feature")
  expect(dgCalls).toBe(1)
  expect(llmCalls).toBe(1)
  const prompt = lastUserText()
  const open = prompt.indexOf("<untrusted_data>", prompt.indexOf("VIDEO WALKTHROUGH TRANSCRIPT"))
  expect(open).toBeGreaterThan(-1)
  expect(prompt.slice(open, prompt.indexOf("</untrusted_data>", open))).toContain("save button stays disabled")
})

test("an empty transcript returns no issues without an LLM call", async () => {
  llmCalls = 0; dgTranscript = ""
  const r = await postSplit({ projectId: PROJ, audio: clip() })
  expect(r.status).toBe(200)
  expect((await r.json()).issues).toEqual([])
  expect(llmCalls).toBe(0)
  dgTranscript = SPOKEN
})

test("report_clarity off → 403 without any STT/LLM spend", async () => {
  dgCalls = 0; llmCalls = 0
  const r = await postSplit({ projectId: PROJ_OFF, audio: clip() })
  expect(r.status).toBe(403)
  expect(dgCalls).toBe(0)
  expect(llmCalls).toBe(0)
})

test("validation: missing project → 400, unknown project → 404, missing audio → 400", async () => {
  expect((await postSplit({ audio: clip() })).status).toBe(400)
  expect((await postSplit({ projectId: "proj_nope", audio: clip() })).status).toBe(404)
  expect((await postSplit({ projectId: PROJ })).status).toBe(400)
})

test("CORS: the response reflects the widget origin", async () => {
  const r = await postSplit({ projectId: PROJ, audio: clip() }, "https://customer.example.com")
  expect(r.headers.get("access-control-allow-origin")).toBe("https://customer.example.com")
})
