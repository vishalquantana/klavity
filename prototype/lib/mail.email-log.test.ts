import { test, expect } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { sendOtp } from "./mail.ts"
import { recentOutboundEmails } from "./db"

useIsolatedDb("klav-mail-email-log")

function withEnv(vars: Record<string, string>, fn: () => Promise<void>) {
  const olds: Record<string, string | undefined> = {}
  for (const k of Object.keys(vars)) { olds[k] = process.env[k]; process.env[k] = vars[k] }
  return fn().finally(() => {
    for (const k of Object.keys(vars)) {
      if (olds[k] === undefined) delete process.env[k]
      else process.env[k] = olds[k]
    }
  })
}

test("sendOtp logs a 'sent' email_log row with sendgrid message id on success", async () => {
  const oldFetch = globalThis.fetch
  globalThis.fetch = (async () => ({
    ok: true,
    status: 202,
    headers: { get: (h: string) => (h.toLowerCase() === "x-message-id" ? "MSGID123" : null) },
  })) as any
  try {
    await withEnv({ SENDGRID_API_KEY: "sg-test" }, async () => {
      await sendOtp("x@test.local", "123456")
    })
  } finally {
    globalThis.fetch = oldFetch
  }

  const rows = await recentOutboundEmails({ to: "x@test.local" })
  expect(rows).toHaveLength(1)
  expect(rows[0].type).toBe("otp")
  expect(rows[0].to).toBe("x@test.local")
  expect(rows[0].messageId).toBe("MSGID123")
  expect(rows[0].status).toBe("sent")
  expect(rows[0].httpStatus).toBe(202)
})

test("sendOtp throws AND logs a 'failed' email_log row on non-2xx", async () => {
  const oldFetch = globalThis.fetch
  globalThis.fetch = (async () => ({
    ok: false,
    status: 401,
    text: async () => "unauthorized",
    headers: { get: () => null },
  })) as any
  try {
    await withEnv({ SENDGRID_API_KEY: "sg-test" }, async () => {
      await expect(sendOtp("y@test.local", "654321")).rejects.toThrow("SendGrid 401")
    })
  } finally {
    globalThis.fetch = oldFetch
  }

  const rows = await recentOutboundEmails({ to: "y@test.local" })
  expect(rows).toHaveLength(1)
  expect(rows[0].type).toBe("otp")
  expect(rows[0].status).toBe("failed")
  expect(rows[0].httpStatus).toBe(401)
  expect(rows[0].error).toContain("unauthorized")
})
