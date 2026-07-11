import { expect, test, describe, beforeEach, afterEach } from "bun:test"
import { buildWalkRedSlackPayload, notifyWalkRed, isInfraFailure, type WalkRedAlertContext } from "./walk-red-alert"

const ctx: WalkRedAlertContext = {
  trailName: "Checkout flow",
  trailId: "trail_abc123",
  projectId: "proj_xyz789",
  runId: "run_111222",
  reasons: [
    'Step 2: clicking "Add to cart" — the action could not be completed.',
    'Step 4: the check "Order confirmed" failed — the expected state wasn\'t found on the page.',
  ],
  at: 1_718_000_000_000,
}

describe("isInfraFailure", () => {
  test("crash failureKind is infra", () => {
    expect(isInfraFailure({ failureKind: "crash" })).toBe(true)
  })
  test("browserUnavailable is infra", () => {
    expect(isInfraFailure({ browserUnavailable: true })).toBe(true)
  })
  test("regression failureKind is NOT infra", () => {
    expect(isInfraFailure({ failureKind: "regression" })).toBe(false)
  })
  test("no flags is NOT infra (genuine regression)", () => {
    expect(isInfraFailure({})).toBe(false)
  })
})

describe("buildWalkRedSlackPayload — regression (genuine RED)", () => {
  test("fallback text contains trail name and failure indication", () => {
    const p = buildWalkRedSlackPayload(ctx)
    expect(p.text).toContain("Checkout flow")
    expect(p.text).toContain("failed")
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).toContain("regression")
  })

  test("header block type is header and describes a walk failure", () => {
    const p = buildWalkRedSlackPayload(ctx)
    expect(p.blocks[0].type).toBe("header")
    // Header should describe the failure in plain language (contains "failed" or the RED emoji)
    const headerText: string = p.blocks[0].text.text
    expect(headerText.toLowerCase()).toMatch(/fail|red/)
  })

  test("fields include trail name, verdict, findings, and time", () => {
    const p = buildWalkRedSlackPayload(ctx)
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).toContain("Checkout flow")
    expect(fieldsText).toContain("RED")
    expect(fieldsText).toContain("Add to cart")
    expect(fieldsText).toContain("Order confirmed")
    expect(fieldsText).toContain("What failed")
  })

  test("walk report link included when baseUrl provided and includes project query param", () => {
    const p = buildWalkRedSlackPayload(ctx, "https://klavity.in")
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).toContain("https://klavity.in/autosims/walk/run_111222?project=proj_xyz789")
  })

  test("no walk report link when baseUrl absent", () => {
    const p = buildWalkRedSlackPayload(ctx)
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).not.toContain("/autosims/walk/")
  })

  test("context block contains trailId, runId, projectId", () => {
    const p = buildWalkRedSlackPayload(ctx)
    const ctxBlock = p.blocks.find((b: any) => b.type === "context")
    expect(ctxBlock).toBeTruthy()
    const text = ctxBlock.elements[0].text
    expect(text).toContain("trail_abc123")
    expect(text).toContain("run_111222")
    expect(text).toContain("proj_xyz789")
  })

  test("single reason rendered correctly", () => {
    const reason = "Step 1: navigating — the action could not be completed."
    const c2 = { ...ctx, reasons: [reason] }
    const p = buildWalkRedSlackPayload(c2)
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).toContain("Step 1")
    expect(fieldsText).toContain("navigating")
  })

  test("empty reasons shows fallback text", () => {
    const c2 = { ...ctx, reasons: [] }
    const p = buildWalkRedSlackPayload(c2)
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).toContain("No reason recorded")
  })
})

describe("buildWalkRedSlackPayload — infra (crash / browserUnavailable)", () => {
  const infraCtx: WalkRedAlertContext = {
    ...ctx,
    reasons: ["Could not connect to the Steel remote browser at wss://connect.steel.dev (Timeout 30000ms exceeded)."],
    failureKind: "crash",
    browserUnavailable: true,
  }

  test("labels as infra/connection failure, NOT regression", () => {
    const p = buildWalkRedSlackPayload(infraCtx)
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).toContain("infrastructure")
    expect(fieldsText).not.toContain("regression detected")
    expect(fieldsText).toContain("Cause")
  })

  test("header mentions infra failure", () => {
    const p = buildWalkRedSlackPayload(infraCtx)
    expect(p.blocks[0].text.text).toContain("infra")
    expect(p.text).toContain("infra")
  })

  test("browserUnavailable alone (no failureKind) is treated as infra", () => {
    const p = buildWalkRedSlackPayload({ ...ctx, browserUnavailable: true })
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).toContain("infrastructure")
  })
})

