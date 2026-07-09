// KLA-184 (AutoSim Auth AT6): shared, reusable login-execution path for the AutoSim driver.
//
// AT3 stored a per-project auth method (encrypted) in autosim_auth_configs. At run start the driver
// PERFORMS that login so the walk continues authenticated instead of pausing at the gate (KLA-179).
// Dispatch by branch:
//   - password   → Test Account creds (existing {{cred:<acct>:email|password}} path; not stored here)
//   - fixed_otp  → the app accepts a fixed test OTP for the registered email. We expose
//                  {{cred:autosim-auth:email}} + {{cred:autosim-auth:otp}} placeholders so the drive
//                  model fills the login form; the driver resolves them at fill-time (redacted).
//   - mint_link  → a signed session-mint link (GET /test-login?token=<signed>). The driver hits it
//                  directly to establish the session cookie, then walks the app authenticated.
//
// ADR-0001: secrets are decrypted ONLY here at execution time and are NEVER placed in the LLM
// page-state payload. credFields carry placeholders (not values); the mint link (which embeds the
// token) is navigated transiently and never recorded to the trajectory/history/model input. AT5
// (probe verify) reuses these same helpers to exercise a method before a real run.
import { getAutosimAuthConfigRaw, type AutosimAuthMethod } from "./db"
import { decryptSecret } from "./crypto"
import { hasCredRef, type CredResolver } from "./trails-creds"

/** Synthetic cred-account name for the project's registered AutoSim auth method. */
export const AUTOSIM_AUTH_CRED_ACCOUNT = "autosim-auth"

export type DecryptedAutosimAuthConfig = {
  method: AutosimAuthMethod
  email: string
  secret: string
  notes: string | null
}

/**
 * Load + decrypt the project's registered auth method. Decrypt-at-execution ONLY (ADR-0001):
 * callers must not persist/log/transmit the returned secret. Returns null when no method is
 * registered or the ciphertext can't be decrypted (wrong/rotated KLAV_SECRET) — in which case the
 * walk simply hits the auth gate and pauses (KLA-179) exactly as an unregistered project would.
 */
export async function loadAutosimAuthConfig(projectId: string): Promise<DecryptedAutosimAuthConfig | null> {
  const row = await getAutosimAuthConfigRaw(projectId)
  if (!row) return null
  let secret: string
  try {
    secret = await decryptSecret(row.secretEnc)
  } catch (e: any) {
    console.warn(`[autosim-auth] cannot decrypt auth config for ${projectId}: ${e?.message || e}`)
    return null
  }
  if (!secret) return null
  return { method: row.method, email: row.email, secret, notes: row.notes }
}

/**
 * Placeholders to expose to the drive model so it can complete a form-based login with the
 * registered method. mint_link needs no form fill (the session is established directly), so it
 * contributes no placeholders. Returned strings are safe to send to the LLM — they are references,
 * never the secret itself.
 */
export function autosimAuthCredFields(cfg: DecryptedAutosimAuthConfig | null): string[] {
  if (!cfg) return []
  if (cfg.method === "fixed_otp") {
    return [
      `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:email}}`,
      `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:otp}}`,
    ]
  }
  return []
}

/**
 * Wrap a base CredResolver so {{cred:autosim-auth:...}} placeholders resolve against the registered
 * method (resolved at fill-time only). Any other placeholder (e.g. a Test Account ref) delegates to
 * `base`. When no method is registered the base resolver is returned unchanged.
 */
export function withAutosimAuthCreds(base: CredResolver, cfg: DecryptedAutosimAuthConfig | null): CredResolver {
  if (!cfg) return base
  const emailRef = `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:email}}`
  const otpRef = `{{cred:${AUTOSIM_AUTH_CRED_ACCOUNT}:otp}}`
  return async (projectId, value) => {
    let out = value
    if (out.includes(emailRef)) out = out.replaceAll(emailRef, cfg.email)
    if (cfg.method === "fixed_otp" && out.includes(otpRef)) out = out.replaceAll(otpRef, cfg.secret)
    // Anything left (e.g. a test-account placeholder) is resolved by the base resolver.
    if (hasCredRef(out)) out = await base(projectId, out)
    return out
  }
}

/**
 * Build the absolute session-mint URL from the stored secret. The secret may be:
 *   - a full absolute URL (https://app.example.com/test-login?token=…) → used as-is
 *   - a path+query (/test-login?token=…) → resolved against the walk's baseUrl origin
 *   - a bare token → GET <baseUrl origin>/test-login?token=<token>
 */
export function autosimMintUrl(secret: string, baseUrl: string): string {
  const s = secret.trim()
  if (/^https?:\/\//i.test(s)) return s
  const origin = new URL(baseUrl).origin
  if (s.startsWith("/")) return origin + s
  return `${origin}/test-login?token=${encodeURIComponent(s)}`
}

/** Minimal page surface the driver already exposes; keeps this module browser-agnostic + testable. */
export interface MintablePage {
  goto(url: string, timeoutMs?: number): Promise<unknown>
  waitMs(ms: number): Promise<unknown>
  url(): string
}

export type EstablishResult = { established: boolean; method: AutosimAuthMethod | null }

/**
 * mint_link branch: navigate to the signed mint link to establish the session cookie, give the app
 * a beat to set it, then the caller navigates on to baseUrl so the token-bearing URL never lands in
 * the recorded trajectory or the LLM payload. No-op for non-mint methods. Best-effort: a failure is
 * logged and swallowed — the walk will simply hit the auth gate and pause (KLA-179) as before.
 */
export async function establishAutosimSession(
  page: MintablePage,
  cfg: DecryptedAutosimAuthConfig | null,
  baseUrl: string,
): Promise<EstablishResult> {
  if (!cfg || cfg.method !== "mint_link") return { established: false, method: cfg?.method ?? null }
  try {
    const url = autosimMintUrl(cfg.secret, baseUrl)
    await page.goto(url, 20_000)
    await page.waitMs(500)
    return { established: true, method: "mint_link" }
  } catch (e: any) {
    console.warn(`[autosim-auth] mint-link session establishment failed: ${e?.message || e}`)
    return { established: false, method: "mint_link" }
  }
}
