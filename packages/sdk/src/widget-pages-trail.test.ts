// KD-162 — buildPagesTrail() decides whether a "Pages captured" trail is appended to the report
// description on submit. It used to fire for a SINGLE captured shot too, which clobbered the
// JTBD-1.10 "empty description" signal for the common single-page case (submitFeedback's
// `description.trim() ? ... : ""` check) — so a screenshot-only report with no typed description showed
// a raw page URL as its description instead of the server's clean fallback (fallbackDraftTitle).
// Mirrors packages/extension/src/evidence-store.test.ts's identical fix/tests for the extension's copy.
import { describe, it, expect } from "vitest"
import { buildPagesTrail } from "./widget"
import type { EvidenceShot } from "./evidence-session"

function shot(overrides: Partial<EvidenceShot> = {}): EvidenceShot {
  return {
    id: "s1", pageUrl: "https://a.com/list", pagePath: "/list", label: "",
    blob: new Blob([new Uint8Array([1])], { type: "image/png" }), w: 2, h: 2, ts: Date.now(),
    ...overrides,
  }
}

describe("buildPagesTrail", () => {
  it("is empty for no shots", () => {
    expect(buildPagesTrail([])).toBe("")
  })

  it("KD-162: is empty for a SINGLE shot — a one-page report gains nothing from it", () => {
    expect(buildPagesTrail([shot()])).toBe("")
  })

  it("KD-162: lists pages once there are 2+ shots (genuine multi-page evidence)", () => {
    const trail = buildPagesTrail([
      shot({ id: "s1", pageUrl: "https://a.com/list", pagePath: "/list" }),
      shot({ id: "s2", pageUrl: "https://a.com/detail", pagePath: "/detail" }),
    ])
    expect(trail).toContain("Pages captured:")
    expect(trail).toContain("1. /list")
    expect(trail).toContain("2. /detail")
  })
})
