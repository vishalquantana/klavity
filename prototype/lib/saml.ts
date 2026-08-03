// Enterprise SSO — SAML 2.0 SP-initiated flow (KLAVITYKLA-9 follow-up to OIDC's lib/sso.ts).
//
// This module wraps @node-saml/node-saml for the parts that are genuinely dangerous to
// hand-roll (XML canonicalization, XML-DSig signature verification, signature-wrapping
// defenses) while keeping every function pure/injectable, the same way lib/sso.ts wraps
// JWT verification without ever touching the DB or the HTTP layer itself.
//
// Three checks below are done EXPLICITLY in this file rather than left to node-saml's
// defaults, following a security review that found each one was either silently a no-op or
// silently checking the wrong (unsigned) data on this code path:
//
//   1. ISSUER — node-saml's `idpIssuer` option only wires into its internal verifyIssuer(),
//      which node-saml calls exclusively from its LOGOUT request/response handlers. It has
//      NO effect on validatePostResponseAsync (the login path used here). We compare
//      `profile.issuer` (the assertion's own signed <Issuer>) against the expected IdP entity
//      ID ourselves — see validateSamlResponse.
//   2. INRESPONSETO — this module sets `wantAuthnResponseSigned: false` so IdPs that sign only
//      the <Assertion> (common) are accepted. That means the OUTER <Response InResponseTo=...>
//      attribute node-saml exposes as `profile.inResponseTo` sits outside the signed subtree
//      and is forgeable without invalidating the assertion's signature — checking it would let
//      a captured, validly-signed assertion be replayed inside a freshly-forged envelope. The
//      value the SAML Web Browser SSO Bearer profile actually binds to a request is
//      <SubjectConfirmationData InResponseTo=...>, which IS inside the signed <Assertion>. We
//      extract that value directly from the verified assertion body (profile.getAssertion())
//      instead of trusting the outer attribute. See extractAssertionFacts/validateSamlResponse.
//   3. CONDITIONS — node-saml only runs its NotBefore/NotOnOrAfter check when <Conditions> is
//      present at all; an assertion omitting it entirely skips that check silently (it happened
//      to still get rejected via an unrelated TypeError in node-saml's audience check, which is
//      an accident of this library version, not a guarantee). We require <Conditions> to be
//      present explicitly.
//
// State/replay binding still deliberately does NOT use node-saml's own built-in InResponseTo
// cache (in-memory, unrelated to this app's storage). This app already has a DB-backed, atomic
// single-use state store (sso_states / consumeSsoState in lib/db.ts) shared with OIDC — the
// SAML AuthnRequest ID plays exactly the role OIDC's `state` does. The caller consumes that DB
// row FIRST (via consumeSsoState) and passes the result in as `expectedInResponseTo`; this
// module's only job is to confirm the SIGNED assertion's SubjectConfirmationData actually
// corresponds to that already-consumed value. `validateInResponseTo: "never"` stays set so
// node-saml's own cache-based path (irrelevant to this app) never runs.
//
// No DB access, no fetch of anything other than an admin-supplied IdP metadata URL (SSRF
// guarded like every other outbound call in this codebase), and no route/server wiring —
// this file is a pure library, called from server.ts in a later phase.

import { SAML, ValidateInResponseTo, type Profile } from "@node-saml/node-saml"
import { DOMParser } from "@xmldom/xmldom"
import * as xpath from "xpath"
import { createPublicKey } from "node:crypto"
import { assertSafeUrl } from "./url-guard"

// ── Injectable dependencies — mirrors SsoDeps in lib/sso.ts. Only the metadata fetch is a
// network call; everything else here is a pure function and takes no deps at all. ──────────
export interface SamlDeps {
  fetch?: typeof fetch
  // Called with every outbound URL before it is fetched. Default: assertSafeUrl.
  // Pass `async () => {}` in hermetic tests to skip real DNS.
  guardUrl?: (url: string) => Promise<void>
}

