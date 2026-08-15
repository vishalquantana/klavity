// @vitest-environment jsdom
//
// Regression tests for rightClickMode='modifier' (QPLNE-21).
//
// The guarantee under test: in modifier mode a PLAIN right-click must always
// reach the native browser context menu (spellcheck!), and only Alt-carrying
// right-clicks are captured by Klavity. The specific regression covered here:
// regionDrag's justDragged stays true for ~400ms after an Alt+right-drag, and
// the old handler order preventDefault()-ed a plain right-click landing inside
// that window.
//
// Harness mirrors widget-launcher.test.ts: mount() is the real export from
// widget.ts; only orthogonal side-effecting modules are mocked.

import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("./capture-context", () => ({
  installCaptureContext: vi.fn(),
  buildCaptureContext: vi.fn(() => ({} as any)),
}))
vi.mock("./session-replay", () => ({
  createSessionReplay: vi.fn(() => ({
    snapshot: () => [],
    hasRecording: () => false,
    stop: () => {},
  })),
}))
vi.mock("./widget-lib", async () => {
  const actual = await vi.importActual<typeof import("./widget-lib")>("./widget-lib")
  return {
    ...actual,
    parseScriptConfig: vi.fn(() => ({ projectId: "", backendUrl: "" })),
  }
})

import { mount } from "./widget"
import { parseScriptConfig } from "./widget-lib"

let nextModalConfig: Record<string, unknown> = {}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

function installFetchStub() {
  const fn = vi.fn(async (input: string | URL | Request, _init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString()
    if (url.includes("/api/projects/") && url.includes("/config")) {
      return jsonResponse({
        modalConfig: nextModalConfig,
        widget: { mode: "support", ctaUrl: "https://cta.test", reportGate: "anonymous" },
      })
    }
    if (url.includes("/api/widget/sims")) {
      return jsonResponse({ sims: [] })
    }
    return jsonResponse({ ok: true })
  })
  vi.stubGlobal("fetch", fn)
  return fn
}

async function mountWith(modalConfig: Record<string, unknown>) {
  nextModalConfig = modalConfig
  vi.mocked(parseScriptConfig).mockReturnValue({
    projectId: "proj_rightclick_test",
    backendUrl: "https://srv.test",
  })
  installFetchStub()
  await mount()
}

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches,
    media: q,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false },
  }))
}

function fireContextMenu(opts: MouseEventInit = {}): MouseEvent {
  const ev = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: 100,
    clientY: 100,
    ...opts,
  })
  document.body.dispatchEvent(ev)
  return ev
}

// Simulate an Alt+right-button drag on the page: press, move past any
// threshold, release. Whatever internal pressing/justDragged state the widget
// keeps is armed through these real events.
function altRightDrag() {
  document.body.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 2, buttons: 2, altKey: true, clientX: 10, clientY: 10 })
  )
  document.body.dispatchEvent(
    new MouseEvent("mousemove", { bubbles: true, cancelable: true, buttons: 2, altKey: true, clientX: 90, clientY: 90 })
  )
  document.body.dispatchEvent(
    new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 2, buttons: 0, altKey: true, clientX: 90, clientY: 90 })
  )
}

beforeEach(() => {
  stubMatchMedia(false)
  document.body.innerHTML = ""
  const storage = new Map<string, string>()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, String(value)) },
    removeItem: (key: string) => { storage.delete(key) },
    clear: () => { storage.clear() },
  })
})

describe("rightClickMode='modifier' — native menu guarantee", () => {
  it("plain right-click is never preventDefault-ed", async () => {
    await mountWith({ rightClickMode: "modifier" })
    const ev = fireContextMenu()
    expect(ev.defaultPrevented).toBe(false)
  })

  it("Alt+right-click IS captured (preventDefault-ed)", async () => {
    await mountWith({ rightClickMode: "modifier" })
    const ev = fireContextMenu({ altKey: true })
    expect(ev.defaultPrevented).toBe(true)
  })

  it("REGRESSION: plain right-click within 400ms after an Alt+right-drag still reaches the native menu", async () => {
    await mountWith({ rightClickMode: "modifier" })
    altRightDrag()
    // immediately inside the justDragged suppression window
    const ev = fireContextMenu()
    expect(ev.defaultPrevented).toBe(false)
  })

  it("sanity: 'full' mode still captures plain right-click", async () => {
    await mountWith({ rightClickMode: "full" })
    const ev = fireContextMenu()
    expect(ev.defaultPrevented).toBe(true)
  })
})
