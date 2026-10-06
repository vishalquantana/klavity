// @vitest-environment jsdom
//
// Regression guard for the P1 "submit failed: 400" bug. On an "email"-gated project the modal shows a
// REQUIRED email field, but the submit handler never forwarded the typed email to onSubmit, so the host
// never sent reporter_email and the server rejected every submit with 400 "A valid email is required".
import { describe, it, expect, vi } from "vitest"
import { buildModal } from "@klavity/core/modal"

function latestModalShadow(): ShadowRoot {
  const hosts = Array.from(document.body.querySelectorAll("div")).filter((d) => (d as any).shadowRoot) as HTMLElement[]
  const host = hosts.reverse().find((d) => (d as any).shadowRoot.querySelector(".klavity-modal"))
  if (!host) throw new Error("modal host not found")
  return (host as any).shadowRoot as ShadowRoot
}

describe("buildModal email gate", () => {
  it("forwards the required gate email to onSubmit as reporterEmail", async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: "fb1", issueUrl: "https://k/dashboard" }))
    buildModal("bug", { onCaptureFull: async () => "", onSubmit, requireEmail: true })

    const sr = latestModalShadow()
    const desc = sr.querySelector("#klavity-desc") as HTMLTextAreaElement
    const email = sr.querySelector("#klavity-remail") as HTMLInputElement
    const submit = sr.querySelector("#klavity-submit") as HTMLButtonElement
    expect(email).toBeTruthy() // the email field is shown when requireEmail is set

    desc.value = "checkout button does nothing"
    desc.dispatchEvent(new Event("input"))
    // submit stays disabled until a valid email is present
    expect(submit.disabled).toBe(true)
    email.value = "buyer@test.local"
    email.dispatchEvent(new Event("input"))
    expect(submit.disabled).toBe(false)

    submit.click()
    await Promise.resolve(); await Promise.resolve()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.reporterEmail).toBe("buyer@test.local")
    expect(payload.description).toBe("checkout button does nothing")
  })

  // QPQ-31 changed this: the email field is now ALWAYS rendered (optional unless requireEmail gates it),
  // so this case no longer asserts its absence — it asserts that LEAVING IT BLANK still omits reporterEmail.
  it("omits reporterEmail when the optional field is left blank", async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: "fb2", issueUrl: "https://k/dashboard" }))
    buildModal("bug", { onCaptureFull: async () => "", onSubmit }) // requireEmail falsy

    const sr = latestModalShadow()
    const desc = sr.querySelector("#klavity-desc") as HTMLTextAreaElement
    const submit = sr.querySelector("#klavity-submit") as HTMLButtonElement
    expect(sr.querySelector("#klavity-remail")).toBeTruthy() // shown, but optional

    desc.value = "x"
    desc.dispatchEvent(new Event("input"))
    submit.click()
    await Promise.resolve(); await Promise.resolve()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0].reporterEmail).toBeUndefined()
  })
})

// ── QPQ-31: optional "Email (optional)" field under Enhance with AI ───────────
describe("QPQ-31 optional email field", () => {
  it("renders directly below the Enhance with AI row, labelled optional, with the company placeholder", () => {
    buildModal("bug", { onCaptureFull: async () => "", onSubmit: vi.fn(), onEnhance: vi.fn() } as any)
    const sr = latestModalShadow()

    const email = sr.querySelector("#klavity-remail") as HTMLInputElement
    const label = sr.querySelector(".klavity-remail-label") as HTMLLabelElement
    expect(email).toBeTruthy()
    expect(email.type).toBe("email")
    expect(email.placeholder).toBe("name@company.com")
    expect(label?.textContent).toBe("Email (optional)")
    expect(label?.getAttribute("for")).toBe("klavity-remail")

    // Ordering: the enhance row comes before the label, which comes before the input.
    const enhanceRow = sr.querySelector("#klavity-enhance-row")!
    expect(enhanceRow.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(label.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("drops the '(optional)' suffix when the project's email gate is on", () => {
    buildModal("bug", { onCaptureFull: async () => "", onSubmit: vi.fn(), requireEmail: true } as any)
    const sr = latestModalShadow()
    expect((sr.querySelector(".klavity-remail-label") as HTMLLabelElement).textContent).toBe("Email")
  })

  it("still renders when Enhance with AI is unavailable (no onEnhance)", () => {
    buildModal("bug", { onCaptureFull: async () => "", onSubmit: vi.fn() } as any)
    const sr = latestModalShadow()
    expect(sr.querySelector("#klavity-enhance-row")).toBeNull()
    expect(sr.querySelector("#klavity-remail")).toBeTruthy()
  })

  it("leaves Submit enabled when optional and empty, and forwards a typed address", async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: "fb3", issueUrl: "" }))
    buildModal("bug", { onCaptureFull: async () => "", onSubmit } as any)
    const sr = latestModalShadow()
    const desc = sr.querySelector("#klavity-desc") as HTMLElement
    const email = sr.querySelector("#klavity-remail") as HTMLInputElement
    const submit = sr.querySelector("#klavity-submit") as HTMLButtonElement

    desc.textContent = "filter panel closes on its own"
    desc.dispatchEvent(new Event("input"))
    expect(submit.disabled).toBe(false) // empty optional email must not block submit

    email.value = "buyer@company.com"
    email.dispatchEvent(new Event("input"))
    expect(submit.disabled).toBe(false)

    submit.click()
    await Promise.resolve(); await Promise.resolve()
    expect(onSubmit.mock.calls[0][0].reporterEmail).toBe("buyer@company.com")
  })

  it("does not forward a half-typed address from the optional field", async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: "fb4", issueUrl: "" }))
    buildModal("bug", { onCaptureFull: async () => "", onSubmit } as any)
    const sr = latestModalShadow()
    const desc = sr.querySelector("#klavity-desc") as HTMLElement
    const email = sr.querySelector("#klavity-remail") as HTMLInputElement
    const submit = sr.querySelector("#klavity-submit") as HTMLButtonElement

    desc.textContent = "something broke"
    desc.dispatchEvent(new Event("input"))
    email.value = "buyer@"
    email.dispatchEvent(new Event("input"))
    expect(submit.disabled).toBe(false) // optional: junk must not lock the reporter out

    submit.click()
    await Promise.resolve(); await Promise.resolve()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0].reporterEmail).toBeUndefined()
  })
})
