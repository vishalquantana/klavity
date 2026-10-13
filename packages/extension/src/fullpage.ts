// Full-page scroll-stitch capture for the extension — modeled on GoFullPage.
//
// chrome.tabs.captureVisibleTab() only grabs the visible viewport, so to get a complete, pixel-perfect
// screenshot (including cross-origin images, which capture as real pixels with no CORS taint) we:
//   1. measure the full page size + viewport + devicePixelRatio,
//   2. hide the Klavity composer overlay for the whole capture, and (like GoFullPage) show other
//      fixed/sticky elements on the first frame then hide them so they don't repeat down the page,
//   3. scroll the page in viewport-sized steps, waiting for paint between scrolls (the SW additionally
//      rate-limits captureVisibleTab to ~2/sec), capturing each frame,
//   4. stitch every frame onto a canvas scaled by devicePixelRatio (captureVisibleTab returns physical
//      pixels) at the frame's actual (clamped) scroll offset, then export to a PNG data URL,
//   5. restore the original scroll position and the elements we touched.

export interface FullPageDeps {
  // Grabs one visible-tab frame as a data URL (the SW's captureVisibleTab via the capture bridge).
  capture: () => Promise<string>
  renderWaitMs?: number   // pause after each scroll so the page paints before capturing
  maxCanvasPx?: number    // hard cap per canvas dimension (physical px) — guards the browser's canvas limit
}

export type Pos = { x: number; y: number }

// Grid of scroll positions covering the page. The last row/column is clamped to the maximum scroll
// offset (and de-duplicated) so we never scroll past the end or stitch a duplicated partial frame.
export function captureGrid(fullW: number, fullH: number, vw: number, vh: number): Pos[] {
  const w = Math.max(1, Math.floor(fullW)), h = Math.max(1, Math.floor(fullH))
  const stepX = Math.max(1, Math.floor(vw)), stepY = Math.max(1, Math.floor(vh))
  const maxX = Math.max(0, w - stepX), maxY = Math.max(0, h - stepY)
  const ys: number[] = []
  for (let y = 0; y < h; y += stepY) ys.push(Math.min(y, maxY))
  const xs: number[] = []
  for (let x = 0; x < w; x += stepX) xs.push(Math.min(x, maxX))
  const uy = Array.from(new Set(ys)), ux = Array.from(new Set(xs))
  const out: Pos[] = []
  for (const y of uy) for (const x of ux) out.push({ x, y })
  return out
}

export function pageDimensions(): { fullW: number; fullH: number; vw: number; vh: number; dpr: number } {
  const d = document.documentElement
  const b = document.body
  const vw = window.innerWidth
  const vh = window.innerHeight
  const fullW = Math.max(d.scrollWidth, d.clientWidth, d.offsetWidth, b ? b.scrollWidth : 0, b ? b.offsetWidth : 0, vw)
  const fullH = Math.max(d.scrollHeight, d.clientHeight, d.offsetHeight, b ? b.scrollHeight : 0, b ? b.offsetHeight : 0, vh)
  return { fullW, fullH, vw, vh, dpr: window.devicePixelRatio || 1 }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const raf = () => new Promise<void>((r) => requestAnimationFrame(() => r()))
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = () => rej(new Error('image load failed')); img.src = src })

