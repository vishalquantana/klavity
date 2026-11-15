// AutoSim "PX4 Valid Login": a slow-rendering SPA page must be re-captured until it has content, not stall after one try.
import { describe, test, expect } from "bun:test"
import { recaptureUntilContent } from "./trails-author"

describe("recaptureUntilContent", () => {
  test("keeps re-capturing a blank page until content appears", async () => {
    let calls = 0
    const out = await recaptureUntilContent("", async () => (++calls < 4 ? "" : 'text "Dashboard" [ref=e1]'), 8, 1)
    expect(out).toContain("Dashboard")
    expect(calls).toBe(4)
  })
  test("does not re-capture when the first snapshot already has content", async () => {
    let calls = 0
    const out = await recaptureUntilContent('button "Login" [ref=e1]', async () => { calls++; return "" }, 8, 1)
    expect(out).toContain("Login")
    expect(calls).toBe(0)
  })
  test("gives up after the bounded retries and returns the blank snapshot", async () => {
    let calls = 0
    const out = await recaptureUntilContent("", async () => { calls++; return "" }, 3, 1)
    expect(out).toBe("")
    expect(calls).toBe(3)
  })
})

// Stale-heartbeat fix: the Verification Walk must keep beating so the 3-min stale reaper doesn't kill a live run.
import { withHeartbeat } from "./trails-author"
describe("withHeartbeat", () => {
  test("beats repeatedly while the work runs, then stops beating", async () => {
    let beats = 0
    const out = await withHeartbeat(async () => { await new Promise((r) => setTimeout(r, 60)); return "walk-result" }, () => { beats++ }, 10)
    expect(out).toBe("walk-result")
    expect(beats).toBeGreaterThanOrEqual(3)
    const after = beats
    await new Promise((r) => setTimeout(r, 40))
    expect(beats).toBe(after)
  })
  test("stops beating and rethrows when the work throws", async () => {
    let beats = 0
    await expect(withHeartbeat(async () => { await new Promise((r) => setTimeout(r, 25)); throw new Error("walk boom") }, () => { beats++ }, 10)).rejects.toThrow("walk boom")
    const after = beats
    await new Promise((r) => setTimeout(r, 40))
    expect(beats).toBe(after)
  })
  test("a throwing/rejecting beat never breaks the work", async () => {
    const out = await withHeartbeat(async () => { await new Promise((r) => setTimeout(r, 30)); return 7 }, () => { throw new Error("db down") }, 10)
    expect(out).toBe(7)
  })
  test("no beat callback is fine", async () => {
    expect(await withHeartbeat(async () => 1, undefined, 10)).toBe(1)
  })
})

describe("withHeartbeat cap", () => {
  test("stops pulsing after maxMs so a hung run can go stale", async () => {
    let beats = 0
    await withHeartbeat(async () => { await new Promise((r) => setTimeout(r, 120)) }, () => { beats++ }, 10, 40)
    const atEnd = beats
    expect(atEnd).toBeGreaterThanOrEqual(2)
    expect(atEnd).toBeLessThanOrEqual(6) // ~40ms / 10ms, not ~12 beats for the full 120ms
  })
})
