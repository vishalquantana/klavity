// Task 2: Walk Report data gatherer + branded HTML renderer — TDD test suite.
// Sections:
//   A. Pure renderer tests (no DB)
//   B. Hermetic DB tests (gatherWalkReport)
//   C. One real-Chromium PDF e2e (proves print path)
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ---------------------------------------------------------------------------
// Section A — Pure renderWalkReportHtml tests (no DB needed)
// ---------------------------------------------------------------------------
import { renderWalkReportHtml } from "./trails-report"
import type { WalkReportData } from "./trails-report"

function makeData(overrides: Partial<WalkReportData> = {}): WalkReportData {
  return {
    trail: {
      id: "trl_1",
      projectId: "proj_1",
      name: "Login flow",
      intent: "log in and reach dashboard",
      baseUrl: "https://app.test/",
      baselineRef: null,
      authorKind: "llm",
      status: "active",
      createdBy: "agent",
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    walk: {
      id: "walk_abc",
      trailId: "trl_1",
      projectId: "proj_1",
      trigger: "manual",
      status: "green",
      llmCalls: 2,
      summary: null,
      startedAt: 1700000100000,
      finishedAt: 1700000115000,
    },
    steps: [
      {
        id: "rstep_1",
        runId: "walk_abc",
        trailId: "trl_1",
        stepId: "tstep_1",
        projectId: "proj_1",
        idx: 0,
        tier: "cache",
        verdict: "green",
        confidence: 1,
        diagnosis: null,
        healed: false,
        evidence: { action: "click", selector: "#signin" },
        createdAt: 1700000101000,
      },
    ],
    findings: [],
    projectName: "Acme Web",
    ...overrides,
  }
}

test("(render-1) output contains trail name + intent", () => {
  const html = renderWalkReportHtml(makeData(), { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).toContain("Login flow")
  expect(html).toContain("log in and reach dashboard")
})

test("(render-2) unbranded footer carries the 'powered by Klavity' PLG backlink to signup", () => {
  // KLAVITYKLA-223: the walk-report footer is the PLG carrier. Unbranded projects show
  // "powered by Klavity" linking to signup; the Klavity wordmark still heads the report.
  const html = renderWalkReportHtml(makeData(), { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).toContain("powered by Klavity")
  expect(html).toContain("https://test.example/signup")
  // Klavity wordmark still identifies the report in the header when unbranded.
  expect(html).toContain("Klavity AutoSims")
})

test("(render-3) trail name with XSS characters is HTML-escaped, no raw script injected", () => {
  const data = makeData()
  data.trail.name = '<script>alert(1)</script>'
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).not.toContain("<script>alert(1)</script>")
  expect(html).toContain("&lt;script&gt;")
  // absolutely no <script> tags allowed in output
  const scriptCount = (html.match(/<script/gi) ?? []).length
  expect(scriptCount).toBe(0)
})

test("(render-4) NO <script> tags in output at all (pure static document)", () => {
  const html = renderWalkReportHtml(makeData(), { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect((html.match(/<script/gi) ?? []).length).toBe(0)
})

test("(render-5) verdict banner has verdict text (GREEN walk -> 'green' in output with color)", () => {
  const html = renderWalkReportHtml(makeData(), { baseUrl: "https://test.example", generatedAt: Date.now() })
  // verdict is 'green' and the green color token is present
  expect(html).toContain("#10b981")
  // the walk status text is rendered
  expect(html.toLowerCase()).toContain("green")
})

test("(render-5b) RED walk has red color token in banner", () => {
  const data = makeData()
  data.walk = { ...data.walk, status: "red" }
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).toContain("#e11d48")
  expect(html.toLowerCase()).toContain("red")
})

test("(render-5c) AMBER walk has amber color token", () => {
  const data = makeData()
  data.walk = { ...data.walk, status: "amber" }
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).toContain("#f59e0b")
})

test("(render-6) screenshot step renders an <img> tag", () => {
  const data = makeData()
  data.steps = [{
    ...data.steps[0],
    screenshotUrl: "https://s3.example/shot_1.jpg",
  }]
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).toContain('<img')
  expect(html).toContain("https://s3.example/shot_1.jpg")
})

test("(render-6b) screenshot resolution failure renders a visible placeholder", () => {
  const data = makeData()
  data.steps = [{
    ...data.steps[0],
    screenshotError: "Screenshot could not be loaded.",
  }]
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).not.toContain('<img')
  expect(html).toContain("Screenshot could not be loaded.")
})

