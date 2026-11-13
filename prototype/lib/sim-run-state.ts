// lib/sim-run-state.ts — per-USER Run / Stop state for Sims on pages (the widget's Sims feedback card).
//
// The Sim model, end to end:
//   * Sims tab → Activate / Deactivate (personas.active, project-wide). New Sims start Deactivated; a Deactivated Sim never runs.
//   * Run / Stop (this table) — whether an ACTIVE Sim is reviewing the pages THIS USER browses. Set from the Sims tab card, the
//     widget's "Select Sims" modal, "Run all Sims", or the feedback card's Close (stops all). It is per user: one teammate stopping a
//     Sim (or closing their card) never stops it for anyone else.
//   * It is also per APPLICATION (page origin): a Sim started on px4 runs on px4 only — never on Klavity's own pages or another app.
//     A row's `origin` is the page origin it was started from; '' (rows from before origin scoping) matches every origin.
//   * No row = stopped. A Sim that is Deactivated has its rows cleared, so re-activating it shows "Run" again.
//
// Supersedes the project-wide sim_deployments table (deploy / deactivate / pause / resume), which is no longer read or written.

import type { Client } from "@libsql/client"

export type SimRunAction = "run" | "stop" | "stop_all"
export const SIM_RUN_ACTIONS: readonly SimRunAction[] = ["run", "stop", "stop_all"]

const ensured = new WeakSet<Client>()
export async function ensureSimRunStateTable(c: Client): Promise<void> {
  if (ensured.has(c)) return
  // The original table (project, user, sim) had no origin and can't gain a primary-key column, so origin-scoped rows live in a new
  // table. Rows from the old one are carried over ONCE, when the new table is first created, with origin '' (= every origin).
  await c.execute(
    `CREATE TABLE IF NOT EXISTS sim_run_state (
       project_id TEXT NOT NULL,
       user_email TEXT NOT NULL,
       sim_id TEXT NOT NULL,
       updated_at INTEGER NOT NULL,
       PRIMARY KEY (project_id, user_email, sim_id)
     )`,
  )
  const had = await c.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='sim_run_state_origin'")
  if (!had.rows.length) {
    await c.execute(
      `CREATE TABLE IF NOT EXISTS sim_run_state_origin (
         project_id TEXT NOT NULL,
         user_email TEXT NOT NULL,
         sim_id TEXT NOT NULL,
         origin TEXT NOT NULL DEFAULT '',
         updated_at INTEGER NOT NULL,
         PRIMARY KEY (project_id, user_email, sim_id, origin)
       )`,
    )
    await c.execute("INSERT OR IGNORE INTO sim_run_state_origin (project_id, user_email, sim_id, origin, updated_at) SELECT project_id, user_email, sim_id, '', updated_at FROM sim_run_state")
  }
  ensured.add(c)
}

const norm = (email: string) => String(email || "").trim().toLowerCase()

/** A page origin ("https://app.example.com:8443"), lower-cased; '' when absent / not a web URL. */
export function normOrigin(v: unknown): string {
  const s = String(v ?? "").trim()
  if (!s) return ""
  try {
    const u = new URL(s)
    return u.protocol === "http:" || u.protocol === "https:" ? u.origin.toLowerCase() : ""
  } catch { return "" }
}

/**
 * Ids of the Sims this user has running in this project (a row = running). With an `origin`, only Sims running on THAT application
 * (plus legacy '' rows); without one, every Sim running anywhere (the Sims tab's status view).
 */
export async function runningSimIds(c: Client, projectId: string, email: string, origin?: string | null): Promise<Set<string>> {
  await ensureSimRunStateTable(c)
  const o = normOrigin(origin)
  const r = o
    ? await c.execute({ sql: "SELECT DISTINCT sim_id FROM sim_run_state_origin WHERE project_id=? AND user_email=? AND origin IN (?, '')", args: [projectId, norm(email), o] })
    : await c.execute({ sql: "SELECT DISTINCT sim_id FROM sim_run_state_origin WHERE project_id=? AND user_email=?", args: [projectId, norm(email)] })
  return new Set(r.rows.map((x: any) => String(x.sim_id)))
}

/** The application this user most recently started a Sim on in this project ('' when none) — where a Run from the Sims tab applies. */
export async function lastRunOrigin(c: Client, projectId: string, email: string): Promise<string> {
  await ensureSimRunStateTable(c)
  const r = await c.execute({ sql: "SELECT origin FROM sim_run_state_origin WHERE project_id=? AND user_email=? AND origin<>'' ORDER BY updated_at DESC LIMIT 1", args: [projectId, norm(email)] })
  return r.rows.length ? String((r.rows[0] as any).origin) : ""
}

/** Mark `simIds` running for this user on `origin` (idempotent). The caller has already checked they are active Sims of the project. */
export async function runSims(c: Client, projectId: string, email: string, simIds: string[], now = Date.now(), origin?: string | null): Promise<void> {
  if (!simIds.length) return
  await ensureSimRunStateTable(c)
  const o = normOrigin(origin)
  await c.batch(simIds.map((id) => ({
    sql: `INSERT INTO sim_run_state_origin (project_id, user_email, sim_id, origin, updated_at) VALUES (?,?,?,?,?)
          ON CONFLICT(project_id, user_email, sim_id, origin) DO UPDATE SET updated_at=excluded.updated_at`,
    args: [projectId, norm(email), id, o, now],
  })), "write")
}

/**
 * Stop `simIds` for this user — or every Sim when `simIds` is null (the card's Close). With an `origin` the stop applies to that
 * application (and legacy '' rows) only; without one it stops the Sims everywhere.
 */
export async function stopSims(c: Client, projectId: string, email: string, simIds: string[] | null, origin?: string | null): Promise<void> {
  await ensureSimRunStateTable(c)
  const o = normOrigin(origin)
  const scope = o ? " AND origin IN (?, '')" : ""
  const scopeArgs = o ? [o] : []
  if (simIds === null) {
    await c.execute({ sql: `DELETE FROM sim_run_state_origin WHERE project_id=? AND user_email=?${scope}`, args: [projectId, norm(email), ...scopeArgs] })
    return
  }
  if (!simIds.length) return
  await c.execute({
    sql: `DELETE FROM sim_run_state_origin WHERE project_id=? AND user_email=? AND sim_id IN (${simIds.map(() => "?").join(",")})${scope}`,
    args: [projectId, norm(email), ...simIds, ...scopeArgs],
  })
}

/** A Sim was Deactivated on the Sims tab: stop it for EVERY user on every application (re-activating it then shows "Run"). */
export async function clearSimRuns(c: Client, projectId: string, simId: string): Promise<void> {
  await ensureSimRunStateTable(c)
  await c.execute({ sql: "DELETE FROM sim_run_state_origin WHERE project_id=? AND sim_id=?", args: [projectId, simId] })
}
