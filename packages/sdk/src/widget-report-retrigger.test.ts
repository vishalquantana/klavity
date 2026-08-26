// @vitest-environment jsdom
//
// #637 — clicking "Report" AGAIN on an in-progress draft must CAPTURE A NEW screenshot and APPEND it at the
// END of the evidence strip, instead of silently reopening the same draft with no fresh snap (the standup
// complaint: "I expected it to take another snap — one more image at the end").
//
// Harness mirrors widget-evdock.test.ts: mock the orthogonal side-effecting modules, then mount() and drive
// the launcher. The capture module is mocked so safeToPngWithQuality (the explicit re-capture) and
// safeToPngViewport (the on-open auto-capture) return stub PNGs; hasUncapturableEmbeds is mocked because the
// widget's withSharpSuggestion() reads it.

import { describe, it, expect, vi, beforeEach } from "vitest"
import "fake-indexeddb/auto"

vi.mock("./capture-context", () => ({
  installCaptureContext: vi.fn(),
  buildCaptureContext: vi.fn(() => ({} as any)),
}))
vi.mock("./session-replay", () => ({
  createSessionReplay: vi.fn(() => ({ snapshot: () => [], hasRecording: () => false, start: vi.fn(), stop: vi.fn() })),
}))
// safeToPngWithQuality = the FRESH full-page capture the #637 re-trigger takes. Distinct spy so we can assert
// it fired ONLY on an explicit re-trigger (the on-open auto-capture uses safeToPngViewport instead).
const freshCapture = vi.fn(async () => ({ dataUrl: "data:image/png;base64,BBBB", quality: "rendered", blank: false, partial: false }))
vi.mock("./capture", () => ({
  safeToPng: vi.fn(async () => "data:image/png;base64,AAAA"),
  safeToPngWithScale: vi.fn(async () => ({ dataUrl: "data:image/png;base64,AAAA", scale: 1, quality: "rendered", blank: false, partial: false })),
  safeToPngWithQuality: (..._a: any[]) => freshCapture(),
  safeToPngViewport: vi.fn(async () => ({ dataUrl: "data:image/png;base64,VVVV", quality: "rendered", blank: false, partial: false })),
  safeToPngFullPage: vi.fn(async () => "data:image/png;base64,AAAA"),
  hasUncapturableEmbeds: vi.fn(() => false),
  fullPageCaptureSize: vi.fn(() => ({ w: 2, h: 2 })),
}))
vi.mock("./widget-lib", async () => {
  const actual = await vi.importActual<typeof import("./widget-lib")>("./widget-lib")
  return { ...actual, parseScriptConfig: vi.fn(() => ({ projectId: "", backendUrl: "" })) }
})

import { mount } from "./widget"
import { parseScriptConfig } from "./widget-lib"
import { startOrContinue, addShot, makeShotId, type EvidenceShot } from "./evidence-session"

const HOST_ID = "klavity-widget-host"
const PROJECT = "proj_retrigger_test"

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } })
}
function installFetchStub() {
  vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString()
    if (url.includes("/api/projects/") && url.includes("/config")) {
      return jsonResponse({ modalConfig: {}, reportClarity: true, widget: { mode: "support", reportGate: "anonymous" } })
    }
    return jsonResponse({ ok: true })
  }))
}
function host(): HTMLElement & { shadowRoot: ShadowRoot } {
  const h = document.getElementById(HOST_ID) as HTMLElement & { shadowRoot: ShadowRoot }
  if (!h || !h.shadowRoot) throw new Error("widget host not mounted")
  return h
}
function launcher(): HTMLButtonElement {
  const b = host().shadowRoot.querySelector(".kl-launcher-btn") as HTMLButtonElement | null
  if (!b) throw new Error("launcher not found")
  return b
}
function clickLauncher() { launcher().dispatchEvent(new MouseEvent("click", { bubbles: true })) }
function composerRoot(): ShadowRoot | null {
  for (const el of Array.from(document.body.querySelectorAll("div")) as HTMLElement[]) {
    if (el.shadowRoot?.getElementById("klavity-desc")) return el.shadowRoot
  }
  return null
}
function composerOpen(): boolean { return !!composerRoot() }
function thumbs(): HTMLElement[] {
  const root = composerRoot()
  if (!root) return []
  return Array.from(root.querySelectorAll("#klavity-strip .klavity-thumb")) as HTMLElement[]
}
async function waitUntil(fn: () => boolean, timeoutMs = 1500): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (!fn()) {
    if (Date.now() > deadline) throw new Error("timed out waiting for condition")
    await new Promise((r) => setTimeout(r, 10))
  }
}

