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

// Minimal structural seams over the Playwright browser/context/page so the render+timeout+kill logic
// is unit-testable with a fake browser (no real Chromium). Only the members we actually call.
export interface OgPageLike {
  setContent(html: string, opts?: any): Promise<void>
  evaluate(fn: any): Promise<any>
  screenshot(opts?: any): Promise<Uint8Array | ArrayBuffer | Buffer>
}
export interface OgContextLike { newPage(): Promise<OgPageLike>; close(): Promise<void> }
export interface OgBrowserLike { newContext(opts?: any): Promise<OgContextLike>; close(): Promise<void> }

/**
 * Core render: build a page, screenshot it, race against a hard deadline — and CRITICALLY, on timeout
 * (or any error) actively CLOSE the browser (KLA-739 C2-3). The previous Promise.race left the losing
 * render() promise — and its Chromium process — alive when the deadline fired, so a hung render leaked a
 * browser and (because withPdfSlot is a single serialized slot shared with PDF/AutoSim) could wedge the
 * whole box. The `finally` here guarantees the browser is torn down whether we win, time out, or throw.
 * Injectable `launch` + `deadlineMs` make this hermetically testable with a fake, hanging browser.
 */
export async function renderOgPngWith(
  html: string,
  launch: () => Promise<OgBrowserLike>,
  deadlineMs = 20_000,
): Promise<Uint8Array> {
  let browser: OgBrowserLike | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  const render = async (): Promise<Uint8Array> => {
    browser = await launch()
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
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("OG render timed out (20s)")), deadlineMs)
  })
  try {
    return await Promise.race([render(), deadline])
  } finally {
    if (timer) clearTimeout(timer)
    // Single-browser invariant: kill Chromium on the winning path AND on timeout/error (no leak).
    if (browser) { try { await browser.close() } catch { /* already gone */ } }
  }
}

/** Render an OG-card HTML document to a PNG at 1200×630 @2x. Mirrors the PDF render path. */
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
      console.warn("[og] background render failed for", key, "-", e?.message || e)
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
