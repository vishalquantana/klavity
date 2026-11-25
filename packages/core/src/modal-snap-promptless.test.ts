// @vitest-environment jsdom
// KD-988 (ext↔widget parity): the Chrome extension now wires the primary Snap button too. Its Snap is a
// captureVisibleTab full-page grab — real pixels with NO screen-share prompt — so the host passes
// snapWithoutSharePrompt:true and the composer must not promise a "share this tab" dialog that never comes:
//   1. the Snap tooltip drops the screen-share / "share this tab" copy,
//   2. hovering Snap shows the plain "what Snap does" tip, never the "click Allow" share-picker hint.
// Without the flag (the widget) both stay exactly as before.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

function modalShadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.shadowRoot) return el.shadowRoot
  }
  throw new Error("no modal shadow root found")
}

const callbacks = (extra: Record<string, unknown> = {}) => ({
  onCaptureFull: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "real-pixel" as const }),
  onCaptureSharp: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,SHARP", quality: "real-pixel" as const }),
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
  ...extra,
})

beforeEach(() => { document.body.innerHTML = "" })

describe("KD-988 prompt-less Snap (extension)", () => {
  it("snapWithoutSharePrompt: the Snap tooltip has no screen-share / share-this-tab copy", () => {
    buildModal("bug", callbacks({ snapWithoutSharePrompt: true }) as any, { theme: "light" } as any)
    const tip = modalShadow().getElementById("klavity-sharp-tip")!
    expect(tip.textContent).toContain("pixel-perfect")
    expect(tip.textContent).not.toMatch(/screen-share|share this tab/i)
  })

  it("snapWithoutSharePrompt: hovering Snap shows the plain tip, never the click-Allow share hint", () => {
    buildModal("bug", callbacks({ snapWithoutSharePrompt: true }) as any, { theme: "light" } as any)
    const shadow = modalShadow()
    shadow.getElementById("klavity-sharp")!.dispatchEvent(new Event("mouseenter"))
    expect(shadow.querySelector(".kl-float-tip")!.classList.contains("kl-show")).toBe(true)
    expect(shadow.querySelector(".kl-shp")!.classList.contains("kl-show")).toBe(false)
  })

  it("default (widget): the tooltip still explains the tab-share and hover shows the share hint", () => {
    buildModal("bug", callbacks() as any, { theme: "light" } as any)
    const shadow = modalShadow()
    expect(shadow.getElementById("klavity-sharp-tip")!.textContent).toMatch(/share this tab/i)
    shadow.getElementById("klavity-sharp")!.dispatchEvent(new Event("mouseenter"))
    expect(shadow.querySelector(".kl-shp")!.classList.contains("kl-show")).toBe(true)
  })
})
