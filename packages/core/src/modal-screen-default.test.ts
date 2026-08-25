// @vitest-environment jsdom
// KLA-587: real "Screen" capture (getDisplayMedia) is the ACTUAL default capture path. When the host wires
// onCaptureSharp + screenCaptureDefault (browsers that support getDisplayMedia), the composer (a) renders the
// Screen button as the primary/recommended control, and (b) FIRES the Screen capture as the on-open default,
// silently falling back to the rendered viewport capture on decline/lost-gesture. iOS Safari (no
// getDisplayMedia) leaves the rendered viewport as the default.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal, defaultCaptureMode, isScreenDeclineError } from "./modal"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

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
  it("renders the primary 'Snap' capture button (no RECOMMENDED pill) when onCaptureSharp is wired", () => {
    buildModal(
      "bug",
      { ...baseCallbacks(), onCaptureSharp: async () => ({ dataUrl: "data:image/png;base64,SHARP", quality: "real-pixel" as const }) } as any,
      { theme: "light" } as any,
    )
    const shadow = modalShadow()
    const sharp = shadow.getElementById("klavity-sharp") as HTMLButtonElement | null
    expect(sharp).not.toBeNull()
    // Primary styling hook + a "Snap" a11y label (accent styling now carries the emphasis).
    expect(sharp!.classList.contains("kl-cap-primary")).toBe(true)
    expect(sharp!.getAttribute("aria-label") || "").toMatch(/snap/i)
    // The button is labelled "Snap" (renamed from "Screen"); the underlying getDisplayMedia behaviour is unchanged.
    const main = sharp!.querySelector(".kl-cap-main")
    expect(main).not.toBeNull()
    expect(main!.querySelector(".kl-sharp-label")?.textContent).toMatch(/^snap$/i)
    // The stacked "RECOMMENDED" pill was removed per founder ask — it must be gone.
    expect(sharp!.querySelector(".kl-rec-tag")).toBeNull()
    expect((sharp!.textContent || "").toLowerCase()).not.toContain("recommended")
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
    await wait(20)
    expect(onCaptureSharp).toHaveBeenCalledTimes(1)
  })
})

describe("defaultCaptureMode (KLA-587 pure decision)", () => {
  const fn = () => {}
  it("picks Screen when screenCaptureDefault is on AND onCaptureSharp is wired", () => {
    expect(defaultCaptureMode({ screenCaptureDefault: true, onCaptureSharp: fn, onCaptureViewport: fn, onCaptureFull: fn })).toBe("screen")
  })
  it("falls back to viewport when Screen is unsupported (no onCaptureSharp — e.g. iOS Safari)", () => {
    expect(defaultCaptureMode({ screenCaptureDefault: true, onCaptureViewport: fn, onCaptureFull: fn })).toBe("viewport")
  })
  it("does NOT pick Screen when screenCaptureDefault is off, even if onCaptureSharp exists", () => {
    expect(defaultCaptureMode({ onCaptureSharp: fn, onCaptureViewport: fn })).toBe("viewport")
  })
  it("falls back to full render when no viewport path is wired", () => {
    expect(defaultCaptureMode({ onCaptureFull: fn })).toBe("full")
  })
  it("returns none when nothing is wired", () => {
    expect(defaultCaptureMode({})).toBe("none")
  })
})

describe("isScreenDeclineError (KLA-587 fallback classification)", () => {
  it("treats a cancelled picker / spent gesture (NotAllowedError, AbortError) as an expected decline", () => {
    expect(isScreenDeclineError(Object.assign(new Error("denied"), { name: "NotAllowedError" }))).toBe(true)
    expect(isScreenDeclineError(Object.assign(new Error("aborted"), { name: "AbortError" }))).toBe(true)
    expect(isScreenDeclineError(Object.assign(new Error("no gesture"), { name: "InvalidStateError" }))).toBe(true)
  })
  it("treats a genuine error (TypeError, plain string) as NOT a decline", () => {
    expect(isScreenDeclineError(new TypeError("boom"))).toBe(false)
    expect(isScreenDeclineError("nope")).toBe(false)
    expect(isScreenDeclineError(undefined)).toBe(false)
  })
})

