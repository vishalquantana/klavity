// lib/trails-branding.ts — White-label / agency branding (KLAVITYKLA-223, JTBD 7.10).
//
// Agencies pay to put THEIR name on reliability. This module owns the shared per-project
// branding config that skins the three client-visible evidence artifacts:
//   1. the weekly Trust digest email (lib/trust-report.ts)
//   2. the public Walk-report share page + PDF (lib/trails-report.ts)
//   3. the client Status Portal (public/project-status.html via the portal data JSON)
//
// Branding config lives inside projects.modal_config_json under the key `agency_branding`
// (same no-migration pattern as the portal token + widget appearance). Shape on disk:
//   { name?: string, accent?: "#rrggbb", logoDataUrl?: "data:image/…;base64,…", whiteLabel?: boolean }
//
// Trust model: name + accent + logo all render on PUBLIC pages, so every input is treated as
// untrusted — the agency name is HTML-escaped (no reflected XSS), the accent is format-checked
// against a strict hex regex, and the logo must be a small, known image data-URL. The default
// footer "Monitored by <Agency> · powered by Klavity" is the PLG carrier (the "powered by
// Klavity" text links to signup); full white-label (footer removed) is a Pro-gated flag, gated
// exactly like the widget custom-colors Pro feature.

export const AGENCY_BRANDING_KEY = "agency_branding"

// Public signup destination the "powered by Klavity" backlink points at — this is the PLG loop.
export const KLAVITY_SIGNUP_URL = "https://klavity.in/signup"

// Caps for untrusted inputs that render on public pages.
export const MAX_AGENCY_NAME_LEN = 60
// Logo data-URL byte budget. Small on purpose: it is inlined into every email/PDF/portal render.
export const MAX_LOGO_DATA_URL_BYTES = 96 * 1024 // ~96 KB of base64
const ALLOWED_LOGO_MIME = new Set(["image/png", "image/jpeg", "image/svg+xml", "image/webp", "image/gif"])

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Stored / persisted branding config (all fields optional; missing = unbranded default). */
export interface AgencyBranding {
  name?: string
  accent?: string
  logoDataUrl?: string
  whiteLabel?: boolean
}

/** Render-ready branding: defaults filled in, `branded` = has any custom skin applied. */
export interface ResolvedBranding {
  branded: boolean
  name: string | null
  accent: string
  logoDataUrl: string | null
  whiteLabel: boolean
}

// Klavity's own default accent (matches the digest/portal purple).
export const DEFAULT_ACCENT = "#6366f1"

// ---------------------------------------------------------------------------
// HTML escape — public pages render agency name; keep it inert (no reflected XSS).
// ---------------------------------------------------------------------------

export function escapeBranding(s: string | null | undefined): string {
  if (s == null) return ""
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// ---------------------------------------------------------------------------
// Validation — every input is untrusted (renders on public pages).
// ---------------------------------------------------------------------------

/** Strict 3- or 6-digit hex color (#rgb / #rrggbb). Anything else is rejected. */
export function isValidAccent(s: unknown): s is string {
  return typeof s === "string" && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s.trim())
}

