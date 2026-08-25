// @vitest-environment jsdom
// KLA-592: verify safeToPngWithScale wires the font-embed + icon-blanking behaviour into the modern-screenshot
// render options (font.cssText, onCloneEachNode) and that the onCloneEachNode hook blanks an un-embeddable
// icon glyph on a cloned node without touching normal text.
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("modern-screenshot", () => ({ domToPng: vi.fn() }))
import { domToPng } from "modern-screenshot"
import { safeToPngWithScale } from "./capture"

const mock = domToPng as unknown as ReturnType<typeof vi.fn>
const GOOD_PNG = "data:image/png;base64," + "A".repeat(4000)

beforeEach(() => { mock.mockReset(); mock.mockResolvedValue(GOOD_PNG) })

describe("safeToPngWithScale font wiring (KLA-592)", () => {
  it("passes an onCloneEachNode hook and font:false when no @font-face is embeddable (jsdom has none)", async () => {
    await safeToPngWithScale(document.createElement("div"))
    const opts = mock.mock.calls[0][1] as { font: unknown; onCloneEachNode: (n: Node) => void }
    expect(opts.font).toBe(false)               // nothing embeddable → skip native re-fetch (no CSP spam)
    expect(typeof opts.onCloneEachNode).toBe("function")
  })

  it("skipFonts uses font:false and still passes the blanking hook", async () => {
    await safeToPngWithScale(document.createElement("div"), { skipFonts: true })
    const opts = mock.mock.calls[0][1] as { font: unknown; onCloneEachNode: unknown }
    expect(opts.font).toBe(false)
    expect(typeof opts.onCloneEachNode).toBe("function")
  })

  it("onCloneEachNode BLANKS an un-embeddable icon glyph but LEAVES normal text", async () => {
    await safeToPngWithScale(document.createElement("div"))
    const onClone = (mock.mock.calls[0][1] as { onCloneEachNode: (n: Node) => void }).onCloneEachNode

    const icon = document.createElement("span")
    icon.style.fontFamily = '"Material Icons"'
    icon.textContent = "circle_call"
    onClone(icon)
    expect(icon.textContent).toBe("") // leaked ligature blanked → clean empty slot

    const label = document.createElement("span")
    label.style.fontFamily = "Inter, sans-serif"
    label.textContent = "Call now"
    onClone(label)
    expect(label.textContent).toBe("Call now") // normal text untouched
  })
})
