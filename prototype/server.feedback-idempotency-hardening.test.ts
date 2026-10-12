// Hardening of idempotent submissions over HTTP:
//   1. a failed claim is a RETRYABLE error — nothing is created or uploaded, never "continue without idempotency";
//   2. an in-progress submission answers with a Retry-After that tracks the stale window, and the widget's own retry code (imported from
//      packages/sdk) polls it through a stale takeover to ONE ticket;
//   3. a repeat report merged into an existing ticket is counted ONCE even when its response is lost and it is re-sent;
//   4. files / recordings of a merged report are ATTACHED to that ticket (once), and a crash before they were attached is repairable;
//   5. the config endpoint advertises idempotency support (the widget retries automatically only when it sees this).
// Hermetic: the real server (process.execPath) on a temp DB, with a local S3 stand-in.
import { afterAll, beforeAll, expect, test } from "bun:test"
import * as net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"
import { withRetries, sendForm, serverSupportsIdempotency, type RetryInfo } from "../packages/sdk/src/submit-flow"

function freePort(): Promise<number> {
  return new Promise((res, rej) => { const s = net.createServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) }) })
}
const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-idemh-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(73)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL"); await raw.execute("PRAGMA busy_timeout=5000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

let puts = 0
const deleted: string[] = []
const s3 = Bun.serve({ port: 0, async fetch(req) {
  const path = decodeURIComponent(new URL(req.url).pathname)
  if (req.method === "PUT") { await req.arrayBuffer(); puts++; return new Response("", { status: 200, headers: { etag: '"x"' } }) }
  if (req.method === "DELETE") { deleted.push(path); return new Response("", { status: 204 }) }
  return new Response("", { status: 404 })
} })

const OWNER = `ih-owner-${RUN}@test.local`, SID = `sess_ih_${RUN}`, ACCT = `acct_ih_${RUN}`, PROJ = `proj_ih_${RUN}`
const NOW = Date.now()
let proc: ReturnType<typeof Bun.spawn>, BASE = ""

beforeAll(async () => {
  const port = await freePort(); BASE = `http://localhost:${port}`
  proc = Bun.spawn([process.execPath, "server.ts"], {
    cwd: join(import.meta.dir), stdout: "ignore", stderr: "ignore",
    env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", KLAV_SUBMISSION_STALE_MS: "1500",
      S3_ENDPOINT: "http://127.0.0.1:" + s3.port, S3_BUCKET: "b", AWS_ACCESS_KEY_ID: "k", AWS_SECRET_ACCESS_KEY: "s" },
  })
  const dl = Date.now() + 15_000
  while (Date.now() < dl) { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(150) }
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "IH", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "P", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
}, 30_000)
afterAll(() => { proc?.kill(); s3.stop(true); raw.close(); rmDb() })

const word = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
const newKey = () => crypto.randomUUID()
type Part = { name: string; size: number; type?: string }
function form(o: { key?: string | null; description: string; atts?: Part[]; recs?: Part[]; repair?: string[]; slotMap?: any }) {
  const fd = new FormData()
  fd.set("description", o.description); fd.set("project_id", PROJ); fd.set("page_url", "https://example.com/p")
  if (o.key) fd.set("submission_key", o.key)
  if (o.repair) fd.set("repair_slots", JSON.stringify(o.repair))
  if (o.slotMap) fd.set("slot_map", JSON.stringify(o.slotMap))
  ;(o.atts || []).forEach((a) => fd.append("files", new File([new Uint8Array(a.size).fill(7)], a.name, { type: a.type || "application/pdf" })))
  ;(o.recs || []).forEach((r) => fd.append("recording", new File([new Uint8Array(r.size).fill(8)], r.name, { type: r.type || "video/webm" })))
  return fd
}
const headers = () => ({ Origin: BASE, Cookie: `klav_session=${SID}` })
const submit = (o: Parameters<typeof form>[0]) => fetch(`${BASE}/api/feedback`, { method: "POST", headers: headers(), body: form(o) })
const rows = async (d: string) => (await exec("SELECT id, attachments_json, recordings_json, recurrence_count, evidence_dropped FROM feedback WHERE project_id=? AND observation LIKE ?", [PROJ, "%" + d + "%"])).rows as any[]
const names = (r: any, col = "attachments_json") => (JSON.parse(String(r[col] || "[]")) as any[]).map((a) => a.filename ?? a.id)
const keyRow = async (k: string) => (await exec("SELECT * FROM submission_keys WHERE project_id=? AND submission_key=?", [PROJ, k])).rows[0] as any

