import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-trails-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")

let db: any
beforeAll(async () => {
  db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

test("applySchema creates all six Trail tables", async () => {
  const names = ["trails", "trail_steps", "locator_cache", "trail_runs", "run_steps", "findings"]
  for (const n of names) {
    const r = await db.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      args: [n],
    })
    expect(r.rows.length, `table ${n} should exist`).toBe(1)
  }
})

test("locator_cache enforces a UNIQUE (project_id, step_id) — per-step identity, not cache_key", async () => {
  const idx = await db.execute({
    sql: "SELECT sql FROM sqlite_master WHERE type='index' AND name='lc_key_uq'",
    args: [],
  })
  expect(idx.rows.length).toBe(1)
  const sql = String((idx.rows[0] as any).sql)
  expect(sql).toContain("project_id")
  expect(sql).toContain("step_id")
  // cache_key is no longer the uniqueness key (Layer B's salt hack is gone)
  expect(sql).not.toContain("(cache_key)")
})

const T = await import("./trails")

test("createTrail + getTrail round-trip, scoped by project", async () => {
  const id = await T.createTrail("proj_A", { name: "Checkout", intent: "buy the $20 plan", baseUrl: "https://app.test/" })
  expect(id).toMatch(/^trl_/)
  const got = await T.getTrail("proj_A", id)
  expect(got?.name).toBe("Checkout")
  expect(got?.intent).toBe("buy the $20 plan")
  expect(got?.status).toBe("draft")
  expect(got?.viewport).toBeNull()
  expect(await T.getTrail("proj_B", id)).toBeNull() // cross-project isolation
})

test("Trail viewport presets and custom dimensions persist and can be cleared", async () => {
  const id = await T.createTrail("proj_A", { name: "Mobile", baseUrl: "https://app.test/", viewport: "mobile" })
  const mobile = await T.getTrail("proj_A", id)
  expect(mobile?.viewport).toMatchObject({ preset: "mobile", width: 390, height: 844, isMobile: true })

  await T.updateTrail("proj_A", id, { viewport: { width: 1024, height: 768, deviceScaleFactor: 1 } })
  const custom = await T.getTrail("proj_A", id)
  expect(custom?.viewport).toEqual({ width: 1024, height: 768, isMobile: false, deviceScaleFactor: 1 })

  await T.updateTrail("proj_A", id, { viewport: null })
  expect((await T.getTrail("proj_A", id))?.viewport).toBeNull()
})

test("addTrailStep + listTrailSteps preserves order and round-trips target/checkpoint", async () => {
  const trail = await T.createTrail("proj_A", { name: "Login", baseUrl: "https://app.test/" })
  await T.addTrailStep("proj_A", trail, { idx: 1, action: "type", actionValue: "user@test.dev", target: { role: "textbox", accessibleName: "Email" } })
  await T.addTrailStep("proj_A", trail, { idx: 0, action: "navigate", actionValue: "https://app.test/login" })
  await T.addTrailStep("proj_A", trail, { idx: 2, action: "assert", checkpoint: { description: "dashboard visible" } })
  const steps = await T.listTrailSteps("proj_A", trail)
  expect(steps.map((s) => s.idx)).toEqual([0, 1, 2])
  expect(steps[1].target?.accessibleName).toBe("Email")
  expect(steps[2].checkpoint?.description).toBe("dashboard visible")
})

test("setTrailStatus updates status", async () => {
  const id = await T.createTrail("proj_A", { name: "S", baseUrl: "https://app.test/" })
  await T.setTrailStatus("proj_A", id, "active")
  expect((await T.getTrail("proj_A", id))?.status).toBe("active")
})

test("updateTrail renames a trail", async () => {
  const id = await T.createTrail("proj_A", { name: "Old Name", baseUrl: "https://app.test/" })
  const ok = await T.updateTrail("proj_A", id, { name: "New Name" })
  expect(ok).toBe(true)
  expect((await T.getTrail("proj_A", id))?.name).toBe("New Name")
})

