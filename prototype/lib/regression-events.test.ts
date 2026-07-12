// prototype/lib/regression-events.test.ts — B.6 unified Regression alarm.
// Hermetic: in-memory libsql + injected mail/Slack mocks (no SendGrid, no network).
import { test, expect } from "bun:test"
import { createClient, type Client } from "@libsql/client"
import { applySchema } from "./db"
import {
  publishRegressionEvent, listRegressionEvents, acknowledgeRegressionEvent,
  recentEventForIssue, ensureRegressionEventsTable,
  buildRegressionEmail, buildRegressionSlackPayload, regressionHeadline,
  regressionTicketUrl, regressionGuardUrl,
  REGRESSION_DEDUP_WINDOW_MS, type RegressionEventInput,
} from "./regression-events"

const WINDOW = REGRESSION_DEDUP_WINDOW_MS

async function fresh(): Promise<Client> {
  const c = createClient({ url: "file::memory:" })
  await applySchema(c)
  await c.execute("ALTER TABLE projects ADD COLUMN modal_config_json TEXT DEFAULT '{}'").catch(() => {})
  await ensureRegressionEventsTable(c)
  return c
}

async function seedProject(c: Client, opts: { slackUrl?: string; admins?: Array<[string, string]>; ownerEmail?: string } = {}) {
  const now = Date.now()
  await c.execute({
    sql: "INSERT INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)",
    args: ["acct_1", "Acme", opts.ownerEmail ?? "vishal@quantana.com.au", now],
  })
  for (const [email, role] of opts.admins ?? []) {
    await c.execute({
      sql: "INSERT INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)",
      args: [`am_${email}`, "acct_1", email, role, now],
    })
  }
  await c.execute({
    sql: "INSERT INTO projects (id,account_id,name,created_at,updated_at,modal_config_json) VALUES (?,?,?,?,?,?)",
    args: ["proj_1", "acct_1", "Acme Web", now, now, JSON.stringify(opts.slackUrl ? { slack_webhook_url: opts.slackUrl } : {})],
  })
}

function input(over: Partial<RegressionEventInput> = {}): RegressionEventInput {
  return {
    projectId: "proj_1", issueKey: "issue_signup", source: "memory",
    title: "signup broken again", feedbackId: "fb_1", expectationId: null,
    firstFixedAt: Date.parse("2026-03-12"), at: 1_700_000_000_000,
    baseUrl: "https://klavity.in", evidence: { occurrences: 3 },
    ...over,
  }
}

// Silent deps: no email/slack side-effects during dedup/persistence tests.
const silent = () => ({ notify: false as const })

// ── persistence + dedup (the "no duplicate alarms" acceptance criterion) ─────────────

test("a fresh issue publishes exactly one regression event", async () => {
  const c = await fresh()
  const r = await publishRegressionEvent(input(), { db: c, ...silent() })
  expect(r.published).toBe(true)
  expect(r.deduped).toBe(false)
  expect(r.event?.source).toBe("memory")
  const events = await listRegressionEvents(c, "proj_1")
  expect(events.length).toBe(1)
  expect(events[0].issueKey).toBe("issue_signup")
})

test("a second detector on the SAME issue within the window dedupes — one alarm", async () => {
  const c = await fresh()
  const at = 1_700_000_000_000
  const first = await publishRegressionEvent(input({ source: "memory", at }), { db: c, ...silent() })
  expect(first.published).toBe(true)
  // guard fires on the same issue 20 min later — must collapse into the memory event.
  const second = await publishRegressionEvent(
    input({ source: "guard", at: at + 20 * 60 * 1000 }), { db: c, ...silent() },
  )
  expect(second.published).toBe(false)
  expect(second.deduped).toBe(true)
  const events = await listRegressionEvents(c, "proj_1")
  expect(events.length).toBe(1)
})

