// JTBD 1.7 — unit tests for Cloudflare Turnstile server-side verification.
// Hermetic: no real network. The one test that exercises the siteverify call stubs globalThis.fetch.

import { test, expect, afterEach } from "bun:test"
import { verifyTurnstile, turnstileEnabled, turnstileSecret, turnstileSiteKey } from "./turnstile"

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
  delete process.env.TURNSTILE_SECRET_KEY
  delete process.env.TURNSTILE_SITE_KEY
})

test("turnstileEnabled/turnstileSecret reflect the env", () => {
  delete process.env.TURNSTILE_SECRET_KEY
  expect(turnstileEnabled()).toBe(false)
  expect(turnstileSecret()).toBe("")
  process.env.TURNSTILE_SECRET_KEY = "  sk_test_123  "
  expect(turnstileEnabled()).toBe(true)
  expect(turnstileSecret()).toBe("sk_test_123") // trimmed
})

test("turnstileSiteKey reflects the env (trimmed) and is empty when unset", () => {
  delete process.env.TURNSTILE_SITE_KEY
  expect(turnstileSiteKey()).toBe("")
  process.env.TURNSTILE_SITE_KEY = " 1x00000000000000000000AA "
  expect(turnstileSiteKey()).toBe("1x00000000000000000000AA")
})

test("not configured → verify passes (no enforcement, no network)", async () => {
  delete process.env.TURNSTILE_SECRET_KEY
  // Any fetch here would be a bug — trip the test if it's called.
  globalThis.fetch = (() => { throw new Error("must not call siteverify when unconfigured") }) as any
  expect(await verifyTurnstile("anything")).toBe(true)
  expect(await verifyTurnstile("")).toBe(true)
})

test("enabled + empty/missing token → reject WITHOUT any network call", async () => {
  process.env.TURNSTILE_SECRET_KEY = "sk_test"
  globalThis.fetch = (() => { throw new Error("must not call siteverify for an empty token") }) as any
  expect(await verifyTurnstile("")).toBe(false)
  expect(await verifyTurnstile(null)).toBe(false)
  expect(await verifyTurnstile(undefined)).toBe(false)
})

test("enabled + token → siteverify success returns true, and remoteip is forwarded", async () => {
  process.env.TURNSTILE_SECRET_KEY = "sk_test"
  let sentBody = ""
  globalThis.fetch = (async (_url: string, init: any) => {
    sentBody = String(init?.body || "")
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  }) as any
  expect(await verifyTurnstile("good-token", "1.2.3.4")).toBe(true)
  expect(sentBody).toContain("response=good-token")
  expect(sentBody).toContain("remoteip=1.2.3.4")
  expect(sentBody).toContain("secret=sk_test")
})

test("enabled + token → siteverify failure returns false", async () => {
  process.env.TURNSTILE_SECRET_KEY = "sk_test"
  globalThis.fetch = (async () => new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }), { status: 200 })) as any
  expect(await verifyTurnstile("bad-token")).toBe(false)
})

test("enabled + token → Cloudflare outage (5xx) fails OPEN (returns true)", async () => {
  process.env.TURNSTILE_SECRET_KEY = "sk_test"
  globalThis.fetch = (async () => new Response("upstream down", { status: 503 })) as any
  expect(await verifyTurnstile("some-token")).toBe(true)
})

test("enabled + token → network throw fails OPEN (returns true)", async () => {
  process.env.TURNSTILE_SECRET_KEY = "sk_test"
  globalThis.fetch = (async () => { throw new Error("ECONNRESET") }) as any
  expect(await verifyTurnstile("some-token")).toBe(true)
})
