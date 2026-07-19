import { db } from "./db"
import type { ErrorInfo } from "./error-alert"
import { sha256hex } from "./crypto"
import { planeConnector } from "./connectors/plane"
import { safeFetch } from "./safe-fetch"

// KLAVITYKLA-347: this MUST be Plane's full project UUID. The Plane REST API resolves
// /projects/{id}/ by UUID only — the short 8-char prefix ("05ea72ad") that used to live here
// 404s on every single call, which silently disabled error auto-ticketing in prod.
const PLANE_PROJECT_ID_DEFAULT = "05ea72ad-a53f-46d5-b37e-7874ce2a65b4"
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SEEN_AGAIN_COMMENT_WINDOW_MS = 60 * 60 * 1000
const FAILURE_ALERT_THRESHOLD = 3
const FAILURE_ALERT_COOLDOWN_MS = 6 * 60 * 60 * 1000

type ErrorTicketRow = {
  signature: string
  ticket_key: string | null
  ticket_url: string | null
  count: number
  first_seen: number
  last_seen: number
}

function enabled(): boolean {
  return Boolean(process.env.KLAV_TICKETS_PLANE_KEY) && process.env.KLAV_ERROR_AUTOTICKET === "1"
}

function planeHost(): string {
  return process.env.KLAV_TICKETS_PLANE_HOST || "https://plane.quantana.top"
}

function planeWorkspace(): string {
  return process.env.KLAV_TICKETS_PLANE_WORKSPACE || "qbuilder"
}

export function planeProject(): string {
  const fromEnv = (process.env.KLAV_TICKETS_PLANE_PROJECT || "").trim()
  // A non-UUID override (e.g. a truncated id pasted from a URL) would 404 every request,
  // so we ignore it and fall back to the known-good default rather than going dark.
  if (fromEnv && UUID_RE.test(fromEnv)) return fromEnv
  if (fromEnv) console.error(`error-autoticket: ignoring non-UUID KLAV_TICKETS_PLANE_PROJECT=${fromEnv}`)
  return PLANE_PROJECT_ID_DEFAULT
}

/** The exact endpoint Plane requires: POST {host}/api/v1/workspaces/{ws}/projects/{uuid}/issues/ */
export function planeIssuesUrl(): string {
  return `${planeHost().replace(/\/$/, "")}/api/v1/workspaces/${planeWorkspace()}/projects/${planeProject()}/issues/`
}

// ── loud-failure tracking (KLAVITYKLA-347) ───────────────────────────────────
// Fail-open on the request path is right (never break a user request) but a persistent
// failure must not stay invisible: after N consecutive failures we raise a distinct Slack
// alert so a dead safety net can't go unnoticed again.
let consecutiveFailures = 0
let lastFailureAlertAt = 0

export function _resetAutoTicketFailureState(): void {
  consecutiveFailures = 0
  lastFailureAlertAt = 0
}

async function noteFailure(err: any, url: string): Promise<void> {
  consecutiveFailures++
  console.error(
    `error-autoticket FAILED (non-fatal, ${consecutiveFailures} consecutive): ${err?.message || err} — POST ${url}`,
  )
  if (consecutiveFailures < FAILURE_ALERT_THRESHOLD) return

  const webhook = process.env.SLACK_ERROR_WEBHOOK_URL
  const now = Date.now()
  if (!webhook || now - lastFailureAlertAt < FAILURE_ALERT_COOLDOWN_MS) return
  lastFailureAlertAt = now
  try {
    await safeFetch(
      webhook,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text:
            `:rotating_light: Klavity error auto-ticketing is DOWN — ${consecutiveFailures} consecutive failures.\n` +
            `Last error: ${String(err?.message || err).slice(0, 300)}\nEndpoint: ${url}`,
        }),
      },
      { allowHosts: ["hooks.slack.com"] },
    )
  } catch (e: any) {
    console.error("error-autoticket: failure alert could not be delivered:", e?.message || e)
  }
}

function normalizeText(input: string | null | undefined): string {
  return String(input || "")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "<uuid>")
    .replace(/\b\d{4}-\d{2}-\d{2}(?:[T ][0-9:.+-]+Z?)?\b/g, "<timestamp>")
    .replace(/\b\d{10,13}\b/g, "<timestamp>")
    .replace(/\b(?:0x)?[0-9a-f]{16,}\b/gi, "<id>")
    .replace(/\b(?:proj|sim|fb|run|trail|step|acct|sess|conn|exp)_[A-Za-z0-9_-]+\b/g, "<id>")
    .replace(/\b\d+\b/g, "<num>")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