// ── 1. a failed claim ────────────────────────────────────────────────────────────────────────────────────────────────────────
test("1. if the claim cannot be recorded the answer is a RETRYABLE 503: no ticket, nothing uploaded — never 'continue without idempotency'", async () => {
  const key = newKey(), d = "claimfail " + word()
  await exec("ALTER TABLE submission_keys RENAME TO submission_keys_off")                 // the database cannot record keys right now
  puts = 0
  try {
    const r = await submit({ key, description: d, atts: [{ name: "a.pdf", size: 1300 }] })
    expect(r.status).toBe(503)
    const j: any = await r.json()
    expect(j.retryable).toBe(true); expect(j.saved).toBe(false); expect(r.headers.get("retry-after")).toBeTruthy()
    expect((await rows(d)).length).toBe(0)                                               // no ticket (so a retry cannot duplicate one)
    expect(puts).toBe(0)                                                                 // the claim precedes any upload
    // a request WITHOUT a key does not depend on the table and still works (old clients are unaffected)
    const plain = await submit({ key: null, description: "nokey during outage " + word() })
    expect(plain.status).toBe(200)
  } finally { await exec("ALTER TABLE submission_keys_off RENAME TO submission_keys") }
  const ok = await submit({ key, description: d })                                       // the database is back: the very same retry succeeds, once
  expect(ok.status).toBe(200); expect((await rows(d)).length).toBe(1)
})

// ── 2. in-progress: Retry-After + the widget's own retry loop ───────────────────────────────────────────────────────────────
test("2a. an in-progress submission answers 409 with a Retry-After that tracks the stale window, plus the same hint in the body", async () => {
  const key = newKey(), d = "retryafter " + word(), t = Date.now()
  await exec("INSERT INTO submission_keys (project_id, submission_key, state, owner, actor_email, created_at, claimed_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", [PROJ, key, "pending", "own_x", OWNER, t - 1200, t - 1200, t - 1200])
  const r = await submit({ key, description: d })
  expect(r.status).toBe(409)
  const j: any = await r.json()
  expect(j.in_progress).toBe(true); expect(j.retryable).toBe(true)
  expect(Number(r.headers.get("retry-after"))).toBe(j.retry_after)
  expect(j.retry_after).toBeGreaterThanOrEqual(1); expect(j.retry_after).toBeLessThanOrEqual(3)          // ≈ time until the 1.5 s stale window ends
  expect(j.stale_in_sec).toBeLessThanOrEqual(1)
})
test("2b. the WIDGET's retry code polls an abandoned claim (honouring Retry-After) until the server takes it over → exactly one ticket, and says it is 'waiting', not 'retrying'", async () => {
  const key = newKey(), d = "poll " + word(), t = Date.now()
  await exec("INSERT INTO submission_keys (project_id, submission_key, state, owner, actor_email, created_at, claimed_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", [PROJ, key, "pending", "own_dead", OWNER, t - 500, t - 500, t - 500])
  const fd = form({ key, description: d })
  const infos: RetryInfo[] = []
  const f = (u: any, init: any) => fetch(u, { ...init, headers: { ...(init?.headers || {}), ...headers() } })
  const started = Date.now()
  const res = await withRetries(() => sendForm({ backendUrl: BASE, firstParty: false, token: "" }, fd, {}, { fetch: f as any }), { onRetry: (i) => infos.push(i) })
  expect(res.status).toBe(200)
  expect(infos.length).toBeGreaterThanOrEqual(1)
  expect(infos.every((i) => i.pending === true)).toBe(true)                                // shown as 'still processing', never as failed attempts
  expect(infos[0].delayMs).toBeGreaterThanOrEqual(1000)                                    // it waited for the server's Retry-After (~2 s), it did not hammer
  expect(Date.now() - started).toBeLessThan(15_000)
  expect((await rows(d)).length).toBe(1)
  expect(String((await keyRow(key)).state)).toBe("done")
}, 30_000)

