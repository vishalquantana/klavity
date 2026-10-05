// KD-195: the TTL cache + invalidation epoch behind GET /api/screenshots/:id.
import { test, expect } from "bun:test"
import { TtlCache, bumpAuthEpoch, currentAuthEpoch } from "./access-cache"

test("returns a stored value until its TTL elapses, then misses and drops it", () => {
  let t = 1_000
  const c = new TtlCache<string>(10, 500, () => t)
  c.set("a", "A")
  expect(c.get("a")).toBe("A")
  t += 499; expect(c.get("a")).toBe("A")
  t += 1;   expect(c.get("a")).toBeUndefined()      // exactly at the TTL → expired
  expect(c.size).toBe(0)                            // the expired entry was removed, not left to accumulate
})

test("a miss is undefined (callers treat it as 'ask the database')", () => {
  expect(new TtlCache<number>(5, 1000).get("nope")).toBeUndefined()
})

test("bumpAuthEpoch invalidates EVERY entry at once (membership removed / user erased / screenshot deleted)", () => {
  const c1 = new TtlCache<boolean>(10, 60_000), c2 = new TtlCache<string>(10, 60_000)
  c1.set("u|p", true); c2.set("shot_1", "row")
  expect(c1.get("u|p")).toBe(true)
  const before = currentAuthEpoch()
  bumpAuthEpoch()
  expect(currentAuthEpoch()).toBe(before + 1)
  expect(c1.get("u|p")).toBeUndefined()
  expect(c2.get("shot_1")).toBeUndefined()
  // entries stored AFTER the bump are valid again
  c1.set("u|p", true); expect(c1.get("u|p")).toBe(true)
})

test("bounded: inserting past the max evicts the oldest entry; overwriting an existing key does not evict", () => {
  const c = new TtlCache<number>(2, 60_000)
  c.set("a", 1); c.set("b", 2)
  c.set("a", 10)                                    // overwrite — no eviction
  expect(c.get("a")).toBe(10); expect(c.get("b")).toBe(2)
  c.set("c", 3)                                     // over capacity → the oldest ("a") goes
  expect(c.size).toBe(2)
  expect(c.get("a")).toBeUndefined(); expect(c.get("b")).toBe(2); expect(c.get("c")).toBe(3)
})

test("delete and clear remove entries", () => {
  const c = new TtlCache<number>(5, 60_000)
  c.set("a", 1); c.set("b", 2)
  c.delete("a"); expect(c.get("a")).toBeUndefined(); expect(c.get("b")).toBe(2)
  c.clear(); expect(c.size).toBe(0)
})
