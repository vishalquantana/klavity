// Pure helpers for the superadmin URL shortener + campaign tracker (Phase 1).
// No DB, no server deps — safe to unit-test in isolation.
import { createHmac, createHash } from "node:crypto"

// Slugs share the /s/:code namespace, so a vanity slug may never collide with a real
// top-level route (or with the Phase-2 /r/ referral prefix). Keep this list in sync with
// the reserved top-level paths.
export const RESERVED_SLUGS: readonly string[] = [
  "api", "login", "superadmin", "s", "r", "dashboard", "health", "widget", "blog", "admin",
]

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

/** 6-char base62 random code (cryptographically random, uniform over the alphabet). */
export function genCode(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  let out = ""
  for (let i = 0; i < 6; i++) out += BASE62[bytes[i] % 62]
  return out
}

const SLUG_RE = /^[a-z0-9-]{3,40}$/

/** A vanity slug is valid when it matches the shape regex AND is not a reserved word. */
export function isValidSlug(s: string): boolean {
  if (!s || !SLUG_RE.test(s)) return false
  if (RESERVED_SLUGS.includes(s)) return false
  return true
}

export interface Utm {
  source?: string | null
  medium?: string | null
  campaign?: string | null
  term?: string | null
  content?: string | null
}

// The five canonical UTM fields, mapped to their query-param names.
const UTM_FIELDS: Array<[keyof Utm, string]> = [
  ["source", "utm_source"],
  ["medium", "utm_medium"],
  ["campaign", "utm_campaign"],
  ["term", "utm_term"],
  ["content", "utm_content"],
]

/**
 * Stamp the link's stored UTMs onto `dest`. Each provided (non-empty) value OVERRIDES any
 * pre-existing utm_* param; empty/null/undefined values are dropped (never written as blanks).
 * A non-absolute / unparseable destination is returned unchanged (defensive — such a link
 * should never have been created, but we must never throw in the redirect hot path).
 * URLSearchParams.set handles encoding, so values are single-encoded (never double-encoded).
 */
export function stampUtm(dest: string, utm: Utm): string {
  let url: URL
  try {
    url = new URL(dest)
  } catch {
    return dest
  }
  for (const [key, param] of UTM_FIELDS) {
    const v = utm[key]
    if (v === undefined || v === null) continue
    const s = String(v)
    if (s.length === 0) continue
    url.searchParams.set(param, s)
  }
  return url.toString()
}

// A conservative bot/preview/crawler UA signature list. Matching a click as a bot does NOT
// block the redirect — it only flags the click row so human vs. bot traffic can be split.
const BOT_UA_RE = /bot|crawl|spider|slurp|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot|slackbot|discordbot|twitterbot|linkedinbot|pinterest|preview|monitor|curl|wget|python-requests|headless|phantom|lighthouse|google-inspectiontool/i

export interface BotSignals {
  method?: string | null
  ua?: string | null
  secPurpose?: string | null
  purpose?: string | null
}

/**
 * True when the request looks like a bot / link-preview / prefetch rather than a human click:
 * a HEAD request, a known bot UA, or an explicit prefetch signal (Sec-Purpose / Purpose).
 */
export function isBotRequest(sig: BotSignals): boolean {
  const method = (sig.method || "").toUpperCase()
  if (method === "HEAD") return true
  if (sig.ua && BOT_UA_RE.test(sig.ua)) return true
  const sp = (sig.secPurpose || "").toLowerCase()
  const p = (sig.purpose || "").toLowerCase()
  if (sp.includes("prefetch") || sp.includes("prerender")) return true
  if (p.includes("prefetch") || p.includes("prerender")) return true
  return false
}

/**
 * Hash a client IP for the click log. Uses HMAC-SHA256 keyed on an existing server secret
 * (KLAV_SECRET) when present so raw IPs are never recoverable from a DB dump; falls back to a
 * plain SHA-256 when no secret is configured (no new REQUIRED env var). Empty/"unknown" IPs
 * return "" — we store no PII and no misleading hash for an unknown source.
 */
export function hashIp(ip: string): string {
  if (!ip || ip === "unknown") return ""
  const secret = process.env.KLAV_SECRET
  if (secret) return createHmac("sha256", secret).update(ip).digest("hex")
  return createHash("sha256").update(ip).digest("hex")
}
