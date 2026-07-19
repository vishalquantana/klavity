// @vitest-environment jsdom
// Regression tests for KLAVITYKLA-311: the "Powered by Klavity" footer in the
// modal success screen must be hidden when config.whiteLabel is true (Pro),
// and must be shown when whiteLabel is absent / false (free).

import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildModal } from "./modal"

const SUCCESS_COPY = {
  headline: "Thanks!",
  body: "We got it.",
  showEmail: false,
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

async function submitModal(
  config: Record<string, unknown>,
): Promise<ShadowRoot> {
  const onSubmit = vi.fn().mockResolvedValue({ issueKey: "KLA-1", issueUrl: "" })
  buildModal(
    "bug",
    {
      onCaptureFull: async () => ({ dataUrl: "", quality: "rendered" as const }),
      onRegionCapture: async () => ({ dataUrl: "", quality: "rendered" as const }),
      onClose: vi.fn(),
      onSubmit,
      success: { copy: SUCCESS_COPY, onLead: null },
    },
    config as any,
  )

  const shadow = modalShadow()

  // Enable submit by filling the description textarea.
  const desc = shadow.getElementById("klavity-desc") as HTMLTextAreaElement
  desc.value = "Something broke."
  desc.dispatchEvent(new Event("input"))

  const btn = shadow.getElementById("klavity-submit") as HTMLButtonElement
  btn.click()

  // Wait for the async submit + renderSuccess to run.
  await new Promise((r) => setTimeout(r, 50))

  return shadow
}

beforeEach(() => {
  document.body.innerHTML = ""
})

describe("modal success screen — Powered by Klavity footer", () => {
  it("shows .klavity-pb footer on free account (no whiteLabel)", async () => {
    const shadow = await submitModal({ theme: "light" })
    const pb = shadow.querySelector(".klavity-pb")
    expect(pb).toBeTruthy()
    expect(pb?.innerHTML).toContain("Klavity")
  })

  it("hides .klavity-pb footer when config.whiteLabel is true (Pro)", async () => {
    const shadow = await submitModal({ theme: "light", whiteLabel: true })
    const pb = shadow.querySelector(".klavity-pb")
    expect(pb).toBeNull()
  })

  it("shows .klavity-pb footer when whiteLabel is explicitly false", async () => {
    const shadow = await submitModal({ theme: "light", whiteLabel: false })
    const pb = shadow.querySelector(".klavity-pb")
    expect(pb).toBeTruthy()
  })

  it("shows .klavity-pb when agency_branding.whiteLabel is absent (stored format, free)", async () => {
    const shadow = await submitModal({ theme: "light", agency_branding: {} })
    const pb = shadow.querySelector(".klavity-pb")
    expect(pb).toBeTruthy()
  })

  it("hides .klavity-pb when agency_branding.whiteLabel is true (stored format, Pro)", async () => {
    const shadow = await submitModal({ theme: "light", agency_branding: { whiteLabel: true } })
    const pb = shadow.querySelector(".klavity-pb")
    expect(pb).toBeNull()
  })
})
