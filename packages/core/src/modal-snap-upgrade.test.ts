// @vitest-environment jsdom
// KLA-612 / KLA-613: three composer UI fixes locked in here —
//   1. the primary Snap button's app-window icon is VISIBLE (white-on-accent), not purple-on-purple. The bug
//      was the generic `.kl-active .kl-cap-ic{color:var(--kl-accent)}` rule painting the glyph the same accent
//      colour as the Snap button's solid-accent background → invisible (same class as the "missing Bug icon").
//   2. the over-cap file notice renders a REAL "Request upgrade" control — a direct upgrade LINK for a
//      member/owner, an attributed REQUEST button (POSTs via onRequestUpgrade → "Request sent to your team")
//      for a guest/anon reporter, who is NEVER shown a payment link.
//   3. the voice recording state lives AT the control (red glow + stop glyph), NOT as a disconnected
//      "Recording — tap to stop" text row below the description.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

function modalShadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.shadowRoot) return el.shadowRoot
  }
  throw new Error("no modal shadow root found")
}
function styleText(shadow: ShadowRoot): string {
  return Array.from(shadow.querySelectorAll("style")).map((s) => s.textContent || "").join("\n")
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const baseCallbacks = () => ({
  onCaptureFull: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const }),
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
})

beforeEach(() => { document.body.innerHTML = "" })

// ── FIX 1: Snap button icon is visible ───────────────────────────────────────────────────────────────────
describe("KLA-612 Snap button icon is visible (white-on-accent, not purple-on-purple)", () => {
  const sharpCbs = () => ({
    ...baseCallbacks(),
    onCaptureSharp: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,SHARP", quality: "real-pixel" as const }),
  })

  it("renders the app-window glyph inside the Snap button", () => {
    buildModal("bug", sharpCbs() as any, { theme: "light" } as any)
    const shadow = modalShadow()
    const sharp = shadow.getElementById("klavity-sharp") as HTMLButtonElement
    expect(sharp).not.toBeNull()
    // The icon span holds a real svg (the app-window glyph), sitting next to the "Snap" label.
    const svg = sharp.querySelector(".kl-cap-ic svg")
    expect(svg).not.toBeNull()
    expect(sharp.querySelector(".kl-sharp-label")?.textContent).toBe("Snap")
  })

  it("pins the Snap icon colour to on-accent (visible) — NOT the accent colour of its own background", () => {
    buildModal("bug", sharpCbs() as any, { theme: "light" } as any)
    const css = styleText(modalShadow())
    // The fix: an ID-specificity rule making the glyph on-accent (white) on the solid-accent Snap button,
    // which overrides the generic `.kl-active .kl-cap-ic{color:var(--kl-accent)}` in both rest + active states.
    expect(css).toContain("#klavity-sharp .kl-cap-ic{color:var(--kl-on-accent)")
    // Guard the regression: the Snap icon must never be painted the accent colour (== its background).
    expect(css).not.toContain("#klavity-sharp .kl-cap-ic{color:var(--kl-accent)")
  })
})

