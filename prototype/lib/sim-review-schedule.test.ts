// lib/sim-review-schedule.test.ts
// KLA-254 — unit tests for scheduled Sim reviews.
//
// Three suites:
//   1. DB helpers: create + list + delete + enable/disable schedules.
//   2. runDueSchedules: fires reviews for due schedules only; skips non-due + disabled.
//   3. Tenant isolation: a project cannot read/delete/modify another project's schedules.

import { test, expect, beforeAll, beforeEach, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createClient, type Client } from "@libsql/client"
import {
  applySchema,
  reconnectDb,
  createSimReviewSchedule,
  listSimReviewSchedules,
  listDueSimReviewSchedules,
  getSimReviewSchedule,
  deleteSimReviewSchedule,
  setSimReviewScheduleEnabled,
  touchSimReviewScheduleRan,
  nextRunAfter,
  type SimReviewScheduleRow,
} from "./db"
import { runDueSchedules, type ScheduleRunDeps, type ScheduleRunResult } from "./sim-review-schedule"

// ── Temp DB setup ─────────────────────────────────────────────────────────────

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const dbFile = join(tmpdir(), `klav-srs-test-${ts}.db`)
let rawClient: Client

beforeAll(async () => {
  rawClient = createClient({ url: "file:" + dbFile })
  await rawClient.execute("PRAGMA journal_mode=WAL")
  await rawClient.execute("PRAGMA busy_timeout=5000")
  // Reconnect the shared db module to our isolated test DB.
  reconnectDb("file:" + dbFile)
  // Apply full schema so sim_review_schedules table is created.
  await applySchema(rawClient)
})

afterAll(async () => {
  await rawClient.close()
})

// ── Fixture helpers ────────────────────────────────────────────────────────────

const PROJ_A = `proj_a_${ts}`
const PROJ_B = `proj_b_${ts}`  // separate tenant
const ACTOR = `actor_${ts}@test.local`

async function seedProject(id: string) {
  await rawClient.execute({
    sql: `INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at)
          VALUES (?, 'acct_test', ?, 'active', 'auto', 200, 'named', ?, ?)`,
    args: [id, `Project ${id}`, Date.now(), Date.now()],
  })
}

beforeAll(async () => {
  await seedProject(PROJ_A)
  await seedProject(PROJ_B)
})

// ── Suite 1: DB helpers ────────────────────────────────────────────────────────

test("createSimReviewSchedule: creates a daily schedule with correct defaults", async () => {
  const now = Date.now()
  const sched = await createSimReviewSchedule({
    projectId: PROJ_A,
    targetUrl: "https://example.com",
    frequency: "daily",
    createdBy: ACTOR,
  })

  expect(sched.id).toMatch(/^srs_/)
  expect(sched.projectId).toBe(PROJ_A)
  expect(sched.targetUrl).toBe("https://example.com")
  expect(sched.frequency).toBe("daily")
  expect(sched.simIds).toBeNull()
  expect(sched.enabled).toBe(true)
  expect(sched.lastRunAt).toBeNull()
  expect(sched.nextRunAt).toBeGreaterThanOrEqual(now)
  expect(sched.createdBy).toBe(ACTOR)
})

test("createSimReviewSchedule: weekly schedule with explicit simIds and firstRunAt", async () => {
  const firstRunAt = Date.now() + 3600_000   // 1 hour from now
  const sched = await createSimReviewSchedule({
    projectId: PROJ_A,
    targetUrl: "https://example.com/dashboard",
    frequency: "weekly",
    simIds: ["sim_1", "sim_2"],
    createdBy: ACTOR,
    firstRunAt,
  })

  expect(sched.frequency).toBe("weekly")
  expect(sched.simIds).toEqual(["sim_1", "sim_2"])
  expect(sched.nextRunAt).toBe(firstRunAt)
})

test("listSimReviewSchedules: returns schedules for the project and includes created entries", async () => {
  // Use a fresh project to avoid cross-test contamination when ordering by created_at (same ms).
  const listProj = `proj_list_${ts}`
  await seedProject(listProj)

  const schedA = await createSimReviewSchedule({ projectId: listProj, targetUrl: "https://list-a.com", frequency: "daily", createdBy: ACTOR })
  const schedB = await createSimReviewSchedule({ projectId: listProj, targetUrl: "https://list-b.com", frequency: "weekly", createdBy: ACTOR })

  const list = await listSimReviewSchedules(listProj)
  expect(list.length).toBe(2)
  // Both schedules are present (order depends on ms ties — just verify membership)
  const ids = list.map(s => s.id)
  expect(ids).toContain(schedA.id)
  expect(ids).toContain(schedB.id)
})

