// KLA-96: Run-history retention/pruning. Prevents trail_runs, run_steps, walk_replays,
// walk_judgments, walk_share_tokens, and pruneable findings from growing unbounded.
//
// Strategy: keep the last KLAV_RUN_KEEP_COUNT runs per trail (default 50) AND any run
// newer than KLAV_RUN_KEEP_DAYS days (default 30). A run is pruned only if BOTH conditions
// fail: its rank within the trail exceeds the count limit AND it is older than the day limit.
// This is the most conservative/user-safe interpretation of "or" in "keep last N or X days".
//
// Cascades (in order — children before parent):
//   run_steps, walk_replays, walk_judgments, walk_share_tokens → always
//   findings → only status 'queued' or 'auto_filed' (filed/dismissed rows keep their audit trail)
//
// Called from runRetentionSweep() in lib/retention.ts (already guarded to never run in tests).
// Also exported standalone for ad-hoc invocation.

import type { Client } from "@libsql/client"
import { db } from "./db"

export interface RunRetentionOpts {
  /** Max runs to keep per trail (newest first). Default: KLAV_RUN_KEEP_COUNT env or 50. */
  keepCount?: number
  /** Keep runs newer than this many days regardless of count. Default: KLAV_RUN_KEEP_DAYS env or 30. */
  keepDays?: number
  /** Override current epoch ms (for deterministic tests). */
  now?: number
}

export interface RunRetentionResult {
  runsDeleted: number
  runStepsDeleted: number
  replaysDeleted: number
  judgementsDeleted: number
  shareTokensDeleted: number
  findingsDeleted: number
}

const DEFAULT_KEEP_COUNT = Number(process.env.KLAV_RUN_KEEP_COUNT) || 50
const DEFAULT_KEEP_DAYS = Number(process.env.KLAV_RUN_KEEP_DAYS) || 30

export async function pruneRunHistory(
  c: Client | null = db,
  opts: RunRetentionOpts = {},
): Promise<RunRetentionResult> {
  const result: RunRetentionResult = {
    runsDeleted: 0, runStepsDeleted: 0, replaysDeleted: 0,
    judgementsDeleted: 0, shareTokensDeleted: 0, findingsDeleted: 0,
  }
  if (!c) return result

  const keepCount = opts.keepCount ?? DEFAULT_KEEP_COUNT
  const keepDays = opts.keepDays ?? DEFAULT_KEEP_DAYS
  const now = opts.now ?? Date.now()
  const ageFloor = now - keepDays * 24 * 60 * 60 * 1000

  // Find all distinct (project_id, trail_id) pairs.
  const trails = await c.execute(
    `SELECT DISTINCT project_id, trail_id FROM trail_runs WHERE status != 'running'`,
  )

  for (const row of trails.rows) {
    const projectId = String((row as any).project_id)
    const trailId = String((row as any).trail_id)

    // Identify candidate runs to prune: rank > keepCount AND started_at < ageFloor.
    // ROW_NUMBER() is available in libsql/SQLite >= 3.25 (2018) — safe assumption for Turso.
    const candidates = await c.execute({
      sql: `
        SELECT id FROM (
          SELECT id, started_at,
                 ROW_NUMBER() OVER (ORDER BY started_at DESC) AS rn
          FROM trail_runs
          WHERE project_id=? AND trail_id=? AND status != 'running'
        )
        WHERE rn > ? AND started_at < ?
      `,
      args: [projectId, trailId, keepCount, ageFloor],
    })

    if (!candidates.rows.length) continue

    const runIds = candidates.rows.map((r) => String((r as any).id))

    // Delete children first; SQLite has no FK cascade by default.
    for (const chunk of inChunks(runIds, 50)) {
      const ph = placeholders(chunk.length)

      const rs = await c.execute({ sql: `DELETE FROM run_steps WHERE run_id IN (${ph})`, args: chunk })
      result.runStepsDeleted += rs.rowsAffected

      const wr = await c.execute({ sql: `DELETE FROM walk_replays WHERE run_id IN (${ph})`, args: chunk })
      result.replaysDeleted += wr.rowsAffected

      const wj = await c.execute({ sql: `DELETE FROM walk_judgments WHERE run_id IN (${ph})`, args: chunk })
      result.judgementsDeleted += wj.rowsAffected

      const wst = await c.execute({ sql: `DELETE FROM walk_share_tokens WHERE run_id IN (${ph})`, args: chunk })
      result.shareTokensDeleted += wst.rowsAffected

      // Prune findings that are still in a transient state (queued/auto_filed).
      // Keep 'filed' (Plane-linked) and 'dismissed' (intentional user action).
      const fr = await c.execute({
        sql: `DELETE FROM findings WHERE run_id IN (${ph}) AND status IN ('queued','auto_filed')`,
        args: chunk,
      })
      result.findingsDeleted += fr.rowsAffected

      const tr = await c.execute({ sql: `DELETE FROM trail_runs WHERE id IN (${ph})`, args: chunk })
      result.runsDeleted += tr.rowsAffected
    }
  }

  return result
}

function placeholders(n: number): string {
  return Array.from({ length: n }, () => "?").join(",")
}

function* inChunks<T>(arr: T[], size: number): Generator<T[]> {
  for (let i = 0; i < arr.length; i += size) yield arr.slice(i, i + size)
}
