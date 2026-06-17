import { test, expect } from "bun:test"
import { MODEL_CHOICES, MODEL_CHOICE_IDS, DEFAULT_WEIGHTS, pickModel, parseWeightsForm, weightsToPct } from "./models"

const IDS = MODEL_CHOICE_IDS

test("MODEL_CHOICES: ids unique, include qwen3 + the seeded defaults", () => {
  expect(new Set(IDS).size).toBe(IDS.length)
  expect(IDS).toContain("qwen/qwen3-vl-235b-a22b-instruct")
  for (const id of Object.keys(DEFAULT_WEIGHTS)) expect(IDS).toContain(id)
})

test("pickModel: all-zero / empty weights → fallback", () => {
  expect(pickModel({}, IDS, "fallback/model", 0.5)).toBe("fallback/model")
  expect(pickModel({ [IDS[0]]: 0 }, IDS, "fallback/model", 0.99)).toBe("fallback/model")
})

test("pickModel: single non-zero id is always chosen regardless of rnd", () => {
  const w = { [IDS[0]]: 7 }
  for (const r of [0, 0.25, 0.5, 0.999]) expect(pickModel(w, IDS, "fb", r)).toBe(IDS[0])
})

test("pickModel: weighted buckets by cumulative weight", () => {
  // a=30, b=10 over [a,b] order → rnd<0.75 → a, else b
  const a = IDS[0], b = IDS[1]
  const w = { [a]: 30, [b]: 10 }
  expect(pickModel(w, [a, b], "fb", 0.0)).toBe(a)
  expect(pickModel(w, [a, b], "fb", 0.74)).toBe(a)
  expect(pickModel(w, [a, b], "fb", 0.76)).toBe(b)
  expect(pickModel(w, [a, b], "fb", 0.999)).toBe(b)
})

test("pickModel: ids not in choiceIds are ignored", () => {
  const w = { "evil/unknown": 100, [IDS[0]]: 5 }
  expect(pickModel(w, IDS, "fb", 0.5)).toBe(IDS[0]) // unknown id never selected
})

test("parseWeightsForm: coerces to non-negative ints, drops unknown keys, blanks→0", () => {
  const raw = { [IDS[0]]: "5", [IDS[1]]: "abc", [IDS[2]]: "-3", "evil/x": "99" }
  const out = parseWeightsForm(raw, IDS)
  expect(out[IDS[0]]).toBe(5)
  expect(out[IDS[1]]).toBe(0) // non-numeric → 0
  expect(out[IDS[2]]).toBe(0) // negative → 0
  expect("evil/x" in out).toBe(false) // unknown key not present
  expect(Object.keys(out).sort()).toEqual([...IDS].sort())
})

test("parseWeightsForm: floors fractional input", () => {
  expect(parseWeightsForm({ [IDS[0]]: "4.9" }, IDS)[IDS[0]]).toBe(4)
})

test("weightsToPct: normalizes to integer percents; all-zero → all 0", () => {
  const a = IDS[0], b = IDS[1]
  const pct = weightsToPct({ [a]: 3, [b]: 1 }, [a, b])
  expect(pct[a]).toBe(75)
  expect(pct[b]).toBe(25)
  const zero = weightsToPct({}, [a, b])
  expect(zero[a]).toBe(0)
  expect(zero[b]).toBe(0)
})
