// KLAVITYKLA-366 — the Founding Ten spot counter.
//
// The rule under test, in the founder's words: "a stale honest number beats an animated lie."
// So these tests care most about the UNHAPPY paths — an unknown count must degrade to no number,
// never to a fabricated one, and the ten-spot cap must hold on the server, not just in CSS.
import { beforeEach, expect, test } from "bun:test"
import {
  FOUNDING_TOTAL_SPOTS,
  FOUNDING_SPOTS_TTL_MS,
  computeFoundingSpots,
  decideFoundingCheckout,
  foundingRibbonLabel,
  foundingSpotsLabel,
  foundingStateToken,
  getFoundingSpots,
  resetFoundingSpotsCache,
} from "./founding"

beforeEach(() => resetFoundingSpotsCache())

// ── computeFoundingSpots ───────────────────────────────────────────────────────────────────────

test("0 taken — all ten spots open", () => {
  const s = computeFoundingSpots(0)
  expect(s).toEqual({ total: 10, taken: 0, remaining: 10, soldOut: false, known: true })
  expect(foundingSpotsLabel(s)).toBe("10 of 10 spots left")
  expect(foundingStateToken(s)).toBe("open")
})

test("some taken — remaining is total minus taken", () => {
  const s = computeFoundingSpots(3)
  expect(s.remaining).toBe(7)
  expect(s.soldOut).toBe(false)
  expect(foundingSpotsLabel(s)).toBe("7 of 10 spots left")
})

test("exactly one left reads as a last spot, not '1 of 10'", () => {
  const s = computeFoundingSpots(9)
  expect(s.remaining).toBe(1)
  expect(s.soldOut).toBe(false)
  expect(foundingSpotsLabel(s)).toBe("Last spot — 1 of 10 left")
  expect(foundingStateToken(s)).toBe("open")
})

test("exactly ten taken is SOLD OUT", () => {
  const s = computeFoundingSpots(FOUNDING_TOTAL_SPOTS)
  expect(s.remaining).toBe(0)
  expect(s.soldOut).toBe(true)
  expect(foundingStateToken(s)).toBe("soldout")
  expect(foundingSpotsLabel(s)).toBe("All 10 spots taken")
  expect(foundingRibbonLabel(s)).toBe("The Founding Ten is closed")
})

test("over-sold (11+) still reports sold out and never a negative remaining", () => {
  const s = computeFoundingSpots(14)
  expect(s.remaining).toBe(0)
  expect(s.soldOut).toBe(true)
  expect(foundingSpotsLabel(s)).not.toContain("-")
})

// ── count unavailable — the degradation contract ───────────────────────────────────────────────

test("unknown count degrades to no number — and is NOT treated as sold out", () => {
  for (const bad of [null, undefined, NaN, -1, Infinity]) {
    const s = computeFoundingSpots(bad as any)
    expect(s.known).toBe(false)
    expect(s.taken).toBeNull()
    expect(s.remaining).toBeNull()
    // Unknown must not close the offer — closing on a DB blip is its own kind of lie.
    expect(s.soldOut).toBe(false)
    expect(foundingStateToken(s)).toBe("open")
    // The offer still renders, just without a count.
    expect(foundingSpotsLabel(s)).toBe("")
    expect(foundingRibbonLabel(s)).toBe("Ten teams, then it closes")
  }
})

test("no label ever renders undefined or NaN", () => {
  for (const v of [null, undefined, NaN, 0, 1, 9, 10, 11]) {
    const label = foundingSpotsLabel(computeFoundingSpots(v as any))
    const ribbon = foundingRibbonLabel(computeFoundingSpots(v as any))
    expect(label).not.toContain("undefined")
    expect(label).not.toContain("NaN")
    expect(ribbon).not.toContain("undefined")
    expect(ribbon).not.toContain("NaN")
  }
})

// ── caching ────────────────────────────────────────────────────────────────────────────────────

