// KLAVITYKLA-441 — Workspace auto-labeling rules.
//
// A per-project ORDERED rule list that auto-tags each incoming report with env/org/server based on
// the report's URL host (glob) and/or client IP (CIDR), evaluated at ingest (first match wins). The
// resolved labels are stored on the report row (report_env/report_org/report_server) and surfaced on
// the read + in the ticket body. Unmatched reports are left unlabeled (null) — no bad guesses.
//
// Pure helpers only (no DB / no network) so they unit-test in isolation and can't slow the submit.

export type LabelRuleMatch = { urlHost?: string; cidr?: string }
export type LabelRuleLabel = { env?: string; org?: string; server?: string }
export type LabelRule = { match: LabelRuleMatch; label: LabelRuleLabel }
export type ResolvedLabels = { env: string | null; org: string | null; server: string | null }

// Bounds so a malformed/oversized settings blob can never poison a project row or slow ingest.
export const LABEL_RULES_MAX = 100        // max rules per project
const LABEL_STR_MAX = 120                 // per label/glob/cidr string cap

const cap = (v: any, max = LABEL_STR_MAX): string => String(v ?? '').slice(0, max).trim()

// ── glob matching (host) ────────────────────────────────────────────────────
// Supports `*` (any run of chars) and `?` (single char), anchored, case-insensitive. Everything else
// is treated literally (escaped), so a glob like `*.staging.acme.com` matches `app.staging.acme.com`.
export function matchHostGlob(glob: string, host: string): boolean {
  const g = cap(glob).toLowerCase()
  const h = cap(host, 260).toLowerCase()
  if (!g || !h) return false
  const re = '^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
  try { return new RegExp(re).test(h) } catch { return false }
}

// ── CIDR matching (IPv4) ─────────────────────────────────────────────────────
// Parses an IPv4 CIDR ("10.0.0.0/8") and tests whether `ip` falls inside it. IPv6 / malformed inputs
// return false (no match) rather than throwing — unmatched is always the safe default. A bare IP with
// no "/n" is treated as a /32 (exact match).
function ipv4ToInt(ip: string): number | null {
  const parts = cap(ip, 45).split('.')
  if (parts.length !== 4) return null
  let n = 0
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null
    const o = Number(p)
    if (o > 255) return null
    n = (n << 8) | o
  }
  return n >>> 0
}

export function ipInCidr(ip: string, cidr: string): boolean {
  const c = cap(cidr, 45)
  if (!c) return false
  const [base, bitsRaw] = c.split('/')
  const bits = bitsRaw === undefined ? 32 : Number(bitsRaw)
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false
  const baseInt = ipv4ToInt(base)
  const ipInt = ipv4ToInt(ip)
  if (baseInt === null || ipInt === null) return false
  if (bits === 0) return true
  const mask = bits === 32 ? 0xffffffff : (~((1 << (32 - bits)) - 1)) >>> 0
  return (baseInt & mask) === (ipInt & mask)
}

// ── evaluation ───────────────────────────────────────────────────────────────
// First rule whose match clause is satisfied wins. A rule matches when EVERY present criterion holds:
//   - urlHost present → the report's URL host must glob-match it
//   - cidr present    → the report's client IP must fall inside it
// A rule with an empty match clause never matches (guards against an all-catch mistake). Returns the
// winning rule's non-empty labels, or all-null when nothing matched.
export function evaluateLabelRules(
  rules: LabelRule[] | null | undefined,
  input: { urlHost?: string | null; ip?: string | null },
): ResolvedLabels {
  const none: ResolvedLabels = { env: null, org: null, server: null }
  if (!Array.isArray(rules) || !rules.length) return none
  const host = cap(input.urlHost ?? '', 260)
  const ip = cap(input.ip ?? '', 45)
  for (const rule of rules) {
    const m = rule?.match
    if (!m || typeof m !== 'object') continue
    const wantHost = cap(m.urlHost ?? '')
    const wantCidr = cap(m.cidr ?? '')
    if (!wantHost && !wantCidr) continue // empty clause never matches
    if (wantHost && !matchHostGlob(wantHost, host)) continue
    if (wantCidr && !ipInCidr(ip, wantCidr)) continue
    const label = rule.label && typeof rule.label === 'object' ? rule.label : {}
    return {
      env: cap(label.env ?? '') || null,
      org: cap(label.org ?? '') || null,
      server: cap(label.server ?? '') || null,
    }
  }
  return none
}

// ── settings sanitize (storage) ──────────────────────────────────────────────
// Coerce the client-supplied rules blob into the stored shape: bound the count, cap every string, drop
// rules with an empty match clause or empty label set. Returns [] for garbage so the column stores a
// clean, minimal array. Order is preserved (first-match-wins is order-sensitive).
export function sanitizeLabelRules(raw: any): LabelRule[] {
  if (!Array.isArray(raw)) return []
  const out: LabelRule[] = []
  for (const r of raw.slice(0, LABEL_RULES_MAX)) {
    if (!r || typeof r !== 'object') continue
    const m = r.match && typeof r.match === 'object' ? r.match : {}
    const l = r.label && typeof r.label === 'object' ? r.label : {}
    const match: LabelRuleMatch = {}
    const urlHost = cap(m.urlHost ?? '')
    const cidr = cap(m.cidr ?? '')
    if (urlHost) match.urlHost = urlHost
    if (cidr) match.cidr = cidr
    const label: LabelRuleLabel = {}
    const env = cap(l.env ?? ''); if (env) label.env = env
    const org = cap(l.org ?? ''); if (org) label.org = org
    const server = cap(l.server ?? ''); if (server) label.server = server
    // A rule needs at least one match criterion AND at least one label to be useful.
    if ((match.urlHost || match.cidr) && (label.env || label.org || label.server)) {
      out.push({ match, label })
    }
  }
  return out
}
