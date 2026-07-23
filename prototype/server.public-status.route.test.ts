// KLAVITYKLA-214 (JTBD 1.3): route tests for the public, no-login report status page GET /r/:ref.
// Asserts:
//   (A) valid short ref ("fb_1a2b3c4d") → 200 and shows the correct status stage
//   (B) full "fb_<uuid>" ref also resolves → 200
//   (C) a deduped/merged ticket surfaces "N reports merged into this"
//   (D) a dismissed report renders "Reviewed" and never claims "Fixed"
//   (E) unknown ref → 404 (safe, no info leak)
//   (F) malformed ref → 404
//   (G) ANONYMOUS-SAFE: reporter email, contact email, internal notes, assignee are NEVER in output
//   (H) headers: noindex + no-store on both hit and miss

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-pubstatus-route-${ts}.db`)
const TEST_SECRET = Buffer.alloc(32, 7).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

process.env.KLAV_SECRET = TEST_SECRET
process.env.TURSO_DATABASE_URL = "file:" + srvDbFile
process.env.TURSO_AUTH_TOKEN = ""

const { reconnectDb, applySchema } = await import("./lib/db")
const _db = reconnectDb("file:" + srvDbFile)
await applySchema(_db)

// ── Fixtures: feedback rows with KNOWN ids so we can craft the /r/ ref ──
const PROJECT_ID = `proj_pubstatus_${ts}`
const SECRET_EMAIL = "reporter-secret@example.com"
const CONTACT_EMAIL = "contact-secret@example.com"
const SECRET_NOTE = "INTERNAL-TRIAGE-NOTE-do-not-leak"
const ASSIGNEE = "assignee-secret@example.com"

// Fixed uuids (8-4-4-4-12). Short ref = "fb_" + first 8 hex.
const ID_OPEN = "fb_1a2b3c4d-1111-2222-3333-444444444444" // short: fb_1a2b3c4d
const ID_FIXED = "fb_a1b2c3d4-5555-6666-7777-888888888888" // short: fb_a1b2c3d4 (done + 4 merged)
const ID_DISMISSED = "fb_deadbeef-9999-0000-1111-222222222222" // short: fb_deadbeef

async function seed(id: string, status: string, recurrence: number) {
  const now = Date.now()
  await rawClient.execute({
    sql: `INSERT INTO feedback (id,project_id,actor_email,url_host,url_path,observation,status,
          assignee,notes,contact_email,recurrence_count,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, PROJECT_ID, SECRET_EMAIL, "app.example.com", "/checkout",
           "Checkout button does nothing", status, ASSIGNEE, SECRET_NOTE, CONTACT_EMAIL, recurrence, now],
  })
}

await seed(ID_OPEN, "open", 1)
await seed(ID_FIXED, "done", 4)
await seed(ID_DISMISSED, "dismissed", 1)

// ── Spawn subprocess server against the same db file ──
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string

beforeAll(async () => {
  serverPort = 48000 + Math.floor(Math.random() * 1000)
  base = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: base,
      KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: undefined as any,
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base}/api/health`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

test("(A) valid short ref → 200 and shows the current status stage", async () => {
  const r = await fetch(`${base}/r/fb_1a2b3c4d`)
  expect(r.status).toBe(200)
  expect(r.headers.get("content-type")).toContain("text/html")
  const html = await r.text()
  // The ladder is present and the "open" row lands on the "Triaged" rung as current.
  expect(html).toContain("Received")
  expect(html).toContain("Triaged")
  expect(html).toContain("In progress")
  expect(html).toContain("Fixed")
  expect(html).toContain('class="step current"')
  // Shows the quotable ref and a submitted date.
  expect(html).toContain("fb_1a2b3c4d")
  expect(html).toContain("Submitted")
})

test("(B) full fb_<uuid> ref also resolves → 200", async () => {
  const r = await fetch(`${base}/r/${ID_OPEN}`)
  expect(r.status).toBe(200)
  const html = await r.text()
  expect(html).toContain("Received")
})

test("(C) deduped/merged ticket surfaces 'N reports merged into this'", async () => {
  const r = await fetch(`${base}/r/fb_a1b2c3d4`)
  expect(r.status).toBe(200)
  const html = await r.text()
  expect(html).toContain("4 reports merged into this")
  // "done" is the terminal Fixed stage → the Fixed rung is current.
  expect(html).toContain("Fixed")
})

test("(D) dismissed report renders 'Reviewed' and never claims Fixed as reached", async () => {
  const r = await fetch(`${base}/r/fb_deadbeef`)
  expect(r.status).toBe(200)
  const html = await r.text()
  expect(html).toContain("Reviewed")
  expect(html).toContain("reviewed and closed")
  // The dismissed rung must not be styled as the "current"/"done" Fixed stage.
  expect(html).toContain('class="step dismissed"')
})

test("(E) unknown but well-formed ref → 404 safe page", async () => {
  const r = await fetch(`${base}/r/fb_00000000`)
  expect(r.status).toBe(404)
  const html = await r.text()
  expect(html).toContain("Report not found")
  // No stack / internal error text.
  expect(html.toLowerCase()).not.toContain("error:")
  expect(html.toLowerCase()).not.toContain("stack")
})

test("(F) malformed ref → 404", async () => {
  const r = await fetch(`${base}/r/not-a-real-ref`)
  expect(r.status).toBe(404)
})

test("(G) anonymous-safe: no email / notes / assignee / observation ever leak", async () => {
  for (const ref of ["fb_1a2b3c4d", ID_OPEN, "fb_a1b2c3d4", "fb_deadbeef"]) {
    const html = await (await fetch(`${base}/r/${ref}`)).text()
    expect(html).not.toContain(SECRET_EMAIL)
    expect(html).not.toContain(CONTACT_EMAIL)
    expect(html).not.toContain(SECRET_NOTE)
    expect(html).not.toContain(ASSIGNEE)
    expect(html).not.toContain("Checkout button does nothing") // observation
    expect(html).not.toContain("app.example.com") // url host
    expect(html).not.toContain(PROJECT_ID) // project internal
  }
})

test("(H) status pages are noindex + no-store on both hit and miss", async () => {
  const hit = await fetch(`${base}/r/fb_1a2b3c4d`)
  expect(hit.headers.get("x-robots-tag")).toContain("noindex")
  expect(hit.headers.get("cache-control")).toContain("no-store")
  const miss = await fetch(`${base}/r/fb_00000000`)
  expect(miss.headers.get("x-robots-tag")).toContain("noindex")
  expect(miss.headers.get("cache-control")).toContain("no-store")
})
