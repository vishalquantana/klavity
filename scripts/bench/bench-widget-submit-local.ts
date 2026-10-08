// Local before/after benchmark of the widget submit (POST /api/feedback) with REMOTE-LIKE latency injected:
//   • every database round trip is delayed (BENCH_DB_LATENCY_MS, default 275 ms — measured on dev, 20 samples),
//   • every object-store PUT is delayed (default 300 ms),
// and every database call is counted, so "fewer sequential round trips" is shown as a number, not just a time.
//
//   bun scripts/bench/bench-widget-submit-local.ts <serverDir> [dbMs=275] [putMs=300] [runs=7] [--key]
//     <serverDir> = the prototype/ directory of the build to measure (e.g. a git worktree of the "before" commit, with node_modules linked).
//     --key       = send a submission_key like the new widget does (leave it off for a build that predates idempotency).
//
// The SAME request is sent to every build: a ~1.1 MB screenshot + thumbnail, a 200 KB PDF and a ~690 KB replay (plain JSON — the
// browser-side gzip is a separate, client-only saving), as an authenticated member. The first (warm-up) run is discarded.
import * as net from "node:net"
import { pathToFileURL } from "node:url"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { readFileSync, unlinkSync, writeFileSync } from "node:fs"

const [serverDirArg, dbArg, putArg, runsArg, ...flags] = process.argv.slice(2)
if (!serverDirArg) { console.error("usage: bun scripts/bench/bench-widget-submit-local.ts <serverDir> [dbMs] [putMs] [runs] [--key]"); process.exit(2) }
const SERVER_DIR = resolve(serverDirArg), DB_MS = Number(dbArg ?? 275), PUT_MS = Number(putArg ?? 300), RUNS = Number(runsArg ?? 7), WITH_KEY = flags.includes("--key")
const PRELOAD = resolve(import.meta.dir, "libsql-latency.preload.ts")
// the client is resolved from the build under test (this script lives outside prototype/, which owns node_modules)
const { createClient } = await import(pathToFileURL(Bun.resolveSync("@libsql/client", SERVER_DIR)).href)

const freePort = () => new Promise<number>((res, rej) => { const s = net.createServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) }) })
const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-bench-${RUN}.db`), DB_LOG = join(tmpdir(), `klav-bench-${RUN}.log`)
writeFileSync(DB_LOG, "")
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL"); await raw.execute("PRAGMA busy_timeout=8000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

let puts = 0
const s3 = Bun.serve({ port: 0, async fetch(req) {
  if (req.method === "PUT") { await req.arrayBuffer(); puts++; await Bun.sleep(PUT_MS); return new Response("", { status: 200, headers: { etag: '"x"' } }) }
  return new Response("", { status: 204 })
} })
const port = await freePort(), BASE = `http://localhost:${port}`
const OWNER = `b-${RUN}@test.local`, SID = `sess_b_${RUN}`, ACCT = `acct_b_${RUN}`, PROJ = `proj_b_${RUN}`, NOW = Date.now()
const proc = Bun.spawn([process.execPath, "--preload", PRELOAD, "server.ts"], { cwd: SERVER_DIR, stdout: "ignore", stderr: "ignore",
  env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(68)).toString("base64"), KLAV_BASE_URL: BASE,
    KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", KLAV_UPLOAD_CONCURRENCY: process.env.KLAV_UPLOAD_CONCURRENCY ?? "4",
    BENCH_DB_LATENCY_MS: "0", BENCH_DB_LOG: DB_LOG,   // latency is switched on AFTER the setup below (boot / migrations stay fast)
    S3_ENDPOINT: "http://127.0.0.1:" + s3.port, S3_BUCKET: "b", AWS_ACCESS_KEY_ID: "k", AWS_SECRET_ACCESS_KEY: "s" } })
