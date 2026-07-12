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

// ── KLA-277 (JTBD 4.13): DST-safe timezone-aware matching ──────────────────────
//
// When a Trail stores schedule_tz (an IANA zone e.g. "America/New_York"), schedule_cron is
// interpreted as LOCAL wall-clock time in that zone. We compute the calendar fields of the
// current UTC instant AS SEEN IN that zone via Intl.DateTimeFormat, then match the cron against
// them. Because the wall-clock hour is fixed and the UTC↔local mapping is recomputed on every
// tick, a "9am local" guard keeps firing at 9am local across a DST transition (the UTC minute it
// fires at simply shifts by an hour) — no conversion is baked at save time.

/** Break a UTC instant into calendar fields as observed in `tz`. dow: 0=Sunday. */
export function zonedParts(
  date: Date,
  tz: string,
): { min: number; hour: number; dom: number; mon: number; dow: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
  const map: Record<string, string> = {}
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value
  let hour = parseInt(map.hour, 10)
  if (hour === 24) hour = 0 // some engines render midnight as "24" with hour12:false
  const dowMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return {
    min: parseInt(map.minute, 10),
    hour,
    dom: parseInt(map.day, 10),
    mon: parseInt(map.month, 10),
    dow: dowMap[map.weekday] ?? new Date(date).getUTCDay(),
  }
}

/**
 * Returns true when `expr` (interpreted as local wall-clock in `tz`) fires at the given UTC
 * instant. When `tz` is falsy this delegates to the plain UTC `cronMatches` for backward
 * compatibility with legacy rows that stored a baked-UTC cron.
 */
export function cronMatchesTz(expr: string, date: Date, tz?: string | null): boolean {
  if (!tz) return cronMatches(expr, date)
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return false
  const [minF, hourF, domF, monF, dowF] = parts
  let p: ReturnType<typeof zonedParts>
  try { p = zonedParts(date, tz) } catch { return cronMatches(expr, date) } // bad tz → safe fallback
  const dowMatch = matchField(dowF, p.dow) || (dowF !== "*" && p.dow === 0 && matchField(dowF, 7))
  return matchField(minF, p.min)
    && matchField(hourF, p.hour)
    && matchField(domF, p.dom)
    && matchField(monF, p.mon)
    && dowMatch
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

export async function tickScheduler(now = new Date()): Promise<void> {
  // Round down to the current minute boundary for dedup guard.
  const minuteTs = Math.floor(now.getTime() / 60_000) * 60_000
  let trails
  try { trails = await listAllScheduledTrails() } catch (e) {
    console.warn("[scheduler] listAllScheduledTrails failed:", String((e as any)?.message || e))
    return
  }
  for (const trail of trails) {
    // KLA-277: honor the Trail's stored timezone (DST-safe) when present; legacy rows with no
    // scheduleTz keep the historical UTC-cron interpretation.
    if (!trail.schedule || !cronMatchesTz(trail.schedule, now, trail.scheduleTz)) continue
    // Already fired this minute for this trail
    if (trail.scheduledLastRunAt != null && trail.scheduledLastRunAt >= minuteTs) continue
    // Stamp before launching so a concurrent tick (or a fast walk) can't double-fire.
    await touchScheduledLastRunAt(trail.projectId, trail.id, minuteTs).catch(() => {})
    try {
      await runWalkNow(trail.projectId, trail.id, { trigger: "scheduled" })
      console.log(`[scheduler] fired walk for trail ${trail.id} (${trail.schedule})`)
    } catch (e: any) {
      if (e instanceof WalkBusyError) {
        console.log(`[scheduler] trail ${trail.id} busy, skipped this tick`)
        await recordSkippedScheduledRun(trail.projectId, trail.id, "skipped").catch(() => {})
      } else {
        console.warn(`[scheduler] trail ${trail.id} launch error:`, String(e?.message || e))
        await recordSkippedScheduledRun(trail.projectId, trail.id, "missed").catch(() => {})
      }
    }
  }
}

export function startTrailScheduler(): ReturnType<typeof setInterval> {
  return setInterval(() => {
    tickScheduler().catch((e) => console.warn("[scheduler] tick crashed:", String((e as any)?.message || e)))
  }, TICK_MS)
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
