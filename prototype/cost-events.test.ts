// KLAVITYKLA-486 — unit tests for the cost_events COGS ledger: rate constants, unit×rate math,
// inserts, and the per-project rollup. In-process against a temp libSQL file DB (no server spawn).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB = join(tmpdir(), `klav-ce-${RUN}.db`)
function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB + s) } catch {} } }
rmDb()

// Rates MUST be read from env — pin known values so the math is exact and deterministic.
process.env.KLAV_S3_GB_MONTH_USD = "0.02"
process.env.KLAV_S3_EGRESS_GB_USD = "0.10"
process.env.KLAV_BROWSER_MIN_USD = "0.006"
process.env.KLAV_EMAIL_SEND_USD = "0.001"
process.env.TURSO_DATABASE_URL = "file:" + DB
process.env.TURSO_AUTH_TOKEN = ""

const db = await import("./lib/db")
const ce = await import("./lib/cost-events")

// Unique project id so this file's rows never collide with other in-process db tests when bun shares
// the db module singleton across the whole suite.
const PA = "proj_a_" + RUN

beforeAll(async () => { await db.initDb() })
afterAll(() => { rmDb() })

test("rate getters read from env", () => {
  expect(ce.s3StorageRateUsdPerGbMonth()).toBe(0.02)
  expect(ce.s3EgressRateUsdPerGb()).toBe(0.10)
  expect(ce.browserRateUsdPerMin()).toBe(0.006)
  expect(ce.emailRateUsdPerSend()).toBe(0.001)
})

test("recorders compute units × rate and insert a tagged row", async () => {
  await ce.recordS3Storage({ projectId: PA, bytes: 1_000_000_000 }) // 1 GB → 0.02
  await ce.recordS3Egress({ projectId: PA, bytes: 2_000_000_000 })  // 2 GB → 0.20
  await ce.recordBrowserMinutes({ projectId: PA, runId: "run_1", minutes: 10 }) // 10 min → 0.06
  await ce.recordEmailSend({ projectId: PA, count: 5 }) // 5 sends → 0.005

  const rows = await db.costEventsByProjectKind()
  const byKind: Record<string, { units: number; cost: number }> = {}
  for (const r of rows) if (r.projectId === PA) byKind[r.kind] = { units: r.units, cost: r.cost }

  expect(byKind.s3_storage.units).toBeCloseTo(1, 6)
  expect(byKind.s3_storage.cost).toBeCloseTo(0.02, 6)
  expect(byKind.s3_egress.cost).toBeCloseTo(0.20, 6)
  expect(byKind.browser_min.units).toBeCloseTo(10, 6)
  expect(byKind.browser_min.cost).toBeCloseTo(0.06, 6)
  expect(byKind.email_send.units).toBeCloseTo(5, 6)
  expect(byKind.email_send.cost).toBeCloseTo(0.005, 6)
})

test("run_id is persisted for browser events", async () => {
  const r = await db.db!.execute({ sql: "SELECT run_id FROM cost_events WHERE kind='browser_min' AND project_id=?", args: [PA] })
  expect(String((r.rows[0] as any).run_id)).toBe("run_1")
})

test("null-project sends still record (attribute to no workspace)", async () => {
  await ce.recordEmailSend({ projectId: null, count: 3 })
  // units=3 uniquely identifies this file's null-project row even if the db module is shared across
  // the full suite. Confirms null project_id is accepted (attributes to no workspace).
  const r = await db.db!.execute("SELECT COUNT(*) AS n FROM cost_events WHERE project_id IS NULL AND kind='email_send' AND units=3")
  expect(Number((r.rows[0] as any).n)).toBeGreaterThanOrEqual(1)
})

test("zero/negative units are no-ops (no row)", async () => {
  const before = Number((await db.db!.execute("SELECT COUNT(*) AS n FROM cost_events")).rows[0].n)
  await ce.recordS3Storage({ projectId: PA, bytes: 0 })
  await ce.recordBrowserMinutes({ projectId: PA, minutes: 0 })
  const after = Number((await db.db!.execute("SELECT COUNT(*) AS n FROM cost_events")).rows[0].n)
  expect(after).toBe(before)
})

test("costEventsTotal sums cost_usd (>= this file's contribution)", async () => {
  // This file contributed: PA 0.02+0.20+0.06+0.005 = 0.285, plus a null-project 0.003 email = 0.288.
  // costEventsTotal has no project filter; under the shared-db singleton other files may add more, so
  // assert it is at least our contribution (and a finite number).
  const total = await db.costEventsTotal()
  expect(Number.isFinite(total)).toBe(true)
  expect(total).toBeGreaterThanOrEqual(0.288 - 1e-9)
})
