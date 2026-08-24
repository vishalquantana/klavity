// Unit tests for the in-process fixed-window rate limiter. Deterministic via the injected `now`.
import { test, expect, beforeEach } from "bun:test"
import { allow, record, count, retryAfterMs, clear, refund, _resetAll } from "./ratelimit"

beforeEach(() => _resetAll())

test("allow permits up to limit then blocks within the window", () => {
  const t0 = 1_000_000
  expect(allow("k", 3, 1000, t0)).toBe(true)   // 1
  expect(allow("k", 3, 1000, t0)).toBe(true)   // 2
  expect(allow("k", 3, 1000, t0)).toBe(true)   // 3
  expect(allow("k", 3, 1000, t0)).toBe(false)  // 4 — over
  expect(allow("k", 3, 1000, t0)).toBe(false)
})

test("window resets after windowMs elapses", () => {
  const t0 = 2_000_000
  expect(allow("k", 1, 1000, t0)).toBe(true)
  expect(allow("k", 1, 1000, t0)).toBe(false)
  expect(allow("k", 1, 1000, t0 + 1000)).toBe(true) // new window
})

test("keys are independent", () => {
  const t0 = 3_000_000
  expect(allow("a", 1, 1000, t0)).toBe(true)
  expect(allow("a", 1, 1000, t0)).toBe(false)
  expect(allow("b", 1, 1000, t0)).toBe(true) // different key unaffected
})

test("record increments a failure counter; count peeks without incrementing", () => {
  const t0 = 4_000_000
  expect(count("f", t0)).toBe(0)
  expect(record("f", 1000, t0)).toBe(1)
  expect(record("f", 1000, t0)).toBe(2)
  expect(count("f", t0)).toBe(2) // peek, no increment
  expect(count("f", t0)).toBe(2)
})

test("clear resets a failure counter (success path)", () => {
  const t0 = 5_000_000
  record("f", 1000, t0); record("f", 1000, t0)
  expect(count("f", t0)).toBe(2)
  clear("f")
  expect(count("f", t0)).toBe(0)
})

test("retryAfterMs reflects remaining window", () => {
  const t0 = 6_000_000
  allow("k", 1, 1000, t0)
  expect(retryAfterMs("k", t0)).toBe(1000)
  expect(retryAfterMs("k", t0 + 400)).toBe(600)
  expect(retryAfterMs("k", t0 + 1000)).toBe(0) // expired
})

test("refund gives back one slot in the current window (floored at 0)", () => {
  const t0 = 8_000_000
  expect(allow("k", 2, 1000, t0)).toBe(true)  // count 1
  expect(allow("k", 2, 1000, t0)).toBe(true)  // count 2 (at limit)
  refund("k", t0)                              // count 1
  expect(count("k", t0)).toBe(1)
  refund("k", t0); refund("k", t0)             // floors at 0, key dropped
  expect(count("k", t0)).toBe(0)
})

test("refund is a no-op on an absent or expired window", () => {
  const t0 = 8_100_000
  refund("missing", t0)                        // no throw, nothing to give back
  expect(count("missing", t0)).toBe(0)
  allow("k", 1, 1000, t0)
  refund("k", t0 + 2000)                        // window expired — no-op
  expect(count("k", t0 + 2000)).toBe(0)
})

// KLA-558: N consecutive 409-busy rejections that refund must NOT exhaust the create window; a real
// create after the busy slot frees still succeeds (does not 429). This is the exact create-window
// contract the v1 /runs + /authored-runs routes rely on (rlAllow → engine → refund-on-409-busy).
test("KLA-558: refunded 409-busy attempts don't exhaust the window; a later create still passes", () => {
  const t0 = 8_200_000
  const key = "v1runs:create:projX"
  const LIMIT = 10
  // 20 poll attempts while the global walk slot is busy: each charges then refunds on 409.
  for (let i = 0; i < 20; i++) {
    expect(allow(key, LIMIT, 60_000, t0)).toBe(true) // slot charged
    refund(key, t0)                                   // 409-busy → give it back
  }
  expect(count(key, t0)).toBe(0)
  // Slot frees; the real create charges 1 and is well under the limit (no 429 lockout).
  expect(allow(key, LIMIT, 60_000, t0)).toBe(true)
  expect(count(key, t0)).toBe(1)
})

test("lockout pattern: count gate + record on failure + clear on success", () => {
  const t0 = 7_000_000
  const MAX = 5
  const key = "otpfail:u@x:1.2.3.4"
  // 5 failures
  for (let i = 0; i < MAX; i++) {
    expect(count(key, t0) >= MAX).toBe(false) // not yet locked
    record(key, 1000, t0)
  }
  expect(count(key, t0) >= MAX).toBe(true) // now locked
  clear(key) // successful verify elsewhere would clear
  expect(count(key, t0) >= MAX).toBe(false)
})