test("the same issue AFTER the window publishes a new alarm", async () => {
  const c = await fresh()
  const at = 1_700_000_000_000
  await publishRegressionEvent(input({ at }), { db: c, ...silent(), dedupWindowMs: WINDOW })
  const later = await publishRegressionEvent(
    input({ at: at + WINDOW + 1 }), { db: c, ...silent(), dedupWindowMs: WINDOW },
  )
  expect(later.published).toBe(true)
  const events = await listRegressionEvents(c, "proj_1", { includeAcknowledged: true })
  expect(events.length).toBe(2)
})

test("DIFFERENT issues each get their own alarm (no cross-cluster collapse)", async () => {
  const c = await fresh()
  await publishRegressionEvent(input({ issueKey: "issue_a" }), { db: c, ...silent() })
  await publishRegressionEvent(input({ issueKey: "issue_b" }), { db: c, ...silent() })
  const events = await listRegressionEvents(c, "proj_1")
  expect(events.length).toBe(2)
})

// ── all three detector sources produce an event in the unified stream ────────────────

test("each of the three detector sources publishes into the unified stream", async () => {
  const c = await fresh()
  await publishRegressionEvent(input({ issueKey: "k1", source: "memory" }), { db: c, ...silent() })
  await publishRegressionEvent(input({ issueKey: "k2", source: "sim-reopen" }), { db: c, ...silent() })
  await publishRegressionEvent(input({ issueKey: "k3", source: "guard" }), { db: c, ...silent() })
  const events = await listRegressionEvents(c, "proj_1")
  const sources = new Set(events.map(e => e.source))
  expect(sources).toEqual(new Set(["memory", "sim-reopen", "guard"]))
})

// ── notification within the hour: Slack + email fire on a fresh event ────────────────

test("a fresh regression event fires a Slack + email notification", async () => {
  const c = await fresh()
  await seedProject(c, { slackUrl: "https://hooks.slack.com/services/T/B/x", admins: [["founder@acme.com", "owner"]] })
  const emails: Array<{ to: string[]; subject: string }> = []
  const slacks: unknown[] = []
  const r = await publishRegressionEvent(input({ source: "guard", title: "signup regression" }), {
    db: c,
    sendEmail: async (to, subject) => { emails.push({ to, subject }) },
    postSlack: async (_url, payload) => { slacks.push(payload) },
  })
  expect(r.published).toBe(true)
  expect(emails.length).toBe(1)
  expect(emails[0].to).toContain("founder@acme.com")
  expect(slacks.length).toBe(1)
})

test("a DEDUPED event does NOT re-notify (no duplicate email/slack)", async () => {
  const c = await fresh()
  await seedProject(c, { slackUrl: "https://hooks.slack.com/services/T/B/x", admins: [["founder@acme.com", "owner"]] })
  let emailCount = 0, slackCount = 0
  const deps = {
    db: c,
    sendEmail: async () => { emailCount++ },
    postSlack: async () => { slackCount++ },
  }
  const at = 1_700_000_000_000
  await publishRegressionEvent(input({ at }), deps)
  await publishRegressionEvent(input({ source: "guard", at: at + 60_000 }), deps) // same issue, deduped
  expect(emailCount).toBe(1)
  expect(slackCount).toBe(1)
})

test("notification failure NEVER throws and the event still persists", async () => {
  const c = await fresh()
  await seedProject(c, { slackUrl: "https://hooks.slack.com/services/T/B/x", admins: [["founder@acme.com", "owner"]] })
  const r = await publishRegressionEvent(input(), {
    db: c,
    sendEmail: async () => { throw new Error("sendgrid down") },
    postSlack: async () => { throw new Error("slack down") },
  })
  expect(r.published).toBe(true)
  const events = await listRegressionEvents(c, "proj_1")
  expect(events.length).toBe(1)
})

// ── acknowledge drops the banner out of the default feed ─────────────────────────────

test("acknowledge removes an event from the default (unacknowledged) feed", async () => {
  const c = await fresh()
  const r = await publishRegressionEvent(input(), { db: c, ...silent() })
  const id = r.event!.id
  expect((await listRegressionEvents(c, "proj_1")).length).toBe(1)
  const ok = await acknowledgeRegressionEvent(c, "proj_1", id, Date.now())
  expect(ok).toBe(true)
  expect((await listRegressionEvents(c, "proj_1")).length).toBe(0)
  expect((await listRegressionEvents(c, "proj_1", { includeAcknowledged: true })).length).toBe(1)
})

