// P1 fix (2026-08-21): /api/persona/site threw a 500 ("Model did not return valid JSON")
// on malformed/truncated LLM output on the onboarding aha-path. The handler now:
//   1. retries the chat() call ONCE on a parseJSON failure (reinforced "minified JSON only"
//      prompt + higher token ceiling — survives transient garble AND truncation), and
//   2. returns a friendly 422 (NOT a 500) if the retry also fails, so it stops paging P1.
//
// These are end-to-end tests against a spawned server with a stubbed OpenRouter endpoint and a
// stubbed "site" page (loopback allowed via KLAV_TEST_ALLOW_LOOPBACK). The AI stub is stateful,
// keyed off a scenario marker embedded in the page text, so it can return "bad-then-good" for the
// retry case and "always-bad" for the graceful-failure case.
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-personasite-${RUN}.db`)

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

// Scenario markers embedded in the served page text so the AI stub can branch per scenario.
const MARK_RETRY = "SCENARIORETRYTHENOK"
const MARK_ALWAYS = "SCENARIOALWAYSBAD"

// Truncated JSON — parseJSON's repair ladder cannot recover this and throws
// "Model did not return valid JSON" (the exact P1 failure mode).
const BAD_JSON = '{"personas":[{"name":"Alice","insights":[{"text":"slow"'
const GOOD_JSON = JSON.stringify({
  personas: [
    { name: "Alice Smith", role: "Product Manager", simClass: "user", side: "external", initials: "AS", accent: "#6366f1", desc: "PM who cares about speed", summary: "A hands-on PM", insights: [{ kind: "pain", text: "slow", quote: "it feels slow" }, { kind: "want", text: "faster", quote: "make it fast" }, { kind: "love", text: "clean UI", quote: "looks clean" }] },
    { name: "Bob Jones", role: "Ops Lead", simClass: "user", side: "external", initials: "BJ", accent: "#22c55e", desc: "Ops lead watching reliability", summary: "Reliability-focused", insights: [{ kind: "pain", text: "flaky", quote: "it breaks" }, { kind: "want", text: "stable", quote: "keep it stable" }, { kind: "love", text: "alerts", quote: "love the alerts" }] },
  ],
})

// Per-scenario call counters (asserted to prove a retry actually happened).
const aiCalls: Record<string, number> = { [MARK_RETRY]: 0, [MARK_ALWAYS]: 0 }

let pageServer: ReturnType<typeof Bun.serve>
let PAGE_BASE = ""
let aiServer: ReturnType<typeof Bun.serve>
let AI_BASE = ""
let appProc: ReturnType<typeof Bun.spawn>
let BASE = ""

beforeAll(async () => {
  // Stub page server — two pages, each carrying a scenario marker + enough real text (>40 chars).
  pageServer = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url)
      const marker = url.pathname.includes("always") ? MARK_ALWAYS : MARK_RETRY
      return new Response(
        `<html><head><title>Acme SaaS</title></head><body>
          <h1>Acme analytics for busy product teams</h1>
          <p>Track funnels, ship faster, and understand your users. Pricing from $29.
          Marker ${marker} for the test harness to branch on.</p>
        </body></html>`,
        { headers: { "content-type": "text/html" } },
      )
    },
  })
  PAGE_BASE = `http://localhost:${pageServer.port}`

  // Stub OpenRouter — inspects the forwarded page text for a scenario marker and returns
  // bad-then-good (retry scenario) or always-bad (graceful-failure scenario).
  aiServer = Bun.serve({
    port: 0,
    async fetch(req) {
      const body = await req.json().catch(() => ({} as any))
      const asText = JSON.stringify(body?.messages || "")
      const marker = asText.includes(MARK_ALWAYS) ? MARK_ALWAYS : MARK_RETRY
      aiCalls[marker] = (aiCalls[marker] || 0) + 1
      let content: string
      if (marker === MARK_ALWAYS) {
        content = BAD_JSON
      } else {
        // First call malformed, second (retry) valid.
        content = aiCalls[marker] === 1 ? BAD_JSON : GOOD_JSON
      }
      return Response.json({
        choices: [{ message: { content } }],
        usage: { prompt_tokens: 100, completion_tokens: 80, cost: 0.001 },
      })
    },
  })
  AI_BASE = `http://localhost:${aiServer.port}`

  const port = 47950 + Math.floor(Math.random() * 200)
  BASE = `http://localhost:${port}`

  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(59)).toString("base64"),
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_ENDPOINT: AI_BASE,
      KLAV_TEST_ALLOW_LOOPBACK: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
    },
    stdout: "ignore",
    stderr: "ignore",
  })

  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
})

afterAll(() => {
  appProc?.kill()
  pageServer?.stop(true)
  aiServer?.stop(true)
  raw.close()
  rmDb()
})

const postSite = (siteUrl: string) =>
  fetch(`${BASE}/api/persona/site`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: siteUrl }),
  })

test("malformed JSON on first call triggers a retry that then succeeds (200, not 500)", async () => {
  const res = await postSite(`${PAGE_BASE}/retry-then-ok`)
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(Array.isArray(body.personas)).toBe(true)
  expect(body.personas.length).toBeGreaterThan(0)
  expect(body.personas[0].name).toBe("Alice Smith")
  // Exactly two chat() calls: the failed first + the successful retry.
  expect(aiCalls[MARK_RETRY]).toBe(2)
})

test("persistently malformed JSON returns a graceful 422 (never a 500/throw)", async () => {
  const res = await postSite(`${PAGE_BASE}/always-bad`)
  expect(res.status).toBe(422)
  expect(res.status).not.toBe(500)
  const body = await res.json()
  expect(String(body.error || "")).toContain("Couldn't read that page")
  // One retry was attempted before giving up: first call + one retry = 2.
  expect(aiCalls[MARK_ALWAYS]).toBe(2)
})
