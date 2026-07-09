// Hermetic tests for trails-creds.ts (pure unit) + a runner-level e2e guard.
// Mirrors the DB setup of lib/trails-runner.e2e.test.ts.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

process.env.KLAV_SECRET = Buffer.alloc(32, 7).toString("base64")
const file = join(tmpdir(), `klav-creds-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2, createAutosimAuthSetupToken, registerAutosimAuthConfig } = await import("./db")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

const { hasCredRef, resolveCredRefs } = await import("./trails-creds")
const { createTestAccount } = await import("./test-accounts")
const { crystallize } = await import("./trails-crystallize")
const { walkTrail } = await import("./trails-runner")
const T = await import("./trails")

const P = "proj_creds_test"

const RUN_BROWSER = !!process.env.KLAV_E2E

const fixtureUrl = (name: string) =>
  pathToFileURL(resolve(import.meta.dir, "../test-fixtures", name)).href

// ── pure unit tests ───────────────────────────────────────────────────────────

test("hasCredRef detects placeholders", () => {
  expect(hasCredRef("{{cred:admin:password}}")).toBe(true)
  expect(hasCredRef("{{cred:admin:otp}}")).toBe(true)
  expect(hasCredRef("{{autosim_auth:secret}}")).toBe(true)
  expect(hasCredRef("plain text")).toBe(false)
})

test("resolveCredRefs substitutes email and password", async () => {
  await createTestAccount(P, { name: "admin", loginEmail: "vishal@quantana.com.au", password: "pw-999" })
  expect(await resolveCredRefs(P, "{{cred:admin:email}}")).toBe("vishal@quantana.com.au")
  expect(await resolveCredRefs(P, "{{cred:admin:password}}")).toBe("pw-999")
  expect(await resolveCredRefs(P, "{{cred:admin:password}}+{{cred:admin:password}}")).toBe("pw-999+pw-999")
})

test("resolveCredRefs :otp returns 666666 when KLAV_TEST_OTP is set (OTP-shape account)", async () => {
  await createTestAccount(P, { name: "otp-admin", loginEmail: "otp-admin@test.local", authShape: "otp" })
  const saved = process.env.KLAV_TEST_OTP
  try {
    process.env.KLAV_TEST_OTP = "1"
    expect(await resolveCredRefs(P, "{{cred:otp-admin:otp}}")).toBe("666666")
  } finally {
    if (saved === undefined) delete process.env.KLAV_TEST_OTP
    else process.env.KLAV_TEST_OTP = saved
  }
})

test("resolveCredRefs :otp throws when KLAV_TEST_OTP is not set", async () => {
  const saved = process.env.KLAV_TEST_OTP
  try {
    delete process.env.KLAV_TEST_OTP
    await expect(resolveCredRefs(P, "{{cred:admin:otp}}")).rejects.toThrow("KLAV_TEST_OTP")
  } finally {
    if (saved !== undefined) process.env.KLAV_TEST_OTP = saved
  }
})

test("unknown account throws; other project cannot resolve", async () => {
  await expect(resolveCredRefs(P, "{{cred:ghost:password}}")).rejects.toThrow("unknown test account")
  await expect(resolveCredRefs("proj_other", "{{cred:admin:password}}")).rejects.toThrow()
})

test("resolveCredRefs substitutes autosim auth config only at runtime", async () => {
  const token = await createAutosimAuthSetupToken(P, "vishal@quantana.com.au")
  const registered = await registerAutosimAuthConfig(P, token.id, {
    method: "fixed_otp",
    email: "vishal@quantana.com.au",
    secret: "otp-secret-321",
    notes: null,
  })
  expect(registered).not.toBeNull()
  const modelFacing = "email={{autosim_auth:email}} secret={{autosim_auth:secret}}"
  expect(modelFacing).not.toContain("otp-secret-321")
  expect(await resolveCredRefs(P, modelFacing)).toBe("email=vishal@quantana.com.au secret=otp-secret-321")
})

// ── KLA-103: OTP auth shape ───────────────────────────────────────────────────

const P_OTP = "proj_creds_otp"

test("resolveCredRefs {{cred:otp-acct:otp}} returns fixed OTP code when KLAV_TEST_OTP=1", async () => {
  await createTestAccount(P_OTP, { name: "otp-acct", loginEmail: "otp@test.local", authShape: "otp" })
  process.env.KLAV_TEST_OTP = "1"
  expect(await resolveCredRefs(P_OTP, "{{cred:otp-acct:email}}")).toBe("otp@test.local")
  expect(await resolveCredRefs(P_OTP, "{{cred:otp-acct:otp}}")).toBe("666666")
  delete process.env.KLAV_TEST_OTP
})

test("resolveCredRefs {{cred:otp-acct:otp}} throws when KLAV_TEST_OTP not set", async () => {
  delete process.env.KLAV_TEST_OTP
  await expect(resolveCredRefs(P_OTP, "{{cred:otp-acct:otp}}")).rejects.toThrow()
})

test("resolveCredRefs {{cred:otp-acct:password}} throws for OTP-shape account", async () => {
  process.env.KLAV_TEST_OTP = "1"
  await expect(resolveCredRefs(P_OTP, "{{cred:otp-acct:password}}")).rejects.toThrow("does not have a password")
  delete process.env.KLAV_TEST_OTP
})

test("resolveCredRefs {{cred:admin:otp}} throws for password-shape account", async () => {
  process.env.KLAV_TEST_OTP = "1"
  await expect(resolveCredRefs(P, "{{cred:admin:otp}}")).rejects.toThrow("does not have an OTP code")
  delete process.env.KLAV_TEST_OTP
})

test("resolveCredRefs {{cred:token-acct:token}} and {{cred:token-acct:password}} substitute token", async () => {
  const P_TOKEN = "proj_creds_token"
  await createTestAccount(P_TOKEN, { name: "token-acct", loginEmail: "token@test.local", password: "tok-val-123", authShape: "token" })
  expect(await resolveCredRefs(P_TOKEN, "{{cred:token-acct:email}}")).toBe("token@test.local")
  expect(await resolveCredRefs(P_TOKEN, "{{cred:token-acct:token}}")).toBe("tok-val-123")
  expect(await resolveCredRefs(P_TOKEN, "{{cred:token-acct:password}}")).toBe("tok-val-123")
})

// ── runner-level e2e guard ────────────────────────────────────────────────────


test.if(RUN_BROWSER)("walk resolves cred at fill time; placeholder (not secret) in DB + codegen", async () => {
  const traj = {
    name: "login", baseUrl: "file://x", authorKind: "llm" as const,
    steps: [
      { action: "type" as const, actionValue: "{{cred:admin:password}}",
        target: { role: "textbox", accessibleName: "Password", resolvedSelector: "#pw" }, url: "u", domHash: "h" },
      { action: "click" as const, target: { role: "button", accessibleName: "Sign in", resolvedSelector: "#go" }, url: "u", domHash: "h" },
    ],
  }
  const { trailId } = await crystallize(P, traj)
  let resolvedTo = ""
  const summary = await walkTrail(P, trailId, {
    fixtureUrl: fixtureUrl("login-mockup.html"),
    credResolver: async (_p, v) => { resolvedTo = "pw-999"; return v.replace(/\{\{cred:[^}]+\}\}/, "pw-999") },
  })
  expect(summary.verdict).toBe("green")
  expect(resolvedTo).toBe("pw-999")
  const steps = await T.listTrailSteps(P, trailId)
  expect(JSON.stringify(steps)).toContain("{{cred:admin:password}}")
  expect(JSON.stringify(steps)).not.toContain("pw-999")
  const runSteps = await T.listRunSteps(P, summary.runId)
  expect(JSON.stringify(runSteps)).not.toContain("pw-999")
}, 30000)
