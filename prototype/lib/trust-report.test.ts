// lib/trust-report.test.ts
// Hermetic: in-memory libsql + injected mail mock (no SendGrid, no network).
import { test, expect, describe } from "bun:test"
import { createClient, type Client } from "@libsql/client"
import { applySchema } from "./db"
import {
  gatherTrustReport,
  buildTrustReportHtml,
  buildTrustReportText,
  sendTrustReport,
  getTrustReportLastSent,
  setTrustReportLastSent,
  TRUST_REPORT_LAST_SENT_KEY,
  WEEK_MS,
  type TrustReportDeps,
} from "./trust-report"

// ── helpers ───────────────────────────────────────────────────────────────────

async function fresh(): Promise<Client> {
  const c = createClient({ url: "file::memory:" })
  await applySchema(c)
  // modal_config_json may arrive via ALTER in prod initDb; add it for in-memory test DBs.
  await c.execute("ALTER TABLE projects ADD COLUMN modal_config_json TEXT DEFAULT '{}'").catch(() => {})
  return c
}

async function seedProject(c: Client, id = "proj_1", name = "Acme Web", accountId = "acct_1") {
  const now = Date.now()
  await c.execute({
    sql: "INSERT OR IGNORE INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)",
    args: [accountId, "Acme", "owner@acme.test", now],
  })
  await c.execute({
    sql: "INSERT OR IGNORE INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)",
    args: [`am_owner_${id}`, accountId, "owner@acme.test", "owner", now],
  })
  await c.execute({
    sql: "INSERT OR IGNORE INTO projects (id,account_id,name,created_at,updated_at,modal_config_json) VALUES (?,?,?,?,?,?)",
    args: [id, accountId, name, now, now, "{}"],
  })
}

function makeMailSpy() {
  const calls: Array<{ to: string[]; subject: string; html: string; text: string }> = []
  const spy = async (to: string[], subject: string, html: string, text: string) => {
    calls.push({ to, subject, html, text })
  }
  return { calls, spy }
}

const WINDOW_START = 1_700_000_000_000
const WINDOW_END = WINDOW_START + WEEK_MS

// Insert a snap feedback row (no sim_id)
async function insertSnap(c: Client, projectId: string, opts: {
  id?: string; observation?: string; suggestedTitle?: string; severity?: string;
  urlPath?: string; createdAt?: number
} = {}) {
  const id = opts.id ?? `fb_${Math.random().toString(36).slice(2)}`
  const at = opts.createdAt ?? WINDOW_START + 1000
  await c.execute({
    sql: `INSERT INTO feedback (id,project_id,observation,suggested_bug_json,severity,url_path,created_at)
          VALUES (?,?,?,?,?,?,?)`,
    args: [
      id, projectId,
      opts.observation ?? "Something broke",
      opts.suggestedTitle ? JSON.stringify({ title: opts.suggestedTitle }) : "{}",
      opts.severity ?? null,
      opts.urlPath ?? null,
      at,
    ],
  })
}

// Insert a Sim feedback row (has sim_id)
async function insertSimFeedback(c: Client, projectId: string, opts: {
  id?: string; simId?: string; simName?: string; observation?: string; suggestedTitle?: string; createdAt?: number
} = {}) {
  const simId = opts.simId ?? "sim_alice"
  const id = opts.id ?? `fb_sim_${Math.random().toString(36).slice(2)}`
  const at = opts.createdAt ?? WINDOW_START + 2000
  // Ensure the persona row exists for the JOIN
  if (opts.simName) {
    await c.execute({
      sql: "INSERT OR IGNORE INTO personas (id,project_id,name,created_at,updated_at) VALUES (?,?,?,?,?)",
      args: [simId, projectId, opts.simName, at, at],
    }).catch(() => {})
  }
  await c.execute({
    sql: `INSERT INTO feedback (id,project_id,sim_id,observation,suggested_bug_json,created_at)
          VALUES (?,?,?,?,?,?)`,
    args: [
      id, projectId, simId,
      opts.observation ?? "Sim noticed something",
      opts.suggestedTitle ? JSON.stringify({ title: opts.suggestedTitle }) : "{}",
      at,
    ],
  })
}

