// @vitest-environment jsdom
// KLA composer-polish batch: locks in three composer UI fixes —
//  1. the Bug/Feature toggle renders BOTH glyphs (the Bug icon svg is present in the Bug button, in the
//     active and inactive states) — the earlier bug was the active chip painting the glyph the same accent
//     colour as its background so it read as "missing".
//  2. Voice moved from a full-width capture-grid button to a small circular mic (.kl-voice-circle) that is
//     NOT inside the capture grid, keeps id #klavity-voice + the mic glyph + an accessible label.

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

describe("Bug/Feature toggle renders both icons (composer-polish item 1)", () => {
  it("the Bug button contains an svg glyph (icon('bug') rendered), even when Bug is the active chip", () => {
    buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    const bugBtn = shadow.querySelector(".klavity-toggle .bug") as HTMLButtonElement
    expect(bugBtn).not.toBeNull()
    // Bug is the active chip by default when initialType is 'bug'.
    expect(bugBtn.classList.contains("active")).toBe(true)
    // The icon span holds a real svg (the bug glyph), not empty markup.
    const ic = bugBtn.querySelector(".kl-cap-ic svg")
    expect(ic).not.toBeNull()
    // The bug glyph has multiple path segments (the beetle body/legs) — a smoke check that the real icon
    // rendered rather than a placeholder.
    expect(bugBtn.querySelectorAll(".kl-cap-ic svg path").length).toBeGreaterThan(3)
  })

  it("the Feature button also renders its (lightbulb) glyph", () => {
    buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    const featBtn = shadow.querySelector(".klavity-toggle .feat") as HTMLButtonElement
    expect(featBtn).not.toBeNull()
    expect(featBtn.querySelector(".kl-cap-ic svg")).not.toBeNull()
  })

  it("the Bug glyph is still present when Feature is the active chip (bug now inactive)", () => {
    buildModal("feature", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    const bugBtn = shadow.querySelector(".klavity-toggle .bug") as HTMLButtonElement
    expect(bugBtn.classList.contains("active")).toBe(false)
    expect(bugBtn.querySelector(".kl-cap-ic svg")).not.toBeNull()
  })
})

describe("Voice as a small circle (composer-polish item 4)", () => {
  // Force voice support on in jsdom: the server STT engine needs MediaRecorder + getUserMedia present, plus
  // an onDictate endpoint. Stub the browser globals so pickDictationMode resolves to 'server'.
  beforeEach(() => {
    ;(globalThis as any).MediaRecorder = class {}
    ;(navigator as any).mediaDevices = { ...(navigator as any).mediaDevices, getUserMedia: () => Promise.resolve({}) }
  })

  it("renders a circular Voice mic OUTSIDE the capture grid, with the mic glyph and an accessible label", () => {
    // onDictate forces voice support on (server STT engine) so the button renders in jsdom.
    buildModal("bug", { ...baseCallbacks(), onDictate: vi.fn() } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    const voice = shadow.getElementById("klavity-voice") as HTMLButtonElement | null
    expect(voice).not.toBeNull()
    // Circular style hook + not inside the capture actions grid anymore.
    expect(voice!.classList.contains("kl-voice-circle")).toBe(true)
    expect(voice!.closest(".klavity-actions")).toBeNull()
    // Accessible name preserved.
    expect(voice!.getAttribute("aria-label") || "").toMatch(/voice/i)
    // Mic glyph still present (functionality wiring keys off the same id).
    expect(voice!.querySelector(".kl-cap-ic svg")).not.toBeNull()
  })

  it("no full-width Voice button remains in the capture grid", () => {
    buildModal("bug", { ...baseCallbacks(), onDictate: vi.fn() } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    const gridButtons = Array.from(shadow.querySelectorAll(".klavity-actions button")) as HTMLButtonElement[]
    expect(gridButtons.some((b) => b.id === "klavity-voice")).toBe(false)
    // The old label text is gone too.
    expect(shadow.querySelector(".kl-voice-label")).toBeNull()
  })
})
