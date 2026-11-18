import { safeRemove } from './safe-remove'

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'])

interface SavedText { parent: Node; original: Text; replacements: Node[] }
interface SavedInput { el: HTMLInputElement | HTMLSelectElement; original: string }

/** Every text node under `root` that contains a digit (skipping script/style/noscript/textarea). */
function digitTextNodes(root: Element): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let el: Element | null = node.parentElement
      while (el && el !== root) {
        if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT
        el = el.parentElement
      }
      return /\d/.test(node.textContent ?? '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    }
  })
  const out: Text[] = []
  let n: Node | null
  while ((n = walker.nextNode())) out.push(n as Text)
  return out
}

export interface MaskRect { x: number; y: number; w: number; h: number }
/** A measured number box; `fixed` = inside a position:fixed element (pinned to the screen, so a full-page image
 *  shows it once at the top rather than at its scrolled document position). */
export interface NumberRect extends MaskRect { fixed?: boolean }

/** KD-3090/KD-3088: where the numbers were on the page at capture time, so "Mask numbers" can be applied to a
 *  screenshot AFTER it was taken. `rects` are CSS-px viewport rects (getClientRects); the rest is the page
 *  geometry needed to map them onto the captured image (viewport vs full-page vs region). */
export interface NumberGeo {
  rects: NumberRect[]
  vw: number; vh: number   // viewport size
  sx: number; sy: number   // scroll offset
  dw: number; dh: number   // full document size
}

export function collectNumberRects(root: Element): NumberGeo {
  const rects: NumberRect[] = []
  const vw0 = window.innerWidth, vh0 = window.innerHeight
  const isKlavityUi = (el: Element) => !!(el.closest && el.closest('[data-klavity-ui], #klavity-widget-host'))
  // Is the number box at `r` (owned by element `owner`) completely hidden behind ANOTHER page element — e.g. a
  // stat tile scrolled under a sticky header? Then it isn't in the screenshot and must not get a box (a box there
  // lands on whatever covers it). Privacy-first: it is dropped only when the centre AND all four corners are
  // covered by a non-Klavity page element; partly visible, off-screen or unknown → still masked.
  const fullyCovered = (r: { left: number; top: number; width: number; height: number }, owner: Element | null): boolean => {
    if (!owner || typeof document.elementsFromPoint !== 'function') return false
    const ix = Math.min(2, r.width / 4), iy = Math.min(2, r.height / 4)
    const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + ix, r.top + iy], [r.left + r.width - ix, r.top + iy],
      [r.left + ix, r.top + r.height - iy], [r.left + r.width - ix, r.top + r.height - iy]]
    for (const [x, y] of pts) {
      if (x < 0 || y < 0 || x >= vw0 || y >= vh0) return false            // off-screen: can't tell → keep
      let top: Element | null = null
      try { top = document.elementsFromPoint(x, y).find(e => !isKlavityUi(e)) || null } catch { return false }
      if (!top || top === owner || owner.contains(top) || top.contains(owner)) return false   // this point is visible
    }
    return true
  }
  const push = (r: { left: number; top: number; width: number; height: number }, fixed: boolean, owner: Element | null) => {
    if (!(r.width > 0 && r.height > 0) || fullyCovered(r, owner)) return
    rects.push(fixed ? { x: r.left, y: r.top, w: r.width, h: r.height, fixed } : { x: r.left, y: r.top, w: r.width, h: r.height })
  }
  // Is `el` (or an ancestor) position:fixed? Cached per element — one getComputedStyle per element at most.
  const fixedCache = new Map<Element, boolean>()
  const isFixed = (el: Element | null): boolean => {
    if (!el || el === document.documentElement) return false
    const hit = fixedCache.get(el)
    if (hit !== undefined) return hit
    let v = false
    try { v = getComputedStyle(el).position === 'fixed' } catch { v = false }
    if (!v) v = isFixed(el.parentElement)
    fixedCache.set(el, v)
    return v
  }
  for (const textNode of digitTextNodes(root)) {
    const fixed = isFixed(textNode.parentElement)
    const content = textNode.textContent ?? ''
    const re = /\d+/g
    let m: RegExpExecArray | null
    while ((m = re.exec(content))) {
      try {
        const range = document.createRange()
        range.setStart(textNode, m.index)
        range.setEnd(textNode, m.index + m[0].length)
        // A run that wraps across lines yields one rect per line fragment.
        const list = range.getClientRects ? range.getClientRects() : null
        if (list) for (let i = 0; i < list.length; i++) push(list[i], fixed, textNode.parentElement)
      } catch { /* detached / odd node — skip this run */ }
    }
  }
  root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select').forEach(el => {
    if (/\d/.test(el.value)) push(el.getBoundingClientRect(), isFixed(el), el)
  })
  const de = document.documentElement
  return {
    rects,
    vw: window.innerWidth, vh: window.innerHeight,
    sx: window.scrollX || 0, sy: window.scrollY || 0,
    dw: Math.max(de.scrollWidth, window.innerWidth), dh: Math.max(de.scrollHeight, window.innerHeight),
  }
}