const defaultGuardUrl = async (url: string): Promise<void> => {
  await assertSafeUrl(url)
}

// ── Types ────────────────────────────────────────────────────────────────────

export type SamlIdpMetadata = {
  entityId: string
  /** The HTTP-Redirect-binding SingleSignOnService endpoint — the SAML equivalent of OIDC's authorization_endpoint. */
  ssoUrl: string
  /**
   * One or more IdP signing certificates (bare base64, no PEM headers — node-saml accepts
   * either form). More than one means the IdP is mid key-rotation; a caller wanting to trust
   * more than the first entry today would need account_saml_configs to grow beyond a single
   * x509_cert column (out of scope for this phase — flagging, not fixing, the mismatch).
   */
  certificates: string[]
}

export type SamlAttributeMapping = {
  /** Attribute Name (or profile key) that holds the user's email address. Checked before the
   *  urn:oid mail/email fallbacks node-saml already normalizes. Default: "email". */
  emailAttribute?: string
  /** Attribute Name that holds a display name, if any. Default: "displayName". */
  nameAttribute?: string
  /** If true (default), fall back to NameID as the email when its Format is the SAML
   *  email-address URI and no attribute matched. */
  useNameIdAsEmailFallback?: boolean
}

export type SamlIdentity = {
  email: string
  name?: string
  nameId: string
  /** The <Issuer> that signed the assertion — must equal the account's configured entity_id. */
  issuer: string
  sessionIndex?: string
  /** The AuthnRequest ID this assertion responds to, or null if the response carried none. */
  inResponseTo: string | null
}

export type BuildAuthnRequestParams = {
  /** This app's fixed SP entity ID — the same value for every account (cf. OIDC's fixed redirectUri). */
  spEntityId: string
  /** This app's fixed ACS/callback URL. */
  acsUrl: string
  /** Per-account IdP config (account_saml_configs). */
  idpSsoUrl: string
  idpCert: string | string[]
  /** Pre-generated by the caller (mirrors OIDC's `state` from token()) and persisted via
   *  createSsoState BEFORE calling this — this becomes the AuthnRequest's ID attribute, which
   *  the IdP echoes back as InResponseTo. */
  requestId: string
  /** Echoed back verbatim by the IdP; used for the same login-CSRF cookie binding as OIDC's `state`. */
  relayState: string
}

export type ValidateSamlResponseParams = {
  spEntityId: string
  acsUrl: string
  /** Expected <Issuer> — account_saml_configs.entity_id for the resolved account. */
  idpEntityId: string
  /** IdP signing certificate(s) — account_saml_configs.x509_cert for the resolved account. */
  idpCert: string | string[]
  /** The raw base64 SAMLResponse form field from the ACS POST body. */
  samlResponse: string
  relayState?: string
  /** The AuthnRequest ID looked up via consumeSsoState for the `state`/RelayState presented.
   *  Pass null only if IdP-initiated login is intentionally allowed (not wired up anywhere yet). */
  expectedInResponseTo: string | null
  attributeMapping?: SamlAttributeMapping
  /** Default 60s, matches lib/sso.ts's verifyIdToken clock-skew default. */
  clockSkewMs?: number
}

// ── Metadata parsing ──────────────────────────────────────────────────────────
//
// @node-saml/node-saml is SP-only: it expects entryPoint/idpCert/idpIssuer to already be known
// values, with no IdP-metadata-XML parser of its own. Parsing the IdP's metadata document (so
// an admin can paste one URL/file instead of three separate fields) is therefore hand-rolled
// here, using local-name()-based XPath (matching node-saml's own internal convention) so it
// doesn't matter whether the IdP's metadata uses the "md:"/"ds:" prefixes, no prefix, or
// different ones entirely.

function textOf(node: Node | null | undefined): string {
  return (node?.textContent ?? "").trim()
}

