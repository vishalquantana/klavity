// KLAVITYKLA-279 — Monthly Guarded Flows report aggregator (hermetic).
// Verifies UTC month windowing, per-flow pass/warn/fail tallies, regressions caught,
// overall totals/pass-rate, available-month navigation, and project scoping.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-gfr-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2, createProject } = await import("./db")
let db: any
beforeAll(async () => { db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const T = await import("./trails")
const R = await import("./guarded-flows-report")

// July 2026 window anchor (UTC).
const JUL_15 = Date.UTC(2026, 6, 15, 12, 0, 0)
const JUN_20 = Date.UTC(2026, 5, 20, 12, 0, 0)
const AUG_02 = Date.UTC(2026, 7, 2, 12, 0, 0)

async function seedRun(proj: string, trail: string, status: string, finishedAt: number) {
  const id = "run_" + crypto.randomUUID()
  await db.execute({
    sql: `INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, started_at, finished_at)
          VALUES (?,?,?,?,?,?,?,?)`,
    args: [id, trail, proj, "manual", status, 1, finishedAt - 1000, finishedAt],
  })
  return id
}
async function seedRegression(proj: string, trail: string, runId: string, createdAt: number, key: string) {
  const id = "find_" + crypto.randomUUID()
  await db.execute({
    sql: `INSERT INTO findings (id, project_id, run_id, trail_id, kind, title, dedup_key, confidence, recurrence, status, created_at, updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, proj, runId, trail, "regression", "Broke", key, 0.9, 1, "queued", createdAt, createdAt],
  })
}

test("resolveMonthWindow parses YYYY-MM (UTC) and defaults to current month", () => {
  const w = R.resolveMonthWindow("2026-07")
  expect(w.month).toBe("2026-07")
  expect(w.monthLabel).toBe("July 2026")
  expect(w.start).toBe(Date.UTC(2026, 6, 1))
  expect(w.end).toBe(Date.UTC(2026, 7, 1))
  // Invalid falls back to the current month at nowMs.
  const cur = R.resolveMonthWindow("garbage", Date.UTC(2026, 2, 9))
  expect(cur.month).toBe("2026-03")
  const cur2 = R.resolveMonthWindow(null, Date.UTC(2026, 11, 31, 23, 0, 0))
  expect(cur2.month).toBe("2026-12")
})

test("aggregates a month's runs, regressions, health and pass-rate per flow", async () => {
  const proj = (await createProject("acct_gfr", "Acme App")).id
  const login = await T.createTrail(proj, { name: "Login flow", baseUrl: "https://acme.test/" })
  const checkout = await T.createTrail(proj, { name: "Checkout", baseUrl: "https://acme.test/checkout" })

  // Login: 3 July runs (green, green, red) → health red, passRate 2/3.
  await seedRun(proj, login, "green", JUL_15)
  await seedRun(proj, login, "green", JUL_15 + 3600_000)
  const loginRed = await seedRun(proj, login, "red", JUL_15 + 7200_000)
  await seedRegression(proj, login, loginRed, JUL_15 + 7200_000, "gfr:login:1")

  // Checkout: 2 July runs (green, amber) → health amber.
  await seedRun(proj, checkout, "green", JUL_15 + 100)
  await seedRun(proj, checkout, "amber", JUL_15 + 200)

  // Out-of-window noise: a June run + an August run + a June regression (must be excluded).
  await seedRun(proj, login, "green", JUN_20)
  await seedRun(proj, checkout, "red", AUG_02)
  await seedRegression(proj, checkout, loginRed, JUN_20, "gfr:checkout:june")

  const rep = await R.gatherGuardedFlowsReport(proj, "2026-07")
  expect(rep).not.toBeNull()
  const r = rep!
  expect(r.month).toBe("2026-07")
  expect(r.projectName).toBe("Acme App")

  // Totals: 5 July runs (3 login + 2 checkout), 3 passed, 1 warned, 1 failed, 1 regression.
  expect(r.totals.totalRuns).toBe(5)
  expect(r.totals.passed).toBe(3)
  expect(r.totals.warned).toBe(1)
  expect(r.totals.failed).toBe(1)
  expect(r.totals.regressionsCaught).toBe(1)
  expect(r.totals.activeFlows).toBe(2)
  expect(r.totals.passRate).toBeCloseTo(0.6)

  const byName = Object.fromEntries(r.flows.map((f) => [f.trailName, f]))
  expect(byName["Login flow"].totalRuns).toBe(3)
  expect(byName["Login flow"].passed).toBe(2)
  expect(byName["Login flow"].failed).toBe(1)
  expect(byName["Login flow"].health).toBe("red")
  expect(byName["Login flow"].passRate).toBeCloseTo(2 / 3)
  expect(byName["Login flow"].regressionsCaught).toBe(1)

  expect(byName["Checkout"].totalRuns).toBe(2)
  expect(byName["Checkout"].health).toBe("amber")
  expect(byName["Checkout"].regressionsCaught).toBe(0) // June regression excluded

  // Navigation: June, July, August all have terminal runs.
  expect(r.availableMonths).toEqual(["2026-08", "2026-07", "2026-06"])
})

test("a flow with zero runs in-month appears with health 'none'", async () => {
  const proj = (await createProject("acct_gfr2", "Quiet App")).id
  const t = await T.createTrail(proj, { name: "Onboarding", baseUrl: "https://q.test/" })
  await seedRun(proj, t, "green", JUN_20) // only a June run

  const r = (await R.gatherGuardedFlowsReport(proj, "2026-07"))!
  expect(r.flows.length).toBe(1)
  expect(r.flows[0].totalRuns).toBe(0)
  expect(r.flows[0].health).toBe("none")
  expect(r.flows[0].passRate).toBe(0)
  expect(r.totals.totalRuns).toBe(0)
  expect(r.totals.activeFlows).toBe(0)
})

test("is project-scoped and returns null for unknown project", async () => {
  const a = (await createProject("acct_gfr_a", "A")).id
  const b = (await createProject("acct_gfr_b", "B")).id
  const ta = await T.createTrail(a, { name: "A-flow", baseUrl: "https://a.test/" })
  await T.createTrail(b, { name: "B-flow", baseUrl: "https://b.test/" })
  await seedRun(a, ta, "green", JUL_15)

  const ra = (await R.gatherGuardedFlowsReport(a, "2026-07"))!
  expect(ra.flows.map((f) => f.trailName)).toEqual(["A-flow"])
  expect(await R.gatherGuardedFlowsReport("proj_does_not_exist", "2026-07")).toBeNull()
})
