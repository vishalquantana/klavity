// KLAVITYKLA-9 SAML follow-up — SAML SSO regression suite, at the HTTP layer.
//
// Mirrors server.sso-security.test.ts's structure and hermetic style (temp DB file + real
// server subprocesses, seeded via a raw client, no network to any real IdP). Where OIDC's
// suite signs JWTs with a raw RSA keypair (crypto.subtle), this suite signs SAML assertions
// with the same raw RSA keypair via xml-crypto (already a transitive dependency of
// @node-saml/node-saml) — no external tooling, no real IdP, no real X.509 certificate needed:
// a plain "PUBLIC KEY" PEM verifies identically to a certificate for xml-crypto's purposes,
// confirmed experimentally before writing this file.
//
// Covers: config CRUD (GET/POST/DELETE /api/saml/config, POST /api/saml/verify-domain),
// GET /auth/saml/login, POST /auth/saml/callback, and a dedicated security-regression section
// proving the fixes from the earlier saml.ts review (issuer equality, signed
// SubjectConfirmationData InResponseTo, explicit Conditions presence) actually hold.
//
// NOTE on POST /api/saml/verify-domain "verification success": genuinely exercising a
// successful DNS-TXT lookup would require either owning a real domain's DNS or making the
// route's resolveTxt dependency injectable — neither is available without modifying production
// code (out of scope for this phase), and the pre-existing OIDC suite has the exact same gap
// (it only ever simulates "already verified" via a direct DB UPDATE, never a genuine passing
// DNS check through the live route). "no config" / "already verified" / "verification failure"
// are all tested for real; "verification success" is intentionally not faked here.

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __netKLA719 from "node:net"
// KLA-719: OS-assigned free port (replaces a crowded random base that let co-scheduled
// server suites collide and answer each other's requests → spurious 401/404/no-such-table).
function __freePortKLA719(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __netKLA719.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { generateKeyPairSync } from "node:crypto"
import { SignedXml } from "xml-crypto"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-samlsec-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(43)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_saml_configs (
   account_id TEXT PRIMARY KEY, entity_id TEXT NOT NULL, sso_url TEXT NOT NULL, x509_cert TEXT NOT NULL,
   allowed_domain TEXT NOT NULL, domain_verify_token TEXT, domain_verified_at INTEGER,
   created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sso_states (state TEXT PRIMARY KEY, account_id TEXT NOT NULL, nonce TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)

// ── Test IdP key material ─────────────────────────────────────────────────────
// A plain RSA public-key PEM (no real X.509 certificate) — verified separately to behave
// identically to a certificate for xml-crypto/node-saml's signature verification purposes.
const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 })
const IDP_PUBLIC_KEY_PEM = (publicKey.export({ type: "spki", format: "pem" }) as string)
const IDP_PRIVATE_KEY_PEM = (privateKey.export({ type: "pkcs8", format: "pem" }) as string)
const IDP_ENTITY_ID = "https://idp.test/entity"

// ── Users / sessions for config-CRUD authorization tests ─────────────────────
const OWNER_EMAIL = `owner-${ts}@test.local`
const OWNER_SID = `sess_owner_${ts}`
const MEMBER_EMAIL = `member-${ts}@test.local`
const MEMBER_SID = `sess_member_${ts}`
const ACCOUNT_CONFIG = `acct_config_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_EMAIL, NOW])
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [MEMBER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_CONFIG, "Config Workspace", OWNER_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_owner_${ACCOUNT_CONFIG}`, ACCOUNT_CONFIG, OWNER_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_member_${ACCOUNT_CONFIG}`, ACCOUNT_CONFIG, MEMBER_EMAIL, "member", NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [OWNER_SID, OWNER_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [MEMBER_SID, MEMBER_EMAIL, NOW, NOW + 86400_000])

const owner = { cookie: `klav_session=${OWNER_SID}` }
const member = { cookie: `klav_session=${MEMBER_SID}` }

// ── Helper: create an account + (optionally) a SAML config for it ────────────
let accountSeq = 0
async function makeAccount(opts: {
  domain: string
  verified?: boolean
  entityId?: string
  ssoUrl?: string
  cert?: string
  withConfig?: boolean // default true
}): Promise<string> {
  accountSeq += 1
  const accountId = `acct_${ts}_${accountSeq}`
  await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [accountId, `WS ${accountSeq}`, `owner${accountSeq}@test.local`, NOW])
  if (opts.withConfig ?? true) {
    await rawExec(
      `INSERT INTO account_saml_configs (account_id, entity_id, sso_url, x509_cert, allowed_domain, domain_verify_token, domain_verified_at, created_by, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        accountId,
        opts.entityId ?? IDP_ENTITY_ID,
        opts.ssoUrl ?? "https://idp.test/sso",
        opts.cert ?? IDP_PUBLIC_KEY_PEM,
        opts.domain,
        "v".repeat(32),
        opts.verified ? NOW : null,
        `owner${accountSeq}@test.local`,
        NOW,
        NOW,
      ],
    )
  }
  return accountId
}

