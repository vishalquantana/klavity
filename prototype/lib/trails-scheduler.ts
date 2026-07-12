// KLA-88 — per-Trail cron scheduling. Runs every minute, fires any active Trail whose
// schedule_cron matches the current UTC minute. Guards against double-fire within the
// same minute window using scheduled_last_run_at.
//
// Cron format: standard 5-field UTC ("min hour dom month dow").
// Supported: *, numbers, comma-lists, ranges (a-b), step values (*/n, a-b/n).

import { listAllScheduledTrails, touchScheduledLastRunAt, recordSkippedScheduledRun } from "./trails"
import { runWalkNow } from "./trails-trigger"
import { WalkBusyError } from "./trails-browser"

// ── Cron parser ───────────────────────────────────────────────────────────────

function matchField(field: string, value: number): boolean {
  for (const part of field.split(",")) {
    const slashIdx = part.indexOf("/")
    const rangeStr = slashIdx >= 0 ? part.slice(0, slashIdx) : part
    const step = slashIdx >= 0 ? parseInt(part.slice(slashIdx + 1), 10) : 1
    if (!Number.isFinite(step) || step < 1) continue
    if (rangeStr === "*") {
      if ((value % step) === 0) return true
      // For * with step, match from 0
      continue
    }
    const dashIdx = rangeStr.indexOf("-")
    const lo = dashIdx >= 0 ? parseInt(rangeStr.slice(0, dashIdx), 10) : parseInt(rangeStr, 10)
    const hi = dashIdx >= 0 ? parseInt(rangeStr.slice(dashIdx + 1), 10) : lo
    if (Number.isFinite(lo) && Number.isFinite(hi) && value >= lo && value <= hi && (value - lo) % step === 0) return true
  }
  return false
}

/** Returns true when `expr` fires at the given UTC date (second-precision ignored). */
export function cronMatches(expr: string, date: Date): boolean {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return false
  const [minF, hourF, domF, monF, dowF] = parts
  const min = date.getUTCMinutes()
  const hour = date.getUTCHours()
  const dom = date.getUTCDate()
  const mon = date.getUTCMonth() + 1
  const dow = date.getUTCDay() // 0=Sunday
  // DOW: 0 and 7 both represent Sunday
  const dowNorm = dow === 0 ? 0 : dow
  const dowMatch = matchField(dowF, dowNorm) || (dowF !== "*" && dow === 0 && matchField(dowF, 7))
  return matchField(minF, min)
    && matchField(hourF, hour)
    && matchField(domF, dom)
    && matchField(monF, mon)
    && dowMatch
}

// ── Timezone-aware next-fire (DST-safe) ─────────────────────────────────────────
//
// The stored cron is UTC and cronMatches() runs on the UTC minute, so a walk stored as a
// fixed UTC time drifts by an hour across DST transitions of the account's local zone. To
// answer "when is the NEXT scheduled occurrence?" without that drift we walk forward minute
// by minute using calendar-aware conversion (Intl.DateTimeFormat) instead of fixed-offset
// arithmetic — the wall-clock "09:00 daily" therefore lands on the same UTC instant before AND
// after spring-forward / fall-back, because we re-derive the offset for each candidate day.

/** Break a UTC epoch into its wall-clock parts for `tz` (calendar-aware; no fixed offset). */
export function wallClockInZone(ms: number, tz: string): { year: number; month: number; day: number; hour: number; minute: number; weekday: number } {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", weekday: "short",
  })
  const parts: Record<string, string> = {}
  for (const p of dtf.formatToParts(new Date(ms))) if (p.type !== "literal") parts[p.type] = p.value
  const wdMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  let hour = parseInt(parts.hour, 10)
  if (hour === 24) hour = 0 // some engines emit "24" for midnight
  return {
    year: parseInt(parts.year, 10), month: parseInt(parts.month, 10), day: parseInt(parts.day, 10),
    hour, minute: parseInt(parts.minute, 10), weekday: wdMap[parts.weekday] ?? 0,
  }
}

