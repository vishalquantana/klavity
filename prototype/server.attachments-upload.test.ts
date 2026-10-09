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

// local S3 stand-in: counts PUTs (each PUT = one object stored) and can be slowed to prove uploads run in parallel
let puts = 0, putDelay = 0
const deletedPaths: string[] = []
const s3 = Bun.serve({ port: 0, async fetch(req) {
  if (req.method === "PUT") { await req.arrayBuffer(); if (putDelay) await Bun.sleep(putDelay); puts++; return new Response("", { status: 200, headers: { etag: '"x"' } }) }
  if (req.method === "DELETE") { deletedPaths.push(decodeURIComponent(new URL(req.url).pathname)); return new Response("", { status: 204 }) }
  return new Response("", { status: 404 })
} })

const OWNER = `au-owner-${RUN}@test.local`, OUTSIDER = `au-out-${RUN}@test.local`
const SID = `sess_au_${RUN}`, SID_X = `sess_au_x_${RUN}`
const ACCT = `acct_au_${RUN}`, PROJ = `proj_au_${RUN}`
const NOW = Date.now()
let proc: ReturnType<typeof Bun.spawn>, BASE = ""
const tickets: string[] = []
async function newTicket() {
  const id = `fb_au_${Math.random().toString(36).slice(2)}`
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)", [id, PROJ, "t", "low", "open", NOW, NOW])
  tickets.push(id); return id
}

beforeAll(async () => {
  const port = await freePort(); BASE = `http://localhost:${port}`
  proc = Bun.spawn([process.execPath, "server.ts"], {
    cwd: join(import.meta.dir), stdout: "ignore", stderr: "ignore",
    env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
      S3_ENDPOINT: "http://127.0.0.1:" + s3.port, S3_BUCKET: "b", AWS_ACCESS_KEY_ID: "k", AWS_SECRET_ACCESS_KEY: "s" },
  })
  const dl = Date.now() + 15_000
  while (Date.now() < dl) { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(150) }
  for (const e of [OWNER, OUTSIDER]) await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [e, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_X, OUTSIDER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Att Upload", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "P", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
}, 30_000)
afterAll(() => { proc?.kill(); s3.stop(true); raw.close(); rmDb() })

const file = (name: string, size = 2000, type = "image/png") => new File([new Uint8Array(size).fill(7)], name, { type })
function upload(id: string, files: File[], sid = SID) {
  const fd = new FormData(); files.forEach(f => fd.append("files", f))
  return fetch(`${BASE}/api/feedback/${id}/attachments`, { method: "POST", headers: { Cookie: `klav_session=${sid}` }, body: fd })
}
const storedNames = async (id: string) => { const r: any = (await exec("SELECT attachments_json FROM feedback WHERE id=?", [id])).rows[0]; return (JSON.parse(String(r.attachments_json || "[]")) as any[]).map(a => a.filename) }

test("a new file is stored and returned with a signed link; the response also carries duplicates:[] and ignored:[]", async () => {
  const id = await newTicket(); puts = 0
  const r = await upload(id, [file("shot.png")])
  expect(r.status).toBe(201)
  const d: any = await r.json()
  expect(d.ok).toBe(true); expect(d.attachments.length).toBe(1); expect(d.attachments[0].filename).toBe("shot.png"); expect(d.attachments[0].url).toContain("http")
  expect(d.duplicates).toEqual([]); expect(d.ignored).toEqual([])
  expect(puts).toBe(1)
  expect(await storedNames(id)).toEqual(["shot.png"])
})

test("the SAME file (name + size) again is NOT stored or uploaded again — it is reported as a duplicate", async () => {
  const id = await newTicket()
  await upload(id, [file("dup.png", 1234)])
  puts = 0
  const r = await upload(id, [file("DUP.png", 1234)])               // name compare is case-insensitive
  expect(r.status).toBe(200)
  const d: any = await r.json()
  expect(d.ok).toBe(true); expect(d.attachments).toEqual([]); expect(d.duplicates).toEqual(["DUP.png"])
  expect(puts).toBe(0)                                                // nothing re-uploaded to storage
  expect(await storedNames(id)).toEqual(["dup.png"])                  // and still only one stored
})

test("same name but a DIFFERENT size is a different file and is accepted", async () => {
  const id = await newTicket()
  await upload(id, [file("same.png", 1000)])
  const r = await upload(id, [file("same.png", 1001)])
  expect(r.status).toBe(201)
  expect((await storedNames(id)).length).toBe(2)
})

