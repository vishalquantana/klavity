// CSP/CORS-resilient screenshot capture wrapper around html-to-image's toPng.
//
// WHY: to inline a screenshot, html-to-image fetch()es every <img>/background URL to read its bytes.
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

import { toPng } from "html-to-image"

// 1×1 transparent GIF — the most universally-valid tiny placeholder. Used so a blocked image renders as a
// transparent gap rather than breaking the capture.
export const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

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
 * Resilient toPng: never hard-fails because an image can't be fetched. Composes the caller's filter (e.g.
 * "exclude the widget host") with a cross-origin <img> skip, and sets imagePlaceholder as a safety net.
 * Emits at most ONE summary warning naming how many images were omitted.
 */
export async function safeToPng(
  node: HTMLElement,
  opts: { filter?: (n: HTMLElement) => boolean; pixelRatio?: number } = {},
): Promise<string> {
  let skipped = 0
  const callerFilter = opts.filter
  const out = await toPng(node, {
    skipFonts: true,
    pixelRatio: opts.pixelRatio ?? 1,
    imagePlaceholder: TRANSPARENT_PIXEL,
    filter: (n: HTMLElement) => {
      if (callerFilter && !callerFilter(n)) return false
      if (isBlockedCrossOriginImg(n)) { skipped++; return false }
      return true
    },
  })
  if (skipped) {
    try { console.warn(`[Klavity] capture: omitted ${skipped} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`) } catch { /* noop */ }
  }
  return out
}
