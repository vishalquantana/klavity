import { expect, test, describe, beforeEach, afterEach } from "bun:test"
import { buildWalkRedSlackPayload, notifyWalkRed, type WalkRedAlertContext } from "./walk-red-alert"

const ctx: WalkRedAlertContext = {
  trailName: "Checkout flow",
  trailId: "trail_abc123",
  projectId: "proj_xyz789",
  runId: "run_111222",
  reasons: ['step 2 (click "Add to cart"): RED', 'step 4 (assert "Order confirmed"): RED'],
  at: 1_718_000_000_000,
}

describe("buildWalkRedSlackPayload", () => {
  test("fallback text contains trail name", () => {
    const p = buildWalkRedSlackPayload(ctx)
    expect(p.text).toContain("Checkout flow")
    expect(p.text).toContain("RED")
  })

  test("header block type is header", () => {
    const p = buildWalkRedSlackPayload(ctx)
    expect(p.blocks[0].type).toBe("header")
    expect(p.blocks[0].text.text).toContain("RED")
  })

  test("fields include trail name, verdict, findings, and time", () => {
    const p = buildWalkRedSlackPayload(ctx)
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).toContain("Checkout flow")
    expect(fieldsText).toContain("RED")
    expect(fieldsText).toContain("Add to cart")
    expect(fieldsText).toContain("Order confirmed")
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
    const c2 = { ...ctx, reasons: ['step 1 (navigate): RED'] }
    const p = buildWalkRedSlackPayload(c2)
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).toContain("step 1 (navigate): RED")
  })

  test("empty reasons shows fallback text", () => {
    const c2 = { ...ctx, reasons: [] }
    const p = buildWalkRedSlackPayload(c2)
    const fieldsText = JSON.stringify(p.blocks[1].fields)
    expect(fieldsText).toContain("No reason recorded")
  })
})

describe("notifyWalkRed", () => {
  const origWebhook = process.env.SLACK_SIGNUP_WEBHOOK_URL
  const origAlertWebhook = process.env.SLACK_ALERT_WEBHOOK_URL
  const origBase = process.env.KLAV_BASE_URL

  afterEach(() => {
    if (origWebhook === undefined) delete process.env.SLACK_SIGNUP_WEBHOOK_URL
    else process.env.SLACK_SIGNUP_WEBHOOK_URL = origWebhook
    if (origAlertWebhook === undefined) delete process.env.SLACK_ALERT_WEBHOOK_URL
    else process.env.SLACK_ALERT_WEBHOOK_URL = origAlertWebhook
    if (origBase === undefined) delete process.env.KLAV_BASE_URL
    else process.env.KLAV_BASE_URL = origBase
  })

  test("no-op when both SLACK_SIGNUP_WEBHOOK_URL and SLACK_ALERT_WEBHOOK_URL are unset", async () => {
    delete process.env.SLACK_SIGNUP_WEBHOOK_URL
    delete process.env.SLACK_ALERT_WEBHOOK_URL
    // Should resolve without error
    await expect(notifyWalkRed(ctx)).resolves.toBeUndefined()
  })

  test("posts to SLACK_ALERT_WEBHOOK_URL when set", async () => {
    delete process.env.SLACK_SIGNUP_WEBHOOK_URL
    process.env.SLACK_ALERT_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/WALK/RED_ALERT"
    process.env.KLAV_BASE_URL = "https://klavity.in"
    await expect(notifyWalkRed(ctx)).resolves.toBeUndefined()
  })

  test("posts to SLACK_SIGNUP_WEBHOOK_URL as fallback", async () => {
    delete process.env.SLACK_ALERT_WEBHOOK_URL
    process.env.SLACK_SIGNUP_WEBHOOK_URL = "https://hooks.slack.com/services/TEST/WALK/SIGNUP"
    process.env.KLAV_BASE_URL = "https://klavity.in"
    await expect(notifyWalkRed(ctx)).resolves.toBeUndefined()
  })
})
