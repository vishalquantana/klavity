import type { Shape } from './types'

/** KLA-770: word-wrap `text` into lines that each fit within `maxWidth`, measured by the caller-supplied
 *  `measure` fn (so it's pure + unit-testable without a real canvas). Honours explicit '\n' breaks. A single
 *  word longer than the limit is hard-broken by character (binary-searched prefix) so nothing ever overflows.
 *  `maxWidth <= 0` / non-finite means "no limit" → one line per paragraph. Always returns at least ['']. */
export function wrapTextLines(measure: (s: string) => number, text: string, maxWidth: number): string[] {
  const limit = maxWidth > 0 && Number.isFinite(maxWidth) ? maxWidth : Infinity
  const lines: string[] = []
  for (const para of String(text ?? '').split('\n')) {
    if (!para.length) { lines.push(''); continue }
    let line = ''
    for (const rawWord of para.split(' ')) {
      let word = rawWord
      const sep = line ? ' ' : ''
      if (line && measure(line + sep + word) <= limit) { line += sep + word; continue }
      if (line) { lines.push(line); line = '' }
      // Hard-break a word that alone exceeds the limit, one fitted chunk at a time.
      while (word.length > 1 && measure(word) > limit) {
        let lo = 1, hi = word.length, fit = 1
        while (lo <= hi) {
          const mid = (lo + hi) >> 1
          if (measure(word.slice(0, mid)) <= limit) { fit = mid; lo = mid + 1 } else hi = mid - 1
        }
        lines.push(word.slice(0, fit))
        word = word.slice(fit)
      }
      line = word
    }
    lines.push(line)
  }
  return lines.length ? lines : ['']
}

/** Measure text width via a 2D context, defensively: returns 0 when measureText is missing or yields no
 *  numeric width (stubbed/headless contexts) so wrapping degrades to a single line instead of throwing. */
function safeMeasure(ctx: CanvasRenderingContext2D, s: string): number {
  try {
    if (typeof ctx.measureText !== 'function') return 0
    const m = ctx.measureText(s) as { width?: number } | null
    const w = m && m.width
    return typeof w === 'number' && Number.isFinite(w) ? w : 0
  } catch { return 0 }
}

/** Parse a #rgb / #rrggbb / rgb() colour to [r,g,b] (0-255), or null if it can't be read. */
export function parseColor(color: string): [number, number, number] | null {
  const c = (color || '').trim()
  const hex = c.replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return [parseInt(hex[0] + hex[0], 16), parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16)]
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]
  }
  const m = c.match(/rgba?\(([^)]+)\)/i)
  if (m) {
    const p = m[1].split(',').map(s => parseFloat(s))
    if (p.length >= 3 && p.every(n => !Number.isNaN(n))) return [p[0], p[1], p[2]]
  }
  return null
}

/** Relative luminance (0 dark → 1 light) for a CSS colour; unknown colours read as dark. */
export function luminance(color: string): number {
  const rgb = parseColor(color)
  if (!rgb) return 0
  const [r, g, b] = rgb.map(v => v / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Contrasting halo colour drawn UNDER/AROUND a stroke so it's visible on any background: a dark halo
 *  behind light strokes (white/yellow), a light halo behind dark strokes. Mirrors the outline that text
 *  annotations already use. Founder: "colour on the line AND a stroke on the line so it's visible." */
export function haloColor(color: string): string {
  return luminance(color) > 0.55 ? 'rgba(17,17,17,0.92)' : 'rgba(255,255,255,0.92)'
}

// ── Edit-annotation geometry (pure; unit-tested) ──────────────────────────────────────────────────────
export interface Box { x: number; y: number; w: number; h: number }
/** Resize handle ids: corners for boxed shapes, p1/p2 for line + arrow endpoints. */
export type Handle = 'nw' | 'ne' | 'sw' | 'se' | 'p1' | 'p2'

function normBox(x: number, y: number, w: number, h: number): Box {
  return { x: Math.min(x, x + w), y: Math.min(y, y + h), w: Math.abs(w), h: Math.abs(h) }
}
function distToSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy
  const t = len2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2)) : 0
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

