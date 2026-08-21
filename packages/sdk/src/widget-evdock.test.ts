// @vitest-environment jsdom
//
// KLAVITYKLA-498 — the minimized "Bug report in progress" dock is FULLY clickable: clicking anywhere on the
// dock body/label resumes/reopens the composer, while "+ Capture here" and the X (dismiss) remain distinct
// actions (they stopPropagation so they never trigger the resume).
//
// Harness mirrors widget-launcher.test.ts: mock the orthogonal side-effecting modules, seed a real evidence
// session in fake-indexeddb, then mount() — the widget's on-load resume shows the dock. The dock build +
// listeners run UNMODIFIED; we assert against the real DOM it produces.

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
  safeToPngWithScale: vi.fn(async () => ({ dataUrl: "data:image/png;base64,AAAA", scale: 1, quality: "rendered" })),
  safeToPngWithQuality: vi.fn(async () => ({ dataUrl: "data:image/png;base64,AAAA", quality: "rendered" })),
  safeToPngFullPage: vi.fn(async () => "data:image/png;base64,AAAA"),
}))
vi.mock("./widget-lib", async () => {
  const actual = await vi.importActual<typeof import("./widget-lib")>("./widget-lib")
  return { ...actual, parseScriptConfig: vi.fn(() => ({ projectId: "", backendUrl: "" })) }
})

import { mount } from "./widget"
import { parseScriptConfig } from "./widget-lib"
import { startOrContinue, addShot, makeShotId, type EvidenceShot } from "./evidence-session"

const HOST_ID = "klavity-widget-host"
const PROJECT = "proj_evdock_test"

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
function dock(): HTMLElement {
  const d = host().shadowRoot.querySelector(".kl-evdock") as HTMLElement | null
  if (!d) throw new Error("evidence dock not found")
  return d
}
function composerOpen(): boolean {
  for (const el of Array.from(document.body.querySelectorAll("div")) as HTMLElement[]) {
    if (el.shadowRoot?.getElementById("klavity-desc")) return true
  }
  return false
}
async function waitUntil(fn: () => boolean, timeoutMs = 800): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (!fn()) {
    if (Date.now() > deadline) throw new Error("timed out waiting for condition")
    await new Promise((r) => setTimeout(r, 10))
  }
}
async function seedSessionWithShot() {
  const s = await startOrContinue(PROJECT, location.origin)
  const shot: EvidenceShot = {
    id: makeShotId(), pageUrl: location.href, pagePath: location.pathname, label: "",
    blob: new Blob([new Uint8Array([1, 2, 3, 4])], { type: "image/png" }), bytes: 4, w: 2, h: 2, ts: Date.now(),
  }
  await addShot(s.id, shot)
}

beforeEach(() => {
  document.body.innerHTML = ""
  const storage = new Map<string, string>()
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => { storage.set(k, String(v)) },
    removeItem: (k: string) => { storage.delete(k) },
    clear: () => { storage.clear() },
  })
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false } }))
})

async function mountWithDock() {
  vi.mocked(parseScriptConfig).mockReturnValue({ projectId: PROJECT, backendUrl: "https://srv.test" })
  installFetchStub()
  await seedSessionWithShot()
  await mount()
  // The on-load resume runs in a detached async IIFE — wait for the dock to paint.
  await waitUntil(() => !!host().shadowRoot.querySelector(".kl-evdock"))
}

describe("KLAVITYKLA-498 — minimized dock is fully clickable", () => {
  it("shows the dock with its body marked up as a resume affordance", async () => {
    await mountWithDock()
    const d = dock()
    expect(d.getAttribute("role")).toBe("button")
    expect(d.getAttribute("tabindex")).toBe("0")
    expect(d.style.cursor).toBe("pointer")
    // The three explicit actions are all present.
    expect(d.querySelector(".kl-evbtn.cap")).toBeTruthy()
    expect(d.querySelector(".kl-evbtn.res")).toBeTruthy()
    expect(d.querySelector(".kl-evx")).toBeTruthy()
  })

  it("clicking the dock BODY/label resumes (reopens the composer)", async () => {
    await mountWithDock()
    expect(composerOpen()).toBe(false)
    const label = dock().querySelector(".kl-evlab") as HTMLElement
    label.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await waitUntil(() => composerOpen())
    expect(composerOpen()).toBe(true)
  })

  it("clicking '+ Capture here' does NOT reopen the composer (stopPropagation)", async () => {
    await mountWithDock()
    const cap = dock().querySelector(".kl-evbtn.cap") as HTMLButtonElement
    cap.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    // Give any (unwanted) resume a chance to fire, then assert nothing opened.
    await new Promise((r) => setTimeout(r, 60))
    expect(composerOpen()).toBe(false)
  })

  it("clicking the X (dismiss) does NOT reopen the composer (stopPropagation)", async () => {
    await mountWithDock()
    const x = dock().querySelector(".kl-evx") as HTMLButtonElement
    x.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await new Promise((r) => setTimeout(r, 60))
    expect(composerOpen()).toBe(false)
  })
})
