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
