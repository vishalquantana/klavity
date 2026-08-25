import type { Shape } from './types'

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

  private drawShape(ctx: CanvasRenderingContext2D, shape: Shape): void {
    ctx.strokeStyle = shape.color
    ctx.fillStyle = shape.color
    ctx.lineWidth = this.computeLineWidth()
    ctx.lineCap = 'round'

    if (shape.type === 'pen') {
      ctx.beginPath()
      shape.points.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
      )
      ctx.stroke()
    } else if (shape.type === 'rect') {
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h)
    } else if (shape.type === 'arrow') {
      // Arrows read poorly at the base stroke weight, so they draw ~1.7x thicker by default (the S/M/L/XL
      // stroke control still scales this via computeLineWidth). The head grows with the thicker shaft.
      const lw = this.computeLineWidth() * 1.7
      ctx.lineWidth = lw
      const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1)
      const headLen = Math.max(16, lw * 4)
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
      ctx.stroke()
    } else if (shape.type === 'line') {
      // Lines also default thicker (parity with arrows) so they read clearly; still scaled by the stroke control.
      ctx.lineWidth = this.computeLineWidth() * 1.7
      ctx.beginPath()
      ctx.moveTo(shape.x1, shape.y1)
      ctx.lineTo(shape.x2, shape.y2)
      ctx.stroke()
    } else if (shape.type === 'circle') {
      ctx.beginPath()
      ctx.ellipse(shape.x, shape.y, Math.abs(shape.rx), Math.abs(shape.ry), 0, 0, Math.PI * 2)
      ctx.stroke()
    } else if (shape.type === 'count') {
      const r = Math.max(13, this.computeFontSize())
      ctx.beginPath()
      ctx.arc(shape.x, shape.y, r, 0, Math.PI * 2)
      ctx.fill()
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
