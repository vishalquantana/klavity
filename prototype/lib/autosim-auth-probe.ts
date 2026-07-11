import {
  finishAutosimAuthProbe,
  getAutosimAuthConfigEncrypted,
  getAutosimAuthProbe,
  markAutosimAuthProbeRunning,
  projectById,
  type AutosimAuthMethod,
} from "./db"
import { decryptSecret } from "./crypto"
import { validateAutosimMintToken, autosimMintUrl, type MintablePage } from "./autosim-auth-exec"
import { autoResumeNeedsAuthSessions, type AutoResumeNeedsAuthResult } from "./trails-author"
import type { BrowserHandle } from "./trails-browser-page"

export type AutosimAuthProbeConfig = {
  projectId: string
  method: AutosimAuthMethod
  email: string
  secret: string
  notes: string | null
}

/**
 * Discriminates the three meaningful outcomes of a mint_link probe:
 *  - "bad-format"   — token/path failed structural validation; browser was never opened.
 *  - "drive-failed" — format OK but the browser drive did not land in an authenticated state.
 *  - "verified"     — drive confirmed an authenticated session was established.
 *  - "ok"           — generic success for non-mint methods (fixed_otp etc.).
 */
export type ProbeFailureKind = "bad-format" | "drive-failed" | "no-browser"

export type AutosimAuthProbeResult = {
  ok: boolean
  /** Human-readable reason string — always present on failure, often present on success for transparency. */
  error?: string | null
  /**
   * Structured discriminant for mint_link probes. Helps the caller surface actionable error messages:
   *  - "bad-format"   → the token/path was structurally invalid (fast-path, no browser opened).
   *  - "drive-failed" → format was valid but the drive did not reach an authenticated state.
   *  - "no-browser"   → no browser infrastructure available; verification could not be attempted.
   * Absent on success or on non-mint methods.
   */
  failureKind?: ProbeFailureKind
}

export type RunAutosimAuthProbeResult = AutosimAuthProbeResult & {
  probeId: string
  projectId: string
  resumeSummary: AutoResumeNeedsAuthResult | null
}

/**
 * Factory that produces a BrowserHandle for the probe drive. Injectable so tests can supply a
 * fully hermetic mock without requiring a real browser or network connection.
 *
 * The factory receives the project's base URL (or null when the project has no site_url configured)
 * so implementations can branch on whether a real drive is possible.
 *
 * Returns null to signal "no browser available" — the probe will degrade gracefully with
 * failureKind:"no-browser" rather than a false-positive verified result.
 */
export type ProbeBrowserFactory = (baseUrl: string | null) => Promise<BrowserHandle | null>

export type AutosimAuthVerifier = (config: AutosimAuthProbeConfig, browserFactory?: ProbeBrowserFactory) => Promise<AutosimAuthProbeResult>

export function redactedAutosimAuthConfig(config: AutosimAuthProbeConfig) {
  return {
    projectId: config.projectId,
    method: config.method,
    email: config.email,
    secret: "[REDACTED]",
    notes: config.notes,
  }
}

function redactSecret(message: unknown, secret?: string | null): string {
  let out = String((message as any)?.message || message || "auth probe failed")
  if (secret) out = out.split(secret).join("[REDACTED]")
  return out.slice(0, 1000)
}

/** Hard cap for the probe browser drive so a hung page cannot block the auth-config flow. */
const PROBE_DRIVE_TIMEOUT_MS = Number(process.env.AUTOSIM_PROBE_DRIVE_TIMEOUT_MS) || 30_000

/** Detect whether the current page looks like an auth gate (login wall). */
function looksLikeAuthGate(snapshot: string): boolean {
  const s = snapshot.toLowerCase()
  return /\b(password|otp|one[- ]?time|verification code|sign in|log in|login)\b/.test(s)
}

/**
 * Drive the mint link against the customer's /test-login endpoint using an injectable browser.
 *
 * Returns a structured result distinguishing:
 *   ok:true              — drive genuinely landed in an authenticated state
 *   failureKind:"bad-format"    — token/path validation failed (browser never opened)
 *   failureKind:"drive-failed"  — browser opened but authed state was not reached
 *   failureKind:"no-browser"    — no browser available; cannot verify
 */
