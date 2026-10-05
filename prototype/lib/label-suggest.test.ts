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
// fallbackDraftDescription composes something actually useful from context every report already carries:
// a readable page title, the application path, and the capture time. (A 4th line — an AI caption of the
// screenshot — is appended separately, asynchronously, by server.ts's captionScreenshotForFeedback.)
test("KD-162: fallbackDraftDescription composes a readable page title + labeled path + capture time", () => {
  const ms = Date.UTC(2026, 8, 21, 7, 25) // 21 Sep 2026, 07:25 UTC
  const out = fallbackDraftDescription({
    reportType: "bug",
    pageUrl: "https://app.example.com/index.php/Actions/actions_list",
    createdAt: ms,
  })
  expect(out).toBe(
    "Actions List page\n" +
    "Application path : /index.php/Actions/actions_list\n" +
    "Captured: 21 Sep 2026, 07:25 AM UTC"
  )
})

test("KD-162: falls back to fallbackDraftTitle's wording when the last path segment is an opaque id", () => {
  const out = fallbackDraftDescription({
    pageUrl: "https://app.example.com/dashboard/reports/8472910384729104",
    createdAt: Date.now(),
  })
  const lines = out.split("\n")
  // no raw digit-string masquerading as a title — falls back to the clean noun+path form instead
  expect(lines[0]).toBe("Screenshot report on /dashboard/reports/8472910384729104")
  expect(lines[1]).toBe("Application path : /dashboard/reports/8472910384729104")
  expect(lines[2]).toMatch(/^Captured: /)
})

test("KD-162: title-cases underscore/hyphen-separated path segments", () => {
  expect(fallbackDraftDescription({ pageUrl: "https://x.com/user-settings", createdAt: Date.now() }).split("\n")[0])
    .toBe("User Settings page")
})

test("KD-162: no path (root or missing URL) degrades to the bare fallbackDraftTitle noun, no path line", () => {
  const out = fallbackDraftDescription({ pageUrl: "https://x.com/", createdAt: Date.now() })
  expect(out.split("\n")[0]).toBe("Screenshot report")
  expect(out).not.toContain("Application path")
  const out2 = fallbackDraftDescription({ pageUrl: null, createdAt: Date.now() })
  expect(out2.split("\n")[0]).toBe("Screenshot report")
})

test("KD-162: includes an Environment line when the host resolves to a known deploy env (qa/staging/local/uat/...)", () => {
  const ms = Date.UTC(2026, 8, 21, 7, 25)
  const out = fallbackDraftDescription({
    reportType: "bug",
    pageUrl: "https://app.example.com/index.php/Actions/actions_list",
    createdAt: ms,
    reportEnv: "qa",
  })
  expect(out).toBe(
    "Actions List page\n" +
    "Application path : /index.php/Actions/actions_list\n" +
    "Environment : qa\n" +
    "Captured: 21 Sep 2026, 07:25 AM UTC"
  )
})

test("KD-162: no Environment line when reportEnv is null (plain production/web host — no recognized convention)", () => {
  const out = fallbackDraftDescription({ pageUrl: "https://x.com/y", createdAt: Date.now(), reportEnv: null })
  expect(out).not.toContain("Environment")
})

test("KD-162: a feature-type report keeps fallbackDraftTitle's explicit 'Feature request on X' wording, not the '<Title> page' bug-report phrasing", () => {
  const out = fallbackDraftDescription({ reportType: "feature", pageUrl: "https://x.com/dashboard", createdAt: Date.now() })
  expect(out.split("\n")[0]).toBe("Feature request on /dashboard")
})
