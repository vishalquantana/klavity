// server.regression-receipt.test.ts — B.7 (KLAVITYKLA-247) client regression-caught receipt.
//
// When a guard-caught (checkpoint-gone) regression's auto-filed ticket is CLOSED, the closer can send
// the original reporter a forwardable "caught & fixed before it reached your users" receipt. This test
// proves the two acceptance criteria that are cheapest to verify hermetically at the lib layer:
//   1. OFFER-GATING — guardCaughtForFeedback returns true ONLY for tickets whose issue/expectation has
//      a GUARD regression event; ordinary tickets return false.
//   2. RECIPIENT RESOLUTION across a dedup cluster — the head contact_email PLUS every stored
//      feedback_occurrences.reporter_email are resolved (deduped, validated).
//   3. SEND + RECORD + graceful SKIP — a guard-caught close with a reporter contact sends via the A.4
//      transport and records an auditable receipt; an ordinary ticket / no-contact skips (no send).
//
// Mirrors the temp-DB harness of server.occurrence-receipts.test.ts (no HTTP): exercises the real DB +
// the regression-receipt lib directly.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  reconnectDb, applySchema, insertFeedback, setFeedbackContactEmail,
  bumpFeedbackRecurrence, insertFeedbackOccurrence, updateFeedbackMeta,
} from "./lib/db"
import { publishRegressionEvent } from "./lib/regression-events"
import {
  guardCaughtForFeedback, resolveReceiptRecipients, sendRegressionCaughtReceipt,
  latestReceiptForFeedback, buildReceiptEmail,
} from "./lib/regression-receipt"
import { issueKeyFor } from "./lib/dedup"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const dbFile = join(tmpdir(), `klav-regrcpt-${ts}.db`)
const rawClient = createClient({ url: "file:" + dbFile })
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

const NOW = Date.now()
const P = `proj_regrcpt_${ts}`

