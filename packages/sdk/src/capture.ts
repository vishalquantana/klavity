// CSP/CORS-resilient screenshot capture wrapper around modern-screenshot's domToPng (a maintained,
// faster, API-compatible fork of html-to-image — swapped in for KLAVITYKLA-393).
//
// WHY: to inline a screenshot, the DOM renderer fetch()es every <img>/background URL to read its bytes.
// On strict-CSP customer sites (connect-src 'self'), those cross-origin fetches are blocked, which
// previously (a) made the WHOLE capture fail — blank / "0/5 images" — because a failed resource with no
// imagePlaceholder becomes '' and breaks the final SVG, and (b) flooded the console with one
// browser-emitted "Refused to connect … violates CSP" error PER image (uncatchable from JS — the only
// way to avoid them is to not fetch).
//
// FIX: skip cross-origin <img> up front (they're never fetched → no CSP spam, the image is just omitted),
// and set imagePlaceholder so any resource that still fails (same-origin hiccup, cross-origin CSS
// background image we can't pre-filter) degrades to a transparent gap instead of rejecting. The capture
// then always produces a screenshot of everything readable, and we log at most ONE summary line.

import { domToPng } from "modern-screenshot"

// 1×1 transparent GIF — the most universally-valid tiny placeholder. Used so a blocked image renders as a
// transparent gap rather than breaking the capture.
export const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

const CAPTURE_TIMEOUT_MS = 8_000
// Clamp the render canvas to a browser-safe max edge so a very tall page produces a bounded (down-scaled)
// image instead of an oversized/empty canvas — matches the prior html-to-image clamping behaviour.
const MAX_CAPTURE_CANVAS_EDGE = 16_384
const MAX_FALLBACK_EDGE = 4_096
const MAX_FALLBACK_PIXELS = 16_000_000
const FALLBACK_RENDER_BUDGET_MS = 500
const MAX_FALLBACK_ELEMENTS = 10_000
const EMERGENCY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII="

// KLAVITYKLA-460 (blank/white first-capture) tuning.
// Settle budgets: how long we let the page "settle" (fonts/images decode + one paint tick) BEFORE a DOM
// render so we don't snapshot an unrendered page. Bounded so a normal page (fonts already loaded) is never
// slowed — the settle short-circuits when there's nothing to wait for.
const SETTLE_BUDGET_MS = 600        // first, fast settle before the initial render
const RETRY_SETTLE_BUDGET_MS = 1200 // longer settle before the one blank-triggered retry
const MAX_DECODE_IMAGES = 24        // cap how many in-viewport <img> we await decode() on (bounded work)
// Blank-detection: a blank / near-uniform (all-white or fully-transparent) PNG compresses to very few
// bytes, while a real screenshot with content is many KB — so payload size is a cheap, environment-
// independent primary signal. A small pixel-variance sample refines it in real browsers.
const BLANK_PNG_MAX_BYTES = 1024    // a uniform PNG is well under this; real content is far above it
const BLANK_SAMPLE_EDGE = 32        // downscale edge for the (cheap) pixel-variance sample
const BLANK_VARIANCE_EPS = 4        // luminance variance at/below this ~= a single flat color → blank
const BLANK_IMAGE_LOAD_MS = 400     // bound the sample image decode so detection never hangs
// KLAVITYKLA-473 (partial white-box detection). A capture is "partial" — real content rendered, but some
// cross-origin images dropped to white gaps — when the DOM renderer had to SKIP any cross-origin <img>
// (definite: those render as white boxes), OR a sampled fraction of the shot is near-total uniform white
// (corroborating browser-only signal, set conservatively so a normal minimalist page is never flagged).
const PARTIAL_WHITE_FRACTION = 0.985 // >= this fraction near-white (but NOT fully blank) → likely missing images
const WHITE_LUM_MIN = 250            // alpha-over-white luminance at/above this counts as a "white" pixel

