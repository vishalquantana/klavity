// @vitest-environment jsdom
// KLA-587: the html-to-image DOM render can't capture a cross-origin iframe's pixels (the frame lives in a
// separate origin's document the renderer isn't allowed to read). Neither the blank nor the partial check
// flags it — the surrounding page renders fine. hasUncapturableEmbeds() detects a RENDERED, reasonably-sized
// cross-origin iframe so the composer steers the reporter to the real "Screen" (getDisplayMedia) capture.
import { describe, it, expect, beforeEach } from "vitest"
import { hasUncapturableEmbeds } from "./capture"

// jsdom has no layout → offsetWidth/getBoundingClientRect are 0, so sizing falls back to the width/height
// attributes. Set them to simulate a rendered (or tiny/hidden) frame.
function addIframe(src: string, w?: string, h?: string): HTMLIFrameElement {
  const f = document.createElement("iframe")
  f.setAttribute("src", src)
  if (w != null) f.setAttribute("width", w)
  if (h != null) f.setAttribute("height", h)
  document.body.appendChild(f)
  return f
}

beforeEach(() => { document.body.innerHTML = "" })

describe("hasUncapturableEmbeds (KLA-587)", () => {
  it("returns false with no iframes on the page", () => {
    expect(hasUncapturableEmbeds()).toBe(false)
  })

  it("flags a rendered, reasonably-sized cross-origin iframe", () => {
    addIframe("https://player.vimeo.com/video/123", "640", "360")
    expect(hasUncapturableEmbeds()).toBe(true)
  })

  it("does NOT flag a same-origin iframe (the renderer CAN read it)", () => {
    addIframe(location.origin + "/embed/local", "640", "360")
    expect(hasUncapturableEmbeds()).toBe(false)
  })

  it("does NOT flag a tiny cross-origin frame (a tracking/ad beacon, not content)", () => {
    addIframe("https://ads.example.com/px", "1", "1")
    expect(hasUncapturableEmbeds()).toBe(false)
  })

  it("does NOT flag about:/data:/blob: frames (no separate origin to miss)", () => {
    addIframe("about:blank", "640", "360")
    addIframe("data:text/html,<b>hi</b>", "640", "360")
    expect(hasUncapturableEmbeds()).toBe(false)
  })

  it("does NOT flag a cross-origin frame with no explicit size (treated as un-rendered here)", () => {
    addIframe("https://cross.example.com/thing")
    expect(hasUncapturableEmbeds()).toBe(false)
  })

  it("flags when ANY qualifying cross-origin frame is present among several", () => {
    addIframe(location.origin + "/ok", "500", "500")
    addIframe("https://ads.example.com/px", "1", "1")
    addIframe("https://widget.example.com/chat", "360", "480")
    expect(hasUncapturableEmbeds()).toBe(true)
  })
})
