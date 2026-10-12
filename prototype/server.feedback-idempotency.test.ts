// Idempotent report submissions over HTTP (POST /api/feedback with a `submission_key`): a retry returns the SAME ticket, concurrent
// duplicates collapse to one, a crash leaves a recoverable claim, a different principal can never read another's ticket, a repair
// re-uploads only the evidence that failed, and a retry leaves no orphan objects. Hermetic: spawns the real server (process.execPath →
// no orphan) against a temp file DB and a local S3 stand-in that records every PUT/DELETE and can delay or fail individual PUTs (by size).
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
const DB_FILE = join(tmpdir(), `klav-idem-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(71)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL"); await raw.execute("PRAGMA busy_timeout=5000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

// ── S3 stand-in ────────────────────────────────────────────────────────────────────────────────────────────────────────
let puts = 0, defaultDelay = 0
let delayBySize: Record<number, number> = {}
let failSizes = new Set<number>()
const putPaths: string[] = []       // every PUT path, in arrival order (duplicates = the same object written again)
const deleted: string[] = []
const s3 = Bun.serve({ port: 0, async fetch(req) {
  const path = decodeURIComponent(new URL(req.url).pathname)
  if (req.method === "PUT") {
    const n = (await req.arrayBuffer()).byteLength
    puts++; putPaths.push(path)
    await Bun.sleep(delayBySize[n] ?? defaultDelay)
    if (failSizes.has(n)) return new Response("boom", { status: 500 })
    return new Response("", { status: 200, headers: { etag: '"x"' } })
  }
  if (req.method === "DELETE") { deleted.push(path); return new Response("", { status: 204 }) }
  return new Response("", { status: 404 })
} })
const resetStub = () => { puts = 0; defaultDelay = 0; delayBySize = {}; failSizes = new Set(); putPaths.length = 0; deleted.length = 0 }
const uniquePaths = () => new Set(putPaths).size

const OWNER = `ik-owner-${RUN}@test.local`, MEMBER = `ik-member-${RUN}@test.local`, OUTSIDER = `ik-out-${RUN}@test.local`
const SID = `sess_ik_${RUN}`, SID_M = `sess_ikm_${RUN}`, SID_O = `sess_iko_${RUN}`
const ACCT = `acct_ik_${RUN}`, PROJ = `proj_ik_${RUN}`
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
  for (const e of [OWNER, MEMBER, OUTSIDER]) await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [e, NOW])
  for (const [sid, e] of [[SID, OWNER], [SID_M, MEMBER], [SID_O, OUTSIDER]]) await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [sid, e, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Idem", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "P", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm2_${RUN}`, PROJ, MEMBER, "member", null, NOW])
}, 30_000)
afterAll(() => { proc?.kill(); s3.stop(true); raw.close(); rmDb() })

const word = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
const newKey = () => crypto.randomUUID()
const file = (name: string, size: number, type = "application/pdf") => new File([new Uint8Array(size).fill(9)], name, { type })
type Sub = { key?: string | null; description?: string; atts?: Array<{ name: string; size: number }>; sid?: string | null; anon?: boolean; repair?: string[]; slotMap?: any; thumbShot?: boolean }
function submit(o: Sub) {
  const fd = new FormData()
  fd.set("description", o.description ?? ("idem " + word()))
  fd.set("project_id", PROJ); fd.set("page_url", "https://example.com/p")
  if (o.key !== null && o.key !== undefined) fd.set("submission_key", o.key)
  if (o.repair) fd.set("repair_slots", JSON.stringify(o.repair))
  if (o.slotMap) fd.set("slot_map", JSON.stringify(o.slotMap))
  ;(o.atts || []).forEach((a) => fd.append("files", file(a.name, a.size)))
  const headers: Record<string, string> = {}
  if (o.anon) headers.Origin = "https://customer.example"
  else { headers.Origin = BASE; headers.Cookie = `klav_session=${o.sid ?? SID}` }
  return fetch(`${BASE}/api/feedback`, { method: "POST", headers, body: fd })
}
const feedbackRows = async (desc?: string) => (await exec("SELECT id, seq_num, observation, attachments_json, evidence_dropped, recurrence_count FROM feedback WHERE project_id=?" + (desc ? " AND observation LIKE ?" : ""), desc ? [PROJ, "%" + desc + "%"] : [PROJ])).rows as any[]
const keyRow = async (key: string) => (await exec("SELECT * FROM submission_keys WHERE project_id=? AND submission_key=?", [PROJ, key])).rows[0] as any
const attNames = (r: any) => (JSON.parse(String(r.attachments_json || "[]")) as any[]).map((a) => a.filename)

