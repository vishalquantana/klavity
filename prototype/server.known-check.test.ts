// KLAVITYKLA-241 (JTBD A.11): route-level test for POST /api/widget/known-check — the pre-submit
// "we already know about this" lookup the composer calls as the reporter types. Subprocess-against-
// temp-DB pattern (mirrors server.feedback-widget.test.ts): spawn the real server so IT owns the full
// schema, then raw-seed a project + a couple of known reports, hit the endpoint over HTTP, and assert
// match / no-match.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-known-route-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")
const PROJECT_ID = `proj_known_${ts}`
const NOW = Date.now()

const rawClient = createClient({ url: "file:" + srvDbFile })
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 38000 + Math.floor(Math.random() * 1000)
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
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  // Let the server own the full schema + migrations, then poll until ready.
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready yet */ }
    await Bun.sleep(150)
  }
  // Seed via the raw client AFTER boot so the recurrence columns exist. WAL + busy_timeout so the
  // rawClient and the server can share the file without SQLITE_BUSY.
  await rawClient.execute("PRAGMA journal_mode=WAL")
  await rawClient.execute("PRAGMA busy_timeout=5000")
  await rawExec(`INSERT OR IGNORE INTO accounts (id, name, owner_email, created_at) VALUES (?,?,?,?)`, ["acct_known", "Known", "owner@test.local", NOW])
  await rawExec(`INSERT OR IGNORE INTO projects (id, account_id, name, created_at, updated_at) VALUES (?,?,?,?,?)`, [PROJECT_ID, "acct_known", "Known Project", NOW, NOW])
  await rawExec(`INSERT INTO feedback (id, project_id, observation, status, recurrence_count, created_at) VALUES (?,?,?,?,?,?)`,
    [`fb_ck1_${ts}`, PROJECT_ID, "The checkout button does nothing when I click it on the cart page.", "in_progress", 1, NOW])
  await rawExec(`INSERT INTO feedback (id, project_id, observation, status, recurrence_count, created_at) VALUES (?,?,?,?,?,?)`,
    [`fb_ck2_${ts}`, PROJECT_ID, "The sidebar navigation overlaps the footer on small mobile screens.", "open", 1, NOW])
}, 25_000)

afterAll(() => { serverProc?.kill(); rawClient.close() })

async function check(text: string) {
  const r = await fetch(`${BASE}/api/widget/known-check`, {
    method: "POST",
    headers: { "content-type": "application/json", Origin: "https://customer.example" },
    body: JSON.stringify({ project: PROJECT_ID, text, url: "https://customer.example/cart" }),
  })
  return { status: r.status, cors: r.headers.get("access-control-allow-origin"), body: await r.json() }
}

test("MATCH: composer prose matching a known report returns the acknowledgment", async () => {
  const { status, cors, body } = await check("checkout button does nothing when clicked on the cart page")
  expect(status).toBe(200)
  expect(cors).toBe("*")                 // readable cross-origin from the embedded widget
  expect(body.match).toBeTruthy()
  expect(body.match.feedbackId).toBe(`fb_ck1_${ts}`)
  expect(body.match.statusLabel).toBe("in progress")
})

test("NO MATCH: unrelated prose returns match: null (no false nag)", async () => {
  const { status, body } = await check("the payment receipt email never arrives after a purchase")
  expect(status).toBe(200)
  expect(body.match).toBeNull()
})

test("VALIDATION: missing project id is rejected", async () => {
  const r = await fetch(`${BASE}/api/widget/known-check`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "anything at all here" }),
  })
  expect(r.status).toBe(400)
})

test("SCOPE: an unknown project id 404s (no existence leak beyond the embed)", async () => {
  const r = await fetch(`${BASE}/api/widget/known-check`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ project: "proj_does_not_exist", text: "checkout button does nothing at all" }),
  })
  expect(r.status).toBe(404)
})
