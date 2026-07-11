// Slack alert for backend and frontend errors.
//
// Mirrors the style of signup-alert.ts: reads the webhook from SLACK_ERROR_WEBHOOK_URL,
// posts a compact Block-Kit message via plain fetch, and is always fire-and-forget.
// Callers MUST use `void reportError(...)` — this function never throws and never blocks
// the caller's critical path.
//
// Set SLACK_ERROR_WEBHOOK_URL to enable; unset → silent no-op (open-core safe default).
// Never hardcode the webhook URL in committed code.

import { safeFetch } from "./safe-fetch"
import { queueAutoTicketError } from "./error-autoticket"

export interface ErrorInfo {
  where: "backend" | "frontend"
  message: string
  traceId?: string
  route?: string
  projectId?: string | null
  status?: number
  stack?: string
}

// ── in-memory dedup / rate-limit ─────────────────────────────────────────────
// Suppress repeated identical (where+message) alerts within DEDUP_WINDOW_MS
// to prevent a flapping error from flooding Slack.
const DEDUP_WINDOW_MS = 60_000 // 60 s
const dedupMap = new Map<string, number>() // key → expiresAt

function isDuplicate(info: ErrorInfo): boolean {
  const key = `${info.where}\x00${info.message.slice(0, 200)}`
  const now = Date.now()
  const exp = dedupMap.get(key)
  if (exp && now < exp) return true
  dedupMap.set(key, now + DEDUP_WINDOW_MS)
  // Opportunistic GC — keep the map small
  if (dedupMap.size > 500) {
    for (const [k, e] of dedupMap) if (now >= e) dedupMap.delete(k)
  }
  return false
}

// ── formatting ──────────────────────────────────────────────────────────────
function envLabel(): string {
  const e = process.env.KLAV_ENV || process.env.NODE_ENV || "unknown"
  return e === "production" ? "prod" : e
}

function formatIST(ms: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short",
  }).format(new Date(ms)) + " IST"
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s
}

function buildErrorPayload(info: ErrorInfo) {
  const env = envLabel()
  const origin = info.where === "backend" ? "Backend" : "Frontend"
  const header = `${origin} error [${env}]`
  const now = Date.now()

  const fields: { type: string; text: string }[] = [
    { type: "mrkdwn", text: `*Error*\n\`${truncate(info.message, 300)}\`` },
  ]
  if (info.route) fields.push({ type: "mrkdwn", text: `*Route / URL*\n${truncate(info.route, 200)}` })
  if (info.traceId) fields.push({ type: "mrkdwn", text: `*Trace ID*\n\`${info.traceId}\`` })
  if (info.status) fields.push({ type: "mrkdwn", text: `*Status*\n${info.status}` })
  if (info.projectId) fields.push({ type: "mrkdwn", text: `*Project*\n\`${truncate(info.projectId, 40)}\`` })
  fields.push({ type: "mrkdwn", text: `*When*\n${formatIST(now)}` })

  const blocks: any[] = [
    { type: "header", text: { type: "plain_text", text: `\u{1F6A8} ${header}`, emoji: true } },
    { type: "section", fields },
  ]

  if (info.stack) {
    const stackSnippet = truncate(info.stack, 800)
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `\`\`\`${stackSnippet}\`\`\`` },
    })
  }

  return {
    text: `${origin} error [${env}]: ${truncate(info.message, 120)}`,
    blocks,
  }
}

// ── main export ──────────────────────────────────────────────────────────────
export async function reportError(info: ErrorInfo): Promise<void> {
  queueAutoTicketError(info)

  const webhook = process.env.SLACK_ERROR_WEBHOOK_URL
  if (!webhook) return // disabled — safe default for open-core

  if (isDuplicate(info)) return // suppress flapping

  try {
    const payload = buildErrorPayload(info)
    const res = await safeFetch(
      webhook,
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) },
      { allowHosts: ["hooks.slack.com"] },
    )
    if (!res.ok) console.error(`error-alert: Slack webhook returned ${res.status}`)
  } catch (err: any) {
    console.error("error-alert (non-fatal):", err?.message || err)
  }
}

// ── test helpers (exported for unit tests only) ──────────────────────────────
export function _resetDedup(): void { dedupMap.clear() }
export { isDuplicate as _isDuplicate, buildErrorPayload as _buildErrorPayload }
