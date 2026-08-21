// KLAVITYKLA-486 — unit tests for buildSuperadminPL(): MRR from the canonical catalog, per-workspace
// COGS rollup (LLM + storage + browser + email), margin = MRR − COGS, and the CAC computation.
// In-process against a temp libSQL file DB.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB = join(tmpdir(), `klav-pl-${RUN}.db`)
function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB + s) } catch {} } }
rmDb()

process.env.KLAV_S3_GB_MONTH_USD = "0.02"
process.env.KLAV_S3_EGRESS_GB_USD = "0.10"
process.env.KLAV_BROWSER_MIN_USD = "0.006"
process.env.KLAV_EMAIL_SEND_USD = "0.001"
process.env.TURSO_DATABASE_URL = "file:" + DB
process.env.TURSO_AUTH_TOKEN = ""

const db = await import("./lib/db")
const sa = await import("./lib/superadmin")

const NOW = Date.now()
// Paid workspace: Solo (slug 'pro'), monthly, active → $49 MRR.
const A_PAID = "acct_paid_" + RUN
const P_PAID = "proj_" + A_PAID
// Free workspace: no subscription → $0 MRR.
const A_FREE = "acct_free_" + RUN
const P_FREE = "proj_" + A_FREE

async function exec(sql: string, args: any[] = []) { await db.db!.execute({ sql, args }) }

beforeAll(async () => {
  await db.initDb()

  // Two accounts + their first projects.
  await exec("INSERT INTO accounts (id,name,owner_email,plan,billing_interval,billing_status,created_at) VALUES (?,?,?,?,?,?,?)",
    [A_PAID, "Paid Co", "paid-" + RUN + "@test.local", "pro", "month", "active", NOW])
  await exec("INSERT INTO accounts (id,name,owner_email,plan,billing_interval,billing_status,created_at) VALUES (?,?,?,?,?,?,?)",
    [A_FREE, "Free Co", "free-" + RUN + "@test.local", "free", null, null, NOW])
  for (const [aid, pid, nm] of [[A_PAID, P_PAID, "Paid Co"], [A_FREE, P_FREE, "Free Co"]]) {
    await exec("INSERT INTO projects (id,account_id,name,created_at,updated_at) VALUES (?,?,?,?,?)", [pid, aid, nm, NOW, NOW])
  }
  await exec("INSERT INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)",
    ["am_" + RUN, A_PAID, "paid-" + RUN + "@test.local", "owner", NOW])

  // LLM spend (ai_calls) — account_id + project_id already resolved.
  await exec("INSERT INTO ai_calls (id,created_at,type,model,account_id,project_id,cost_usd,ok) VALUES (?,?,?,?,?,?,?,1)",
    ["ai1_" + RUN, NOW, "react", "m", A_PAID, P_PAID, 0.50])
  await exec("INSERT INTO ai_calls (id,created_at,type,model,account_id,project_id,cost_usd,ok) VALUES (?,?,?,?,?,?,?,1)",
    ["ai2_" + RUN, NOW, "extract", "m", A_FREE, P_FREE, 0.10])

  // Non-LLM COGS via cost_events (tagged by project_id → account).
  await db.recordCostEvent({ kind: "s3_storage", projectId: P_PAID, units: 5, costUsd: 0.10 })
  await db.recordCostEvent({ kind: "browser_min", projectId: P_PAID, runId: "r1", units: 20, costUsd: 0.12 })
  await db.recordCostEvent({ kind: "email_send", projectId: P_PAID, units: 3, costUsd: 0.003 })
  await db.recordCostEvent({ kind: "s3_egress", projectId: P_FREE, units: 1, costUsd: 0.05 })

  // Usage counts for the paid workspace.
  await exec("INSERT INTO personas (id,project_id,name,created_at,updated_at) VALUES (?,?,?,?,?)", ["sim_" + RUN, P_PAID, "Buyer", NOW, NOW])
  await exec("INSERT INTO trail_runs (id,trail_id,project_id,started_at) VALUES (?,?,?,?)", ["run_" + RUN, "t1", P_PAID, NOW])

  // CAC — marketing pre-signup spend + captured leads. One lead converts (matches a paid owner), one doesn't.
  await exec("INSERT INTO ai_calls (id,created_at,type,model,project_id,cost_usd,ok) VALUES (?,?,?,?,?,?,1)",
    ["aimk_" + RUN, NOW, "cro-analyze", "m", "proj_marketing_presignup", 0.40])
})

