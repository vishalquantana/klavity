// @vitest-environment jsdom
// KLAVITYKLA-241 (JTBD A.11): pre-submit known-issue acknowledgment in the composer.
// As the reporter types, buildModal debounces a call to onCheckKnown(description). On a match it
// renders an inline "Already reported — status: X" note above Submit; the user can still submit or
// dismiss it. These tests lock in: match surfaces the ack, non-match doesn't, dismiss hides it, and
// the note never blocks Submit.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal, type KnownIssueMatch } from "./modal"

function modalShadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.shadowRoot) return el.shadowRoot
  }
  throw new Error("no modal shadow root found")
}

function build(onCheckKnown: (d: string) => Promise<KnownIssueMatch | null>): ShadowRoot {
  buildModal(
    "bug",
    {
      onCaptureFull: async () => ({ dataUrl: "", quality: "rendered" as const }),
      onRegionCapture: async () => ({ dataUrl: "", quality: "rendered" as const }),
      onClose: vi.fn(),
      onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
      onCheckKnown,
    },
    { theme: "light" } as any,
  )
  return modalShadow()
}

async function type(shadow: ShadowRoot, text: string) {
  const desc = shadow.getElementById("klavity-desc") as HTMLTextAreaElement
  desc.value = text
  desc.dispatchEvent(new Event("input"))
  // Debounce is 500ms; wait past it plus a tick for the async lookup to resolve + render.
  await new Promise((r) => setTimeout(r, 620))
}

beforeEach(() => { document.body.innerHTML = "" })

describe("known-issue acknowledgment (KLAVITYKLA-241)", () => {
  it("MATCH: a matching description surfaces the inline ack with title + status", async () => {
    const onCheckKnown = vi.fn().mockResolvedValue({
      title: "Checkout button does nothing",
      statusLabel: "in progress",
      count: 2,
      headline: "Keeps coming back · 2x",
    } as KnownIssueMatch)
    const shadow = build(onCheckKnown)
    await type(shadow, "checkout button does nothing when I click it")

    expect(onCheckKnown).toHaveBeenCalled()
    const known = shadow.getElementById("klavity-known") as HTMLElement
    expect(known.hidden).toBe(false)
    expect(known.textContent || "").toContain("Checkout button does nothing")
    expect(known.textContent || "").toContain("in progress")
    // The ack must NOT block Submit — a typed description keeps it enabled.
    expect((shadow.getElementById("klavity-submit") as HTMLButtonElement).disabled).toBe(false)
  })

  it("NO MATCH: an unmatched description shows no ack", async () => {
    const onCheckKnown = vi.fn().mockResolvedValue(null)
    const shadow = build(onCheckKnown)
    await type(shadow, "some brand new issue nobody has reported before")

    expect(onCheckKnown).toHaveBeenCalled()
    const known = shadow.getElementById("klavity-known") as HTMLElement
    expect(known.hidden).toBe(true)
  })

  it("DISMISS: clicking Dismiss hides the ack for the same text", async () => {
    const onCheckKnown = vi.fn().mockResolvedValue({
      title: "Search returns nothing", statusLabel: "reopened", regressed: true,
      headline: "Broke again after being fixed",
    } as KnownIssueMatch)
    const shadow = build(onCheckKnown)
    await type(shadow, "search returns zero results for products that exist")

    const known = shadow.getElementById("klavity-known") as HTMLElement
    expect(known.hidden).toBe(false)
    ;(shadow.getElementById("klavity-known-dismiss") as HTMLButtonElement).click()
    expect(known.hidden).toBe(true)
  })

  it("SHORT: a too-short description never triggers the lookup", async () => {
    const onCheckKnown = vi.fn().mockResolvedValue(null)
    const shadow = build(onCheckKnown)
    await type(shadow, "login")   // < 12 chars

    expect(onCheckKnown).not.toHaveBeenCalled()
    const known = shadow.getElementById("klavity-known") as HTMLElement
    expect(known.hidden).toBe(true)
  })
})
