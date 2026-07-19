// Hermetic tests for prototype/lib/sso.ts — no network, no DB.
// Uses a locally generated RSA key pair to sign/verify JWTs end-to-end.
// DNS/network is bypassed via the injectable `deps.guardUrl` (noop) + `deps.fetch` (mock).

import { test, expect, beforeAll } from "bun:test"
import {
  fetchOidcDiscovery,
  buildAuthorizationUrl,
  exchangeCode,
  verifyIdToken,
  type OidcDiscovery,
  type SsoDeps,
} from "./sso"

// ── RSA key pair (generated once for the whole suite) ────────────────────────

let rsaKeyPair: CryptoKeyPair
let rsaPublicJwk: JsonWebKey

beforeAll(async () => {
  rsaKeyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  )
  rsaPublicJwk = await crypto.subtle.exportKey("jwk", rsaKeyPair.publicKey)
  rsaPublicJwk.use = "sig"
  rsaPublicJwk.kid = "test-key-1"
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function b64url(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

async function signRs256Jwt(payload: Record<string, unknown>, kid = "test-key-1"): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT", kid }))
  const body = b64url(JSON.stringify(payload))
  const signingInput = `${header}.${body}`
  const sigBytes = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    rsaKeyPair.privateKey,
    new TextEncoder().encode(signingInput),
  )
  return `${signingInput}.${b64url(new Uint8Array(sigBytes))}`
}

const ISSUER = "https://sso.acme.example"
const CLIENT_ID = "klavity-test-client"

// No-op URL guard for hermetic tests — skips real DNS lookups.
const noopGuard = async (_url: string): Promise<void> => {}

// ── Mock fetcher factory ─────────────────────────────────────────────────────

