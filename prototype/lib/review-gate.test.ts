// P3b focused test: the /api/sim/review guardrail ORDERING (§5, binding). reviewGate is a pure decision
// function over already-resolved state, so we can assert the exact first-failing gate + reason for each
// combination WITHOUT mocking HTTP/AI/S3 — and assert that a fully-allowed call proceeds (ok:true).
import { test, expect } from "bun:test"
import { reviewGate, reviewDedupeKey, reviewDay, type ReviewGateInput } from "./db"

// A state where EVERY gate passes; each test flips exactly one earlier gate to assert ordering.
const ALLOW: ReviewGateInput = {
  authed: true, reviewMode: "auto", consentStatus: "granted",
  allowlistMatch: true, alreadyReviewed: false, budgetConsumed: true,
}

test("fully-allowed call proceeds", () => {
  const r = reviewGate(ALLOW)
  expect(r.ok).toBe(true)
})

test("gate ordering: each blocked reason fires in order a→f", () => {
  // a. auth — unauthenticated blocks first even if everything else would also fail.
  expect(reviewGate({ ...ALLOW, authed: false, reviewMode: "paused", consentStatus: "revoked", allowlistMatch: false, alreadyReviewed: true, budgetConsumed: false }))
    .toMatchObject({ ok: false, reason: "unauthorized", status: 401 })
  // b. admin pause (review_mode==='paused') blocks before consent/allowlist/dedupe/budget.
  expect(reviewGate({ ...ALLOW, reviewMode: "paused", consentStatus: "revoked", allowlistMatch: false, alreadyReviewed: true, budgetConsumed: false }))
    .toMatchObject({ ok: false, reason: "paused", status: 423 })
  // b. user pause (consent 'paused') and revoke both block at the user-pause gate, before consent-granted.
  expect(reviewGate({ ...ALLOW, consentStatus: "paused", allowlistMatch: false, alreadyReviewed: true, budgetConsumed: false }))
    .toMatchObject({ ok: false, reason: "userPaused", status: 423 })
  expect(reviewGate({ ...ALLOW, consentStatus: "revoked" }))
    .toMatchObject({ ok: false, reason: "userPaused", status: 423 })
  // c. consent must be 'granted' — null/absent consent → needsConsent (before allowlist).
  expect(reviewGate({ ...ALLOW, consentStatus: null, allowlistMatch: false, alreadyReviewed: true, budgetConsumed: false }))
    .toMatchObject({ ok: false, reason: "needsConsent", status: 412 })
  // d. ALLOWLIST-ONLY — off-allowlist blocks before dedupe/budget (never review off-allowlist).
  expect(reviewGate({ ...ALLOW, allowlistMatch: false, alreadyReviewed: true, budgetConsumed: false }))
    .toMatchObject({ ok: false, reason: "offAllowlist", status: 403 })
  // e. dedupe — already reviewed short-circuits (200) before budget is consumed.
  expect(reviewGate({ ...ALLOW, alreadyReviewed: true, budgetConsumed: false }))
    .toMatchObject({ ok: false, reason: "alreadyReviewed", status: 200 })
  // f. budget — only reached when a–e pass; exhausted → budgetExhausted (429).
  expect(reviewGate({ ...ALLOW, budgetConsumed: false }))
    .toMatchObject({ ok: false, reason: "budgetExhausted", status: 429 })
})

test("allowlist gate is binding regardless of consent/budget (never review off-allowlist)", () => {
  // Even fully consented + budget available, an off-allowlist URL is refused.
  expect(reviewGate({ ...ALLOW, allowlistMatch: false }))
    .toMatchObject({ ok: false, reason: "offAllowlist" })
})

test("reviewDedupeKey: stable per (sim,path,domSig); path normalized, domSig participates", () => {
  expect(reviewDedupeKey("sim_1", "/billing/", "abc")).toBe(reviewDedupeKey("sim_1", "/billing", "abc"))
  expect(reviewDedupeKey("sim_1", "/Billing", "abc")).toBe("sim_1|/billing|abc")
  // different dom signature → different key (page changed → re-review allowed)
  expect(reviewDedupeKey("sim_1", "/billing", "abc")).not.toBe(reviewDedupeKey("sim_1", "/billing", "xyz"))
  // different sim → different key
  expect(reviewDedupeKey("sim_1", "/billing", "abc")).not.toBe(reviewDedupeKey("sim_2", "/billing", "abc"))
  // absent domSig → path-level dedupe ('' sig)
  expect(reviewDedupeKey("sim_1", "/billing", null)).toBe("sim_1|/billing|")
})

test("reviewDay: UTC YYYY-MM-DD", () => {
  expect(reviewDay(Date.UTC(2026, 5, 17, 23, 59))).toBe("2026-06-17")
  expect(/^\d{4}-\d{2}-\d{2}$/.test(reviewDay())).toBe(true)
})
