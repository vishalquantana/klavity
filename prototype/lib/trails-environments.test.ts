// KLA-93: per-trail named environments — unit tests for the data model and run selection.
// Uses a hermetic libsql file DB. No browser required.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-env-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

const T = await import("./trails")

test("trail created with environments stores and retrieves them", async () => {
  const projectId = "proj_env_create"
  const trailId = await T.createTrail(projectId, {
    name: "env-trail",
    baseUrl: "https://prod.example.com/",
    environments: [
      { name: "staging", baseUrl: "https://staging.example.com/" },
      { name: "local", baseUrl: "http://localhost:3000/" },
    ],
  })
  const trail = await T.getTrail(projectId, trailId)
  expect(trail).not.toBeNull()
  expect(trail!.environments).toHaveLength(2)
  expect(trail!.environments[0]).toEqual({ name: "staging", baseUrl: "https://staging.example.com/" })
  expect(trail!.environments[1]).toEqual({ name: "local", baseUrl: "http://localhost:3000/" })
})

test("trail created without environments has empty environments array", async () => {
  const projectId = "proj_env_empty"
  const trailId = await T.createTrail(projectId, {
    name: "no-env-trail",
    baseUrl: "https://prod.example.com/",
  })
  const trail = await T.getTrail(projectId, trailId)
  expect(trail!.environments).toEqual([])
})

test("updateTrail can set environments on an existing trail", async () => {
  const projectId = "proj_env_update"
  const trailId = await T.createTrail(projectId, {
    name: "update-env-trail",
    baseUrl: "https://prod.example.com/",
  })
  await T.updateTrail(projectId, trailId, {
    environments: [{ name: "staging", baseUrl: "https://staging.example.com/" }],
  })
  const trail = await T.getTrail(projectId, trailId)
  expect(trail!.environments).toHaveLength(1)
  expect(trail!.environments[0].name).toBe("staging")
})

test("resolveEnvironmentUrl returns environment's baseUrl for a named environment", async () => {
  const projectId = "proj_env_resolve"
  const trailId = await T.createTrail(projectId, {
    name: "resolve-trail",
    baseUrl: "https://prod.example.com/",
    environments: [{ name: "staging", baseUrl: "https://staging.example.com/" }],
  })
  const trail = await T.getTrail(projectId, trailId)
  expect(T.resolveEnvironmentUrl(trail!, "staging")).toBe("https://staging.example.com/")
})

test("resolveEnvironmentUrl returns trail.baseUrl when no environment name given", async () => {
  const projectId = "proj_env_default"
  const trailId = await T.createTrail(projectId, {
    name: "default-trail",
    baseUrl: "https://prod.example.com/",
    environments: [{ name: "staging", baseUrl: "https://staging.example.com/" }],
  })
  const trail = await T.getTrail(projectId, trailId)
  expect(T.resolveEnvironmentUrl(trail!)).toBe("https://prod.example.com/")
  expect(T.resolveEnvironmentUrl(trail!, null)).toBe("https://prod.example.com/")
  expect(T.resolveEnvironmentUrl(trail!, undefined)).toBe("https://prod.example.com/")
})

test("resolveEnvironmentUrl throws when name is not found", async () => {
  const projectId = "proj_env_notfound"
  const trailId = await T.createTrail(projectId, {
    name: "notfound-trail",
    baseUrl: "https://prod.example.com/",
    environments: [{ name: "staging", baseUrl: "https://staging.example.com/" }],
  })
  const trail = await T.getTrail(projectId, trailId)
  expect(() => T.resolveEnvironmentUrl(trail!, "typo")).toThrow(/environment "typo" not found/)
})

test("startWalk with environmentName records it on the walk row", async () => {
  const projectId = "proj_env_walk"
  const trailId = await T.createTrail(projectId, {
    name: "walk-env-trail",
    baseUrl: "https://prod.example.com/",
    environments: [{ name: "staging", baseUrl: "https://staging.example.com/" }],
  })
  await T.setTrailStatus(projectId, trailId, "active")

  const runId = await T.startWalk(projectId, trailId, "manual", "staging")
  const walk = await T.getWalk(projectId, runId)
  expect(walk).not.toBeNull()
  expect(walk!.environmentName).toBe("staging")
})

test("startWalk without environmentName records null on the walk row (backward compat)", async () => {
  const projectId = "proj_env_walk_default"
  const trailId = await T.createTrail(projectId, {
    name: "default-walk-trail",
    baseUrl: "https://prod.example.com/",
  })
  await T.setTrailStatus(projectId, trailId, "active")

  const runId = await T.startWalk(projectId, trailId)
  const walk = await T.getWalk(projectId, runId)
  expect(walk!.environmentName).toBeNull()
})
