// KLA-274: Sims-as-oracle pure logic.
import { test, expect } from "bun:test"
import { oracleStanding, simSourceRef, buildExpectationOracle } from "./sims-oracle"
import type { SourceRef } from "./expectations"

test("oracleStanding maps each spine status to a standing (unknown → watching)", () => {
  expect(oracleStanding("enforced")).toBe("guarded")
  expect(oracleStanding("validated")).toBe("confirmed")
  expect(oracleStanding("candidate")).toBe("watching")
  expect(oracleStanding("retired")).toBe("dropped")
  // legacy/unknown status degrades to the candidate default, never throws
  expect(oracleStanding("bogus" as any)).toBe("watching")
})

test("simSourceRef returns the first sim ref, ignoring snap/autosim/finding", () => {
  const refs: SourceRef[] = [
    { kind: "snap", id: "fb_1" },
    { kind: "autosim", id: "find_1" },
    { kind: "sim", id: "fb_sim_1" },
    { kind: "sim", id: "fb_sim_2" },
  ]
  expect(simSourceRef(refs)?.id).toBe("fb_sim_1")
  expect(simSourceRef([{ kind: "snap", id: "x" }])).toBeNull()
  expect(simSourceRef(null)).toBeNull()
  expect(simSourceRef(undefined)).toBeNull()
})

test("buildExpectationOracle composes an expected-vs-happened verdict", () => {
  const o = buildExpectationOracle(
    { status: "enforced", title: "Checkout total updates when qty changes", sourceRefs: [{ kind: "sim", id: "fb_1" }] },
    { simId: "sim_9", simName: "Busy Buyer", simRole: "shopper" },
  )!
  expect(o.simId).toBe("sim_9")
  expect(o.simName).toBe("Busy Buyer")
  expect(o.standing).toBe("guarded")
  expect(o.standingLabel).toBe("Guarded")
  expect(o.expects).toBe("Checkout total updates when qty changes")
  expect(o.verdict).toContain("Busy Buyer expects:")
  expect(o.verdict).toContain("AutoSim now guards it")
})

test("buildExpectationOracle returns null when no Sim is resolved", () => {
  expect(buildExpectationOracle({ status: "candidate", title: "x", sourceRefs: [] }, null)).toBeNull()
  // sim object without an id is not a usable oracle
  expect(buildExpectationOracle({ status: "candidate", title: "x" }, { simId: "", simName: "Ghost", simRole: null })).toBeNull()
})

test("buildExpectationOracle falls back to a generic name and untitled behaviour", () => {
  const o = buildExpectationOracle(
    { status: "validated", title: "   " },
    { simId: "sim_1", simName: null, simRole: null },
  )!
  expect(o.simName).toBeNull()
  expect(o.standing).toBe("confirmed")
  expect(o.verdict).toContain("A Sim expects:")
  expect(o.verdict).toContain("(untitled behaviour)")
})