/**
 * Parses a SAML IdP metadata XML document into the fields this app actually needs.
 * Throws a descriptive Error (safe for server logs, not necessarily for client responses)
 * when a required field is missing — this fails closed the same way fetchOidcDiscovery
 * throws on a discovery doc missing required fields.
 */
export function parseIdpMetadata(xml: string): SamlIdpMetadata {
  let doc: Document
  try {
    doc = new DOMParser().parseFromString(xml, "text/xml")
  } catch {
    throw new Error("SAML metadata is not well-formed XML")
  }

  const entityDescriptor = xpath.select1(
    "//*[local-name()='EntityDescriptor']",
    doc as unknown as Node,
  ) as Element | undefined
  if (!entityDescriptor) throw new Error("SAML metadata is missing an EntityDescriptor")

  const entityId = entityDescriptor.getAttribute("entityID")?.trim() ?? ""
  if (!entityId) throw new Error("SAML metadata EntityDescriptor is missing entityID")

  const idpDescriptor = xpath.select1(
    "./*[local-name()='IDPSSODescriptor']",
    entityDescriptor,
  ) as Element | undefined
  if (!idpDescriptor) throw new Error("SAML metadata has no IDPSSODescriptor (not an IdP's metadata)")

  // Prefer HTTP-Redirect binding (what buildAuthnRequestUrl uses); fall back to HTTP-POST if
  // that's the only one offered.
  const ssoNodes = xpath.select(
    "./*[local-name()='SingleSignOnService']",
    idpDescriptor,
  ) as Element[]
  const findByBinding = (suffix: string) =>
    ssoNodes.find((el) => (el.getAttribute("Binding") ?? "").endsWith(suffix))
  const ssoNode = findByBinding("HTTP-Redirect") ?? findByBinding("HTTP-POST")
  const ssoUrl = ssoNode?.getAttribute("Location")?.trim() ?? ""
  if (!ssoUrl) throw new Error("SAML metadata has no usable SingleSignOnService endpoint")

  const keyDescriptors = xpath.select(
    "./*[local-name()='KeyDescriptor']",
    idpDescriptor,
  ) as Element[]
  const signingCerts = keyDescriptors
    .filter((kd) => {
      const use = kd.getAttribute("use")
      return use === null || use === "signing"
    })
    .flatMap((kd) => xpath.select(".//*[local-name()='X509Certificate']", kd) as Element[])
    .map((certNode) => textOf(certNode).replace(/\s+/g, ""))
    .filter(Boolean)

  if (!signingCerts.length) throw new Error("SAML metadata has no signing X509Certificate")

  return { entityId, ssoUrl, certificates: signingCerts }
}

// A PEM block (any label) is used as-is; bare base64 (no armor — the shape both metadata's
// <X509Certificate> and a hand-pasted cert commonly take) is wrapped as a certificate PEM. This
// mirrors node-saml's own idpCert normalization (which accepts both forms identically at
// signature-verification time), so this check accepts exactly what would actually work later.
const PEM_BLOCK_REGEX = /^-----BEGIN [A-Z0-9 ]+-----[\s\S]+-----END [A-Z0-9 ]+-----\s*$/

function normalizeToPem(value: string): string {
  const trimmed = value.trim()
  if (PEM_BLOCK_REGEX.test(trimmed)) return trimmed
  return `-----BEGIN CERTIFICATE-----\n${trimmed.replace(/\s+/g, "")}\n-----END CERTIFICATE-----`
}

/**
 * Confirms `cert` is at least well-formed key material — a full X.509 certificate or a bare
 * public key, PEM-armored or not (node-saml/verification accepts either shape). This is a
 * STRUCTURAL check only (can Node's crypto even read a key out of this), not proof it's the
 * IdP's real key — that can only be confirmed by a live login. Catches paste/truncation errors
 * immediately instead of at the first real user's login attempt.
 */
