import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { runMonthlyGrantReset } from "./credits"
import { getWorkspaceCredits } from "./db"

const { getClient } = useIsolatedDb("klav-credits-reset")

async function acct(id: string, plan: string) {
  await getClient().execute({ sql: "INSERT INTO accounts (id,name,owner_email,plan,created_at) VALUES (?,?,?,?,?)", args: [id, id, `${id}@quantana.com.au`, plan, Date.now()] })
}

test("runMonthlyGrantReset restores granted=plan_grant, keeps top-up across a month boundary", async () => {
  await acct("acct_reset_1", "team")
  const jan = Date.UTC(2026, 0, 10)
  await runMonthlyGrantReset(jan)
  // spend the grant down + add a top-up
  await getClient().execute({ sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=? WHERE workspace_id=?", args: [123, 7000 * 1000, "acct_reset_1"] })
  const feb = Date.UTC(2026, 1, 1)
  const res = await runMonthlyGrantReset(feb)
  expect(res.scanned).toBeGreaterThanOrEqual(1)
  const w = await getWorkspaceCredits("acct_reset_1")
  expect(w!.grantedMc).toBe(10_000_000) // team re-grant
  expect(w!.topupMc).toBe(7_000_000)    // top-up survived the reset
})