/** Does `s` contain / sit under the image-space point? Lines are hit near the stroke; boxed shapes inside. */
export function shapeContains(s: Shape, px: number, py: number, tol: number, a: Annotator): boolean {
  if (s.type === 'line' || s.type === 'arrow') return distToSeg(px, py, s.x1, s.y1, s.x2, s.y2) <= tol + a.computeLineWidth(s)
  if (s.type === 'pen') {
    const reach = tol + a.computeLineWidth(s)
    if (s.points.length === 1) return Math.hypot(px - s.points[0].x, py - s.points[0].y) <= reach
    for (let i = 1; i < s.points.length; i++) {
      const p = s.points[i - 1], q = s.points[i]
      if (distToSeg(px, py, p.x, p.y, q.x, q.y) <= reach) return true
    }
    return false
  }
  if (s.type === 'circle') {
    const rx = Math.abs(s.rx) + tol, ry = Math.abs(s.ry) + tol
    return ((px - s.x) / rx) ** 2 + ((py - s.y) / ry) ** 2 <= 1
  }
  if (s.type === 'count') return Math.hypot(px - s.x, py - s.y) <= a.countRadius(s) + tol
  const b = a.shapeBounds(s)
  return !!b && px >= b.x - tol && px <= b.x + b.w + tol && py >= b.y - tol && py <= b.y + b.h + tol
}

export function cloneShape<T extends Shape>(s: T): T { return JSON.parse(JSON.stringify(s)) }

/** Copy `from`'s geometry onto `to` in place (same shape object stays selected / in history order). */
function assignGeometry(to: Shape, from: Shape): void { Object.assign(to, cloneShape(from)) }

/** Move: `orig` is the shape as it was when the drag started; the live shape becomes orig shifted by dx,dy. */
export function translateShape(shape: Shape, orig: Shape, dx: number, dy: number): void {
  assignGeometry(shape, orig)
  const s = shape as any
  if (s.type === 'pen') s.points = s.points.map((p: { x: number; y: number }) => ({ x: p.x + dx, y: p.y + dy }))
  else if (s.type === 'line' || s.type === 'arrow') { s.x1 += dx; s.y1 += dy; s.x2 += dx; s.y2 += dy }
  else { s.x += dx; s.y += dy }
}

/** Resize from a handle: the opposite corner (or the other endpoint) stays put and the grabbed one follows
 *  the pointer. `origBounds` = the shape's bounds at drag start. Text/counter scale uniformly (font size /
 *  badge radius); a pen stroke scales its points. */
export function resizeShape(shape: Shape, orig: Shape, origBounds: Box, handle: Handle, px: number, py: number): void {
  assignGeometry(shape, orig)
  const s = shape as any
  if (s.type === 'line' || s.type === 'arrow') {
    if (handle === 'p1') { s.x1 = px; s.y1 = py } else if (handle === 'p2') { s.x2 = px; s.y2 = py }
    return
  }
  const b = origBounds
  if (s.type === 'text') {
    const k = Math.max(0.2, (py - b.y) / Math.max(1, b.h))
    s.size = Math.max(10, Math.min(240, Math.round((orig as any).size * k)))
    return
  }
  if (s.type === 'count') {
    s.size = Math.max(8, Math.min(400, Math.max(px - s.x, py - s.y)))
    return
  }
  // Fixed (opposite) corner → new box spanning fixed..pointer.
  const fx = handle === 'nw' || handle === 'sw' ? b.x + b.w : b.x
  const fy = handle === 'nw' || handle === 'ne' ? b.y + b.h : b.y
  const nb = normBox(fx, fy, px - fx, py - fy)
  const MIN = 4
  if (nb.w < MIN) nb.w = MIN
  if (nb.h < MIN) nb.h = MIN
  if (s.type === 'rect' || s.type === 'pixelate') { s.x = nb.x; s.y = nb.y; s.w = nb.w; s.h = nb.h }
  else if (s.type === 'circle') { s.x = nb.x + nb.w / 2; s.y = nb.y + nb.h / 2; s.rx = nb.w / 2; s.ry = nb.h / 2 }
  else if (s.type === 'pen') {
    const sx = b.w ? nb.w / b.w : 1, sy = b.h ? nb.h / b.h : 1
    s.points = s.points.map((p: { x: number; y: number }) => ({ x: nb.x + (p.x - b.x) * sx, y: nb.y + (p.y - b.y) * sy }))
  }
}

