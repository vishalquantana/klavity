// KLAVITYKLA-261 — daily per-project Sims digest. Verifies the 24h aggregation reads the real
// schema without column errors, counts Sim feedback (incl. recurrence), and that the pure
// email/text/Slack renderers never throw on the aggregated data.
//
// DB isolation: uses useIsolatedDb() (see test-db-isolation.ts) so each test runs against this
// file's own temp SQLite file with the full schema applied — order-invariant across test files.
import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import {
  gatherSimsDigest,
  buildSimsDigestHtml,
  buildSimsDigestText,
  buildSimsDigestSlackPayload,
} from "./sims-digest"

const { getClient } = useIsolatedDb("klav-sims-digest")

let seq = 0
async function freshProject(): Promise<{ accountId: string; projectId: string }> {
  const c = getClient()
  const n = ++seq
  const accountId = `acct_sd_${n}`
  const projectId = `proj_sd_${n}`
  const now = Date.now()
  await c.execute({ sql: "INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", args: [accountId, `A${n}`, `owner${n}@quantana.com.au`, now] })
  await c.execute({ sql: "INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", args: [projectId, accountId, `Client ${n}`, now, now] })
  return { accountId, projectId }
}

async function addSimFeedback(projectId: string, opts: { at: number; recurrence?: number; title?: string; simId?: string }) {
  const c = getClient()
  const n = ++seq
  await c.execute({
    sql: `INSERT INTO feedback (id, project_id, sim_id, observation, suggested_bug_json, recurrence_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      `fb_sd_${n}`, projectId, opts.simId ?? `sim_${n}`,
      "the checkout button did nothing",
      JSON.stringify({ title: opts.title ?? `Issue ${n}` }),
      opts.recurrence ?? 1, opts.at,
    ],
  })
}

// ── empty project: every query executes (validates schema) + quiet day ──────────────────────────
test("gatherSimsDigest on an empty project is a quiet day with zero counts (no SQL/column errors)", async () => {
  const { projectId } = await freshProject()
  const end = Date.now()
  const start = end - 24 * 60 * 60 * 1000
  const d = await gatherSimsDigest(getClient(), projectId, start, end)
  expect(d.isQuietDay).toBe(true)
  expect(d.issuesFoundTotal).toBe(0)
  expect(d.reviewSessionsTotal).toBe(0)
  expect(d.regressionsReconfirmedTotal).toBe(0)
  expect(d.projectName).toBe(projectId.replace("proj_sd_", "Client "))
})

// ── counts Sim feedback in-window, incl. recurrence + highlights ────────────────────────────────
test("gatherSimsDigest counts in-window Sim feedback and flags recurring issues", async () => {
  const { projectId } = await freshProject()
  const end = Date.now()
  const start = end - 24 * 60 * 60 * 1000
  await addSimFeedback(projectId, { at: end - 1000, recurrence: 3, title: "Recurring: cart empties" })
  await addSimFeedback(projectId, { at: end - 2000, recurrence: 1, title: "Fresh: 404 on help" })
  await addSimFeedback(projectId, { at: start - 60_000, recurrence: 1, title: "Too old — excluded" }) // before window

  const d = await gatherSimsDigest(getClient(), projectId, start, end)
  expect(d.issuesFoundTotal).toBe(2)         // the old one is excluded by the window
  expect(d.recurringIssuesTotal).toBe(1)     // only recurrence>1 counts as recurring
  expect(d.isQuietDay).toBe(false)
  expect(d.issueHighlights.length).toBe(2)
  expect(d.issueHighlights.some(h => h.isRecurring)).toBe(true)
})

// ── tenant isolation: another project's feedback never leaks in ─────────────────────────────────
test("gatherSimsDigest is scoped to the given project", async () => {
  const a = await freshProject()
  const b = await freshProject()
  const end = Date.now()
  const start = end - 24 * 60 * 60 * 1000
  await addSimFeedback(a.projectId, { at: end - 1000 })
  await addSimFeedback(a.projectId, { at: end - 1000 })
  await addSimFeedback(b.projectId, { at: end - 1000 })

  const da = await gatherSimsDigest(getClient(), a.projectId, start, end)
  const db2 = await gatherSimsDigest(getClient(), b.projectId, start, end)
  expect(da.issuesFoundTotal).toBe(2)
  expect(db2.issuesFoundTotal).toBe(1)
})

// ── pure renderers never throw and produce the expected shapes ──────────────────────────────────
test("buildSimsDigest{Html,Text,Slack} render without throwing", async () => {
  const { projectId } = await freshProject()
  const end = Date.now()
  const start = end - 24 * 60 * 60 * 1000
  await addSimFeedback(projectId, { at: end - 1000, recurrence: 2, title: "<script>alert(1)</script> XSS-y title" })
  const d = await gatherSimsDigest(getClient(), projectId, start, end)

  const html = buildSimsDigestHtml(d)
  expect(typeof html).toBe("string")
  expect(html).toContain(d.projectName)
  expect(html).not.toContain("<script>alert(1)</script>") // escaped, not raw

  const text = buildSimsDigestText(d)
  expect(typeof text).toBe("string")
  expect(text.length).toBeGreaterThan(0)

  const slack = buildSimsDigestSlackPayload(d)
  expect(typeof slack.text).toBe("string")
  expect(Array.isArray(slack.blocks)).toBe(true)
})