beforeAll(async () => {
  reconnectDb("file:" + dbFile)
  const c = createClient({ url: "file:" + dbFile })
  await applySchema(c)
  c.close()
  await rawExec(
    `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  )
  await rawExec(`INSERT OR IGNORE INTO projects (id, account_id, name, created_at, updated_at) VALUES (?,?,?,?,?)`, [P, "acct_test", "Receipt Project", NOW, NOW])
})

afterAll(() => { rawClient.close() })

function keyFor(urlPath: string): string {
  return issueKeyFor({ projectId: P, urlPath, issueType: "flow", citedTraitIds: ["T1"] })
}

// Seed an expectation on the ticket's issue_key and publish a GUARD regression event on it — this is
// exactly what B.2 (findings.expectation_id) + B.6 (guard alarm) leave behind for a guard-caught fix.
async function seedGuardCaught(issueKey: string, expectationId: string, firstFixedAt: number, caughtAt: number) {
  await rawExec(
    `INSERT OR IGNORE INTO expectations (id, project_id, title, dedup_key, status, source_refs_json, corroboration_json, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [expectationId, P, "Signup guard", issueKey, "enforced", "[]", "{}", NOW, NOW],
  )
  await publishRegressionEvent({
    projectId: P, issueKey, source: "guard", title: "Signup regression",
    expectationId, firstFixedAt, at: caughtAt,
  }, { db: rawClient, notify: false })
}

test("offer-gating: a guard-caught ticket resolves guardCaught=true; an ordinary ticket resolves false", async () => {
  const guardKey = keyFor("/signup")
  const guardTicket = await insertFeedback({
    projectId: P, urlPath: "/signup", observation: "signup fails after deploy",
    suggestedBug: { title: "Signup broken", body: "b", priority: "high" }, issueKey: guardKey,
  })
  const firstFixed = NOW - 40 * 86_400_000
  const caughtAt = firstFixed + 30 * 60_000 // caught 30 min after the first fix → "within the hour"
  await seedGuardCaught(guardKey, `exp_${ts}`, firstFixed, caughtAt)

  const guardInfo = await guardCaughtForFeedback(rawClient, P, guardTicket)
  expect(guardInfo.guardCaught).toBe(true)
  expect(guardInfo.expectationId).toBe(`exp_${ts}`)
  expect(guardInfo.firstFixedAt).toBe(firstFixed)
  expect(guardInfo.caughtAt).toBe(caughtAt)

  // Ordinary ticket (no expectation, no guard event) → NOT guard-caught → no offer.
  const ordinary = await insertFeedback({
    projectId: P, urlPath: "/help", observation: "typo on help page",
    suggestedBug: { title: "Typo", body: "b", priority: "low" }, issueKey: keyFor("/help"),
  })
  const ordinaryInfo = await guardCaughtForFeedback(rawClient, P, ordinary)
  expect(ordinaryInfo.guardCaught).toBe(false)
})

test("recipient resolution: head contact + every occurrence reporter_email across the dedup cluster", async () => {
  const key = keyFor("/checkout")
  const head = await insertFeedback({
    projectId: P, urlPath: "/checkout", observation: "cannot check out",
    suggestedBug: { title: "Checkout dead", body: "b", priority: "high" }, issueKey: key,
  })
  // Original reporter on the head row.
  await setFeedbackContactEmail(head, P, "alice@client.example")
  // Two later (deduped) reports each with their OWN reporter email — the cluster's other reporters.
  const seen2 = NOW + 2 * 86_400_000
  await bumpFeedbackRecurrence(head, seen2)
  await insertFeedbackOccurrence({ feedbackId: head, projectId: P, seenAt: seen2, observation: "still broken", reporterEmail: "bob@client.example" })
  const seen3 = NOW + 5 * 86_400_000
  await bumpFeedbackRecurrence(head, seen3)
  await insertFeedbackOccurrence({ feedbackId: head, projectId: P, seenAt: seen3, observation: "AGAIN", reporterEmail: "alice@client.example" }) // dup of head → collapses

  const recipients = await resolveReceiptRecipients(rawClient, P, head)
  expect(recipients.sort()).toEqual(["alice@client.example", "bob@client.example"])
})

test("send + record: guard-caught close with a reporter contact emails via A.4 transport and records an audit receipt", async () => {
  const key = keyFor("/login")
  const ticket = await insertFeedback({
    projectId: P, urlPath: "/login", observation: "login loop after deploy",
    suggestedBug: { title: "Login loop", body: "b", priority: "urgent" }, issueKey: key,
  })
  await setFeedbackContactEmail(ticket, P, "carol@client.example")
  const firstFixed = NOW - 10 * 86_400_000
  await seedGuardCaught(key, `exp_login_${ts}`, firstFixed, firstFixed + 45 * 60_000)
  await updateFeedbackMeta(P, ticket, { status: "done" })

  const sent: Array<{ to: string[]; subject: string }> = []
  const res = await sendRegressionCaughtReceipt(
    { projectId: P, feedbackId: ticket, projectName: "Acme", ticketTitle: "Login loop", sentBy: "closer@agency.example" },
    { db: rawClient, sendEmail: async (to, subject) => { sent.push({ to, subject }) } },
  )
  expect(res.ok).toBe(true)
  expect(res.sent).toBe(true)
  if (res.ok && res.sent) expect(res.recipients).toEqual(["carol@client.example"])
  expect(sent).toHaveLength(1)
  expect(sent[0].to).toEqual(["carol@client.example"])
  expect(sent[0].subject.toLowerCase()).toContain("caught")

  // Recorded for audit → the UI's "receipt sent" state.
  const rec = await latestReceiptForFeedback(rawClient, P, ticket)
  expect(rec).not.toBeNull()
  expect(rec!.recipients).toEqual(["carol@client.example"])
  expect(rec!.sentBy).toBe("closer@agency.example")
  expect(rec!.firstFixedAt).toBe(firstFixed)
})

test("graceful skip: ordinary ticket → not_guard_caught; guard-caught with no reporter → no_recipient (no send)", async () => {
  // Ordinary ticket.
  const ordinary = await insertFeedback({
    projectId: P, urlPath: "/faq", observation: "faq wording",
    suggestedBug: { title: "FAQ", body: "b", priority: "low" }, issueKey: keyFor("/faq"),
  })
  let sends = 0
  const r1 = await sendRegressionCaughtReceipt(
    { projectId: P, feedbackId: ordinary, projectName: "Acme", ticketTitle: "FAQ" },
    { db: rawClient, sendEmail: async () => { sends++ } },
  )
  expect(r1.ok).toBe(true)
  expect(r1.sent).toBe(false)
  if (r1.ok && !r1.sent) expect(r1.reason).toBe("not_guard_caught")

  // Guard-caught but NO reporter contact anywhere on the cluster.
  const key = keyFor("/reset")
  const noContact = await insertFeedback({
    projectId: P, urlPath: "/reset", observation: "password reset regressed",
    suggestedBug: { title: "Reset", body: "b", priority: "high" }, issueKey: key,
  })
  await seedGuardCaught(key, `exp_reset_${ts}`, NOW - 5 * 86_400_000, NOW - 5 * 86_400_000 + 60_000)
  const r2 = await sendRegressionCaughtReceipt(
    { projectId: P, feedbackId: noContact, projectName: "Acme", ticketTitle: "Reset" },
    { db: rawClient, sendEmail: async () => { sends++ } },
  )
  expect(r2.ok).toBe(true)
  expect(r2.sent).toBe(false)
  if (r2.ok && !r2.sent) expect(r2.reason).toBe("no_recipient")

  expect(sends).toBe(0) // nothing was ever transmitted on a skip
})

test("receipt copy is forwardable: carries first-fixed date, catch window, and fix confirmation", () => {
  const firstFixed = Date.parse("2026-03-12")
  const caughtAt = firstFixed + 40 * 60_000 // within the hour
  const { subject, text, html } = buildReceiptEmail({
    title: "signup issue", projectName: "Acme", firstFixedAt: firstFixed, caughtAt, fixedAt: Date.parse("2026-07-11"),
  })
  expect(subject.toLowerCase()).toContain("caught")
  expect(text).toContain("2026-03-12")          // first-fixed date
  expect(text).toContain("within the hour")      // catch window story
  expect(text).toContain("2026-07-11")           // re-fixed & confirmed
  expect(text).toContain("before it affected users")
  expect(html).toContain("Caught and fixed before it reached your users")
})