/**
 * True when an <img> src points to a different origin than the page, so html-to-image's fetch() to inline
 * it would be blocked under a strict CSP (connect-src 'self') / CORS. data:/blob: and relative/same-origin
 * srcs are always fetchable, so they are NOT cross-origin. Pure + unit-tested.
 */
export function isCrossOriginImageSrc(src: string, pageOrigin: string): boolean {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return false
  try {
    return new URL(src, pageOrigin).origin !== pageOrigin
  } catch {
    return false
  }
}

function isBlockedCrossOriginImg(node: Node): boolean {
  const el = node as HTMLImageElement
  if (!el || el.tagName !== "IMG") return false
  const src = el.currentSrc || el.src || ""
  return isCrossOriginImageSrc(src, location.origin)
}

/**
 * True for nodes that never contribute a visible pixel to a full-page capture, so the renderer can skip the
 * whole subtree instead of cloning + reading getComputedStyle for every descendant (the O(nodes) cost that
 * makes big pages slow). Deliberately CONSERVATIVE — only unambiguously-invisible cases — so the captured
 * image is pixel-for-pixel unchanged:
 *  - script / style / noscript / template: no visual box at all.
 *  - display:none: the subtree is not rendered.
 *  - opacity:0: the whole subtree is fully transparent (a descendant can't re-opaque an opacity:0 ancestor).
 *  - fully above/left of the PAGE origin (classic `left:-9999px` a11y hide): off the capture canvas. Uses
 *    page (scroll-adjusted) coords, NOT viewport coords, so content the user has scrolled PAST is still kept.
 *  - a cross-origin <iframe>: its document can't be read/serialised, so it renders blank regardless.
 * We intentionally do NOT prune `visibility:hidden` (a descendant may set `visibility:visible`) nor zero-size
 * boxes (`overflow:visible` children can paint outside them) — those could change the visible result.
 * (KLAVITYKLA-393 listed zero-size as a prune target; we deliberately keep it — correctness over the
 * marginal node-count win. `opacity:0` is pruned instead, since it can't be re-opaqued by a descendant.)
 */
export function isUncapturable(node: Node): boolean {
  const el = node as HTMLElement
  if (!el || el.nodeType !== 1) return false
  const tag = el.tagName
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "TEMPLATE") return true
  if (tag === "IFRAME" && isCrossOriginImageSrc((el as HTMLIFrameElement).src || "", location.origin)) return true
  let style: CSSStyleDeclaration
  try { style = getComputedStyle(el) } catch { return false }
  if (style.display === "none" || Number(style.opacity) === 0) return true
  let rect: DOMRect
  try { rect = el.getBoundingClientRect() } catch { return false }
  const sx = window.scrollX || window.pageXOffset || 0
  const sy = window.scrollY || window.pageYOffset || 0
  if (rect.right + sx <= 0 || rect.bottom + sy <= 0) return true
  return false
}

function warn(message: string): void {
  try { console.warn(message) } catch { /* noop */ }
}

function isTransparent(color: string): boolean {
  return !color || color === "transparent" || color === "rgba(0, 0, 0, 0)"
}

/**
 * Last-resort renderer used when html-to-image rejects or stalls. It deliberately never reads image
 * bytes, so a customer page's CORS/CSP cannot taint or block the canvas. The result is less detailed than
 * html-to-image, but retains the page's layout, backgrounds, borders and text for a usable Sim review.
 */
