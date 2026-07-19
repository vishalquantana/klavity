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
