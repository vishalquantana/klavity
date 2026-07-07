// KLA-106: Trail Modules — named reusable step-groups with parameter substitution.
//
// A "module" is a named sequence of steps (TrailModuleStep) that any Trail can reference via a
// `callModule` step. At expansion time (expandModuleSteps), each callModule step is replaced
// inline by the module's concrete steps with {{param:name}} placeholders resolved.
//
// v1 constraints (kept intentionally minimal):
//   • Modules are flat — a module step cannot itself be a callModule step.
//   • Params are simple key→string substitution; no nesting, no conditionals.
//   • Expansion is pure (no LLM, no browser). DB read only.
import { db } from "./db"
import type { TrailStep, TrailModuleStep, TrailModule, ModuleParams, Fingerprint, Checkpoint, StepAction } from "./trails-types"

function uid(prefix: string): string { return prefix + crypto.randomUUID() }
function j<T>(v: T | null | undefined): string | null { return v == null ? null : JSON.stringify(v) }
function pj<T>(s: unknown): T | null { return s ? (JSON.parse(String(s)) as T) : null }

// ── PARAM_RE: matches {{param:name}} where name is 1–60 word chars ────────────────────────────────
const PARAM_RE = /\{\{param:([A-Za-z0-9_-]{1,60})\}\}/g

/**
 * Replace every `{{param:name}}` placeholder in `value` with the resolved string from `params`.
 * Unknown params are left as-is (not silently dropped) so authors see unresolved tokens in evidence.
 */
export function applyParams(value: string, params: ModuleParams): string {
  return value.replace(PARAM_RE, (match, name) => (name in params ? params[name] : match))
}

/** Parse the `actionValue` of a `callModule` step. Returns null if the value is malformed. */
export function parseModuleCall(actionValue: string | null): { moduleId: string; params: ModuleParams } | null {
  if (!actionValue) return null
  try {
    const obj = JSON.parse(actionValue)
    if (typeof obj?.moduleId !== "string" || !obj.moduleId) return null
    const params: ModuleParams = {}
    if (obj.params && typeof obj.params === "object" && !Array.isArray(obj.params)) {
      for (const [k, v] of Object.entries(obj.params)) {
        if (typeof v === "string") params[k] = v
      }
    }
    return { moduleId: obj.moduleId, params }
  } catch {
    return null
  }
}

/** Encode a callModule step's actionValue. */
export function encodeModuleCall(moduleId: string, params: ModuleParams = {}): string {
  return JSON.stringify({ moduleId, params })
}

// ── DB helpers ────────────────────────────────────────────────────────────────────────────────────

function rowToModule(r: any): TrailModule {
  return {
    id: r.id, projectId: r.project_id, name: r.name,
    description: r.description ?? "",
    createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  }
}

function rowToModuleStep(r: any): TrailModuleStep {
  return {
    id: r.id, moduleId: r.module_id, projectId: r.project_id, idx: Number(r.idx),
    action: r.action as Exclude<StepAction, "callModule">,
    actionValue: r.action_value ?? null,
    target: pj<Fingerprint>(r.target_json),
    checkpoint: pj<Checkpoint>(r.checkpoint_json),
    createdAt: Number(r.created_at),
  }
}

export async function createModule(
  projectId: string,
  input: { name: string; description?: string },
): Promise<string> {
  const id = uid("tmod_"); const now = Date.now()
  await db!.execute({
    sql: `INSERT INTO trail_modules (id, project_id, name, description, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, projectId, input.name, input.description ?? "", now, now],
  })
  return id
}

export async function getModule(projectId: string, id: string): Promise<TrailModule | null> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_modules WHERE project_id=? AND id=?`, args: [projectId, id] })
  return r.rows.length ? rowToModule(r.rows[0]) : null
}

export async function listModules(projectId: string): Promise<TrailModule[]> {
  const r = await db!.execute({ sql: `SELECT * FROM trail_modules WHERE project_id=? ORDER BY created_at DESC`, args: [projectId] })
  return r.rows.map(rowToModule)
}

export async function deleteModule(projectId: string, id: string): Promise<void> {
  await db!.execute({ sql: `DELETE FROM trail_module_steps WHERE project_id=? AND module_id=?`, args: [projectId, id] })
  await db!.execute({ sql: `DELETE FROM trail_modules WHERE project_id=? AND id=?`, args: [projectId, id] })
}

export async function addModuleStep(
  projectId: string,
  moduleId: string,
  input: {
    idx: number
    action: Exclude<StepAction, "callModule">
    actionValue?: string
    target?: Fingerprint
    checkpoint?: Checkpoint
  },
): Promise<string> {
  const id = uid("tms_")
  await db!.execute({
    sql: `INSERT INTO trail_module_steps (id, module_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, moduleId, projectId, input.idx, input.action, input.actionValue ?? null,
           j(input.target), j(input.checkpoint), Date.now()],
  })
  return id
}

export async function listModuleSteps(projectId: string, moduleId: string): Promise<TrailModuleStep[]> {
  const r = await db!.execute({
    sql: `SELECT * FROM trail_module_steps WHERE project_id=? AND module_id=? ORDER BY idx ASC`,
    args: [projectId, moduleId],
  })
  return r.rows.map(rowToModuleStep)
}

// ── Expansion ─────────────────────────────────────────────────────────────────────────────────────

/**
 * Expand any `callModule` steps in `steps` by inlining the module's concrete steps (with
 * `{{param:name}}` substitution). Non-callModule steps pass through unchanged.
 *
 * The returned steps preserve relative ordering: if a Trail has steps [A, callLogin(params), B],
 * the result is [A, login_step_0, login_step_1, ..., B].
 *
 * Indices (`.idx`) of expanded steps are synthetic sequential values starting from the preceding
 * step's idx so the runner's ordering is stable. Each expanded TrailStep carries a synthetic id
 * (`"msx_<moduleStepId>_<callStepId>"`) that uniquely identifies the (module-step, call-site) pair
 * across a walk's run_steps — no ambiguity when the same module is called twice.
 *
 * If a callModule step references an unknown module (deleted, wrong project), the step is emitted
 * as-is with action `"callModule"` so the runner can record a RED verdict for it rather than
 * silently skipping it.
 */
export async function expandModuleSteps(projectId: string, steps: TrailStep[]): Promise<TrailStep[]> {
  const result: TrailStep[] = []
  for (const step of steps) {
    if (step.action !== "callModule") { result.push(step); continue }
    const call = parseModuleCall(step.actionValue)
    if (!call) { result.push(step); continue }

    const moduleSteps = await listModuleSteps(projectId, call.moduleId)
    if (!moduleSteps.length) {
      // Module missing or empty — pass through so the runner records RED.
      result.push(step)
      continue
    }

    for (let i = 0; i < moduleSteps.length; i++) {
      const ms = moduleSteps[i]
      const rawValue = ms.actionValue ?? null
      const resolvedValue = rawValue !== null ? applyParams(rawValue, call.params) : null
      const synthetic: TrailStep = {
        id: `msx_${ms.id}_${step.id}`,
        trailId: step.trailId,
        projectId: step.projectId,
        idx: step.idx + i,                 // synthetic inline index
        action: ms.action as StepAction,
        actionValue: resolvedValue,
        target: ms.target,
        checkpoint: ms.checkpoint,
        createdAt: ms.createdAt,
      }
      result.push(synthetic)
    }
  }
  return result
}
