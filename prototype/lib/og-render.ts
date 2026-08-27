// KLA-738 — headless render + crawler-safe serving for OG social cards.
//
// RENDER: reuses the app's existing headless-browser infra exactly like the PDF renderer
// (lib/trails-share.ts): withPdfSlot (the independent, serialized browser slot on the 1GB box) +
// chromium.launch(CHROMIUM_PROD_ARGS) + page.setContent(html) + page.screenshot(). The OG viewport is
// 1200×630 at deviceScaleFactor 2 → a crisp 2400×1260 PNG. (Steel/CDP is not used here — same rationale
// as PDF: the HTML is pre-built server-side and needs no kref/element-tree machinery, so a fresh local
// Chromium context is the simplest compatible path regardless of AUTOSIM_CDP_URL.)
//
// SERVE (crawler-safe): OG crawlers (Slackbot/LinkedInBot/Twitterbot/facebookexternalhit/Discordbot)
// have ~3–10s timeouts and DON'T retry, so we NEVER render synchronously on their request. GET
// /og/:ref.png serves cache-or-default INSTANTLY: S3 cache hit → stream it; cache MISS → return the
// pre-built DEFAULT card immediately AND enqueue a BACKGROUND render for next time. The URL is
// versioned (?v=updated_at → keyed as og/<ref>-<v>.png) so a changed ticket busts the cache while
// stable ones stay cached forever.

import { renderOgCardHtml, type OgCardData } from "./og-card"
import { uploadObject, getObjectStream, s3Configured } from "./s3"

// EMOJI ON PROD (KLA-738): the roast card's 🍌 / 🔥 render in full color wherever a color-emoji font is
// installed (macOS ships Apple Color Emoji; verified locally). Headless Chromium on the Linux prod box
// needs a color-emoji font present system-wide — install `fonts-noto-color-emoji` (apt) so the CSS
// stack ("Noto Color Emoji", …) resolves. If absent, the emoji degrades to a monochrome glyph/tofu but
// the score number + labels always render, so the card never breaks — it just looks nicer with the font.
export const OG_WIDTH = 1200
export const OG_HEIGHT = 630
export const OG_SCALE = 2

/** Deterministic, cacheable S3 key. Version (a ticket's updated_at) is folded into the key so a
 *  changed ticket maps to a NEW object (cache-busted) while a stable ticket keeps its cached PNG. */
export function ogS3Key(ref: string, version?: string | number | null): string {
  const safeRef = String(ref).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80) || "x"
  const v = version != null && String(version).trim() ? String(version).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40) : ""
  return v ? `og/${safeRef}-${v}.png` : `og/${safeRef}.png`
}

// Minimal structural seams over Playwright so the render + conservative teardown is unit-testable with
// fakes (no real Chromium). Only the members we actually call.
export interface OgPageLike {
  setContent(html: string, opts?: any): Promise<void>
  evaluate(fn: any): Promise<any>
  screenshot(opts?: any): Promise<Uint8Array | ArrayBuffer | Buffer>
}
export interface OgContextLike { newPage(): Promise<OgPageLike>; close(): Promise<void> }
export interface OgBrowserLike { newContext(opts?: any): Promise<OgContextLike>; close(): Promise<void> }

// ── live-browser cap (KLA-739 C2-3 — CONSERVATIVE bound, round 8) ─────────────────────────────────
// A launch()ed Playwright Browser exposes NO killable process handle under Bun (BrowserServer does, but
// chromium.connect() to a local server TIMES OUT under Bun 1.3.14 — round 7 broke prod). So we CANNOT
// prove a process died. We bound live browsers CONSERVATIVELY: a browser counts as LIVE from launch, and
// the admission slot is released ONLY on a graceful browser.close() that RESOLVES successfully (the only
// available proof of shutdown). On ANY close failure — timeout OR rejection — we do NOT release: we PIN
// the slot. This bounds concurrent live browsers to OG_MAX_LIVE_BROWSERS. RESIDUAL (accepted, documented):
// repeated close-failures pin slots, so after `cap` failures OG fail-fasts to the default card — fail-
// CLOSED and BOUNDED (never an unbounded leak or crash). withPdfSlot is still released within
// closeTimeoutMs on a render timeout so PDF/AutoSim are never wedged.
export const OG_MAX_LIVE_BROWSERS = Math.max(1, Number(process.env.OG_MAX_INFLIGHT) || 4)
let _liveOgBrowsers = 0
/** Number of OG Chromium browsers currently counted LIVE (launched, graceful close not yet confirmed). */
export function ogLiveBrowserCount(): number { return _liveOgBrowsers }
/** TEST-ONLY: reset the live-browser counter between hermetic cases (no real process is touched). */
export function __resetOgLiveBrowsersForTest(): void { _liveOgBrowsers = 0 }

