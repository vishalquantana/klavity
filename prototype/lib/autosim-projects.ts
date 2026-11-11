// KD-2255: AutoSim Projects — an organisational hierarchy INSIDE a Klavity project:
//   autosim_project → test_case_group (optional) → test_case → trails (each Trail = one AutoSim).
// Every function takes the Klavity projectId first and scopes every statement by it, so a caller
// that passed resolveProject() can never touch another tenant's rows.
// Deletion rules (no SQL FKs — libsql runs with foreign_keys off):
//   delete group        → its test cases become ungrouped
//   delete test case    → its Trails are unlinked (kept in the AutoSim project, no test case)
//   delete project      → its groups + test cases are deleted; Trails and Test Accounts are UNLINKED
// Nothing here ever deletes a Trail, a walk, or a credential.
import { db } from "./db"

export type TestCaseStatus = "active" | "draft" | "archived"
export const TEST_CASE_STATUSES: TestCaseStatus[] = ["active", "draft", "archived"]

export interface AutosimProject {
  id: string; name: string; description: string
  createdBy: string | null; createdAt: number; updatedAt: number
  groupCount: number; testCaseCount: number; trailCount: number
}
export interface TestCaseGroup { id: string; autosimProjectId: string; name: string; description: string; createdAt: number; updatedAt: number }
export interface TestCase {
  id: string; autosimProjectId: string; groupId: string | null; name: string; description: string
  status: TestCaseStatus; createdBy: string | null; createdAt: number; updatedAt: number; trailCount: number
  /** null = execute without credentials; else the Test Account (by id) its AutoSims log in with. */
  testAccountId: string | null
  /** Where this test case's AutoSims start (http/https). Description holds the execution steps. */
  startUrl: string | null
}
export interface LinkedTrail { id: string; name: string; status: string; baseUrl: string; testCaseId: string | null; updatedAt: number }

const s = (v: any) => (v == null ? "" : String(v))
const now = () => Date.now()

const PROJECT_SELECT = `SELECT p.*,
  (SELECT COUNT(*) FROM autosim_test_case_groups g WHERE g.project_id=p.project_id AND g.autosim_project_id=p.id) AS group_count,
  (SELECT COUNT(*) FROM autosim_test_cases t WHERE t.project_id=p.project_id AND t.autosim_project_id=p.id) AS tc_count,
  (SELECT COUNT(*) FROM trails r WHERE r.project_id=p.project_id AND r.autosim_project_id=p.id AND r.status!='archived') AS trail_count
  FROM autosim_projects p`

const rowToProject = (r: any): AutosimProject => ({
  id: s(r.id), name: s(r.name), description: s(r.description),
  createdBy: r.created_by ? s(r.created_by) : null, createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  groupCount: Number(r.group_count || 0), testCaseCount: Number(r.tc_count || 0), trailCount: Number(r.trail_count || 0),
})
const rowToGroup = (r: any): TestCaseGroup => ({
  id: s(r.id), autosimProjectId: s(r.autosim_project_id), name: s(r.name), description: s(r.description),
  createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
})
const rowToTestCase = (r: any): TestCase => ({
  id: s(r.id), autosimProjectId: s(r.autosim_project_id), groupId: r.group_id ? s(r.group_id) : null,
  name: s(r.name), description: s(r.description), status: (TEST_CASE_STATUSES.includes(r.status) ? r.status : "active") as TestCaseStatus,
  createdBy: r.created_by ? s(r.created_by) : null, createdAt: Number(r.created_at), updatedAt: Number(r.updated_at),
  trailCount: Number(r.trail_count || 0),
  testAccountId: r.test_account_id ? s(r.test_account_id) : null,
  startUrl: r.start_url ? s(r.start_url) : null,
})
const rowToTrail = (r: any): LinkedTrail => ({
  id: s(r.id), name: s(r.name), status: s(r.status), baseUrl: s(r.base_url),
  testCaseId: r.test_case_id ? s(r.test_case_id) : null, updatedAt: Number(r.updated_at),
})

// ── Projects ────────────────────────────────────────────────────────────────────────────────────

// ponytail: returns all rows; the UI searches/paginates client-side. Add LIMIT/OFFSET + q here if a
// single Klavity project ever holds thousands of AutoSim projects.
export async function listAutosimProjects(projectId: string): Promise<AutosimProject[]> {
  const r = await db!.execute({ sql: `${PROJECT_SELECT} WHERE p.project_id=? ORDER BY p.updated_at DESC`, args: [projectId] })
  return r.rows.map(rowToProject)
}