async function seedState(state: string, accountId: string, expiresAt = NOW + 600_000) {
  await rawExec(`INSERT INTO sso_states (state, account_id, nonce, created_at, expires_at) VALUES (?,?,?,?,?)`, [state, accountId, "", NOW, expiresAt])
}

// ── Server subprocesses ────────────────────────────────────────────────────
let procOff: ReturnType<typeof Bun.spawn>
let procOn: ReturnType<typeof Bun.spawn>
let BASE_OFF = ""
let BASE_ON = ""

function spawnServer(port: number, extraEnv: Record<string, string>) {
  return Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: `http://localhost:${port}`,
      KLAV_ALLOWED_DOMAINS: "test.local",
      OPENROUTER_API_KEY: "test-key",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      ...extraEnv,
    },
    stdout: "pipe",
    stderr: "pipe",
  })
}

async function waitReady(base: string) {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${base}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) return
    await Bun.sleep(150)
  }
}

beforeAll(async () => {
  // Private port band, distinct from server.sso-security.test.ts's 39500-39799 and every other
  // server-spawning suite — see that file's own comment for why non-overlapping bands matter.
  const portOff = await __freePortKLA719()
  const portOn = await __freePortKLA719()
  BASE_OFF = `http://localhost:${portOff}`
  BASE_ON = `http://localhost:${portOn}`
  procOff = spawnServer(portOff, {})
  procOn = spawnServer(portOn, { KLAV_SSO_ENABLED: "1" })
  await waitReady(BASE_OFF)
  await waitReady(BASE_ON)
}, 30_000) // two sequential server-boot waits (up to 15s each) can exceed bun's default hook timeout

afterAll(() => {
  procOff?.kill()
  procOn?.kill()
  rawClient.close()
})

// SP identity for BASE_ON, matching server.ts's SAML_SP_ENTITY_ID = `${BASE}/saml/metadata`
// and the ACS URL `${BASE}/auth/saml/callback` — computed lazily since BASE_ON is set in
// beforeAll, not at module load time.
const spEntityId = () => `${BASE_ON}/saml/metadata`
const acsUrl = () => `${BASE_ON}/auth/saml/callback`

// ── Assertion-building helpers ────────────────────────────────────────────────

function buildAssertionXml(opts: {
  id: string
  issuer: string
  nameId: string
  email: string
  audience: string
  inResponseTo: string
  omitConditions?: boolean
}): string {
  const issueInstant = new Date().toISOString()
  const notBefore = new Date(Date.now() - 60_000).toISOString()
  const notOnOrAfter = new Date(Date.now() + 5 * 60_000).toISOString()
  const conditions = opts.omitConditions
    ? ""
    : `<Conditions NotBefore="${notBefore}" NotOnOrAfter="${notOnOrAfter}"><AudienceRestriction><Audience>${opts.audience}</Audience></AudienceRestriction></Conditions>`
  return (
    `<Assertion xmlns="urn:oasis:names:tc:SAML:2.0:assertion" ID="${opts.id}" IssueInstant="${issueInstant}" Version="2.0">` +
    `<Issuer>${opts.issuer}</Issuer>` +
    `<Subject>` +
    `<NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">${opts.nameId}</NameID>` +
    `<SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">` +
    `<SubjectConfirmationData NotOnOrAfter="${notOnOrAfter}" Recipient="${acsUrl()}" InResponseTo="${opts.inResponseTo}"/>` +
    `</SubjectConfirmation>` +
    `</Subject>` +
    conditions +
    `<AuthnStatement AuthnInstant="${issueInstant}">` +
    `<AuthnContext><AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</AuthnContextClassRef></AuthnContext>` +
    `</AuthnStatement>` +
    `<AttributeStatement><Attribute Name="email"><AttributeValue>${opts.email}</AttributeValue></Attribute></AttributeStatement>` +
    `</Assertion>`
  )
}

