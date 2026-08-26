// #434 — trim noisy technical logs from the Jira/ticket BODY.
// The console/network dump is bounded, deduped, and denoised in the RENDERED body only; the full
// arrays remain in storage. These pure tests exercise trimConsoleLines/trimNetworkLines directly and
// verify the HTML/text renderers stay bounded while retaining error signal.

import { test, expect, describe } from "bun:test"
import {
  trimConsoleLines, trimNetworkLines, clientContextLines, clientContextHtml,
  buildLogAttachmentText, LOG_ATTACHMENT_FILENAME,
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

// KLA-582: console/network logs moved OUT of the ticket body and into a file attachment. The body
// renderers must no longer emit any Console/Network/Performance dump; the file builder carries them.
describe("KLA-582: console/network logs are OUT of the body, IN a file attachment", () => {
  const ctx = {
    userAgent: "Mozilla/5.0 test",
    identity: { email: "user@acme.com" },
    consoleErrors: [
      ...Array.from({ length: 300 }, (_, i) => ({ level: "warn", message: "repeat warn", timestamp: i })),
      { level: "error", message: "TypeError: real bug", timestamp: 999, stack: "at foo\nat bar" },
    ],
    networkFailures: [
      { method: "GET", url: "https://www.googletagmanager.com/gtm.js", status: 200, timestamp: 1 },
      { method: "POST", url: "https://api.acme.com/save", status: 500, timestamp: 100, durationMs: 42 },
    ],
    perfEntries: [{ type: "longtask", name: "self", startMs: 0, durationMs: 120 }],
  }

  test("text body keeps identity/browser but drops the console/network/perf dump", () => {
    const lines = clientContextLines(ctx).join("\n")
    expect(lines).toContain("Browser: Mozilla/5.0 test")
    expect(lines).toContain("email: user@acme.com")
    expect(lines).not.toContain("Console")
    expect(lines).not.toContain("Network")
    expect(lines).not.toContain("Performance")
    expect(lines).not.toContain("TypeError: real bug")
    expect(lines).not.toContain("api.acme.com/save")
  })

  test("html body keeps browser but drops the console/network/perf dump", () => {
    const html = clientContextHtml(ctx)
    expect(html).toContain("Mozilla/5.0 test")
    expect(html).not.toContain("Console (")
    expect(html).not.toContain("Network (")
    expect(html).not.toContain("Performance (")
    expect(html).not.toContain("TypeError: real bug")
  })

  test("buildLogAttachmentText serializes the FULL console/network/perf capture", () => {
    const txt = buildLogAttachmentText(ctx)!
    expect(txt).toBeTruthy()
    expect(LOG_ATTACHMENT_FILENAME).toBe("console-network-logs.txt")
    // header + all three sections present
    expect(txt).toContain("=== Console (301) ===")
    expect(txt).toContain("=== Network (2) ===")
    expect(txt).toContain("=== Performance (1) ===")
    // full fidelity: the real error + its stack, the GTM beacon (NOT dropped in the file), and the 500
    expect(txt).toContain("[error] TypeError: real bug")
    expect(txt).toContain("at foo")
    expect(txt).toContain("googletagmanager.com/gtm.js")
    expect(txt).toContain("api.acme.com/save → 500 (42ms)")
    // every one of the 300 repeated warnings is present (no dedupe/cap in the file)
    expect(txt.split("repeat warn").length - 1).toBe(300)
  })

  test("buildLogAttachmentText returns null when there is nothing to attach", () => {
    expect(buildLogAttachmentText({ userAgent: "x", identity: { email: "a@b.com" } })).toBe(null)
    expect(buildLogAttachmentText(null)).toBe(null)
    expect(buildLogAttachmentText({ consoleErrors: [], networkFailures: [] })).toBe(null)
  })

  test("html still escapes any surviving fields", () => {
    const html = clientContextHtml({ userAgent: "<script>alert(1)</script>", consoleErrors: [], networkFailures: [] })
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain("&lt;script&gt;")
  })
})
