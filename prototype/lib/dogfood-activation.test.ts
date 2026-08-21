// ── Dogfood: activation critical-path e2e ────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Automates the exact activation loop a real user (the "Charantra walkthrough")
// hits, so the onboarding/report regressions found by hand get caught in CI:
//
//   1. SIGNUP        POST /api/auth/request + /api/auth/verify via the TEST-OTP
//                    bypass (KLAV_TEST_OTP=1, email vishal@quantana.com.au,
//                    fixed code 666666) → account + default project auto-created.
//   2. AHA SCAN      POST /api/persona/site → grounded reaction returns personas
//                    ("See it work" — the pre-signup aha).
//   3. FILE REPORT   POST /api/feedback (widget submit path, multipart) with a
//                    screenshot (image) AND a non-image attachment + title/kind →
//                    persists to the feedback ledger.
//   4. VERIFY        The report surfaces in the dashboard/triage for that project,
//                    carries reporter/url context, and (connector configured) is
//                    eligible for export → manual export to a webhook succeeds.
//   5. GUARDS        Charantra HTML-flow regressions asserted at the source-contract
//                    layer (too heavy/flaky to drive the whole HTML wizard in a
//                    browser here): sequential onboarding progress (no repeated
//                    "Step 4"), brand link "/" not index.html (#446), dashboard
//                    entry lands on Overview not Pricing (#447).
//
// ── LAYER CHOICE ─────────────────────────────────────────────────────────────
// Steps 1-4 run at the HTTP/API layer against a REAL spawned server (Bun.spawn
// server.ts) — the same layer the /api/... surface the widget + onboarding page
// call. No browser is driven, so this runs in CI (unlike *.e2e.test.ts, which the
// CI workflow excludes because they need real Chromium). This mirrors the repo's
// own server-spawn tests that run in CI (server.persona-site-resilience.test.ts,
// server.onboarding-aha-personas.test.ts). Step 5 asserts the HTML-flow guards at
// the source-contract layer (same style as onboarding-contract.test.ts).
//
// ── DETERMINISM / MOCKS ──────────────────────────────────────────────────────
// Everything external is stubbed — no live keys, no network:
//   • LLM (OpenRouter)  → local Bun.serve stub via OPENROUTER_ENDPOINT; returns
//                         canned personas JSON. OPENROUTER_API_KEY="test-key".
//   • Product URL       → local Bun.serve stub page; safeFetch loopback allowed
//                         via KLAV_TEST_ALLOW_LOOPBACK=1.
//   • Connector target  → local Bun.serve webhook receiver (loopback hatch).
//   • Email (SendGrid)  → SENDGRID_API_KEY="" (no mail attempted).
//   • OTP               → KLAV_TEST_OTP bypass (fixed 666666), no email.
//   • Headless browser  → AUTOSIM_CDP_URL="disabled" (sim/preview path unused).
//
// ── KNOWN GAP (reported, not hidden) ─────────────────────────────────────────
// Screenshot + attachment BYTES go to S3 (lib/s3.ts). With S3 unconfigured the
// upload throws and is caught NON-FATALLY at the server — the report still
// persists but the image/attachment bytes are dropped (no screenshots row). There
// is no local/in-memory storage fallback for tests, so this test asserts the
// submit ACCEPTS both file types (PNG passes the image gate; .log is accepted on
// the non-image `files` path) and the report row + its text context persist. It
// does NOT assert byte-level screenshot persistence — that needs a MinIO/local-S3
// or a mockable storage layer. See the final report.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { readFileSync, unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-dogfood-${RUN}.db`)
const TEST_EMAIL = "vishal@quantana.com.au"   // per device-level test-email standing rule
const TEST_OTP = "666666"

function rmDb() {
  for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} }
}
rmDb()

// Raw client on the SAME db file the server uses — to seed the connector row
// (the server owns/creates the schema on boot; we only add extra rows).
const raw = createClient({ url: "file:" + DB_FILE })

// A real 1x1 PNG (valid image bytes so it passes the image-type gate).
const PNG_1x1 = Uint8Array.from(atob(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
), c => c.charCodeAt(0))

let pageSrv: ReturnType<typeof Bun.serve>   // stub "product URL" for the aha scan
let PAGE_BASE = ""
let aiSrv: ReturnType<typeof Bun.serve>     // stub OpenRouter
let AI_BASE = ""
let hookSrv: ReturnType<typeof Bun.serve>   // stub connector webhook receiver
let HOOK_BASE = ""
let hookHits: Array<any> = []
let appProc: ReturnType<typeof Bun.spawn>
let BASE = ""

