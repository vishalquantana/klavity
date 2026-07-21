import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-billing-db-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import { accountBillingState, applySchema, db, reconnectDb, setAccountPlan, updateAccountBillingState } from "./db"

const ACCOUNT = "acct_billing"
const PROJECT = "proj_billing"

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
  const now = Date.now()
  await c.execute({ sql: "INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", args: [ACCOUNT, "Billing", "vishal@quantana.com.au", now] })
  await c.execute({ sql: "INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", args: [PROJECT, ACCOUNT, "Billing Project", now, now] })
})

test("setAccountPlan mirrors the effective plan onto projects", async () => {
  await setAccountPlan(ACCOUNT, "pro")
  expect((await accountBillingState(ACCOUNT)).plan).toBe("pro")
  const r = await db!.execute({ sql: "SELECT billing_plan FROM projects WHERE id=?", args: [PROJECT] })
  expect((r.rows[0] as any).billing_plan).toBe("pro")
})

test("grace anchor does not reset when billing_status stays past_due (KLAVITYKLA-313)", async () => {
  // Seed the account as already past_due with an anchor 5 days ago
  const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000
  await db!.execute({
    sql: "UPDATE accounts SET billing_status=?, billing_updated_at=? WHERE id=?",
    args: ["past_due", fiveDaysAgo, ACCOUNT],
  })
  await db!.execute({
    sql: "UPDATE projects SET billing_status=?, billing_updated_at=? WHERE account_id=?",
    args: ["past_due", fiveDaysAgo, ACCOUNT],
  })

  // Simulate a Stripe retry event that keeps status as past_due (same status)
  await updateAccountBillingState(ACCOUNT, {
    plan: "pro",
    stripeCustomerId: "cus_grace",
    stripeSubscriptionId: "sub_grace",
    billingStatus: "past_due",
    billingInterval: "month",
    billingCurrentPeriodEnd: Date.now() + 86400000,
    billingCancelAtPeriodEnd: false,
  })

  const state = await accountBillingState(ACCOUNT)
  // billing_updated_at must NOT have moved — the grace window anchor is preserved
  expect(state.billingUpdatedAt).toBe(fiveDaysAgo)

  // Verify projects table also preserves the anchor
  const projRow = await db!.execute({
    sql: "SELECT billing_updated_at FROM projects WHERE account_id=?",
    args: [ACCOUNT],
  })
  expect(Number((projRow.rows[0] as any).billing_updated_at)).toBe(fiveDaysAgo)
})

test("grace anchor DOES reset when billing_status changes (past_due → active)", async () => {
  // Set up past_due anchor in the past
  const anchorTs = Date.now() - 10 * 24 * 60 * 60 * 1000
  await db!.execute({
    sql: "UPDATE accounts SET billing_status=?, billing_updated_at=? WHERE id=?",
    args: ["past_due", anchorTs, ACCOUNT],
  })
  await db!.execute({
    sql: "UPDATE projects SET billing_status=?, billing_updated_at=? WHERE account_id=?",
    args: ["past_due", anchorTs, ACCOUNT],
  })

  const beforeCall = Date.now()
  // Stripe payment succeeds — status transitions to active
  await updateAccountBillingState(ACCOUNT, {
    plan: "pro",
    stripeCustomerId: "cus_grace",
    stripeSubscriptionId: "sub_grace",
    billingStatus: "active",
    billingInterval: "month",
    billingCurrentPeriodEnd: Date.now() + 86400000,
    billingCancelAtPeriodEnd: false,
  })
  const afterCall = Date.now()

  const state = await accountBillingState(ACCOUNT)
  // billing_updated_at must have been refreshed to now (status changed)
  expect(state.billingUpdatedAt).toBeGreaterThanOrEqual(beforeCall)
  expect(state.billingUpdatedAt).toBeLessThanOrEqual(afterCall)
})

test("updateAccountBillingState persists Stripe metadata and mirrors project status", async () => {
  await updateAccountBillingState(ACCOUNT, {
    plan: "team",
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
    billingStatus: "active",
    billingInterval: "year",
    billingCurrentPeriodEnd: 1999999999000,
    billingCancelAtPeriodEnd: true,
  })
  const state = await accountBillingState(ACCOUNT)
  expect(state).toMatchObject({
    plan: "team",
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
    billingStatus: "active",
    billingInterval: "year",
    billingCurrentPeriodEnd: 1999999999000,
    billingCancelAtPeriodEnd: true,
  })
  const r = await db!.execute({ sql: "SELECT billing_plan, billing_status FROM projects WHERE id=?", args: [PROJECT] })
  expect(r.rows[0]).toMatchObject({ billing_plan: "team", billing_status: "active" })
})