/** Does `expr` fire at the given wall-clock (in the schedule's tz)? Mirrors cronMatches field logic. */
function cronMatchesWall(expr: string, w: { minute: number; hour: number; day: number; month: number; weekday: number }): boolean {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return false
  const [minF, hourF, domF, monF, dowF] = parts
  const dowMatch = matchField(dowF, w.weekday) || (dowF !== "*" && w.weekday === 0 && matchField(dowF, 7))
  return matchField(minF, w.minute) && matchField(hourF, w.hour) && matchField(domF, w.day) && matchField(monF, w.month) && dowMatch
}

/**
 * The next UTC epoch (ms, minute-aligned, strictly after `afterMs`) at which `expr` fires when its
 * fields are interpreted in `tz`. Scans up to `maxMinutes` ahead (default 366 days) — returns null
 * if nothing matches. Calendar-aware, so a wall-clock schedule stays put across DST transitions.
 */
export function nextCronFireUtc(expr: string, afterMs: number, tz = "UTC", maxMinutes = 366 * 24 * 60): number | null {
  if (!isValidCron(expr)) return null
  // Start at the next whole minute strictly after afterMs.
  let ms = (Math.floor(afterMs / 60_000) + 1) * 60_000
  for (let i = 0; i < maxMinutes; i++, ms += 60_000) {
    const w = wallClockInZone(ms, tz)
    if (cronMatchesWall(expr, w)) return ms
  }
  return null
}

