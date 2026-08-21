// KLAVITYKLA-487 — shared guardrails for the anonymous, pre-signup free AI tools (/cro, /bug-check).
//
// The free tools give real AI value away BEFORE any email/login to keep the "aha". That is exactly
// what makes them an abuse + cost surface: an anonymous caller can burn OpenRouter budget, and the
// value walks out the door with no lead. This module is the single home for the four countermeasures
// so the server routes stay thin:
//
//   1. TEASER  — show a small subset of the result, lock the rest behind an email (makeTeaser).
//   2. RATE    — per-IP + per-email daily run cap (default 3/day), backed by a DB day-counter so it
//                survives a restart (an in-memory limiter would reset the count on every deploy).
//   3. COST    — per-IP/session OpenRouter $ cap for the day; trips BEFORE a paid call is made.
//   4. DISPOSABLE — reject temp-inbox domains at reveal; our own staff domains always pass.
//   5. TURNSTILE  — only demanded AFTER a soft limit trips, so real users never see it. If Turnstile
//                   keys are unset we HARD-BLOCK on trip rather than silently letting the run through.
//
// ATTRIBUTION (#486 bucket-1): pre-email free-tool AI calls are tagged with a fixed marketing
// project bucket instead of NULL, so CAC spend is never unattributed; once an email is captured the
// call is additionally tagged with that email (actor_email) so cost follows the lead.

import { db } from "./db"
import { isInternalEmail } from "./auth"
import { verifyTurnstile, turnstileEnabled } from "./turnstile"

// The CAC bucket every pre-signup free-tool AI call is attributed to (recordAiCall project_id).
// A synthetic id — there is intentionally NO projects row for it, so accountIdForAiCall resolves it
// to null and it simply shows up as its own line in the /opsadmin cost-by-project rollup.
export const MARKETING_PRESIGNUP_PROJECT_ID = "proj_marketing_presignup"

// ── env-tunable caps ─────────────────────────────────────────────────────────────────────────────
/** Free runs per IP (and per email) per UTC day before the limit screen trips. Env KLAV_FREETOOL_DAILY_CAP. */
export function freetoolDailyRunCap(): number {
  const n = Number(process.env.KLAV_FREETOOL_DAILY_CAP ?? 3)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 3
}
/** Per-IP/session OpenRouter $ ceiling for the day. Env KLAV_FREETOOL_COST_CAP_USD. */
export function freetoolCostCapUsd(): number {
  const n = Number(process.env.KLAV_FREETOOL_COST_CAP_USD ?? 0.1)
  return Number.isFinite(n) && n > 0 ? n : 0.1
}

// ── disposable / temp-email block ────────────────────────────────────────────────────────────────
// A deliberately small, high-signal seed list of the temp-inbox providers that show up in lead spam.
// Extensible — add domains here (or fold in a bigger list later); the block is a Set lookup on the
// email's domain. Our own staff domains (quantana.in / quantana.com.au / KLAV_INTERNAL_DOMAINS) are
// checked via isInternalEmail() FIRST and always pass so internal tests never get bounced.
export const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
  "mailinator.com", "10minutemail.com", "10minutemail.net", "guerrillamail.com", "guerrillamail.net",
  "guerrillamail.org", "guerrillamail.biz", "sharklasers.com", "grr.la", "temp-mail.org", "tempmail.com",
  "tempmail.net", "tempmailo.com", "throwawaymail.com", "getnada.com", "nada.email", "dispostable.com",
  "yopmail.com", "yopmail.net", "maildrop.cc", "mailnesia.com", "trashmail.com", "trashmail.de",
  "fakeinbox.com", "mytemp.email", "moakt.com", "mohmal.com", "emailondeck.com", "spam4.me",
  "mailcatch.com", "tempinbox.com", "burnermail.io", "33mail.com", "mailsac.com", "tmpmail.org",
  "tmpmail.net", "20minutemail.com", "temp-mail.io", "minuteinbox.com", "inboxkitten.com",
])

/** True when an email's domain is a known temp-inbox provider. Internal/staff domains always return false. */
export function isDisposableEmail(email: string): boolean {
  const dom = String(email || "").toLowerCase().trim().split("@")[1] || ""
  if (!dom) return false
  if (isInternalEmail(email)) return false // staff domains are never disposable
  return DISPOSABLE_DOMAINS.has(dom)
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
export type EmailCheck =
  | { ok: true; email: string }
  | { ok: false; code: "format" | "disposable"; error: string }

/**
 * Server-side email validation for the reveal step. Lower-cases + trims, rejects malformed / overlong
 * addresses, then rejects disposable domains with a clear, inline-friendly message. NEVER trust a
 * client-side check — this is the single choke point before an email becomes a lead.
 */
export function validateFreetoolEmail(raw: unknown): EmailCheck {
  const email = String(raw ?? "").trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { ok: false, code: "format", error: "Enter a valid email." }
  }
  if (isDisposableEmail(email)) {
    return { ok: false, code: "disposable", error: "Please use a work email — temporary inboxes aren't accepted." }
  }
  return { ok: true, email }
}

// ── teaser ───────────────────────────────────────────────────────────────────────────────────────
export type Teaser<T> = { teaser: true; headline: string; visible: T[]; lockedCount: number }
/**
 * Split a full result list into a visible teaser + a locked remainder count. The teaser IS the aha —
 * it proves the tool found real issues — while the rest is withheld SERVER-SIDE (not just blurred in
 * CSS) until an email is submitted. `visibleCount` is clamped to [0, items.length].
 */
