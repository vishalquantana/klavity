// Onboarding retry-on-empty (follow-up to the aha-carry audit, 2026-08): /api/persona/site
// intermittently returns personas:[] for sparse pages (~1 in 3 runs on example.com) even though an
// immediate retry succeeds. The homepage handoff already falls back to the carried stash, but a
// visitor landing DIRECTLY on /onboarding?url= has no stash and would dead-end on "No Sims came
// back". uhFetch now retries once quietly before surfacing any failure.
//
// Contract-style guards (string assertions on the shipped HTML), matching the suite convention.

import { test, expect } from "bun:test"

const ONBOARD = await Bun.file(import.meta.dir + "/../site/onboarding.html").text()

test("retry-on-empty — uhFetch retries once when the cast comes back empty", () => {
  const fn = ONBOARD.slice(ONBOARD.indexOf("window.uhFetch = async function"), ONBOARD.indexOf("// Enter key support"))
  // exactly one retry — no unbounded loops against a paid endpoint
  expect(fn.match(/persona\/site/g)?.length).toBe(2)
  // the retry is gated on the empty-cast case only (not on errors/4xx, which surface directly)
  expect(fn).toContain("if(!ps.length){")
  expect(fn).toMatch(/Taking another look/)
  // after the retry, whatever came back goes to the normal render path
  expect(fn).toContain("uhShowPersonas(url, ps)")
})

test("retry-on-empty — aha-carry fallbacks remain intact", () => {
  // empty cast still falls back to the carried stash when one exists
  expect(ONBOARD).toMatch(/st0 && st0\.url===url && st0\.personas && st0\.personas\.length/)
  // preview failure still paints the cached reaction before any soft note
  expect(ONBOARD).toContain("function cachedReactionOrSoft")
})