describe("on-open Screen-default capture + decline fallback (KLA-587)", () => {
  const sharpCbs = (onCaptureSharp: any) => ({
    onCaptureFull: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const }),
    onCaptureViewport: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,VIEWPORT", quality: "rendered" as const }),
    onCaptureSharp,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
    autoCaptureOnOpen: true,
    screenCaptureDefault: true,
  })

  it("on open, fires Screen as the DEFAULT and does NOT run the rendered viewport when Screen succeeds", async () => {
    const onCaptureSharp = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,SHARP", quality: "real-pixel" as const })
    const cbs = sharpCbs(onCaptureSharp)
    buildModal("bug", cbs as any, { theme: "light" } as any)
    await wait(60)
    expect(onCaptureSharp).toHaveBeenCalledTimes(1)
    expect(cbs.onCaptureViewport).not.toHaveBeenCalled()
  })

  it("on DECLINE (getDisplayMedia rejects NotAllowedError), silently falls back to the rendered viewport — no error shown", async () => {
    const onCaptureSharp = vi.fn().mockRejectedValue(Object.assign(new Error("Permission denied"), { name: "NotAllowedError" }))
    const cbs = sharpCbs(onCaptureSharp)
    buildModal("bug", cbs as any, { theme: "light" } as any)
    const shadow = modalShadow()
    await wait(60)
    expect(onCaptureSharp).toHaveBeenCalledTimes(1)
    // Fell back to the rendered viewport capture (never leaves the reporter with no screenshot).
    expect(cbs.onCaptureViewport).toHaveBeenCalledTimes(1)
    // No error surfaced for a decline.
    const err = shadow.getElementById("klavity-err") as HTMLElement | null
    expect(err && err.style.display === "block").toBeFalsy()
  })
})

// KLA composer-polish (founder PX4 repro): the on-open DEFAULT Screen capture must be VIEWPORT-scoped (a single
// visible frame), NOT the full-page scroll-stitch. When the host wires onCaptureSharpViewport, the default fires
// THAT; the manual Screen button still fires the full-page onCaptureSharp.
describe("on-open default is VIEWPORT-scoped Screen, manual Screen stays full-page (composer-polish)", () => {
  const cbs = (onCaptureSharp: any, onCaptureSharpViewport: any) => ({
    onCaptureFull: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,FULL", quality: "rendered" as const }),
    onCaptureViewport: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,VIEWPORT", quality: "rendered" as const }),
    onCaptureSharp,
    onCaptureSharpViewport,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
    autoCaptureOnOpen: true,
    screenCaptureDefault: true,
  })

  it("on open, fires the VIEWPORT-scoped Screen capture (not the full-page one)", async () => {
    const onCaptureSharp = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,SHARP_FULL", quality: "real-pixel" as const })
    const onCaptureSharpViewport = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,SHARP_VIEWPORT", quality: "real-pixel" as const })
    const c = cbs(onCaptureSharp, onCaptureSharpViewport)
    buildModal("bug", c as any, { theme: "light" } as any)
    await wait(60)
    // Default targets the viewport (single visible frame) — the full-page scroll-stitch is NOT auto-fired.
    expect(onCaptureSharpViewport).toHaveBeenCalledTimes(1)
    expect(onCaptureSharp).not.toHaveBeenCalled()
    // And the rendered fallback isn't needed when Screen succeeds.
    expect(c.onCaptureViewport).not.toHaveBeenCalled()
  })

  it("clicking the manual Screen button still fires the FULL-PAGE capture (onCaptureSharp), not the viewport one", async () => {
    const onCaptureSharp = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,SHARP_FULL", quality: "real-pixel" as const })
    const onCaptureSharpViewport = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,SHARP_VIEWPORT", quality: "real-pixel" as const })
    // No autoCaptureOnOpen so we isolate the manual click.
    const c = { ...cbs(onCaptureSharp, onCaptureSharpViewport), autoCaptureOnOpen: false }
    buildModal("bug", c as any, { theme: "light" } as any)
    const shadow = modalShadow()
    ;(shadow.getElementById("klavity-sharp") as HTMLButtonElement).click()
    await wait(30)
    expect(onCaptureSharp).toHaveBeenCalledTimes(1)
    expect(onCaptureSharpViewport).not.toHaveBeenCalled()
  })

  it("falls back to the full-page onCaptureSharp on open when no viewport variant is wired (unchanged hosts)", async () => {
    const onCaptureSharp = vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,SHARP_FULL", quality: "real-pixel" as const })
    const c = cbs(onCaptureSharp, undefined)
    buildModal("bug", c as any, { theme: "light" } as any)
    await wait(60)
    expect(onCaptureSharp).toHaveBeenCalledTimes(1)
  })
})
