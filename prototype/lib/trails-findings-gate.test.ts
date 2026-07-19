// Layer E — findings gate: pure decision, precision metric, injected-filer executor, real connector filer.
// Hermetic local libsql (mirrors the trails engine e2e suites). NO network: the filer is injected as a
// mock in the executor tests; the real connector filer is exercised only for its no-connector null path.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-gate-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
let db: any
beforeAll(async () => { db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })
const T = await import("./trails")
const G = await import("./trails-findings-gate")

// ── Task 1: pure decision + precision ───────────────────────────────────────────

test("decideFindingAction: only high-confidence regressions auto-file", () => {
  expect(G.decideFindingAction({ kind: "regression", confidence: 0.95 })).toBe("auto_file")
  expect(G.decideFindingAction({ kind: "regression", confidence: 0.5 })).toBe("queue")
  expect(G.decideFindingAction({ kind: "amber_heal", confidence: 0.99 })).toBe("queue")
  expect(G.decideFindingAction({ kind: "visual", confidence: 0.99 })).toBe("queue")
})

test("projectPrecision = filed/(filed+dismissed), ignoring still-queued", async () => {
  const proj = "proj_prec"
  const walk = await T.startWalk(proj, "trl_x")
  const a = await T.recordFinding(proj, { runId: walk, trailId: "trl_x", kind: "regression", title: "A", confidence: 0.95, dedupKey: "a" })
  const b = await T.recordFinding(proj, { runId: walk, trailId: "trl_x", kind: "regression", title: "B", confidence: 0.95, dedupKey: "b" })
  const c = await T.recordFinding(proj, { runId: walk, trailId: "trl_x", kind: "regression", title: "C", confidence: 0.95, dedupKey: "c" })
  await T.setFindingStatus(proj, a.id, "filed")
  await T.setFindingStatus(proj, b.id, "filed")
  await T.setFindingStatus(proj, c.id, "dismissed")
  const p = await G.projectPrecision(proj)
  expect(p.filed).toBe(2); expect(p.dismissed).toBe(1); expect(p.precision).toBeCloseTo(2 / 3)
})

// ── Task 2: executor with injected filer ────────────────────────────────────────

test("processWalkFindings auto-files high-confidence regressions, queues the rest", async () => {
  const proj = "proj_gate_exec"
  const walk = await T.startWalk(proj, "trl_g")
  await T.recordFinding(proj, { runId: walk, trailId: "trl_g", kind: "regression", title: "gone", confidence: 0.95, dedupKey: "g1" })
  await T.recordFinding(proj, { runId: walk, trailId: "trl_g", kind: "amber_heal", title: "unsure", confidence: 0.99, dedupKey: "g2" })
  const filer = async () => ({ connectorRef: "plane:PROJ-7" })
  const res = await G.processWalkFindings(proj, walk, { filer })
  expect(res.autoFiled).toHaveLength(1)
  expect(res.queued).toHaveLength(1)
  const filed = (await T.listFindings(proj, { status: "auto_filed" }))[0]
  expect(filed.connectorRef).toBe("plane:PROJ-7")
})

test("processWalkFindings records and logs connector failures on the finding", async () => {
  const proj = "proj_gate_fail"
  const walk = await T.startWalk(proj, "trl_fail")
  const f = await T.recordFinding(proj, { runId: walk, trailId: "trl_fail", kind: "regression", title: "gone", confidence: 0.95, dedupKey: "gf1" })
  const originalWarn = console.warn
  const logs: string[] = []
  console.warn = (...args: unknown[]) => { logs.push(args.map(String).join(" ")) }
  try {
    const res = await G.processWalkFindings(proj, walk, {
      filer: async () => { throw new Error("Plane HTTP 500") },
    })
    expect(res.autoFiled).toHaveLength(0)
    expect(res.queued).toEqual([f.id])
  } finally {
    console.warn = originalWarn
  }
  const after = (await T.listFindings(proj)).find((x) => x.id === f.id)
  expect(after?.status).toBe("queued")
  expect(after?.connectorError).toContain("Plane HTTP 500")
  expect(logs.some((line) => line.includes("connector filing failed") && line.includes("Plane HTTP 500"))).toBe(true)
})

