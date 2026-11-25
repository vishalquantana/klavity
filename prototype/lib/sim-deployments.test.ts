// prototype/lib/sim-deployments.test.ts — Select Sims management state (isolated table).
// Hermetic: in-memory libsql, no server.
import { test, expect } from "bun:test"
import { createClient, type Client } from "@libsql/client"
import { ensureSimDeploymentsTable, listSimDeploymentStates, applySimAction, nextSimState } from "./sim-deployments"

async function fresh(): Promise<Client> {
  const c = createClient({ url: "file::memory:" })
  await ensureSimDeploymentsTable(c)
  return c
}

test("Sims with no row default to not_deployed / not_running", async () => {
  const c = await fresh()
  const m = await listSimDeploymentStates(c, "p1", ["a", "b"])
  expect(m.get("a")).toMatchObject({ deployment: "not_deployed", execution: "not_running" })
  expect(m.size).toBe(2)
})

test("deploy → pause → resume → deactivate → redeploy follows the status table", async () => {
  const c = await fresh()
  let r = await applySimAction(c, "p1", ["a"], "deploy", "u@x.com")
  expect(r.applied).toEqual(["a"])
  expect(r.states[0]).toMatchObject({ deployment: "deployed", execution: "running", updatedBy: "u@x.com" })
  r = await applySimAction(c, "p1", ["a"], "pause", null)
  expect(r.states[0]).toMatchObject({ deployment: "deployed", execution: "paused" })
  r = await applySimAction(c, "p1", ["a"], "resume", null)
  expect(r.states[0]).toMatchObject({ deployment: "deployed", execution: "running" })
  r = await applySimAction(c, "p1", ["a"], "deactivate", null)
  expect(r.states[0]).toMatchObject({ deployment: "deactivated", execution: "not_running" })
  r = await applySimAction(c, "p1", ["a"], "deploy", null)
  expect(r.states[0]).toMatchObject({ deployment: "deployed", execution: "running" })
})

test("incompatible ids in a bulk action are skipped, never force-applied", async () => {
  const c = await fresh()
  await applySimAction(c, "p1", ["a"], "deploy", null)
  const r = await applySimAction(c, "p1", ["a", "b"], "deploy", null)
  expect(r.applied).toEqual(["b"])
  expect(r.skipped.map((s) => s.simId)).toEqual(["a"])
  const d = await applySimAction(c, "p1", ["a", "c"], "deactivate", null)
  expect(d.applied).toEqual(["a"])
  expect(d.skipped.map((s) => s.simId)).toEqual(["c"])
  const m = await listSimDeploymentStates(c, "p1", ["c"])
  expect(m.get("c")!.deployment).toBe("not_deployed")
})

test("state is project-scoped", async () => {
  const c = await fresh()
  await applySimAction(c, "p1", ["a"], "deploy", null)
  const other = await listSimDeploymentStates(c, "p2", ["a"])
  expect(other.get("a")!.deployment).toBe("not_deployed")
})

test("pause/resume only apply to the matching execution state", () => {
  const base = { simId: "a", updatedAt: null, updatedBy: null }
  expect(nextSimState({ ...base, deployment: "not_deployed", execution: "not_running" }, "pause")).toBeNull()
  expect(nextSimState({ ...base, deployment: "deployed", execution: "paused" }, "pause")).toBeNull()
  expect(nextSimState({ ...base, deployment: "deployed", execution: "running" }, "resume")).toBeNull()
  expect(nextSimState({ ...base, deployment: "deactivated", execution: "not_running" }, "deactivate")).toBeNull()
})
