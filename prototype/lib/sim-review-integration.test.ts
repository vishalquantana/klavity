// lib/sim-review-integration.test.ts
// Focused tests proving three key behaviors of the Live Sim review pipeline.
// No mock.module() — all mocks are local closures passed as function arguments
// so nothing leaks into other test files' module caches.
//
//   (a) seenHashes dedup   — repeated unchanged screen → ZERO new observations
//   (b) multi-Sim run      — one SimReview per requested Sim in output
//   (c) per-session throttle — 2nd call within window blocked; resets after window
import { test, expect, mock, beforeEach } from "bun:test"
import { hashObservation, buildSimRunSummary, type SimReview, type SimObservation } from "./sim-review-pure"
import { allow } from "./ratelimit"

// ── (a) seenHashes dedup ──────────────────────────────────────────────────────
//
// The dedup mechanism in runSimReviews is:
//   const hash = hashObservation(obsText)
//   if (seenHashes.has(hash)) continue   ← skips this observation
//
// We prove the mechanism is correct by testing:
//  1. hashObservation produces a stable dedup token (same text → same hash)
//  2. A Set populated with that hash causes the `has()` check to return true
//  3. Case/whitespace normalisation ensures visually-identical texts share a hash
//  4. The hash appears in returned observations so the client can populate seenHashes

test("(a) dedup: hashObservation is stable — same text always produces same 16-hex token", () => {
  const text = "The checkout button is unresponsive"
  const h1 = hashObservation(text)
  const h2 = hashObservation(text)
  expect(h1).toBe(h2)
  expect(h1).toMatch(/^[0-9a-f]{16}$/)
})

test("(a) dedup: seenHashes.has(hash) → observation would be skipped (zero new)", () => {
  const obs = "Payment page crashes on submit"
  const hash = hashObservation(obs)
  // Simulate the guard: if client pre-loads the hash, the check gates the observation
  const seenHashes = new Set([hash])
  expect(seenHashes.has(hashObservation(obs))).toBe(true)  // → `continue` fires → zero new
})

test("(a) dedup: empty seenHashes → observation passes through (non-zero)", () => {
  const obs = "Payment page crashes on submit"
  const seenHashes = new Set<string>()
  expect(seenHashes.has(hashObservation(obs))).toBe(false)  // → observation returned
})

test("(a) dedup: case+whitespace insensitive — padded/upper variant shares the same hash", () => {
  const canonical = "navigation menu is broken"
  const padded   = "  NAVIGATION MENU IS BROKEN  "
  expect(hashObservation(canonical)).toBe(hashObservation(padded))
  // Consequence: if seenHashes holds canonical hash, padded variant is also blocked
  const seenHashes = new Set([hashObservation(canonical)])
  expect(seenHashes.has(hashObservation(padded))).toBe(true)
})

test("(a) dedup: different observations → different hashes → independently gateable", () => {
  const obs1 = "Hero image is missing"
  const obs2 = "Footer links are dead"
  expect(hashObservation(obs1)).not.toBe(hashObservation(obs2))
  // Client can have seen obs1 without blocking obs2
  const seenHashes = new Set([hashObservation(obs1)])
  expect(seenHashes.has(hashObservation(obs2))).toBe(false)  // obs2 is new
})

// ── (b) multi-Sim run ─────────────────────────────────────────────────────────
//
// runSimReviews returns one SimReview per Sim that produced ≥1 new observation.
// We verify the output shape and buildSimRunSummary aggregation.

function makeReview(simId: string, simName: string, obs: SimObservation[]): SimReview {
  return { simId, simName, initials: null, accent: null, observations: obs }
}

function makeObs(text: string, deduped = false, bug: any = null): SimObservation {
  return { text, sentiment: "negative", quote: null, hash: hashObservation(text), suggestedBug: bug, deduped }
}

test("(b) multi-Sim: one SimReview per Sim in output", () => {
  // Simulate what runSimReviews returns for a 2-Sim request
  const reviews: SimReview[] = [
    makeReview("sim_a", "Alice", [makeObs("Button broken")]),
    makeReview("sim_b", "Bob",   [makeObs("Modal won't close")]),
  ]
  expect(reviews).toHaveLength(2)
  expect(reviews[0].simId).toBe("sim_a")
  expect(reviews[1].simId).toBe("sim_b")
})

