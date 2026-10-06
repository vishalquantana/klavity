// @vitest-environment jsdom
// QPQ-31: behavioural coverage for the "Add <email> as a contact" suggestion under the composer's
// Email field. The string-level tests in prototype/ pin the markup; these drive the real buildModal()
// DOM, because the reported symptom ("I typed a new email and got no suggestion") is a runtime
// question, not a markup one.
import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

function shadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.getAttribute("data-klavity-ui") === "composer" && el.shadowRoot) return el.shadowRoot
  }
  throw new Error("composer host not found")
}
const baseCallbacks = () => ({
  onCaptureFull: vi.fn().mockResolvedValue({ dataUrl: "data:image/png;base64,F", quality: "rendered" as const }),
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" }),
})
function typeEmail(sr: ShadowRoot, value: string) {
  const input = sr.querySelector("#klavity-remail") as HTMLInputElement
  input.value = value
  input.dispatchEvent(new Event("input"))
  return input
}

beforeEach(() => { document.body.innerHTML = "" })

describe("contact suggestion under the Email field", () => {
  it("is hidden before anything is typed", () => {
    buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const sugg = shadow().querySelector("#klavity-remail-sugg") as HTMLElement
    expect(sugg).toBeTruthy()
    expect(sugg.hidden).toBe(true)
  })

  it("appears as soon as a well-formed address is typed, naming that address", () => {
    buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const sr = shadow()
    typeEmail(sr, "newperson@acme.test")
    const sugg = sr.querySelector("#klavity-remail-sugg") as HTMLElement
    expect(sugg.hidden).toBe(false)
    expect(sr.querySelector(".klavity-remail-sugg-em")?.textContent).toBe("newperson@acme.test")
  })

  it("stays hidden for a half-typed address", () => {
    buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const sr = shadow()
    typeEmail(sr, "newperson@")
    expect((sr.querySelector("#klavity-remail-sugg") as HTMLElement).hidden).toBe(true)
  })

  it("toggles on click, and the choice reaches onSubmit as createContact", async () => {
    const cbs = baseCallbacks()
    buildModal("bug", { ...cbs } as any, { theme: "light" } as any)
    const sr = shadow()
    typeEmail(sr, "newperson@acme.test")
    const btn = sr.querySelector("#klavity-remail-addcontact") as HTMLButtonElement
    btn.click()
    expect(btn.getAttribute("aria-selected")).toBe("true")

    const desc = sr.querySelector("#klavity-desc") as HTMLElement
    desc.textContent = "filter panel closes on its own"
    desc.dispatchEvent(new Event("input"))
    ;(sr.querySelector("#klavity-submit") as HTMLButtonElement).click()
    await Promise.resolve(); await Promise.resolve()

    const payload = cbs.onSubmit.mock.calls[0][0]
    expect(payload.reporterEmail).toBe("newperson@acme.test")
    expect(payload.createContact).toBe(true)
  })

  it("does not claim contact intent when the suggestion was never selected", async () => {
    const cbs = baseCallbacks()
    buildModal("bug", { ...cbs } as any, { theme: "light" } as any)
    const sr = shadow()
    typeEmail(sr, "newperson@acme.test")
    const desc = sr.querySelector("#klavity-desc") as HTMLElement
    desc.textContent = "x"
    desc.dispatchEvent(new Event("input"))
    ;(sr.querySelector("#klavity-submit") as HTMLButtonElement).click()
    await Promise.resolve(); await Promise.resolve()
    expect(cbs.onSubmit.mock.calls[0][0].createContact).toBe(false)
  })

  it("drops a pending choice when the address is edited afterwards", async () => {
    const cbs = baseCallbacks()
    buildModal("bug", { ...cbs } as any, { theme: "light" } as any)
    const sr = shadow()
    typeEmail(sr, "first@acme.test")
    ;(sr.querySelector("#klavity-remail-addcontact") as HTMLButtonElement).click()
    typeEmail(sr, "second@acme.test")   // changed their mind about the address
    const btn = sr.querySelector("#klavity-remail-addcontact") as HTMLButtonElement
    expect(btn.getAttribute("aria-selected")).toBe("false")

    const desc = sr.querySelector("#klavity-desc") as HTMLElement
    desc.textContent = "x"
    desc.dispatchEvent(new Event("input"))
    ;(sr.querySelector("#klavity-submit") as HTMLButtonElement).click()
    await Promise.resolve(); await Promise.resolve()
    const payload = cbs.onSubmit.mock.calls[0][0]
    expect(payload.reporterEmail).toBe("second@acme.test")
    expect(payload.createContact).toBe(false)
  })
})