test("updateTrail pauses and resumes a trail", async () => {
  const id = await T.createTrail("proj_A", { name: "Pauseable", baseUrl: "https://app.test/" })
  await T.setTrailStatus("proj_A", id, "active")
  await T.updateTrail("proj_A", id, { status: "paused" })
  expect((await T.getTrail("proj_A", id))?.status).toBe("paused")
  await T.updateTrail("proj_A", id, { status: "active" })
  expect((await T.getTrail("proj_A", id))?.status).toBe("active")
})

test("updateTrail returns false for unknown trail id", async () => {
  const ok = await T.updateTrail("proj_A", "trl_nope", { name: "X" })
  expect(ok).toBe(false)
})

test("upsertLocatorCache inserts then updates on (project_id, step_id) conflict (heal overwrites in place)", async () => {
  const trail = await T.createTrail("proj_A", { name: "C", baseUrl: "https://app.test/" })
  const step = await T.addTrailStep("proj_A", trail, { idx: 0, action: "click" })
  const key = "deadbeef".repeat(8) // 64 hex chars

  await T.upsertLocatorCache("proj_A", { trailId: trail, stepId: step, cacheKey: key, resolvedSelector: "#pay", confidence: 1, source: "crystallize" })
  let row = await T.getCacheForStep("proj_A", step)
  expect(row?.resolvedSelector).toBe("#pay")
  expect(row?.source).toBe("crystallize")

  // a heal with a DIFFERENT cache_key (page-state fingerprint changed) still updates the SAME step row.
  const healKey = "feedface".repeat(8)
  await T.upsertLocatorCache("proj_A", { trailId: trail, stepId: step, cacheKey: healKey, resolvedSelector: "[data-testid=pay]", confidence: 0.93, source: "heal" })
  row = await T.getCacheForStep("proj_A", step)
  expect(row?.resolvedSelector).toBe("[data-testid=pay]") // overwritten, not duplicated
  expect(row?.source).toBe("heal")
  expect(row?.confidence).toBeCloseTo(0.93)
  expect(row?.cacheKey).toBe(healKey) // cache_key still stored as the page-state fingerprint

  const both = await db.execute({ sql: "SELECT COUNT(*) c FROM locator_cache WHERE project_id=? AND step_id=?", args: ["proj_A", step] })
  expect(Number(both.rows[0].c)).toBe(1) // one row per step
})

test("getCacheForStep + cross-project isolation", async () => {
  const trail = await T.createTrail("proj_A", { name: "C2", baseUrl: "https://app.test/" })
  const step = await T.addTrailStep("proj_A", trail, { idx: 0, action: "click" })
  await T.upsertLocatorCache("proj_A", { trailId: trail, stepId: step, cacheKey: "a".repeat(64), resolvedSelector: "#x" })
  expect((await T.getCacheForStep("proj_A", step))?.resolvedSelector).toBe("#x")
  expect(await T.getCacheForStep("proj_B", step)).toBeNull()
})

test("walk lifecycle: start → addRunStep → finish, with reads", async () => {
  const trail = await T.createTrail("proj_A", { name: "W", baseUrl: "https://app.test/" })
  const step = await T.addTrailStep("proj_A", trail, { idx: 0, action: "click" })
  const walk = await T.startWalk("proj_A", trail)
  expect(walk).toMatch(/^walk_/)
  expect((await T.getWalk("proj_A", walk))?.status).toBe("running")

  await T.addRunStep("proj_A", { runId: walk, trailId: trail, stepId: step, idx: 0, tier: "cache", verdict: "green", confidence: 1 })
  await T.addRunStep("proj_A", { runId: walk, trailId: trail, stepId: step, idx: 1, tier: "vision", verdict: "amber", confidence: 0.7, diagnosis: "locator_drift", healed: true, evidence: { note: "re-resolved" } })

  await T.finishWalk("proj_A", walk, { status: "amber", llmCalls: 1, summary: { healed: 1 } })
  const w = await T.getWalk("proj_A", walk)
  expect(w?.status).toBe("amber")
  expect(w?.llmCalls).toBe(1)
  expect(w?.finishedAt).toBeGreaterThan(0)

  const rs = await T.listRunSteps("proj_A", walk)
  expect(rs.map((s) => s.verdict)).toEqual(["green", "amber"])
  expect(rs[1].healed).toBe(true)
  expect(rs[1].diagnosis).toBe("locator_drift")
  expect(rs[1].evidence?.note).toBe("re-resolved")

  expect((await T.listWalks("proj_A", trail))[0].id).toBe(walk)
})

