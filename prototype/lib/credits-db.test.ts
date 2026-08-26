import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { seedCreditActionCosts, getCreditActionCost } from "./db"
import { ensureWorkspaceCredits, getWorkspaceCredits } from "./db"

useIsolatedDb("klav-credits-db-costs")

test("seedCreditActionCosts fills defaults and is idempotent", async () => {
  await seedCreditActionCosts()
  expect(await getCreditActionCost("enhance")).toBe(1000)
  expect(await getCreditActionCost("autosim")).toBe(75000)
  expect(await getCreditActionCost("voice")).toBe(100)
  await seedCreditActionCosts() // second call must not throw or double-count
  expect(await getCreditActionCost("sim")).toBe(15000)
  expect(await getCreditActionCost("nope")).toBeNull()
})

test("ensureWorkspaceCredits seeds a full wallet on first touch (§11 back-compat)", async () => {
  const w = await ensureWorkspaceCredits("acct_wc_1", 10000 * 1000) // team grant, in mc
  expect(w.grantedMc).toBe(10_000_000)
  expect(w.topupMc).toBe(0)
  expect(w.planGrantMc).toBe(10_000_000)
  const again = await getWorkspaceCredits("acct_wc_1")
  expect(again?.grantedMc).toBe(10_000_000)
})

test("ensureWorkspaceCredits re-grants on a new month, keeps top-up, clears grace", async () => {
  const jan = Date.UTC(2026, 0, 15)
  const feb = Date.UTC(2026, 1, 2)
  await ensureWorkspaceCredits("acct_wc_2", 1500 * 1000, jan)
  // simulate mid-month spend + a top-up + a used grace by writing the row directly
  const { db } = await import("./db")
  await db!.execute({
    sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=?, last_grace_period=? WHERE workspace_id=?",
    args: [200_000, 5000 * 1000, "2026-01", "acct_wc_2"],
  })
  const w1 = await ensureWorkspaceCredits("acct_wc_2", 1500 * 1000, feb)
  expect(w1.grantedMc).toBe(1_500_000)      // re-granted to plan grant
  expect(w1.topupMc).toBe(5_000_000)        // top-up rolled over untouched
  expect(w1.grantPeriod).toBe("2026-02")
  expect(w1.lastGracePeriod).toBeNull()     // grace reset for the new period
})

import { insertCreditLedger, listCreditLedgerForWorkspace } from "./db"

test("credit_ledger stores signed millicredits with refs + ai_call linkage", async () => {
  const id = await insertCreditLedger({
    workspaceId: "acct_led_1", action: "enhance", millicredits: -1000,
    refFeedbackId: "fb_9", actorEmail: "vishal@quantana.com.au", isGuest: false, aiCallId: "ai_abc",
  })
  expect(id).toStartWith("cl_")
  await insertCreditLedger({ workspaceId: "acct_led_1", action: "refund", millicredits: 1000, refFeedbackId: "fb_9", aiCallId: "ai_abc" })
  const rows = await listCreditLedgerForWorkspace("acct_led_1")
  expect(rows.length).toBe(2)
  const net = rows.reduce((s, r) => s + r.millicredits, 0)
  expect(net).toBe(0) // spend −1000 + refund +1000 nets to zero
  const spend = rows.find(r => r.action === "enhance")!
  expect(spend.aiCallId).toBe("ai_abc")
  expect(spend.isGuest).toBe(false)
})

import { debitWorkspaceCredits, creditWorkspaceCredits } from "./db"

test("debit spends grant-first, then top-up", async () => {
  await ensureWorkspaceCredits("acct_dbt_1", 0) // seed empty
  await (await import("./db")).db!.execute({
    sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=? WHERE workspace_id=?",
    args: [1000, 5000, "acct_dbt_1"],
  })
  const split = await debitWorkspaceCredits("acct_dbt_1", 1500)
  expect(split).toEqual({ grantMc: 1000, topupMc: 500 }) // grant emptied first
  const w = await getWorkspaceCredits("acct_dbt_1")
  expect(w!.grantedMc).toBe(0)
  expect(w!.topupMc).toBe(4500)
})

test("debit without allowNegative returns null and does not mutate when short", async () => {
  await ensureWorkspaceCredits("acct_dbt_2", 500)
  const split = await debitWorkspaceCredits("acct_dbt_2", 1000) // 1000 > 500
  expect(split).toBeNull()
  const w = await getWorkspaceCredits("acct_dbt_2")
  expect(w!.grantedMc).toBe(500) // untouched
})

test("KLA-609: concurrent debits on a SOLVENT wallet all succeed (no spurious insufficient from CAS races)", async () => {
  await ensureWorkspaceCredits("acct_dbt_conc", 0)
  const N = 12
  const each = 1000
  await (await import("./db")).db!.execute({
    sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=? WHERE workspace_id=?",
    args: [N * each, 0, "acct_dbt_conc"], // exactly enough grant for all N debits
  })
  // Fire all N debits at once → they contend on the optimistic CAS. With a generous retry budget +
  // backoff, every one must WIN (none may return null): the wallet is solvent, they just race.
  const results = await Promise.all(
    Array.from({ length: N }, () => debitWorkspaceCredits("acct_dbt_conc", each)),
  )
  expect(results.every(r => r !== null)).toBe(true) // zero spurious "insufficient" nulls
  const w = await getWorkspaceCredits("acct_dbt_conc")
  expect(w!.grantedMc + w!.topupMc).toBe(0) // all N debits landed exactly (no double/lost writes)
})

test("KLA-609: a truly-insufficient wallet still returns null (genuine short is distinguished from a race)", async () => {
  await ensureWorkspaceCredits("acct_dbt_short", 0)
  await (await import("./db")).db!.execute({
    sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=? WHERE workspace_id=?",
    args: [800, 0, "acct_dbt_short"],
  })
  const split = await debitWorkspaceCredits("acct_dbt_short", 1000) // 1000 > 800 → genuinely short
  expect(split).toBeNull()
  const w = await getWorkspaceCredits("acct_dbt_short")
  expect(w!.grantedMc).toBe(800) // untouched
})

test("credit restores a prior debit split (refund)", async () => {
  await ensureWorkspaceCredits("acct_dbt_3", 0)
  await (await import("./db")).db!.execute({
    sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=? WHERE workspace_id=?",
    args: [1000, 1000, "acct_dbt_3"],
  })
  const split = await debitWorkspaceCredits("acct_dbt_3", 1500) // {grant:1000, topup:500}
  await creditWorkspaceCredits("acct_dbt_3", split!)
  const w = await getWorkspaceCredits("acct_dbt_3")
  expect(w!.grantedMc).toBe(1000)
  expect(w!.topupMc).toBe(1000) // fully restored
})
