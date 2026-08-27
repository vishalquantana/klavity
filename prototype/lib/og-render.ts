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

// Minimal structural seams over Playwright so the render + bounded-teardown + kill logic is unit-testable
// with fakes (no real Chromium). Only the members we actually call.
export interface OgPageLike {
  setContent(html: string, opts?: any): Promise<void>
  evaluate(fn: any): Promise<any>
  screenshot(opts?: any): Promise<Uint8Array | ArrayBuffer | Buffer>
}
export interface OgContextLike { newPage(): Promise<OgPageLike>; close(): Promise<void> }
export interface OgBrowserLike { newContext(opts?: any): Promise<OgContextLike> }

// KLA-739 (C2-3, round 6): a REAL, killable browser-SERVER handle (Playwright BrowserServer). A counter
// alone can't know if a process died — a close() REJECTION only means close failed, not that Chromium
// exited (Codex's probe: 7 rejected closes → trackedLive:0 but 7 processes still alive). So the OG render
// path owns a BrowserServer whose process we can SIGKILL, and we release the live-slot ONLY on a CONFIRMED
// process exit (close/kill resolves, or an 'exit' signal) — never merely because close() rejected.
export interface OgServerLike {
  close(): Promise<void>       // graceful terminate; resolves AFTER the process exits
  kill(): Promise<void>        // SIGKILL the process; resolves AFTER the process exits
  onExit(cb: () => void): void // register a process-exit listener (fires on graceful/kill/crash exit)
}
export interface OgLaunched { browser: OgBrowserLike; server: OgServerLike }

// ── live-browser process cap (KLA-739 C2-3 — TRUE bound on live Chromiums) ────────────────────────
// A cap on LIVE OG Chromium processes — launched but not yet CONFIRMED exited. A browser whose close
// hangs OR rejects keeps counting until its process is proven gone (SIGKILL'd), so neither a never-
// settling close nor a rejected close can bypass the bound (unlike the per-key _inflight dedupe, which
// frees on the close TIMEOUT). Once `OG_MAX_LIVE_BROWSERS` are alive, further renders fail-fast with
// OgAdmissionError (caller serves the default card). withPdfSlot is still released within closeTimeoutMs
// (PDF/AutoSim never wedge); this live cap is a SEPARATE counter released only on confirmed process exit.
export const OG_MAX_LIVE_BROWSERS = Math.max(1, Number(process.env.OG_MAX_INFLIGHT) || 4)
let _liveOgBrowsers = 0
/** Number of OG Chromium processes currently alive (launched, exit not yet confirmed). Introspection/tests. */
export function ogLiveBrowserCount(): number { return _liveOgBrowsers }
/** TEST-ONLY: reset the live-browser counter between hermetic cases (no real process is touched). */
export function __resetOgLiveBrowsersForTest(): void { _liveOgBrowsers = 0 }

/** Thrown when the live-browser cap is saturated — the render is refused (caller serves the default). */
export class OgAdmissionError extends Error {
  constructor(message = "OG render refused: live-browser cap reached") { super(message); this.name = "OgAdmissionError" }
}

/**
 * Thrown when launchServer() created a process but connect() failed AND the subsequent kill could NOT
 * confirm the process exited. Signals renderOgPngWith to PIN the live-slot (a maybe-alive orphan) rather
 * than take the generic no-process launch-failure release — same conservative rule as a hung close.
 */
export class OgOrphanError extends Error {
  constructor(public readonly reason?: unknown) {
    super("OG launch: connect failed and the orphaned browser-server kill could not confirm exit")
    this.name = "OgOrphanError"
  }
}

