import { test, expect } from "bun:test"
import { otpEmailHtml, sendTicketAssignmentEmail, sendTicketAssignmentInviteEmail } from "./mail.ts"

test("otpEmailHtml renders the code and brand chrome", () => {
  const html = otpEmailHtml("464639")
  // The code is shown prominently.
  expect(html).toContain(">464639</span>")
  // Brand chrome: wordmark, tagline, indigo accent, gradient fallback, expiry.
  expect(html).toContain(">Klavity</div>")
  expect(html).toContain("AI Bug Reporter")
  expect(html).toContain("#6366f1")
  expect(html).toContain("background:#4f46e5;background:linear-gradient")
  expect(html).toContain("10 minutes")
})

test("otpEmailHtml note is deterministic per code and varies across codes", () => {
  expect(otpEmailHtml("111111")).toBe(otpEmailHtml("111111"))
  // Different codes should usually pick different notes (sample a few).
  const notes = new Set(["100000", "200001", "300002", "400003", "500004"].map((c) => {
    const m = otpEmailHtml(c).match(/font-style:italic">([^<]+)</)
    return m ? m[1] : ""
  }))
  expect(notes.size).toBeGreaterThan(1)
})

test("sendTicketAssignmentEmail posts a ticket assignment notification", async () => {
  const oldKey = process.env.SENDGRID_API_KEY
  const oldFrom = process.env.KLAV_MAIL_FROM
  const oldFetch = globalThis.fetch
  const calls: any[] = []
  process.env.SENDGRID_API_KEY = "sg-test"
  process.env.KLAV_MAIL_FROM = "bugs@example.com"
  globalThis.fetch = (async (url: any, init: any) => {
    calls.push({ url, init })
    return new Response("", { status: 202 })
  }) as any
  try {
    await sendTicketAssignmentEmail({
      to: "assignee@example.com",
      ticketTitle: "Checkout fails",
      projectName: "Mobile Shop",
      assignedBy: "owner@example.com",
      ticketUrl: "https://klavity.test/dashboard?project=p1#tickets",
    })
  } finally {
    globalThis.fetch = oldFetch
    if (oldKey === undefined) delete process.env.SENDGRID_API_KEY
    else process.env.SENDGRID_API_KEY = oldKey
    if (oldFrom === undefined) delete process.env.KLAV_MAIL_FROM
    else process.env.KLAV_MAIL_FROM = oldFrom
  }

  expect(calls).toHaveLength(1)
  const body = JSON.parse(calls[0].init.body)
  expect(calls[0].url).toBe("https://api.sendgrid.com/v3/mail/send")
  expect(body.personalizations[0].to[0].email).toBe("assignee@example.com")
  expect(body.subject).toContain("ticket assigned")
  expect(body.content[0].value).toContain("Checkout fails")
  expect(body.content[0].value).toContain("https://klavity.test/dashboard?project=p1#tickets")
})

test("sendTicketAssignmentInviteEmail posts a join-and-view invitation", async () => {
  const oldKey = process.env.SENDGRID_API_KEY
  const oldFrom = process.env.KLAV_MAIL_FROM
  const oldFetch = globalThis.fetch
  const calls: any[] = []
  process.env.SENDGRID_API_KEY = "sg-test"
  process.env.KLAV_MAIL_FROM = "bugs@example.com"
  globalThis.fetch = (async (url: any, init: any) => {
    calls.push({ url, init })
    return new Response("", { status: 202 })
  }) as any
  try {
    await sendTicketAssignmentInviteEmail({
      to: "new-user@example.com",
      ticketTitle: "Checkout fails",
      projectName: "Mobile Shop",
      assignedBy: "owner@example.com",
      ticketUrl: "https://klavity.test/dashboard?project=p1#tickets",
      joinUrl: "https://klavity.test/login?email=new-user%40example.com&project=p1#tickets",
    })
  } finally {
    globalThis.fetch = oldFetch
    if (oldKey === undefined) delete process.env.SENDGRID_API_KEY
    else process.env.SENDGRID_API_KEY = oldKey
    if (oldFrom === undefined) delete process.env.KLAV_MAIL_FROM
    else process.env.KLAV_MAIL_FROM = oldFrom
  }

  expect(calls).toHaveLength(1)
  const body = JSON.parse(calls[0].init.body)
  expect(body.personalizations[0].to[0].email).toBe("new-user@example.com")
  expect(body.subject).toContain("invited")
  expect(body.content[0].value).toContain("Checkout fails")
  expect(body.content[0].value).toContain("https://klavity.test/login?email=new-user%40example.com&project=p1#tickets")
})