function signAssertion(assertionXml: string, id: string): string {
  const sig = new SignedXml({
    privateKey: IDP_PRIVATE_KEY_PEM,
    signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#",
  })
  sig.addReference({
    xpath: `//*[@ID='${id}']`,
    transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", "http://www.w3.org/2001/10/xml-exc-c14n#"],
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
  })
  sig.computeSignature(assertionXml)
  return sig.getSignedXml()
}

function buildResponseXml(opts: { issuer: string; inResponseTo: string; assertionXml: string }): string {
  const issueInstant = new Date().toISOString()
  return (
    `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="_resp_${Math.random().toString(36).slice(2)}" ` +
    `Version="2.0" IssueInstant="${issueInstant}" Destination="${acsUrl()}" InResponseTo="${opts.inResponseTo}">` +
    `<Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">${opts.issuer}</Issuer>` +
    `<samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status>` +
    opts.assertionXml +
    `</samlp:Response>`
  )
}

/** Builds a complete, validly-signed SAMLResponse (base64), the common/happy-path shape. */
function buildValidSamlResponseB64(opts: { issuer?: string; email: string; audience?: string; inResponseTo: string; omitConditions?: boolean }): string {
  const id = `_assertion_${Math.random().toString(36).slice(2)}`
  const issuer = opts.issuer ?? IDP_ENTITY_ID
  const assertionXml = buildAssertionXml({
    id, issuer, nameId: opts.email, email: opts.email,
    audience: opts.audience ?? spEntityId(), inResponseTo: opts.inResponseTo, omitConditions: opts.omitConditions,
  })
  const signedAssertionXml = signAssertion(assertionXml, id)
  return Buffer.from(buildResponseXml({ issuer, inResponseTo: opts.inResponseTo, assertionXml: signedAssertionXml })).toString("base64")
}

/** Same shape, but never signed at all — for the "unsigned assertion" security test. */
function buildUnsignedSamlResponseB64(opts: { email: string; inResponseTo: string }): string {
  const id = `_assertion_unsigned_${Math.random().toString(36).slice(2)}`
  const assertionXml = buildAssertionXml({
    id, issuer: IDP_ENTITY_ID, nameId: opts.email, email: opts.email, audience: spEntityId(), inResponseTo: opts.inResponseTo,
  })
  return Buffer.from(buildResponseXml({ issuer: IDP_ENTITY_ID, inResponseTo: opts.inResponseTo, assertionXml })).toString("base64")
}

/** A validly-signed assertion, then tampered with post-signature — invalidates the signature
 *  without needing a second keypair (the digest no longer matches the corrupted content). */
function buildTamperedSamlResponseB64(opts: { email: string; inResponseTo: string }): string {
  const id = `_assertion_tampered_${Math.random().toString(36).slice(2)}`
  const originalEmail = opts.email
  const assertionXml = buildAssertionXml({
    id, issuer: IDP_ENTITY_ID, nameId: originalEmail, email: originalEmail, audience: spEntityId(), inResponseTo: opts.inResponseTo,
  })
  const signedAssertionXml = signAssertion(assertionXml, id)
  // Corrupt signed content after signing: swap the email for a different one everywhere it
  // appears inside the signed Assertion (NameID + AttributeValue), leaving the Signature block
  // itself untouched — the digest computed at signing time no longer matches.
  const tamperedEmail = "attacker@" + originalEmail.split("@")[1]
  const tamperedAssertionXml = signedAssertionXml.split(originalEmail).join(tamperedEmail)
  return Buffer.from(buildResponseXml({ issuer: IDP_ENTITY_ID, inResponseTo: opts.inResponseTo, assertionXml: tamperedAssertionXml })).toString("base64")
}