function renderFetchFreeFallback(
  node: HTMLElement,
  filter?: (n: HTMLElement) => boolean,
  requestedPixelRatio = 1,
): { dataUrl: string; scale: number } {
  try {
    const rootRect = node.getBoundingClientRect()
    const cssWidth = Math.max(1, Math.ceil(Math.max(node.scrollWidth, node.clientWidth, rootRect.width)))
    const cssHeight = Math.max(1, Math.ceil(Math.max(node.scrollHeight, node.clientHeight, rootRect.height)))
    const wantedRatio = Math.max(0.1, requestedPixelRatio)
    const edgeRatio = Math.min(MAX_FALLBACK_EDGE / cssWidth, MAX_FALLBACK_EDGE / cssHeight)
    const pixelRatio = Math.min(wantedRatio, edgeRatio, Math.sqrt(MAX_FALLBACK_PIXELS / (cssWidth * cssHeight)))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.floor(cssWidth * pixelRatio))
    canvas.height = Math.max(1, Math.floor(cssHeight * pixelRatio))
    const context = canvas.getContext("2d")
    if (!context) return { dataUrl: EMERGENCY_PNG, scale: 1 }

    context.scale(pixelRatio, pixelRatio)
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, cssWidth, cssHeight)

    const deadline = Date.now() + FALLBACK_RENDER_BUDGET_MS
    let paintedElements = 0
    const outOfBudget = () => paintedElements >= MAX_FALLBACK_ELEMENTS || Date.now() >= deadline
    const paint = (element: HTMLElement, isRoot = false): void => {
      if (outOfBudget()) return
      paintedElements++
      if (!isRoot && filter && !filter(element)) return
      const style = getComputedStyle(element)
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return

      const rect = element.getBoundingClientRect()
      const x = rect.left - rootRect.left
      const y = rect.top - rootRect.top
      if (rect.width > 0 && rect.height > 0) {
        if (!isTransparent(style.backgroundColor)) {
          context.fillStyle = style.backgroundColor
          context.fillRect(x, y, rect.width, rect.height)
        }

        const borderWidth = parseFloat(style.borderTopWidth)
        if (borderWidth > 0 && style.borderTopStyle !== "none" && !isTransparent(style.borderTopColor)) {
          context.strokeStyle = style.borderTopColor
          context.lineWidth = borderWidth
          context.strokeRect(x, y, rect.width, rect.height)
        }

        if (element.tagName === "IMG") {
          context.fillStyle = "#f1f5f9"
          context.fillRect(x, y, rect.width, rect.height)
          context.strokeStyle = "#cbd5e1"
          context.lineWidth = 1
          context.strokeRect(x, y, rect.width, rect.height)
        }
      }

      for (const child of Array.from(element.childNodes)) {
        if (outOfBudget()) break
        if (child instanceof HTMLElement) {
          paint(child)
          continue
        }
        if (child.nodeType !== Node.TEXT_NODE || !child.textContent?.trim()) continue
        try {
          const range = document.createRange()
          range.selectNodeContents(child)
          const textRect = range.getBoundingClientRect()
          if (textRect.width <= 0 || textRect.height <= 0) continue
          context.save()
          context.beginPath()
          context.rect(textRect.left - rootRect.left, textRect.top - rootRect.top, textRect.width, textRect.height)
          context.clip()
          context.fillStyle = style.color
          context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
          context.textBaseline = "top"
          context.fillText(child.textContent.trim(), textRect.left - rootRect.left, textRect.top - rootRect.top)
          context.restore()
        } catch { /* an individual text node must not abort the screenshot */ }
      }
    }

    paint(node, true)
    const dataUrl = canvas.toDataURL("image/png")
    // `scale` is image-px-per-CSS-px so a viewport rect can be cropped correctly: the canvas is
    // cssWidth×pixelRatio, which may be < CSS size when a tall page is clamped to MAX_FALLBACK_EDGE.
    return dataUrl.startsWith("data:image/png") ? { dataUrl, scale: pixelRatio } : { dataUrl: EMERGENCY_PNG, scale: 1 }
  } catch {
    return { dataUrl: EMERGENCY_PNG, scale: 1 }
  }
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve())
    else setTimeout(resolve, 16)
  })
}

// Race a promise against a wall-clock budget, swallowing rejections. Resolves when EITHER the work
// settles or the budget elapses — so a hung font/image decode can never stall the capture.
function withBudget(work: Promise<unknown>, ms: number): Promise<void> {
  return Promise.race([
    Promise.resolve(work).then(() => undefined, () => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms))),
  ])
}

