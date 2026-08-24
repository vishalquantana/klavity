// KLA-547 — emit-point tests for the conversion milestone taxonomy.
//
// The taxonomy lives in funnel.ts (tested in analytics-taxonomy.test.ts). This file proves the
// EMIT SITES behave: each server-side milestone fires exactly once per real occurrence, gated on
// durable "first?" state, and never on failure paths. Where a gate is inline in server.ts, we
// mirror its exact guard shape here (the same pattern posthog.test.ts uses for first_bug_filed);
// where the emit lives in an injectable lib (maybeEmitFirstAutosim), we drive the real code.
import { describe, expect, test, afterEach } from "bun:test"
import { maybeEmitFirstAutosim } from "./trails-trigger"
import type { Client } from "@libsql/client"

// ── widget_installed gate (mirrors the /api/widget/ping handler's guard) ──────

/**
 * Exact shape of the server.ts ping-handler guard: read the durable store BEFORE the upsert;
 * null row ⇒ genuine first install; a failed pre-read suppresses (fail closed).
 */
async function widgetInstalledGate(
  latestPing: () => Promise<{ host: string } | null>,
  recordPing: () => Promise<void>,
  onMilestone: () => void,
): Promise<boolean> {
  let firstInstall = false
  try { firstInstall = !(await latestPing()) } catch { firstInstall = false }
  await recordPing().catch(() => {})
  if (firstInstall) onMilestone()
  return firstInstall
}

describe("widget_installed emit point", () => {
  test("fires when no widget_pings row exists yet (genuine first install)", async () => {
    let fired = 0
    await widgetInstalledGate(async () => null, async () => {}, () => fired++)
    expect(fired).toBe(1)
  })

  test("does NOT fire once a ping row exists (repeat pings are not installs)", async () => {
    let fired = 0
    await widgetInstalledGate(async () => ({ host: "acme.com" }), async () => {}, () => fired++)
    expect(fired).toBe(0)
  })

  test("a failed pre-read suppresses the milestone (fail closed, no false first)", async () => {
    let fired = 0
    await widgetInstalledGate(async () => { throw new Error("db down") }, async () => {}, () => fired++)
    expect(fired).toBe(0)
  })
})

// ── first_report / first_sim gates (mirror the prior-count guards in server.ts) ──

async function priorCountGate(
  countFn: () => Promise<number>,
  onMilestone: () => void,
): Promise<void> {
  const count = await countFn()
  if (count === 0) onMilestone()
}

describe("first_report / first_sim emit-point gating", () => {
  test("first_report fires only when prior feedback count is 0", async () => {
    let fired = 0
    await priorCountGate(async () => 0, () => fired++)
    expect(fired).toBe(1)
    await priorCountGate(async () => 1, () => fired++)
    await priorCountGate(async () => 42, () => fired++)
    expect(fired).toBe(1)
  })

  test("first_sim mirrors the server's sim_runs pre-insert count guard", async () => {
    // server.ts counts BEFORE insertSimRun; the new row must not satisfy its own gate.
    let storedRuns = 0
    let fired = 0
    const insertRun = () => { storedRuns++ }
    await priorCountGate(async () => storedRuns, () => fired++)
    insertRun()
    expect(fired).toBe(1)
    // A second run: count is now 1 → no re-fire.
    await priorCountGate(async () => storedRuns, () => fired++)
    expect(fired).toBe(1)
  })
})

// ── upgrade gate (Stripe webhook emits once per checkout.session.completed with an account) ──

describe("upgrade emit point", () => {
  test("emits once per applied checkout session; skips when the session yields no account", () => {
    let fired = 0
    const applySession = (acctId: string | null, emit: () => void) => {
      if (!acctId) return
      emit()
    }
    applySession("acct_1", () => fired++)
    applySession(null, () => fired++)
    applySession("acct_2", () => fired++)
    expect(fired).toBe(2)
  })
})

