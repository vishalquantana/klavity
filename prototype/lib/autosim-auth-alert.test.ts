// KLA-179: founder-style auth-gate alert — builders, per-project-per-day throttle, and the
// fire-and-forget orchestrator with injectable deps (no real SendGrid / Slack).
import { describe, test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-authalert-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-authalert-test-32bytesecr!").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
let dbc: import("@libsql/client").Client
beforeAll(async () => { dbc = reconnectDb("file:" + file); await applySchema(dbc); await migrateV2(dbc) })

const {
  claimAuthAlertSlot, ensureAutosimAuthAlertTable, autosimRouterUrl,
  buildAuthGateEmail, buildAuthGateSlackPayload, notifyAutosimNeedsAuth,
  AUTOSIM_AUTH_ALERT_WINDOW_MS,
} = await import("./autosim-auth-alert")

const { createAuthorSession, updateAuthorSession, listStalledAuthorSessions } = await import("./trails-author")

const baseInput = {
  projectId: "proj_xyz789",
  projectName: "Acme App",
  accountId: "acct_1",
  sessionId: "auth_111",
  pageUrl: "https://acme.example.com/login",
  rationale: "This page is a login form asking for email and password.",
  baseUrl: "https://klavity.in",
  at: 1_718_000_000_000,
}

// ── deep link → /autosims (AT2 router) ───────────────────────────────────────────
describe("autosimRouterUrl", () => {
  test("points at /autosims with a project query param", () => {
    expect(autosimRouterUrl(baseInput)).toBe("https://klavity.in/autosims?project=proj_xyz789")
  })
  test("strips a trailing slash on the base", () => {
    expect(autosimRouterUrl({ ...baseInput, baseUrl: "https://klavity.in/" })).toBe(
      "https://klavity.in/autosims?project=proj_xyz789",
    )
  })
})

// ── founder-voice email ──────────────────────────────────────────────────────────
describe("buildAuthGateEmail", () => {
  test("subject carries the founder line and project name", () => {
    const { subject } = buildAuthGateEmail(baseInput)
    expect(subject).toContain("stopped at the door")
    expect(subject).toContain("Acme App")
    expect(subject).toContain("give it a key")
  })
  test("body links to the /autosims router and mentions the paused-not-failed framing", () => {
    const { html, text } = buildAuthGateEmail(baseInput)
    expect(html).toContain("https://klavity.in/autosims?project=proj_xyz789")
    expect(text).toContain("https://klavity.in/autosims?project=proj_xyz789")
    expect(text.toLowerCase()).toContain("paused")
    expect(text).toContain("acme.example.com/login")
  })
})

// ── slack payload ────────────────────────────────────────────────────────────────
describe("buildAuthGateSlackPayload", () => {
  test("fallback text + header, no emoji, deep link button", () => {
    const p = buildAuthGateSlackPayload(baseInput)
    expect(p.text).toContain("Acme App")
    expect(JSON.stringify(p.blocks)).not.toMatch(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
    const actions = (p.blocks as any[]).find((b) => b.type === "actions")
    expect(actions.elements[0].url).toBe("https://klavity.in/autosims?project=proj_xyz789")
  })
  test("context block carries session + project ids", () => {
    const p = buildAuthGateSlackPayload(baseInput)
    const ctx = (p.blocks as any[]).find((b) => b.type === "context")
    expect(ctx.elements[0].text).toContain("auth_111")
    expect(ctx.elements[0].text).toContain("proj_xyz789")
  })
})

// ── throttle: max 1 per project per day ──────────────────────────────────────────
describe("claimAuthAlertSlot", () => {
  test("first claim sends; a second within the window does not; another project is independent", async () => {
    await ensureAutosimAuthAlertTable(dbc)
    const now = 2_000_000_000_000
    expect(await claimAuthAlertSlot(dbc, "proj_throttle_a", now)).toBe(true)
    expect(await claimAuthAlertSlot(dbc, "proj_throttle_a", now + 60_000)).toBe(false)
    expect(await claimAuthAlertSlot(dbc, "proj_throttle_a", now + AUTOSIM_AUTH_ALERT_WINDOW_MS - 1)).toBe(false)
    // Different project shares no slot.
    expect(await claimAuthAlertSlot(dbc, "proj_throttle_b", now + 60_000)).toBe(true)
  })

  test("claim opens again once the window has fully elapsed", async () => {
    const now = 3_000_000_000_000
    expect(await claimAuthAlertSlot(dbc, "proj_throttle_c", now)).toBe(true)
    expect(await claimAuthAlertSlot(dbc, "proj_throttle_c", now + AUTOSIM_AUTH_ALERT_WINDOW_MS)).toBe(true)
  })

  test("concurrent claims for the same project: exactly one wins", async () => {
    const now = 4_000_000_000_000
    const results = await Promise.all(
      Array.from({ length: 5 }, () => claimAuthAlertSlot(dbc, "proj_throttle_race", now)),
    )
    expect(results.filter(Boolean).length).toBe(1)
  })
})

// ── orchestration: notifyAutosimNeedsAuth ────────────────────────────────────────
describe("notifyAutosimNeedsAuth", () => {
  test("sends email + slack once, then throttles the next run within the day", async () => {
    // Seed an account so alertRecipients resolves an owner email.
    await dbc.execute({
      sql: "INSERT OR REPLACE INTO accounts (id, name, owner_email, created_at) VALUES (?,?,?,?)",
      args: ["acct_notify", "Notify Co", "founder@acme.example.com", 1],
    })
    const emails: string[][] = []
    const slacks: unknown[] = []
    const deps = {
      db: dbc,
      slackWebhook: "https://hooks.slack.com/services/T/EST/HOOK",
      sendEmail: async (to: string[]) => { emails.push(to) },
      postSlack: async (_url: string, payload: unknown) => { slacks.push(payload) },
    }
    const input = { ...baseInput, projectId: "proj_notify", accountId: "acct_notify", at: 5_000_000_000_000 }

    await notifyAutosimNeedsAuth(input, deps)
    expect(emails.length).toBe(1)
    expect(emails[0]).toContain("founder@acme.example.com")
    expect(slacks.length).toBe(1)

    // Second run same day → throttled, no new email/slack.
    await notifyAutosimNeedsAuth({ ...input, at: input.at + 60_000 }, deps)
    expect(emails.length).toBe(1)
    expect(slacks.length).toBe(1)
  })

  test("skips slack when no webhook configured but still emails", async () => {
    await dbc.execute({
      sql: "INSERT OR REPLACE INTO accounts (id, name, owner_email, created_at) VALUES (?,?,?,?)",
      args: ["acct_noslack", "NoSlack Co", "owner@ns.example.com", 1],
    })
    const emails: string[][] = []
    const slacks: unknown[] = []
    await notifyAutosimNeedsAuth(
      { ...baseInput, projectId: "proj_noslack", accountId: "acct_noslack", at: 6_000_000_000_000 },
      {
        db: dbc,
        slackWebhook: null,
        sendEmail: async (to: string[]) => { emails.push(to) },
        postSlack: async (_u: string, p: unknown) => { slacks.push(p) },
      },
    )
    expect(emails.length).toBe(1)
    expect(slacks.length).toBe(0)
  })

  test("never throws when the email transport fails (fire-and-forget)", async () => {
    await dbc.execute({
      sql: "INSERT OR REPLACE INTO accounts (id, name, owner_email, created_at) VALUES (?,?,?,?)",
      args: ["acct_boom", "Boom Co", "boom@ex.example.com", 1],
    })
    await expect(
      notifyAutosimNeedsAuth(
        { ...baseInput, projectId: "proj_boom", accountId: "acct_boom", at: 7_000_000_000_000 },
        {
          db: dbc,
          slackWebhook: null,
          sendEmail: async () => { throw new Error("sendgrid down") },
          postSlack: async () => {},
        },
      ),
    ).resolves.toBeUndefined()
  })
})

// ── needs_auth is a resumable state, distinct from failed (KLA-179 part 2) ────────
describe("needs_auth resumability", () => {
  test("a paused needs_auth session with a checkpoint is surfaced for resume", async () => {
    const proj = "proj_resume"
    const id = await createAuthorSession(proj, { name: "Explore", objective: "poke around", baseUrl: "https://x.example.com" })
    // Simulate the driver hitting an auth gate: persist a checkpoint, then suspend as needs_auth.
    await updateAuthorSession(proj, id, {
      checkpoint: { traj: [{ op: "navigate" }] as any, history: ["visited login"], costUsd: 0.02, lastUrl: "https://x.example.com/login" } as any,
      status: "needs_auth",
      stallReason: "stopped at auth gate",
    })
    const listed = await listStalledAuthorSessions(proj)
    const found = listed.find((s) => s.id === id)
    expect(found).toBeTruthy()
    expect(found!.status).toBe("needs_auth")
    expect(found!.checkpoint).toBeTruthy()
  })

  test("a failed session is NOT offered for resume (distinct from needs_auth)", async () => {
    const proj = "proj_failed"
    const id = await createAuthorSession(proj, { name: "Explore", objective: "poke", baseUrl: "https://y.example.com" })
    await updateAuthorSession(proj, id, {
      checkpoint: { traj: [], history: [], costUsd: 0, lastUrl: "https://y.example.com" } as any,
      status: "failed",
    })
    const listed = await listStalledAuthorSessions(proj)
    expect(listed.find((s) => s.id === id)).toBeUndefined()
  })
})