afterAll(() => { rmDb() })

test("accountMonthlyMrrUsd: catalog-driven, status-gated", () => {
  expect(sa.accountMonthlyMrrUsd("pro", "month", "active")).toBe(49)   // Solo monthly
  expect(sa.accountMonthlyMrrUsd("team", "month", "active")).toBe(249) // Team monthly
  expect(sa.accountMonthlyMrrUsd("pro", "year", "active")).toBeCloseTo(490 / 12, 6) // annual monthlyized
  expect(sa.accountMonthlyMrrUsd("pro", "month", "canceled")).toBe(0)  // lapsed → $0
  expect(sa.accountMonthlyMrrUsd("free", "month", "active")).toBe(0)
})

test("per-workspace P&L: margin = MRR − COGS", async () => {
  const pl = await sa.buildSuperadminPL()
  const paid = pl.workspaces.find((w) => w.accountId === A_PAID)!
  const free = pl.workspaces.find((w) => w.accountId === A_FREE)!
  expect(paid).toBeTruthy()

  // Paid: MRR 49; COGS = LLM 0.50 + storage 0.10 + browser 0.12 + email 0.003 = 0.723
  expect(paid.mrr).toBe(49)
  expect(paid.llmCost).toBeCloseTo(0.50, 6)
  expect(paid.storageCost).toBeCloseTo(0.10, 6)
  expect(paid.browserCost).toBeCloseTo(0.12, 6)
  expect(paid.emailCost).toBeCloseTo(0.003, 6)
  expect(paid.totalCogs).toBeCloseTo(0.723, 6)
  expect(paid.margin).toBeCloseTo(49 - 0.723, 6)
  expect(paid.snapOnlyOrFree).toBe(false)
  expect(paid.usage.sims).toBe(1)
  expect(paid.usage.autosimRuns).toBe(1)
  expect(paid.usage.seats).toBe(1)

  // Free: MRR 0; COGS = LLM 0.10 + egress 0.05 = 0.15; margin negative.
  expect(free.mrr).toBe(0)
  expect(free.snapOnlyOrFree).toBe(true)
  expect(free.storageCost).toBeCloseTo(0.05, 6) // egress folds into storage$ column
  expect(free.totalCogs).toBeCloseTo(0.15, 6)
  expect(free.margin).toBeCloseTo(-0.15, 6)
})

test("summary rolls up MRR, COGS and gross margin", async () => {
  const pl = await sa.buildSuperadminPL()
  expect(pl.summary.mrr).toBe(49)
  expect(pl.summary.cogs).toBeCloseTo(0.723 + 0.15, 6)
  expect(pl.summary.grossMargin).toBeCloseTo(49 - (0.723 + 0.15), 6)
  expect(pl.summary.grossMarginPct).toBeCloseTo((pl.summary.grossMargin / 49) * 100, 4)
})

test("workspaces are sorted by margin (desc)", async () => {
  const pl = await sa.buildSuperadminPL()
  for (let i = 1; i < pl.workspaces.length; i++) {
    expect(pl.workspaces[i - 1].margin).toBeGreaterThanOrEqual(pl.workspaces[i].margin)
  }
})

test("CAC = free-tool spend ÷ converted signups", async () => {
  // Seed a lead that converts (paid owner) and one that never signs up.
  const paidOwner = "paid-" + RUN + "@test.local"
  await exec("INSERT INTO funnel_events (id,event,email,created_at) VALUES (?,?,?,?)", ["fe1_" + RUN, "lead_captured", paidOwner, NOW])
  await exec("INSERT INTO funnel_events (id,event,email,created_at) VALUES (?,?,?,?)", ["fe2_" + RUN, "lead_captured", "ghost-" + RUN + "@test.local", NOW])

  const pl = await sa.buildSuperadminPL()
  expect(pl.cac.leadsCaptured).toBe(2)
  expect(pl.cac.convertedSignups).toBe(1)          // only paidOwner became an account
  expect(pl.cac.freeToolSpendAllTime).toBeCloseTo(0.40, 6)
  expect(pl.cac.cac).toBeCloseTo(0.40, 6)          // 0.40 / 1
  expect(pl.cac.leadToSignupPct).toBeCloseTo(50, 4) // 1 of 2
})
