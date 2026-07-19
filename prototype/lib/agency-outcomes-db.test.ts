// KLAVITYKLA-310 — Agency per-client OUTCOMES rollup (read-only). Verifies agencyClientOutcomes()
// returns, per project in a time window: reports found (all feedback), regressions caught
// (findings kind='regression'), and guarded-flow walk verdicts (green/amber/red/total), and that
// it honours the window and tenant/project boundaries. Uses the isolated-DB harness.
import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { agencyClientOutcomes } from "./db"

const { getClient } = useIsolatedDb("klav-agency-outcomes")

let seq = 0
async function addProject(): Promise<string> {
  const client = getClient()
  const n = ++seq
  const pid = `proj_ao_${n}`
  const now = Date.now()
  await client.execute({ sql: "INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", args: [pid, `acct_ao_${n}`, `P${n}`, now, now] })
  return pid
}

async function addFeedback(pid: string, at: number): Promise<void> {
  await getClient().execute({ sql: "INSERT INTO feedback (id, project_id, observation, created_at) VALUES (?, ?, ?, ?)", args: [`fb_${++seq}`, pid, "obs", at] })
}

async function addFinding(pid: string, kind: string, at: number): Promise<void> {
  await getClient().execute({
    sql: "INSERT INTO findings (id, project_id, run_id, trail_id, kind, title, dedup_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [`fn_${++seq}`, pid, "run_x", "tr_x", kind, "t", `dk_${seq}`, at, at],
  })
}

async function addWalk(pid: string, status: string, at: number): Promise<void> {
  await getClient().execute({
    sql: "INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [`wr_${++seq}`, "tr_x", pid, "manual", status, 0, at],
  })
}

test("agencyClientOutcomes returns [] for no projects", async () => {
  expect(await agencyClientOutcomes([])).toEqual([])
})

test("rolls up reports, regressions and guarded verdicts per project in the window", async () => {
  const p1 = await addProject(), p2 = await addProject()
  const now = Date.now()
  // p1: 2 reports, 1 regression + 1 non-regression finding, 3 green / 1 amber / 1 red walks
  await addFeedback(p1, now); await addFeedback(p1, now)
  await addFinding(p1, "regression", now); await addFinding(p1, "bug", now)
  await addWalk(p1, "green", now); await addWalk(p1, "green", now); await addWalk(p1, "green", now)
  await addWalk(p1, "amber", now); await addWalk(p1, "red", now)
  // p2: 1 report only
  await addFeedback(p2, now)

  const rows = await agencyClientOutcomes([p1, p2])
  const r1 = rows.find((r) => r.projectId === p1)!
  expect(r1.reportsFound).toBe(2)
  expect(r1.regressionsCaught).toBe(1) // only kind='regression' counts
  expect(r1.guardedGreen).toBe(3)
  expect(r1.guardedAmber).toBe(1)
  expect(r1.guardedRed).toBe(1)
  expect(r1.guardedTotal).toBe(5)

  const r2 = rows.find((r) => r.projectId === p2)!
  expect(r2.reportsFound).toBe(1)
  expect(r2.regressionsCaught).toBe(0)
  expect(r2.guardedTotal).toBe(0)
})

test("excludes rows outside the window and non-terminal walk statuses", async () => {
  const p = await addProject()
  const now = Date.now()
  const old = now - 40 * 24 * 3600 * 1000 // 40 days ago, outside a 30-day window
  await addFeedback(p, now); await addFeedback(p, old)
  await addWalk(p, "green", now)
  await addWalk(p, "green", old)          // outside window
  await addWalk(p, "running", now)         // non-terminal → excluded from counts

  const [row] = await agencyClientOutcomes([p], { windowMs: 30 * 24 * 3600 * 1000 })
  expect(row.reportsFound).toBe(1)
  expect(row.guardedTotal).toBe(1)
  expect(row.guardedGreen).toBe(1)
})

test("does not leak another project's rows", async () => {
  const p1 = await addProject(), p2 = await addProject()
  const now = Date.now()
  await addFeedback(p2, now); await addWalk(p2, "red", now)
  const [row] = await agencyClientOutcomes([p1])
  expect(row.projectId).toBe(p1)
  expect(row.reportsFound).toBe(0)
  expect(row.guardedTotal).toBe(0)
})
