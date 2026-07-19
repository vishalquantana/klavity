// lib/known-issue.test.ts
// KLAVITYKLA-241 (JTBD A.11): DB-level unit tests for findKnownIssue() — the pre-submit
// "we already know about this" lookup used by the composer. Verifies that:
//   1. Prose matching an existing report surfaces the known issue (with its status label).
//   2. Unrelated prose surfaces nothing (no false-positive nag).
//   3. Too-short prose is ignored (below the trigram floor).
//   4. Recurring/regressed issues carry the amplified headline + "reopened" status.
//   5. Dismissed ("won't fix") reports are never acknowledged as known.
//   6. The lookup is project-scoped (no cross-project leakage).

import { test, expect } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN     = `${Date.now()}_${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-known-${RUN}.db`)
for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} }

process.env.TURSO_DATABASE_URL = "file:" + DB_FILE
process.env.TURSO_AUTH_TOKEN   = ""

const { db, applySchema, migrateV2 } = await import("./db")
const { findKnownIssue, statusLabel } = await import("./known-issue")

await applySchema(db!)
await migrateV2(db!)

const T0 = 1_740_000_000_000

async function seedFb(opts: {
  id: string; projectId: string; observation?: string; status?: string
  issueKey?: string | null; suggestedBugTitle?: string
  count?: number; datesJson?: number[]; lastSeenAt?: number
  resolvedAt?: number | null; createdAt?: number
}) {
  const count   = opts.count ?? 1
  const dates   = opts.datesJson ?? [opts.createdAt ?? T0]
  const created = opts.createdAt ?? T0
  const suggestion = opts.suggestedBugTitle ? JSON.stringify({ title: opts.suggestedBugTitle }) : null
  await db!.execute({
    sql: `INSERT INTO feedback
            (id, project_id, observation, status, issue_key, suggested_bug_json,
             recurrence_count, recurrence_dates_json, last_seen_at, resolved_at, created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    args: [opts.id, opts.projectId, opts.observation ?? "test observation",
      opts.status ?? "open", opts.issueKey ?? null, suggestion,
      count, JSON.stringify(dates), opts.lastSeenAt ?? dates.at(-1) ?? created,
      opts.resolvedAt ?? null, created],
  })
}

test("statusLabel: maps raw statuses + regression to human labels", () => {
  expect(statusLabel("in_progress", false)).toBe("in progress")
  expect(statusLabel("done", false)).toBe("fixed")
  expect(statusLabel("new", false)).toBe("logged")
  expect(statusLabel("done", true)).toBe("reopened")   // regression always wins
})

test("MATCH: prose matching an existing report surfaces the known issue", async () => {
  const P = `proj_match_${RUN}`
  await seedFb({ id: `fb_m1_${RUN}`, projectId: P, status: "in_progress",
    observation: "The checkout button does nothing when I click it on the cart page." })

  const match = await findKnownIssue(db!, P, "checkout button does nothing when clicked on the cart page")
  expect(match).not.toBeNull()
  expect(match!.feedbackId).toBe(`fb_m1_${RUN}`)
  expect(match!.statusLabel).toBe("in progress")
  expect(match!.score).toBeGreaterThanOrEqual(0.5)
})

test("NO MATCH: unrelated prose surfaces nothing", async () => {
  const P = `proj_nomatch_${RUN}`
  await seedFb({ id: `fb_nm1_${RUN}`, projectId: P,
    observation: "The checkout button does nothing when I click it on the cart page." })

  const match = await findKnownIssue(db!, P, "the sidebar navigation overlaps the footer on mobile screens")
  expect(match).toBeNull()
})

test("TOO SHORT: prose below the trigram floor is ignored", async () => {
  const P = `proj_short_${RUN}`
  await seedFb({ id: `fb_s1_${RUN}`, projectId: P, observation: "login is broken and fails" })
  const match = await findKnownIssue(db!, P, "login")   // < 12 normalized chars
  expect(match).toBeNull()
})

test("RECURRING: a regressed issue carries the amplified headline + reopened status", async () => {
  const P = `proj_reg_${RUN}`
  const ik = `ik_reg_${RUN}`
  // Reported, resolved, then reported again after resolution → regression.
  await seedFb({ id: `fb_r1_${RUN}`, projectId: P, issueKey: ik, status: "done",
    observation: "Search returns zero results even for products that clearly exist in the catalog.",
    count: 3, datesJson: [T0, T0 + 5_000_000, T0 + 9_000_000],
    resolvedAt: T0 + 6_000_000, lastSeenAt: T0 + 9_000_000, createdAt: T0 })

  const match = await findKnownIssue(db!, P, "search returns zero results for products that exist in the catalog")
  expect(match).not.toBeNull()
  expect(match!.regressed).toBe(true)
  expect(match!.statusLabel).toBe("reopened")
  expect(match!.count).toBeGreaterThanOrEqual(2)
  expect(match!.headline).toMatch(/broke again/i)
})

test("DISMISSED: won't-fix reports are never acknowledged as known", async () => {
  const P = `proj_dismissed_${RUN}`
  await seedFb({ id: `fb_d1_${RUN}`, projectId: P, status: "dismissed",
    observation: "Dark mode toggle flickers briefly on the settings page when toggled quickly." })

  const match = await findKnownIssue(db!, P, "dark mode toggle flickers on the settings page when toggled quickly")
  expect(match).toBeNull()
})

test("PROJECT SCOPE: a match in another project does not leak", async () => {
  const PA = `proj_a_${RUN}`
  const PB = `proj_b_${RUN}`
  await seedFb({ id: `fb_pa_${RUN}`, projectId: PA,
    observation: "Uploading a large avatar image throws a 500 error on the profile page." })

  const match = await findKnownIssue(db!, PB, "uploading a large avatar image throws a 500 error on the profile page")
  expect(match).toBeNull()
})
