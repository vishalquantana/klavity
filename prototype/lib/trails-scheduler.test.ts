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
const { tickScheduler, _resetSchedulerQueueForTest, _pendingRetryCount, nextCronFireUtc, nextLocalFireUtc, wallClockInZone } = await import("./trails-scheduler")
const { _resetWalkPoolForTest } = await import("./trails-browser")

beforeEach(() => { _resetWalkPoolForTest(1, 0); _resetSchedulerQueueForTest() })

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

test("tickScheduler on a busy slot QUEUES the occurrence instead of skipping immediately", async () => {
  // Hold the slot by setting active pool size to 0 → every launch throws WalkBusyError.
  _resetWalkPoolForTest(0, 0)

  const now = new Date()
  const id = await seedScheduledTrail("* * * * *")

  await tickScheduler(now)

  // No skipped/missed row is written yet — the occurrence is held for retry.
  const walks = await T.listRecentWalks("proj_s", 10)
  const schedWalks = walks.filter(w => w.trailId === id && w.trigger === "scheduled")
  expect(schedWalks.length).toBe(0)
  expect(_pendingRetryCount()).toBe(1)
})

test("a queued walk RUNS later automatically once the slot frees (retry-or-queue)", async () => {
  // Busy slot: the occurrence must queue, not skip.
  _resetWalkPoolForTest(0, 0)
  const id = await seedScheduledTrail("* * * * *")

  // Pin `now` to a minute boundary so `later` (+40s) stays inside the SAME minute — that way the
  // main-loop dedup guard (scheduledLastRunAt >= minuteTs) prevents a fresh fire and we're testing
  // purely the RETRY path, not a new occurrence.
  const now = new Date(Date.UTC(2026, 6, 7, 10, 0, 0))
  await tickScheduler(now)

  // Nothing skipped yet — held for retry.
  let walks = await T.listRecentWalks("proj_s", 20)
  expect(walks.filter(w => w.trailId === id && w.status === "skipped").length).toBe(0)
  expect(_pendingRetryCount()).toBe(1)

  // Free the slot, advance past the first backoff (30s) but stay in the same minute, and tick again:
  // the queued occurrence must RUN (a real trail_runs row appears, non-skipped) — NOT recorded skipped.
  _resetWalkPoolForTest(1, 0)
  const later = new Date(now.getTime() + 40_000)
  await tickScheduler(later)

  walks = await T.listRecentWalks("proj_s", 20)
  const skipped = walks.filter(w => w.trailId === id && w.status === "skipped")
  const ran = walks.filter(w => w.trailId === id && w.trigger === "scheduled" && w.status !== "skipped" && w.status !== "missed")
  expect(skipped.length).toBe(0)              // nothing was silently skipped
  expect(ran.length).toBeGreaterThanOrEqual(1) // the queued occurrence ended up running
  expect(_pendingRetryCount()).toBe(0)
})

test("a genuinely un-runnable occurrence is recorded skipped once its window closes, with reason", async () => {
  // Slot permanently busy → occurrence queues, then the retry window closes → skipped w/ reason.
  _resetWalkPoolForTest(0, 0)
  const id = await seedScheduledTrail("0 3 * * *") // daily → next occurrence is ~24h out; we force expiry

  const now = new Date(Date.UTC(2026, 6, 7, 3, 0)) // matches "0 3 * * *"
  await tickScheduler(now)
  expect(_pendingRetryCount()).toBe(1)

  // Jump beyond the 1-hour hard window so the queued occurrence expires.
  const wayLater = new Date(now.getTime() + 2 * 60 * 60_000)
  await tickScheduler(wayLater)

  const walks = await T.listRecentWalks("proj_s", 10)
  const schedWalks = walks.filter(w => w.trailId === id && w.trigger === "scheduled")
  expect(schedWalks.length).toBe(1)
  expect(schedWalks[0].status).toBe("skipped")
  // Reason + retry outcome preserved in summary_json.
  const reason = (schedWalks[0].summary as any)?.reason
  expect(typeof reason).toBe("string")
  expect(reason).toContain("busy")
  expect(_pendingRetryCount()).toBe(0)
})

// ── DST stability ──────────────────────────────────────────────────────────────
// nextLocalFireUtc computes wall-clock fire times in a named zone. A "09:00 America/New_York daily"
// schedule must land on the SAME wall-clock (and correct UTC offset) on both sides of spring-forward
// and fall-back — that's the property the old new Date().setHours() arithmetic broke.

