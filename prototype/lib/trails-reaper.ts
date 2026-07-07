// KLA-55: Periodic crash-reaper. Sweeps trail_runs and author_sessions whose heartbeat is
// older than WALK_STALE_MS (default 3 min) — catches OOM-killed processes that don't restart
// cleanly. Call startCrashReaper once after initDb (guarded by NODE_ENV !== 'test' in server.ts
// so it never holds the test process open).
import type { Client } from "@libsql/client"
import { sweepStaleWalks, sweepStaleAuthorSessions } from "./db"

const DEFAULT_REAPER_INTERVAL_MS = Number(process.env.REAPER_INTERVAL_MS) || 60 * 1000

export interface ReaperHandle {
  stop(): void
}

/**
 * Start the periodic stale-heartbeat reaper. Returns a handle with `stop()` so tests and
 * graceful-shutdown handlers can clear the interval.
 *
 * @param c   - The libsql Client to run sweeps against (same db module instance).
 * @param intervalMs - How often to tick (default: 60s, env-overridable via REAPER_INTERVAL_MS).
 */
export function startCrashReaper(c: Client, intervalMs = DEFAULT_REAPER_INTERVAL_MS): ReaperHandle {
  const tick = () => {
    sweepStaleWalks(c).catch((e) => console.warn("[crash-reaper] walk sweep error:", String(e)))
    sweepStaleAuthorSessions(c).catch((e) => console.warn("[crash-reaper] session sweep error:", String(e)))
  }
  const id = setInterval(tick, intervalMs)
  return { stop: () => clearInterval(id) }
}
