// KLAVITYKLA-315: partner-code redemption ledger [JTBD 8.11] — hermetic (isolated file db).
import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-partner-ledger-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import {
  applySchema, reconnectDb,
  recordPartnerCodeRedemption, listPartnerCodeRedemptions, countPartnerCodeRedemptions,
} from "./db"

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
})

test("record + list: a redemption is durably recorded and returned", async () => {
  const row = await recordPartnerCodeRedemption({
    code: "welcome", accountId: "acct_A", redeemedBy: "vishal@quantana.com.au", grantedPlan: "partner", source: "api",
  })
  expect(row.id).toMatch(/^pcr_/)
  expect(row.code).toBe("WELCOME") // normalized to uppercase
  expect(row.grantedPlan).toBe("partner")

  const all = await listPartnerCodeRedemptions({ code: "WELCOME" })
  expect(all.length).toBe(1)
  expect(all[0]).toMatchObject({
    code: "WELCOME", accountId: "acct_A", redeemedBy: "vishal@quantana.com.au", grantedPlan: "partner", source: "api",
  })
})

test("list filters by account and returns newest first", async () => {
  await recordPartnerCodeRedemption({ code: "TEAMPASS", accountId: "acct_B", grantedPlan: "partner" })
  await new Promise((r) => setTimeout(r, 2))
  await recordPartnerCodeRedemption({ code: "TEAMPASS", accountId: "acct_B", grantedPlan: "partner" })

  const forB = await listPartnerCodeRedemptions({ accountId: "acct_B" })
  expect(forB.length).toBe(2)
  expect(forB[0].redeemedAt).toBeGreaterThanOrEqual(forB[1].redeemedAt) // newest first

  // Filtering by a different account excludes them.
  const forA = await listPartnerCodeRedemptions({ accountId: "acct_A" })
  expect(forA.every((r) => r.accountId === "acct_A")).toBe(true)
})

test("cap: count reflects redemptions and drives per-code cap enforcement", async () => {
  expect(await countPartnerCodeRedemptions("CAPPED")).toBe(0)

  const CAP = 2
  const grant = async () => {
    if ((await countPartnerCodeRedemptions("CAPPED")) >= CAP) return false // cap reached → refuse
    await recordPartnerCodeRedemption({ code: "CAPPED", accountId: "acct_C", grantedPlan: "partner" })
    return true
  }

  expect(await grant()).toBe(true)
  expect(await grant()).toBe(true)
  expect(await grant()).toBe(false) // 3rd redemption blocked by cap
  expect(await countPartnerCodeRedemptions("CAPPED")).toBe(CAP)
})
