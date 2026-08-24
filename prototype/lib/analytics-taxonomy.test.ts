// KLA-547 — conversion event taxonomy tests.
//
// Covers: the milestone vocabulary + PostHog alias mapping, and trackMilestone — the ONE helper
// every conversion-milestone call site uses (funnel_events row + PostHog mirror). Hermetic:
// fetch is mocked like posthog.test.ts, and the libSQL client is a stub that records executed SQL.
import { expect, test, afterEach } from "bun:test"
import {
  FUNNEL_EVENTS,
  CONVERSION_MILESTONES,
  MILESTONE_POSTHOG_ALIAS,
  posthogEventForMilestone,
  buildMilestoneProps,
  trackMilestone,
  type ConversionMilestone,
} from "./funnel"
import type { Client } from "@libsql/client"

// ── taxonomy shape ────────────────────────────────────────────────────────────

test("taxonomy: declares the seven ordered conversion milestones", () => {
  expect([...CONVERSION_MILESTONES]).toEqual([
    "signup", "project_created", "widget_installed", "first_report",
    "first_sim", "first_autosim", "upgrade",
  ])
})

test("taxonomy: every milestone is a legal funnel_events event", () => {
  const events = new Set(FUNNEL_EVENTS as readonly string[])
  for (const m of CONVERSION_MILESTONES) expect(events.has(m)).toBe(true)
})

test("taxonomy: milestones are unique (no stage appears twice)", () => {
  expect(new Set(CONVERSION_MILESTONES).size).toBe(CONVERSION_MILESTONES.length)
})

test("taxonomy: PostHog aliases preserve the long-lived event names (history stays queryable)", () => {
  // The pre-KLA-547 PostHog stream used these names; renaming would orphan funnels.
  expect(MILESTONE_POSTHOG_ALIAS.signup).toBe("signup_completed")
  expect(MILESTONE_POSTHOG_ALIAS.first_report).toBe("first_bug_filed")
  expect(MILESTONE_POSTHOG_ALIAS.first_sim).toBe("first_sim_run")
  expect(MILESTONE_POSTHOG_ALIAS.upgrade).toBe("purchase")
  // New milestones introduced by this ticket have no alias — name IS the PostHog name.
  for (const m of ["project_created", "widget_installed", "first_autosim"] as ConversionMilestone[]) {
    expect(MILESTONE_POSTHOG_ALIAS[m]).toBeNull()
  }
})

test("posthogEventForMilestone: falls back to the milestone name when no alias", () => {
  expect(posthogEventForMilestone("signup")).toBe("signup_completed")
  expect(posthogEventForMilestone("first_autosim")).toBe("first_autosim")
  expect(posthogEventForMilestone("widget_installed")).toBe("widget_installed")
})

// ── buildMilestoneProps ──────────────────────────────────────────────────────

test("buildMilestoneProps: carries project_id when given, nothing when not", () => {
  expect(buildMilestoneProps({ projectId: "proj_1" })).toEqual({ project_id: "proj_1" })
  expect(buildMilestoneProps({})).toEqual({})
})

test("buildMilestoneProps: explicit props win over reserved keys", () => {
  const p = buildMilestoneProps({ projectId: "proj_1", props: { project_id: "proj_override", plan: "pro" } })
  expect(p.project_id).toBe("proj_override")
  expect(p.plan).toBe("pro")
})

// ── trackMilestone emission (mocked fetch + stubbed libSQL client) ────────────

let lastFetchBody: Record<string, unknown> | null = null
let fetchCallCount = 0
const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
  lastFetchBody = null
  fetchCallCount = 0
  delete process.env.KLAV_POSTHOG_KEY
})

function withPosthogKey(key?: string): void {
  if (key) process.env.KLAV_POSTHOG_KEY = key
}

function mockFetch(): void {
  global.fetch = (async (_url: unknown, opts?: RequestInit) => {
    fetchCallCount++
    try { lastFetchBody = JSON.parse(String(opts?.body ?? "{}")) } catch { lastFetchBody = null }
    return new Response("{}", { status: 200 })
  }) as typeof fetch
}

