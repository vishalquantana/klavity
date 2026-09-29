// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
// Mock the DOM renderer so the full-page tests can assert the exact width/height requested of it without
// needing a real layout engine (jsdom does no layout). Pure helpers in this file don't touch domToPng.
vi.mock("modern-screenshot", () => ({
  domToPng: vi.fn(async () => "data:image/png;base64,AAAA"),
}))
import { domToPng } from "modern-screenshot"
import {
  isCrossOriginImageSrc,
  isUncapturable,
  TRANSPARENT_PIXEL,
  fullPageCaptureSize,
  safeToPngFullPage,
  safeToPngViewport,
  viewportCaptureSize,
  MAX_FULLPAGE_CAPTURE_HEIGHT,
} from "./capture"

describe("isCrossOriginImageSrc", () => {
  const ORIGIN = "https://bigidea.example.com"

  it("flags a cross-origin absolute src (the CSP/CORS-blocked case)", () => {
    // the exact bigidea repro: images served from a different origin
    expect(isCrossOriginImageSrc("https://del1.vultrobjects.com/bigidea/assets/img/x.png", ORIGIN)).toBe(true)
  })

  it("does NOT flag same-origin absolute src", () => {
    expect(isCrossOriginImageSrc("https://bigidea.example.com/assets/img/x.png", ORIGIN)).toBe(false)
  })

  it("does NOT flag relative src (resolves to same origin)", () => {
    expect(isCrossOriginImageSrc("/assets/img/x.png", ORIGIN)).toBe(false)
    expect(isCrossOriginImageSrc("img/x.png", ORIGIN)).toBe(false)
  })

  it("does NOT flag data: or blob: srcs (no fetch needed)", () => {
    expect(isCrossOriginImageSrc("data:image/png;base64,AAAA", ORIGIN)).toBe(false)
    expect(isCrossOriginImageSrc("blob:https://bigidea.example.com/abc", ORIGIN)).toBe(false)
  })

  it("treats empty/garbage src as not-cross-origin (don't skip on uncertainty)", () => {
    expect(isCrossOriginImageSrc("", ORIGIN)).toBe(false)
    expect(isCrossOriginImageSrc("::::", ORIGIN)).toBe(false)
  })

  it("a different port/scheme is cross-origin", () => {
    expect(isCrossOriginImageSrc("http://bigidea.example.com/x.png", ORIGIN)).toBe(true)   // scheme
    expect(isCrossOriginImageSrc("https://bigidea.example.com:8443/x.png", ORIGIN)).toBe(true) // port
  })

  it("exposes a valid data-URL placeholder", () => {
    expect(TRANSPARENT_PIXEL.startsWith("data:image/")).toBe(true)
  })
})

describe("isUncapturable (DOM prune, KLAVITYKLA-393)", () => {
  // Pin an on-canvas rect so the offscreen branch doesn't fire in jsdom (which returns an all-zero rect,
  // which would otherwise read as "off the page origin").
  const onCanvas = (el: HTMLElement): HTMLElement => {
    el.getBoundingClientRect = () => ({ left: 10, top: 10, right: 110, bottom: 60, width: 100, height: 50, x: 10, y: 10, toJSON: () => ({}) }) as DOMRect
    return el
  }

  it("prunes non-visual tags (script/style/noscript/template)", () => {
    for (const tag of ["script", "style", "noscript", "template"]) {
      expect(isUncapturable(document.createElement(tag))).toBe(true)
    }
  })

  it("prunes display:none and opacity:0 subtrees", () => {
    const none = onCanvas(document.createElement("div")); none.style.display = "none"
    const clear = onCanvas(document.createElement("div")); clear.style.opacity = "0"
    expect(isUncapturable(none)).toBe(true)
    expect(isUncapturable(clear)).toBe(true)
  })

  it("prunes a cross-origin iframe (its document can't be serialised)", () => {
    const frame = onCanvas(document.createElement("iframe")) as HTMLIFrameElement
    frame.src = "https://third-party.example.com/embed"
    expect(isUncapturable(frame)).toBe(true)
  })

  it("KEEPS a normal on-canvas element", () => {
    const div = onCanvas(document.createElement("div"))
    div.textContent = "visible content"
    expect(isUncapturable(div)).toBe(false)
  })

  it("KEEPS visibility:hidden (a descendant may set visibility:visible)", () => {
    const el = onCanvas(document.createElement("div")); el.style.visibility = "hidden"
    expect(isUncapturable(el)).toBe(false)
  })

  it("does not prune text/non-element nodes", () => {
    expect(isUncapturable(document.createTextNode("hi"))).toBe(false)
  })
})

