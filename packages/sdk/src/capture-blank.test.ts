// @vitest-environment jsdom
// KLAVITYKLA-460: the blank/white first-capture that made Snap "not usable" on PX4/Charantra. The DOM
// renderer (modern-screenshot domToPng) returns a blank/white PNG when it fires before the page settles
// (fonts/images not decoded). These tests cover the two-part fix in capture.ts:
//   1. settleForCapture() awaits document.fonts.ready (skipped when already loaded → normal pages stay fast),
//   2. safeToPngWithScale() detects a blank result and retries the DOM render ONCE, flagging a still-blank
//      result so the widget can fall back to the sharp getDisplayMedia path instead of seeding an empty PNG.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("modern-screenshot", () => ({ domToPng: vi.fn() }))
import { domToPng } from "modern-screenshot"
import { isBlankCapture, settleForCapture, safeToPngWithScale, safeToPngWithQuality } from "./capture"

const mock = domToPng as unknown as ReturnType<typeof vi.fn>

// A blank/uniform PNG compresses to a handful of bytes; a real screenshot is many KB. We model that with
// payload length: BLANK stays under the 1KB detection threshold, GOOD is comfortably above it.
const BLANK_PNG = "data:image/png;base64,AAAA"
const GOOD_PNG = "data:image/png;base64," + "A".repeat(4000) // ~3KB payload → not blank

beforeEach(() => { mock.mockReset() })

describe("isBlankCapture (KLAVITYKLA-460 blank detection)", () => {
  it("flags a tiny/uniform PNG as blank", async () => {
    expect(await isBlankCapture(BLANK_PNG)).toBe(true)
  })
  it("flags a non-PNG / empty result as blank (never trust it)", async () => {
    expect(await isBlankCapture("")).toBe(true)
    expect(await isBlankCapture("data:image/svg+xml,foo")).toBe(true)
  })
  it("does NOT flag a large content-ful PNG as blank", async () => {
    expect(await isBlankCapture(GOOD_PNG)).toBe(false)
  })
})

describe("settleForCapture (KLAVITYKLA-460 settle before capture)", () => {
  const setFonts = (value: unknown) =>
    Object.defineProperty(document, "fonts", { configurable: true, value })
  afterEach(() => { try { setFonts(undefined) } catch { /* noop */ } })

  it("awaits document.fonts.ready when fonts are still loading", async () => {
    let awaited = false
    // A thenable whose .then() records that settle consumed fonts.ready.
    const ready = { then: (onF: () => void) => { awaited = true; return Promise.resolve().then(onF) } }
    setFonts({ status: "loading", ready })
    await settleForCapture(document.body, 600)
    expect(awaited).toBe(true)
  })

  it("SKIPS the fonts wait when fonts are already loaded (keeps normal pages fast)", async () => {
    let awaited = false
    const ready = { then: (onF: () => void) => { awaited = true; return Promise.resolve().then(onF) } }
    setFonts({ status: "loaded", ready })
    const t0 = Date.now()
    await settleForCapture(document.body, 600)
    expect(awaited).toBe(false)          // already loaded → never awaited
    expect(Date.now() - t0).toBeLessThan(400) // and it returned fast, well under the budget
  })

  it("never hangs past its budget even if fonts.ready never resolves", async () => {
    setFonts({ status: "loading", ready: new Promise<void>(() => { /* never resolves */ }) })
    const t0 = Date.now()
    await settleForCapture(document.body, 120)
    expect(Date.now() - t0).toBeLessThan(600) // bounded by the ~120ms budget, not stuck forever
  })
})

describe("safeToPngWithScale blank-retry (KLAVITYKLA-460)", () => {
  it("returns a normal (non-blank) render as-is, without retrying", async () => {
    mock.mockResolvedValue(GOOD_PNG)
    const out = await safeToPngWithScale(document.createElement("div"))
    expect(mock).toHaveBeenCalledTimes(1) // no retry on a good first render
    expect(out.dataUrl).toBe(GOOD_PNG)
    expect(out.quality).toBe("rendered")
    expect(out.blank).toBe(false)
  })

  it("retries the DOM render ONCE when the first shot is blank, and keeps the non-blank retry", async () => {
    mock.mockResolvedValueOnce(BLANK_PNG).mockResolvedValueOnce(GOOD_PNG)
    const out = await safeToPngWithScale(document.createElement("div"))
    expect(mock).toHaveBeenCalledTimes(2) // blank → one retry after a longer settle
    expect(out.dataUrl).toBe(GOOD_PNG)
    expect(out.blank).toBe(false)
  })

  it("flags blank=true (never throws) when the render is blank even after the retry", async () => {
    mock.mockResolvedValue(BLANK_PNG)
    const out = await safeToPngWithScale(document.createElement("div"))
    expect(mock).toHaveBeenCalledTimes(2) // first + one retry, both blank
    expect(out.dataUrl.startsWith("data:image/png")).toBe(true)
    expect(out.blank).toBe(true) // surfaced so the widget can fall back to the sharp getDisplayMedia path
  })

  it("safeToPngWithQuality threads the blank flag through", async () => {
    mock.mockResolvedValue(BLANK_PNG)
    const out = await safeToPngWithQuality(document.createElement("section"))
    expect(out.blank).toBe(true)
    expect(out.quality).toBe("rendered")
  })
})
