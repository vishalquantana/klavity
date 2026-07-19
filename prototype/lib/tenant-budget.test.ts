// KLAVITYKLA-314 — per-tenant AI budget under the global cap. Hermetic: point the module's `db`
// singleton at a fresh LOCAL libsql file by setting TURSO_DATABASE_URL *before* importing ./db.
import { test, expect, beforeAll, beforeEach, afterEach } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-tenantbudget-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const {
  reconnectDb, applySchema,
  recordAiCall, tenantTodaySpend, getTenantBudgetOverride, setTenantBudgetOverride,
} = await import("./db")
const {
  tenantBudgetRemaining, checkTenantBudget, tenantBudgetEnforcementEnabled,
  defaultTenantDailyBudget, DEFAULT_TENANT_DAILY_BUDGET_USD, TenantBudgetExceededError,
} = await import("./tenant-budget")

let db: any
beforeAll(async () => {
  db = reconnectDb("file:" + file)
  await applySchema(db)
})

// Each test starts from a clean ledger + no overrides + enforcement OFF (the ship-dark default).
beforeEach(async () => {
  await db.execute("DELETE FROM ai_calls")
  await db.execute("DELETE FROM tenant_ai_budgets")
  delete process.env.KLAV_TENANT_BUDGET_ENFORCEMENT
  delete process.env.KLAV_TENANT_DAILY_BUDGET_USD
})
afterEach(() => {
  delete process.env.KLAV_TENANT_BUDGET_ENFORCEMENT
  delete process.env.KLAV_TENANT_DAILY_BUDGET_USD
})

// A budgeted account can be attributed directly via recordAiCall's accountId arg.
async function spend(accountId: string, costUsd: number) {
  await recordAiCall({ type: "react", model: "m", accountId, costUsd })
}

// ── spend accounting ────────────────────────────────────────────────────────────────────────────
test("tenantTodaySpend sums only that tenant's real ai_calls cost today", async () => {
  await spend("acct_A", 0.3)
  await spend("acct_A", 0.2)
  await spend("acct_B", 1.5)
  expect(await tenantTodaySpend("acct_A")).toBeCloseTo(0.5, 6)
  expect(await tenantTodaySpend("acct_B")).toBeCloseTo(1.5, 6)
  expect(await tenantTodaySpend("acct_none")).toBe(0)
})

// ── budget overrides ──────────────────────────────────────────────────────────────────────────
test("setTenantBudgetOverride upserts and clears", async () => {
  expect(await getTenantBudgetOverride("acct_A")).toBe(null)
  await setTenantBudgetOverride("acct_A", 12)
  expect(await getTenantBudgetOverride("acct_A")).toBe(12)
  await setTenantBudgetOverride("acct_A", 20) // upsert
  expect(await getTenantBudgetOverride("acct_A")).toBe(20)
  await setTenantBudgetOverride("acct_A", null) // clear → back to default
  expect(await getTenantBudgetOverride("acct_A")).toBe(null)
})

// ── remaining computation ───────────────────────────────────────────────────────────────────────
test("tenantBudgetRemaining uses env default, then override; spent from ledger", async () => {
  expect(defaultTenantDailyBudget()).toBe(DEFAULT_TENANT_DAILY_BUDGET_USD)
  // Default budget, no spend → full budget remaining.
  let r = await tenantBudgetRemaining("acct_A")
  expect(r.budget).toBe(DEFAULT_TENANT_DAILY_BUDGET_USD)
  expect(r.spent).toBe(0)
  expect(r.remaining).toBe(DEFAULT_TENANT_DAILY_BUDGET_USD)
  expect(r.overBudget).toBe(false)

  // Env default is configurable.
  process.env.KLAV_TENANT_DAILY_BUDGET_USD = "2"
  await spend("acct_A", 1.5)
  r = await tenantBudgetRemaining("acct_A")
  expect(r.budget).toBe(2)
  expect(r.spent).toBeCloseTo(1.5, 6)
  expect(r.remaining).toBeCloseTo(0.5, 6)
  expect(r.overBudget).toBe(false)

  // Per-account override wins over the env default.
  await setTenantBudgetOverride("acct_A", 10)
  r = await tenantBudgetRemaining("acct_A")
  expect(r.budget).toBe(10)
  expect(r.remaining).toBeCloseTo(8.5, 6)
})

// ── ship-dark: enforcement OFF by default ─────────────────────────────────────────────────────────
test("checkTenantBudget: flag OFF (default) never blocks even when over budget", async () => {
  expect(tenantBudgetEnforcementEnabled()).toBe(false)
  process.env.KLAV_TENANT_DAILY_BUDGET_USD = "1"
  await spend("acct_A", 5) // way over
  const tb = await checkTenantBudget("acct_A")
  expect(tb.allow).toBe(true)
  expect(tb.blocked).toBe(false)
  expect(tb.overBudget).toBe(true) // still reports the fact, just doesn't block
})

// ── enforcement ON: under passes, over blocks ─────────────────────────────────────────────────────
test("checkTenantBudget: flag ON blocks a tenant that is over budget, passes one under", async () => {
  process.env.KLAV_TENANT_BUDGET_ENFORCEMENT = "1"
  process.env.KLAV_TENANT_DAILY_BUDGET_USD = "1"
  expect(tenantBudgetEnforcementEnabled()).toBe(true)

  // Under budget → allowed.
  await spend("acct_A", 0.4)
  let tb = await checkTenantBudget("acct_A")
  expect(tb.allow).toBe(true)
  expect(tb.blocked).toBe(false)

  // Push to/over budget → blocked with a 402-shaped reason.
  await spend("acct_A", 0.7) // total 1.1 >= 1.0
  tb = await checkTenantBudget("acct_A")
  expect(tb.allow).toBe(false)
  expect(tb.blocked).toBe(true)
  expect(tb.reason).toContain("AI budget reached")
})

// ── per-tenant isolation ──────────────────────────────────────────────────────────────────────
test("checkTenantBudget: one tenant over budget does NOT block another tenant", async () => {
  process.env.KLAV_TENANT_BUDGET_ENFORCEMENT = "1"
  process.env.KLAV_TENANT_DAILY_BUDGET_USD = "1"
  await spend("acct_A", 5)   // A blown past budget
  await spend("acct_B", 0.1) // B barely touched it
  const a = await checkTenantBudget("acct_A")
  const b = await checkTenantBudget("acct_B")
  expect(a.blocked).toBe(true)
  expect(b.blocked).toBe(false)
  expect(b.allow).toBe(true)
})

// ── override raises a blocked tenant back above the line ───────────────────────────────────────
test("checkTenantBudget: raising a tenant's override unblocks them", async () => {
  process.env.KLAV_TENANT_BUDGET_ENFORCEMENT = "1"
  process.env.KLAV_TENANT_DAILY_BUDGET_USD = "1"
  await spend("acct_A", 3)
  expect((await checkTenantBudget("acct_A")).blocked).toBe(true)
  await setTenantBudgetOverride("acct_A", 10) // generous override
  expect((await checkTenantBudget("acct_A")).blocked).toBe(false)
})

// ── error shape used by the AI-call gate ──────────────────────────────────────────────────────
test("TenantBudgetExceededError carries 402 status + code", () => {
  const e = new TenantBudgetExceededError("nope")
  expect(e.status).toBe(402)
  expect(e.code).toBe("TENANT_BUDGET_EXCEEDED")
  expect(e).toBeInstanceOf(Error)
})
