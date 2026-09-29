// @vitest-environment jsdom
// KD-Snap-tab-permission: the browser's native screen-share permission prompt must never appear on any
// composer action — not on open (KLA-587 made real Screen capture the default there), not on the manual
// Snap button, not on Full Page's own "try Screen first" step (2026-08-26 owner directive), not on Retake.
// getDisplayMedia-based capture is fully disabled: screenCaptureDefault is unconditionally false, and
// onCaptureSharp/onCaptureSharpViewport are wired to safeToPngViewport() — the EXACT SAME proven,
// production-verified function the on-open default (onCaptureViewport) already uses to capture just the
// visible screen — so the "Snap" button (id="klavity-sharp") stays visible (the composer only renders it
// when onCaptureSharp is wired) and behaves exactly like the on-open default. An earlier attempt used a
// full-page-render-then-crop approach to be scroll-position aware, but that was slower and produced a
// wrong/undersized result in production — safeToPngViewport alone is what's actually proven correct.
// onRetakeSharp stays undefined (it only ever existed to redo a real-pixel shot, which no longer exists).
// Full Page (onCaptureFull/onCaptureViewport) is untouched.
//
// Uses the same buildModal-capture harness as widget-enhance.test.ts to avoid driving the whole
// composer UI (autocapture/getDisplayMedia timing) while still exercising the real widget wiring.
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("./capture-context", () => ({
  installCaptureContext: vi.fn(),
  buildCaptureContext: vi.fn(() => ({} as any)),
}))
vi.mock("./session-replay", () => ({
  createSessionReplay: vi.fn(() => ({ snapshot: () => [], hasRecording: () => false, stop: () => {} })),
}))
vi.mock("./widget-lib", async () => {
  const actual = await vi.importActual<typeof import("./widget-lib")>("./widget-lib")
  return { ...actual, parseScriptConfig: vi.fn(() => ({ projectId: "", backendUrl: "" })) }
})
// Passthrough mock so we can spy on which capture function Snap actually calls.
vi.mock("./capture", async () => {
  const actual = await vi.importActual<typeof import("./capture")>("./capture")
  return { ...actual }
})

let capturedCallbacks: any = null
vi.mock("@klavity/core/modal", async () => {
  const actual = await vi.importActual<any>("@klavity/core/modal")
  return {
    ...actual,
    buildModal: vi.fn((type: any, callbacks: any, config: any) => {
      capturedCallbacks = callbacks
      return actual.buildModal(type, callbacks, config)
    }),
  }
})

import { mount } from "./widget"
import { parseScriptConfig } from "./widget-lib"
import * as captureModule from "./capture"

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } })
}

function installFetchStub() {
  const fn = vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString()
    if (url.includes("/api/projects/") && url.includes("/config")) {
      return jsonResponse({
        modalConfig: { reportClarity: true },
        widget: { mode: "support", ctaUrl: "https://cta.test", reportGate: "anonymous" },
      })
    }
    return jsonResponse({ ok: true })
  })
  vi.stubGlobal("fetch", fn)
  return fn
}

beforeEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ""
  capturedCallbacks = null
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false } }))
  const storage = new Map<string, string>()
  vi.stubGlobal("localStorage", { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => { storage.set(k, String(v)) }, removeItem: (k: string) => { storage.delete(k) }, clear: () => storage.clear() })
  // Feature-detect getDisplayMedia as SUPPORTED (matches a real desktop Chrome), so the test proves
  // the default is off by explicit config, not just by jsdom lacking the API.
  vi.stubGlobal("navigator", {
    ...navigator,
    mediaDevices: { ...(navigator as any).mediaDevices, getDisplayMedia: vi.fn() },
  })
})

async function mountAndOpen() {
  vi.mocked(parseScriptConfig).mockReturnValue({ projectId: "proj_screen_default_test", backendUrl: "https://srv.test" })
  installFetchStub()
  await mount()
  ;(window as any).Klavity.open("bug")
  // Long enough for openReport to build the composer AND for the auto-capture-on-open's deferred
  // (requestIdleCallback/rAF) runCapture() to actually fire and resolve — otherwise it can land AFTER
  // a test's own mockClear(), polluting call counts on whichever capture spy the test is watching.
  await new Promise((r) => setTimeout(r, 150))
  if (!capturedCallbacks) throw new Error("composer never opened / callbacks not captured")
}

