import { test, expect } from "bun:test"
import { fallbackDraftTitle, fallbackDraftDescription } from "./label-suggest"

test("fallbackDraftTitle: page path when a URL is given", () => {
  expect(fallbackDraftTitle({ reportType: "bug", pageUrl: "https://app.example.com/app/login?x=1" }))
    .toBe("Screenshot report on /app/login")
})

test("fallbackDraftTitle: feature noun for a feature request", () => {
  expect(fallbackDraftTitle({ reportType: "feature", pageUrl: "https://x.com/settings" }))
    .toBe("Feature request on /settings")
})

test("fallbackDraftTitle: bare noun when there's no usable path (root or missing URL)", () => {
  expect(fallbackDraftTitle({ pageUrl: "https://x.com/" })).toBe("Screenshot report")
  expect(fallbackDraftTitle({ pageUrl: null })).toBe("Screenshot report")
  expect(fallbackDraftTitle({})).toBe("Screenshot report")
})

test("fallbackDraftTitle: a non-URL string still degrades to its path-ish prefix", () => {
  expect(fallbackDraftTitle({ pageUrl: "/app/reports?tab=1" })).toBe("Screenshot report on /app/reports")
})

// KD-162: a screenshot-only report (no typed description) used to fall back to whatever raw text the
// widget happened to send — often a bare page URL with an opaque id baked in, sometimes nothing at all.
// fallbackDraftDescription composes something actually useful from context every report already carries.
test("KD-162: fallbackDraftDescription composes page + capture time + client info", () => {
  const ms = Date.UTC(2026, 8, 18, 16, 35) // 18 Sep 2026, 16:35 UTC
  const out = fallbackDraftDescription({
    reportType: "bug",
    pageUrl: "https://app.example.com/app/login",
    createdAt: ms,
    clientInfo: { browser: "Chrome", browserVersion: "118.0", os: "Windows 11", viewport: "1280x800" },
  })
  expect(out).toContain("Screenshot report on /app/login")
  expect(out).toContain("Captured: 18 Sep 2026, 04:35 PM UTC")
  expect(out).toContain("Client: Chrome 118.0 | Windows 11 | viewport 1280x800")
})

test("KD-162: fallbackDraftDescription never shows a raw/opaque page URL as the primary line — it's the same clean title fallbackDraftTitle produces", () => {
  const out = fallbackDraftDescription({
    pageUrl: "https://app.example.com/dashboard/reports/8472910384729104",
    createdAt: Date.now(),
  })
  const firstLine = out.split("\n")[0]
  expect(firstLine).toBe("Screenshot report on /dashboard/reports/8472910384729104")
  // the numeric id is still present (in the URL-derived path), per the ticket's own allowance
  // ("random identifiers... should remain part of the URL... where applicable") — it's just no longer
  // the WHOLE description, and it's paired with capture time immediately after.
  expect(out.split("\n")[1]).toMatch(/^Captured: /)
})

test("KD-162: fallbackDraftDescription is graceful with no clientInfo (no 'Client:' line, no crash)", () => {
  const out = fallbackDraftDescription({ pageUrl: "https://x.com/y", createdAt: Date.now() })
  expect(out).not.toContain("Client:")
  const out2 = fallbackDraftDescription({ pageUrl: "https://x.com/y", createdAt: Date.now(), clientInfo: null })
  expect(out2).not.toContain("Client:")
})

test("KD-162: fallbackDraftDescription is capped so a pathological clientInfo can't blow up the description", () => {
  const out = fallbackDraftDescription({
    pageUrl: "https://x.com/y",
    createdAt: Date.now(),
    clientInfo: { browser: "x".repeat(5000), os: "y".repeat(5000) },
  })
  expect(out.length).toBeLessThanOrEqual(1000)
})