test("(render-7) step without screenshot has no <img> for that step", () => {
  const data = makeData()
  // step has no screenshotUrl
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  // no img src pointing to s3
  expect(html).not.toContain("s3.example")
})

test("(render-8) heal from->to selectors rendered when healed step has evidence", () => {
  const data = makeData()
  data.steps = [{
    ...data.steps[0],
    healed: true,
    verdict: "amber",
    evidence: { action: "click", fromSelector: "#old-signin", toSelector: ".new-signin" },
  }]
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).toContain("#old-signin")
  expect(html).toContain(".new-signin")
})

test("(render-9) findings section shows finding titles", () => {
  const data = makeData()
  data.findings = [{
    id: "find_1",
    projectId: "proj_1",
    runId: "walk_abc",
    stepId: null,
    trailId: "trl_1",
    kind: "regression",
    title: "Button label changed",
    evidence: null,
    groundQuote: "the sign in button text changed",
    confidence: 0.92,
    dedupKey: "reg_signin",
    recurrence: 1,
    status: "queued",
    connectorRef: null,
    createdAt: 1700000110000,
    updatedAt: 1700000110000,
  }]
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).toContain("Button label changed")
  expect(html).toContain("the sign in button text changed")
})

test("(render-10) {{cred: placeholder passes through un-resolved and secrets never appear", () => {
  const data = makeData()
  // Seed a step whose evidence contains actionValue with a real secret marker (pw-s3cr3t!)
  // The renderer must NEVER resolve or emit the secret value.
  data.steps = [{
    ...data.steps[0],
    evidence: {
      action: "type",
      selector: "#password",
      actionValue: "{{cred:admin:password}}",
      // Simulate what a resolver WOULD produce — the renderer must NOT touch this
      _resolvedSecret: "pw-s3cr3t!",
    },
  }]
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  // Must never contain the literal secret value
  expect(html).not.toContain("SECRET")
  expect(html).not.toContain("pw-s3cr3t!")
  // Must not contain any resolved secret from _resolvedSecret field
  expect(html).not.toContain("pw-")
  // The placeholder string itself is acceptable if the renderer renders evidence.actionValue
  // but it must appear VERBATIM (still a {{cred:...}} token), never replaced.
  // Confirm no <script> tags snuck in
  expect((html.match(/<script/gi) ?? []).length).toBe(0)
})

test("(render-11) finding groundQuote with XSS chars is escaped", () => {
  const data = makeData()
  data.findings = [{
    id: "find_2",
    projectId: "proj_1",
    runId: "walk_abc",
    stepId: null,
    trailId: "trl_1",
    kind: "visual",
    title: "XSS test",
    evidence: null,
    groundQuote: '<img src=x onerror=alert(2)>',
    confidence: 0.9,
    dedupKey: "xss_1",
    recurrence: 1,
    status: "queued",
    connectorRef: null,
    createdAt: 1700000110000,
    updatedAt: 1700000110000,
  }]
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).not.toContain("<img src=x onerror=alert(2)>")
  expect(html).toContain("&lt;img")
})

test("(render-12) graceful rendering with no steps (old walk, no screenshots)", () => {
  const data = makeData()
  data.steps = []
  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })
  expect(html).toContain("No steps recorded")
  expect((html.match(/<script/gi) ?? []).length).toBe(0)
})

test("(render-13) font-face uses absolute baseUrl in src", () => {
  const html = renderWalkReportHtml(makeData(), { baseUrl: "https://klavity.in", generatedAt: Date.now() })
  expect(html).toContain("https://klavity.in/fonts/fraunces")
  expect(html).toContain("https://klavity.in/fonts/hanken-grotesk")
})

