// @vitest-environment jsdom
// KD-Snap-tab-permission: KLA-587 made real Screen capture (getDisplayMedia) the DEFAULT capture on
// composer open, and a follow-up owner directive (2026-08-26) also made the manual "Full Page" button
// try getDisplayMedia FIRST — so the browser's native screen-share prompt could fire on composer open,
// on "Full Page", on the dedicated "Snap"/Sharp button, AND on "Retake" of a degraded shot. Per user
// request, NONE of these should ever prompt. The composer's "Snap" button (id="klavity-sharp") only
// renders at all when `onCaptureSharp` is wired (see modal.ts's template), so removing the wiring
// entirely made the button DISAPPEAR — not what was wanted. Instead, onCaptureSharp/onCaptureSharpViewport
// are wired to the SAME non-prompting DOM-render functions as onCaptureFull/onCaptureViewport: the
// button stays visible and clickable, it just never touches getDisplayMedia. onRetakeSharp stays
// undefined — the "Retake" affordance is also template-gated on it and only mattered for redoing a
// real-pixel shot, which no longer exists.
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
  await new Promise((r) => setTimeout(r, 20)) // let openReport build the composer
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
