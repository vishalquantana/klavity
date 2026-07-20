// KLAVITYKLA-366 — countFoundingAccounts() against a real SQLite file.
//
// This is the source of truth behind the public "spots left" number, so it has to count the same
// thing the entitlement system does: accounts.plan = 'founding'. Two behaviours matter beyond the
// happy path — a churned founder must free their spot, and a hand-set-up founder with no Stripe
// row must still occupy one.
import { beforeAll, beforeEach, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-founding-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import { applySchema, countFoundingAccounts, reconnectDb } from "./db"
import { computeFoundingSpots } from "./founding"

let conn: any

beforeAll(async () => {
  conn = reconnectDb("file:" + file)
  await applySchema(conn)
})

beforeEach(async () => {
  await conn.execute({ sql: "DELETE FROM accounts" })
})

async function addAccount(id: string, plan: string, billingStatus: string | null = null) {
  await conn.execute({
    sql: `INSERT INTO accounts (id, name, owner_email, plan, billing_status, created_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, id, `${id}@example.com`, plan, billingStatus, Date.now()],
  })
}

test("a fresh DB has zero founding accounts — all ten spots open", async () => {
  expect(await countFoundingAccounts()).toBe(0)
  expect(computeFoundingSpots(await countFoundingAccounts()).remaining).toBe(10)
})

test("counts only founding accounts, ignoring every other plan", async () => {
  await addAccount("a", "founding")
  await addAccount("b", "team")
  await addAccount("c", "pro")
  await addAccount("d", "free")
  await addAccount("e", "founding")
  expect(await countFoundingAccounts()).toBe(2)
  expect(computeFoundingSpots(await countFoundingAccounts()).remaining).toBe(8)
})

test("a hand-set-up founder with NO Stripe row still occupies a spot", async () => {
  // The first founders are onboarded by hand — billing_status is NULL for them.
  await addAccount("hand", "founding", null)
  expect(await countFoundingAccounts()).toBe(1)
})

test("a churned founder frees their spot", async () => {
  await addAccount("active", "founding", "active")
  await addAccount("gone", "founding", "canceled")
  await addAccount("gone2", "founding", "unpaid")
  await addAccount("gone3", "founding", "incomplete_expired")
  expect(await countFoundingAccounts()).toBe(1)
})

test("ten live founding accounts read as SOLD OUT", async () => {
  for (let i = 0; i < 10; i++) await addAccount(`f${i}`, "founding", "active")
  expect(await countFoundingAccounts()).toBe(10)
  const s = computeFoundingSpots(await countFoundingAccounts())
  expect(s.soldOut).toBe(true)
  expect(s.remaining).toBe(0)
})

test("nine live founding accounts is one spot left, not sold out", async () => {
  for (let i = 0; i < 9; i++) await addAccount(`f${i}`, "founding", "active")
  await addAccount("churned", "founding", "canceled")
  const s = computeFoundingSpots(await countFoundingAccounts())
  expect(s.soldOut).toBe(false)
  expect(s.remaining).toBe(1)
})
