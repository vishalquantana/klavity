import { test, expect } from "bun:test"
import { createLimiter, mapBounded, uploadConcurrency } from "./bounded-concurrency"
import { phaseTimer } from "./phase-timer"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

test("never runs more than `limit` tasks at once, and does use the whole limit", async () => {
  let active = 0, peak = 0
  const out = await mapBounded([1, 2, 3, 4, 5, 6, 7, 8], 3, async (n) => {
    active++; peak = Math.max(peak, active)
    await sleep(15); active--
    return n * 2
  })
  expect(peak).toBe(3)
  expect(out).toEqual([2, 4, 6, 8, 10, 12, 14, 16])
})

test("results stay in INPUT order even when later items finish first", async () => {
  const delays = [60, 5, 30, 1]
  const out = await mapBounded(delays, 4, async (d, i) => { await sleep(d); return i })
  expect(out).toEqual([0, 1, 2, 3])
})

test("independent tasks overlap: wall time ≈ slowest, not the sum", async () => {
  const t = performance.now()
  await mapBounded([1, 2, 3, 4], 4, () => sleep(60))
  expect(performance.now() - t).toBeLessThan(60 * 4 - 60)   // far below the 240ms a serial loop takes
})

test("a shared limiter bounds tasks across SEPARATE mapBounded groups (screenshots + attachments + recordings)", async () => {
  const lim = createLimiter(2)
  let active = 0, peak = 0
  const job = async () => { active++; peak = Math.max(peak, active); await sleep(10); active-- }
  await Promise.all([mapBounded([1, 2, 3], lim, job), mapBounded([1, 2, 3], lim, job), mapBounded([1, 2], lim, job)])
  expect(peak).toBe(2)
})

test("per-item failure handling is the caller's: errors caught inside fn become values, the rest still complete", async () => {
  const out = await mapBounded(["a", "bad", "c"], 2, async (s) => { try { if (s === "bad") throw new Error("boom"); return { ok: true as const, s } } catch (e: any) { return { ok: false as const, err: e.message } } })
  expect(out).toEqual([{ ok: true, s: "a" }, { ok: false, err: "boom" }, { ok: true, s: "c" }])
})

test("an uncaught rejection rejects the group, frees its slot, and does not wedge the limiter", async () => {
  const lim = createLimiter(1)
  await expect(lim(async () => { throw new Error("x") })).rejects.toThrow("x")
  expect(await lim(async () => "still works")).toBe("still works")
})

test("a synchronous throw inside a task is a rejection, not a crash", async () => {
  const lim = createLimiter(2)
  await expect(lim((() => { throw new Error("sync") }) as any)).rejects.toThrow("sync")
  expect(await lim(async () => 1)).toBe(1)
})

test("empty input and an invalid limit are safe", async () => {
  expect(await mapBounded([], 4, async () => 1)).toEqual([])
  expect(await mapBounded([1, 2], 0, async (n) => n)).toEqual([1, 2])   // 0 → clamped to 1 (serial), not a deadlock
})

test("uploadConcurrency: default 4, env override, clamped 1..8, garbage → default", () => {
  expect(uploadConcurrency({})).toBe(4)
  expect(uploadConcurrency({ KLAV_UPLOAD_CONCURRENCY: "6" })).toBe(6)
  expect(uploadConcurrency({ KLAV_UPLOAD_CONCURRENCY: "99" })).toBe(8)
  expect(uploadConcurrency({ KLAV_UPLOAD_CONCURRENCY: "0" })).toBe(4)
  expect(uploadConcurrency({ KLAV_UPLOAD_CONCURRENCY: "abc" })).toBe(4)
})

test("phaseTimer: marks phases in order, accumulates repeats, builds a Server-Timing header + summary", () => {
  let t = 1000
  const pt = phaseTimer(() => t)
  t += 10; pt.mark("auth")
  t += 250; pt.mark("uploads")
  t += 5; pt.mark("auth")                 // same name again → accumulated into the first entry
  t += 1; pt.mark("weird name!")          // sanitised in the header
  expect(pt.phases()).toEqual([{ name: "auth", ms: 15 }, { name: "uploads", ms: 250 }, { name: "weird name!", ms: 1 }])
  expect(pt.total()).toBe(266)
  expect(pt.header()).toBe("auth;dur=15.0, uploads;dur=250.0, weird_name_;dur=1.0, total;dur=266.0")
  expect(pt.summary()).toBe("auth=15ms uploads=250ms weird_name_=1ms total=266ms")
})