test("recordFinding dedups by dedup_key and bumps recurrence instead of duplicating", async () => {
  const trail = await T.createTrail("proj_A", { name: "F", baseUrl: "https://app.test/" })
  const walk = await T.startWalk("proj_A", trail)
  const a = await T.recordFinding("proj_A", { runId: walk, trailId: trail, kind: "regression", title: "Checkout button gone", confidence: 0.95, dedupKey: "checkout-gone" })
  expect(a.deduped).toBe(false)
  expect(a.recurrence).toBe(1)

  const b = await T.recordFinding("proj_A", { runId: walk, trailId: trail, kind: "regression", title: "Checkout button gone (again)", confidence: 0.96, dedupKey: "checkout-gone" })
  expect(b.deduped).toBe(true)
  expect(b.recurrence).toBe(2)

  const all = await T.listFindings("proj_A")
  expect(all.filter((f) => f.dedupKey === "checkout-gone").length).toBe(1) // collapsed, not duplicated
  expect(all[0].recurrence).toBe(2)
})

test("recordFinding dedup is atomic under concurrent calls — no duplicate rows", async () => {
  const trail = await T.createTrail("proj_A", { name: "Concurrent", baseUrl: "https://app.test/" })
  const walk = await T.startWalk("proj_A", trail)
  const [a, b] = await Promise.all([
    T.recordFinding("proj_A", { runId: walk, trailId: trail, kind: "regression", title: "Race A", confidence: 0.9, dedupKey: "concurrent-race-key" }),
    T.recordFinding("proj_A", { runId: walk, trailId: trail, kind: "regression", title: "Race B", confidence: 0.9, dedupKey: "concurrent-race-key" }),
  ])
  const all = await T.listFindings("proj_A")
  const matches = all.filter((f) => f.dedupKey === "concurrent-race-key")
  expect(matches.length).toBe(1) // exactly one row — no duplicate
  expect(matches[0].recurrence).toBe(2) // both calls recorded
  expect(a.id).toBe(b.id) // same underlying row
  expect(a.deduped !== b.deduped).toBe(true) // one was fresh, one was deduped
})

test("listFindings filters by status; setFindingStatus transitions and records connectorRef", async () => {
  const trail = await T.createTrail("proj_A", { name: "F2", baseUrl: "https://app.test/" })
  const walk = await T.startWalk("proj_A", trail)
  const f = await T.recordFinding("proj_A", { runId: walk, trailId: trail, kind: "visual", title: "Layout shift", confidence: 0.5, dedupKey: "layout-1", status: "queued" })
  expect((await T.listFindings("proj_A", { status: "queued" })).some((x) => x.id === f.id)).toBe(true)
  await T.setFindingStatus("proj_A", f.id, "filed", "plane:ISSUE-12")
  const filed = (await T.listFindings("proj_A", { status: "filed" })).find((x) => x.id === f.id)
  expect(filed?.connectorRef).toBe("plane:ISSUE-12")
  expect((await T.listFindings("proj_A", { status: "queued" })).some((x) => x.id === f.id)).toBe(false)
})

// ── KLA-92: Trail step versioning ──

test("Trail.stepVersion starts at 1 and increments on addTrailStep", async () => {
  const id = await T.createTrail("proj_V", { name: "Ver", baseUrl: "https://v.test/" })
  const t0 = await T.getTrail("proj_V", id)
  expect(t0?.stepVersion).toBe(1)

  await T.addTrailStep("proj_V", id, { idx: 0, action: "navigate", actionValue: "https://v.test/" })
  const t1 = await T.getTrail("proj_V", id)
  expect(t1?.stepVersion).toBe(2)

  await T.addTrailStep("proj_V", id, { idx: 1, action: "click" })
  const t2 = await T.getTrail("proj_V", id)
  expect(t2?.stepVersion).toBe(3)
})

