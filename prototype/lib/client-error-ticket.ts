// BugHerd sub-project A, task 2: fingerprint a client-side error and
// create-or-bump a deduped fb_ feedback ticket, masking PII before persist.
import { sha256hex } from "./crypto"
import { maskPii, maskDeep } from "./data-masking"
import { insertFeedback, bumpFeedbackRecurrence, findFeedbackBySignature, updateFeedbackMeta } from "./db"

// I2 fix: spec §4 requires URL secrets (session/auth tokens etc in query strings) be redacted
// via the SAME key vocabulary as @klavity/core/capture's redactUrl/SECRET_KEY_RE. The prototype
// server isn't in the pnpm workspace that package lives in (packages/* only — prototype/ is a
// separate app), so a clean `import { redactUrl } from "@klavity/core/capture"` isn't available
// here; this replicates the same query-key redaction inline instead of adding a cross-app dep.
// Regex-based (not URL-parsed) so it also catches secrets embedded in non-URL text, e.g. a
// network-error message like "0 https://api.x.com/y?session=abc&otp=123".
const SECRET_KEY_RE =
  /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp|sig)$/i

function redactUrlSecrets(raw: string): string {
  return String(raw || "").replace(/([?&])([^=&\s]+)=([^&\s]*)/g, (m, sep, k, _v) =>
    SECRET_KEY_RE.test(k) ? `${sep}${k}=REDACTED` : m)
}

// Deep-walk variant so query secrets are stripped from every string in the (arbitrary-shaped)
// captured client context — not just the top-level message — before it's masked + persisted.
function redactUrlSecretsDeep<T>(value: T): T {
  if (typeof value === "string") return redactUrlSecrets(value) as unknown as T
  if (Array.isArray(value)) return value.map((v) => redactUrlSecretsDeep(v)) as unknown as T
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = redactUrlSecretsDeep(v)
    return out as T
  }
  return value
}

// I3 fix: statuses the app's ticket state machine ("new" | "open" | "in_progress" | "done" |
// "dismissed" — see tickets-kanban.test.ts) treats as resolved/closed. A recurrence of an error
// whose ticket already landed here must re-open it (spec §3) rather than silently bump a closed row.
const RESOLVED_STATUSES = new Set(["done", "dismissed", "resolved", "closed"])

export type ClientError = {
  kind: "error" | "unhandledrejection" | "console.error" | "network"
  message: string
  stack?: string
  pageUrl: string
  selector?: string
  status?: number
}

const norm = (s?: string) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim().replace(/\d+/g, "#")

const topFrame = (stack?: string) =>
  String(stack || "").split("\n").map(s => s.trim()).find(Boolean) || ""

export function clientErrorSignature(projectId: string, e: ClientError): string {
  const pathname = (() => {
    try { return new URL(e.pageUrl, "http://x").pathname } catch { return "" }
  })()
  return sha256hex([
    projectId,
    e.kind === "network" ? "network" : "js",
    norm(e.message),
    norm(pathname),
    norm(topFrame(e.stack)),
    e.selector || "",
  ].join("\n")).slice(0, 32)
}

export function severityFor(e: ClientError): "high" | "medium" | "low" {
  if (e.kind === "error" || e.kind === "unhandledrejection") return "high"
  if (e.kind === "network") return (e.status || 0) >= 500 || e.status === 0 ? "medium" : "low"
  return "low"
}

export async function recordClientError(
  projectId: string,
  e: ClientError,
  ctx: any,
  opts: { atMs?: number; overCap?: boolean } = {}
): Promise<{ id: string; created: boolean }> {
  const atMs = opts.atMs ?? Date.now()
  const signature = clientErrorSignature(projectId, e)

  const existing = await findFeedbackBySignature(projectId, signature)
  if (existing) {
    // I3: recurrence of an error whose ticket was already resolved/closed re-opens it —
    // set the status back to open BEFORE bumping recurrence (reuses the existing
    // updateFeedbackMeta setter rather than a raw UPDATE).
    if (RESOLVED_STATUSES.has(existing.status)) {
      await updateFeedbackMeta(projectId, existing.id, { status: "open" })
    }
    await bumpFeedbackRecurrence(existing.id, atMs)
    return { id: existing.id, created: false }
  }

  if (opts.overCap) {
    // Over the per-project cap and no existing ticket to bump onto — drop.
    // Caller is responsible for logging this decision.
    return { id: "", created: false }
  }

  // I2: strip URL secrets (session/auth/otp/etc query params) BEFORE PII masking/persistence.
  const message = maskPii(redactUrlSecrets(String(e.message || ""))).slice(0, 2000)
  const severity = severityFor(e)
  const priority = severity === "high" ? "high" : severity === "medium" ? "medium" : "low"

  const host = (() => { try { return new URL(e.pageUrl).host } catch { return null } })()
  const path = (() => { try { return new URL(e.pageUrl).pathname } catch { return null } })()

  // M5: persist a scrubbed stack (dropped previously — only used for the signature hash) so
  // tickets stay debuggable. Folded into clientContext, which is already maskDeep'd below, and
  // itself first passed through the same URL-secret redaction as the message.
  const ctxWithStack = e.stack
    ? { ...(ctx || {}), clientErrorStack: String(e.stack).slice(0, 4000) }
    : (ctx || {})

  // #544 ACCEPTED EXCEPTION (founder-approved, KLA #544 follow-up): this row is inserted WITHOUT
  // forceNewStatus, so a high-severity client error seeds status='open' (initialFeedbackStatus) and lands
  // directly on the Tickets board with no human triage. That is DELIBERATE — passive error auto-ticketing
  // is opt-in per project and captures real runtime failures meant to be actionable immediately. This is a
  // recognized exception to the untrusted-triage invariant enforced on the /api/feedback ingest path; do not
  // add a forceNewStatus clamp here.
  const id = await insertFeedback({
    projectId,
    observation: `[auto] ${message}`,
    priority,
    source: "auto-error",
    signature,
    urlHost: host,
    urlPath: path,
    clientContext: maskDeep(redactUrlSecretsDeep(ctxWithStack)),
  })

  return { id, created: true }
}
