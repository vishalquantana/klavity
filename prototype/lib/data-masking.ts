// prototype/lib/data-masking.ts — Pure PII/secret redaction utilities.
//
// Applied at export choke points (member export, GDPR export, walk-report PDF)
// when a project's modal_config_json carries piiMasking: true.
// No DB / no network — all functions are pure so they are hermetically testable.

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

// Email addresses (RFC-5321 practical subset).
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g

// Tokens / secrets: Bearer headers, JWTs (eyJ…), common secret-key prefixes.
// The \b word-boundary on the key-prefix branch prevents matching bare numbers.
const TOKEN_RE =
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*|eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_.+/=]*|\b(?:sk|rk|pk|token|secret|api)[-_][A-Za-z0-9_]{16,}\b/gi

// Credit card numbers: 16 digits with optional space/dash separators.
const CC_RE = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g

// IPv4 addresses — matched before phone numbers to avoid partial overlap.
const IPV4_RE = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g

// Phone numbers: US-style NXX-NXX-XXXX with optional country code / parens.
// Negative digit look-around prevents matching bare large integers.
const PHONE_RE = /(?<!\d)(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)/g

// ---------------------------------------------------------------------------
// Single-pattern helpers (useful for targeted tests and callers)
// ---------------------------------------------------------------------------

export function maskEmail(s: string): string {
  return s.replace(EMAIL_RE, "[EMAIL]")
}

export function maskToken(s: string): string {
  return s.replace(TOKEN_RE, "[TOKEN]")
}

// ---------------------------------------------------------------------------
// Full-spectrum PII redaction for a single string
// ---------------------------------------------------------------------------

export function maskPii(s: string): string {
  // Order matters: tokens first so their internals don't match later patterns,
  // then CC (16-digit groups) before phone (10-digit groups that could partially
  // overlap a CC), then IPs, then emails last.
  return s
    .replace(TOKEN_RE, "[TOKEN]")
    .replace(CC_RE, "[CC]")
    .replace(IPV4_RE, "[IP]")
    .replace(PHONE_RE, "[PHONE]")
    .replace(EMAIL_RE, "[EMAIL]")
}

// ---------------------------------------------------------------------------
// Deep recursive redaction (for JSON blobs like GDPR export payloads)
// ---------------------------------------------------------------------------

export function maskDeep<T>(value: T): T {
  if (typeof value === "string") return maskPii(value) as unknown as T
  if (Array.isArray(value)) return value.map(maskDeep) as unknown as T
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = maskDeep(v)
    }
    return out as T
  }
  return value
}

// ---------------------------------------------------------------------------
// Project-setting helpers (pure — take the parsed modal_config_json object)
// ---------------------------------------------------------------------------

export function isMaskingEnabled(modalConfig: Record<string, unknown>): boolean {
  return modalConfig.piiMasking === true
}

// ---------------------------------------------------------------------------
// Export-specific transformers
// ---------------------------------------------------------------------------

export type MemberExportRowLike = { email: string; role: string; joined_at: string; status: string }

// Mask the email value in a single member export row.
export function maskMemberExportRow(row: MemberExportRowLike): MemberExportRowLike {
  return { ...row, email: maskEmail(row.email) }
}

// Structural type for WalkReportData fields we need to mask.
// Avoids a static import of trails-report (which has DB/FS deps).
type MaskableWalkReport = {
  findings: {
    title: string
    groundQuote: string | null
    evidence: Record<string, unknown> | null
    [k: string]: unknown
  }[]
  steps: {
    evidence: Record<string, unknown> | null
    [k: string]: unknown
  }[]
  judgment?: {
    verdicts: { rationale: string; [k: string]: unknown }[]
    overallNote: string | null
    [k: string]: unknown
  } | null
  [k: string]: unknown
}

// Redact PII from free-text fields (finding titles, evidence blobs, judgment rationale).
export function maskWalkReportData<T extends MaskableWalkReport>(data: T): T {
  return {
    ...data,
    findings: data.findings.map((f) => ({
      ...f,
      title: maskPii(f.title),
      groundQuote: f.groundQuote != null ? maskPii(f.groundQuote) : null,
      evidence: f.evidence != null ? maskDeep(f.evidence) : null,
    })),
    steps: data.steps.map((s) => ({
      ...s,
      evidence: s.evidence != null ? maskDeep(s.evidence) : null,
    })),
    judgment: data.judgment
      ? {
          ...data.judgment,
          verdicts: data.judgment.verdicts.map((v) => ({ ...v, rationale: maskPii(v.rationale) })),
          overallNote: data.judgment.overallNote != null ? maskPii(data.judgment.overallNote) : null,
        }
      : data.judgment,
  }
}
