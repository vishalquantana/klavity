// KLAVITYKLA-305 — usage metering (MEASUREMENT ONLY). Verifies the billable value-metric
// counters (meter = Sims + guarded AutoSim flows) increment the right per-account/per-period/
// per-metric row, that the read API returns correct current-period totals, and that tenant
// isolation holds. Also asserts the meter is measurement-only: incrementUsageMeter never throws
// and there is no quota check / blocking anywhere in the read/write path.
//
// DB isolation: uses useIsolatedDb() which registers a beforeEach that re-points the shared
// module `db` singleton at THIS file's own temp SQLite file before every test. This is
// order-invariant — even if another test file's reconnectDb() ran between our beforeEach and
// test body, our next beforeEach reclaims the singleton. Each test also mints its own unique
// account/project ids (via freshTenant/addProject) so no counter is ever shared between tests.
import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import {
  incrementUsageMeter, getAccountUsage, getAccountUsageMap, usagePeriod,
  getAccountUsageByProject, tenantTodaySpendByProject,
} from "./db"

// Wire the isolated DB. useIsolatedDb() also sets process.env.TURSO_DATABASE_URL
// so that the db module's initial import (if not yet cached) creates a client
// pointing at OUR file. The beforeEach it registers reconnects + applies schema
// before every test, guaranteeing singleton ownership for the test body.
const { getClient } = useIsolatedDb("klav-usage-meters")

let seq = 0

// Mint a fresh account + one project (+ owner member) for a single test. Unique ids mean counters
// never overlap between tests, so we don't rely on any cross-test cleanup.
async function freshTenant(email?: string): Promise<{ accountId: string; projectId: string; email: string }> {
  const client = getClient()
  const n = ++seq
  const accountId = `acct_um_${n}`
  const projectId = `proj_um_${n}`
  const em = email ?? `user${n}@quantana.com.au`
  const now = Date.now()
  await client.execute({ sql: "INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", args: [accountId, `A${n}`, em, now] })
  await client.execute({ sql: "INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", args: [projectId, accountId, `P${n}`, now, now] })
  await client.execute({ sql: "INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", args: [`am_${n}`, accountId, em, "owner", now] })
  return { accountId, projectId, email: em }
}

async function addProject(accountId: string): Promise<string> {
  const client = getClient()
  const n = ++seq
  const projectId = `proj_um_${n}`
  const now = Date.now()
  await client.execute({ sql: "INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", args: [projectId, accountId, `P${n}`, now, now] })
  return projectId
}

// ── usagePeriod: stable UTC-month string ──────────────────────────────────────────────────────
test("usagePeriod returns the UTC calendar month as YYYY-MM", () => {
  expect(usagePeriod(Date.UTC(2026, 6, 11, 23, 59))).toBe("2026-07")
  expect(usagePeriod(Date.UTC(2026, 0, 1, 0, 0))).toBe("2026-01")
})

// ── metered events increment the right counter ────────────────────────────────────────────────
test("incrementUsageMeter counts sim_review + autosim_walk per account (resolved via project)", async () => {
  const t = await freshTenant()
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId })
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId })
  await incrementUsageMeter({ metric: "autosim_walk", projectId: t.projectId })

  const usage = await getAccountUsageMap(t.accountId)
  expect(usage.sim_review).toBe(2)
  expect(usage.autosim_walk).toBe(1)
})

test("incrementUsageMeter resolves the account from actorEmail when no projectId is given", async () => {
  const t = await freshTenant()
  await incrementUsageMeter({ metric: "sim_review", actorEmail: t.email })
  const usage = await getAccountUsageMap(t.accountId)
  expect(usage.sim_review).toBe(1)
})

test("incrementUsageMeter respects an explicit `by` increment", async () => {
  const t = await freshTenant()
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId, by: 5 })
  const usage = await getAccountUsageMap(t.accountId)
  expect(usage.sim_review).toBe(5)
})

// ── read returns correct current-period totals ────────────────────────────────────────────────
test("getAccountUsage returns current-period totals summed across projects, one row per metric", async () => {
  const t = await freshTenant()
  const proj2 = await addProject(t.accountId) // second project on the SAME account
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId })
  await incrementUsageMeter({ metric: "sim_review", projectId: proj2 })
  await incrementUsageMeter({ metric: "autosim_walk", projectId: proj2 })

  const rows = await getAccountUsage(t.accountId)
  const byMetric = Object.fromEntries(rows.map(r => [r.metric, r.count]))
  expect(byMetric.sim_review).toBe(2) // summed across both projects
  expect(byMetric.autosim_walk).toBe(1)
})

test("getAccountUsage isolates by billing period (prior month is excluded)", async () => {
  const t = await freshTenant()
  const lastMonth = usagePeriod(Date.UTC(2026, 5, 15)) // 2026-06
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId, atMs: Date.UTC(2026, 5, 15) })
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId, atMs: Date.UTC(2026, 6, 20) }) // 2026-07

  const july = await getAccountUsageMap(t.accountId, { period: "2026-07" })
  expect(july.sim_review).toBe(1) // only the July event
  const june = await getAccountUsageMap(t.accountId, { period: lastMonth })
  expect(june.sim_review).toBe(1) // the June event is a separate period bucket
})

