// Server-side sanitization for client-supplied first-touch acquisition attribution
// (KLAVITYKLA-324). The client (site/attr.js) is untrusted — this is the single choke point
// every persistence path (POST /api/auth/verify) must run raw `attr` input through before it
// ever reaches a DB column or a Slack message.

export interface SanitizedAttr {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
  gclid?: string
  fbclid?: string
  referrer?: string
  landing_page?: string
  first_seen_at?: number
}

const ATTR_KEYS = ["source", "medium", "campaign", "term", "content", "gclid", "fbclid", "referrer", "landing_page", "first_seen_at"] as const
const FIELD_MAX = 200
const MAX_KEYS = ATTR_KEYS.length

// Accept ONLY the allowlisted keys, coerce everything to a trimmed/clamped string (first_seen_at
// to a finite number), drop empties, and cap the total key count. Returns null when nothing of
// substance survives — callers should treat that as "no attribution" rather than storing `{}`.
export function sanitizeAttr(raw: unknown): SanitizedAttr | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const src = raw as Record<string, unknown>
  const out: SanitizedAttr = {}
  let count = 0
  for (const key of ATTR_KEYS) {
    if (count >= MAX_KEYS) break
    if (!(key in src)) continue
    const v = src[key]
    if (v == null) continue
    if (key === "first_seen_at") {
      const n = Number(v)
      if (Number.isFinite(n) && n > 0) { out.first_seen_at = n; count++ }
      continue
    }
    let s = String(v).replace(/[\x00-\x1F\x7F]/g, "").trim()
    if (!s) continue
    if (s.length > FIELD_MAX) s = s.slice(0, FIELD_MAX)
    ;(out as Record<string, string>)[key] = s
    count++
  }
  return count > 0 ? out : null
}
