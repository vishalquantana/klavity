// @vitest-environment node
// Unit tests for resolveModalConfig white-label propagation (KLAVITYKLA-311).
// Also covers idempotency: resolving an already-resolved config still works.

import { describe, it, expect } from "vitest"
import { resolveModalConfig } from "./modal-theme"

describe("resolveModalConfig — whiteLabel", () => {
  it("returns whiteLabel:undefined when agency_branding is absent", () => {
    const r = resolveModalConfig({ theme: "light" })
    expect(r.whiteLabel).toBeUndefined()
  })

  it("returns whiteLabel:undefined when agency_branding.whiteLabel is false", () => {
    const r = resolveModalConfig({ theme: "light", agency_branding: { whiteLabel: false } })
    expect(r.whiteLabel).toBeUndefined()
  })

  it("returns whiteLabel:true when agency_branding.whiteLabel is true (stored format)", () => {
    const r = resolveModalConfig({ theme: "light", agency_branding: { whiteLabel: true } })
    expect(r.whiteLabel).toBe(true)
  })

  it("returns whiteLabel:true when top-level whiteLabel:true is present (already-resolved passthrough)", () => {
    const r = resolveModalConfig({ theme: "light", whiteLabel: true })
    expect(r.whiteLabel).toBe(true)
  })

  it("is idempotent: resolving an already-resolved config with whiteLabel preserves it", () => {
    const first = resolveModalConfig({ agency_branding: { whiteLabel: true } })
    expect(first.whiteLabel).toBe(true)
    const second = resolveModalConfig(first)
    expect(second.whiteLabel).toBe(true)
  })

  it("agency_branding.whiteLabel does not affect other resolved fields", () => {
    const r = resolveModalConfig({ theme: "dark", agency_branding: { whiteLabel: true, name: "Acme" } })
    expect(r.theme).toBe("dark")
    expect(r.whiteLabel).toBe(true)
    // name is not a ModalConfig field — should not leak through
    expect((r as any).name).toBeUndefined()
  })
})
