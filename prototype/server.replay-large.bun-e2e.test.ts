// KLA-757 (hang) / KLA-759 (blank) — MANDATORY real-browser integration test for the /replay-frame viewer.
//
// The repo lesson (see MEMORY: "hermetic tests miss real-browser replay bugs") is that string-assertion
// tests on the inline boot script CANNOT catch a frozen tab: the freeze is a SYNCHRONOUS main-thread block
// inside new rrweb.Replayer(...) that only manifests in a real browser on a LARGE event array. This test
// drives the REAL boot script in a REAL headless Chromium against a REAL Bun server that serves a LARGE
// synthetic replay (~20k rrweb events), and asserts the tab does NOT freeze:
//   (a) a player iframe mounts under #klvhost within ~5s (bounded mount, not the old unbounded freeze),
//   (b) a timer scheduled in the page at load STILL fires during load (proves the main thread was free), and
//   (c) the honest "Large session" bounded-window notice appears.
//
// This is the guard that would have caught the KLA-757 hang.

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { chromium, type Browser } from "playwright"

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-rlarge-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema — mirrors server.feedback-replay.test.ts (only the tables the feedback+replay path touches).
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS login_otps (email TEXT NOT NULL, code TEXT NOT NULL, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE TABLE IF NOT EXISTS memberships (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(workspace_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, contact_email TEXT, recurrence_count INTEGER NOT NULL DEFAULT 1, recurrence_dates_json TEXT, last_seen_at INTEGER, issue_key TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback_replays (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, events_gz TEXT NOT NULL, n_events INTEGER, bytes INTEGER, trimmed INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS feedback_replay_idx ON feedback_replays(project_id, feedback_id)`)

const now = Date.now()
await rawExec(`INSERT INTO accounts (id, name, owner_email, domain, plan, created_at) VALUES ('a1','Acct','owner@test.local','test.local','free',?)`, [now])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES ('am1','a1','owner@test.local','admin',?)`, [now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES ('p1','a1','Proj','active','auto','named','{}','support',?,?)`, [now, now])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES ('pm1','p1','owner@test.local','admin',?)`, [now])
await rawExec(`INSERT INTO users (email, name, created_at) VALUES ('owner@test.local','Owner',?)`, [now])

// A LARGE synthetic replay: a valid rebuildable [Meta, FullSnapshot] head + ~20k cheap incremental mouse-move
// events. rrweb applies incrementals sequentially from the full snapshot, so the client's bounded contiguous
// prefix is coherent. The full snapshot is a real document tree so rrweb.Replayer builds an iframe.
function largeReplayEvents(nIncremental: number) {
  const t0 = 1000
  const meta = { type: 4, timestamp: t0, data: { href: "https://test.local/big", width: 1280, height: 720 } }
  const full = {
    type: 2, timestamp: t0 + 10,
    data: {
      node: {
        type: 0, id: 1, childNodes: [
          { type: 1, name: "html", publicId: "", systemId: "", id: 2 },
          { type: 2, tagName: "html", attributes: {}, id: 3, childNodes: [
            { type: 2, tagName: "head", attributes: {}, id: 4, childNodes: [] },
            { type: 2, tagName: "body", attributes: {}, id: 5, childNodes: [
              { type: 2, tagName: "div", attributes: { id: "app" }, id: 6, childNodes: [
                { type: 3, textContent: "Hello large replay", id: 7 },
              ] },
            ] },
          ] },
        ],
      },
      initialOffset: { left: 0, top: 0 },
    },
  }
  const ev: any[] = [meta, full]
  for (let i = 0; i < nIncremental; i++) {
    ev.push({ type: 3, timestamp: t0 + 100 + i, data: { source: 1, positions: [{ x: i % 200, y: (i * 3) % 200, id: 5, timeOffset: 0 }] } })
  }
  return ev
}

let serverPort: number, serverProc: ReturnType<typeof Bun.spawn>, BASE: string, sessionCookie = ""
let browser: Browser
let bigFbId = ""
let heavyFbId = ""
let cjkFbId = ""

beforeAll(async () => {
  serverPort = await freePort()
  BASE = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: { ...process.env, PORT: String(serverPort), TURSO_DATABASE_URL: "file:" + srvDbFile, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local", KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "test-key" },
    stdout: "pipe", stderr: "pipe",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(150)
  }
  // Log in owner@test.local via dev-OTP to get a session cookie.
  const reqRes = await fetch(`${BASE}/api/auth/request`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "owner@test.local" }) })
  const reqJson = await reqRes.json()
  const code = String(reqJson.devCode || "")
  const ver = await fetch(`${BASE}/api/auth/verify`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "owner@test.local", code }) })
  sessionCookie = (ver.headers.get("set-cookie") || "").split(";")[0]

  // Seed the LARGE replay through the real ingest path.
  const fd = new FormData()
  fd.set("description", "big replay hang repro"); fd.set("page_url", "https://test.local/big"); fd.set("project_id", "p1")
  fd.set("replay_events", JSON.stringify(largeReplayEvents(20000)))
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { cookie: sessionCookie } })
  const j = await r.json(); bigFbId = String(j.id)

  // QA C3-1: seed a BYTE-HEAVY, LOW-event-count replay — the ACTUAL prod freeze mode (one giant DOM/text
  // node, not 20k cheap events). This bypasses the server's ~6MB ingest cap by inserting the stored
  // base64(gzip(JSON)) row directly (same encoding as lib/feedback-replay.ts encodeReplay), so the viewer's
  // BYTE cap (MOUNT_BYTES_CAP) path — which boundedSlice() can't shrink (few events) — must degrade to toolarge.
  heavyFbId = "fb_heavy_" + ts
  const heavyEvents = [
    { type: 4, timestamp: now, data: { href: "https://test.local/heavy", width: 1280, height: 720 } },
    { type: 2, timestamp: now + 10, data: { node: { type: 0, id: 1, childNodes: [
      { type: 1, name: "html", publicId: "", systemId: "", id: 2 },
      { type: 2, tagName: "html", attributes: {}, id: 3, childNodes: [
        { type: 2, tagName: "head", attributes: {}, id: 4, childNodes: [] },
        { type: 2, tagName: "body", attributes: {}, id: 5, childNodes: [
          { type: 3, textContent: "x".repeat(7_000_000), id: 6 },  // ~7MB text node → JSON > MOUNT_BYTES_CAP (6MB)
        ] },
      ] },
    ] }, initialOffset: { top: 0, left: 0 } } },
    { type: 3, timestamp: now + 20, data: { source: 1, positions: [{ x: 1, y: 1, id: 5, timeOffset: 0 }] } },
  ]
  const heavyJson = JSON.stringify(heavyEvents)
  const heavyGzB64 = Buffer.from(Bun.gzipSync(Buffer.from(heavyJson))).toString("base64")
  await rawExec(`INSERT INTO feedback (id, project_id, actor_email, observation, status, created_at) VALUES (?,?,?,?,?,?)`,
    [heavyFbId, "p1", "owner@test.local", "byte-heavy replay", "open", now])
  await rawExec(`INSERT INTO feedback_replays (id, feedback_id, project_id, events_gz, n_events, bytes, trimmed, created_at) VALUES (?,?,?,?,?,?,?,?)`,
    ["fr_heavy_" + ts, heavyFbId, "p1", heavyGzB64, heavyEvents.length, heavyJson.length, 0, now])

  // QA C2-2 (round 2): a MULTIBYTE-heavy replay. 3M CJK chars = ~3M UTF-16 code units (UNDER the 6MB/12MB
  // caps if measured as txt.length) but ~9M UTF-8 BYTES (OVER MOUNT_BYTES_CAP). This slips past the old
  // char-count thresholds and would still mount+freeze; the byte-accurate check must degrade it to toolarge.
  cjkFbId = "fb_cjk_" + ts
  const cjkEvents = JSON.parse(JSON.stringify(heavyEvents))
  cjkEvents[1].data.node.childNodes[1].childNodes[1].childNodes[0].textContent = "一".repeat(3_000_000)
  const cjkJson = JSON.stringify(cjkEvents)
  const cjkGzB64 = Buffer.from(Bun.gzipSync(Buffer.from(cjkJson))).toString("base64")
  await rawExec(`INSERT INTO feedback (id, project_id, actor_email, observation, status, created_at) VALUES (?,?,?,?,?,?)`,
    [cjkFbId, "p1", "owner@test.local", "cjk-heavy replay", "open", now])
  await rawExec(`INSERT INTO feedback_replays (id, feedback_id, project_id, events_gz, n_events, bytes, trimmed, created_at) VALUES (?,?,?,?,?,?,?,?)`,
    ["fr_cjk_" + ts, cjkFbId, "p1", cjkGzB64, cjkEvents.length, cjkJson.length, 0, now])

  browser = await chromium.launch({ headless: true })
}, 60_000)

