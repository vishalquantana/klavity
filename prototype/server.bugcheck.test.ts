// Integration tests for KLAVITYKLA-341: /bug-check page + mode=qa on /api/cro/analyze +
// tool-segmented /api/cro/unlock + the free-tool daily sub-cap.
//
// Mirrors server.cro.test.ts's harness (real subprocess server + stub page/AI servers) so these
// exercise the exact route handlers, not a re-implementation.
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-bugcheck-${RUN}.db`)
const DB_FILE_CAP = join(tmpdir(), `klav-bugcheck-cap-${RUN}.db`)

function rmDbFile(f: string) {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(f + suffix) } catch {}
  }
}
rmDbFile(DB_FILE)
rmDbFile(DB_FILE_CAP)

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const rawCap = createClient({ url: "file:" + DB_FILE_CAP })
await rawCap.execute("PRAGMA journal_mode=WAL")
await rawCap.execute("PRAGMA busy_timeout=5000")

// ── Stub page server — serves a landing page. Also used to inject a HOSTILE payload into the
// fetched HTML so we can prove the AI's echoed findings are safely escaped end-to-end. ──
let pageServer: ReturnType<typeof Bun.serve>
let PAGE_BASE = ""

// ── Stub OpenRouter — returns a canned response. `aiCallCount` proves whether the LLM was
// actually invoked (used by the sub-cap "does NOT consume further AI budget" assertion). ──
let aiServer: ReturnType<typeof Bun.serve>
let AI_BASE = ""
let aiCallCount = 0

// A malicious finding straight from a "hostile fetched page" — an AI that (mis)quotes page
// content verbatim into a finding is the realistic worst case; this proves the RENDER path
// (site/bug-check.html's escHtml) neutralizes it even when the payload survives all the way
// from the fetched page, through the model, into the JSON response.
const HOSTILE_WHAT = '<img src=x onerror=alert(1)>Broken hero button'
const HOSTILE_WHERE = '<script>alert(document.cookie)</script>.hero-cta'

let appProc: ReturnType<typeof Bun.spawn>
let BASE = ""

// Second server instance with a near-zero free-tool sub-cap so the very first analyze call on it
// is denied — isolates the sub-cap test from the functional tests above (which need real calls
// to succeed).
let appProcCap: ReturnType<typeof Bun.spawn>
let BASE_CAP = ""

async function waitReady(base: string) {
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    const r = await fetch(`${base}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) return
    await Bun.sleep(150)
  }
}