/**
 * Core render: build a page, screenshot it, race against a hard deadline; on timeout/error tear the
 * browser down (KLA-739 C2-3) so a hung render can't wedge the shared withPdfSlot (PDF/AutoSim use it).
 *
 * Guarantees (proven by neg-controls):
 *   • ADMISSION: refuses (OgAdmissionError) when `maxLive` processes are already alive → live Chromiums
 *     are bounded by a fixed cap even under persistent hung/rejected closes.
 *   • DEFINITIVE TEARDOWN: graceful server.close() bounded by `closeTimeoutMs`; on timeout OR rejection OR
 *     any close failure, SIGKILL via server.kill() — with a real process handle the process actually dies
 *     regardless of how close failed.
 *   • LIVE-SLOT RELEASE ON CONFIRMED EXIT ONLY: the counter is decremented only when close()/kill()
 *     resolves or an 'exit' signal fires — NOT because close() rejected. A failed close with no exit
 *     evidence retains the slot until the kill confirms exit (or, if kill also hangs, the slot stays →
 *     the cap fail-fasts further renders rather than leaking).
 *   • SLOT RELEASE: the caller (and thus withPdfSlot) returns within `closeTimeoutMs`.
 *   • DELAYED / SYNC-THROW LAUNCH: a late launch is still torn down; a synchronously-throwing launcher
 *     still runs cleanup (no pre-reserved counter leak).
 *
 * Injectable `launch` + `deadlineMs` + `closeTimeoutMs` + `maxLive` make this hermetically testable.
 */
export async function renderOgPngWith(
  html: string,
  launch: () => Promise<OgLaunched> | OgLaunched,
  deadlineMs = 20_000,
  closeTimeoutMs = 3_000,
  maxLive = OG_MAX_LIVE_BROWSERS,
): Promise<Uint8Array> {
  // Admission: refuse before launching if the cap is saturated (fail-fast → default card).
  if (_liveOgBrowsers >= maxLive) throw new OgAdmissionError()
  _liveOgBrowsers++
  let released = false
  const releaseLiveSlot = () => { if (!released) { released = true; _liveOgBrowsers-- } }

  // #4: wrap launch so a SYNCHRONOUSLY-throwing launcher becomes a rejected promise (still runs cleanup).
  const launchP: Promise<OgLaunched> = Promise.resolve().then(launch)
  // The DEFINITIVE release trigger: register an exit listener the moment we have a server. ANY real
  // process exit (graceful close, SIGKILL, or crash) frees the slot — a mere close() rejection never does.
  void launchP.then(({ server }) => server.onExit(releaseLiveSlot), () => { /* launch failed → teardown frees it */ })

  let timer: ReturnType<typeof setTimeout> | undefined

  const render = async (): Promise<Uint8Array> => {
    const { browser } = await launchP
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

  // Definitive teardown: graceful close bounded by closeTimeoutMs; on timeout/rejection/failure, SIGKILL.
  // Release the live-slot ONLY on confirmed exit (close/kill resolves; onExit is the belt-and-suspenders).
  const runTeardown = async (): Promise<void> => {
    let launched: OgLaunched
    try { launched = await launchP }
    catch (e) {
      // OWNERSHIP: an OgOrphanError means launchServer() DID create a process but connect() failed AND the
      // kill couldn't confirm exit → a maybe-alive orphan → PIN the slot (do NOT release), same as a hung
      // close. Any other launch failure = no process was created (launchServer threw) OR the orphan was
      // killed-confirmed inside the launcher → plain release.
      if (!(e instanceof OgOrphanError)) releaseLiveSlot()
      return
    }
    const { server } = launched
    const closeP = Promise.resolve().then(() => server.close())
    const outcome = await Promise.race([
      closeP.then(() => "closed" as const, () => "failed" as const),
      new Promise<"timeout">((res) => setTimeout(() => res("timeout"), closeTimeoutMs)),
    ])
    if (outcome === "closed") { releaseLiveSlot(); return } // graceful exit confirmed
    // timeout OR failed close → SIGKILL. Release ONLY when the kill CONFIRMS exit; if kill also fails,
    // RETAIN the slot (no exit evidence) so the cap still bounds live processes.
    void Promise.resolve().then(() => server.kill()).then(releaseLiveSlot, () => { /* retain; onExit may fire */ })
  }

  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("OG render timed out (20s)")), deadlineMs)
  })
  try {
    return await Promise.race([render(), deadline])
  } finally {
    if (timer) clearTimeout(timer)
    // Bound the SHARED-slot wait at closeTimeoutMs; runTeardown continues in the background (late launch,
    // background kill) and releases the live-slot on confirmed process exit.
    const t = runTeardown()
    await Promise.race([t, new Promise<void>((res) => setTimeout(res, closeTimeoutMs))])
    void t.catch(() => {})
  }
}

