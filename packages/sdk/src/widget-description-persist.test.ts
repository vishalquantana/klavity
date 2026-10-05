// @vitest-environment jsdom
//
// KD-166: clearing filters in PX4 (a real full-page navigation to a legacy page) discarded the in-progress
// Klavity bug report — the reporter observed only the DESCRIPTION was lost; the screenshot survived via the
// evidence session. Root cause: description text was never persisted into that session in the first place,
// and even the recovery path never read it back. Covers both halves: typing persists (debounced) into the
// session, and resuming a session with a saved desc reopens the composer pre-filled with it.
//
// Harness mirrors widget-evdock.test.ts: mock the orthogonal side-effecting modules, seed a real evidence
// session in fake-indexeddb, then mount() — the widget's on-load resume shows the dock.

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
import { startOrContinue, addShot, makeShotId, getActiveSession, type EvidenceShot } from "./evidence-session"

const HOST_ID = "klavity-widget-host"
// fake-indexeddb persists across every test in this file (no reset between tests) — each test gets its
// own project id so startOrContinue always starts a FRESH session instead of continuing a prior test's.
let PROJECT = "proj_desc_persist_test"

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
function composerShadow(): ShadowRoot | null {
  for (const el of Array.from(document.body.querySelectorAll("div")) as HTMLElement[]) {
    if (el.shadowRoot?.getElementById("klavity-desc")) return el.shadowRoot
  }
  return null
}
async function waitUntil(fn: () => boolean, timeoutMs = 800): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (!fn()) {
    if (Date.now() > deadline) throw new Error("timed out waiting for condition")
    await new Promise((r) => setTimeout(r, 10))
  }
}
async function waitUntilAsync(fn: () => Promise<boolean>, timeoutMs = 2000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (!(await fn())) {
    if (Date.now() > deadline) throw new Error("timed out waiting for async condition")
    await new Promise((r) => setTimeout(r, 20))
  }
}
async function seedSessionWithShot(): Promise<string> {
  const s = await startOrContinue(PROJECT, location.origin)
  const shot: EvidenceShot = {
    id: makeShotId(), pageUrl: location.href, pagePath: location.pathname, label: "",
    blob: new Blob([new Uint8Array([1, 2, 3, 4])], { type: "image/png" }), bytes: 4, w: 2, h: 2, ts: Date.now(),
  }
  await addShot(s.id, shot)
  return s.id
}

let _seq = 0
beforeEach(() => {
  document.body.innerHTML = ""
  PROJECT = `proj_desc_persist_test_${++_seq}`
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
  const sessionId = await seedSessionWithShot()
  await mount()
  await waitUntil(() => !!host().shadowRoot.querySelector(".kl-evdock"))
  return sessionId
}

describe("KD-166 — resuming a recovered session restores the typed description", () => {
  it("resume reopens the composer pre-filled with the session's persisted desc", async () => {
    const sessionId = await seedSessionWithShot()
    // Seed the desc directly (simulates a prior page's debounced persist having already run).
    const { updateFields } = await import("./evidence-session")
    await updateFields(sessionId, { desc: "checkout button does nothing on mobile" })

    vi.mocked(parseScriptConfig).mockReturnValue({ projectId: PROJECT, backendUrl: "https://srv.test" })
    installFetchStub()
    await mount()
    await waitUntil(() => !!host().shadowRoot.querySelector(".kl-evdock"))

    const label = host().shadowRoot.querySelector(".kl-evdock .kl-evlab") as HTMLElement
    label.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await waitUntil(() => !!composerShadow())

    const desc = composerShadow()!.getElementById("klavity-desc") as HTMLElement & { value: string }
    expect(desc.value).toBe("checkout button does nothing on mobile")
  })

  it("resume with an empty/never-typed desc opens a normal blank composer (no regression)", async () => {
    await mountWithDock()
    const label = host().shadowRoot.querySelector(".kl-evdock .kl-evlab") as HTMLElement
    label.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await waitUntil(() => !!composerShadow())
    const desc = composerShadow()!.getElementById("klavity-desc") as HTMLElement & { value: string }
    expect(desc.value).toBe("")
  })
})

describe("KD-166 — typing persists into the evidence session (debounced)", () => {
  it("typing in the resumed composer eventually persists into IndexedDB", async () => {
    await mountWithDock()
    const label = host().shadowRoot.querySelector(".kl-evdock .kl-evlab") as HTMLElement
    label.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await waitUntil(() => !!composerShadow())

    const desc = composerShadow()!.getElementById("klavity-desc") as HTMLElement & { value: string }
    desc.value = "typed after resuming, before any navigation"
    desc.dispatchEvent(new Event("input", { bubbles: true }))

    await waitUntilAsync(async () => {
      const s = await getActiveSession(PROJECT, location.origin)
      return s?.desc === "typed after resuming, before any navigation"
    })
    const persisted = await getActiveSession(PROJECT, location.origin)
    expect(persisted?.desc).toBe("typed after resuming, before any navigation")
  })
})
