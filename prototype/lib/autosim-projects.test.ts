// KD-2255: AutoSim Projects hierarchy — deletion rules, tenant isolation, author-session stamping.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-asp-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.alloc(32, 7).toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
let db: any
beforeAll(async () => { db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const asp = await import("./autosim-projects")
const { createTrail } = await import("./trails")
const { createTestAccount, listTestAccounts } = await import("./test-accounts")
const { createAuthorSession, updateAuthorSession } = await import("./trails-author")

const P = "proj_a", OTHER = "proj_b"
const trailRow = async (id: string) => (await db.execute({ sql: "SELECT autosim_project_id, test_case_id FROM trails WHERE id=?", args: [id] })).rows[0]

test("hierarchy counts, group delete ungroups, test case delete unlinks, project delete never deletes trails/creds", async () => {
  const ap = await asp.createAutosimProject(P, { name: "Website", description: "d" })
  const g = await asp.createGroup(P, ap, { name: "Login" })
  const tc = await asp.createTestCase(P, ap, { name: "Valid login", groupId: g })
  const trail = await createTrail(P, { name: "t1", baseUrl: "https://x.test" })
  await asp.setTrailTestCase(P, trail, await asp.getTestCase(P, tc))
  await createTestAccount(P, { name: "admin", loginEmail: "a@x.test", password: "pw", autosimProjectId: ap })

  let p = (await asp.getAutosimProject(P, ap))!
  expect([p.groupCount, p.testCaseCount, p.trailCount]).toEqual([1, 1, 1])
  expect((await asp.getTestCase(P, tc))!.trailCount).toBe(1)

  // move test case out of its group → AutoSim link intact
  await asp.updateTestCase(P, ap, tc, { groupId: null })
  expect((await trailRow(trail)).test_case_id).toBe(tc)

  // group delete → test case survives, ungrouped
  await asp.updateTestCase(P, ap, tc, { groupId: g })
  expect(await asp.deleteGroup(P, ap, g)).toBe(true)
  expect((await asp.getTestCase(P, tc))!.groupId).toBeNull()

  // test case delete → trail kept, unlinked from test case, still in project
  expect(await asp.deleteTestCase(P, ap, tc)).toBe(true)
  expect(await trailRow(trail)).toMatchObject({ test_case_id: null, autosim_project_id: ap })

  // project delete → trail + credential survive, unlinked
  expect(await asp.deleteAutosimProject(P, ap)).toBe(true)
  expect(await trailRow(trail)).toMatchObject({ test_case_id: null, autosim_project_id: null })
  const accs = await listTestAccounts(P)
  expect(accs.find((a) => a.name === "admin")?.autosimProjectId).toBeNull()
})

test("tenant isolation: other Klavity project cannot read or mutate", async () => {
  const ap = await asp.createAutosimProject(P, { name: "Isolated" })
  const tc = await asp.createTestCase(P, ap, { name: "tc" })
  expect(await asp.getAutosimProject(OTHER, ap)).toBeNull()
  expect(await asp.getTestCase(OTHER, tc)).toBeNull()
  expect(await asp.updateAutosimProject(OTHER, ap, { name: "pwned" })).toBe(false)
  expect(await asp.deleteAutosimProject(OTHER, ap)).toBe(false)
  expect(await asp.deleteTestCase(OTHER, ap, tc)).toBe(false)
  expect((await asp.getAutosimProject(P, ap))!.name).toBe("Isolated")
})

test("author session with a test case stamps the crystallized trail (and resumes inherit it)", async () => {
  const ap = await asp.createAutosimProject(P, { name: "Authoring" })
  const tc = await asp.createTestCase(P, ap, { name: "Checkout" })
  const parent = await createAuthorSession(P, { name: "a", objective: "do a thing", baseUrl: "https://x.test", testCaseId: tc })
  const child = await createAuthorSession(P, { name: "a", objective: "do a thing", baseUrl: "https://x.test" }, parent)
  const trail = await createTrail(P, { name: "crystallized", baseUrl: "https://x.test" })
  await updateAuthorSession(P, child, { trailId: trail, status: "crystallized" })
  expect(await trailRow(trail)).toMatchObject({ test_case_id: tc, autosim_project_id: ap })

  // a session without a test case leaves the trail unassigned (existing workflow unchanged)
  const plain = await createAuthorSession(P, { name: "b", objective: "do a thing", baseUrl: "https://x.test" })
  const t2 = await createTrail(P, { name: "plain", baseUrl: "https://x.test" })
  await updateAuthorSession(P, plain, { trailId: t2, status: "crystallized" })
  expect(await trailRow(t2)).toMatchObject({ test_case_id: null, autosim_project_id: null })
})

test("test case credential choice round-trips and is reported by testCasesUsingAccount", async () => {
  const ap = await asp.createAutosimProject(P, { name: "Creds choice" })
  const tc = await asp.createTestCase(P, ap, { name: "Login", testAccountId: "tacc_x" })
  expect((await asp.getTestCase(P, tc))!.testAccountId).toBe("tacc_x")
  expect(await asp.testCasesUsingAccount(P, "tacc_x")).toEqual(["Login"])
  expect(await asp.testCasesUsingAccount(OTHER, "tacc_x")).toEqual([])
  await asp.updateTestCase(P, ap, tc, { testAccountId: null })
  expect((await asp.getTestCase(P, tc))!.testAccountId).toBeNull()
})

test("one AutoSim per test case: successful re-record archives the old one, stalled drafts never replace it, history spans both", async () => {
  const ap = await asp.createAutosimProject(P, { name: "Rerecord" })
  const tc = await asp.createTestCase(P, ap, { name: "Login" })
  const sess1 = await createAuthorSession(P, { name: "a", objective: "log in and check", baseUrl: "https://x.test", testCaseId: tc })
  const v1 = await createTrail(P, { name: "v1", baseUrl: "https://x.test" })
  await updateAuthorSession(P, sess1, { trailId: v1, status: "crystallized" })
  expect(await asp.currentTrailId(P, tc)).toBe(v1)
  // a run of v1
  await db.execute({ sql: "INSERT INTO trail_runs (id,trail_id,project_id,trigger,status,llm_calls,started_at,finished_at) VALUES ('run_v1',?,?,'manual','red',0,1000,5000)", args: [v1, P] })
  for (const [i, v] of [["a", "green"], ["b", "red"]]) await db.execute({ sql: "INSERT INTO run_steps (id,run_id,trail_id,step_id,project_id,idx,verdict,healed,created_at) VALUES (?, 'run_v1', ?, ?, ?, 0, ?, 0, 1)", args: ["rs_" + i, v1, "st_" + i, P, v] })

  // a STALLED re-record (partial draft) does not replace v1
  const sess2 = await createAuthorSession(P, { name: "a", objective: "log in and check", baseUrl: "https://x.test", testCaseId: tc })
  const partial = await createTrail(P, { name: "partial", baseUrl: "https://x.test" })
  await updateAuthorSession(P, sess2, { trailId: partial, status: "stalled" })
  expect(await asp.currentTrailId(P, tc)).toBe(v1)

  // a SUCCESSFUL re-record replaces it; v1 is archived but its runs stay in the test case history
  const sess3 = await createAuthorSession(P, { name: "a", objective: "log in and check", baseUrl: "https://x.test", testCaseId: tc })
  const v2 = await createTrail(P, { name: "v2", baseUrl: "https://x.test" })
  await updateAuthorSession(P, sess3, { trailId: v2, status: "crystallized" })
  expect(await asp.currentTrailId(P, tc)).toBe(v2)
  expect((await db.execute({ sql: "SELECT status FROM trails WHERE id=?", args: [v1] })).rows[0].status).toBe("archived")
  const runs = await asp.testCaseRuns(P, tc)
  expect(runs).toHaveLength(1)
  expect(runs[0]).toMatchObject({ runId: "run_v1", current: false, status: "red", steps: 2, passed: 1, failed: 1, durationMs: 4000, aiCalls: 0 })
  expect(await asp.testCaseRuns(OTHER, tc)).toEqual([])
})

test("duplicate project name in the same Klavity project is rejected, allowed across projects", async () => {
  await asp.createAutosimProject(P, { name: "Dup" })
  await expect(asp.createAutosimProject(P, { name: "Dup" })).rejects.toThrow(/UNIQUE/i)
  await asp.createAutosimProject(OTHER, { name: "Dup" })
})