beforeAll(async () => {
  pageServer = Bun.serve({
    port: 0,
    fetch() {
      return new Response(
        // The <a> is deliberately WORKING (this stub answers 200 on every path) — KLAVITYKLA-342
        // asserts the model's "broken link" claim about it is dropped after real verification.
        `<html><head><title>Acme App</title></head><body>
          <h1>Acme Dashboard</h1>
          <p>Welcome back. Your last sync was undefined. NaN active users.</p>
          <a href="/github">GitHub</a>
          <form><input name="email"><button>Continue</button></form>
        </body></html>`,
        { headers: { "content-type": "text/html" } },
      )
    },
  })
  PAGE_BASE = `http://localhost:${pageServer.port}`

  const fakeFrictions = JSON.stringify({
    frictions: [
      { title: "CTA text is unclear", severity: "high", fix: 'Change "Submit" to "Start free trial"' },
      { title: "No pricing visible", severity: "medium", fix: "Add a visible pricing section or link" },
      { title: "No social proof", severity: "medium", fix: "Add testimonials or customer logos" },
    ],
  })
  const fakeFindings = JSON.stringify({
    findings: [
      { what: HOSTILE_WHAT, where: HOSTILE_WHERE, why: "A user cannot complete the primary action.", severity: "high" },
      // KLAVITYKLA-342: the exact false positive from the launch smoke test — a hallucinated
      // broken-link claim about a link that actually resolves 200. Must never reach the user.
      { what: 'Broken link "GitHub"', where: "Header navigation", why: "The link leads nowhere.", severity: "high" },
      { what: "Sync status shows literal \"undefined\"", where: "text near \"last sync\"", why: "Looks broken/unfinished to a visiting user.", severity: "medium" },
      { what: "Active-user count shows NaN", where: "text near \"active users\"", why: "Undermines trust in the product.", severity: "low" },
    ],
  })

  aiServer = Bun.serve({
    port: 0,
    fetch(req) {
      aiCallCount++
      // Route by inspecting the request body's system prompt content: the qa prompt mentions
      // "USER-FACING BREAKAGE"; the cro prompt mentions "conversion-rate optimisation". Simpler:
      // just alternate based on a header the test can't set — instead, sniff the body.
      return req.text().then((bodyText) => {
        const isQa = bodyText.includes("USER-FACING BREAKAGE")
        return Response.json({
          choices: [{ message: { content: isQa ? fakeFindings : fakeFrictions } }],
          usage: { prompt_tokens: 100, completion_tokens: 80, cost: 0.001 },
        })
      })
    },
  })
  AI_BASE = `http://localhost:${aiServer.port}`

  const port = 47900 + Math.floor(Math.random() * 200)
  BASE = `http://localhost:${port}`
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(53)).toString("base64"),
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_ENDPOINT: AI_BASE,
      KLAV_TEST_ALLOW_LOOPBACK: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      KLAV_FREETOOL_DAILY_CAP_USD: "5",
    },
    stdout: "ignore",
    stderr: "ignore",
  })

  const portCap = 48200 + Math.floor(Math.random() * 200)
  BASE_CAP = `http://localhost:${portCap}`
  appProcCap = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(portCap),
      TURSO_DATABASE_URL: "file:" + DB_FILE_CAP,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(53)).toString("base64"),
      KLAV_BASE_URL: BASE_CAP,
      KLAV_ALLOWED_DOMAINS: "test.local",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_ENDPOINT: AI_BASE,
      KLAV_TEST_ALLOW_LOOPBACK: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      // Below DEFAULT_AI_CALL_EST_USD (0.01) — the very first reservation of the day must fail.
      KLAV_FREETOOL_DAILY_CAP_USD: "0.001",
    },
    stdout: "ignore",
    stderr: "ignore",
  })

  await Promise.all([waitReady(BASE), waitReady(BASE_CAP)])
})

afterAll(() => {
  appProc?.kill()
  appProcCap?.kill()
  pageServer?.stop(true)
  aiServer?.stop(true)
  raw.close()
  rawCap.close()
  rmDbFile(DB_FILE)
  rmDbFile(DB_FILE_CAP)
})

// ── GET /bug-check ───────────────────────────────────────────────────────────────────────────────

test("GET /bug-check serves the bug-check tool page with the required copy", async () => {
  const res = await fetch(`${BASE}/bug-check`)
  expect(res.status).toBe(200)
  const html = await res.text()
  expect(html).toContain("What's broken in your app right now?")
  expect(html).toContain("Klavity's AI users walk it like real customers")
  expect(html).toContain("Run the free scan")
  expect(html).toContain("We only fetch publicly reachable pages, we don't log in, and we don't store your page content.")
  expect(html).toContain("Want this on every deploy?")
  expect(html).toContain("/api/cro/analyze")
  expect(html).toContain('mode: "qa"')
})

test("GET /bug-check: the trust line appears BEFORE the URL input in source order", async () => {
  const res = await fetch(`${BASE}/bug-check`)
  const html = await res.text()
  const trustIdx = html.indexOf("We only fetch publicly reachable pages")
  const inputIdx = html.indexOf('id="site-url"')
  expect(trustIdx).toBeGreaterThan(-1)
  expect(inputIdx).toBeGreaterThan(-1)
  expect(trustIdx).toBeLessThan(inputIdx)
})

// ── /api/cro/analyze: mode=qa vs default (regression) ───────────────────────────────────────────

test("POST /api/cro/analyze mode=qa: returns breakage-shaped findings, not frictions", async () => {
  const anonId = "anon_qa_" + RUN
  const res = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: PAGE_BASE, anonId, source: "reddit-test", mode: "qa" }),
  })
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(Array.isArray(body.findings)).toBe(true)
  expect(body.findings.length).toBeGreaterThan(0)
  expect(body.frictions).toBeUndefined()
  for (const f of body.findings) {
    expect(typeof f.what).toBe("string")
    expect(typeof f.where).toBe("string")
    expect(typeof f.why).toBe("string")
    expect(["high", "medium", "low"]).toContain(f.severity)
  }
})

