import { test, expect } from "bun:test"
import { newPublishableKey } from "./db"

test("newPublishableKey has the pk_ prefix and 64 hex chars", () => {
  const k = newPublishableKey()
  expect(k).toMatch(/^pk_[0-9a-f]{64}$/)
})

test("newPublishableKey is unique per call", () => {
  expect(newPublishableKey()).not.toBe(newPublishableKey())
})