export async function getAutosimProject(projectId: string, id: string): Promise<AutosimProject | null> {
  const r = await db!.execute({ sql: `${PROJECT_SELECT} WHERE p.project_id=? AND p.id=?`, args: [projectId, id] })
  return r.rows.length ? rowToProject(r.rows[0]) : null
}

export async function createAutosimProject(projectId: string, input: { name: string; description?: string; createdBy?: string }): Promise<string> {
  const id = "asp_" + crypto.randomUUID(); const t = now()
  await db!.execute({
    sql: `INSERT INTO autosim_projects (id,project_id,name,description,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`,
    args: [id, projectId, input.name, input.description ?? "", input.createdBy ?? null, t, t],
  })
  return id
}

export async function updateAutosimProject(projectId: string, id: string, patch: { name?: string; description?: string }): Promise<boolean> {
  const sets = ["updated_at=?"]; const args: any[] = [now()]
  if (patch.name !== undefined) { sets.push("name=?"); args.push(patch.name) }
  if (patch.description !== undefined) { sets.push("description=?"); args.push(patch.description) }
  const r = await db!.execute({ sql: `UPDATE autosim_projects SET ${sets.join(",")} WHERE project_id=? AND id=?`, args: [...args, projectId, id] })
  return r.rowsAffected > 0
}

export async function deleteAutosimProject(projectId: string, id: string): Promise<boolean> {
  const a = [projectId, id]
  const rs = await db!.batch([
    { sql: `UPDATE trails SET autosim_project_id=NULL, test_case_id=NULL WHERE project_id=? AND autosim_project_id=?`, args: a },
    { sql: `UPDATE test_accounts SET autosim_project_id=NULL WHERE project_id=? AND autosim_project_id=?`, args: a },
    { sql: `DELETE FROM autosim_test_cases WHERE project_id=? AND autosim_project_id=?`, args: a },
    { sql: `DELETE FROM autosim_test_case_groups WHERE project_id=? AND autosim_project_id=?`, args: a },
    { sql: `DELETE FROM autosim_projects WHERE project_id=? AND id=?`, args: a },
  ], "write")
  return rs[rs.length - 1].rowsAffected > 0
}

const touchProject = (projectId: string, id: string) =>
  db!.execute({ sql: `UPDATE autosim_projects SET updated_at=? WHERE project_id=? AND id=?`, args: [now(), projectId, id] })

// ── Groups ──────────────────────────────────────────────────────────────────────────────────────

export async function getGroup(projectId: string, apId: string, id: string): Promise<TestCaseGroup | null> {
  const r = await db!.execute({ sql: `SELECT * FROM autosim_test_case_groups WHERE project_id=? AND autosim_project_id=? AND id=?`, args: [projectId, apId, id] })
  return r.rows.length ? rowToGroup(r.rows[0]) : null
}

export async function createGroup(projectId: string, apId: string, input: { name: string; description?: string }): Promise<string> {
  const id = "atg_" + crypto.randomUUID(); const t = now()
  await db!.execute({
    sql: `INSERT INTO autosim_test_case_groups (id,project_id,autosim_project_id,name,description,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`,
    args: [id, projectId, apId, input.name, input.description ?? "", t, t],
  })
  await touchProject(projectId, apId)
  return id
}

export async function updateGroup(projectId: string, apId: string, id: string, patch: { name?: string; description?: string }): Promise<boolean> {
  const sets = ["updated_at=?"]; const args: any[] = [now()]
  if (patch.name !== undefined) { sets.push("name=?"); args.push(patch.name) }
  if (patch.description !== undefined) { sets.push("description=?"); args.push(patch.description) }
  const r = await db!.execute({ sql: `UPDATE autosim_test_case_groups SET ${sets.join(",")} WHERE project_id=? AND autosim_project_id=? AND id=?`, args: [...args, projectId, apId, id] })
  if (r.rowsAffected) await touchProject(projectId, apId)
  return r.rowsAffected > 0
}

/** Deleting a group never deletes its test cases — they become ungrouped. */
export async function deleteGroup(projectId: string, apId: string, id: string): Promise<boolean> {
  const rs = await db!.batch([
    { sql: `UPDATE autosim_test_cases SET group_id=NULL, updated_at=? WHERE project_id=? AND autosim_project_id=? AND group_id=?`, args: [now(), projectId, apId, id] },
    { sql: `DELETE FROM autosim_test_case_groups WHERE project_id=? AND autosim_project_id=? AND id=?`, args: [projectId, apId, id] },
  ], "write")
  if (rs[1].rowsAffected) await touchProject(projectId, apId)
  return rs[1].rowsAffected > 0
}

