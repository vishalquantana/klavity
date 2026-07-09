import { test, expect } from "bun:test"
const { planIsPro, planIsUnlimited } = await import("./db")

test("planIsPro: free is false; pro/team/scale/partner are true", () => {
  expect(planIsPro("free")).toBe(false)
  expect(planIsPro("pro")).toBe(true)
  expect(planIsPro("team")).toBe(true)
  expect(planIsPro("scale")).toBe(true)
  expect(planIsPro("partner")).toBe(true)
})

test("planIsUnlimited: partner and scale are true; free and pro are false", () => {
  expect(planIsUnlimited("partner")).toBe(true)
  expect(planIsUnlimited("scale")).toBe(true)
  expect(planIsUnlimited("free")).toBe(false)
  expect(planIsUnlimited("pro")).toBe(false)
})
