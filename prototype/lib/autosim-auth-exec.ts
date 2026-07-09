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
  projectId: string
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
  return { projectId: row.projectId, method: row.method, email: row.email, secret, notes: row.notes }
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
 * Build the absolute session-mint URL from the stored secret. The secret may be either:
 *   - a same-origin path+query (/test-login?token=…)
 *   - an opaque signed token, resolved as GET <baseUrl origin>/test-login?token=<token>
 *
 * Absolute URLs are deliberately rejected: the browser is server-side, so accepting arbitrary
 * origins here is SSRF. The resolved origin must be public unless tests explicitly opt in.
 */
export function autosimMintUrl(secret: string, baseUrl: string): string {
  const s = secret.trim()
  if (!s) throw new Error("mint link secret is empty")
  if (/^https?:\/\//i.test(s)) throw new Error("mint_link must be an opaque token or same-origin /test-login path, not an absolute URL")
  const base = new URL(baseUrl)
  assertPublicMintOrigin(base)
  const url = s.startsWith("/")
    ? new URL(s, base.origin)
    : new URL(`/test-login?token=${encodeURIComponent(s)}`, base.origin)
  if (url.origin !== base.origin) throw new Error("mint_link must resolve to the base URL origin")
  if (url.pathname !== "/test-login") throw new Error("mint_link path must be /test-login")
  if (!url.searchParams.get("token")) throw new Error("mint_link token is missing")
  return url.toString()
}

/** Minimal page surface the driver already exposes; keeps this module browser-agnostic + testable. */
export interface MintablePage {
  goto(url: string, timeoutMs?: number): Promise<unknown>
  waitMs(ms: number): Promise<unknown>
  url(): string
  krefSnapshot?(capChars?: number): Promise<string>
}

export type EstablishResult = { established: boolean; method: AutosimAuthMethod | null }

type MintTokenPayload = {
  v: 1
  exp: number
  jti: string
  aud: string
}

const MINT_TOKEN_PREFIX = "amlt_"
const usedMintJtis = new Map<string, number>()
const b64url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
const unb64url = (s: string): Uint8Array => {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
}

function timingSafeEqual(a: string, b: string): boolean {
  const aa = unb64url(a)
  const bb = unb64url(b)
  if (aa.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i]
  return diff === 0
}

async function mintKey(): Promise<CryptoKey> {
  const raw = process.env.KLAV_SECRET
  if (!raw) throw new Error("KLAV_SECRET is not set")
  const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
  if (bytes.length < 32) throw new Error("KLAV_SECRET must decode to at least 32 bytes")
  return crypto.subtle.importKey("raw", bytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
}

async function signMintPayload(payloadB64: string): Promise<string> {
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", await mintKey(), new TextEncoder().encode(payloadB64)))
  return b64url(mac)
}

export async function mintAutosimAuthLinkToken(projectId: string, ttlMs = 5 * 60 * 1000, now = Date.now()): Promise<string> {
  const payload: MintTokenPayload = {
    v: 1,
    exp: now + ttlMs,
    jti: crypto.randomUUID(),
    aud: projectId,
  }
  const payloadB64 = b64url(new TextEncoder().encode(JSON.stringify(payload)))
  return `${MINT_TOKEN_PREFIX}${payloadB64}.${await signMintPayload(payloadB64)}`
}

export async function validateAutosimMintToken(token: string, projectId: string, now = Date.now()): Promise<MintTokenPayload> {
  if (!token.startsWith(MINT_TOKEN_PREFIX)) throw new Error("mint_link token has an invalid format")
  const rest = token.slice(MINT_TOKEN_PREFIX.length)
  const [payloadB64, sig] = rest.split(".")
  if (!payloadB64 || !sig) throw new Error("mint_link token has an invalid format")
  const expected = await signMintPayload(payloadB64)
  if (!timingSafeEqual(sig, expected)) throw new Error("mint_link token signature is invalid")
  let payload: MintTokenPayload
  try {
    payload = JSON.parse(new TextDecoder().decode(unb64url(payloadB64)))
  } catch {
    throw new Error("mint_link token payload is invalid")
  }
  if (payload.v !== 1 || !payload.jti || !payload.aud || !Number.isFinite(payload.exp)) {
    throw new Error("mint_link token payload is invalid")
  }
  if (payload.aud !== projectId) throw new Error("mint_link token audience mismatch")
  if (payload.exp <= now) throw new Error("mint_link token expired")
  return payload
}

async function consumeAutosimMintToken(token: string, projectId: string, now = Date.now()): Promise<MintTokenPayload> {
  const payload = await validateAutosimMintToken(token, projectId, now)
  for (const [jti, exp] of usedMintJtis) if (exp <= now) usedMintJtis.delete(jti)
  if (usedMintJtis.has(payload.jti)) throw new Error("mint_link token replayed")
  usedMintJtis.set(payload.jti, payload.exp)
  return payload
}

function assertPublicMintOrigin(base: URL): void {
  if (process.env.KLAV_ALLOW_PRIVATE_MINT_LINKS === "1") return
  const host = base.hostname.toLowerCase().replace(/^\[|\]$/g, "")
  if (
    host === "localhost" ||
    host === "::1" ||
    host.startsWith("127.") ||
    host.startsWith("10.") ||
    host.startsWith("169.254.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    /^f[cd][0-9a-f]{2}:/i.test(host) ||
    /^fe80:/i.test(host)
  ) {
    throw new Error("mint_link base URL must not use a private, loopback, or link-local origin")
  }
}

function looksLikeAuthGate(snapshot: string): boolean {
  const s = snapshot.toLowerCase()
  return /\b(password|otp|one[- ]?time|verification code|sign in|log in|login)\b/.test(s)
}

async function verifySessionEstablished(page: MintablePage, baseUrl: string): Promise<boolean> {
  const afterMint = page.url()
  try {
    if (new URL(afterMint).pathname === "/test-login") return false
  } catch {}
  await page.goto(baseUrl, 20_000)
  await page.waitMs(250)
  if (typeof page.krefSnapshot === "function") {
    const snap = await page.krefSnapshot(4_000).catch(() => "")
    if (snap && looksLikeAuthGate(snap)) return false
  }
  return true
}

export function _resetAutosimMintReplayForTests(): void {
  usedMintJtis.clear()
}

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
    const token = new URL(url).searchParams.get("token") || ""
    await consumeAutosimMintToken(token, cfg.projectId)
    await page.goto(url, 20_000)
    await page.waitMs(500)
    return { established: await verifySessionEstablished(page, baseUrl), method: "mint_link" }
  } catch (e: any) {
    console.warn(`[autosim-auth] mint-link session establishment failed: ${e?.message || e}`)
    return { established: false, method: "mint_link" }
  }
}
