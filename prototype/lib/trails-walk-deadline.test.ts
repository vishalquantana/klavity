// AutoSim replays on dev ran out of their flat 120-180s deadline (17-step PX4 flow, "deadline_exceeded"). The budget
// now grows with the step count, never below the caller's floor, and is capped.
import { describe, test, expect } from "bun:test"
import { scaledWalkDeadlineMs } from "./trails-runner"

describe("scaledWalkDeadlineMs", () => {
  test("never goes below the caller's floor for short trails", () => {
    expect(scaledWalkDeadlineMs(120_000, 1)).toBe(120_000)
    expect(scaledWalkDeadlineMs(180_000, 5)).toBe(180_000)
  })
  test("grows with the step count (60s + 12s per step)", () => {
    expect(scaledWalkDeadlineMs(120_000, 17)).toBe(60_000 + 12_000 * 17) // 264s, was 120s
    expect(scaledWalkDeadlineMs(180_000, 17)).toBe(264_000)              // was 180s
    expect(scaledWalkDeadlineMs(120_000, 30)).toBeGreaterThan(scaledWalkDeadlineMs(120_000, 20))
  })
  test("is capped at 10 minutes", () => {
    expect(scaledWalkDeadlineMs(120_000, 500)).toBe(600_000)
  })
  test("never lowers a floor that is already above the cap, and leaves 'no deadline' alone", () => {
    expect(scaledWalkDeadlineMs(900_000, 50)).toBe(900_000)
    expect(scaledWalkDeadlineMs(0, 17)).toBe(0)
  })
  test("tolerates a bogus step count", () => {
    expect(scaledWalkDeadlineMs(120_000, -3)).toBe(120_000)
    expect(scaledWalkDeadlineMs(120_000, NaN)).toBe(120_000)
  })
})