// The Klavity composer mounts as a body-child shadow host with position:fixed and a max z-index. Find
// such overlays so we can hide our own UI for the entire capture (it must never appear in the shot).
function findKlavityOverlays(): HTMLElement[] {
  return Array.from(document.body?.children ?? []).filter((el): el is HTMLElement => {
    if (!(el instanceof HTMLElement) || !el.shadowRoot) return false
    const cs = getComputedStyle(el)
    return cs.position === 'fixed' && Number(cs.zIndex) >= 2147483000
  })
}

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
  const H = Math.max(0, Math.min(Math.round(topHeaderHeight), Math.floor(viewportHeight * 0.4)))
  const stride = Math.max(1, viewportHeight - H)
  const steps: ScrollStitchStep[] = []

  steps.push({
    scrollY: 0,
    sourceY: 0,
    sourceHeight: viewportHeight,
    canvasY: 0,
    drawHeight: viewportHeight,
  })

  let canvasFilled = viewportHeight

  for (let iter = 0; iter < 200 && canvasFilled < fullHeight; iter++) {
    const remaining = fullHeight - canvasFilled

    if (H > 0) {
      const targetScroll = canvasFilled - H
      if (targetScroll >= maxScroll) {
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

// Hide the given elements (visibility:hidden !important) and return a restore fn.
function hideAll(els: HTMLElement[]): () => void {
  const touched = els.map((el) => ({
    el,
    prevVisibility: el.style.getPropertyValue('visibility'),
    prioVisibility: el.style.getPropertyPriority('visibility'),
    prevOpacity: el.style.getPropertyValue('opacity'),
    prevPointerEvents: el.style.getPropertyValue('pointer-events'),
  }))
  for (const el of els) {
    el.style.setProperty('visibility', 'hidden', 'important')
    el.style.setProperty('opacity', '0', 'important')
    el.style.setProperty('pointer-events', 'none', 'important')
  }
  return () => {
    for (const item of touched) {
      if (item.prevVisibility) item.el.style.setProperty('visibility', item.prevVisibility, item.prioVisibility)
      else item.el.style.removeProperty('visibility')
      if (item.prevOpacity) item.el.style.setProperty('opacity', item.prevOpacity)
      else item.el.style.removeProperty('opacity')
      if (item.prevPointerEvents) item.el.style.setProperty('pointer-events', item.prevPointerEvents)
      else item.el.style.removeProperty('pointer-events')
    }
  }
}

export function findTopHeaderInfo(exclude: Set<Element>, vw: number, vh: number): { elements: HTMLElement[]; topHeaderHeight: number } {
  const elements: HTMLElement[] = []
  let maxBottom = 0

  for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
    if (exclude.has(el)) continue
    let pos = ''
    try { pos = getComputedStyle(el).position } catch { continue }
    if (pos === 'fixed' || pos === 'sticky' || pos === '-webkit-sticky') {
      try {
        const r = el.getBoundingClientRect()
        // Skip large app-shells / modal backdrops (> 60% viewport height)
        if (r.height > vh * 0.6) continue
        elements.push(el)
        if (r.top <= 8 && r.width >= vw * 0.35 && r.height > 0 && r.height <= vh * 0.4) {
          if (r.bottom > maxBottom) maxBottom = r.bottom
        }
      } catch {
        elements.push(el)
      }
    }
  }

  return { elements, topHeaderHeight: Math.max(0, Math.round(maxBottom)) }
}

// Collect position:fixed / position:sticky elements (excluding ones we already hide), so they can be
// hidden after the first frame and not repeat in every stitched segment.
export function findFixedSticky(exclude: Set<Element>): HTMLElement[] {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768
  return findTopHeaderInfo(exclude, vw, vh).elements
}

export async function captureFullPage(deps: FullPageDeps): Promise<string> {
  const renderWaitMs = deps.renderWaitMs ?? 250
  const maxCanvasPx = deps.maxCanvasPx ?? 16384
  const { fullW, fullH, vw, vh, dpr } = pageDimensions()

  const savedX = window.scrollX, savedY = window.scrollY
  const savedHtmlBehavior = document.documentElement.style.getPropertyValue('scroll-behavior')
  const savedHtmlPrio = document.documentElement.style.getPropertyPriority('scroll-behavior')
  const savedBodyBehavior = document.body ? document.body.style.getPropertyValue('scroll-behavior') : ''
  const savedBodyPrio = document.body ? document.body.style.getPropertyPriority('scroll-behavior') : ''
  document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important')
  if (document.body) document.body.style.setProperty('scroll-behavior', 'auto', 'important')

  // Cap the capture to the canvas limit (very long pages truncate at the bottom rather than failing).
  // High-DPI scaling (e.g. Windows 125%-200%, Retina) can multiply canvas height beyond the browser limit.
  // Clamp effective DPR so canvas dimensions stay strictly within maxCanvasPx (typically 16384px).
  const effectiveDpr = Math.max(1, Math.min(dpr, Math.floor(maxCanvasPx / Math.max(fullW, fullH, 1))))
  const capW = Math.min(fullW, Math.floor(maxCanvasPx / effectiveDpr))
  const capH = Math.min(fullH, Math.floor(maxCanvasPx / effectiveDpr))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(capW * effectiveDpr)
  canvas.height = Math.round(capH * effectiveDpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    if (savedHtmlBehavior) document.documentElement.style.setProperty('scroll-behavior', savedHtmlBehavior, savedHtmlPrio)
    else document.documentElement.style.removeProperty('scroll-behavior')
    if (document.body) {
      if (savedBodyBehavior) document.body.style.setProperty('scroll-behavior', savedBodyBehavior, savedBodyPrio)
      else document.body.style.removeProperty('scroll-behavior')
    }
    return deps.capture()
  }

  const overlays = findKlavityOverlays()
  const restoreOverlays = hideAll(overlays)             // our composer: hidden for the whole capture
  const overlaySet = new Set<Element>(overlays)
  let restoreFixed: (() => void) | null = null

  try {
    const headerInfo = findTopHeaderInfo(overlaySet, vw, vh)

    // Treat normal pages as 1D vertical if content width fits viewport or only differs by scrollbar width (<=32px)
    const isOneD = capW <= vw || (fullW - vw <= 32 && (document.documentElement?.scrollWidth ?? 0) <= vw)
    if (isOneD) {
      // 1D vertical capture: seamless scroll-stitch with sticky header exclusion
      const steps = planSeamlessScrollStitch(capH, vh, headerInfo.topHeaderHeight)
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        window.scrollTo(0, step.scrollY)
        await raf()
        await sleep(renderWaitMs)
        const dataUrl = await deps.capture()
        const img = await loadImage(dataUrl)

        const sx = 0
        const sy = Math.round(step.sourceY * effectiveDpr)
        const sw = Math.round(vw * effectiveDpr)
        const sh = Math.round(step.sourceHeight * effectiveDpr)

        const dx = 0
        const dy = Math.round(step.canvasY * effectiveDpr)
        const dw = Math.round(vw * effectiveDpr)
        const dh = Math.round(step.drawHeight * effectiveDpr)

        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)

        // After the first (top) frame, hide fixed/sticky elements so headers/footers don't repeat.
        if (i === 0 && steps.length > 1 && headerInfo.elements.length > 0) {
          restoreFixed = hideAll(headerInfo.elements)
        }
      }
    } else {
      // 2D grid fallback for horizontal + vertical overflowing pages
      const positions = captureGrid(capW, capH, vw, vh)
      for (let i = 0; i < positions.length; i++) {
        window.scrollTo(positions[i].x, positions[i].y)
        await raf()
        await sleep(renderWaitMs)
        const dataUrl = await deps.capture()
        // Use the ACTUAL (clamped) scroll offset so edge frames overlap-and-overwrite rather than leaving gaps.
        const ax = window.scrollX, ay = window.scrollY
        const img = await loadImage(dataUrl)
        ctx.drawImage(img, Math.round(ax * effectiveDpr), Math.round(ay * effectiveDpr))
        // After the first (top) frame, hide other fixed/sticky elements so headers/footers don't repeat.
        if (i === 0 && headerInfo.elements.length > 0) {
          restoreFixed = hideAll(headerInfo.elements)
        }
      }
    }
    try {
      const png = canvas.toDataURL('image/png')
      // If PNG is under 5MB, keep PNG; if oversized, encode as high-quality JPEG to stay safely within the 8MB upload cap
      if (png && png.length > 64 && png.length <= 5 * 1024 * 1024) {
        return png
      }
      const jpeg = canvas.toDataURL('image/jpeg', 0.88)
      if (jpeg && jpeg.length > 64) return jpeg
      return png || deps.capture()
    } catch {
      try {
        const jpeg = canvas.toDataURL('image/jpeg', 0.88)
        if (jpeg && jpeg.length > 64) return jpeg
      } catch {}
      return deps.capture()
    }
  } finally {
    if (restoreFixed) restoreFixed()
    restoreOverlays()
    if (savedHtmlBehavior) document.documentElement.style.setProperty('scroll-behavior', savedHtmlBehavior, savedHtmlPrio)
    else document.documentElement.style.removeProperty('scroll-behavior')
    if (document.body) {
      if (savedBodyBehavior) document.body.style.setProperty('scroll-behavior', savedBodyBehavior, savedBodyPrio)
      else document.body.style.removeProperty('scroll-behavior')
    }
    window.scrollTo(savedX, savedY)
  }
}
