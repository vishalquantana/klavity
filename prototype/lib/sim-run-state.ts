// lib/sim-run-state.ts — per-USER Run / Stop state for Sims on pages (the widget's Sims feedback card).
//
// The Sim model, end to end:
//   * Sims tab → Activate / Deactivate (personas.active, project-wide). New Sims start Deactivated; a Deactivated Sim never runs.
//   * Run / Stop (this table) — whether an ACTIVE Sim is reviewing the pages THIS USER browses. Set from the Sims tab card, the
//     widget's "Select Sims" modal, "Run all Sims", or the feedback card's Close (stops all). It is per user: one teammate stopping a
//     Sim (or closing their card) never stops it for anyone else.
//   * No row = stopped. A Sim that is Deactivated has its rows cleared, so re-activating it shows "Run" again.
//
// Supersedes the project-wide sim_deployments table (deploy / deactivate / pause / resume), which is no longer read or written.

import type { Client } from "@libsql/client"

export type SimRunAction = "run" | "stop" | "stop_all"
export const SIM_RUN_ACTIONS: readonly SimRunAction[] = ["run", "stop", "stop_all"]

const ensured = new WeakSet<Client>()
export async function ensureSimRunStateTable(c: Client): Promise<void> {
  if (ensured.has(c)) return
  await c.execute(
    `CREATE TABLE IF NOT EXISTS sim_run_state (
       project_id TEXT NOT NULL,
       user_email TEXT NOT NULL,
       sim_id TEXT NOT NULL,
       updated_at INTEGER NOT NULL,
       PRIMARY KEY (project_id, user_email, sim_id)
     )`,
  )
  ensured.add(c)
}

const norm = (email: string) => String(email || "").trim().toLowerCase()

/** Ids of the Sims this user has running in this project (a row = running). */
export async function runningSimIds(c: Client, projectId: string, email: string): Promise<Set<string>> {
  await ensureSimRunStateTable(c)
  const r = await c.execute({ sql: "SELECT sim_id FROM sim_run_state WHERE project_id=? AND user_email=?", args: [projectId, norm(email)] })
  return new Set(r.rows.map((x: any) => String(x.sim_id)))
}

/** Mark `simIds` running for this user (idempotent). The caller has already checked they are active Sims of the project. */
export async function runSims(c: Client, projectId: string, email: string, simIds: string[], now = Date.now()): Promise<void> {
  if (!simIds.length) return
  await ensureSimRunStateTable(c)
  await c.batch(simIds.map((id) => ({
    sql: `INSERT INTO sim_run_state (project_id, user_email, sim_id, updated_at) VALUES (?,?,?,?)
          ON CONFLICT(project_id, user_email, sim_id) DO UPDATE SET updated_at=excluded.updated_at`,
    args: [projectId, norm(email), id, now],
  })), "write")
}

/** Stop `simIds` for this user — or every Sim when `simIds` is null (the card's Close). */
export async function stopSims(c: Client, projectId: string, email: string, simIds: string[] | null): Promise<void> {
  await ensureSimRunStateTable(c)
  if (simIds === null) {
    await c.execute({ sql: "DELETE FROM sim_run_state WHERE project_id=? AND user_email=?", args: [projectId, norm(email)] })
    return
  }
  if (!simIds.length) return
  await c.execute({
    sql: `DELETE FROM sim_run_state WHERE project_id=? AND user_email=? AND sim_id IN (${simIds.map(() => "?").join(",")})`,
    args: [projectId, norm(email), ...simIds],
  })
}

/** A Sim was Deactivated on the Sims tab: stop it for EVERY user (re-activating it then shows "Run"). */
export async function clearSimRuns(c: Client, projectId: string, simId: string): Promise<void> {
  await ensureSimRunStateTable(c)
  await c.execute({ sql: "DELETE FROM sim_run_state WHERE project_id=? AND sim_id=?", args: [projectId, simId] })
}
