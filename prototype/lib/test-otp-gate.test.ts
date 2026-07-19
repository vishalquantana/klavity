// KLAVITYKLA-304 — regression tests for the runtime Test-OTP gate.
//
// The bug this guards: the bypass used to be a boot-time env read with NO expiry, so an ops admin
// who flipped it on for a test run had to remember to SSH back in and turn it off. These tests pin
// the two properties that fix it: (1) an /opsadmin-enabled gate works WITHOUT the env var, and
// (2) it goes inert on its own the moment it expires — no restart, no sweeper.
import { test, expect, beforeAll, beforeEach } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-totp-gate-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

import { reconnectDb, applySchema } from "./db"
import {
  getTestOtpGate, enableTestOtpGate, disableTestOtpGate, testOtpDecision,
  testOtpActiveForTestAccounts, normalizeEmails, recordTestOtpUse, listTestOtpUses,
} from "./test-otp-gate"

const TESTER = "vishal@quantana.com.au"
const OTHER = "someone-else@example.com"

beforeAll(async () => { await applySchema(reconnectDb("file:" + file)) })
beforeEach(async () => {
  delete process.env.KLAV_TEST_OTP
  delete process.env.KLAV_TEST_OTP_EMAILS
  await disableTestOtpGate()
})

test("gate is OFF by default — no env, no opsadmin toggle", async () => {
  expect((await testOtpDecision(TESTER)).allowed).toBe(false)
  expect(await testOtpActiveForTestAccounts()).toBe(false)
})

test("an ops admin can enable the gate WITHOUT the env var or a restart", async () => {
  await enableTestOtpGate(`${TESTER}`, 1, "ops@quantana.com.au")
  const d = await testOtpDecision(TESTER)
  expect(d.allowed).toBe(true)
  expect(d.via).toBe("opsadmin")
  expect(process.env.KLAV_TEST_OTP).toBeUndefined()
})

test("a non-allowlisted email is still rejected while the gate is enabled", async () => {
  await enableTestOtpGate(TESTER, 1, "ops@quantana.com.au")
  expect((await testOtpDecision(OTHER)).allowed).toBe(false)
})

test("registered test accounts are granted even when not on the allowlist", async () => {
  await enableTestOtpGate(TESTER, 1)
  expect((await testOtpDecision(OTHER, () => true)).allowed).toBe(true)
  expect((await testOtpDecision(OTHER, () => false)).allowed).toBe(false)
})

// ── THE regression: auto-expiry ──────────────────────────────────────────────
test("the gate auto-disables at expiry with no restart and no further writes", async () => {
  // Enable, then rewrite enabledUntil into the past to simulate the clock passing the expiry.
  await enableTestOtpGate(TESTER, 1, "ops@quantana.com.au")
  expect((await testOtpDecision(TESTER)).allowed).toBe(true)
  const { db } = await import("./db")
  const expired = { ...(await getTestOtpGate()), enabledUntil: Date.now() - 1000 }
  await db!.execute({
    sql: "INSERT INTO schema_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    args: ["test_otp_gate", JSON.stringify(expired)],
  })
  // Same process, no restart, nobody called disable — the very next decision must refuse.
  expect((await testOtpDecision(TESTER)).allowed).toBe(false)
  expect(await testOtpActiveForTestAccounts()).toBe(false)
})

test("enable requires BOTH an allowlist and a positive duration — no on-forever option", async () => {
  await expect(enableTestOtpGate("", 1)).rejects.toThrow(/email is required/i)
  await expect(enableTestOtpGate(TESTER, 0)).rejects.toThrow(/duration is required/i)
  await expect(enableTestOtpGate(TESTER, -5)).rejects.toThrow(/duration is required/i)
  expect((await testOtpDecision(TESTER)).allowed).toBe(false)
})

test("duration is capped at 24h so a fat-fingered value can't leave it on for weeks", async () => {
  const g = await enableTestOtpGate(TESTER, 24 * 30)
  expect(g.enabledUntil - Date.now()).toBeLessThanOrEqual(24 * 3600_000 + 5000)
})

test("disable turns it off immediately", async () => {
  await enableTestOtpGate(TESTER, 12)
  expect((await testOtpDecision(TESTER)).allowed).toBe(true)
  await disableTestOtpGate("ops@quantana.com.au")
  expect((await testOtpDecision(TESTER)).allowed).toBe(false)
})

test("the env var still works on its own for local dev (bootstrap override)", async () => {
  process.env.KLAV_TEST_OTP = "1"
  process.env.KLAV_TEST_OTP_EMAILS = ` ${TESTER.toUpperCase()} , extra@test.local `
  const d = await testOtpDecision(TESTER)
  expect(d.allowed).toBe(true)
  expect(d.via).toBe("env")
  expect((await testOtpDecision(OTHER)).allowed).toBe(false)
})

test("normalizeEmails lowercases, trims, dedupes and drops non-emails", () => {
  expect(normalizeEmails(" A@b.com, a@B.com , junk, ,c@d.io")).toEqual(["a@b.com", "c@d.io"])
})

test("[TEST-OTP-USED] bypass logins are recorded for the opsadmin audit view", async () => {
  await recordTestOtpUse(TESTER.toUpperCase(), "opsadmin", "203.0.113.7")
  await recordTestOtpUse(OTHER, "env", null)
  const uses = await listTestOtpUses(10)
  expect(uses.length).toBeGreaterThanOrEqual(2)
  expect(uses[0].email).toBe(OTHER)
  expect(uses.map((u) => u.email)).toContain(TESTER) // stored lowercased
  const mine = uses.find((u) => u.email === TESTER)!
  expect(mine.via).toBe("opsadmin")
  expect(mine.ip).toBe("203.0.113.7")
})