export function makeTeaser<T>(items: readonly T[], opts: { visibleCount: number; headline: string }): Teaser<T> {
  const list = Array.isArray(items) ? items : []
  const vc = Math.max(0, Math.min(list.length, Math.floor(opts.visibleCount)))
  const visible = list.slice(0, vc)
  return { teaser: true, headline: opts.headline, visible, lockedCount: Math.max(0, list.length - visible.length) }
}

// ── DB day-counter (runs + cost) per bucket ──────────────────────────────────────────────────────
/** UTC 'YYYY-MM-DD' — same window the global spend caps use (date('now')). */
export function utcDay(atMs: number = Date.now()): string {
  return new Date(atMs).toISOString().slice(0, 10)
}
export function ipBucket(ip: string): string { return "ip:" + String(ip || "unknown") }
export function emailBucket(email: string): string { return "email:" + String(email || "").toLowerCase() }

export type FreetoolUsage = { runs: number; costUsd: number }
export async function freetoolUsageToday(bucket: string, atMs: number = Date.now()): Promise<FreetoolUsage> {
  const r = await db!.execute({ sql: "SELECT runs, cost_usd FROM freetool_usage WHERE bucket=? AND day=?", args: [bucket, utcDay(atMs)] })
  if (!r.rows.length) return { runs: 0, costUsd: 0 }
  const x = r.rows[0] as any
  return { runs: Number(x.runs) || 0, costUsd: Number(x.cost_usd) || 0 }
}

/** Atomically +1 this bucket's run count for today; returns the new count. */
export async function bumpFreetoolRun(bucket: string, atMs: number = Date.now()): Promise<number> {
  const day = utcDay(atMs)
  await db!.execute({
    sql: "INSERT INTO freetool_usage (bucket,day,runs,cost_usd) VALUES (?,?,1,0) ON CONFLICT(bucket,day) DO UPDATE SET runs = runs + 1",
    args: [bucket, day],
  })
  const r = await db!.execute({ sql: "SELECT runs FROM freetool_usage WHERE bucket=? AND day=?", args: [bucket, day] })
  return Number((r.rows[0] as any)?.runs) || 0
}

/** Add measured $ spend to this bucket's daily total (no-op for non-positive amounts). */
export async function bumpFreetoolCost(bucket: string, usd: number, atMs: number = Date.now()): Promise<void> {
  if (!Number.isFinite(usd) || usd <= 0) return
  const day = utcDay(atMs)
  await db!.execute({
    sql: "INSERT INTO freetool_usage (bucket,day,runs,cost_usd) VALUES (?,?,0,?) ON CONFLICT(bucket,day) DO UPDATE SET cost_usd = cost_usd + ?",
    args: [bucket, day, usd, usd],
  })
}

/** Whole hours until the UTC day rolls over (for the "resets in Nh" limit-screen copy). Min 1. */
export function hoursUntilReset(atMs: number = Date.now()): number {
  const d = new Date(atMs)
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)
  return Math.max(1, Math.ceil((next - atMs) / 3_600_000))
}

// ── the run gate ─────────────────────────────────────────────────────────────────────────────────
export type GateResult =
  | { allowed: true; runsToday: number; capRuns: number }
  | { allowed: false; reason: "rate" | "cost"; runsToday: number; capRuns: number; resetHours: number; needTurnstile: boolean }

/**
 * Decide whether an anonymous free-tool run may proceed, BEFORE any paid call is made.
 *
 * Trips when EITHER the per-IP or per-email run count has reached the daily cap, OR the day's summed
 * cost for the IP has reached the $ ceiling. On a trip, a caller who has solved a Turnstile challenge
 * (token passed back on the retry) is granted exactly one more run — but ONLY when Turnstile is
 * actually configured. With no Turnstile keys a trip is a HARD BLOCK (never a silent bypass), which
 * is the fail-closed posture the abuse spec requires.
 *
 * This is a check-then-act gate; the atomic $ backstop (tryReserveFreeToolSpend) still guards the
 * real wallet, so the small race here can at most let a couple of extra cheap runs through, never
 * overspend the daily budget.
 */
export async function checkFreetoolRun(opts: {
  ip: string
  email?: string | null
  turnstileToken?: string | null
  atMs?: number
}): Promise<GateResult> {
  const atMs = opts.atMs ?? Date.now()
  const capRuns = freetoolDailyRunCap()
  const capCost = freetoolCostCapUsd()
  const buckets = [ipBucket(opts.ip)]
  if (opts.email) buckets.push(emailBucket(opts.email))
  let runsToday = 0
  let costToday = 0
  for (const b of buckets) {
    const u = await freetoolUsageToday(b, atMs)
    if (u.runs > runsToday) runsToday = u.runs
    if (u.costUsd > costToday) costToday = u.costUsd
  }
  const rateTripped = runsToday >= capRuns
  const costTripped = costToday >= capCost
  if (rateTripped || costTripped) {
    // Turnstile bypass — one more run for a solved challenge, only when Turnstile is enabled.
    if (turnstileEnabled() && opts.turnstileToken && (await verifyTurnstile(opts.turnstileToken, opts.ip))) {
      return { allowed: true, runsToday, capRuns }
    }
    return { allowed: false, reason: costTripped ? "cost" : "rate", runsToday, capRuns, resetHours: hoursUntilReset(atMs), needTurnstile: turnstileEnabled() }
  }
  return { allowed: true, runsToday, capRuns }
}
