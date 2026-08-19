// Connector-test error classification (KLA connector-test-noalert).
//
// A connector-test failure caused by the admin's OWN tracker rejecting the test payload (e.g. an
// invalid Jira issue type, a bad Linear team id) is expected user-configuration error — it must
// NOT page on-call (P1 Slack) or auto-create a Plane ticket. Only a genuine unexpected/backend
// failure (network error, our own bug, a 5xx from the upstream tracker) should still go through
// the normal `oops()` alerting path.
//
// Connector adapters (jira.ts, github.ts, linear.ts, plane.ts, webhook.ts) tag the Error they
// throw on a failed upstream response with `upstreamStatus` (and usually `upstreamBody`, the
// upstream's response body captured for diagnostics). These two pure, dependency-free helpers let
// the server route classify the error and produce a short, human-readable reason without pulling
// in the whole server.ts module (which boots an HTTP server on import).

/** True when the thrown error carries an upstream HTTP client-error status (4xx) — i.e. the
 * admin's own tracker rejected the test request, not a Klavity backend defect. */
export function isUpstreamConfigError(e: unknown): boolean {
  const status = (e as any)?.upstreamStatus
  return typeof status === "number" && status >= 400 && status < 500
}

/** Extract a short, readable reason from an upstream error response body. Tries the common
 * tracker error shapes first (Jira's `{errors:{field:"reason"}}`, Jira's `{errorMessages:[...]}`,
 * a generic `{message:"..."}`), then falls back to the raw body capped to ~200 chars. */
export function friendlyUpstream(body: string | undefined | null): string {
  if (!body) return "no additional details available"
  try {
    const parsed = JSON.parse(body)
    if (parsed && typeof parsed === "object") {
      // Jira create-issue validation errors: { errors: { issuetype: "Specify a valid issue type" } }
      if (parsed.errors && typeof parsed.errors === "object" && !Array.isArray(parsed.errors)) {
        const vals = Object.values(parsed.errors).map((v) => String(v)).filter(Boolean)
        if (vals.length) return vals.join("; ").slice(0, 200)
      }
      // Jira top-level errors: { errorMessages: ["..."] }
      if (Array.isArray(parsed.errorMessages) && parsed.errorMessages.length) {
        return parsed.errorMessages.map(String).join("; ").slice(0, 200)
      }
      // Generic { message: "..." } shape (GitHub, Linear GraphQL errors, etc.)
      if (typeof parsed.message === "string" && parsed.message) {
        return parsed.message.slice(0, 200)
      }
    }
  } catch {
    // not JSON — fall through to raw body below
  }
  return body.slice(0, 200)
}