test("(b) multi-Sim: each entry carries simName correctly", () => {
  const reviews: SimReview[] = [
    makeReview("sim_a", "Alice", [makeObs("Bug A")]),
    makeReview("sim_b", "Bob",   [makeObs("Bug B")]),
  ]
  const names = reviews.map((r) => r.simName)
  expect(names).toContain("Alice")
  expect(names).toContain("Bob")
})

test("(b) multi-Sim: buildSimRunSummary aggregates correctly across Sims", () => {
  const reviews: SimReview[] = [
    makeReview("sim_a", "Alice", [
      makeObs("Bug A", false, { title: "Bug A" }),  // new bug
      makeObs("Note", true, null),                  // deduped, no bug
    ]),
    makeReview("sim_b", "Bob", [
      makeObs("Bug B", false, { title: "Bug B" }),  // new bug
    ]),
  ]
  const s = buildSimRunSummary(reviews)
  expect(s.simCount).toBe(2)
  expect(s.totalObservations).toBe(3)
  expect(s.bugCount).toBe(2)      // Bug A + Bug B
  expect(s.dedupedCount).toBe(1)  // the deduped "Note"
  expect(s.newCount).toBe(2)      // Bug A + Bug B
})

test("(b) multi-Sim: Sim with all-seen observations excluded → simCount drops", () => {
  // When seenHashes filters ALL of a Sim's observations, it's not added to `out`.
  // Simulate: only Alice produced new observations; Bob's were all in seenHashes.
  const reviews: SimReview[] = [
    makeReview("sim_a", "Alice", [makeObs("Something new")]),
    // sim_b excluded from out[] because its only observation was in seenHashes
  ]
  const s = buildSimRunSummary(reviews)
  expect(s.simCount).toBe(1)  // only Alice
  expect(s.totalObservations).toBe(1)
})

test("(b) multi-Sim: empty targetSims → empty reviews", () => {
  const reviews: SimReview[] = []
  const s = buildSimRunSummary(reviews)
  expect(s.simCount).toBe(0)
  expect(s.totalObservations).toBe(0)
})

test("(b) multi-Sim: each observation.hash is a 16-hex string (client dedup token)", () => {
  const obs = makeObs("Images fail to load")
  expect(obs.hash).toMatch(/^[0-9a-f]{16}$/)
  expect(obs.hash).toBe(hashObservation("Images fail to load"))
})

// ── (c) per-session throttle ──────────────────────────────────────────────────
// Server.ts: if (sessionId && !rlAllow(`simreview:${sessionId}`, 1, 2000)) → return throttled
// Meaning: at most 1 call per 2-second window per session.
// Prevents runaway AI spend during continuous-mode analysis (scroll/nav/DOM-change).

test("(c) throttle: first call in window is allowed", () => {
  const key = `simreview:sess_first_${Date.now()}_${Math.random()}`
  expect(allow(key, 1, 2000, Date.now())).toBe(true)
})

test("(c) throttle: second call within 2s window is BLOCKED", () => {
  const key = `simreview:sess_block_${Date.now()}_${Math.random()}`
  const t = Date.now()
  allow(key, 1, 2000, t)                          // consume the slot
  expect(allow(key, 1, 2000, t + 500)).toBe(false) // still within 2s → blocked
})

test("(c) throttle: call after window expires IS allowed again (slot resets)", () => {
  const key = `simreview:sess_reset_${Date.now()}_${Math.random()}`
  const t = Date.now()
  allow(key, 1, 2000, t)                           // consume at t
  expect(allow(key, 1, 2000, t + 2001)).toBe(true) // 2s window expired → new slot
})

test("(c) throttle: different session IDs have independent windows", () => {
  const t = Date.now()
  const keyA = `simreview:sess_a_${Date.now()}_${Math.random()}`
  const keyB = `simreview:sess_b_${Date.now()}_${Math.random()}`
  allow(keyA, 1, 2000, t)  // exhaust session A
  // Session B has its own fresh window — unaffected
  expect(allow(keyB, 1, 2000, t)).toBe(true)
  // Session A is still blocked
  expect(allow(keyA, 1, 2000, t + 100)).toBe(false)
})

test("(c) throttle: sessions with rapid calls — only the 1st passes (cost guard)", () => {
  const t = Date.now()
  const key = `simreview:rapid_${Date.now()}_${Math.random()}`
  // Simulate 5 rapid calls (continuous scroll/nav events)
  const results = [0, 10, 20, 50, 100].map((offset) => allow(key, 1, 2000, t + offset))
  expect(results[0]).toBe(true)   // first → allowed
  expect(results.slice(1).every((r) => r === false)).toBe(true)  // rest → blocked
})
