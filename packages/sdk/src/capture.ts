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
  opts: { filter?: (n: HTMLElement) => boolean; pixelRatio?: number; skipFonts?: boolean } = {},
): Promise<{ dataUrl: string; scale: number; quality: WidgetCaptureQuality }> {
  let skipped = 0
  const callerFilter = opts.filter
  const pixelRatio = opts.pixelRatio ?? 1
  try {
    // Renderer: modern-screenshot's domToPng — a maintained, API-compatible fork of html-to-image that is
    // ~1.8× faster on the same DOM (benchmarked KLAVITYKLA-393). Option mapping vs html-to-image:
    //   pixelRatio → scale · skipFonts:true → font:false · imagePlaceholder → fetch.placeholderImage.
    // `maximumCanvasSize` bounds a very tall page's output (parity with html-to-image's implicit clamp).
    const out = await withTimeout(domToPng(node, {
      scale: pixelRatio,
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
    if (skipped) {
      warn(`[Klavity] capture: omitted ${skipped} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`)
    }
    return { dataUrl: out, scale: pixelRatio, quality: "rendered" }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    warn(`[Klavity] capture: renderer unavailable (${reason}); using fetch-free fallback`)
    const fb = renderFetchFreeFallback(node, callerFilter, pixelRatio)
    return { ...fb, quality: "wireframe" }
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
): Promise<{ dataUrl: string; quality: WidgetCaptureQuality }> {
  const { dataUrl, quality } = await safeToPngWithScale(node, opts)
  return { dataUrl, quality }
}
