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

  computeLineWidth(): number {
    return Math.max(3, this.canvas.width / 400) * this.strokeScale
  }

  computeFontSize(): number {
    return Math.max(16, this.canvas.width / 60)
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
    ctx.lineWidth = this.computeLineWidth()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (shape.type === 'pen') {
      const base = this.computeLineWidth()
      this.strokeWithHalo(ctx, shape.color, base, () => {
        ctx.beginPath()
        shape.points.forEach((p, i) =>
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
        )
      })
    } else if (shape.type === 'rect') {
      const base = this.computeLineWidth()
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
      const lw = this.computeLineWidth() * 1.7
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
      const lw = this.computeLineWidth() * 1.7
      this.strokeWithHalo(ctx, shape.color, lw, () => {
        ctx.beginPath()
        ctx.moveTo(shape.x1, shape.y1)
        ctx.lineTo(shape.x2, shape.y2)
      })
    } else if (shape.type === 'circle') {
      const base = this.computeLineWidth()
      this.strokeWithHalo(ctx, shape.color, base, () => {
        ctx.beginPath()
        ctx.ellipse(shape.x, shape.y, Math.abs(shape.rx), Math.abs(shape.ry), 0, 0, Math.PI * 2)
      })
    } else if (shape.type === 'count') {
      const r = Math.max(13, this.computeFontSize())
      ctx.beginPath()
      ctx.arc(shape.x, shape.y, r, 0, Math.PI * 2)
      ctx.fill()
      // Contrasting ring so the badge reads even on a same-colour background (halo-under approach).
      ctx.lineWidth = this.haloPad(this.computeLineWidth())
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
