// prototype/lib/budget-resume-alert.test.ts — member "request resume" notifications (JTBD 3.11).
// Hermetic: in-memory libsql + injected mail/Slack mocks (no SendGrid, no network).
import { test, expect } from "bun:test"
import { createClient, type Client } from "@libsql/client"
import { applySchema } from "./db"
import {
  claimResumeSlot, resumeRecipients, projectSlackWebhook, buildResumeEmail,
  buildResumeSlackPayload, notifyBudgetResumeRequest, resumeUrl, RESUME_ALERT_WINDOW_MS,
  type ResumeAlertInput,
} from "./budget-resume-alert"

const WINDOW = RESUME_ALERT_WINDOW_MS

async function fresh(): Promise<Client> {
  const c = createClient({ url: "file::memory:" })
  await applySchema(c)
  await c.execute("ALTER TABLE projects ADD COLUMN modal_config_json TEXT DEFAULT '{}'").catch(() => {})
  return c
}

async function seedProject(c: Client, opts: { slackUrl?: string; admins?: Array<[string, string]>; ownerEmail?: string } = {}) {
  const now = Date.now()
  await c.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)", args: ["acct_1", "Acme", opts.ownerEmail ?? "vishal@quantana.com.au", now] })
  for (const [email, role] of opts.admins ?? []) {
    await c.execute({ sql: "INSERT INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)", args: [`am_${email}`, "acct_1", email, role, now] })
  }
  await c.execute({
    sql: "INSERT INTO projects (id,account_id,name,created_at,updated_at,modal_config_json) VALUES (?,?,?,?,?,?)",
    args: ["proj_1", "acct_1", "Acme Web", now, now, JSON.stringify(opts.slackUrl ? { theme: "light", slack_webhook_url: opts.slackUrl } : { theme: "light" })],
  })
}

function input(over: Partial<ResumeAlertInput> = {}): ResumeAlertInput {
  return {
    projectId: "proj_1", projectName: "Acme Web", accountId: "acct_1",
    requesterEmail: "member@acme.example", pageUrl: "https://acme.example/pricing",
    baseUrl: "https://klavity.in", at: 1_000_000_000_000,
    ...over,
  }
}

// ── throttle (claimResumeSlot) ──────────────────────────────────────────────────────

test("first resume request for a project sends immediately", async () => {
  const c = await fresh()
  expect(await claimResumeSlot(c, "proj_1", 1000, WINDOW)).toEqual({ send: true, missedSinceLast: 0 })
})

test("second request inside the window is throttled and counted, then sends again after the window", async () => {
  const c = await fresh()
  const t0 = 1_000_000
  expect((await claimResumeSlot(c, "proj_1", t0, WINDOW)).send).toBe(true)
  expect((await claimResumeSlot(c, "proj_1", t0 + 1000, WINDOW)).send).toBe(false)
  expect((await claimResumeSlot(c, "proj_1", t0 + 2000, WINDOW)).send).toBe(false)
  expect(await claimResumeSlot(c, "proj_1", t0 + WINDOW, WINDOW)).toEqual({ send: true, missedSinceLast: 2 })
  expect(await claimResumeSlot(c, "proj_1", t0 + 2 * WINDOW, WINDOW)).toEqual({ send: true, missedSinceLast: 0 })
})

// ── recipients ──────────────────────────────────────────────────────────────────────

test("recipients are account owner+admins, owner first, deduped", async () => {
  const c = await fresh()
  await seedProject(c, { admins: [["admin@acme.example", "admin"], ["owner@acme.example", "owner"], ["member@acme.example", "member"]] })
  const to = await resumeRecipients(c, "acct_1")
  expect(to[0]).toBe("owner@acme.example")
  expect(to).toContain("admin@acme.example")
  expect(to).not.toContain("member@acme.example")
})