function validateCertificateMaterial(cert: string): string | null {
  if (!cert.trim()) return "signing certificate is empty"
  try {
    createPublicKey({ key: normalizeToPem(cert), format: "pem" })
    return null
  } catch {
    return "signing certificate is not a valid X.509 certificate or public key"
  }
}

// ── Metadata validation ────────────────────────────────────────────────────────
//
// Policy-level sanity checks on an already-parsed metadata document, mirroring the shape of
// validateSsoDomain in lib/sso.ts: returns null when acceptable, otherwise a client-safe
// reason string. This does NOT verify the metadata document's own XML signature — the
// metadata is only ever fetched over an assertSafeUrl-guarded HTTPS connection (or pasted
// directly by an authenticated admin), and TLS already gives transport authenticity for the
// fetch path. Verifying a self-signed metadata signature on top would be defense-in-depth,
// not a closed gap; noting it here rather than silently claiming full parity with the OIDC
// discovery-document self-identification check in fetchOidcDiscovery.
export function validateIdpMetadata(meta: SamlIdpMetadata): string | null {
  if (!meta.entityId) return "metadata is missing an entityID"
  if (!meta.ssoUrl) return "metadata is missing a SingleSignOnService endpoint"
  if (!meta.certificates.length) return "metadata is missing a signing certificate"
  let parsed: URL
  try {
    parsed = new URL(meta.ssoUrl)
  } catch {
    return "SingleSignOnService Location is not a valid URL"
  }
  if (parsed.protocol !== "https:") return "SingleSignOnService Location must use https"
  // Only certificates[0] is ever persisted (see the SamlIdpMetadata doc comment on the
  // key-rotation limitation), so that's the one that must be usable.
  const certErr = validateCertificateMaterial(meta.certificates[0])
  if (certErr) return certErr
  return null
}

/** Fetches an IdP's metadata document from a URL an admin supplied, and parses it. */
export async function fetchIdpMetadata(metadataUrl: string, deps: SamlDeps = {}): Promise<SamlIdpMetadata> {
  const fetcher = deps.fetch ?? fetch
  const guard = deps.guardUrl ?? defaultGuardUrl

  await guard(metadataUrl)
  const res = await fetcher(metadataUrl, {
    headers: { Accept: "application/samlmetadata+xml, application/xml, text/xml" },
    redirect: "manual",
  })
  if (!res.ok) throw new Error(`SAML metadata fetch failed: HTTP ${res.status}`)
  const xml = await res.text()
  return parseIdpMetadata(xml)
}

// ── AuthnRequest generation ────────────────────────────────────────────────────

/**
 * Builds the redirect URL that starts an SP-initiated SAML login (the SAML equivalent of
 * buildAuthorizationUrl in lib/sso.ts). The caller must generate `requestId` itself (e.g. via
 * lib/auth.ts's token()) and persist it via createSsoState BEFORE calling this, exactly as the
 * OIDC login route does with `state`/`nonce` — this function does not touch the DB.
 *
 * idpCert is required by the underlying SAML() constructor even though it's unused for an
 * unsigned AuthnRequest; the caller already has it from the resolved account config, so this
 * isn't a placeholder — it's the same value validateSamlResponse will later verify against.
 */
export async function buildAuthnRequestUrl(params: BuildAuthnRequestParams): Promise<string> {
  const client = new SAML({
    issuer: params.spEntityId,
    callbackUrl: params.acsUrl,
    entryPoint: params.idpSsoUrl,
    idpCert: params.idpCert,
    generateUniqueId: () => params.requestId,
    validateInResponseTo: ValidateInResponseTo.never,
  })
  return await client.getAuthorizeUrlAsync(params.relayState, undefined, {})
}

// ── Assertion validation ───────────────────────────────────────────────────────

function attributeValue(profile: Profile, name: string): string | null {
  const v = (profile as Record<string, unknown>)[name]
  return typeof v === "string" ? v : null
}

