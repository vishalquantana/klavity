// KLA-88 — tests for cron matching + scheduler tick behaviour.
import { test, expect, beforeAll, beforeEach } from "bun:test"
import { cronMatches, cronMatchesTz, zonedParts, isValidCron } from "./trails-scheduler"
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

// ── KLA-277 (JTBD 4.13): DST-safe timezone-aware matching ─────────────────────────────────────────
//
// America/New_York observes EST (UTC-5) in winter and EDT (UTC-4) in summer. A "9am local" guard
// must keep firing at 9am local across the DST boundary — its UTC minute simply shifts. The old
// baked-UTC cron (frozen at save time) would drift by an hour after the transition.

test("zonedParts breaks a UTC instant into the target zone's calendar fields", () => {
  // 2026-01-15 14:00 UTC = 09:00 EST (winter); 2026-07-15 13:00 UTC = 09:00 EDT (summer)
  expect(zonedParts(utc(2026, 1, 15, 14, 0), "America/New_York")).toMatchObject({ hour: 9, min: 0, dom: 15, mon: 1 })
  expect(zonedParts(utc(2026, 7, 15, 13, 0), "America/New_York")).toMatchObject({ hour: 9, min: 0, dom: 15, mon: 7 })
})

test("cronMatchesTz: a 9am-local guard fires at 9am local in BOTH DST regimes", () => {
  const cron = "0 9 * * *"
  const tz = "America/New_York"
  // Winter (EST, UTC-5): 9am local == 14:00 UTC
  expect(cronMatchesTz(cron, utc(2026, 1, 15, 14, 0), tz)).toBe(true)
  expect(cronMatchesTz(cron, utc(2026, 1, 15, 13, 0), tz)).toBe(false) // 8am local
  // Summer (EDT, UTC-4): 9am local == 13:00 UTC — the fire instant shifts by an hour…
  expect(cronMatchesTz(cron, utc(2026, 7, 15, 13, 0), tz)).toBe(true)
  // …and the winter UTC minute (14:00) is now 10am local, so it must NOT fire.
  expect(cronMatchesTz(cron, utc(2026, 7, 15, 14, 0), tz)).toBe(false)
})

test("cronMatchesTz: the OLD baked-UTC cron would DRIFT after DST (regression guard)", () => {
  // Saving "9am ET" in winter as a baked-UTC cron yields "0 14 * * *". In summer that fires at
  // 10am ET, not 9am — the exact bug JTBD 4.13 fixes. The tz-aware path avoids it.
  const summer9amEt = utc(2026, 7, 15, 13, 0) // 09:00 EDT
  expect(cronMatches("0 14 * * *", summer9amEt)).toBe(false)          // baked cron misses 9am ET
  expect(cronMatchesTz("0 9 * * *", summer9amEt, "America/New_York")).toBe(true) // tz-aware hits it
})

test("cronMatchesTz: weekday matching respects the target zone's local day", () => {
  // 2026-07-13 03:00 UTC is still Sunday 23:00 in New York (EDT). A "Sunday 23:00 ET" guard fires.
  expect(cronMatchesTz("0 23 * * 0", utc(2026, 7, 13, 3, 0), "America/New_York")).toBe(true)
  // The same instant is Monday in UTC, so the plain UTC matcher would treat it as Monday.
  expect(cronMatches("0 3 * * 1", utc(2026, 7, 13, 3, 0))).toBe(true)
})

test("cronMatchesTz: falsy tz and unknown tz fall back to UTC cronMatches", () => {
  const d = utc(2026, 7, 15, 14, 0)
  expect(cronMatchesTz("0 14 * * *", d, null)).toBe(cronMatches("0 14 * * *", d))
  expect(cronMatchesTz("0 14 * * *", d, "")).toBe(cronMatches("0 14 * * *", d))
  expect(cronMatchesTz("0 14 * * *", d, "Not/AZone")).toBe(cronMatches("0 14 * * *", d))
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

// KLA-277: end-to-end proof through tickScheduler that a tz-scheduled trail fires at the correct
// UTC instant in each DST regime (and NOT at the stale baked-UTC instant).
async function seedTzTrail(schedule: string, scheduleTz: string) {
  const id = await T.createTrail("proj_s", { name: "TzSched", baseUrl: "https://app.test/", authorKind: "llm" })
  await T.updateTrail("proj_s", id, { status: "active", schedule, scheduleTz })
  return id
}

test("tickScheduler: a 9am-ET trail fires at the DST-correct UTC instant summer AND winter", async () => {
  _resetWalkPoolForTest(1, 0)
  const id = await seedTzTrail("0 9 * * *", "America/New_York")

  // Winter: 9am EST == 14:00 UTC → fires (scheduled_last_run_at gets stamped for that minute).
  const winter = new Date(Date.UTC(2026, 0, 15, 14, 0))
  await tickScheduler(winter)
  const winterMinute = Math.floor(winter.getTime() / 60_000) * 60_000
  expect((await T.getTrail("proj_s", id))?.scheduledLastRunAt).toBe(winterMinute)

  // The stale baked-UTC hour (14:00) in SUMMER must NOT fire (that would be 10am ET — the bug).
  const summerBaked = new Date(Date.UTC(2026, 6, 15, 14, 0))
  const before = (await T.getTrail("proj_s", id))?.scheduledLastRunAt
  await tickScheduler(summerBaked)
  expect((await T.getTrail("proj_s", id))?.scheduledLastRunAt).toBe(before) // unchanged → did not fire

  // Summer: 9am EDT == 13:00 UTC → fires.
  const summer = new Date(Date.UTC(2026, 6, 15, 13, 0))
  await tickScheduler(summer)
  const summerMinute = Math.floor(summer.getTime() / 60_000) * 60_000
  expect((await T.getTrail("proj_s", id))?.scheduledLastRunAt).toBe(summerMinute)
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
