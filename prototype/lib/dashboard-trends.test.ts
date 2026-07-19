// KLAVITYKLA-225 (JTBD 7.11): dashboard trend aggregate + drill-down.
// Tests:
//   (A) Empty project → zero-filled axis of `days` buckets, all counts 0.
//   (B) Reports/findings bucket by created_at; findings = rows with a suggested bug.
//   (C) Regressions bucket by recur day (last_seen_at > resolved_at).
//   (D) days window (30 vs 90) filters older rows; axis length matches `days`.
//   (E) Drill-down returns the underlying rows for one day+series.

import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomBytes } from "node:crypto"

const ts = `${Date.now()}-${randomBytes(4).toString("hex")}`
const dbFile = join(tmpdir(), `klav-dtrends-${ts}.db`)

import { reconnectDb, applySchema, migrateV2 } from "./db"

let db: Awaited<ReturnType<typeof reconnectDb>>
const DAY_MS = 24 * 3600 * 1000
const NOW = Date.now()

function utcDayStart(ms: number): number {
  const d = new Date(ms)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}
function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

const projId = `proj_dt_${ts}`

beforeAll(async () => {
  db = reconnectDb("file:" + dbFile)
  await applySchema(db)
  await migrateV2(db)

  const acctId = `acct_dt_${ts}`
  await db.execute({ sql: `INSERT INTO users (email, created_at) VALUES (?, ?)`, args: [`dt-${ts}@test.local`, NOW] })
  await db.execute({ sql: `INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, args: [acctId, "DT WS", `dt-${ts}@test.local`, NOW] })
  await db.execute({ sql: `INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [projId, acctId, "DT Project", "active", "auto", 200, "named", NOW, NOW] })

  // Anchor every row a bit past midnight so the strftime day matches the JS UTC day key.
  const at = (offsetDays: number) => utcDayStart(NOW) - offsetDays * DAY_MS + 6 * 3600 * 1000
  let seq = 0
  const fb = (opts: { createdAt: number; bug?: boolean; resolvedAt?: number; lastSeenAt?: number }) =>
    db.execute({
      sql: `INSERT INTO feedback (id, project_id, observation, suggested_bug_json, status, priority, url_path, created_at, resolved_at, last_seen_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `fb_${ts}_${seq++}`, projId, `obs ${seq}`,
        opts.bug ? JSON.stringify({ title: "Bug", severity: "high" }) : null,
        "new", "high", "/p", opts.createdAt,
        opts.resolvedAt ?? null, opts.lastSeenAt ?? null,
      ],
    })

  // Day -2: 3 reports, 2 of them findings (carry a suggested bug).
  await fb({ createdAt: at(2), bug: true })
  await fb({ createdAt: at(2), bug: true })
  await fb({ createdAt: at(2) })
  // Day -1: 1 report, 0 findings.
  await fb({ createdAt: at(1) })
  // Day 0: 1 report + a regression (resolved 2d ago, reappeared today).
  await fb({ createdAt: at(0) })
  await fb({ createdAt: at(40), bug: true, resolvedAt: at(3), lastSeenAt: at(0) })
  // A row 40 days ago (outside the 30-day window, inside 90).
  await fb({ createdAt: at(40) })
})

const { dashboardTrends, dashboardTrendDrill } = await import("./dashboard-trends")

test("(A) empty project → zero-filled axis, all counts 0", async () => {
  const t = await dashboardTrends("proj_nope_xyz", { days: 30, now: NOW }, db)
  expect(t.buckets.length).toBe(30)
  expect(t.totals).toEqual({ reports: 0, findings: 0, regressions: 0 })
  expect(t.buckets[t.buckets.length - 1].day).toBe(dayKey(utcDayStart(NOW)))
  for (const b of t.buckets) expect(b.reports + b.findings + b.regressions).toBe(0)
})

test("(B) reports/findings bucket by created_at", async () => {
  const t = await dashboardTrends(projId, { days: 30, now: NOW }, db)
  const day2 = dayKey(utcDayStart(NOW) - 2 * DAY_MS)
  const b2 = t.buckets.find((b) => b.day === day2)!
  expect(b2).toBeDefined()
  expect(b2.reports).toBe(3)
  expect(b2.findings).toBe(2)
  expect(b2.regressions).toBe(0)
})

test("(C) regressions bucket by recur day (last_seen_at)", async () => {
  const t = await dashboardTrends(projId, { days: 30, now: NOW }, db)
  const today = dayKey(utcDayStart(NOW))
  const b0 = t.buckets.find((b) => b.day === today)!
  // Today: 1 fresh report + the reappeared (regression) row also counts as a report? No —
  // the regression row was created 40 days ago, so it is NOT a today report; it only lands as a regression today.
  expect(b0.reports).toBe(1)
  expect(b0.regressions).toBe(1)
  expect(t.totals.regressions).toBe(1)
})

test("(D) days window filters older rows; axis length = days", async () => {
  const t30 = await dashboardTrends(projId, { days: 30, now: NOW }, db)
  const t90 = await dashboardTrends(projId, { days: 90, now: NOW }, db)
  expect(t30.buckets.length).toBe(30)
  expect(t90.buckets.length).toBe(90)
  // The 40-day-old plain report is invisible at 30 days but visible at 90.
  expect(t90.totals.reports).toBeGreaterThan(t30.totals.reports)
})

test("(E) drill-down returns underlying rows for one day+series", async () => {
  const day2 = dayKey(utcDayStart(NOW) - 2 * DAY_MS)
  const reports = await dashboardTrendDrill(projId, { day: day2, series: "reports" }, db)
  expect(reports.length).toBe(3)
  const findings = await dashboardTrendDrill(projId, { day: day2, series: "findings" }, db)
  expect(findings.length).toBe(2)

  const today = dayKey(utcDayStart(NOW))
  const regr = await dashboardTrendDrill(projId, { day: today, series: "regressions" }, db)
  expect(regr.length).toBe(1)
  expect(regr[0].id).toBeDefined()
})