try {
  const dl = Date.now() + 40_000
  while (Date.now() < dl) { const r = await fetch(`${BASE}/api/health`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(200) }
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "B", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "member", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "P", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "member", null, NOW])
  // The latency shim reads its delay at startup; restart the server with the real delay now that the schema + fixtures exist.
  proc.kill(); await proc.exited
  const proc2 = Bun.spawn([process.execPath, "--preload", PRELOAD, "server.ts"], { cwd: SERVER_DIR, stdout: "ignore", stderr: "ignore",
    env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(68)).toString("base64"), KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", KLAV_UPLOAD_CONCURRENCY: process.env.KLAV_UPLOAD_CONCURRENCY ?? "4",
      BENCH_DB_LATENCY_MS: String(DB_MS), BENCH_DB_LOG: DB_LOG,
      S3_ENDPOINT: "http://127.0.0.1:" + s3.port, S3_BUCKET: "b", AWS_ACCESS_KEY_ID: "k", AWS_SECRET_ACCESS_KEY: "s" } })
  const dl2 = Date.now() + 60_000
  while (Date.now() < dl2) { const r = await fetch(`${BASE}/api/health`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(200) }
  const fill = (n: number, seed: number) => { const a = new Uint8Array(n); let x = seed; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; a[i] = x >> 16 } return a }
  const shot = fill(1_100_000, 1), thumb = fill(40_000, 2), pdf = fill(200_000, 3)
  const events: any[] = [{ type: 4, timestamp: 1, data: { href: "https://example.com/p", width: 1280, height: 800 } }, { type: 2, timestamp: 2, data: { node: { type: 0, childNodes: Array.from({ length: 1500 }, (_, i) => ({ type: 2, tagName: "div", attributes: { class: "row-" + (i % 9) }, childNodes: [{ type: 3, textContent: "Item number " + i + " lorem ipsum dolor sit amet" }], id: 1000 + i })) } } }]
  for (let i = 0; i < 4000; i++) events.push({ type: 3, timestamp: 3 + i, data: { source: i % 2 ? 1 : 0, positions: [{ x: i % 1280, y: (i * 7) % 800, id: 1000 + (i % 1500), timeOffset: -(i % 50) }] } })
  const replay = JSON.stringify(events)
  const one = async (i: number) => {
    const fd = new FormData()
    fd.set("type", "bug"); fd.set("description", "bench " + i + " " + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)); fd.set("project_id", PROJ); fd.set("page_url", "https://example.com/p")
    fd.set("context", JSON.stringify({ pageUrl: "https://example.com/p", userAgent: "bench", consoleErrors: [], networkFailures: [] })); fd.set("replay_events", replay)
    if (WITH_KEY) fd.set("submission_key", crypto.randomUUID())
    fd.append("screenshots", new File([shot], "s.png", { type: "image/png" })); fd.append("screenshot_thumbs", new File([thumb], "t.jpg", { type: "image/jpeg" })); fd.append("files", new File([pdf], "doc.pdf", { type: "application/pdf" }))
    const logBefore = readFileSync(DB_LOG, "utf8").split("\n").length, putsBefore = puts
    const t = performance.now()
    const r = await fetch(`${BASE}/api/feedback`, { method: "POST", headers: { Cookie: `klav_session=${SID}`, Origin: BASE }, body: fd })
    await r.text()
    const ms = Math.round(performance.now() - t)
    await Bun.sleep(150)   // let the fire-and-forget calls of THIS request land in the log before counting
    const lines = readFileSync(DB_LOG, "utf8").split("\n").slice(logBefore - 1).filter(Boolean)
    return { ms, status: r.status, dbCalls: lines.length, puts: puts - putsBefore, serverTiming: r.headers.get("server-timing") }
  }
  await one(-1)
  const res = []; for (let i = 0; i < RUNS; i++) res.push(await one(i))
  const ms = res.map((r) => r.ms).sort((a, b) => a - b), calls = res.map((r) => r.dbCalls).sort((a, b) => a - b)
  console.log(JSON.stringify({ serverDir: SERVER_DIR.split(/[\\/]/).slice(-2).join("/"), withKey: WITH_KEY, dbLatencyMs: DB_MS, putLatencyMs: PUT_MS, runs: RUNS, statuses: [...new Set(res.map((r) => r.status))], min: ms[0], median: ms[Math.floor(ms.length / 2)], max: ms[ms.length - 1], all: ms, dbCallsMedian: calls[Math.floor(calls.length / 2)], putsPerRequest: res[0].puts, lastServerTiming: res[res.length - 1].serverTiming }))
  proc2.kill()
} finally { try { proc.kill() } catch {} s3.stop(true); raw.close(); for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } try { unlinkSync(DB_LOG) } catch {} }