afterAll(async () => { try { await browser?.close() } catch {} ; serverProc?.kill(); rawClient.close() })

test("the large replay stored ~20k events (above the client MOUNT_EVENT_CAP)", async () => {
  expect(bigFbId).toBeTruthy()
  const row = await rawClient.execute({ sql: "SELECT n_events FROM feedback_replays WHERE feedback_id=?", args: [bigFbId] })
  expect(row.rows.length).toBe(1)
  // 2 head events + 20000 incrementals; server byte-cap (10MB) does not trim these cheap events.
  expect(Number(row.rows[0].n_events)).toBeGreaterThan(6000)
})

test("the shipped boundedSlice() builds a contiguous coherent prefix (unit, extracted from boot)", async () => {
  // Extract the exact boundedSlice function from the shipped inline boot and execute it against several shapes
  // — this is the pure-helper guard the ticket asks for (leading [Meta,Full] preserved, contiguous prefix,
  // length<=cap, and the no-reachable-snapshot -> null degrade the caller turns into 'toolarge').
  const r = await fetch(`${BASE}/replay-frame?fb=${encodeURIComponent(bigFbId)}`, { headers: { cookie: sessionCookie } })
  const html = await r.text()
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
  const boot = scripts.find((s) => s.includes("DL_TIMEOUT")) as string
  const m = boot.match(/function boundedSlice\(ev,cap\)\{[\s\S]*?return ev\.slice\(0,cap\)\}/)
  expect(m).toBeTruthy()
  const boundedSlice = new Function(`${m![0]} return boundedSlice;`)() as (ev: any[], cap: number) => any[] | null

  const meta = { type: 4 }, full = { type: 2 }
  const mkBig = (n: number) => { const a: any[] = [meta, full]; for (let i = 0; i < n; i++) a.push({ type: 3, i }); return a }

  // small array (<=cap) -> returned unchanged (no bounding).
  const small = [meta, full, { type: 3 }]
  expect(boundedSlice(small, 6000)).toBe(small)

  // large array -> contiguous prefix of exactly `cap`, leading [Meta,Full] preserved.
  const big = mkBig(20000)
  const sliced = boundedSlice(big, 6000)!
  expect(sliced.length).toBe(6000)
  expect(sliced[0]).toBe(meta)
  expect(sliced[1]).toBe(full)
  // contiguous prefix: element i is exactly big[i].
  for (let i = 0; i < sliced.length; i++) expect(sliced[i]).toBe(big[i])

  // no full snapshot reachable within the cap -> null (caller degrades to 'toolarge').
  const noFullEarly = [meta, ...Array.from({ length: 10000 }, () => ({ type: 3 })), full]
  expect(boundedSlice(noFullEarly, 6000)).toBeNull()
})

