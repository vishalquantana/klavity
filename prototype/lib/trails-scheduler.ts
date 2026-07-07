// KLA-88 — per-Trail cron scheduling. Runs every minute, fires any active Trail whose
// schedule_cron matches the current UTC minute. Guards against double-fire within the
// same minute window using scheduled_last_run_at.
//
// Cron format: standard 5-field UTC ("min hour dom month dow").
// Supported: *, numbers, comma-lists, ranges (a-b), step values (*/n, a-b/n).

import { listAllScheduledTrails, touchScheduledLastRunAt } from "./trails"
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
    if (!trail.schedule || !cronMatches(trail.schedule, now)) continue
    // Already fired this minute for this trail
    if (trail.scheduledLastRunAt != null && trail.scheduledLastRunAt >= minuteTs) continue
    // Stamp before launching so a concurrent tick (or a fast walk) can't double-fire.
    await touchScheduledLastRunAt(trail.projectId, trail.id, minuteTs).catch(() => {})
    try {
      await runWalkNow(trail.projectId, trail.id)
      console.log(`[scheduler] fired walk for trail ${trail.id} (${trail.schedule})`)
    } catch (e: any) {
      if (e instanceof WalkBusyError) {
        console.log(`[scheduler] trail ${trail.id} busy, skipped this tick`)
      } else {
        console.warn(`[scheduler] trail ${trail.id} launch error:`, String(e?.message || e))
      }
    }
  }
}

export function startTrailScheduler(): ReturnType<typeof setInterval> {
  return setInterval(() => {
    tickScheduler().catch((e) => console.warn("[scheduler] tick crashed:", String((e as any)?.message || e)))
  }, TICK_MS)
}