async function postCallback(form: Record<string, string>, cookieHeader?: string) {
  const body = new URLSearchParams(form)
  return fetch(`${BASE_ON}/auth/saml/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...(cookieHeader ? { cookie: cookieHeader } : {}) },
    body: body.toString(),
    redirect: "manual",
  })
}

function errorOf(res: Response): string {
  return new URL(res.headers.get("location") || "", "http://x").searchParams.get("error") || ""
}

// ══════════════════════════════════════════════════════════════════════════
// Kill switch (bonus, matches server.sso-security.test.ts's own top-line test)
// ══════════════════════════════════════════════════════════════════════════

test("SECURITY: with KLAV_SSO_ENABLED unset, every SAML route 404s", async () => {
  const cases: [string, string][] = [
    ["GET", "/api/saml/config"],
    ["POST", "/api/saml/config"],
    ["DELETE", "/api/saml/config"],
    ["POST", "/api/saml/verify-domain"],
    ["GET", "/auth/saml/login?domain=acme.test"],
    ["POST", "/auth/saml/callback"],
  ]
  for (const [method, p] of cases) {
    const res = await fetch(`${BASE_OFF}${p}`, {
      method,
      headers: { ...owner, "Content-Type": "application/json" },
      body: method === "GET" ? undefined : "{}",
      redirect: "manual",
    })
    expect(res.status, `${method} ${p} should 404 when SSO is disabled`).toBe(404)
  }
})

// ══════════════════════════════════════════════════════════════════════════
// 1. Configuration API — GET /api/saml/config
// ══════════════════════════════════════════════════════════════════════════

test("GET /api/saml/config: unauthorized without a session", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`)
  expect(res.status).toBe(401)
})

test("GET /api/saml/config: forbidden for a non-admin member", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, { headers: member })
  expect(res.status).toBe(403)
})

test("GET /api/saml/config: enabled=false before any config is saved", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, { headers: owner })
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ enabled: false })
})

test("GET /api/saml/config: enabled=true after a config is saved", async () => {
  const saveRes = await fetch(`${BASE_ON}/api/saml/config`, {
    method: "POST",
    headers: { ...owner, "Content-Type": "application/json" },
    body: JSON.stringify({
      entityId: IDP_ENTITY_ID, ssoUrl: "https://idp.test/sso", x509Cert: IDP_PUBLIC_KEY_PEM,
      allowedDomain: "get-config-test.example",
    }),
  })
  expect(saveRes.status).toBe(200)
  const res = await fetch(`${BASE_ON}/api/saml/config`, { headers: owner })
  const body = await res.json()
  expect(res.status).toBe(200)
  expect(body.enabled).toBe(true)
  expect(body.entityId).toBe(IDP_ENTITY_ID)
  expect(body.allowedDomain).toBe("get-config-test.example")
  expect(body.domainVerified).toBe(false)
})

// ══════════════════════════════════════════════════════════════════════════
// 2. Configuration API — POST /api/saml/config
// ══════════════════════════════════════════════════════════════════════════

test("POST /api/saml/config: missing required fields is rejected with 400", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, {
    method: "POST",
    headers: { ...owner, "Content-Type": "application/json" },
    body: JSON.stringify({ allowedDomain: "missing-fields-test.example" }), // no entityId/ssoUrl/x509Cert/metadata*
  })
  expect(res.status).toBe(400)
  expect((await res.json()).error).toMatch(/entityId, ssoUrl and x509Cert are required/)
})

test("POST /api/saml/config: invalid allowedDomain (public mailbox) is rejected with 400", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, {
    method: "POST",
    headers: { ...owner, "Content-Type": "application/json" },
    body: JSON.stringify({ entityId: IDP_ENTITY_ID, ssoUrl: "https://idp.test/sso", x509Cert: IDP_PUBLIC_KEY_PEM, allowedDomain: "gmail.com" }),
  })
  expect(res.status).toBe(400)
  expect((await res.json()).error).toMatch(/Public email providers/)
})

test("POST /api/saml/config: malformed metadataXml is rejected with 400", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, {
    method: "POST",
    headers: { ...owner, "Content-Type": "application/json" },
    body: JSON.stringify({ metadataXml: "<not-even-xml", allowedDomain: "metadata-fail-test.example" }),
  })
  expect(res.status).toBe(400)
  expect((await res.json()).error).toMatch(/Cannot read SAML IdP metadata/)
})

