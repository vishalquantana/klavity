// @vitest-environment jsdom
// Out-of-memory fix for the composer's "Full Page" button fallback (DOM-render) path: onCaptureFull
// (widget.ts) used to call safeToPngWithQuality(document.body, { filter }) with NO explicit width/height,
// so a very tall page's unbounded natural height flowed straight into the renderer — which attempts to
// allocate its working canvas at that native size BEFORE ever shrinking to a safe max, spiking memory
// enough to OOM-crash the tab (a real browser OOM destroys the JS context, so no try/catch can save it).
// safeToPngFullPage already avoided this by pre-clamping via fullPageCaptureSize(); these tests prove
// safeToPngWithQuality's width/height options (the piece onCaptureFull now uses) actually reach the
// renderer call, mirroring capture-fallback.test.ts's domToPng-mock technique.
import { describe, it, expect, vi } from "vitest"

const domToPngCalls: any[] = []
vi.mock("modern-screenshot", () => ({
  domToPng: vi.fn(async (_node: any, opts: any) => { domToPngCalls.push(opts); return "data:image/png;base64,AAAA" }),
}))

import { safeToPngWithQuality, fullPageCaptureSize, MAX_FULLPAGE_CAPTURE_HEIGHT } from "./capture"

describe("KD-162-adjacent: full-page capture is size-clamped, never unbounded", () => {
  it("safeToPngWithQuality threads explicit width/height through to the renderer call", async () => {
    domToPngCalls.length = 0
    const node = document.createElement("div")
    await safeToPngWithQuality(node, { width: 1280, height: 4000 })
    // A static mocked PNG reads as "blank" (isBlankCapture) and triggers one settle+retry render — assert
    // every render attempt carried the explicit size, not just the first.
    expect(domToPngCalls.length).toBeGreaterThanOrEqual(1)
    for (const call of domToPngCalls) {
      expect(call.width).toBe(1280)
      expect(call.height).toBe(4000)
    }
  })

  it("omitting width/height (the OLD onCaptureFull behavior) leaves the renderer to measure the node itself", async () => {
    domToPngCalls.length = 0
    const node = document.createElement("div")
    await safeToPngWithQuality(node)
    expect(domToPngCalls[0].width).toBeUndefined()
    expect(domToPngCalls[0].height).toBeUndefined()
  })

  it("fullPageCaptureSize() never exceeds MAX_FULLPAGE_CAPTURE_HEIGHT regardless of a pathologically tall document", () => {
    const origDoc = document.documentElement
    Object.defineProperty(origDoc, "scrollHeight", { value: 500_000, configurable: true })
    try {
      const { height } = fullPageCaptureSize()
      expect(height).toBeLessThanOrEqual(MAX_FULLPAGE_CAPTURE_HEIGHT)
    } finally {
      Object.defineProperty(origDoc, "scrollHeight", { value: 0, configurable: true })
    }
  })
})
