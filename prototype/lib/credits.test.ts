import { expect, test } from "bun:test"
import { creditCostFor, DEFAULT_ACTION_COST_MC, MC_PER_CREDIT } from "./credits"

test("MC_PER_CREDIT is 1000 (millicredits are integers)", () => {
  expect(MC_PER_CREDIT).toBe(1000)
})

test("flat actions cost their default millicredits", () => {
  expect(creditCostFor("enhance")).toBe(1000)          // 1 credit
  expect(creditCostFor("keyframes")).toBe(2000)        // 2 credits
  expect(creditCostFor("sim")).toBe(15000)             // 15 credits
  expect(creditCostFor("autosim")).toBe(75000)         // 75 credits
})

test("voice is 0.1 credit per dictation and stays an integer", () => {
  expect(DEFAULT_ACTION_COST_MC.voice).toBe(100)
  expect(creditCostFor("voice", 1)).toBe(100)          // 0.1cr
  expect(creditCostFor("voice", 10)).toBe(1000)        // 10 dictations = exactly 1cr
})

test("transcript is 1 credit per started minute, floor 1 credit", () => {
  expect(creditCostFor("transcript", 0)).toBe(1000)    // any non-empty clip ≥ 1cr
  expect(creditCostFor("transcript", 0.4)).toBe(1000)  // ceil → 1 min
  expect(creditCostFor("transcript", 3)).toBe(3000)    // 3 min
  expect(creditCostFor("transcript", 3.2)).toBe(4000)  // ceil → 4 min
})

test("baseMc override (DB-config value) is respected", () => {
  expect(creditCostFor("enhance", 1, 2500)).toBe(2500)
  expect(creditCostFor("transcript", 3, 500)).toBe(1500)  // 500 × 3
})

import { PLAN_GRANT_CREDITS, planGrantMillicredits } from "./credits"

test("plan grants match the locked numbers (spec §5/§12)", () => {
  expect(PLAN_GRANT_CREDITS.free).toBe(100)
  expect(PLAN_GRANT_CREDITS.pro).toBe(1500)     // Solo
  expect(PLAN_GRANT_CREDITS.team).toBe(10000)
  expect(PLAN_GRANT_CREDITS.founding).toBe(10000) // Team-level, locked
  expect(PLAN_GRANT_CREDITS.scale).toBe(40000)
  expect(planGrantMillicredits("pro")).toBe(1_500_000) // millicredits
})

import { useIsolatedDb } from "./test-db-isolation"
import { reserveCredits, InsufficientCreditsError } from "./credits"
import { getWorkspaceCredits, listCreditLedgerForWorkspace, ensureWorkspaceCredits } from "./db"

const { getClient } = useIsolatedDb("klav-credits-reserve")

async function seedWallet(id: string, grantMc: number, topupMc = 0) {
  await ensureWorkspaceCredits(id, grantMc)
  await getClient().execute({
    sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=? WHERE workspace_id=?",
    args: [grantMc, topupMc, id],
  })
}

test("sufficient → debit + a ledger spend row linked to the ai_call", async () => {
  await seedWallet("acct_r1", 5000)
  const rv = await reserveCredits("acct_r1", "enhance", { plan: "pro" })
  expect(rv.sufficient).toBe(true)
  expect(rv.costMc).toBe(1000)
  await rv.settle({ ok: true, aiCallId: "ai_1" })
  const w = await getWorkspaceCredits("acct_r1")
  expect(w!.grantedMc).toBe(4000) // 5000 − 1000
  const rows = await listCreditLedgerForWorkspace("acct_r1")
  expect(rows[0].millicredits).toBe(-1000)
  expect(rows[0].aiCallId).toBe("ai_1")
})

test("hard-enforce insufficient → throws, NO debit, NO ledger row", async () => {
  await seedWallet("acct_r2", 500) // < 1000
  await expect(reserveCredits("acct_r2", "enhance", { plan: "pro", enforce: true }))
    .rejects.toBeInstanceOf(InsufficientCreditsError)
  const w = await getWorkspaceCredits("acct_r2")
  expect(w!.grantedMc).toBe(500) // untouched
  expect((await listCreditLedgerForWorkspace("acct_r2")).length).toBe(0)
})

test("one last-taste grace per period, then hard stop", async () => {
  await seedWallet("acct_r3", 0)
  const g = await reserveCredits("acct_r3", "enhance", { plan: "pro", enforce: true })
  expect(g.usedGrace).toBe(true)         // first over-limit action allowed
  await g.settle({ ok: true, aiCallId: "ai_g" })
  await expect(reserveCredits("acct_r3", "enhance", { plan: "pro", enforce: true }))
    .rejects.toBeInstanceOf(InsufficientCreditsError) // second → blocked
})

test("soft mode never throws and records consumption even when short (wouldBlock=true)", async () => {
  await seedWallet("acct_r4", 0)
  const rv = await reserveCredits("acct_r4", "sim", { plan: "free" }) // enforce omitted → soft
  expect(rv.wouldBlock).toBe(true)
  expect(rv.sufficient).toBe(false)
  await rv.settle({ ok: true, aiCallId: "ai_s" })
  const rows = await listCreditLedgerForWorkspace("acct_r4")
  expect(rows[0].millicredits).toBe(-15000) // real consumption still recorded
})

test("refund on failure restores balance and nets the ledger to zero", async () => {
  await seedWallet("acct_r5", 5000)
  const rv = await reserveCredits("acct_r5", "keyframes", { plan: "pro" })
  await rv.settle({ ok: false }) // failed/empty AI result
  const w = await getWorkspaceCredits("acct_r5")
  expect(w!.grantedMc).toBe(5000) // fully restored
  const net = (await listCreditLedgerForWorkspace("acct_r5")).reduce((s, r) => s + r.millicredits, 0)
  expect(net).toBe(0)
})

test("grant-before-topup spend order via reserve", async () => {
  await seedWallet("acct_r6", 1000, 9000) // grant 1000 + topup 9000
  const rv = await reserveCredits("acct_r6", "sim", { plan: "team" }) // 15000 > 10000
  await rv.settle({ ok: true, aiCallId: "ai_x" })
  const w = await getWorkspaceCredits("acct_r6")
  expect(w!.grantedMc).toBe(0)      // grant spent first
  expect(w!.topupMc).toBe(-5000)    // soft mode allowed the overspend off top-up
})

test("partner (unlimited) short-circuits: cost 0, no debit, settle is a no-op", async () => {
  await seedWallet("acct_r7", 0)
  const rv = await reserveCredits("acct_r7", "autosim", { plan: "partner" })
  expect(rv.costMc).toBe(0)
  expect(rv.sufficient).toBe(true)
  await rv.settle({ ok: true, aiCallId: "ai_p" })
  expect((await listCreditLedgerForWorkspace("acct_r7")).length).toBe(0)
})
