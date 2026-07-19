// sim-preview — headless URL → screenshot, so the onboarding "instant aha" can react a Sim to a
// user's real page from one pasted URL (no widget install, no monitored-URL allowlist). The route
// (/api/sim/preview in server.ts) SSRF-guards the URL first, then feeds this screenshot to reactToPage.
//
// KLA-264 (JTBD 3.12): behind-auth previews. When a project has a registered AutoSim auth method
// (ADR-0001, encrypted at rest), authedScreenshotUrl establishes the logged-in session in the same
// headless browser BEFORE screenshotting, so headless previews + scheduled runs can review the
// logged-in app — the highest-value client surface. Credentials are decrypted at execution time
// only (inside establishAutosimSession) and are NEVER returned to the caller, client, or logs.
//
// The browser factory is injectable so the plumbing is unit-testable without launching Chromium.
import { acquireBrowser } from "./trails-browser-page"
import {
  loadAutosimAuthConfig, establishAutosimSession,
  type DecryptedAutosimAuthConfig,
} from "./autosim-auth-exec"

export interface ScreenshotDeps {
  // defaults to the real AutoSims browser factory (honors AUTOSIM_CDP_URL / Steel)
  acquire?: typeof acquireBrowser
}

export interface ScreenshotResult {
  imageB64: string // base64 JPEG, no data: prefix
  mediaType: "image/jpeg"
  /** true when a logged-in session was established before the shot (KLA-264). */
  authed?: boolean
}

/**
 * Navigate a headless browser to `url` and return a base64 JPEG screenshot.
 * Always closes the browser handle. Throws on navigation/screenshot failure.
 * `url` MUST already be SSRF-validated by the caller (this drives a real browser at it).
 */
export async function screenshotUrl(
  url: string,
  opts: { navTimeoutMs?: number; shotTimeoutMs?: number; quality?: number; settleMs?: number; fullPage?: boolean } = {},
  deps: ScreenshotDeps = {},
): Promise<ScreenshotResult> {
  const acquire = deps.acquire ?? acquireBrowser
  const navTimeoutMs = opts.navTimeoutMs ?? 15000
  const shotTimeoutMs = opts.shotTimeoutMs ?? 10000
  const quality = opts.quality ?? 70
  const settleMs = opts.settleMs ?? 800

  const browser = await acquire({ headless: true })
  try {
    const page = await browser.newPage()
    await page.goto(url, navTimeoutMs)
    // brief settle so above-the-fold content/webfonts paint before the shot
    if (settleMs > 0) await page.waitMs(settleMs)
    const imageB64 = await page.screenshotJpeg(quality, shotTimeoutMs, { fullPage: !!opts.fullPage })
    if (!imageB64 || imageB64.length < 100) throw new Error("empty screenshot")
    return { imageB64, mediaType: "image/jpeg" }
  } finally {
    await browser.close().catch(() => {})
  }
}

// ── KLA-264 (JTBD 3.12): behind-auth screenshots via AutoSim Test Accounts ────────────────────────
//
// Reuse AutoSim's encrypted auth config (ADR-0001): establish the logged-in session in the SAME
// headless browser tab, THEN navigate to the target URL and screenshot the authed state. The only
// method that can be driven headlessly without an LLM filling a login form is `mint_link` (a signed
// session-mint link that sets the cookie in one navigation). fixed_otp needs the drive model to fill
// a form, so it is out of scope for a plain headless screenshot and callers fall back to the public
// path with the "configure a Test Account" hint.

export interface AuthedScreenshotDeps extends ScreenshotDeps {
  /** Load + decrypt the project's registered AutoSim auth method. Defaults to loadAutosimAuthConfig. */
  loadAuthConfig?: (projectId: string) => Promise<DecryptedAutosimAuthConfig | null>
  /** Establish a logged-in session on the page. Defaults to establishAutosimSession. */
  establishSession?: typeof establishAutosimSession
}