test("fileFindingById files a queued finding via the injected filer", async () => {
  const proj = "proj_gate_file"
  const walk = await T.startWalk(proj, "trl_f")
  const f = await T.recordFinding(proj, { runId: walk, trailId: "trl_f", kind: "amber_heal", title: "review me", confidence: 0.7, dedupKey: "f1" })
  const filer = async () => ({ connectorRef: "github:owner/repo#42" })
  const res = await G.fileFindingById(proj, f.id, { filer })
  expect(res.ok).toBe(true)
  expect(res.connectorRef).toBe("github:owner/repo#42")
  const filed = (await T.listFindings(proj, { status: "filed" })).find((x) => x.id === f.id)
  expect(filed?.connectorRef).toBe("github:owner/repo#42")
})

test("dismissFinding removes it from the queue and precision", async () => {
  const proj = "proj_gate_dismiss"
  const walk = await T.startWalk(proj, "trl_d")
  const f = await T.recordFinding(proj, { runId: walk, trailId: "trl_d", kind: "amber_heal", title: "x", confidence: 0.7, dedupKey: "d1" })
  await G.dismissFinding(proj, f.id)
  expect((await T.listFindings(proj, { status: "queued" })).some((x) => x.id === f.id)).toBe(false)
})

// ── Anti-slop guarantee: a dismissed finding is never re-filed (Priority 1) ───────
// A human-dismissed regression that recurs on the next Walk must NOT be re-queued or auto-filed.
test("recordFinding: a dismissed regression that recurs is NOT resurrected (stays dismissed, recurrence bumped)", async () => {
  const proj = "proj_dismiss_dedup"
  const walk1 = await T.startWalk(proj, "trl_dd")
  const first = await T.recordFinding(proj, { runId: walk1, trailId: "trl_dd", kind: "regression", title: "flaky reg", confidence: 0.95, dedupKey: "rec1" })
  expect(first.deduped).toBe(false)
  await T.setFindingStatus(proj, first.id, "dismissed")

  // Next Walk surfaces the SAME finding (same dedupKey).
  const walk2 = await T.startWalk(proj, "trl_dd")
  const again = await T.recordFinding(proj, { runId: walk2, trailId: "trl_dd", kind: "regression", title: "flaky reg", confidence: 0.95, dedupKey: "rec1" })

  // Deduped onto the existing row — NOT a fresh queued insert.
  expect(again.deduped).toBe(true)
  expect(again.id).toBe(first.id)
  expect(again.recurrence).toBe(2)

  // Exactly one row for this dedupKey, still dismissed, never re-queued.
  const all = await T.listFindings(proj)
  const rows = all.filter((x) => x.dedupKey === "rec1")
  expect(rows).toHaveLength(1)
  expect(rows[0].status).toBe("dismissed")
  expect(rows[0].recurrence).toBe(2)
  expect((await T.listFindings(proj, { status: "queued" })).some((x) => x.dedupKey === "rec1")).toBe(false)

  // And it would never auto-file: processWalkFindings only touches queued rows for this run.
  let filerCalls = 0
  const filer = async () => { filerCalls++; return { connectorRef: "plane:NOPE-1" } }
  const res = await G.processWalkFindings(proj, walk2, { filer })
  expect(res.autoFiled).toHaveLength(0)
  expect(filerCalls).toBe(0)
})

// ── Resurrection guard on the human file route (Priority 2) ───────────────────────
test("fileFindingById refuses to file a dismissed finding (ok:false, status unchanged)", async () => {
  const proj = "proj_file_guard"
  const walk = await T.startWalk(proj, "trl_fg")
  const f = await T.recordFinding(proj, { runId: walk, trailId: "trl_fg", kind: "regression", title: "gone", confidence: 0.95, dedupKey: "fg1" })
  await G.dismissFinding(proj, f.id)
  let filerCalls = 0
  const filer = async () => { filerCalls++; return { connectorRef: "plane:X-1" } }
  const res = await G.fileFindingById(proj, f.id, { filer })
  expect(res.ok).toBe(false)
  expect(filerCalls).toBe(0) // never even attempted the push
  const after = (await T.listFindings(proj)).find((x) => x.id === f.id)
  expect(after?.status).toBe("dismissed")
})

