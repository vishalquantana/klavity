import { afterEach, expect, test } from "bun:test"
import { notifyReporterOnFix, shouldNotifyReporterOnFix } from "./fixed-notification"

const oldKey = process.env.SENDGRID_API_KEY

afterEach(() => {
  if (oldKey === undefined) delete process.env.SENDGRID_API_KEY
  else process.env.SENDGRID_API_KEY = oldKey
})

test("shouldNotifyReporterOnFix only allows valid reporter email and transition into done", () => {
  expect(shouldNotifyReporterOnFix({ contactEmail: "reporter@example.com", previousStatus: "open", nextStatus: "done" })).toBe(true)
  expect(shouldNotifyReporterOnFix({ contactEmail: "reporter@example.com", previousStatus: "in_progress", nextStatus: "done" })).toBe(true)
  expect(shouldNotifyReporterOnFix({ contactEmail: "reporter@example.com", previousStatus: "done", nextStatus: "done" })).toBe(false)
  expect(shouldNotifyReporterOnFix({ contactEmail: "reporter@example.com", previousStatus: "open", nextStatus: "in_progress" })).toBe(false)
  expect(shouldNotifyReporterOnFix({ contactEmail: null, previousStatus: "open", nextStatus: "done" })).toBe(false)
  expect(shouldNotifyReporterOnFix({ contactEmail: "not-an-email", previousStatus: "open", nextStatus: "done" })).toBe(false)
})

test("notifyReporterOnFix sends the fixed notification through the mail dependency", async () => {
  process.env.SENDGRID_API_KEY = "sg-test"
  const sent: any[] = []
  await notifyReporterOnFix({
    contactEmail: "reporter@example.com",
    previousStatus: "open",
    nextStatus: "done",
    title: "Checkout fails",
    projectName: "Acme Store",
    ticketUrl: "https://klavity.test/dashboard?project=p1#tickets",
  }, {
    send: async (to, ticket) => { sent.push({ to, ticket }) },
  })

  expect(sent).toHaveLength(1)
  expect(sent[0].to).toBe("reporter@example.com")
  expect(sent[0].ticket.title).toBe("Checkout fails")
  expect(sent[0].ticket.projectName).toBe("Acme Store")
})

test("notifyReporterOnFix is a no-op when SendGrid is disabled", async () => {
  delete process.env.SENDGRID_API_KEY
  let called = false
  await notifyReporterOnFix({
    contactEmail: "reporter@example.com",
    previousStatus: "open",
    nextStatus: "done",
    title: "Checkout fails",
    projectName: "Acme Store",
    ticketUrl: "https://klavity.test/dashboard?project=p1#tickets",
  }, {
    send: async () => { called = true },
  })
  expect(called).toBe(false)
})

test("notifyReporterOnFix never throws when the mail transport fails", async () => {
  process.env.SENDGRID_API_KEY = "sg-test"
  const warnings: any[] = []
  await expect(notifyReporterOnFix({
    contactEmail: "reporter@example.com",
    previousStatus: "open",
    nextStatus: "done",
    title: "Checkout fails",
    projectName: "Acme Store",
    ticketUrl: "https://klavity.test/dashboard?project=p1#tickets",
  }, {
    send: async () => { throw new Error("sendgrid down") },
    warn: (...args) => { warnings.push(args) },
  })).resolves.toBeUndefined()
  expect(String(warnings[0]?.[1] || "")).toContain("sendgrid down")
})
