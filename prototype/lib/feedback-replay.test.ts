// G1 session replay — feedback_replays storage round-trip (gzip) + size capping + project scoping.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
const file = join(tmpdir(), `klav-fbreplay-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
const { reconnectDb, applySchema, migrateV2 } = await import("./db")
let db: any
beforeAll(async () => {
  db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})
const R = await import("./feedback-replay")

// ── pure helpers ────────────────────────────────────────────────────────────────────
test("encodeReplay/decodeReplay round-trips events and compresses", () => {
  const events = Array.from({ length: 200 }, (_, i) => ({ type: 3, timestamp: 1000 + i, data: { x: i, source: "incremental" } }))
  const gz = R.encodeReplay(events)
  // base64 gzip of repetitive JSON is much smaller than the raw JSON
  expect(gz.length).toBeLessThan(JSON.stringify(events).length)
  const back = R.decodeReplay(gz)
  expect(back).toHaveLength(200)
  expect((back[0] as any).timestamp).toBe(1000)
  expect((back[199] as any).data.x).toBe(199)
})

// Incompressible per-event payload so gzip can't shrink the buffer under the cap on its own —
// forces the oldest-first trim path to engage.
function fatEvent(seq: number) {
  let blob = ""
  for (let k = 0; k < 12; k++) blob += Math.random().toString(36).slice(2)
  return { type: 3, timestamp: seq, data: { blob, seq } }
}

function deterministicNoise(length: number, seed: number) {
  let value = seed >>> 0
  let blob = ""
  for (let i = 0; i < length; i++) {
    value = (Math.imul(value, 1_664_525) + 1_013_904_223) >>> 0
    blob += String.fromCharCode(32 + (value % 95))
  }
  return blob
}

test("default cap keeps a representative replay larger than the former 600 KB limit", () => {
  const events = [
    { type: 4, timestamp: 0, data: { href: "https://app.example/dashboard", width: 1440, height: 900 } },
    { type: 2, timestamp: 1, data: { node: { type: 0, html: deterministicNoise(250_000, 99) } } },
    ...Array.from({ length: 900 }, (_, i) => ({
      type: 3,
      timestamp: 50 + i * 67,
      data: { source: i % 8, text: deterministicNoise(600, i + 1) },
    })),
  ]
  const encodedBytes = R.encodeReplay(events).length
  expect(encodedBytes).toBeGreaterThan(600_000)
  expect(encodedBytes).toBeLessThan(10_000_000)

  const capped = R.capReplayEvents(events)
  expect(capped.trimmed).toBe(false)
  expect(capped.events).toHaveLength(events.length)
})

test("capReplayEvents trims OLDEST events first when the encoded payload exceeds the cap", () => {
  // Each event is a chunky random string; 5000 of them blow well past a small cap.
  const events = Array.from({ length: 5000 }, (_, i) => fatEvent(i))
  const cap = 50_000 // bytes of base64 gzip
  const { events: trimmed, encoded, trimmed: didTrim } = R.capReplayEvents(events, cap)
  expect(didTrim).toBe(true)
  expect(encoded.length).toBeLessThanOrEqual(cap)
  expect(trimmed.length).toBeLessThan(events.length)
  // Newest events are kept: the last original event survives, the first does not.
  expect((trimmed[trimmed.length - 1] as any).data.seq).toBe(4999)
  expect((trimmed[0] as any).data.seq).toBeGreaterThan(0)
})

// ── snapshot-aware trim (#729): the retained list must ALWAYS start with a playable base ──────────
// Build a realistic rrweb buffer: Meta(4) + FullSnapshot(2) at the START, then a long tail of fat
// incremental(3) events. The OLD tail-only trim would drop the Meta+Full at the head and keep only
// orphan incrementals → a BLANK replay. The new code must re-anchor the base at the head.
function snapshotBuffer(nIncrementals: number) {
  return [
    { type: 4, timestamp: 0, data: { href: "https://app.example/x", width: 1440, height: 900 } },
    { type: 2, timestamp: 1, data: { node: { id: 1, type: 0, marker: "FULL_SNAPSHOT" } } },
    ...Array.from({ length: nIncrementals }, (_, i) => ({
      type: 3, timestamp: 100 + i, data: { source: 2, blob: deterministicNoise(400, i + 1), seq: i },
    })),
  ]
}

test("capReplayEvents keeps Meta+FullSnapshot at the head even when they start the over-cap buffer (#729)", () => {
  const events = snapshotBuffer(5000)
  const cap = 50_000
  expect(R.encodeReplay(events).length).toBeGreaterThan(cap) // precondition: must trim
  const { events: kept, encoded, trimmed } = R.capReplayEvents(events, cap)
  expect(trimmed).toBe(true)
  expect(encoded.length).toBeLessThanOrEqual(cap)
  // Head is a playable base: [Meta(4), FullSnapshot(2), …]
  expect((kept[0] as any).type).toBe(4)
  expect((kept[1] as any).type).toBe(2)
  // A FullSnapshot survives somewhere (it must, for the player to reconstruct the DOM)
  expect(kept.some((e: any) => e.type === 2)).toBe(true)
  // The trimmed-away middle means we kept the MOST-RECENT incrementals (newest seq present)
  expect(kept.some((e: any) => e.type === 3 && e.data.seq === 4999)).toBe(true)
  // …and did NOT keep the whole buffer
  expect(kept.length).toBeLessThan(events.length)
})

test("NEGATIVE CONTROL: the old tail-only trim would have dropped the snapshot (#729)", () => {
  // Reproduce exactly what the OLD capReplayEvents did: binary-search the largest trailing slice.
  const events = snapshotBuffer(5000)
  const cap = 50_000
  const oldTailOnly = (evs: any[], capBytes: number) => {
    let lo = 1, hi = evs.length, best = 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (R.encodeReplay(evs.slice(evs.length - mid)).length <= capBytes) { best = mid; lo = mid + 1 }
      else { hi = mid - 1 }
    }
    return evs.slice(evs.length - best)
  }
  const oldKept = oldTailOnly(events, cap)
  // Proof the old behavior was blank-prone: NO FullSnapshot in the retained tail.
  expect(oldKept.some((e: any) => e.type === 2)).toBe(false)
  expect(oldKept.some((e: any) => e.type === 4)).toBe(false)

  // New code on the SAME input keeps the snapshot → not blank.
  const newKept = R.capReplayEvents(events, cap).events
  expect(newKept.some((e: any) => e.type === 2)).toBe(true)
  expect(newKept.some((e: any) => e.type === 4)).toBe(true)
})

test("capReplayEvents doesn't crash when there is no FullSnapshot at all (#729)", () => {
  const events = Array.from({ length: 5000 }, (_, i) => fatEvent(i)) // all type 3, no snapshot
  const { events: kept, encoded, trimmed } = R.capReplayEvents(events, 50_000)
  expect(trimmed).toBe(true)
  expect(encoded.length).toBeLessThanOrEqual(50_000)
  expect(kept.length).toBeGreaterThan(0)
  expect(kept.length).toBeLessThan(events.length)
  // Best-effort tail: newest event preserved.
  expect((kept[kept.length - 1] as any).data.seq).toBe(4999)
})

test("capReplayEvents keeps at least Meta+Full for a degenerate huge single snapshot (#729)", () => {
  // A single FullSnapshot alone larger than the cap; Meta+Full must still survive (static frame > blank).
  const events = [
    { type: 4, timestamp: 0, data: { width: 1440, height: 900 } },
    { type: 2, timestamp: 1, data: { node: { html: deterministicNoise(200_000, 7) } } },
    { type: 3, timestamp: 2, data: { source: 2, blob: deterministicNoise(200, 1), seq: 0 } },
  ]
  const cap = 10_000 // far below the snapshot's encoded size
  expect(R.encodeReplay([events[0], events[1]]).length).toBeGreaterThan(cap) // base alone over cap
  const { events: kept, encoded, trimmed } = R.capReplayEvents(events, cap)
  expect(trimmed).toBe(true)
  // Keep exactly Meta+Full (a static frame), never blank.
  expect((kept[0] as any).type).toBe(4)
  expect((kept[1] as any).type).toBe(2)
  expect(kept.length).toBe(2)
  expect(encoded.length).toBeGreaterThan(0)
})

test("capReplayEvents leaves a small buffer untouched", () => {
  const events = Array.from({ length: 10 }, (_, i) => ({ type: 3, timestamp: i }))
  const { events: trimmed, trimmed: didTrim, encoded } = R.capReplayEvents(events, 1_000_000)
  expect(didTrim).toBe(false)
  expect(trimmed).toHaveLength(10)
  expect(encoded.length).toBeGreaterThan(0)
})

test("capReplayEvents returns empty + no encoding for an empty buffer", () => {
  const { events: trimmed, encoded, trimmed: didTrim } = R.capReplayEvents([], 1000)
  expect(trimmed).toHaveLength(0)
  expect(encoded).toBe("")
  expect(didTrim).toBe(false)
})

// ── storage round-trip ──────────────────────────────────────────────────────────────
test("saveFeedbackReplay/getFeedbackReplay round-trips; project-scoped", async () => {
  const events = Array.from({ length: 30 }, (_, i) => ({ type: 3, timestamp: i, data: { i } }))
  const res = await R.saveFeedbackReplay("proj_F", "fb_1", events)
  expect(res.saved).toBe(true)
  expect(res.nEvents).toBe(30)

  const got = await R.getFeedbackReplay("proj_F", "fb_1")
  expect(got).not.toBeNull()
  expect(got!.events).toHaveLength(30)
  expect((got!.events[5] as any).data.i).toBe(5)
  expect(got!.nEvents).toBe(30)

  // cross-project read returns null (no tenant leak)
  expect(await R.getFeedbackReplay("proj_OTHER", "fb_1")).toBeNull()
  // a feedbackId with no replay returns null
  expect(await R.getFeedbackReplay("proj_F", "fb_nope")).toBeNull()
})

test("saveFeedbackReplay rejects oversize payloads after trimming to the cap", async () => {
  // 8000 fat (incompressible) events vs a tiny cap → trimming kicks in but the most-recent slice saves.
  const events = Array.from({ length: 8000 }, (_, i) => fatEvent(i))
  const res = await R.saveFeedbackReplay("proj_F", "fb_big", events, 50_000)
  expect(res.saved).toBe(true)
  expect(res.trimmed).toBe(true)
  expect(res.nEvents).toBeLessThan(8000)
  const got = await R.getFeedbackReplay("proj_F", "fb_big")
  expect(got!.events.length).toBe(res.nEvents)
  // the newest event is preserved
  expect((got!.events[got!.events.length - 1] as any).data.seq).toBe(7999)
})

test("saveFeedbackReplay is a no-op for an empty buffer", async () => {
  const res = await R.saveFeedbackReplay("proj_F", "fb_empty", [])
  expect(res.saved).toBe(false)
  expect(await R.getFeedbackReplay("proj_F", "fb_empty")).toBeNull()
})

test("feedbackIdsWithReplay reports which feedback rows have a stored replay", async () => {
  await R.saveFeedbackReplay("proj_S", "fb_a", [{ type: 4, timestamp: 1 }, { type: 3, timestamp: 2 }])
  const set = await R.feedbackIdsWithReplay("proj_S", ["fb_a", "fb_missing"])
  expect(set.has("fb_a")).toBe(true)
  expect(set.has("fb_missing")).toBe(false)
  // cross-project does not leak
  const none = await R.feedbackIdsWithReplay("proj_OTHER", ["fb_a"])
  expect(none.has("fb_a")).toBe(false)
})
