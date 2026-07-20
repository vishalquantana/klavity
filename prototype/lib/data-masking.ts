// prototype/lib/data-masking.ts — Pure PII/secret redaction utilities.
//
// Applied at export choke points (member export, GDPR export, walk-report PDF —
// BOTH the authenticated download and the PUBLIC share link) when a project's
// modal_config_json carries piiMasking: true.
// No DB / no network — all functions are pure so they are hermetically testable.

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

// Email addresses (RFC-5321 practical subset). The domain half accepts either a
// normal dotted host OR an IP literal — without the IP-literal branch,
// "firstname.lastname@172.16.0.9" would not match EMAIL_RE at all and the IP
// pass would rewrite it to "firstname.lastname@[IP]", leaking the human name.
const EMAIL_RE =
  /[a-zA-Z0-9._%+\-]+@(?:\[?\d{1,3}(?:\.\d{1,3}){3}\]?|[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g

// Tokens / secrets. Deliberately made of SPECIFIC, high-signal shapes rather
// than "any word starting with api_". The old pattern
//   \b(?:sk|rk|pk|token|secret|api)[-_][A-Za-z0-9_]{16,}\b
// matched ordinary snake_case identifiers, so CSS selectors rendered in the walk
// PDF (e.g. "#api_reference_guide_container") were destroyed into "#[TOKEN]" and
// healed-selector diffs became an unactionable "- [TOKEN] / + [TOKEN]".
//
// Branches, in match order:
//   1. Authorization: Bearer <opaque>
//   2. JWT (three eyJ… segments)
//   3. GitHub PAT / OAuth / server / user / refresh tokens (ghp_, gho_, ghs_, ghu_, ghr_)
//   4. AWS access key ids (AKIA…, ASIA…)
//   5. Slack tokens (xoxb-, xoxp-, xoxa-, xoxs-, xoxr-)
//   6. Google API keys (AIza…)
//   7. Stripe-shaped keys: sk/rk/pk + optional live|test|prod segment + one
//      unbroken alnum run of >=16 (no interior underscores → snake_case is safe)
//   8. Explicit key=value secrets: `api_key: <16+>`, `token = "<16+>"`, etc.
//      An assignment operator is REQUIRED, which is what keeps identifiers and
//      selectors out of the net. The key+operator is captured (group 1) and
//      re-emitted so the reader still sees WHAT was redacted.
const TOKEN_RE = new RegExp(
  [
    "Bearer\\s+[A-Za-z0-9\\-._~+/]+=*",
    "eyJ[A-Za-z0-9\\-_]+\\.eyJ[A-Za-z0-9\\-_]+\\.[A-Za-z0-9\\-_.+/=]*",
    "\\bgh[pousr]_[A-Za-z0-9]{16,}\\b",
    "\\b(?:AKIA|ASIA)[0-9A-Z]{12,}\\b",
    "\\bxox[baprs]-[A-Za-z0-9-]{10,}",
    "\\bAIza[0-9A-Za-z\\-_]{10,}\\b",
    "\\b(?:sk|rk|pk)[-_](?:live|test|prod)?[-_]?[A-Za-z0-9]{16,}\\b",
    "((?:api[-_]?key|apikey|secret|token|password|passwd|access[-_]?token)\\s*[:=]\\s*)[\"']?[A-Za-z0-9\\-._~+/]{16,}=*[\"']?",
  ].join("|"),
  "gi",
)

// Keeps the `key=` prefix of an assignment-shaped secret while redacting its value.
const TOKEN_REPLACER = (_m: string, kvKey?: string): string => (kvKey ? kvKey + "[TOKEN]" : "[TOKEN]")

// Credit card candidates: 13-19 digits in 4-digit groups with optional
// space/dash separators. A raw regex hit is NOT enough — a 16-digit build or
// order id looks identical — so every candidate is Luhn-checked before it is
// redacted (see maskCreditCards).
const CC_CANDIDATE_RE = /(?<![\d-])\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,7}(?![\d-])/g

// US Social Security numbers (NNN-NN-NNNN). Distinct from the phone shape
// (NNN-NNN-NNNN) by the 2-digit middle group.
const SSN_RE = /(?<![\d-])\d{3}-\d{2}-\d{4}(?![\d-])/g

// IPv6: the full 8-group form, plus any compressed form containing "::".
// Requiring a "::" for the compressed branch is what stops timestamps like
// "12:34:56" from being eaten.
const IPV6_RE =
  /\b(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}\b|(?<![:\w])(?:[0-9A-Fa-f]{1,4}:){1,7}:(?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4}){0,6})?(?![:\w])/g

// IPv4. The (?<![\w.]) / (?![\w.]) boundaries keep it off longer dotted runs and
// off "v1.2.3.4" (the "v" is a word char). A keyword guard in maskIps
// additionally spares "version 1.2.3.4" / "build 1.2.3.4".
const IPV4_RE =
  /(?<![\w.])(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)(?![\w.])/g

