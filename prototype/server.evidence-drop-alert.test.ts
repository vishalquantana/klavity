// KLAVITYKLA-453: when a report's screenshot/attachment/recording BYTES fail to upload to object storage
// (S3 unconfigured or a write error), the report still persists but the evidence is dropped. That drop
// must NOT be silent — the ingest fires a best-effort Slack alert with the dropped counts + a SANITIZED
// reason, deduped per (project,reason) so a broken S3 can't spam. This test drives BOTH layers:
//   • unit  — buildEvidenceDroppedPayload redacts secrets; alertEvidenceDropped dedups a rapid repeat.
//   • e2e   — a real /api/feedback submit with a screenshot while S3 is UNCONFIGURED drops the shot, still
//             returns 200 (report persisted), stamps evidence_dropped on the row, and POSTs the Slack alert.
// Subprocess-against-temp-DB pattern, mirrors server.feedback-evidence-only.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  buildEvidenceDroppedPayload,
  alertEvidenceDropped,
  __resetEvidenceAlertDedup,
} from "./lib/mail"

// ── a local Slack webhook receiver: collects every payload POSTed to it ──
function startWebhookReceiver() {
  const received: any[] = []
  const srv = Bun.serve({
    port: 0,
    async fetch(req) {
      try { received.push(await req.json()) } catch { received.push(null) }
      return new Response("ok")
    },
  })
  return { url: `http://localhost:${srv.port}`, received, stop: () => srv.stop(true) }
}

// ── UNIT: payload redacts secrets in the reason (reuses the mail sanitizer) ──
test("buildEvidenceDroppedPayload sanitizes the reason (redacts bearer token + address local-part)", () => {
  const payload: any = buildEvidenceDroppedPayload(
    { projectId: "p1", feedbackId: "fb_1", screenshots: 2, attachments: 1, recordings: 0,
      reason: "S3 write failed for secretuser@corp.internal with Bearer sk-abc123DEF" },
    new Date(0).toISOString(),
  )
  const ctx = payload.blocks.find((b: any) => b.type === "context")
  const reasonText = ctx.elements[0].text
  expect(reasonText).not.toContain("sk-abc123DEF")
  expect(reasonText).toContain("Bearer [redacted]")
  expect(reasonText).not.toContain("secretuser@")
  expect(reasonText).toContain("@corp.internal")
  // dropped counts are surfaced
  expect(JSON.stringify(payload)).toContain("2 screenshot(s), 1 attachment(s), 0 recording(s)")
})

// ── UNIT: dedup suppresses a rapid repeat for the same (project,reason) ──
test("alertEvidenceDropped fires once then dedups a rapid repeat (same project+reason)", async () => {
  const recv = startWebhookReceiver()
  const prev = process.env.SLACK_ALERT_WEBHOOK_URL
  process.env.SLACK_ALERT_WEBHOOK_URL = recv.url
  __resetEvidenceAlertDedup()
  try {
    const e = { projectId: "pX", feedbackId: "fb_a", screenshots: 1, attachments: 0, recordings: 0, reason: "S3 is not configured" }
    await alertEvidenceDropped(e)
    await alertEvidenceDropped({ ...e, feedbackId: "fb_b" }) // same project+reason → suppressed
    expect(recv.received.length).toBe(1)
    // a DIFFERENT reason is a distinct alert (not suppressed)
    await alertEvidenceDropped({ ...e, reason: "S3 write timeout" })
    expect(recv.received.length).toBe(2)
    // nothing-dropped is a no-op
    await alertEvidenceDropped({ projectId: "pX", screenshots: 0, attachments: 0, recordings: 0, reason: "n/a" })
    expect(recv.received.length).toBe(2)
  } finally {
    if (prev === undefined) delete process.env.SLACK_ALERT_WEBHOOK_URL; else process.env.SLACK_ALERT_WEBHOOK_URL = prev
    recv.stop()
  }
})

// ── e2e: real ingest against a running server with S3 UNCONFIGURED ──
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-evd-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, contact_email TEXT, recurrence_count INTEGER NOT NULL DEFAULT 1, recurrence_dates_json TEXT, last_seen_at INTEGER, issue_key TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback_replays (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, events_gz TEXT NOT NULL, n_events INTEGER, bytes INTEGER, trimmed INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)

