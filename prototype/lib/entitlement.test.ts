import { test, expect } from "bun:test"
import { projectEntitlement } from "./entitlement"

test("snap override locks Sims/AutoSim/AI-settings; null inherits (all open)", () => {
  const s = projectEntitlement("snap")
  expect(s).toEqual({ snapOnly: true, canSims: false, canAutoSim: false, canAiSettings: false })
  const n = projectEntitlement(null)
  expect(n).toEqual({ snapOnly: false, canSims: true, canAutoSim: true, canAiSettings: true })
  expect(projectEntitlement(undefined).snapOnly).toBe(false)
  expect(projectEntitlement("pro").snapOnly).toBe(false)
})