/** Thrown when the live-browser cap is saturated — the render is refused (caller serves the default). */
export class OgAdmissionError extends Error {
  constructor(message = "OG render refused: live-browser cap reached") { super(message); this.name = "OgAdmissionError" }
}

/**
 * Core render: build a page, screenshot it, race against a hard deadline; on timeout/error close the
 * browser (best-effort) so a hung render can't wedge the shared withPdfSlot (PDF/AutoSim use it too).
 *
 * Guarantees (proven by neg-controls):
 *   • ADMISSION: refuses (OgAdmissionError) when `maxLive` browsers are already live → concurrent live
 *     browsers are bounded by a fixed cap.
 *   • CONSERVATIVE RELEASE: the slot is released ONLY when browser.close() RESOLVES successfully. On close
 *     timeout OR rejection the slot is PINNED (we have no process handle under Bun to prove the process
 *     died) — so a failed close can never under-count, and the cap fail-fasts rather than leaking.
 *   • SLOT RELEASE: the caller (and thus withPdfSlot) returns within `closeTimeoutMs`.
 *   • LAUNCH FAILURE: a rejected / synchronously-throwing launcher created no browser → the pre-reserved
 *     slot is released (no leak).
 *
 * Injectable `launch` + `deadlineMs` + `closeTimeoutMs` + `maxLive` make this hermetically testable.
 */
export async function renderOgPngWith(
  html: string,
  launch: () => Promise<OgBrowserLike> | OgBrowserLike,
  deadlineMs = 20_000,
  closeTimeoutMs = 3_000,
  maxLive = OG_MAX_LIVE_BROWSERS,
): Promise<Uint8Array> {
  // Admission: refuse before launching if the cap is saturated (fail-fast → default card).
  if (_liveOgBrowsers >= maxLive) throw new OgAdmissionError()
  _liveOgBrowsers++
  let released = false
  const releaseLiveSlot = () => { if (!released) { released = true; _liveOgBrowsers-- } }

  // Wrap launch so a SYNCHRONOUSLY-throwing launcher becomes a rejected promise (still runs cleanup).
  const launchP: Promise<OgBrowserLike> = Promise.resolve().then(launch)
  let timer: ReturnType<typeof setTimeout> | undefined

  const render = async (): Promise<Uint8Array> => {
    const browser = await launchP
    const context = await browser.newContext({
      viewport: { width: OG_WIDTH, height: OG_HEIGHT },
      deviceScaleFactor: OG_SCALE,
    })
    const page = await context.newPage()
    await page.setContent(html, { waitUntil: "domcontentloaded" })
    // Wait for any <img>/font settle so gradients+emoji paint before the shot (best-effort).
    await page.evaluate(() => (document as any).fonts?.ready).catch(() => {})
    const buf = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: OG_WIDTH, height: OG_HEIGHT } })
    await context.close().catch(() => {})
    return new Uint8Array(buf as any)
  }

  // Conservative teardown: graceful browser.close(). Release the slot ONLY when close RESOLVES (whenever
  // it does — even late); a close that REJECTS or never settles keeps the slot PINNED (we can't prove the
  // process died without a handle). Launch failure → no browser → release (nothing was created).
  const runTeardown = async (): Promise<void> => {
    let browser: OgBrowserLike
    try { browser = await launchP } catch { releaseLiveSlot(); return } // launch failed → no browser → free slot
    const closeP = Promise.resolve().then(() => browser.close())
    void closeP.then(releaseLiveSlot, () => { /* close FAILED → PIN the slot (no proof of exit) */ })
    // Bound the SHARED-slot wait: return once close settles OR closeTimeoutMs elapses (never block PDF).
    await Promise.race([closeP.catch(() => {}), new Promise<void>((res) => setTimeout(res, closeTimeoutMs))])
  }

  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("OG render timed out (20s)")), deadlineMs)
  })
  try {
    return await Promise.race([render(), deadline])
  } finally {
    if (timer) clearTimeout(timer)
    const t = runTeardown()
    await Promise.race([t, new Promise<void>((res) => setTimeout(res, closeTimeoutMs))])
    void t.catch(() => {})
  }
}

