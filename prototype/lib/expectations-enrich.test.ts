// prototype/lib/expectations-enrich.test.ts — B.10 (KLA-250)
import { test, expect } from "bun:test"
import { enrichExpectation, type EnrichLookups } from "./expectations-enrich"
import type { ExpectationRow } from "./expectations-db"

function row(over: Partial<ExpectationRow>): ExpectationRow {
  return {
    id: "exp_1", projectId: "proj_1", title: "Finish button visible", area: "checkout", urlPath: "/checkout",
    status: "candidate", sourceRefs: [], corroboration: { snap: false, sim: false, recurrence: 0 },
    dedupKey: "dk", enforcedStepId: null, createdAt: 1, updatedAt: 1, savesCount: 0,
    sourceTicketId: null, awaitingTrail: false, ...over,
  }
}

const noopLookups: EnrichLookups = {
  getReport: async () => null,
  getFinding: async () => null,
  getStep: async () => null,
}

test("enrichExpectation buckets source kinds: snap→report, sim→sim, finding/autosim→finding", async () => {
  const exp = row({
    sourceRefs: [
      { kind: "snap", id: "s1" }, { kind: "sim", id: "m1" },
      { kind: "finding", id: "f1" }, { kind: "autosim", id: "a1" },
    ],
  })
  const e = await enrichExpectation(exp, {
    getReport: async (id) => ({ title: "report " + id, urlPath: "/x", groundedQuote: "q" + id }),
    getFinding: async (id) => ({ title: "finding " + id, urlPath: null, groundedQuote: "fq" + id }),
    getStep: async () => null,
  })
  expect(e.sources.map((s) => s.kind)).toEqual(["report", "sim", "finding", "finding"])
  expect(e.sources[0].resolved).toBe(true)
  expect(e.sources[0].title).toBe("report s1")
  expect(e.sources[0].href).toBe("/dashboard#tickets")
  expect(e.sources[2].href).toBe("/dashboard#autosims")
})

test("enrichExpectation is best-effort: a throwing lookup yields an unresolved stub, never throws", async () => {
  const exp = row({ sourceRefs: [{ kind: "snap", id: "boom" }] })
  const e = await enrichExpectation(exp, {
    ...noopLookups,
    getReport: async () => { throw new Error("db down") },
  })
  expect(e.sources.length).toBe(1)
  expect(e.sources[0].resolved).toBe(false)
  expect(e.sources[0].title).toBeNull()
})

test("enrichExpectation resolves an enforced step → Trail name + 1-based position, never the raw id alone", async () => {
  const exp = row({ status: "enforced", enforcedStepId: "ts_abc" })
  const e = await enrichExpectation(exp, {
    ...noopLookups,
    getStep: async (stepId) => ({ trailId: "trl_9", trailName: "Checkout", position: 3, total: 5 }),
  })
  expect(e.linkedTrail).toEqual({ trailId: "trl_9", trailName: "Checkout", stepId: "ts_abc", stepPosition: 3, stepCount: 5 })
  // No progress hint on an enforced (Guarded) row.
  expect(e.progress).toBeNull()
})

test("enrichExpectation: unresolved step still surfaces the id (never pretends), progress only for candidates", async () => {
  const exp = row({ status: "enforced", enforcedStepId: "ts_gone" })
  const e = await enrichExpectation(exp, { ...noopLookups, getStep: async () => null })
  expect(e.linkedTrail).toEqual({ trailId: "", trailName: null, stepId: "ts_gone", stepPosition: null, stepCount: null })

  const cand = row({ status: "candidate", corroboration: { snap: true, sim: false, recurrence: 1 } })
  const ce = await enrichExpectation(cand, noopLookups)
  expect(ce.progress?.ready).toBe(false)
  expect(ce.progress?.hint).toContain("a Sim")
})
