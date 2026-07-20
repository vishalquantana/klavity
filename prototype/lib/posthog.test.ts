// Tests for the PostHog server-side capture helper — KLAVITYKLA-335.
import { expect, test, afterEach } from "bun:test"
import { capturePosthog, posthogReplayEnabled, POSTHOG_REPLAY_USER_CAP } from "./posthog"

// ── helpers ───────────────────────────────────────────────────────────────────

async function withKey(key: string | undefined, fn: () => Promise<unknown> | unknown): Promise<void> {
  const original = process.env.KLAV_POSTHOG_KEY
  if (key === undefined) {
    delete process.env.KLAV_POSTHOG_KEY
  } else {
    process.env.KLAV_POSTHOG_KEY = key
  }
  try {
    await fn()
  } finally {
    if (original === undefined) {
      delete process.env.KLAV_POSTHOG_KEY
    } else {
      process.env.KLAV_POSTHOG_KEY = original
    }
  }
}

// Capture the most-recently intercepted fetch body.
let lastFetchBody: Record<string, unknown> | null = null
let fetchCallCount = 0

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
  lastFetchBody = null
  fetchCallCount = 0
})

function mockFetch(status = 200): void {
  global.fetch = (async (_url: unknown, opts?: RequestInit) => {
    fetchCallCount++
    try {
      lastFetchBody = JSON.parse(String(opts?.body ?? "{}"))
    } catch {
      lastFetchBody = null
    }
    return new Response("{}", { status })
  }) as typeof fetch
}

// ── tests ─────────────────────────────────────────────────────────────────────

test("capturePosthog: no-ops when KLAV_POSTHOG_KEY is not set", async () => {
  mockFetch()
  await withKey(undefined, () => capturePosthog("user@example.com", "signup_completed", {}))
  expect(fetchCallCount).toBe(0)
})

test("capturePosthog: sends correct payload when key is set", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await capturePosthog("user@example.com", "signup_completed", { email: "user@example.com", source: "organic" })
  })
  expect(fetchCallCount).toBe(1)
  expect(lastFetchBody).not.toBeNull()
  expect(lastFetchBody!.api_key).toBe("phc_testkey")
  expect(lastFetchBody!.distinct_id).toBe("user@example.com")
  expect(lastFetchBody!.event).toBe("signup_completed")
  const props = lastFetchBody!.properties as Record<string, unknown>
  expect(props.email).toBe("user@example.com")
  expect(props.source).toBe("organic")
  expect(props.$lib).toBe("klavity-server")
})

test("capturePosthog: posts to us.i.posthog.com/capture/", async () => {
  let capturedUrl: string | null = null
  global.fetch = (async (url: unknown) => {
    capturedUrl = String(url)
    fetchCallCount++
    return new Response("{}", { status: 200 })
  }) as typeof fetch

  await withKey("phc_testkey", async () => {
    await capturePosthog("test@example.com", "project_created", { project_id: "proj_1" })
  })

  expect(capturedUrl).toBe("https://us.i.posthog.com/capture/")
})

test("capturePosthog: swallows network errors silently", async () => {
  global.fetch = (async () => { throw new Error("network error") }) as unknown as typeof fetch
  // Must not throw
  await withKey("phc_testkey", async () => {
    await expect(capturePosthog("user@example.com", "signup_completed")).resolves.toBeUndefined()
  })
})

test("capturePosthog: merges $lib marker into properties", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await capturePosthog("user@example.com", "first_bug_filed", { project_id: "proj_abc" })
  })
  const props = lastFetchBody!.properties as Record<string, unknown>
  expect(props.$lib).toBe("klavity-server")
  expect(props.project_id).toBe("proj_abc")
})

test("capturePosthog: default properties is empty object (no crash)", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await capturePosthog("user@example.com", "signup_completed")
  })
  expect(fetchCallCount).toBe(1)
  expect(lastFetchBody!.distinct_id).toBe("user@example.com")
})

// ── first_bug_filed gate logic (injectable count fn) ─────────────────────────
// The actual "first?" check in server.ts queries the DB. Here we test the
// fire/no-fire decision by wrapping the logic in a testable helper.

/**
 * Simulate the server.ts pattern:
 * "count existing rows before insert; if count is 0, fire the event."
 */