test("a LARGE replay mounts a bounded window WITHOUT freezing the tab (real browser)", async () => {
  const cookieName = sessionCookie.split("=")[0]
  const cookieVal = sessionCookie.slice(cookieName.length + 1)
  const ctx = await browser.newContext()
  await ctx.addCookies([{ name: cookieName, value: cookieVal, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }])
  const page = await ctx.newPage()

  // A timer scheduled BEFORE the replay boots. If the main thread froze inside a synchronous unbounded mount
  // (the KLA-757 bug), this counter would stall. With the bounded mount it keeps ticking during load.
  await page.addInitScript(() => {
    ;(window as any).__ticks = 0
    ;(window as any).__timerFired = false
    setInterval(() => { (window as any).__ticks++ }, 50)
    setTimeout(() => { (window as any).__timerFired = true }, 400)
  })

  await page.goto(`${BASE}/replay-frame?fb=${encodeURIComponent(bigFbId)}`, { waitUntil: "domcontentloaded" })

  // (a) the player iframe must mount within ~5s — the old unbounded synchronous mount would hang the tab.
  await page.waitForSelector("#klvhost iframe", { timeout: 6000 })

  // (b) the concurrently-scheduled timer must fire AND the tick counter advance — proof the main thread was
  // never frozen for the load. (The old unbounded synchronous mount would starve these timers entirely.)
  await page.waitForFunction(() => (window as any).__timerFired === true && (window as any).__ticks > 2, { timeout: 4000 })
  const ticks = await page.evaluate(() => (window as any).__ticks)
  expect(ticks).toBeGreaterThan(2)

  // (c) the honest bounded-window notice appears (we mounted only the leading slice of the big session).
  const notice = await page.waitForSelector("#klvlargenotice", { timeout: 6000 })
  const noticeText = await notice.textContent()
  expect(noticeText || "").toContain("Large session")

  await ctx.close()
}, 45_000)