// Insert a trail_run with optional findings
async function insertWalkRun(c: Client, projectId: string, opts: {
  id?: string; status?: string; findings?: string[]; finishedAt?: number
} = {}) {
  const runId = opts.id ?? `run_${Math.random().toString(36).slice(2)}`
  const at = opts.finishedAt ?? WINDOW_START + 3000
  // Need a trail to satisfy FK-like expectations
  const trailId = `trail_${runId}`
  await c.execute({
    sql: "INSERT OR IGNORE INTO trails (id,project_id,name,intent,base_url,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
    args: [trailId, projectId, "My Trail", "", "https://example.com", at, at],
  })
  await c.execute({
    sql: `INSERT INTO trail_runs (id,trail_id,project_id,trigger,status,started_at,finished_at) VALUES (?,?,?,?,?,?,?)`,
    args: [runId, trailId, projectId, "schedule", opts.status ?? "pass", at - 1000, at],
  })
  for (const title of (opts.findings ?? [])) {
    const fid = `finding_${Math.random().toString(36).slice(2)}`
    await c.execute({
      sql: `INSERT INTO findings (id,project_id,run_id,trail_id,kind,title,dedup_key,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
      args: [fid, projectId, runId, trailId, "regression", title, fid, at, at],
    })
  }
}

// Insert a recurring feedback row
async function insertRecurring(c: Client, projectId: string, opts: {
  id?: string; issueKey?: string; observation?: string; recurrenceCount?: number; createdAt?: number
} = {}) {
  const id = opts.id ?? `fb_r_${Math.random().toString(36).slice(2)}`
  const at = opts.createdAt ?? WINDOW_START + 500
  await c.execute({
    sql: `INSERT INTO feedback (id,project_id,observation,issue_key,recurrence_count,created_at) VALUES (?,?,?,?,?,?)`,
    args: [id, projectId, opts.observation ?? "Recurring bug", opts.issueKey ?? `ik_${id}`, opts.recurrenceCount ?? 2, at],
  })
}

// ── gatherTrustReport ─────────────────────────────────────────────────────────

describe("gatherTrustReport", () => {
  test("empty week → isQuietWeek + all zeros", async () => {
    const c = await fresh()
    await seedProject(c)
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.isQuietWeek).toBe(true)
    expect(data.snapReportsTotal).toBe(0)
    expect(data.simFindingsTotal).toBe(0)
    expect(data.autoSimRunsTotal).toBe(0)
    expect(data.regressionsTotal).toBe(0)
    expect(data.recurringIssuesTotal).toBe(0)
    expect(data.snapHighlights).toHaveLength(0)
    expect(data.regressionHighlights).toHaveLength(0)
    expect(data.simFindingHighlights).toHaveLength(0)
    expect(data.recurringHighlights).toHaveLength(0)
  })

  test("snap reports are counted and highlighted (top-3)", async () => {
    const c = await fresh()
    await seedProject(c)
    await insertSnap(c, "proj_1", { suggestedTitle: "Checkout fails", severity: "high", urlPath: "/checkout" })
    await insertSnap(c, "proj_1", { suggestedTitle: "Login broken" })
    await insertSnap(c, "proj_1", { suggestedTitle: "Search slow" })
    await insertSnap(c, "proj_1", { suggestedTitle: "Overflow on mobile" }) // 4th — not in highlights
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.snapReportsTotal).toBe(4)
    expect(data.snapHighlights).toHaveLength(3)
    expect(data.isQuietWeek).toBe(false)
  })

  test("snap highlight extracts title from suggested_bug_json", async () => {
    const c = await fresh()
    await seedProject(c)
    await insertSnap(c, "proj_1", { suggestedTitle: "Payment timeout on checkout" })
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.snapHighlights[0].title).toBe("Payment timeout on checkout")
  })

  test("snap highlight falls back to observation when no suggested_bug_json title", async () => {
    const c = await fresh()
    await seedProject(c)
    await insertSnap(c, "proj_1", { observation: "Button does nothing when clicked" })
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.snapHighlights[0].title).toContain("Button does nothing")
  })

  test("feedback outside the window is excluded", async () => {
    const c = await fresh()
    await seedProject(c)
    // Before window
    await insertSnap(c, "proj_1", { id: "old_1", createdAt: WINDOW_START - 1000 })
    // After window
    await insertSnap(c, "proj_1", { id: "future_1", createdAt: WINDOW_END + 1000 })
    // In window
    await insertSnap(c, "proj_1", { id: "in_window", createdAt: WINDOW_START + 100 })
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.snapReportsTotal).toBe(1)
  })

  test("Sim feedback is counted separately from snap", async () => {
    const c = await fresh()
    await seedProject(c)
    await insertSnap(c, "proj_1", { id: "snap_1" })
    await insertSimFeedback(c, "proj_1", { simName: "Alice", suggestedTitle: "Alice found a UX issue" })
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.snapReportsTotal).toBe(1)
    expect(data.simFindingsTotal).toBe(1)
    expect(data.simFindingHighlights[0].title).toBe("Alice found a UX issue")
    expect(data.simFindingHighlights[0].simName).toBe("Alice")
    expect(data.isQuietWeek).toBe(false)
  })

  test("AutoSim run with findings = regression caught", async () => {
    const c = await fresh()
    await seedProject(c)
    await insertWalkRun(c, "proj_1", {
      status: "fail",
      findings: ["Checkout flow breaks at step 3", "Payment timeout"],
    })
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.autoSimRunsTotal).toBe(1)
    expect(data.regressionsTotal).toBe(1)
    expect(data.regressionHighlights).toContain("Checkout flow breaks at step 3")
    expect(data.isQuietWeek).toBe(false)
  })

  test("AutoSim run with no findings = pass, regressionsTotal=0", async () => {
    const c = await fresh()
    await seedProject(c)
    await insertWalkRun(c, "proj_1", { status: "pass", findings: [] })
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.autoSimRunsTotal).toBe(1)
    expect(data.regressionsTotal).toBe(0)
    expect(data.regressionHighlights).toHaveLength(0)
  })

  test("multiple walk runs — regressionsTotal counts distinct run_ids", async () => {
    const c = await fresh()
    await seedProject(c)
    // run_a has 2 findings (counts as 1 regression)
    await insertWalkRun(c, "proj_1", { id: "run_a", findings: ["Finding A1", "Finding A2"] })
    // run_b has no findings
    await insertWalkRun(c, "proj_1", { id: "run_b", findings: [] })
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.autoSimRunsTotal).toBe(2)
    expect(data.regressionsTotal).toBe(1)
  })

  test("walk runs outside the window are excluded", async () => {
    const c = await fresh()
    await seedProject(c)
    await insertWalkRun(c, "proj_1", { id: "old_run", finishedAt: WINDOW_START - 1000, findings: ["old issue"] })
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.autoSimRunsTotal).toBe(0)
    expect(data.regressionsTotal).toBe(0)
  })

  test("recurring issues are counted from feedback in the window", async () => {
    const c = await fresh()
    await seedProject(c)
    await insertRecurring(c, "proj_1", { observation: "Cart resets on navigation", recurrenceCount: 3 })
    await insertRecurring(c, "proj_1", { observation: "Login loop", recurrenceCount: 2 })
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.recurringIssuesTotal).toBe(2)
    expect(data.recurringHighlights[0].title).toContain("Cart resets")
    expect(data.recurringHighlights[0].count).toBe(3)
    expect(data.isQuietWeek).toBe(false)
  })

  test("project name is resolved from DB", async () => {
    const c = await fresh()
    await seedProject(c, "proj_1", "My Cool App")
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.projectName).toBe("My Cool App")
  })

  test("feedback in a different project is excluded", async () => {
    const c = await fresh()
    await seedProject(c, "proj_1", "App A")
    await seedProject(c, "proj_2", "App B", "acct_2")
    await insertSnap(c, "proj_2", { id: "other_proj_fb" })
    const data = await gatherTrustReport(c, "proj_1", WINDOW_START, WINDOW_END)
    expect(data.snapReportsTotal).toBe(0)
  })
})

// ── buildTrustReportHtml ──────────────────────────────────────────────────────

describe("buildTrustReportHtml", () => {
  function baseline() {
    return {
      projectId: "proj_1",
      projectName: "Acme Web",
      weekStart: new Date(WINDOW_START),
      weekEnd: new Date(WINDOW_END),
      snapReportsTotal: 0,
      snapHighlights: [],
      autoSimRunsTotal: 0,
      regressionsTotal: 0,
      regressionHighlights: [],
      simFindingsTotal: 0,
      simFindingHighlights: [],
      recurringIssuesTotal: 0,
      recurringHighlights: [],
      isQuietWeek: true,
    }
  }

  test("renders brand chrome", () => {
    const html = buildTrustReportHtml(baseline())
    expect(html).toContain(">Klavity</div>")
    expect(html).toContain("Weekly Trust Report")
    expect(html).toContain("#1e1b4b")
    expect(html).toContain("#6366f1")
  })

  test("shows project name", () => {
    const html = buildTrustReportHtml({ ...baseline(), projectName: "MyApp" })
    expect(html).toContain("MyApp")
  })

  test("shows quiet week message when isQuietWeek=true", () => {
    const html = buildTrustReportHtml(baseline())
    expect(html).toContain("Quiet week")
  })

  test("does NOT show quiet week message when there is activity", () => {
    const html = buildTrustReportHtml({ ...baseline(), isQuietWeek: false, snapReportsTotal: 1 })
    expect(html).not.toContain("Quiet week")
  })

  test("shows correct snap report count", () => {
    const html = buildTrustReportHtml({
      ...baseline(),
      isQuietWeek: false,
      snapReportsTotal: 7,
      snapHighlights: [
        { title: "Checkout crash", urlPath: "/checkout", severity: "critical" },
        { title: "Login page broken", urlPath: "/login", severity: null },
        { title: "Image missing", urlPath: null, severity: "low" },
      ],
    })
    expect(html).toContain(">7</div>")
    expect(html).toContain("Checkout crash")
    expect(html).toContain("+ 4 more reports this week")
  })

  test("shows regression highlights", () => {
    const html = buildTrustReportHtml({
      ...baseline(),
      isQuietWeek: false,
      autoSimRunsTotal: 2,
      regressionsTotal: 1,
      regressionHighlights: ["Checkout flow breaks at step 3"],
    })
    expect(html).toContain("Checkout flow breaks at step 3")
    expect(html).toContain("2 AutoSim runs completed")
    expect(html).toContain("1 caught regression")
  })

  test("shows all-pass message when walks ran but no regressions", () => {
    const html = buildTrustReportHtml({
      ...baseline(),
      isQuietWeek: false,
      autoSimRunsTotal: 3,
      regressionsTotal: 0,
      regressionHighlights: [],
    })
    expect(html).toContain("All 3 AutoSim runs passed")
  })

  test("shows Sim finding highlights with Sim name badge", () => {
    const html = buildTrustReportHtml({
      ...baseline(),
      isQuietWeek: false,
      simFindingsTotal: 1,
      simFindingHighlights: [{ title: "Nav bar unreachable", simName: "Alice" }],
    })
    expect(html).toContain("Nav bar unreachable")
    expect(html).toContain("via Alice")
  })

  test("shows recurring issue highlights with count badge", () => {
    const html = buildTrustReportHtml({
      ...baseline(),
      isQuietWeek: false,
      recurringIssuesTotal: 2,
      recurringHighlights: [
        { title: "Cart resets on nav", count: 4 },
        { title: "Login loop", count: 2 },
      ],
    })
    expect(html).toContain("Cart resets on nav")
    expect(html).toContain("×4")
    expect(html).toContain("×2")
  })

  test("HTML-escapes malicious project name", () => {
    const html = buildTrustReportHtml({ ...baseline(), projectName: "<script>alert('xss')</script>" })
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })

  test("HTML-escapes malicious report title", () => {
    const html = buildTrustReportHtml({
      ...baseline(),
      isQuietWeek: false,
      snapReportsTotal: 1,
      snapHighlights: [{ title: "<img src=x onerror=alert(1)>", urlPath: null, severity: null }],
    })
    expect(html).not.toContain("<img src=x")
    expect(html).toContain("&lt;img")
  })

  test("dashboard CTA link contains projectId", () => {
    const html = buildTrustReportHtml({ ...baseline(), projectId: "proj_abc123" })
    expect(html).toContain("project=proj_abc123")
  })
})

// ── buildTrustReportText ──────────────────────────────────────────────────────

describe("buildTrustReportText", () => {
  function baseline() {
    return {
      projectId: "proj_1",
      projectName: "Acme Web",
      weekStart: new Date(WINDOW_START),
      weekEnd: new Date(WINDOW_END),
      snapReportsTotal: 2,
      snapHighlights: [{ title: "Checkout crash", urlPath: "/checkout", severity: "high" }],
      autoSimRunsTotal: 1,
      regressionsTotal: 1,
      regressionHighlights: ["Checkout regression"],
      simFindingsTotal: 0,
      simFindingHighlights: [],
      recurringIssuesTotal: 1,
      recurringHighlights: [{ title: "Login loop", count: 3 }],
      isQuietWeek: false,
    }
  }

  test("contains project name and klavity branding", () => {
    const text = buildTrustReportText(baseline())
    expect(text).toContain("Acme Web")
    expect(text).toContain("Klavity")
  })

  test("contains metrics", () => {
    const text = buildTrustReportText(baseline())
    expect(text).toContain("Bug reports filed:      2")
    expect(text).toContain("Regressions caught:     1")
    expect(text).toContain("Recurring issues:       1")
  })

  test("contains report highlight titles", () => {
    const text = buildTrustReportText(baseline())
    expect(text).toContain("Checkout crash")
    expect(text).toContain("[high]")
  })

  test("contains regression highlights", () => {
    const text = buildTrustReportText(baseline())
    expect(text).toContain("Checkout regression")
  })

  test("contains recurring issue with ×count", () => {
    const text = buildTrustReportText(baseline())
    expect(text).toContain("Login loop")
    expect(text).toContain("×3")
  })

  test("quiet week shows quiet message", () => {
    const text = buildTrustReportText({ ...baseline(), isQuietWeek: true })
    expect(text).toContain("Quiet week")
  })

  test("contains dashboard link", () => {
    const text = buildTrustReportText({ ...baseline(), projectId: "proj_xyz" })
    expect(text).toContain("project=proj_xyz")
  })
})

// ── last-sent marker ──────────────────────────────────────────────────────────

describe("getTrustReportLastSent / setTrustReportLastSent", () => {
  test("returns null when never sent", async () => {
    const c = await fresh()
    await seedProject(c)
    expect(await getTrustReportLastSent(c, "proj_1")).toBeNull()
  })

  test("round-trips the last_sent timestamp", async () => {
    const c = await fresh()
    await seedProject(c)
    const ts = 1_700_001_234_567
    await setTrustReportLastSent(c, "proj_1", ts)
    expect(await getTrustReportLastSent(c, "proj_1")).toBe(ts)
  })

  test("preserves other modal_config_json keys", async () => {
    const c = await fresh()
    await seedProject(c)
    // Seed an existing config key
    await c.execute({
      sql: "UPDATE projects SET modal_config_json=? WHERE id=?",
      args: [JSON.stringify({ theme: "dark", slack_webhook_url: "https://hooks.slack.com/x" }), "proj_1"],
    })
    await setTrustReportLastSent(c, "proj_1", 12345)
    const r = await c.execute({ sql: "SELECT modal_config_json FROM projects WHERE id=?", args: ["proj_1"] })
    const cfg = JSON.parse(String((r.rows[0] as any).modal_config_json))
    expect(cfg.theme).toBe("dark")
    expect(cfg.slack_webhook_url).toBe("https://hooks.slack.com/x")
    expect(cfg[TRUST_REPORT_LAST_SENT_KEY]).toBe(12345)
  })
})

// ── sendTrustReport ───────────────────────────────────────────────────────────

describe("sendTrustReport", () => {
  test("sends to account owner + admins", async () => {
    const c = await fresh()
    await seedProject(c)
    // Add an admin
    await c.execute({
      sql: "INSERT INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)",
      args: ["am_admin", "acct_1", "admin@acme.test", "admin", Date.now()],
    })
    await insertSnap(c, "proj_1")
    const { calls, spy } = makeMailSpy()
    const deps: TrustReportDeps = { db: c, sendEmail: spy }
    const result = await sendTrustReport(deps, "proj_1", "acct_1", WINDOW_START, WINDOW_END)
    expect(result.sent).toBe(true)
    expect(result.to).toContain("owner@acme.test")
    expect(result.to).toContain("admin@acme.test")
    expect(calls).toHaveLength(1)
    expect(calls[0].subject).toContain("Klavity weekly digest")
    expect(calls[0].subject).toContain("Acme Web")
    expect(calls[0].html).toContain("Weekly Trust Report")
    expect(calls[0].text).toContain("Klavity")
  })

  test("quiet-week subject uses quiet label", async () => {
    const c = await fresh()
    await seedProject(c)
    const { calls, spy } = makeMailSpy()
    await sendTrustReport({ db: c, sendEmail: spy }, "proj_1", "acct_1", WINDOW_START, WINDOW_END)
    expect(calls[0].subject).toContain("quiet week")
  })

  test("active-week subject includes signal count", async () => {
    const c = await fresh()
    await seedProject(c)
    await insertSnap(c, "proj_1")
    await insertSnap(c, "proj_1")
    const { calls, spy } = makeMailSpy()
    await sendTrustReport({ db: c, sendEmail: spy }, "proj_1", "acct_1", WINDOW_START, WINDOW_END)
    expect(calls[0].subject).toContain("2 signals this week")
  })

  test("records last_sent timestamp after send", async () => {
    const c = await fresh()
    await seedProject(c)
    const { spy } = makeMailSpy()
    const before = Date.now()
    await sendTrustReport({ db: c, sendEmail: spy }, "proj_1", "acct_1", WINDOW_START, WINDOW_END)
    const after = Date.now()
    const lastSent = await getTrustReportLastSent(c, "proj_1")
    expect(lastSent).toBeGreaterThanOrEqual(before)
    expect(lastSent).toBeLessThanOrEqual(after)
  })

  test("does not send when no recipients", async () => {
    const c = await fresh()
    // Project with no account members and no owner_email on account
    const now = Date.now()
    await c.execute({
      sql: "INSERT INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)",
      args: ["acct_empty", "Ghost", "", now],
    })
    await c.execute({
      sql: "INSERT INTO projects (id,account_id,name,created_at,updated_at,modal_config_json) VALUES (?,?,?,?,?,?)",
      args: ["proj_empty", "acct_empty", "Ghost Project", now, now, "{}"],
    })
    const { calls, spy } = makeMailSpy()
    const result = await sendTrustReport({ db: c, sendEmail: spy }, "proj_empty", "acct_empty", WINDOW_START, WINDOW_END)
    expect(result.sent).toBe(false)
    expect(calls).toHaveLength(0)
  })

  test("returns the gathered data for inspection", async () => {
    const c = await fresh()
    await seedProject(c)
    await insertSnap(c, "proj_1", { suggestedTitle: "Auth breaks on mobile" })
    const { spy } = makeMailSpy()
    const result = await sendTrustReport({ db: c, sendEmail: spy }, "proj_1", "acct_1", WINDOW_START, WINDOW_END)
    expect(result.data.snapReportsTotal).toBe(1)
    expect(result.data.snapHighlights[0].title).toBe("Auth breaks on mobile")
  })

  test("de-duplicates recipients (owner appears in both accounts and members)", async () => {
    const c = await fresh()
    await seedProject(c)
    // owner@acme.test is already inserted as account owner; add again as a member to simulate dup
    await c.execute({
      sql: "INSERT OR IGNORE INTO account_members (id,account_id,email,account_role,created_at) VALUES (?,?,?,?,?)",
      args: ["am_dup", "acct_1", "owner@acme.test", "admin", Date.now()],
    })
    const { calls, spy } = makeMailSpy()
    const result = await sendTrustReport({ db: c, sendEmail: spy }, "proj_1", "acct_1", WINDOW_START, WINDOW_END)
    expect(result.to.filter((e) => e === "owner@acme.test")).toHaveLength(1)
  })
})
