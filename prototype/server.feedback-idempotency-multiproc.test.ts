// Idempotency across SEVERAL server processes and across crashes / restarts. The in-process state is irrelevant by design — the database is
// the only source of truth — so this spawns two real servers on ONE database file, races one submission key across both, kills a server in
// the middle of a request, restarts a fresh process, and drops the client's connection after the ticket was created.
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
const DB_FILE = join(tmpdir(), `klav-idemmp-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(72)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL"); await raw.execute("PRAGMA busy_timeout=8000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

let puts = 0, delayMs = 0
const putPaths: string[] = []
const s3 = Bun.serve({ port: 0, async fetch(req) {
  const path = decodeURIComponent(new URL(req.url).pathname)
  if (req.method === "PUT") { await req.arrayBuffer(); puts++; putPaths.push(path); if (delayMs) await Bun.sleep(delayMs); return new Response("", { status: 200, headers: { etag: '"x"' } }) }
  return new Response("", { status: 204 })
} })

const OWNER = `mp-owner-${RUN}@test.local`, SID = `sess_mp_${RUN}`, ACCT = `acct_mp_${RUN}`, PROJ = `proj_mp_${RUN}`
const NOW = Date.now()
type Srv = { proc: ReturnType<typeof Bun.spawn>; base: string }
const servers: Srv[] = []
async function startServer(): Promise<Srv> {
  const port = await freePort(), base = `http://localhost:${port}`
  const proc = Bun.spawn([process.execPath, "server.ts"], {
    cwd: join(import.meta.dir), stdout: "ignore", stderr: "ignore",
    env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: base,
      KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", KLAV_SUBMISSION_STALE_MS: "1500",
      S3_ENDPOINT: "http://127.0.0.1:" + s3.port, S3_BUCKET: "b", AWS_ACCESS_KEY_ID: "k", AWS_SECRET_ACCESS_KEY: "s" },
  })
  const srv = { proc, base }; servers.push(srv)
  const dl = Date.now() + 20_000
  while (Date.now() < dl) { const r = await fetch(`${base}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(150) }
  return srv
}
let A: Srv, B: Srv
beforeAll(async () => {
  A = await startServer(); B = await startServer()
  await exec("INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "MP", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "P", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
}, 60_000)
afterAll(() => { for (const s of servers) { try { s.proc.kill() } catch {} } s3.stop(true); raw.close(); rmDb() })

const word = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
function submit(srv: Srv, key: string, description: string, signal?: AbortSignal) {
  const fd = new FormData()
  fd.set("description", description); fd.set("project_id", PROJ); fd.set("page_url", "https://example.com/p"); fd.set("submission_key", key)
  fd.append("files", new File([new Uint8Array(1500).fill(5)], "doc.pdf", { type: "application/pdf" }))
  return fetch(`${srv.base}/api/feedback`, { method: "POST", headers: { Origin: srv.base, Cookie: `klav_session=${SID}` }, body: fd, signal })
}
const rowsFor = async (d: string) => (await exec("SELECT id FROM feedback WHERE project_id=? AND observation LIKE ?", [PROJ, "%" + d + "%"])).rows as any[]
const keyState = async (k: string) => ((await exec("SELECT state, owner FROM submission_keys WHERE project_id=? AND submission_key=?", [PROJ, k])).rows[0] as any)

test("one key raced across TWO server processes → exactly one ticket", async () => {
  delayMs = 150
  const key = crypto.randomUUID(), d = "twoproc " + word()
  const rs = await Promise.all(Array.from({ length: 10 }, (_, i) => submit(i % 2 ? A : B, key, d)))
  const js = await Promise.all(rs.map(async (r) => ({ status: r.status, j: (await r.json().catch(() => ({}))) as any })))
  expect(js.every((x) => x.status === 200 || x.status === 409)).toBe(true)
  expect(new Set(js.filter((x) => x.status === 200).map((x) => x.j.id)).size).toBe(1)
  expect((await rowsFor(d)).length).toBe(1)
  expect(String((await keyState(key)).state)).toBe("done")
})

test("a RESTARTED process (new boot, new owner id) answers a retry with the same ticket", async () => {
  delayMs = 0
  const key = crypto.randomUUID(), d = "restart " + word()
  const first: any = await (await submit(A, key, d)).json()
  expect(first.id).toBeTruthy()
  A.proc.kill(); await A.proc.exited
  const C = await startServer()
  const again: any = await (await submit(C, key, d)).json()
  expect(again.id).toBe(first.id); expect(again.replayed).toBe(true)
  expect((await rowsFor(d)).length).toBe(1)
})

test("CRASH mid-request (server killed after the claim, before the ticket): the claim is recoverable by ANOTHER process — one ticket, same object keys", async () => {
  delayMs = 3000                                          // keep the request inside its uploads long enough to kill the server
  putPaths.length = 0
  const key = crypto.randomUUID(), d = "crash " + word()
  const doomed = await startServer()
  const inflight = submit(doomed, key, d).catch(() => null)
  const dl = Date.now() + 6000
  while (Date.now() < dl && !(await keyState(key))) await Bun.sleep(25)
  expect(String((await keyState(key)).state)).toBe("pending")      // claimed, ticket not created yet
  doomed.proc.kill(); await doomed.proc.exited; await inflight
  expect((await rowsFor(d)).length).toBe(0)                         // the crash left no ticket…
  const firstPaths = putPaths.slice()
  delayMs = 0
  // …and a claim that is not yet stale makes the retry WAIT (the dead owner might still be alive): 409 + Retry-After, never a second ticket.
  // Poll like the widget does; on a slow machine the claim may already be stale at the first retry, which is also fine (taken over at once).
  let r: Response | null = null, waited409 = 0
  const until = Date.now() + 12_000
  while (Date.now() < until) {
    r = await submit(B, key, d)
    if (r.status === 200) break
    expect(r.status).toBe(409); expect(r.headers.get("retry-after")).toBeTruthy(); waited409++
    expect((await rowsFor(d)).length).toBe(0)                        // while waiting, nothing was created
    await Bun.sleep(400)
  }
  expect(r!.status).toBe(200)
  expect((await rowsFor(d)).length).toBe(1)
  expect(String((await keyState(key)).state)).toBe("done")
  const secondPaths = putPaths.slice(firstPaths.length)
  expect(new Set(secondPaths)).toEqual(new Set(firstPaths))          // same deterministic object keys → the dead attempt's object was overwritten, not orphaned
})

test("the response is LOST after the ticket was created (client disconnects): the retry returns that ticket, no second one", async () => {
  delayMs = 400
  const key = crypto.randomUUID(), d = "lost " + word()
  const ac = new AbortController()
  const inflight = submit(B, key, d, ac.signal).catch(() => null)
  const dl = Date.now() + 5000
  while (Date.now() < dl && !(await keyState(key))) await Bun.sleep(20)
  ac.abort(); await inflight                                          // the browser gives up (timeout / navigation) while the server keeps working
  const t = Date.now() + 8000
  while (Date.now() < t && (await rowsFor(d)).length === 0) await Bun.sleep(50)
  expect((await rowsFor(d)).length).toBe(1)                           // the server finished the ticket anyway
  delayMs = 0
  const r: any = await (await submit(B, key, d)).json()
  expect(r.id).toBe((await rowsFor(d))[0].id); expect(r.replayed).toBe(true)
  expect((await rowsFor(d)).length).toBe(1)
})

test("STRESS: 50 forced-retry trials (client drops at a random moment, then retries up to 3× with the SAME key, across two servers) → exactly one ticket per report", async () => {
  delayMs = 120
  const TRIALS = 50
  const servers2 = [await startServer(), await startServer()]   // two fresh, live processes sharing the database
  const results = await Promise.all(Array.from({ length: TRIALS }, async (_, i) => {
    const key = crypto.randomUUID(), d = "stress " + i + " " + word()
    const ids = new Set<string>()
    for (let attempt = 0; attempt < 4; attempt++) {
      const ac = new AbortController()
      const cut = attempt < 3 ? Math.floor(Math.random() * 450) : 100000      // the first three attempts are cut off at a random time; the last one runs to the end
      const t = setTimeout(() => ac.abort(), cut)
      try {
        const r = await submit(servers2[(i + attempt) % 2], key, d, ac.signal)
        const j: any = await r.json().catch(() => ({}))
        if (r.status === 200 && j.id) ids.add(j.id)
      } catch { /* dropped by the client: exactly the failure being simulated */ }
      finally { clearTimeout(t) }
      await Bun.sleep(Math.floor(Math.random() * 40))
    }
    // let any server-side work that outlived a dropped connection finish, then ask once more (a retry the client would make)
    let final: any = null
    for (let k = 0; k < 40 && !final; k++) { const r = await submit(servers2[i % 2], key, d); const j: any = await r.json().catch(() => ({})); if (r.status === 200 && j.id) final = j; else await Bun.sleep(150) }
    if (final) ids.add(final.id)
    return { key, d, ids: [...ids], rows: (await rowsFor(d)).length }
  }))
  const duplicates = results.filter((r) => r.rows !== 1)
  const split = results.filter((r) => r.ids.length !== 1)
  console.log(`[stress] ${TRIALS} trials: ${results.filter((r) => r.rows === 1).length} with exactly one ticket, ${duplicates.length} duplicated/missing, ${split.length} answered with differing ids`)
  expect(duplicates.length).toBe(0)
  expect(split.length).toBe(0)
}, 120_000)