describe("notifyWalkRed — regression routing", () => {
  const origSignup = process.env.SLACK_SIGNUP_WEBHOOK_URL
  const origAlert = process.env.SLACK_ALERT_WEBHOOK_URL
  const origError = process.env.SLACK_ERROR_WEBHOOK_URL
  const origBase = process.env.KLAV_BASE_URL

  afterEach(() => {
    for (const [k, v] of [
      ["SLACK_SIGNUP_WEBHOOK_URL", origSignup],
      ["SLACK_ALERT_WEBHOOK_URL", origAlert],
      ["SLACK_ERROR_WEBHOOK_URL", origError],
      ["KLAV_BASE_URL", origBase],
    ] as const) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  })

  test("no-op when neither SLACK_ALERT_WEBHOOK_URL nor SLACK_ERROR_WEBHOOK_URL is set", async () => {
    delete process.env.SLACK_SIGNUP_WEBHOOK_URL
    delete process.env.SLACK_ALERT_WEBHOOK_URL
    delete process.env.SLACK_ERROR_WEBHOOK_URL
    await expect(notifyWalkRed(ctx)).resolves.toBeUndefined()
  })

  test("posts to SLACK_ALERT_WEBHOOK_URL when set (regression)", async () => {
    delete process.env.SLACK_SIGNUP_WEBHOOK_URL
    process.env.SLACK_ALERT_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/WALK/RED_ALERT"
    process.env.KLAV_BASE_URL = "https://klavity.in"
    await expect(notifyWalkRed(ctx)).resolves.toBeUndefined()
  })

  test("falls back to SLACK_ERROR_WEBHOOK_URL (never signup) when alert unset", async () => {
    // Even if the signup webhook is set, a walk regression must NOT go there.
    process.env.SLACK_SIGNUP_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/SIGNUP/CHANNEL"
    delete process.env.SLACK_ALERT_WEBHOOK_URL
    process.env.SLACK_ERROR_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/ERROR/CHANNEL"
    await expect(notifyWalkRed(ctx)).resolves.toBeUndefined()
  })

  test("no-op when only signup webhook is set (regression never pollutes signup)", async () => {
    process.env.SLACK_SIGNUP_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/SIGNUP/ONLY"
    delete process.env.SLACK_ALERT_WEBHOOK_URL
    delete process.env.SLACK_ERROR_WEBHOOK_URL
    await expect(notifyWalkRed(ctx)).resolves.toBeUndefined()
  })
})

