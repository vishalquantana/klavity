// @vitest-environment jsdom
// KLA-587: real "Screen" capture (getDisplayMedia) is the RECOMMENDED default capture path. When the host
// wires onCaptureSharp (browsers that support getDisplayMedia), the composer must render the Screen button as
// the primary/recommended control — the visual + a11y steer toward it — while keeping Full Page as the neutral
// fallback. Screen still fires only on the button's user gesture (no auto permission prompt; see KLA-473).

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

function modalShadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.shadowRoot) return el.shadowRoot
  }
  throw new Error("no modal shadow root found")
}

const baseCallbacks = () => ({
  onCaptureFull: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const }),
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
})

beforeEach(() => { document.body.innerHTML = "" })

describe("Screen = recommended default capture (KLA-587)", () => {
  it("renders the Screen button as the primary/recommended control when onCaptureSharp is wired", () => {
    buildModal(
      "bug",
      { ...baseCallbacks(), onCaptureSharp: async () => ({ dataUrl: "data:image/png;base64,SHARP", quality: "real-pixel" as const }) } as any,
      { theme: "light" } as any,
    )
    const shadow = modalShadow()
    const sharp = shadow.getElementById("klavity-sharp") as HTMLButtonElement | null
    expect(sharp).not.toBeNull()
    // Primary styling hook + the visible "Recommended" cue + an explicit recommended a11y label.
    expect(sharp!.classList.contains("kl-cap-primary")).toBe(true)
    expect(sharp!.querySelector(".kl-rec-tag")?.textContent).toMatch(/recommended/i)
    expect(sharp!.getAttribute("aria-label") || "").toMatch(/recommended/i)
    // Full Page stays present as the fallback.
    expect(shadow.getElementById("klavity-full")).not.toBeNull()
  })

  it("omits the Screen button entirely when onCaptureSharp is not wired (e.g. iOS Safari)", () => {
    buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    expect(shadow.getElementById("klavity-sharp")).toBeNull()
    // Full Page is still there so the reporter can always capture something.
    expect(shadow.getElementById("klavity-full")).not.toBeNull()
  })

  it("clicking Screen invokes onCaptureSharp (the getDisplayMedia path fires on the user gesture)", async () => {
    const onCaptureSharp = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,SHARP", quality: "real-pixel" as const })
    buildModal("bug", { ...baseCallbacks(), onCaptureSharp } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    ;(shadow.getElementById("klavity-sharp") as HTMLButtonElement).click()
    await new Promise((r) => setTimeout(r, 20))
    expect(onCaptureSharp).toHaveBeenCalledTimes(1)
  })
})