test("the same submission key twice → the SAME ticket, one row, and the retry uploads nothing", async () => {
  resetStub()
  const key = newKey(), d = "twice " + word()
  const a = await submit({ key, description: d, atts: [{ name: "a.pdf", size: 1111 }] })
  expect(a.status).toBe(200)
  const A: any = await a.json()
  expect(A.id).toBeTruthy(); expect(A.replayed).toBeUndefined()
  const putsAfterFirst = puts
  expect(putsAfterFirst).toBeGreaterThan(0)
  const b = await submit({ key, description: d, atts: [{ name: "a.pdf", size: 1111 }] })
  expect(b.status).toBe(200)
  const B: any = await b.json()
  expect(B.id).toBe(A.id); expect(B.replayed).toBe(true)
  expect(b.headers.get("idempotent-replay")).toBe("true")
  expect(puts).toBe(putsAfterFirst)                    // NOTHING re-uploaded → no orphan objects from the retry
  expect((await feedbackRows(d)).length).toBe(1)
  expect(String((await keyRow(key)).state)).toBe("done")
})

test("many CONCURRENT attempts with one key create exactly one ticket (others replay, or wait with a retryable 409)", async () => {
  resetStub(); defaultDelay = 200
  const key = newKey(), d = "race " + word()
  const rs = await Promise.all(Array.from({ length: 6 }, () => submit({ key, description: d, atts: [{ name: "r.pdf", size: 1222 }] })))
  const bodies = await Promise.all(rs.map(async (r) => ({ status: r.status, j: await r.json().catch(() => ({})) as any })))
  const ok = bodies.filter((b) => b.status === 200)
  const waiting = bodies.filter((b) => b.status === 409)
  expect(ok.length + waiting.length).toBe(6)
  expect(waiting.every((b) => b.j.retryable === true && b.j.in_progress === true)).toBe(true)
  expect(new Set(ok.map((b) => b.j.id)).size).toBe(1)
  expect((await feedbackRows(d)).length).toBe(1)
  // the waiting ones, retrying now, get the same ticket
  const again = await submit({ key, description: d })
  expect(((await again.json()) as any).id).toBe(ok[0].j.id)
  expect(uniquePaths()).toBe(1)                         // ONE stored object for the attachment, however many attempts raced
})

test("a different principal using the same key never gets another's ticket: 409 conflict", async () => {
  resetStub()
  const key = newKey(), d = "owner " + word()
  const a = await submit({ key, description: d })
  const A: any = await a.json()
  const m = await submit({ key, description: d, sid: SID_M })                   // another MEMBER of the same project
  expect(m.status).toBe(409)
  const M: any = await m.json()
  expect(M.retryable).toBe(false); expect(M.id).toBeUndefined(); expect(JSON.stringify(M)).not.toContain(A.id)
  const an = await submit({ key, description: d, anon: true })                 // an ANONYMOUS widget caller
  expect(an.status).toBe(409)
  expect(JSON.stringify(await an.json())).not.toContain(A.id)
  expect((await feedbackRows(d)).length).toBe(1)
})

test("a caller WITHOUT access to the project cannot use (or learn about) an existing submission", async () => {
  resetStub()
  const key = newKey(), d = "private " + word()
  const A: any = await (await submit({ key, description: d })).json()
  const o = await submit({ key, description: d, sid: SID_O })
  expect(o.status).toBeGreaterThanOrEqual(400)
  expect(JSON.stringify(await o.json().catch(() => ({})))).not.toContain(A.id)
})

test("an anonymous reporter replaying their own submission gets the teaser link, never the member-only permalink", async () => {
  resetStub()
  const key = newKey(), d = "anon " + word()
  const a: any = await (await submit({ key, description: d, anon: true })).json()
  expect(a.id).toBeTruthy()
  const b: any = await (await submit({ key, description: d, anon: true })).json()
  expect(b.id).toBe(a.id); expect(b.replayed).toBe(true)
  expect(String(b.issue_url)).toContain("/t/")
})

test("crash recovery: an ABANDONED claim is taken over once stale (one ticket, key done); a FRESH claim makes a retry wait", async () => {
  resetStub()
  const keyStale = newKey(), keyFresh = newKey(), dS = "stale " + word(), dF = "fresh " + word()
  const t = Date.now()
  // as left behind by a process that died after claiming but before creating the ticket
  await exec("INSERT INTO submission_keys (project_id, submission_key, state, owner, actor_email, created_at, claimed_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", [PROJ, keyStale, "pending", "own_dead", OWNER, t - 60_000, t - 60_000, t - 60_000])
  await exec("INSERT INTO submission_keys (project_id, submission_key, state, owner, actor_email, created_at, claimed_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", [PROJ, keyFresh, "pending", "own_alive", OWNER, t, t, t])
  const s = await submit({ key: keyStale, description: dS })
  expect(s.status).toBe(200)
  const S: any = await s.json()
  expect(S.id).toBeTruthy()
  expect((await feedbackRows(dS)).length).toBe(1)
  const row = await keyRow(keyStale); expect(String(row.state)).toBe("done"); expect(String(row.feedback_id)).toBe(S.id)
  const f = await submit({ key: keyFresh, description: dF })
  expect(f.status).toBe(409)
  expect(f.headers.get("retry-after")).toBeTruthy()
  expect((await feedbackRows(dF)).length).toBe(0)
  await Bun.sleep(1700)                                  // the fresh claim goes stale (KLAV_SUBMISSION_STALE_MS=1500) → the retry takes over
  const f2 = await submit({ key: keyFresh, description: dF })
  expect(f2.status).toBe(200)
  expect((await feedbackRows(dF)).length).toBe(1)
})

