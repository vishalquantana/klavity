// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest"
import "fake-indexeddb/auto"

vi.mock("./capture-context", () => ({
  installCaptureContext: vi.fn(),
  buildCaptureContext: vi.fn(() => ({} as any)),
}))
vi.mock("./session-replay", () => ({
  createSessionReplay: vi.fn(() => ({ snapshot: () => [], hasRecording: () => false, start: vi.fn(), stop: vi.fn() })),
}))
vi.mock("./capture", () => ({
  safeToPng: vi.fn(async () => "data:image/png;base64,AAAA"),
  safeToPngWithScale: vi.fn(async () => ({ dataUrl: "data:image/png;base64,AAAA", scale: 1, quality: "rendered", blank: false, partial: false })),
  safeToPngWithQuality: vi.fn(async () => ({ dataUrl: "data:image/png;base64,AAAA", quality: "rendered", blank: false, partial: false })),
  safeToPngViewport: vi.fn(async () => ({ dataUrl: "data:image/png;base64,AAAA", quality: "rendered", blank: false, partial: false })),
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
import { getActiveSession } from "./evidence-session"

const HOST_ID = "klavity-widget-host"
let PROJECT = "proj_reload_test"

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
function composerRoot(): ShadowRoot | null {
  for (const el of Array.from(document.body.querySelectorAll("div")) as HTMLElement[]) {
    if (el.shadowRoot?.getElementById("klavity-desc")) return el.shadowRoot
  }
  return null
}
function composerOpen(): boolean { return !!composerRoot() }

async function waitUntil(fn: () => boolean, timeoutMs = 1500): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (!fn()) {
    if (Date.now() > deadline) throw new Error("timed out waiting for condition")
    await new Promise((r) => setTimeout(r, 10))
  }
}

let _seq = 0
beforeEach(() => {
  document.body.innerHTML = ""
  PROJECT = `proj_reload_test_${++_seq}`
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

describe("in-progress bug report persistence across reload", () => {
  it("keeps in-progress bug report across reload when refreshed and restores entered text on resume", async () => {
    await mount()
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-launcher-btn"))
    launcher().click()
    await waitUntil(() => composerOpen())

    const desc = composerRoot()!.getElementById("klavity-desc") as HTMLTextAreaElement
    desc.value = "bug report in progress description"
    desc.dispatchEvent(new Event("input", { bubbles: true }))

    // Trigger blur/change to flush immediately
    desc.dispatchEvent(new Event("change", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 400))

    // Simulate page reload (dispatch beforeunload first, then reset DOM)
    window.dispatchEvent(new Event("beforeunload"))
    document.body.innerHTML = ""
    await mount()

    // Dock should be visible on reload with the in-progress bug report
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-evdock"))
    const sub = host().shadowRoot.querySelector(".kl-evdock .kl-evlab small")?.textContent
    expect(sub).toContain("not lost")

    // Click resume to reopen composer
    const resBtn = host().shadowRoot.querySelector(".kl-evdock .kl-evbtn.res") as HTMLElement
    resBtn.click()
    await waitUntil(() => composerOpen())

    const restoredDesc = (composerRoot()!.getElementById("klavity-desc") as HTMLTextAreaElement).value
    expect(restoredDesc).toBe("bug report in progress description")
  }, 10000)

  it("restores dock when minimized to dock before reload and preserves evidence on resume", async () => {
    await mount()
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-launcher-btn"))
    launcher().click()
    await waitUntil(() => composerOpen())

    const desc = composerRoot()!.getElementById("klavity-desc") as HTMLTextAreaElement
    desc.value = "minimized bug report description"
    desc.dispatchEvent(new Event("input", { bubbles: true }))
    desc.dispatchEvent(new Event("change", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 400))

    // Minimize composer
    const minBtn = composerRoot()!.getElementById("klavity-min") as HTMLButtonElement
    minBtn.click()
    await waitUntil(() => !composerOpen())
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-evdock"))

    // Simulate page reload
    window.dispatchEvent(new Event("beforeunload"))
    document.body.innerHTML = ""
    await mount()

    // Dock should be restored because it was minimized (isOpen: false)
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-evdock"))
    expect(composerOpen()).toBe(false)

    // Click resume on dock
    const resBtn = host().shadowRoot.querySelector(".kl-evdock .kl-evbtn.res") as HTMLElement
    resBtn.click()
    await waitUntil(() => composerOpen())

    const restoredDesc = (composerRoot()!.getElementById("klavity-desc") as HTMLTextAreaElement).value
    expect(restoredDesc).toBe("minimized bug report description")
  }, 10000)

  it("discards report when user explicitly clicks Discard", async () => {
    await mount()
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-launcher-btn"))
    launcher().click()
    await waitUntil(() => composerOpen())

    const desc = composerRoot()!.getElementById("klavity-desc") as HTMLTextAreaElement
    desc.value = "discardable bug report"
    desc.dispatchEvent(new Event("input", { bubbles: true }))
    desc.dispatchEvent(new Event("change", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 400))

    // Click close button -> should show discard confirmation dialog
    const closeBtn = composerRoot()!.getElementById("klavity-x") as HTMLButtonElement
    closeBtn.click()

    // Confirm discard
    await waitUntil(() => !!composerRoot()!.getElementById("kl-cc-discard"))
    const discardBtn = composerRoot()!.getElementById("kl-cc-discard") as HTMLButtonElement
    discardBtn.click()

    await waitUntil(() => !composerOpen())
    await new Promise((r) => setTimeout(r, 200))

    // Reload page -> should show standard launcher, no dock and no composer
    document.body.innerHTML = ""
    await mount()
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-launcher-btn"))
    expect(host().shadowRoot.querySelector(".kl-evdock")).toBeNull()
    expect(composerOpen()).toBe(false)
  }, 10000)
})
