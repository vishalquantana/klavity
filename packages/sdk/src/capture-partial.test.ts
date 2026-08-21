// @vitest-environment jsdom
// KLAVITYKLA-473: PARTIAL-white detection (follow-on to #460's fully-blank detection). A DOM render can
// come back with real content but with cross-origin images the renderer couldn't inline dropped to white
// gaps. capture.ts detects this IN THE BROWSER (renderer skip count + a cheap white-fraction canvas sample)
// so the widget can SUGGEST the sharp "Screen" capture — it NEVER auto-invokes getDisplayMedia (the #460
// regression that popped a surprise screen-share prompt on a plain "Report a bug" click).
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("modern-screenshot", () => ({ domToPng: vi.fn() }))
import { domToPng } from "modern-screenshot"
import { isPartialCapture, safeToPngWithScale, safeToPngWithQuality } from "./capture"

const mock = domToPng as unknown as ReturnType<typeof vi.fn>
const GOOD_PNG = "data:image/png;base64," + "A".repeat(4000) // ~3KB payload → not blank

beforeEach(() => { mock.mockReset() })

describe("isPartialCapture (KLAVITYKLA-473 detection)", () => {
  it("flags a capture that DROPPED cross-origin images (skip count > 0) as partial — the definite signal", async () => {
    expect(await isPartialCapture(GOOD_PNG, { skippedImages: 1 })).toBe(true)
    expect(await isPartialCapture(GOOD_PNG, { skippedImages: 5 })).toBe(true)
  })

  it("does NOT flag a clean capture (no skipped images) — a normal page is never nudged", async () => {
    // jsdom has no real 2D canvas → the white-fraction sample returns null → falls back to the skip verdict.
    expect(await isPartialCapture(GOOD_PNG, { skippedImages: 0 })).toBe(false)
    expect(await isPartialCapture(GOOD_PNG)).toBe(false)
  })
})

describe("safeToPngWithScale partial flag (KLAVITYKLA-473)", () => {
  it("a normal render is NOT partial and reports skippedImages: 0", async () => {
    mock.mockResolvedValue(GOOD_PNG)
    const out = await safeToPngWithScale(document.createElement("div"))
    expect(out.partial).toBe(false)
    expect(out.skippedImages).toBe(0)
    expect(out.dataUrl).toBe(GOOD_PNG)
  })

  it("safeToPngWithQuality threads the partial flag through (alongside blank/quality)", async () => {
    mock.mockResolvedValue(GOOD_PNG)
    const out = await safeToPngWithQuality(document.createElement("section"))
    expect(out.partial).toBe(false)
    expect(out.blank).toBe(false)
    expect(out.quality).toBe("rendered")
  })
})
