// Image optimisation before upload (New ticket dialog + a ticket's "Add attachment"): big pictures are scaled down and re-encoded in
// the browser; small files, GIF/SVG/HEIC and videos are untouched; any failure returns the ORIGINAL file. The real helpers are
// extracted from public/dashboard.html and run against a fake createImageBitmap / canvas.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const line = (re: RegExp) => { const m = HTML.match(re); if (!m) throw new Error("line not found: " + re); return m[0] }
const SRC = [
  line(/^\s*const IMG_OPT_MIN_BYTES = .*$/m), line(/^\s*const IMG_OPT_JPEG_BYTES = .*$/m), line(/^\s*const IMG_OPT_MAX_WIDTH = .*$/m), line(/^\s*const IMG_OPT_QUALITY = .*$/m),
  extractFn(HTML, "function imgOptPlan("), extractFn(HTML, "function imgOptCandidate("), extractFn(HTML, "async function compressImageFile("),
].join("\n")

const KB = 1024, MB = 1024 * 1024
type Env = { bitmap?: any; throwBitmap?: boolean; noBitmap?: boolean; alphaPixels?: boolean; outBytes?: (w: number, h: number, type: string) => number }
function mk(env: Env = {}) {
  const log: any = { decodes: 0, canvases: [] as any[], filled: 0, qualities: [] as number[] }
  const doc = { createElement: (_: string) => {
    const c: any = { width: 0, height: 0 }; log.canvases.push(c)
    c.getContext = () => ({ fillStyle: "", fillRect: () => { log.filled++ }, drawImage: () => {},
      getImageData: () => { const d = new Uint8ClampedArray(64 * 64 * 4).fill(255); if (env.alphaPixels) d[3] = 0; return { data: d } } })
    c.toBlob = (cb: any, type: string, q: number) => { log.qualities.push(q); cb(new Blob([new Uint8Array((env.outBytes || ((w: number, h: number) => Math.round(w * h / 10)))(c.width, c.height, type))], { type })) }
    return c
  } }
  const cib = env.noBitmap ? undefined : async (_f: any) => { log.decodes++; if (env.throwBitmap) throw new Error("decode failed"); return { ...(env.bitmap || { width: 3000, height: 2000 }), close() {} } }
  const api = new Function("document", "createImageBitmap", "File", SRC + "\nreturn { imgOptPlan, imgOptCandidate, compressImageFile }")(doc, cib, File) as {
    imgOptPlan: (t: string, s: number, w: number, h: number, a: boolean) => any
    imgOptCandidate: (f: any) => boolean
    compressImageFile: (f: File) => Promise<File>
  }
  return { ...api, log }
}
const img = (name: string, type: string, size: number, lastModified = 12345) => new File([new Uint8Array(size)], name, { type, lastModified })

test("plan: a big wide PNG becomes a 2000px-wide JPEG (aspect ratio kept)", () => {
  const { imgOptPlan } = mk()
  expect(imgOptPlan("image/png", 3 * MB, 3000, 2000, false)).toEqual({ action: "reencode", w: 2000, h: 1333, type: "image/jpeg" })
})
test("plan: a PNG with real transparency stays PNG; a JPEG is never PNG", () => {
  const { imgOptPlan } = mk()
  expect(imgOptPlan("image/png", 3 * MB, 3000, 2000, true).type).toBe("image/png")
  expect(imgOptPlan("image/webp", 3 * MB, 3000, 2000, true).type).toBe("image/png")
  expect(imgOptPlan("image/jpeg", 3 * MB, 3000, 2000, true).type).toBe("image/jpeg")
})
test("plan: small files and moderately sized JPEGs are left alone; a big JPEG or any too-wide image is re-encoded", () => {
  const { imgOptPlan } = mk()
  expect(imgOptPlan("image/png", 100 * KB, 1200, 800, false).action).toBe("keep")
  expect(imgOptPlan("image/jpeg", 1 * MB, 1800, 1200, false).action).toBe("keep")
  expect(imgOptPlan("image/jpeg", 3 * MB, 1800, 1200, false)).toEqual({ action: "reencode", w: 1800, h: 1200, type: "image/jpeg" })   // big but not wide: re-encode, no resize
  expect(imgOptPlan("image/jpeg", 300 * KB, 4000, 3000, false).action).toBe("reencode")                                                  // wide → downscale even if small
})
test("plan: GIF (animation), SVG, HEIC, AVIF, video and unknown types are never touched", () => {
  const { imgOptPlan } = mk()
  for (const t of ["image/gif", "image/svg+xml", "image/heic", "image/avif", "video/mp4", "application/pdf", ""]) expect(imgOptPlan(t, 9 * MB, 4000, 3000, false).action).toBe("keep")
  expect(imgOptPlan("image/png", 3 * MB, 0, 0, false).action).toBe("keep")   // unknown dimensions
})

