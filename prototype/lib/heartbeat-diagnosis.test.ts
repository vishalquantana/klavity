import { expect, test } from "bun:test"
import { diagnoseHeartbeat, normalizeHost, renderDeveloperEmail, type HeartbeatSignals } from "./heartbeat-diagnosis"

const NOW = 1_700_000_000_000
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

// A healthy baseline: seen recently, mode on, anonymous gate, reports flowing, matching host.
function base(over: Partial<HeartbeatSignals> = {}): HeartbeatSignals {
  return {
    now: NOW,
    everSeen: true,
    lastSeen: NOW - HOUR,
    firstSeen: NOW - 30 * DAY,
    pingHost: "acme.com",
    expectedHost: "acme.com",
    widgetMode: "support",
    reportGate: "anonymous",
    recentReportCount: 3,
    ...over,
  }
}

test("normalizeHost strips protocol, path, port, and leading www", () => {
  expect(normalizeHost("https://www.Acme.com/app?x=1#y")).toBe("acme.com")
  expect(normalizeHost("http://staging.acme.com:8080/")).toBe("staging.acme.com")
  expect(normalizeHost("acme.com")).toBe("acme.com")
  expect(normalizeHost(null)).toBe(null)
  expect(normalizeHost("")).toBe(null)
})

test("healthy: fresh ping, on-domain, reports flowing", () => {
  const d = diagnoseHeartbeat(base())
  expect(d.cause).toBe("healthy")
  expect(d.status).toBe("healthy")
  expect(d.severity).toBe("ok")
  expect(d.fix).toEqual([])
})

test("widget_disabled wins even when otherwise fine", () => {
  const d = diagnoseHeartbeat(base({ widgetMode: "off" }))
  expect(d.cause).toBe("widget_disabled")
  expect(d.status).toBe("disabled")
  expect(d.fix.length).toBeGreaterThan(0)
})

test("not_installed: never seen ⇒ script missing or CSP-blocked, critical", () => {
  const d = diagnoseHeartbeat(base({ everSeen: false, lastSeen: null, firstSeen: null, pingHost: null, recentReportCount: 0 }))
  expect(d.cause).toBe("not_installed")
  expect(d.severity).toBe("critical")
  // fix must mention the install snippet and CSP as candidate causes
  expect(d.fix.join(" ")).toContain("widget.js")
  expect(d.fix.join(" ").toLowerCase()).toContain("content-security-policy")
})

test("went_silent: was seen, now stale beyond window ⇒ critical regression", () => {
  const d = diagnoseHeartbeat(base({ lastSeen: NOW - 3 * DAY, recentReportCount: 0 }))
  expect(d.cause).toBe("went_silent")
  expect(d.severity).toBe("critical")
  expect(d.fix.join(" ").toLowerCase()).toContain("deploy")
})

test("domain_mismatch: pinging from a host that isn't the configured domain", () => {
  const d = diagnoseHeartbeat(base({ pingHost: "staging.acme.com", expectedHost: "acme.com" }))
  expect(d.cause).toBe("domain_mismatch")
  expect(d.title).toContain("staging.acme.com")
  expect(d.title).toContain("acme.com")
})

test("domain_mismatch takes priority over staleness (stale + wrong host ⇒ mismatch, critical)", () => {
  const d = diagnoseHeartbeat(base({ pingHost: "wrong.com", expectedHost: "acme.com", lastSeen: NOW - 5 * DAY }))
  expect(d.cause).toBe("domain_mismatch")
  expect(d.severity).toBe("critical")
})

test("auth_gated: fresh ping, no reports, gate requires login", () => {
  const d = diagnoseHeartbeat(base({ reportGate: "login", recentReportCount: 0 }))
  expect(d.cause).toBe("auth_gated")
  expect(d.severity).toBe("warn")
  expect(d.detail.toLowerCase()).toContain("sign-in")
})

test("auth_gated does NOT fire when reports are flowing", () => {
  const d = diagnoseHeartbeat(base({ reportGate: "login", recentReportCount: 2 }))
  expect(d.cause).toBe("healthy")
})

test("auth_gated does NOT fire for anonymous gate with zero reports", () => {
  const d = diagnoseHeartbeat(base({ reportGate: "anonymous", recentReportCount: 0 }))
  expect(d.cause).toBe("healthy")
})

test("staleAfterMs override changes the silence threshold", () => {
  // 2h old ping is fresh under default 24h, but stale under a 1h window
  expect(diagnoseHeartbeat(base({ lastSeen: NOW - 2 * HOUR })).cause).toBe("healthy")
  expect(diagnoseHeartbeat(base({ lastSeen: NOW - 2 * HOUR, staleAfterMs: HOUR, recentReportCount: 0 })).cause).toBe("went_silent")
})

test("missing expectedHost skips mismatch and falls through normally", () => {
  const d = diagnoseHeartbeat(base({ pingHost: "acme.com", expectedHost: null }))
  expect(d.cause).toBe("healthy")
})

test("renderDeveloperEmail builds subject/html/text from a diagnosis and escapes input", () => {
  const diagnosis = diagnoseHeartbeat(base({ everSeen: false, lastSeen: null }))
  const mail = renderDeveloperEmail({
    projectName: "Acme <Prod>",
    diagnosis,
    dashboardUrl: "https://klavity.in/app/p1",
    fromName: "Jane",
  })
  expect(mail.subject).toContain("Acme <Prod>")
  expect(mail.subject).toContain(diagnosis.title)
  expect(mail.html).toContain("Acme &lt;Prod&gt;") // escaped in HTML body
  expect(mail.html).toContain("klavity.in/app/p1")
  expect(mail.text).toContain("Jane asked Klavity")
  expect(mail.text).toContain("widget.js")
})

test("renderDeveloperEmail handles a healthy diagnosis without crashing (empty fix)", () => {
  const mail = renderDeveloperEmail({ projectName: "Acme", diagnosis: diagnoseHeartbeat(base()) })
  expect(mail.text).toContain("No action needed")
  expect(mail.html).toContain("No action needed")
})
