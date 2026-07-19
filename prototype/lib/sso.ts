// Enterprise SSO — OIDC authorization-code flow (SAML is a follow-up, KLAVITYKLA-9).
//
// All outbound fetches to IdP endpoints are SSRF-guarded via assertSafeUrl (url-guard.ts)
// by default. The `deps` object on every public function makes the guard injectable so
// hermetic tests can skip DNS lookups while still exercising all business logic.
//
// JWT verification covers RS256 and ES256; unsupported algorithms are rejected.

import { assertSafeUrl } from "./url-guard"

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
}

const defaultGuardUrl = async (url: string): Promise<void> => {
  await assertSafeUrl(url)
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
  if (payload.exp && payload.exp < now - skew)
    throw new Error("id_token has expired")
  if (payload.iat && payload.iat > now + skew)
    throw new Error("id_token issued in the future")
  if (params.nonce && payload.nonce !== params.nonce)
    throw new Error("id_token nonce mismatch")
  if (!payload.sub) throw new Error("id_token missing required 'sub' claim")
  if (!payload.email) throw new Error("id_token missing required 'email' claim")

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