describe("full-page live-review capture (KLAVITYKLA-404)", () => {
  const setScrollHeight = (el: HTMLElement, h: number) =>
    Object.defineProperty(el, "scrollHeight", { configurable: true, value: h })

  it("fullPageCaptureSize returns the full document scrollHeight, not the viewport height", () => {
    // App-shell repro: viewport is ~768px tall but the page scrolls to 5000px. The bug captured only the
    // viewport; the fix must report the full scrollHeight so the whole page renders.
    setScrollHeight(document.documentElement, 5000)
    setScrollHeight(document.body, 4800)
    const { width, height } = fullPageCaptureSize()
    expect(height).toBe(5000)
    expect(width).toBeGreaterThan(0)
  })

  it("fullPageCaptureSize clamps a very tall (infinite-scroll) page to the max", () => {
    setScrollHeight(document.documentElement, 100_000)
    expect(fullPageCaptureSize().height).toBe(MAX_FULLPAGE_CAPTURE_HEIGHT)
  })

  it("safeToPngFullPage requests the FULL page height from the renderer (not the viewport box)", async () => {
    setScrollHeight(document.documentElement, 5000)
    setScrollHeight(document.body, 4800)
    ;(domToPng as unknown as ReturnType<typeof vi.fn>).mockClear()
    const url = await safeToPngFullPage({ skipFonts: true })
    expect(url.startsWith("data:image/png")).toBe(true)
    const opts = (domToPng as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as { width?: number; height?: number }
    // The renderer is told to render the full 5000px document, NOT the node's viewport-sized bounding box.
    expect(opts.height).toBe(5000)
    expect(opts.width).toBeGreaterThan(0)
  })
})

describe("viewport-first capture — app-shell blank fix (founder P1, PX4)", () => {
  it("safeToPngViewport captures documentElement (<html>), NOT the collapsible document.body", async () => {
    // On app-shell layouts (display:flex; min-height:100vh with the real content in a scrolled inner child)
    // document.body's own box collapses to viewport height and renders blank/white; <html> holds the content.
    ;(domToPng as unknown as ReturnType<typeof vi.fn>).mockClear()
    await safeToPngViewport()
    const node = (domToPng as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(node).toBe(document.documentElement)
    expect(node).not.toBe(document.body)
  })

  it("safeToPngViewport requests the VIEWPORT box (not the whole page height)", async () => {
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 9000 })
    ;(domToPng as unknown as ReturnType<typeof vi.fn>).mockClear()
    await safeToPngViewport()
    const opts = (domToPng as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as { width?: number; height?: number }
    const vp = viewportCaptureSize()
    expect(opts.height).toBe(vp.height)
    expect(opts.height).not.toBe(9000) // NOT the full-page height — this is the above-the-fold slice
  })

  it("flags a blank/near-uniform render so the widget can steer to the sharp Screen capture", async () => {
    // A uniform PNG compresses to a handful of bytes (the mock returns a 4-byte payload) → isBlankCapture
    // true. safeToPngViewport surfaces `blank`, which the widget's withSharpSuggestion() maps to suggestSharp.
    ;(domToPng as unknown as ReturnType<typeof vi.fn>).mockClear()
    const { blank } = await safeToPngViewport()
    expect(blank).toBe(true)
  })
})