// In-viewport <img> that haven't naturally finished loading yet — the ones most likely to render as a
// blank gap if we snapshot too early. Capped so a media-heavy page doesn't await hundreds of decodes.
function inViewportUndecodedImages(root: HTMLElement): HTMLImageElement[] {
  if (!root || typeof root.querySelectorAll !== "function") return []
  const vw = typeof window !== "undefined" ? (window.innerWidth || 0) : 0
  const vh = typeof window !== "undefined" ? (window.innerHeight || 0) : 0
  const out: HTMLImageElement[] = []
  let imgs: NodeListOf<HTMLImageElement>
  try { imgs = root.querySelectorAll("img") } catch { return [] }
  for (let i = 0; i < imgs.length && out.length < MAX_DECODE_IMAGES; i++) {
    const img = imgs[i]
    if (!img || img.complete) continue
    let rect: DOMRect
    try { rect = img.getBoundingClientRect() } catch { continue }
    if (rect.bottom < 0 || rect.right < 0 || rect.top > vh || rect.left > vw) continue // off-screen
    out.push(img)
  }
  return out
}

/**
 * KLAVITYKLA-460: let the page settle BEFORE a DOM-render capture so the first shot isn't fired against an
 * unrendered page (fonts/images not yet decoded → blank/white). Best-effort and BOUNDED at `budgetMs`:
 *   1. await document.fonts.ready — SKIPPED when fonts are already loaded (keeps normal pages fast),
 *   2. await img.decode() of in-viewport not-yet-loaded images (best-effort, capped, bounded),
 *   3. one requestAnimationFrame paint tick so a just-mutated layout is committed before the snapshot.
 * Never throws and never waits past the budget — a stuck resource can't hang the capture.
 */
export async function settleForCapture(root: HTMLElement, budgetMs = SETTLE_BUDGET_MS): Promise<void> {
  if (typeof document === "undefined") return
  const deadline = Date.now() + Math.max(0, budgetMs)
  const left = () => Math.max(0, deadline - Date.now())
  try {
    const fonts = (document as unknown as { fonts?: { status?: string; ready?: Promise<unknown> } }).fonts
    if (fonts && fonts.status !== "loaded" && fonts.ready && typeof (fonts.ready as Promise<unknown>).then === "function") {
      await withBudget(fonts.ready, left())
    }
    const imgs = inViewportUndecodedImages(root)
    if (imgs.length) {
      await withBudget(
        Promise.allSettled(imgs.map((im) => (typeof im.decode === "function" ? im.decode() : Promise.resolve()))),
        left(),
      )
    }
    await withBudget(nextFrame(), Math.min(left(), 50))
  } catch { /* settle is best-effort — never block or delay the capture on error */ }
}

function loadImageBounded(src: string, timeoutMs: number): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof Image === "undefined") { resolve(null); return }
    let done = false
    const img = new Image()
    const finish = (ok: boolean) => { if (done) return; done = true; resolve(ok ? img : null) }
    const timer = setTimeout(() => finish(false), Math.max(0, timeoutMs))
    img.onload = () => { clearTimeout(timer); finish(true) }
    img.onerror = () => { clearTimeout(timer); finish(false) }
    try { img.src = src } catch { clearTimeout(timer); finish(false) }
  })
}

