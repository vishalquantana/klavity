// KLA-88 — tests for cron matching + scheduler tick behaviour.
import { test, expect, beforeAll, beforeEach } from "bun:test"
import { cronMatches, isValidCron } from "./trails-scheduler"
import { tmpdir } from "node:os"; import { join } from "node:path"

// ── cronMatches ───────────────────────────────────────────────────────────────

function utc(year: number, month: number, day: number, hour: number, min: number): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, min, 0, 0))
}

test("cronMatches: * * * * * matches any time", () => {
  expect(cronMatches("* * * * *", utc(2026, 1, 5, 0, 0))).toBe(true)
  expect(cronMatches("* * * * *", utc(2026, 12, 31, 23, 59))).toBe(true)
})

test("cronMatches: 0 2 * * * matches 02:00 UTC only", () => {
  expect(cronMatches("0 2 * * *", utc(2026, 7, 7, 2, 0))).toBe(true)
  expect(cronMatches("0 2 * * *", utc(2026, 7, 7, 2, 1))).toBe(false)
  expect(cronMatches("0 2 * * *", utc(2026, 7, 7, 3, 0))).toBe(false)
})

test("cronMatches: */15 * * * * matches every 15 min from :00", () => {
  expect(cronMatches("*/15 * * * *", utc(2026, 7, 7, 10, 0))).toBe(true)
  expect(cronMatches("*/15 * * * *", utc(2026, 7, 7, 10, 15))).toBe(true)
  expect(cronMatches("*/15 * * * *", utc(2026, 7, 7, 10, 30))).toBe(true)
  expect(cronMatches("*/15 * * * *", utc(2026, 7, 7, 10, 45))).toBe(true)
  expect(cronMatches("*/15 * * * *", utc(2026, 7, 7, 10, 7))).toBe(false)
})

test("cronMatches: comma list", () => {
  expect(cronMatches("0,30 * * * *", utc(2026, 7, 7, 10, 0))).toBe(true)
  expect(cronMatches("0,30 * * * *", utc(2026, 7, 7, 10, 30))).toBe(true)
  expect(cronMatches("0,30 * * * *", utc(2026, 7, 7, 10, 15))).toBe(false)
})

test("cronMatches: range a-b", () => {
  expect(cronMatches("* 8-17 * * *", utc(2026, 7, 7, 8, 0))).toBe(true)
  expect(cronMatches("* 8-17 * * *", utc(2026, 7, 7, 17, 0))).toBe(true)
  expect(cronMatches("* 8-17 * * *", utc(2026, 7, 7, 7, 0))).toBe(false)
  expect(cronMatches("* 8-17 * * *", utc(2026, 7, 7, 18, 0))).toBe(false)
})

test("cronMatches: day of month", () => {
  expect(cronMatches("0 9 1 * *", utc(2026, 7, 1, 9, 0))).toBe(true)
  expect(cronMatches("0 9 1 * *", utc(2026, 7, 2, 9, 0))).toBe(false)
})

test("cronMatches: month filter", () => {
  expect(cronMatches("0 0 1 1 *", utc(2026, 1, 1, 0, 0))).toBe(true)
  expect(cronMatches("0 0 1 1 *", utc(2026, 2, 1, 0, 0))).toBe(false)
})

test("cronMatches: day-of-week (0=Sun)", () => {
  // 2026-07-07 is a Tuesday (dow=2)
  expect(cronMatches("0 0 * * 2", utc(2026, 7, 7, 0, 0))).toBe(true)
  expect(cronMatches("0 0 * * 1", utc(2026, 7, 7, 0, 0))).toBe(false)
})

test("cronMatches: rejects wrong field count", () => {
  expect(cronMatches("* * * *", utc(2026, 7, 7, 0, 0))).toBe(false)
  expect(cronMatches("* * * * * *", utc(2026, 7, 7, 0, 0))).toBe(false)
})

// ── isValidCron ───────────────────────────────────────────────────────────────

test("isValidCron: accepts common expressions", () => {
  expect(isValidCron("0 2 * * *")).toBe(true)
  expect(isValidCron("*/15 * * * *")).toBe(true)
  expect(isValidCron("0,30 * * * *")).toBe(true)
  expect(isValidCron("0 8-17 * * 1-5")).toBe(true)
  expect(isValidCron("* * * * *")).toBe(true)
})

test("isValidCron: rejects bad input", () => {
  expect(isValidCron("")).toBe(false)
  expect(isValidCron("not a cron")).toBe(false)
  expect(isValidCron("* * * *")).toBe(false)   // only 4 fields
  expect(isValidCron("* * * * * *")).toBe(false) // 6 fields
  expect(isValidCron("nightly")).toBe(false)
  expect(isValidCron("*/0 * * * *")).toBe(false) // step=0 invalid
})

// ── Scheduler tick ───────────────────────────────────────────────────────────