function topStackFrame(stack?: string): string {
  if (!stack) return ""
  const line = stack.split(/\r?\n/).find((s) => /\bat\b|:\d+:\d+|:\d+\)?$/.test(s.trim()))
  return normalizeText(line || "")
}

export function errorTicketSignature(info: ErrorInfo): string {
  const raw = [
    info.where,
    normalizeText(info.message),
    normalizeText(info.route),
    topStackFrame(info.stack),
  ].join("\n")
  return sha256hex(raw).slice(0, 32)
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!))
}

function issueBody(info: ErrorInfo, signature: string, now: number): string {
  const rows = [
    ["Where", info.where],
    ["Route", info.route || "(none)"],
    ["Trace ID", info.traceId || "(none)"],
    ["Status", info.status ? String(info.status) : "(none)"],
    ["Project", info.projectId || "(none)"],
    ["Signature", signature],
    ["First seen", new Date(now).toISOString()],
  ]
  const list = rows.map(([k, v]) => `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</li>`).join("")
  const stack = info.stack ? `<h3>Stack</h3><pre>${escapeHtml(info.stack.slice(0, 4000))}</pre>` : ""
  return `<p>Klavity auto-filed this unique ${escapeHtml(info.where)} error.</p><h3>Error</h3><pre>${escapeHtml(info.message.slice(0, 2000))}</pre><ul>${list}</ul>${stack}`
}

async function addSeenAgainComment(row: ErrorTicketRow, info: ErrorInfo, now: number): Promise<void> {
  if (!row.ticket_url || now - row.last_seen < SEEN_AGAIN_COMMENT_WINDOW_MS) return
  const issueId = row.ticket_url.split("/").filter(Boolean).pop()
  if (!issueId) return

  const host = planeHost().replace(/\/$/, "")
  const apiUrl = `${host}/api/v1/workspaces/${planeWorkspace()}/projects/${planeProject()}/issues/${issueId}/comments/`
  const body = `<p>Seen again at ${escapeHtml(new Date(now).toISOString())}. Count: ${row.count + 1}.</p><p>Latest route: ${escapeHtml(info.route || "(none)")}</p>`
  await safeFetch(
    apiUrl,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": process.env.KLAV_TICKETS_PLANE_KEY! },
      body: JSON.stringify({ comment_html: body }),
    },
    { allowLoopbackInTest: true },
  ).catch(() => undefined)
}

export async function autoTicketError(info: ErrorInfo): Promise<void> {
  if (!enabled() || !db) return

  try {
    const signature = errorTicketSignature(info)
    const now = Date.now()
    const existing = await db.execute({ sql: "SELECT * FROM error_tickets WHERE signature=?", args: [signature] })
    if (existing.rows.length) {
      const row = existing.rows[0] as any as ErrorTicketRow
      await db.execute({
        sql: "UPDATE error_tickets SET count=count+1, last_seen=? WHERE signature=?",
        args: [now, signature],
      })
      await addSeenAgainComment(row, info, now)
      return
    }

    const result = await planeConnector.createIssue(
      {
        title: `[${info.where}] ${info.message.slice(0, 120)}`,
        body: issueBody(info, signature, now),
        priority: info.status && info.status >= 500 ? "high" : "medium",
        url: info.route || null,
        simName: null,
        createdAt: now,
        klavityUrl: info.route || "",
      },
      {
        host: planeHost(),
        workspace: planeWorkspace(),
        project_id: planeProject(),
        token: process.env.KLAV_TICKETS_PLANE_KEY!,
      },
    )
    await db.execute({
      sql: `INSERT INTO error_tickets (signature,ticket_key,ticket_url,count,first_seen,last_seen)
            VALUES (?,?,?,?,?,?)`,
      args: [signature, result.externalKey ?? null, result.externalUrl ?? null, 1, now, now],
    })
    consecutiveFailures = 0
  } catch (err: any) {
    await noteFailure(err, planeIssuesUrl())
  }
}

export function queueAutoTicketError(info: ErrorInfo): void {
  if (!enabled()) return
  void autoTicketError(info)
}
