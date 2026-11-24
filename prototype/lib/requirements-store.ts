// F-01 DEV-02: requirements documents, their requirements and generated scenarios, stored per AutoSim
// project. Links: requirement → document (doc_id + section/quote = source reference); scenario →
// requirement(s) (requirement_ids_json) → test case (test_case_id, set when the user creates it); the
// test case also carries requirement_id (its primary requirement). Validation results live on
// requirement-run items (lib/requirement-runs.ts) and are rolled up per requirement here.
// Every statement is scoped by the Klavity project_id (tenant isolation).
import { db } from "./db"
import * as asp from "./autosim-projects"
import type { ExtractResult } from "./requirements-extract"

const s = (v: any) => (v == null ? "" : String(v))
const pj = <T>(v: any, d: T): T => { try { return v ? JSON.parse(String(v)) : d } catch { return d } }

export type ValidationStatus = "passed" | "failed" | "blocked" | "error" | "cancelled" | "queued" | "running"
export type RequirementStatus = "passed" | "failed" | "blocked" | "partial" | "not_run" | "no_tests"

export interface RequirementDoc {
  id: string; autosimProjectId: string; filename: string; contentType: string | null; sizeBytes: number
  hasSource: boolean; title: string; startUrl: string | null
  features: string[]; workflows: string[]; issues: string[]; clarifications: string[]
  createdBy: string | null; createdAt: number
}
export interface Requirement {
  id: string; docId: string; ref: string; title: string; description: string; type: string
  feature: string; section: string; quote: string; preconditions: string; expectedResult: string
  ambiguous: boolean; clarification: string
}
export interface ReqScenario {
  id: string; docId: string; ref: string; title: string; requirementIds: string[]
  preconditions: string; steps: string; expectedResult: string; startUrl: string | null
  needsLogin: boolean; missing: string[]; status: "ready" | "needs_info"; testCaseId: string | null
}
/** Latest finished validation of one test case (from a requirement run item). */
export interface LatestValidation {
  itemId: string; runId: string; testCaseId: string; status: ValidationStatus; mode: string | null
  observed: string; reason: string; evidence: any; finishedAt: number | null
}

const rowToDoc = (r: any): RequirementDoc => ({
  id: s(r.id), autosimProjectId: s(r.autosim_project_id), filename: s(r.filename), contentType: r.content_type ? s(r.content_type) : null,
  sizeBytes: Number(r.size_bytes || 0), hasSource: !!r.source_key, title: s(r.title), startUrl: r.start_url ? s(r.start_url) : null,
  features: pj(r.features_json, []), workflows: pj(r.workflows_json, []), issues: pj(r.issues_json, []), clarifications: pj(r.clarifications_json, []),
  createdBy: r.created_by ? s(r.created_by) : null, createdAt: Number(r.created_at),
})
const rowToReq = (r: any): Requirement => ({
  id: s(r.id), docId: s(r.doc_id), ref: s(r.ref), title: s(r.title), description: s(r.description), type: s(r.type),
  feature: s(r.feature), section: s(r.section), quote: s(r.quote), preconditions: s(r.preconditions), expectedResult: s(r.expected_result),
  ambiguous: !!Number(r.ambiguous), clarification: s(r.clarification),
})
const rowToScenario = (r: any): ReqScenario => ({
  id: s(r.id), docId: s(r.doc_id), ref: s(r.ref), title: s(r.title), requirementIds: pj(r.requirement_ids_json, []),
  preconditions: s(r.preconditions), steps: s(r.steps), expectedResult: s(r.expected_result), startUrl: r.start_url ? s(r.start_url) : null,
  needsLogin: !!Number(r.needs_login), missing: pj(r.missing_json, []), status: r.status === "needs_info" ? "needs_info" : "ready",
  testCaseId: r.test_case_id ? s(r.test_case_id) : null,
})
export const rowToLatest = (r: any): LatestValidation => ({
  itemId: s(r.id), runId: s(r.run_id), testCaseId: s(r.test_case_id), status: s(r.status) as ValidationStatus, mode: r.mode ? s(r.mode) : null,
  observed: s(r.observed), reason: s(r.reason), evidence: pj(r.evidence_json, null), finishedAt: r.finished_at == null ? null : Number(r.finished_at),
})

