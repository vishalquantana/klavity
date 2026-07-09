import { expect, test } from "bun:test"
import { generateAuthPrompt } from "./autosim-auth-prompt"

const TOKEN = "aset_test_token_abc123"
const EMAIL = "vishal@quantana.com.au"
const PROJECT = "Acme App"

// ── fixed_otp variant ───────────────────────────────────────────────────────

test("fixed_otp prompt: instructs to find OTP verification path", () => {
  const out = generateAuthPrompt({ method: "fixed_otp", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(out).toContain("Find your OTP verification path")
})

test("fixed_otp prompt: requires env flag check + allowlist match for the Sim email", () => {
  const out = generateAuthPrompt({ method: "fixed_otp", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(out).toMatch(/env-gated bypass/i)
  expect(out).toMatch(/environment variable.*KLAV_TEST_OTP|KLAV_TEST_OTP.*environment variable/i)
  // Allowlist must reference the exact Sim email.
  expect(out).toContain(EMAIL)
})

test("fixed_otp prompt: mandates a STRONG RANDOM code (never 666666)", () => {
  const out = generateAuthPrompt({ method: "fixed_otp", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(out).toMatch(/strong random/i)
  // The literal string "666666" must NOT appear as an allowed value (it should only appear in the negative).
  const lines = out.split("\n")
  for (const line of lines) {
    if (/never.*666666|not.*666666/.test(line)) continue // OK — negative mention is fine.
    expect(line).not.toContain("666666")
  }
})

test("fixed_otp prompt: mirrors KLAVITY's own KLAV_TEST_OTP pattern", () => {
  const out = generateAuthPrompt({ method: "fixed_otp", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(out).toMatch(/mirrors?.*KLAV_TEST_OTP|KLAV_TEST_OTP.*pattern/i)
})

test("fixed_otp prompt: includes acceptance checks", () => {
  const out = generateAuthPrompt({ method: "fixed_otp", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(out).toMatch(/acceptance checks?/i)
  expect(out).toContain("[ ]")
})

// ── mint_link variant ───────────────────────────────────────────────────────

test("mint_link prompt: instructs to add guarded GET /test-login?token=signed", () => {
  const out = generateAuthPrompt({ method: "mint_link", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(out).toMatch(/GET \/test-login\?token=/)
  expect(out).toContain("guarded")
})

test("mint_link prompt: requires env gate (KLAV_MINT_LINK=1)", () => {
  const out = generateAuthPrompt({ method: "mint_link", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(out).toMatch(/env-gate|env flag/i)
  // Must mention short-circuit to 403 when env is unset.
  expect(out).toMatch(/403|short.circuit/i)
})

test("mint_link prompt: requires strong secret + constant-time compare", () => {
  const out = generateAuthPrompt({ method: "mint_link", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(out).toMatch(/strong.secret.*256.bit|high-entropy/i)
  expect(out).toMatch(/constant.time.compare|timingSafeEqual/i)
  expect(out).toMatch(/exp.*jti.*audience|jti.*audience.*HMAC/i)
})

test("mint_link prompt: session mints for the allowlisted Sim email", () => {
  const out = generateAuthPrompt({ method: "mint_link", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(out).toMatch(/session.*mint|mint.*session/i)
  expect(out).toContain(EMAIL)
})

test("mint_link prompt: includes acceptance checks", () => {
  const out = generateAuthPrompt({ method: "mint_link", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(out).toMatch(/acceptance checks?/i)
  // Specifically asserts that tampered tokens fail constant-time verification with 401.
  expect(out).toMatch(/tamper.*token|constant.time/i)
  expect(out).toMatch(/amlt_|same-origin path/i)
  expect(out).toMatch(/Never paste an absolute URL/i)
})

// ── shared requirements (both variants) ─────────────────────────────────────

test("prompt ends with registration curl to POST /api/autosim/auth-config", () => {
  const fixed = generateAuthPrompt({ method: "fixed_otp", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(fixed).toContain("curl")
  expect(fixed).toMatch(/POST https:\/\/app\.klavy\.in\/api\/autosim\/auth-config/)
  expect(fixed).toContain(TOKEN)

  const mint = generateAuthPrompt({ method: "mint_link", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(mint).toMatch(/POST https:\/\/app\.klavy\.in\/api\/autosim\/auth-config/)
})

test("prompt tells the agent to inform the dev that Klavity will verify", () => {
  const fixed = generateAuthPrompt({ method: "fixed_otp", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(fixed).toMatch(/Klavity will verify|we'll verify/i)

  const mint = generateAuthPrompt({ method: "mint_link", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  expect(mint).toMatch(/Klavity will verify|we'll verify/i)
})

test("prompt is stack-adaptive — no framework-specific implementation (Next.js / Express / Fastify)", () => {
  const fixed = generateAuthPrompt({ method: "fixed_otp", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  // The prompt must NOT prescribe Next.js, Express, etc. as the *only* target — it should be adaptive.
  // It CAN mention them in hints, but only as "if you use X" suggestions — not as directives.
  expect(fixed).not.toMatch(/implement this in (next|express|fastify|hono)/i)
  // Stack-adaptive: must offer alternatives for different frameworks via "if/else" phrasing.
  expect(fixed).toMatch(/if.*Next\.js|if.*Express/i)
})

test("prompt varies by method — fixed_otp ≠ mint_link", () => {
  const otp = generateAuthPrompt({ method: "fixed_otp", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })
  const link = generateAuthPrompt({ method: "mint_link", testEmail: EMAIL, setupToken: TOKEN, projectName: PROJECT })

  // Each variant must contain its own signature phrase.
  expect(otp).toContain("OTP")
  expect(link).not.toContain("OTP bypass")
  expect(link).toMatch(/GET \/test-login/)
  expect(otp).not.toMatch(/GET \/test-login/)
})