/** Map captured number rects onto an image of `imgW`×`imgH` px. `capture` is the shot's provenance: a region /
 *  element shot carries its viewport rect; a 'full' shot maps by width (a very tall page may be height-clamped);
 *  a 'viewport' shot must match the viewport's shape. Without a kind, the aspect ratio decides. Returns null when
 *  the image can't be matched to the page (e.g. a whole screen/window was shared instead of the tab), so we never
 *  paint boxes in the wrong place. */
export function numberRectsToImage(
  geo: NumberGeo, imgW: number, imgH: number,
  capture?: { kind?: string; rect?: MaskRect },
): MaskRect[] | null {
  if (!(imgW > 0 && imgH > 0)) return null
  const near = (a: number, b: number) => b > 0 && Math.abs(a - b) / b < 0.04
  let s: number, ox: number, oy: number, full = false
  const area = (capture?.kind === 'region' || capture?.kind === 'element') ? capture.rect : undefined
  const ar = imgW / imgH
  const isView = near(ar, geo.vw / geo.vh)
  if (area && area.w > 0 && area.h > 0) {
    s = imgW / area.w; ox = area.x; oy = area.y
  } else if (capture?.kind === 'full') {
    s = imgW / geo.dw; ox = -geo.sx; oy = -geo.sy; full = true
  } else if (capture?.kind === 'viewport') {
    if (!isView) return null
    s = imgW / geo.vw; ox = 0; oy = 0
  } else {
    const isDoc = near(ar, geo.dw / geo.dh)
    if (isDoc && !isView) { s = imgW / geo.dw; ox = -geo.sx; oy = -geo.sy; full = true }
    else if (isView) { s = imgW / geo.vw; ox = 0; oy = 0 }
    else return null
  }
  const pad = 2 * s // a little bleed so anti-aliased glyph edges are covered too
  const out: MaskRect[] = []
  for (const r0 of geo.rects) {
    // A fixed element sits at its on-screen spot at the TOP of a full-page image (not at its scrolled position).
    const r = full && r0.fixed ? { x: r0.x - geo.sx, y: r0.y - geo.sy, w: r0.w, h: r0.h } : r0
    const x0 = Math.max(0, (r.x - ox) * s - pad)
    const y0 = Math.max(0, (r.y - oy) * s - pad)
    const x1 = Math.min(imgW, (r.x - ox + r.w) * s + pad)
    const y1 = Math.min(imgH, (r.y - oy + r.h) * s + pad)
    if (x1 > x0 && y1 > y0) out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 })
  }
  return out
}

/** Paint solid boxes over `rects` INTO the image pixels (not an overlay), returning a new PNG data URL. */
export function bakeMaskRects(dataUrl: string, rectsFor: (w: number, h: number) => MaskRect[] | null): Promise<{ url: string; rects: MaskRect[] } | null> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      try {
        const w = img.naturalWidth, h = img.naturalHeight
        const rects = rectsFor(w, h)
        if (!rects || !rects.length) return resolve(null)
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        const ctx = c.getContext('2d')
        if (!ctx) return resolve(null)
        ctx.drawImage(img, 0, 0)
        ctx.fillStyle = '#111'
        for (const r of rects) ctx.fillRect(r.x, r.y, r.w, r.h)
        resolve({ url: c.toDataURL('image/png'), rects })
      } catch { resolve(null) }   // tainted / headless canvas — leave the shot as-is
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

export function maskNumbers(root: Element): () => void {
  const savedTexts: SavedText[] = []
  const savedInputs: SavedInput[] = []

  const toMask = digitTextNodes(root)

  for (const textNode of toMask) {
    const content = textNode.textContent ?? ''
    const parts = content.split(/(\d+)/)
    if (parts.length <= 1) continue
    const parent = textNode.parentNode!
    const anchor = textNode.nextSibling
    const replacements: Node[] = parts.map((part, i) => {
      if (i % 2 === 1) {
        const span = document.createElement('span')
        span.style.cssText = 'background:#111;color:transparent;border-radius:2px;'
        span.textContent = part
        return span
      }
      return document.createTextNode(part)
    })
    // KLA-560: route through safeRemove so a page that poisons Node.prototype.removeChild can't throw
    // mid-capture (same hardening as everywhere else). Identical behavior on a clean page.
    safeRemove(textNode)
    for (const r of replacements) parent.insertBefore(r, anchor)
    savedTexts.push({ parent, original: textNode, replacements })
  }

  root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select').forEach(el => {
    const v = el.value
    if (/\d/.test(v)) {
      savedInputs.push({ el, original: v })
      el.value = '█'.repeat(v.length)
    }
  })

  return () => {
    for (const { parent, original, replacements } of savedTexts) {
      const first = replacements[0]
      if (first?.parentNode === parent) {
        parent.insertBefore(original, first)
        for (const r of replacements) if (r.parentNode === parent) safeRemove(r)
      }
    }
    for (const { el, original } of savedInputs) {
      el.value = original
    }
  }
}
