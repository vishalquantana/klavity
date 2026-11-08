import { test, expect } from "bun:test"
import {
  QA_RULES, VALIDATION_EXCLUSIONS, canonicalValidations, parseValidations, enrichQaPersona, isQaPersona, normalizePersonaKind, qaRunPrompt,
} from "./sim-validations"

test("exactly three mandatory rules, no visual-QA category checklist", () => {
  expect(QA_RULES.map((r) => r.id)).toEqual(["duplicate-prevention", "ui-identification", "evidence-integrity"])
  const all = JSON.stringify(QA_RULES).toLowerCase()
  for (const retired of ["typography", "responsive", "accessibility", "spelling"]) expect(all).not.toContain(retired)
})

test("canonicalValidations returns a fresh copy; AutoSIM work is excluded", () => {
  const a = canonicalValidations(); a.rules[0].checks.push("x"); a.exclusions.length = 0
  expect(canonicalValidations().rules[0].checks).not.toContain("x")
  expect(canonicalValidations().exclusions).toEqual(VALIDATION_EXCLUSIONS)
  expect(VALIDATION_EXCLUSIONS.join(" ").toLowerCase()).toContain("clicking")
})

test("enrichQaPersona: QA gets rules, customer unchanged, idempotent, rules cannot be removed", () => {
  const qa = enrichQaPersona({ name: "Q", summary: "mine" }, "qa")
  expect(qa.personaKind).toBe("qa")
  expect(qa.validations!.rules).toHaveLength(3)
  expect(enrichQaPersona(qa)).toEqual(qa)
  expect(enrichQaPersona({ ...qa, validations: { version: 1, rules: [], exclusions: [] } }).validations).toEqual(canonicalValidations())
  expect(qa.summary).toBe("mine")
  const cust = enrichQaPersona({ name: "C" })
  expect(cust.personaKind).toBe("customer")
  expect((cust as any).validations).toBeUndefined()
  expect(normalizePersonaKind("QA")).toBe("qa")
  expect(isQaPersona({ personaKind: "qa" })).toBe(true)
  expect(parseValidations("{bad")).toBeNull()
})

test("qaRunPrompt: names the rules, forbids interaction/repro, adapts to element list availability", () => {
  const withEls = qaRunPrompt(canonicalValidations() as any, { hasElements: true })
  const without = qaRunPrompt(null, { hasElements: false })
  for (const p of [withEls, without]) {
    expect(p).toContain("Duplicate Issue Prevention")
    expect(p).toContain("Accurate UI Identification")
    expect(p).toContain("Screenshot Evidence Integrity")
    expect(p).toContain("NEVER click")
  }
  expect(withEls).toContain("elementId")
  expect(without).toContain("Do NOT invent a selector")
})
