// prototype/lib/expectations.test.ts
import { test, expect } from "bun:test"
import { mergeSource, shouldValidate, nextStatus, matchExpectation, matchExpectationWithNearMisses, NEAR_MISS_MIN, RECURRENCE_VALIDATE_N,
  urlPathOf, trailUrlPathScore, pickDefaultTrail } from "./expectations"

test("mergeSource sets the flag and bumps recurrence", () => {
  const c0 = { snap: false, sim: false, recurrence: 0 }
  const c1 = mergeSource(c0, "snap")
  expect(c1).toEqual({ snap: true, sim: false, recurrence: 1 })
  const c2 = mergeSource(c1, "sim")
  expect(c2).toEqual({ snap: true, sim: true, recurrence: 2 })
})

test("shouldValidate: cross-source agreement OR recurrence>=N", () => {
  expect(shouldValidate({ snap: true, sim: true, recurrence: 1 })).toBe(true)
  expect(shouldValidate({ snap: true, sim: false, recurrence: 1 })).toBe(false)
  expect(shouldValidate({ snap: false, sim: true, recurrence: RECURRENCE_VALIDATE_N })).toBe(true)
})

test("nextStatus promotes candidate only; enforced is terminal", () => {
  expect(nextStatus("candidate", { snap: true, sim: true, recurrence: 2 })).toBe("validated")
  expect(nextStatus("candidate", { snap: true, sim: false, recurrence: 1 })).toBe("candidate")
  expect(nextStatus("enforced", { snap: true, sim: true, recurrence: 9 })).toBe("enforced")
})

test("matchExpectation finds a lexical near-duplicate, else null", () => {
  const existing = [{ id: "e1", title: "Finish button missing on onboarding" }]
  expect(matchExpectation({ title: "Finish button is missing on onboarding" }, existing)).toBe("e1")
  // in-band (~0.91): guards against threshold drift above ~0.92
  expect(matchExpectation({ title: "Finish button missing on the onboarding" }, existing)).toBe("e1")
  expect(matchExpectation({ title: "Payment gateway integration request" }, existing)).toBe(null)
})

// ── KLA-251 (B.11): near-miss instrumentation, pure layer ────────────────────
// matchExpectationWithNearMisses must return the SAME matchId as matchExpectation for every
// input (accept behavior unchanged) and additionally surface declined pairs in [0.55, 0.82).

test("B.11: matchId is identical to matchExpectation across accept / band / noise", () => {
  const existing = [{ id: "e1", title: "Finish button missing on onboarding page" }]
  for (const cand of [
    "Finish button gone on onboarding page",          // ~0.82+ → matches
    "Submit button missing on onboarding page",        // ~0.78 → near-miss (no match)
    "Payment gateway integration request",             // noise → no match
  ]) {
    const legacy = matchExpectation({ title: cand }, existing)
    const next = matchExpectationWithNearMisses({ title: cand }, existing).matchId
    expect(next).toBe(legacy)
  }
})

test("B.11: just-below-0.82 pair is a logged near-miss; >=0.82 matches without logging", () => {
  const existing = [{ id: "e1", title: "Finish button missing on onboarding page" }]

  // Just below threshold (~0.78) → NOT matched, but IS a near-miss.
  const below = matchExpectationWithNearMisses({ title: "Submit button missing on onboarding page" }, existing)
  expect(below.matchId).toBe(null)
  expect(below.nearMisses.length).toBe(1)
  expect(below.nearMisses[0].existingId).toBe("e1")
  expect(below.nearMisses[0].score).toBeGreaterThanOrEqual(NEAR_MISS_MIN)
  expect(below.nearMisses[0].score).toBeLessThan(0.82)

  // At/above threshold (~0.82) → matched, and the accepted pair is NOT emitted as a near-miss.
  const at = matchExpectationWithNearMisses({ title: "Finish button gone on onboarding page" }, existing)
  expect(at.matchId).toBe("e1")
  expect(at.nearMisses.find((n) => n.existingId === "e1")).toBeUndefined()
})

test("B.11: below-band noise produces NO near-miss (lower edge filters junk)", () => {
  const existing = [{ id: "e1", title: "Finish button missing on onboarding" }]
  const r = matchExpectationWithNearMisses({ title: "Payment gateway integration request" }, existing)
  expect(r.matchId).toBe(null)
  expect(r.nearMisses.length).toBe(0)
})

// ── B.5 (KLA-245): Trail picker default-by-urlPath (never a silent "first Trail" guess) ──

test("B.5: urlPathOf normalizes absolute, relative, and query/hash-bearing URLs", () => {
  expect(urlPathOf("https://shop.test/signup?ref=1#top")).toBe("/signup")
  expect(urlPathOf("/checkout/confirm")).toBe("/checkout/confirm")
  expect(urlPathOf("http://x/y/z")).toBe("/y/z")
  expect(urlPathOf("")).toBe("")
  expect(urlPathOf(null)).toBe("")
})

test("B.5: trailUrlPathScore rewards exact > containment > same-segment > none", () => {
  const t = (stepUrls: string[], baseUrl = "https://shop.test") => ({ id: "t", baseUrl, stepUrls })
  expect(trailUrlPathScore("/signup", t(["https://shop.test/signup"]))).toBe(100)
  expect(trailUrlPathScore("/signup", t(["https://shop.test/signup/step2"]))).toBe(60)
  expect(trailUrlPathScore("/signup/details", t(["https://shop.test/signup"]))).toBe(60)
  expect(trailUrlPathScore("/signup/a", t(["https://shop.test/signup/b"]))).toBe(30)
  expect(trailUrlPathScore("/signup", t(["https://shop.test/checkout"]))).toBe(0)
  expect(trailUrlPathScore(null, t(["https://shop.test/signup"]))).toBe(0)
})

test("B.5: pickDefaultTrail picks the urlPath-matching Trail, NOT the first in the list", () => {
  // Order mimics listTrails (newest-first). A path-blind "first Trail" would pick "checkout".
  const trails = [
    { id: "checkout", baseUrl: "https://shop.test", stepUrls: ["https://shop.test/checkout"] },
    { id: "signup", baseUrl: "https://shop.test", stepUrls: ["https://shop.test/signup"] },
  ]
  const r = pickDefaultTrail("/signup", trails)
  expect(r.trailId).toBe("signup")
  expect(r.bestScore).toBe(100)
})

test("B.5: pickDefaultTrail falls back to the first Trail (bestScore 0) when no path signal", () => {
  const trails = [
    { id: "a", baseUrl: "https://shop.test", stepUrls: ["https://shop.test/x"] },
    { id: "b", baseUrl: "https://shop.test", stepUrls: ["https://shop.test/y"] },
  ]
  const r = pickDefaultTrail("/nowhere", trails)
  expect(r.trailId).toBe("a")
  expect(r.bestScore).toBe(0)
  // Zero trails → null.
  expect(pickDefaultTrail("/signup", []).trailId).toBe(null)
})