test("a BYTE-HEAVY low-event replay degrades to 'too large' WITHOUT freezing (real browser, QA C2-2/C3-1)", async () => {
  // This is the ACTUAL prod freeze mode: few events but a giant DOM/text payload. boundedSlice() can't shrink
  // it (event count is small), so the fix must degrade to toolarge() instead of the unbounded synchronous mount.
  const cookieName = sessionCookie.split("=")[0]
  const cookieVal = sessionCookie.slice(cookieName.length + 1)
  const ctx = await browser.newContext()
  await ctx.addCookies([{ name: cookieName, value: cookieVal, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }])
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    ;(window as any).__ticks = 0
    setInterval(() => { (window as any).__ticks++ }, 50)
  })
  await page.goto(`${BASE}/replay-frame?fb=${encodeURIComponent(heavyFbId)}`, { waitUntil: "domcontentloaded" })

  // The honest "too large to play here" message must appear — NOT a frozen tab, NOT a mounted player.
  await page.waitForFunction(() => /too large/i.test(document.body.innerText), { timeout: 8000 })
  // Main thread stayed responsive while degrading (the whole point — no synchronous unbounded mount).
  await page.waitForFunction(() => (window as any).__ticks > 2, { timeout: 4000 })
  // No player iframe mounted (we degraded before the rebuild) and no false "Large session" bounded notice.
  expect(await page.$("#klvhost iframe")).toBeNull()
  expect(await page.$("#klvlargenotice")).toBeNull()
  await ctx.close()
}, 45_000)

test("a MULTIBYTE-heavy replay (CJK) is bounded by true UTF-8 bytes, not char count (QA C2-2 r2)", async () => {
  // ~3M CJK chars: under the caps as UTF-16 code units but ~9M UTF-8 bytes. The char-count check (txt.length)
  // would let it through and freeze; the byte-accurate check degrades it to 'too large'.
  const cookieName = sessionCookie.split("=")[0]
  const cookieVal = sessionCookie.slice(cookieName.length + 1)
  const ctx = await browser.newContext()
  await ctx.addCookies([{ name: cookieName, value: cookieVal, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }])
  const page = await ctx.newPage()
  await page.addInitScript(() => { ;(window as any).__ticks = 0; setInterval(() => { (window as any).__ticks++ }, 50) })
  await page.goto(`${BASE}/replay-frame?fb=${encodeURIComponent(cjkFbId)}`, { waitUntil: "domcontentloaded" })
  await page.waitForFunction(() => /too large/i.test(document.body.innerText), { timeout: 8000 })
  await page.waitForFunction(() => (window as any).__ticks > 2, { timeout: 4000 })
  expect(await page.$("#klvhost iframe")).toBeNull()
  await ctx.close()
}, 45_000)
