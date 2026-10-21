// @vitest-environment jsdom
// KD-232: a page that leaves <html>/<body> unstyled rendered as a TRANSPARENT PNG (the browser's default
// white canvas isn't a CSS background), which showed as a black screen with black text on the composer's
// dark editor. safeToPngWithScale must always hand the renderer an opaque page background.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("modern-screenshot", () => ({ domToPng: vi.fn() }))
import { domToPng } from "modern-screenshot"
import { safeToPngWithScale, pageBackgroundColor } from "./capture"

const mock = domToPng as unknown as ReturnType<typeof vi.fn>
const GOOD_PNG = "data:image/png;base64," + "A".repeat(4000)

beforeEach(() => { mock.mockReset(); mock.mockResolvedValue(GOOD_PNG) })
afterEach(() => {
  document.documentElement.style.background = ""
  document.body.style.background = ""
})

describe("capture page background (KD-232)", () => {
  it("defaults to opaque white when the page sets no background", async () => {
    expect(pageBackgroundColor()).toBe("#ffffff")
    await safeToPngWithScale(document.body)
    expect((mock.mock.calls[0][1] as { backgroundColor?: string }).backgroundColor).toBe("#ffffff")
  })

  it("uses <body>'s background when <html> has none", async () => {
    document.body.style.background = "rgb(10, 20, 30)"
    await safeToPngWithScale(document.documentElement)
    expect((mock.mock.calls[0][1] as { backgroundColor?: string }).backgroundColor).toBe("rgb(10, 20, 30)")
  })

  it("prefers <html>'s background over <body>'s (CSS canvas propagation)", () => {
    document.documentElement.style.background = "rgb(1, 2, 3)"
    document.body.style.background = "rgb(10, 20, 30)"
    expect(pageBackgroundColor()).toBe("rgb(1, 2, 3)")
  })
})