function makeDeps(opts: {
  discoveryOverride?: Partial<OidcDiscovery>
  jwksOverride?: { keys: JsonWebKey[] }
  tokenResponseOverride?: Record<string, unknown>
  failDiscovery?: boolean
  failJwks?: boolean
  failToken?: boolean
}): SsoDeps {
  const fetcher: typeof fetch = async (input, _init) => {
    const urlStr = String(input)

    if (urlStr.includes("/.well-known/openid-configuration")) {
      if (opts.failDiscovery) return new Response("Internal Error", { status: 500 })
      const doc: OidcDiscovery = {
        issuer: ISSUER,
        authorization_endpoint: `${ISSUER}/authorize`,
        token_endpoint: `${ISSUER}/token`,
        jwks_uri: `${ISSUER}/.well-known/jwks.json`,
        ...opts.discoveryOverride,
      }
      return new Response(JSON.stringify(doc), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (urlStr.includes("/jwks.json")) {
      if (opts.failJwks) return new Response("Not Found", { status: 404 })
      const jwks = opts.jwksOverride ?? { keys: [rsaPublicJwk] }
      return new Response(JSON.stringify(jwks), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (urlStr.includes("/token")) {
      if (opts.failToken) return new Response("Unauthorized", { status: 401 })
      const body = opts.tokenResponseOverride ?? {
        access_token: "access-abc",
        token_type: "Bearer",
      }
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response("Not Found", { status: 404 })
  }
  return { fetch: fetcher, guardUrl: noopGuard }
}

// ── Discovery tests ──────────────────────────────────────────────────────────

test("fetchOidcDiscovery: returns parsed discovery doc from mock IdP", async () => {
  const doc = await fetchOidcDiscovery(ISSUER, makeDeps({}))
  expect(doc.issuer).toBe(ISSUER)
  expect(doc.authorization_endpoint).toBe(`${ISSUER}/authorize`)
  expect(doc.token_endpoint).toBe(`${ISSUER}/token`)
  expect(doc.jwks_uri).toBe(`${ISSUER}/.well-known/jwks.json`)
})

test("fetchOidcDiscovery: throws on HTTP error", async () => {
  await expect(
    fetchOidcDiscovery(ISSUER, makeDeps({ failDiscovery: true })),
  ).rejects.toThrow(/OIDC discovery fetch failed/)
})

test("fetchOidcDiscovery: throws on missing required fields", async () => {
  const deps = makeDeps({
    discoveryOverride: { token_endpoint: undefined as any, jwks_uri: undefined as any },
  })
  await expect(fetchOidcDiscovery(ISSUER, deps)).rejects.toThrow(/missing required fields/)
})

test("fetchOidcDiscovery: blocks non-https issuer (SSRF guard — default guard)", async () => {
  // Use real guard (no override) — http:// must be rejected by assertSafeUrl.
  await expect(fetchOidcDiscovery("http://internal-idp.corp")).rejects.toThrow(
    /https required|blocked scheme/,
  )
})

test("fetchOidcDiscovery: blocks localhost issuer (SSRF guard — default guard)", async () => {
  await expect(fetchOidcDiscovery("https://localhost/realms/test")).rejects.toThrow(
    /blocked host|localhost/,
  )
})

// ── Authorization URL tests ──────────────────────────────────────────────────

test("buildAuthorizationUrl: includes all required OIDC parameters", () => {
  const authUrl = buildAuthorizationUrl({
    authorizationEndpoint: `${ISSUER}/authorize`,
    clientId: CLIENT_ID,
    redirectUri: "https://klavity.in/auth/sso/callback",
    state: "random-state-abc",
    nonce: "random-nonce-xyz",
  })
  const parsed = new URL(authUrl)
  expect(parsed.searchParams.get("response_type")).toBe("code")
  expect(parsed.searchParams.get("client_id")).toBe(CLIENT_ID)
  expect(parsed.searchParams.get("redirect_uri")).toBe("https://klavity.in/auth/sso/callback")
  expect(parsed.searchParams.get("scope")).toContain("openid")
  expect(parsed.searchParams.get("scope")).toContain("email")
  expect(parsed.searchParams.get("state")).toBe("random-state-abc")
  expect(parsed.searchParams.get("nonce")).toBe("random-nonce-xyz")
})

// ── Code exchange tests ──────────────────────────────────────────────────────

test("exchangeCode: returns id_token from mock token endpoint", async () => {
  const jwt = await signRs256Jwt({ sub: "user-1", email: "alice@acme.example" })
  const deps = makeDeps({
    tokenResponseOverride: { id_token: jwt, access_token: "at-abc", token_type: "Bearer" },
  })
  const result = await exchangeCode(
    {
      tokenEndpoint: `${ISSUER}/token`,
      clientId: CLIENT_ID,
      clientSecret: "super-secret",
      code: "auth-code-123",
      redirectUri: "https://klavity.in/auth/sso/callback",
    },
    deps,
  )
  expect(result.idToken).toBe(jwt)
  expect(result.accessToken).toBe("at-abc")
})

test("exchangeCode: throws on token endpoint error", async () => {
  await expect(
    exchangeCode(
      {
        tokenEndpoint: `${ISSUER}/token`,
        clientId: CLIENT_ID,
        clientSecret: "secret",
        code: "bad-code",
        redirectUri: "https://klavity.in/auth/sso/callback",
      },
      makeDeps({ failToken: true }),
    ),
  ).rejects.toThrow(/Token exchange failed/)
})

test("exchangeCode: throws when token response has no id_token", async () => {
  const deps = makeDeps({
    tokenResponseOverride: { access_token: "at-abc", token_type: "Bearer" },
  })
  await expect(
    exchangeCode(
      {
        tokenEndpoint: `${ISSUER}/token`,
        clientId: CLIENT_ID,
        clientSecret: "secret",
        code: "code-123",
        redirectUri: "https://klavity.in/auth/sso/callback",
      },
      deps,
    ),
  ).rejects.toThrow(/missing id_token/)
})

// ── ID token verification tests ──────────────────────────────────────────────

async function validJwt(overrides: Record<string, unknown> = {}): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return signRs256Jwt({
    iss: ISSUER,
    sub: "user-42",
    aud: CLIENT_ID,
    iat: now,
    exp: now + 3600,
    nonce: "my-nonce",
    email: "alice@acme.example",
    email_verified: true,
    name: "Alice Test",
    ...overrides,
  })
}

test("verifyIdToken: accepts a valid RS256 id_token signed with known key", async () => {
  const jwt = await validJwt()
  const claims = await verifyIdToken(
    {
      idToken: jwt,
      jwksUri: `${ISSUER}/.well-known/jwks.json`,
      issuer: ISSUER,
      clientId: CLIENT_ID,
      nonce: "my-nonce",
    },
    makeDeps({}),
  )
  expect(claims.email).toBe("alice@acme.example")
  expect(claims.sub).toBe("user-42")
  expect(claims.name).toBe("Alice Test")
  expect(claims.email_verified).toBe(true)
})

test("verifyIdToken: normalizes email to lowercase", async () => {
  const jwt = await validJwt({ email: "Alice@ACME.EXAMPLE" })
  const claims = await verifyIdToken(
    { idToken: jwt, jwksUri: `${ISSUER}/.well-known/jwks.json`, issuer: ISSUER, clientId: CLIENT_ID, nonce: "my-nonce" },
    makeDeps({}),
  )
  expect(claims.email).toBe("alice@acme.example")
})

test("verifyIdToken: rejects wrong issuer", async () => {
  const jwt = await validJwt({ iss: "https://evil.com" })
  await expect(
    verifyIdToken(
      { idToken: jwt, jwksUri: `${ISSUER}/.well-known/jwks.json`, issuer: ISSUER, clientId: CLIENT_ID, nonce: "my-nonce" },
      makeDeps({}),
    ),
  ).rejects.toThrow(/issuer mismatch/)
})

test("verifyIdToken: rejects wrong audience", async () => {
  const jwt = await validJwt({ aud: "other-client" })
  await expect(
    verifyIdToken(
      { idToken: jwt, jwksUri: `${ISSUER}/.well-known/jwks.json`, issuer: ISSUER, clientId: CLIENT_ID, nonce: "my-nonce" },
      makeDeps({}),
    ),
  ).rejects.toThrow(/audience/)
})

test("verifyIdToken: rejects expired token", async () => {
  const past = Math.floor(Date.now() / 1000) - 7200
  const jwt = await validJwt({ exp: past - 100, iat: past - 3600 })
  await expect(
    verifyIdToken(
      { idToken: jwt, jwksUri: `${ISSUER}/.well-known/jwks.json`, issuer: ISSUER, clientId: CLIENT_ID, nonce: "my-nonce" },
      makeDeps({}),
    ),
  ).rejects.toThrow(/expired/)
})

test("verifyIdToken: rejects nonce mismatch", async () => {
  const jwt = await validJwt({ nonce: "different-nonce" })
  await expect(
    verifyIdToken(
      { idToken: jwt, jwksUri: `${ISSUER}/.well-known/jwks.json`, issuer: ISSUER, clientId: CLIENT_ID, nonce: "my-nonce" },
      makeDeps({}),
    ),
  ).rejects.toThrow(/nonce mismatch/)
})

test("verifyIdToken: rejects missing email claim", async () => {
  const jwt = await validJwt({ email: undefined })
  await expect(
    verifyIdToken(
      { idToken: jwt, jwksUri: `${ISSUER}/.well-known/jwks.json`, issuer: ISSUER, clientId: CLIENT_ID, nonce: "my-nonce" },
      makeDeps({}),
    ),
  ).rejects.toThrow(/missing required 'email' claim/)
})

test("verifyIdToken: rejects a tampered token (bad signature)", async () => {
  const jwt = await validJwt()
  const parts = jwt.split(".")
  // Flip one char in the payload
  const tamperedPayload = parts[1].slice(0, -1) + (parts[1].at(-1) === "A" ? "B" : "A")
  const tampered = `${parts[0]}.${tamperedPayload}.${parts[2]}`
  // A tampered payload may fail as bad JSON, wrong claims, or invalid signature —
  // all are acceptable rejections; the important thing is that it does throw.
  await expect(
    verifyIdToken(
      { idToken: tampered, jwksUri: `${ISSUER}/.well-known/jwks.json`, issuer: ISSUER, clientId: CLIENT_ID, nonce: "my-nonce" },
      makeDeps({}),
    ),
  ).rejects.toThrow()
})

test("verifyIdToken: rejects when no matching key in JWKS", async () => {
  const jwt = await validJwt()
  await expect(
    verifyIdToken(
      { idToken: jwt, jwksUri: `${ISSUER}/.well-known/jwks.json`, issuer: ISSUER, clientId: CLIENT_ID, nonce: "my-nonce" },
      makeDeps({ jwksOverride: { keys: [] } }),
    ),
  ).rejects.toThrow(/No matching public key/)
})

test("verifyIdToken: rejects when JWKS endpoint fails", async () => {
  const jwt = await validJwt()
  await expect(
    verifyIdToken(
      { idToken: jwt, jwksUri: `${ISSUER}/.well-known/jwks.json`, issuer: ISSUER, clientId: CLIENT_ID, nonce: "my-nonce" },
      makeDeps({ failJwks: true }),
    ),
  ).rejects.toThrow(/JWKS fetch failed/)
})

test("verifyIdToken: accepts array audience containing client_id", async () => {
  const jwt = await validJwt({ aud: [CLIENT_ID, "other-client"] })
  const claims = await verifyIdToken(
    { idToken: jwt, jwksUri: `${ISSUER}/.well-known/jwks.json`, issuer: ISSUER, clientId: CLIENT_ID, nonce: "my-nonce" },
    makeDeps({}),
  )
  expect(claims.email).toBe("alice@acme.example")
})
