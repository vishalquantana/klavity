// prototype/lib/expectations-db.test.ts
import { test, expect } from "bun:test"
import { createClient } from "@libsql/client"
import { applySchema } from "./db"
import { upsertExpectation, listExpectations, getExpectation, setExpectationEnforced, SOURCE_REFS_MAX } from "./expectations-db"

async function fresh() { const c = createClient({ url: "file::memory:" }); await applySchema(c); return c }

test("first source creates a candidate", async () => {
  const c = await fresh()
  const e = await upsertExpectation(c, { projectId: "p1", title: "Finish button missing", urlPath: "/onboarding", dedupKey: "k1", source: { kind: "sim", id: "fb_1" } })
  expect(e.status).toBe("candidate")
  expect(e.corroboration).toEqual({ snap: false, sim: true, recurrence: 1 })
  expect(e.sourceRefs).toEqual([{ kind: "sim", id: "fb_1" }])
})

test("snap + sim on same dedup_key collapses and auto-validates", async () => {
  const c = await fresh()
  await upsertExpectation(c, { projectId: "p1", title: "Finish button missing", dedupKey: "k1", source: { kind: "sim", id: "fb_1" } })
  const e = await upsertExpectation(c, { projectId: "p1", title: "Finish button missing", dedupKey: "k1", source: { kind: "snap", id: "fb_2" } })
  expect(e.status).toBe("validated")
  expect(e.corroboration).toEqual({ snap: true, sim: true, recurrence: 2 })
  expect((await listExpectations(c, "p1")).length).toBe(1) // collapsed, not duplicated
})

test("lexical near-duplicate collapses even with a different dedup_key", async () => {
  const c = await fresh()
  await upsertExpectation(c, { projectId: "p1", title: "Finish button missing on onboarding", dedupKey: "k1", source: { kind: "sim", id: "s1" } })
  const e = await upsertExpectation(c, { projectId: "p1", title: "Finish button is missing on onboarding", dedupKey: "k2", source: { kind: "snap", id: "s2" } })
  expect((await listExpectations(c, "p1")).length).toBe(1)
  expect(e.status).toBe("validated")
})

test("setExpectationEnforced flips status + records step", async () => {
  const c = await fresh()
  const e = await upsertExpectation(c, { projectId: "p1", title: "x", dedupKey: "k1", source: { kind: "snap", id: "s1" } })
  await setExpectationEnforced(c, e.id, "ts_99")
  const got = await getExpectation(c, e.id)
  expect(got!.status).toBe("enforced")
  expect(got!.enforcedStepId).toBe("ts_99")
})

// ── Spine leak regression: source_refs_json must stay bounded ────────────────
// KLAVITYKLA-237: upsertExpectation was appending every new SourceRef without any
// cap or deduplication. Continuous Sim-reviews (dozens per session) would call
// ingestSnapOrSim on the same expectation and grow source_refs_json without bound,
// causing the SQLite row to balloon in size indefinitely.

test("source refs are capped at SOURCE_REFS_MAX even after many ingests on the same expectation", async () => {
  const c = await fresh()
  // Create the expectation with the first source.
  await upsertExpectation(c, { projectId: "p1", title: "Button broken", dedupKey: "k-leak", source: { kind: "sim", id: "fb_0" } })

  // Upsert SOURCE_REFS_MAX + 20 ADDITIONAL distinct feedback IDs onto the same expectation.
  // Without the cap fix, sourceRefs would grow to SOURCE_REFS_MAX + 21 entries.
  const extra = SOURCE_REFS_MAX + 20
  for (let i = 1; i <= extra; i++) {
    await upsertExpectation(c, { projectId: "p1", title: "Button broken", dedupKey: "k-leak", source: { kind: "snap", id: `fb_${i}` } })
  }

  const got = await getExpectation(c, (await listExpectations(c, "p1"))[0].id)
  // sourceRefs must never exceed the cap — this was the leak.
  expect(got!.sourceRefs.length).toBeLessThanOrEqual(SOURCE_REFS_MAX)
})

test("duplicate source id is not stored twice (exact-id dedup within source refs)", async () => {
  const c = await fresh()
  // Upsert the same source id twice (same feedback row re-ingested, e.g. retry path).
  await upsertExpectation(c, { projectId: "p1", title: "Login fails", dedupKey: "k-dup", source: { kind: "sim", id: "fb_dup" } })
  await upsertExpectation(c, { projectId: "p1", title: "Login fails", dedupKey: "k-dup", source: { kind: "sim", id: "fb_dup" } })

  const got = await getExpectation(c, (await listExpectations(c, "p1"))[0].id)
  // Same id should appear only once.
  const idsWithFbDup = got!.sourceRefs.filter((r) => r.id === "fb_dup")
  expect(idsWithFbDup.length).toBe(1)
})
