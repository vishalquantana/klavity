// Widget report submission: transport, failure classification and retry policy (no DOM — unit-testable in node).
//
// A report is prepared ONCE (compressed screenshots, thumbnails, the multipart body) and carries ONE `submission_key`. Every attempt —
// automatic retries and the user's manual Retry — re-sends that same body with that same key, so the server (lib/submissions.ts) can
// recognise a repeat and return the ticket it already created instead of making a second one. This module decides WHEN to retry and
// what to tell the user; it never builds a new key.

export type SubmitErrorKind = "network" | "timeout" | "stalled" | "http"

export class SubmitError extends Error {
  kind: SubmitErrorKind
  status?: number
  /** Safe to re-send (same key → no duplicate)? Network drops, stalls, timeouts, 5xx, 429 and an in-progress 409 are; 4xx rejections are not. */
  retryable: boolean
  retryAfterSec?: number
  /** The server is still working on THIS report (an earlier attempt owns it). Polling for the outcome is not a failed attempt. */
  pending?: boolean
  /** Plain-language message for the pill. */
  userMessage: string
  serverMessage?: string
  constructor(kind: SubmitErrorKind, userMessage: string, o: { status?: number; retryable: boolean; retryAfterSec?: number; serverMessage?: string; pending?: boolean }) {
    super(`submit failed: ${kind}${o.status ? " " + o.status : ""}`)
    this.name = "SubmitError"
    this.kind = kind; this.userMessage = userMessage
    this.status = o.status; this.retryable = o.retryable; this.retryAfterSec = o.retryAfterSec; this.serverMessage = o.serverMessage; this.pending = o.pending
  }
}

