// Unit tests for the short-link pure helpers (Task 1).
import { test, expect } from "bun:test"
import { genCode, isValidSlug, RESERVED_SLUGS, stampUtm, isBotRequest, hashIp } from "./shortlinks"

// ── stampUtm ──────────────────────────────────────────────────────────────────
test("stampUtm sets provided utm_* params on the destination", () => {
  const out = stampUtm("https://example.com/landing", {
    source: "reddit", medium: "post", campaign: "q3", term: "kw", content: "ad1",
  })
  const u = new URL(out)
  expect(u.searchParams.get("utm_source")).toBe("reddit")
  expect(u.searchParams.get("utm_medium")).toBe("post")
  expect(u.searchParams.get("utm_campaign")).toBe("q3")
  expect(u.searchParams.get("utm_term")).toBe("kw")
  expect(u.searchParams.get("utm_content")).toBe("ad1")
})

test("stampUtm: link value OVERRIDES any pre-existing utm on the destination", () => {
  const out = stampUtm("https://example.com/?utm_source=old&keep=1", { source: "new" })
  const u = new URL(out)
  expect(u.searchParams.get("utm_source")).toBe("new")
  expect(u.searchParams.get("keep")).toBe("1") // unrelated params preserved
  // no duplicate utm_source
  expect(u.searchParams.getAll("utm_source")).toEqual(["new"])
})

test("stampUtm omits empty/null/undefined params (no blank utm_ keys)", () => {
  const out = stampUtm("https://example.com/", { source: "x", medium: "", campaign: undefined as any, term: null as any })
  const u = new URL(out)
  expect(u.searchParams.get("utm_source")).toBe("x")
  expect(u.searchParams.has("utm_medium")).toBe(false)
  expect(u.searchParams.has("utm_campaign")).toBe(false)
  expect(u.searchParams.has("utm_term")).toBe(false)
})

test("stampUtm does NOT double-encode already-valid values", () => {
  const out = stampUtm("https://example.com/", { campaign: "a b&c" })
  // decoded round-trips cleanly (single-encoding)
  expect(new URL(out).searchParams.get("utm_campaign")).toBe("a b&c")
  expect(out).not.toContain("%2520") // no double-encoded space
})

test("stampUtm returns non-URL / relative destinations unchanged", () => {
  expect(stampUtm("/relative/path", { source: "x" })).toBe("/relative/path")
  expect(stampUtm("not a url", { source: "x" })).toBe("not a url")
})

// ── genCode ───────────────────────────────────────────────────────────────────
test("genCode returns a 6-char base62 string", () => {
  for (let i = 0; i < 50; i++) {
    const c = genCode()
    expect(c).toMatch(/^[0-9A-Za-z]{6}$/)
  }
})

test("genCode is not trivially constant", () => {
  const s = new Set(Array.from({ length: 30 }, () => genCode()))
  expect(s.size).toBeGreaterThan(1)
})

// ── isValidSlug ───────────────────────────────────────────────────────────────
test("isValidSlug accepts lowercase alnum + hyphen, 3-40 chars", () => {
  expect(isValidSlug("abc")).toBe(true)
  expect(isValidSlug("q3-launch-2026")).toBe(true)
  expect(isValidSlug("a".repeat(40))).toBe(true)
})

test("isValidSlug rejects bad shapes", () => {
  expect(isValidSlug("ab")).toBe(false)            // too short
  expect(isValidSlug("a".repeat(41))).toBe(false)  // too long
  expect(isValidSlug("UPPER")).toBe(false)         // uppercase
  expect(isValidSlug("has space")).toBe(false)
  expect(isValidSlug("under_score")).toBe(false)
  expect(isValidSlug("")).toBe(false)
})

test("isValidSlug rejects reserved words", () => {
  for (const r of RESERVED_SLUGS) expect(isValidSlug(r)).toBe(false)
  expect(RESERVED_SLUGS).toContain("api")
  expect(RESERVED_SLUGS).toContain("superadmin")
  expect(RESERVED_SLUGS).toContain("s")
  expect(RESERVED_SLUGS).toContain("r")
})

// ── isBotRequest ──────────────────────────────────────────────────────────────
test("isBotRequest: HEAD method is a bot/prefetch", () => {
  expect(isBotRequest({ method: "HEAD" })).toBe(true)
  expect(isBotRequest({ method: "GET" })).toBe(false)
})

test("isBotRequest: known bot user-agents", () => {
  expect(isBotRequest({ ua: "Googlebot/2.1 (+http://www.google.com/bot.html)" })).toBe(true)
  expect(isBotRequest({ ua: "facebookexternalhit/1.1" })).toBe(true)
  expect(isBotRequest({ ua: "Slackbot-LinkExpanding 1.0" })).toBe(true)
  expect(isBotRequest({ ua: "curl/8.1" })).toBe(true)
  expect(isBotRequest({ ua: "Mozilla/5.0 (Macintosh) Chrome/120 Safari/537" })).toBe(false)
})

test("isBotRequest: prefetch signals", () => {
  expect(isBotRequest({ secPurpose: "prefetch;prerender" })).toBe(true)
  expect(isBotRequest({ purpose: "prefetch" })).toBe(true)
  expect(isBotRequest({ secPurpose: "" })).toBe(false)
})

// ── hashIp ────────────────────────────────────────────────────────────────────
test("hashIp is deterministic hex and hides the raw IP", () => {
  const h = hashIp("203.0.113.7")
  expect(h).toMatch(/^[0-9a-f]{64}$/)
  expect(h).not.toContain("203.0.113.7")
  expect(hashIp("203.0.113.7")).toBe(h) // deterministic
  expect(hashIp("203.0.113.8")).not.toBe(h)
})

test("hashIp: empty/unknown IP returns empty (no PII, no fake hash)", () => {
  expect(hashIp("")).toBe("")
  expect(hashIp("unknown")).toBe("")
})
