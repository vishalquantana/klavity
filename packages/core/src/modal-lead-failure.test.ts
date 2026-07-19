// @vitest-environment jsdom
// KLAVITYKLA-230 — lead-gen must NOT fail silently. The success-screen email capture (renderSuccess →
// submitLead) previously swallowed any onLead() error and showed "Thanks — we'll be in touch." even when
// the lead was dropped (network error, non-2xx from the server, webhook down). These tests lock in the
// non-silent behavior: confirm ONLY on a real success; on failure show a visible, retryable error; and
// validate the email client-side so an empty/garbage value never round-trips as a false success.

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

const LEAD_COPY = {
  headline: "Thanks!",
  body: "We got your report.",
  showEmail: true,
  showCta: false,
  emailLabel: "Notify me",
  ctaText: "Visit",
  ctaUrl: "",
}

function modalShadow(): ShadowRoot {
  for (const el of Array.from(document.body.children) as HTMLElement[]) {
    if (el.shadowRoot) return el.shadowRoot
  }
  throw new Error("no modal shadow root found")
}

// Build the modal, submit a report to reach the success screen, and return the shadow root + the onLead spy.
async function toSuccessScreen(
  onLead: (feedbackId: string, email: string) => Promise<void>,
): Promise<ShadowRoot> {
  const onSubmit = vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" })
  buildModal(
    "bug",
    {
      onCaptureFull: async () => ({ dataUrl: "", quality: "rendered" as const }),
      onRegionCapture: async () => ({ dataUrl: "", quality: "rendered" as const }),
      onClose: vi.fn(),
      onSubmit,
      success: { copy: LEAD_COPY, onLead },
    },
    { theme: "light" } as any,
  )
  const shadow = modalShadow()
  const desc = shadow.getElementById("klavity-desc") as HTMLTextAreaElement
  desc.value = "Something broke."
  desc.dispatchEvent(new Event("input"))
  ;(shadow.getElementById("klavity-submit") as HTMLButtonElement).click()
  await new Promise((r) => setTimeout(r, 50))
  return shadow
}

function fillLead(shadow: ShadowRoot, email: string) {
  const input = shadow.querySelector(".klavity-lead input") as HTMLInputElement
  const btn = shadow.querySelector(".klavity-lead button") as HTMLButtonElement
  input.value = email
  btn.click()
}

beforeEach(() => {
  document.body.innerHTML = ""
})

describe("lead capture — non-silent failure (KLAVITYKLA-230)", () => {
  it("SUCCESS path: confirms only after onLead resolves, and passes the typed email", async () => {
    const onLead = vi.fn().mockResolvedValue(undefined)
    const shadow = await toSuccessScreen(onLead)
    fillLead(shadow, "buyer@co.com")
    await new Promise((r) => setTimeout(r, 20))

    expect(onLead).toHaveBeenCalledTimes(1)
    expect(onLead.mock.calls[0][1]).toBe("buyer@co.com")
    // "Thanks" confirmation appears; the input row is gone; no error shown.
    expect(shadow.querySelector(".klavity-thanks")).toBeTruthy()
    expect(shadow.querySelector(".klavity-lead")).toBeNull()
    const err = shadow.querySelector(".klavity-lead-err") as HTMLElement | null
    expect(err === null || err.style.display === "none").toBe(true)
  })

  it("FAILURE path: onLead rejects → NO false confirmation, visible error, retryable", async () => {
    const onLead = vi.fn().mockRejectedValue(new Error("lead capture failed (503)"))
    const shadow = await toSuccessScreen(onLead)
    fillLead(shadow, "buyer@co.com")
    await new Promise((r) => setTimeout(r, 20))

    expect(onLead).toHaveBeenCalledTimes(1)
    // The old bug: a "Thanks — we'll be in touch." card despite the drop. Must NOT appear.
    expect(shadow.querySelector(".klavity-thanks")).toBeNull()
    // A visible error is shown and the form stays so the visitor can retry.
    const err = shadow.querySelector(".klavity-lead-err") as HTMLElement
    expect(err).toBeTruthy()
    expect(err.style.display).toBe("block")
    expect(err.textContent || "").toMatch(/try again/i)
    const btn = shadow.querySelector(".klavity-lead button") as HTMLButtonElement
    expect(btn.disabled).toBe(false)
    expect((btn.textContent || "").toLowerCase()).toContain("retry")

    // Retry now succeeds → confirmation replaces the form.
    onLead.mockResolvedValueOnce(undefined)
    btn.click()
    await new Promise((r) => setTimeout(r, 20))
    expect(onLead).toHaveBeenCalledTimes(2)
    expect(shadow.querySelector(".klavity-thanks")).toBeTruthy()
  })

  it("VALIDATION: invalid email is a visible, non-silent error and never calls onLead", async () => {
    const onLead = vi.fn().mockResolvedValue(undefined)
    const shadow = await toSuccessScreen(onLead)
    fillLead(shadow, "not-an-email")
    await new Promise((r) => setTimeout(r, 20))

    expect(onLead).not.toHaveBeenCalled()
    expect(shadow.querySelector(".klavity-thanks")).toBeNull()
    const err = shadow.querySelector(".klavity-lead-err") as HTMLElement
    expect(err.style.display).toBe("block")
    expect(err.textContent || "").toMatch(/valid email/i)
  })
})
