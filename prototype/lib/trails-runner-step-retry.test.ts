// KLA-68: unit tests for the per-step retry policy (withStepRetry).
// No browser or DB needed — tests the extracted helper directly.
import { describe, test, expect } from "bun:test"
import { withStepRetry, DEFAULT_STEP_RETRIES } from "./trails-runner"

// Synchronous sleep that never actually waits — used to make retry tests instant.
const noSleep = () => Promise.resolve()
const neverStop = () => false

describe("withStepRetry — KLA-68 per-step retry", () => {
  test("succeeds on first attempt — no error returned", async () => {
    let calls = 0
    const err = await withStepRetry(async () => { calls++ }, 2, 0, neverStop, noSleep)
    expect(err).toBeUndefined()
    expect(calls).toBe(1)
  })

  test("retries after transient failure: fail-once then succeed → no error, 2 attempts", async () => {
    let calls = 0
    const err = await withStepRetry(
      async () => {
        calls++
        if (calls === 1) throw new Error("transient")
        // second call succeeds
      },
      DEFAULT_STEP_RETRIES,
      0,
      neverStop,
      noSleep,
    )
    expect(err).toBeUndefined()  // resolved — not RED
    expect(calls).toBe(2)
  })

  test("always-failing action exhausts all attempts and returns the error (→ RED)", async () => {
    const boom = new Error("always fails")
    let calls = 0
    const err = await withStepRetry(
      async () => { calls++; throw boom },
      DEFAULT_STEP_RETRIES,
      0,
      neverStop,
      noSleep,
    )
    expect(err).toBe(boom)                        // non-undefined → caller records RED
    expect(calls).toBe(DEFAULT_STEP_RETRIES + 1)  // initial attempt + N retries
  })

  test("respects custom retry count: stepRetries=0 means one total attempt, no retry", async () => {
    let calls = 0
    const err = await withStepRetry(
      async () => { calls++; throw new Error("boom") },
      0,  // no retries
      0,
      neverStop,
      noSleep,
    )
    expect(err).toBeDefined()
    expect(calls).toBe(1)
  })

  test("respects custom retry count: stepRetries=1 → at most 2 total attempts", async () => {
    let calls = 0
    const err = await withStepRetry(
      async () => { calls++; throw new Error("boom") },
      1,  // one retry
      0,
      neverStop,
      noSleep,
    )
    expect(err).toBeDefined()
    expect(calls).toBe(2)
  })

  test("deadline guard: shouldStop() returning true before a retry stops the loop early", async () => {
    let calls = 0
    let sleepCalls = 0
    // shouldStop returns true on the first retry check — the second attempt never runs
    const err = await withStepRetry(
      async () => { calls++; throw new Error("boom") },
      2,
      0,
      () => true,  // always say "stop"
      async () => { sleepCalls++ },
    )
    expect(err).toBeDefined()
    expect(calls).toBe(1)    // only the initial attempt ran
    expect(sleepCalls).toBe(0)  // sleep was never called because shouldStop fired first
  })

  test("backoff sleep is called between retries (N retries → N sleep calls)", async () => {
    let sleepCalls = 0
    const fakeError = new Error("x")
    await withStepRetry(
      async () => { throw fakeError },
      2,
      99,
      neverStop,
      async () => { sleepCalls++ },
    )
    expect(sleepCalls).toBe(2)  // called once before attempt 2 and once before attempt 3
  })
})