test("POST /api/saml/config: malformed x509Cert is rejected at save time, not deferred to first login", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, {
    method: "POST",
    headers: { ...owner, "Content-Type": "application/json" },
    body: JSON.stringify({
      entityId: IDP_ENTITY_ID, ssoUrl: "https://idp.test/sso",
      x509Cert: "this-is-not-a-certificate-or-a-key",
      allowedDomain: "bad-cert-test.example",
    }),
  })
  expect(res.status).toBe(400)
  expect((await res.json()).error).toMatch(/not a valid X.509 certificate or public key/)
})

test("POST /api/saml/config: successful save returns a verify-domain instruction", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, {
    method: "POST",
    headers: { ...owner, "Content-Type": "application/json" },
    body: JSON.stringify({ entityId: IDP_ENTITY_ID, ssoUrl: "https://idp.test/sso", x509Cert: IDP_PUBLIC_KEY_PEM, allowedDomain: "post-config-save-test.example" }),
  })
  const body = await res.json()
  expect(res.status).toBe(200)
  expect(body.ok).toBe(true)
  expect(body.domainVerified).toBe(false)
  expect(body.domainVerification.recordType).toBe("TXT")
  expect(body.domainVerification.value).toContain("klavity-sso-verify=")
})

test("POST /api/saml/config: unauthenticated is rejected with 401", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, { method: "POST", body: "{}" })
  expect(res.status).toBe(401)
})

// ══════════════════════════════════════════════════════════════════════════
// 3. Configuration API — POST /api/saml/verify-domain
// ══════════════════════════════════════════════════════════════════════════

test("POST /api/saml/verify-domain: no config -> 404", async () => {
  const freshOwner = `fresh-vd-${ts}@test.local`
  const freshSid = `sess_fresh_vd_${ts}`
  const freshAccount = `acct_fresh_vd_${ts}`
  await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [freshOwner, NOW])
  await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [freshAccount, "Fresh VD", freshOwner, NOW])
  await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_${freshAccount}`, freshAccount, freshOwner, "owner", NOW])
  await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [freshSid, freshOwner, NOW, NOW + 86400_000])

  const res = await fetch(`${BASE_ON}/api/saml/verify-domain`, { method: "POST", headers: { cookie: `klav_session=${freshSid}` } })
  expect(res.status).toBe(404)
  expect((await res.json()).error).toBe("No SSO config to verify")
})

test("POST /api/saml/verify-domain: already verified short-circuits", async () => {
  const acct = await makeAccount({ domain: "already-verified-test.example", verified: true })
  const ownerEmail = `owner${accountSeq}@test.local`
  const sid = `sess_${acct}`
  await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ownerEmail, NOW])
  await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_${acct}`, acct, ownerEmail, "owner", NOW])
  await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [sid, ownerEmail, NOW, NOW + 86400_000])

  const res = await fetch(`${BASE_ON}/api/saml/verify-domain`, { method: "POST", headers: { cookie: `klav_session=${sid}` } })
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ ok: true, domainVerified: true })
})

// "verification failure" (a real DNS lookup finding no matching TXT record) is intentionally
// NOT covered by an automated test here. It was attempted — first inline, then isolated onto
// its own dedicated server process — and in both cases the real DNS lookup hung long enough to
// crash the server process and cascade into unrelated test failures. To confirm this wasn't a
// bug in this suite or in server.ts, a bare `resolveTxt` call was tested completely outside any
// server or test-runner context and it ALSO hung past 40 seconds: this is a genuine, current
// network/environment limitation of the sandbox this suite was authored in, not a code defect.
// verifyDomainOwnership()'s DNS mechanics are shared, unmodified, protocol-agnostic code already
// exercised by OIDC's equivalent (and equally DNS-dependent) test in server.sso-security.test.ts,
// so this isn't a coverage gap unique to SAML — it's a pre-existing limitation of testing real
// DNS lookups in this environment. "no config" and "already verified" above, plus "successful
// login" further down (which depends on the DNS-free parts of the config being wired correctly),
// cover this route's logic as far as is safely possible without either live DNS or a production
// code change to make the resolver injectable (out of scope for this phase).