// A launched-but-not-connected browser server + its ws endpoint (for connect()).
export interface OgServerHandle { server: OgServerLike; wsEndpoint: string }

// Bounded kill that returns TRUE iff the process is CONFIRMED gone (kill() resolved or an exit signal
// fired) within `boundMs`. Used to reap an orphaned server whose connect() failed.
async function confirmKill(server: OgServerLike, boundMs: number): Promise<boolean> {
  let exited = false
  try { server.onExit(() => { exited = true }) } catch { /* best-effort */ }
  const killP = Promise.resolve().then(() => server.kill()).then(() => { exited = true }, () => { /* kill failed */ })
  await Promise.race([killP, new Promise<void>((res) => setTimeout(res, boundMs))])
  return exited
}

/**
 * KLA-739 (C2-3 round 7): the OWNERSHIP state machine for the process-CREATION path. Once launchServer()
 * returns a server, that server is OWNED — every exit path must reap it:
 *   • launchServer() throws  → NO process created → propagate (renderOgPngWith does a plain release).
 *   • connect() succeeds     → return {browser, server}; renderOgPngWith tracks + tears it down.
 *   • connect() FAILS        → the server is an ORPHAN. SIGKILL it (bounded). If the kill CONFIRMS exit →
 *                              rethrow the connect error (safe plain release). If the kill can't confirm →
 *                              throw OgOrphanError so renderOgPngWith PINS the slot (maybe-alive process).
 * Injectable launchServer/connect make this hermetically testable without real Chromium.
 */
export async function ogLaunchOrKill(
  launchServer: () => Promise<OgServerHandle>,
  connect: (wsEndpoint: string) => Promise<OgBrowserLike>,
  killBoundMs = 3_000,
): Promise<OgLaunched> {
  const { server, wsEndpoint } = await launchServer() // throws here → no process was created
  try {
    const browser = await connect(wsEndpoint)
    return { browser, server }
  } catch (connectErr) {
    // launchServer OK but connect FAILED → orphaned process. Own it: SIGKILL (bounded).
    const confirmed = await confirmKill(server, killBoundMs)
    if (confirmed) throw connectErr           // process dead → safe for the plain launch-failure release
    throw new OgOrphanError(connectErr)       // kill unconfirmed → PIN the slot
  }
}

/** Render an OG-card HTML document to a PNG at 1200×630 @2x. Uses its OWN launchServer()+connect() so it
 *  holds a real, killable BrowserServer process handle — scoped ENTIRELY to the OG path (the shared
 *  withPdfSlot / PDF / AutoSim browser lifecycle is untouched). */
export async function renderOgPng(html: string): Promise<Uint8Array> {
  const { withPdfSlot, CHROMIUM_PROD_ARGS } = await import("./trails-browser")
  const { chromium } = await import("playwright")
  const wrapServer = (server: any): OgServerLike => ({
    close: () => server.close(),
    kill: () => Promise.resolve(server.kill()),
    onExit: (cb: () => void) => {
      try { const p = server.process?.(); if (p) { p.once?.("exit", cb); p.once?.("close", cb) } } catch { /* no proc */ }
      try { server.on?.("close", cb) } catch { /* no emitter */ }
    },
  })
  return withPdfSlot(async () =>
    renderOgPngWith(html, () =>
      ogLaunchOrKill(
        async (): Promise<OgServerHandle> => {
          const server: any = await (chromium as any).launchServer({ headless: true, args: CHROMIUM_PROD_ARGS })
          return { server: wrapServer(server), wsEndpoint: server.wsEndpoint() }
        },
        async (wsEndpoint: string) => (await (chromium as any).connect(wsEndpoint)) as OgBrowserLike,
      ),
    ),
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
