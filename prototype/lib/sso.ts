// Enterprise SSO — OIDC authorization-code flow (SAML is a follow-up, KLAVITYKLA-9).
//
// All outbound fetches to IdP endpoints are SSRF-guarded via assertSafeUrl (url-guard.ts)
// by default. The `deps` object on every public function makes the guard injectable so
// hermetic tests can skip DNS lookups while still exercising all business logic.
//
// JWT verification covers RS256 and ES256; unsupported algorithms are rejected.

import { assertSafeUrl } from "./url-guard"
import { resolveTxt } from "node:dns/promises"

export type OidcDiscovery = {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  jwks_uri: string
  userinfo_endpoint?: string
}

export type OidcClaims = {
  email: string
  sub: string
  name?: string
  email_verified?: boolean
}

// Injectable dependencies — swap in tests to skip DNS and network.
export interface SsoDeps {
  fetch?: typeof fetch
  // Called with every outbound URL before it is fetched. Default: assertSafeUrl.
  // Pass `async () => {}` in hermetic tests to skip real DNS.
  guardUrl?: (url: string) => Promise<void>
  // DNS TXT resolver used by domain-ownership verification. Default: node:dns resolveTxt.
  resolveTxt?: (host: string) => Promise<string[][]>
}

const defaultGuardUrl = async (url: string): Promise<void> => {
  await assertSafeUrl(url)
}

// ── Domain ownership (KLAVITYKLA-9 security fix) ─────────────────────────────
//
// THE ATTACK THIS PREVENTS: the SSO config used to accept ANY syntactically valid
// allowedDomain. Because the callback mints a GLOBAL, email-keyed session for whatever
// email the (account-controlled) IdP asserts, an attacker could point their own IdP at
// allowedDomain=victim.com, assert email=ceo@victim.com, and log in as that user
// everywhere in Klavity. Setting allowedDomain=gmail.com generalised it to every Gmail
// user. A domain is therefore only honoured once the account has PROVEN it owns it, via
// a DNS TXT record, and public mailbox providers are never eligible at all.

// Public/consumer email providers. Nobody can legitimately own SSO for these, and allowing
// one would hand the holder a session as every user with an address there.
export const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "fastmail.com",
  "tutanota.com",
  "tuta.io",
  "hey.com",
  "qq.com",
  "163.com",
  "126.com",
])

export function isPublicEmailDomain(domain: string): boolean {
  return PUBLIC_EMAIL_DOMAINS.has(domain.trim().toLowerCase())
}

/**
 * Syntactic + policy validation for an SSO allowedDomain. Returns null when acceptable,
 * otherwise a client-safe reason string.
 *
 * Note this is necessary but NOT sufficient — the domain must additionally be proven via
 * verifyDomainOwnership() before any login is allowed against it.
 */
export function validateSsoDomain(raw: string): string | null {
  const domain = raw.trim().toLowerCase()
  if (!domain) return "allowedDomain is required"
  if (domain.length > 253) return "allowedDomain is too long"
  // Labels: alphanumeric + hyphens, no leading/trailing hyphen; at least one dot (a bare TLD
  // or a single label like "localhost" is never a valid email domain to federate).
  if (!/^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain))
    return "allowedDomain must be a valid domain name (e.g. acme.com)"
  if (isPublicEmailDomain(domain))
    return "Public email providers cannot be used for SSO — use a domain your organisation owns"
  return null
}

/** The DNS TXT record name an account must publish to prove it owns `domain`. */
export const SSO_DOMAIN_TXT_PREFIX = "klavity-sso-verify"

export function ssoDomainTxtValue(verifyToken: string): string {
  return `${SSO_DOMAIN_TXT_PREFIX}=${verifyToken}`
}

/**
 * Proves the account controls DNS for `domain` by looking for a
 * `klavity-sso-verify=<token>` TXT record on it (or on the _klavity subdomain).
 *
 * Returns true only on an exact token match. Any DNS failure returns false — this must
 * fail CLOSED, since a false positive is a full account-takeover primitive.
 */
