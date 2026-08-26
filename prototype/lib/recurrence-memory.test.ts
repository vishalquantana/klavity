// lib/recurrence-memory.test.ts
// Unit tests for the pure helpers in recurrence-memory.ts.
// No DB required — buildSummary/ordinal are side-effect-free.
import { test, expect } from "bun:test"
import { createClient } from "@libsql/client"
import { ordinal, buildSummary, recurrenceImpact, listProjectRecurringIssues } from "./recurrence-memory"

// ── ordinal ─────────────────────────────────────────────────────────────────

test("ordinal: 1st, 2nd, 3rd, then -th", () => {
  expect(ordinal(1)).toBe("1st")
  expect(ordinal(2)).toBe("2nd")
  expect(ordinal(3)).toBe("3rd")
  expect(ordinal(4)).toBe("4th")
  expect(ordinal(10)).toBe("10th")
})

test("ordinal: teen exceptions (11, 12, 13 all -th)", () => {
  expect(ordinal(11)).toBe("11th")
  expect(ordinal(12)).toBe("12th")
  expect(ordinal(13)).toBe("13th")
  // 111, 112, 113 follow mod100 → also -th
  expect(ordinal(111)).toBe("111th")
  expect(ordinal(112)).toBe("112th")
  expect(ordinal(113)).toBe("113th")
})

test("ordinal: 21st, 22nd, 23rd resume normal pattern", () => {
  expect(ordinal(21)).toBe("21st")
  expect(ordinal(22)).toBe("22nd")
  expect(ordinal(23)).toBe("23rd")
  expect(ordinal(100)).toBe("100th")
})

// ── buildSummary ─────────────────────────────────────────────────────────────

const D = new Date("2026-06-01T00:00:00Z").getTime()

test("buildSummary: first occurrence, no Sim", () => {
  const s = buildSummary(1, D, null)
  expect(s).toContain("First occurrence")
  expect(s).toContain("2026-06-01")
  expect(s).toContain("previous reporter")
  expect(s).not.toContain("occurrence.") // "First occurrence" phrasing, not "Xth occurrence."
})

test("buildSummary: first occurrence with Sim name", () => {
  const s = buildSummary(1, D, "Alice")
  expect(s).toContain("First occurrence")
  expect(s).toContain("Alice")
  expect(s).toContain("(Sim)")
  expect(s).not.toContain("previous reporter")
})

test("buildSummary: 2nd occurrence, Sim name", () => {
  const ts = new Date("2026-06-10T00:00:00Z").getTime()
  const s = buildSummary(2, ts, "Alice")
  expect(s).toContain("2nd occurrence")
  expect(s).toContain("Alice")
  expect(s).toContain("2026-06-10")
})

test("buildSummary: 4th occurrence, no Sim", () => {
  const ts = new Date("2026-06-15T00:00:00Z").getTime()
  const s = buildSummary(4, ts, null)
  expect(s).toContain("4th occurrence")
  expect(s).toContain("previous reporter")
  expect(s).toContain("2026-06-15")
})

test("buildSummary: large count uses correct ordinal (11th)", () => {
  const s = buildSummary(11, D, "Bob")
  expect(s).toContain("11th occurrence")
  expect(s).toContain("Bob")
})

test("buildSummary: 21st uses correct ordinal", () => {
  const s = buildSummary(21, D, null)
  expect(s).toContain("21st occurrence")
})

// ── recurrenceImpact (KLAVITYKLA-236) ─────────────────────────────────────────

test("recurrenceImpact: single non-regressed report is a mild notice", () => {
  const i = recurrenceImpact({ count: 2, regressed: false })
  expect(i.level).toBe(1)
  expect(i.tier).toBe("recurring")
  expect(i.regressed).toBe(false)
})

test("recurrenceImpact: escalates level with count (persistent → chronic)", () => {
  expect(recurrenceImpact({ count: 3, regressed: false }).level).toBe(2)
  expect(recurrenceImpact({ count: 4, regressed: false }).tier).toBe("persistent")
  expect(recurrenceImpact({ count: 5, regressed: false }).level).toBe(3)
  expect(recurrenceImpact({ count: 9, regressed: false }).tier).toBe("chronic")
})

test("recurrenceImpact: headline conveys trust weight, not a bare number", () => {
  const chronic = recurrenceImpact({ count: 6, regressed: false })
  expect(chronic.headline.toLowerCase()).toContain("chronic")
  const regr = recurrenceImpact({ count: 2, regressed: true })
  expect(regr.headline.toLowerCase()).toContain("broke again")
})

test("recurrenceImpact: regression always outranks a plain repeat", () => {
  const regr = recurrenceImpact({ count: 2, regressed: true })
  const chronic = recurrenceImpact({ count: 20, regressed: false })
  expect(regr.tier).toBe("regression")
  expect(regr.level).toBeGreaterThanOrEqual(3)
  expect(regr.score).toBeGreaterThan(chronic.score) // regressions surface first
})

test("recurrenceImpact: repeated regression stings harder (level 4)", () => {
  expect(recurrenceImpact({ count: 3, regressed: true }).level).toBe(4)
  expect(recurrenceImpact({ count: 2, regressed: true }).level).toBe(3)
})

test("recurrenceImpact: score is monotonic in count so ranking is stable", () => {
  const a = recurrenceImpact({ count: 2, regressed: false }).score
  const b = recurrenceImpact({ count: 3, regressed: false }).score
  const c = recurrenceImpact({ count: 5, regressed: false }).score
  expect(b).toBeGreaterThan(a)
  expect(c).toBeGreaterThan(b)
})

