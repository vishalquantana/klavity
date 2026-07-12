// prototype/lib/expectations-nearmiss.test.ts
// KLA-251 (B.11): the embeddings second-pass (Phase 2) is FLAG-GATED and, when on, demonstrably
// recovers a true cross-source match that the lexical thread declined.
import { test, expect, afterEach } from "bun:test"
import { cosineSim, embeddingsEnabled, embeddingsRematch, type Embedder } from "./expectations-nearmiss"

const ORIG = process.env.KLAV_EXP_EMBEDDINGS
afterEach(() => {
  if (ORIG === undefined) delete process.env.KLAV_EXP_EMBEDDINGS
  else process.env.KLAV_EXP_EMBEDDINGS = ORIG
})

test("cosineSim: identical=1, orthogonal=0, mismatched-length=0", () => {
  expect(cosineSim([1, 0], [1, 0])).toBeCloseTo(1, 6)
  expect(cosineSim([1, 0], [0, 1])).toBeCloseTo(0, 6)
  expect(cosineSim([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 6) // same direction, different magnitude
  expect(cosineSim([1, 0], [1, 0, 0])).toBe(0)              // length mismatch → guarded 0
})

// Deterministic fake embedder: maps each title to a hand-picked vector so we control cosine.
// "submit form" pair points the same way (true match the lexical pass missed); the unrelated
// title points orthogonally.
const fakeEmbed: Embedder = async (texts) => texts.map((t) => {
  if (t.includes("submit") || t.includes("Submit")) return [1, 0.05, 0]
  if (t.includes("form")) return [0.98, 0.1, 0]
  return [0, 0, 1]
})

test("B.11 Phase 2: embeddingsRematch is a no-op when the flag is OFF (default)", async () => {
  delete process.env.KLAV_EXP_EMBEDDINGS
  expect(embeddingsEnabled()).toBe(false)
  const hit = await embeddingsRematch({
    candTitle: "cant submit the form",
    existing: [{ id: "e1", title: "Target gone: Submit button" }],
    embed: fakeEmbed,
  })
  expect(hit).toBe(null) // flag off → never fires, regardless of embedder
})

test("B.11 Phase 2: when flag ON, embeddings recovers a true match the lexical thread declined", async () => {
  process.env.KLAV_EXP_EMBEDDINGS = "1"
  expect(embeddingsEnabled()).toBe(true)

  const existing = [
    { id: "e1", title: "Target gone: Submit button" }, // semantically the same issue
    { id: "e2", title: "Unrelated dashboard chart bug" },
  ]
  const hit = await embeddingsRematch({
    candTitle: "cant submit the form",
    existing,
    embed: fakeEmbed,
    threshold: 0.9,
  })
  expect(hit).not.toBe(null)
  expect(hit!.matchId).toBe("e1")
  expect(hit!.score).toBeGreaterThanOrEqual(0.9)
})

test("B.11 Phase 2: below the embedding threshold returns null (no false recovery)", async () => {
  process.env.KLAV_EXP_EMBEDDINGS = "1"
  const hit = await embeddingsRematch({
    candTitle: "cant submit the form",
    existing: [{ id: "e2", title: "Unrelated dashboard chart bug" }], // orthogonal vector
    embed: fakeEmbed,
    threshold: 0.9,
  })
  expect(hit).toBe(null)
})

test("B.11 Phase 2: embedder failure (empty vectors) is swallowed, returns null", async () => {
  process.env.KLAV_EXP_EMBEDDINGS = "1"
  const brokenEmbed: Embedder = async () => []
  const hit = await embeddingsRematch({
    candTitle: "cant submit the form",
    existing: [{ id: "e1", title: "Target gone: Submit button" }],
    embed: brokenEmbed,
  })
  expect(hit).toBe(null)
})