test("nextLocalFireUtc: 09:00 America/New_York is stable across SPRING-FORWARD (Mar 2026)", () => {
  const tz = "America/New_York"
  // 2026 US spring-forward: Sunday March 8, 2026 at 02:00 local → 03:00 (EST -05:00 → EDT -04:00).
  // Before DST (EST): 09:00 local = 14:00 UTC. After DST (EDT): 09:00 local = 13:00 UTC.
  const beforeDst = Date.UTC(2026, 2, 5, 0, 0)  // Mar 5 (Thu), still EST
  const afterDst = Date.UTC(2026, 2, 10, 0, 0)  // Mar 10 (Tue), now EDT

  const f1 = nextLocalFireUtc(9, 0, tz, beforeDst)!
  const f2 = nextLocalFireUtc(9, 0, tz, afterDst)!

  // Both must read 09:00 local — no hour drift.
  expect(wallClockInZone(f1, tz).hour).toBe(9)
  expect(wallClockInZone(f2, tz).hour).toBe(9)
  // And the UTC offset shifted (14:00 UTC before, 13:00 UTC after) — proving calendar-awareness.
  expect(new Date(f1).getUTCHours()).toBe(14)
  expect(new Date(f2).getUTCHours()).toBe(13)
})

test("nextLocalFireUtc: 09:00 America/New_York is stable across FALL-BACK (Nov 2026)", () => {
  const tz = "America/New_York"
  // 2026 US fall-back: Sunday November 1, 2026 at 02:00 local → 01:00 (EDT -04:00 → EST -05:00).
  const beforeFallback = Date.UTC(2026, 9, 29, 0, 0) // Oct 29, still EDT
  const afterFallback = Date.UTC(2026, 10, 3, 0, 0)  // Nov 3, now EST

  const f1 = nextLocalFireUtc(9, 0, tz, beforeFallback)!
  const f2 = nextLocalFireUtc(9, 0, tz, afterFallback)!

  expect(wallClockInZone(f1, tz).hour).toBe(9)
  expect(wallClockInZone(f2, tz).hour).toBe(9)
  expect(new Date(f1).getUTCHours()).toBe(13) // EDT: 09:00 = 13:00 UTC
  expect(new Date(f2).getUTCHours()).toBe(14) // EST: 09:00 = 14:00 UTC
})

test("nextCronFireUtc: returns the next minute-aligned UTC match after a timestamp", () => {
  const after = Date.UTC(2026, 6, 7, 1, 30)
  const next = nextCronFireUtc("0 3 * * *", after, "UTC")!
  expect(new Date(next).getUTCHours()).toBe(3)
  expect(new Date(next).getUTCMinutes()).toBe(0)
  // Strictly after `after`, same day.
  expect(next).toBeGreaterThan(after)
  expect(new Date(next).getUTCDate()).toBe(7)
})

test("nextLocalFireUtc: weekday-constrained schedule only fires on allowed days", () => {
  const tz = "UTC"
  // Weekdays only (Mon–Fri = 1..5). Start on a Saturday → next fire must be Monday.
  const sat = Date.UTC(2026, 6, 4, 0, 0) // 2026-07-04 is a Saturday
  const next = nextLocalFireUtc(9, 0, tz, sat, [1, 2, 3, 4, 5])!
  expect(wallClockInZone(next, tz).weekday).toBe(1) // Monday
})

// ── Coverage ───────────────────────────────────────────────────────────────────

test("computeScheduleCoverage reports N of M scheduled walks ran", async () => {
  // Fresh project so counts are isolated. 3 scheduled walks ran, 1 skipped, 1 missed → 3 of 5 = 60%.
  const trailId = await T.createTrail("proj_cov", { name: "CovTrail", baseUrl: "https://x.test/", authorKind: "llm" })
  await T.updateTrail("proj_cov", trailId, { status: "active", schedule: "* * * * *" })

  const { db } = await import("./db")
  const now = Date.now()
  // Insert 3 scheduled rows that ran (terminal green) directly for determinism.
  for (let i = 0; i < 3; i++) {
    await db!.execute({
      sql: `INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, summary_json, trail_version, environment_name, started_at, finished_at)
            VALUES (?, ?, ?, 'scheduled', 'green', 0, NULL, 1, NULL, ?, ?)`,
      args: ["walk_cov_ran_" + i, trailId, "proj_cov", now, now],
    })
  }
  await T.recordSkippedScheduledRun("proj_cov", trailId, "skipped", { reason: "slot busy" })
  await T.recordSkippedScheduledRun("proj_cov", trailId, "missed", { reason: "launch error" })

  const cov = await T.computeScheduleCoverage("proj_cov")
  expect(cov.scheduled).toBe(5)
  expect(cov.ran).toBe(3)
  expect(cov.skipped).toBe(1)
  expect(cov.missed).toBe(1)
  expect(cov.coverage).toBeCloseTo(0.6, 5)
})
