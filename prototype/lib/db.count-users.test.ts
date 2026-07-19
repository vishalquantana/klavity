// countUsers() backs the PostHog session-replay gate (KLAVITYKLA-329): it reports how
// many tool users exist so we only record the first ~50. Verify it counts real rows.
import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-count-users-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import { applySchema, countUsers, reconnectDb, upsertUser } from "./db"

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
})

test("countUsers starts at zero on a fresh DB", async () => {
  expect(await countUsers()).toBe(0)
})

test("countUsers reflects inserted users and de-dups by email", async () => {
  await upsertUser("a@example.com")
  await upsertUser("b@example.com")
  expect(await countUsers()).toBe(2)
  // upsert on an existing email must not inflate the count.
  await upsertUser("a@example.com")
  expect(await countUsers()).toBe(2)
  await upsertUser("c@example.com")
  expect(await countUsers()).toBe(3)
})