// Luminance variance of a downscaled sample of the PNG, alpha-composited over white (matching how a
// transparent capture reads on the composer). ~0 variance ⇒ a single flat color ⇒ blank. Returns null
// when a real canvas isn't available (e.g. jsdom) or the draw fails, so callers fall back to the size check.
async function samplePixelVariance(dataUrl: string): Promise<number | null> {
  if (typeof document === "undefined") return null
  const img = await loadImageBounded(dataUrl, BLANK_IMAGE_LOAD_MS)
  if (!img) return null
  let canvas: HTMLCanvasElement
  try { canvas = document.createElement("canvas") } catch { return null }
  canvas.width = BLANK_SAMPLE_EDGE
  canvas.height = BLANK_SAMPLE_EDGE
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  try {
    ctx.drawImage(img, 0, 0, BLANK_SAMPLE_EDGE, BLANK_SAMPLE_EDGE)
    const { data } = ctx.getImageData(0, 0, BLANK_SAMPLE_EDGE, BLANK_SAMPLE_EDGE)
    let n = 0, sum = 0, sumSq = 0
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] / 255
      const r = data[i] * a + 255 * (1 - a)
      const g = data[i + 1] * a + 255 * (1 - a)
      const b = data[i + 2] * a + 255 * (1 - a)
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      sum += lum; sumSq += lum * lum; n++
    }
    if (!n) return null
    const mean = sum / n
    return sumSq / n - mean * mean
  } catch { return null } // e.g. a tainted canvas — treat as "can't tell", not blank
}

/**
 * KLAVITYKLA-460: cheaply decide whether a capture came back blank / near-uniform (all-white or fully
 * transparent) so we never silently seed an empty shot. Two signals:
 *   1. PAYLOAD SIZE (primary, environment-independent): a uniform PNG compresses to a handful of bytes,
 *      while a real screenshot is many KB. This alone catches the classic blank first-capture and works
 *      without a real canvas (drives the unit tests).
 *   2. PIXEL VARIANCE (browser refinement): a near-zero-variance frame is a single flat color → blank,
 *      even in the rare case it compressed large. Best-effort; unavailable envs leave the size verdict.
 */
export async function isBlankCapture(dataUrl: string): Promise<boolean> {
  if (!dataUrl || !dataUrl.startsWith("data:image/png")) return true
  const comma = dataUrl.indexOf(",")
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : ""
  const approxBytes = Math.floor((b64.length * 3) / 4)
  if (approxBytes <= BLANK_PNG_MAX_BYTES) return true
  try {
    const variance = await samplePixelVariance(dataUrl)
    if (variance !== null && variance <= BLANK_VARIANCE_EPS) return true
  } catch { /* best-effort — fall through to "not blank" */ }
  return false
}

// KLAVITYKLA-473: fraction of a downscaled sample that is near-uniform white (alpha-composited over white,
// matching how a transparent gap reads on the composer). Distinct from the blank check's VARIANCE — a
// partial capture has real content AND large white gaps, so its variance is high but its white FRACTION is
// also high. Returns null when a real canvas isn't available (jsdom) so callers fall back to the skip count.
async function sampleWhiteFraction(dataUrl: string): Promise<number | null> {
  if (typeof document === "undefined") return null
  const img = await loadImageBounded(dataUrl, BLANK_IMAGE_LOAD_MS)
  if (!img) return null
  let canvas: HTMLCanvasElement
  try { canvas = document.createElement("canvas") } catch { return null }
  canvas.width = BLANK_SAMPLE_EDGE
  canvas.height = BLANK_SAMPLE_EDGE
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  try {
    ctx.drawImage(img, 0, 0, BLANK_SAMPLE_EDGE, BLANK_SAMPLE_EDGE)
    const { data } = ctx.getImageData(0, 0, BLANK_SAMPLE_EDGE, BLANK_SAMPLE_EDGE)
    let n = 0, white = 0
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] / 255
      const r = data[i] * a + 255 * (1 - a)
      const g = data[i + 1] * a + 255 * (1 - a)
      const b = data[i + 2] * a + 255 * (1 - a)
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      if (lum >= WHITE_LUM_MIN) white++
      n++
    }
    return n ? white / n : null
  } catch { return null } // e.g. a tainted canvas — treat as "can't tell", not partial
}