test("a repeat inside ONE request is stored once; a mixed batch uploads only the new files", async () => {
  const id = await newTicket()
  await upload(id, [file("a.png", 500)])
  puts = 0
  const r = await upload(id, [file("a.png", 500), file("b.png", 501), file("b.png", 501), file("c.png", 502)])
  const d: any = await r.json()
  expect(r.status).toBe(201)
  expect(d.attachments.map((a: any) => a.filename)).toEqual(["b.png", "c.png"])
  expect(d.duplicates.sort()).toEqual(["a.png", "b.png"])
  expect(puts).toBe(2)
  expect(await storedNames(id)).toEqual(["a.png", "b.png", "c.png"])
})

test("files beyond the 5-file cap are REPORTED in `ignored` (they used to be dropped silently)", async () => {
  const id = await newTicket()
  const files = Array.from({ length: 7 }, (_, i) => file("many-" + i + ".png", 600 + i))
  const r = await upload(id, files)
  const d: any = await r.json()
  expect(r.status).toBe(201)
  expect(d.attachments.length).toBe(5)
  expect(d.ignored).toEqual(["many-5.png", "many-6.png"])
})

test("an oversized file is rejected with 400 BEFORE anything is uploaded (no orphan objects)", async () => {
  const id = await newTicket(); puts = 0
  const r = await upload(id, [file("ok.png", 1500), file("huge.png", 9 * 1024 * 1024)])   // images are capped at 8 MB
  expect(r.status).toBe(400)
  expect(String((await r.json() as any).error)).toContain("huge.png")
  expect(puts).toBe(0)
  expect(await storedNames(id)).toEqual([])
})

test("storage uploads run in PARALLEL: 4 files that each take ~300 ms finish in well under 4×300 ms", async () => {
  const id = await newTicket(); putDelay = 300
  const t0 = performance.now()
  const r = await upload(id, [file("p1.png", 700), file("p2.png", 701), file("p3.png", 702), file("p4.png", 703)])
  const ms = performance.now() - t0; putDelay = 0
  expect(r.status).toBe(201)
  expect(ms).toBeLessThan(900)                                        // sequential would be ≥ 1200 ms
  expect(await storedNames(id)).toEqual(["p1.png", "p2.png", "p3.png", "p4.png"])   // order preserved
})

test("OVERLAPPING uploads to one ticket all land (no lost update)", async () => {
  const id = await newTicket()
  const rs = await Promise.all(Array.from({ length: 8 }, (_, i) => upload(id, [file("par-" + i + ".png", 800 + i)])))
  expect(rs.every(r => r.status === 201)).toBe(true)
  expect((await storedNames(id)).sort()).toEqual(Array.from({ length: 8 }, (_, i) => "par-" + i + ".png").sort())
})

test("access rules are unchanged: no session → 401, a non-member → 403/404, a missing/empty selection → 400", async () => {
  const id = await newTicket()
  const fd = new FormData(); fd.append("files", file("x.png"))
  expect((await fetch(`${BASE}/api/feedback/${id}/attachments`, { method: "POST", body: fd })).status).toBe(401)
  expect([403, 404]).toContain((await upload(id, [file("x.png")], SID_X)).status)
  expect((await upload(id, [])).status).toBe(400)
})

// ── DELETE /api/feedback/:id/attachments?key= ────────────────────────────────────────────────────────────────────────
const del = (id: string, key: string | null, sid: string | null = SID) =>
  fetch(`${BASE}/api/feedback/${id}/attachments${key == null ? "" : "?key=" + encodeURIComponent(key)}`, { method: "DELETE", headers: sid ? { Cookie: `klav_session=${sid}` } : {} })
const keysOf = async (id: string) => { const r: any = (await exec("SELECT attachments_json FROM feedback WHERE id=?", [id])).rows[0]; return (JSON.parse(String(r.attachments_json || "[]")) as any[]).map(a => a.key) }
const waitFor = async (cond: () => boolean, ms = 3000) => { const t0 = Date.now(); while (!cond() && Date.now() - t0 < ms) await Bun.sleep(25); return cond() }