// ---------------------------------------------------------------------------
// Section B — Hermetic DB: gatherWalkReport
// ---------------------------------------------------------------------------

const file = join(tmpdir(), `klav-report-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

const { gatherWalkReport } = await import("./trails-report")
const T = await import("./trails")

async function seedWalk(projectId: string, opts?: { withKey?: boolean }) {
  const trailId = await T.createTrail(projectId, { name: "Test trail", intent: "do something", baseUrl: "https://x.test/" })
  await T.setTrailStatus(projectId, trailId, "active")
  const stepId = await T.addTrailStep(projectId, trailId, { idx: 0, action: "click" })
  const runId = await T.startWalk(projectId, trailId)
  await T.addRunStep(projectId, {
    runId, trailId, stepId, idx: 0, tier: "cache", verdict: "green", confidence: 1,
    evidence: opts?.withKey ? { action: "click", screenshotKey: "shots/key123.jpg" } : { action: "click" },
  })
  await T.finishWalk(projectId, runId, { status: "green", llmCalls: 0 })
  return { trailId, runId, stepId }
}

test("(gather-1) returns null for cross-project runId (IDOR guard)", async () => {
  const { runId } = await seedWalk("proj_g1")
  const result = await gatherWalkReport("proj_OTHER", runId)
  expect(result).toBeNull()
})

test("(gather-2) returns WalkReportData for valid project+runId", async () => {
  const { runId } = await seedWalk("proj_g2")
  const result = await gatherWalkReport("proj_g2", runId)
  expect(result).not.toBeNull()
  expect(result!.walk.id).toBe(runId)
  expect(result!.trail).toBeTruthy()
  expect(Array.isArray(result!.steps)).toBe(true)
  expect(Array.isArray(result!.findings)).toBe(true)
})

test("(gather-3) steps are in idx order", async () => {
  const projectId = "proj_g3"
  const trailId = await T.createTrail(projectId, { name: "Multi-step", intent: "go", baseUrl: "https://x.test/" })
  await T.setTrailStatus(projectId, trailId, "active")
  const s0 = await T.addTrailStep(projectId, trailId, { idx: 0, action: "click" })
  const s1 = await T.addTrailStep(projectId, trailId, { idx: 1, action: "type", actionValue: "hello" })
  const runId = await T.startWalk(projectId, trailId)
  // insert in reverse order to test ordering
  await T.addRunStep(projectId, { runId, trailId, stepId: s1, idx: 1, tier: "cache", verdict: "green", confidence: 1 })
  await T.addRunStep(projectId, { runId, trailId, stepId: s0, idx: 0, tier: "cache", verdict: "green", confidence: 1 })
  await T.finishWalk(projectId, runId, { status: "green", llmCalls: 0 })

  const result = await gatherWalkReport(projectId, runId)
  expect(result!.steps[0].idx).toBe(0)
  expect(result!.steps[1].idx).toBe(1)
})

test("(gather-4) screenshotUrl only set when evidence.screenshotKey present and presign returns a value", async () => {
  const { runId } = await seedWalk("proj_g4", { withKey: true })
  const fakePressign = (key: string) => `https://s3.example/${key}?token=abc`
  const result = await gatherWalkReport("proj_g4", runId, { presign: fakePressign })
  expect(result).not.toBeNull()
  const stepWithKey = result!.steps.find((s) => (s.evidence as any)?.screenshotKey)
  expect(stepWithKey).toBeDefined()
  expect(stepWithKey!.screenshotUrl).toBe("https://s3.example/shots/key123.jpg?token=abc")
})

