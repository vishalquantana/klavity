// Snap routing: verify the per-project human-Snap routing mode round-trips through setSnapRouting +
// projectById/getSnapRouting, that it DEFAULTS to 'autofile', and that unknown values normalize safely.
import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-snap-routing-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import { applySchema, ensureAccount, getSnapRouting, normalizeSnapRouting, projectById, reconnectDb, setSnapRouting } from "./db"

beforeAll(async () => {
  const c = reconnectDb("file:" + file)
  await applySchema(c)
})

test("snap_routing defaults to autofile and round-trips through setSnapRouting", async () => {
  const email = "vishal@quantana.com.au"
  const memberships = await ensureAccount(email)
  const accountId = memberships[0].workspaceId
  const projectId = "proj_" + accountId

  // Default: brand-new project files Snaps directly (autofile).
  const before = await projectById(projectId)
  expect(before?.snapRouting).toBe("autofile")
  expect(await getSnapRouting(projectId)).toBe("autofile")

  // Switch to review-first.
  await setSnapRouting(projectId, "review")
  expect((await projectById(projectId))?.snapRouting).toBe("review")
  expect(await getSnapRouting(projectId)).toBe("review")

  // Back to autofile.
  await setSnapRouting(projectId, "autofile")
  expect(await getSnapRouting(projectId)).toBe("autofile")
})

test("normalizeSnapRouting coerces unknown/empty values to autofile", () => {
  expect(normalizeSnapRouting("review")).toBe("review")
  expect(normalizeSnapRouting("autofile")).toBe("autofile")
  expect(normalizeSnapRouting("nonsense")).toBe("autofile")
  expect(normalizeSnapRouting("")).toBe("autofile")
  expect(normalizeSnapRouting(null)).toBe("autofile")
  expect(normalizeSnapRouting(undefined)).toBe("autofile")
})

test("setSnapRouting normalizes an out-of-range value before persisting", async () => {
  const email = "vishal@quantana.com.au"
  const memberships = await ensureAccount(email)
  const projectId = "proj_" + memberships[0].workspaceId
  await setSnapRouting(projectId, "bogus")
  expect((await projectById(projectId))?.snapRouting).toBe("autofile")
})