// Phone numbers, three shapes:
//   INTL  — a leading +CC followed by 8-17 more digits/separators (+91 98765 43210)
//   SEP   — NNN-NNN-NNNN / (NNN) NNN-NNNN, separators REQUIRED
//   IN10  — a bare 10-digit Indian mobile, which must start 6-9. The 6-9 anchor
//           is what keeps 10-digit Unix epochs (17xxxxxxxx) out of the net.
const PHONE_INTL_RE = /(?<![\w+])\+\d[\d.\s-]{7,16}\d(?!\d)/g
const PHONE_SEP_RE =
  /(?<![\d.])(?:\+?\d{1,3}[-.\s])?(?:\(\d{3}\)\s?|\d{3}[-.\s])\d{3}[-.\s]\d{4}(?![\d.])/g
const PHONE_IN10_RE = /(?<![\d+])[6-9]\d{9}(?![\d])/g

// Contexts that make a dotted quad a VERSION, not an address.
const VERSION_CONTEXT_RE = /\b(?:v|ver|vers|version|build|release|semver|rev)\.?\s*$/i

// ---------------------------------------------------------------------------
// Single-pattern helpers (useful for targeted tests and callers)
// ---------------------------------------------------------------------------

export function maskEmail(s: string): string {
  return s.replace(EMAIL_RE, "[EMAIL]")
}

export function maskToken(s: string): string {
  return s.replace(TOKEN_RE, TOKEN_REPLACER)
}

// Luhn checksum — the cheap discriminator between a real PAN and a 16-digit id.
export function luhnValid(digits: string): boolean {
  const d = digits.replace(/\D/g, "")
  if (d.length < 13 || d.length > 19) return false
  let sum = 0
  let alt = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = d.charCodeAt(i) - 48
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export function maskCreditCards(s: string): string {
  return s.replace(CC_CANDIDATE_RE, (m) => (luhnValid(m) ? "[CC]" : m))
}

export function maskIps(s: string): string {
  return s
    .replace(IPV6_RE, "[IP]")
    .replace(IPV4_RE, (m: string, offset: number, whole: string) => {
      const before = whole.slice(Math.max(0, offset - 16), offset)
      return VERSION_CONTEXT_RE.test(before) ? m : "[IP]"
    })
}

export function maskPhones(s: string): string {
  return s
    .replace(PHONE_INTL_RE, "[PHONE]")
    .replace(PHONE_SEP_RE, "[PHONE]")
    .replace(PHONE_IN10_RE, "[PHONE]")
}

// ---------------------------------------------------------------------------
// Full-spectrum PII redaction for a single string
// ---------------------------------------------------------------------------

export function maskPii(s: string): string {
  // ORDER MATTERS, AND EMAIL MUST GO FIRST.
  // An email is a composite whose parts match the later, narrower patterns; if a
  // narrower pass runs first it rewrites half the address and EMAIL_RE can no
  // longer see the @domain.tld shape, so the other half survives verbatim:
  //   firstname.lastname@172.16.0.9 → firstname.lastname@[IP]  (name leaked)
  //   4155550100@example.com        → [PHONE]@example.com      (domain leaked)
  // Emails first, then secrets, then the numeric families (widest → narrowest).
  let out = s.replace(EMAIL_RE, "[EMAIL]")
  out = out.replace(TOKEN_RE, TOKEN_REPLACER)
  out = maskCreditCards(out)
  out = out.replace(SSN_RE, "[SSN]")
  out = maskIps(out)
  out = maskPhones(out)
  return out
}

// ---------------------------------------------------------------------------
// Deep recursive redaction (for JSON blobs like GDPR export payloads)
// ---------------------------------------------------------------------------

// Keys whose values are STRUCTURAL, not human data: CSS/XPath selectors, element
// refs, versions, hashes. Running the full numeric/secret spectrum over these
// corrupts the report (a healed-selector diff that reads "- [TOKEN] / + [TOKEN]"
// tells the reader nothing). They still get email redaction, which is the only
// real PII that plausibly appears inside a selector.
const STRUCTURAL_KEYS = new Set(
  [
    "selector", "selectors", "fromSelector", "toSelector", "cssSelector", "css",
    "xpath", "kref", "krefs", "testId", "elementRef", "element_ref", "domPath",
    "version", "buildId", "build", "sha", "commit", "hash", "revision",
  ].map((k) => k.toLowerCase()),
)

function isStructuralKey(key: string | null): boolean {
  return key != null && STRUCTURAL_KEYS.has(key.toLowerCase())
}

function maskDeepKeyed<T>(value: T, key: string | null): T {
  if (typeof value === "string") {
    return (isStructuralKey(key) ? maskEmail(value) : maskPii(value)) as unknown as T
  }
  if (Array.isArray(value)) {
    // Arrays inherit their parent key's structural-ness (e.g. selectors: [...]).
    return value.map((v) => maskDeepKeyed(v, key)) as unknown as T
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = maskDeepKeyed(v, k)
    }
    return out as T
  }
  return value
}

