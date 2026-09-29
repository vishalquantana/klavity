// @vitest-environment jsdom
// KD-Snap-tab-permission (follow-up): the FAB's on-hover "snap-share-hint" preview told the reporter
// "When the dialog appears, just click Allow" — priming them for the getDisplayMedia prompt. Now that
// getDisplayMedia-based capture is disabled entirely (widget.ts's onCaptureSharp/onCaptureSharpViewport/
// onRetakeSharp are all undefined), that dialog never appears, so the hint is actively misleading and
// must not show. It was gated on `sharpCaptureSupported()` (browser feature-detect) rather than on
// whether Sharp capture is actually wired — this test locks in that it's gone.
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

import { mount } from "./widget"
import { parseScriptConfig } from "./widget-lib"

const HOST_ID = "klavity-widget-host"

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } })
}

function installFetchStub() {
  const fn = vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString()
    if (url.includes("/api/projects/") && url.includes("/config")) {
      return jsonResponse({
        modalConfig: {},
        widget: { mode: "support", ctaUrl: "https://cta.test", reportGate: "anonymous" },
      })
    }
    return jsonResponse({ ok: true })
  })
  vi.stubGlobal("fetch", fn)
  return fn
}

function host(): HTMLElement & { shadowRoot: ShadowRoot } {
  const h = document.getElementById(HOST_ID) as HTMLElement & { shadowRoot: ShadowRoot }
  if (!h || !h.shadowRoot) throw new Error("widget host not mounted")
  return h
}

function launcherButton(): HTMLButtonElement {
  const btn = host().shadowRoot.querySelector("button") as HTMLButtonElement
  if (!btn) throw new Error("launcher button not found in shadow root")
  return btn
}

beforeEach(() => {
  document.body.innerHTML = ""
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false } }))
  const storage = new Map<string, string>()
  vi.stubGlobal("localStorage", { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => { storage.set(k, String(v)) }, removeItem: (k: string) => { storage.delete(k) }, clear: () => storage.clear() })
  // Feature-detect getDisplayMedia as SUPPORTED (real desktop Chrome) — the old hint only gated on this,
  // so this proves its absence is by explicit design, not just jsdom lacking the API.
  vi.stubGlobal("navigator", {
    ...navigator,
    mediaDevices: { ...(navigator as any).mediaDevices, getDisplayMedia: vi.fn() },
    permissions: undefined, // shareCaptureLikelyGranted() → false, so the old hint WOULD have shown
  })
})

describe("widget FAB hover hint (KD-Snap-tab-permission follow-up)", () => {
  it("never shows a share-picker hint on FAB hover (getDisplayMedia capture is fully disabled)", async () => {
    vi.mocked(parseScriptConfig).mockReturnValue({ projectId: "proj_fab_hint_test", backendUrl: "https://srv.test" })
    installFetchStub()
    await mount()

    launcherButton().dispatchEvent(new Event("mouseenter"))
    // Let the async shareCaptureLikelyGranted() + any requestAnimationFrame settle.
    await new Promise((r) => setTimeout(r, 50))

    const shadow = host().shadowRoot
    expect(shadow.textContent).not.toContain("Report an issue with a screenshot")
    expect(shadow.textContent).not.toContain("just click Allow")
  })
})