interface ExecutedSql { sql: string; args: unknown[] }
function stubDb(): Client & { executed: ExecutedSql[] } {
  const executed: ExecutedSql[] = []
  return {
    executed,
    execute: (async (arg: any) => {
      executed.push({ sql: String(arg?.sql ?? ""), args: arg?.args ?? [] })
      return { columns: [], rows: [], rowsAffected: 0, lastInsertRowid: undefined } as any
    }) as any,
  } as any
}

test("trackMilestone: writes funnel_events row AND mirrors to PostHog under the aliased name", async () => {
  mockFetch()
  withPosthogKey("phc_testkey")
  const c = stubDb()
  await trackMilestone(c, { milestone: "first_report", projectId: "proj_9", props: { source: "widget" } })

  // PostHog leg: aliased name + $lib marker + ids only.
  expect(fetchCallCount).toBe(1)
  expect(lastFetchBody!.event).toBe("first_bug_filed")
  const ph = lastFetchBody!.properties as Record<string, unknown>
  expect(ph.project_id).toBe("proj_9")
  expect(ph.source).toBe("widget")
  expect(ph.$lib).toBe("klavity-server")

  // Funnel leg: canonical taxonomy name in the INSERT.
  expect(c.executed.length).toBe(1)
  expect(c.executed[0].sql).toContain("INSERT INTO funnel_events")
  expect(c.executed[0].args).toContain("first_report")
})

test("trackMilestone: unaliased milestones use the same name in BOTH stores", async () => {
  mockFetch()
  withPosthogKey("phc_testkey")
  const c = stubDb()
  await trackMilestone(c, { milestone: "widget_installed", projectId: "p1", props: { host: "acme.com" } })
  expect(lastFetchBody!.event).toBe("widget_installed")
  expect((c.executed[0].args as unknown[])).toContain("widget_installed")
})

test("trackMilestone: distinct_id prefers email, then account, then anonId", async () => {
  mockFetch()
  withPosthogKey("phc_testkey")
  await trackMilestone(stubDb(), { milestone: "upgrade", email: "o@x.com", accountId: "acct_1" })
  expect(lastFetchBody!.distinct_id).toBe("o@x.com")
  lastFetchBody = null
  await trackMilestone(stubDb(), { milestone: "first_autosim", accountId: "acct_2", anonId: "anon_7" })
  expect(lastFetchBody!.distinct_id).toBe("acct_2")
  lastFetchBody = null
  await trackMilestone(stubDb(), { milestone: "first_autosim", anonId: "anon_8" })
  expect(lastFetchBody!.distinct_id).toBe("anon_8")
})

test("trackMilestone: no DB → PostHog still fires, no funnel write attempted", async () => {
  mockFetch()
  withPosthogKey("phc_testkey")
  await trackMilestone(null, { milestone: "project_created", email: "u@x.com", projectId: "p1" })
  expect(fetchCallCount).toBe(1)
  expect(lastFetchBody!.event).toBe("project_created")
  await trackMilestone(undefined, { milestone: "project_created", email: "u@x.com", projectId: "p1" })
  expect(fetchCallCount).toBe(2)
})

test("trackMilestone: no PostHog key → funnel_events row still written (analytics must not depend on one vendor)", async () => {
  withPosthogKey(undefined)
  const c = stubDb()
  await trackMilestone(c, { milestone: "signup", email: "n@x.com" })
  expect(fetchCallCount).toBe(0)
  expect(c.executed.length).toBe(1)
  expect(c.executed[0].sql).toContain("INSERT INTO funnel_events")
  expect(c.executed[0].args).toContain("signup")
})

test("trackMilestone: a PostHog outage never blocks the funnel row (and vice versa)", async () => {
  global.fetch = (async () => { throw new Error("posthog down") }) as unknown as typeof fetch
  withPosthogKey("phc_testkey")
  const c = stubDb()
  await expect(trackMilestone(c, { milestone: "upgrade", email: "p@x.com", accountId: "a1" })).resolves.toBeUndefined()
  expect(c.executed.length).toBe(1)
})
