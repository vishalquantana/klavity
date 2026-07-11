// KLA-268: Health board summary logic unit tests.
// Mirrors the buildHealthSummary() function in dashboard.html (AutoSims view)
// so regressions in the count/headline logic are caught without a browser.

import { test, expect } from "bun:test"

// ── Port of buildHealthSummary from dashboard.html ──────────────────────────
type TrailLike = { id: string; status: string }
type WalkLike  = { trailId: string; status: string; startedAt?: number }

function buildHealthSummary(trails: TrailLike[], recentWalks: WalkLike[]) {
  const counts = { red: 0, amber: 0, green: 0, draft: 0, noWalk: 0 }
  let latestCheckedAt = 0
  const walkIndex: Record<string, WalkLike> = {}
  ;(recentWalks ?? []).forEach((w) => { if (!walkIndex[w.trailId]) walkIndex[w.trailId] = w })
  ;(trails ?? []).forEach((t) => {
    if (t.status === "draft")  { counts.draft++;  return }
    if (t.status === "paused") { return }          // intentionally quiet; excluded from health
    const w = walkIndex[t.id]
    if (!w) { counts.noWalk++; return }
    const v = String(w.status ?? "")
    if (v === "red")   counts.red++
    else if (v === "amber") counts.amber++
    else if (v === "green") counts.green++
    else counts.noWalk++
    if (w.startedAt && Number(w.startedAt) > latestCheckedAt) latestCheckedAt = Number(w.startedAt)
  })
  return { counts, latestCheckedAt }
}

// ── Tests ────────────────────────────────────────────────────────────────────

test("health-board: no trails → all zeros", () => {
  const { counts } = buildHealthSummary([], [])
  expect(counts).toEqual({ red: 0, amber: 0, green: 0, draft: 0, noWalk: 0 })
})

test("health-board: all green walks → counts.green = N", () => {
  const trails = [
    { id: "t1", status: "active" },
    { id: "t2", status: "active" },
  ]
  const walks = [
    { trailId: "t1", status: "green", startedAt: 1000 },
    { trailId: "t2", status: "green", startedAt: 2000 },
  ]
  const { counts, latestCheckedAt } = buildHealthSummary(trails, walks)
  expect(counts.green).toBe(2)
  expect(counts.red).toBe(0)
  expect(counts.amber).toBe(0)
  expect(latestCheckedAt).toBe(2000)
})

test("health-board: one red, one amber, one green", () => {
  const trails = [
    { id: "t1", status: "active" },
    { id: "t2", status: "active" },
    { id: "t3", status: "active" },
  ]
  const walks = [
    { trailId: "t1", status: "red" },
    { trailId: "t2", status: "amber" },
    { trailId: "t3", status: "green" },
  ]
  const { counts } = buildHealthSummary(trails, walks)
  expect(counts.red).toBe(1)
  expect(counts.amber).toBe(1)
  expect(counts.green).toBe(1)
  expect(counts.draft).toBe(0)
})

test("health-board: draft trails counted separately, not in health signal", () => {
  const trails = [
    { id: "t1", status: "draft" },
    { id: "t2", status: "active" },
  ]
  const walks = [{ trailId: "t2", status: "green" }]
  const { counts } = buildHealthSummary(trails, walks)
  expect(counts.draft).toBe(1)
  expect(counts.green).toBe(1)
  expect(counts.red).toBe(0)
})

test("health-board: paused trails excluded from health counts", () => {
  const trails = [
    { id: "t1", status: "paused" },
    { id: "t2", status: "active" },
  ]
  const walks = [
    { trailId: "t1", status: "red" }, // paused trail — walk verdict ignored
    { trailId: "t2", status: "green" },
  ]
  const { counts } = buildHealthSummary(trails, walks)
  expect(counts.red).toBe(0)    // paused trail skipped
  expect(counts.green).toBe(1)
})

test("health-board: active trail with no walk → noWalk", () => {
  const trails = [{ id: "t1", status: "active" }]
  const { counts } = buildHealthSummary(trails, [])
  expect(counts.noWalk).toBe(1)
  expect(counts.red).toBe(0)
})

test("health-board: running/needs_auth walk → noWalk (no verdict yet)", () => {
  const trails = [
    { id: "t1", status: "active" },
    { id: "t2", status: "active" },
  ]
  const walks = [
    { trailId: "t1", status: "running" },
    { trailId: "t2", status: "needs_auth" },
  ]
  const { counts } = buildHealthSummary(trails, walks)
  expect(counts.noWalk).toBe(2)
  expect(counts.red + counts.amber + counts.green).toBe(0)
})

test("health-board: latestCheckedAt picks most-recent walk startedAt", () => {
  const trails = [
    { id: "t1", status: "active" },
    { id: "t2", status: "active" },
    { id: "t3", status: "active" },
  ]
  const walks = [
    { trailId: "t1", status: "green", startedAt: 5000 },
    { trailId: "t2", status: "red",   startedAt: 9000 },
    { trailId: "t3", status: "amber", startedAt: 3000 },
  ]
  const { latestCheckedAt } = buildHealthSummary(trails, walks)
  expect(latestCheckedAt).toBe(9000)
})

test("health-board: only first walk per trail used (latest-walk-for semantics)", () => {
  // recentWalks is ordered newest-first; the first entry for a trailId wins
  const trails = [{ id: "t1", status: "active" }]
  const walks = [
    { trailId: "t1", status: "green", startedAt: 2000 }, // newest — should win
    { trailId: "t1", status: "red",   startedAt: 1000 }, // older — ignored
  ]
  const { counts } = buildHealthSummary(trails, walks)
  expect(counts.green).toBe(1)
  expect(counts.red).toBe(0)
})
