import { test, expect } from "bun:test"
import { applyReconcileOps, type ReconcileOp, type Trait } from "./provenance"
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

test("applyReconcileOps: reopen stamps srcQuoteTs on the reactivated trait from the line's time", () => {
  const raw = "00:02:30 Sarah: The export crashed again after the update."
  const lines = parseTranscript(raw)
  const seed: Trait = {
    id: "t_contra", simId: "sim_1", projectId: "proj_1", kind: "pain",
    text: "Export is slow", status: "contradicted", strength: 2,
    srcTranscriptId: "tr_old", srcQuote: "old quote", srcQuoteOffset: 0,
    srcSpeaker: "Sarah", createdAt: 1000, updatedAt: 1000,
  }
  const ops: ReconcileOp[] = [{
    op: "reopen", kind: "pain", text: "Export crashed again",
    quote: "The export crashed again after the update.", speaker: "Sarah", traitId: "t_contra",
  }]
  let counter = 0
  const res = applyReconcileOps([seed], ops, {
    simId: "sim_1", projectId: "proj_1", transcriptId: "tr_new",
    sourceDate: 1000, rawText: raw, lines, now: 42, newId: () => `t_${++counter}`,
  })
  expect(res.traitWrites.length).toBe(1)
  expect(res.traitWrites[0].trait.status).toBe("active")
  expect(res.traitWrites[0].trait.srcQuoteTs).toBe(150)
  expect(res.traitEvents[0].quoteTs).toBe(150)
})
