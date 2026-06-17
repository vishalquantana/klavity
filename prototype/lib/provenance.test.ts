// P3a provenance core test — exercises the PURE applyReconcileOps + insightsFromTraits.
// Feeds a current-trait set + a mixed op list and asserts: correct trait writes, append-only
// trait_events, insights rebuilt from ACTIVE traits only, and that contradict/supersede MARK
// the old trait (status change) rather than deleting it.
import { test, expect } from "bun:test"
import {
  applyReconcileOps,
  insightsFromTraits,
  type Trait,
  type ReconcileOp,
  type ReconcileCtx,
} from "./provenance"

const SIM = "sim_sarah"
const PROJ = "proj_acme"

function trait(over: Partial<Trait> & Pick<Trait, "id" | "kind" | "text">): Trait {
  return {
    simId: SIM, projectId: PROJ, status: "active", strength: 1,
    srcTranscriptId: "tr_old", srcQuote: "old quote", srcQuoteOffset: 0,
    srcSpeaker: "Sarah", createdAt: 1000, updatedAt: 1000,
    ...over,
  }
}

// deterministic id factory for stable assertions on newly created traits.
function ctx(): ReconcileCtx {
  let n = 0
  return {
    simId: SIM, projectId: PROJ, transcriptId: "tr_new", sourceDate: 2000,
    now: 5000, newId: () => `new_${++n}`,
  }
}

test("applyReconcileOps: mixed ops produce correct writes, append-only events, active-only insights", () => {
  const current: Trait[] = [
    trait({ id: "t_pain", kind: "pain", text: "Export is slow", strength: 2 }),
    trait({ id: "t_want", kind: "want", text: "Wants dark mode" }),
    trait({ id: "t_love", kind: "love", text: "Loves the search" }),
  ]

  const ops: ReconcileOp[] = [
    // reinforce an existing pain
    { op: "reinforce", kind: "pain", text: "Export is slow", quote: "still takes forever", quoteOffset: 10, speaker: "Sarah", traitId: "t_pain" },
    // refine an existing want's text
    { op: "refine", kind: "want", text: "Wants a true dark theme, not just dimmed", quote: "I need a proper dark mode", quoteOffset: 20, speaker: "Sarah", traitId: "t_want" },
    // contradict the love trait (she changed her mind)
    { op: "contradict", kind: "love", text: "No longer loves search", quote: "search is broken now", quoteOffset: 30, speaker: "Sarah", traitId: "t_love" },
    // brand-new trait
    { op: "add", kind: "pain", text: "Onboarding confusing", quote: "I got lost setting up", quoteOffset: 40, speaker: "Sarah" },
    // supersede: not in current set initially -> add a target then supersede in a second run; here supersede t_pain? keep separate below
  ]

  const res = applyReconcileOps(current, ops, ctx())

  // ── trait writes ──
  // reinforce(update) + refine(update) + contradict(update) + add(insert) = 4 writes
  expect(res.traitWrites.length).toBe(4)

  const reinforce = res.traitWrites.find((w) => w.trait.id === "t_pain")!
  expect(reinforce.mode).toBe("update")
  expect(reinforce.trait.strength).toBe(3) // 2 -> 3
  expect(reinforce.trait.srcQuote).toBe("still takes forever")
  expect(reinforce.trait.srcTranscriptId).toBe("tr_new")
  expect(reinforce.trait.status).toBe("active")

  const refine = res.traitWrites.find((w) => w.trait.id === "t_want")!
  expect(refine.mode).toBe("update")
  expect(refine.trait.text).toBe("Wants a true dark theme, not just dimmed")
  expect(refine.trait.strength).toBe(2)

  const contradicted = res.traitWrites.find((w) => w.trait.id === "t_love")!
  expect(contradicted.mode).toBe("update")
  expect(contradicted.trait.status).toBe("contradicted") // MARKED, not deleted

  const added = res.traitWrites.find((w) => w.mode === "insert")!
  expect(added.trait.id).toBe("new_1")
  expect(added.trait.text).toBe("Onboarding confusing")
  expect(added.trait.status).toBe("active")

  // ── trait_events: append-only, one per op (create/reinforce/refine/contradict) ──
  expect(res.traitEvents.length).toBe(4)
  const ops_seen = res.traitEvents.map((e) => e.op).sort()
  expect(ops_seen).toEqual(["contradict", "create", "refine", "reinforce"])
  // every event is grounded in the new transcript + carries the quote/source_date
  for (const e of res.traitEvents) {
    expect(e.transcriptId).toBe("tr_new")
    expect(e.sourceDate).toBe(2000)
    expect(e.quote.length).toBeGreaterThan(0)
    expect(e.createdAt).toBe(5000)
  }
  const refineEvt = res.traitEvents.find((e) => e.op === "refine")!
  expect(refineEvt.beforeText).toBe("Wants dark mode")
  expect(refineEvt.afterText).toBe("Wants a true dark theme, not just dimmed")

  // ── active-trait set: t_pain (active), t_want (active), new_1 (active). t_love contradicted -> excluded. ──
  const activeIds = res.activeTraits.map((t) => t.id).sort()
  expect(activeIds).toEqual(["new_1", "t_pain", "t_want"])
  expect(res.activeTraits.every((t) => t.status === "active")).toBe(true)

  // ── insights rebuilt from ACTIVE only (contradicted love is gone) ──
  const insights = insightsFromTraits(res.activeTraits)
  expect(insights.length).toBe(3)
  expect(insights.find((i) => i.kind === "love")).toBeUndefined()
  expect(insights.map((i) => i.traitId).sort()).toEqual(["new_1", "t_pain", "t_want"])
})

