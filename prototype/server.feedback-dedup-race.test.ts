// KLA-730 PATH B (dedup-race) negative control — exercises the db helper directly (no HTTP), mirroring
// the subprocess-free temp-DB harness of server.occurrence-receipts.test.ts.
//
// The race: findDuplicateFeedback returns head A → a concurrent delete removes A → bumpFeedbackRecurrence(A)
// updates ZERO rows. Pre-fix, bump returned void (undefined) regardless, so the /api/feedback handler
// assigned feedbackId=A and reported {saved:true} though nothing was persisted. The fix makes bump return
// a boolean: TRUE only when a row was truly touched, so the handler can fall through to fail-closed on a
// miss. This test pins that boundary:
//   • bump on a live row → TRUE  (and the recurrence_count actually increments — proves it really wrote)
//   • bump on a deleted row → FALSE (the exact dedup-race outcome that must NOT be treated as saved)
// The FALSE assertion FAILS against pre-fix code (which returns undefined, not false).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { reconnectDb, applySchema, insertFeedback, feedbackById, bumpFeedbackRecurrence } from "./lib/db"
import { issueKeyFor } from "./lib/dedup"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const dbFile = join(tmpdir(), `klav-ddr-${ts}.db`)
const rawClient = createClient({ url: "file:" + dbFile })
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

const NOW = Date.now()
const P = `proj_ddr_${ts}`

beforeAll(async () => {
  reconnectDb("file:" + dbFile)
  const c = createClient({ url: "file:" + dbFile })
  await applySchema(c)
  c.close()
  await rawExec(
    `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  )
  await rawExec(`INSERT OR IGNORE INTO projects (id, account_id, name, created_at, updated_at) VALUES (?,?,?,?,?)`, [P, "acct_test", "Dedup Race Project", NOW, NOW])
})

afterAll(() => { rawClient.close() })

test("KLA-730 PATH B: bump on a LIVE row returns true and actually increments recurrence_count", async () => {
  const head = await insertFeedback({
    projectId: P, urlPath: "/pay", observation: "pay button dead",
    suggestedBug: { title: "Pay dead", body: "b", priority: "medium" },
    issueKey: issueKeyFor({ projectId: P, urlPath: "/pay", issueType: "flow", citedTraitIds: ["T1"] }),
  })
  const before = await feedbackById(P, head)
  const ok = await bumpFeedbackRecurrence(head, NOW + 86_400_000)
  expect(ok).toBe(true)
  const after = await feedbackById(P, head)
  // Proves the TRUE result reflects a real write, not just a "row exists" flag.
  expect(Number((after as any).recurrenceCount ?? 0)).toBeGreaterThan(Number((before as any).recurrenceCount ?? 0))
})

test("KLA-730 PATH B neg-control: bump on a DELETED row (dedup race) returns false — not saved", async () => {
  const head = await insertFeedback({
    projectId: P, urlPath: "/checkout", observation: "checkout dead",
    suggestedBug: { title: "Checkout dead", body: "b", priority: "medium" },
    issueKey: issueKeyFor({ projectId: P, urlPath: "/checkout", issueType: "flow", citedTraitIds: ["T2"] }),
  })
  // Simulate the concurrent delete that happens AFTER findDuplicateFeedback returned this head but
  // BEFORE the recurrence bump lands — the exact TOCTOU window.
  await rawExec("DELETE FROM feedback WHERE id=?", [head])
  const ok = await bumpFeedbackRecurrence(head, NOW + 86_400_000)
  // Pre-fix this returned undefined; the fix returns an explicit false so the handler won't claim saved.
  expect(ok).toBe(false)
  // And confirm nothing was resurrected/written for that id.
  const gone = await feedbackById(P, head)
  expect(gone == null).toBe(true)
})
