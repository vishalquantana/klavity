// KLA-800: accessibility (WCAG) audit tests.
//   • Unit: impact→priority map, URL keying, runA11yScan mapping via a fake page + injected recorder,
//     and failure isolation (a throwing page yields 0, never throws).
//   • Integration (REAL Chromium under Bun — not fake-injected results, per the over-hardening lesson):
//     axe runs against a page with seeded violations and records the exact rules; a clean page records
//     zero (negative control); the audit-off / plumbing-only path records nothing; re-scan bumps recurrence.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { chromium, type Browser } from "playwright"

const file = join(tmpdir(), `klav-a11y-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const A = await import("./trails-a11y")
const T = await import("./trails")

// ── Pure unit ────────────────────────────────────────────────────────────────
test("impactToPriority maps axe impact → severity (critical→urgent … minor/unknown→low)", () => {
  expect(A.impactToPriority("critical")).toBe("urgent")
  expect(A.impactToPriority("serious")).toBe("high")
  expect(A.impactToPriority("moderate")).toBe("medium")
  expect(A.impactToPriority("minor")).toBe("low")
  expect(A.impactToPriority(null)).toBe("low")
  expect(A.impactToPriority("weird")).toBe("low")
})

test("a11yUrlKey strips query + fragment", () => {
  expect(A.a11yUrlKey("https://x.io/checkout?s=1#top")).toBe("https://x.io/checkout")
  expect(A.a11yUrlKey("https://x.io/pay")).toBe("https://x.io/pay")
})

// A fake Playwright-ish page: 1st evaluate = axe source inject (→undefined), 2nd = axe.run (→canned).
function fakePage(result: any) {
  let calls = 0
  return { url: () => "https://app.test/checkout", evaluate: async (_fn: any, _arg?: any) => { calls++; return calls === 1 ? undefined : result } }
}

test("runA11yScan maps violations → findings with impact-derived priority + dedup/contentSig", async () => {
  const canned = { violations: [
    { id: "image-alt", impact: "critical", help: "Images must have alternate text", helpUrl: "https://h/image-alt", tags: ["wcag2a", "wcag111"],
      nodes: [{ target: ["img"], html: "<img src=x.png>", failureSummary: "Fix: add alt" }] },
    { id: "color-contrast", impact: "moderate", help: "Elements must have sufficient contrast", helpUrl: "https://h/color-contrast", tags: ["wcag2aa", "wcag143"],
      nodes: [{ target: [".pay"], html: "<button class=pay>Pay</button>", failureSummary: "Fix contrast",
        any: [{ id: "color-contrast", data: { contrastRatio: 2.9, expectedContrastRatio: 4.5, fgColor: "#bbb", bgColor: "#fff" } }] }] },
  ] }
  const rec: any[] = []
  const n = await A.runA11yScan(fakePage(canned) as any,
    { projectId: "p_unit", runId: "run_u", trailId: "trl_u", urlPath: "https://app.test/checkout" },
    { recordFinding: async (pid, input) => { rec.push({ pid, ...input }); return { id: "f" + rec.length, deduped: false, recurrence: 1 } } })
  expect(n).toBe(2)
  expect(rec.every(r => r.kind === "accessibility")).toBe(true)
  const byRule = Object.fromEntries(rec.map(r => [r.evidence.a11y.ruleId, r]))
  expect(byRule["image-alt"].priority).toBe("urgent")
  expect(byRule["color-contrast"].priority).toBe("medium")
  expect(byRule["image-alt"].dedupKey).toBe("a11y:https://app.test/checkout:image-alt:img")
  expect(byRule["image-alt"].contentSig).toContain("a11y|image-alt|img|")
  expect(byRule["image-alt"].confidence).toBe(1)
  expect(byRule["image-alt"].status).toBe("queued")
  expect(byRule["color-contrast"].evidence.a11y.contrast.ratio).toBe(2.9)
  expect(byRule["color-contrast"].evidence.a11y.helpUrl).toBe("https://h/color-contrast")
})

test("(C1) runA11yScan record loop is wall-time bounded — a slow recorder stops at the budget, returns the partial count, never throws", async () => {
  // 100 single-node violations; a recorder that sleeps 10ms/call; a tiny 120ms record budget.
  // Without the time bound this would do all 100 writes (~1s+); with it, it stops early.
  const many = { violations: Array.from({ length: 100 }, (_v, i) => ({
    id: `rule-${i}`, impact: "minor", help: "x", helpUrl: "h", tags: ["best-practice"],
    nodes: [{ target: [`#n${i}`], html: `<div id=n${i}>`, failureSummary: "f" }] })) }
  let calls = 0
  const n = await A.runA11yScan(fakePage(many) as any,
    { projectId: "p_b", runId: "run_b", trailId: "trl_b", urlPath: "https://app.test/x", recordBudgetMs: 120 },
    { recordFinding: async () => { calls++; await new Promise(r => setTimeout(r, 10)); return { id: "f" + calls, deduped: false, recurrence: 1 } } })
  expect(n).toBeGreaterThan(0)          // it did record some
  expect(n).toBeLessThan(50)            // cut off by the 120ms budget BEFORE the 50-finding cap — proves the time bound, not the count cap
  expect(n).toBe(calls)                 // partial count is reported accurately (not 0)
})