test("acknowledge is project-scoped and idempotent", async () => {
  const c = await fresh()
  const r = await publishRegressionEvent(input(), { db: c, ...silent() })
  const id = r.event!.id
  expect(await acknowledgeRegressionEvent(c, "proj_OTHER", id, Date.now())).toBe(false) // wrong project
  expect(await acknowledgeRegressionEvent(c, "proj_1", id, Date.now())).toBe(true)
  expect(await acknowledgeRegressionEvent(c, "proj_1", id, Date.now())).toBe(false) // already acked
})

// ── recentEventForIssue (dedup primitive) ────────────────────────────────────────────

test("recentEventForIssue finds an in-window event and ignores out-of-window ones", async () => {
  const c = await fresh()
  const at = 1_700_000_000_000
  await publishRegressionEvent(input({ at }), { db: c, ...silent() })
  expect(await recentEventForIssue(c, "proj_1", "issue_signup", at + 1000, WINDOW)).not.toBeNull()
  expect(await recentEventForIssue(c, "proj_1", "issue_signup", at + WINDOW + 1, WINDOW)).toBeNull()
  expect(await recentEventForIssue(c, "proj_1", "nope", at + 1000, WINDOW)).toBeNull()
})

// ── no DB / missing keys are safe no-ops ─────────────────────────────────────────────

test("publish with no db is a safe no-op", async () => {
  const r = await publishRegressionEvent(input(), { db: undefined as any, ...silent() })
  expect(r.published).toBe(false)
  expect(r.event).toBeNull()
})

test("publish with a missing issueKey is a safe no-op", async () => {
  const c = await fresh()
  const r = await publishRegressionEvent(input({ issueKey: "" }), { db: c, ...silent() })
  expect(r.published).toBe(false)
})

// ── formatting / deep-links ──────────────────────────────────────────────────────────

test("headline includes the fix date for the guard source", () => {
  const h = regressionHeadline(input({ source: "guard", title: "signup regression", firstFixedAt: Date.parse("2026-03-12") }))
  expect(h).toContain("Guard fired")
  expect(h).toContain("signup regression")
  expect(h).toContain("2026-03-12")
})

test("email + slack carry an Open-ticket and a Guard action", () => {
  const em = buildRegressionEmail(input({ feedbackId: "fb_9", expectationId: null }))
  expect(em.subject).toContain("Regression")
  expect(em.html).toContain("Open the ticket")
  expect(em.html).toContain("Guard this") // no expectation yet → "Guard this" CTA
  const sl = buildRegressionSlackPayload(input({ feedbackId: "fb_9" })) as any
  const actions = sl.blocks.find((b: any) => b.type === "actions")
  const labels = actions.elements.map((e: any) => e.text.text)
  expect(labels).toContain("Open the ticket")
  expect(labels).toContain("Guard this")
})

test("with an expectation the guard action becomes Open-the-guard and links to it", () => {
  const em = buildRegressionEmail(input({ expectationId: "exp_5" }))
  expect(em.html).toContain("Open the guard")
  expect(regressionGuardUrl(input({ expectationId: "exp_5" }))).toContain("expectation=exp_5")
})

test("ticket + guard deep-links are project-scoped and carry the feedback id", () => {
  const t = regressionTicketUrl(input({ feedbackId: "fb_9" }))
  expect(t).toContain("project=proj_1")
  expect(t).toContain("ticket=fb_9")
  const g = regressionGuardUrl(input({ feedbackId: "fb_9", expectationId: null }))
  expect(g).toContain("guard=fb_9")
})

// no emoji in Slack payloads (CI guard parity)
test("slack payload contains no emoji", () => {
  const sl = JSON.stringify(buildRegressionSlackPayload(input()))
  // eslint-disable-next-line no-control-regex
  expect(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(sl)).toBe(false)
})
