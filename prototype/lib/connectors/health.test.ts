import { test, expect } from "bun:test"
import { deriveHealth, applyHeartbeat, HEALTHY_WINDOW_MS } from "./health"

const NOW = 1_700_000_000_000 // fixed epoch for deterministic tests

// ── deriveHealth ──────────────────────────────────────────────────────────────

test("never-connected: empty config", () => {
  expect(deriveHealth({}, NOW).status).toBe("never-connected")
})

test("never-connected: config has non-heartbeat keys only", () => {
  expect(deriveHealth({ url: "https://x", token: "t" }, NOW).status).toBe("never-connected")
})

test("healthy: recent outbound success", () => {
  const h = deriveHealth({ _last_outbound_at: String(NOW - 1000) }, NOW)
  expect(h.status).toBe("healthy")
  expect(h.lastOutboundAt).toBe(NOW - 1000)
  expect(h.lastError).toBeNull()
})

test("healthy: recent inbound success", () => {
  const h = deriveHealth({ _last_inbound_at: String(NOW - 500) }, NOW)
  expect(h.status).toBe("healthy")
  expect(h.lastInboundAt).toBe(NOW - 500)
})

test("healthy: both outbound and inbound, uses the newer one", () => {
  const h = deriveHealth({
    _last_outbound_at: String(NOW - 2000),
    _last_inbound_at:  String(NOW - 1000),
  }, NOW)
  expect(h.status).toBe("healthy")
  expect(h.lastInboundAt).toBe(NOW - 1000)
})

test("stale: outbound success older than HEALTHY_WINDOW_MS", () => {
  const h = deriveHealth({ _last_outbound_at: String(NOW - HEALTHY_WINDOW_MS - 1) }, NOW)
  expect(h.status).toBe("stale")
})

test("stale: success exactly at window boundary is healthy", () => {
  const h = deriveHealth({ _last_outbound_at: String(NOW - HEALTHY_WINDOW_MS) }, NOW)
  expect(h.status).toBe("healthy")
})

test("erroring: last op was a failure (no prior success)", () => {
  const h = deriveHealth({
    _last_error:    "auth failed",
    _last_error_at: String(NOW - 500),
  }, NOW)
  expect(h.status).toBe("erroring")
  expect(h.lastError).toBe("auth failed")
  expect(h.lastErrorAt).toBe(NOW - 500)
})

test("erroring: error is more recent than the last success", () => {
  const h = deriveHealth({
    _last_outbound_at: String(NOW - 2000),
    _last_error:       "timeout",
    _last_error_at:    String(NOW - 100),
  }, NOW)
  expect(h.status).toBe("erroring")
})

test("healthy: success is more recent than the last error", () => {
  const h = deriveHealth({
    _last_outbound_at: String(NOW - 100),
    _last_error:       "old error",
    _last_error_at:    String(NOW - 2000),
  }, NOW)
  expect(h.status).toBe("healthy")
  // Old error still surfaced (diagnostic) even if not the current status driver.
  expect(h.lastError).toBe("old error")
})

test("deriveHealth returns all null fields for empty config", () => {
  const h = deriveHealth({})
  expect(h.lastOutboundAt).toBeNull()
  expect(h.lastInboundAt).toBeNull()
  expect(h.lastErrorAt).toBeNull()
  expect(h.lastError).toBeNull()
})

// ── applyHeartbeat ────────────────────────────────────────────────────────────

test("applyHeartbeat: outbound success sets _last_outbound_at", () => {
  const cfg = applyHeartbeat({}, { kind: "outbound", success: true, now: NOW })
  expect(cfg._last_outbound_at).toBe(String(NOW))
  expect(cfg._last_error).toBeUndefined()
})

test("applyHeartbeat: inbound success sets _last_inbound_at", () => {
  const cfg = applyHeartbeat({}, { kind: "inbound", success: true, now: NOW })
  expect(cfg._last_inbound_at).toBe(String(NOW))
})