const now = Date.now()
await rawExec(`INSERT INTO accounts (id, name, owner_email, domain, plan, created_at) VALUES ('a1', 'Test', 'owner@test.local', 'test.local', 'free', ?)`, [now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, widget_cta_url, widget_notify_email, created_at, updated_at) VALUES ('p1', 'a1', 'Test Project', 'active', 'auto', 'named', '{}', 'support', '', '', ?, ?)`, [now, now])

let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string
const alertRecv = startWebhookReceiver()

beforeAll(async () => {
  const serverPort = 38000 + Math.floor(Math.random() * 1000)
  BASE = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort), TURSO_DATABASE_URL: "file:" + srvDbFile, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", KLAV_OPENROUTER_KEY: "",
      // Slack alert webhook points at our in-test receiver so we can assert the drop alert fires.
      SLACK_ALERT_WEBHOOK_URL: alertRecv.url,
      // S3 DELIBERATELY UNCONFIGURED — uploadScreenshotMeta throws → the shot is dropped.
      S3_ENDPOINT: "", S3_BUCKET: "", AWS_ACCESS_KEY_ID: "", AWS_SECRET_ACCESS_KEY: "",
    },
    stdout: "pipe", stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(150)
  }
})

afterAll(() => { serverProc?.kill(); alertRecv.stop(); rawClient.close() })

const PNG_1x1 = Uint8Array.from(atob(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
), c => c.charCodeAt(0))

// The Slack webhook is shared with the mail-failure alert (SendGrid is also unconfigured here), so
// filter to just the evidence-drop alerts by their distinctive marker text.
const isEvidenceAlert = (a: any) => JSON.stringify(a || {}).includes("Report evidence dropped")
const evidenceAlerts = () => alertRecv.received.filter(isEvidenceAlert)

async function waitForEvidenceAlerts(n: number, ms = 4000) {
  const deadline = Date.now() + ms
  while (Date.now() < deadline && evidenceAlerts().length < n) await Bun.sleep(50)
}

test("screenshot dropped (S3 unconfigured): report still persists, evidence_dropped stamped, Slack alert fires", async () => {
  const before = evidenceAlerts().length
  const fd = new FormData()
  fd.set("description", "Checkout button is misaligned")
  fd.set("page_url", "https://klavity.in/checkout")
  fd.set("project_id", "p1")
  fd.set("type", "bug")
  fd.set("screenshots", new File([PNG_1x1], "shot.png", { type: "image/png" }))
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { origin: BASE } })
  // Report submit STILL SUCCEEDS — the drop is non-fatal.
  expect(r.status).toBe(200)
  const j = await r.json(); expect(j.saved).toBe(true); expect(j.id).toBeTruthy()

  // The row is persisted WITHOUT a screenshot, but the drop is stamped (no longer silent).
  const row = await rawClient.execute({ sql: "SELECT screenshot_id, evidence_dropped FROM feedback WHERE id=?", args: [j.id] })
  expect(row.rows.length).toBe(1)
  expect(row.rows[0].screenshot_id).toBeNull()
  expect(Number(row.rows[0].evidence_dropped)).toBe(1)

  // The Slack alert fired with the dropped count + a sanitized reason (S3-not-configured).
  await waitForEvidenceAlerts(before + 1)
  expect(evidenceAlerts().length).toBe(before + 1)
  const alert = evidenceAlerts()[before]
  const blob = JSON.stringify(alert)
  expect(blob).toContain("1 screenshot(s), 0 attachment(s), 0 recording(s)")
  expect(blob.toLowerCase()).toContain("s3 is not configured")
  expect(blob).toContain("p1")
})

test("a rapid second dropped-evidence report on the same project+reason is deduped (no second alert)", async () => {
  const before = evidenceAlerts().length
  const fd = new FormData()
  fd.set("description", "Another broken screenshot upload")
  fd.set("page_url", "https://klavity.in/settings")
  fd.set("project_id", "p1")
  fd.set("type", "bug")
  fd.set("screenshots", new File([PNG_1x1], "shot2.png", { type: "image/png" }))
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { origin: BASE } })
  expect(r.status).toBe(200)
  const j = await r.json(); expect(j.saved).toBe(true)
  // Row still stamped for THIS report even though the Slack alert is suppressed.
  const row = await rawClient.execute({ sql: "SELECT evidence_dropped FROM feedback WHERE id=?", args: [j.id] })
  expect(Number(row.rows[0].evidence_dropped)).toBe(1)
  // Dedup window (10 min) suppresses the repeat Slack post.
  await Bun.sleep(500)
  expect(evidenceAlerts().length).toBe(before)
})

test("a normal report with NO evidence does not fire an evidence-drop alert", async () => {
  const before = evidenceAlerts().length
  const fd = new FormData()
  fd.set("description", "No attachments here")
  fd.set("page_url", "https://klavity.in/form")
  fd.set("project_id", "p1")
  fd.set("type", "bug")
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { origin: BASE } })
  expect(r.status).toBe(200)
  await Bun.sleep(400)
  expect(evidenceAlerts().length).toBe(before)
})