test("a failure BEFORE the ticket exists releases the claim, so an immediate retry succeeds (and nothing is left behind)", async () => {
  resetStub()
  const key = newKey(), d = "fail " + word()
  // a project the caller can't persist into → the request fails closed; the claim must not linger
  const fd = new FormData(); fd.set("description", d); fd.set("project_id", "proj_does_not_exist_" + RUN); fd.set("submission_key", key)
  const bad = await fetch(`${BASE}/api/feedback`, { method: "POST", headers: { Origin: BASE, Cookie: `klav_session=${SID}` }, body: fd })
  expect(bad.status).toBeGreaterThanOrEqual(400)
  expect(await keyRow(key)).toBeUndefined()
  const ok = await submit({ key, description: d })
  expect(ok.status).toBe(200)
})

test("partial upload failure is REPORTED, then repaired: only the missing file is re-uploaded, appended once, no orphans", async () => {
  resetStub(); failSizes = new Set([3002])
  const key = newKey(), d = "partial " + word()
  const a = await submit({ key, description: d, atts: [{ name: "ok1.pdf", size: 3001 }, { name: "bad.pdf", size: 3002 }, { name: "ok2.pdf", size: 3003 }] })
  expect(a.status).toBe(200)
  const A: any = await a.json()
  expect(A.partial).toBe(true); expect(A.missing).toEqual(["file:1"])
  let row = (await feedbackRows(d))[0]
  expect(attNames(row)).toEqual(["ok1.pdf", "ok2.pdf"]); expect(Number(row.evidence_dropped)).toBe(1)
  expect(JSON.parse(String((await keyRow(key)).evidence_json))).toEqual({ "file:0": "ok", "file:1": "failed", "file:2": "ok" })

  // retry as-is (e.g. the client didn't get the response): the ticket is returned, STILL reported as partial — nothing is uploaded
  const putsBefore = puts
  const same: any = await (await submit({ key, description: d, atts: [{ name: "ok1.pdf", size: 3001 }, { name: "bad.pdf", size: 3002 }, { name: "ok2.pdf", size: 3003 }] })).json()
  expect(same.id).toBe(A.id); expect(same.partial).toBe(true); expect(same.missing).toEqual(["file:1"])
  expect(puts).toBe(putsBefore)

  // storage recovers; the client resends ONLY the missing part, under its ORIGINAL slot
  failSizes = new Set()
  const rep = await submit({ key, description: d, repair: ["file:1"], slotMap: { files: ["file:1"] }, atts: [{ name: "bad.pdf", size: 3002 }] })
  expect(rep.status).toBe(200)
  const R: any = await rep.json()
  expect(R.id).toBe(A.id); expect(R.partial).toBeUndefined()
  row = (await feedbackRows(d))[0]
  expect(attNames(row).sort()).toEqual(["bad.pdf", "ok1.pdf", "ok2.pdf"]); expect(Number(row.evidence_dropped)).toBe(0)
  expect(Object.values(JSON.parse(String((await keyRow(key)).evidence_json)))).toEqual(["ok", "ok", "ok"])

  // repeating the repair is a no-op: no second copy, no extra object
  const putsDone = puts
  await submit({ key, description: d, repair: ["file:1"], slotMap: { files: ["file:1"] }, atts: [{ name: "bad.pdf", size: 3002 }] })
  expect(attNames((await feedbackRows(d))[0]).length).toBe(3); expect(puts).toBe(putsDone)
  expect(uniquePaths()).toBe(putPaths.length - 1)       // the ONLY repeated path is the failed PUT's first attempt, overwritten by the repair (same deterministic key)
})