test("fileFindingById refuses to re-file an already-filed finding", async () => {
  const proj = "proj_file_guard2"
  const walk = await T.startWalk(proj, "trl_fg2")
  const f = await T.recordFinding(proj, { runId: walk, trailId: "trl_fg2", kind: "regression", title: "gone", confidence: 0.95, dedupKey: "fg2" })
  const filer = async () => ({ connectorRef: "plane:Y-1" })
  expect((await G.fileFindingById(proj, f.id, { filer })).ok).toBe(true)
  // Second attempt on the now-'filed' finding is refused.
  const res = await G.fileFindingById(proj, f.id, { filer })
  expect(res.ok).toBe(false)
})

// ── dismiss hardening (Priority 3) ────────────────────────────────────────────────
test("dismissFinding only acts on an existing, in-project, queued finding", async () => {
  const proj = "proj_dismiss_guard"
  const walk = await T.startWalk(proj, "trl_dg")
  const f = await T.recordFinding(proj, { runId: walk, trailId: "trl_dg", kind: "amber_heal", title: "x", confidence: 0.7, dedupKey: "dg1" })

  // Non-existent id → no-op false.
  expect(await G.dismissFinding(proj, "find_does_not_exist")).toBe(false)
  // Foreign project id → no-op false, original untouched.
  expect(await G.dismissFinding("proj_other", f.id)).toBe(false)
  expect((await T.listFindings(proj)).find((x) => x.id === f.id)?.status).toBe("queued")
  // The real, queued finding → true.
  expect(await G.dismissFinding(proj, f.id)).toBe(true)
  expect((await T.listFindings(proj)).find((x) => x.id === f.id)?.status).toBe("dismissed")
  // Already-dismissed → no-op false (not currently queued).
  expect(await G.dismissFinding(proj, f.id)).toBe(false)
})

// ── Task 3: real connector filer (pure ticket build + no-connector null) ─────────

test("buildTicketFromFinding embeds grounded evidence + heal diff", () => {
  const t = G.buildTicketFromFinding({
    id: "find_1", projectId: "proj_z", runId: "walk_1", stepId: "tstep_1", trailId: "trl_1",
    kind: "regression", title: "Checkout button gone", evidence: { fromSelector: "#checkout", toSelector: null, rationale: "no checkout affordance" },
    groundQuote: "no checkout affordance", confidence: 0.95, dedupKey: "k", recurrence: 1, status: "queued", connectorRef: null, connectorError: null, createdAt: 1, updatedAt: 1,
  } as any, "https://klavity.in")
  expect(t.title).toContain("Checkout button gone")
  expect(t.body).toContain("no checkout affordance")
  expect(t.body).toContain("#checkout")
  expect(t.priority).toBe("high")
  expect(t.klavityUrl).toContain("/trails?project=proj_z")
})

// ── KLA-231 (JTBD 1.14): evidence-rich auto-file — selector + reproduction + replay receipts ──
test("findingSelector picks the selector from whichever evidence key a finding class populated", () => {
  // ambiguous-selector finding → `selector`
  expect(G.findingSelector({ evidence: { selector: "button.buy" } } as any)).toBe("button.buy")
  // element-gone finding → fingerprint.domPath (no explicit selector)
  expect(G.findingSelector({ evidence: { fingerprint: { domPath: "main > form input" } } } as any)).toBe("main > form input")
  // heal finding → toSelector
  expect(G.findingSelector({ evidence: { toSelector: "#new-cta" } } as any)).toBe("#new-cta")
  // nothing locatable → null
  expect(G.findingSelector({ evidence: {} } as any)).toBeNull()
})

