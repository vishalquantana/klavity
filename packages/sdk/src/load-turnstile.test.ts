// JTBD 1.7 — unit tests for the widget's lazy Turnstile loader. Mirrors load-recorder.test.ts:
// a minimal DOM stub lets us fire onload/onerror without a real network, so this stays hermetic.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { resolveTurnstileUrl, injectTurnstileScript, getTurnstileToken, __resetTurnstileLoaderForTests, type TurnstileGlobal } from "./load-turnstile"

describe("resolveTurnstileUrl", () => {
  it("points at Cloudflare's official explicit-render API", () => {
    expect(resolveTurnstileUrl()).toBe("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit")
  })
})

describe("injectTurnstileScript", () => {
  let appended: any[]
  beforeEach(() => {
    __resetTurnstileLoaderForTests()
    appended = []
    const w = globalThis as any
    delete w.turnstile
    const head = {
      appendChild(node: any) {
        appended.push(node)
        Promise.resolve().then(() => node.__fire && node.__fire())
      },
    }
    vi.stubGlobal("document", {
      head,
      documentElement: head,
      body: head,
      createElement: () => {
        const node: any = { tagName: "SCRIPT" }
        node.__fire = () => node.onload && node.onload()
        return node
      },
    })
    vi.stubGlobal("window", w)
  })
  afterEach(() => { vi.unstubAllGlobals(); __resetTurnstileLoaderForTests() })

  it("resolves with window.turnstile once the script loads", async () => {
    const fake: TurnstileGlobal = { render: () => "w1" }
    const head = (document as any).head
    const orig = head.appendChild
    head.appendChild = (node: any) => {
      ;(globalThis as any).turnstile = fake
      orig.call(head, node)
    }
    const g = await injectTurnstileScript()
    expect(g).toBe(fake)
    expect(appended.length).toBe(1)
    expect(appended[0].src).toBe("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit")
  })

  it("resolves null when the script errors (widget must degrade, not break)", async () => {
    const head = (document as any).head
    const orig = head.appendChild
    head.appendChild = (node: any) => {
      appended.push(node)
      Promise.resolve().then(() => node.onerror && node.onerror())
    }
    orig // silence unused
    const g = await injectTurnstileScript()
    expect(g).toBeNull()
  })

  it("short-circuits to an already-present window.turnstile without injecting", async () => {
    const fake: TurnstileGlobal = { render: () => "w2" }
    ;(globalThis as any).turnstile = fake
    const g = await injectTurnstileScript()
    expect(g).toBe(fake)
    expect(appended.length).toBe(0)
  })
})

describe("getTurnstileToken", () => {
  afterEach(() => { vi.unstubAllGlobals(); __resetTurnstileLoaderForTests() })

  it("returns null immediately when no site key is provided (no injection)", async () => {
    // No DOM stub needed: the empty-key guard returns before touching document.
    expect(await getTurnstileToken("")).toBeNull()
  })

  it("resolves with the token the render callback delivers", async () => {
    __resetTurnstileLoaderForTests()
    const body = { appendChild() {}, }
    // Pre-seed window.turnstile so injectTurnstileScript short-circuits (no script load needed).
    const fake: TurnstileGlobal = {
      render: (_el: HTMLElement, opts: any) => { Promise.resolve().then(() => opts.callback("tok_abc")); return "w3" },
      remove: () => {},
    }
    ;(globalThis as any).turnstile = fake
    vi.stubGlobal("document", { body, head: body, documentElement: body, createElement: () => ({ style: {}, remove() {} }) })
    vi.stubGlobal("window", globalThis)
    const token = await getTurnstileToken("site_key_1", 2000)
    expect(token).toBe("tok_abc")
  })

  it("resolves null on the error-callback (fail-safe)", async () => {
    __resetTurnstileLoaderForTests()
    const body = { appendChild() {} }
    const fake: TurnstileGlobal = {
      render: (_el: HTMLElement, opts: any) => { Promise.resolve().then(() => opts["error-callback"]()); return "w4" },
      remove: () => {},
    }
    ;(globalThis as any).turnstile = fake
    vi.stubGlobal("document", { body, head: body, documentElement: body, createElement: () => ({ style: {}, remove() {} }) })
    vi.stubGlobal("window", globalThis)
    const token = await getTurnstileToken("site_key_1", 2000)
    expect(token).toBeNull()
  })
})