/** Configurable attribute mapping: different IdPs put the email under different attribute
 *  Names (or only in NameID). Checked in order: explicit mapping → node-saml's own
 *  mail/email normalization (urn:oid:0.9.2342.19200300.100.1.3) → NameID when its Format
 *  says it's an email address. */
function extractEmail(profile: Profile, mapping: SamlAttributeMapping | undefined): string | null {
  const emailAttr = mapping?.emailAttribute ?? "email"
  const mapped = attributeValue(profile, emailAttr)
  if (mapped?.includes("@")) return mapped

  if (typeof profile.email === "string" && profile.email.includes("@")) return profile.email
  if (typeof profile.mail === "string" && profile.mail.includes("@")) return profile.mail

  const useNameId = mapping?.useNameIdAsEmailFallback ?? true
  if (
    useNameId &&
    profile.nameIDFormat === "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" &&
    typeof profile.nameID === "string" &&
    profile.nameID.includes("@")
  ) {
    return profile.nameID
  }
  return null
}

function extractName(profile: Profile, mapping: SamlAttributeMapping | undefined): string | undefined {
  const nameAttr = mapping?.nameAttribute ?? "displayName"
  return attributeValue(profile, nameAttr) ?? undefined
}

// ── Facts that must come from the SIGNED assertion body, not the outer envelope ─────────────
//
// validateSamlResponse sets wantAuthnResponseSigned: false so it can accept IdPs that sign only
// the <Assertion>, not the whole <Response> (see module header). That means anything read from
// OUTSIDE the <Assertion> subtree is NOT cryptographically protected here and must never be
// used for a security decision. `profile.getAssertion()` returns the xml2js-parsed form of the
// VERIFIED assertion (the same object node-saml builds internally right after checking its
// signature), so anything pulled from it — <Conditions>, <SubjectConfirmationData> — inherits
// the assertion's own signature guarantee, unlike the outer <Response>'s attributes.
type AssertionFacts = {
  hasConditions: boolean
  /** InResponseTo value(s) from every <SubjectConfirmation><SubjectConfirmationData> in the
   *  assertion — the field the SAML Web Browser SSO Bearer profile actually specifies as the
   *  request/response binding, as opposed to the outer <Response> attribute of the same name,
   *  which lives outside what's signed here and so cannot be trusted for that purpose. */
  subjectConfirmationInResponseTo: string[]
}

function extractAssertionFacts(profile: Profile): AssertionFacts {
  // xml2js's parsed shape (element name -> array of nodes, attributes under `.$`) is the same
  // internal representation node-saml itself works with; there's no public type for it, so this
  // mirrors the narrow `any` navigation node-saml's own source uses for the same structure.
  const parsed = profile.getAssertion?.() as { Assertion?: any } | undefined
  const assertion = parsed?.Assertion
  if (!assertion) throw new Error("SAML assertion body unavailable after signature verification")

  const hasConditions =
    Array.isArray(assertion.Conditions) && assertion.Conditions.length > 0 && !!assertion.Conditions[0]?.$

  const subjectConfirmations: any[] = assertion.Subject?.[0]?.SubjectConfirmation ?? []
  const subjectConfirmationInResponseTo = subjectConfirmations
    .map((sc) => sc?.SubjectConfirmationData?.[0]?.$?.InResponseTo)
    .filter((v: unknown): v is string => typeof v === "string" && v.length > 0)

  return { hasConditions, subjectConfirmationInResponseTo }
}

/**
 * Validates a SAML Response POSTed to the ACS endpoint and returns the caller's identity (the
 * SAML equivalent of verifyIdToken in lib/sso.ts). node-saml does the hard/dangerous work —
 * XML-DSig signature verification (wantAssertionsSigned) and Audience restriction (audience) —
 * but Issuer, Conditions-presence, and InResponseTo are checked explicitly below rather than
 * left to node-saml's defaults; see the module header for why each one is a no-op or unsafe on
 * this code path otherwise.
 *
 * wantAssertionsSigned is required; wantAuthnResponseSigned is deliberately left off (node-saml
 * defaults it to true) because many real IdPs sign only the assertion, not the outer Response —
 * requiring both would reject legitimate, correctly-signed responses from those IdPs. The
 * assertion signature is the one that actually carries the identity claims, so it's the
 * requirement that matters — but it's also exactly why Issuer/Conditions/InResponseTo must be
 * read from the verified assertion body, never from the (possibly unsigned) outer envelope.
 */
