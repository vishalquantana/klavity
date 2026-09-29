// @vitest-environment jsdom
// KD-Snap-tab-permission (final ask): the manual "Snap" button (sharpBtn → onCaptureSharp) must behave
// the SAME as the composer's on-open default capture (onCaptureSharpViewport) — a single VIEWPORT frame,
// never the full-page scroll-stitch. Previously onCaptureSharp called captureSharpFullPage(), which
// scrolls the page through multiple stops (window.scrollTo) to stitch a tall image — a different, slower
// result than what the reporter already sees as the default on open. This locks in that both capture
// paths now grab the SAME single frame with no page scrolling.
//
// Uses the fake getDisplayMedia + <video>/<canvas> harness from widget-region-drag-snap.test.ts (the
// proven pattern for exercising the real Snap/getDisplayMedia code path in jsdom).
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

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

import { mount, releaseSharedDisplayStream } from "./widget"
import { parseScriptConfig } from "./widget-lib"

class FakeTrack { readyState: "live" | "ended" = "live"; kind = "video"; stop() { this.readyState = "ended" }; addEventListener() {} }
class FakeStream { tracks = [new FakeTrack()]; getTracks() { return this.tracks }; getVideoTracks() { return this.tracks } }

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

let realCreate: typeof document.createElement
let getDisplayMedia: ReturnType<typeof vi.fn>

beforeEach(() => {
  document.body.innerHTML = ""
  capturedCallbacks = null
  releaseSharedDisplayStream()
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false } }))
  const storage = new Map<string, string>()
  vi.stubGlobal("localStorage", { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => { storage.set(k, String(v)) }, removeItem: (k: string) => { storage.delete(k) }, clear: () => storage.clear() })

  getDisplayMedia = vi.fn(async () => new FakeStream() as unknown as MediaStream)
  vi.stubGlobal("navigator", { ...navigator, mediaDevices: { getDisplayMedia } })
  Object.defineProperty(window, "innerWidth", { value: 1440, configurable: true })
  Object.defineProperty(window, "innerHeight", { value: 900, configurable: true })
  // A tall document — if the full-page scroll-stitch path ran, it would need multiple scroll stops.
  Object.defineProperty(document.documentElement, "scrollHeight", { value: 5000, configurable: true })

  realCreate = document.createElement.bind(document)
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag === "video") return { videoWidth: 2880, videoHeight: 1800, muted: false, play: async () => {}, set srcObject(_v: any) {} } as any
    if (tag === "canvas") return { width: 0, height: 0, style: {}, getContext: () => ({ drawImage() {} }), toDataURL: () => "data:image/png;base64,SNAPFRAME" } as any
    return realCreate(tag)
  })
})

afterEach(() => { vi.restoreAllMocks(); releaseSharedDisplayStream() })

async function mountAndOpen() {
  vi.mocked(parseScriptConfig).mockReturnValue({ projectId: "proj_snap_viewport_test", backendUrl: "https://srv.test" })
  installFetchStub()
  await mount()
  ;(window as any).Klavity.open("bug")
  await new Promise((r) => setTimeout(r, 20))
  if (!capturedCallbacks) throw new Error("composer never opened / callbacks not captured")
}

describe("Snap button matches the initial capture's viewport-only behavior", () => {
  it("onCaptureSharp (the manual Snap button) grabs a single viewport frame — no page scrolling", async () => {
    await mountAndOpen()
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {})

    const result = await capturedCallbacks.onCaptureSharp()

    expect(getDisplayMedia).toHaveBeenCalledTimes(1)
    expect(scrollToSpy).not.toHaveBeenCalled() // the full-page stitch scrolls; the viewport frame never does
    expect(result.dataUrl).toBe("data:image/png;base64,SNAPFRAME")
    expect(result.quality).toBe("real-pixel")
  })

  it("onCaptureSharp and onCaptureSharpViewport now produce the SAME kind of capture", async () => {
    await mountAndOpen()
    const r1 = await capturedCallbacks.onCaptureSharp()
    const r2 = await capturedCallbacks.onCaptureSharpViewport()
    expect(r1.quality).toBe(r2.quality)
    expect(r1.dataUrl).toBe(r2.dataUrl)
  })
})
