// lib/sim-deployments.ts — Select Sims management (deployment + execution state per Sim).
//
// ISOLATED, ADDITIVE feature backing the widget's "Select Sims…" modal. It owns its own table
// (`sim_deployments`) and never reads or writes any existing Sims / AutoSims table, so the legacy
// "Deploy all Sims" flow, /api/sim/review, persona CRUD and every AutoSim workflow are untouched.
//
// Two independent axes per (project, sim):
//   deployment: 'not_deployed' | 'deployed' | 'deactivated'
//   execution:  'not_running'  | 'running'  | 'paused'
//
// Allowed transitions (anything else is rejected, so a stale/mixed client selection can never apply
// an incompatible bulk action):
//   deploy      not_deployed|deactivated → deployed + running
//   deactivate  deployed                 → deactivated + not_running
//   pause       deployed + running       → deployed + paused       (deployment unchanged)
//   resume      deployed + paused        → deployed + running      (no redeploy)
//
// A Sim with no row is implicitly not_deployed / not_running.

import type { Client } from "@libsql/client"

export type SimDeploymentStatus = "not_deployed" | "deployed" | "deactivated"
export type SimExecutionStatus = "not_running" | "running" | "paused"
export type SimBulkAction = "deploy" | "deactivate"
export type SimExecAction = "pause" | "resume"
export type SimAction = SimBulkAction | SimExecAction

export interface SimDeploymentState {
  simId: string
  deployment: SimDeploymentStatus
  execution: SimExecutionStatus
  updatedAt: number | null
  updatedBy: string | null
}

export const SIM_ACTIONS: readonly SimAction[] = ["deploy", "deactivate", "pause", "resume"]

// ── schema (idempotent, additive) ────────────────────────────────────────────────
const ensured = new WeakSet<Client>()
export async function ensureSimDeploymentsTable(c: Client): Promise<void> {
  if (ensured.has(c)) return
  await c.execute(
    `CREATE TABLE IF NOT EXISTS sim_deployments (
       project_id TEXT NOT NULL,
       sim_id TEXT NOT NULL,
       deployment_status TEXT NOT NULL DEFAULT 'not_deployed',
       execution_status TEXT NOT NULL DEFAULT 'not_running',
       updated_by TEXT,
       updated_at INTEGER NOT NULL,
       PRIMARY KEY (project_id, sim_id)
     )`,
  )
  ensured.add(c)
}

const DEPLOYMENTS = new Set<SimDeploymentStatus>(["not_deployed", "deployed", "deactivated"])
const EXECUTIONS = new Set<SimExecutionStatus>(["not_running", "running", "paused"])

function defaultState(simId: string): SimDeploymentState {
  return { simId, deployment: "not_deployed", execution: "not_running", updatedAt: null, updatedBy: null }
}

function rowToState(x: any): SimDeploymentState {
  const dep = String(x.deployment_status) as SimDeploymentStatus
  const exe = String(x.execution_status) as SimExecutionStatus
  return {
    simId: String(x.sim_id),
    deployment: DEPLOYMENTS.has(dep) ? dep : "not_deployed",
    execution: EXECUTIONS.has(exe) ? exe : "not_running",
    updatedAt: x.updated_at != null ? Number(x.updated_at) : null,
    updatedBy: x.updated_by != null ? String(x.updated_by) : null,
  }
}

/** State for every requested Sim id (missing rows → not_deployed / not_running). */
export async function listSimDeploymentStates(c: Client, projectId: string, simIds: string[]): Promise<Map<string, SimDeploymentState>> {
  await ensureSimDeploymentsTable(c)
  const out = new Map<string, SimDeploymentState>()
  for (const id of simIds) out.set(id, defaultState(id))
  const r = await c.execute({ sql: "SELECT * FROM sim_deployments WHERE project_id=?", args: [projectId] })
  for (const row of r.rows) {
    const s = rowToState(row)
    if (out.has(s.simId)) out.set(s.simId, s)
  }
  return out
}

/** Pure transition rule — returns the next state, or null when the action doesn't apply. */
export function nextSimState(cur: SimDeploymentState, action: SimAction): { deployment: SimDeploymentStatus; execution: SimExecutionStatus } | null {
  switch (action) {
    case "deploy":
      return cur.deployment === "deployed" ? null : { deployment: "deployed", execution: "running" }
    case "deactivate":
      return cur.deployment === "deployed" ? { deployment: "deactivated", execution: "not_running" } : null
    case "pause":
      return cur.deployment === "deployed" && cur.execution === "running" ? { deployment: "deployed", execution: "paused" } : null
    case "resume":
      return cur.deployment === "deployed" && cur.execution === "paused" ? { deployment: "deployed", execution: "running" } : null
  }
  return null
}

export interface ApplySimActionResult {
  applied: string[]
  /** Ids the action did not apply to (wrong current state) — reported, never force-applied. */
  skipped: Array<{ simId: string; reason: string }>
  states: SimDeploymentState[]
}

/**
 * Apply `action` to `simIds` (already validated as belonging to `projectId`). Only Sims whose current
 * state permits the action change; the rest are returned in `skipped`. Writes run in one batch.
 */
export async function applySimAction(
  c: Client, projectId: string, simIds: string[], action: SimAction, actor: string | null, now = Date.now(),
): Promise<ApplySimActionResult> {
  await ensureSimDeploymentsTable(c)
  const unique = [...new Set(simIds)]
  const current = await listSimDeploymentStates(c, projectId, unique)
  const applied: string[] = []
  const skipped: Array<{ simId: string; reason: string }> = []
  const stmts: Array<{ sql: string; args: any[] }> = []
  for (const id of unique) {
    const cur = current.get(id)!
    const nxt = nextSimState(cur, action)
    if (!nxt) { skipped.push({ simId: id, reason: `cannot ${action} a Sim that is ${cur.deployment}/${cur.execution}` }); continue }
    applied.push(id)
    stmts.push({
      sql: `INSERT INTO sim_deployments (project_id, sim_id, deployment_status, execution_status, updated_by, updated_at)
            VALUES (?,?,?,?,?,?)
            ON CONFLICT(project_id, sim_id) DO UPDATE SET
              deployment_status=excluded.deployment_status, execution_status=excluded.execution_status,
              updated_by=excluded.updated_by, updated_at=excluded.updated_at`,
      args: [projectId, id, nxt.deployment, nxt.execution, actor, now],
    })
    current.set(id, { simId: id, ...nxt, updatedAt: now, updatedBy: actor })
  }
  if (stmts.length) await c.batch(stmts, "write")
  return { applied, skipped, states: unique.map((id) => current.get(id)!) }
}