test("getSimReviewSchedule: returns schedule by id within project", async () => {
  const sched = await createSimReviewSchedule({ projectId: PROJ_A, targetUrl: "https://get-test.com", frequency: "daily", createdBy: ACTOR })
  const fetched = await getSimReviewSchedule(PROJ_A, sched.id)
  expect(fetched).not.toBeNull()
  expect(fetched!.id).toBe(sched.id)
})

test("deleteSimReviewSchedule: removes the row and returns true", async () => {
  const sched = await createSimReviewSchedule({ projectId: PROJ_A, targetUrl: "https://del-test.com", frequency: "daily", createdBy: ACTOR })
  const ok = await deleteSimReviewSchedule(PROJ_A, sched.id)
  expect(ok).toBe(true)
  const gone = await getSimReviewSchedule(PROJ_A, sched.id)
  expect(gone).toBeNull()
})

test("deleteSimReviewSchedule: returns false for non-existent id", async () => {
  const ok = await deleteSimReviewSchedule(PROJ_A, "srs_nonexistent")
  expect(ok).toBe(false)
})

test("setSimReviewScheduleEnabled: can pause and resume a schedule", async () => {
  const sched = await createSimReviewSchedule({ projectId: PROJ_A, targetUrl: "https://toggle.com", frequency: "daily", createdBy: ACTOR })
  expect(sched.enabled).toBe(true)

  const paused = await setSimReviewScheduleEnabled(PROJ_A, sched.id, false)
  expect(paused).toBe(true)
  const afterPause = await getSimReviewSchedule(PROJ_A, sched.id)
  expect(afterPause!.enabled).toBe(false)

  await setSimReviewScheduleEnabled(PROJ_A, sched.id, true)
  const afterResume = await getSimReviewSchedule(PROJ_A, sched.id)
  expect(afterResume!.enabled).toBe(true)
})

test("touchSimReviewScheduleRan: advances next_run_at by one day for daily", async () => {
  const sched = await createSimReviewSchedule({ projectId: PROJ_A, targetUrl: "https://touch.com", frequency: "daily", createdBy: ACTOR })
  const ranAt = Date.now()
  await touchSimReviewScheduleRan(sched.id, ranAt, "daily")
  const updated = await getSimReviewSchedule(PROJ_A, sched.id)
  expect(updated!.lastRunAt).toBe(ranAt)
  expect(updated!.nextRunAt).toBe(nextRunAfter(ranAt, "daily"))
})

test("touchSimReviewScheduleRan: advances next_run_at by 7 days for weekly", async () => {
  const sched = await createSimReviewSchedule({ projectId: PROJ_A, targetUrl: "https://touch-weekly.com", frequency: "weekly", createdBy: ACTOR })
  const ranAt = Date.now()
  await touchSimReviewScheduleRan(sched.id, ranAt, "weekly")
  const updated = await getSimReviewSchedule(PROJ_A, sched.id)
  const expectedNext = nextRunAfter(ranAt, "weekly")
  expect(updated!.nextRunAt).toBe(expectedNext)
  // 7 days difference
  expect(expectedNext - ranAt).toBe(7 * 24 * 60 * 60 * 1000)
})

test("nextRunAfter: daily = +24h, weekly = +7d", () => {
  const base = 1_000_000_000
  expect(nextRunAfter(base, "daily")).toBe(base + 24 * 60 * 60 * 1000)
  expect(nextRunAfter(base, "weekly")).toBe(base + 7 * 24 * 60 * 60 * 1000)
})

test("listDueSimReviewSchedules: returns only enabled schedules whose next_run_at <= nowMs", async () => {
  const pastTs = Date.now() - 1000   // due
  const futureTs = Date.now() + 60 * 60 * 1000  // not yet due

  const dueSched = await createSimReviewSchedule({
    projectId: PROJ_A, targetUrl: "https://due.com", frequency: "daily",
    createdBy: ACTOR, firstRunAt: pastTs,
  })
  const notDueSched = await createSimReviewSchedule({
    projectId: PROJ_A, targetUrl: "https://notdue.com", frequency: "daily",
    createdBy: ACTOR, firstRunAt: futureTs,
  })
  // Pause the due schedule — should be excluded
  const pausedDue = await createSimReviewSchedule({
    projectId: PROJ_A, targetUrl: "https://paused-due.com", frequency: "daily",
    createdBy: ACTOR, firstRunAt: pastTs,
  })
  await setSimReviewScheduleEnabled(PROJ_A, pausedDue.id, false)

  const due = await listDueSimReviewSchedules(Date.now())
  const dueIds = due.map(s => s.id)

  expect(dueIds).toContain(dueSched.id)
  expect(dueIds).not.toContain(notDueSched.id)
  expect(dueIds).not.toContain(pausedDue.id)
})