export class Annotator {
  readonly shapes: Shape[] = []
  private canvas: HTMLCanvasElement
  private imageDataUrl: string
  /** Stroke-thickness multiplier set by the toolbar line-width control (thin=0.6, medium=1, thick=1.8, xl=2.8). */
  strokeScale = 1
  /** KLAVITYKLA-507: decoded base bitmap, cached after the first redraw so live drag previews can repaint
   *  the base + committed shapes SYNCHRONOUSLY (no per-move image reload → no flicker). */
  private baseImg: HTMLImageElement | null = null

  constructor(canvas: HTMLCanvasElement, imageDataUrl: string) {
    this.canvas = canvas
    this.imageDataUrl = imageDataUrl
  }

  /** Base stroke width. A shape that recorded its own stroke multiplier (`sw`) keeps it; otherwise the
   *  editor's current Stroke setting (`strokeScale`) applies. */
  computeLineWidth(shape?: Shape | null): number {
    const sw = shape && 'sw' in shape && typeof shape.sw === 'number' && shape.sw > 0 ? shape.sw : this.strokeScale
    return Math.max(3, this.canvas.width / 400) * sw
  }

  computeFontSize(): number {
    return Math.max(16, this.canvas.width / 60)
  }

  /** Radius (image px) of a numbered counter badge — its own `size` once resized, else the default. */
  countRadius(shape: Extract<Shape, { type: 'count' }>): number {
    return shape.size && shape.size > 0 ? shape.size : Math.max(13, this.computeFontSize())
  }

  // ── Selection (edit added annotations) ─────────────────────────────────────────────────────────────
  /** The shape being edited with the Select tool (drawn with a dashed outline + handles). Display-only:
   *  never part of `shapes`, and the export path (renderAnnotatedImage) never sets it. */
  selected: Shape | null = null
  /** Screen-to-image scale (1 / object-fit display scale) so handles keep a usable on-screen size on big
   *  screenshots. Set by the editor; 1 = draw handles at their nominal size. */
  uiScale = 1

  /** Image-space bounding box of any shape (null when it can't be measured, e.g. text in a headless env). */
  shapeBounds(shape: Shape): Box | null {
    switch (shape.type) {
      case 'pen': {
        if (!shape.points.length) return null
        let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
        for (const p of shape.points) { x1 = Math.min(x1, p.x); y1 = Math.min(y1, p.y); x2 = Math.max(x2, p.x); y2 = Math.max(y2, p.y) }
        return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
      }
      case 'rect': case 'pixelate':
        return normBox(shape.x, shape.y, shape.w, shape.h)
      case 'arrow': case 'line':
        return { x: Math.min(shape.x1, shape.x2), y: Math.min(shape.y1, shape.y2), w: Math.abs(shape.x2 - shape.x1), h: Math.abs(shape.y2 - shape.y1) }
      case 'circle':
        return { x: shape.x - Math.abs(shape.rx), y: shape.y - Math.abs(shape.ry), w: Math.abs(shape.rx) * 2, h: Math.abs(shape.ry) * 2 }
      case 'count': {
        const r = this.countRadius(shape)
        return { x: shape.x - r, y: shape.y - r, w: r * 2, h: r * 2 }
      }
      case 'text':
        return this.textBounds(shape)
    }
    return null
  }

  /** Resize handles for a shape: endpoints for line/arrow, the bottom-right corner for text and counters
   *  (they scale uniformly), four corners for everything else. */
  handlesFor(shape: Shape): Array<{ id: Handle; x: number; y: number }> {
    if (shape.type === 'line' || shape.type === 'arrow') return [{ id: 'p1', x: shape.x1, y: shape.y1 }, { id: 'p2', x: shape.x2, y: shape.y2 }]
    const b = this.shapeBounds(shape)
    if (!b) return []
    if (shape.type === 'text' || shape.type === 'count') return [{ id: 'se', x: b.x + b.w, y: b.y + b.h }]
    return [{ id: 'nw', x: b.x, y: b.y }, { id: 'ne', x: b.x + b.w, y: b.y }, { id: 'sw', x: b.x, y: b.y + b.h }, { id: 'se', x: b.x + b.w, y: b.y + b.h }]
  }

  /** Grab tolerance in image px (scaled so it stays ~8 screen px whatever the zoom/fit). */
  hitTolerance(): number { return Math.max(6, 8 * this.uiScale) }