test("Trail.stepVersion increments on updateTrailStep", async () => {
  const id = await T.createTrail("proj_V", { name: "VerUp", baseUrl: "https://v.test/" })
  const step = await T.addTrailStep("proj_V", id, { idx: 0, action: "type", actionValue: "old" })
  const before = (await T.getTrail("proj_V", id))!.stepVersion
  await T.updateTrailStep("proj_V", step, { actionValue: "new" })
  const after = (await T.getTrail("proj_V", id))!.stepVersion
  expect(after).toBe(before + 1)
})

test("Trail.stepVersion increments on deleteTrailStep", async () => {
  const id = await T.createTrail("proj_V", { name: "VerDel", baseUrl: "https://v.test/" })
  const step = await T.addTrailStep("proj_V", id, { idx: 0, action: "click" })
  const before = (await T.getTrail("proj_V", id))!.stepVersion
  await T.deleteTrailStep("proj_V", step)
  const after = (await T.getTrail("proj_V", id))!.stepVersion
  expect(after).toBe(before + 1)
})

// ── KLAVITYKLA-275: reorder draft steps ──────────────────────────────────────
test("reorderTrailSteps reassigns idx to the given order and bumps stepVersion", async () => {
  const id = await T.createTrail("proj_R", { name: "Reorder", baseUrl: "https://r.test/" })
  const a = await T.addTrailStep("proj_R", id, { idx: 0, action: "navigate", actionValue: "https://r.test/" })
  const b = await T.addTrailStep("proj_R", id, { idx: 1, action: "click", target: { role: "button", accessibleName: "Buy" } })
  const c = await T.addTrailStep("proj_R", id, { idx: 2, action: "assert", checkpoint: { description: "done" } })
  const before = (await T.getTrail("proj_R", id))!.stepVersion

  // Move the click (b) to the front: [b, a, c]
  const ok = await T.reorderTrailSteps("proj_R", id, [b, a, c])
  expect(ok).toBe(true)

  const steps = await T.listTrailSteps("proj_R", id) // ORDER BY idx
  expect(steps.map((s) => s.id)).toEqual([b, a, c])
  expect(steps.map((s) => s.idx)).toEqual([0, 1, 2])
  // the reordered click step kept its target (only idx changed)
  expect(steps[0].action).toBe("click")
  expect(steps[0].target?.accessibleName).toBe("Buy")

  const after = (await T.getTrail("proj_R", id))!.stepVersion
  expect(after).toBe(before + 1)
})

test("reorderTrailSteps rejects a mismatched id set and writes nothing", async () => {
  const id = await T.createTrail("proj_R", { name: "ReorderBad", baseUrl: "https://r.test/" })
  const a = await T.addTrailStep("proj_R", id, { idx: 0, action: "navigate", actionValue: "https://r.test/" })
  const b = await T.addTrailStep("proj_R", id, { idx: 1, action: "click" })
  const before = (await T.getTrail("proj_R", id))!.stepVersion

  expect(await T.reorderTrailSteps("proj_R", id, [a])).toBe(false)            // wrong length
  expect(await T.reorderTrailSteps("proj_R", id, [a, a])).toBe(false)         // duplicate id
  expect(await T.reorderTrailSteps("proj_R", id, [a, "tstep_nope"])).toBe(false) // unknown id
  expect(await T.reorderTrailSteps("proj_R", id, [])).toBe(false)             // empty

  // order and version untouched by any of the rejected calls
  const steps = await T.listTrailSteps("proj_R", id)
  expect(steps.map((s) => s.id)).toEqual([a, b])
  expect((await T.getTrail("proj_R", id))!.stepVersion).toBe(before)
})

// KLAVITYKLA-275 fix: the docblock promised all-or-nothing, but only the VALIDATION was atomic —
// the N idx UPDATEs plus the step_version bump were separate awaited statements, so a failure or a
// concurrently-starting walk could observe a half-reordered trail. They now go out as one batch.
test("reorderTrailSteps writes the idx updates and the version bump in a single transaction", async () => {
  const src = await Bun.file(new URL("./trails.ts", import.meta.url)).text()
  const start = src.indexOf("export async function reorderTrailSteps")
  expect(start).toBeGreaterThan(-1)
  const body = src.slice(start, src.indexOf("\nexport ", start + 10))
  // one batched write, not a loop of awaited executes
  expect(body).toContain('db!.batch(')
  expect(body).toContain('"write"')
  expect(body).not.toMatch(/for \([^)]*\) \{\s*await db!\.execute/)
  // the version bump rides in the SAME batch (it must not be a separate statement after it)
  expect(body).toContain("step_version = step_version + 1")
  expect(body).not.toContain("await bumpStepVersion")
})

