// KLA-56: model-error retry — unit tests for error classification and drive-loop retry behaviour.
// All tests use injectable fakes (no browser, no network, no real DB needed for the unit tests).
// The DB-dependent tests set up an isolated in-memory file DB via the standard pattern.
import { describe, test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-retry-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-retry-test-32bytessecret").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const { ModelCallError } = await import("./trails-author-model")
const { authorTrail } = await import("./trails-author")
import type { AuthorModel } from "./trails-author-model"

// ── ModelCallError classification ────────────────────────────────────────────────────────────────

describe("ModelCallError", () => {
  test("retryable=true for 429", () => {
    const e = new ModelCallError("rate limited", true, false, 429)
    expect(e.retryable).toBe(true)
    expect(e.budgetExhausted).toBe(false)
    expect(e.httpStatus).toBe(429)
    expect(e instanceof Error).toBe(true)
  })

  test("retryable=true for 503", () => {
    const e = new ModelCallError("service unavailable", true, false, 503)
    expect(e.retryable).toBe(true)
    expect(e.httpStatus).toBe(503)
  })

  test("retryable=false for 401", () => {
    const e = new ModelCallError("unauthorized", false, false, 401)
    expect(e.retryable).toBe(false)
    expect(e.budgetExhausted).toBe(false)
  })

  test("budgetExhausted=true is always retryable=false", () => {
    const e = new ModelCallError("daily cap hit", false, true)
    expect(e.budgetExhausted).toBe(true)
    expect(e.retryable).toBe(false)
  })
})

// ── Helpers ───────────────────────────────────────────────────────────────────────────────────────

const FIXTURE_URL = "data:text/html," + encodeURIComponent(`<html><body><button id="ok">OK</button></body></html>`)
const noSleepOpts = { sleepMs: () => Promise.resolve() } // instant backoff in tests

function doneModel(): AuthorModel {
  return async () => ({ action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 })
}

function makeAuthorOpts(model: AuthorModel, extra: Record<string, any> = {}) {
  return { model, headless: true, ...noSleepOpts, verificationVision: false as const, ...extra }
}

// ── Budget-exhausted → distinct stallReason ───────────────────────────────────────────────────────

const RUN_BROWSER = !!process.env.KLAV_E2E

test.if(RUN_BROWSER)("budget-exhausted error surfaces as stallReason starting with budget_exhausted", async () => {
  const model: AuthorModel = async () => {
    throw new ModelCallError("Daily AI budget reached", false, true)
  }
  const out = await authorTrail("proj_retry", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toMatch(/^budget_exhausted:/)
})

// ── Fatal non-retryable error → immediate stall ───────────────────────────────────────────────────

test.if(RUN_BROWSER)("401 auth error causes immediate fatal stall without retry", async () => {
  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    throw new ModelCallError("author model 401", false, false, 401)
  }
  const out = await authorTrail("proj_retry", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toMatch(/auth|401/i)
  expect(callCount).toBe(1)  // no retry on fatal
})

test.if(RUN_BROWSER)("403 forbidden causes immediate fatal stall without retry", async () => {
  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    throw new ModelCallError("author model 403", false, false, 403)
  }
  const out = await authorTrail("proj_retry", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  expect(out.status).toBe("stalled")
  expect(callCount).toBe(1)
})

// ── Retryable error → backoff retries, then miss ─────────────────────────────────────────────────

test.if(RUN_BROWSER)("single 429 that resolves on next attempt → not a miss, authoring continues", async () => {
  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    if (callCount === 1) throw new ModelCallError("rate limited", true, false, 429)
    return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
  }
  const out = await authorTrail("proj_retry", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  expect(out.status).toBe("crystallized")
  expect(callCount).toBe(2)  // 1 failure + 1 success
})

test.if(RUN_BROWSER)("persistent 429 exhausts API retries and counts as a miss", async () => {
  let callCount = 0
  // Always throw 429 — exhausts retries, eventually hits MAX_CONSECUTIVE_MISSES
  const model: AuthorModel = async () => {
    callCount++
    throw new ModelCallError("rate limited", true, false, 429)
  }
  const out = await authorTrail("proj_retry", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  expect(out.status).toBe("stalled")
  expect(out.stallReason).toMatch(/model call|rate|429|retries/i)
  // Should have tried more than once (multiple retry attempts)
  expect(callCount).toBeGreaterThan(1)
})

test.if(RUN_BROWSER)("5xx server error retries and succeeds on third attempt", async () => {
  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    if (callCount <= 2) throw new ModelCallError("author model 503", true, false, 503)
    return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
  }
  const out = await authorTrail("proj_retry", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  expect(out.status).toBe("crystallized")
  expect(callCount).toBe(3)
})

test.if(RUN_BROWSER)("timeout error (retryable) retries then stalls after cap", async () => {
  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    throw new ModelCallError("author model timed out", true, false, 0)
  }
  const out = await authorTrail("proj_retry", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  expect(out.status).toBe("stalled")
  expect(callCount).toBeGreaterThan(1)  // retried
})

// ── Unknown (non-ModelCallError) throw → treated as retryable miss ────────────────────────────────

test.if(RUN_BROWSER)("generic Error (non-classified) from model → treated as retryable miss", async () => {
  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    if (callCount <= 2) throw new Error("network blip")
    return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
  }
  const out = await authorTrail("proj_retry", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  // Generic errors are retried — if they resolve in time, authoring continues
  expect(out.status).toBe("crystallized")
})

// ── Sleep is called with increasing backoff on each retry ────────────────────────────────────────

test.if(RUN_BROWSER)("exponential backoff: each retry sleeps progressively longer", async () => {
  const sleeps: number[] = []
  const sleepMs = (ms: number) => { sleeps.push(ms); return Promise.resolve() }
  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    if (callCount < 3) throw new ModelCallError("rate limited", true, false, 429)
    return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
  }
  await authorTrail("proj_retry", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model, { sleepMs }))
  // Should have slept twice (after attempt 1 and 2), with increasing delays
  expect(sleeps.length).toBeGreaterThanOrEqual(2)
  expect(sleeps[1]).toBeGreaterThan(sleeps[0])
})

// ── Retry count is properly bounded (no infinite loop) ───────────────────────────────────────────

test.if(RUN_BROWSER)("retry attempts are capped — model is not called indefinitely", async () => {
  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    if (callCount > 100) throw new Error("infinite loop detected")
    throw new ModelCallError("rate limited", true, false, 429)
  }
  const out = await authorTrail("proj_retry", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  expect(out.status).toBe("stalled")
  expect(callCount).toBeLessThan(50)  // definitely not infinite
})

// ── KLA-69: stall second-opinion re-roll ─────────────────────────────────────────────────────────

test.if(RUN_BROWSER)("KLA-69: first-roll deliberate stall followed by valid second roll proceeds", async () => {
  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    if (callCount === 1) {
      // First roll: deliberate stall (no parseError)
      return { action: { op: "stall", selector: null, value: null, url: null, checkpoint: null, rationale: "button not visible yet" }, costUsd: 0 }
    }
    // Second roll (reroll): valid action — completes the objective
    return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
  }
  const out = await authorTrail("proj_stall_reroll", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  // Stall reroll allowed the walk to continue — should crystallize rather than stall
  expect(out.status).toBe("crystallized")
  // Model was called at least twice: 1 initial stall + 1 reroll
  expect(callCount).toBeGreaterThanOrEqual(2)
}, 30000)

test.if(RUN_BROWSER)("KLA-69: persistent stall on both rolls terminates with stall outcome", async () => {
  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    // Always return a deliberate stall
    return { action: { op: "stall", selector: null, value: null, url: null, checkpoint: null, rationale: "always stuck" }, costUsd: 0 }
  }
  const out = await authorTrail("proj_stall_persist", { name: "T", objective: "do X", baseUrl: FIXTURE_URL },
    makeAuthorOpts(model))
  expect(out.status).toBe("stalled")
  // Should have stalled after exactly 2 model calls: first roll + one reroll
  expect(callCount).toBe(2)
  expect(out.stallReason).toMatch(/always stuck/)
}, 30000)
