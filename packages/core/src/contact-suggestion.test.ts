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

// ── KD-174: searchable dropdown + the field resolves to a person ──────────────
// These cover what the reference video shows and what the earlier synthetic tests missed: the list
// opens on FOCUS (not only on typing), and text that was never picked is discarded when focus leaves.
const tick = () => new Promise((r) => setTimeout(r, 5))

describe("KD-174 combobox behaviour", () => {
  it("suppresses the browser's own autofill, which would overlay our list and steal the first Enter", () => {
    buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const input = shadow().querySelector("#klavity-remail") as HTMLInputElement
    // "off" is ignored by Chrome on email-shaped fields; an unrecognised token is what actually works.
    expect(input.getAttribute("autocomplete")).not.toBe("email")
    expect(input.getAttribute("autocomplete")).not.toBe("on")
    expect(input.getAttribute("role")).toBe("combobox")
    expect(input.getAttribute("aria-autocomplete")).toBe("list")
  })

  it("opens on focus and lists the roster without any typing", async () => {
    const people = [{ email: "ritu.p@quantana.in" }, { email: "newperson@acme.test", name: "New Person" }]
    buildModal("bug", { ...baseCallbacks(), onLookupPeople: vi.fn().mockResolvedValue(people) } as any, { theme: "light" } as any)
    const sr = shadow()
    ;(sr.querySelector("#klavity-remail") as HTMLInputElement).dispatchEvent(new FocusEvent("focus"))
    await tick(); await tick()
    expect((sr.querySelector("#klavity-remail-sugg") as HTMLElement).hidden).toBe(false)
    expect(sr.querySelectorAll(".klavity-remail-person").length).toBe(2)
  })

  it("filters the roster from the FIRST character", async () => {
    const people = [{ email: "ritu.p@quantana.in" }, { email: "bob@acme.test", name: "Bob" }]
    buildModal("bug", { ...baseCallbacks(), onLookupPeople: vi.fn().mockResolvedValue(people) } as any, { theme: "light" } as any)
    const sr = shadow()
    const input = sr.querySelector("#klavity-remail") as HTMLInputElement
    input.dispatchEvent(new FocusEvent("focus"))
    await tick(); await tick()
    input.value = "r"; input.dispatchEvent(new Event("input"))
    expect(sr.querySelectorAll(".klavity-remail-person").length).toBe(1)
  })

  it("discards an address that was never picked when focus leaves", async () => {
    buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const sr = shadow()
    const input = sr.querySelector("#klavity-remail") as HTMLInputElement
    input.dispatchEvent(new FocusEvent("focus"))
    input.value = "someone@new.test"; input.dispatchEvent(new Event("input"))
    input.dispatchEvent(new FocusEvent("blur"))
    await tick(); await tick()
    expect(input.value).toBe("")
  })

  it("keeps the address once Create has been picked", async () => {
    buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const sr = shadow()
    const input = sr.querySelector("#klavity-remail") as HTMLInputElement
    input.dispatchEvent(new FocusEvent("focus"))
    input.value = "someone@new.test"; input.dispatchEvent(new Event("input"))
    ;(sr.querySelector("#klavity-remail-addcontact") as HTMLButtonElement).click()
    input.dispatchEvent(new FocusEvent("blur"))
    await tick(); await tick()
    expect(input.value).toBe("someone@new.test")
  })

  it("never discards on a gated project — there the typed address IS the submission", async () => {
    buildModal("bug", { ...baseCallbacks(), requireEmail: true } as any, { theme: "light" } as any)
    const sr = shadow()
    const input = sr.querySelector("#klavity-remail") as HTMLInputElement
    input.dispatchEvent(new FocusEvent("focus"))
    input.value = "buyer@test.local"; input.dispatchEvent(new Event("input"))
    input.dispatchEvent(new FocusEvent("blur"))
    await tick(); await tick()
    expect(input.value).toBe("buyer@test.local")
  })
})