/** True when the project has a headlessly-establishable auth method (mint_link) configured. */
export async function projectHasHeadlessAuth(
  projectId: string,
  deps: Pick<AuthedScreenshotDeps, "loadAuthConfig"> = {},
): Promise<boolean> {
  const loadAuthConfig = deps.loadAuthConfig ?? loadAutosimAuthConfig
  const cfg = await loadAuthConfig(projectId).catch(() => null)
  return !!cfg && cfg.method === "mint_link"
}

export interface AuthedScreenshotResult extends ScreenshotResult {
  /** true when the auth session was established before the shot (the shot shows the authed state). */
  authed: boolean
}

/**
 * Screenshot `url` as a logged-in user, reusing the project's encrypted AutoSim auth method.
 *
 * Behaviour:
 *   • No auth config, or a non-headless method (fixed_otp) → falls back to a plain public screenshot
 *     (authed:false). The caller decides whether that is acceptable or should surface the
 *     "configure a Test Account" hint.
 *   • mint_link config → establishes the session first, then navigates to `url` and screenshots
 *     (authed:true when the session verified). The token-bearing mint URL is navigated transiently
 *     and never returned/logged (ADR-0001).
 *
 * `url` MUST already be SSRF-validated by the caller. Always closes the browser handle.
 */
export async function authedScreenshotUrl(
  url: string,
  projectId: string,
  opts: { navTimeoutMs?: number; shotTimeoutMs?: number; quality?: number; settleMs?: number } = {},
  deps: AuthedScreenshotDeps = {},
): Promise<AuthedScreenshotResult> {
  const acquire = deps.acquire ?? acquireBrowser
  const loadAuthConfig = deps.loadAuthConfig ?? loadAutosimAuthConfig
  const establishSession = deps.establishSession ?? establishAutosimSession
  const navTimeoutMs = opts.navTimeoutMs ?? 15000
  const shotTimeoutMs = opts.shotTimeoutMs ?? 10000
  const quality = opts.quality ?? 70
  const settleMs = opts.settleMs ?? 800

  // Decrypt-at-execution only; never persisted/returned/logged (ADR-0001).
  const cfg = await loadAuthConfig(projectId).catch(() => null)

  const browser = await acquire({ headless: true })
  try {
    const page = await browser.newPage()
    let authed = false
    // mint_link is the only method establishable in a plain headless tab (no LLM form-fill).
    if (cfg && cfg.method === "mint_link") {
      // establishAutosimSession navigates the signed mint link (sets the cookie), then `url`.
      const res = await establishSession(page as any, cfg, url)
      authed = res.established
    }
    // Navigate to the target. When a session was established, this loads the authed page; when not,
    // it loads the public page (or the login gate) exactly as the plain path would.
    await page.goto(url, navTimeoutMs)
    if (settleMs > 0) await page.waitMs(settleMs)
    const imageB64 = await page.screenshotJpeg(quality, shotTimeoutMs)
    if (!imageB64 || imageB64.length < 100) throw new Error("empty screenshot")
    return { imageB64, mediaType: "image/jpeg", authed }
  } finally {
    await browser.close().catch(() => {})
  }
}

// A neutral ephemeral persona used when the caller has not generated one yet — "a first-time visitor
// evaluating this product in a couple of minutes". Nothing is persisted; reactToPage treats it as
// ephemeral (simId=null) so there is no cross-tenant lookup.
export function defaultPreviewPersona() {
  return {
    name: "Sam Rivera",
    role: "First-time visitor",
    type: "client" as const,
    initials: "SR",
    accent: "#6366f1",
    summary:
      "A first-time visitor evaluating this product in a couple of minutes. Skims for what it does, whether it fits, and what to do next — quick to notice friction, dead-ends, or confusing copy.",
    insights: [
      { kind: "want" as const, text: "Understand what this does and if it fits, fast", quote: "Okay — what is this and is it for me?" },
      { kind: "pain" as const, text: "Bounces on unclear value or a confusing next step", quote: "I am not sure what I am supposed to click here." },
      { kind: "love" as const, text: "A clear, obvious path to try it", quote: "Nice — one button and I am in." },
    ],
  }
}
