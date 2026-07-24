// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"

// Force the renderer to reject so we exercise the fetch-free wireframe fallback path (KLAVITYKLA-393).
vi.mock("modern-screenshot", () => ({
  domToPng: vi.fn(async () => { throw new Error("simulated renderer failure") }),
}))

import { safeToPngWithScale, safeToPngWithQuality } from "./capture"

describe("wireframe fallback on renderer failure", () => {
  it("safeToPngWithScale returns a PNG data URL tagged quality:'wireframe' when the renderer throws", async () => {
    const node = document.createElement("div")
    node.textContent = "some page content"
    document.body.appendChild(node)
    const out = await safeToPngWithScale(node)
    expect(out.quality).toBe("wireframe")
    expect(out.dataUrl.startsWith("data:image/png")).toBe(true)
    expect(typeof out.scale).toBe("number")
  })

  it("safeToPngWithQuality also degrades to a wireframe PNG (never hard-fails)", async () => {
    const node = document.createElement("section")
    const out = await safeToPngWithQuality(node)
    expect(out.quality).toBe("wireframe")
    expect(out.dataUrl.startsWith("data:image/png")).toBe(true)
  })
})