async function maybeCaptureFirstBugFiled(
  countFn: () => Promise<number>,
  projectId: string,
  source: string,
  captureFn: typeof capturePosthog,
): Promise<void> {
  const count = await countFn()
  if (count === 0) {
    // Await explicitly in the test helper so the mock fetch has time to run
    // before assertions. In server.ts this is `void` (fire-and-forget).
    await captureFn("server", "first_bug_filed", { project_id: projectId, source })
  }
}

test("first_bug_filed: fires when existing count is 0", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await maybeCaptureFirstBugFiled(async () => 0, "proj_1", "widget", capturePosthog)
  })
  expect(fetchCallCount).toBe(1)
  expect(lastFetchBody!.event).toBe("first_bug_filed")
})

test("first_bug_filed: does NOT fire when existing count is 1", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await maybeCaptureFirstBugFiled(async () => 1, "proj_1", "widget", capturePosthog)
  })
  expect(fetchCallCount).toBe(0)
})

test("first_bug_filed: does NOT fire when existing count > 1", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await maybeCaptureFirstBugFiled(async () => 42, "proj_1", "extension", capturePosthog)
  })
  expect(fetchCallCount).toBe(0)
})

// ── session-replay gate (KLAVITYKLA-329) ────────────────────────────────────────

test("posthogReplayEnabled: off when no PostHog key configured", () => {
  expect(posthogReplayEnabled({ hasKey: false, toolUserCount: 0 })).toBe(false)
})

test("posthogReplayEnabled: on for early users under the cap", () => {
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: 0 })).toBe(true)
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: 1 })).toBe(true)
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: POSTHOG_REPLAY_USER_CAP - 1 })).toBe(true)
})

test("posthogReplayEnabled: off once the cap is reached (boundary is exclusive)", () => {
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: POSTHOG_REPLAY_USER_CAP })).toBe(false)
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: POSTHOG_REPLAY_USER_CAP + 1 })).toBe(false)
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: 1000 })).toBe(false)
})

test("posthogReplayEnabled: default cap is 50", () => {
  expect(POSTHOG_REPLAY_USER_CAP).toBe(50)
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: 49 })).toBe(true)
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: 50 })).toBe(false)
})

test("posthogReplayEnabled: honours a custom cap override", () => {
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: 9, cap: 10 })).toBe(true)
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: 10, cap: 10 })).toBe(false)
})

test("posthogReplayEnabled: off for invalid/negative counts (fail closed)", () => {
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: -1 })).toBe(false)
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: NaN })).toBe(false)
  expect(posthogReplayEnabled({ hasKey: true, toolUserCount: Infinity })).toBe(false)
})

// ── per-occurrence volume events (KLAVITYKLA-372) ───────────────────────────────
// These are the events that make volume queryable at all: unlike first_*, they must fire
// on EVERY occurrence, exactly once, and never on a failure path.

import {
  OCCURRENCE_EVENTS, buildBugFiledProps, buildSimRunCompletedProps,
  captureBugFiled, captureSimRunCompleted, planTierForProject,
} from "./posthog"

test("OCCURRENCE_EVENTS: declares exactly the two volume events", () => {
  expect([...OCCURRENCE_EVENTS]).toEqual(["bug_filed", "sim_run_completed"])
})

// ── bug_filed props ────────────────────────────────────────────────────────────

test("buildBugFiledProps: carries ids, surface, dedupe flag, priority, plan", () => {
  const p = buildBugFiledProps({
    projectId: "proj_1", feedbackId: "fb_1", source: "widget", deduped: false,
    priority: "High", sentiment: "Negative", hasScreenshot: true, plan: "Pro",
  })
  expect(p.project_id).toBe("proj_1")
  expect(p.feedback_id).toBe("fb_1")
  expect(p.source).toBe("widget")
  expect(p.deduped).toBe(false)
  expect(p.priority).toBe("high")       // normalized
  expect(p.sentiment).toBe("negative")  // normalized
  expect(p.has_screenshot).toBe(true)
  expect(p.plan).toBe("pro")
})

test("buildBugFiledProps: NO PII — no email, no description, no url", () => {
  const p = buildBugFiledProps({
    projectId: "proj_1", feedbackId: "fb_1", source: "extension", deduped: true,
  })
  const keys = Object.keys(p)
  for (const banned of ["email", "reporter_email", "actor", "observation", "description", "url", "page_url", "url_host", "url_path", "screenshot_id"]) {
    expect(keys).not.toContain(banned)
  }
  // and nothing in the values looks like an email or a URL
  const blob = JSON.stringify(p)
  expect(blob).not.toContain("@")
  expect(blob).not.toContain("http")
})

