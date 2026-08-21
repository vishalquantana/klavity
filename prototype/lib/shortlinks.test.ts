// Unit tests for the short-link pure helpers (Task 1).
import { test, expect } from "bun:test"
import { genCode, isValidSlug, RESERVED_SLUGS, stampUtm, isBotRequest, hashIp, normalizeReferer, coarsenUa } from "./shortlinks"

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

test("RESERVED_SLUGS covers live top-level route names (Codex review)", () => {
  for (const r of ["home", "privacy", "terms", "pricing", "snap", "trails", "opsadmin", "onboarding"]) {
    expect(RESERVED_SLUGS).toContain(r)
    expect(isValidSlug(r)).toBe(false)
  }
  // the original ten are retained
  for (const r of ["api", "login", "superadmin", "s", "r", "dashboard", "health", "widget", "blog", "admin"]) {
    expect(RESERVED_SLUGS).toContain(r)
  }
})

// ── genCode uniformity (rejection sampling kills modulo bias) ────────────────────
test("genCode is ~uniform over base62 (no first-8-symbol bias)", () => {
  const counts = new Map<string, number>()
  const N = 20000
  for (let i = 0; i < N; i++) for (const ch of genCode()) counts.set(ch, (counts.get(ch) || 0) + 1)
  // 62 symbols over 6*N draws → expected ~ (6*N)/62 each. With rejection sampling the spread stays
  // tight; a biased `% 62` would inflate "0".."7" by ~1.6x. Assert max/min ratio is modest.
  const vals = [...counts.values()]
  expect(counts.size).toBe(62) // every symbol appears
  const max = Math.max(...vals), min = Math.min(...vals)
  expect(max / min).toBeLessThan(1.3)
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
test("hashIp with KLAV_SECRET: deterministic keyed HMAC that hides the raw IP", () => {
  const prev = process.env.KLAV_SECRET
  process.env.KLAV_SECRET = "test-secret-abc"
  try {
    const h = hashIp("203.0.113.7")
    expect(h).toMatch(/^[0-9a-f]{64}$/)
    expect(h).not.toContain("203.0.113.7")
    expect(hashIp("203.0.113.7")).toBe(h) // deterministic
    expect(hashIp("203.0.113.8")).not.toBe(h)
    // keyed: a different secret yields a different digest (not a bare SHA-256)
    process.env.KLAV_SECRET = "test-secret-xyz"
    expect(hashIp("203.0.113.7")).not.toBe(h)
  } finally {
    if (prev === undefined) delete process.env.KLAV_SECRET; else process.env.KLAV_SECRET = prev
  }
})

test("hashIp WITHOUT a secret returns '' — no weak/dictionary-recoverable hash (Codex MED)", () => {
  const prev = process.env.KLAV_SECRET
  delete process.env.KLAV_SECRET
  try {
    expect(hashIp("203.0.113.7")).toBe("")
    expect(hashIp("10.0.0.1")).toBe("")
  } finally {
    if (prev !== undefined) process.env.KLAV_SECRET = prev
  }
})

test("hashIp: empty/unknown IP returns empty (no PII, no fake hash)", () => {
  process.env.KLAV_SECRET = "test-secret-abc"
  expect(hashIp("")).toBe("")
  expect(hashIp("unknown")).toBe("")
})

// ── normalizeReferer (Codex HIGH: PII) ──────────────────────────────────────────
test("normalizeReferer keeps HOST ONLY, dropping path/query (no email/token PII leaks)", () => {
  expect(normalizeReferer("https://x.com/p?email=a@b.com&token=123")).toBe("x.com")
  const out = normalizeReferer("https://x.com/p?email=a@b.com&token=123")!
  expect(out).not.toContain("email")
  expect(out).not.toContain("a@b.com")
  expect(out).not.toContain("token")
  expect(out).not.toContain("123")
})

test("normalizeReferer keeps port but drops userinfo/scheme/fragment", () => {
  expect(normalizeReferer("https://user:pass@host.example:8443/path#frag")).toBe("host.example:8443")
})

test("normalizeReferer returns null for absent/unparseable referers", () => {
  expect(normalizeReferer(null)).toBe(null)
  expect(normalizeReferer(undefined)).toBe(null)
  expect(normalizeReferer("")).toBe(null)
  expect(normalizeReferer("not a url")).toBe(null)
})

// ── coarsenUa (Codex HIGH: fingerprinting) ──────────────────────────────────────
test("coarsenUa strips precise version numbers and truncates", () => {
  const out = coarsenUa("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.6099.71 Safari/537.36")!
  expect(out).not.toMatch(/120\.0\.6099\.71/)
  expect(out).not.toMatch(/537\.36/)
  expect(out.length).toBeLessThanOrEqual(120)
  expect(out.toLowerCase()).toContain("chrome") // coarse family hint survives
})

test("coarsenUa returns null for empty UA", () => {
  expect(coarsenUa(null)).toBe(null)
  expect(coarsenUa("")).toBe(null)
})
