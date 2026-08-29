// @vitest-environment jsdom
// KLA-556: the DEFAULT auto-captured screenshot when the composer opens must be JUST THE VIEWPORT
// (above-the-fold / what's visible), NOT the whole page. Full-page stays an explicit "Full Page" click.
// These tests lock in: with onCaptureViewport wired + autoCaptureOnOpen, the auto-open path fires exactly
// ONE viewport capture and does NOT invoke onCaptureFull; and clicking "Full Page" still invokes onCaptureFull.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

function modalShadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.shadowRoot) return el.shadowRoot
  }
  throw new Error("no modal shadow root found")
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

beforeEach(() => { document.body.innerHTML = "" })

describe("default viewport auto-capture (KLA-556)", () => {
  it("auto-open with onCaptureViewport wired: fires ONE viewport shot, never onCaptureFull", async () => {
    const onCaptureViewport = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,VIEWPORT", quality: "rendered" as const })
    const onCaptureFull = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const })

    buildModal(
      "bug",
      {
        onCaptureFull,
        onCaptureViewport,
        onRegionCapture: async () => ({ dataUrl: "", quality: "rendered" as const }),
        onClose: vi.fn(),
        onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
        autoCaptureOnOpen: true,
      } as any,
      { theme: "light" } as any,
    )
    modalShadow()

    // Auto-capture is scheduled via requestIdleCallback / rAF+setTimeout — give it time to run + resolve.
    await wait(120)

    expect(onCaptureViewport).toHaveBeenCalledTimes(1)
    // The critical invariant: the auto-open path must NOT swap in a full-page shot.
    expect(onCaptureFull).not.toHaveBeenCalled()
  })

  it("auto-open where the viewport render is BLANK: seeds NO white shot, shows the steer-to-Snap empty state", async () => {
    // A declined tab-share / unrenderable page → the DOM render comes back blank (white). The composer must
    // NOT seed that useless white image; it leaves the hero empty and swaps in copy steering to Snap.
    const onCaptureViewport = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,WHITE", quality: "rendered" as const, blank: true })
    const onCaptureFull = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const })

    buildModal(
      "bug",
      {
        onCaptureFull,
        onCaptureViewport,
        onCaptureSharp: vi.fn(),
        onRegionCapture: async () => ({ dataUrl: "", quality: "rendered" as const }),
        onClose: vi.fn(),
        onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
        autoCaptureOnOpen: true,
      } as any,
      { theme: "light" } as any,
    )
    const shadow = modalShadow()
    await wait(120)

    // No white thumbnail seeded into the strip…
    expect(shadow.querySelectorAll(".klavity-thumb").length).toBe(0)
    // …and the empty-state copy now steers the reporter to Snap.
    const empty = shadow.getElementById("klavity-hero-empty-txt")
    expect((empty?.textContent || "").toLowerCase()).toContain("snap")
  })

  it("auto-open with a NON-blank viewport render still seeds the shot (no false empty state)", async () => {
    const onCaptureViewport = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,REAL", quality: "rendered" as const, blank: false })

    buildModal(
      "bug",
      {
        onCaptureFull: vi.fn(),
        onCaptureViewport,
        onCaptureSharp: vi.fn(),
        onRegionCapture: async () => ({ dataUrl: "", quality: "rendered" as const }),
        onClose: vi.fn(),
        onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
        autoCaptureOnOpen: true,
      } as any,
      { theme: "light" } as any,
    )
    const shadow = modalShadow()
    await wait(120)

    expect(shadow.querySelectorAll(".klavity-thumb").length).toBe(1)
  })

  it("clicking Full Page still invokes onCaptureFull", async () => {
    const onCaptureViewport = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,VIEWPORT", quality: "rendered" as const })
    const onCaptureFull = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const })

    buildModal(
      "bug",
      {
        onCaptureFull,
        onCaptureViewport,
        onRegionCapture: async () => ({ dataUrl: "", quality: "rendered" as const }),
        onClose: vi.fn(),
        onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
        // no autoCaptureOnOpen — isolate the explicit Full Page click.
      } as any,
      { theme: "light" } as any,
    )
    const shadow = modalShadow()

    ;(shadow.getElementById("klavity-full") as HTMLButtonElement).click()
    // captureViewportThenFull awaits the viewport preview then runs the full render in the background.
    await wait(50)

    expect(onCaptureFull).toHaveBeenCalled()
  })
})