test("buildBugFiledProps: coerces an unknown surface to 'api' (closed enum)", () => {
  expect(buildBugFiledProps({ projectId: "p", feedbackId: "f", source: "<script>", deduped: false }).source).toBe("api")
})

test("buildBugFiledProps: defaults plan to 'free' and caps enum-ish values", () => {
  const p = buildBugFiledProps({
    projectId: "p", feedbackId: "f", source: "sim", deduped: false, priority: "x".repeat(500),
  })
  expect(p.plan).toBe("free")
  expect(String(p.priority).length).toBe(32)
  expect(p.sentiment).toBeNull()
})

// ── sim_run_completed props ────────────────────────────────────────────────────

test("buildSimRunCompletedProps: carries duration (the KLA-371 payoff) and counts", () => {
  const p = buildSimRunCompletedProps({
    projectId: "proj_1", simRunId: "simrun_1", trigger: "scheduled",
    durationMs: 4321.6, simCount: 3, observationCount: 7, status: "done", plan: "free",
  })
  expect(p.project_id).toBe("proj_1")
  expect(p.sim_run_id).toBe("simrun_1")
  expect(p.trigger).toBe("scheduled")
  expect(p.duration_ms).toBe(4322)
  expect(p.sim_count).toBe(3)
  expect(p.observation_count).toBe(7)
  expect(p.status).toBe("done")
})

test("buildSimRunCompletedProps: null/negative/non-finite duration never poisons the series", () => {
  const base = { projectId: "p", simRunId: "r", trigger: "manual" as const, simCount: 1, observationCount: 0 }
  expect(buildSimRunCompletedProps({ ...base, durationMs: null }).duration_ms).toBeNull()
  expect(buildSimRunCompletedProps({ ...base, durationMs: -50 }).duration_ms).toBe(0)
  expect(buildSimRunCompletedProps({ ...base, durationMs: NaN }).duration_ms).toBeNull()
  expect(buildSimRunCompletedProps({ ...base, durationMs: Infinity }).duration_ms).toBeNull()
})

test("buildSimRunCompletedProps: unknown trigger falls back to 'manual'", () => {
  const p = buildSimRunCompletedProps({
    projectId: "p", simRunId: "r", trigger: "whatever" as any,
    durationMs: 1, simCount: 0, observationCount: 0,
  })
  expect(p.trigger).toBe("manual")
})

test("buildSimRunCompletedProps: NO PII — no url, no actor email, no observation text", () => {
  const p = buildSimRunCompletedProps({
    projectId: "p", simRunId: "r", trigger: "manual", durationMs: 10, simCount: 1, observationCount: 2,
  })
  const keys = Object.keys(p)
  for (const banned of ["url", "page_url", "actor_email", "email", "reactions", "observations", "screenshot_id"]) {
    expect(keys).not.toContain(banned)
  }
  expect(JSON.stringify(p)).not.toContain("@")
})

// ── emission ───────────────────────────────────────────────────────────────────

test("captureBugFiled: fires exactly once with event name bug_filed", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await captureBugFiled("user@example.com", {
      projectId: "proj_1", feedbackId: "fb_9", source: "widget", deduped: false, plan: "pro",
    })
  })
  expect(fetchCallCount).toBe(1)
  expect(lastFetchBody!.event).toBe("bug_filed")
  expect(lastFetchBody!.distinct_id).toBe("user@example.com")
  const props = lastFetchBody!.properties as Record<string, unknown>
  expect(props.feedback_id).toBe("fb_9")
  expect(props.plan).toBe("pro")
  expect(props.$lib).toBe("klavity-server")
})

test("captureSimRunCompleted: fires exactly once with duration attached", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await captureSimRunCompleted("dev@example.com", {
      projectId: "proj_1", simRunId: "simrun_9", trigger: "manual",
      durationMs: 1500, simCount: 2, observationCount: 5,
    })
  })
  expect(fetchCallCount).toBe(1)
  expect(lastFetchBody!.event).toBe("sim_run_completed")
  expect((lastFetchBody!.properties as any).duration_ms).toBe(1500)
})

test("occurrence events: N occurrences ⇒ N events (this is the whole point vs first_*)", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    for (let i = 0; i < 5; i++) {
      await captureBugFiled("user@example.com", {
        projectId: "proj_1", feedbackId: `fb_${i}`, source: "widget", deduped: false,
      })
    }
  })
  expect(fetchCallCount).toBe(5)
})