/**
 * KLAVITYKLA-473: decide (IN THE BROWSER — no server call, image never leaves the page) whether a NON-blank
 * capture is only PARTIAL — real content rendered but some cross-origin images the DOM renderer couldn't
 * inline dropped out as white gaps. Two signals, mirroring {@link isBlankCapture}:
 *   1. SKIP COUNT (primary, deterministic): the renderer already tracks each cross-origin <img> it skipped
 *      (they can't be fetched under CSP/CORS). Any skip ⇒ at least one white gap ⇒ partial.
 *   2. WHITE FRACTION (browser refinement): a shot that is almost entirely uniform white (but not fully
 *      blank) is what a page whose main imagery is cross-origin looks like once those images drop. Set
 *      conservatively (>=98.5%) so a normal minimalist/white page is never flagged. Unavailable envs skip it.
 * The caller uses this to SUGGEST the sharp "Screen" capture; it never triggers getDisplayMedia itself.
 */
export async function isPartialCapture(dataUrl: string, opts: { skippedImages?: number } = {}): Promise<boolean> {
  if ((opts.skippedImages ?? 0) > 0) return true
  try {
    const frac = await sampleWhiteFraction(dataUrl)
    if (frac !== null && frac >= PARTIAL_WHITE_FRACTION) return true
  } catch { /* best-effort — fall through to "not partial" */ }
  return false
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`capture timed out after ${timeoutMs}ms`)), timeoutMs)
    promise.then(
      (value) => { clearTimeout(timer); resolve(value) },
      (error) => { clearTimeout(timer); reject(error) },
    )
  })
}

/**
 * Resilient toPng: never hard-fails because an image can't be fetched. Composes the caller's filter (e.g.
 * "exclude the widget host") with a cross-origin <img> skip, and sets imagePlaceholder as a safety net.
 * Emits at most ONE summary warning naming how many images were omitted.
 */
export async function safeToPng(
  node: HTMLElement,
  opts: { filter?: (n: HTMLElement) => boolean; pixelRatio?: number; skipFonts?: boolean } = {},
): Promise<string> {
  return (await safeToPngWithScale(node, opts)).dataUrl
}

/**
 * Capture-quality tag for a screenshot the widget produced (JTBD 1.9). `rendered` = the DOM renderer
 * (modern-screenshot — may drop cross-origin images under CSP/CORS); `wireframe` = the fetch-free
 * fallback painter (layout/text only, no image bytes at all). The composer badges the thumbnail
 * accordingly and offers a one-tap "Retake sharp" (getDisplayMedia real-pixel path) on both.
 */
export type WidgetCaptureQuality = "rendered" | "wireframe"

/**
 * Like {@link safeToPng}, but also returns `scale` — the number of image pixels per CSS pixel of the
 * captured page. Callers that crop a viewport rect out of a full-page capture (region screenshot) MUST
 * use this and pass `scale` to `cropDataUrl`: the modern-screenshot path is 1:1 (scale = pixelRatio), but
 * the fetch-free fallback downscales tall pages, so a CSS rect cropped at scale 1 would land in the wrong,
 * often clamped → black, area. Also returns `quality` so the composer can badge the thumbnail
 * ('rendered' on the modern-screenshot path, 'wireframe' when it fell back to the fetch-free painter).
 */