/** Basic syntax check — 5 whitespace-separated fields, each field valid. */
export function isValidCron(expr: string): boolean {
  if (!expr || typeof expr !== "string") return false
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return false
  try {
    for (const part of parts) {
      for (const seg of part.split(",")) {
        const slash = seg.indexOf("/")
        const range = slash >= 0 ? seg.slice(0, slash) : seg
        const step = slash >= 0 ? seg.slice(slash + 1) : null
        if (step !== null && (!/^\d+$/.test(step) || parseInt(step, 10) < 1)) return false
        if (range !== "*") {
          const dash = range.indexOf("-")
          if (dash >= 0) {
            const lo = range.slice(0, dash); const hi = range.slice(dash + 1)
            if (!/^\d+$/.test(lo) || !/^\d+$/.test(hi)) return false
          } else {
            if (!/^\d+$/.test(range)) return false
          }
        }
      }
    }
    return true
  } catch { return false }
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

const TICK_MS = 60_000

/**
 * A scheduled occurrence that couldn't fire because the walk slot was busy. Instead of immediately
 * recording it "skipped", we hold it here and retry on subsequent ticks with backoff until the slot
 * frees OR the deadline (the trail's NEXT scheduled occurrence) passes — only then do we record it
 * skipped, with the retry history preserved. This turns silent skips into "ran late" wherever the
 * slot frees within the window, so "guarded daily" stays honest.
 */
interface QueuedRun {
  projectId: string
  trailId: string
  schedule: string
  /** minute boundary of the ORIGINAL scheduled fire — the run is attributed to this occurrence */
  scheduledMinuteTs: number
  /** stop retrying (and record skipped) once now >= deadline; = next scheduled occurrence */
  deadlineMs: number
  attempts: number
  /** earliest ms at which the next retry is allowed (backoff) */
  nextRetryAtMs: number
}

// Keyed by projectId::trailId — one pending retry per trail (a newer occurrence replaces an older).
const _retryQueue = new Map<string, QueuedRun>()

/** Backoff schedule for slot-busy retries (ms). Caps at the last value. */
const RETRY_BACKOFF_MS = [30_000, 60_000, 120_000, 300_000]
function backoffFor(attempts: number): number {
  return RETRY_BACKOFF_MS[Math.min(attempts, RETRY_BACKOFF_MS.length - 1)]
}

/** Test hook: clear the in-memory retry queue between cases. */
export function _resetSchedulerQueueForTest(): void { _retryQueue.clear() }
/** Test/introspection hook: how many occurrences are currently queued for retry. */
export function _pendingRetryCount(): number { return _retryQueue.size }

/**
 * Compute the deadline for a queued occurrence: the trail's next scheduled fire strictly after the
 * one that just got queued. When we can't resolve one (e.g. `* * * * *`), fall back to a bounded
 * window so a queued run can never linger forever.
 */
function deadlineForOccurrence(schedule: string, scheduledMinuteTs: number, tz: string): number {
  const next = nextCronFireUtc(schedule, scheduledMinuteTs, tz)
  const MAX_WINDOW_MS = 60 * 60_000 // hard cap: never retry a single occurrence for more than an hour
  if (next == null) return scheduledMinuteTs + MAX_WINDOW_MS
  return Math.min(next, scheduledMinuteTs + MAX_WINDOW_MS)
}

/** Attempt to launch a scheduled walk. Returns "ran" | "busy" | "error". */
async function tryLaunchScheduled(projectId: string, trailId: string, schedule: string): Promise<"ran" | "busy" | "error"> {
  try {
    await runWalkNow(projectId, trailId, { trigger: "scheduled" })
    console.log(`[scheduler] fired walk for trail ${trailId} (${schedule})`)
    return "ran"
  } catch (e: any) {
    if (e instanceof WalkBusyError) return "busy"
    console.warn(`[scheduler] trail ${trailId} launch error:`, String(e?.message || e))
    return "error"
  }
}

/** Drain the retry queue: reattempt each held occurrence, or record it skipped once its window closes. */
async function drainRetryQueue(nowMs: number): Promise<void> {
  for (const [key, q] of [..._retryQueue]) {
    // Window closed without a free slot → record the genuinely-missed run, reason + retries preserved.
    if (nowMs >= q.deadlineMs) {
      _retryQueue.delete(key)
      await recordSkippedScheduledRun(q.projectId, q.trailId, "skipped", {
        reason: "slot busy for the entire retry window",
        retryAttempts: q.attempts,
        scheduledFor: q.scheduledMinuteTs,
        windowClosedAt: q.deadlineMs,
      }).catch(() => {})
      console.log(`[scheduler] trail ${q.trailId} window closed after ${q.attempts} retries — recorded skipped`)
      continue
    }
    if (nowMs < q.nextRetryAtMs) continue // still backing off
    q.attempts++
    const outcome = await tryLaunchScheduled(q.projectId, q.trailId, q.schedule)
    if (outcome === "ran") {
      _retryQueue.delete(key)
      console.log(`[scheduler] trail ${q.trailId} ran on retry #${q.attempts} (queued at ${q.scheduledMinuteTs})`)
    } else if (outcome === "busy") {
      q.nextRetryAtMs = nowMs + backoffFor(q.attempts)
    } else {
      // Hard launch error → not a slot contention issue; record missed and stop retrying.
      _retryQueue.delete(key)
      await recordSkippedScheduledRun(q.projectId, q.trailId, "missed", {
        reason: "launch error on retry",
        retryAttempts: q.attempts,
        scheduledFor: q.scheduledMinuteTs,
      }).catch(() => {})
    }
  }
}

export async function tickScheduler(now = new Date()): Promise<void> {
  const nowMs = now.getTime()
  // Round down to the current minute boundary for dedup guard.
  const minuteTs = Math.floor(nowMs / 60_000) * 60_000

  // 1. First, service any occurrences we queued on earlier ticks (retry or expire).
  await drainRetryQueue(nowMs)

  let trails
  try { trails = await listAllScheduledTrails() } catch (e) {
    console.warn("[scheduler] listAllScheduledTrails failed:", String((e as any)?.message || e))
    return
  }
  for (const trail of trails) {
    if (!trail.schedule || !cronMatches(trail.schedule, now)) continue
    // Already fired this minute for this trail
    if (trail.scheduledLastRunAt != null && trail.scheduledLastRunAt >= minuteTs) continue
    // Stamp before launching so a concurrent tick (or a fast walk) can't double-fire.
    await touchScheduledLastRunAt(trail.projectId, trail.id, minuteTs).catch(() => {})
    const outcome = await tryLaunchScheduled(trail.projectId, trail.id, trail.schedule)
    if (outcome === "busy") {
      // Don't skip-and-forget: queue this occurrence for retry until its window closes.
      // The stored cron is already UTC, so occurrence math runs in UTC (no DST drift for the
      // stored expression); the calendar-aware nextCronFireUtc keeps deadlines exact.
      const key = `${trail.projectId}::${trail.id}`
      _retryQueue.set(key, {
        projectId: trail.projectId, trailId: trail.id, schedule: trail.schedule,
        scheduledMinuteTs: minuteTs,
        deadlineMs: deadlineForOccurrence(trail.schedule, minuteTs, "UTC"),
        attempts: 0,
        nextRetryAtMs: nowMs + backoffFor(0),
      })
      console.log(`[scheduler] trail ${trail.id} slot busy — queued for retry`)
    } else if (outcome === "error") {
      await recordSkippedScheduledRun(trail.projectId, trail.id, "missed", { reason: "launch error" }).catch(() => {})
    }
  }
}

export function startTrailScheduler(): ReturnType<typeof setInterval> {
  return setInterval(() => {
    tickScheduler().catch((e) => console.warn("[scheduler] tick crashed:", String((e as any)?.message || e)))
  }, TICK_MS)
}

/**
 * DST-safe next-fire for a WALL-CLOCK local schedule. Given a target hour:minute in `tz` (optionally
 * constrained to a set of weekdays 0=Sun), return the next UTC epoch (ms) strictly after `afterMs`
 * whose local wall-clock in `tz` matches. Because we re-derive the tz offset for every candidate day
 * via Intl (calendar-aware), "09:00 America/New_York daily" lands on the correct UTC instant on BOTH
 * sides of spring-forward and fall-back — the drifting `new Date().setHours` arithmetic (which bakes
 * in *today's* offset once) does not. `weekdays` empty = every day.
 */
export function nextLocalFireUtc(
  hour: number, minute: number, tz: string, afterMs: number, weekdays: number[] = [], maxMinutes = 366 * 24 * 60,
): number | null {
  const dowSet = weekdays.length ? new Set(weekdays) : null
  let ms = (Math.floor(afterMs / 60_000) + 1) * 60_000
  for (let i = 0; i < maxMinutes; i++, ms += 60_000) {
    const w = wallClockInZone(ms, tz)
    if (w.hour === hour && w.minute === minute && (!dowSet || dowSet.has(w.weekday))) return ms
  }
  return null
}

export function localToUtcCron(frequency: string, hour: number, minute: number, localDows: number[]): string {
  if (frequency === "hourly") return "0 * * * *"
  
  if (frequency === "daily") {
    const d = new Date()
    d.setHours(hour, minute, 0, 0)
    return `${d.getUTCMinutes()} ${d.getUTCHours()} * * *`
  }
  
  if (frequency === "weekly") {
    const utcDows: number[] = []
    let utcHour = 0
    let utcMin = 0
    
    localDows.forEach(dow => {
      const d = new Date()
      d.setHours(hour, minute, 0, 0)
      const currentDow = d.getDay()
      d.setDate(d.getDate() + (dow - currentDow))
      
      utcDows.push(d.getUTCDay())
      utcHour = d.getUTCHours()
      utcMin = d.getUTCMinutes()
    })
    
    const uniqueUtcDows = [...new Set(utcDows)].sort((a, b) => a - b)
    return `${utcMin} ${utcHour} * * ${uniqueUtcDows.join(",")}`
  }
  return ""
}

export function utcCronToLocal(cron: string): { frequency: string; hour: number; minute: number; weekdays: number[] } {
  const parts = (cron || "").trim().split(/\s+/)
  if (parts.length !== 5) {
    return { frequency: "daily", hour: 9, minute: 0, weekdays: [] }
  }
  const [minStr, hourStr, domStr, monStr, dowStr] = parts
  if (hourStr === "*") {
    return { frequency: "hourly", hour: 9, minute: 0, weekdays: [] }
  }
  
  const min = parseInt(minStr, 10) || 0
  const hour = parseInt(hourStr, 10) || 0
  
  if (dowStr === "*") {
    const d = new Date(Date.UTC(2026, 6, 5, hour, min))
    return { frequency: "daily", hour: d.getHours(), minute: d.getMinutes(), weekdays: [] }
  }
  
  // Weekly
  const utcDows = dowStr.split(",").map(x => parseInt(x, 10))
  const localDows: number[] = []
  let localHour = 9
  let localMin = 0
  utcDows.forEach(dow => {
    // Reference Sunday is July 5, 2026
    const d = new Date(Date.UTC(2026, 6, 5 + dow, hour, min))
    localDows.push(d.getDay())
    localHour = d.getHours()
    localMin = d.getMinutes()
  })
  
  const uniqueLocalDows = [...new Set(localDows)].sort((a, b) => a - b)
  return { frequency: "weekly", hour: localHour, minute: localMin, weekdays: uniqueLocalDows }
}