beforeEach(() => {
  document.body.innerHTML = ""
  freshCapture.mockClear()
  vi.mocked(parseScriptConfig).mockReturnValue({ projectId: PROJECT, backendUrl: "https://srv.test" })
  installFetchStub()
  const storage = new Map<string, string>()
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => { storage.set(k, String(v)) },
    removeItem: (k: string) => { storage.delete(k) },
    clear: () => { storage.clear() },
  })
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false } }))
})

describe("#637 — re-triggering Report captures & appends a fresh snap", () => {
  it("re-clicking Report while the composer is OPEN appends a NEW shot to the end of the strip", async () => {
    await mount()
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-launcher-btn"))

    // First click: opens the composer and auto-captures ONE shot (the on-open viewport capture).
    clickLauncher()
    await waitUntil(() => composerOpen())
    await waitUntil(() => thumbs().length >= 1)
    expect(thumbs().length).toBe(1)
    // The auto-capture is the viewport path — it does NOT go through safeToPngWithQuality.
    expect(freshCapture).not.toHaveBeenCalled()

    // Explicit re-trigger while the composer is still open: takes a FRESH capture and APPENDS it (2 shots).
    clickLauncher()
    await waitUntil(() => thumbs().length >= 2)
    expect(thumbs().length).toBe(2)
    expect(freshCapture).toHaveBeenCalledTimes(1)
    // The freshly-appended shot is the ACTIVE hero (last thumbnail), matching addCapturedShot semantics.
    const t = thumbs()
    expect(t[t.length - 1].classList.contains("kl-thumb-active")).toBe(true)
    // The pre-existing first shot is NOT discarded — the draft is preserved and grew by exactly one.
    expect(t[0].classList.contains("kl-thumb-active")).toBe(false)
  })

  it("does NOT double-capture on the FIRST open (brand-new draft single-captures)", async () => {
    await mount()
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-launcher-btn"))
    clickLauncher()
    await waitUntil(() => composerOpen())
    await waitUntil(() => thumbs().length >= 1)
    // A short settle window — a double-capture bug would add a second thumb here.
    await new Promise((r) => setTimeout(r, 60))
    expect(thumbs().length).toBe(1)
    // The initial open never routes through the explicit re-capture path.
    expect(freshCapture).not.toHaveBeenCalled()
  })

  it("re-clicking Report on a CLOSED draft (minimized dock) reopens AND takes a fresh capture", async () => {
    // Seed an evidence session so a draft is "in progress" but the composer is closed (dock shown on load).
    const s = await startOrContinue(PROJECT, location.origin)
    const shot: EvidenceShot = {
      id: makeShotId(), pageUrl: location.href, pagePath: location.pathname, label: "",
      blob: new Blob([new Uint8Array([1, 2, 3, 4])], { type: "image/png" }), bytes: 4, w: 2, h: 2, ts: Date.now(),
    }
    await addShot(s.id, shot)
    await mount()
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-evdock"))
    expect(composerOpen()).toBe(false)

    // Explicit re-trigger from the dock: reopens the composer AND takes a fresh capture (the #637 fix — pre-fix
    // this reopened the same draft with no new snap). The fresh shot lands in the strip.
    clickLauncher()
    await waitUntil(() => composerOpen())
    await waitUntil(() => freshCapture.mock.calls.length >= 1)
    expect(freshCapture).toHaveBeenCalled()
    await waitUntil(() => thumbs().length >= 1)
    expect(thumbs().length).toBeGreaterThanOrEqual(1)
  })
})