test("(C2) severityForKind floors accessibility at 'low' (matches BASE_SEVERITY), not the 'medium' default", async () => {
  const { severityForKind } = await import("./trails-findings-gate")
  expect(severityForKind("accessibility" as any)).toBe("low")
  expect(severityForKind("visual" as any)).toBe("low")
  expect(severityForKind("regression" as any)).toBe("high")
})

test("runA11yScan is non-fatal: a throwing page yields 0 findings and never throws", async () => {
  const boom = { url: () => "https://app.test/x", evaluate: async () => { throw new Error("page gone") } }
  const rec: any[] = []
  const n = await A.runA11yScan(boom as any,
    { projectId: "p_boom", runId: "r", trailId: "t", urlPath: "https://app.test/x" },
    { recordFinding: async (pid, input) => { rec.push(input); return { id: "x", deduped: false, recurrence: 1 } } })
  expect(n).toBe(0)
  expect(rec).toHaveLength(0)
})

// ── Integration: REAL axe-core against REAL Chromium ───────────────────────────
const VIOLATION_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Checkout</title></head>
<body><main><h1>Pay</h1>
  <img src="logo.png">                              <!-- image-alt (wcag2a) -->
  <input type="text" name="card">                   <!-- label (wcag2a) -->
  <p style="color:#bbbbbb;background:#ffffff">Total due today</p>  <!-- color-contrast (wcag2aa) -->
</main></body></html>`

const CLEAN_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Account</title></head>
<body><main><h1>Account</h1>
  <img src="logo.png" alt="Company logo">
  <label for="card">Card number</label><input id="card" type="text" name="card">
  <p style="color:#111111;background:#ffffff">Total due today</p>
</main></body></html>`

const TAGS = ["wcag2a", "wcag2aa"]
let browser: Browser | null = null
beforeAll(async () => { browser = await chromium.launch({ headless: true }) })

async function rulesFor(projectId: string, runId: string, html: string, tags = TAGS): Promise<number> {
  const page = await browser!.newPage()
  await page.setContent(html, { waitUntil: "load" })
  const n = await A.runA11yScan(page as any, { projectId, runId, trailId: "trl_i", urlPath: "https://app.test/checkout", tags })
  await page.close()
  return n
}

test("integration: seeded violations → accessibility findings with the expected rule IDs + severity", async () => {
  const P = "p_viol"
  await rulesFor(P, "run_v1", VIOLATION_HTML)
  const findings = await T.listFindings(P)
  const a11y = findings.filter(f => f.kind === "accessibility")
  const rules = a11y.map(f => (f.evidence as any)?.a11y?.ruleId)
  expect(rules).toContain("image-alt")
  expect(rules).toContain("label")
  expect(rules).toContain("color-contrast")
  const imgAlt = a11y.find(f => (f.evidence as any).a11y.ruleId === "image-alt")!
  expect(imgAlt.priority).toBe("urgent")             // axe "critical" impact → our "urgent" severity
  expect((imgAlt.evidence as any).a11y.target).toBeTruthy()
  expect(imgAlt.confidence).toBe(1)
}, 30_000)

