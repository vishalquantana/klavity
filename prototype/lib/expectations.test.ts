// prototype/lib/expectations.test.ts
import { test, expect } from "bun:test"
import { mergeSource, shouldValidate, nextStatus, matchExpectation, matchExpectationWithNearMisses, NEAR_MISS_MIN, RECURRENCE_VALIDATE_N,
  urlPathOf, trailUrlPathScore, pickDefaultTrail, validationProgress } from "./expectations"

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

// B.10 (KLA-250): the progress-to-Confirmed hint must be consistent with shouldValidate's inputs.
test("validationProgress: ready once shouldValidate holds; else the shortest remaining path", () => {
  // Already qualifies (both sources) → ready, no waiting hint.
  const both = validationProgress({ snap: true, sim: true, recurrence: 1 })
  expect(both.ready).toBe(true)
  expect(shouldValidate({ snap: true, sim: true, recurrence: 1 })).toBe(true)

  // One source (snap only) → needs a Sim as the missing second source.
  const snapOnly = validationProgress({ snap: true, sim: false, recurrence: 1 })
  expect(snapOnly.ready).toBe(false)
  expect(snapOnly.hint).toContain("a Sim")

  // One source (sim only) → needs a human report.
  const simOnly = validationProgress({ snap: false, sim: true, recurrence: 1 })
  expect(simOnly.ready).toBe(false)
  expect(simOnly.hint).toContain("a human report")

  // No source, recurrence 2 → one more sighting reaches N=3.
  const none2 = validationProgress({ snap: false, sim: false, recurrence: 2 })
  expect(none2.ready).toBe(false)
  expect(none2.hint).toContain("1 more sighting")
  expect(none2.hint).not.toContain("1 more sightings")

  // Recurrence already at N → ready (consistent with shouldValidate).
  const recN = validationProgress({ snap: false, sim: false, recurrence: RECURRENCE_VALIDATE_N })
  expect(recN.ready).toBe(true)
})

test("nextStatus promotes candidate only; enforced is terminal", () => {
  expect(nextStatus("candidate", { snap: true, sim: true, recurrence: 2 })).toBe("validated")
  expect(nextStatus("candidate", { snap: true, sim: false, recurrence: 1 })).toBe("candidate")
  expect(nextStatus("enforced", { snap: true, sim: true, recurrence: 9 })).toBe("enforced")
})

// B.9 (KLA-249): a retired row is NOT a roach motel — a fresh signal resurrects it to candidate,
// instead of silently absorbing corroboration forever in "retired".
test("B.9: nextStatus resurrects a retired row to candidate on a fresh signal", () => {
  // A retired issue resurfaces (upsert already bumped corroboration on the matched retired row).
  expect(nextStatus("retired", { snap: true, sim: false, recurrence: 1 })).toBe("candidate")
  // Even a retired row whose corroboration already clears the validate bar comes back as CANDIDATE
  // (it must re-earn its way up — we never jump a resurrected row straight to validated/enforced).
  expect(nextStatus("retired", { snap: true, sim: true, recurrence: 5 })).toBe("candidate")
  expect(nextStatus("retired", { snap: false, sim: false, recurrence: 9 })).toBe("candidate")
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