  /** Topmost shape under an image-space point (strokes are hit near the line, filled/boxed shapes inside). */
  hitShape(px: number, py: number): Shape | null {
    const tol = this.hitTolerance()
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const s = this.shapes[i]
      if (shapeContains(s, px, py, tol, this)) return s
    }
    return null
  }

  /** Which handle of the selected shape is under the point, if any. */
  hitHandle(px: number, py: number): Handle | null {
    if (!this.selected) return null
    const r = this.handleSize() / 2 + this.hitTolerance() / 2
    for (const h of this.handlesFor(this.selected)) if (Math.abs(px - h.x) <= r && Math.abs(py - h.y) <= r) return h.id
    return null
  }

  private handleSize(): number { return Math.max(8, 10 * this.uiScale) }

  private drawSelection(ctx: CanvasRenderingContext2D, shape: Shape): void {
    const b = this.shapeBounds(shape)
    if (!b) return
    const pad = Math.max(4, 5 * this.uiScale), lw = Math.max(1.5, 1.5 * this.uiScale)
    ctx.save()
    ctx.setLineDash?.([6 * this.uiScale, 4 * this.uiScale])
    ctx.lineWidth = lw + 2 * this.uiScale
    ctx.strokeStyle = 'rgba(255,255,255,.9)'
    ctx.strokeRect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2)
    ctx.lineWidth = lw
    ctx.strokeStyle = '#6366f1'
    ctx.strokeRect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2)
    ctx.setLineDash?.([])
    const hs = this.handleSize()
    for (const h of this.handlesFor(shape)) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(h.x - hs / 2, h.y - hs / 2, hs, hs)
      ctx.lineWidth = lw
      ctx.strokeStyle = '#6366f1'
      ctx.strokeRect(h.x - hs / 2, h.y - hs / 2, hs, hs)
    }
    ctx.restore()
  }

  addShape(shape: Shape): void {
    this.shapes.push(shape)
    this.redraw()
  }

  undo(): void {
    this.shapes.pop()
    this.redraw()
  }

  clearAll(): void {
    this.shapes.length = 0
    this.redraw()
  }

  redraw(): void {
    // Image may not be defined in non-browser environments (e.g., tests)
    if (typeof Image === 'undefined') return
    const ctx = this.canvas.getContext('2d')
    // Headless canvases (jsdom) return a null 2D context — nothing to paint, bail safely.
    if (!ctx) return
    // Repaint synchronously off the cached bitmap when it's already decoded (the common case after the
    // first load) so drag previews don't have to wait on an async image load.
    if (this.baseImg && this.baseImg.complete && this.baseImg.naturalWidth) {
      this.paint(ctx, this.baseImg)
      return
    }
    const img = new Image()
    img.onload = () => { this.baseImg = img; this.paint(ctx, img) }
    img.src = this.imageDataUrl
  }

  private paint(ctx: CanvasRenderingContext2D, img: HTMLImageElement, preview?: Shape | null): void {
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.drawImage(img, 0, 0)
    this.shapes.forEach(s => this.drawShape(ctx, s))
    if (preview) this.drawShape(ctx, preview)
    if (this.selected && this.shapes.includes(this.selected)) this.drawSelection(ctx, this.selected)
  }

  /** KLAVITYKLA-507: live rubber-band preview during a drag — base image + committed shapes + ONE
   *  provisional shape, WITHOUT mutating the shape history. Synchronous when the base bitmap has already
   *  decoded; otherwise falls back to a plain redraw (which will cache the bitmap for the next move). */
  drawPreview(preview: Shape): void {
    if (typeof Image === 'undefined') return
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return
    if (this.baseImg && this.baseImg.complete && this.baseImg.naturalWidth) {
      this.paint(ctx, this.baseImg, preview)
    } else {
      // Base not decoded yet — trigger a normal redraw (caches the bitmap). The next pointermove previews.
      this.redraw()
    }
  }

  /** Total extra width (px) of the contrasting halo relative to the colour stroke — split half each side,
   *  so it reads as a ~1-1.5px contrasting edge at the base weight and scales subtly for thick strokes. */
  private haloPad(lw: number): number {
    return Math.max(3, lw * 0.55)
  }

  /** Draw a stroked path TWICE: first a slightly-wider contrasting halo underneath, then the colour on top,
   *  so the mark stays visible on any background (incl. a white line on white). `buildPath` must (re)issue
   *  the path commands each call. */
  private strokeWithHalo(
    ctx: CanvasRenderingContext2D,
    color: string,
    lineWidth: number,
    buildPath: () => void,
  ): void {
    const halo = haloColor(color)
    // Halo pass — wider, contrasting, drawn first so it sits underneath the colour.
    ctx.lineWidth = lineWidth + this.haloPad(lineWidth)
    ctx.strokeStyle = halo
    buildPath()
    ctx.stroke()
    // Colour pass on top at the true weight.
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = color
    buildPath()
    ctx.stroke()
  }

  private drawShape(ctx: CanvasRenderingContext2D, shape: Shape): void {
    ctx.strokeStyle = shape.color
    ctx.fillStyle = shape.color
    ctx.lineWidth = this.computeLineWidth(shape)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (shape.type === 'pen') {
      const base = this.computeLineWidth(shape)
      this.strokeWithHalo(ctx, shape.color, base, () => {
        ctx.beginPath()
        shape.points.forEach((p, i) =>
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
        )
      })
    } else if (shape.type === 'rect') {
      const base = this.computeLineWidth(shape)
      // strokeRect (not a path) — draw the halo rect first, then the colour rect on top.
      ctx.lineWidth = base + this.haloPad(base)
      ctx.strokeStyle = haloColor(shape.color)
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h)
      ctx.lineWidth = base
      ctx.strokeStyle = shape.color
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h)
    } else if (shape.type === 'arrow') {
      // Arrows read poorly at the base stroke weight, so they draw ~1.7x thicker by default (the S/M/L/XL
      // stroke control still scales this via computeLineWidth). The head grows with the thicker shaft.
      const lw = this.computeLineWidth(shape) * 1.7
      const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1)
      const headLen = Math.max(16, lw * 4)
      this.strokeWithHalo(ctx, shape.color, lw, () => {
        ctx.beginPath()
        ctx.moveTo(shape.x1, shape.y1)
        ctx.lineTo(shape.x2, shape.y2)
        ctx.lineTo(
          shape.x2 - headLen * Math.cos(angle - Math.PI / 6),
          shape.y2 - headLen * Math.sin(angle - Math.PI / 6),
        )
        ctx.moveTo(shape.x2, shape.y2)
        ctx.lineTo(
          shape.x2 - headLen * Math.cos(angle + Math.PI / 6),
          shape.y2 - headLen * Math.sin(angle + Math.PI / 6),
        )
      })
    } else if (shape.type === 'line') {
      // Lines also default thicker (parity with arrows) so they read clearly; still scaled by the stroke control.
      const lw = this.computeLineWidth(shape) * 1.7
      this.strokeWithHalo(ctx, shape.color, lw, () => {
        ctx.beginPath()
        ctx.moveTo(shape.x1, shape.y1)
        ctx.lineTo(shape.x2, shape.y2)
      })
    } else if (shape.type === 'circle') {
      const base = this.computeLineWidth(shape)
      this.strokeWithHalo(ctx, shape.color, base, () => {
        ctx.beginPath()
        ctx.ellipse(shape.x, shape.y, Math.abs(shape.rx), Math.abs(shape.ry), 0, 0, Math.PI * 2)
      })
    } else if (shape.type === 'count') {
      const r = this.countRadius(shape)
      ctx.beginPath()
      ctx.arc(shape.x, shape.y, r, 0, Math.PI * 2)
      ctx.fill()
      // Contrasting ring so the badge reads even on a same-colour background (halo-under approach).
      ctx.lineWidth = this.haloPad(this.computeLineWidth(shape))
      ctx.strokeStyle = haloColor(shape.color)
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.round(r * 1.05)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(shape.n), shape.x, shape.y)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    } else if (shape.type === 'text') {
      const { x, y, size, maxW } = this.textAnchor(shape, ctx)
      ctx.font = `bold ${size}px sans-serif`
      // KLAVITYKLA-508: draw from the TOP-LEFT (matching the editing <input>'s top-left anchor) instead of
      // the default alphabetic baseline — otherwise committed text sat ~one line-height above the box.
      ctx.textBaseline = 'top'
      // KLA-770: WRAP long text to the image's right edge and step down per line so it never overflows the
      // canvas bounds; the anchor is clamped inside the image (see textAnchor) so moved text stays visible.
      // Guard measureText (some stubbed/headless contexts lack it or return no width) → treat as 0 so text
      // stays on one line per paragraph rather than throwing.
      const lines = wrapTextLines((s) => safeMeasure(ctx, s), shape.text, maxW)
      const lineHeight = size * 1.25
      const outline = shape.outline ?? 'none'
      lines.forEach((ln, i) => {
        const ly = y + i * lineHeight
        if (outline !== 'none') {
          ctx.lineJoin = 'round'
          ctx.lineWidth = Math.max(3, size * 0.18)
          ctx.strokeStyle = outline === 'white' ? '#ffffff' : '#111111'
          ctx.strokeText(ln, x, ly)
        }
        ctx.fillStyle = shape.color
        ctx.fillText(ln, x, ly)
      })
      ctx.textBaseline = 'alphabetic'
    } else if (shape.type === 'pixelate') {
      this.drawPixelate(ctx, shape)
    }
  }

  /** Redaction: replace the pixels inside the region with a coarse mosaic (block-averaged colours). Reads
   *  back what's already painted (base image + any earlier shapes) so the redaction bakes into save()/export.
   *  No-ops safely on headless/tainted canvases (getImageData throws) — the region just isn't redacted. */
  private drawPixelate(ctx: CanvasRenderingContext2D, shape: { x: number; y: number; w: number; h: number }): void {
    const x = Math.max(0, Math.floor(Math.min(shape.x, shape.x + shape.w)))
    const y = Math.max(0, Math.floor(Math.min(shape.y, shape.y + shape.h)))
    const w = Math.min(this.canvas.width - x, Math.ceil(Math.abs(shape.w)))
    const h = Math.min(this.canvas.height - y, Math.ceil(Math.abs(shape.h)))
    if (w <= 0 || h <= 0) return
    // Mosaic block size scales with the image so it looks consistent across resolutions (min 8px).
    const block = Math.max(8, Math.round(this.canvas.width / 90))
    let data: ImageData | undefined
    try {
      data = ctx.getImageData(x, y, w, h)
    } catch {
      data = undefined // tainted canvas
    }
    if (!data || !data.data) {
      // Tainted/headless canvas (or a stubbed context) — fall back to an opaque block so nothing leaks.
      ctx.fillStyle = 'rgba(30,30,40,1)'
      ctx.fillRect(x, y, w, h)
      return
    }
    const px = data.data
    for (let by = 0; by < h; by += block) {
      for (let bx = 0; bx < w; bx += block) {
        let r = 0, g = 0, b = 0, count = 0
        const maxY = Math.min(by + block, h), maxX = Math.min(bx + block, w)
        for (let yy = by; yy < maxY; yy++) {
          for (let xx = bx; xx < maxX; xx++) {
            const i = (yy * w + xx) * 4
            r += px[i]; g += px[i + 1]; b += px[i + 2]; count++
          }
        }
        if (!count) continue
        ctx.fillStyle = `rgb(${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)})`
        ctx.fillRect(x + bx, y + by, maxX - bx, maxY - by)
      }
    }
  }

  /** KLA-770: the clamped top-left anchor + wrap width for a text shape. The anchor is kept inside the image
   *  (so a dragged label can't be parked off-canvas) and `maxW` is the room from the anchor to the right edge
   *  (so long text wraps rather than spilling past the bounds). Shared by drawShape + textBounds so the
   *  rendered glyphs and the hit-test box always agree. */
  private textAnchor(shape: Extract<Shape, { type: 'text' }>, ctx?: CanvasRenderingContext2D | null): { x: number; y: number; size: number; maxW: number } {
    const size = shape.size ?? this.computeFontSize()
    const pad = Math.max(2, size * 0.15)
    const x = Math.max(pad, Math.min(shape.x, Math.max(pad, this.canvas.width - pad)))
    // Room from the anchor to the right edge. NO `size` floor — forcing a minimum width could push a glyph
    // past the right bound; instead the text wraps (even to a narrow column) so it never spills horizontally.
    const maxW = Math.max(1, this.canvas.width - x - pad)
    // KLA-770: clamp `y` against the FULL wrapped block height, not one line — otherwise a multi-line label
    // (or a large one) near the bottom spills below the canvas. Measure line count when a 2D context is
    // available; fall back to a single line in headless/stubbed contexts.
    const lineHeight = size * 1.25
    let lineCount = 1
    if (ctx && typeof ctx.measureText === 'function') {
      ctx.font = `bold ${size}px sans-serif`
      lineCount = Math.max(1, wrapTextLines((s) => safeMeasure(ctx, s), shape.text, maxW).length)
    }
    const blockH = lineCount * lineHeight
    const y = Math.max(0, Math.min(shape.y, Math.max(0, this.canvas.height - blockH)))
    return { x, y, size, maxW }
  }

  /** KLA-770: the image-pixel bounding box of a committed text shape (accounting for the clamp + wrap), used
   *  by the inline annotator to hit-test a click for drag/resize. Returns null for non-text shapes or when no
   *  2D context is available (headless envs). */
  textBounds(shape: Shape): { x: number; y: number; w: number; h: number } | null {
    if (shape.type !== 'text') return null
    const ctx = this.canvas.getContext('2d')
    if (!ctx || typeof ctx.measureText !== 'function') return null
    const { x, y, size, maxW } = this.textAnchor(shape, ctx)
    ctx.font = `bold ${size}px sans-serif`
    const lines = wrapTextLines((s) => safeMeasure(ctx, s), shape.text, maxW)
    let w = 0
    for (const ln of lines) w = Math.max(w, safeMeasure(ctx, ln))
    const lineHeight = size * 1.25
    // Clamp the hit-box to the canvas so it can't extend past the (clamped) render bounds — the min-size
    // floor keeps a tiny label grabbable, but never at the cost of a box hanging off the right/bottom edge.
    const boxW = Math.min(Math.max(size, w), Math.max(1, this.canvas.width - x))
    const boxH = Math.min(Math.max(lineHeight, lines.length * lineHeight), Math.max(1, this.canvas.height - y))
    return { x, y, w: boxW, h: boxH }
  }

  async save(): Promise<string> {
    const png = this.canvas.toDataURL('image/png')
    if (png.length > 5 * 1024 * 1024) {
      return this.canvas.toDataURL('image/jpeg', 0.85)
    }
    return png
  }
}