test("a takeover re-uploads under the SAME object keys (overwrites its own earlier objects instead of orphaning them)", async () => {
  resetStub()
  const key = newKey(), d = "overwrite " + word()
  const t = Date.now()
  await exec("INSERT INTO submission_keys (project_id, submission_key, state, owner, actor_email, created_at, claimed_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", [PROJ, key, "pending", "own_dead2", OWNER, t - 60_000, t - 60_000, t - 60_000])
  await submit({ key, description: d, atts: [{ name: "o.pdf", size: 4004 }] })
  const first = putPaths.slice()
  // pretend that first attempt's ticket never landed: reopen the key and submit again → same slot, same object path
  const fb = (await feedbackRows(d))[0]
  await exec("DELETE FROM feedback WHERE id=?", [fb.id])
  const r = await submit({ key, description: d, atts: [{ name: "o.pdf", size: 4004 }] })
  expect(r.status).toBe(200)
  const second = putPaths.slice(first.length)
  expect(second.length).toBeGreaterThan(0)
  expect(new Set(second)).toEqual(new Set(first))        // identical keys
  expect(deleted.length).toBe(0)
})

test("a repeat report merged into an existing ticket: retry returns that ticket, the recurrence is counted ONCE, and the attachment is KEPT on that ticket (not discarded)", async () => {
  resetStub()
  const d = "merge me please " + word()
  const first: any = await (await submit({ key: newKey(), description: d })).json()
  const key = newKey()
  const a: any = await (await submit({ key, description: d, atts: [{ name: "m.pdf", size: 5005 }] })).json()
  expect(a.id).toBe(first.id); expect(a.deduped).toBe(true)
  const countAfter = Number((await feedbackRows(d))[0].recurrence_count)
  const b: any = await (await submit({ key, description: d, atts: [{ name: "m.pdf", size: 5005 }] })).json()
  expect(b.id).toBe(first.id); expect(b.replayed).toBe(true); expect(b.deduped).toBe(true)
  expect(Number((await feedbackRows(d))[0].recurrence_count)).toBe(countAfter)     // the retry did not bump it again
  await Bun.sleep(100)
  expect(deleted.length).toBe(0)                                                       // the evidence was kept (see the hardening suite for the full attach / repair cases)
  expect(attNames((await feedbackRows(d))[0])).toEqual(["m.pdf"])                       // …attached to the ticket it merged into, exactly once
})

test("ticket numbering stays atomic under concurrency: 12 parallel submissions get 12 distinct, gap-free numbers", async () => {
  resetStub()
  const before = (await feedbackRows()).map((r) => Number(r.seq_num))
  const rs = await Promise.all(Array.from({ length: 12 }, (_, i) => submit({ key: i % 2 ? newKey() : null, description: "numbered " + i + " " + word() + word() })))
  expect(rs.every((r) => r.status === 200)).toBe(true)
  const all = (await feedbackRows()).map((r) => Number(r.seq_num)).sort((x, y) => x - y)
  const added = all.filter((n) => !before.includes(n))
  expect(added.length).toBe(12); expect(new Set(all).size).toBe(all.length)                 // no number used twice anywhere
  expect(added).toEqual(Array.from({ length: 12 }, (_, i) => added[0] + i))                   // the 12 new numbers are consecutive (earlier tests delete a row on purpose)
})

test("an invalid submission key is a 400; a request WITHOUT a key behaves exactly as before", async () => {
  resetStub()
  expect((await submit({ key: "short" })).status).toBe(400)
  expect((await submit({ key: "has spaces and ?? chars !!" })).status).toBe(400)
  const d = "nokey " + word()
  const a: any = await (await submit({ key: null, description: d })).json()
  expect(a.id).toBeTruthy(); expect(a.replayed).toBeUndefined()
})

test("the replay slot is recorded 'ok' together with the replay row (one batch), and a replay-only retry is a plain replay of the ticket", async () => {
  resetStub()
  const key = newKey(), d = "replayslot " + word()
  const fd = new FormData()
  fd.set("description", d); fd.set("project_id", PROJ); fd.set("page_url", "https://example.com/p"); fd.set("submission_key", key)
  fd.set("replay_events", JSON.stringify(Array.from({ length: 60 }, (_, i) => ({ type: 3, timestamp: i, data: { source: 1, x: i } }))))
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", headers: { Origin: BASE, Cookie: `klav_session=${SID}` }, body: fd })
  expect(r.status).toBe(200)
  const A: any = await r.json()
  expect(A.partial).toBeUndefined()
  const row = await keyRow(key)
  expect(JSON.parse(String(row.evidence_json))).toEqual({ replay: "ok" })
  const rep = (await exec("SELECT n_events FROM feedback_replays WHERE feedback_id=?", [A.id])).rows as any[]
  expect(rep.length).toBe(1); expect(Number(rep[0].n_events)).toBe(60)
  const again: any = await (await submit({ key, description: d })).json()
  expect(again.id).toBe(A.id); expect(again.partial).toBeUndefined()
  expect(((await exec("SELECT COUNT(*) AS n FROM feedback_replays WHERE feedback_id=?", [A.id])).rows[0] as any).n).toBe(1)   // not stored twice
})
