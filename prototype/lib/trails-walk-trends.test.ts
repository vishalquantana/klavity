// KLA-78: walk trends query — time-bucketed walk metrics ordered oldest→newest.
// Tests:
//   (A) Empty project returns empty buckets.
//   (B) Multi-day walk data returns one bucket per day, ordered oldest→newest.
//   (C) Pass rate is correct (green / total). Days with only amber/red have passRate 0.
//   (D) Running walks are excluded from buckets (non-terminal).
//   (E) bucketDays window filters out walks older than the window.
//   (F) Optional trailId scopes buckets to that trail only.

import { test, expect, beforeAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomBytes } from "node:crypto"

const ts = `${Date.now()}-${randomBytes(4).toString("hex")}`
const dbFile = join(tmpdir(), `klav-trends-${ts}.db`)

import { reconnectDb, applySchema, migrateV2 } from "./db"

let db: Awaited<ReturnType<typeof reconnectDb>>

const DAY_MS = 24 * 3600 * 1000

// Bucket date from a timestamp (UTC YYYY-MM-DD matching SQLite strftime)
function bucketDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

beforeAll(async () => {
  db = reconnectDb("file:" + dbFile)
  await applySchema(db)
  await migrateV2(db)

  const NOW = Date.now()
  const acctId = `acct_tr_${ts}`
  const projId = `proj_tr_${ts}`
  const trailId = `trail_tr_${ts}`
  const trailId2 = `trail_tr2_${ts}`

  await db.execute({ sql: `INSERT INTO users (email, created_at) VALUES (?, ?)`, args: [`tr-${ts}@test.local`, NOW] })
  await db.execute({ sql: `INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, args: [acctId, "Trend WS", `tr-${ts}@test.local`, NOW] })
  await db.execute({ sql: `INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [projId, acctId, "Trend Project", "active", "auto", 200, "named", NOW, NOW] })
  await db.execute({ sql: `INSERT INTO trails (id, project_id, name, base_url, author_kind, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, args: [trailId, projId, "Trail One", "https://example.com", "human", "active", NOW, NOW] })
  await db.execute({ sql: `INSERT INTO trails (id, project_id, name, base_url, author_kind, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, args: [trailId2, projId, "Trail Two", "https://example.com", "human", "active", NOW, NOW] })

  // Seed walks across 3 days (today - 2, today - 1, today):
  //   Day -2: 2 green, 1 amber                 → passRate = 2/3
  //   Day -1: 1 red                             → passRate = 0/1
  //   Day  0: 1 green (trail1) + 1 amber (trail2) + 1 running (excluded)
  const day = (offset: number) => NOW - Math.abs(offset) * DAY_MS + 1000
  const run = (id: string, trailId_: string, status: string, started: number) =>
    db.execute({ sql: `INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, started_at, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, trailId_, projId, "manual", status, started, status === "running" ? null : started + 5000] })

  await run(`run_t1_g1_${ts}`, trailId,  "green", day(-2))
  await run(`run_t1_g2_${ts}`, trailId,  "green", day(-2) + 60_000)
  await run(`run_t1_a1_${ts}`, trailId,  "amber", day(-2) + 120_000)
  await run(`run_t1_r1_${ts}`, trailId,  "red",   day(-1))
  await run(`run_t1_g3_${ts}`, trailId,  "green", day(0))
  await run(`run_t2_a1_${ts}`, trailId2, "amber", day(0) + 60_000)
  await run(`run_t1_ru_${ts}`, trailId,  "running", day(0) + 120_000)

  ;(globalThis as any)._tr = { projId, trailId, trailId2 }
})

const { walkTrends } = await import("./trails-dashboard")

// ── (A) Empty project returns no buckets ───────────────────────────────────
test("(A) KLA-78: empty project returns empty buckets", async () => {
  const buckets = await walkTrends("proj_nonexistent_abc123", {}, db)
  expect(buckets).toEqual([])
})

// ── (B) Multi-day walks return ordered buckets (oldest→newest) ─────────────
test("(B) KLA-78: buckets ordered oldest to newest", async () => {
  const { projId } = (globalThis as any)._tr
  const buckets = await walkTrends(projId, { bucketDays: 30 }, db)
  expect(buckets.length).toBeGreaterThanOrEqual(2)
  for (let i = 1; i < buckets.length; i++) {
    expect(buckets[i].day >= buckets[i - 1].day).toBe(true)
  }
})

// ── (C) Pass rate correct per bucket ─────────────────────────────────────
test("(C) KLA-78: pass rate = green/total; 0 when no green", async () => {
  const { projId } = (globalThis as any)._tr
  const buckets = await walkTrends(projId, { bucketDays: 30 }, db)

  // Day -2 bucket: 2G 1A → passRate = 2/3
  const now = Date.now()
  const day2 = bucketDay(now - 2 * DAY_MS)
  const b2 = buckets.find((b) => b.day === day2)
  expect(b2).toBeDefined()
  expect(b2!.green).toBe(2)
  expect(b2!.amber).toBe(1)
  expect(b2!.red).toBe(0)
  expect(b2!.total).toBe(3)
  expect(b2!.passRate).toBeCloseTo(2 / 3)

  // Day -1 bucket: 1R only → passRate = 0
  const day1 = bucketDay(now - 1 * DAY_MS)
  const b1 = buckets.find((b) => b.day === day1)
  expect(b1).toBeDefined()
  expect(b1!.red).toBe(1)
  expect(b1!.green).toBe(0)
  expect(b1!.passRate).toBe(0)
})

// ── (D) Running walks excluded ─────────────────────────────────────────────
test("(D) KLA-78: running walks are excluded from trend buckets", async () => {
  const { projId } = (globalThis as any)._tr
  const buckets = await walkTrends(projId, { bucketDays: 30 }, db)
  const todayDay = bucketDay(Date.now())
  const todayBucket = buckets.find((b) => b.day === todayDay)
  // Today has 1 green + 1 amber + 1 running; running is excluded → total must be 2, not 3
  expect(todayBucket).toBeDefined()
  expect(todayBucket!.total).toBe(2)
})

// ── (E) bucketDays window excludes old walks ──────────────────────────────
test("(E) KLA-78: bucketDays=1 excludes walks older than 24h", async () => {
  const { projId } = (globalThis as any)._tr
  // Day -2 walks were seeded 2 days ago, so they are outside the 1-day window.
  const buckets = await walkTrends(projId, { bucketDays: 1 }, db)
  const day2 = bucketDay(Date.now() - 2 * DAY_MS)
  const foundDay2 = buckets.some((b) => b.day === day2)
  expect(foundDay2).toBe(false)
  // The 1-day window must see fewer total walks than the 30-day window.
  const allBuckets = await walkTrends(projId, { bucketDays: 30 }, db)
  const totalNarrow = buckets.reduce((s, b) => s + b.total, 0)
  const totalWide = allBuckets.reduce((s, b) => s + b.total, 0)
  expect(totalNarrow).toBeLessThan(totalWide)
})

// ── (F) trailId scopes to one trail ───────────────────────────────────────
test("(F) KLA-78: trailId scopes buckets to that trail only", async () => {
  const { projId, trailId2 } = (globalThis as any)._tr
  const buckets = await walkTrends(projId, { trailId: trailId2, bucketDays: 30 }, db)
  // Only trail2 walks: 1 amber on today
  const total = buckets.reduce((s, b) => s + b.total, 0)
  expect(total).toBe(1)
  expect(buckets[buckets.length - 1].amber).toBe(1)
})
