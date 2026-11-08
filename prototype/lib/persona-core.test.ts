import { test, expect } from "bun:test"
import { normalizeGeneratedCore, DEFAULT_WATCH_FOR } from "./persona-core"

test("keeps a well-formed core, capped and trimmed", () => {
  const c = normalizeGeneratedCore({ goals: ["a", " b ", "c", "d", "e"], expertise: " novice ", temperament: "t", voice: "v", watchFor: ["w1", "w2", "w3", "w4", "w5", "w6"] })
  expect(c.goals).toEqual(["a", "b", "c", "d"])
  expect(c.watchFor).toEqual(["w1", "w2", "w3", "w4", "w5"])
  expect(c.expertise).toBe("novice")
})
test("missing core falls back to generic watchFor and role/summary", () => {
  const c = normalizeGeneratedCore(undefined, { role: "QA Lead", summary: "Checks forms." })
  expect(c.watchFor).toEqual(DEFAULT_WATCH_FOR)
  expect(c.expertise).toBe("QA Lead")
  expect(c.goals).toEqual(["Checks forms."])
})
test("a single watchFor item is topped up to at least 2", () => {
  const c = normalizeGeneratedCore({ watchFor: ["only one"] })
  expect(c.watchFor[0]).toBe("only one")
  expect(c.watchFor.length).toBe(5)
})
test("non-array / junk values are ignored", () => {
  const c = normalizeGeneratedCore({ goals: "x", watchFor: { a: 1 }, voice: 5 })
  expect(c.goals).toEqual([])
  expect(c.voice).toBe("5")
  expect(c.watchFor).toEqual(DEFAULT_WATCH_FOR)
})