test("supersede marks old trait superseded (not deleted) and creates a new active replacement", () => {
  const current: Trait[] = [
    trait({ id: "t_old", kind: "want", text: "Wants CSV export" }),
  ]
  const ops: ReconcileOp[] = [
    { op: "supersede", kind: "want", text: "Wants full Excel export, not CSV", quote: "CSV isn't enough, I need Excel", quoteOffset: 5, speaker: "Sarah", traitId: "t_old" },
  ]
  const res = applyReconcileOps(current, ops, ctx())

  // one update (old -> superseded) + one insert (replacement)
  expect(res.traitWrites.length).toBe(2)
  const oldW = res.traitWrites.find((w) => w.trait.id === "t_old")!
  expect(oldW.mode).toBe("update")
  expect(oldW.trait.status).toBe("superseded") // MARKED, still present
  const newW = res.traitWrites.find((w) => w.mode === "insert")!
  expect(newW.trait.status).toBe("active")
  expect(newW.trait.text).toBe("Wants full Excel export, not CSV")

  // events: a 'supersede' event on the OLD trait (referencing new) + a 'create' for the new trait
  const supEvt = res.traitEvents.find((e) => e.op === "supersede")!
  expect(supEvt.traitId).toBe("t_old")
  expect(supEvt.reason).toContain("superseded_by:")
  expect(res.traitEvents.some((e) => e.op === "create" && e.traitId === newW.trait.id)).toBe(true)

  // active set: only the replacement (old superseded is excluded)
  expect(res.activeTraits.map((t) => t.id)).toEqual([newW.trait.id])

  // input not mutated (purity): the original current trait is still active
  expect(current[0].status).toBe("active")
})

test("ops targeting a missing/inactive trait fall back to a new active trait (no signal lost)", () => {
  const res = applyReconcileOps(
    [trait({ id: "t_gone", kind: "pain", text: "x", status: "contradicted" })],
    [{ op: "reinforce", kind: "pain", text: "New pain surfaced", quote: "this is new", traitId: "t_missing" },
     { op: "refine", kind: "want", text: "Refine of inactive", quote: "q", traitId: "t_gone" }],
    ctx(),
  )
  // both become inserts
  expect(res.traitWrites.every((w) => w.mode === "insert")).toBe(true)
  expect(res.traitWrites.length).toBe(2)
  expect(res.traitEvents.every((e) => e.op === "create")).toBe(true)
  // the originally-contradicted trait stays excluded from active
  expect(res.activeTraits.some((t) => t.id === "t_gone")).toBe(false)
})