test("the count is cached for the TTL — one DB read serves many pageviews", async () => {
  let calls = 0
  const counter = async () => { calls++; return 4 }
  expect((await getFoundingSpots(counter, 1_000)).remaining).toBe(6)
  expect((await getFoundingSpots(counter, 1_000 + FOUNDING_SPOTS_TTL_MS - 1)).remaining).toBe(6)
  expect(calls).toBe(1)
})

test("the cache expires after the TTL and picks up a new sale", async () => {
  let taken = 4
  let calls = 0
  const counter = async () => { calls++; return taken }
  expect((await getFoundingSpots(counter, 1_000)).remaining).toBe(6)
  taken = 5
  expect((await getFoundingSpots(counter, 1_000 + FOUNDING_SPOTS_TTL_MS + 1)).remaining).toBe(5)
  expect(calls).toBe(2)
})

test("a counter error serves the last known value — stale but honest", async () => {
  let fail = false
  const counter = async () => { if (fail) throw new Error("db down"); return 7 }
  expect((await getFoundingSpots(counter, 1_000)).remaining).toBe(3)
  fail = true
  const s = await getFoundingSpots(counter, 1_000 + FOUNDING_SPOTS_TTL_MS + 1)
  expect(s.remaining).toBe(3)
  expect(s.known).toBe(true)
})

test("a counter error with NO prior read degrades to unknown, not to zero-taken", async () => {
  const counter = async () => { throw new Error("db down") }
  const s = await getFoundingSpots(counter, 1_000)
  expect(s.known).toBe(false)
  expect(s.remaining).toBeNull()
  // The bug this guards: coercing the failure to 0 would advertise "10 of 10 spots left".
  expect(foundingSpotsLabel(s)).toBe("")
})

test("a failed read does not re-arm the TTL — the next request retries", async () => {
  let fail = true
  let calls = 0
  const counter = async () => { calls++; if (fail) throw new Error("db down"); return 2 }
  expect((await getFoundingSpots(counter, 1_000)).known).toBe(false)
  fail = false
  expect((await getFoundingSpots(counter, 1_001)).remaining).toBe(8)
  expect(calls).toBe(2)
})

// ── server-side enforcement ────────────────────────────────────────────────────────────────────

test("founding checkout is allowed while spots remain", () => {
  expect(decideFoundingCheckout({ taken: 0 }).allowed).toBe(true)
  expect(decideFoundingCheckout({ taken: 9 }).allowed).toBe(true)
})

test("the ELEVENTH founding checkout is refused with a clear message", () => {
  const d = decideFoundingCheckout({ taken: 10, currentPlan: "free" })
  expect(d.allowed).toBe(false)
  if (d.allowed) throw new Error("unreachable")
  expect(d.status).toBe(409)
  expect(d.error).toContain("closed")
  // The refusal must point at the real path forward, i.e. the standard price.
  expect(d.error).toContain("$249")
})

test("an existing founding account is never blocked by its own cap", () => {
  // They ARE one of the ten; this path is how they retry after a failed card.
  expect(decideFoundingCheckout({ taken: 10, currentPlan: "founding" }).allowed).toBe(true)
  expect(decideFoundingCheckout({ taken: null, currentPlan: "founding" }).allowed).toBe(true)
})

test("checkout FAILS CLOSED when the count is unavailable", () => {
  const d = decideFoundingCheckout({ taken: null, currentPlan: "free" })
  expect(d.allowed).toBe(false)
  if (d.allowed) throw new Error("unreachable")
  expect(d.status).toBe(503)
  // Selling a lifetime-locked 11th seat is unwindable; a refused checkout is a retry.
  expect(d.error).toContain("try again")
})

test("prices quoted in refusal copy match KLAVITYKLA-379 and are not re-derived here", () => {
  const d = decideFoundingCheckout({ taken: 10 })
  if (d.allowed) throw new Error("unreachable")
  expect(d.error).toContain("$2,490")
})
