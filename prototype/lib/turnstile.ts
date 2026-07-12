// Cloudflare Turnstile server-side verification (JTBD 1.7).
//
// Dropping the email gate on the default (anonymous) report path removes the accidental
// spam-shield the required-email field used to provide. Turnstile replaces that shield: the
// widget renders an invisible/managed challenge, forwards the resulting token as `cf_turnstile_token`
// with the submit, and this module verifies it against Cloudflare's siteverify endpoint before the
// anonymous cross-origin report is accepted.
//
// CONFIG-GATED: verification is ONLY enforced when TURNSTILE_SECRET_KEY is set. If it's unset
// (local dev, tests, self-hosters who don't want Turnstile), the anonymous path behaves exactly as
// before — per-IP + per-project rate limits remain the bound. This keeps the feature opt-in and
// never breaks an existing deployment that hasn't provisioned Turnstile keys.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

/** The configured server-side secret, or "" when Turnstile is not enabled. */
export function turnstileSecret(): string {
  return (process.env.TURNSTILE_SECRET_KEY || "").trim()
}

/**
 * The PUBLIC Turnstile site key (safe to expose to the browser), or "" when unset. The widget reads
 * this from the CORS-open config GET and renders a challenge only when it's present.
 */
export function turnstileSiteKey(): string {
  return (process.env.TURNSTILE_SITE_KEY || "").trim()
}

/** True when Turnstile verification should be enforced (a secret key is configured). */
export function turnstileEnabled(): boolean {
  return turnstileSecret().length > 0
}

/**
 * Verify a Turnstile token against Cloudflare's siteverify endpoint.
 *
 * Returns true when the token is valid (or when Turnstile is not configured — see file header).
 * Fails CLOSED on a present-but-invalid token, and on a missing token when Turnstile is enabled.
 * A network/5xx error talking to Cloudflare is treated as a soft-pass (fail-open) so an outage at
 * Cloudflare never takes down every customer's report widget — the rate limits still bound abuse.
 *
 * The endpoint host is a fixed Cloudflare address (not user-supplied), so a plain fetch is safe
 * here — no SSRF surface. `remoteIp` is optional and, when provided, tightens the check.
 */
export async function verifyTurnstile(token: string | null | undefined, remoteIp?: string): Promise<boolean> {
  const secret = turnstileSecret()
  if (!secret) return true // not configured → do not enforce
  const t = (token || "").trim()
  if (!t) return false // enabled but no token → reject
  try {
    const form = new URLSearchParams()
    form.set("secret", secret)
    form.set("response", t)
    if (remoteIp) form.set("remoteip", remoteIp)
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return true // Cloudflare outage → fail-open (rate limits still bound abuse)
    const j: any = await res.json().catch(() => null)
    return !!(j && j.success === true)
  } catch {
    return true // network error reaching Cloudflare → fail-open
  }
}
