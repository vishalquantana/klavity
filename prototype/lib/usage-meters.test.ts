// KLAVITYKLA-305 — usage metering (MEASUREMENT ONLY). Verifies the billable value-metric
// counters (meter = Sims + guarded AutoSim flows) increment the right per-account/per-period/
// per-metric row, that the read API returns correct current-period totals, and that tenant
// isolation holds. Also asserts the meter is measurement-only: incrementUsageMeter never throws
// and there is no quota check / blocking anywhere in the read/write path.
//
// Hermetic + isolation-safe: point the module `db` singleton at a fresh LOCAL libsql file BEFORE
// importing ./db, reconnect it to OUR file in beforeEach (the singleton is shared across every test
// file), and give every test its OWN freshly-minted account/project ids so no counter is ever
// shared between tests — accumulation across tests is structurally impossible.
import { beforeEach, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-usage-meters-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const {
  reconnectDb, applySchema,
  incrementUsageMeter, getAccountUsage, getAccountUsageMap, usagePeriod,
} = await import("./db")

let seq = 0
// IMPORTANT: the imported `db` is a snapshot of the export's value AT IMPORT TIME, not a live view
// of db.ts's mutable `db` binding. Another test file calling reconnectDb() reassigns the module's
// live `db` (which incrementUsageMeter/getAccountUsage use internally) WITHOUT changing our stale
// snapshot. So for our own direct DB writes we MUST use the client returned by reconnectDb — and we
// reconnect in beforeEach so our writes and the helpers' reads share the same live client + file.
let client!: Awaited<ReturnType<typeof reconnectDb>>

// Mint a fresh account + one project (+ owner member) for a single test. Unique ids mean counters
// never overlap between tests, so we don't rely on any cross-test cleanup.
async function freshTenant(email?: string): Promise<{ accountId: string; projectId: string; email: string }> {
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
  const n = ++seq
  const projectId = `proj_um_${n}`
  const now = Date.now()
  await client.execute({ sql: "INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", args: [projectId, accountId, `P${n}`, now, now] })
  return projectId
}

beforeEach(async () => {
  // Re-point the module's live `db` singleton (shared across ALL test files) at OUR file and keep the
  // returned client for our direct writes. Now our writes + the helpers' reads use the same DB.
  client = reconnectDb("file:" + file)
  await applySchema(client)
})

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
  const r = await client.execute("SELECT COUNT(*) AS n FROM usage_meters WHERE project_id='proj_does_not_exist_xyz'")
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
