// @vitest-environment jsdom
// snap-share-hint: the hover preview that mimics the browser's "Allow … to see this tab?" dialog and steers
// the reporter to click Allow, plus the best-effort permission check that decides whether to show it.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { createSharePickerHint, shareCaptureLikelyGranted } from "./share-hint"

describe("createSharePickerHint", () => {
  beforeEach(() => { document.body.innerHTML = "" })

  it("renders an Allow-dialog mock with the host, the Allow button, and the steer copy", () => {
    const el = createSharePickerHint({ host: "bookjoy.co", title: "One click to snap this tab", steer: "Just click Allow — pixel-perfect." })
    document.body.appendChild(el)
    const text = el.textContent || ""
    expect(text).toContain("Allow bookjoy.co to see this tab?")
    expect(el.querySelector(".kl-shp-allow")?.textContent).toBe("Allow")
    expect(el.querySelector(".kl-shp-cancel")?.textContent).toBe("Cancel")
    expect(text).toContain("One click to snap this tab")
    expect(text).toContain("Just click Allow — pixel-perfect.")
  })

  it("injects the host via textContent (no HTML injection)", () => {
    const el = createSharePickerHint({ host: "<img src=x onerror=alert(1)>", title: "t", steer: "s" })
    document.body.appendChild(el)
    // The malicious host is rendered as text, never parsed into an element.
    expect(el.querySelector("img")).toBeNull()
    expect((el.querySelector(".kl-shp-dt")?.textContent || "")).toContain("<img src=x onerror=alert(1)>")
  })
})

describe("shareCaptureLikelyGranted", () => {
  const origPerms = (navigator as any).permissions
  afterEach(() => { try { Object.defineProperty(navigator, "permissions", { value: origPerms, configurable: true }) } catch {} })

  it("returns false when the Permissions API is unavailable (→ show the hint)", async () => {
    try { Object.defineProperty(navigator, "permissions", { value: undefined, configurable: true }) } catch {}
    expect(await shareCaptureLikelyGranted()).toBe(false)
  })

  it("returns true only when display-capture reports 'granted'", async () => {
    try { Object.defineProperty(navigator, "permissions", { value: { query: vi.fn().mockResolvedValue({ state: "granted" }) }, configurable: true }) } catch {}
    expect(await shareCaptureLikelyGranted()).toBe(true)
    try { Object.defineProperty(navigator, "permissions", { value: { query: vi.fn().mockResolvedValue({ state: "prompt" }) }, configurable: true }) } catch {}
    expect(await shareCaptureLikelyGranted()).toBe(false)
  })

  it("never throws if the query rejects", async () => {
    try { Object.defineProperty(navigator, "permissions", { value: { query: vi.fn().mockRejectedValue(new Error("nope")) }, configurable: true }) } catch {}
    expect(await shareCaptureLikelyGranted()).toBe(false)
  })
})