test("occurrence events: a PostHog outage does not throw into the caller", async () => {
  global.fetch = (async () => { throw new Error("posthog down") }) as unknown as typeof fetch
  await withKey("phc_testkey", async () => {
    await expect(captureBugFiled("u@e.com", {
      projectId: "p", feedbackId: "f", source: "widget", deduped: false,
    })).resolves.toBeUndefined()
    await expect(captureSimRunCompleted("u@e.com", {
      projectId: "p", simRunId: "r", trigger: "manual", durationMs: 1, simCount: 1, observationCount: 0,
    })).resolves.toBeUndefined()
  })
})

test("occurrence events: unconfigured PostHog is a silent no-op", async () => {
  mockFetch()
  await withKey(undefined, async () => {
    await captureBugFiled("u@e.com", { projectId: "p", feedbackId: "f", source: "widget", deduped: false })
    await captureSimRunCompleted("u@e.com", { projectId: "p", simRunId: "r", trigger: "manual", durationMs: 1, simCount: 0, observationCount: 0 })
  })
  expect(fetchCallCount).toBe(0)
})

// ── emit-site gating: mirrors the server.ts / sim-review-schedule.ts guards ─────
// server.ts emits `bug_filed` once, AFTER the dedupe/insert if-else, gated on feedbackId.
// Both branches are mutually exclusive, so one submission can only ever produce one event.

async function submitOnce(
  outcome: { feedbackId: string | null; deduped: boolean },
  captureFn: typeof captureBugFiled,
): Promise<void> {
  if (outcome.feedbackId) {
    await captureFn("actor@example.com", {
      projectId: "proj_1", feedbackId: outcome.feedbackId, source: "widget", deduped: outcome.deduped,
    })
  }
}

test("bug_filed: fires once for a brand-new report", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await submitOnce({ feedbackId: "fb_new", deduped: false }, captureBugFiled)
  })
  expect(fetchCallCount).toBe(1)
  expect((lastFetchBody!.properties as any).deduped).toBe(false)
})

test("bug_filed: fires once for a deduped repeat, flagged deduped:true", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await submitOnce({ feedbackId: "fb_existing", deduped: true }, captureBugFiled)
  })
  expect(fetchCallCount).toBe(1)
  expect((lastFetchBody!.properties as any).deduped).toBe(true)
})

test("bug_filed: does NOT fire when nothing was persisted (failure path)", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await submitOnce({ feedbackId: null, deduped: false }, captureBugFiled)
  })
  expect(fetchCallCount).toBe(0)
})

// sim_run_completed is gated on a non-null id from a SUCCESSFUL insertSimRun.
async function finishRun(
  insertSimRunFn: () => Promise<string>,
  captureFn: typeof captureSimRunCompleted,
): Promise<void> {
  let runId: string | null = null
  try { runId = await insertSimRunFn() } catch { /* persist failed */ }
  if (runId) {
    await captureFn("dev@example.com", {
      projectId: "proj_1", simRunId: runId, trigger: "manual",
      durationMs: 900, simCount: 1, observationCount: 1,
    })
  }
}

test("sim_run_completed: fires once per successful run persist", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await finishRun(async () => "simrun_a", captureSimRunCompleted)
  })
  expect(fetchCallCount).toBe(1)
  expect((lastFetchBody!.properties as any).sim_run_id).toBe("simrun_a")
})

test("sim_run_completed: does NOT fire when the run persist throws", async () => {
  mockFetch()
  await withKey("phc_testkey", async () => {
    await finishRun(async () => { throw new Error("db down") }, captureSimRunCompleted)
  })
  expect(fetchCallCount).toBe(0)
})

// ── plan tier lookup ───────────────────────────────────────────────────────────

test("planTierForProject: resolves project → account → plan", async () => {
  const plan = await planTierForProject("proj_1", {
    accountIdForProject: async () => "acct_1",
    accountPlan: async () => "pro",
  })
  expect(plan).toBe("pro")
})

test("planTierForProject: null when the project has no account", async () => {
  const plan = await planTierForProject("proj_x", {
    accountIdForProject: async () => null,
    accountPlan: async () => "pro",
  })
  expect(plan).toBeNull()
})

test("planTierForProject: swallows DB errors (an event must never be lost to a lookup)", async () => {
  const plan = await planTierForProject("proj_1", {
    accountIdForProject: async () => { throw new Error("db down") },
    accountPlan: async () => "pro",
  })
  expect(plan).toBeNull()
})