test("buildTicketFromFinding attaches selector + reproduction receipts; replay line only when a recording exists", () => {
  const finding = {
    id: "find_2", projectId: "proj_z", runId: "walk_9", stepId: "tstep_1", trailId: "trl_1",
    kind: "regression", title: "Add-to-cart selector ambiguous",
    evidence: { selector: "button.add", matchCount: 3 },
    groundQuote: null, confidence: 1, dedupKey: "k2", recurrence: 1, status: "queued",
    connectorRef: null, connectorError: null, createdAt: 1, updatedAt: 1,
  } as any
  // Without a replay: selector + reproduction link present, no replay line.
  const noReplay = G.buildTicketFromFinding(finding, "https://klavity.in")
  expect(noReplay.body).toContain("Selector: button.add")
  expect(noReplay.body).toContain("/api/trails/walks/walk_9/report.pdf")
  expect(noReplay.body).not.toContain("Session replay")
  // With a replay: the session-replay link is emitted too.
  const withReplay = G.buildTicketFromFinding(finding, "https://klavity.in", { hasReplay: true })
  expect(withReplay.body).toContain("Session replay: https://klavity.in/api/trails/walks/walk_9/replay")
})

test("realFiler returns null when the project has no auto-copy connector", async () => {
  const r = await G.realFiler("proj_no_connector", { id: "find_x" } as any)
  expect(r).toBeNull()
})

// ── KLAVITYKLA-248: guard-caught regressions auto-file by default; flag gates only subjective findings ──

const DB = await import("./db")

// (a) A confidence-1 regression finding auto-files even when trailsAutofileEnabled is FALSE.
test("maybeAutoFileWalkFindings: flag OFF — guard-caught (high-confidence) regression auto-files anyway", async () => {
  const proj = "proj_autofile_off"
  // Project row created implicitly by startWalk (trailsAutofileEnabled defaults to 0 for any row
  // that does exist — guard-caught regressions must bypass this gate).
  const walk = await T.startWalk(proj, "trl_af_off")
  const f = await T.recordFinding(proj, {
    runId: walk, trailId: "trl_af_off",
    kind: "regression", title: "button gone", confidence: 0.95, dedupKey: "af_off_1",
  })
  let filerCalls = 0
  const filer = async () => { filerCalls++; return { connectorRef: "plane:PROJ-9" } }
  const res = await G.maybeAutoFileWalkFindings(proj, walk, filer)
  // Guard-caught regression → auto-files regardless of the flag.
  expect(res.autoFiled).toContain(f.id)
  expect(filerCalls).toBe(1)
  const after = (await T.listFindings(proj)).find((x) => x.id === f.id)
  expect(after?.status).toBe("auto_filed")
  expect(after?.connectorRef).toBe("plane:PROJ-9")
})

// (b) A subjective/low-confidence finding does NOT auto-file when the flag is false,
//     but DOES when the flag is true (flag gates only the subjective class).
test("maybeAutoFileWalkFindings: flag OFF — subjective (low-confidence) finding stays queued", async () => {
  const proj = "proj_subjective_off"
  await db.execute({ sql: "INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, observability_mode, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", args: [proj, "acct_sub", "subjective-test", "active", "auto", "named", Date.now(), Date.now()] })
  // Ensure flag is OFF (default).
  await DB.setProjectTrailsAutofile(proj, false)

  const walk = await T.startWalk(proj, "trl_sub_off")
  const subjective = await T.recordFinding(proj, {
    runId: walk, trailId: "trl_sub_off",
    kind: "amber_heal", title: "layout shifted", confidence: 0.7, dedupKey: "sub_off_1",
  })
  let filerCalls = 0
  const filer = async () => { filerCalls++; return { connectorRef: "plane:PROJ-SUB" } }
  const res = await G.maybeAutoFileWalkFindings(proj, walk, filer)
  // No guard-caught regressions in this walk → fast-path, filer not called.
  expect(res.autoFiled).toHaveLength(0)
  expect(filerCalls).toBe(0)
  const after = (await T.listFindings(proj)).find((x) => x.id === subjective.id)
  expect(after?.status).toBe("queued")
})