test("(gather-4b) screenshotUrl accepts embedded image data URLs so reports do not depend on presign expiry", async () => {
  const { runId } = await seedWalk("proj_g4b", { withKey: true })
  const fakeResolver = (_key: string) => "data:image/jpeg;base64,QUJD"
  const result = await gatherWalkReport("proj_g4b", runId, { presign: fakeResolver })
  expect(result).not.toBeNull()
  const stepWithKey = result!.steps.find((s) => (s.evidence as any)?.screenshotKey)
  expect(stepWithKey).toBeDefined()
  expect(stepWithKey!.screenshotUrl).toBe("data:image/jpeg;base64,QUJD")
  expect(stepWithKey!.screenshotError).toBeUndefined()
})

test("(gather-5) no screenshotUrl when evidence has no screenshotKey", async () => {
  const { runId } = await seedWalk("proj_g5", { withKey: false })
  const fakePressign = (key: string) => `https://s3.example/${key}`
  const result = await gatherWalkReport("proj_g5", runId, { presign: fakePressign })
  for (const s of result!.steps) {
    expect(s.screenshotUrl).toBeUndefined()
  }
})

test("(gather-6) presign throwing does not break gather — step just has no screenshotUrl", async () => {
  const { runId } = await seedWalk("proj_g6", { withKey: true })
  const throwingPresign = (_key: string): string => { throw new Error("S3 down") }
  const result = await gatherWalkReport("proj_g6", runId, { presign: throwingPresign })
  expect(result).not.toBeNull()
  for (const s of result!.steps) {
    expect(s.screenshotUrl).toBeUndefined()
    if ((s.evidence as any)?.screenshotKey) expect(s.screenshotError).toBe("Screenshot could not be loaded.")
  }
})

test("(gather-7) findings are filtered to the walk's runId only", async () => {
  const projectId = "proj_g7"
  const { trailId, runId } = await seedWalk(projectId)
  // Record a finding for this run
  await T.recordFinding(projectId, { runId, trailId, kind: "regression", title: "My finding", confidence: 0.9, dedupKey: "fd_g7_1" })
  // Seed another walk and record a finding for it
  const { runId: runId2 } = await seedWalk(projectId)
  await T.recordFinding(projectId, { runId: runId2, trailId, kind: "regression", title: "Other walk finding", confidence: 0.8, dedupKey: "fd_g7_2" })

  const result = await gatherWalkReport(projectId, runId)
  expect(result!.findings).toHaveLength(1)
  expect(result!.findings[0].title).toBe("My finding")
})

// ---------------------------------------------------------------------------
// Section C — Real Chromium PDF e2e (KLAV_E2E=1 only — browsers not installed in CI default)
// ---------------------------------------------------------------------------
import { chromium } from "playwright"

test.if(!!process.env.KLAV_E2E)("(pdf-e2e) setContent -> pdf bytes start with %PDF and length > 10kB", async () => {
  const data = makeData()
  data.steps = [
    {
      ...data.steps[0],
      evidence: { action: "click", selector: "#signin" },
    },
    {
      ...data.steps[0],
      id: "rstep_2",
      idx: 1,
      verdict: "amber",
      healed: true,
      evidence: { action: "click", selector: ".new-btn", fromSelector: "#old-btn", toSelector: ".new-btn" },
    },
  ]
  data.findings = [{
    id: "find_pdf",
    projectId: "proj_1",
    runId: "walk_abc",
    stepId: null,
    trailId: "trl_1",
    kind: "regression",
    title: "Sign-in button renamed",
    evidence: null,
    groundQuote: "The button previously read Sign in",
    confidence: 0.95,
    dedupKey: "reg_signin",
    recurrence: 1,
    status: "queued",
    connectorRef: null,
    createdAt: 1700000110000,
    updatedAt: 1700000110000,
  }]

  const html = renderWalkReportHtml(data, { baseUrl: "https://test.example", generatedAt: Date.now() })

  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "domcontentloaded" })
    const pdfBytes = await page.pdf({ format: "A4" })
    await page.close()

    // Must be real PDF
    const header = Buffer.from(pdfBytes).slice(0, 4).toString("ascii")
    expect(header).toBe("%PDF")
    expect(pdfBytes.length).toBeGreaterThan(10_000)
  } finally {
    await browser.close()
  }
}, 60000)
