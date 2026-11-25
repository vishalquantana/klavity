// @vitest-environment jsdom
// KD-993: the composer remembers the reporter's email (the host persists it via onRememberEmail and feeds it
// back as prefillEmail) and the Create option explains itself.
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
  onRememberEmail: vi.fn(),
})
function typeEmail(sr: ShadowRoot, value: string) {
  const input = sr.querySelector("#klavity-remail") as HTMLInputElement
  input.value = value
  input.dispatchEvent(new Event("input"))
  return input
}
const tick = () => new Promise((r) => setTimeout(r, 5))

beforeEach(() => { document.body.innerHTML = "" })

describe("KD-993: remembering the reporter's email", () => {
  it("prefills a remembered address and keeps it when focus leaves the field", async () => {
    const cbs = baseCallbacks()
    buildModal("bug", { ...cbs, prefillEmail: "vishal@quantana.com.au" } as any, { theme: "light" } as any)
    const sr = shadow()
    const input = sr.querySelector("#klavity-remail") as HTMLInputElement
    expect(input.value).toBe("vishal@quantana.com.au")
    input.dispatchEvent(new Event("focus"))
    input.dispatchEvent(new Event("blur"))
    await tick()
    expect(input.value).toBe("vishal@quantana.com.au")   // a remembered address is "committed": not discarded on blur
  })

  it("remembers the address when the reporter picks Create", () => {
    const cbs = baseCallbacks()
    buildModal("bug", { ...cbs } as any, { theme: "light" } as any)
    const sr = shadow()
    typeEmail(sr, "Vishal@Quantana.com.au")
    ;(sr.querySelector("#klavity-remail-addcontact") as HTMLButtonElement).click()
    expect(cbs.onRememberEmail).toHaveBeenCalledWith("vishal@quantana.com.au")
  })

  it("remembers the address on submit, even without picking Create", async () => {
    const cbs = baseCallbacks()
    buildModal("bug", { ...cbs } as any, { theme: "light" } as any)
    const sr = shadow()
    typeEmail(sr, "vishal@quantana.com.au")
    const desc = sr.querySelector("#klavity-desc") as HTMLElement
    desc.textContent = "filter panel closes on its own"
    desc.dispatchEvent(new Event("input"))
    ;(sr.querySelector("#klavity-submit") as HTMLButtonElement).click()
    await Promise.resolve(); await Promise.resolve()
    expect(cbs.onRememberEmail).toHaveBeenCalledWith("vishal@quantana.com.au")
  })

  it("does not remember a half-typed address", async () => {
    const cbs = baseCallbacks()
    buildModal("bug", { ...cbs } as any, { theme: "light" } as any)
    const sr = shadow()
    typeEmail(sr, "vishal@")
    const desc = sr.querySelector("#klavity-desc") as HTMLElement
    desc.textContent = "x"
    desc.dispatchEvent(new Event("input"))
    ;(sr.querySelector("#klavity-submit") as HTMLButtonElement).click()
    await Promise.resolve(); await Promise.resolve()
    expect(cbs.onRememberEmail).not.toHaveBeenCalledWith("vishal@")
    expect(cbs.onRememberEmail).not.toHaveBeenCalledWith(expect.stringContaining("@"))
  })

  it("forgets the saved address when the reporter clears the field and leaves it", async () => {
    const cbs = baseCallbacks()
    buildModal("bug", { ...cbs, prefillEmail: "vishal@quantana.com.au" } as any, { theme: "light" } as any)
    const sr = shadow()
    const input = typeEmail(sr, "")
    input.dispatchEvent(new Event("focus"))
    input.dispatchEvent(new Event("blur"))
    await tick()
    expect(cbs.onRememberEmail).toHaveBeenCalledWith("")
  })

  it("works when the host provides no onRememberEmail (older embeds)", () => {
    const { onRememberEmail, ...cbs } = baseCallbacks()
    void onRememberEmail
    buildModal("bug", { ...cbs } as any, { theme: "light" } as any)
    const sr = shadow()
    typeEmail(sr, "vishal@quantana.com.au")
    expect(() => (sr.querySelector("#klavity-remail-addcontact") as HTMLButtonElement).click()).not.toThrow()
  })
})

describe("KD-993: the Create option explains itself", () => {
  it('is labelled "Add <email> as a contact" with a tooltip, not a bare Create', () => {
    buildModal("bug", { ...baseCallbacks() } as any, { theme: "light" } as any)
    const sr = shadow()
    typeEmail(sr, "vishal@quantana.com.au")
    const btn = sr.querySelector("#klavity-remail-addcontact") as HTMLButtonElement
    expect(btn.textContent).toContain("as a contact")
    expect(btn.textContent).not.toMatch(/^\s*\+?\s*Create/)
    expect(btn.title).toContain("reply and tag you")
    expect(btn.title).toContain("don't get access")
    expect(sr.querySelector("#klavity-remail-sugg-hint")?.textContent).toContain("Contacts don't get project access")
  })
})