test("POST /api/cro/analyze default/omitted mode: still returns the ORIGINAL CRO friction shape (no regression to /cro)", async () => {
  const anonId = "anon_cro_regress_" + RUN
  const res = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: PAGE_BASE, anonId, source: "test" }),
  })
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(Array.isArray(body.frictions)).toBe(true)
  expect(body.frictions.length).toBeGreaterThan(0)
  expect(body.findings).toBeUndefined()
  for (const f of body.frictions) {
    expect(typeof f.title).toBe("string")
    expect(typeof f.fix).toBe("string")
  }
})

test("POST /api/cro/analyze mode=cro (explicit): identical to default", async () => {
  const anonId = "anon_cro_explicit_" + RUN
  const res = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: PAGE_BASE, anonId, source: "test", mode: "cro" }),
  })
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(Array.isArray(body.frictions)).toBe(true)
})

// ── KLAVITYKLA-342: false positives + determinism + explicit empty state ───────────────────────

test("POST /api/cro/analyze mode=qa: a model 'broken link' claim about a link that resolves 200 is DROPPED, and the response reports what was checked", async () => {
  const res = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: `${PAGE_BASE}/fp`, anonId: "anon_fp_" + RUN, mode: "qa" }),
  })
  expect(res.status).toBe(200)
  const body = await res.json()
  // The stub model DID claim 'Broken link "GitHub"'. The link resolves 200, so no link claim survives.
  const linkClaims = body.findings.filter((f: any) => /link/i.test(f.what) && /broken|dead|404/i.test(f.what))
  expect(linkClaims).toEqual([])
  // Non-link findings from the model are untouched.
  expect(body.findings.some((f: any) => f.what.includes("undefined"))).toBe(true)
  // Explicit "here's what we checked" payload (Bug 3).
  expect(body.checked).toBeTruthy()
  expect(body.checked.links).toBeGreaterThan(0)
  expect(body.checked.forms).toBeGreaterThan(0)
  expect(typeof body.checked.summary).toBe("string")
  expect(body.checked.summary.length).toBeGreaterThan(0)
})

test("POST /api/cro/analyze mode=qa: scanning the same URL twice returns an IDENTICAL result (no 0 / 8 / 0 flapping)", async () => {
  const url = `${PAGE_BASE}/determinism`
  const call = async () => {
    const r = await fetch(`${BASE}/api/cro/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, anonId: "anon_det_" + RUN, mode: "qa" }),
    })
    expect(r.status).toBe(200)
    return await r.json()
  }
  const first = await call()
  const second = await call()
  expect(second.findings).toEqual(first.findings)
  expect(second.checked).toEqual(first.checked)
})

// ── XSS: hostile fetched-page content echoed by the AI must render safely ──────────────────────

test("POST /api/cro/analyze mode=qa: hostile <script>/onerror content in a finding is returned as inert JSON text (server does not execute or unescape it)", async () => {
  const anonId = "anon_xss_" + RUN
  const res = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: PAGE_BASE, anonId, mode: "qa" }),
  })
  expect(res.status).toBe(200)
  const body = await res.json()
  const hostile = body.findings.find((f: any) => f.what.includes("onerror") || f.where.includes("<script>"))
  expect(hostile).toBeTruthy()
  // The API returns the raw string in JSON (correct — JSON is not HTML, no escaping needed here).
  // The actual XSS-safety proof (that the CLIENT never injects this unescaped into the DOM) lives
  // in site/bug-check-xss.test.mjs, which executes the REAL shipped page script in jsdom against
  // this exact payload and asserts no <script> element / onerror handler is ever created.
  expect(hostile.what).toContain("<img")
  expect(hostile.where).toContain("<script>")
})

// ── Rate limit is inherited on the mode=qa path ─────────────────────────────────────────────────
// NOTE: this intentionally runs LAST among the tests hitting BASE's /api/cro/analyze — it trips a
// real 60s fixed-window rate limit (server.ts: `rlAllow("cro:ip:"+ip, 10, 60_000)`), which would
// otherwise 429 every subsequent test sharing this server/IP.

test("POST /api/cro/analyze mode=qa: shares the per-IP rate limit with the CRO path", async () => {
  // The rate limiter keys on IP only (not mode), so hammering either mode from one IP trips it.
  // Enough qa-mode requests in the window trips the SAME limiter /cro already relies on
  // (10/min per server.ts's `rlAllow("cro:ip:"+ip, 10, 60_000)`).
  let sawRateLimited = false
  for (let i = 0; i < 14; i++) {
    const res = await fetch(`${BASE}/api/cro/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: PAGE_BASE, anonId: "anon_rl_" + i, mode: "qa" }),
    })
    if (res.status === 429) { sawRateLimited = true; break }
  }
  expect(sawRateLimited).toBe(true)
})

