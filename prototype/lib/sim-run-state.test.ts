// Per-user Run / Stop state for Sims (lib/sim-run-state.ts).
import { expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { runningSimIds, runSims, stopSims, clearSimRuns } from "./sim-run-state"

const c = createClient({ url: "file:" + join(tmpdir(), `klav-sim-run-${Date.now()}-${randomUUID()}.db`) })
const P = "proj_1", ME = "me@t.local", YOU = "you@t.local"

test("no row = stopped", async () => {
  expect([...(await runningSimIds(c, P, ME))]).toEqual([])
})

test("run is per user, idempotent, and case-insensitive on the email", async () => {
  await runSims(c, P, ME, ["a", "b"])
  await runSims(c, P, "ME@T.local", ["a"])
  expect([...(await runningSimIds(c, P, ME))].sort()).toEqual(["a", "b"])
  expect([...(await runningSimIds(c, P, YOU))]).toEqual([])   // a teammate is unaffected
})

test("stop one Sim, then stop all (the card's Close) — only for this user", async () => {
  await runSims(c, P, YOU, ["a"])
  await stopSims(c, P, ME, ["a"])
  expect([...(await runningSimIds(c, P, ME))]).toEqual(["b"])
  await stopSims(c, P, ME, null)
  expect([...(await runningSimIds(c, P, ME))]).toEqual([])
  expect([...(await runningSimIds(c, P, YOU))]).toEqual(["a"])
})

test("deactivating a Sim (clearSimRuns) stops it for every user", async () => {
  await runSims(c, P, ME, ["a"])
  await clearSimRuns(c, P, "a")
  expect([...(await runningSimIds(c, P, ME))]).toEqual([])
  expect([...(await runningSimIds(c, P, YOU))]).toEqual([])
})

test("state is project-scoped", async () => {
  await runSims(c, "proj_2", ME, ["z"])
  expect([...(await runningSimIds(c, P, ME))]).toEqual([])
  expect([...(await runningSimIds(c, "proj_2", ME))]).toEqual(["z"])
})
