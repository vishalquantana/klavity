// BugHerd sub-project A, task 3: POST /api/errors — origin+project+autoCaptureErrors gated,
// rate-capped ingest that folds duplicate client errors into a deduped ticket (Task 2's
// recordClientError) and fires connector auto-copy on newly-created tickets.
// Boots a real server subprocess against a fresh local libsql file, mirroring
// server.workspace-rename.test.ts's harness (see that file for the pattern this follows).

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __netKLA719 from "node:net"
// KLA-719: OS-assigned free port (replaces a crowded random base that let co-scheduled
// server suites collide and answer each other's requests → spurious 401/404/no-such-table).
function __freePortKLA719(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __netKLA719.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-errors-ep-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")
const PORT = await __freePortKLA719()
const BASE = `http://localhost:${PORT}`

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }
async function query(sql: string, args: any[] = []) { return (await raw.execute({ sql, args })).rows }

let appProc: ReturnType<typeof Bun.spawn>
const OWNER = `errors-ep-owner-${RUN}@test.local`
const ACCT = `acct_errors_ep_${RUN}`
const PROJ = `proj_errors_ep_${RUN}`
const PROJ_OFF = `proj_errors_ep_off_${RUN}`

async function seed() {
  const now = Date.now()
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, now])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)",
    [ACCT, "Errors EP Acct", OWNER, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)",
    [`am_errors_ep_${RUN}`, ACCT, OWNER, "owner", now])
  // Flag ON project — auto-capture enabled.
  await exec(
    "INSERT INTO projects (id, account_id, name, status, widget_auto_capture_errors, created_at, updated_at) VALUES (?, ?, ?, 'active', 1, ?, ?)",
    [PROJ, ACCT, "Errors EP Project", now, now])
  // Flag OFF project (default) — no-op expected.
  await exec(
    "INSERT INTO projects (id, account_id, name, status, created_at, updated_at) VALUES (?, ?, ?, 'active', ?, ?)",
    [PROJ_OFF, ACCT, "Errors EP Off Project", now, now])
}

beforeAll(async () => {
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
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

afterAll(() => { appProc?.kill(); raw.close(); rmDb() })

function postErrors(body: any) {
  return fetch(`${BASE}/api/errors`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://acme.test" },
    body: JSON.stringify(body),
  })
}

test("a new signature creates a ticket; an identical repeat bumps, not creates", async () => {
  const body = { projectId: PROJ, errors: [{ kind: "error", message: "boom", stack: "at f", pageUrl: "https://acme.test/p" }] }
  const r1 = await postErrors(body)
  expect(r1.status).toBe(200)
  const d1 = await r1.json()
  expect(d1.ok).toBe(true)
  expect(d1.created).toBe(1)

  const r2 = await postErrors(body)
  expect(r2.status).toBe(200)
  const d2 = await r2.json()
  expect(d2.created).toBe(0)

  const rows = await query("SELECT COUNT(*) as n FROM feedback WHERE project_id=? AND source='auto-error'", [PROJ])
  expect(Number(rows[0].n)).toBe(1)
})

test("unknown project -> 404", async () => {
  const r = await postErrors({ projectId: "proj_does_not_exist", errors: [{ kind: "error", message: "x", pageUrl: "https://acme.test/x" }] })
  expect(r.status).toBe(404)
})

test("project with autoCaptureErrors OFF -> 200 but created:0, disabled:true (no-op)", async () => {
  const r = await postErrors({ projectId: PROJ_OFF, errors: [{ kind: "error", message: "off-flag", pageUrl: "https://acme.test/off" }] })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.ok).toBe(true)
  expect(d.created).toBe(0)
  expect(d.disabled).toBe(true)

  const rows = await query("SELECT COUNT(*) as n FROM feedback WHERE project_id=?", [PROJ_OFF])
  expect(Number(rows[0].n)).toBe(0)
})

test("missing origin header -> 400", async () => {
  const r = await fetch(`${BASE}/api/errors`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ projectId: PROJ, errors: [] }),
  })
  expect(r.status).toBe(400)
})

test("per-project hourly cap: beyond the cap, new signatures fold to recurrence-only (created stops rising)", async () => {
  const CAP_PROJ = `proj_errors_ep_cap_${RUN}`
  const now = Date.now()
  await exec(
    "INSERT INTO projects (id, account_id, name, status, widget_auto_capture_errors, created_at, updated_at) VALUES (?, ?, ?, 'active', 1, ?, ?)",
    [CAP_PROJ, ACCT, "Errors EP Cap Project", now, now])

  const TOTAL = 60 // > ERRORS_PER_PROJECT_HOUR (50)
  let totalCreated = 0
  for (let i = 0; i < TOTAL; i++) {
    const r = await postErrors({
      projectId: CAP_PROJ,
      errors: [{ kind: "error", message: `unique-${i}`, stack: `at f${i}`, pageUrl: `https://acme.test/cap/${i}` }],
    })
    expect(r.status).toBe(200)
    const d = await r.json()
    totalCreated += d.created
  }

  // The cap must have kept total created tickets below the number of distinct signatures sent.
  expect(totalCreated).toBeLessThan(TOTAL)
  expect(totalCreated).toBeGreaterThan(0)

  const rows = await query("SELECT COUNT(*) as n FROM feedback WHERE project_id=? AND source='auto-error'", [CAP_PROJ])
  expect(Number(rows[0].n)).toBe(totalCreated)
})
