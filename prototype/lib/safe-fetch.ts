// SSRF-hardened outbound fetch for connector adapters (OWASP H3).
//
// Connectors fetch USER-SUPPLIED hosts/URLs (webhook URL, Jira/Plane host) and attach
// secret auth headers. A raw fetch() follows 3xx redirects by default to an UNCHECKED
// host — so an attacker who controls (or can MITM) the first hop could 302 the request,
// with credentials attached, to http://127.0.0.1 or http://169.254.169.254. This module
// closes that hole:
//
//   (a) the URL is validated by the central url-guard BEFORE we connect;
//   (b) redirects are NOT auto-followed (`redirect: 'manual'`);
//   (c) each 3xx Location is resolved against the current URL, RE-VALIDATED by the guard,
//       and only then followed — with a hop cap (MAX_HOPS);
//   (d) the host is re-validated immediately before EVERY network hop to narrow the
//       DNS-rebinding TOCTOU window.
//
// RESIDUAL RISK (documented, accepted): Bun's fetch resolves DNS internally and cannot be
// told to connect to a pre-resolved IP, so there is a narrow window between our final
// guard DNS lookup and fetch()'s own lookup during which a rebinding attacker could flip
// an A record from a public IP to a private one. We re-validate immediately before each
// connect to keep that window as small as possible; full IP-pinning would require a custom
// TCP/TLS dialer (out of scope here). The allowHosts pins (github.com / linear.app) are not
// subject to this — their hostnames are fixed and the allowlist is authoritative.

import { assertSafeUrl, type UrlGuardOptions } from "./url-guard"
import { loopbackAllowedForTests, isLoopbackTarget } from "./connectors/guard"

const MAX_HOPS = 5

export interface SafeFetchOptions {
  /** Optional exact-or-suffix host allowlist forwarded to the guard (e.g. ["github.com"]). */
  allowHosts?: string[]
  /**
   * When true AND the loopback test hatch env is set, permit localhost/loopback targets so the
   * hermetic integration test can point a connector at a real local receiver. Off in production.
   */
  allowLoopbackInTest?: boolean
  /**
   * CREDENTIAL-SAFETY (Codex #1): when true, a 3xx redirect whose host differs from the ORIGINAL
   * request host is REJECTED instead of followed. The SSRF guard alone only blocks private/loopback
   * IPs — it happily follows a redirect to ANY public host (e.g. https://attacker/collect), which
   * would re-send the caller's Authorization header (Basic email:token) to that host. Any request
   * that carries a secret auth header to a user-supplied host (Jira/Plane/etc.) MUST set this so the
   * token can only ever reach the configured, validated host. Same-host path/query redirects are
   * still followed; a cross-host redirect throws a generic, log-safe error.
   */
  sameOriginRedirectsOnly?: boolean
}

/**
 * Validate `raw` with the central guard, honoring the loopback test-hatch when the caller
 * opts in (allowLoopbackInTest) and the env var is set — same rule as guardConnectorUrl, not a
 * reimplementation of the IP classifier. Throws a generic, log-safe Error on rejection.
 */
async function validateHop(raw: string, opts: SafeFetchOptions): Promise<URL> {
  const guardOpts: UrlGuardOptions = opts.allowHosts ? { allowHosts: opts.allowHosts } : {}
  try {
    return await assertSafeUrl(raw, guardOpts)
  } catch (e) {
    if (opts.allowLoopbackInTest && loopbackAllowedForTests() && isLoopbackTarget(raw)) {
      // Test-only loopback receiver. Re-parse so callers still get a URL.
      return new URL(raw)
    }
    throw e
  }
}

/**
 * SSRF-safe replacement for `guardConnectorUrl(url) + fetch(url)`.
 *
 * Validates the target (and every redirect hop) with the url-guard before connecting,
 * disables automatic redirect following, and follows 3xx manually with per-hop
 * re-validation and a hop cap. Errors thrown are generic and log-safe (no secrets, no
 * internal IPs) so the server can surface them to clients without leaking an SSRF oracle.
 */
export async function safeFetch(
  url: string,
  init?: RequestInit,
  opts: SafeFetchOptions = {},
): Promise<Response> {
  let currentUrl = url
  // Pin the credential-bearing origin. A redirect that leaves this host must never re-carry the
  // caller's auth headers (see sameOriginRedirectsOnly). Parsed leniently — an unparseable initial
  // URL is caught by the guard on the first hop below.
  let originHost: string | null = null
  try { originHost = new URL(url).host.toLowerCase() } catch { originHost = null }

  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    // Re-validate immediately before each network hop (narrows the rebinding window — see file header).
    await validateHop(currentUrl, opts)

    const res = await fetch(currentUrl, { ...init, redirect: "manual" })

    // Not a redirect → this is the response the caller wants.
    if (res.status < 300 || res.status >= 400) {
      return res
    }

    // 3xx: resolve + re-validate the Location before following.
    const location = res.headers.get("location")
    if (!location) {
      // A 3xx with no Location is not followable; hand it back as-is.
      return res
    }

    let nextUrl: URL
    try {
      nextUrl = new URL(location, currentUrl)
    } catch {
      throw new Error("blocked redirect: invalid Location")
    }

    // CREDENTIAL-SAFETY (Codex #1): reject a redirect that would carry the auth header off the
    // original host. Enforced BEFORE we follow (and before the SSRF guard, which would let a public
    // attacker host through). Drain the pending body first so the socket closes cleanly.
    if (opts.sameOriginRedirectsOnly && originHost !== null && nextUrl.host.toLowerCase() !== originHost) {
      await res.body?.cancel().catch(() => {})
      throw new Error("blocked redirect: cross-origin redirect not allowed for authenticated request")
    }

    // Drain the redirect body so the connection can be reused/closed cleanly.
    await res.body?.cancel().catch(() => {})

    currentUrl = nextUrl.toString()
    // Loop continues: top of loop re-validates the new host before the next fetch.
  }

  throw new Error("blocked redirect: too many redirects")
}
