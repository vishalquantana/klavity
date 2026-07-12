// A.8 occurrence receipts: a deduped repeat report's OWN verbatim description + screenshot + date
// must survive (not be discarded on the recurrence counter-bump), and surface as a chronological
// per-ticket occurrence timeline. Mirrors the subprocess-free temp-DB harness of server.dedup.test.ts:
// it exercises the db + recurrence-memory helpers directly rather than driving HTTP.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  reconnectDb, applySchema, insertFeedback, feedbackById, bumpFeedbackRecurrence,
  insertFeedbackOccurrence, listFeedbackOccurrences,
} from "./lib/db"
import { buildRecurrenceMemory } from "./lib/recurrence-memory"
import { issueKeyFor } from "./lib/dedup"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const dbFile = join(tmpdir(), `klav-occ-${ts}.db`)
const rawClient = createClient({ url: "file:" + dbFile })
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

const NOW = Date.now()
const P = `proj_occ_${ts}`

beforeAll(async () => {
  reconnectDb("file:" + dbFile)
  const c = createClient({ url: "file:" + dbFile })
  await applySchema(c)
  c.close()
  await rawExec(
    `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  )
  await rawExec(`INSERT OR IGNORE INTO projects (id, account_id, name, created_at, updated_at) VALUES (?,?,?,?,?)`, [P, "acct_test", "Occurrence Project", NOW, NOW])
})

afterAll(() => { rawClient.close() })

function keyFor(urlPath: string): string {
  return issueKeyFor({ projectId: P, urlPath, issueType: "flow", citedTraitIds: ["T1"] })
}

test("deduped repeat report persists its own verbatim description + screenshot + date", async () => {
  // Original report.
  const head = await insertFeedback({
    projectId: P, urlPath: "/checkout", observation: "checkout button does nothing",
    screenshotId: "shot_orig", sourceQuote: null,
    suggestedBug: { title: "Pay dead", body: "b", priority: "medium" },
    issueKey: keyFor("/checkout"),
  })

  // Second (deduped) report — DIFFERENT wording + DIFFERENT screenshot, later date.
  const seen2 = NOW + 3 * 86_400_000
  await bumpFeedbackRecurrence(head, seen2)
  await insertFeedbackOccurrence({
    feedbackId: head, projectId: P, seenAt: seen2,
    observation: "STILL can't check out", screenshotId: "shot_second",
    sourceQuote: null, reporterEmail: "vishal@quantana.com.au",
  })

  // The second occurrence's evidence is retrievable — nothing but the replay is overwritten.
  const occ = await listFeedbackOccurrences(head)
  expect(occ.length).toBe(1)
  expect(occ[0].observation).toBe("STILL can't check out")
  expect(occ[0].screenshotId).toBe("shot_second")
  expect(occ[0].seenAt).toBe(seen2)
  expect(occ[0].reporterEmail).toBe("vishal@quantana.com.au")

  // The head row's own original description is untouched.
  const row = await feedbackById(P, head)
  expect(row.observation).toBe("checkout button does nothing")
  expect((row.recurrenceCount ?? row.recurrence_count)).toBe(2)
})

test("recurrence memory renders a chronological timeline with each occurrence's own wording + screenshot", async () => {
  const head = await insertFeedback({
    projectId: P, urlPath: "/cart", observation: "cart total is wrong",
    screenshotId: "cart_shot_1",
    suggestedBug: { title: "Cart", body: "b", priority: "medium" },
    issueKey: keyFor("/cart"),
  })
  const t2 = NOW + 2 * 86_400_000
  const t3 = NOW + 5 * 86_400_000
  await bumpFeedbackRecurrence(head, t2)
  await insertFeedbackOccurrence({ feedbackId: head, projectId: P, seenAt: t2, observation: "tax added twice", screenshotId: "cart_shot_2" })
  await bumpFeedbackRecurrence(head, t3)
  await insertFeedbackOccurrence({ feedbackId: head, projectId: P, seenAt: t3, observation: "now the total is negative", screenshotId: "cart_shot_3" })

  const mem = await buildRecurrenceMemory(rawClient, head, P)
  expect(mem).not.toBeNull()
  expect(mem!.count).toBe(3)

  const occ = mem!.occurrences
  expect(occ.length).toBe(3)
  // Chronological.
  expect(occ.map((o) => o.seenAt)).toEqual([...occ.map((o) => o.seenAt)].sort((a, b) => a - b))
  // Each occurrence carries ITS OWN wording + screenshot (not just the head report's).
  expect(occ[0].isOriginal).toBe(true)
  expect(occ[0].observation).toBe("cart total is wrong")
  expect(occ[0].screenshotId).toBe("cart_shot_1")
  expect(occ[1].observation).toBe("tax added twice")
  expect(occ[1].screenshotId).toBe("cart_shot_2")
  expect(occ[1].isOriginal).toBe(false)
  expect(occ[2].observation).toBe("now the total is negative")
  expect(occ[2].screenshotId).toBe("cart_shot_3")
})

test("first-report (non-dedup) behavior unchanged: single occurrence, no stored receipts", async () => {
  const head = await insertFeedback({
    projectId: P, urlPath: "/solo", observation: "one-off report",
    suggestedBug: { title: "Solo", body: "b", priority: "low" },
    issueKey: keyFor("/solo"),
  })
  const occ = await listFeedbackOccurrences(head)
  expect(occ.length).toBe(0)
  const mem = await buildRecurrenceMemory(rawClient, head, P)
  expect(mem!.count).toBe(1)
  expect(mem!.occurrences.length).toBe(1)
  expect(mem!.occurrences[0].isOriginal).toBe(true)
  expect(mem!.occurrences[0].observation).toBe("one-off report")
})