export async function verifyDomainOwnership(
  domain: string,
  verifyToken: string,
  deps: SsoDeps = {},
): Promise<boolean> {
  if (validateSsoDomain(domain) !== null) return false
  if (!verifyToken || verifyToken.length < 16) return false
  const resolver = deps.resolveTxt ?? resolveTxt
  const expected = ssoDomainTxtValue(verifyToken)
  const hosts = [domain.trim().toLowerCase(), `_klavity.${domain.trim().toLowerCase()}`]
  for (const host of hosts) {
    let records: string[][]
    try {
      records = await resolver(host)
    } catch {
      continue // NXDOMAIN / SERVFAIL on one candidate: try the next, never pass.
    }
    // A TXT record can be chunked into multiple strings; join per-record before comparing.
    for (const chunks of records ?? []) {
      if ((Array.isArray(chunks) ? chunks.join("") : String(chunks)).trim() === expected) return true
    }
  }
  return false
}

// ── Discovery ────────────────────────────────────────────────────────────────

export async function fetchOidcDiscovery(
  issuer: string,
  deps: SsoDeps = {},
): Promise<OidcDiscovery> {
  const fetcher = deps.fetch ?? fetch
  const guard = deps.guardUrl ?? defaultGuardUrl

  await guard(issuer)
  const base = issuer.replace(/\/+$/, "")
  const discoveryUrl = `${base}/.well-known/openid-configuration`
  await guard(discoveryUrl)

  const res = await fetcher(discoveryUrl, {
    headers: { Accept: "application/json" },
    redirect: "manual",
  })
  if (!res.ok) throw new Error(`OIDC discovery fetch failed: HTTP ${res.status}`)
  const doc = (await res.json()) as OidcDiscovery

  if (!doc.authorization_endpoint || !doc.token_endpoint || !doc.jwks_uri) {
    throw new Error("OIDC discovery doc is missing required fields")
  }
  // The discovery doc must self-identify as the issuer we asked for (OIDC Discovery §4.3).
  // Without this a redirect/mis-hosted document could hand us endpoints for a different IdP
  // while we go on validating id_tokens against the configured issuer string.
  const normalize = (s: string) => s.replace(/\/+$/, "")
  if (normalize(String(doc.issuer ?? "")) !== normalize(issuer)) {
    throw new Error(`OIDC discovery issuer mismatch: expected ${issuer}, got ${doc.issuer}`)
  }
  // Validate all IdP endpoint URLs before we ever use them.
  await guard(doc.authorization_endpoint)
  await guard(doc.token_endpoint)
  await guard(doc.jwks_uri)

  return doc
}

// ── Authorization URL ────────────────────────────────────────────────────────

export function buildAuthorizationUrl(params: {
  authorizationEndpoint: string
  clientId: string
  redirectUri: string
  state: string
  nonce: string
}): string {
  const url = new URL(params.authorizationEndpoint)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("client_id", params.clientId)
  url.searchParams.set("redirect_uri", params.redirectUri)
  url.searchParams.set("scope", "openid email profile")
  url.searchParams.set("state", params.state)
  url.searchParams.set("nonce", params.nonce)
  return url.toString()
}

// ── Code exchange ────────────────────────────────────────────────────────────

export async function exchangeCode(
  params: {
    tokenEndpoint: string
    clientId: string
    clientSecret: string
    code: string
    redirectUri: string
  },
  deps: SsoDeps = {},
): Promise<{ idToken: string; accessToken: string }> {
  const fetcher = deps.fetch ?? fetch
  const guard = deps.guardUrl ?? defaultGuardUrl

  await guard(params.tokenEndpoint)
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    client_secret: params.clientSecret,
  })
  const res = await fetcher(params.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: body.toString(),
    redirect: "manual",
  })
  if (!res.ok) throw new Error(`Token exchange failed: HTTP ${res.status}`)
  const data = (await res.json()) as any
  if (!data.id_token) throw new Error("Token response is missing id_token")
  return { idToken: String(data.id_token), accessToken: String(data.access_token ?? "") }
}

// ── JWT verification ─────────────────────────────────────────────────────────