/** Extract all typed text strings from an array of shapes. */
export function extractAnnotationTexts(shapes?: Shape[] | null): string[] {
  if (!Array.isArray(shapes)) return []
  const texts: string[] = []
  for (const s of shapes) {
    if (s && s.type === 'text' && typeof s.text === 'string' && s.text.trim()) {
      texts.push(s.text.trim())
    }
  }
  return texts
}

/** Render drawn shapes onto a screenshot dataURL using an offscreen canvas.
 *  Returns the flattened annotated image dataURL (PNG/JPEG), or baseDataUrl if no shapes or in non-browser envs. */
export async function renderAnnotatedImage(
  baseDataUrl: string,
  shapes?: Shape[] | null,
  width?: number,
  height?: number,
): Promise<string> {
  if (!baseDataUrl || !baseDataUrl.startsWith('data:image/')) return baseDataUrl || ''
  if (!Array.isArray(shapes) || shapes.length === 0) return baseDataUrl
  if (typeof document === 'undefined' || typeof Image === 'undefined') return baseDataUrl

  return new Promise<string>((resolve) => {
    try {
      const img = new Image()
      img.onload = () => {
        try {
          const w = img.naturalWidth || width || 1
          const h = img.naturalHeight || height || 1
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) { resolve(baseDataUrl); return }

          const annotator = new Annotator(canvas, baseDataUrl)
          shapes.forEach((s) => annotator.shapes.push({ ...s }))
          ctx.drawImage(img, 0, 0)
          annotator.redraw()

          annotator.save().then((res) => {
            resolve(res || baseDataUrl)
          }).catch(() => {
            try {
              resolve(canvas.toDataURL('image/png') || baseDataUrl)
            } catch {
              resolve(baseDataUrl)
            }
          })
        } catch {
          resolve(baseDataUrl)
        }
      }
      img.onerror = () => resolve(baseDataUrl)
      img.src = baseDataUrl
    } catch {
      resolve(baseDataUrl)
    }
  })
}
