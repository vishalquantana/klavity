import { expect, test } from "bun:test"
import { creditCostFor, DEFAULT_ACTION_COST_MC, MC_PER_CREDIT } from "./credits"

test("MC_PER_CREDIT is 1000 (millicredits are integers)", () => {
  expect(MC_PER_CREDIT).toBe(1000)
})

test("flat actions cost their default millicredits", () => {
  expect(creditCostFor("enhance")).toBe(1000)          // 1 credit
  expect(creditCostFor("keyframes")).toBe(2000)        // 2 credits
  expect(creditCostFor("sim")).toBe(15000)             // 15 credits
  expect(creditCostFor("autosim")).toBe(75000)         // 75 credits
})

test("voice is 0.1 credit per dictation and stays an integer", () => {
  expect(DEFAULT_ACTION_COST_MC.voice).toBe(100)
  expect(creditCostFor("voice", 1)).toBe(100)          // 0.1cr
  expect(creditCostFor("voice", 10)).toBe(1000)        // 10 dictations = exactly 1cr
})

test("transcript is 1 credit per started minute, floor 1 credit", () => {
  expect(creditCostFor("transcript", 0)).toBe(1000)    // any non-empty clip ≥ 1cr
  expect(creditCostFor("transcript", 0.4)).toBe(1000)  // ceil → 1 min
  expect(creditCostFor("transcript", 3)).toBe(3000)    // 3 min
  expect(creditCostFor("transcript", 3.2)).toBe(4000)  // ceil → 4 min
})

test("baseMc override (DB-config value) is respected", () => {
  expect(creditCostFor("enhance", 1, 2500)).toBe(2500)
  expect(creditCostFor("transcript", 3, 500)).toBe(1500)  // 500 × 3
})