// ── 3 + 4. merged repeat reports ────────────────────────────────────────────────────────────────────────────────────────────────
test("4a. files and a recording of a repeat report that MERGES into an existing ticket are attached to that ticket — once — and nothing is deleted", async () => {
  const d = "merge keep evidence " + word()
  const head: any = await (await submit({ key: newKey(), description: d })).json()
  expect(head.id).toBeTruthy()
  deleted.length = 0
  const key = newKey()
  const a = await submit({ key, description: d, atts: [{ name: "log.txt", size: 2100, type: "text/plain" }, { name: "trace.pdf", size: 2200 }], recs: [{ name: "clip.webm", size: 2300 }] })
  expect(a.status).toBe(200)
  const A: any = await a.json()
  expect(A.id).toBe(head.id); expect(A.deduped).toBe(true); expect(A.partial).toBeUndefined()
  const row = (await rows(d))[0]
  expect(names(row).sort()).toEqual(["log.txt", "trace.pdf"])
  expect(names(row, "recordings_json").length).toBe(1)
  expect(Number(row.recurrence_count)).toBe(2)
  expect(JSON.parse(String((await keyRow(key)).evidence_json))).toEqual({ "file:0": "ok", "file:1": "ok", "rec:0": "ok" })
  await Bun.sleep(100)
  expect(deleted.length).toBe(0)                                                            // the evidence was kept, not discarded
  // 3. the response is lost → the client re-sends the SAME report: same ticket, counted once, attached once, nothing re-uploaded
  const putsBefore = puts
  const b: any = await (await submit({ key, description: d, atts: [{ name: "log.txt", size: 2100, type: "text/plain" }, { name: "trace.pdf", size: 2200 }], recs: [{ name: "clip.webm", size: 2300 }] })).json()
  expect(b.id).toBe(head.id); expect(b.replayed).toBe(true); expect(b.deduped).toBe(true); expect(b.partial).toBeUndefined()
  const again = (await rows(d))[0]
  expect(Number(again.recurrence_count)).toBe(2)                                            // NOT counted a second time
  expect(names(again).length).toBe(2); expect(names(again, "recordings_json").length).toBe(1)   // NOT attached a second time
  expect(puts).toBe(putsBefore)
})
test("4b. crash after the atomic merge but BEFORE the evidence was attached: the key records the files as pending and a repair attaches them to the merged-into ticket", async () => {
  const d = "merge crash window " + word()
  const head: any = await (await submit({ key: newKey(), description: d })).json()
  const key = newKey(), t = Date.now()
  // exactly the state the atomic merge leaves if the process dies right after it: key done (deduped), recurrence counted, files 'pending'
  await exec("INSERT INTO submission_keys (project_id, submission_key, state, owner, actor_email, feedback_id, deduped, evidence_json, attempt_token, created_at, claimed_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    [PROJ, key, "done", "own_dead", OWNER, head.id, 1, JSON.stringify({ "file:0": "pending" }), "tok", t, t, t])
  await exec("UPDATE feedback SET recurrence_count = 2 WHERE id=?", [head.id])
  const replay: any = await (await submit({ key, description: d, atts: [{ name: "late.pdf", size: 2400 }] })).json()
  expect(replay.id).toBe(head.id); expect(replay.replayed).toBe(true); expect(replay.partial).toBe(true); expect(replay.missing).toEqual(["file:0"])   // honest: the file is not attached yet
  expect(names((await rows(d))[0]).length).toBe(0)
  const fixed: any = await (await submit({ key, description: d, repair: ["file:0"], slotMap: { files: ["file:0"] }, atts: [{ name: "late.pdf", size: 2400 }] })).json()
  expect(fixed.id).toBe(head.id); expect(fixed.partial).toBeUndefined()
  const row = (await rows(d))[0]
  expect(names(row)).toEqual(["late.pdf"]); expect(Number(row.recurrence_count)).toBe(2)       // attached to the ticket; still counted once
})

// ── 5. capability advertisement ─────────────────────────────────────────────────────────────────────────────────────────────────
test("5. the public widget config advertises idempotency support, and the widget's parser accepts exactly that", async () => {
  const r = await fetch(`${BASE}/api/projects/${PROJ}/config`, { headers: { Origin: "https://customer.example" } })
  expect(r.status).toBe(200)
  const j: any = await r.json()
  expect(j.capabilities).toEqual({ submissionKeys: 1 })
  expect(serverSupportsIdempotency(j)).toBe(true)
  expect(serverSupportsIdempotency({ ...j, capabilities: undefined })).toBe(false)         // an older server (no capabilities) → no automatic retries
})
