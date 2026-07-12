// prototype/lib/expectations-db.test.ts
import { test, expect } from "bun:test"
import { createClient } from "@libsql/client"
import { applySchema } from "./db"
import { upsertExpectation, listExpectations, getExpectation, setExpectationEnforced, setExpectationStatus, demoteExpectationToValidated, SOURCE_REFS_MAX } from "./expectations-db"
import { listNearMisses, nearMissSummary } from "./expectations-nearmiss"

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

// ── B.9 (KLA-249): retired rows resurrect on a fresh signal; un-enforce keeps history ──

test("B.9: a retired expectation resurrects to candidate when a fresh signal matches it", async () => {
  const c = await fresh()
  const e = await upsertExpectation(c, { projectId: "p1", title: "Coupon field missing at checkout", dedupKey: "k-res", source: { kind: "snap", id: "s1" } })
  // Retire it (as the retire route does).
  await setExpectationStatus(c, e.id, "retired")
  expect((await getExpectation(c, e.id))!.status).toBe("retired")

  // A fresh Sim signal for the same issue arrives → the retired row is matched, corroboration bumps,
  // and nextStatus resurrects it to CANDIDATE (it must re-earn its way up).
  const back = await upsertExpectation(c, { projectId: "p1", title: "Coupon field missing at checkout", dedupKey: "k-res", source: { kind: "sim", id: "s2" } })
  expect(back.id).toBe(e.id) // same row (not a duplicate)
  expect(back.status).toBe("candidate")
  expect(back.corroboration.recurrence).toBe(2)
  expect((await listExpectations(c, "p1")).length).toBe(1)
})

test("B.9: demoteExpectationToValidated demotes enforced → validated and clears the step, keeping history", async () => {
  const c = await fresh()
  const e = await upsertExpectation(c, { projectId: "p1", title: "Header cart badge visible", dedupKey: "k-un", source: { kind: "snap", id: "s1" } })
  await setExpectationEnforced(c, e.id, "ts_step_1")
  expect((await getExpectation(c, e.id))!.status).toBe("enforced")

  await demoteExpectationToValidated(c, e.id)
  const got = await getExpectation(c, e.id)!
  expect(got!.status).toBe("validated")
  expect(got!.enforcedStepId).toBe(null) // the check pointer is cleared
  // History (corroboration + source refs) survives the demotion.
  expect(got!.sourceRefs.length).toBe(1)
  expect(got!.corroboration.recurrence).toBe(1)
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

// ── KLA-251 (B.11): declined near-miss logging is wired through upsertExpectation ────────────

test("B.11: a below-threshold pair is logged as a near-miss but does NOT collapse", async () => {
  const c = await fresh()
  // Seed an AutoSim finding (autosim), then a Snap report that scores in the band (~0.78) — the
  // classic under-matched Snap↔AutoSim pair the ticket calls out.
  await upsertExpectation(c, { projectId: "p1", title: "Finish button missing on onboarding page", dedupKey: "k-a", source: { kind: "autosim", id: "f1" } })
  await upsertExpectation(c, { projectId: "p1", title: "Submit button missing on onboarding page", dedupKey: "k-b", source: { kind: "snap", id: "s1" } })

  // Not collapsed — two distinct expectations remain (the miss the instrumentation measures).
  expect((await listExpectations(c, "p1")).length).toBe(2)

  // One near-miss row logged, carrying titles, kinds, score (in band), threshold, and project.
  const nm = await listNearMisses(c, "p1")
  expect(nm.length).toBe(1)
  expect(nm[0].candTitle).toBe("Submit button missing on onboarding page")
  expect(nm[0].existingTitle).toBe("Finish button missing on onboarding page")
  expect(nm[0].candKind).toBe("snap")
  expect(nm[0].existingKinds).toContain("autosim")
  expect(nm[0].score).toBeGreaterThanOrEqual(0.55)
  expect(nm[0].score).toBeLessThan(0.82)
  expect(nm[0].threshold).toBe(0.82)
  expect(nm[0].projectId).toBe("p1")
})

test("B.11: exact dedup_key fast path collapses and logs NO near-miss (instrumentation is inert on the fast path)", async () => {
  const c = await fresh()
  await upsertExpectation(c, { projectId: "p1", title: "Login fails", dedupKey: "k-same", source: { kind: "sim", id: "s1" } })
  await upsertExpectation(c, { projectId: "p1", title: "Login totally fails now", dedupKey: "k-same", source: { kind: "snap", id: "s2" } })
  // Collapsed via exact dedup_key — the lexical/near-miss path never ran.
  expect((await listExpectations(c, "p1")).length).toBe(1)
  expect((await listNearMisses(c, "p1")).length).toBe(0)
})

test("B.11: a >=0.82 lexical match still collapses and logs NO near-miss", async () => {
  const c = await fresh()
  await upsertExpectation(c, { projectId: "p1", title: "Finish button missing on onboarding page", dedupKey: "k1", source: { kind: "sim", id: "s1" } })
  await upsertExpectation(c, { projectId: "p1", title: "Finish button gone on onboarding page", dedupKey: "k2", source: { kind: "snap", id: "s2" } })
  // Accepted (>=0.82) → collapsed, and the accepted pair is not a "declined" near-miss.
  expect((await listExpectations(c, "p1")).length).toBe(1)
  expect((await listNearMisses(c, "p1")).length).toBe(0)
})

test("B.11: nearMissSummary reports count + score stats + samples per project", async () => {
  const c = await fresh()
  await upsertExpectation(c, { projectId: "p1", title: "Finish button missing on onboarding page", dedupKey: "k-a", source: { kind: "autosim", id: "f1" } })
  await upsertExpectation(c, { projectId: "p1", title: "Submit button missing on onboarding page", dedupKey: "k-b", source: { kind: "snap", id: "s1" } })

  const sum = await nearMissSummary(c, "p1")
  expect(sum.count).toBe(1)
  expect(sum.avgScore).toBeGreaterThanOrEqual(0.55)
  expect(sum.avgScore).toBeLessThan(0.82)
  expect(sum.samples.length).toBe(1)
  expect(sum.samples[0].candTitle).toBe("Submit button missing on onboarding page")

  // A project with no near-misses returns an empty, zeroed summary (no throw).
  const empty = await nearMissSummary(c, "p-empty")
  expect(empty.count).toBe(0)
  expect(empty.samples.length).toBe(0)
})
