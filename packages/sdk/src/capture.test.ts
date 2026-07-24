// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { isCrossOriginImageSrc, isUncapturable, TRANSPARENT_PIXEL } from "./capture"

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
