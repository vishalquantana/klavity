import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { seedCreditActionCosts, getCreditActionCost } from "./db"

useIsolatedDb("klav-credits-db-costs")

test("seedCreditActionCosts fills defaults and is idempotent", async () => {
  await seedCreditActionCosts()
  expect(await getCreditActionCost("enhance")).toBe(1000)
  expect(await getCreditActionCost("autosim")).toBe(75000)
  expect(await getCreditActionCost("voice")).toBe(100)
  await seedCreditActionCosts() // second call must not throw or double-count
  expect(await getCreditActionCost("sim")).toBe(15000)
  expect(await getCreditActionCost("nope")).toBeNull()
})