export function maskDeep<T>(value: T): T {
  return maskDeepKeyed(value, null)
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

// FNV-1a 32-bit — a tiny, dependency-free, STABLE hash. Not a security boundary
// (a masked roster is a de-identification aid, not an anonymity guarantee); its
// job is only to keep two masked rows distinguishable.
function stableHash4(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, "0").slice(0, 4)
}

// PARTIAL email mask for tabular exports. Blanket "[EMAIL]" is correct for prose
// but destroys a roster: email is the ONLY identifier the member export carries
// (the allow-list is email/role/joined_at/status), so replacing every row with
// the same literal makes the CSV unusable. Keep the first local char + a stable
// 4-hex digest + the real domain: alice@acme.com → a***1f3c@acme.com.
export function maskEmailPartial(email: string): string {
  const s = String(email ?? "")
  const at = s.lastIndexOf("@")
  if (at <= 0 || at === s.length - 1) {
    // Not an address we can partially mask — fall back to full redaction.
    return s.trim() === "" ? s : "[EMAIL]"
  }
  const local = s.slice(0, at)
  const domain = s.slice(at + 1)
  return `${local[0]}***${stableHash4(s.toLowerCase())}@${domain}`
}

// Mask the email value in a single member export row (partial — see above).
export function maskMemberExportRow(row: MemberExportRowLike): MemberExportRowLike {
  return { ...row, email: maskEmailPartial(row.email) }
}

// ---------------------------------------------------------------------------
// Screenshot redaction (KLAVITYKLA-363)
// ---------------------------------------------------------------------------
//
// WHY WE WITHHOLD RATHER THAN REDACT REGIONS: text masking is cosmetic while the
// screenshot beside it still shows the same address verbatim. We have no image
// library in the dependency tree (deps are @anthropic-ai/sdk, @libsql/client,
// rrweb, zod), so pixel-level blurring would mean a new dependency, and OCR-based
// region redaction would mean a per-report ML cost AND a partial redaction that
// LOOKS safe while leaking whatever the detector missed. A withheld screenshot is
// strictly better than a leaked one and is honest about what happened.
//
// A CSS `filter: blur()` on the <img> was rejected too: the raw base64 bytes would
// still be embedded in the report HTML (and plausibly in the PDF's image objects),
// so "no raw bytes reach the surface" would be false.
export const SCREENSHOT_WITHHELD_NOTICE = "Screenshot withheld — PII masking is on for this project."

// Evidence keys that point at (or carry) screenshot bytes. Stripped under masking
// so neither the pixels nor the S3 pointer to them survive onto a shared surface.
const SCREENSHOT_EVIDENCE_KEYS = [
  "screenshotKey", "screenshotUrl", "screenshotDataUrl", "screenshotBase64", "screenshot",
]

function stripScreenshotRefs(ev: Record<string, unknown> | null): Record<string, unknown> | null {
  if (ev == null) return ev
  const out: Record<string, unknown> = { ...ev }
  for (const k of SCREENSHOT_EVIDENCE_KEYS) delete out[k]
  return out
}

// Remove any resolved screenshot (base64 data URL or presigned URL) from a report
// step and leave a clearly-labelled placeholder in its place.
function withholdStepScreenshot<S extends { evidence: Record<string, unknown> | null; [k: string]: unknown }>(s: S): S {
  const ev = s.evidence as Record<string, unknown> | null
  const hadShot =
    s.screenshotUrl != null ||
    s.screenshotError != null ||
    (ev != null && SCREENSHOT_EVIDENCE_KEYS.some((k) => ev[k] != null))
  const out = { ...s, evidence: stripScreenshotRefs(ev) } as Record<string, unknown>
  delete out.screenshotUrl
  if (hadShot) out.screenshotError = SCREENSHOT_WITHHELD_NOTICE
  return out as S
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

// Redact PII from free-text fields (finding titles, evidence blobs, judgment rationale)
// AND withhold every screenshot (KLAVITYKLA-363 — see SCREENSHOT_WITHHELD_NOTICE above).
//
// This is the LAST line of defence: gatherWalkReport is also told to skip resolving
// screenshot bytes when masking is on (so we never pay the S3 fetch), but any caller
// that only applies this transform still gets an image-free report.
export function maskWalkReportData<T extends MaskableWalkReport>(data: T): T {
  return {
    ...data,
    findings: data.findings.map((f) => ({
      ...f,
      title: maskPii(f.title),
      groundQuote: f.groundQuote != null ? maskPii(f.groundQuote) : null,
      evidence: f.evidence != null ? maskDeep(stripScreenshotRefs(f.evidence)) : null,
    })),
    steps: data.steps.map((s) => {
      const withheld = withholdStepScreenshot(s)
      return { ...withheld, evidence: withheld.evidence != null ? maskDeep(withheld.evidence) : null }
    }),
    judgment: data.judgment
      ? {
          ...data.judgment,
          verdicts: (data.judgment.verdicts ?? []).map((v) => ({
            ...v,
            rationale: typeof v?.rationale === "string" ? maskPii(v.rationale) : v?.rationale,
          })),
          overallNote: data.judgment.overallNote != null ? maskPii(data.judgment.overallNote) : null,
        }
      : data.judgment,
  }
}