/** Render an OG-card HTML document to a PNG at 1200×630 @2x. Uses chromium.launch() (the Bun-compatible
 *  path; launchServer()+connect() times out under Bun 1.3.14). Runs inside the shared withPdfSlot exactly
 *  like the PDF renderer, and is admission-capped (renderOgPngWith) to bound concurrent live browsers. */
export async function renderOgPng(html: string): Promise<Uint8Array> {
  const { withPdfSlot, CHROMIUM_PROD_ARGS } = await import("./trails-browser")
  const { chromium } = await import("playwright")
  return withPdfSlot(async () =>
    renderOgPngWith(html, () => chromium.launch({ headless: true, args: CHROMIUM_PROD_ARGS }) as unknown as Promise<OgBrowserLike>),
  )
}

// ── default card (prebuilt so the cache-miss path is INSTANT) ────────────────────────────────────
// A 1×1 transparent PNG — the fail-safe returned only if the real default card hasn't rendered yet
// (or Chromium/S3 is unavailable). The route NEVER blocks on a render, so this guarantees a fast 200.
const TRANSPARENT_PNG = Uint8Array.from(atob(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
), (c) => c.charCodeAt(0))

let _defaultPngPromise: Promise<Uint8Array> | null = null
let _defaultPngReady: Uint8Array | null = null

/** The branded DEFAULT card PNG, rendered once and cached in memory. Kicks off the render on first
 *  call; until it resolves, `defaultCardPngSync()` returns the transparent fail-safe so the route is
 *  never blocked. Call once on boot (prewarmDefaultOgCard) so the very first crawler miss is instant. */
export async function getDefaultCardPng(): Promise<Uint8Array> {
  if (_defaultPngReady) return _defaultPngReady
  if (!_defaultPngPromise) {
    _defaultPngPromise = renderOgPng(renderOgCardHtml({ type: "default" }))
      .then((png) => { _defaultPngReady = png; return png })
      .catch((e) => { _defaultPngPromise = null; throw e })
  }
  return _defaultPngPromise
}

/** Non-blocking accessor: the cached default card if ready, else the transparent fail-safe. */
export function defaultCardPngSync(): Uint8Array {
  return _defaultPngReady ?? TRANSPARENT_PNG
}

/** Fire-and-forget prewarm for server boot. */
export function prewarmDefaultOgCard(): void {
  void getDefaultCardPng().catch((e) => console.warn("[og] default card prewarm failed:", e?.message || e))
}

// ── background render queue (dedup by key so a burst of crawler misses renders once) ─────────────
const _inflight = new Set<string>()

// KLA-739 (C2-2 DoS): a GLOBAL bounded admission cap on concurrent/queued OG renders. Every render
// takes the single serialized withPdfSlot (shared with PDF export + AutoSim recording), so an attacker
// who defeats per-key dedupe (distinct refs) could otherwise flood that slot and starve real work. Once
// this many renders are in flight, further enqueues are DROPPED (the crawler still got the default card;
// the cache simply stays cold until pressure clears). Tunable via OG_MAX_INFLIGHT.
const OG_MAX_INFLIGHT = Math.max(1, Number(process.env.OG_MAX_INFLIGHT) || 4)

/**
 * Enqueue a BACKGROUND render → S3 upload for a ref+version. Deduped per key AND globally admission-
 * capped. Fire-and-forget; never throws into the caller. Skips entirely when S3 is unconfigured
 * (dev/test) — there's nowhere to cache — or when the global cap is saturated (DoS backpressure).
 * The uploaded object is PRIVATE (KLA-739 C1): /og streams it back via the gated route, so the bucket
 * never needs public-read exposure of ticket-derived imagery.
 */