test("recipients fall back to accounts.owner_email when no admin/owner members exist", async () => {
  const c = await fresh()
  await seedProject(c, { ownerEmail: "solo@acme.example" })
  expect(await resumeRecipients(c, "acct_1")).toEqual(["solo@acme.example"])
})

// ── slack webhook resolution (SSRF posture) ──────────────────────────────────────────

test("only hooks.slack.com webhook URLs are honored", async () => {
  const c1 = await fresh(); await seedProject(c1, { slackUrl: "https://hooks.slack.com/services/T/B/x" })
  expect(await projectSlackWebhook(c1, "proj_1")).toBe("https://hooks.slack.com/services/T/B/x")
  const c2 = await fresh(); await seedProject(c2, { slackUrl: "https://evil.example/hook" })
  expect(await projectSlackWebhook(c2, "proj_1")).toBeNull()
})

// ── formatting ────────────────────────────────────────────────────────────────────

test("resume email names the requester + links to settings; no emoji", async () => {
  const { subject, html, text } = buildResumeEmail(input(), 0)
  expect(subject).toContain("Acme Web")
  expect(html).toContain("member@acme.example")
  expect(html).toContain(resumeUrl(input()))
  expect(text).toContain("Resume reviews:")
  // no emoji anywhere (CI guard parity)
  expect(/\p{Extended_Pictographic}/u.test(subject + html + text)).toBe(false)
})

test("slack payload names the requester + carries a resume button; no emoji", async () => {
  const p = buildResumeSlackPayload(input())
  expect(p.text).toContain("member@acme.example")
  expect(JSON.stringify(p.blocks)).toContain(resumeUrl(input()))
  expect(/\p{Extended_Pictographic}/u.test(JSON.stringify(p))).toBe(false)
})

// ── orchestration (notifyBudgetResumeRequest) ────────────────────────────────────────

test("notify emails owner/admins once and posts slack via injected transports", async () => {
  const c = await fresh()
  await seedProject(c, { admins: [["owner@acme.example", "owner"]], slackUrl: "https://hooks.slack.com/services/T/B/x" })
  const emails: Array<{ to: string[]; subject: string }> = []
  const slacks: Array<{ url: string }> = []
  const out = await notifyBudgetResumeRequest(input(), {
    db: c,
    sendEmail: async (to, subject) => { emails.push({ to, subject }) },
    postSlack: async (url) => { slacks.push({ url }) },
    windowMs: WINDOW,
  })
  expect(out).toEqual({ emailed: true, recipients: 1 })
  expect(emails.length).toBe(1)
  expect(emails[0].to).toEqual(["owner@acme.example"])
  expect(slacks.length).toBe(1)
  expect(slacks[0].url).toContain("hooks.slack.com")
})

test("notify is throttled: a second request inside the window skips email but still slacks", async () => {
  const c = await fresh()
  await seedProject(c, { admins: [["owner@acme.example", "owner"]], slackUrl: "https://hooks.slack.com/services/T/B/x" })
  let emailCalls = 0, slackCalls = 0
  const deps = { db: c, sendEmail: async () => { emailCalls++ }, postSlack: async () => { slackCalls++ }, windowMs: WINDOW }
  await notifyBudgetResumeRequest(input({ at: 1000 }), deps)
  await notifyBudgetResumeRequest(input({ at: 2000 }), deps) // inside window
  expect(emailCalls).toBe(1)  // email throttled
  expect(slackCalls).toBe(2)  // slack fires per request
})

test("notify never throws even if a transport fails", async () => {
  const c = await fresh()
  await seedProject(c, { admins: [["owner@acme.example", "owner"]], slackUrl: "https://hooks.slack.com/services/T/B/x" })
  const out = await notifyBudgetResumeRequest(input(), {
    db: c,
    sendEmail: async () => { throw new Error("sendgrid down") },
    postSlack: async () => { throw new Error("slack down") },
    windowMs: WINDOW,
  })
  expect(out.emailed).toBe(false) // email failed → not marked sent
})
