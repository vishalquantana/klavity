import type { Shape } from './types'

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
      const size = shape.size ?? this.computeFontSize()
      ctx.font = `bold ${size}px sans-serif`
      // KLAVITYKLA-508: draw from the TOP-LEFT (matching the editing <input>'s top-left anchor) instead of
      // the default alphabetic baseline — otherwise committed text sat ~one line-height above the box.
      ctx.textBaseline = 'top'
      const outline = shape.outline ?? 'none'
      if (outline !== 'none') {
        ctx.lineJoin = 'round'
        ctx.lineWidth = Math.max(3, size * 0.18)
        ctx.strokeStyle = outline === 'white' ? '#ffffff' : '#111111'
        ctx.strokeText(shape.text, shape.x, shape.y)
        ctx.fillStyle = shape.color
      }
      ctx.fillText(shape.text, shape.x, shape.y)
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

  async save(): Promise<string> {
    const png = this.canvas.toDataURL('image/png')
    if (png.length > 5 * 1024 * 1024) {
      return this.canvas.toDataURL('image/jpeg', 0.85)
    }
    return png
  }
}
