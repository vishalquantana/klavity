// Aha carry-through (activation audit 2026-08): the homepage hero demo runs /api/persona/site +
// /api/sim/preview anonymously, then handed off to onboarding with only ?url= — onboarding re-ran
// the whole pipeline for the SAME URL and threw the homepage result away.
//
// Fix 1 (site/index.html): hdFetch stashes personas + the preview reaction into
//   localStorage['klav-aha-preview'] — the exact key onboarding's renderInsightLive() and signup
//   persist step already read. Only when the stash's URL matches; onboarding re-runs otherwise.
//
// Fix 2 (site/onboarding.html): a valid ?url= handoff now auto-jumps past the goal survey and
//   starts uhFetch() once bootstrap resolves — the user already submitted this URL once, so the
//   wizard must not ask for it again. An explicit user click still wins (auto-run only fires from
//   the Goal screen).
//
// Contract-style guards (string assertions on the shipped HTML), matching the suite convention.

import { test, expect } from "bun:test"

const INDEX = await Bun.file(import.meta.dir + "/../site/index.html").text()
const ONBOARD = await Bun.file(import.meta.dir + "/../site/onboarding.html").text()

test("aha-carry — homepage demo stashes its result into klav-aha-preview", () => {
  // The stash helper exists and targets the shared key.
  expect(INDEX).toContain("function stashAha")
  expect(INDEX).toContain("'klav-aha-preview'")
  // Personas are stashed as soon as they return…
  expect(INDEX).toMatch(/renderCast\(url, personas\);\s*\n\s*stashAha\(url, personas, null\)/)
  // …and upgraded with the reaction/screenshot once the preview resolves.
  expect(INDEX).toMatch(/if \(!rx \|\| !rx\.observation\) throw 0;\s*\n\s*stashAha\(url, personas, d\)/)
})

test("aha-carry — stash is URL-guarded and fail-soft", () => {
  // Never clobbers a stash belonging to a different URL (onboarding re-runs instead) — but an
  // EMPTY store must fall through and write (first-time visitors have no stash yet).
  expect(INDEX).toMatch(/if \(st\.url && String\(st\.url\) !== String\(url\)\) return/)
  // Wrapped so quota/private-mode can never break the demo render.
  const fn = INDEX.slice(INDEX.indexOf("function stashAha"), INDEX.indexOf("function sentClass"))
  expect(fn).toContain("try {")
  expect(fn).toContain("} catch (e) {}")
})

test("aha-carry — onboarding auto-runs the review for ?url= handoffs", () => {
  expect(ONBOARD).toContain("_autoRunUrl")
  // Auto-run only from the Goal screen — an explicit click wins over the handoff.
  expect(ONBOARD).toMatch(/_autoRunUrl && cur === S\.GOAL/)
  // It starts the real pipeline, not a canned one.
  expect(ONBOARD).toMatch(/_autoRunUrl[\s\S]{0,200}window\.uhFetch\(\)/)
  // Snap fork keeps its own short path (signup-first) — auto-run must not hijack it.
  expect(ONBOARD).toMatch(/if \(goal !== 'snap'\) go\(S\.PRODUCT\)/)
})

test("aha-carry — pre-existing handoff behaviour intact", () => {
  // URL prefill + derived domain/project name still happen (bootstrap ?url= block).
  expect(ONBOARD).toContain("$('uhUrl').value = _u")
  expect(ONBOARD).toContain("deriveName(_host)")
})
