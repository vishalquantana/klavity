// KLAVITYKLA-182: AutoSim Auth AT4 — per-project prompt generator.
// Produces a ready-to-paste prompt the dev drops into Cursor / Claude Code / Codex so that the
// coding agent adds just enough of their app's auth surface for an AutoSim to walk authenticated
// trails. Two variants, selected by the AT2 router branch (stored as `method` on the project's
// autosim_auth_config):
//   - fixed_otp: instructs the coding agent to find the OTP verification path and add a guarded
//     bypass — when an env flag is set AND the email is in the allowlist (the project Sim test
//     email) then accept a STRONG RANDOM code; mirror Klavity's own KLAV_TEST_OTP pattern.
//   - mint_link: instructs the coding agent to add a guarded route GET /test-login?token=signed
//     that mints a session for the allowlisted test user; env-gated, strong secret, token compared
//     constant-time.
//
// The prompt is stack-adaptive — it states requirements + acceptance checks, never framework
// specifics (Next.js / Express / Fastify / Hono / Deno — all OK). End-of-prompt registration curl
// to POST /api/autosim/auth-config embedding the project setup token; tells the agent to inform
// the dev that Klavity will verify.

import type { AutosimAuthMethod, AutosimAuthSetupToken } from "./db"

export interface AuthPromptInput {
  method: AutosimAuthMethod
  /** The project Sim's login email (allowlisted address). */
  testEmail: string
  /** Raw setup token handed to the dev by Klavity (not stored on server after registration). */
  setupToken: string
  /** Display name for the dev's app, surfaced in the prompt so they can target it. */
  projectName: string
}

/**
 * Stack-adaptive prompt generator. Returns a single markdown block the dev pastes verbatim into
 * their coding agent (Cursor / Claude Code / Codex). The coding agent reads this and produces the
 * diff — never runs Klavity, never touches prod secrets.
 */
export function generateAuthPrompt(input: AuthPromptInput): string {
  const curl = [
    "```shell",
    `curl -X POST https://app.klavy.in/api/autosim/auth-config \\`,
    `  -H "Authorization: Bearer ${input.setupToken}" \\`,
    `  -H "Content-Type: application/json" \\`,
    '  -d \'{"method":"PLACEHOLDER_METHOD","email":"PLACEHOLDER_EMAIL","secret":"PLACEHOLDER_SECRET"}\'',
    "```",
  ].join("\n")

  const base = [
    "# AutoSim Auth Setup — Add Auth Surface for Sim Walks",
    "",
    `## Context`,
    `Your project **${input.projectName}** has an AutoSim that needs to walk authenticated user journeys.`,
    `AutoSim will act as a *Test Account* logged in as **${input.testEmail}**. Add just enough of your app's auth surface so the Sim can reach protected pages — nothing else.`,
    "",
    "## Requirements",
  ]

  if (input.method === "fixed_otp") {
    return buildFixedOtpPrompt(base, input, curl)
  }
  return buildMintLinkPrompt(base, input, curl)
}

// ── fixed_otp variant ───────────────────────────────────────────────────────

