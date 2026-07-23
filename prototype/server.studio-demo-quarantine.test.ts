// KLAVITYKLA-256 (JTBD 3.4 — quarantine the Studio demo): the bare /app demo funnel files MOCK
// "Acme Finance" findings against the sentinel host studio.klavity.local. Those saves are tagged
// source='studio-demo' and MUST NOT interleave with real client findings in the real project's
// New-reports triage. This test drives the persistence layer directly against a temp DB (same
// in-process harness as server.studio-draft-dedup.test.ts) and asserts the sandbox rows are
// excluded from both listTriageFeedback and the cross-project inbox new-report count, while a real
// report on the same project still appears.

import { test, expect } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-studio-demo-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const {
  db, applySchema, migrateV2,
  insertFeedback, listTriageFeedback, listInboxForProjects,
} = await import("./lib/db")

await applySchema(db!)
await migrateV2(db!)

const P = `proj_studio_demo_${Date.now()}`

test("demo-tagged (source='studio-demo') feedback is excluded from the real New-reports triage", async () => {
  // A real client finding on the project — belongs in triage.
  const realId = await insertFeedback({
    projectId: P,
    urlHost: "app.acme.com",
    urlPath: "/reports",
    observation: "Export button does nothing on the reports page.",
    priority: "low", // stays 'new' (needs triage)
    issueKey: "real-1",
  })

  // A bare /app demo-funnel save: mock Acme Finance dashboard, sentinel host, quarantined.
  const demoId = await insertFeedback({
    projectId: P,
    urlHost: "studio.klavity.local",
    urlPath: "/acme-finance/overview",
    observation: "Sim reaction: revenue should be front and centre.",
    priority: "low",
    issueKey: "demo-1",
    source: "studio-demo",
  })

  const triage = await listTriageFeedback(P)
  const ids = triage.map((t: any) => t.id)

  // The real finding is in the New-reports triage; the demo save is NOT.
  expect(ids).toContain(realId)
  expect(ids).not.toContain(demoId)
})

test("demo-tagged feedback does not inflate the cross-project inbox new-report count", async () => {
  const inbox = await listInboxForProjects([P])
  const row = inbox.find((r: any) => r.projectId === P)
  expect(row).toBeTruthy()
  // Exactly one real 'new' report counts; the studio-demo row is quarantined out.
  expect(row!.newReportCount).toBe(1)
  expect(row!.topReports.some((t: any) => t.title.includes("Export button"))).toBe(true)
  expect(row!.topReports.some((t: any) => t.title.includes("revenue should be front"))).toBe(false)
})