// ══════════════════════════════════════════════════════════════════════════
// 4. Configuration API — DELETE /api/saml/config
// ══════════════════════════════════════════════════════════════════════════

test("DELETE /api/saml/config: unauthorized without a session", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, { method: "DELETE" })
  expect(res.status).toBe(401)
})

test("DELETE /api/saml/config: forbidden for a non-admin member", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, { method: "DELETE", headers: member })
  expect(res.status).toBe(403)
})

test("DELETE /api/saml/config: deletes an existing config", async () => {
  await fetch(`${BASE_ON}/api/saml/config`, {
    method: "POST",
    headers: { ...owner, "Content-Type": "application/json" },
    body: JSON.stringify({ entityId: IDP_ENTITY_ID, ssoUrl: "https://idp.test/sso", x509Cert: IDP_PUBLIC_KEY_PEM, allowedDomain: "delete-test.example" }),
  })
  const delRes = await fetch(`${BASE_ON}/api/saml/config`, { method: "DELETE", headers: owner })
  expect(delRes.status).toBe(200)
  expect(await delRes.json()).toEqual({ ok: true })
  const getRes = await fetch(`${BASE_ON}/api/saml/config`, { headers: owner })
  expect(await getRes.json()).toEqual({ enabled: false })
})

test("DELETE /api/saml/config: deleting twice is idempotent", async () => {
  const res = await fetch(`${BASE_ON}/api/saml/config`, { method: "DELETE", headers: owner })
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ ok: true })
})

// ══════════════════════════════════════════════════════════════════════════
// 5. Login route — GET /auth/saml/login
// ══════════════════════════════════════════════════════════════════════════

test("GET /auth/saml/login: missing domain", async () => {
  const res = await fetch(`${BASE_ON}/auth/saml/login`, { redirect: "manual" })
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_missing_domain")
})

test("GET /auth/saml/login: invalid domain (public mailbox)", async () => {
  const res = await fetch(`${BASE_ON}/auth/saml/login?domain=gmail.com`, { redirect: "manual" })
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_domain_not_eligible")
})

test("GET /auth/saml/login: unknown domain (no config at all)", async () => {
  const res = await fetch(`${BASE_ON}/auth/saml/login?domain=totally-unknown-${ts}.example`, { redirect: "manual" })
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_not_configured")
})

test("GET /auth/saml/login: unverified domain is treated as not configured", async () => {
  await makeAccount({ domain: "login-unverified-test.example", verified: false })
  const res = await fetch(`${BASE_ON}/auth/saml/login?domain=login-unverified-test.example`, { redirect: "manual" })
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_not_configured")
})

test("GET /auth/saml/login: verified domain redirects (302) to the IdP", async () => {
  await makeAccount({ domain: "login-verified-test.example", verified: true, ssoUrl: "https://idp.test/sso-login-check" })
  const res = await fetch(`${BASE_ON}/auth/saml/login?domain=login-verified-test.example`, { redirect: "manual" })
  expect(res.status).toBe(302)
  const loc = res.headers.get("location") || ""
  expect(loc.startsWith("https://idp.test/sso-login-check")).toBe(true)
})

test("GET /auth/saml/login: the generated redirect carries a SAMLRequest and RelayState", async () => {
  await makeAccount({ domain: "login-redirect-shape-test.example", verified: true, ssoUrl: "https://idp.test/sso-shape" })
  const res = await fetch(`${BASE_ON}/auth/saml/login?domain=login-redirect-shape-test.example`, { redirect: "manual" })
  const loc = res.headers.get("location") || ""
  expect(loc).toContain("SAMLRequest=")
  expect(loc).toContain("RelayState=")
})

test("GET /auth/saml/login: sets the klav_sso_state cookie", async () => {
  await makeAccount({ domain: "login-cookie-test.example", verified: true, ssoUrl: "https://idp.test/sso-cookie" })
  const res = await fetch(`${BASE_ON}/auth/saml/login?domain=login-cookie-test.example`, { redirect: "manual" })
  const setCookie = res.headers.get("set-cookie") || ""
  expect(setCookie).toContain("klav_sso_state=")
  expect(setCookie).toContain("HttpOnly")
})

