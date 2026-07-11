// KLA-255: needsConfirm queue tests.
// Verifies:
//  1. A needsConfirm result gets persisted via insertPendingSimMatch → appears in listPendingSimMatches.
//  2. confirm: sets status='confirmed', records chosenSimId + resolvedBy; candidates-validation rejects bad simId.
//  3. reject: sets status='rejected', clears chosenSimId; double-resolve returns false.
//  4. Tenant safety: queries are project-scoped — a row from project A is invisible to project B.

import { test, expect } from "bun:test"
import { tmpdir } from "node:os"; import { join } from "node:path"

const file = join(tmpdir(), `klav-needsconfirm-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file; delete process.env.TURSO_AUTH_TOKEN

const {
  db,
  applySchema,
  migrateV2,
  insertPendingSimMatch,
  listPendingSimMatches,
  getPendingSimMatch,
  confirmPendingSimMatch,
  rejectPendingSimMatch,
} = await import("./lib/db")

await applySchema(db!)
await migrateV2(db!)

const PA = `proj_nc_a_${Date.now()}`
const PB = `proj_nc_b_${Date.now()}`

const CANDIDATES = [
  { simId: "sim_alice", name: "Alice", role: "Product Manager" },
  { simId: "sim_al", name: "Al", role: "Engineer" },
]
const TX_ID = "tx_test_001"
const ACTOR = "vishal@quantana.com.au"

// ── 1. A needsConfirm result gets queued ────────────────────────────────────

test("insertPendingSimMatch: persists a pending item", async () => {
  const id = await insertPendingSimMatch({
    projectId: PA,
    transcriptId: TX_ID,
    personaName: "Alice K.",
    candidates: CANDIDATES,
  })
  expect(typeof id).toBe("string")
  expect(id.startsWith("psm_")).toBe(true)

  const row = await getPendingSimMatch(PA, id)
  expect(row).not.toBeNull()
  expect(row!.status).toBe("pending")
  expect(row!.projectId).toBe(PA)
  expect(row!.transcriptId).toBe(TX_ID)
  expect(row!.personaName).toBe("Alice K.")
  expect(row!.candidates).toEqual(CANDIDATES)
  expect(row!.chosenSimId).toBeNull()
  expect(row!.resolvedBy).toBeNull()
})

test("listPendingSimMatches: returns pending items for the project", async () => {
  await insertPendingSimMatch({ projectId: PA, transcriptId: TX_ID, personaName: "Bob", candidates: [{ simId: "sim_bob", name: "Bob", role: "Designer" }] })
  const items = await listPendingSimMatches(PA)
  expect(items.length).toBeGreaterThanOrEqual(1)
  expect(items.every(i => i.status === "pending")).toBe(true)
  expect(items.every(i => i.projectId === PA)).toBe(true)
})

// ── 2. confirm applies the match ─────────────────────────────────────────────

test("confirmPendingSimMatch: sets confirmed + chosenSimId + resolvedBy", async () => {
  const id = await insertPendingSimMatch({
    projectId: PA, transcriptId: TX_ID,
    personaName: "Carla", candidates: [{ simId: "sim_carla", name: "Carla", role: "CEO" }],
  })
  const ok = await confirmPendingSimMatch(PA, id, "sim_carla", ACTOR)
  expect(ok).toBe(true)

  const row = await getPendingSimMatch(PA, id)
  expect(row!.status).toBe("confirmed")
  expect(row!.chosenSimId).toBe("sim_carla")
  expect(row!.resolvedBy).toBe(ACTOR)
})

test("confirmPendingSimMatch: double-confirm returns false", async () => {
  const id = await insertPendingSimMatch({
    projectId: PA, transcriptId: TX_ID,
    personaName: "Dave", candidates: [{ simId: "sim_dave", name: "Dave", role: "QA" }],
  })
  await confirmPendingSimMatch(PA, id, "sim_dave", ACTOR)
  const second = await confirmPendingSimMatch(PA, id, "sim_dave", ACTOR)
  expect(second).toBe(false)
})

// ── 3. reject discards the item ──────────────────────────────────────────────

test("rejectPendingSimMatch: sets rejected, clears chosenSimId", async () => {
  const id = await insertPendingSimMatch({
    projectId: PA, transcriptId: TX_ID,
    personaName: "Eve", candidates: [{ simId: "sim_eve", name: "Eve", role: "Support" }],
  })
  const ok = await rejectPendingSimMatch(PA, id, ACTOR)
  expect(ok).toBe(true)

  const row = await getPendingSimMatch(PA, id)
  expect(row!.status).toBe("rejected")
  expect(row!.chosenSimId).toBeNull()
  expect(row!.resolvedBy).toBe(ACTOR)
})

test("rejectPendingSimMatch: double-reject returns false", async () => {
  const id = await insertPendingSimMatch({
    projectId: PA, transcriptId: TX_ID,
    personaName: "Frank", candidates: [{ simId: "sim_frank", name: "Frank", role: "Sales" }],
  })
  await rejectPendingSimMatch(PA, id, ACTOR)
  const second = await rejectPendingSimMatch(PA, id, ACTOR)
  expect(second).toBe(false)
})

test("rejectPendingSimMatch: confirmed item cannot be rejected", async () => {
  const id = await insertPendingSimMatch({
    projectId: PA, transcriptId: TX_ID,
    personaName: "Grace", candidates: [{ simId: "sim_grace", name: "Grace", role: "Designer" }],
  })
  await confirmPendingSimMatch(PA, id, "sim_grace", ACTOR)
  const rejectResult = await rejectPendingSimMatch(PA, id, ACTOR)
  expect(rejectResult).toBe(false)

  const row = await getPendingSimMatch(PA, id)
  expect(row!.status).toBe("confirmed")
})

// ── 4. Tenant safety ─────────────────────────────────────────────────────────

test("tenant safety: project A rows are invisible to project B", async () => {
  const idA = await insertPendingSimMatch({
    projectId: PA, transcriptId: TX_ID,
    personaName: "Cross-tenant", candidates: [{ simId: "sim_x", name: "X", role: "role" }],
  })
  // Project B should not see this row
  const fromB = await getPendingSimMatch(PB, idA)
  expect(fromB).toBeNull()

  const listB = await listPendingSimMatches(PB)
  const found = listB.find(i => i.id === idA)
  expect(found).toBeUndefined()
})

test("tenant safety: confirm from wrong project returns false", async () => {
  const idA = await insertPendingSimMatch({
    projectId: PA, transcriptId: TX_ID,
    personaName: "Hank", candidates: [{ simId: "sim_hank", name: "Hank", role: "Dev" }],
  })
  const ok = await confirmPendingSimMatch(PB, idA, "sim_hank", ACTOR)
  expect(ok).toBe(false)

  // Original row still pending in PA
  const row = await getPendingSimMatch(PA, idA)
  expect(row!.status).toBe("pending")
})

test("tenant safety: reject from wrong project returns false", async () => {
  const idA = await insertPendingSimMatch({
    projectId: PA, transcriptId: TX_ID,
    personaName: "Ivy", candidates: [{ simId: "sim_ivy", name: "Ivy", role: "PM" }],
  })
  const ok = await rejectPendingSimMatch(PB, idA, ACTOR)
  expect(ok).toBe(false)

  const row = await getPendingSimMatch(PA, idA)
  expect(row!.status).toBe("pending")
})

// ── 5. listPendingSimMatches does not return confirmed/rejected items ─────────

test("listPendingSimMatches: excludes resolved items", async () => {
  const P3 = `proj_nc_c_${Date.now()}`
  const idPending = await insertPendingSimMatch({ projectId: P3, transcriptId: TX_ID, personaName: "P", candidates: [{ simId: "sim_p", name: "P", role: "r" }] })
  const idConfirmed = await insertPendingSimMatch({ projectId: P3, transcriptId: TX_ID, personaName: "C", candidates: [{ simId: "sim_c", name: "C", role: "r" }] })
  const idRejected = await insertPendingSimMatch({ projectId: P3, transcriptId: TX_ID, personaName: "R", candidates: [{ simId: "sim_r", name: "R", role: "r" }] })
  await confirmPendingSimMatch(P3, idConfirmed, "sim_c", ACTOR)
  await rejectPendingSimMatch(P3, idRejected, ACTOR)

  const items = await listPendingSimMatches(P3)
  expect(items.length).toBe(1)
  expect(items[0].id).toBe(idPending)
})
