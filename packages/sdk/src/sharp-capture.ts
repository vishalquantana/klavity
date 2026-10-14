// Pure geometry helpers for the getDisplayMedia "sharp" full-page capture (scroll-stitch). The DOM
// orchestration (getDisplayMedia, the <video>, scrolling, hiding fixed elements, drawing to canvas) lives
// in widget.ts; these are extracted so the geometry is deterministic + unit-tested. Modelled on GoFullPage.

export interface ScrollStitchStep {
  scrollY: number
  sourceY: number
  sourceHeight: number
  canvasY: number
  drawHeight: number
}

/**
 * Plans seamless scroll-stitch steps for full-page capture.
 * When a top fixed/sticky header of height `topHeaderHeight` is present:
 * - Step 0 captures the full viewport (0..viewportHeight) with the header shown at canvas top.
 * - Steps 1+ step by `(viewportHeight - topHeaderHeight)`, hiding the header and cropping out
 *   the top `topHeaderHeight` pixels so the header never repeats across sections and content
 *   flows continuously without gaps or duplicate header bands.
 */
export function planSeamlessScrollStitch(
  fullHeight: number,
  viewportHeight: number,
  topHeaderHeight = 0,
): ScrollStitchStep[] {
  if (!(viewportHeight > 0) || !(fullHeight > 0)) {
    return [{ scrollY: 0, sourceY: 0, sourceHeight: Math.max(1, viewportHeight), canvasY: 0, drawHeight: Math.max(1, fullHeight) }]
  }

  // If the entire page fits within one viewport, one frame covers it
  if (fullHeight <= viewportHeight) {
    return [{
      scrollY: 0,
      sourceY: 0,
      sourceHeight: fullHeight,
      canvasY: 0,
      drawHeight: fullHeight,
    }]
  }

  const maxScroll = Math.max(0, fullHeight - viewportHeight)
  // Clamp header height to at most 40% of viewport to prevent degenerate strides
  const H = Math.max(0, Math.min(Math.round(topHeaderHeight), Math.floor(viewportHeight * 0.4)))
  const stride = Math.max(1, viewportHeight - H)

  const steps: ScrollStitchStep[] = []

  // Step 0: captures the first viewport with the top header naturally present
  steps.push({
    scrollY: 0,
    sourceY: 0,
    sourceHeight: viewportHeight,
    canvasY: 0,
    drawHeight: viewportHeight,
  })

  let canvasFilled = viewportHeight

  // Steps 1+: capture subsequent slices, excluding the top header area
  for (let iter = 0; iter < 200 && canvasFilled < fullHeight; iter++) {
    const remaining = fullHeight - canvasFilled

    if (H > 0) {
      // Content at screen Y=H corresponds to document Y = (scrollY + H).
      // To continue from document offset canvasFilled, set scrollY = canvasFilled - H.
      const targetScroll = canvasFilled - H
      if (targetScroll >= maxScroll) {
        // Last frame aligned to bottom
        const scrollY = maxScroll
        const drawHeight = remaining
        const sourceHeight = drawHeight
        const sourceY = viewportHeight - remaining
        steps.push({
          scrollY,
          sourceY: Math.max(H, sourceY),
          sourceHeight,
          canvasY: canvasFilled,
          drawHeight,
        })
        canvasFilled += drawHeight
        break
      } else {
        const drawHeight = Math.min(remaining, stride)
        steps.push({
          scrollY: targetScroll,
          sourceY: H,
          sourceHeight: drawHeight,
          canvasY: canvasFilled,
          drawHeight,
        })
        canvasFilled += drawHeight
      }
    } else {
      // No top header: standard stride = viewportHeight
      const targetScroll = canvasFilled
      if (targetScroll >= maxScroll) {
        const scrollY = maxScroll
        const drawHeight = remaining
        const sourceY = viewportHeight - remaining
        steps.push({
          scrollY,
          sourceY: Math.max(0, sourceY),
          sourceHeight: drawHeight,
          canvasY: canvasFilled,
          drawHeight,
        })
        canvasFilled += drawHeight
        break
      } else {
        const drawHeight = Math.min(remaining, viewportHeight)
        steps.push({
          scrollY: targetScroll,
          sourceY: 0,
          sourceHeight: drawHeight,
          canvasY: canvasFilled,
          drawHeight,
        })
        canvasFilled += drawHeight
      }
    }
  }

  return steps
}

/**
 * The ordered list of scrollY positions to step through for a full-page capture. Steps by one viewport
 * height; the FINAL position is clamped so the last frame aligns flush to the page bottom (its overlap
 * with the previous frame is simply overdrawn on the canvas, giving a seamless stitch). Always returns at
 * least [0].
 */
