// KLA-564 — receiving-side dogfood tests.
//
// Two layers, mirroring the repo's dogfood tests:
//   A. PURE unit tests for the decision logic — auth-method selection + the present/at-top/bucket
//      oracle — against mocked rows. No server, no browser: these are the KLA-564 correctness core and
//      are structured so KLA-565 (ordering/recency) can extend them.
//   B. A server-spawn INTEGRATION test that runs the whole runner (auth via the fixed_otp bypass →
//      submit seeded Snap → poll GET /api/projects/:id/triage → assert present + at-top) against a REAL
//      spawned server.ts, the same HTTP layer the widget/dashboard call. Runs in CI (no Chromium),
//      exactly like dogfood-activation.test.ts.

import { test, expect, describe, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"
import {
  selectReceivingAuthMethod,
  evaluateReceivingOracle,
  buildSeededSnap,
} from "./dogfood-receiving-oracle"
import { planReceivingAuth, runReceivingDogfood, establishReceivingSession } from "./dogfood-receiving"

// ═════════════════════════════════════════════════════════════════════════════
// A. PURE UNIT TESTS
// ═════════════════════════════════════════════════════════════════════════════

describe("selectReceivingAuthMethod", () => {
  test("prefers mint_link when registered (CI-preferred, no form)", () => {
    const p = selectReceivingAuthMethod({ configuredMethod: "mint_link", testOtpActive: false })
    expect(p.method).toBe("mint_link")
  })
  test("uses fixed_otp when registered AND the bypass is active", () => {
    const p = selectReceivingAuthMethod({ configuredMethod: "fixed_otp", testOtpActive: true })
    expect(p.method).toBe("fixed_otp")
  })
  test("refuses fixed_otp when the bypass is OFF (666666 would be rejected)", () => {
    const p = selectReceivingAuthMethod({ configuredMethod: "fixed_otp", testOtpActive: false })
    expect(p.method).toBe("none")
    expect(p.reason).toContain("KLAV_TEST_OTP")
  })
  test("falls back to fixed_otp when nothing registered but the bypass is on", () => {
    const p = selectReceivingAuthMethod({ configuredMethod: null, testOtpActive: true })
    expect(p.method).toBe("fixed_otp")
  })
  test("returns none when no method is available", () => {
    const p = selectReceivingAuthMethod({ configuredMethod: null, testOtpActive: false })
    expect(p.method).toBe("none")
  })
  test("planReceivingAuth infers mint_link from a supplied mintSecret", () => {
    expect(planReceivingAuth({ base: "x", mintSecret: "tok" }).method).toBe("mint_link")
  })
})

describe("evaluateReceivingOracle", () => {
  const rows = [
    { id: "fb_target", priority: "high", labels: ["ui"] },
    { id: "fb_other1", priority: "low" },
    { id: "fb_other2", priority: null },
  ]

  test("PASS: present + at index 0", () => {
    const r = evaluateReceivingOracle(rows, { feedbackId: "fb_target" })
    expect(r.pass).toBe(true)
    expect(r.checks.present.pass).toBe(true)
    expect(r.checks.atTop.pass).toBe(true)
    expect(r.checks.atTop.index).toBe(0)
    expect(r.failures).toEqual([])
  })

  test("FAIL: report missing entirely (the 'never showed' QA miss)", () => {
    const r = evaluateReceivingOracle(rows, { feedbackId: "fb_absent" })
    expect(r.pass).toBe(false)
    expect(r.checks.present.pass).toBe(false)
    expect(r.checks.atTop.index).toBe(-1)
    expect(r.failures.join(" ")).toContain("MISSING")
  })

  test("FAIL: present but not at top (the 'ordering wrong' QA miss)", () => {
    const r = evaluateReceivingOracle(rows, { feedbackId: "fb_other1" })
    expect(r.pass).toBe(false)
    expect(r.checks.present.pass).toBe(true)
    expect(r.checks.atTop.pass).toBe(false)
    expect(r.checks.atTop.index).toBe(1)
  })

  test("PASS: bucket check matches expected priority", () => {
    const r = evaluateReceivingOracle(rows, { feedbackId: "fb_target", expectedPriority: "high" })
    expect(r.pass).toBe(true)
    expect(r.checks.bucket.pass).toBe(true)
    expect(r.checks.bucket.actual).toBe("high")
  })

  test("FAIL: wrong bucket (the 'triaged to wrong bucket' QA miss)", () => {
    const r = evaluateReceivingOracle(rows, { feedbackId: "fb_target", expectedPriority: "urgent" })
    expect(r.pass).toBe(false)
    expect(r.checks.bucket.pass).toBe(false)
    expect(r.checks.bucket.expected).toBe("urgent")
    expect(r.checks.bucket.actual).toBe("high")
  })

  test("PASS: label bucket check", () => {
    const r = evaluateReceivingOracle(rows, { feedbackId: "fb_target", expectedLabel: "ui" })
    expect(r.checks.bucket.pass).toBe(true)
  })

  test("bucket check is skipped (passes) when no expectation is supplied", () => {
    const r = evaluateReceivingOracle(rows, { feedbackId: "fb_target" })
    expect(r.checks.bucket.pass).toBe(true)
    expect(r.checks.bucket.detail).toContain("skipped")
  })

  test("empty inbox → present fails cleanly, no throw", () => {
    const r = evaluateReceivingOracle([], { feedbackId: "fb_target" })
    expect(r.pass).toBe(false)
    expect(r.checks.present.pass).toBe(false)
  })
})

describe("buildSeededSnap", () => {
  test("embeds a unique marker in title + description", () => {
    const s = buildSeededSnap("run123")
    expect(s.marker).toBe("KLA-564-DOGFOOD-run123")
    expect(s.title).toContain(s.marker)
    expect(s.description).toContain(s.marker)
    expect(s.type).toBe("bug")
  })
  test("distinct markers across runs when no runId is given", () => {
    expect(buildSeededSnap().marker).not.toBe(buildSeededSnap().marker)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
// B. INTEGRATION — full runner against a REAL spawned server (fixed_otp ladder)
// ═════════════════════════════════════════════════════════════════════════════

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-recv-dogfood-${RUN}.db`)
const TEST_EMAIL = "vishal@quantana.com.au"

function rmDb() {
  for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} }
}

let appProc: ReturnType<typeof Bun.spawn>
let BASE = ""
let aiSrv: ReturnType<typeof Bun.serve>

describe("receiving-side dogfood — full runner vs real server", () => {
  beforeAll(async () => {
    rmDb()
    // Stub OpenRouter so any fire-and-forget chat call (e.g. label-suggest on submit) is deterministic.
    aiSrv = Bun.serve({
      port: 0,
      async fetch() {
        return Response.json({
          choices: [{ message: { content: JSON.stringify({ labels: [] }) } }],
          usage: { prompt_tokens: 10, completion_tokens: 5, cost: 0 },
        })
      },
    })
    const AI_BASE = `http://localhost:${aiSrv.port}`

    const port = 46950 + Math.floor(Math.random() * 300)
    BASE = `http://localhost:${port}`
    appProc = Bun.spawn(["bun", "run", "server.ts"], {
      cwd: join(import.meta.dir, ".."),
      env: {
        ...process.env,
        PORT: String(port),
        TURSO_DATABASE_URL: "file:" + DB_FILE,
        TURSO_AUTH_TOKEN: "",
        KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(71)).toString("base64"),
        KLAV_BASE_URL: BASE,
        KLAV_ALLOWED_DOMAINS: "quantana.com.au",
        KLAV_TEST_OTP: "1",
        KLAV_TEST_OTP_EMAILS: TEST_EMAIL,
        KLAV_DEV_SHOW_OTP: "1",
        OPENROUTER_API_KEY: "test-key",
        OPENROUTER_ENDPOINT: AI_BASE,
        KLAV_TEST_ALLOW_LOOPBACK: "1",
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
    aiSrv?.stop(true)
    rmDb()
  })

  test("auth (fixed_otp) → submit seeded Snap → assert present + at-top in triage", async () => {
    const result = await runReceivingDogfood({
      base: BASE,
      email: TEST_EMAIL,
      testOtpActive: true,
      configuredMethod: "fixed_otp",
      pollTimeoutMs: 8_000,
    })
    expect(result.authPlan.method).toBe("fixed_otp")
    expect(result.projectId.length).toBeGreaterThan(0)
    expect(result.feedbackId).toStartWith("fb_")
    // PRIMARY ORACLE: the just-submitted Snap is present and newest (index 0) in the triage queue.
    expect(result.oracle.checks.present.pass).toBe(true)
    expect(result.oracle.checks.atTop.pass).toBe(true)
    expect(result.oracle.checks.atTop.index).toBe(0)
    expect(result.verdict).toBe("pass")
  }, 30_000)

  test("tickets oracle: with 'autofile' routing the Snap reaches the Tickets board", async () => {
    // The OTHER receiving surface. Default 'autofile' routing advances a trusted Snap straight to 'open',
    // so it surfaces in GET /api/projects/:id/tickets (not the triage 'new' queue). We run against a FRESH
    // project so the project-scoped content-dedup (which normalizes ids to a constant token) can't collapse
    // this Snap into the earlier triage-test one — isolating the tickets-surface behavior cleanly.
    const plan = { method: "fixed_otp" as const, reason: "test" }
    const { cookie } = await establishReceivingSession(
      { base: BASE, email: TEST_EMAIL, testOtpActive: true }, plan,
    )
    const cr = await fetch(`${BASE}/api/projects`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: cookie },
      body: JSON.stringify({ name: `Dogfood Tickets ${RUN}` }),
    })
    expect(cr.status).toBe(201)
    const freshProjectId = (await cr.json()).project.id

    const r = await runReceivingDogfood({
      base: BASE, sessionCookie: cookie, projectId: freshProjectId, email: TEST_EMAIL,
      testOtpActive: true, configuredMethod: "fixed_otp",
      oracleEndpoint: "tickets", setRouting: "autofile", pollTimeoutMs: 8_000,
    })
    expect(r.feedbackId).toStartWith("fb_")
    // Autofile → 'open' → present at the top of the (empty-until-now) Tickets board.
    expect(r.oracle.checks.present.pass).toBe(true)
    expect(r.oracle.checks.atTop.pass).toBe(true)
  }, 30_000)
})
