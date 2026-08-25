export interface Rect { x: number; y: number; w: number; h: number }

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

export interface SourceRect { sx: number; sy: number; sw: number; sh: number; degenerate: boolean }

/**
 * Map a selection (in CSS px, at the LIVE scroll position) to the source-image pixel rect to crop. Pure +
 * unit-testable. `scale` is image-pixels-per-CSS-px of the source (1 for the 1:1 modern-screenshot path,
 * <1 when the fetch-free fallback downscaled a tall page). `scrollX/Y` is the offset that maps live viewport
 * coords → the source's coordinate origin — window.scroll for a full-page/document capture, PLUS any
 * scrolled inner-scroller offsets (see {@link cumulativeScrollForRect}), because the DOM renderer lays the
 * page out UNSCROLLED, so a viewport rect must be shifted by every scroll offset that applies to it.
 *
 * `degenerate` is true when the selection lands (largely) OUTSIDE the captured image — e.g. content inside a
 * scrolled inner-scroller that the DOM render clipped away, so the crop would clamp to a 1px sliver / the far
 * edge and silently come back blank/white. Callers use it to steer to the real-pixel (Screen) capture instead
 * of returning a wrong crop.
 */
export function computeSourceRect(
  rect: Rect,
  scrollX: number,
  scrollY: number,
  scale: number,
  naturalWidth: number,
  naturalHeight: number,
): SourceRect {
  const wantW = Math.max(1, rect.w * scale)
  const wantH = Math.max(1, rect.h * scale)
  const sx = clamp((rect.x + scrollX) * scale, 0, Math.max(0, naturalWidth - 1))
  const sy = clamp((rect.y + scrollY) * scale, 0, Math.max(0, naturalHeight - 1))
  const sw = clamp(wantW, 1, Math.max(1, naturalWidth - sx))
  const sh = clamp(wantH, 1, Math.max(1, naturalHeight - sy))
  // Lost more than half of either requested dimension ⇒ the selection maps outside the capture (clamped).
  const degenerate = sw < wantW * 0.5 || sh < wantH * 0.5
  return { sx, sy, sw, sh, degenerate }
}

export async function cropDataUrl(
  dataUrl: string,
  rect: Rect,
  scrollX = window.scrollX,
  scrollY = window.scrollY,
  // Image pixels per CSS pixel of the captured page. 1 when the screenshot is rendered 1:1 with CSS
  // coords (modern-screenshot at scale 1). MUST be passed when the source image is NOT 1:1 — e.g. the
  // CSP fetch-free fallback downscales tall pages (>4096px) to stay under canvas limits, so a viewport
  // rect in CSS px would otherwise crop the wrong, often clamped → black, area. (The extension instead
  // pre-multiplies rect+scroll by dpr and leaves scale at 1.)
  scale = 1,
  // KLA region-crop: when `strict`, a degenerate crop (the selection maps outside the capture — e.g. a
  // scrolled inner-scroller the DOM render clipped away) THROWS instead of silently producing a
  // blank/white sliver, so the caller can steer to the real-pixel Screen capture.
  opts: { strict?: boolean } = {},
): Promise<string> {
  const img = await loadImage(dataUrl)
  const { sx, sy, sw, sh, degenerate } = computeSourceRect(rect, scrollX, scrollY, scale, img.naturalWidth, img.naturalHeight)
  if (opts.strict && degenerate) {
    throw new Error("cropDataUrl: selection maps outside the capture (degenerate crop)")
  }
  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  canvas.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
  return canvas.toDataURL('image/png')
}

/**
 * The scroll offset to pass to {@link cropDataUrl} / {@link computeSourceRect} for a selection made at the
 * LIVE scroll position, cropped out of a DOM-render capture that is anchored at the page origin (the whole
 * document rendered UNSCROLLED). It is window.scroll PLUS the scrollLeft/scrollTop of every scrollable
 * ancestor of the selected content — because an app-shell / inner-scroller layout keeps the DOCUMENT at
 * scroll 0 (so window.scroll alone is 0) while the visible content lives inside a scrolled child; the DOM
 * renderer lays that child out unscrolled, so the viewport rect must be shifted by the child's scroll too.
 * Best-effort + guarded for non-DOM envs (returns window.scroll, or 0/0).
 */
export function cumulativeScrollForRect(rect: Rect): { scrollX: number; scrollY: number } {
  let scrollX = 0
  let scrollY = 0
  try {
    scrollX = window.scrollX || window.pageXOffset || 0
    scrollY = window.scrollY || window.pageYOffset || 0
    if (typeof document === "undefined" || typeof document.elementFromPoint !== "function") {
      return { scrollX, scrollY }
    }
    // Probe the centre of the selection to find the scroll context the selected content lives in.
    const cx = rect.x + rect.w / 2
    const cy = rect.y + rect.h / 2
    const start = document.elementFromPoint(cx, cy) as HTMLElement | null
    const root = document.documentElement
    const body = document.body
    for (let n: HTMLElement | null = start; n && n !== root && n !== body; n = n.parentElement) {
      // Only elements that are actually scrolled contribute an offset. (An unscrolled child adds 0, so we
      // can safely sum every ancestor without checking overflow styles.)
      if (n.scrollTop) scrollY += n.scrollTop
      if (n.scrollLeft) scrollX += n.scrollLeft
    }
  } catch { /* best-effort — fall back to whatever window scroll we resolved */ }
  return { scrollX, scrollY }
}
