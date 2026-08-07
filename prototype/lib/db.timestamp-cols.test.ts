import { test, expect } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { insertTranscript, transcriptById, insertTrait, listTraits, insertTraitEvent, listTraitEvents } from "./db"

useIsolatedDb("klav-ts-cols")

test("transcript round-trips lines_json", async () => {
  const id = await insertTranscript({
    projectId: "proj_1", rawText: "00:00:05 Sarah: hi", sourceDate: 1000, addedBy: "t@x.com",
    lines: [{ speaker: "Sarah", text: "hi", tsSeconds: 5, charStart: 0, charEnd: 18 }],
  })
  const row = await transcriptById("proj_1", id)
  expect(row?.lines?.[0].tsSeconds).toBe(5)
})

test("trait round-trips srcQuoteTs", async () => {
  await insertTrait({
    id: "trt_1", simId: "sim_1", projectId: "proj_1", kind: "pain", text: "fonts", status: "active",
    strength: 1, srcTranscriptId: "tr_1", srcQuote: "q", srcQuoteOffset: 0, srcQuoteTs: 5,
    srcSpeaker: "Sarah", createdAt: 1, updatedAt: 1,
  } as any)
  const traits = await listTraits("sim_1")
  expect(traits[0].srcQuoteTs).toBe(5)
})

test("trait event round-trips quoteTs", async () => {
  await insertTraitEvent({
    traitId: "trt_1", simId: "sim_1", transcriptId: "tr_1", op: "create", beforeText: null,
    afterText: "fonts", quote: "q", quoteOffset: 0, quoteTs: 5, speaker: "Sarah",
    sourceDate: 1, reason: null, createdAt: 1,
  } as any)
  const events = await listTraitEvents("sim_1")
  expect(events[0].quoteTs).toBe(5)
})