test("getAccountUsage can scope to a single project", async () => {
  const t = await freshTenant()
  const proj2 = await addProject(t.accountId)
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId })
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId })
  await incrementUsageMeter({ metric: "sim_review", projectId: proj2 })

  const onlyFirst = await getAccountUsageMap(t.accountId, { projectId: t.projectId })
  expect(onlyFirst.sim_review).toBe(2)
  const acctWide = await getAccountUsageMap(t.accountId)
  expect(acctWide.sim_review).toBe(3)
})

// ── tenant isolation ──────────────────────────────────────────────────────────────────────────
test("usage meters are isolated per account (tenant isolation)", async () => {
  const a = await freshTenant()
  const b = await freshTenant()
  await incrementUsageMeter({ metric: "sim_review", projectId: a.projectId })
  await incrementUsageMeter({ metric: "sim_review", projectId: a.projectId })
  await incrementUsageMeter({ metric: "autosim_walk", projectId: b.projectId })

  const usageA = await getAccountUsageMap(a.accountId)
  const usageB = await getAccountUsageMap(b.accountId)
  expect(usageA.sim_review).toBe(2)
  expect(usageA.autosim_walk ?? 0).toBe(0) // A's walk count untouched by B
  expect(usageB.autosim_walk).toBe(1)
  expect(usageB.sim_review ?? 0).toBe(0)   // B never saw A's sim_reviews
})

// ── measurement only: never throws, never blocks, no enforcement ────────────────────────────────
test("incrementUsageMeter is a no-op when no account can be resolved (never throws)", async () => {
  // Unknown project + no email → nothing to attribute → silently skipped, no row written.
  await incrementUsageMeter({ metric: "sim_review", projectId: "proj_does_not_exist_xyz" })
  await incrementUsageMeter({ metric: "sim_review" })
  const r = await getClient().execute("SELECT COUNT(*) AS n FROM usage_meters WHERE project_id='proj_does_not_exist_xyz'")
  expect(Number((r.rows[0] as any).n)).toBe(0)
})

test("incrementUsageMeter returns void and does not block/gate the caller (no enforcement)", async () => {
  const t = await freshTenant()
  // The helper resolves to void regardless of prior usage — there is NO quota check that could
  // reject or throw. Record far past any conceivable plan limit; every call still resolves cleanly.
  for (let i = 0; i < 50; i++) {
    const ret = await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId })
    expect(ret).toBeUndefined()
  }
  const usage = await getAccountUsageMap(t.accountId)
  expect(usage.sim_review).toBe(50) // all counted, none blocked
})

// ── KLAVITYKLA-276: per-project usage + cost breakdown ──────────────────────────────────────────
test("getAccountUsageByProject returns one row per (project, metric) with the joined project name", async () => {
  const t = await freshTenant()
  const proj2 = await addProject(t.accountId)
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId })
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId })
  await incrementUsageMeter({ metric: "autosim_walk", projectId: t.projectId })
  await incrementUsageMeter({ metric: "sim_review", projectId: proj2 })

  const rows = await getAccountUsageByProject(t.accountId)
  const p1sim = rows.find(r => r.projectId === t.projectId && r.metric === "sim_review")!
  const p1walk = rows.find(r => r.projectId === t.projectId && r.metric === "autosim_walk")!
  const p2sim = rows.find(r => r.projectId === proj2 && r.metric === "sim_review")!
  expect(p1sim.count).toBe(2)
  expect(p1walk.count).toBe(1)
  expect(p2sim.count).toBe(1)
  expect(typeof p1sim.name).toBe("string") // name joined from projects, not null
})

test("getAccountUsageByProject isolates by period and by account", async () => {
  const t = await freshTenant()
  const other = await freshTenant()
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId, atMs: Date.UTC(2026, 5, 15) }) // June
  await incrementUsageMeter({ metric: "sim_review", projectId: t.projectId, atMs: Date.UTC(2026, 6, 20) }) // July
  await incrementUsageMeter({ metric: "sim_review", projectId: other.projectId, atMs: Date.UTC(2026, 6, 20) })

  const july = await getAccountUsageByProject(t.accountId, { period: "2026-07" })
  expect(july.length).toBe(1)
  expect(july[0].projectId).toBe(t.projectId)
  expect(july[0].count).toBe(1)
  // other account's July usage never leaks into t's breakdown
  expect(july.some(r => r.projectId === other.projectId)).toBe(false)
})

test("tenantTodaySpendByProject sums today's ai_calls cost per project", async () => {
  const t = await freshTenant()
  const proj2 = await addProject(t.accountId)
  const client = getClient()
  const now = Date.now()
  const yesterday = now - 36 * 60 * 60 * 1000
  const ins = async (projectId: string, cost: number, at: number) =>
    client.execute({
      sql: `INSERT INTO ai_calls (id, created_at, type, model, account_id, project_id, cost_usd, ok)
            VALUES (?,?,?,?,?,?,?,1)`,
      args: [`ai_${Math.random().toString(36).slice(2)}`, at, "sim", "m", t.accountId, projectId, cost],
    })
  await ins(t.projectId, 0.30, now)
  await ins(t.projectId, 0.12, now)
  await ins(proj2, 0.05, now)
  await ins(t.projectId, 9.99, yesterday) // excluded: not today

  const rows = await tenantTodaySpendByProject(t.accountId)
  const byProj = Object.fromEntries(rows.map(r => [r.projectId, r.cost]))
  expect(byProj[t.projectId]).toBeCloseTo(0.42)
  expect(byProj[proj2]).toBeCloseTo(0.05)
})

test("tenantTodaySpendByProject returns [] for a blank account id", async () => {
  expect(await tenantTodaySpendByProject("")).toEqual([])
})