describe("widget screen-capture default (KD-Snap-tab-permission)", () => {
  it("does not default to Screen capture even when getDisplayMedia is supported", async () => {
    await mountAndOpen()
    expect(capturedCallbacks.screenCaptureDefault).toBe(false)
  })

  it("keeps the Snap button wired (visible) but never touches getDisplayMedia", async () => {
    await mountAndOpen()
    expect(typeof capturedCallbacks.onCaptureSharp).toBe("function")
    expect(typeof capturedCallbacks.onCaptureSharpViewport).toBe("function")
    await capturedCallbacks.onCaptureSharp()
    await capturedCallbacks.onCaptureSharpViewport()
    expect((navigator.mediaDevices as any).getDisplayMedia).not.toHaveBeenCalled()
  })

  it("Snap uses the SAME proven safeToPngViewport function as the on-open default, never the full-page render", async () => {
    const viewportSpy = vi.spyOn(captureModule, "safeToPngViewport")
    const fullPageSpy = vi.spyOn(captureModule, "safeToPngWithQuality")
    await mountAndOpen()
    viewportSpy.mockClear() // drop the auto-capture-on-open's own safeToPngViewport call
    fullPageSpy.mockClear()

    await capturedCallbacks.onCaptureSharp()
    expect(viewportSpy).toHaveBeenCalledTimes(1)
    expect(fullPageSpy).not.toHaveBeenCalled()

    viewportSpy.mockClear()
    await capturedCallbacks.onCaptureSharpViewport()
    expect(viewportSpy).toHaveBeenCalledTimes(1)
  })

  it("Full Page is untouched — still renders the whole document via safeToPngWithQuality", async () => {
    const fullPageSpy = vi.spyOn(captureModule, "safeToPngWithQuality")
    const viewportSpy = vi.spyOn(captureModule, "safeToPngViewport")
    await mountAndOpen()
    fullPageSpy.mockClear() // drop the auto-capture-on-open's own call
    viewportSpy.mockClear()

    await capturedCallbacks.onCaptureFull()
    expect(fullPageSpy).toHaveBeenCalled()
    expect(viewportSpy).not.toHaveBeenCalled()
  })

  // Calling the onCaptureFull CALLBACK directly (above) doesn't exercise modal.ts's real "Full Page"
  // button — its click handler tries runScreenCapture() FIRST whenever onCaptureSharp is wired, and only
  // falls through to onCaptureFull if that didn't return real pixels. Drives the ACTUAL composer DOM to
  // prove the real button still reaches the real full-page path (see modal.ts's quality gate).
  it("clicking the REAL Full Page button in the composer still reaches onCaptureFull, not just Snap's viewport capture", async () => {
    const fullPageSpy = vi.spyOn(captureModule, "safeToPngWithQuality")
    await mountAndOpen()

    let composerShadow: ShadowRoot | null = null
    for (const el of Array.from(document.body.querySelectorAll("div")) as HTMLElement[]) {
      if (el.shadowRoot?.getElementById("klavity-full")) { composerShadow = el.shadowRoot; break }
    }
    if (!composerShadow) throw new Error("composer shadow root with #klavity-full not found")
    const fullBtn = composerShadow.getElementById("klavity-full") as HTMLButtonElement
    fullBtn.click()
    // Full Page does one wasted "try Screen first" pass (Snap's viewport capture, non-real-pixel, so it
    // falls through) before reaching its own real capture — needs a longer wait than a single pass.
    await new Promise((r) => setTimeout(r, 500))

    expect(fullPageSpy).toHaveBeenCalled()
  })

  it("does not wire Retake-sharp (no real-pixel shot exists to redo)", async () => {
    await mountAndOpen()
    expect(capturedCallbacks.onRetakeSharp).toBeUndefined()
  })

  it("still wires the non-prompting DOM-render capture (default Full Page / viewport)", async () => {
    await mountAndOpen()
    expect(typeof capturedCallbacks.onCaptureFull).toBe("function")
    expect(typeof capturedCallbacks.onCaptureViewport).toBe("function")
  })
})
