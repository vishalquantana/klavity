import { test, expect } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { logOutboundEmail, recentOutboundEmails } from "./db"

useIsolatedDb("klav-email-log")

test("logOutboundEmail + recentOutboundEmails round-trip, filtered by to", async () => {
  await logOutboundEmail({
    type: "otp",
    to: "a@test.local",
    subject: "Your Klavity code: 123456",
    messageId: "MSG-A",
    httpStatus: 202,
    status: "sent",
  })
  await logOutboundEmail({
    type: "member_invite",
    to: "b@test.local",
    subject: "You're invited",
    httpStatus: 401,
    status: "failed",
    error: "SendGrid 401: unauthorized",
  })

  const forA = await recentOutboundEmails({ to: "a@test.local" })
  expect(forA).toHaveLength(1)
  expect(forA[0].type).toBe("otp")
  expect(forA[0].to).toBe("a@test.local")
  expect(forA[0].subject).toBe("Your Klavity code: 123456")
  expect(forA[0].messageId).toBe("MSG-A")
  expect(forA[0].httpStatus).toBe(202)
  expect(forA[0].status).toBe("sent")

  const forB = await recentOutboundEmails({ to: "b@test.local" })
  expect(forB).toHaveLength(1)
  expect(forB[0].status).toBe("failed")
  expect(forB[0].error).toContain("unauthorized")

  const all = await recentOutboundEmails()
  expect(all.length).toBeGreaterThanOrEqual(2)
})

test("recentOutboundEmails respects limit and newest-first order", async () => {
  for (let i = 0; i < 5; i++) {
    await logOutboundEmail({ type: "otp", to: "many@test.local", status: "sent" })
  }
  const rows = await recentOutboundEmails({ to: "many@test.local", limit: 3 })
  expect(rows).toHaveLength(3)
  // newest first: created_at non-increasing
  for (let i = 1; i < rows.length; i++) {
    expect(rows[i - 1].createdAt).toBeGreaterThanOrEqual(rows[i].createdAt)
  }
})
