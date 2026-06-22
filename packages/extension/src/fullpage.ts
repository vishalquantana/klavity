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

// Hide the given elements (visibility:hidden) and return a restore fn.
function hideAll(els: HTMLElement[]): () => void {
  const touched = els.map((el) => ({ el, prev: el.style.getPropertyValue('visibility'), prio: el.style.getPropertyPriority('visibility') }))
  for (const el of els) el.style.setProperty('visibility', 'hidden', 'important')
  return () => { for (const { el, prev, prio } of touched) prev ? el.style.setProperty('visibility', prev, prio) : el.style.removeProperty('visibility') }
}

// Collect position:fixed / position:sticky elements (excluding ones we already hide), so they can be
// hidden after the first frame and not repeat in every stitched segment.
function findFixedSticky(exclude: Set<Element>): HTMLElement[] {
  const out: HTMLElement[] = []
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
    if (exclude.has(el)) continue
    const pos = getComputedStyle(el).position
    if (pos === 'fixed' || pos === 'sticky') out.push(el)
  }
  return out
}

export async function captureFullPage(deps: FullPageDeps): Promise<string> {
  const renderWaitMs = deps.renderWaitMs ?? 250
  const maxCanvasPx = deps.maxCanvasPx ?? 16384
  const { fullW, fullH, vw, vh, dpr } = pageDimensions()

  const savedX = window.scrollX, savedY = window.scrollY
  const savedBehavior = document.documentElement.style.scrollBehavior
  document.documentElement.style.scrollBehavior = 'auto'

  // Cap the capture to the canvas limit (very long pages truncate at the bottom rather than failing).
  const capW = Math.min(fullW, Math.floor(maxCanvasPx / dpr))
  const capH = Math.min(fullH, Math.floor(maxCanvasPx / dpr))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(capW * dpr)
  canvas.height = Math.round(capH * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) { document.documentElement.style.scrollBehavior = savedBehavior; return deps.capture() }

  const overlays = findKlavityOverlays()
  const restoreOverlays = hideAll(overlays)             // our composer: hidden for the whole capture
  const overlaySet = new Set<Element>(overlays)
  let restoreFixed: (() => void) | null = null

  try {
    const positions = captureGrid(capW, capH, vw, vh)
    for (let i = 0; i < positions.length; i++) {
      window.scrollTo(positions[i].x, positions[i].y)
      await raf()
      await sleep(renderWaitMs)
      const dataUrl = await deps.capture()
      // Use the ACTUAL (clamped) scroll offset so edge frames overlap-and-overwrite rather than leaving gaps.
      const ax = window.scrollX, ay = window.scrollY
      const img = await loadImage(dataUrl)
      ctx.drawImage(img, Math.round(ax * dpr), Math.round(ay * dpr))
      // After the first (top) frame, hide other fixed/sticky elements so headers/footers don't repeat.
      if (i === 0) restoreFixed = hideAll(findFixedSticky(overlaySet))
    }
    return canvas.toDataURL('image/png')
  } finally {
    if (restoreFixed) restoreFixed()
    restoreOverlays()
    document.documentElement.style.scrollBehavior = savedBehavior
    window.scrollTo(savedX, savedY)
  }
}
