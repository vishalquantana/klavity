// KLAVITYKLA-217 (JTBD 1.5): /api/feedback must persist the FULL per-image annotation map (byIndex),
// not just screenshot #0's markup, and must sanitize EVERY image's shapes — not only index 0. Also
// verifies single-image payloads behave exactly as before (backward compat), and that a malformed
// annotations blob never fails the submission.
//
// Subprocess-against-temp-DB pattern (mirrors server.feedback-context.test.ts): raw-seed a temp SQLite
// DB, spawn the real server, hit /api/feedback over HTTP, read back feedback.annotations_json.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-fann-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
// SQLITE_BUSY guard: the spawned server and this rawClient write the same file: DB concurrently;
// WAL + a 5s busy_timeout make writers WAIT for the lock instead of erroring under CI contention.
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema — the server's initDb migration adds annotations_json + newer columns on startup.
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, contact_email TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)

const now = Date.now()
await rawExec(`INSERT INTO accounts (id, name, owner_email, domain, plan, created_at) VALUES ('a1', 'Test', 'owner@test.local', 'test.local', 'free', ?)`, [now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, widget_cta_url, widget_notify_email, created_at, updated_at) VALUES ('p1', 'a1', 'Test Project', 'active', 'auto', 'named', '{}', 'support', '', '', ?, ?)`, [now, now])

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 34000 + Math.floor(Math.random() * 1000)
  BASE = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort), TURSO_DATABASE_URL: "file:" + srvDbFile, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe", stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(150)
  }
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

async function submit(annotations: any, description: string) {
  const fd = new FormData()
  fd.set("description", description)
  fd.set("page_url", "https://klavity.in/snap")
  fd.set("project_id", "p1")
  if (annotations !== undefined) fd.set("annotations_json", typeof annotations === "string" ? annotations : JSON.stringify(annotations))
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { origin: BASE } })
  expect(r.status).toBe(200)
  const j = await r.json()
  expect(j.saved).toBe(true)
  expect(j.id).toBeTruthy()
  const row = await rawClient.execute({ sql: "SELECT annotations_json FROM feedback WHERE id=?", args: [j.id] })
  expect(row.rows.length).toBe(1)
  const raw = row.rows[0].annotations_json
  return raw == null ? null : JSON.parse(String(raw))
}

test("per-image map: shapes on images 0 and 2 both persist and are sanitized", async () => {
  // Reporter annotated screenshot #1 (index 0) and screenshot #3 (index 2). The full byIndex map travels.
  const payload = {
    // top-level = index-0 hoisted (backward compat)
    w: 1200, h: 800,
    shapes: [{ type: "rect", x: 10, y: 20, w: 100, h: 40, color: "#ef4444" }],
    region: null, selector: null,
    byIndex: {
      "0": { w: 1200, h: 800, shapes: [{ type: "rect", x: 10, y: 20, w: 100, h: 40, color: "#ef4444" }] },
      "2": { w: 640, h: 480, shapes: [{ type: "arrow", x1: 5, y1: 5, x2: 50, y2: 60, color: "#2563eb" }] },
    },
  }
  const stored = await submit(payload, "multi-image annotations bug")
  expect(stored).not.toBeNull()
  // top-level (index 0) survives
  expect(stored.shapes.length).toBe(1)
  expect(stored.shapes[0].type).toBe("rect")
  // byIndex carries EVERY annotated image, sanitized
  expect(stored.byIndex).toBeTruthy()
  expect(Object.keys(stored.byIndex).sort()).toEqual(["0", "2"])
  expect(stored.byIndex["0"].shapes[0].type).toBe("rect")
  expect(stored.byIndex["2"].shapes[0].type).toBe("arrow")
  expect(stored.byIndex["2"].w).toBe(640)
  expect(stored.byIndex["2"].h).toBe(480)
})

test("every image's shapes are sanitized — disallowed shape types dropped on image 2, not just index 0", async () => {
  const payload = {
    w: 1000, h: 700,
    shapes: [{ type: "circle", x: 100, y: 100, rx: 30, ry: 30, color: "#10b981" }],
    byIndex: {
      "0": { w: 1000, h: 700, shapes: [{ type: "circle", x: 100, y: 100, rx: 30, ry: 30 }] },
      "1": { w: 1000, h: 700, shapes: [
        { type: "rect", x: 1, y: 2, w: 3, h: 4 },
        { type: "script", x: 0, y: 0 },          // disallowed → must be stripped
        { type: "arrow", x1: 0, y1: 0, x2: 9, y2: 9, onclick: "evil()" }, // extra prop must not survive
      ] },
    },
  }
  const stored = await submit(payload, "sanitize every image")
  const img1 = stored.byIndex["1"]
  // "script" shape removed, only rect + arrow remain
  expect(img1.shapes.map((s: any) => s.type).sort()).toEqual(["arrow", "rect"])
  // arbitrary/unsafe props are not carried over (allowlisted keys only)
  const arrow = img1.shapes.find((s: any) => s.type === "arrow")
  expect((arrow as any).onclick).toBeUndefined()
})

test("string coords on a NON-zero image are coerced to finite 0 (sanitizer runs per image)", async () => {
  const payload = {
    w: 800, h: 600, shapes: [{ type: "rect", x: 1, y: 1, w: 2, h: 2 }],
    byIndex: {
      "0": { w: 800, h: 600, shapes: [{ type: "rect", x: 1, y: 1, w: 2, h: 2 }] },
      // Hostile string coords on image #3 must coerce to finite 0, proving the per-image sanitizer
      // (not only index 0) runs. (Non-finite numbers like Infinity/NaN JSON-serialize to null and
      // would be dropped before reaching the server, so strings are the meaningful hostile input here.)
      "3": { w: 800, h: 600, shapes: [{ type: "rect", x: "javascript:1" as any, y: "alert(1)" as any, w: 5, h: 5 }] },
    },
  }
  const stored = await submit(payload, "coerce coords on image 3")
  const s = stored.byIndex["3"].shapes[0]
  expect(s.x).toBe(0)   // hostile string coerced to finite 0
  expect(s.y).toBe(0)   // hostile string coerced to finite 0
  expect(s.w).toBe(5)   // valid coord preserved
})

test("single-image report behaves exactly as before (no byIndex → top-level only)", async () => {
  const payload = {
    w: 1024, h: 768,
    shapes: [{ type: "text", x: 40, y: 40, text: "here", color: "#111" }],
    region: null, selector: null,
  }
  const stored = await submit(payload, "single image legacy shape")
  expect(stored).not.toBeNull()
  expect(stored.shapes.length).toBe(1)
  expect(stored.shapes[0].type).toBe("text")
  expect(stored.shapes[0].text).toBe("here")
  // No byIndex was sent → server does not fabricate one
  expect(stored.byIndex).toBeUndefined()
})

test("byIndex present but index-0 empty — lowest annotated image is hoisted for the single-image drawer", async () => {
  const payload = {
    // no top-level shapes; only images 1 and 4 annotated
    byIndex: {
      "1": { w: 500, h: 400, shapes: [{ type: "rect", x: 1, y: 1, w: 10, h: 10 }] },
      "4": { w: 500, h: 400, shapes: [{ type: "circle", x: 5, y: 5, rx: 2, ry: 2 }] },
    },
  }
  const stored = await submit(payload, "no index-0, later images annotated")
  expect(stored).not.toBeNull()
  // hoisted top-level = lowest annotated index (1) so the existing drawer still shows an overlay
  expect(stored.shapes[0].type).toBe("rect")
  expect(Object.keys(stored.byIndex).sort()).toEqual(["1", "4"])
  expect(stored.byIndex["4"].shapes[0].type).toBe("circle")
})

test("line + count shapes survive sanitize (every hero tool must round-trip, not just rect/arrow/circle/pen/text)", async () => {
  // Regression: the sanitizer allowlist omitted `line` and `count`, so those two hero tools' markup was
  // silently stripped on the server and never reached the ticket. Both are first-class tools (keys l / c).
  const payload = {
    w: 900, h: 600,
    shapes: [
      { type: "line", x1: 10, y1: 20, x2: 200, y2: 40, color: "#f59e0b" },
      { type: "count", x: 300, y: 120, n: 3, color: "#2563eb" },
    ],
  }
  const stored = await submit(payload, "line + count round-trip")
  expect(stored).not.toBeNull()
  expect(stored.shapes.map((s: any) => s.type).sort()).toEqual(["count", "line"])
  const line = stored.shapes.find((s: any) => s.type === "line")
  expect(line.x1).toBe(10); expect(line.x2).toBe(200); expect(line.y2).toBe(40)
  const count = stored.shapes.find((s: any) => s.type === "count")
  expect(count.n).toBe(3)          // the counter's sequence number must survive
  expect(count.x).toBe(300); expect(count.y).toBe(120)
})

test("pinned selector-only report (KLA-228): no drawn shapes, selector persists for the drawer", async () => {
  // A report where the reporter only pinned an element via the on-page picker (no drawing). The selector
  // must survive so the dashboard drawer can surface the pinned DOM node.
  const stored = await submit({ selector: "main > .cart button.checkout" }, "selector-only pin")
  expect(stored).not.toBeNull()
  expect(stored.selector).toBe("main > .cart button.checkout")
  expect(Array.isArray(stored.shapes) ? stored.shapes.length : 0).toBe(0)
})

test("malformed annotations_json never fails the submission", async () => {
  const stored = await submit("{not valid json", "bad annotations blob")
  expect(stored).toBeNull()
})
