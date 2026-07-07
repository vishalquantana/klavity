// KLA-66: unit tests for transition-regression detection in clickWithTransitionFallback.
// Verifies that a click with a known page-transition intent (go/chooseGoal/setView) that does NOT
// produce the expected transition throws a "transition_regression" error (→ RED in the runner)
// instead of silently falling through via the fallback.
import { describe, test, expect } from "bun:test"
import type { Locator, Page } from "playwright"
import { clickWithTransitionFallback } from "./trails-click"

// Minimal Page mock: each page.evaluate() call consumes the next value from `results`.
function makePageMock(results: unknown[]): Page {
  let idx = 0
  return {
    evaluate: async (_fn: unknown, _arg?: unknown) => results[idx++],
    waitForFunction: async () => {},
  } as unknown as Page
}

// Minimal Locator mock: evaluate() always returns `intent`; click() is a no-op.
function makeLocatorMock(page: Page, intent: unknown): Locator {
  const self: Locator = {
    first: () => self,
    evaluate: async (_fn: unknown, _arg?: unknown) => intent,
    click: async (_opts?: unknown) => {},
    page: () => page,
    isVisible: async () => false,
    waitFor: async (_opts?: unknown) => {},
  } as unknown as Locator
  return self
}

// page.evaluate call sequence when settleCapMs=0 (skips waitForAnimationSettle evaluation):
//   [0] transitionSatisfied (1st check after initial wait) → false
//   [1] transitionSatisfied (2nd check after noop animate-settle) → false
//   [2] invokeTransitionFallback → undefined (fires the API; UI advances)
// Then KLA-66 fix throws → caller's catch records RED.
const FAILING_EVALS: unknown[] = [false, false, undefined]

describe("clickWithTransitionFallback — KLA-66 transition regression detection", () => {
  test("throws transition_regression when go-intent click does not navigate", async () => {
    const page = makePageMock(FAILING_EVALS.slice())
    const loc = makeLocatorMock(page, { kind: "go", step: 2 })
    await expect(clickWithTransitionFallback(loc, 5000, 0)).rejects.toThrow("transition_regression")
  }, 3000)

  test("throws transition_regression when setView-intent click does not navigate", async () => {
    const page = makePageMock(FAILING_EVALS.slice())
    const loc = makeLocatorMock(page, { kind: "setView", view: "dashboard" })
    await expect(clickWithTransitionFallback(loc, 5000, 0)).rejects.toThrow("transition_regression")
  }, 3000)

  test("throws transition_regression when chooseGoal-intent click does not navigate", async () => {
    const page = makePageMock(FAILING_EVALS.slice())
    const loc = makeLocatorMock(page, { kind: "chooseGoal", goal: "explore", step: 1 })
    await expect(clickWithTransitionFallback(loc, 5000, 0)).rejects.toThrow("transition_regression")
  }, 3000)

  test("resolves without throwing when transition succeeds after the click (happy path)", async () => {
    // transitionSatisfied returns true on the 1st check → function returns before fallback
    const page = makePageMock([true])
    const loc = makeLocatorMock(page, { kind: "go", step: 2 })
    await expect(clickWithTransitionFallback(loc, 5000, 0)).resolves.toBeUndefined()
  }, 3000)

  test("resolves without throwing when no transition intent (intentional no-navigation click)", async () => {
    // null intent means the click was not expected to navigate → early return, no fallback
    const page = makePageMock([])
    const loc = makeLocatorMock(page, null)
    await expect(clickWithTransitionFallback(loc, 5000)).resolves.toBeUndefined()
  }, 3000)
})