test("a big PNG is re-encoded to a smaller JPEG: .jpg name, image/jpeg, lastModified kept, canvas ≤ 2000 wide, quality 0.82, white matte", async () => {
  const { compressImageFile, log } = mk()
  const src = img("Screenshot 2026-10-07.png", "image/png", 4 * MB)
  const out = await compressImageFile(src)
  expect(out).not.toBe(src)
  expect(out.name).toBe("Screenshot 2026-10-07.jpg"); expect(out.type).toBe("image/jpeg"); expect(out.lastModified).toBe(12345)
  expect(out.size).toBeLessThan(src.size)
  const big = log.canvases[log.canvases.length - 1]
  expect(big.width).toBe(2000); expect(big.height).toBe(1333)
  expect(log.qualities).toEqual([0.82]); expect(log.filled).toBe(1)
})
test("a transparent PNG keeps its transparency: stays PNG with its own name, no white matte", async () => {
  const { compressImageFile, log } = mk({ alphaPixels: true })
  const out = await compressImageFile(img("logo.png", "image/png", 3 * MB))
  expect(out.type).toBe("image/png"); expect(out.name).toBe("logo.png"); expect(log.filled).toBe(0)
})
test("small images and non-images are returned untouched WITHOUT decoding", async () => {
  const { compressImageFile, log } = mk()
  const small = img("a.png", "image/png", 80 * KB), gif = img("a.gif", "image/gif", 6 * MB), vid = img("v.mp4", "video/mp4", 30 * MB), jpg = img("j.jpg", "image/jpeg", 900 * KB)
  for (const f of [small, gif, vid, jpg]) expect(await compressImageFile(f)).toBe(f)
  expect(log.decodes).toBe(0)
})
test("if the re-encoded result is not smaller, the ORIGINAL file is kept", async () => {
  const { compressImageFile } = mk({ outBytes: () => 9 * MB })
  const src = img("noisy.png", "image/png", 2 * MB)
  expect(await compressImageFile(src)).toBe(src)
})
test("any failure returns the original: decode error, no createImageBitmap, zero bitmap dimensions", async () => {
  const a = img("x.png", "image/png", 3 * MB)
  expect(await mk({ throwBitmap: true }).compressImageFile(a)).toBe(a)
  expect(await mk({ noBitmap: true }).compressImageFile(a)).toBe(a)
  expect(await mk({ bitmap: { width: 0, height: 0 } }).compressImageFile(a)).toBe(a)
})
test("candidate check is cheap and mirrors the thresholds (drives the 'Optimising images…' hint)", () => {
  const { imgOptCandidate } = mk()
  expect(imgOptCandidate(img("a.png", "image/png", 300 * KB))).toBe(true)
  expect(imgOptCandidate(img("a.png", "image/png", 100 * KB))).toBe(false)
  expect(imgOptCandidate(img("a.jpg", "image/jpeg", 2 * MB))).toBe(true)
  expect(imgOptCandidate(img("a.jpg", "image/jpeg", 1 * MB))).toBe(false)
  expect(imgOptCandidate(img("a.gif", "image/gif", 9 * MB))).toBe(false)
  expect(imgOptCandidate(null)).toBe(false)
})

// ── wiring (needs a full DOM, so pinned at the source level) ───────────────────────────────────────────────────────────
test("ticket detail picker optimises BEFORE planning/uploading, and shows a hint only when something will be optimised", () => {
  const i = HTML.indexOf('input.addEventListener("change", function () {', HTML.indexOf("function wireAttachments"))
  const seg = HTML.slice(i, i + 3000)
  expect(seg).toContain("imgOptCandidate"); expect(seg).toContain("Optimising images…")
  expect(seg.indexOf("compressImageFile")).toBeGreaterThan(seg.indexOf("var proceed = function"))   // proceed() = plan + upload, runs after
  expect(seg).toContain("attachPlanUpload(picked")
})
test("New ticket dialog copies the FileList first, optimises, then filters; a stale optimisation (dialog closed meanwhile) is dropped", () => {
  const seg = extractFn(HTML, "async function newTktAddFiles(")
  expect(seg.indexOf("Array.prototype.slice.call(list")).toBeLessThan(seg.indexOf("await"))
  expect(seg).toContain("compressImageFile"); expect(seg).toContain("gen !== _newTktGen")
  expect(seg.indexOf("compressImageFile")).toBeLessThan(seg.indexOf("newTktFilterFiles("))
  expect(extractFn(HTML, "function clearNewTktFiles(")).toContain("_newTktGen++")
})