/** A fresh idempotency key (one per prepared report). */
export function newSubmissionKey(): string {
  try { const c: any = (globalThis as any).crypto; if (c && typeof c.randomUUID === "function") return c.randomUUID() } catch { /* fall through */ }
  const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`   // RFC-4122-shaped; only uniqueness matters
}

const serverError = (body: string): string => {
  try { const j = JSON.parse(body); return typeof j?.error === "string" ? j.error.slice(0, 300) : "" } catch { return "" }
}

/** Map an HTTP failure to a typed error with a clear message and a retry verdict. */
export function classifyHttpFailure(status: number, bodyText: string, retryAfterHeader?: string | null): SubmitError {
  const msg = serverError(bodyText)
  const ra = Number(retryAfterHeader)
  const retryAfterSec = Number.isFinite(ra) && ra > 0 ? Math.min(ra, 30) : undefined
  let parsed: any = null; try { parsed = JSON.parse(bodyText) } catch { /* not JSON */ }
  if (status === 409) {
    // in_progress: the first attempt is still being processed by the server → wait and re-send (same key). Anything else is final.
    if (parsed?.in_progress || parsed?.retryable === true) {
      const hint = Number(parsed?.retry_after)
      const wait = retryAfterSec ?? (Number.isFinite(hint) && hint > 0 ? Math.min(hint, 30) : 3)
      return new SubmitError("http", "Your report is still being processed on the server — checking again…", { status, retryable: true, retryAfterSec: wait, serverMessage: msg, pending: true })
    }
    return new SubmitError("http", msg || "This report was already submitted by someone else.", { status, retryable: false, serverMessage: msg })
  }
  if (status === 413) return new SubmitError("http", msg || "The files are too large to upload. Remove some and try again.", { status, retryable: false, serverMessage: msg })
  if (status === 429) return new SubmitError("http", "Too many reports right now — retrying shortly…", { status, retryable: true, retryAfterSec: retryAfterSec ?? 10, serverMessage: msg })
  if (status === 401) return new SubmitError("http", msg || "Sign in to Klavity to report on this project.", { status, retryable: false, serverMessage: msg })
  if (status === 403) {
    // A Turnstile hiccup is worth one more try with a fresh token; a real permission problem is not.
    const verification = /verif|challenge|turnstile/i.test(msg)
    return new SubmitError("http", verification ? "Verification didn't complete — retrying…" : (msg || "You don't have permission to report on this project."), { status, retryable: verification, serverMessage: msg })
  }
  if (status === 404) return new SubmitError("http", msg || "This project no longer exists.", { status, retryable: false, serverMessage: msg })
  if (status >= 500) return new SubmitError("http", status === 503 || status === 502 || status === 504 ? "Klavity is busy — retrying…" : "Something went wrong on our side — retrying…", { status, retryable: true, retryAfterSec, serverMessage: msg })
  // other 4xx (400 validation, 422, …): the server says WHY — show it; re-sending the same body cannot succeed.
  return new SubmitError("http", msg || "The report couldn't be submitted.", { status, retryable: false, serverMessage: msg })
}

export function networkFailure(kind: "network" | "timeout" | "stalled"): SubmitError {
  const text = kind === "network" ? "No connection to Klavity — check your network."
    : kind === "stalled" ? "The upload stalled — your connection looks slow or dropped."
    : "Klavity took too long to answer."
  return new SubmitError(kind, text, { retryable: true })
}

// ── retry policy ────────────────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * maxAttempts = transport/server failures tolerated per submission. pendingBudgetMs = how long to keep POLLING while the server reports an
 * earlier attempt is still processing this report — deliberately longer than the server's stale-claim window (default 60 s), so a claim
 * abandoned by a crashed request is taken over by one of OUR polls instead of the user seeing a failure first. Polling is not a failed attempt.
 */
export const RETRY = { maxAttempts: 3, baseDelaysMs: [1500, 4000], maxDelayMs: 30_000, stallMs: 45_000, processingMs: 90_000, pendingBudgetMs: 90_000 } as const

/** Does this server record submission keys? Read from the widget config endpoint; absent (an older server) → false → no automatic retries. */
export function serverSupportsIdempotency(config: any): boolean {
  try { return Number(config?.capabilities?.submissionKeys) >= 1 } catch { return false }
}

/** Delay before attempt N+1 (N = attempts made so far, 1-based). Honours Retry-After, adds ±20% jitter so a burst of clients spreads out. */
export function nextDelayMs(attemptsMade: number, err: Pick<SubmitError, "retryAfterSec">, rand: () => number = Math.random): number {
  const base = err.retryAfterSec ? err.retryAfterSec * 1000 : (RETRY.baseDelaysMs[Math.min(attemptsMade, RETRY.baseDelaysMs.length) - 1] ?? RETRY.baseDelaysMs[RETRY.baseDelaysMs.length - 1])
  const jitter = 1 + (rand() * 0.4 - 0.2)
  return Math.min(RETRY.maxDelayMs, Math.round(base * jitter))
}

export type RetryInfo = { attempt: number; maxAttempts: number; error: SubmitError; delayMs: number; pending?: boolean; waitedMs?: number; budgetMs?: number }

/**
 * Run `attempt` until it succeeds, throws a NON-retryable error, or the budgets are used up. Every call is the SAME prepared submission
 * (same body, same idempotency key), which is what makes re-sending safe. `onRetry` lets the UI say "Retrying (2/3)…".
 *   • transport / server failures (network, stall, timeout, 5xx, 429) use `maxAttempts` (3 by default) with backoff + jitter;
 *   • "your report is still being processed" (an earlier attempt owns it) is POLLED at the server's Retry-After for up to `pendingBudgetMs`
 *     without consuming an attempt — so a claim abandoned by a crash is recovered (taken over) by our own poll rather than reported as failed;
 *   • `maxAttempts: 1` means NO automatic retry at all (used when the server has not advertised idempotency support).
 * `sleep` / `rand` are injectable for tests. A non-SubmitError throw is treated as a retryable network failure.
 */
export async function withRetries<T>(
  attempt: (n: number) => Promise<T>,
  opts: { maxAttempts?: number; pendingBudgetMs?: number; sleep?: (ms: number) => Promise<void>; onRetry?: (i: RetryInfo) => void; rand?: () => number } = {},
): Promise<T> {
  const max = opts.maxAttempts ?? RETRY.maxAttempts, pendingBudget = opts.pendingBudgetMs ?? RETRY.pendingBudgetMs
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  let failures = 0, pendingWaited = 0, last: SubmitError | null = null
  for (let call = 1; ; call++) {
    try { return await attempt(call) }
    catch (e) {
      const err = e instanceof SubmitError ? e : networkFailure("network")
      last = err
      if (!err.retryable || max <= 1) throw err
      if (err.pending) {
        const delayMs = nextDelayMs(1, err, opts.rand)
        if (pendingWaited + delayMs > pendingBudget) {
          throw new SubmitError("http", "Your report is still being processed on the server — it may already be filed. Check Klavity before sending it again.", { status: err.status, retryable: false, serverMessage: err.serverMessage })
        }
        pendingWaited += delayMs
        try { opts.onRetry?.({ attempt: call + 1, maxAttempts: max, error: err, delayMs, pending: true, waitedMs: pendingWaited, budgetMs: pendingBudget }) } catch { /* UI hook must never break the retry */ }
        await sleep(delayMs)
        continue
      }
      failures++
      if (failures >= max) throw err
      const delayMs = nextDelayMs(failures, err, opts.rand)
      try { opts.onRetry?.({ attempt: failures + 1, maxAttempts: max, error: err, delayMs }) } catch { /* UI hook must never break the retry */ }
      await sleep(delayMs)
    }
  }
}

// ── transport ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export type SendCfg = { backendUrl: string; firstParty: boolean; token: string }
export type SendHooks = {
  /** Real upload progress (0–90 during the upload, the rest is server processing). Presence selects the XHR transport. */
  onProgress?: (pct: number, loaded?: number, total?: number) => void
  stallMs?: number
  processingMs?: number
}
export type SendResult = { status: number; json: any; replayed: boolean }

/**
 * POST the prepared multipart body once. With `onProgress` it uses XMLHttpRequest (real upload events) and a WATCHDOG instead of a fixed
 * timeout: it aborts when the upload makes no progress for `stallMs` (a dead connection) or when the server has not answered `processingMs`
 * after the upload finished — a slow-but-moving 100 MB upload is never cut off. Without `onProgress` it uses fetch (extension / tests).
 * Rejects with a typed SubmitError; resolves with the parsed JSON on 2xx.
 */
export function sendForm(cfg: SendCfg, fd: FormData, hooks: SendHooks = {}, deps: { XHR?: typeof XMLHttpRequest; fetch?: typeof fetch } = {}): Promise<SendResult> {
  const url = cfg.backendUrl + "/api/feedback"
  if (!hooks.onProgress) {
    const f = deps.fetch ?? fetch
    const init: RequestInit = { method: "POST", body: fd }
    if (cfg.firstParty) init.credentials = "include"
    else if (cfg.token) init.headers = { authorization: "Bearer " + cfg.token }
    return f(url, init).then(async (r) => {
      const text = await r.text().catch(() => "")
      if (!r.ok) throw classifyHttpFailure(r.status, text, r.headers.get("retry-after"))
      let j: any = {}; try { j = JSON.parse(text) } catch { /* empty / non-JSON success */ }
      return { status: r.status, json: j, replayed: r.headers.get("idempotent-replay") === "true" || j?.replayed === true }
    }, (e) => { if (e instanceof SubmitError) throw e; throw networkFailure("network") })
  }
  const XHR = deps.XHR ?? XMLHttpRequest
  const stallMs = hooks.stallMs ?? RETRY.stallMs, processingMs = hooks.processingMs ?? RETRY.processingMs
  return new Promise<SendResult>((resolve, reject) => {
    const xhr = new XHR()
    let timer: ReturnType<typeof setTimeout> | null = null
    let settled = false
    const finish = (fn: () => void) => { if (settled) return; settled = true; if (timer) clearTimeout(timer); fn() }
    const arm = (ms: number, kind: "stalled" | "timeout") => { if (timer) clearTimeout(timer); timer = setTimeout(() => finish(() => { try { xhr.abort() } catch { /* already done */ } reject(networkFailure(kind)) }), ms) }
    arm(stallMs, "stalled")                                   // no byte moves at all (dead connection) → give up
    xhr.upload.onprogress = (ev) => {
      arm(stallMs, "stalled")                                 // progress → the connection is alive: restart the stall clock
      if (ev.lengthComputable) hooks.onProgress!(Math.min(90, Math.round((ev.loaded / ev.total) * 90)), ev.loaded, ev.total)
    }
    xhr.upload.onload = () => arm(processingMs, "timeout")    // body fully sent → now wait (bounded) for the server
    xhr.onload = () => finish(() => {
      const text = xhr.responseText || ""
      if (xhr.status < 200 || xhr.status >= 300) { reject(classifyHttpFailure(xhr.status, text, xhr.getResponseHeader("retry-after"))); return }
      let j: any = {}; try { j = JSON.parse(text) } catch { reject(new SubmitError("http", "Klavity sent an unexpected response — retrying…", { status: xhr.status, retryable: true })); return }
      resolve({ status: xhr.status, json: j, replayed: xhr.getResponseHeader("idempotent-replay") === "true" || j?.replayed === true })
    })
    xhr.onerror = () => finish(() => reject(networkFailure("network")))
    xhr.onabort = () => finish(() => reject(networkFailure("network")))
    xhr.ontimeout = () => finish(() => reject(networkFailure("timeout")))
    xhr.open("POST", url)
    if (cfg.firstParty) xhr.withCredentials = true
    else if (cfg.token) xhr.setRequestHeader("authorization", "Bearer " + cfg.token)
    // else: anonymous cross-origin report — no auth header (server uses project gate + CORS).
    xhr.send(fd)
  })
}

// ── prepared submission + partial-failure repair ──────────────────────────────────────────────────────────────────────────────
/** Names of the multipart file fields the server numbers into slots (position in each field = slot index). */
const SLOT_FIELDS: Array<{ field: string; kind: "shot" | "file" | "rec"; mapKey: "screenshots" | "files" | "recording" }> = [
  { field: "screenshots", kind: "shot", mapKey: "screenshots" },
  { field: "files", kind: "file", mapKey: "files" },
  { field: "recording", kind: "rec", mapKey: "recording" },
]

/**
 * Build the body of a REPAIR request: the same submission key and the same small text fields, plus ONLY the parts for `missing` slots
 * (and `slot_map` so the server files each part under its ORIGINAL slot). Parts are taken from the already-prepared `fd`, so nothing is
 * recompressed or re-read. `replay` re-sends the replay buffer (gzip or plain, whichever the original used).
 */
export function buildRepairForm(fd: FormData, missing: string[]): FormData {
  const want = new Set(missing)
  const out = new FormData()
  const fileFields = new Set(["screenshots", "screenshot_thumbs", "files", "recording", "replay_events_gz"])
  for (const [k, v] of fd.entries()) { if (!fileFields.has(k) && k !== "replay_events" && typeof v === "string" && k !== "cf_turnstile_token") out.append(k, v) }
  const slotMap: Record<string, string[]> = {}
  const thumbs = fd.getAll("screenshot_thumbs")
  for (const { field, kind, mapKey } of SLOT_FIELDS) {
    const parts = fd.getAll(field)
    parts.forEach((p, i) => {
      const slot = `${kind}:${i}`
      if (!want.has(slot) || typeof p === "string") return
      out.append(field, p as Blob, (p as File).name || `${kind}-${i}`)
      ;(slotMap[mapKey] ||= []).push(slot)
      if (kind === "shot" && thumbs[i] && typeof thumbs[i] !== "string") out.append("screenshot_thumbs", thumbs[i] as Blob, (thumbs[i] as File).name || "thumb.jpg")
    })
  }
  if (want.has("replay")) {
    const gz = fd.get("replay_events_gz"), plain = fd.get("replay_events")
    if (gz && typeof gz !== "string") out.append("replay_events_gz", gz as Blob, "replay.json.gz")
    else if (typeof plain === "string") out.append("replay_events", plain)
  }
  out.set("repair_slots", JSON.stringify(missing))
  if (Object.keys(slotMap).length) out.set("slot_map", JSON.stringify(slotMap))
  return out
}

/**
 * Replace the (single-use) Turnstile token on a prepared body. `set` overwrites, so tokens never accumulate; when no fresh token could be
 * obtained the stale one is DELETED rather than re-sent (a used token can only fail verification and burn an attempt).
 */
export function refreshTurnstileField(fd: FormData, fresh: string | null | undefined): void {
  if (fresh) fd.set("cf_turnstile_token", fresh)
  else fd.delete("cf_turnstile_token")
}

/**
 * Could the ticket already exist even though this attempt failed? True when the answer may simply have been lost on the way back
 * (dropped connection, stall, timeout) or the server failed AFTER it may have created the ticket (5xx). False for a clear rejection
 * (validation, auth, permission, size, rate limit): the server refused before creating anything, so retrying cannot duplicate.
 */
export function isUncertainOutcome(err: Pick<SubmitError, "kind" | "status">): boolean {
  if (err.kind === "network" || err.kind === "timeout" || err.kind === "stalled") return true
  return typeof err.status === "number" && err.status >= 500
}

/**
 * What the failure pill says, and what its button is called. With a server that recorded the submission key, a re-send is always safe,
 * so the plain message and "Retry" are right. With an OLDER server (no idempotency support) a re-send of a lost / failed answer can create
 * a second ticket, so the user is told that the first one may already exist and must choose knowingly ("Retry anyway").
 */
export function retryFailureCopy(err: SubmitError | null, serverIdempotent: boolean): { message: string; retryLabel?: string } {
  if (err && !serverIdempotent && isUncertainOutcome(err)) {
    return {
      message: "We couldn't confirm your report was received — it may already have been created. Check Klavity before retrying: this server can't prevent a duplicate.",
      retryLabel: "Retry anyway",
    }
  }
  return { message: err ? err.userMessage : "check your connection" }
}

export type SubmitOutcome = { id: string; issueUrl: string; replayed: boolean; missing: string[] }
export function outcomeFromResult(r: SendResult): SubmitOutcome {
  const j = r.json || {}
  return {
    id: String(j.jira_key || j.id || ""), issueUrl: String(j.issue_url || ""), replayed: r.replayed,
    missing: Array.isArray(j.missing) ? j.missing.filter((x: any) => typeof x === "string") : [],
  }
}