// ── Suite 2: runDueSchedules ───────────────────────────────────────────────────

// Build a mock deps object that captures which schedules triggered reviews.
function buildMockDeps(opts: {
  reactions?: any[]
  screenshotFails?: boolean
}): ScheduleRunDeps & { calls: { projectId: string; url: string }[] } {
  const calls: { projectId: string; url: string }[] = []
  const deps: ScheduleRunDeps & { calls: { projectId: string; url: string }[] } = {
    calls,
    takeScreenshot: async (url: string) => {
      if (opts.screenshotFails) throw new Error("Screenshot failed (mock)")
      return { imageB64: "aGVsbG8=", mediaType: "image/jpeg" }
    },
    reactFn: async (_sim: any, _b64: string, _mt: string, _pu: string) => {
      calls.push({ projectId: "", url: _pu })
      return { data: { reactions: opts.reactions ?? [] } }
    },
    resolveCitationsFn: async (_simId: any, _cited: any, projectId?: any) => ({
      citedTraitIds: [], sourceQuote: null, speaker: null,
      sourceTranscriptId: null, sourceDate: null,
      issueType: null, sourceQuoteVerified: null, recurrence: null,
    }),
    db: rawClient as any,
  }
  return deps
}

test("runDueSchedules: runs only due schedules (not future-dated ones)", async () => {
  const pastTs = Date.now() - 5000
  const futureTs = Date.now() + 99_999_999

  const dueSched = await createSimReviewSchedule({
    projectId: PROJ_A, targetUrl: "https://rds-due.com", frequency: "daily",
    createdBy: ACTOR, firstRunAt: pastTs,
  })
  await createSimReviewSchedule({
    projectId: PROJ_A, targetUrl: "https://rds-future.com", frequency: "daily",
    createdBy: ACTOR, firstRunAt: futureTs,
  })

  // Seed a persona so "no Sims" early-return doesn't short-circuit.
  await rawClient.execute({
    sql: `INSERT OR IGNORE INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at)
          VALUES (?, ?, 'Test Sim', 'Tester', 'client', 'TS', null, null, '[]', ?, ?)`,
    args: [`sim_rds_${ts}`, PROJ_A, Date.now(), Date.now()],
  })

  const deps = buildMockDeps({ reactions: [] })
  const results = await runDueSchedules({ ...deps, nowMs: Date.now() })

  // At minimum our due schedule should appear in results
  const ids = results.map(r => r.scheduleId)
  expect(ids).toContain(dueSched.id)
  // Future schedule is not in results
  // (It might appear from OTHER tests creating due schedules, but rds-future.com's id is not there)
  const futureResult = results.find(r => r.url === "https://rds-future.com")
  expect(futureResult).toBeUndefined()
})

test("runDueSchedules: disabled schedules are not run", async () => {
  const pastTs = Date.now() - 5000
  const pausedSched = await createSimReviewSchedule({
    projectId: PROJ_A, targetUrl: "https://rds-disabled.com", frequency: "daily",
    createdBy: ACTOR, firstRunAt: pastTs,
  })
  await setSimReviewScheduleEnabled(PROJ_A, pausedSched.id, false)

  const deps = buildMockDeps({})
  const results = await runDueSchedules({ ...deps, nowMs: Date.now() })
  const disabledResult = results.find(r => r.scheduleId === pausedSched.id)
  expect(disabledResult).toBeUndefined()
})

