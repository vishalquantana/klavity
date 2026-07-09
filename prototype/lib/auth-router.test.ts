// Give your Sims a key — Auth Router Screen (KLAVITYKLA-180)
// Shows "How do people log into your app?" with three branches (password / OTP-magic-link / Google-SSO).
// Per-project auth status chip: none | registered | verified. Paused runs listed as waiting-for-key
// with an auto-resume promise so walks don't hang on missing creds.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"

const src = readFileSync(new URL("../public/auth-router.html", import.meta.url), "utf8")

test("auth-router.html has the screen title 'Give your Sims a key'", () => {
  expect(src).toContain("Give your Sims a key")
})

test("auth-router.html asks 'How do people log into your app?'", () => {
  expect(src).toContain("How do people log into your app?")
})

test("auth-router.html has the Password branch with an inline Test Account creds form", () => {
  // Password branch header + a placeholder form container for existing encrypted test accounts.
  expect(src).toContain("Password")
  expect(src).toMatch(/test[_\s-]*account\s+creds/i) // id/label hints at the existing encrypted form slot
})

test("auth-router.html has the OTP / Magic-link branch with a copy-button stub", () => {
  expect(src).toContain("OTP or magic link")
  // The ready-to-paste agent prompt is rendered into a container; the copy button is wired to it.
  expect(src).toMatch(/agent[_\s-]*prompt/i)
  expect(src).toContain("copy")
})

test("auth-router.html has the Google / SSO-only branch with an honest note that login UX is not simmed", () => {
  expect(src).toMatch(/Google|SSO/)
  // Honest disclosure: the login UX itself will not be simulated by AutoSim.
  expect(src).toContain("will not be simmed")
})

test("auth-router.html exposes a per-project auth status chip with values none / registered / verified", () => {
  expect(src).toContain("auth-status-chip")
  expect(src).toMatch(/data-state=["']none["']/)
  expect(src).toMatch(/data-state=["']registered["']/)
  expect(src).toMatch(/data-state=["']verified["']/)
})

test("auth-router.html lists paused runs as waiting-for-key with an auto-resume promise", () => {
  // The section heading and the promise text are both rendered in the source.
  expect(src).toContain("Waiting for a key")
  expect(src).toMatch(/auto[_\s-]resume|will\s+resume/i)
})

test("auth-router.html: password form has id=passwordCredsForm", () => {
  expect(src).toContain('id="passwordCredsForm"')
})

test("auth-router.html: OTP branch has id=otpPromptSlot and copy button triggers a copy action", () => {
  expect(src).toContain('id="otpPromptSlot"')
  // Copy button wired via a data attribute + onclick stub.
  expect(src).toMatch(/data-copy-target=["']otpPromptSlot["']/)
})

test("auth-router.html: Google/SSO branch has id=googleSsoNote with the honesty disclosure", () => {
  expect(src).toContain('id="googleSsoNote"')
  // The note explicitly says login UX is out of scope for AutoSim.
  expect(src).toMatch(/login\s+(UX|flow|experience).*sim/i)
})
