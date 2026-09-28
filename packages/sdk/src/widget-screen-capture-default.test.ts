// @vitest-environment jsdom
// KD-Snap-tab-permission: KLA-587 made real Screen capture (getDisplayMedia) the DEFAULT capture on
// composer open, firing the browser's native screen-share permission prompt immediately every time a
// report is opened. Per user request, the prompt should not fire automatically — Screen/Sharp capture
// stays available as an opt-in button (onCaptureSharp/onCaptureSharpViewport still wired), but the
// composer's default auto-capture on open must be the non-prompting DOM-render path (viewport/full).
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

  it("still wires Sharp capture as an available (opt-in) capability", async () => {
    await mountAndOpen()
    expect(typeof capturedCallbacks.onCaptureSharp).toBe("function")
    expect(typeof capturedCallbacks.onCaptureSharpViewport).toBe("function")
  })
})