test("runDueSchedules: schedule with no Sims is skipped with reason, next_run_at still advanced", async () => {
  const emptyProjId = `proj_empty_${ts}`
  await seedProject(emptyProjId)

  const pastTs = Date.now() - 5000
  const sched = await createSimReviewSchedule({
    projectId: emptyProjId, targetUrl: "https://rds-nosims.com", frequency: "daily",
    createdBy: ACTOR, firstRunAt: pastTs,
  })

  const deps = buildMockDeps({})
  const results = await runDueSchedules({ ...deps, nowMs: Date.now() })
  const result = results.find(r => r.scheduleId === sched.id)
  expect(result).toBeDefined()
  expect(result!.skipped).toBe("no Sims")
  expect(result!.simCount).toBe(0)

  // next_run_at should have advanced (so it doesn't refetch on every tick)
  const after = await getSimReviewSchedule(emptyProjId, sched.id)
  expect(after!.nextRunAt).toBeGreaterThan(pastTs)
})

test("runDueSchedules: screenshot error does NOT advance next_run_at (retry on next tick)", async () => {
  const projRetry = `proj_retry_${ts}`
  await seedProject(projRetry)
  // Seed a Sim so we reach the screenshot stage.
  await rawClient.execute({
    sql: `INSERT OR IGNORE INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at)
          VALUES (?, ?, 'Retry Sim', 'Tester', 'client', 'RS', null, null, '[]', ?, ?)`,
    args: [`sim_retry_${ts}`, projRetry, Date.now(), Date.now()],
  })

  const pastTs = Date.now() - 5000
  const sched = await createSimReviewSchedule({
    projectId: projRetry, targetUrl: "https://rds-screenfail.com", frequency: "daily",
    createdBy: ACTOR, firstRunAt: pastTs,
  })

  const deps = buildMockDeps({ screenshotFails: true })
  const results = await runDueSchedules({ ...deps, nowMs: Date.now() })
  const result = results.find(r => r.scheduleId === sched.id)
  expect(result).toBeDefined()
  expect(result!.skipped).toMatch(/screenshot error/)

  // next_run_at should NOT have advanced — retry on next tick
  const after = await getSimReviewSchedule(projRetry, sched.id)
  expect(after!.nextRunAt).toBe(pastTs)
})

// ── Suite 3: Tenant isolation ─────────────────────────────────────────────────

test("tenant isolation: cannot get schedule from another project", async () => {
  const sched = await createSimReviewSchedule({
    projectId: PROJ_A, targetUrl: "https://isolation-a.com", frequency: "daily", createdBy: ACTOR,
  })

  // PROJ_B cannot access PROJ_A's schedule
  const result = await getSimReviewSchedule(PROJ_B, sched.id)
  expect(result).toBeNull()
})

test("tenant isolation: cannot delete schedule from another project", async () => {
  const sched = await createSimReviewSchedule({
    projectId: PROJ_A, targetUrl: "https://isolation-del.com", frequency: "daily", createdBy: ACTOR,
  })

  // Attempt delete from PROJ_B — must return false (row not found for that project)
  const ok = await deleteSimReviewSchedule(PROJ_B, sched.id)
  expect(ok).toBe(false)

  // The schedule still exists under PROJ_A
  const still = await getSimReviewSchedule(PROJ_A, sched.id)
  expect(still).not.toBeNull()
})

test("tenant isolation: listSimReviewSchedules only returns own project's schedules", async () => {
  const schedA = await createSimReviewSchedule({
    projectId: PROJ_A, targetUrl: "https://isolation-list-a.com", frequency: "daily", createdBy: ACTOR,
  })
  const schedB = await createSimReviewSchedule({
    projectId: PROJ_B, targetUrl: "https://isolation-list-b.com", frequency: "daily", createdBy: ACTOR,
  })

  const listA = await listSimReviewSchedules(PROJ_A)
  const listB = await listSimReviewSchedules(PROJ_B)

  const idsA = listA.map(s => s.id)
  const idsB = listB.map(s => s.id)

  expect(idsA).toContain(schedA.id)
  expect(idsA).not.toContain(schedB.id)

  expect(idsB).toContain(schedB.id)
  expect(idsB).not.toContain(schedA.id)
})

test("tenant isolation: cannot enable/disable schedule from another project", async () => {
  const sched = await createSimReviewSchedule({
    projectId: PROJ_A, targetUrl: "https://isolation-toggle.com", frequency: "daily", createdBy: ACTOR,
  })

  // PROJ_B tries to disable it — should return false (no rows affected)
  const ok = await setSimReviewScheduleEnabled(PROJ_B, sched.id, false)
  expect(ok).toBe(false)

  // The schedule in PROJ_A is unchanged
  const unchanged = await getSimReviewSchedule(PROJ_A, sched.id)
  expect(unchanged!.enabled).toBe(true)
})
