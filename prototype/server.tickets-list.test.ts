import { test, expect } from "bun:test"
import { tmpdir } from "node:os"; import { join } from "node:path"
const file = join(tmpdir(), `klav-tickets-list-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file; delete process.env.TURSO_AUTH_TOKEN
const { db, applySchema, migrateV2, insertFeedback, updateFeedbackMeta, listTicketsPaginated } = await import("./lib/db")
await applySchema(db!); await migrateV2(db!)
const P = `proj_tkl_${Date.now()}`

test("listTicketsPaginated: returns all non-new tickets by default", async () => {
  const a = await insertFeedback({ projectId: P, priority: "high", observation: "Bug A" })
  const b = await insertFeedback({ projectId: P, priority: "low", observation: "Bug B" })
  await updateFeedbackMeta(P, a, { status: "open" })
  await updateFeedbackMeta(P, b, { status: "open" })
  const result = await listTicketsPaginated(P, {})
  expect(result.tickets.length).toBeGreaterThanOrEqual(2)
  expect(result.total).toBeGreaterThanOrEqual(2)
})

test("listTicketsPaginated: filters by priority", async () => {
  const P2 = `proj_tkl2_${Date.now()}`
  const a = await insertFeedback({ projectId: P2, priority: "urgent", observation: "Urgent bug" })
  const b = await insertFeedback({ projectId: P2, priority: "medium", observation: "Medium bug" })
  await updateFeedbackMeta(P2, a, { status: "open" })
  await updateFeedbackMeta(P2, b, { status: "open" })
  const r = await listTicketsPaginated(P2, { priorities: ["urgent"] })
  expect(r.tickets.length).toBe(1)
  expect(r.tickets[0].priority).toBe("urgent")
})

test("listTicketsPaginated: filters by status", async () => {
  const P3 = `proj_tkl3_${Date.now()}`
  const a = await insertFeedback({ projectId: P3, priority: "high", observation: "Open bug" })
  const b = await insertFeedback({ projectId: P3, priority: "medium", observation: "Done bug" })
  await updateFeedbackMeta(P3, a, { status: "open" })
  await updateFeedbackMeta(P3, b, { status: "done" })
  const r = await listTicketsPaginated(P3, { statuses: ["open"] })
  expect(r.tickets.every(t => t.status === "open")).toBe(true)
  expect(r.tickets.some(t => t.status === "done")).toBe(false)
})

test("listTicketsPaginated: pagination returns correct page size", async () => {
  const P4 = `proj_tkl4_${Date.now()}`
  for (let i = 0; i < 5; i++) {
    const id = await insertFeedback({ projectId: P4, observation: `Bug ${i}` })
    await updateFeedbackMeta(P4, id, { status: "open" })
  }
  const r = await listTicketsPaginated(P4, { limit: 2, page: 1 })
  expect(r.tickets.length).toBe(2)
  expect(r.total).toBe(5)
  expect(r.totalPages).toBe(3)
  const r2 = await listTicketsPaginated(P4, { limit: 2, page: 2 })
  expect(r2.tickets.length).toBe(2)
})

test("listTicketsPaginated: source filter sim vs human", async () => {
  const P5 = `proj_tkl5_${Date.now()}`
  const a = await insertFeedback({ projectId: P5, simId: "sim_abc", observation: "Sim bug" })
  const b = await insertFeedback({ projectId: P5, observation: "Human bug" })
  await updateFeedbackMeta(P5, a, { status: "open" })
  await updateFeedbackMeta(P5, b, { status: "open" })
  const sim = await listTicketsPaginated(P5, { source: "sim" })
  expect(sim.tickets.every(t => t.source === "sim")).toBe(true)
  const human = await listTicketsPaginated(P5, { source: "human" })
  expect(human.tickets.every(t => t.source === "human")).toBe(true)
})
