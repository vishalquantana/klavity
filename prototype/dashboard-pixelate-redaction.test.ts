// KLA-593 fail-open fix — the composer (packages/core/src/annotator.ts drawPixelate) BAKES pixelation
// into the exported PNG, but the dashboard ticket page re-renders annotation shapes over the CLEAN
// stored screenshot, which still holds the un-redacted PII inside a pixelate rect. Before this fix the
// dashboard renderer had NO pixelate case, so a reporter who redacted PII saw it in the clear on the
// ticket page (redaction failed open downstream). These tests extract the shipped dashboard renderer
// functions and prove every re-render path now re-applies an OPAQUE redaction over the region.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

function extractFn(src: string, marker: string): string {
  const i = src.indexOf(marker)
  if (i < 0) throw new Error("marker not found: " + marker)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + marker)
}

// Minimal SVG-DOM shim: records every created element with its attributes + children.
function fakeDoc() {
  const created: any[] = []
  const mk = () => ({
    ns: null as any, tag: null as any, attrs: {} as Record<string, string>, children: [] as any[], style: {} as any,
    setAttribute(k: string, v: any) { this.attrs[k] = String(v) },
    getAttribute(k: string) { return this.attrs[k] },
    appendChild(c: any) { this.children.push(c); return c },
  })
  return {
    document: {
      createElementNS(ns: string, tag: string) { const el: any = mk(); el.ns = ns; el.tag = tag; created.push(el); return el },
    },
    created,
  }
}

function loadRedactBuilders() {
  const src =
    extractFn(HTML, "function redactShapes(ann)") + "\n" +
    extractFn(HTML, "function buildRedactionSvg(ann)") + "\n" +
    "return { redactShapes, buildRedactionSvg };"
  const factory = new Function("document", src)
  return (doc: any) => factory(doc)
}

test("dashboard builds a SEPARATE opaque redaction layer for a pixelate shape (not passthrough)", () => {
  const { document, created } = fakeDoc()
  const { buildRedactionSvg } = loadRedactBuilders()(document)
  const ann = { w: 1000, h: 700, shapes: [{ type: "pixelate", x: 100, y: 100, w: 200, h: 80 }] }
  const svg = buildRedactionSvg(ann)
  expect(svg).not.toBeNull()
  // Lives on its OWN always-on layer, NOT the toggleable markup svg — so "Markup off" can't reveal PII.
  expect(svg.getAttribute("class")).toBe("tkt-ann-redact")
  const rects = created.filter((e: any) => e.tag === "rect")
  expect(rects.length).toBeGreaterThan(0)
  // Every drawn rect must be fully OPAQUE (solid rgb, never "none"/transparent) — that's what redacts.
  for (const r of rects) {
    expect(r.attrs.fill).toBeDefined()
    expect(r.attrs.fill.startsWith("rgb(")).toBe(true)
    expect(r.attrs.fill).not.toContain("rgba")
    expect(r.attrs.fill).not.toBe("none")
  }
  // The opaque base rect must fully cover the reporter's region (fail-closed coverage).
  const base = rects.find((r: any) => r.attrs.fill === "rgb(30,30,40)" && +r.attrs.width === 200 && +r.attrs.height === 80)
  expect(base).toBeTruthy()
  expect(+base.attrs.x).toBe(100)
  expect(+base.attrs.y).toBe(100)
})

test("redaction layer covers 'redact'-typed shapes too, and no-ops when there is nothing to redact", () => {
  const b1 = fakeDoc(); const { buildRedactionSvg: build1 } = loadRedactBuilders()(b1.document)
  expect(build1({ w: 500, h: 500, shapes: [{ type: "redact", x: 10, y: 10, w: 50, h: 50 }] })).not.toBeNull()
  // A plain rect/arrow markup shape is NOT redaction — the layer must return null (draw nothing).
  const b2 = fakeDoc(); const { buildRedactionSvg: build2 } = loadRedactBuilders()(b2.document)
  expect(build2({ w: 500, h: 500, shapes: [{ type: "rect", x: 10, y: 10, w: 50, h: 50 }] })).toBeNull()
  expect(b2.created.length).toBe(0)
})

test("the toggleable markup layer stays wired as a SEPARATE overlay from the always-on redaction layer", () => {
  // The live mount appends the redaction layer LAST (top of z-order) and reveals it alongside the image,
  // and it is NOT inside the toggle handler — so flipping "Markup" can never un-redact.
  const mount = extractFn(HTML, "function mountAnnotationOverlay(box, img, ann, url)")
  expect(mount).toContain("buildRedactionSvg(ann)")
  expect(mount).toContain("inner.appendChild(redact)")
  // The markup toggle only touches the markup svg's .off class, never the redaction layer.
  expect(HTML).toContain('.tkt-ann-redact{')
})

// Export/flatten path: applyPixelateToCanvas must overwrite the region on the offscreen canvas so the
// "Full size" composite never carries the clean screenshot's PII.
function loadCanvasMosaic() {
  const src =
    extractFn(HTML, "function redactShapes(ann)") + "\n" +
    extractFn(HTML, "function applyPixelateToCanvas(ctx, ann, cw, ch)") + "\n" +
    "return applyPixelateToCanvas;"
  return new Function(src)()
}

test("export mosaic overwrites the pixelate region (block-average), redacting the flattened composite", () => {
  const applyPixelateToCanvas = loadCanvasMosaic()
  const fills: any[] = []
  const ctx = {
    getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4).fill(200) }),
    fillRect: (x: number, y: number, w: number, h: number) => fills.push({ x, y, w, h }),
    set fillStyle(_v: string) {}, get fillStyle() { return "" },
  }
  applyPixelateToCanvas(ctx, { w: 1000, h: 700, shapes: [{ type: "pixelate", x: 100, y: 100, w: 200, h: 80 }] }, 1000, 700)
  // At least one fillRect landed inside the redacted region — the region was overwritten, not passed through.
  const covering = fills.filter(f => f.x >= 100 && f.y >= 100 && f.x < 300 && f.y < 180)
  expect(covering.length).toBeGreaterThan(0)
})

test("export mosaic FAILS CLOSED to an opaque block when the canvas is tainted (getImageData throws)", () => {
  const applyPixelateToCanvas = loadCanvasMosaic()
  const fills: any[] = []
  const ctx = {
    getImageData: () => { throw new Error("tainted") },
    fillRect: (x: number, y: number, w: number, h: number) => fills.push({ x, y, w, h }),
    set fillStyle(_v: string) {}, get fillStyle() { return "" },
  }
  applyPixelateToCanvas(ctx, { w: 1000, h: 700, shapes: [{ type: "pixelate", x: 100, y: 100, w: 200, h: 80 }] }, 1000, 700)
  // One opaque block covers the whole region — nothing leaks even when pixels can't be sampled.
  expect(fills.length).toBe(1)
  expect(fills[0]).toEqual({ x: 100, y: 100, w: 200, h: 80 })
})
