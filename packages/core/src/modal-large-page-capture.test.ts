// @vitest-environment jsdom
// KD-184: PX4's Objections list (721 rows, ~18.4k elements) opened the composer to an EMPTY black stage — the
// on-open auto-capture was skipped above 15k elements (KLAVITYKLA-506) with only the neutral "Capture or upload"
// copy, so it looked broken. Locks in: the rendered auto-capture now runs up to 30k elements; above that it is
// still skipped but the empty stage SAYS the page is too large and steers to Snap / Full Page; and the on-open
// Screen (getDisplayMedia, real pixels) default is never gated by DOM size.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function modalShadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.shadowRoot) return el.shadowRoot
  }
  throw new Error("no modal shadow root found")
}

// Pad the page to roughly `n` elements (the composer counts document.getElementsByTagName('*')).
function padDom(n: number) {
  const box = document.createElement("div")
  box.innerHTML = "<span></span>".repeat(n)
  document.body.appendChild(box)
}

const shot = (tag: string) => ({ dataUrl: "data:image/png;base64," + tag, quality: "rendered" as const })
const baseCallbacks = () => ({
  onCaptureFull: vi.fn().mockResolvedValue(shot("FULL")),
  onCaptureViewport: vi.fn().mockResolvedValue(shot("VIEWPORT")),
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
  autoCaptureOnOpen: true,
})
const emptyText = () => (modalShadow().getElementById("klavity-hero-empty-txt")?.textContent || "").toLowerCase()

beforeEach(() => { document.body.innerHTML = "" })

describe("auto-capture on large pages (KD-184)", () => {
  it("still auto-captures a page of ~18k elements (PX4 Objections list size)", async () => {
    padDom(18_000)
    const cbs = baseCallbacks()
    buildModal("bug", cbs as any, { theme: "light" } as any)
    await wait(150)
    expect(cbs.onCaptureViewport).toHaveBeenCalledTimes(1)
  })

  it("above the limit: skips the rendered capture but explains why and points to Full Page", async () => {
    padDom(31_000)
    const cbs = baseCallbacks()
    buildModal("bug", cbs as any, { theme: "light" } as any)
    await wait(150)
    expect(cbs.onCaptureViewport).not.toHaveBeenCalled()
    expect(cbs.onCaptureFull).not.toHaveBeenCalled()
    expect(emptyText()).toContain("too large")
    expect(emptyText()).toContain("full page")
  })

  it("above the limit: the on-open Snap (real pixels) still fires", async () => {
    padDom(31_000)
    const onCaptureSharpViewport = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,SHARP", quality: "real-pixel" as const })
    const cbs = { ...baseCallbacks(), screenCaptureDefault: true, onCaptureSharp: vi.fn(), onCaptureSharpViewport }
    buildModal("bug", cbs as any, { theme: "light" } as any)
    await wait(150)
    expect(onCaptureSharpViewport).toHaveBeenCalledTimes(1)
    expect(modalShadow().getElementById("klavity-hero-empty-txt")).toBeNull() // the Snap shot landed
  })

  it("above the limit: a declined Snap does NOT fall back to the heavy render — shows the large-page steer", async () => {
    padDom(31_000)
    const declined = Object.assign(new Error("Permission denied"), { name: "NotAllowedError" })
    const cbs = { ...baseCallbacks(), screenCaptureDefault: true, onCaptureSharp: vi.fn(), onCaptureSharpViewport: vi.fn().mockRejectedValue(declined) }
    buildModal("bug", cbs as any, { theme: "light" } as any)
    await wait(150)
    expect(cbs.onCaptureViewport).not.toHaveBeenCalled()
    expect(cbs.onCaptureFull).not.toHaveBeenCalled()
    expect(emptyText()).toContain("too large")
    expect(emptyText()).toContain("snap")
  })
})
