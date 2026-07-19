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
import { MODEL_CHOICE_IDS } from "./lib/models"

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

// KLAVITYKLA-342 — every model/temperature the server actually requested, split by call type.
type AiReq = { model: string; temperature: unknown }
const qaAiRequests: AiReq[] = []
const croAiRequests: AiReq[] = []

// The model the bug-check path MUST pin to. Deliberately NOT one of MODEL_CHOICE_IDS: the weighted
// picker can only ever return a curated choice id (it falls back to KLAV_MODEL only when every
// weight is zero, and a fresh DB seeds three non-zero weights). So observing this exact string
// proves the pin was used, and observing a choice id proves the pin was bypassed. That is the
// discriminator the previous, vacuous version of this test lacked.
const PINNED_MODEL = "test/pinned-bugcheck-model"
let findingsForModel: (model: string) => string = () => "{}"

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
  // Every finding carries an `evidence` quote. The grounded ones quote the stub page verbatim; the
  // SPECULATIVE one quotes text that appears nowhere on the page — KLAVITYKLA-342's false-positive
  // gate must drop exactly that one.
  const fakeFindings = JSON.stringify({
    findings: [
      { what: HOSTILE_WHAT, where: HOSTILE_WHERE, evidence: "Welcome back", why: "A user cannot complete the primary action.", severity: "high" },
      // KLAVITYKLA-342: the exact false positive from the launch smoke test — a hallucinated
      // broken-link claim about a link that actually resolves 200. Must never reach the user.
      // Deliberately GROUNDED so this fixture keeps proving the LINK filter drops it, rather than
      // silently being caught by the newer evidence gate instead.
      { what: 'Broken link "GitHub"', where: "Header navigation", evidence: "GitHub", why: "The link leads nowhere.", severity: "high" },
      { what: "Sync status shows literal \"undefined\"", where: "text near \"last sync\"", evidence: "last sync was undefined", why: "Looks broken/unfinished to a visiting user.", severity: "medium" },
      { what: "Active-user count shows NaN", where: "text near \"active users\"", evidence: "NaN active users", why: "Undermines trust in the product.", severity: "low" },
      // Pure speculation about behaviour the model cannot see in the text, with a fabricated quote.
      { what: "Checkout button fails to submit", where: ".checkout", evidence: "Payment declined — please retry", why: "Users cannot pay.", severity: "high" },
    ],
  })

  // A DIFFERENT model yields a different number of findings — the exact failure mode reported in
  // KLAVITYKLA-342 (same URL scanned twice → 0 findings, then 8).
  const fakeFindingsAltModel = JSON.stringify({
    findings: [
      { what: "Hero image fails to load", where: ".hero img", evidence: "Acme Dashboard", why: "The page looks empty above the fold.", severity: "high" },
    ],
  })
  findingsForModel = (model: string) => (model === PINNED_MODEL ? fakeFindings : fakeFindingsAltModel)

  aiServer = Bun.serve({
    port: 0,
    fetch(req) {
      aiCallCount++
      // Route by inspecting the request body's system prompt content: the qa prompt mentions
      // "USER-FACING BREAKAGE"; the cro prompt mentions "conversion-rate optimisation". Simpler:
      // just alternate based on a header the test can't set — instead, sniff the body.
      return req.text().then((bodyText) => {
        const isQa = bodyText.includes("USER-FACING BREAKAGE")
        // KLAVITYKLA-342: record the model/temperature the server ACTUALLY asked for. This is the
        // only way to see through to the root cause — the response body alone cannot reveal that
        // the server weight-picked a different model on this call.
        let reqModel = "", reqTemp: unknown = undefined
        try {
          const parsed = JSON.parse(bodyText)
          reqModel = String(parsed.model ?? "")
          reqTemp = parsed.temperature
        } catch {}
        ;(isQa ? qaAiRequests : croAiRequests).push({ model: reqModel, temperature: reqTemp })
        // The findings VARY BY MODEL. A real multi-model deployment behaves this way (that is the
        // whole reason random routing produced 0-vs-8-finding flapping), and it makes the
        // user-visible determinism assertion meaningful instead of tautological: with a constant
        // stub response, a determinism test passes even when the model changes every call.
        const body = isQa ? findingsForModel(reqModel) : fakeFrictions
        return Response.json({
          choices: [{ message: { content: body } }],
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
      // KLAVITYKLA-342: MODEL (= KLAV_MODEL) is what the bug-check path pins to.
      KLAV_MODEL: PINNED_MODEL,
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

test("POST /api/cro/analyze mode=qa: a SPECULATIVE finding whose evidence quote is not on the page is DROPPED", async () => {
  const res = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.240" },
    body: JSON.stringify({ url: `${PAGE_BASE}/speculative-${RUN}`, anonId: "anon_spec_" + RUN, mode: "qa" }),
  })
  expect(res.status).toBe(200)
  const body = await res.json()
  // The stub claimed a checkout failure quoting "Payment declined — please retry", which appears
  // nowhere in the fetched page. Unverifiable speculation must not reach the user.
  expect(body.findings.some((f: any) => /checkout/i.test(f.what))).toBe(false)
  // ...while findings quoting real page text survive, so the gate is not simply dropping everything.
  expect(body.findings.some((f: any) => f.what.includes("undefined"))).toBe(true)
  expect(body.findings.some((f: any) => f.what.includes("NaN"))).toBe(true)
})

// ── The ROOT-CAUSE determinism test (KLAVITYKLA-342). ─────────────────────────────────────────
// The test above is necessary but NOT sufficient: the second scan is served from the 10-minute
// analyze cache, so it would pass even if the model were re-rolled on every real call. This test
// defeats the cache (a distinct URL per call → distinct `${mode}|${url}` cache key) and asserts on
// the thing that actually varied: the model the server requested from OpenRouter.
//
// WITHOUT the `model: MODEL` pin, chat() falls through to
//   pickModel(await getActiveWeights(), MODEL_CHOICE_IDS, MODEL, Math.random())
// which on a fresh DB weight-picks across three seeded models (50/40/10). Over N=12 independent
// calls the chance every roll lands on the same model is 0.5^12 + 0.4^12 + 0.1^12 ≈ 2.6e-4, so
// this test fails essentially always if the pin is reverted.
const DETERMINISM_CALLS = 12

test("bug-check analyze pins ONE model + temperature 0 across many independent (cache-missing) calls", async () => {
  const before = qaAiRequests.length
  const bodies: any[] = []
  for (let i = 0; i < DETERMINISM_CALLS; i++) {
    const r = await fetch(`${BASE}/api/cro/analyze`, {
      method: "POST",
      // The analyze route allows 10 requests / 60s per IP. Tests connect from 127.0.0.1, which
      // clientIp() treats as a trusted proxy peer, so a distinct X-Forwarded-For puts each call in
      // its own rate-limit bucket — N is driven by the statistics we need, not by the throttle,
      // and the shared default bucket is left intact for the other tests in this file.
      headers: { "content-type": "application/json", "x-forwarded-for": `203.0.113.${i + 10}` },
      // Distinct path per call ⇒ distinct cache key ⇒ a REAL model call every iteration.
      body: JSON.stringify({ url: `${PAGE_BASE}/det-${RUN}-${i}`, anonId: `anon_detN_${RUN}_${i}`, mode: "qa" }),
    })
    expect(r.status).toBe(200)
    bodies.push(await r.json())
  }

  // Every iteration really did reach the model (no cache hits silently reducing N to 1).
  const reqs = qaAiRequests.slice(before)
  expect(reqs.length).toBe(DETERMINISM_CALLS)

  // (1) ROOT CAUSE: the model actually requested is invariant, and is the pinned one — not a
  // weight-picked choice id.
  const models = [...new Set(reqs.map((r) => r.model))]
  expect(models).toEqual([PINNED_MODEL])

  // (2) temperature 0 on every single call (a pinned model at default temperature still drifts).
  expect([...new Set(reqs.map((r) => r.temperature))]).toEqual([0])

  // (3) USER-VISIBLE CONSEQUENCE: identical input ⇒ identical findings. The stub varies its
  // findings by model, so this assertion is only satisfiable while (1) holds.
  for (const b of bodies) expect(b.findings).toEqual(bodies[0].findings)
})

test("the model pin is scoped to bug-check: /cro analyze still uses the weighted picker", async () => {
  const before = croAiRequests.length
  const r = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.200" },
    body: JSON.stringify({ url: `${PAGE_BASE}/cro-unpinned-${RUN}`, anonId: "anon_croun_" + RUN }),
  })
  expect(r.status).toBe(200)
  const reqs = croAiRequests.slice(before)
  expect(reqs.length).toBe(1)
  // A curated choice id from the weighted mix — NOT the bug-check pin. Proves the fix did not
  // change behaviour for other AI call types.
  expect(MODEL_CHOICE_IDS).toContain(reqs[0].model)
  expect(reqs[0].model).not.toBe(PINNED_MODEL)
  // /cro deliberately does not pin temperature either.
  expect(reqs[0].temperature).toBeUndefined()
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