test("recurrenceImpact: guards bad input (0/NaN → count 1)", () => {
  expect(recurrenceImpact({ count: 0, regressed: false }).count).toBe(1)
  expect(recurrenceImpact({ count: NaN as any, regressed: false }).count).toBe(1)
})

// ── #656: listProjectRecurringIssues DB integration (N+1 → Promise.all) ────────
// Exercises the concurrent per-group + per-row (occurrenceReceipts) fetches and
// pins the exact output — same issues, same order, same fields — so the latency
// optimization stays behavior-neutral.

async function seedRecurringDb() {
  const c = createClient({ url: "file::memory:" })
  await c.execute(`CREATE TABLE feedback (
    id TEXT PRIMARY KEY, project_id TEXT, issue_key TEXT, recurrence_count INTEGER,
    recurrence_dates_json TEXT, status TEXT, resolved_at INTEGER, updated_at INTEGER,
    url_path TEXT, observation TEXT, title TEXT, screenshot_id TEXT, source_quote TEXT,
    created_at INTEGER, priority TEXT, severity TEXT, sim_id TEXT, suggested_bug_json TEXT
  )`)
  await c.execute(`CREATE TABLE feedback_occurrences (
    id TEXT PRIMARY KEY, feedback_id TEXT, seen_at INTEGER, created_at INTEGER,
    observation TEXT, screenshot_id TEXT, source_quote TEXT
  )`)
  await c.execute(`CREATE TABLE expectations (id TEXT, project_id TEXT, dedup_key TEXT, status TEXT)`)
  await c.execute(`CREATE TABLE personas (id TEXT, project_id TEXT, name TEXT)`)

  const P = "proj1"
  const ins = async (row: Record<string, any>) => {
    const cols = Object.keys(row)
    await c.execute({
      sql: `INSERT INTO feedback (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
      args: cols.map((k) => row[k]),
    })
  }
  // Group A: issue_key KEY-A, two rows → count 2 (recurring). Has one stored receipt + a Sim.
  await ins({ id: "f1", project_id: P, issue_key: "KEY-A", recurrence_count: 1, created_at: 1000, status: "open", observation: "A original", title: "Issue A", sim_id: "sim1" })
  await ins({ id: "f2", project_id: P, issue_key: "KEY-A", recurrence_count: 1, created_at: 2000, status: "open", observation: "A repeat" })
  await c.execute({ sql: `INSERT INTO feedback_occurrences (id, feedback_id, seen_at, created_at, observation) VALUES (?,?,?,?,?)`, args: ["occ1", "f2", 2500, 2500, "A receipt"] })
  await c.execute({ sql: `INSERT INTO expectations (id, project_id, dedup_key, status) VALUES (?,?,?,?)`, args: ["exp1", P, "KEY-A", "validated"] })
  await c.execute({ sql: `INSERT INTO personas (id, project_id, name) VALUES (?,?,?)`, args: ["sim1", P, "Alice"] })

  // Group B: single row, recurrence_count 3 with dates → count 3 (persistent). No issue_key.
  await ins({ id: "f3", project_id: P, recurrence_count: 3, recurrence_dates_json: "[3000,3100,3200]", created_at: 3000, status: "open", observation: "B", title: "Issue B" })

  // Group C: issue_key KEY-C, single row, count 1, not regressed → EXCLUDED.
  await ins({ id: "f4", project_id: P, issue_key: "KEY-C", recurrence_count: 1, created_at: 500, status: "open", observation: "C once", title: "Issue C" })

  return { c, P }
}

test("#656: listProjectRecurringIssues returns expected issues, order, and fields", async () => {
  const { c, P } = await seedRecurringDb()
  const out = await listProjectRecurringIssues(c, P)

  // Group C (count 1, not regressed) is filtered out; A and B remain.
  expect(out.length).toBe(2)

  // Order: sorted by impact.score desc, then lastSeenAt desc. A and B both reach
  // count 3 (A's stored receipt adds a 3rd occurrence date → score 600 each), so the
  // tiebreak is recency: B (lastSeen 3200) outranks A (lastSeen 2500).
  expect(out.map((o) => o.feedbackId)).toEqual(["f3", "f1"])
  expect(out.map((o) => o.title)).toEqual(["Issue B", "Issue A"])

  const b = out[0]
  expect(b.count).toBe(3)
  expect(b.impact.tier).toBe("persistent")
  expect(b.issueKey).toBeNull()

  const a = out[1]
  expect(a.count).toBe(3)
  expect(a.issueKey).toBe("KEY-A")
  expect(a.impact.tier).toBe("persistent")
  // Sim attribution + expectation link were fetched.
  expect(a.citedSimName).toBe("Alice")
  expect(a.expectationId).toBe("exp1")
  expect(a.expectationStatus).toBe("validated")
  // The stored receipt from f2 became one of the occurrences (isOriginal:false).
  expect(a.occurrences.some((o) => o.occurrenceId === "occ1" && o.observation === "A receipt")).toBe(true)
})

test("#656: parallelized fetch is deterministic across repeated calls (order-stable)", async () => {
  const { c, P } = await seedRecurringDb()
  const first = await listProjectRecurringIssues(c, P)
  const second = await listProjectRecurringIssues(c, P)
  expect(JSON.stringify(second)).toBe(JSON.stringify(first))
})
