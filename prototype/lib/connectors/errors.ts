// KLA-724: typed upstream-tracker error + classification.
//
// Leaf module (no dependency on ./index) so adapters can import UpstreamTrackerError directly
// without creating an import cycle through the registry in index.ts (see resolve-issue-type.ts
// for the same pattern). index.ts re-exports these for back-compat.
//
// WHY: when a connector "Test connection" / field-mapping fetch hits a customer tracker with a bad
// token / wrong workspace / wrong project, the tracker returns an EXPECTED 4xx (401/403/404). The
// server used to funnel every such error through oops(), which UNCONDITIONALLY pages the Prod Alerts
// channel (reportError) AND auto-creates an error ticket (autoTicketError) — so a user typo paged
// on-call and spawned junk tickets, while the user only saw a generic "Something went wrong".
//
// Adapters now throw UpstreamTrackerError(status, body) on a non-ok tracker response. The connector
// test/meta handlers classify it: a 4xx is a USER config problem → return a specific, self-fixable
// message and DO NOT alert. A 5xx / network / non-UpstreamTrackerError is a genuine backend problem
// → keep the oops() alerting.
//
// The client-facing message stays generic here too: we surface only the HTTP status + guidance, never
// the upstream response body (kept on `.body` for server-side logs only).

export class UpstreamTrackerError extends Error {
  readonly status: number
  readonly body: string
  constructor(status: number, body = "") {
    // Keep the historical message shape so existing message-based assertions (e.g. plane/jira tests
    // asserting /HTTP 500/ or "tracker request failed (HTTP 400)") stay green.
    super(`tracker request failed (HTTP ${status})`)
    this.name = "UpstreamTrackerError"
    this.status = status
    this.body = body
  }
}

// classifyUpstreamError: decide whether a caught connector-test/meta error is a user-fixable upstream
// 4xx (→ return a friendly validation result, NO alert) or something worth alerting on (→ null, so
// the caller routes it through oops()/reportError()/autoTicketError() as before).
//   • UpstreamTrackerError with 4xx  → { friendly, code }
//   • UpstreamTrackerError with 5xx  → null  (real tracker/backend outage — alert)
//   • anything else (network, bug)   → null  (real backend problem — alert)
export function classifyUpstreamError(e: unknown): { friendly: string; code: number } | null {
  if (e instanceof UpstreamTrackerError && e.status >= 400 && e.status < 500) {
    const s = e.status
    let friendly: string
    if (s === 401 || s === 403) {
      friendly = `The tracker rejected the request (HTTP ${s}). Check that the API token is valid and has permission for this workspace/project.`
    } else if (s === 404) {
      friendly = `Not found (HTTP 404). Check the workspace slug and project id.`
    } else {
      friendly = `The tracker rejected the request (HTTP ${s}). Check the connector settings and try again.`
    }
    return { friendly, code: s }
  }
  return null
}
