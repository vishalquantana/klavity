// sim-preview — headless URL → screenshot, so the onboarding "instant aha" can react a Sim to a
// user's real page from one pasted URL (no widget install, no monitored-URL allowlist). The route
// (/api/sim/preview in server.ts) SSRF-guards the URL first, then feeds this screenshot to reactToPage.
//
// The browser factory is injectable so the plumbing is unit-testable without launching Chromium.
import { acquireBrowser } from "./trails-browser-page"

export interface ScreenshotDeps {
  // defaults to the real AutoSims browser factory (honors AUTOSIM_CDP_URL / Steel)
  acquire?: typeof acquireBrowser
}

export interface ScreenshotResult {
  imageB64: string // base64 JPEG, no data: prefix
  mediaType: "image/jpeg"
}

/**
 * Navigate a headless browser to `url` and return a base64 JPEG screenshot.
 * Always closes the browser handle. Throws on navigation/screenshot failure.
 * `url` MUST already be SSRF-validated by the caller (this drives a real browser at it).
 */
export async function screenshotUrl(
  url: string,
  opts: { navTimeoutMs?: number; shotTimeoutMs?: number; quality?: number; settleMs?: number } = {},
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
    const imageB64 = await page.screenshotJpeg(quality, shotTimeoutMs)
    if (!imageB64 || imageB64.length < 100) throw new Error("empty screenshot")
    return { imageB64, mediaType: "image/jpeg" }
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