test("maybeAutoFileWalkFindings: flag ON — subjective finding also eligible for auto-file via processWalkFindings", async () => {
  // When the flag is ON, all findings go through processWalkFindings (gate applies the same
  // decideFindingAction threshold). This test ensures the full pipeline runs; a high-confidence
  // regression is auto-filed, a subjective finding stays queued per decideFindingAction.
  const proj = "proj_subjective_on"
  await db.execute({ sql: "INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, observability_mode, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", args: [proj, "acct_sub2", "subjective-on-test", "active", "auto", "named", Date.now(), Date.now()] })
  await DB.setProjectTrailsAutofile(proj, true)

  const walk = await T.startWalk(proj, "trl_sub_on")
  const reg = await T.recordFinding(proj, {
    runId: walk, trailId: "trl_sub_on",
    kind: "regression", title: "checkout gone", confidence: 0.95, dedupKey: "sub_on_reg",
  })
  const sub = await T.recordFinding(proj, {
    runId: walk, trailId: "trl_sub_on",
    kind: "amber_heal", title: "layout shifted", confidence: 0.7, dedupKey: "sub_on_sub",
  })
  const filer = async () => ({ connectorRef: "plane:PROJ-ON" })
  const res = await G.maybeAutoFileWalkFindings(proj, walk, filer)
  expect(res.autoFiled).toContain(reg.id)
  expect(res.queued).toContain(sub.id)
  const afterReg = (await T.listFindings(proj)).find((x) => x.id === reg.id)
  const afterSub = (await T.listFindings(proj)).find((x) => x.id === sub.id)
  expect(afterReg?.status).toBe("auto_filed")
  expect(afterSub?.status).toBe("queued")
})

// (c) The existing confidence threshold still holds — a below-threshold regression does NOT auto-file.
test("maybeAutoFileWalkFindings: below-threshold regression stays queued even when flag is ON", async () => {
  const proj = "proj_autofile_threshold"
  await db.execute({ sql: "INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, observability_mode, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", args: [proj, "acct_thr", "threshold-test", "active", "auto", "named", Date.now(), Date.now()] })
  await DB.setProjectTrailsAutofile(proj, true)

  const walk = await T.startWalk(proj, "trl_thr")
  const low = await T.recordFinding(proj, {
    runId: walk, trailId: "trl_thr",
    kind: "regression", title: "low conf", confidence: 0.5, dedupKey: "thr_low_1",
  })
  const filer = async () => ({ connectorRef: "plane:PROJ-THR" })
  const res = await G.maybeAutoFileWalkFindings(proj, walk, filer)
  expect(res.autoFiled).toHaveLength(0)
  expect(res.queued).toContain(low.id)
  const after = (await T.listFindings(proj)).find((x) => x.id === low.id)
  expect(after?.status).toBe("queued")
})

// Legacy test kept for back-compat: flag ON auto-files high-confidence regression, leaves low queued.
test("maybeAutoFileWalkFindings: flag ON auto-files high-confidence regression, leaves low-confidence queued", async () => {
  const proj = "proj_autofile_on"
  // Enable the flag for this project by inserting and then enabling.
  await db.execute({ sql: "INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, observability_mode, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", args: [proj, "acct_af", "autofile-test", "active", "auto", "named", Date.now(), Date.now()] })
  await DB.setProjectTrailsAutofile(proj, true)

  const walk = await T.startWalk(proj, "trl_af_on")
  const high = await T.recordFinding(proj, {
    runId: walk, trailId: "trl_af_on",
    kind: "regression", title: "button gone", confidence: 0.95, dedupKey: "af_on_high",
  })
  const low = await T.recordFinding(proj, {
    runId: walk, trailId: "trl_af_on",
    kind: "regression", title: "low conf", confidence: 0.5, dedupKey: "af_on_low",
  })

  const filer = async () => ({ connectorRef: "plane:PROJ-11" })
  const res = await G.maybeAutoFileWalkFindings(proj, walk, filer)

  expect(res.autoFiled).toContain(high.id)
  expect(res.queued).toContain(low.id)

  const afterHigh = (await T.listFindings(proj)).find((x) => x.id === high.id)
  const afterLow = (await T.listFindings(proj)).find((x) => x.id === low.id)
  expect(afterHigh?.status).toBe("auto_filed")
  expect(afterHigh?.connectorRef).toBe("plane:PROJ-11")
  expect(afterLow?.status).toBe("queued")
})