// ── environment gate ─────────────────────────────────────────────────────────
describe("notifyWalkRed — environment gate (no-op in test/CI/dev)", () => {
  const FAKE_ALERT = "https://hooks.slack.com/services/T00/B00/alert"
  const FAKE_ERROR = "https://hooks.slack.com/services/T00/B00/error"
  const ENV_VARS = ["KLAV_ENV", "NODE_ENV"] as const
  type EnvKey = typeof ENV_VARS[number]
  let savedEnv: Record<EnvKey, string | undefined>
  let savedAlert: string | undefined
  let savedError: string | undefined
  let origFetch: typeof globalThis.fetch

  beforeEach(() => {
    savedEnv = Object.fromEntries(ENV_VARS.map((k) => [k, process.env[k]])) as Record<EnvKey, string | undefined>
    savedAlert = process.env.SLACK_ALERT_WEBHOOK_URL
    savedError = process.env.SLACK_ERROR_WEBHOOK_URL
    origFetch = globalThis.fetch
    // set webhooks so the only gate is env
    process.env.SLACK_ALERT_WEBHOOK_URL = FAKE_ALERT
    process.env.SLACK_ERROR_WEBHOOK_URL = FAKE_ERROR
  })

  afterEach(() => {
    for (const k of ENV_VARS) {
      if (savedEnv[k] !== undefined) process.env[k] = savedEnv[k]!
      else delete process.env[k]
    }
    if (savedAlert !== undefined) process.env.SLACK_ALERT_WEBHOOK_URL = savedAlert
    else delete process.env.SLACK_ALERT_WEBHOOK_URL
    if (savedError !== undefined) process.env.SLACK_ERROR_WEBHOOK_URL = savedError
    else delete process.env.SLACK_ERROR_WEBHOOK_URL
    globalThis.fetch = origFetch
  })

  test("no-op (no fetch) for regression walk when NODE_ENV=test", async () => {
    delete process.env.KLAV_ENV
    process.env.NODE_ENV = "test"
    const calls: boolean[] = []
    globalThis.fetch = async () => { calls.push(true); return { ok: true, status: 200 } as Response }
    await notifyWalkRed(ctx)
    expect(calls).toHaveLength(0)
  })

  test("no-op (no fetch) for regression walk when NODE_ENV=ci", async () => {
    delete process.env.KLAV_ENV
    process.env.NODE_ENV = "ci"
    const calls: boolean[] = []
    globalThis.fetch = async () => { calls.push(true); return { ok: true, status: 200 } as Response }
    await notifyWalkRed(ctx)
    expect(calls).toHaveLength(0)
  })

  test("no-op (no fetch) for infra walk when NODE_ENV=test", async () => {
    delete process.env.KLAV_ENV
    process.env.NODE_ENV = "test"
    const calls: boolean[] = []
    globalThis.fetch = async () => { calls.push(true); return { ok: true, status: 200 } as Response }
    await notifyWalkRed({ ...ctx, failureKind: "crash", browserUnavailable: true })
    expect(calls).toHaveLength(0)
  })

  test("no-op when KLAV_ENV=test (overrides NODE_ENV)", async () => {
    process.env.KLAV_ENV = "test"
    process.env.NODE_ENV = "production"
    const calls: boolean[] = []
    globalThis.fetch = async () => { calls.push(true); return { ok: true, status: 200 } as Response }
    await notifyWalkRed(ctx)
    expect(calls).toHaveLength(0)
  })

  test("resolves undefined and does not throw in test env", async () => {
    delete process.env.KLAV_ENV
    process.env.NODE_ENV = "test"
    await expect(notifyWalkRed(ctx)).resolves.toBeUndefined()
  })
})

describe("notifyWalkRed — infra routing", () => {
  const origSignup = process.env.SLACK_SIGNUP_WEBHOOK_URL
  const origAlert = process.env.SLACK_ALERT_WEBHOOK_URL
  const origError = process.env.SLACK_ERROR_WEBHOOK_URL

  afterEach(() => {
    for (const [k, v] of [
      ["SLACK_SIGNUP_WEBHOOK_URL", origSignup],
      ["SLACK_ALERT_WEBHOOK_URL", origAlert],
      ["SLACK_ERROR_WEBHOOK_URL", origError],
    ] as const) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  })

  test("infra failure routes to SLACK_ERROR_WEBHOOK_URL (not alert, not signup)", async () => {
    process.env.SLACK_SIGNUP_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/SIGNUP/CHANNEL"
    process.env.SLACK_ALERT_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/ALERT/CHANNEL"
    process.env.SLACK_ERROR_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/ERROR/CHANNEL"
    await expect(
      notifyWalkRed({ ...ctx, failureKind: "crash", browserUnavailable: true }),
    ).resolves.toBeUndefined()
  })

  test("infra failure is a no-op when SLACK_ERROR_WEBHOOK_URL unset (never falls to alert/signup)", async () => {
    process.env.SLACK_SIGNUP_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/SIGNUP/CHANNEL"
    process.env.SLACK_ALERT_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/ALERT/CHANNEL"
    delete process.env.SLACK_ERROR_WEBHOOK_URL
    await expect(
      notifyWalkRed({ ...ctx, browserUnavailable: true }),
    ).resolves.toBeUndefined()
  })
})