const file = join(tmpdir(), `klav-sched-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const T = await import("./trails")
const { tickScheduler } = await import("./trails-scheduler")
const { _resetWalkPoolForTest } = await import("./trails-browser")

beforeEach(() => { _resetWalkPoolForTest(1, 0) })

async function seedScheduledTrail(schedule: string, lastRunAt: number | null = null) {
  const id = await T.createTrail("proj_s", { name: "Sched", baseUrl: "https://app.test/", authorKind: "llm" })
  await T.updateTrail("proj_s", id, { status: "active", schedule })
  if (lastRunAt != null) await T.touchScheduledLastRunAt("proj_s", id, lastRunAt)
  return id
}

const waitFor = async (pred: () => Promise<boolean>) => {
  for (let i = 0; i < 100; i++) { if (await pred()) return; await new Promise((r) => setTimeout(r, 20)) }
  throw new Error("timeout")
}

test("tickScheduler fires a walk for a due trail", async () => {
  // Build a date matching "* * * * *"
  const now = new Date()
  let released = false
  const id = await seedScheduledTrail("* * * * *")

  const { runWalkNow: origRunWalkNow } = await import("./trails-trigger")
  let fireCount = 0
  const { tickScheduler: tick } = await import("./trails-scheduler")

  // We don't stub runWalkNow here — let it use a lightweight stub via the slot.
  // Instead, verify scheduledLastRunAt is stamped after tick.
  const minuteTs = Math.floor(now.getTime() / 60_000) * 60_000

  // Trail not yet stamped → should fire (we'll see scheduled_last_run_at set)
  await tick(now)
  const trail = await T.getTrail("proj_s", id)
  expect(trail?.scheduledLastRunAt).toBe(minuteTs)
})

test("tickScheduler skips a trail already fired this minute", async () => {
  const now = new Date()
  const minuteTs = Math.floor(now.getTime() / 60_000) * 60_000
  const id = await seedScheduledTrail("* * * * *", minuteTs)

  // tick should not change scheduledLastRunAt (it was already this minute)
  const before = (await T.getTrail("proj_s", id))?.scheduledLastRunAt
  await tickScheduler(now)
  const after = (await T.getTrail("proj_s", id))?.scheduledLastRunAt
  expect(after).toBe(before)
})

test("tickScheduler skips a non-matching schedule", async () => {
  const now = new Date()
  // Use a minute that will never match (e.g. minute 62 — impossible)
  const id = await seedScheduledTrail("62 * * * *")
  const before = (await T.getTrail("proj_s", id))?.scheduledLastRunAt
  await tickScheduler(now)
  const after = (await T.getTrail("proj_s", id))?.scheduledLastRunAt
  expect(after).toBe(before)
})

test("updateTrail accepts schedule and sets/clears it", async () => {
  const id = await T.createTrail("proj_s", { name: "Patch", baseUrl: "https://x.test/", authorKind: "human" })
  await T.updateTrail("proj_s", id, { schedule: "0 3 * * *" })
  expect((await T.getTrail("proj_s", id))?.schedule).toBe("0 3 * * *")
  await T.updateTrail("proj_s", id, { schedule: null })
  expect((await T.getTrail("proj_s", id))?.schedule).toBeNull()
})

test("listAllScheduledTrails only returns active trails with a schedule", async () => {
  const id = await T.createTrail("proj_s", { name: "ActiveSched", baseUrl: "https://x.test/", authorKind: "human" })
  await T.updateTrail("proj_s", id, { status: "active", schedule: "0 6 * * *" })
  const pausedId = await T.createTrail("proj_s", { name: "PausedSched", baseUrl: "https://x.test/", authorKind: "human" })
  await T.updateTrail("proj_s", pausedId, { status: "paused", schedule: "0 6 * * *" })
  const list = await T.listAllScheduledTrails()
  const ids = list.map((t) => t.id)
  expect(ids).toContain(id)
  expect(ids).not.toContain(pausedId)
})

test("localToUtcCron / utcCronToLocal roundtrip and timezone offsets", () => {
  const { localToUtcCron: toCron, utcCronToLocal: toLocal } = require("./trails-scheduler")
  
  // 1. Hourly
  expect(toCron("hourly", 9, 0, [])).toBe("0 * * * *")
  expect(toLocal("0 * * * *").frequency).toBe("hourly")
  
  // 2. Daily
  const cronDaily = toCron("daily", 9, 0, [])
  const localDaily = toLocal(cronDaily)
  expect(localDaily.frequency).toBe("daily")
  expect(localDaily.hour).toBe(9)
  expect(localDaily.minute).toBe(0)
  
  // 3. Weekly
  const cronWeekly = toCron("weekly", 14, 30, [1, 3, 5])
  const localWeekly = toLocal(cronWeekly)
  expect(localWeekly.frequency).toBe("weekly")
  expect(localWeekly.hour).toBe(14)
  expect(localWeekly.minute).toBe(30)
  expect(localWeekly.weekdays).toEqual([1, 3, 5])
})

test("tickScheduler handles WalkBusyError and records a skipped run", async () => {
  const { _resetWalkPoolForTest } = await import("./trails-browser")
  // Hold the slot by setting active pool size to 0
  _resetWalkPoolForTest(0, 0)
  
  const now = new Date()
  const id = await seedScheduledTrail("* * * * *")
  
  await tickScheduler(now)
  
  const walks = await T.listRecentWalks("proj_s", 10)
  const schedWalks = walks.filter(w => w.trailId === id && w.trigger === "scheduled")
  expect(schedWalks.length).toBe(1)
  expect(schedWalks[0].status).toBe("skipped")
})
