// lib/recurrence-memory.test.ts
// Unit tests for the pure helpers in recurrence-memory.ts.
// No DB required — buildSummary/ordinal are side-effect-free.
import { test, expect } from "bun:test"
import { ordinal, buildSummary, recurrenceImpact } from "./recurrence-memory"

// ── ordinal ─────────────────────────────────────────────────────────────────

test("ordinal: 1st, 2nd, 3rd, then -th", () => {
  expect(ordinal(1)).toBe("1st")
  expect(ordinal(2)).toBe("2nd")
  expect(ordinal(3)).toBe("3rd")
  expect(ordinal(4)).toBe("4th")
  expect(ordinal(10)).toBe("10th")
})

test("ordinal: teen exceptions (11, 12, 13 all -th)", () => {
  expect(ordinal(11)).toBe("11th")
  expect(ordinal(12)).toBe("12th")
  expect(ordinal(13)).toBe("13th")
  // 111, 112, 113 follow mod100 → also -th
  expect(ordinal(111)).toBe("111th")
  expect(ordinal(112)).toBe("112th")
  expect(ordinal(113)).toBe("113th")
})

test("ordinal: 21st, 22nd, 23rd resume normal pattern", () => {
  expect(ordinal(21)).toBe("21st")
  expect(ordinal(22)).toBe("22nd")
  expect(ordinal(23)).toBe("23rd")
  expect(ordinal(100)).toBe("100th")
})

// ── buildSummary ─────────────────────────────────────────────────────────────

const D = new Date("2026-06-01T00:00:00Z").getTime()

test("buildSummary: first occurrence, no Sim", () => {
  const s = buildSummary(1, D, null)
  expect(s).toContain("First occurrence")
  expect(s).toContain("2026-06-01")
  expect(s).toContain("previous reporter")
  expect(s).not.toContain("occurrence.") // "First occurrence" phrasing, not "Xth occurrence."
})

test("buildSummary: first occurrence with Sim name", () => {
  const s = buildSummary(1, D, "Alice")
  expect(s).toContain("First occurrence")
  expect(s).toContain("Alice")
  expect(s).toContain("(Sim)")
  expect(s).not.toContain("previous reporter")
})

test("buildSummary: 2nd occurrence, Sim name", () => {
  const ts = new Date("2026-06-10T00:00:00Z").getTime()
  const s = buildSummary(2, ts, "Alice")
  expect(s).toContain("2nd occurrence")
  expect(s).toContain("Alice")
  expect(s).toContain("2026-06-10")
})

test("buildSummary: 4th occurrence, no Sim", () => {
  const ts = new Date("2026-06-15T00:00:00Z").getTime()
  const s = buildSummary(4, ts, null)
  expect(s).toContain("4th occurrence")
  expect(s).toContain("previous reporter")
  expect(s).toContain("2026-06-15")
})

test("buildSummary: large count uses correct ordinal (11th)", () => {
  const s = buildSummary(11, D, "Bob")
  expect(s).toContain("11th occurrence")
  expect(s).toContain("Bob")
})

test("buildSummary: 21st uses correct ordinal", () => {
  const s = buildSummary(21, D, null)
  expect(s).toContain("21st occurrence")
})

// ── recurrenceImpact (KLAVITYKLA-236) ─────────────────────────────────────────

test("recurrenceImpact: single non-regressed report is a mild notice", () => {
  const i = recurrenceImpact({ count: 2, regressed: false })
  expect(i.level).toBe(1)
  expect(i.tier).toBe("recurring")
  expect(i.regressed).toBe(false)
})

test("recurrenceImpact: escalates level with count (persistent → chronic)", () => {
  expect(recurrenceImpact({ count: 3, regressed: false }).level).toBe(2)
  expect(recurrenceImpact({ count: 4, regressed: false }).tier).toBe("persistent")
  expect(recurrenceImpact({ count: 5, regressed: false }).level).toBe(3)
  expect(recurrenceImpact({ count: 9, regressed: false }).tier).toBe("chronic")
})

test("recurrenceImpact: headline conveys trust weight, not a bare number", () => {
  const chronic = recurrenceImpact({ count: 6, regressed: false })
  expect(chronic.headline.toLowerCase()).toContain("chronic")
  const regr = recurrenceImpact({ count: 2, regressed: true })
  expect(regr.headline.toLowerCase()).toContain("broke again")
})

test("recurrenceImpact: regression always outranks a plain repeat", () => {
  const regr = recurrenceImpact({ count: 2, regressed: true })
  const chronic = recurrenceImpact({ count: 20, regressed: false })
  expect(regr.tier).toBe("regression")
  expect(regr.level).toBeGreaterThanOrEqual(3)
  expect(regr.score).toBeGreaterThan(chronic.score) // regressions surface first
})

test("recurrenceImpact: repeated regression stings harder (level 4)", () => {
  expect(recurrenceImpact({ count: 3, regressed: true }).level).toBe(4)
  expect(recurrenceImpact({ count: 2, regressed: true }).level).toBe(3)
})

test("recurrenceImpact: score is monotonic in count so ranking is stable", () => {
  const a = recurrenceImpact({ count: 2, regressed: false }).score
  const b = recurrenceImpact({ count: 3, regressed: false }).score
  const c = recurrenceImpact({ count: 5, regressed: false }).score
  expect(b).toBeGreaterThan(a)
  expect(c).toBeGreaterThan(b)
})

test("recurrenceImpact: guards bad input (0/NaN → count 1)", () => {
  expect(recurrenceImpact({ count: 0, regressed: false }).count).toBe(1)
  expect(recurrenceImpact({ count: NaN as any, regressed: false }).count).toBe(1)
})