// ── Test cases ──────────────────────────────────────────────────────────────────────────────────

const TC_SELECT = `SELECT t.*, (SELECT COUNT(*) FROM trails r WHERE r.project_id=t.project_id AND r.test_case_id=t.id AND r.status!='archived') AS trail_count FROM autosim_test_cases t`

export async function getTestCase(projectId: string, id: string): Promise<TestCase | null> {
  const r = await db!.execute({ sql: `${TC_SELECT} WHERE t.project_id=? AND t.id=?`, args: [projectId, id] })
  return r.rows.length ? rowToTestCase(r.rows[0]) : null
}

export async function createTestCase(projectId: string, apId: string, input: { name: string; description?: string; groupId?: string | null; status?: TestCaseStatus; testAccountId?: string | null; startUrl?: string | null; createdBy?: string }): Promise<string> {
  const id = "atc_" + crypto.randomUUID(); const t = now()
  await db!.execute({
    sql: `INSERT INTO autosim_test_cases (id,project_id,autosim_project_id,group_id,name,description,status,test_account_id,start_url,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, projectId, apId, input.groupId ?? null, input.name, input.description ?? "", input.status ?? "active", input.testAccountId ?? null, input.startUrl ?? null, input.createdBy ?? null, t, t],
  })
  await touchProject(projectId, apId)
  return id
}

/** groupId: undefined = leave as-is, null = ungroup. Moving groups never touches linked Trails. */
export async function updateTestCase(projectId: string, apId: string, id: string, patch: { name?: string; description?: string; status?: TestCaseStatus; groupId?: string | null; testAccountId?: string | null; startUrl?: string | null }): Promise<boolean> {
  const sets = ["updated_at=?"]; const args: any[] = [now()]
  if (patch.name !== undefined) { sets.push("name=?"); args.push(patch.name) }
  if (patch.description !== undefined) { sets.push("description=?"); args.push(patch.description) }
  if (patch.status !== undefined) { sets.push("status=?"); args.push(patch.status) }
  if (patch.groupId !== undefined) { sets.push("group_id=?"); args.push(patch.groupId) }
  if (patch.testAccountId !== undefined) { sets.push("test_account_id=?"); args.push(patch.testAccountId) }
  if (patch.startUrl !== undefined) { sets.push("start_url=?"); args.push(patch.startUrl) }
  const r = await db!.execute({ sql: `UPDATE autosim_test_cases SET ${sets.join(",")} WHERE project_id=? AND autosim_project_id=? AND id=?`, args: [...args, projectId, apId, id] })
  if (r.rowsAffected) await touchProject(projectId, apId)
  return r.rowsAffected > 0
}

/** Deleting a test case unlinks its Trails (they stay in the AutoSim project, without a test case). */
export async function deleteTestCase(projectId: string, apId: string, id: string): Promise<boolean> {
  const rs = await db!.batch([
    { sql: `UPDATE trails SET test_case_id=NULL WHERE project_id=? AND test_case_id=?`, args: [projectId, id] },
    { sql: `DELETE FROM autosim_test_cases WHERE project_id=? AND autosim_project_id=? AND id=?`, args: [projectId, apId, id] },
  ], "write")
  if (rs[1].rowsAffected) await touchProject(projectId, apId)
  return rs[1].rowsAffected > 0
}

// ── Detail + Trail links ────────────────────────────────────────────────────────────────────────

export async function autosimProjectDetail(projectId: string, apId: string) {
  const project = await getAutosimProject(projectId, apId)
  if (!project) return null
  const [g, t, tr, un] = await db!.batch([
    { sql: `SELECT * FROM autosim_test_case_groups WHERE project_id=? AND autosim_project_id=? ORDER BY name`, args: [projectId, apId] },
    { sql: `${TC_SELECT} WHERE t.project_id=? AND t.autosim_project_id=? ORDER BY t.updated_at DESC`, args: [projectId, apId] },
    { sql: `SELECT id,name,status,base_url,test_case_id,updated_at FROM trails WHERE project_id=? AND autosim_project_id=? AND status!='archived' ORDER BY updated_at DESC`, args: [projectId, apId] },
    // Pre-existing / unassigned AutoSims in this Klavity project — offered in the "add existing" picker.
    { sql: `SELECT id,name,status,base_url,test_case_id,updated_at FROM trails WHERE project_id=? AND autosim_project_id IS NULL AND status!='archived' ORDER BY updated_at DESC LIMIT 200`, args: [projectId] },
  ], "read")
  return {
    project,
    groups: g.rows.map(rowToGroup),
    testCases: t.rows.map(rowToTestCase),
    trails: tr.rows.map(rowToTrail),
    unassignedTrails: un.rows.map(rowToTrail),
  }
}

/** Link (testCase given) or unlink (null) a Trail. The AutoSim project is DERIVED from the test case,
 *  so a Trail can never point at a test case belonging to another AutoSim project. */
export async function setTrailTestCase(projectId: string, trailId: string, tc: TestCase | null): Promise<boolean> {
  const r = await db!.execute({
    sql: `UPDATE trails SET test_case_id=?, autosim_project_id=COALESCE(?, autosim_project_id) WHERE project_id=? AND id=?`,
    args: [tc?.id ?? null, tc?.autosimProjectId ?? null, projectId, trailId],
  })
  return r.rowsAffected > 0
}

/** Unlink a Trail from a specific test case (no-op → false if it isn't linked to that test case). */
export async function unlinkTrail(projectId: string, trailId: string, testCaseId: string): Promise<boolean> {
  const r = await db!.execute({ sql: `UPDATE trails SET test_case_id=NULL WHERE project_id=? AND id=? AND test_case_id=?`, args: [projectId, trailId, testCaseId] })
  return r.rowsAffected > 0
}

/** Called once an author session SUCCESSFULLY crystallizes its Trail: stamp the session's test case
 *  (if any) onto it. A test case holds ONE AutoSim, so a re-recording archives the previous one —
 *  only now, after the new script exists (a failed re-record leaves the old AutoSim untouched).
 *  Archived Trails keep test_case_id, so the test case's execution history spans re-recordings. */
export async function stampTrailFromAuthorSession(projectId: string, sessionId: string, trailId: string): Promise<void> {
  const r = await db!.execute({
    sql: `SELECT t.id, t.autosim_project_id FROM author_sessions a JOIN autosim_test_cases t ON t.id=a.test_case_id AND t.project_id=a.project_id WHERE a.project_id=? AND a.id=?`,
    args: [projectId, sessionId],
  })
  if (!r.rows.length) return
  const tcId = s(r.rows[0].id), apId = s(r.rows[0].autosim_project_id)
  await db!.batch([
    { sql: `UPDATE trails SET status='archived', updated_at=? WHERE project_id=? AND test_case_id=? AND id!=? AND status!='archived'`, args: [now(), projectId, tcId, trailId] },
    { sql: `UPDATE trails SET test_case_id=?, autosim_project_id=? WHERE project_id=? AND id=?`, args: [tcId, apId, projectId, trailId] },
  ], "write")
}

/** The test case's current (non-archived) AutoSim, if any. */
export async function currentTrailId(projectId: string, testCaseId: string): Promise<string | null> {
  const r = await db!.execute({
    sql: `SELECT id FROM trails WHERE project_id=? AND test_case_id=? AND status!='archived' ORDER BY updated_at DESC LIMIT 1`,
    args: [projectId, testCaseId],
  })
  return r.rows.length ? s(r.rows[0].id) : null
}

export interface TestCaseRun {
  runId: string; trailId: string; trailName: string; current: boolean
  trigger: string; status: string; startedAt: number; durationMs: number | null
  /** 0 = pure deterministic replay of the recorded script; >0 = AI self-heal/vision was needed. */
  aiCalls: number
  steps: number; passed: number; failed: number; healed: number; skipped: number; findings: number
}

/** Execution history of a test case — every Walk of every AutoSim it has had (re-recordings included). */
export async function testCaseRuns(projectId: string, testCaseId: string, limit = 50): Promise<TestCaseRun[]> {
  const r = await db!.execute({
    sql: `SELECT tr.id, tr.trail_id, t.name AS trail_name, t.status AS trail_status, tr.trigger, tr.status, tr.llm_calls,
                 tr.started_at, tr.finished_at,
                 COUNT(rs.id) AS steps,
                 COALESCE(SUM(rs.verdict='green'),0) AS passed, COALESCE(SUM(rs.verdict='red'),0) AS failed,
                 COALESCE(SUM(rs.healed=1),0) AS healed, COALESCE(SUM(rs.verdict='skip'),0) AS skipped,
                 (SELECT COUNT(*) FROM findings f WHERE f.project_id=tr.project_id AND f.run_id=tr.id) AS findings
          FROM trail_runs tr
          JOIN trails t ON t.id=tr.trail_id AND t.project_id=tr.project_id
          LEFT JOIN run_steps rs ON rs.run_id=tr.id AND rs.project_id=tr.project_id
          WHERE tr.project_id=? AND t.test_case_id=?
          GROUP BY tr.id ORDER BY tr.started_at DESC LIMIT ?`,
    args: [projectId, testCaseId, limit],
  })
  return r.rows.map((x: any) => ({
    runId: s(x.id), trailId: s(x.trail_id), trailName: s(x.trail_name), current: x.trail_status !== "archived",
    trigger: s(x.trigger), status: s(x.status), startedAt: Number(x.started_at),
    durationMs: x.finished_at != null ? Number(x.finished_at) - Number(x.started_at) : null,
    aiCalls: Number(x.llm_calls || 0), steps: Number(x.steps), passed: Number(x.passed), failed: Number(x.failed),
    healed: Number(x.healed), skipped: Number(x.skipped), findings: Number(x.findings),
  }))
}

export interface RunStepRow {
  idx: number; action: string; value: string | null; target: string | null; checkpoint: string | null
  /** null = not reached yet (run still going, or it stopped before this step). */
  verdict: string | null; healed: boolean; diagnosis: string | null
}

/** A run's step-by-step outcome: every recorded step of the AutoSim it ran, with that run's verdict
 *  per step. Scoped by project AND test case, so a run id from elsewhere returns null. Values are the
 *  recorded ones — credentials are stored as {{cred:<name>:<field>}} references, never secrets. */
export async function testCaseRunSteps(projectId: string, testCaseId: string, runId: string): Promise<RunStepRow[] | null> {
  const own = await db!.execute({
    sql: `SELECT 1 FROM trail_runs tr JOIN trails t ON t.id=tr.trail_id AND t.project_id=tr.project_id WHERE tr.project_id=? AND tr.id=? AND t.test_case_id=?`,
    args: [projectId, runId, testCaseId],
  })
  if (!own.rows.length) return null
  const r = await db!.execute({
    sql: `SELECT ts.idx, ts.action, ts.action_value, ts.target_json, ts.checkpoint_json, rs.verdict, rs.healed, rs.diagnosis
          FROM trail_runs tr
          JOIN trail_steps ts ON ts.trail_id=tr.trail_id AND ts.project_id=tr.project_id
          LEFT JOIN run_steps rs ON rs.run_id=tr.id AND rs.step_id=ts.id AND rs.project_id=tr.project_id
          WHERE tr.project_id=? AND tr.id=? ORDER BY ts.idx`,
    args: [projectId, runId],
  })
  const parse = (j: any) => { try { return j ? JSON.parse(String(j)) : null } catch { return null } }
  return r.rows.map((x: any) => {
    const t = parse(x.target_json), c = parse(x.checkpoint_json)
    return {
      idx: Number(x.idx), action: s(x.action), value: x.action_value == null ? null : s(x.action_value),
      target: t ? (t.accessibleName || t.text || t.testId || (t.inputType ? t.inputType + " field" : null) || t.role || null) : null,
      checkpoint: c ? (c.description || null) : null,
      verdict: x.verdict == null ? null : s(x.verdict), healed: Number(x.healed) === 1, diagnosis: x.diagnosis == null ? null : s(x.diagnosis),
    }
  })
}

/** The Playwright script a Trail replays (from its steps + cached selectors). Credentials appear as
 *  env-var references (KLAV_CRED_…), never as values. */
export async function trailPlaywrightScript(projectId: string, trailId: string): Promise<string | null> {
  const { getTrail, listTrailSteps } = await import("./trails")
  const { generatePlaywright } = await import("./trails-codegen")
  const trail = await getTrail(projectId, trailId)
  if (!trail) return null
  const steps = await listTrailSteps(projectId, trailId)
  const lc = await db!.execute({ sql: `SELECT step_id, resolved_selector FROM locator_cache WHERE project_id=? AND trail_id=?`, args: [projectId, trailId] })
  const selectors: Record<string, string> = {}
  for (const row of lc.rows as any[]) selectors[s(row.step_id)] = s(row.resolved_selector)
  return generatePlaywright(trail, steps, selectors)
}

/** Names of test cases that execute with this credential (blocks deleting it out from under them). */
export async function testCasesUsingAccount(projectId: string, testAccountId: string): Promise<string[]> {
  const r = await db!.execute({ sql: `SELECT name FROM autosim_test_cases WHERE project_id=? AND test_account_id=? ORDER BY name`, args: [projectId, testAccountId] })
  return r.rows.map((x: any) => s(x.name))
}