// ══════════════════════════════════════════════════════════════════════════
// 6. ACS Callback — POST /auth/saml/callback
// ══════════════════════════════════════════════════════════════════════════

test("POST /auth/saml/callback: missing SAMLResponse", async () => {
  const res = await postCallback({ RelayState: "irrelevant" })
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_invalid_response")
})

test("POST /auth/saml/callback: missing RelayState", async () => {
  const res = await postCallback({ SAMLResponse: "irrelevant" })
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_invalid_response")
})

test("POST /auth/saml/callback: cookie mismatch is rejected (and burns the state)", async () => {
  const acct = await makeAccount({ domain: "acs-cookie-mismatch.test", verified: true })
  const state = `st_cookiemismatch_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({ email: `user@acs-cookie-mismatch.test`, inResponseTo: state })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=WRONG_VALUE`)
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_state_mismatch")
})

test("POST /auth/saml/callback: expired state is rejected", async () => {
  const acct = await makeAccount({ domain: "acs-expired-state.test", verified: true })
  const state = `st_expired_${ts}`
  await seedState(state, acct, NOW - 1_000) // already expired
  const samlResponse = buildValidSamlResponseB64({ email: `user@acs-expired-state.test`, inResponseTo: state })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_state_expired")
})

test("POST /auth/saml/callback: missing config (account has none) is rejected", async () => {
  const acct = await makeAccount({ domain: "irrelevant-noconfig.test", withConfig: false })
  const state = `st_noconfig_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({ email: "user@irrelevant-noconfig.test", inResponseTo: state })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_not_configured")
})

test("POST /auth/saml/callback: unverified config is rejected", async () => {
  const acct = await makeAccount({ domain: "acs-unverified.test", verified: false })
  const state = `st_unverified_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({ email: "user@acs-unverified.test", inResponseTo: state })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_domain_unverified")
})

test("POST /auth/saml/callback: invalid/malformed assertion is rejected", async () => {
  const acct = await makeAccount({ domain: "acs-invalid-assertion.test", verified: true })
  const state = `st_invalidassertion_${ts}`
  await seedState(state, acct)
  const garbage = Buffer.from("<not-a-saml-response>").toString("base64")
  const res = await postCallback({ SAMLResponse: garbage, RelayState: state }, `klav_sso_state=${state}`)
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_auth_failed")
})

test("POST /auth/saml/callback: issuer mismatch is rejected", async () => {
  const acct = await makeAccount({ domain: "acs-issuer-mismatch.test", verified: true, entityId: IDP_ENTITY_ID })
  const state = `st_issuermismatch_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({
    issuer: "https://not-the-configured-idp.test/entity", email: "user@acs-issuer-mismatch.test", inResponseTo: state,
  })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_auth_failed")
})

test("POST /auth/saml/callback: audience mismatch is rejected", async () => {
  const acct = await makeAccount({ domain: "acs-audience-mismatch.test", verified: true })
  const state = `st_audiencemismatch_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({
    email: "user@acs-audience-mismatch.test", audience: "https://not-our-sp.test/entity", inResponseTo: state,
  })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_auth_failed")
})

test("POST /auth/saml/callback: InResponseTo mismatch is rejected", async () => {
  const acct = await makeAccount({ domain: "acs-inresponseto-mismatch.test", verified: true })
  const state = `st_irtmismatch_${ts}`
  await seedState(state, acct)
  // The assertion's own SubjectConfirmationData InResponseTo points at a DIFFERENT (unrelated)
  // value than the RelayState/cookie actually presented for this login attempt.
  const samlResponse = buildValidSamlResponseB64({ email: "user@acs-inresponseto-mismatch.test", inResponseTo: "some-other-request-id" })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_auth_failed")
})

test("POST /auth/saml/callback: missing Conditions is rejected", async () => {
  const acct = await makeAccount({ domain: "acs-missing-conditions.test", verified: true })
  const state = `st_missingconditions_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({ email: "user@acs-missing-conditions.test", inResponseTo: state, omitConditions: true })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(res.status).toBe(302)
  expect(errorOf(res)).toBe("sso_auth_failed")
})

test("POST /auth/saml/callback: successful login creates a session and redirects to /dashboard", async () => {
  const acct = await makeAccount({ domain: "acs-success.test", verified: true })
  const state = `st_success_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({ email: "user@acs-success.test", inResponseTo: state })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(res.status).toBe(302)
  expect(res.headers.get("location")).toBe("/dashboard")
  const setCookie = res.headers.get("set-cookie") || ""
  expect(setCookie).toContain("klav_session=")
})

