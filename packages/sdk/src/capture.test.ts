import { describe, it, expect } from "vitest"
import { isCrossOriginImageSrc, TRANSPARENT_PIXEL } from "./capture"

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
