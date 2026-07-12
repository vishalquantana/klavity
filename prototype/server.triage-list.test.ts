import { test, expect } from "bun:test"
import { tmpdir } from "node:os"; import { join } from "node:path"
const file = join(tmpdir(), `klav-triage-list-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file; delete process.env.TURSO_AUTH_TOKEN
const { db, applySchema, migrateV2, insertFeedback, listTriageFeedback } = await import("./lib/db")
const { saveFeedbackReplay } = await import("./lib/feedback-replay")
await applySchema(db!); await migrateV2(db!)
const P = `proj_tl_${Date.now()}`

test("listTriageFeedback returns only new items", async () => {
  await insertFeedback({ projectId: P, priority: "high", observation: "auto accepted" })   // open
  const n = await insertFeedback({ projectId: P, priority: "low", observation: "needs triage", suggestedBug: { title: "Bug X" } }) // new
  const list = await listTriageFeedback(P)
  expect(list.length).toBe(1)
  expect(list[0].id).toBe(n)
  expect(list[0].title).toBe("Bug X")
})

// JTBD 2.8: each triage row is enriched with inline-evidence fields so the row can expand to full
// context (replay + captured console/network) without leaving the inbox.
test("listTriageFeedback surfaces hasReplay + clientContext for inline evidence", async () => {
  const P2 = `proj_tl_ev_${Date.now()}`
  const withCtx = await insertFeedback({
    projectId: P2,
    priority: "medium",   // low/medium stays 'new' (needs triage); high/urgent auto-accepts to 'open'
    observation: "checkout crashes",
    suggestedBug: { title: "Checkout crash" },
    clientContext: {
      userAgent: "TestBrowser/1.0",
      consoleErrors: [{ message: "TypeError: undefined is not a function", level: "error", timestamp: 1 }],
      networkFailures: [{ url: "https://api.example/pay", status: 500, method: "POST", timestamp: 2 }],
    },
  })
  const plain = await insertFeedback({ projectId: P2, priority: "low", observation: "minor typo" })
  // Attach a session replay to the first report only.
  await saveFeedbackReplay(P2, withCtx, [{ type: 4, data: {}, timestamp: 1 }, { type: 3, data: {}, timestamp: 2 }])

  const list = await listTriageFeedback(P2)
  const byId = Object.fromEntries(list.map((r: any) => [r.id, r]))
  expect(byId[withCtx].hasReplay).toBe(true)
  expect(byId[withCtx].clientContext.consoleErrors.length).toBe(1)
  expect(byId[withCtx].clientContext.networkFailures[0].status).toBe(500)
  expect(byId[plain].hasReplay).toBe(false)
  expect(byId[plain].clientContext).toBeNull()
})