test("reorderTrailSteps leaves a large reorder fully consistent (no partial idx assignment)", async () => {
  const id = await T.createTrail("proj_RA", { name: "ReorderAtomic", baseUrl: "https://ra.test/" })
  const ids: string[] = []
  for (let i = 0; i < 8; i++) {
    ids.push(await T.addTrailStep("proj_RA", id, { idx: i, action: "click", actionValue: "s" + i }))
  }
  const before = (await T.getTrail("proj_RA", id))!.stepVersion

  const reversed = [...ids].reverse()
  expect(await T.reorderTrailSteps("proj_RA", id, reversed)).toBe(true)

  const steps = await T.listTrailSteps("proj_RA", id)
  expect(steps.map((s) => s.id)).toEqual(reversed)
  // every idx is distinct and densely 0..n-1 — a partial write would leave duplicates/holes
  expect(steps.map((s) => s.idx)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  expect(new Set(steps.map((s) => s.idx)).size).toBe(8)
  // exactly one version bump for the whole reorder
  expect((await T.getTrail("proj_RA", id))!.stepVersion).toBe(before + 1)
})

test("Walk.trailVersion is pinned to Trail.stepVersion at walk start and does not change when steps are later edited", async () => {
  const id = await T.createTrail("proj_V", { name: "VerWalk", baseUrl: "https://v.test/" })
  await T.addTrailStep("proj_V", id, { idx: 0, action: "navigate", actionValue: "https://v.test/" })
  await T.addTrailStep("proj_V", id, { idx: 1, action: "click" })
  const vAtStart = (await T.getTrail("proj_V", id))!.stepVersion
  expect(vAtStart).toBeGreaterThan(1) // sanity: steps were added

  const walkId = await T.startWalk("proj_V", id)
  const walk = await T.getWalk("proj_V", walkId)
  expect(walk?.trailVersion).toBe(vAtStart)

  // Modify the trail AFTER the walk started
  const steps = await T.listTrailSteps("proj_V", id)
  await T.updateTrailStep("proj_V", steps[0].id, { actionValue: "https://v.test/changed" })
  const vAfter = (await T.getTrail("proj_V", id))!.stepVersion
  expect(vAfter).toBe(vAtStart + 1)

  // Walk still shows the version it was pinned to
  const walkAfter = await T.getWalk("proj_V", walkId)
  expect(walkAfter?.trailVersion).toBe(vAtStart)
})

test("Walk.trailVersion and Trail.stepVersion are present in JSON (API shape)", async () => {
  const id = await T.createTrail("proj_V", { name: "VerJson", baseUrl: "https://v.test/" })
  const t = await T.getTrail("proj_V", id)
  expect(typeof t?.stepVersion).toBe("number")
  const walkId = await T.startWalk("proj_V", id)
  const w = await T.getWalk("proj_V", walkId)
  expect(typeof w?.trailVersion).toBe("number")
})

// ── KLA-244: all 5 checkpoint kinds persist (write → read round-trip) ──
// The guards spine has 5 checkpoint kinds; previously only "visible" survived insertAssertStep
// (which flattened every graduated expectation to kind:"visible", dropping value/regex/count).

test("KLA-244: all 5 checkpoint kinds round-trip through addTrailStep → listTrailSteps", async () => {
  const trail = await T.createTrail("proj_CP", { name: "Checkpoints", baseUrl: "https://cp.test/" })
  const kinds = [
    { idx: 0, checkpoint: { kind: "visible" as const, description: "banner visible" } },
    { idx: 1, checkpoint: { kind: "textEquals" as const, description: "price exact", value: "$49.00" } },
    { idx: 2, checkpoint: { kind: "textContains" as const, description: "success msg", value: "successfully" } },
    { idx: 3, checkpoint: { kind: "urlMatches" as const, description: "on dashboard", regex: "^https://cp\\.test/dashboard" } },
    { idx: 4, checkpoint: { kind: "elementCount" as const, description: "3 cart items", count: 3 } },
  ]
  for (const k of kinds) await T.addTrailStep("proj_CP", trail, { idx: k.idx, action: "assert", target: { selector: "#x" }, checkpoint: k.checkpoint })
  const steps = await T.listTrailSteps("proj_CP", trail)
  expect(steps.map((s) => s.checkpoint?.kind)).toEqual(["visible", "textEquals", "textContains", "urlMatches", "elementCount"])
  expect(steps[1].checkpoint?.value).toBe("$49.00")
  expect(steps[2].checkpoint?.value).toBe("successfully")
  expect(steps[3].checkpoint?.regex).toBe("^https://cp\\.test/dashboard")
  expect(steps[4].checkpoint?.count).toBe(3)
  expect(steps.map((s) => s.checkpoint?.description)).toEqual([
    "banner visible", "price exact", "success msg", "on dashboard", "3 cart items",
  ])
})

test("KLA-244: insertAssertStep persists a full checkpoint of every kind (not just visible)", async () => {
  const trail = await T.createTrail("proj_CP", { name: "Graduated", baseUrl: "https://cp.test/" })
  await T.addTrailStep("proj_CP", trail, { idx: 0, action: "navigate", actionValue: "https://cp.test/" })

  // Graduate one expectation of each non-visible kind, in place after step 0.
  await T.insertAssertStep("proj_CP", trail, 0, { selector: "#count" }, { kind: "elementCount", description: "5 rows", count: 5 })
  await T.insertAssertStep("proj_CP", trail, 0, { selector: "#url" }, { kind: "urlMatches", description: "landed", regex: "/done$" })
  await T.insertAssertStep("proj_CP", trail, 0, { selector: "#msg" }, { kind: "textContains", description: "toast", value: "saved" })
  await T.insertAssertStep("proj_CP", trail, 0, { selector: "#total" }, { kind: "textEquals", description: "total", value: "$7.00" })

  const steps = await T.listTrailSteps("proj_CP", trail)
  const asserts = steps.filter((s) => s.action === "assert")
  const byDesc = Object.fromEntries(asserts.map((s) => [s.checkpoint?.description, s.checkpoint]))
  expect(byDesc["5 rows"]).toMatchObject({ kind: "elementCount", count: 5 })
  expect(byDesc["landed"]).toMatchObject({ kind: "urlMatches", regex: "/done$" })
  expect(byDesc["toast"]).toMatchObject({ kind: "textContains", value: "saved" })
  expect(byDesc["total"]).toMatchObject({ kind: "textEquals", value: "$7.00" })
})

test("KLA-244: insertAssertStep still accepts a bare description (backward compat → visible)", async () => {
  const trail = await T.createTrail("proj_CP", { name: "Legacy", baseUrl: "https://cp.test/" })
  await T.addTrailStep("proj_CP", trail, { idx: 0, action: "navigate", actionValue: "https://cp.test/" })
  await T.insertAssertStep("proj_CP", trail, 0, { selector: "#ok" }, "dashboard visible")
  const step = (await T.listTrailSteps("proj_CP", trail)).find((s) => s.action === "assert")
  expect(step?.checkpoint?.kind).toBe("visible")
  expect(step?.checkpoint?.description).toBe("dashboard visible")
})

test("KLA-244: updateTrailStep can change a checkpoint's kind + payload (round-trips)", async () => {
  const trail = await T.createTrail("proj_CP", { name: "Edit", baseUrl: "https://cp.test/" })
  const step = await T.addTrailStep("proj_CP", trail, { idx: 0, action: "assert", target: { selector: "#x" }, checkpoint: { kind: "visible", description: "shown" } })
  await T.updateTrailStep("proj_CP", step, { checkpoint: { kind: "elementCount", description: "exactly two", count: 2 } })
  const got = (await T.listTrailSteps("proj_CP", trail))[0]
  expect(got.checkpoint).toMatchObject({ kind: "elementCount", description: "exactly two", count: 2 })
})
