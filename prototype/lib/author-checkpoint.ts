// R1: the ONE definition of a usable AuthorCheckpoint, plus the user-facing wording for stall reasons.
//
// Pure module (no imports at runtime) so lib/db.ts (boot sweep, stale reaper) and lib/trails-author.ts (resumable list,
// resume gate, runAuthorNow's final checkpoint verdict) share exactly the same rule instead of each carrying a slightly
// different one.
//
// "Usable" = the original KLA-57 format: the six REQUIRED fields below. Fields added later (autoAdvanceClicks,
// unconfirmedCommitPending, commitNudgeCount, proactiveVerifyFails) are optional for back-compat and are NOT checked, so
// every legacy checkpoint stays valid.
import type { AuthorCheckpoint } from "./trails-author"

/** A URL Resume can navigate to: parseable, and not a blank/error placeholder page. */
export function isUsableCheckpointUrl(u: unknown): u is string {
  if (typeof u !== "string" || !u.trim()) return false
  if (/^(about:blank|chrome-error:)/i.test(u)) return false
  try { new URL(u); return true } catch { return false }
}

const isCount = (n: unknown) => typeof n === "number" && Number.isFinite(n) && n >= 0

/** Is this parsed value a checkpoint Resume can actually use? */
export function isUsableCheckpoint(cp: unknown): cp is AuthorCheckpoint {
  const c = cp as any
  if (!c || typeof c !== "object" || Array.isArray(c)) return false
  if (!Array.isArray(c.traj) || c.traj.length === 0) return false
  if (!c.traj.every((s: any) => s && typeof s === "object" && typeof s.action === "string" && s.action.length > 0)) return false
  if (!Array.isArray(c.history) || !c.history.every((h: unknown) => typeof h === "string")) return false
  if (!Number.isInteger(c.stepIdx) || c.stepIdx < 0) return false
  if (!isCount(c.llmCalls) || !isCount(c.costUsd)) return false
  return isUsableCheckpointUrl(c.lastUrl)
}

/** Parse a stored `checkpoint_json` value; returns the checkpoint only if it is valid JSON AND usable, else null. */
export function usableCheckpointFromJson(raw: unknown): AuthorCheckpoint | null {
  if (raw == null || raw === "") return null
  try {
    const parsed = JSON.parse(String(raw))
    return isUsableCheckpoint(parsed) ? parsed : null
  } catch { return null }
}

/**
 * Wording the dashboard may show for an author session's stall reason. The persisted `stall_reason` keeps the technical
 * detail (raw browser/database error text, internal persistence notes) for diagnostics; this strips those notes and
 * replaces internal wording with plain language. It never invents a different cause: unknown reasons pass through
 * (minus the persistence notes).
 *
 * Resume wording depends on the ACTUAL session state, never on the stored text alone. The caller must pass the session:
 *   - resumable  = status is stalled/needs_auth AND its checkpoint passes the shared rule (isUsableCheckpoint).
 *   - resumable  -> may say "You can resume it." / "Resume will continue from the last saved progress."
 *   - failed, or stalled/needs_auth with a missing or unusable checkpoint -> NEVER any resume wording; says to start a new run.
 *   - running / crystallized etc. -> reason is only cleaned of internals, no advice is added.
 */
export function userFacingStallReason(
  reason: string | null | undefined,
  session: { status: string; checkpoint?: unknown },
): string | null {
  if (!reason) return null
  let r = String(reason)
  const latestNotSaved = /\[latest checkpoint not saved[^\]]*\]/i.test(r)
  const notSaved = /\[checkpoint not saved[^\]]*\]/i.test(r)
  r = r.replace(/\s*\[[^\]]*checkpoint not saved[^\]]*\]/gi, "").trim()
  if (/checkpoint not saved/i.test(r)) r = "AutoSim stopped."   // malformed note: never leak it
  const recoverableBase =
    /^browser\/page problem/i.test(r) ? "The browser closed unexpectedly while AutoSim was working."
    : /^network error/i.test(r) ? "The connection dropped while AutoSim was working."
    : /step watchdog/i.test(r) ? "AutoSim stopped making progress, so the run was ended."
    : /^interrupted by a server restart/i.test(r) ? "The server restarted while AutoSim was working."
    : /^stale heartbeat/i.test(r) ? "AutoSim stopped responding."
    : null

  const pausedStatus = session.status === "stalled" || session.status === "needs_auth"
  const resumable = pausedStatus && isUsableCheckpoint(session.checkpoint)
  const needsAdvice = pausedStatus || session.status === "failed"

  if (resumable) {
    if (latestNotSaved) return `${recoverableBase ?? stripResumeBoilerplate(r) ?? "AutoSim stopped."} Resume will continue from the last saved progress.`.trim()
    return recoverableBase ? `${recoverableBase} You can resume it.` : (r || null)
  }
  if (!needsAdvice) return recoverableBase ?? (r || null)

  // Not resumable (failed, or paused with no usable checkpoint): no resume wording of any kind - start a new run.
  const base = (recoverableBase ?? stripResumeBoilerplate(r) ?? "AutoSim stopped.").replace(/[\s,.\u2014-]*please retry\.?$/i, "").trim()
  const sentence = /[.!?]$/.test(base) ? base : `${base}.`
  return notSaved
    ? `${sentence} Its progress could not be saved, so it can't be resumed. Please start a new run.`
    : `${sentence} Please start a new run.`
}

/** Drops the engine's own "Resume to continue from the last checkpoint." tail; returns null if nothing is left. */
function stripResumeBoilerplate(r: string): string | null {
  const s = r.replace(/\s*Resume to continue from the last checkpoint\.?/i, "").trim()
  return s || null
}
