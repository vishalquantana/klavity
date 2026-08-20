// #434 — trim noisy technical logs from the Jira/ticket BODY.
// The console/network dump is bounded, deduped, and denoised in the RENDERED body only; the full
// arrays remain in storage. These pure tests exercise trimConsoleLines/trimNetworkLines directly and
// verify the HTML/text renderers stay bounded while retaining error signal.

import { test, expect, describe } from "bun:test"
import {
  trimConsoleLines, trimNetworkLines, clientContextLines, clientContextHtml,
  LOG_MAX_CONSOLE_LINES, LOG_MAX_NETWORK_LINES, LOG_MAX_LINE_LEN,
} from "./feedback"

describe("trimConsoleLines", () => {
  test("500 noisy lines render bounded + deduped, errors retained", () => {
    const errors: any[] = []
    // 480 repeated identical warnings (noise) + 20 distinct errors (signal).
    for (let i = 0; i < 480; i++) errors.push({ level: "warn", message: "Deprecation warning: foo() is deprecated", timestamp: i })
    for (let i = 0; i < 20; i++) errors.push({ level: "error", message: `TypeError: boom #${i}`, timestamp: 1000 + i })
    const { lines, omitted } = trimConsoleLines(errors)
    // Bounded
    expect(lines.length).toBeLessThanOrEqual(LOG_MAX_CONSOLE_LINES)
    // The 480 identical warnings collapse into ONE deduped line with a count.
    const warnLine = lines.find(l => l.includes("Deprecation warning"))
    expect(warnLine).toContain("(x480)")
    // Every one of the 20 distinct errors is retained (they float to the front and fit under the cap).
    for (let i = 0; i < 20; i++) expect(lines.some(l => l.includes(`TypeError: boom #${i}`))).toBe(true)
    expect(omitted).toBe(0) // 21 distinct lines total ≤ cap
  })
  test("errors are prioritized over warnings when distinct lines exceed the cap", () => {
    const errors: any[] = []
    for (let i = 0; i < 60; i++) errors.push({ level: "warn", message: `warn ${i}`, timestamp: i })
    for (let i = 0; i < 10; i++) errors.push({ level: "error", message: `err ${i}`, timestamp: 100 + i })
    const { lines, omitted } = trimConsoleLines(errors)
    expect(lines.length).toBe(LOG_MAX_CONSOLE_LINES)
    for (let i = 0; i < 10; i++) expect(lines.some(l => l.includes(`[error] err ${i}`))).toBe(true)
    expect(omitted).toBeGreaterThan(0)
  })
  test("per-line length is capped", () => {
    const { lines } = trimConsoleLines([{ level: "error", message: "x".repeat(5000) }])
    // "[error] " prefix + capped message
    expect(lines[0].length).toBeLessThanOrEqual(LOG_MAX_LINE_LEN + 16)
  })
  test("empty messages dropped", () => {
    expect(trimConsoleLines([{ level: "error", message: "  " }, { level: "log", message: "" }]).lines).toHaveLength(0)
  })
})

describe("trimNetworkLines", () => {
  test("drops analytics/beacon noise, keeps real failed requests", () => {
    const fails = [
      { method: "POST", url: "https://www.google-analytics.com/collect?v=1", status: 200 },
      { method: "GET", url: "https://api.segment.io/v1/t", status: 200 },
      { method: "POST", url: "https://app.posthog.com/e/", status: 200 },
      { method: "GET", url: "https://api.acme.com/orders/42", status: 500, durationMs: 120 },
      { method: "POST", url: "https://api.acme.com/checkout", status: 502 },
    ]
    const { lines, dropped } = trimNetworkLines(fails)
    expect(dropped).toBe(3)
    expect(lines).toHaveLength(2)
    expect(lines.some(l => l.includes("orders/42") && l.includes("500") && l.includes("120ms"))).toBe(true)
    expect(lines.some(l => l.includes("checkout") && l.includes("502"))).toBe(true)
    expect(lines.some(l => l.includes("google-analytics"))).toBe(false)
  })
  test("dedupes identical failing requests with a count", () => {
    const fails = Array.from({ length: 50 }, () => ({ method: "GET", url: "https://api.acme.com/poll", status: 503 }))
    const { lines, omitted } = trimNetworkLines(fails)
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain("(x50)")
    expect(omitted).toBe(0)
  })
  test("distinct failures beyond the cap are bounded", () => {
    const fails = Array.from({ length: LOG_MAX_NETWORK_LINES + 15 }, (_, i) => ({ method: "GET", url: `https://api.acme.com/r/${i}`, status: 500 }))
    const { lines, omitted } = trimNetworkLines(fails)
    expect(lines).toHaveLength(LOG_MAX_NETWORK_LINES)
    expect(omitted).toBe(15)
  })
})

describe("renderers stay bounded + note the trim", () => {
  const ctx = {
    consoleErrors: [
      ...Array.from({ length: 300 }, (_, i) => ({ level: "warn", message: "repeat warn", timestamp: i })),
      { level: "error", message: "TypeError: real bug", timestamp: 999 },
    ],
    networkFailures: [
      ...Array.from({ length: 40 }, (_, i) => ({ method: "GET", url: "https://www.googletagmanager.com/gtm.js", status: 200, timestamp: i })),
      { method: "POST", url: "https://api.acme.com/save", status: 500, timestamp: 100 },
    ],
  }
  test("text lines keep the error + collapse the noise", () => {
    const lines = clientContextLines(ctx)
    expect(lines.some(l => l.includes("Console (301):"))).toBe(true) // header shows the FULL captured count
    expect(lines.some(l => l.includes("TypeError: real bug"))).toBe(true)
    expect(lines.some(l => l.includes("repeat warn") && l.includes("(x300)"))).toBe(true)
    // network: the 40 GTM beacons are hidden; the real 500 stays.
    expect(lines.some(l => l.includes("api.acme.com/save") && l.includes("500"))).toBe(true)
    expect(lines.some(l => l.includes("analytics/beacon hidden"))).toBe(true)
  })
  test("html escapes + bounds", () => {
    const html = clientContextHtml({ consoleErrors: [{ level: "error", message: "<script>alert(1)</script>" }], networkFailures: [] })
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain("&lt;script&gt;")
  })
})