export async function safeToPngWithScale(
  node: HTMLElement,
  opts: { filter?: (n: HTMLElement) => boolean; pixelRatio?: number; skipFonts?: boolean; width?: number; height?: number } = {},
): Promise<{ dataUrl: string; scale: number; quality: WidgetCaptureQuality; blank: boolean; partial: boolean; skippedImages: number }> {
  let skipped = 0
  const callerFilter = opts.filter
  const pixelRatio = opts.pixelRatio ?? 1
  // Explicit render box (CSS px). When set, modern-screenshot uses these instead of the node's
  // getBoundingClientRect() — which is how the full-page live-review capture forces the WHOLE
  // scrollable document to render instead of only the body's (often viewport-sized) box.
  const explicitSize = (opts.width && opts.height)
    ? { width: opts.width, height: opts.height }
    : undefined
  // One DOM render pass. Throws on a renderer failure / non-PNG result (→ wireframe fallback below).
  const renderOnce = async (): Promise<string> => {
    skipped = 0
    // Renderer: modern-screenshot's domToPng — a maintained, API-compatible fork of html-to-image that is
    // ~1.8× faster on the same DOM (benchmarked KLAVITYKLA-393). Option mapping vs html-to-image:
    //   pixelRatio → scale · skipFonts:true → font:false · imagePlaceholder → fetch.placeholderImage.
    // `maximumCanvasSize` bounds a very tall page's output (parity with html-to-image's implicit clamp).
    const out = await withTimeout(domToPng(node, {
      scale: pixelRatio,
      ...(explicitSize ?? {}),
      font: false,
      maximumCanvasSize: MAX_CAPTURE_CANVAS_EDGE,
      fetch: { placeholderImage: TRANSPARENT_PIXEL },
      filter: (n: Node) => {
        // Caller filter first (cheapest, e.g. "exclude the widget host"), then the O(1) subtree prunes that
        // cut node count on big pages, then the cross-origin <img> skip (keeps the CSP-spam counter).
        if (callerFilter && !callerFilter(n as HTMLElement)) return false
        if (isUncapturable(n)) return false
        if (isBlockedCrossOriginImg(n)) { skipped++; return false }
        return true
      },
    }), CAPTURE_TIMEOUT_MS)
    if (!out.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result")
    return out
  }
  // KLAVITYKLA-460: let the page settle BEFORE the first render so we don't snapshot an unrendered page
  // (fonts/images not yet decoded) — the classic blank/white first-capture. Bounded + skipped when there's
  // nothing to wait for, so a normal page stays fast.
  await settleForCapture(node, SETTLE_BUDGET_MS)
  try {
    let out = await renderOnce()
    // KLAVITYKLA-460: never silently seed a blank shot. If the render came back blank/near-uniform, settle
    // LONGER and retry the DOM render ONCE — the automatic equivalent of the manual "wait, then recapture"
    // workaround. If it's STILL blank, return it flagged so the caller (widget) can fall back to the sharp
    // getDisplayMedia path instead of an empty PNG.
    let blank = await isBlankCapture(out)
    if (blank) {
      await settleForCapture(node, RETRY_SETTLE_BUDGET_MS)
      try {
        const retry = await renderOnce()
        if (!(await isBlankCapture(retry))) { out = retry; blank = false }
      } catch { /* keep the first (blank-flagged) result; the caller can go sharp */ }
    }
    if (skipped) {
      warn(`[Klavity] capture: omitted ${skipped} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`)
    }
    if (blank) {
      warn("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path")
    }
    // KLAVITYKLA-473: a non-blank render can still be PARTIAL (some cross-origin images dropped to white
    // gaps). Detect it in the browser (skip count + white-fraction) so the caller can SUGGEST the sharp
    // "Screen" capture — never auto-invoke it. Blank shots are already flagged, so don't double-count them.
    const partial = blank ? false : await isPartialCapture(out, { skippedImages: skipped })
    return { dataUrl: out, scale: pixelRatio, quality: "rendered", blank, partial, skippedImages: skipped }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    warn(`[Klavity] capture: renderer unavailable (${reason}); using fetch-free fallback`)
    const fb = renderFetchFreeFallback(node, callerFilter, pixelRatio)
    // The fetch-free painter draws layout/text, but on a near-empty (or unpaintable) page it can still be
    // blank — surface that so the caller can go sharp rather than seed an empty wireframe.
    const blank = await isBlankCapture(fb.dataUrl)
    // The wireframe already draws image placeholders (grey boxes) + carries the degraded 'wireframe' badge
    // + a Retake affordance, so it's not additionally flagged 'partial' (no cross-origin skip count here).
    return { ...fb, quality: "wireframe", blank, partial: false, skippedImages: 0 }
  }
}

/**
 * Full-page capture that reports its quality tag alongside the image (JTBD 1.9). Thin wrapper over
 * {@link safeToPngWithScale} for the widget's onCaptureFull, where the crop scale is irrelevant but the
 * composer still needs to know whether the shot is a faithful 'rendered' capture or the degraded
 * 'wireframe' fallback so it can badge it and offer "Retake sharp".
 */
export async function safeToPngWithQuality(
  node: HTMLElement,
  opts: { filter?: (n: HTMLElement) => boolean; pixelRatio?: number; skipFonts?: boolean } = {},
): Promise<{ dataUrl: string; quality: WidgetCaptureQuality; blank: boolean; partial: boolean }> {
  const { dataUrl, quality, blank, partial } = await safeToPngWithScale(node, opts)
  return { dataUrl, quality, blank, partial }
}

// Upper bound (CSS px) on a full-page live-review capture's height. Very tall / infinite-scroll pages are
// clamped here so a single capture can't OOM the tab or POST a multi-MB data URL to /api/sim/review.
// ~6 desktop viewports — enough to cover the whole page on all but pathological feeds, where the top
// portion is still the highest-signal content for a Sim review.
export const MAX_FULLPAGE_CAPTURE_HEIGHT = 6_000

/**
 * The full scrollable document size (CSS px) for a full-page capture — the WHOLE page, not just the
 * visible viewport. Height is the max scrollHeight across <html>/<body> (robust to app-shell / height:100vh
 * layouts where document.body's own box is only viewport-tall), clamped to {@link MAX_FULLPAGE_CAPTURE_HEIGHT}.
 * Width is the viewport width. Exported so tests can assert the requested dimensions.
 */
export function fullPageCaptureSize(): { width: number; height: number } {
  const doc = typeof document !== "undefined" ? document.documentElement : null
  const body = typeof document !== "undefined" ? document.body : null
  const viewportW = typeof window !== "undefined" ? (window.innerWidth || 0) : 0
  const viewportH = typeof window !== "undefined" ? (window.innerHeight || 0) : 0
  const width = Math.max(
    doc?.clientWidth ?? 0,
    doc?.scrollWidth ?? 0,
    body?.scrollWidth ?? 0,
    viewportW,
    1,
  )
  const rawHeight = Math.max(
    doc?.scrollHeight ?? 0,
    doc?.offsetHeight ?? 0,
    doc?.clientHeight ?? 0,
    body?.scrollHeight ?? 0,
    body?.offsetHeight ?? 0,
    viewportH,
    1,
  )
  return { width, height: Math.min(rawHeight, MAX_FULLPAGE_CAPTURE_HEIGHT) }
}

/**
 * Full-page capture for the Sim LIVE-REVIEW path (Manual Sim Trigger): renders the ENTIRE scrollable
 * document (full scrollHeight), not just the above-the-fold viewport, so a Sim reviews the whole page.
 * Bounded by {@link MAX_FULLPAGE_CAPTURE_HEIGHT}. This is distinct from `safeToPng(document.body)`, whose
 * render box is document.body's bounding rect — which collapses to viewport height under common
 * app-shell / height:100vh layouts, causing the "captures only above-the-fold" bug (KLAVITYKLA-404).
 * Captures <html> (document.documentElement) so an inner-scroller layout's content is still included.
 */
export async function safeToPngFullPage(
  opts: { filter?: (n: HTMLElement) => boolean; pixelRatio?: number; skipFonts?: boolean } = {},
): Promise<string> {
  const node = (typeof document !== "undefined" ? (document.documentElement ?? document.body) : null) as HTMLElement
  const { width, height } = fullPageCaptureSize()
  return (await safeToPngWithScale(node, { ...opts, width, height })).dataUrl
}
