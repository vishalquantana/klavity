// Plan G Task 4 — seedDemoTrails idempotency + URL shape. Run twice → exactly one set; fixture Trails
// point at the app-served /trails-demo/* copies.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"; import { join } from "node:path"
const file = join(tmpdir(), `klav-seed-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })
const T = await import("./trails")
const { seedDemoTrails } = await import("./trails-demo-seed")

test("seedDemoTrails is idempotent (run twice → one set) and points fixture trails at /trails-demo", async () => {
  const a = await seedDemoTrails("proj_seed", "https://klavity.test")
  expect(a.created).toBeGreaterThanOrEqual(3)
  const b = await seedDemoTrails("proj_seed", "https://klavity.test")
  expect(b.created).toBe(0) // nothing re-created
  // includeDemo: true — demo trails are quarantined from real-user listings; the seed test
  // must opt-in to see them.
  const trails = await T.listTrails("proj_seed", { includeDemo: true })
  const names = trails.map(t => t.name)
  expect(names).toContain("Demo · baseline")
  expect(names).toContain("Demo · drift (heals)")
  expect(names).toContain("Demo · regression")
  const baseline = trails.find(t => t.name === "Demo · baseline")!
  expect(baseline.baseUrl).toContain("/trails-demo/journey/landing.html")
})

test("KLAVITYKLA-256 quarantine: demo trails are excluded from real-user listings by default", async () => {
  // Real project shares the same DB but has no demo trails seeded.
  const realProjectId = "proj_real_user"
  // Seed a real (non-demo) trail directly via createTrail.
  const realTrailId = await T.createTrail(realProjectId, {
    name: "Real user trail",
    baseUrl: "https://myapp.example.com/",
    authorKind: "human",
    createdBy: "alice@example.com",
  })

  // Seed demo trails into the same project to simulate the TRAILS_DEMO_PROJECT_ID scenario
  // where a demo project id happens to be accessed by a real user's listing call.
  await seedDemoTrails(realProjectId, "https://klavity.test")

  // Default listing (no includeDemo) must not expose demo trails.
  const realListing = await T.listTrails(realProjectId)
  const realNames = realListing.map(t => t.name)
  expect(realNames).toContain("Real user trail")
  expect(realNames).not.toContain("Demo · baseline")
  expect(realNames).not.toContain("Demo · drift (heals)")
  expect(realNames).not.toContain("Demo · regression")
  expect(realNames).not.toContain("Dogfood · landing")

  // Admin/seed opt-in must still see them.
  const adminListing = await T.listTrails(realProjectId, { includeDemo: true })
  const adminNames = adminListing.map(t => t.name)
  expect(adminNames).toContain("Demo · baseline")
  expect(adminNames).toContain("Dogfood · landing")
  expect(adminNames).toContain("Real user trail")
})
