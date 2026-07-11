// Connector health + heartbeat helpers.
// Pure functions — no DB, no network. DB callers live in db.ts.
//
// Heartbeat fields (stored inside the connector's existing config JSON, no migration needed):
//   _last_outbound_at  — epoch ms of the last successful outbound copy
//   _last_inbound_at   — epoch ms of the last received + verified inbound webhook
//   _last_error        — error message string of the most recent failure
//   _last_error_at     — epoch ms of the most recent failure
//
// All keys are prefixed with "_" to avoid collision with user-visible config fields
// (url, token, …). The DB helpers never expose these to the client config redaction path.

export type ConnectorHealthStatus =
  | "healthy"          // had a successful op recently (within HEALTHY_WINDOW)
  | "stale"            // configured but last success is older than HEALTHY_WINDOW
  | "erroring"         // last operation was a failure (regardless of time)
  | "never-connected"  // no outbound or inbound activity ever recorded

// A connector is considered "healthy" if it had a successful op in the last 7 days.
// Stale if the last success is older than that.
export const HEALTHY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

export type ConnectorHealth = {
  status: ConnectorHealthStatus
  lastOutboundAt: number | null   // epoch ms, or null if never
  lastInboundAt: number | null    // epoch ms, or null if never
  lastErrorAt: number | null      // epoch ms, or null if never
  lastError: string | null        // error message, or null
}

// Derive the health status from the connector's config JSON.
// `now` defaults to Date.now(); callers may pass a fixed value for testing.
export function deriveHealth(config: Record<string, string>, now = Date.now()): ConnectorHealth {
  const lastOutboundAt = config._last_outbound_at ? Number(config._last_outbound_at) || null : null
  const lastInboundAt  = config._last_inbound_at  ? Number(config._last_inbound_at)  || null : null
  const lastErrorAt    = config._last_error_at    ? Number(config._last_error_at)    || null : null
  const lastError      = config._last_error       ? String(config._last_error)       : null

  const lastSuccessAt = Math.max(lastOutboundAt ?? 0, lastInboundAt ?? 0) || null

  let status: ConnectorHealthStatus
  if (lastErrorAt && (!lastSuccessAt || lastErrorAt > lastSuccessAt)) {
    // Most recent recorded event was a failure.
    status = "erroring"
  } else if (lastSuccessAt) {
    // Has at least one success; check freshness.
    status = now - lastSuccessAt <= HEALTHY_WINDOW_MS ? "healthy" : "stale"
  } else {
    status = "never-connected"
  }

  return { status, lastOutboundAt, lastInboundAt, lastErrorAt, lastError }
}

// Apply a heartbeat update onto a config clone. Returns the patched config — callers
// persist it via updateConnector. Does NOT mutate the passed config.
export function applyHeartbeat(
  config: Record<string, string>,
  event: { kind: "outbound" | "inbound"; success: boolean; error?: string; now?: number },
): Record<string, string> {
  const ts = String(event.now ?? Date.now())
  const out: Record<string, string> = { ...config }
  if (event.success) {
    if (event.kind === "outbound") out._last_outbound_at = ts
    else                           out._last_inbound_at  = ts
    // Clear error only if current last-error pre-dates this success (don't erase a concurrent failure).
    const errorAt = Number(out._last_error_at) || 0
    if (Number(ts) >= errorAt) {
      delete out._last_error
      delete out._last_error_at
    }
  } else {
    out._last_error    = event.error ?? "unknown error"
    out._last_error_at = ts
  }
  return out
}