// ── Free-tool daily sub-cap (KLAVITYKLA-341, launch-blocking) ──────────────────────────────────

test("POST /api/cro/analyze: free-tool sub-cap denies with a friendly 429 and does NOT call the AI", async () => {
  const before = aiCallCount
  const res = await fetch(`${BASE_CAP}/api/cro/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: PAGE_BASE, anonId: "anon_cap_1", mode: "qa" }),
  })
  expect(res.status).toBe(429)
  const body = await res.json()
  expect(body.error).toBeTruthy()
  expect(body.error).not.toMatch(/error:|Error:|at .*\.ts:\d+/)  // not a raw stack/error string
  expect(body.error.toLowerCase()).toMatch(/busy|try again/)
  // No AI call was made for the denied request.
  expect(aiCallCount).toBe(before)
})

test("POST /api/cro/analyze: free-tool sub-cap also blocks mode=cro on the same server (shared free-tool slice)", async () => {
  const before = aiCallCount
  const res = await fetch(`${BASE_CAP}/api/cro/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: PAGE_BASE, anonId: "anon_cap_2" }),
  })
  expect(res.status).toBe(429)
  expect(aiCallCount).toBe(before)
})

// ── /api/cro/unlock: tool field flows through to the funnel event ──────────────────────────────

test("POST /api/cro/unlock: tool=bugcheck is recorded on the lead_captured funnel event", async () => {
  const anonId = "anon_unlock_bugcheck_" + RUN
  const email = `bugcheck-lead-${RUN}@test.local`
  const res = await fetch(`${BASE}/api/cro/unlock`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, url: PAGE_BASE, anonId, source: "test", tool: "bugcheck" }),
  })
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body.ok).toBe(true)

  await Bun.sleep(300)
  const rows = await raw.execute({
    sql: "SELECT * FROM funnel_events WHERE anon_id=? AND event='lead_captured'",
    args: [anonId],
  })
  expect(rows.rows.length).toBeGreaterThan(0)
  const row = rows.rows[0] as any
  expect(row.email).toBe(email)
  const props = JSON.parse(String(row.props_json || "{}"))
  expect(props.tool).toBe("bugcheck")

  // Also segmented into its own nurture sequence row (distinct from "cro").
  const seq = await raw.execute({
    sql: "SELECT sequence FROM lead_nurture_sequences WHERE email=?",
    args: [email],
  })
  expect(seq.rows.length).toBeGreaterThan(0)
  expect((seq.rows[0] as any).sequence).toBe("bugcheck")
})

test("POST /api/cro/unlock: omitted tool defaults to 'cro' (no regression)", async () => {
  const anonId = "anon_unlock_cro_" + RUN
  const email = `cro-lead-${RUN}@test.local`
  const res = await fetch(`${BASE}/api/cro/unlock`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, url: PAGE_BASE, anonId, source: "test" }),
  })
  expect(res.status).toBe(200)

  await Bun.sleep(300)
  const rows = await raw.execute({
    sql: "SELECT * FROM funnel_events WHERE anon_id=? AND event='lead_captured'",
    args: [anonId],
  })
  const row = rows.rows[0] as any
  const props = JSON.parse(String(row.props_json || "{}"))
  expect(props.tool).toBe("cro")
})