test("negative control (a): a clean, accessible page records ZERO accessibility findings", async () => {
  const P = "p_clean"
  const n = await rulesFor(P, "run_c1", CLEAN_HTML)
  expect(n).toBe(0)
  const a11y = (await T.listFindings(P)).filter(f => f.kind === "accessibility")
  expect(a11y).toHaveLength(0)
}, 30_000)

test("negative control (c): re-scanning the same violations bumps recurrence, no duplicate rows", async () => {
  const P = "p_dedup"
  await rulesFor(P, "run_d1", VIOLATION_HTML)
  const first = (await T.listFindings(P)).filter(f => f.kind === "accessibility")
  await rulesFor(P, "run_d2", VIOLATION_HTML) // same URL+rules+selectors → dedupKey stable
  const second = (await T.listFindings(P)).filter(f => f.kind === "accessibility")
  expect(second.length).toBe(first.length)                       // no new rows
  expect(Math.max(...second.map(f => f.recurrence))).toBeGreaterThanOrEqual(2) // bumped
}, 30_000)

test("negative control (b, plumbing): fixing the DOM (adding alt/label) stops the rule recurring", async () => {
  const P = "p_fixed"
  await rulesFor(P, "run_f1", VIOLATION_HTML)
  const before = (await T.listFindings(P)).filter(f => (f.evidence as any)?.a11y?.ruleId === "image-alt")
  expect(before.length).toBeGreaterThan(0)
  const n = await rulesFor(P, "run_f2", CLEAN_HTML)  // corrected DOM
  expect(n).toBe(0) // the corrected page yields no violations → nothing recorded/bumped this run
}, 30_000)

// ── Walk-level wiring: gating + "never reddens the walk" ───────────────────────
const { crystallize } = await import("./trails-crystallize")
const { walkTrail } = await import("./trails-runner")

// A data: URL page with seeded violations + a stable <h1> the trail can assert (walks green).
const WALK_URL = "data:text/html," + encodeURIComponent(
  `<!doctype html><html lang="en"><head><title>Checkout</title></head><body><main>` +
  `<h1>Checkout</h1><img src="logo.png"><input type="text" name="card">` +
  `<p style="color:#bbbbbb;background:#ffffff">Total due</p></main></body></html>`)

function walkTrajectory() {
  return {
    name: "checkout page a11y", intent: "assert the checkout heading is present",
    baseUrl: WALK_URL, authorKind: "llm" as const, createdBy: "agent@klavity",
    steps: [
      { action: "assert" as const, checkpoint: { description: "heading present" }, url: WALK_URL, domHash: "pay",
        target: { role: "heading", accessibleName: "Checkout", resolvedSelector: "h1" } },
    ],
  }
}

test("walk with a11y ON records advisory accessibility findings and stays GREEN", async () => {
  const P = "p_walk_on"
  const { trailId } = await crystallize(P, walkTrajectory())
  const summary = await walkTrail(P, trailId, { fixtureUrl: WALK_URL, suppressFindings: false, a11y: { enabled: true, tags: TAGS } })
  expect(summary.verdict).toBe("green")                              // a11y findings NEVER redden the walk
  const a11y = (await T.listFindings(P)).filter(f => f.kind === "accessibility")
  const rules = a11y.map(f => (f.evidence as any)?.a11y?.ruleId)
  expect(rules).toContain("image-alt")
  expect(rules).toContain("color-contrast")
  expect(a11y.every(f => f.status === "queued")).toBe(true)          // advisory, never auto-filed
}, 60_000)

test("negative control: walk with a11y OFF records ZERO accessibility findings (gating, not plumbing)", async () => {
  const P = "p_walk_off"
  const { trailId } = await crystallize(P, walkTrajectory())
  const summary = await walkTrail(P, trailId, { fixtureUrl: WALK_URL, suppressFindings: false, a11y: { enabled: false } })
  expect(summary.verdict).toBe("green")
  const a11y = (await T.listFindings(P)).filter(f => f.kind === "accessibility")
  expect(a11y).toHaveLength(0)
}, 60_000)