export function enqueueOgRender(ref: string, version: string | number | null, loadData: () => Promise<OgCardData>): void {
  if (!s3Configured()) return
  const key = ogS3Key(ref, version)
  if (_inflight.has(key)) return
  if (_inflight.size >= OG_MAX_INFLIGHT) return // global backpressure — drop rather than pile onto the slot
  _inflight.add(key)
  ;(async () => {
    try {
      const data = await loadData()
      const png = await renderOgPng(renderOgCardHtml(data))
      await uploadObject(key, png, "image/png", "private")
    } catch (e: any) {
      // OgAdmissionError is EXPECTED backpressure (live-browser cap saturated by hung closes) — the crawler
      // already got the default card; log quietly, not as a failure.
      if (e instanceof OgAdmissionError) console.log("[og] render deferred (live-browser cap):", key)
      else console.warn("[og] background render failed for", key, "-", e?.message || e)
    } finally {
      _inflight.delete(key)
    }
  })()
}

/** True while a render for this ref+version is in flight (tests/introspection). */
export function isOgRenderInFlight(ref: string, version?: string | number | null): boolean {
  return _inflight.has(ogS3Key(ref, version))
}

/**
 * KLA-739 (C1): the response served for a ref that is NOT anon-shareable — an UNKNOWN ref OR a
 * login-gated (share_mode='off') / non-anon-shared ticket. It is BYTE-IDENTICAL for every such ref (the
 * prebuilt branded default card, same headers, no per-ref S3 probe, no `x-og-cache: hit`, no background
 * enqueue) so an anonymous crawler cannot use /og as an existence oracle to tell a private ticket apart
 * from a nonexistent one. This is the ONLY path allowed to serve those refs; it never renders/uploads.
 */
export function serveDefaultOgResponse(defaultPng: () => Uint8Array = defaultCardPngSync): Response {
  return new Response(defaultPng() as any, {
    status: 200,
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=60",
      "x-og-cache": "default",
    },
  })
}

// ── the crawler-safe serve path ──────────────────────────────────────────────────────────────────
export interface OgServeDeps {
  getStream?: typeof getObjectStream
  enqueue?: (ref: string, version: string | number | null, loadData: () => Promise<OgCardData>) => void
  defaultPng?: () => Uint8Array
}

/**
 * Serve GET /og/:ref.png — cache-or-default, NEVER blocks on a render (the crawler-safety guarantee).
 *   • S3 cache HIT  → stream the object with a long, immutable Cache-Control (URL is versioned).
 *   • S3 cache MISS → return the pre-built DEFAULT card immediately (short cache) AND enqueue a
 *                     background render so the NEXT request is warm.
 * Deps are injectable for hermetic tests (mock S3 stream + a spy enqueue).
 */
export async function serveOgImage(
  ref: string,
  version: string | number | null,
  loadData: () => Promise<OgCardData>,
  deps: OgServeDeps = {},
): Promise<Response> {
  const getStream = deps.getStream ?? getObjectStream
  const enqueue = deps.enqueue ?? enqueueOgRender
  const defaultPng = deps.defaultPng ?? defaultCardPngSync
  const key = ogS3Key(ref, version)

  // Cache hit — stream the S3 object straight through. Long cache: the versioned URL is effectively
  // immutable (a changed ticket → different ?v → different key). Attempt the read whenever S3 is
  // configured OR a getStream was explicitly injected (hermetic tests).
  if (deps.getStream || s3Configured()) {
    try {
      const { stream, contentType } = await getStream(key)
      return new Response(stream as any, {
        status: 200,
        headers: {
          "content-type": contentType || "image/png",
          "cache-control": "public, max-age=31536000, immutable",
          "x-og-cache": "hit",
        },
      })
    } catch {
      // fall through to default + enqueue (miss)
    }
  }

  // Cache miss (or S3 unconfigured): return the default INSTANTLY and warm the cache in the background.
  enqueue(ref, version, loadData)
  return new Response(defaultPng() as any, {
    status: 200,
    headers: {
      "content-type": "image/png",
      // Short cache on the miss placeholder so the real card is picked up soon after it renders.
      "cache-control": "public, max-age=60",
      "x-og-cache": "miss",
    },
  })
}
