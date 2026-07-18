// Pure unit tests for the CRO Sim engine (lib/cro-sim.ts) — no server, no LLM. Covers the two things
// that must be robust against a hostile/garbage model response: normalizeCroReport (sanitize + rank +
// cap) and croPreview (the ungated slice + locked count).
import { test, expect } from "bun:test"
import { normalizeCroReport, croPreview, CRO_PREVIEW_FRICTIONS, CRO_MAX_FRICTIONS } from "./lib/cro-sim"

test("normalizeCroReport ranks frictions worst-first by severity", () => {
  const r = normalizeCroReport({
    persona: { name: "Priya Shah", role: "Buyer", initials: "PS", accent: "#db2777", oneLiner: "I bounced." },
    verdict: "I couldn't tell what you sell.",
    frictions: [
      { title: "Minor polish", severity: "low", why: "small" },
      { title: "No value prop", severity: "critical", why: "big" },
      { title: "Weak CTA", severity: "high", why: "med" },
    ],
    oneFixNow: "Add a headline.",
  })
  expect(r.frictions.map((f) => f.severity)).toEqual(["critical", "high", "low"])
  expect(r.persona.name).toBe("Priya Shah")
  expect(r.persona.initials).toBe("PS")
})

test("normalizeCroReport coerces bad severity to medium and defaults accent", () => {
  const r = normalizeCroReport({
    persona: { name: "X", accent: "not-a-hex" },
    frictions: [{ title: "Thing", severity: "SUPER-BAD", why: "x" }],
  })
  expect(r.frictions[0].severity).toBe("medium")
  expect(r.persona.accent).toBe("#6366f1")
})

test("normalizeCroReport derives initials from the name when missing", () => {
  const r = normalizeCroReport({ persona: { name: "Sam Rivera" }, frictions: [{ title: "a", why: "b" }] })
  expect(r.persona.initials).toBe("SR")
})

test("normalizeCroReport drops empty frictions and caps the count", () => {
  const many = Array.from({ length: 20 }, (_, i) => ({ title: "F" + i, severity: "high", why: "w" }))
  many.push({ title: "", severity: "high", why: "" } as any) // noise → dropped
  const r = normalizeCroReport({ persona: { name: "X" }, frictions: many })
  expect(r.frictions.length).toBe(CRO_MAX_FRICTIONS)
  expect(r.frictions.every((f) => f.title || f.why)).toBe(true)
})

test("normalizeCroReport never throws on garbage input", () => {
  expect(() => normalizeCroReport(null)).not.toThrow()
  expect(() => normalizeCroReport("nope")).not.toThrow()
  expect(() => normalizeCroReport({ frictions: "not-an-array" })).not.toThrow()
  const empty = normalizeCroReport({})
  expect(empty.frictions).toEqual([])
  expect(empty.persona.name).toBe("A first-time visitor")
})

test("normalizeCroReport clamps overlong strings", () => {
  const r = normalizeCroReport({
    persona: { name: "X" },
    verdict: "z".repeat(5000),
    frictions: [{ title: "t".repeat(500), severity: "low", why: "y".repeat(1000), fix: "f".repeat(1000), quote: "q".repeat(1000) }],
  })
  expect(r.verdict.length).toBeLessThanOrEqual(600)
  expect(r.frictions[0].title.length).toBeLessThanOrEqual(120)
  expect(r.frictions[0].quote.length).toBeLessThanOrEqual(400)
})

test("croPreview shows only the top N frictions and reports the hidden count", () => {
  const r = normalizeCroReport({
    persona: { name: "X" },
    frictions: [
      { title: "a", severity: "critical", why: "1" },
      { title: "b", severity: "high", why: "2" },
      { title: "c", severity: "medium", why: "3" },
      { title: "d", severity: "low", why: "4" },
    ],
  })
  const p = croPreview(r)
  expect(p.frictionsShown.length).toBe(CRO_PREVIEW_FRICTIONS)
  expect(p.totalFrictions).toBe(4)
  expect(p.hiddenCount).toBe(4 - CRO_PREVIEW_FRICTIONS)
  // preview must not leak the full list
  expect((p as any).frictions).toBeUndefined()
})

test("croPreview hiddenCount is 0 when frictions fit in the preview", () => {
  const r = normalizeCroReport({ persona: { name: "X" }, frictions: [{ title: "a", severity: "high", why: "1" }] })
  const p = croPreview(r)
  expect(p.hiddenCount).toBe(0)
  expect(p.frictionsShown.length).toBe(1)
})
