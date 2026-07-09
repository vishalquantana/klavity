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
