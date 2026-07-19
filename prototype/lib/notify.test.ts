import { test, expect } from "bun:test"
import {
  normalizeEmail,
  commentRecipients,
  buildCommentSlackPayload,
  notifyTicketComment,
  type CommentNotifyInput,
} from "./notify"

// KLAVITYKLA-209 — hermetic: no network, no db, no SendGrid. Senders are injected.

test("normalizeEmail lowercases valid, rejects junk", () => {
  expect(normalizeEmail("  Alice@Example.COM ")).toBe("alice@example.com")
  expect(normalizeEmail("not-an-email")).toBeNull()
  expect(normalizeEmail("")).toBeNull()
  expect(normalizeEmail(null)).toBeNull()
})

test("commentRecipients dedupes and excludes the actor", () => {
  const r = commentRecipients({
    author: "Actor@Test.com",
    assignee: "assignee@test.com",
    contactEmail: "reporter@test.com",
    priorCommenters: [
      "assignee@test.com", // dup of assignee
      "ACTOR@test.com", // the actor — must be dropped
      "watcher@test.com",
      null,
      "garbage",
    ],
  })
  expect(r).toEqual(["assignee@test.com", "reporter@test.com", "watcher@test.com"])
})

test("actor commenting on their own ticket with no other watchers → no recipients", () => {
  const r = commentRecipients({ author: "solo@test.com", assignee: "solo@test.com", contactEmail: "solo@test.com" })
  expect(r).toEqual([])
})

const base: CommentNotifyInput = {
  feedbackId: "fb_1",
  ticketTitle: "Checkout breaks",
  projectName: "Acme",
  commentBody: "Any update on this?",
  ticketUrl: "https://klavity.in/dashboard?project=p1&ticket=fb_1#tickets",
  author: "actor@test.com",
  assignee: "assignee@test.com",
  contactEmail: "reporter@test.com",
  priorCommenters: ["watcher@test.com"],
}

test("notifyTicketComment emails deduped watchers and pings slack (mocked)", async () => {
  const emailCalls: any[] = []
  const slackCalls: any[] = []
  const res = await notifyTicketComment(base, {
    hasEmail: () => true,
    slackWebhook: () => "https://hooks.slack.com/services/X",
    sendEmail: async (to, subject, html, text) => { emailCalls.push({ to, subject, html, text }) },
    postSlack: async (payload) => { slackCalls.push(payload) },
  })

  expect(res.recipients).toEqual(["assignee@test.com", "reporter@test.com", "watcher@test.com"])
  expect(res.emailAttempted).toBe(true)
  expect(res.slackAttempted).toBe(true)

  expect(emailCalls).toHaveLength(1)
  expect(emailCalls[0].to).toEqual(["assignee@test.com", "reporter@test.com", "watcher@test.com"])
  expect(emailCalls[0].subject).toContain("Checkout breaks")
  expect(emailCalls[0].html).toContain("Any update on this?")
  expect(emailCalls[0].text).toContain(base.ticketUrl)

  expect(slackCalls).toHaveLength(1)
})

test("notifyTicketComment skips email when SENDGRID unset but still pings slack", async () => {
  let emailed = false
  let slacked = false
  const res = await notifyTicketComment(base, {
    hasEmail: () => false,
    slackWebhook: () => "https://hooks.slack.com/services/X",
    sendEmail: async () => { emailed = true },
    postSlack: async () => { slacked = true },
  })
  expect(emailed).toBe(false)
  expect(res.emailAttempted).toBe(false)
  expect(slacked).toBe(true)
  expect(res.slackAttempted).toBe(true)
})

test("notifyTicketComment skips both channels when nothing configured and no recipients", async () => {
  let emailed = false
  const res = await notifyTicketComment(
    { ...base, assignee: null, contactEmail: null, priorCommenters: [] },
    { hasEmail: () => true, slackWebhook: () => null, sendEmail: async () => { emailed = true } },
  )
  expect(res.recipients).toEqual([])
  expect(emailed).toBe(false)
  expect(res.emailAttempted).toBe(false)
  expect(res.slackAttempted).toBe(false)
})

test("notifyTicketComment never throws when a sender rejects (best-effort)", async () => {
  const res = await notifyTicketComment(base, {
    hasEmail: () => true,
    slackWebhook: () => "https://hooks.slack.com/services/X",
    sendEmail: async () => { throw new Error("SendGrid 500") },
    postSlack: async () => { throw new Error("slack down") },
  })
  // Attempts were made even though both failed; no exception surfaced.
  expect(res.emailAttempted).toBe(true)
  expect(res.slackAttempted).toBe(true)
})

test("buildCommentSlackPayload includes title, author, preview, and an Open-ticket button", () => {
  const payload: any = buildCommentSlackPayload(base, ["assignee@test.com"])
  const json = JSON.stringify(payload)
  expect(json).toContain("Checkout breaks")
  expect(json).toContain("actor@test.com")
  expect(json).toContain("Any update on this?")
  const btn = payload.blocks.find((b: any) => b.type === "actions")
  expect(btn.elements[0].url).toBe(base.ticketUrl)
})

test("buildCommentSlackPayload truncates long comment bodies", () => {
  const long = "x".repeat(400)
  const payload: any = buildCommentSlackPayload({ ...base, commentBody: long }, [])
  const section = payload.blocks[1].text.text
  expect(section.length).toBeLessThan(300)
  expect(section.endsWith("…")).toBe(true)
})