function base64UrlDecode(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = (4 - (padded.length % 4)) % 4
  const b64 = padded + "=".repeat(padLength)
  const binary = atob(b64)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

function parseJwt(jwt: string): {
  header: any
  payload: any
  signature: Uint8Array
  signingInput: string
} {
  const parts = jwt.split(".")
  if (parts.length !== 3) throw new Error("Invalid JWT: expected 3 parts")
  const dec = (s: string) => JSON.parse(new TextDecoder().decode(base64UrlDecode(s)))
  return {
    header: dec(parts[0]),
    payload: dec(parts[1]),
    signature: base64UrlDecode(parts[2]),
    signingInput: `${parts[0]}.${parts[1]}`,
  }
}

async function importPublicKey(jwk: any, alg: string): Promise<CryptoKey> {
  if (alg === "RS256") {
    return crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    )
  }
  if (alg === "ES256") {
    return crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    )
  }
  throw new Error(`Unsupported JWT algorithm: ${alg}`)
}

export async function verifyIdToken(
  params: {
    idToken: string
    jwksUri: string
    issuer: string
    clientId: string
    nonce: string
    // Allow a small clock skew (default 60s) for iat checks.
    clockSkewSec?: number
    // Require the IdP to assert email_verified === true. Defaults to true — an unverified
    // email is attacker-choosable at most IdPs, so trusting it as an identity is a bypass.
    requireEmailVerified?: boolean
  },
  deps: SsoDeps = {},
): Promise<OidcClaims> {
  const fetcher = deps.fetch ?? fetch
  const guard = deps.guardUrl ?? defaultGuardUrl

  const { header, payload, signature, signingInput } = parseJwt(params.idToken)
  const now = Math.floor(Date.now() / 1000)
  const skew = params.clockSkewSec ?? 60

  // ── Standard claims ──
  if (payload.iss !== params.issuer)
    throw new Error(`id_token issuer mismatch: expected ${params.issuer}, got ${payload.iss}`)
  const aud: string[] = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
  if (!aud.includes(params.clientId))
    throw new Error("id_token audience does not include this client_id")
  // exp is REQUIRED. Previously it was only checked when present, so a token that simply
  // omitted the claim never expired — a stolen id_token would have been valid forever.
  if (typeof payload.exp !== "number")
    throw new Error("id_token missing required 'exp' claim")
  if (payload.exp < now - skew)
    throw new Error("id_token has expired")
  if (payload.iat && payload.iat > now + skew)
    throw new Error("id_token issued in the future")
  if (params.nonce && payload.nonce !== params.nonce)
    throw new Error("id_token nonce mismatch")
  if (!payload.sub) throw new Error("id_token missing required 'sub' claim")
  if (!payload.email) throw new Error("id_token missing required 'email' claim")
  // email_verified must be explicitly true. An IdP that lets a user self-assert an
  // unverified address would otherwise let them claim any colleague's mailbox.
  if ((params.requireEmailVerified ?? true) && payload.email_verified !== true)
    throw new Error("id_token email_verified is not true")

  // ── Fetch JWKS and verify signature ──
  await guard(params.jwksUri)
  const jwksRes = await fetcher(params.jwksUri, {
    headers: { Accept: "application/json" },
    redirect: "manual",
  })
  if (!jwksRes.ok) throw new Error(`JWKS fetch failed: HTTP ${jwksRes.status}`)
  const jwks = (await jwksRes.json()) as { keys: any[] }

  const alg: string = header.alg ?? "RS256"
  const kid: string | undefined = header.kid
  const keys: any[] = jwks.keys ?? []
  const matchingKey = kid
    ? keys.find((k) => k.kid === kid)
    : keys.find((k) => k.use === "sig" || !k.use)
  if (!matchingKey) throw new Error("No matching public key found in JWKS")

  const cryptoKey = await importPublicKey(matchingKey, alg)
  const signingBytes = new TextEncoder().encode(signingInput)
  const verifyAlg: AlgorithmIdentifier | EcdsaParams =
    alg === "ES256" ? { name: "ECDSA", hash: "SHA-256" } : { name: "RSASSA-PKCS1-v1_5" }
  const valid = await crypto.subtle.verify(verifyAlg, cryptoKey, signature, signingBytes)
  if (!valid) throw new Error("id_token signature verification failed")

  return {
    email: String(payload.email).toLowerCase(),
    sub: String(payload.sub),
    name: payload.name ?? payload.given_name ?? undefined,
    email_verified: payload.email_verified ?? undefined,
  }
}
