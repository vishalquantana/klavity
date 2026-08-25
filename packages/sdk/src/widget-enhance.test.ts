// @vitest-environment jsdom
// KLA-586: the widget's onEnhance wiring — POSTs /api/report/enhance with the expected shape and returns
// the parsed draft (or null). We mock @klavity/core/modal's buildModal to CAPTURE the callbacks object the
// widget passes it, then invoke onEnhance directly and assert the fetch. This avoids driving the whole
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

// Capture the callbacks the widget hands buildModal; keep the real modal so nothing else breaks.
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

const DRAFT = {
  summary: "Checkout button unresponsive",
  actualResult: "Nothing happens on click",
  expectedResult: "Order submits",
  stepsToReproduce: ["Go to /checkout", "Click Place order"],
  suggestedSeverity: "C2",
  suggestedPriority: "P2",
  confidence: 0.7,
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } })
}

let enhanceCalls: Array<{ url: string; body: any }> = []
function installFetchStub() {
  const fn = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString()
    if (url.includes("/api/projects/") && url.includes("/config")) {
      return jsonResponse({
        modalConfig: { reportClarity: true },
        widget: { mode: "support", ctaUrl: "https://cta.test", reportGate: "anonymous" },
      })
    }
    if (url.includes("/api/report/enhance")) {
      enhanceCalls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null })
      return jsonResponse({ draft: DRAFT })
    }
    return jsonResponse({ ok: true })
  })
  vi.stubGlobal("fetch", fn)
  return fn
}

beforeEach(() => {
  document.body.innerHTML = ""
  capturedCallbacks = null
  enhanceCalls = []
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false } }))
  const storage = new Map<string, string>()
  vi.stubGlobal("localStorage", { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => { storage.set(k, String(v)) }, removeItem: (k: string) => { storage.delete(k) }, clear: () => storage.clear() })
})

async function mountAndOpen() {
  vi.mocked(parseScriptConfig).mockReturnValue({ projectId: "proj_enhance_test", backendUrl: "https://srv.test" })
  installFetchStub()
  await mount()
  ;(window as any).Klavity.open("bug")
  await new Promise((r) => setTimeout(r, 20)) // let openReport build the composer
  if (!capturedCallbacks) throw new Error("composer never opened / callbacks not captured")
}

describe("widget onEnhance wiring (KLA-586)", () => {
  it("wires onEnhance when reportClarity is on", async () => {
    await mountAndOpen()
    expect(typeof capturedCallbacks.onEnhance).toBe("function")
  })

  it("POSTs /api/report/enhance with projectId, text, pageUrl, shot, picked, client and returns the parsed draft", async () => {
    await mountAndOpen()
    const picked = { selector: "button.place-order", text: "Place order" }
    const draft = await capturedCallbacks.onEnhance("checkout is broken", { images: 1, shot: "data:image/png;base64,AAA", picked })
    expect(enhanceCalls.length).toBe(1)
    expect(enhanceCalls[0].url).toContain("/api/report/enhance")
    const body = enhanceCalls[0].body
    expect(body.projectId).toBe("proj_enhance_test")
    expect(body.text).toBe("checkout is broken")
    expect(typeof body.pageUrl).toBe("string")
    expect(body.shot).toBe("data:image/png;base64,AAA")
    expect(body.picked).toEqual(picked)
    expect(body).toHaveProperty("client")
    // returns the server's parsed draft
    expect(draft).toEqual(DRAFT)
  })

  it("returns null (silent no-op) when the endpoint errors", async () => {
    await mountAndOpen()
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })))
    const draft = await capturedCallbacks.onEnhance("x", { shot: "" })
    expect(draft).toBeNull()
  })
})