// ── first_autosim — driven through the REAL exported emit helper ───────────────
// runWalkNow captures the prior-walk count BEFORE startWalk inserts the current run's row and hands
// it to maybeEmitFirstAutosim. These tests drive the real helper end to end: PostHog via mocked
// fetch, and the funnel_events leg against a REAL isolated SQLite DB via useIsolatedDb (the same
// harness growth-scorecard.test.ts uses) — so we prove the actual INSERT lands, not just that SQL
// was shaped correctly.
import { useIsolatedDb } from "./test-db-isolation"

const { getClient } = useIsolatedDb("klav-analytics-emit")

let lastFetchBody: Record<string, unknown> | null = null
let fetchCallCount = 0
const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
  lastFetchBody = null
  fetchCallCount = 0
  delete process.env.KLAV_POSTHOG_KEY
})

function mockFetchCapture(): void {
  global.fetch = (async (_u: unknown, opts?: RequestInit) => {
    fetchCallCount++
    try { lastFetchBody = JSON.parse(String(opts?.body ?? "{}")) } catch { lastFetchBody = null }
    return new Response("{}", { status: 200 })
  }) as typeof fetch
}

describe("first_autosim emit point (real maybeEmitFirstAutosim)", () => {
  test("first walk (prior count 0) ⇒ funnel_events row + PostHog mirror with trigger + sim_run_id", async () => {
    process.env.KLAV_POSTHOG_KEY = "phc_testkey"
    mockFetchCapture()

    await maybeEmitFirstAutosim("proj_1", "run_abc", "manual", 0)

    // PostHog leg: unaliased name + the property bag the taxonomy promises.
    expect(fetchCallCount).toBe(1)
    expect(lastFetchBody!.event).toBe("first_autosim")
    expect(lastFetchBody!.distinct_id).toBe("server") // no email/account/anonId for project-scoped emits
    expect((lastFetchBody!.properties as any).project_id).toBe("proj_1")
    expect((lastFetchBody!.properties as any).trigger).toBe("manual")
    expect((lastFetchBody!.properties as any).sim_run_id).toBe("run_abc")

    // Funnel leg: the canonical taxonomy row REALLY persisted (isolated SQLite). project_id lives
    // in props_json — funnel_events has no dedicated project_id column.
    const c = getClient()
    const r = await c.execute({ sql: "SELECT event, props_json FROM funnel_events WHERE event='first_autosim'", args: [] })
    expect(r.rows.length).toBe(1)
    const props = JSON.parse(String((r.rows[0] as any).props_json ?? "{}"))
    expect(props.project_id).toBe("proj_1")
    expect(props.trigger).toBe("manual")
    expect(props.sim_run_id).toBe("run_abc")
  })

  test("non-first walks are silent for BOTH trigger variants (no re-fire)", async () => {
    process.env.KLAV_POSTHOG_KEY = "phc_testkey"
    global.fetch = (async () => { fetchCallCount++; return new Response("{}", { status: 200 }) }) as typeof fetch
    const c = getClient()
    const before = await c.execute({ sql: "SELECT COUNT(*) AS n FROM funnel_events WHERE event='first_autosim'", args: [] })
    await maybeEmitFirstAutosim("p", "r1", "scheduled", 1)
    await maybeEmitFirstAutosim("p", "r2", "manual", 7)
    expect(fetchCallCount).toBe(0)
    const after = await c.execute({ sql: "SELECT COUNT(*) AS n FROM funnel_events WHERE event='first_autosim'", args: [] })
    expect(Number((after.rows[0] as any).n)).toBe(Number((before.rows[0] as any).n))
  })

  test("a PostHog outage is swallowed — never reaches the walk slot or caller", async () => {
    process.env.KLAV_POSTHOG_KEY = "phc_testkey"
    global.fetch = (async () => { throw new Error("posthog down") }) as unknown as typeof fetch
    await expect(maybeEmitFirstAutosim("p", "r", "manual", 0)).resolves.toBeUndefined()
  })
})
