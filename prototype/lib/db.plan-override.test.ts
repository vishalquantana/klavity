// Snap-only project gating: verify plan_override round-trips through setProjectPlanOverride +
// projectById, and that projectById always exposes planOverride (null by default).
import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-plan-override-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import { applySchema, ensureAccount, projectById, reconnectDb, setProjectPlanOverride } from "./db"

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
})

test("setProjectPlanOverride + projectById round-trips plan_override", async () => {
  const email = "vishal@quantana.com.au"
  const memberships = await ensureAccount(email)
  const accountId = memberships[0].workspaceId
  const projectId = "proj_" + accountId

  const before = await projectById(projectId)
  expect(before?.planOverride).toBe(null)

  await setProjectPlanOverride(projectId, "snap")
  const locked = await projectById(projectId)
  expect(locked?.planOverride).toBe("snap")

  await setProjectPlanOverride(projectId, null)
  const cleared = await projectById(projectId)
  expect(cleared?.planOverride).toBe(null)
})
