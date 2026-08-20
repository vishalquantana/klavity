import { test, expect, beforeEach } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { sendOtp, sendFixedNotification, buildMailFailurePayload, __mailAlertTail, __resetMailAlertDedup } from "./mail.ts"

useIsolatedDb("klav-mail-fail-alert")

function withEnv(vars: Record<string, string | undefined>, fn: () => Promise<void>) {
  const olds: Record<string, string | undefined> = {}
  for (const k of Object.keys(vars)) {
    olds[k] = process.env[k]
    if (vars[k] === undefined) delete process.env[k]
    else process.env[k] = vars[k]
  }
  return fn().finally(() => {
    for (const k of Object.keys(vars)) {
      if (olds[k] === undefined) delete process.env[k]
      else process.env[k] = olds[k]
    }
  })
}

const WEBHOOK = "https://hooks.slack.com/services/T00/B00/mailfail"

// A mocked fetch that fails the SendGrid call and captures Slack webhook POSTs.
function makeFetch(opts: { sendgridOk: boolean; slackThrows?: boolean }) {
  const slackPosts: Array<{ url: string; body: any }> = []
  const fn = (async (url: string, init?: any) => {
    if (String(url).includes("hooks.slack.com")) {
      if (opts.slackThrows) throw new Error("webhook down")
      slackPosts.push({ url: String(url), body: JSON.parse(init?.body || "{}") })
      return { ok: true, status: 200, text: async () => "ok", headers: { get: () => null } }
    }
    // SendGrid
    return {
      ok: opts.sendgridOk,
      status: opts.sendgridOk ? 202 : 401,
      text: async () => (opts.sendgridOk ? "" : "unauthorized"),
      headers: { get: (h: string) => (h.toLowerCase() === "x-message-id" ? "MSGID" : null) },
    }
  }) as any
  return { fn, slackPosts }
}

beforeEach(() => __resetMailAlertDedup())

test("a FAILED send POSTs a Slack alert with type, recipient domain and status (never the full address)", async () => {
  const { fn, slackPosts } = makeFetch({ sendgridOk: false })
  const oldFetch = globalThis.fetch
  globalThis.fetch = fn
  try {
    await withEnv({ SENDGRID_API_KEY: "sg-test", SLACK_MAIL_ALERT_WEBHOOK_URL: WEBHOOK }, async () => {
      await expect(sendOtp("secretuser@quantana.com.au", "123456")).rejects.toThrow("SendGrid 401")
      await __mailAlertTail() // await the fire-and-forget alert
    })
  } finally {
    globalThis.fetch = oldFetch
  }

  expect(slackPosts).toHaveLength(1)
  const raw = JSON.stringify(slackPosts[0].body)
  expect(slackPosts[0].url).toBe(WEBHOOK)
  expect(raw).toContain("otp")
  expect(raw).toContain("@quantana.com.au")
  expect(raw).toContain("401")
  // Privacy: the local-part / full address must never appear.
  expect(raw).not.toContain("secretuser")
  expect(raw).not.toContain("secretuser@quantana.com.au")
})

test("a SUCCESSFUL send does NOT alert", async () => {
  const { fn, slackPosts } = makeFetch({ sendgridOk: true })
  const oldFetch = globalThis.fetch
  globalThis.fetch = fn
  try {
    await withEnv({ SENDGRID_API_KEY: "sg-test", SLACK_MAIL_ALERT_WEBHOOK_URL: WEBHOOK }, async () => {
      await sendOtp("ok@test.local", "222222")
      await __mailAlertTail()
    })
  } finally {
    globalThis.fetch = oldFetch
  }
  expect(slackPosts).toHaveLength(0)
})

test("the caller is UNAFFECTED when the Slack webhook throws (still gets the SendGrid error)", async () => {
  const { fn } = makeFetch({ sendgridOk: false, slackThrows: true })
  const oldFetch = globalThis.fetch
  globalThis.fetch = fn
  try {
    await withEnv({ SENDGRID_API_KEY: "sg-test", SLACK_MAIL_ALERT_WEBHOOK_URL: WEBHOOK }, async () => {
      // The failure alert throwing must NOT change the caller's rejection.
      await expect(sendOtp("z@test.local", "333333")).rejects.toThrow("SendGrid 401")
      await __mailAlertTail() // resolves (swallows the webhook error), never rejects
    })
  } finally {
    globalThis.fetch = oldFetch
  }
})

test("no webhook configured -> silent no-op (no Slack POST)", async () => {
  const { fn, slackPosts } = makeFetch({ sendgridOk: false })
  const oldFetch = globalThis.fetch
  globalThis.fetch = fn
  try {
    await withEnv(
      { SENDGRID_API_KEY: "sg-test", SLACK_MAIL_ALERT_WEBHOOK_URL: undefined, SLACK_ALERT_WEBHOOK_URL: undefined, SLACK_SIGNUP_WEBHOOK_URL: undefined },
      async () => {
        await expect(sendOtp("a@test.local", "444444")).rejects.toThrow("SendGrid 401")
        await __mailAlertTail()
      },
    )
  } finally {
    globalThis.fetch = oldFetch
  }
  expect(slackPosts).toHaveLength(0)
})

