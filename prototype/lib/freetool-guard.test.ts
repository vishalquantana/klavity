// KLAVITYKLA-487 — unit tests for the free-tool abuse/teaser/attribution guard.
// Hermetic: point the db singleton at a fresh LOCAL libsql file BEFORE importing ./db (same pattern
// as ai-credits.test.ts — Bun shares one module registry across test files).
import { test, expect, beforeAll, afterEach } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-freetool-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema } = await import("./db")
const G = await import("./freetool-guard")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
})

afterEach(() => {
  delete process.env.KLAV_FREETOOL_DAILY_CAP
  delete process.env.KLAV_FREETOOL_COST_CAP_USD
  delete process.env.KLAV_INTERNAL_DOMAINS
  delete process.env.TURNSTILE_SECRET_KEY
})

const rid = () => Math.random().toString(36).slice(2)

// ── disposable / internal ───────────────────────────────────────────────────────────────────────
test("isDisposableEmail: blocks temp inboxes, passes real + internal domains", () => {
  expect(G.isDisposableEmail("x7f@mailinator.com")).toBe(true)
  expect(G.isDisposableEmail("a@10minutemail.com")).toBe(true)
  expect(G.isDisposableEmail("a@guerrillamail.com")).toBe(true)
  expect(G.isDisposableEmail("a@temp-mail.org")).toBe(true)
  expect(G.isDisposableEmail("founder@stripe.com")).toBe(false)
  // internal staff domains must ALWAYS pass, even if someone later adds them to the block list
  expect(G.isDisposableEmail("vishal@quantana.com.au")).toBe(false)
  expect(G.isDisposableEmail("ops@quantana.in")).toBe(false)
})

test("validateFreetoolEmail: format + disposable gating with codes", () => {
  expect(G.validateFreetoolEmail("not-an-email")).toEqual({ ok: false, code: "format", error: "Enter a valid email." })
  expect(G.validateFreetoolEmail("a@mailinator.com").ok).toBe(false)
  expect((G.validateFreetoolEmail("a@mailinator.com") as any).code).toBe("disposable")
  const ok = G.validateFreetoolEmail("  Vishal@Quantana.Com.Au ")
  expect(ok).toEqual({ ok: true, email: "vishal@quantana.com.au" })
})

test("KLAV_INTERNAL_DOMAINS extends the internal bypass for disposable check", () => {
  process.env.KLAV_INTERNAL_DOMAINS = "mailinator.com"
  // now mailinator counts as internal → NOT disposable (env-driven allowlist wins)
  expect(G.isDisposableEmail("a@mailinator.com")).toBe(false)
})

// ── teaser shape ──────────────────────────────────────────────────────────────────────────────────
test("makeTeaser: visible subset + lockedCount + headline", () => {
  const items = [1, 2, 3, 4, 5]
  const t = G.makeTeaser(items, { visibleCount: 2, headline: "We found 5 issues" })
  expect(t.teaser).toBe(true)
  expect(t.headline).toBe("We found 5 issues")
  expect(t.visible).toEqual([1, 2])
  expect(t.lockedCount).toBe(3)
})

test("makeTeaser: clamps visibleCount and never returns negative lockedCount", () => {
  expect(G.makeTeaser([1, 2], { visibleCount: 10, headline: "h" })).toEqual({ teaser: true, headline: "h", visible: [1, 2], lockedCount: 0 })
  expect(G.makeTeaser([], { visibleCount: 2, headline: "h" }).lockedCount).toBe(0)
})

// ── rate limit + daily reset ─────────────────────────────────────────────────────────────────────
test("checkFreetoolRun: per-IP cap trips at the limit and rolls over the next UTC day", async () => {
  process.env.KLAV_FREETOOL_DAILY_CAP = "3"
  const ip = "203.0.113." + Math.floor(Math.random() * 250)
  const day1 = Date.UTC(2026, 0, 10, 12) // fixed day
  // 3 runs allowed, 4th trips
  for (let i = 0; i < 3; i++) {
    const g = await G.checkFreetoolRun({ ip, atMs: day1 })
    expect(g.allowed).toBe(true)
    await G.bumpFreetoolRun(G.ipBucket(ip), day1)
  }
  const tripped = await G.checkFreetoolRun({ ip, atMs: day1 })
  expect(tripped.allowed).toBe(false)
  expect((tripped as any).reason).toBe("rate")
  expect((tripped as any).resetHours).toBeGreaterThan(0)
  // NEXT day → counter resets, run allowed again
  const day2 = day1 + 86_400_000
  const next = await G.checkFreetoolRun({ ip, atMs: day2 })
  expect(next.allowed).toBe(true)
})

test("checkFreetoolRun: per-EMAIL cap trips independently of IP", async () => {
  process.env.KLAV_FREETOOL_DAILY_CAP = "2"
  const email = `lead_${rid()}@example.com`
  const day = Date.UTC(2026, 0, 11, 8)
  await G.bumpFreetoolRun(G.emailBucket(email), day)
  await G.bumpFreetoolRun(G.emailBucket(email), day)
  // fresh IP but the email is already at cap → tripped
  const g = await G.checkFreetoolRun({ ip: "198.51.100." + Math.floor(Math.random() * 250), email, atMs: day })
  expect(g.allowed).toBe(false)
})

// ── cost cap ─────────────────────────────────────────────────────────────────────────────────────
test("checkFreetoolRun: per-session cost cap blocks BEFORE spend when the $ ceiling is reached", async () => {
  process.env.KLAV_FREETOOL_DAILY_CAP = "999" // isolate the cost path from the run cap
  process.env.KLAV_FREETOOL_COST_CAP_USD = "0.10"
  const ip = "192.0.2." + Math.floor(Math.random() * 250)
  const day = Date.UTC(2026, 0, 12, 9)
  await G.bumpFreetoolCost(G.ipBucket(ip), 0.10, day)
  const g = await G.checkFreetoolRun({ ip, atMs: day })
  expect(g.allowed).toBe(false)
  expect((g as any).reason).toBe("cost")
})

// ── turnstile-on-trip: hard block when keys unset ────────────────────────────────────────────────
test("checkFreetoolRun: a trip with a token but NO Turnstile keys stays hard-blocked (no silent bypass)", async () => {
  process.env.KLAV_FREETOOL_DAILY_CAP = "1"
  delete process.env.TURNSTILE_SECRET_KEY // Turnstile not configured
  const ip = "203.0.113." + Math.floor(Math.random() * 250)
  const day = Date.UTC(2026, 0, 13, 9)
  await G.bumpFreetoolRun(G.ipBucket(ip), day)
  const g = await G.checkFreetoolRun({ ip, turnstileToken: "any-token", atMs: day })
  expect(g.allowed).toBe(false)
  expect((g as any).needTurnstile).toBe(false) // UI must NOT show a challenge it can't verify
})