async function driveMintLinkProbe(
  config: AutosimAuthProbeConfig,
  browserFactory: ProbeBrowserFactory,
): Promise<AutosimAuthProbeResult> {
  const secret = config.secret.trim()

  // ── Step 1: fast pre-check — validate token format/signature before spending a browser ────────
  const token = secret.startsWith("/")
    ? ((() => { try { return new URL(secret, "https://example.invalid").searchParams.get("token") || "" } catch { return "" } })())
    : secret

  try {
    await validateAutosimMintToken(token, config.projectId)
  } catch (e: any) {
    return { ok: false, error: redactSecret(e, secret), failureKind: "bad-format" }
  }

  // ── Step 2: look up the project's base URL so we can build the full mint URL ─────────────────
  let baseUrl: string | null = null
  try {
    const proj = await projectById(config.projectId)
    baseUrl = proj?.siteUrl ?? null
  } catch {
    // DB lookup failure is non-fatal; we'll still try if notes contains a URL
  }
  // Also check notes for an explicit override (e.g. "baseUrl:https://staging.example.com")
  if (!baseUrl && config.notes) {
    const m = config.notes.match(/(?:^|\s)baseUrl:\s*(https?:\/\/[^\s]+)/i)
    if (m) baseUrl = m[1]
  }

  // ── Step 3: acquire a browser (injectable) ───────────────────────────────────────────────────
  let handle: BrowserHandle | null = null
  try {
    handle = await browserFactory(baseUrl)
  } catch (e: any) {
    return { ok: false, error: `probe browser factory threw: ${redactSecret(e, secret)}`, failureKind: "no-browser" }
  }
  if (!handle) {
    return {
      ok: false,
      error: "could not verify mint_link — no browser available (set AUTOSIM_CDP_URL or install Playwright Chromium)",
      failureKind: "no-browser",
    }
  }

  // ── Step 4: drive the /test-login URL and confirm an authenticated session results ──────────
  let page: MintablePage | null = null
  try {
    const bp = await handle.newPage()
    page = bp

    // Build the absolute mint URL. We need a base URL to do this.
    if (!baseUrl) {
      return { ok: false, error: "mint_link probe: project has no site_url configured — cannot build /test-login URL", failureKind: "drive-failed" }
    }

    let mintUrl: string
    try {
      mintUrl = autosimMintUrl(secret, baseUrl)
    } catch (e: any) {
      return { ok: false, error: redactSecret(e, secret), failureKind: "bad-format" }
    }

    // Navigate to the mint link within a hard timeout
    const deadline = Date.now() + PROBE_DRIVE_TIMEOUT_MS
    const navTimeout = Math.min(PROBE_DRIVE_TIMEOUT_MS, 20_000)
    await bp.goto(mintUrl, navTimeout)

    // Allow up to 500ms for session cookie to be set
    await bp.waitMs(500)

    // ── Authenticated-state detection ─────────────────────────────────────────────────────────
    // Primary signal: the app redirected away from /test-login.
    const afterUrl = bp.url()
    let stillOnMintPath = false
    try {
      stillOnMintPath = new URL(afterUrl).pathname === "/test-login"
    } catch {}
    if (stillOnMintPath) {
      return { ok: false, error: "mint_link drive: browser remained on /test-login after navigation — session was not established", failureKind: "drive-failed" }
    }

    // Secondary signal: navigate back to the app root and confirm no login wall is shown.
    const remainingMs = deadline - Date.now()
    if (remainingMs > 2000) {
      const rootTimeout = Math.min(remainingMs - 500, 15_000)
      try {
        await bp.goto(baseUrl, rootTimeout)
        await bp.waitMs(250)
      } catch {
        // If navigation to root fails, we still consider the primary signal sufficient
        return { ok: true, error: null }
      }
      if (typeof (bp as any).krefSnapshot === "function") {
        const snap = await (bp as any).krefSnapshot(4_000).catch(() => "")
        if (snap && looksLikeAuthGate(snap)) {
          return { ok: false, error: "mint_link drive: app root showed login wall after mint navigation — session was not established", failureKind: "drive-failed" }
        }
      }
    }

    return { ok: true, error: null }
  } catch (e: any) {
    return { ok: false, error: `mint_link drive failed: ${redactSecret(e, secret)}`, failureKind: "drive-failed" }
  } finally {
    // Always close the browser — never throw from cleanup
    try { await handle.close() } catch {}
  }
}