test("de-dups a mass outage: at most one alert per (type,status) in the window", async () => {
  const { fn, slackPosts } = makeFetch({ sendgridOk: false })
  const oldFetch = globalThis.fetch
  globalThis.fetch = fn
  try {
    await withEnv({ SENDGRID_API_KEY: "sg-test", SLACK_MAIL_ALERT_WEBHOOK_URL: WEBHOOK }, async () => {
      for (const addr of ["u1@test.local", "u2@test.local", "u3@test.local"]) {
        await expect(sendOtp(addr, "555555")).rejects.toThrow("SendGrid 401")
        await __mailAlertTail()
      }
    })
  } finally {
    globalThis.fetch = oldFetch
  }
  // Three failing sends, same (otp,401) -> only one Slack alert.
  expect(slackPosts).toHaveLength(1)
})

// ── QA #13: the reason must never leak an email local-part, even for dot-less intranet domains ────

test("buildMailFailurePayload redacts the local-part of ANY local@domain in the reason", () => {
  const payload: any = buildMailFailurePayload(
    { type: "otp", to: ["x@y.com"], status: 400, reason: "rejected secretuser@test and also a@b (see x@y.com)" },
    "2026-08-20T00:00:00.000Z",
  )
  const reasonText = payload.blocks[payload.blocks.length - 1].elements[0].text as string
  // Dot-less intranet address: local-part gone, domain kept.
  expect(reasonText).not.toContain("secretuser")
  expect(reasonText).toContain("@test")
  // Single-char both sides.
  expect(reasonText).not.toMatch(/(^|[^@\w])a@b/)
  expect(reasonText).toContain("@b")
  // Normal address reduces to the domain only.
  expect(reasonText).not.toMatch(/[^@]x@y\.com/)
  expect(reasonText).toContain("@y.com")
})

// ── QA #12: EVERY send-failure path must fire the alert ──────────────────────────────────────────

test("a MISSING SENDGRID_API_KEY on the OTP path fires the alert (was: threw before alerting)", async () => {
  const { fn, slackPosts } = makeFetch({ sendgridOk: false })
  const oldFetch = globalThis.fetch
  globalThis.fetch = fn
  try {
    await withEnv({ SENDGRID_API_KEY: undefined, SLACK_MAIL_ALERT_WEBHOOK_URL: WEBHOOK }, async () => {
      await expect(sendOtp("c@test.local", "111111")).rejects.toThrow("SENDGRID_API_KEY not set")
      await __mailAlertTail()
    })
  } finally {
    globalThis.fetch = oldFetch
  }
  expect(slackPosts).toHaveLength(1)
  const raw = JSON.stringify(slackPosts[0].body)
  expect(raw).toContain("otp")
  expect(raw).toContain("network error") // status 0 renders as "network error"
})

test("a THROWING fetch on sendFixedNotification fires the alert (network exception no longer bypasses it)", async () => {
  // fetch throws for the SendGrid host (simulates DNS/network failure).
  const slackPosts: Array<{ url: string; body: any }> = []
  const fn = (async (url: string, init?: any) => {
    if (String(url).includes("hooks.slack.com")) {
      slackPosts.push({ url: String(url), body: JSON.parse(init?.body || "{}") })
      return { ok: true, status: 200, text: async () => "ok", headers: { get: () => null } } as any
    }
    throw new Error("getaddrinfo ENOTFOUND api.sendgrid.com")
  }) as any
  const oldFetch = globalThis.fetch
  globalThis.fetch = fn
  try {
    await withEnv({ SENDGRID_API_KEY: "sg-test", SLACK_MAIL_ALERT_WEBHOOK_URL: WEBHOOK }, async () => {
      await expect(
        sendFixedNotification("d@test.local", { title: "Bug", projectName: "Proj", ticketUrl: "https://x/y" }),
      ).rejects.toThrow(/ENOTFOUND/)
      await __mailAlertTail()
    })
  } finally {
    globalThis.fetch = oldFetch
  }
  expect(slackPosts).toHaveLength(1)
  const raw = JSON.stringify(slackPosts[0].body)
  expect(raw).toContain("notify_fixed")
})

test("a MISSING key on sendFixedNotification fires the alert", async () => {
  const { fn, slackPosts } = makeFetch({ sendgridOk: false })
  const oldFetch = globalThis.fetch
  globalThis.fetch = fn
  try {
    await withEnv({ SENDGRID_API_KEY: undefined, SLACK_MAIL_ALERT_WEBHOOK_URL: WEBHOOK }, async () => {
      await expect(
        sendFixedNotification("e@test.local", { title: "Bug", projectName: "Proj", ticketUrl: "https://x/y" }),
      ).rejects.toThrow("SENDGRID_API_KEY not set")
      await __mailAlertTail()
    })
  } finally {
    globalThis.fetch = oldFetch
  }
  expect(slackPosts).toHaveLength(1)
  expect(JSON.stringify(slackPosts[0].body)).toContain("notify_fixed")
})

test("falls back to SLACK_SIGNUP_WEBHOOK_URL when no dedicated mail webhook is set", async () => {
  const { fn, slackPosts } = makeFetch({ sendgridOk: false })
  const oldFetch = globalThis.fetch
  globalThis.fetch = fn
  try {
    await withEnv(
      { SENDGRID_API_KEY: "sg-test", SLACK_MAIL_ALERT_WEBHOOK_URL: undefined, SLACK_ALERT_WEBHOOK_URL: undefined, SLACK_SIGNUP_WEBHOOK_URL: WEBHOOK },
      async () => {
        await expect(sendOtp("b@test.local", "666666")).rejects.toThrow("SendGrid 401")
        await __mailAlertTail()
      },
    )
  } finally {
    globalThis.fetch = oldFetch
  }
  expect(slackPosts).toHaveLength(1)
})