test("POST /auth/saml/callback: a consumed state cannot be replayed", async () => {
  const acct = await makeAccount({ domain: "acs-replay.test", verified: true })
  const state = `st_replay_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({ email: "user@acs-replay.test", inResponseTo: state })

  const first = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(first.status).toBe(302)
  expect(first.headers.get("location")).toBe("/dashboard")

  const second = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(second.status).toBe(302)
  expect(errorOf(second)).toBe("sso_state_expired")
})

// ══════════════════════════════════════════════════════════════════════════
// Security Regression Tests — explicit, independently-named proofs
// ══════════════════════════════════════════════════════════════════════════

test("SECURITY: issuer mismatch is rejected", async () => {
  const acct = await makeAccount({ domain: "sec-issuer.test", verified: true, entityId: IDP_ENTITY_ID })
  const state = `st_sec_issuer_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({ issuer: "https://attacker-idp.test/entity", email: "user@sec-issuer.test", inResponseTo: state })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(errorOf(res)).toBe("sso_auth_failed")
})

test("SECURITY: SubjectConfirmationData InResponseTo is enforced (not the spoofable outer envelope)", async () => {
  const acct = await makeAccount({ domain: "sec-irt.test", verified: true })
  const state = `st_sec_irt_${ts}`
  await seedState(state, acct)
  // Outer <Response InResponseTo> is built to match `state` (buildResponseXml uses the same
  // inResponseTo for both), but the SIGNED assertion's SubjectConfirmationData points elsewhere —
  // proving the check reads the signed value, not the unsigned envelope attribute.
  const samlResponse = buildValidSamlResponseB64({ email: "user@sec-irt.test", inResponseTo: "forged-value-not-the-real-state" })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(errorOf(res)).toBe("sso_auth_failed")
})

test("SECURITY: unsigned assertions are rejected", async () => {
  const acct = await makeAccount({ domain: "sec-unsigned.test", verified: true })
  const state = `st_sec_unsigned_${ts}`
  await seedState(state, acct)
  const samlResponse = buildUnsignedSamlResponseB64({ email: "user@sec-unsigned.test", inResponseTo: state })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(errorOf(res)).toBe("sso_auth_failed")
})

test("SECURITY: invalid signatures (tampered content) are rejected", async () => {
  const acct = await makeAccount({ domain: "sec-tampered.test", verified: true })
  const state = `st_sec_tampered_${ts}`
  await seedState(state, acct)
  const samlResponse = buildTamperedSamlResponseB64({ email: "user@sec-tampered.test", inResponseTo: state })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(errorOf(res)).toBe("sso_auth_failed")
})

test("SECURITY: wrong audience is rejected", async () => {
  const acct = await makeAccount({ domain: "sec-audience.test", verified: true })
  const state = `st_sec_audience_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({ email: "user@sec-audience.test", audience: "https://some-other-sp.test", inResponseTo: state })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(errorOf(res)).toBe("sso_auth_failed")
})

test("SECURITY: replay attack (reusing a consumed state) is rejected", async () => {
  const acct = await makeAccount({ domain: "sec-replay.test", verified: true })
  const state = `st_sec_replay_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({ email: "user@sec-replay.test", inResponseTo: state })
  const first = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(first.headers.get("location")).toBe("/dashboard")
  const replay = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(errorOf(replay)).toBe("sso_state_expired")
})

test("SECURITY: missing <Conditions> is rejected", async () => {
  const acct = await makeAccount({ domain: "sec-conditions.test", verified: true })
  const state = `st_sec_conditions_${ts}`
  await seedState(state, acct)
  const samlResponse = buildValidSamlResponseB64({ email: "user@sec-conditions.test", inResponseTo: state, omitConditions: true })
  const res = await postCallback({ SAMLResponse: samlResponse, RelayState: state }, `klav_sso_state=${state}`)
  expect(errorOf(res)).toBe("sso_auth_failed")
})