test("applyHeartbeat: failure sets _last_error + _last_error_at", () => {
  const cfg = applyHeartbeat({}, { kind: "outbound", success: false, error: "boom", now: NOW })
  expect(cfg._last_error).toBe("boom")
  expect(cfg._last_error_at).toBe(String(NOW))
  // Does not touch outbound/inbound timestamps on failure.
  expect(cfg._last_outbound_at).toBeUndefined()
})

test("applyHeartbeat: failure without explicit error defaults to 'unknown error'", () => {
  const cfg = applyHeartbeat({}, { kind: "outbound", success: false, now: NOW })
  expect(cfg._last_error).toBe("unknown error")
})

test("applyHeartbeat: does not mutate original config", () => {
  const orig = { url: "https://x", _last_outbound_at: "100" }
  const result = applyHeartbeat(orig, { kind: "outbound", success: true, now: NOW })
  // Original unchanged
  expect(orig._last_outbound_at).toBe("100")
  // Result updated
  expect(result._last_outbound_at).toBe(String(NOW))
})

test("applyHeartbeat: success clears stale error when success is newer", () => {
  const cfg = applyHeartbeat(
    { _last_error: "old", _last_error_at: String(NOW - 1000) },
    { kind: "outbound", success: true, now: NOW },
  )
  expect(cfg._last_error).toBeUndefined()
  expect(cfg._last_error_at).toBeUndefined()
})

test("applyHeartbeat: success does NOT clear error if error is newer than success", () => {
  // Error at NOW, success event at NOW - 500 (backfill scenario; rare but correct).
  const cfg = applyHeartbeat(
    { _last_error: "concurrent", _last_error_at: String(NOW) },
    { kind: "outbound", success: true, now: NOW - 500 },
  )
  // Error is newer → keep it
  expect(cfg._last_error).toBe("concurrent")
})

test("applyHeartbeat: success preserves other config keys", () => {
  const cfg = applyHeartbeat(
    { url: "https://x", token: "enc:abc" },
    { kind: "outbound", success: true, now: NOW },
  )
  expect(cfg.url).toBe("https://x")
  expect(cfg.token).toBe("enc:abc")
  expect(cfg._last_outbound_at).toBe(String(NOW))
})

// ── round-trip: applyHeartbeat + deriveHealth ──────────────────────────────────

test("round-trip: outbound success → healthy", () => {
  const cfg = applyHeartbeat({}, { kind: "outbound", success: true, now: NOW })
  expect(deriveHealth(cfg, NOW).status).toBe("healthy")
})

test("round-trip: inbound success → healthy", () => {
  const cfg = applyHeartbeat({}, { kind: "inbound", success: true, now: NOW })
  expect(deriveHealth(cfg, NOW).status).toBe("healthy")
})

test("round-trip: failure → erroring", () => {
  const cfg = applyHeartbeat({}, { kind: "outbound", success: false, error: "timed out", now: NOW })
  const h = deriveHealth(cfg, NOW)
  expect(h.status).toBe("erroring")
  expect(h.lastError).toBe("timed out")
})

test("round-trip: old success followed by failure → erroring", () => {
  let cfg = applyHeartbeat({}, { kind: "outbound", success: true, now: NOW - 5000 })
  cfg = applyHeartbeat(cfg, { kind: "outbound", success: false, error: "403", now: NOW })
  expect(deriveHealth(cfg, NOW).status).toBe("erroring")
})

test("round-trip: failure then success clears error → healthy", () => {
  let cfg = applyHeartbeat({}, { kind: "outbound", success: false, error: "403", now: NOW - 1000 })
  cfg = applyHeartbeat(cfg, { kind: "outbound", success: true, now: NOW })
  const h = deriveHealth(cfg, NOW)
  expect(h.status).toBe("healthy")
  expect(h.lastError).toBeNull()
})
