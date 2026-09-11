// @vitest-environment jsdom
// KLA-830: a single Discard must truly discard. When the composer holds evidence (screenshot / recording /
// files), closing pops a confirm card ("Keep editing" / "Discard"). Clicking Discard must call onClose with
// reason 'discard' so the HOST destroys the saved evidence session instead of persisting it + re-showing the
// dock — which previously forced the reporter to discard twice. "Keep editing" must NOT close.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

function modalShadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.shadowRoot) return el.shadowRoot
  }
  throw new Error("no modal shadow root found")
}

beforeEach(() => { document.body.innerHTML = "" })

function openWithEvidence(onClose: (r?: string) => void) {
  const ctrl = buildModal(
    "bug",
    {
      onCaptureFull: async () => ({ dataUrl: "", quality: "rendered" as const }),
      onRegionCapture: async () => ({ dataUrl: "", quality: "rendered" as const }),
      onClose,
      onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
      // sessionMode-ish: no autoCapture; we seed a shot so hasEvidence() is true.
    } as any,
    { theme: "light" } as any,
  )
  // Seed a captured shot → hasEvidence() is now true, so a close attempt must confirm first.
  ctrl.addCapturedShot("data:image/png;base64,SHOT", "real-pixel")
  return ctrl
}

describe("KLA-830 single-action Discard", () => {
  it("clicking Discard in the confirm card closes with reason 'discard'", () => {
    const onClose = vi.fn()
    openWithEvidence(onClose)
    const root = modalShadow()

    // Click the X → confirm card appears (evidence present), onClose NOT yet called.
    ;(root.querySelector("#klavity-x") as HTMLElement).click()
    expect(onClose).not.toHaveBeenCalled()
    const discardBtn = root.querySelector("#kl-cc-discard") as HTMLElement | null
    expect(discardBtn).toBeTruthy()
    expect(root.querySelector("#kl-cc-keep")).toBeTruthy()

    // Click Discard → single, immediate close with the 'discard' reason.
    discardBtn!.click()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledWith("discard")
  })

  it("'Keep editing' dismisses the confirm without closing", () => {
    const onClose = vi.fn()
    openWithEvidence(onClose)
    const root = modalShadow()

    ;(root.querySelector("#klavity-x") as HTMLElement).click()
    ;(root.querySelector("#kl-cc-keep") as HTMLElement).click()
    expect(onClose).not.toHaveBeenCalled()
    // The confirm card is gone (dismissed), composer stays open.
    expect(root.querySelector("#kl-cc-discard")).toBeNull()
  })
})