/**
 * Default verifier used in production. For mint_link: performs a real browser drive of the
 * customer's /test-login endpoint via the injectable BrowserFactory (falls back to acquireBrowser
 * when no factory is supplied). For fixed_otp: validates the secret length only (no browser).
 *
 * The existing format/signature check is kept as a fast pre-check so we never waste a browser
 * on a token that is structurally invalid.
 */
export const defaultAutosimAuthVerifier: AutosimAuthVerifier = async (config, browserFactory?) => {
  const secret = config.secret.trim()
  if (!secret) return { ok: false, error: "auth secret is empty" }

  if (config.method === "fixed_otp") {
    if (secret.length < 4 || secret.length > 128) return { ok: false, error: "fixed OTP secret has an invalid length" }
    return { ok: true }
  }

  if (config.method === "mint_link") {
    // Fast structural rejection before touching a browser
    if (/^https?:\/\//i.test(secret)) {
      return { ok: false, error: "mint_link secret must be an opaque token or same-origin /test-login path", failureKind: "bad-format" }
    }

    // Resolve the browser factory: use the injected one, or fall back to acquireBrowser.
    const factory: ProbeBrowserFactory = browserFactory ?? (async (_baseUrl) => {
      try {
        const { acquireBrowser } = await import("./trails-browser-page")
        return await acquireBrowser({ headless: true })
      } catch {
        return null
      }
    })

    return await driveMintLinkProbe(config, factory)
  }

  // Unknown method — fail safe
  return { ok: false, error: `unknown auth method: ${config.method}` }
}

export async function runAutosimAuthProbe(
  probeId: string,
  opts: {
    verifier?: AutosimAuthVerifier
    browserFactory?: ProbeBrowserFactory
    resume?: typeof autoResumeNeedsAuthSessions
  } = {},
): Promise<RunAutosimAuthProbeResult> {
  const started = await markAutosimAuthProbeRunning(probeId)
  const probe = started ?? await getAutosimAuthProbe(probeId)
  if (!probe) throw new Error("autosim auth probe not found")

  const encrypted = await getAutosimAuthConfigEncrypted(probe.projectId)
  if (!encrypted) {
    const error = "auth config missing"
    await finishAutosimAuthProbe({ probeId, projectId: probe.projectId, ok: false, error })
    return { ok: false, error, probeId, projectId: probe.projectId, resumeSummary: null }
  }

  let secret = ""
  try {
    secret = await decryptSecret(encrypted.secretEnc)
    const config: AutosimAuthProbeConfig = {
      projectId: encrypted.projectId,
      method: encrypted.method,
      email: encrypted.email,
      secret,
      notes: encrypted.notes,
    }
    const verified = await (opts.verifier ?? defaultAutosimAuthVerifier)(config, opts.browserFactory)
    if (!verified.ok) {
      const error = redactSecret(verified.error || "auth probe failed", secret)
      await finishAutosimAuthProbe({ probeId, projectId: probe.projectId, ok: false, error })
      return { ok: false, error, failureKind: verified.failureKind, probeId, projectId: probe.projectId, resumeSummary: null }
    }

    await finishAutosimAuthProbe({ probeId, projectId: probe.projectId, ok: true, resumeSummary: null })
    const resumeSummary = await (opts.resume ?? autoResumeNeedsAuthSessions)(probe.projectId)
    await finishAutosimAuthProbe({ probeId, projectId: probe.projectId, ok: true, resumeSummary })
    return { ok: true, error: null, probeId, projectId: probe.projectId, resumeSummary }
  } catch (e: any) {
    const error = redactSecret(e, secret)
    await finishAutosimAuthProbe({ probeId, projectId: probe.projectId, ok: false, error })
    return { ok: false, error, probeId, projectId: probe.projectId, resumeSummary: null }
  }
}