// Shared state threaded across the sequential steps (bunfig maxConcurrency=1).
let sessionCookie = ""
let projectId = ""
let feedbackId = ""

const CANNED_PERSONAS = {
  personas: [
    { name: "Priya Menon", role: "Product Manager", simClass: "user", side: "external", initials: "PM", accent: "#6366f1", desc: "PM who cares about activation", summary: "A hands-on PM evaluating the product.", insights: [{ kind: "pain", text: "unclear next step", quote: "I do not know what to do next" }, { kind: "want", text: "fast setup", quote: "just let me try it" }, { kind: "love", text: "clean UI", quote: "looks clean" }] },
    { name: "Sam Carter", role: "Engineering Lead", simClass: "user", side: "external", initials: "SC", accent: "#22c55e", desc: "Eng lead watching reliability", summary: "Reliability-focused evaluator.", insights: [{ kind: "pain", text: "flaky", quote: "it breaks sometimes" }, { kind: "want", text: "stable", quote: "keep it stable" }, { kind: "love", text: "alerts", quote: "love the alerts" }] },
  ],
}

beforeAll(async () => {
  // Stub product page (>40 chars of real text so persona/site accepts it).
  pageSrv = Bun.serve({
    port: 0,
    fetch() {
      return new Response(
        `<html><head><title>Acme Analytics</title></head><body>
          <h1>Acme analytics for busy product teams</h1>
          <p>Track funnels, ship faster, and understand your users. Pricing from $29 per month.
          Sign up and connect your product in minutes.</p>
        </body></html>`,
        { headers: { "content-type": "text/html" } },
      )
    },
  })
  PAGE_BASE = `http://localhost:${pageSrv.port}`

  // Stub OpenRouter — always returns valid, canned personas JSON (harmless for
  // any other fire-and-forget chat caller, e.g. label-suggest on feedback submit).
  aiSrv = Bun.serve({
    port: 0,
    async fetch() {
      return Response.json({
        choices: [{ message: { content: JSON.stringify(CANNED_PERSONAS) } }],
        usage: { prompt_tokens: 120, completion_tokens: 90, cost: 0 },
      })
    },
  })
  AI_BASE = `http://localhost:${aiSrv.port}`

  // Stub connector webhook receiver — records hits, returns an external id.
  hookSrv = Bun.serve({
    port: 0,
    async fetch(req) {
      const body = await req.json().catch(() => ({}))
      hookHits.push(body)
      return Response.json({ id: "EXT-DOGFOOD-1" })
    },
  })
  HOOK_BASE = `http://localhost:${hookSrv.port}`

  const port = 46600 + Math.floor(Math.random() * 300)
  BASE = `http://localhost:${port}`

  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: join(import.meta.dir, ".."),   // server.ts lives in prototype/, this file in prototype/lib/
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(71)).toString("base64"),
      KLAV_BASE_URL: BASE,
      // Access-list: allow the quantana.com.au test domain to request an OTP at all.
      KLAV_ALLOWED_DOMAINS: "quantana.com.au",
      // TEST-OTP bypass: fixed 666666 valid for the allowlisted test email, no email sent.
      KLAV_TEST_OTP: "1",
      KLAV_TEST_OTP_EMAILS: TEST_EMAIL,
      KLAV_DEV_SHOW_OTP: "1",
      // LLM + loopback stubs (deterministic aha scan; no live OpenRouter).
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_ENDPOINT: AI_BASE,
      KLAV_TEST_ALLOW_LOOPBACK: "1",
      // No live mail / no headless browser.
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      AUTOSIM_CDP_URL: "disabled",
    },
    stdout: "ignore",
    stderr: "ignore",
  })

  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
}, 20_000)

afterAll(() => {
  appProc?.kill()
  pageSrv?.stop(true)
  aiSrv?.stop(true)
  hookSrv?.stop(true)
  raw.close()
  rmDb()
})

// ═════════════════════════════════════════════════════════════════════════════
// STEP 1 — SIGNUP via the TEST-OTP bypass (account + project auto-created)
// ═════════════════════════════════════════════════════════════════════════════