function buildFixedOtpPrompt(base: string[], input: AuthPromptInput, curl: string): string {
  const prompt = [
    ...base,
    "1. **Find your OTP verification path.** Locate the endpoint / route that accepts a login email + code (often `/api/auth/verify`, `POST /login`, or similar).",
    "2. **Add an env-gated bypass for the Sim's allowlisted email.** When both conditions hold, accept *any* 6-digit OTP without sending an email:",
    "   - An environment variable like `KLAV_TEST_OTP=1` is set (OFF by default in production).",
    "   - The login email matches your project's Sim test address: **`${input.testEmail}`**.",
    "3. **Generate a STRONG RANDOM OTP code.** Use `crypto.randomInt(100000, 1000000)` (Node) or equivalent — never hardcode `666666` or any other predictable value. The generated code should be stored in your env under something like `KLAV_TEST_OTP_CODE` so the Sim can read it.",
    "4. **Mirror Klavity's own pattern.** Your bypass should behave identically to `KLAV_TEST_OTP`: when active, skip rate limits and email delivery for the allowlisted email; otherwise production auth is untouched.",
    "",
    "## Acceptance checks (run these before pasting into Cursor / Claude Code / Codex)",
    "- [ ] A non-allowlisted email still goes through normal OTP flow (no bypass).",
    "- [ ] Without `KLAV_TEST_OTP` set, the code is rejected for the allowlisted email.",
    "   - [ ] With `KLAV_TEST_OTP=1`, any 6-digit code works for `${input.testEmail}` — including a freshly-generated random one.",
    "- [ ] Rate limits and emails are skipped only when both conditions match; production auth is unaffected.",
    "",
    "## Stack-adaptive implementation hints (do NOT commit to these verbatim)",
    "- If your app uses Next.js API routes → add the bypass inside your verify handler.",
    "- If Express / Fastify / Hono / Deno → add it before your rate limiter / email sender fires.",
    "- If you don't have an OTP endpoint yet, scaffold one that stores a code in Redis/DB with a 10-minute TTL and accepts the allowlisted bypass above.",
    "",
    "## After you've added the auth surface",
    "Register it with Klavity so we can probe your login flow. Paste this into your terminal (replace `PLACEHOLDER_*` values):",
    curl,
    "- `PLACEHOLDER_METHOD` → `" + input.method + "`",
    `- ${input.testEmail} is your Sim test email — paste verbatim.`,
    "  - `PLACEHOLDER_SECRET` → the *generated* OTP code (the strong random one from step 3).",
    "",
    "⚠️ **Tell the dev:** Klavity will verify this by probing your login flow with `${input.testEmail}` and the supplied secret. If verification fails, we'll ask you to re-run or adjust.",
    "",
    "---",
    `AutoSim Auth · KLAVITYKLA-182 · method=${input.method}`,
  ]

  return prompt.join("\n")
}

// ── mint_link variant ───────────────────────────────────────────────────────

function buildMintLinkPrompt(base: string[], input: AuthPromptInput, curl: string): string {
  const prompt = [
    ...base,
    "1. **Add a guarded route `GET /test-login?token=<signed-token>`** that mints a session for the allowlisted test user `${input.testEmail}`.",
    "2. **Env-gate it.** The route MUST NOT be reachable in production: check an env flag like `KLAV_TEST_LOGIN=1` at the top of the handler and short-circuit with 403 if unset.",
    "3. **Strong secret + constant-time compare.**",
    "   - Pick a high-entropy signing secret (≥256 bits). Store it in env as `KLAV_MINT_LINK_SECRET`.",
    "   - Token format: HMAC-SHA256(`email`, secret) truncated to 32 hex chars. Verify with constant-time compare (`crypto.timingSafeEqual` in Node, or equivalent).",
    "4. **Session minting.** On success, issue a session cookie or JWT for `${input.testEmail}` (or your app's internal user identity mapped from that email) and redirect back to the origin URL (passed via `?next=`).",
    "",
    "## Acceptance checks",
    "- [ ] Without `KLAV_MINT_LINK=1`, every request returns 403 regardless of token.",
    "- [ ] A tampered token fails constant-time verification and returns 401 (not leaking timing).",
    "- [ ] A freshly-signed token for `${input.testEmail}` mints a real session; the Sim can then navigate protected pages.",
    "- [ ] Tokens signed for other emails are rejected even if they verify syntactically.",
    "",
    "## Stack-adaptive implementation hints (do NOT commit to these verbatim)",
    "- If Next.js → add `app/test-login/route.ts` returning the session + redirect.",
    "- If Express / Fastify / Hono / Deno → mount `GET /test-login` with HMAC verify middleware.",
    "- Use a well-known library for constant-time compare (`crypto.timingSafeEqual`, `subtle.digest('HMAC-SHA256', …)`); never use `===` on raw token bytes.",
    "",
    "## After you've added the auth surface",
    "Register it with Klavity so we can probe your login flow. Paste this into your terminal (replace `PLACEHOLDER_*` values):",
    curl,
    "- `PLACEHOLDER_METHOD` → `" + input.method + "`",
    `- ${input.testEmail} is your Sim test email — paste verbatim.`,
    "  - `PLACEHOLDER_SECRET` → the base URL of your mint route (e.g., `https://your-app.test/test-login`).",
    "",
    "⚠️ **Tell the dev:** Klavity will verify this by probing `/test-login?token=<signed>` and confirming a session is minted for `${input.testEmail}`. If verification fails, we'll ask you to re-run or adjust.",
    "",
    "---",
    `AutoSim Auth · KLAVITYKLA-182 · method=${input.method}`,
  ]

  return prompt.join("\n")
}
