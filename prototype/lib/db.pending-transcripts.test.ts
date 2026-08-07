import { test, expect } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { insertPendingTranscript, getPendingTranscript, deletePendingTranscript } from "./db"

useIsolatedDb("klav-pending-tx")

test("pending transcript round-trips payload and is project-scoped", async () => {
  const id = await insertPendingTranscript("proj_1", { groups: [{ simId: "sim_1", ops: [] }] })
  const got = await getPendingTranscript("proj_1", id)
  expect(got?.payload.groups[0].simId).toBe("sim_1")
  expect(await getPendingTranscript("proj_other", id)).toBe(null) // scoped
  await deletePendingTranscript(id)
  expect(await getPendingTranscript("proj_1", id)).toBe(null)
})