test("remove: the attachment leaves the ticket, its stored object is deleted, and the other attachments are untouched", async () => {
  const id = await newTicket()
  const d: any = await (await upload(id, [file("keep.png", 3001), file("drop.png", 3002)])).json()
  const [keep, drop] = d.attachments.map((a: any) => a.key)
  deletedPaths.length = 0
  const r = await del(id, drop)
  expect(r.status).toBe(200)
  expect(await r.json()).toEqual({ ok: true, removed: drop })
  expect(await keysOf(id)).toEqual([keep])
  expect(await waitFor(() => deletedPaths.some(p => p.endsWith(drop)))).toBe(true)         // storage cleanup happened (async, best-effort)
  expect(deletedPaths.some(p => p.endsWith(keep))).toBe(false)
})
test("remove: an unknown key → 404, a missing key → 400, removing twice → second is 404; nothing is deleted from storage", async () => {
  const id = await newTicket()
  const d: any = await (await upload(id, [file("once.png", 3010)])).json()
  const key = d.attachments[0].key
  deletedPaths.length = 0
  expect((await del(id, "uploads/attachments/nope.png")).status).toBe(404)
  expect((await del(id, null)).status).toBe(400)
  expect((await del(id, key)).status).toBe(200)
  expect((await del(id, key)).status).toBe(404)
  await Bun.sleep(150)
  expect(deletedPaths.filter(p => p.endsWith(key)).length).toBe(1)                          // deleted exactly once
})
test("remove: same access rules as add — no session → 401, a non-member → 403/404 (and the attachment stays)", async () => {
  const id = await newTicket()
  const d: any = await (await upload(id, [file("guarded.png", 3020)])).json()
  const key = d.attachments[0].key
  expect((await del(id, key, null)).status).toBe(401)
  expect([403, 404]).toContain((await del(id, key, SID_X)).status)
  expect(await keysOf(id)).toEqual([key])
})
test("remove: an object another ticket still references (merged tickets share keys) is NOT deleted from storage", async () => {
  const a = await newTicket(), b = await newTicket()
  const shared = "uploads/attachments/shared-" + RUN + ".png", solo = "uploads/attachments/solo-" + RUN + ".png"
  const entry = (key: string) => ({ key, filename: key.split("/").pop(), contentType: "image/png", size: 10 })
  await exec("UPDATE feedback SET attachments_json=? WHERE id=?", [JSON.stringify([entry(shared), entry(solo)]), a])
  await exec("UPDATE feedback SET attachments_json=? WHERE id=?", [JSON.stringify([entry(shared)]), b])
  deletedPaths.length = 0
  expect((await del(a, shared)).status).toBe(200)
  expect((await del(a, solo)).status).toBe(200)
  expect(await waitFor(() => deletedPaths.some(p => p.endsWith(solo)))).toBe(true)          // unshared object removed…
  await Bun.sleep(150)
  expect(deletedPaths.some(p => p.endsWith(shared))).toBe(false)                            // …shared one kept for ticket b
  expect(await keysOf(b)).toEqual([shared])
})
test("remove: concurrent removals and an upload on one ticket all take effect (no lost update)", async () => {
  const id = await newTicket()
  const d: any = await (await upload(id, [file("c1.png", 3031), file("c2.png", 3032), file("c3.png", 3033), file("c4.png", 3034)])).json()
  const keys: string[] = d.attachments.map((a: any) => a.key)
  const [r1, r2, up] = await Promise.all([del(id, keys[0]), del(id, keys[1]), upload(id, [file("c5.png", 3035)])])
  expect([r1.status, r2.status, up.status]).toEqual([200, 200, 201])
  const left = await storedNames(id)
  expect(left.sort()).toEqual(["c3.png", "c4.png", "c5.png"])
})
test("remove: the action is recorded on the ticket's activity timeline", async () => {
  const id = await newTicket()
  const d: any = await (await upload(id, [file("audit.png", 3040)])).json()
  await del(id, d.attachments[0].key)
  const got = await waitFor(() => false, 0)   // (placeholder to keep the helper referenced)
  void got
  let found = false
  for (let i = 0; i < 40 && !found; i++) {
    const rows = (await exec("SELECT type, meta_json FROM activity_events WHERE feedback_id=? AND type='ticket_attachment_removed'", [id])).rows as any[]
    found = rows.length > 0 && String(rows[0].meta_json).includes("audit.png")
    if (!found) await Bun.sleep(50)
  }
  expect(found).toBe(true)
})