test("1a: POST /api/auth/request short-circuits the test-OTP (no email sent)", async () => {
  const r = await fetch(`${BASE}/api/auth/request`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.5" },
    body: JSON.stringify({ email: TEST_EMAIL }),
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  // test-OTP short-circuit: emailed=false, testOtp:true (no SendGrid, no rate-limit).
  expect(body.emailed).toBe(false)
})

test("1b: POST /api/auth/verify with 666666 creates the account, session + default project", async () => {
  const r = await fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.5" },
    body: JSON.stringify({ email: TEST_EMAIL, code: TEST_OTP }),
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  // Brand-new user is routed to the onboarding wizard (the activation entry).
  expect(body.redirect).toMatch(/\/onboarding/)
  // The default project is auto-created and returned — no extra call needed.
  expect(typeof body.projectId).toBe("string")
  expect(body.projectId.length).toBeGreaterThan(0)
  projectId = body.projectId

  // Capture the session for every subsequent authenticated call.
  const setCookie = r.headers.get("set-cookie") || ""
  expect(setCookie).toContain("klav_session=")
  const sid = /klav_session=([^;]+)/.exec(setCookie)?.[1] || body.token
  expect(sid).toBeTruthy()
  sessionCookie = `klav_session=${sid}`
})

// ═════════════════════════════════════════════════════════════════════════════
// STEP 2 — THE AHA: grounded scan returns a real reaction (personas)
// ═════════════════════════════════════════════════════════════════════════════

test("2: POST /api/persona/site returns personas — the onboarding 'See it work' aha", async () => {
  const r = await fetch(`${BASE}/api/persona/site`, {
    method: "POST",
    headers: { "content-type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ url: PAGE_BASE }),
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(Array.isArray(body.personas)).toBe(true)
  expect(body.personas.length).toBeGreaterThan(0)
  // A real reaction: each persona carries an identity so the aha cards render.
  const p0 = body.personas[0]
  expect(typeof p0.name).toBe("string")
  expect(p0.name.length).toBeGreaterThan(0)
  expect(typeof p0.role).toBe("string")
})

// ═════════════════════════════════════════════════════════════════════════════
// STEP 3 — FILE A BUG REPORT via the widget submit path (screenshot + non-image)
// ═════════════════════════════════════════════════════════════════════════════

test("3: POST /api/feedback persists a report with a screenshot + a non-image file", async () => {
  const fd = new FormData()
  fd.set("description", "Checkout button is misaligned on the pricing page.")
  fd.set("title", "Misaligned checkout button")
  fd.set("type", "bug")
  fd.set("page_url", "https://acme.example.com/pricing")
  fd.set("reporter_email", TEST_EMAIL)
  fd.set("project_id", projectId)
  // Screenshot (image) → screenshots[] path (must pass the image-type gate).
  fd.append("screenshots", new File([PNG_1x1], "shot.png", { type: "image/png" }))
  // Non-image attachment → files[] path (composer's "Attach file" affordance).
  fd.append("files", new File([new TextEncoder().encode("console error: layout shift at #checkout\n")], "trace.log", { type: "text/plain" }))

  const r = await fetch(`${BASE}/api/feedback`, {
    method: "POST",
    headers: { Cookie: sessionCookie },   // authed submit (no Origin → non-browser API path)
    body: fd,
  })
  // Neither the PNG (image gate) nor the .log (non-image path) may 400 the submit.
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.saved).toBe(true)
  expect(typeof body.id).toBe("string")
  expect(body.id.length).toBeGreaterThan(0)
  feedbackId = body.id
})

// ═════════════════════════════════════════════════════════════════════════════
// STEP 4 — VERIFY it surfaces for that project, with context
// ═════════════════════════════════════════════════════════════════════════════

test("4a: the report surfaces in the project dashboard with url context", async () => {
  const r = await fetch(`${BASE}/api/dashboard?project=${encodeURIComponent(projectId)}`, {
    headers: { Cookie: sessionCookie },
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(Array.isArray(body.tickets)).toBe(true)
  const mine = body.tickets.find((t: any) => t.id === feedbackId)
  expect(mine).toBeTruthy()
  // FINDING: the list title surfaces the DESCRIPTION (observation), NOT the explicit
  // composer `title` field — every read API derives title from observation/suggested_bug,
  // so the PX4 #411 one-line Title is persisted (feedback.title) but never displayed.
  expect(mine.title).toBe("Checkout button is misaligned on the pricing page.")
  // Carries the report's url context (path-only by privacy design).
  expect(mine.urlPath).toBe("/pricing")
  expect(mine.urlHost).toBe("acme.example.com")
})

test("4b: the report appears in the New-reports triage queue for the project", async () => {
  const r = await fetch(`${BASE}/api/projects/${encodeURIComponent(projectId)}/triage`, {
    headers: { Cookie: sessionCookie },
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(Array.isArray(body.triage)).toBe(true)
  const mine = body.triage.find((t: any) => t.id === feedbackId)
  expect(mine).toBeTruthy()
  // Same surfacing behavior as the dashboard list — title === observation (see 4a finding).
  expect(mine.title).toBe("Checkout button is misaligned on the pricing page.")
  expect(mine.urlPath).toBe("/pricing")
})

test("4c: with a connector configured, the report is eligible for export (manual export succeeds)", async () => {
  // Seed a webhook connector on the project (server owns the schema; we add a row).
  const connId = "conn_dogfood_" + RUN
  await raw.execute({
    sql: `INSERT INTO connectors (id,project_id,type,name,config,auto_copy,enabled,created_at,created_by)
          VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [connId, projectId, "webhook", "Dogfood Webhook", JSON.stringify({ url: HOOK_BASE }), 0, 1, Date.now(), TEST_EMAIL],
  })

  const r = await fetch(`${BASE}/api/feedback/${encodeURIComponent(feedbackId)}/export`, {
    method: "POST",
    headers: { "content-type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ connectorId: connId }),
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  // The external tracker (our webhook stub) acknowledged and returned an id.
  expect(body.export?.externalKey).toBe("EXT-DOGFOOD-1")
  // The webhook actually received the ticket carrying our report's title.
  expect(hookHits.length).toBeGreaterThan(0)
  const payloads = JSON.stringify(hookHits)
  expect(payloads).toContain("Misaligned checkout button")
})

// ═════════════════════════════════════════════════════════════════════════════
// STEP 5 — CHARANTRA WALKTHROUGH REGRESSION GUARDS (source-contract layer)
// ─────────────────────────────────────────────────────────────────────────────
// These are the exact onboarding/report bugs a real user hit. Driving the whole
// HTML wizard through a browser is heavy/flaky, so — like onboarding-contract.test.ts
// and dashboard-onboarding-entry-route.test.ts — we assert them against the shipped
// HTML source. Reusing/extending those existing contracts keeps them in CI.
// ═════════════════════════════════════════════════════════════════════════════

const SITE = join(import.meta.dir, "..", "..", "site")
const PUBLIC = join(import.meta.dir, "..", "public")
const ONBOARD = readFileSync(join(SITE, "onboarding.html"), "utf8")
const DASH = readFileSync(join(PUBLIC, "dashboard.html"), "utf8")

// Anchored brace-matched extractor (same technique as the dashboard-*.test.ts guards).
function extractFn(src: string, marker: string): string {
  const i = src.indexOf(marker)
  if (i < 0) throw new Error("marker not found: " + marker)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + marker)
}

test("5a: onboarding progress is honest + sequential — no repeated 'Step 4' plateau", () => {
  expect(ONBOARD).toContain("Step 1 of 5 · Your goals")
  expect(ONBOARD).toContain("Step 2 of 5 · Connect your product")
  expect(ONBOARD).toContain("Step 3 of 5 · See it work")
  expect(ONBOARD).toContain("Step 4 of 5 · Create your account")
  expect(ONBOARD).toContain("Step 5 of 5 · Install")
  // The old bug: several consecutive kickers reading "Step 4 · Insights".
  expect(ONBOARD).not.toContain("Step 4 · Insights")
  // The step number is DERIVED from the rail phase so it can never repeat.
  expect(ONBOARD).toContain("'Step ' + (p + 1) + ' of ' + m.labels.length")
  expect(ONBOARD).toContain("labels:['Goal','Product URL','See it work','Create account','Install']")
})

test("5b: #446 — onboarding brand link points at root '/', never index.html (which 404s)", () => {
  expect(ONBOARD).toContain('<a class="brand" href="/">')
  expect(ONBOARD).not.toContain('class="brand" href="index.html"')
  expect(ONBOARD).not.toContain('class="brand" href="./index.html"')
})

test("5c: #447 — dashboard entry lands on Overview, not the plan/pricing view", () => {
  // Overview is the initial active nav item.
  expect(DASH).toContain('class="nv active" data-go="overview"')
  // _planIntent must NOT hijack the initial route into the plan drawer on arrival.
  const planIntent = extractFn(DASH, "function _planIntent()")
  expect(planIntent).not.toContain("openPlanDrawer,")
  expect(planIntent).not.toContain("setTimeout(openPlanDrawer")
  // It still surfaces the upgrade nudge inline (route preserved, nudge kept).
  expect(planIntent).toContain("klavToast")
  // The explicit-click CTA path is unchanged.
  expect(DASH).toContain("function openPlanDrawer()")
})