/** DEV-02: persist one extraction. Returns the new doc id plus REQ-ref → id and TS-ref → id maps. */
export async function saveExtraction(projectId: string, apId: string, input: {
  filename: string; contentType: string | null; sizeBytes: number; sourceKey: string | null; result: ExtractResult; createdBy: string | null
}): Promise<{ docId: string; requirementIds: Record<string, string>; scenarioIds: Record<string, string> }> {
  const r = input.result, t = Date.now(), docId = "areqdoc_" + crypto.randomUUID()
  const requirementIds: Record<string, string> = {}, scenarioIds: Record<string, string> = {}
  const stmts: Array<{ sql: string; args: any[] }> = [{
    sql: `INSERT INTO autosim_requirement_docs (id,project_id,autosim_project_id,filename,content_type,size_bytes,source_key,title,start_url,features_json,workflows_json,issues_json,clarifications_json,created_by,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [docId, projectId, apId, input.filename, input.contentType, input.sizeBytes, input.sourceKey, r.documentTitle, r.startUrl,
      JSON.stringify(r.features), JSON.stringify(r.workflows), JSON.stringify(r.documentIssues), JSON.stringify(r.clarifications), input.createdBy, t],
  }]
  r.requirements.forEach((q, i) => {
    const id = "areq_" + crypto.randomUUID(); requirementIds[q.ref] = id
    stmts.push({
      sql: `INSERT INTO autosim_requirements (id,project_id,doc_id,autosim_project_id,ref,position,title,description,type,feature,section,quote,preconditions,expected_result,ambiguous,clarification,created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [id, projectId, docId, apId, q.ref, i, q.title, q.description, q.type, q.feature, q.section, q.quote, q.preconditions, q.expectedResult, q.ambiguous ? 1 : 0, q.clarification, t],
    })
  })
  r.scenarios.forEach((sc, i) => {
    const id = "areqsc_" + crypto.randomUUID(); scenarioIds[sc.id] = id
    stmts.push({
      sql: `INSERT INTO autosim_req_scenarios (id,project_id,doc_id,ref,position,title,requirement_ids_json,preconditions,steps,expected_result,start_url,needs_login,missing_json,status,created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [id, projectId, docId, sc.id, i, sc.title, JSON.stringify(sc.requirementRefs.map(ref => requirementIds[ref]).filter(Boolean)),
        sc.preconditions, sc.steps, sc.expectedResult, sc.startUrl, sc.needsLogin ? 1 : 0, JSON.stringify(sc.missing), sc.status, t],
    })
  })
  await db!.batch(stmts, "write")
  return { docId, requirementIds, scenarioIds }
}

export async function getDoc(projectId: string, apId: string, docId: string): Promise<RequirementDoc | null> {
  const r = await db!.execute({ sql: `SELECT * FROM autosim_requirement_docs WHERE project_id=? AND autosim_project_id=? AND id=?`, args: [projectId, apId, docId] })
  return r.rows.length ? rowToDoc(r.rows[0]) : null
}
export async function docSourceKey(projectId: string, apId: string, docId: string): Promise<{ key: string; filename: string; contentType: string | null } | null> {
  const r = await db!.execute({ sql: `SELECT source_key, filename, content_type FROM autosim_requirement_docs WHERE project_id=? AND autosim_project_id=? AND id=?`, args: [projectId, apId, docId] })
  const x: any = r.rows[0]
  return x && x.source_key ? { key: s(x.source_key), filename: s(x.filename), contentType: x.content_type ? s(x.content_type) : null } : null
}

export async function deleteDoc(projectId: string, apId: string, docId: string): Promise<boolean> {
  const rs = await db!.batch([
    // Test cases created from it stay (they are real test cases now) but lose the requirement link.
    { sql: `UPDATE autosim_test_cases SET requirement_id=NULL WHERE project_id=? AND requirement_id IN (SELECT id FROM autosim_requirements WHERE project_id=? AND doc_id=?)`, args: [projectId, projectId, docId] },
    { sql: `DELETE FROM autosim_req_scenarios WHERE project_id=? AND doc_id=?`, args: [projectId, docId] },
    { sql: `DELETE FROM autosim_requirements WHERE project_id=? AND doc_id=?`, args: [projectId, docId] },
    { sql: `UPDATE autosim_requirement_runs SET doc_id=NULL WHERE project_id=? AND doc_id=?`, args: [projectId, docId] },
    { sql: `DELETE FROM autosim_requirement_docs WHERE project_id=? AND autosim_project_id=? AND id=?`, args: [projectId, apId, docId] },
  ], "write")
  return rs[rs.length - 1].rowsAffected > 0
}

/** Latest FINISHED validation per test case (any requirement run). */
export async function latestValidations(projectId: string, testCaseIds: string[]): Promise<Map<string, LatestValidation>> {
  const out = new Map<string, LatestValidation>()
  if (!testCaseIds.length) return out
  const ph = testCaseIds.map(() => "?").join(",")
  const r = await db!.execute({
    sql: `SELECT * FROM autosim_requirement_run_items WHERE project_id=? AND test_case_id IN (${ph})
            AND status IN ('passed','failed','blocked','error') ORDER BY finished_at DESC`,
    args: [projectId, ...testCaseIds],
  })
  for (const row of r.rows) { const v = rowToLatest(row); if (!out.has(v.testCaseId)) out.set(v.testCaseId, v) }
  return out
}

/** Roll the latest results of a requirement's test cases up into one status (DEV-05 per-requirement report). */
export function rollupRequirementStatus(results: Array<LatestValidation | null>): RequirementStatus {
  if (!results.length) return "no_tests"
  const st = results.map(r => r?.status ?? null)
  if (st.some(x => x === "failed")) return "failed"
  if (st.every(x => x === "passed")) return "passed"
  if (st.every(x => x === null)) return "not_run"
  if (st.some(x => x === "blocked" || x === "error") && !st.some(x => x === "passed")) return "blocked"
  return "partial"
}

export async function listDocs(projectId: string, apId: string) {
  const r = await db!.execute({
    sql: `SELECT d.*,
            (SELECT COUNT(*) FROM autosim_requirements q WHERE q.project_id=d.project_id AND q.doc_id=d.id) AS req_count,
            (SELECT COUNT(*) FROM autosim_req_scenarios c WHERE c.project_id=d.project_id AND c.doc_id=d.id) AS sc_count,
            (SELECT COUNT(*) FROM autosim_req_scenarios c WHERE c.project_id=d.project_id AND c.doc_id=d.id AND c.test_case_id IS NOT NULL) AS tc_count
          FROM autosim_requirement_docs d WHERE d.project_id=? AND d.autosim_project_id=? ORDER BY d.created_at DESC`,
    args: [projectId, apId],
  })
  const docs = []
  for (const row of r.rows) {
    const detail = await docDetail(projectId, apId, s((row as any).id))
    const tally: Record<string, number> = {}
    for (const q of detail?.requirements ?? []) tally[q.status] = (tally[q.status] || 0) + 1
    docs.push({ ...rowToDoc(row), requirementCount: Number((row as any).req_count), scenarioCount: Number((row as any).sc_count), testCaseCount: Number((row as any).tc_count), statusCounts: tally })
  }
  return docs
}

/** Document + requirements (each with linked scenarios/test cases, their latest validation and the
 *  rolled-up requirement status) + scenarios. */
export async function docDetail(projectId: string, apId: string, docId: string) {
  const doc = await getDoc(projectId, apId, docId)
  if (!doc) return null
  const [rq, sc] = await db!.batch([
    { sql: `SELECT * FROM autosim_requirements WHERE project_id=? AND doc_id=? ORDER BY position`, args: [projectId, docId] },
    { sql: `SELECT * FROM autosim_req_scenarios WHERE project_id=? AND doc_id=? ORDER BY position`, args: [projectId, docId] },
  ], "read")
  const requirements = rq.rows.map(rowToReq), scenarios = sc.rows.map(rowToScenario)
  // Test cases linked to this doc's requirements: via the scenario they came from or their requirement_id.
  const reqIds = requirements.map(q => q.id)
  const tcRows = reqIds.length ? (await db!.execute({
    sql: `SELECT id, name, requirement_id FROM autosim_test_cases WHERE project_id=? AND autosim_project_id=? AND requirement_id IN (${reqIds.map(() => "?").join(",")})`,
    args: [projectId, apId, ...reqIds],
  })).rows : []
  const tcName = new Map<string, string>(), tcByReq = new Map<string, Set<string>>()
  const link = (reqId: string, tcId: string) => { if (!tcByReq.has(reqId)) tcByReq.set(reqId, new Set()); tcByReq.get(reqId)!.add(tcId) }
  for (const t of tcRows as any[]) { tcName.set(s(t.id), s(t.name)); link(s(t.requirement_id), s(t.id)) }
  const scTcIds = scenarios.map(x => x.testCaseId).filter((x): x is string => !!x)
  if (scTcIds.length) {
    const rows = (await db!.execute({ sql: `SELECT id, name FROM autosim_test_cases WHERE project_id=? AND id IN (${scTcIds.map(() => "?").join(",")})`, args: [projectId, ...scTcIds] })).rows
    for (const t of rows as any[]) tcName.set(s(t.id), s(t.name))
  }
  for (const x of scenarios) if (x.testCaseId && tcName.has(x.testCaseId)) for (const rid of x.requirementIds) link(rid, x.testCaseId)
  const latest = await latestValidations(projectId, [...tcName.keys()])
  return {
    doc,
    requirements: requirements.map(q => {
      const tcs = [...(tcByReq.get(q.id) ?? [])].map(id => ({ id, name: tcName.get(id) || "", latest: latest.get(id) ?? null }))
      return { ...q, scenarioRefs: scenarios.filter(x => x.requirementIds.includes(q.id)).map(x => x.ref), testCases: tcs, status: rollupRequirementStatus(tcs.map(t => t.latest)) }
    }),
    scenarios: scenarios.map(x => ({ ...x, testCaseName: x.testCaseId ? tcName.get(x.testCaseId) ?? null : null })),
  }
}

/** DEV-02/03: create test cases from selected scenarios (pre-filled, with the user's completed details).
 *  Each test case is linked to its scenario and to the scenario's first requirement. */
export async function createTestCasesFromScenarios(projectId: string, apId: string, docId: string, items: Array<{
  scenarioId: string; name: string; steps: string; preconditions: string; expectedResult: string; startUrl: string
}>, shared: { testAccountId: string | null; groupId: string | null; status: asp.TestCaseStatus }, createdBy: string) {
  const created: Array<{ scenarioId: string; testCaseId: string }> = [], failed: Array<{ scenarioId: string; error: string }> = []
  for (const it of items) {
    const r = await db!.execute({ sql: `SELECT * FROM autosim_req_scenarios WHERE project_id=? AND doc_id=? AND id=?`, args: [projectId, docId, it.scenarioId] })
    if (!r.rows.length) { failed.push({ scenarioId: it.scenarioId, error: "Unknown scenario" }); continue }
    const sc = rowToScenario(r.rows[0])
    if (sc.testCaseId && await asp.getTestCase(projectId, sc.testCaseId)) { failed.push({ scenarioId: it.scenarioId, error: "A test case was already created from this scenario." }); continue }
    try {
      const tcId = await asp.createTestCase(projectId, apId, {
        name: it.name, description: it.steps, preconditions: it.preconditions, expectedResult: it.expectedResult,
        startUrl: it.startUrl, testAccountId: shared.testAccountId, groupId: shared.groupId, status: shared.status,
        requirementId: sc.requirementIds[0] ?? null, createdBy,
      })
      await db!.execute({ sql: `UPDATE autosim_req_scenarios SET test_case_id=? WHERE project_id=? AND id=?`, args: [tcId, projectId, sc.id] })
      created.push({ scenarioId: sc.id, testCaseId: tcId })
    } catch (e: any) { failed.push({ scenarioId: it.scenarioId, error: String(e?.message || e).slice(0, 200) }) }
  }
  return { created, failed }
}

/** The requirement a test case verifies (for the test case page), with its document. */
export async function requirementForTestCase(projectId: string, tc: asp.TestCase) {
  if (!tc.requirementId) return null
  const r = await db!.execute({
    sql: `SELECT q.*, d.filename AS doc_filename FROM autosim_requirements q JOIN autosim_requirement_docs d ON d.id=q.doc_id AND d.project_id=q.project_id
          WHERE q.project_id=? AND q.id=?`,
    args: [projectId, tc.requirementId],
  })
  if (!r.rows.length) return null
  return { ...rowToReq(r.rows[0]), docFilename: s((r.rows[0] as any).doc_filename) }
}
