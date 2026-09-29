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

describe("KD-Snap-tab-permission: viewportCaptureSize must trust window dimensions, not the larger of two sources", () => {
  // Real bug: viewportCaptureSize() took Math.max(window.innerHeight, documentElement.clientHeight).
  // clientHeight is SUPPOSED to equal the viewport height for the root element, but on a quirks-mode
  // page (missing/invalid DOCTYPE — the widget is embedded on arbitrary THIRD-PARTY customer pages, it
  // cannot assume standards mode) or any layout where the root's client box isn't viewport-clamped,
  // clientHeight can report something close to the FULL CONTENT height instead. Math.max then always
  // picks that larger, wrong value — so "viewport capture" silently requests a full-page-sized render,
  // which is exactly what was reported as "Snap capturing the full page". fullPageCaptureSize()
  // correctly wants the LARGEST available height (to capture everything); viewportCaptureSize() must
  // do the opposite — trust window.innerHeight/innerWidth and only fall back to the document's client
  // box when the window dimension is truly unavailable (0), never take the larger of the two.
  const setClient = (el: HTMLElement, w: number, h: number) => {
    Object.defineProperty(el, "clientWidth", { configurable: true, value: w })
    Object.defineProperty(el, "clientHeight", { configurable: true, value: h })
  }

  it("uses window.innerHeight/innerWidth even when documentElement.clientHeight/clientWidth report a much larger (quirks-mode-like) value", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 })
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 })
    setClient(document.documentElement, 1280, 9000) // e.g. quirks mode: clientHeight ≈ full content height
    const { width, height } = viewportCaptureSize()
    expect(height).toBe(800)
    expect(width).toBe(1280)
  })

  it("still falls back to documentElement's client box when window dimensions are truly unavailable", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 0 })
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 0 })
    setClient(document.documentElement, 1024, 768)
    const { width, height } = viewportCaptureSize()
    expect(width).toBe(1024)
    expect(height).toBe(768)
  })
})

describe("KD-Snap-tab-permission: viewport capture reflects the CURRENT scroll position", () => {
  // Root cause (confirmed from modern-screenshot's own source): domToPng clones the DOM and renders it
  // from scroll position (0,0) by default — `restoreScrollPosition` (their name for "render scrolled
  // content as scrolled") defaults to FALSE. Without it, a viewport-sized render always shows the TOP of
  // the page, never wherever the reporter has actually scrolled to — which is what both the initial
  // on-open capture and the Snap button need, since they both call safeToPngViewport.
  it("safeToPngViewport enables restoreScrollPosition so the render reflects where the reporter has scrolled to", async () => {
    ;(domToPng as unknown as ReturnType<typeof vi.fn>).mockClear()
    await safeToPngViewport()
    const opts = (domToPng as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as { features?: unknown }
    expect(opts.features).toMatchObject({ restoreScrollPosition: true })
  })

  it("safeToPngFullPage does NOT enable restoreScrollPosition — the whole document must render top-to-bottom from its natural layout", async () => {
    ;(domToPng as unknown as ReturnType<typeof vi.fn>).mockClear()
    await safeToPngFullPage({ skipFonts: true })
    const opts = (domToPng as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as { features?: unknown }
    expect(opts.features).toBeUndefined()
  })
})