/** Validate a logo data-URL: must be an allowed image MIME, base64, and within the byte budget. */
export function isValidLogoDataUrl(s: unknown): s is string {
  if (typeof s !== "string") return false
  const m = /^data:([a-z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(s.trim())
  if (!m) return false
  const mime = m[1].toLowerCase()
  if (!ALLOWED_LOGO_MIME.has(mime)) return false
  if (s.length > MAX_LOGO_DATA_URL_BYTES) return false
  return true
}

export type BrandingValidation =
  | { ok: true; branding: AgencyBranding }
  | { ok: false; error: string }

/**
 * Sanitize + validate raw branding input from the API.
 *   - name: trimmed, capped, HTML-escaped ON RENDER (stored raw, escaped by renderers).
 *   - accent: must match the strict hex regex, else rejected.
 *   - logoDataUrl: must be an allowed small image data-URL, else rejected.
 *   - whiteLabel: Pro-gated — non-Pro accounts cannot remove the Klavity footer.
 * Empty string / null on any field CLEARS it (so a caller can un-brand). Unknown keys ignored.
 */
export function sanitizeBrandingInput(
  raw: unknown,
  opts: { isPro: boolean },
): BrandingValidation {
  if (raw == null || typeof raw !== "object") return { ok: false, error: "branding must be an object." }
  const b = raw as Record<string, unknown>
  const out: AgencyBranding = {}

  // name
  if (b.name !== undefined && b.name !== null) {
    const name = String(b.name).trim()
    if (name.length > MAX_AGENCY_NAME_LEN) {
      return { ok: false, error: `Agency name must be ${MAX_AGENCY_NAME_LEN} characters or fewer.` }
    }
    if (name) out.name = name // stored raw; renderers escape it
  }

  // accent
  if (b.accent !== undefined && b.accent !== null && String(b.accent).trim() !== "") {
    if (!isValidAccent(b.accent)) {
      return { ok: false, error: "Accent color must be a hex value like #6366f1." }
    }
    out.accent = String(b.accent).trim().toLowerCase()
  }

  // logo
  if (b.logoDataUrl !== undefined && b.logoDataUrl !== null && String(b.logoDataUrl).trim() !== "") {
    if (!isValidLogoDataUrl(b.logoDataUrl)) {
      return {
        ok: false,
        error: `Logo must be a PNG/JPEG/SVG/WebP/GIF image data-URL under ${Math.round(MAX_LOGO_DATA_URL_BYTES / 1024)} KB.`,
      }
    }
    out.logoDataUrl = String(b.logoDataUrl).trim()
  }

  // whiteLabel — Pro-gated (cf. widget custom-colors Pro gating).
  if (b.whiteLabel !== undefined && b.whiteLabel !== null) {
    const want = b.whiteLabel === true || b.whiteLabel === "true" || b.whiteLabel === 1
    if (want && !opts.isPro) {
      return { ok: false, error: "Full white-label (removing the Klavity footer) requires a paid plan." }
    }
    if (want) out.whiteLabel = true
  }

  return { ok: true, branding: out }
}

// ---------------------------------------------------------------------------
// Resolve — normalize stored config into a render-ready shape with defaults.
// ---------------------------------------------------------------------------

/** Coerce whatever is stored (or nothing) into a safe, render-ready ResolvedBranding. */
export function resolveBranding(raw: unknown): ResolvedBranding {
  const b = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const name = typeof b.name === "string" && b.name.trim() ? b.name.trim().slice(0, MAX_AGENCY_NAME_LEN) : null
  const accent = isValidAccent(b.accent) ? String(b.accent).trim().toLowerCase() : DEFAULT_ACCENT
  const logoDataUrl = isValidLogoDataUrl(b.logoDataUrl) ? String(b.logoDataUrl).trim() : null
  const whiteLabel = b.whiteLabel === true
  const branded = !!(name || logoDataUrl || (isValidAccent(b.accent)))
  return { branded, name, accent, logoDataUrl, whiteLabel }
}

// ---------------------------------------------------------------------------
// DB read/write — thin wrappers over modal_config_json (no migration).
// ---------------------------------------------------------------------------

/** Read the render-ready branding for a project. Never throws; unbranded default on any miss. */
export async function getProjectBranding(projectId: string): Promise<ResolvedBranding> {
  try {
    const { getProjectModalConfig } = await import("./db")
    const cfg = await getProjectModalConfig(projectId)
    return resolveBranding(cfg[AGENCY_BRANDING_KEY])
  } catch {
    return resolveBranding(null)
  }
}

/** Persist branding (merged into modal_config_json). Passing null clears it. */
export async function setProjectBranding(projectId: string, branding: AgencyBranding | null): Promise<void> {
  const { getProjectModalConfig, setProjectModalConfig } = await import("./db")
  const cfg = await getProjectModalConfig(projectId)
  if (branding == null || Object.keys(branding).length === 0) {
    delete cfg[AGENCY_BRANDING_KEY]
  } else {
    cfg[AGENCY_BRANDING_KEY] = branding
  }
  await setProjectModalConfig(projectId, cfg)
}

// ---------------------------------------------------------------------------
// Footer builders — the PLG carrier shared by every public/client-facing artifact.
// ---------------------------------------------------------------------------

/**
 * The default footer line: "Monitored by <Agency> · powered by Klavity", where "powered by
 * Klavity" links to signup (the PLG backlink). When white-label is on (paid tier) the Klavity
 * part is removed entirely — returns the agency-only line, or "" when there is nothing to show.
 * Returns an HTML string; the agency name is escaped.
 */
export function brandingFooterHtml(
  b: ResolvedBranding,
  opts?: { signupUrl?: string; linkColor?: string },
): string {
  const signupUrl = opts?.signupUrl || KLAVITY_SIGNUP_URL
  const linkColor = opts?.linkColor || b.accent
  const name = b.name ? escapeBranding(b.name) : null
  const monitoredBy = name ? `Monitored by <strong>${name}</strong>` : ""
  const poweredBy = `<a href="${escapeBranding(signupUrl)}" style="color:${escapeBranding(linkColor)};text-decoration:none" target="_blank" rel="noopener">powered by Klavity</a>`

  if (b.whiteLabel) {
    // Full white-label: no Klavity mention at all.
    return monitoredBy
  }
  if (monitoredBy) return `${monitoredBy} &middot; ${poweredBy}`
  return poweredBy
}

/** Plain-text variant of the footer (for the digest text/plain part). Agency name is raw text. */
export function brandingFooterText(b: ResolvedBranding, opts?: { signupUrl?: string }): string {
  const signupUrl = opts?.signupUrl || KLAVITY_SIGNUP_URL
  const monitoredBy = b.name ? `Monitored by ${b.name}` : ""
  if (b.whiteLabel) return monitoredBy
  const poweredBy = `powered by Klavity — ${signupUrl}`
  if (monitoredBy) return `${monitoredBy} · ${poweredBy}`
  return poweredBy
}