export function planScrollStitch(fullHeight: number, viewportHeight: number): number[] {
  if (!(viewportHeight > 0)) return [0]
  const lastTop = Math.max(0, fullHeight - viewportHeight)
  const ys: number[] = []
  let y = 0
  // hard cap on rows so a pathological (e.g. infinite-scroll) page can't loop forever
  for (let i = 0; i < 200; i++) {
    const targetY = Math.min(y, lastTop)
    ys.push(targetY)
    if (targetY >= lastTop) break
    y += viewportHeight
  }
  return ys
}

/**
 * Clamp the page height to capture so the output canvas stays within the browser's per-dimension limit
 * (~16384px in Chrome) and memory. `scale` = stream pixels per CSS pixel (≈ devicePixelRatio, but derived
 * from the actual stream so a downscaled large-tab capture is handled). Returns CSS pixels.
 */
export function clampCaptureHeight(docHeight: number, scale: number, maxCanvasPx = 16000): number {
  if (!(scale > 0)) return docHeight
  return Math.max(0, Math.min(docHeight, Math.floor(maxCanvasPx / scale)))
}

export interface StickyHeaderInfo {
  elements: HTMLElement[]
  height: number
}

/**
 * Identify top-anchored position:fixed and position:sticky elements (such as navigation bars
 * and sticky headers) that repeat across viewport scroll stops.
 */
export function findTopFixedStickyHeaders(rootDoc?: Document, hostId = "klavity-widget-host"): StickyHeaderInfo {
  const doc = rootDoc || (typeof document !== "undefined" ? document : null)
  if (!doc || !doc.body) return { elements: [], height: 0 }
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024
  const vh = typeof window !== "undefined" ? window.innerHeight : 768
  const elements: HTMLElement[] = []
  let maxBottom = 0

  try {
    const all = Array.from(doc.querySelectorAll<HTMLElement>("body *"))
    for (const el of all) {
      if (!el || (hostId && el.id === hostId)) continue
      let pos = ""
      try { pos = getComputedStyle(el).position } catch { continue }
      if (pos === "fixed" || pos === "sticky" || pos === "-webkit-sticky") {
        try {
          const r = el.getBoundingClientRect()
          // Do not treat large containers/app shells (> 60% viewport height) as repeated headers/bars
          if (r.height > vh * 0.6) continue
          elements.push(el)
          // Top-anchored header: near top (top <= 8), spanning width (>= 35% of viewport),
          // reasonable header height (0 < height <= 40% of viewport)
          if (r.top <= 8 && r.width >= vw * 0.35 && r.height > 0 && r.height <= vh * 0.4) {
            if (r.bottom > maxBottom) maxBottom = r.bottom
          }
        } catch {
          elements.push(el)
        }
      }
    }
  } catch { /* ignore */ }

  return { elements, height: Math.max(0, Math.round(maxBottom)) }
}

export interface FixedStickyRestoreItem {
  el: HTMLElement
  prevVisibility: string
  prevPrio: string
  prevOpacity: string
  prevPointerEvents: string
}

export function hideFixedStickyElements(
  elements: HTMLElement[],
): FixedStickyRestoreItem[] {
  const out: FixedStickyRestoreItem[] = []
  for (const el of elements) {
    if (!el) continue
    out.push({
      el,
      prevVisibility: el.style.getPropertyValue("visibility"),
      prevPrio: el.style.getPropertyPriority("visibility"),
      prevOpacity: el.style.getPropertyValue("opacity"),
      prevPointerEvents: el.style.getPropertyValue("pointer-events"),
    })
    el.style.setProperty("visibility", "hidden", "important")
    el.style.setProperty("opacity", "0", "important")
    el.style.setProperty("pointer-events", "none", "important")
  }
  return out
}

export function restoreFixedStickyElements(list: FixedStickyRestoreItem[]): void {
  for (const item of list) {
    try {
      if (item.prevVisibility) {
        item.el.style.setProperty("visibility", item.prevVisibility, item.prevPrio)
      } else {
        item.el.style.removeProperty("visibility")
      }
      if (item.prevOpacity) {
        item.el.style.setProperty("opacity", item.prevOpacity)
      } else {
        item.el.style.removeProperty("opacity")
      }
      if (item.prevPointerEvents) {
        item.el.style.setProperty("pointer-events", item.prevPointerEvents)
      } else {
        item.el.style.removeProperty("pointer-events")
      }
    } catch { /* ignore */ }
  }
}

