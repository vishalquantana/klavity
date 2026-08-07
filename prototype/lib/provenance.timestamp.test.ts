import { test, expect } from "bun:test"
import { applyReconcileOps, type ReconcileOp } from "./provenance"
import { parseTranscript } from "./transcript-parse"

const RAW = "00:00:05 Sarah: The fonts are way too small on the dashboard."

test("applyReconcileOps stamps srcQuoteTs and quoteTs from the line's time", () => {
  const lines = parseTranscript(RAW)
  const ops: ReconcileOp[] = [{
    op: "add", kind: "pain", text: "Fonts too small on dashboard",
    quote: "The fonts are way too small on the dashboard.", speaker: "Sarah",
  }]
  let counter = 0
  const res = applyReconcileOps([], ops, {
    simId: "sim_1", projectId: "proj_1", transcriptId: "tr_1",
    sourceDate: 1000, rawText: RAW, lines, now: 42, newId: () => `t_${++counter}`,
  })
  expect(res.traitWrites.length).toBe(1)
  expect(res.traitWrites[0].trait.srcQuoteTs).toBe(5)
  expect(res.traitEvents[0].quoteTs).toBe(5)
})

test("untimed line yields null srcQuoteTs (upload-time fallback happens at render)", () => {
  const raw = "Sarah: no timestamp on this line at all."
  const lines = parseTranscript(raw)
  const ops: ReconcileOp[] = [{
    op: "add", kind: "pain", text: "no ts", quote: "no timestamp on this line at all.", speaker: "Sarah",
  }]
  let counter = 0
  const res = applyReconcileOps([], ops, {
    simId: "sim_1", projectId: "proj_1", transcriptId: "tr_1",
    sourceDate: 1000, rawText: raw, lines, now: 42, newId: () => `t_${++counter}`,
  })
  expect(res.traitWrites[0].trait.srcQuoteTs).toBe(null)
})
