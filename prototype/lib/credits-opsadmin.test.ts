import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { creditsMarginByWorkspace } from "./superadmin"
import { ensureWorkspaceCredits, insertCreditLedger, recordAiCall } from "./db"

const { getClient } = useIsolatedDb("klav-credits-opsadmin")

test("credit margin = credit revenue − ai_calls COGS, reconciles per workspace", async () => {
  const c = getClient()
  await c.execute({ sql: "INSERT INTO accounts (id,name,owner_email,plan,created_at) VALUES (?,?,?,?,?)", args: ["ws_pl_1", "W", "w@quantana.com.au", "team", Date.now()] })
  await c.execute({ sql: "INSERT INTO projects (id,account_id,name,created_at,updated_at) VALUES (?,?,?,?,?)", args: ["proj_pl_1", "ws_pl_1", "P", Date.now(), Date.now()] })
  await ensureWorkspaceCredits("ws_pl_1", 10000 * 1000)
  // consume 15 credits (one Sim) → revenue = 15 × $0.01 = $0.15
  await insertCreditLedger({ workspaceId: "ws_pl_1", action: "sim", millicredits: -15000, aiCallId: "ai_1" })
  // real COGS for that account = $0.05
  await recordAiCall({ type: "extract", model: "m", projectId: "proj_pl_1", costUsd: 0.05 })
  const rows = await creditsMarginByWorkspace()
  const row = rows.find(r => r.workspaceId === "ws_pl_1")!
  expect(row.creditRevenueUsd).toBeCloseTo(0.15, 6)
  expect(row.llmCogsUsd).toBeCloseTo(0.05, 6)
  expect(row.creditMarginUsd).toBeCloseTo(0.10, 6)
  expect(row.grantedConsumedMc).toBe(15000) // under the 10,000-cr grant
})
