import { expect, test } from "bun:test"
import { buildFunnelRow, normalizeSource, CLIENT_INGESTABLE, FUNNEL_EVENTS } from "./funnel"

test("normalizeSource: extracts utm_source from URL", () => {
  expect(normalizeSource("https://example.com?utm_source=twitter")).toBe("twitter")
})

test("normalizeSource: extracts hostname from referrer when no UTM", () => {
  expect(normalizeSource("https://example.com/page", "https://www.google.com/search?q=foo")).toBe("google.com")
})

test("normalizeSource: strips www. from referrer hostname", () => {
  expect(normalizeSource(undefined, "https://www.producthunt.com/posts/foo")).toBe("producthunt.com")
})

test("normalizeSource: returns direct when nothing is available", () => {
  expect(normalizeSource()).toBe("direct")
  expect(normalizeSource("", "")).toBe("direct")
})

test("normalizeSource: URL utm_source wins over referrer", () => {
  expect(normalizeSource("https://example.com?utm_source=newsletter", "https://google.com/")).toBe("newsletter")
})

test("normalizeSource: clamps utm_source to 100 chars", () => {
  const long = "a".repeat(200)
  expect(normalizeSource(`https://x.com?utm_source=${long}`).length).toBe(100)
})

test("buildFunnelRow: rejects unknown event", () => {
  expect(() => buildFunnelRow({ event: "made_up_event" as any })).toThrow("Unknown funnel event")
})

test("buildFunnelRow: round-trips known event", () => {
  const row = buildFunnelRow({ event: "check_started", anonId: "anon_abc", url: "https://example.com" })
  expect(row.event).toBe("check_started")
  expect(row.anon_id).toBe("anon_abc")
  expect(row.url).toBe("https://example.com")
  expect(row.id).toMatch(/^fe_/)
  expect(typeof row.created_at).toBe("number")
})

test("buildFunnelRow: derives source from url when not supplied", () => {
  const row = buildFunnelRow({ event: "check_completed", url: "https://example.com?utm_source=ph" })
  expect(row.source).toBe("ph")
})

test("buildFunnelRow: uses supplied source over derived", () => {
  const row = buildFunnelRow({ event: "lead_captured", source: "direct", url: "https://example.com?utm_source=ph" })
  expect(row.source).toBe("direct")
})

test("buildFunnelRow: serialises props to JSON", () => {
  const row = buildFunnelRow({ event: "check_completed", props: { frictions: 5 } })
  expect(row.props_json).toBe('{"frictions":5}')
})

test("buildFunnelRow: null for optional fields", () => {
  const row = buildFunnelRow({ event: "app_connected" })
  expect(row.anon_id).toBeNull()
  expect(row.email).toBeNull()
  expect(row.account_id).toBeNull()
  expect(row.props_json).toBeNull()
})

test("CLIENT_INGESTABLE is a subset of FUNNEL_EVENTS", () => {
  const events = new Set(FUNNEL_EVENTS as readonly string[])
  for (const e of CLIENT_INGESTABLE) {
    expect(events.has(e)).toBe(true)
  }
})

test("client cannot fake server-owned event via CLIENT_INGESTABLE", () => {
  expect(CLIENT_INGESTABLE).not.toContain("check_completed")
  expect(CLIENT_INGESTABLE).not.toContain("lead_captured")
  expect(CLIENT_INGESTABLE).not.toContain("subscription_created")
})