export async function validateSamlResponse(params: ValidateSamlResponseParams): Promise<SamlIdentity> {
  const client = new SAML({
    issuer: params.spEntityId,
    callbackUrl: params.acsUrl,
    idpCert: params.idpCert,
    idpIssuer: params.idpEntityId,
    audience: params.spEntityId,
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: false,
    validateInResponseTo: ValidateInResponseTo.never,
    acceptedClockSkewMs: params.clockSkewMs ?? 60_000,
  })

  const { profile } = await client.validatePostResponseAsync(
    params.relayState !== undefined
      ? { SAMLResponse: params.samlResponse, RelayState: params.relayState }
      : { SAMLResponse: params.samlResponse },
  )
  if (!profile) throw new Error("SAML response contained no assertion")

  // ISSUER: idpIssuer (set above) is NOT enforced by node-saml on this code path — see module
  // header. profile.issuer comes from the assertion's own signed <Issuer>, so comparing it here
  // is both meaningful (the value is tamper-proof) and required (nothing else checks it). This
  // is the same "verify explicitly, don't trust a library default" approach lib/sso.ts uses for
  // OIDC's `payload.iss !== params.issuer`.
  if (!profile.issuer) throw new Error("SAML assertion missing Issuer")
  if (profile.issuer !== params.idpEntityId) {
    throw new Error(`SAML issuer mismatch: expected ${params.idpEntityId}, got ${profile.issuer}`)
  }

  const facts = extractAssertionFacts(profile)

  // CONDITIONS: reject explicitly rather than relying on an incidental failure elsewhere (see
  // module header) — an assertion with no <Conditions> at all has no NotBefore/NotOnOrAfter
  // window for us to have verified, so it must never be treated as validated.
  if (!facts.hasConditions) {
    throw new Error("SAML assertion is missing <Conditions> (NotBefore/NotOnOrAfter cannot be verified)")
  }

  // INRESPONSETO: validated against <SubjectConfirmationData>, inside the signed assertion body
  // — never against the outer <Response> attribute (see module header for why that one is
  // forgeable under wantAuthnResponseSigned: false). `expectedInResponseTo` is the value the
  // caller already consumed from sso_states (createSsoState/consumeSsoState in lib/db.ts) for
  // this login attempt; this only confirms the SIGNED assertion actually corresponds to it.
  // node-saml's own cache-based InResponseTo handling stays disabled (validateInResponseTo:
  // "never") — sso_states remains the sole single-use/replay guard, not node-saml's in-memory
  // cache, which has nothing to do with this app's storage.
  if (params.expectedInResponseTo !== null) {
    if (!facts.subjectConfirmationInResponseTo.includes(params.expectedInResponseTo)) {
      throw new Error(
        `SAML InResponseTo mismatch: expected ${params.expectedInResponseTo}, got ` +
          (facts.subjectConfirmationInResponseTo.join(", ") || "(none)"),
      )
    }
  }

  if (!profile.nameID) throw new Error("SAML assertion missing NameID")

  const email = extractEmail(profile, params.attributeMapping)
  if (!email) throw new Error("SAML assertion did not include a usable email attribute or NameID")

  return {
    email: email.toLowerCase(),
    name: extractName(profile, params.attributeMapping),
    nameId: String(profile.nameID),
    issuer: String(profile.issuer),
    sessionIndex: profile.sessionIndex ? String(profile.sessionIndex) : undefined,
    inResponseTo: facts.subjectConfirmationInResponseTo[0] ?? null,
  }
}