// ── FIX 2: over-cap → real "Request upgrade" action ──────────────────────────────────────────────────────
describe("KLA-612 over-cap file → real Request-upgrade control", () => {
  function overCapFile(): File {
    const f = new File(["x"], "huge.pdf", { type: "application/pdf" })
    Object.defineProperty(f, "size", { value: 150 * 1024 * 1024 }) // 150MB > 100MB default cap
    return f
  }
  async function ingestOverCap(shadow: ShadowRoot) {
    const input = shadow.getElementById("klavity-file") as HTMLInputElement
    Object.defineProperty(input, "files", { value: [overCapFile()], configurable: true })
    input.dispatchEvent(new Event("change"))
    await wait(10)
  }

  it("a member/owner gets a DIRECT upgrade LINK (no request POST)", async () => {
    const onRequestUpgrade = vi.fn().mockResolvedValue(true)
    buildModal("bug", {
      ...baseCallbacks(), allowFileAttachments: true,
      reporterRole: "member", upgradeUrl: "https://app.example/settings/billing", onRequestUpgrade,
    } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    await ingestOverCap(shadow)
    const box = shadow.getElementById("klavity-capmsg") as HTMLElement
    expect(box.hidden).toBe(false)
    expect(box.textContent || "").toContain("100MB")
    const link = box.querySelector("a.kl-capmsg-cta") as HTMLAnchorElement
    expect(link).not.toBeNull()
    expect(link.href).toBe("https://app.example/settings/billing")
    expect(link.textContent).toBe("Request upgrade")
    // A member is a first-party payer → no request button, no POST.
    expect(box.querySelector("button.kl-capmsg-req")).toBeNull()
    expect(onRequestUpgrade).not.toHaveBeenCalled()
  })

  it("a guest/anon reporter gets a REQUEST button that POSTs — and is NEVER shown a payment link", async () => {
    const onRequestUpgrade = vi.fn().mockResolvedValue(true)
    buildModal("bug", {
      ...baseCallbacks(), allowFileAttachments: true,
      reporterRole: "guest", upgradeUrl: "https://app.example/settings/billing", onRequestUpgrade,
    } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    await ingestOverCap(shadow)
    const box = shadow.getElementById("klavity-capmsg") as HTMLElement
    expect(box.hidden).toBe(false)
    // NEVER a payment link for an anon/guest reporter (they are not asked to pay).
    expect(box.querySelector("a.kl-capmsg-cta")).toBeNull()
    const btn = box.querySelector("button.kl-capmsg-req") as HTMLButtonElement
    expect(btn).not.toBeNull()
    expect(btn.textContent).toBe("Request upgrade")
    // Click → POST an attributed request (reason + page + fileMeta context).
    btn.click()
    await wait(0)
    expect(onRequestUpgrade).toHaveBeenCalledTimes(1)
    const arg = onRequestUpgrade.mock.calls[0][0]
    expect(arg.reason).toBe("storage_over_cap")
    expect(arg.context.page).toBe("https://klavity.in/")
    expect(arg.context.fileMeta.name).toBe("huge.pdf")
    expect(arg.context.fileMeta.sizeMb).toBe(150)
    // On success the button swaps to a confirmation.
    await wait(0)
    expect(box.querySelector(".kl-capmsg-sent")?.textContent || "").toContain("Request sent to your team")
  })

  it("guest request FAILURE re-enables the button (never dead-ends the reporter)", async () => {
    const onRequestUpgrade = vi.fn().mockResolvedValue(false)
    buildModal("bug", {
      ...baseCallbacks(), allowFileAttachments: true, reporterRole: "anon", onRequestUpgrade,
    } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    await ingestOverCap(shadow)
    const box = shadow.getElementById("klavity-capmsg") as HTMLElement
    const btn = box.querySelector("button.kl-capmsg-req") as HTMLButtonElement
    btn.click()
    await wait(0); await wait(0)
    const btn2 = box.querySelector("button.kl-capmsg-req") as HTMLButtonElement
    expect(btn2).not.toBeNull()
    expect(btn2.disabled).toBe(false)
    expect(box.querySelector(".kl-capmsg-sent")).toBeNull()
  })

  it("without an onRequestUpgrade host callback (extension parity) the guest CTA degrades to a hint, no button", async () => {
    buildModal("bug", {
      ...baseCallbacks(), allowFileAttachments: true, reporterRole: "guest", // no onRequestUpgrade
    } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    await ingestOverCap(shadow)
    const box = shadow.getElementById("klavity-capmsg") as HTMLElement
    expect(box.querySelector("button.kl-capmsg-req")).toBeNull()
    expect(box.querySelector("a.kl-capmsg-cta")).toBeNull()
    expect(box.querySelector(".kl-capmsg-hint")?.textContent || "").toContain("attach a smaller file")
  })
})

// ── FIX 3: recording state AT the control, not a disconnected text row ────────────────────────────────────
describe("KLA-613 recording state lives at the control (glow + stop glyph), not a separate text row", () => {
  beforeEach(() => {
    ;(globalThis as any).MediaRecorder = class {}
    ;(navigator as any).mediaDevices = { ...(navigator as any).mediaDevices, getUserMedia: () => Promise.resolve({}) }
  })

  it("has a red glow/pulse rule on the recording control, reduced-motion safe", () => {
    buildModal("bug", { ...baseCallbacks(), onDictate: vi.fn() } as any, { theme: "light" } as any)
    const css = styleText(modalShadow())
    expect(css).toContain("kl-rec-glow")
    expect(css).toMatch(/#klavity-voice\.kl-voice-rec\{[^}]*animation:kl-rec-glow/)
    // reduced-motion disables the animation but keeps a static red ring.
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\{#klavity-voice\.kl-voice-rec\{animation:none/)
  })

  it("clicking record adds the glow/stop class to the control and renders NO 'Recording — tap to stop' text row", () => {
    buildModal("bug", { ...baseCallbacks(), onDictate: vi.fn() } as any, { theme: "light" } as any)
    const shadow = modalShadow()
    const voice = shadow.getElementById("klavity-voice") as HTMLButtonElement
    expect(voice).not.toBeNull()
    voice.click() // start recording
    // The CONTROL itself shows the recording state.
    expect(voice.classList.contains("kl-voice-rec")).toBe(true)
    expect(voice.getAttribute("aria-pressed")).toBe("true")
    expect(voice.getAttribute("aria-label")).toBe("Stop recording")
    // The separated status text row is NOT painted with the steady recording label.
    const status = shadow.getElementById("klavity-voice-status") as HTMLElement
    expect(status.hidden).toBe(true)
    expect(shadow.textContent || "").not.toContain("Recording — tap to stop")
  })
})
