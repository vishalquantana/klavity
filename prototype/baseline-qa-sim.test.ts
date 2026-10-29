// Baseline QA Sim — a system-provided, general-purpose QA persona every project gets automatically.
//
// Covers: automatic provisioning on workspace creation, idempotency, customer Sims untouched, quota exclusion, safe failure,
// explicit backfill, the standard persona definition, findings classification, "only the page actually reviewed", and the UI marker.
// Hermetic: file-backed libsql DB, no network, no production data.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { readFileSync, unlinkSync } from "node:fs"

const DB_FILE = join(tmpdir(), `klav-baseline-qa-${Date.now()}-${randomUUID()}.db`)
for (const sfx of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + sfx) } catch { } }
process.env.TURSO_DATABASE_URL = "file:" + DB_FILE
delete process.env.TURSO_AUTH_TOKEN

const dbMod = await import("./lib/db")
const bq = await import("./lib/baseline-qa")
const { runSimReviews } = await import("./lib/sim-review")
const { classifySimObservation } = await import("./lib/sim-bug-classify")
const client = dbMod.reconnectDb("file:" + DB_FILE)

beforeAll(async () => {
  await dbMod.applySchema(client)
  await dbMod.migrateV2(client)
})

const countBaseline = async (projectId: string) =>
  Number(((await client.execute({ sql: "SELECT COUNT(*) AS c FROM personas WHERE project_id=? AND sim_source='baseline'", args: [projectId] })).rows[0] as any).c)

// ── 1. A new workspace receives the Baseline QA Sim automatically ────────────────────────────────────────────────────
test("new workspace: its Default Project gets exactly one Baseline QA Sim, no manual step", async () => {
  const ms = await dbMod.ensureAccount("owner1@baseline.test")
  const projectId = ms[0].projectId ?? ("proj_" + ms[0].workspaceId)
  const sims = await dbMod.listPersonas(projectId)
  expect(sims).toHaveLength(1)
  expect(sims[0].id).toBe(bq.baselineQaId(projectId))
  expect(sims[0].simSource).toBe("baseline")
  expect(sims[0].name).toBe("Baseline QA")
})

// ── 2. Repeated provisioning never duplicates ─────────────────────────────────────────────────────────────────────────
test("retried workspace creation / repeated provisioning does not create duplicates", async () => {
  const ms = await dbMod.ensureAccount("owner2@baseline.test")
  const projectId = "proj_" + ms[0].workspaceId
  await dbMod.ensureAccount("owner2@baseline.test") // retry: returns the existing account early
  expect(await dbMod.ensureBaselineQaSim(projectId)).toBe(false) // already there → nothing created
  expect(await dbMod.ensureBaselineQaSim(projectId)).toBe(false)
  expect(await countBaseline(projectId)).toBe(1)
})

test("concurrent provisioning for one project still yields a single row", async () => {
  const projectId = "proj_conc_" + randomUUID()
  const results = await Promise.all([1, 2, 3, 4, 5].map(() => dbMod.ensureBaselineQaSim(projectId)))
  expect(results.filter(Boolean)).toHaveLength(1)
  expect(await countBaseline(projectId)).toBe(1)
})

// ── 3. Customer-specific Sims are never touched / overwritten ───────────────────────────────────────────────────────────
test("existing customer Sims stay unchanged, and an edited Baseline QA row is never overwritten by a re-run", async () => {
  const ms = await dbMod.ensureAccount("owner3@baseline.test")
  const projectId = "proj_" + ms[0].workspaceId
  await dbMod.upsertPersona("sim_customer_1", projectId, {
    name: "Priya the buyer", role: "Procurement lead", type: "client", initials: "PB", accent: "#6366f1",
    summary: "A real customer persona.", insights: [], avatar: null, simClass: "client", side: "external", core: null, simSource: "describe",
  })
  const before = (await dbMod.listPersonas(projectId)).find((p) => p.id === "sim_customer_1")!
  await dbMod.ensureBaselineQaSim(projectId)
  const after = (await dbMod.listPersonas(projectId)).find((p) => p.id === "sim_customer_1")!
  expect(after).toEqual(before)
  expect(after.simSource).toBe("describe")

  // customer edits the Baseline QA row; a later provisioning run must not reset it
  const baselineId = bq.baselineQaId(projectId)
  await client.execute({ sql: "UPDATE personas SET summary=? WHERE id=?", args: ["edited by customer", baselineId] })
  await dbMod.ensureBaselineQaSim(projectId)
  expect((await dbMod.listPersonas(projectId)).find((p) => p.id === baselineId)!.summary).toBe("edited by customer")
})

// ── 4. Existing project creation still works, and new projects get one too (project-level scope) ───────────────────────
test("createProject still works and the new project gets its own Baseline QA Sim", async () => {
  const ms = await dbMod.ensureAccount("owner4@baseline.test")
  const p = await dbMod.createProject(ms[0].workspaceId, "Second Project", "https://example.test")
  expect(p.name).toBe("Second Project")
  expect(p.siteUrl).toBe("https://example.test")
  expect(await countBaseline(p.id)).toBe(1)
  // project-level: the default project and the new one each have their OWN row (distinct ids)
  expect(bq.baselineQaId(p.id)).not.toBe(bq.baselineQaId("proj_" + ms[0].workspaceId))
})

// ── 5. It never consumes the customer's plan quota ───────────────────────────────────────────────────────────────────────
test("Baseline QA is excluded from the per-account Sim quota count", async () => {
  const ms = await dbMod.ensureAccount("owner5@baseline.test")
  const accountId = ms[0].workspaceId
  expect(await dbMod.countPersonasForAccount(accountId)).toBe(0) // only the system Sim exists
  await dbMod.upsertPersona("sim_q_1", "proj_" + accountId, {
    name: "Real Sim", role: "User", type: "client", initials: "RS", accent: "#6366f1", summary: "", insights: [], avatar: null, simClass: null, side: null, core: null,
  })
  expect(await dbMod.countPersonasForAccount(accountId)).toBe(1)
})

// ── 6. Failure while provisioning leaves no inconsistent records and never blocks creation ─────────────────────────────
test("a provisioning error is swallowed: the project is still created and no partial Sim row is left", async () => {
  const ms = await dbMod.ensureAccount("owner6@baseline.test")
  const orig = (client as any).execute.bind(client)
  ;(client as any).execute = async (q: any) => {
    if (String(q?.sql ?? q).includes("INSERT OR IGNORE INTO personas")) throw new Error("boom")
    return orig(q)
  }
  let p: any
  try { p = await dbMod.createProject(ms[0].workspaceId, "Fails To Provision") }
  finally { (client as any).execute = orig }
  expect(p.name).toBe("Fails To Provision")             // creation preserved
  expect(await countBaseline(p.id)).toBe(0)             // nothing half-written
  expect(await dbMod.ensureBaselineQaSim(p.id)).toBe(true) // and it can be provisioned cleanly afterwards
})

// ── 7. Explicit backfill (never automatic): adds only what is missing, idempotent ────────────────────────────────────────
test("backfill adds Baseline QA to pre-existing projects only, is idempotent and leaves customer Sims alone", async () => {
  const accountId = "acc_legacy_" + randomUUID()
  const projectId = "proj_legacy_" + randomUUID()
  const now = Date.now()
  await client.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)", args: [accountId, "Legacy", "legacy@baseline.test", now] })
  await client.execute({
    sql: `INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [projectId, accountId, "Legacy Project", "active", "auto", 200, "named", now, now],
  })
  await dbMod.upsertPersona("sim_legacy_1", projectId, {
    name: "Old Sim", role: "User", type: "client", initials: "OS", accent: "#6366f1", summary: "pre-existing", insights: [], avatar: null, simClass: null, side: null, core: null,
  })
  expect(await countBaseline(projectId)).toBe(0) // nothing automatic touched it

  const first = await dbMod.backfillBaselineQaSims()
  expect(first.created).toBeGreaterThanOrEqual(1)
  expect(await countBaseline(projectId)).toBe(1)
  expect((await dbMod.listPersonas(projectId)).find((p) => p.id === "sim_legacy_1")!.summary).toBe("pre-existing")

  const second = await dbMod.backfillBaselineQaSims()
  expect(second.created).toBe(0)
  expect(await countBaseline(projectId)).toBe(1)
})

// ── 8. Standard persona definition ───────────────────────────────────────────────────────────────────────────────────────
test("persona definition: identity, user/internal class, core and all six QA categories are populated", async () => {
  const ms = await dbMod.ensureAccount("owner8@baseline.test")
  const s = (await dbMod.listPersonas("proj_" + ms[0].workspaceId))[0]
  expect(s.name).toBe("Baseline QA")
  expect(s.role).toBe("General-Purpose Quality Assurance Tester")
  expect(s.simClass).toBe("user")
  expect(s.side).toBe("internal")
  expect(s.core).not.toBeNull()
  expect(s.core!.goals.length).toBeGreaterThan(0)
  expect(s.core!.temperament).toMatch(/objective/i)
  expect(s.core!.voice.length).toBeGreaterThan(10)
  const watch = s.core!.watchFor.join(" ")
  for (const cat of ["Layout", "Spelling", "Responsiveness", "Broken", "accessibility", "Visible errors"]) expect(watch.toLowerCase()).toContain(cat.toLowerCase())
  expect(bq.BASELINE_QA_CATEGORIES).toHaveLength(6)
  expect(s.summary).toMatch(/not a customer/i)         // does not imply it represents a real customer
})

// ── 9. Honest scope: only the reviewed page; no claims about what was not tested ────────────────────────────────────────
test("persona never claims untested coverage; unsupported checks are listed as not covered", () => {
  const text = (bq.BASELINE_QA_SIM.summary + " " + bq.BASELINE_QA_SIM.core.watchFor.join(" ")).toLowerCase()
  expect(text).toContain("page that was actually visited")
  expect(text).toMatch(/does not claim to have tested other screen sizes/)
  expect(text).toMatch(/not a full accessibility \(wcag\) audit/)
  expect(text).toMatch(/if you cannot see it on the reviewed page, do not report it/)
  const not = bq.BASELINE_QA_COVERAGE.notCoveredYet.join(" ").toLowerCase()
  for (const k of ["responsiveness", "links", "keyboard"]) expect(not).toContain(k)
})

// ── 10. Findings: stored in the existing schema, tied to the page reviewed, classified "Baseline QA" ─────────────────────
test("a review reports only the page actually reviewed, and its finding is attributable to the Baseline QA Sim", async () => {
  const ms = await dbMod.ensureAccount("owner10@baseline.test")
  const projectId = "proj_" + ms[0].workspaceId
  const [baseline] = await dbMod.listPersonas(projectId)
  let sawCore = false
  const reviews = await runSimReviews({
    projectId, urlPath: "/pricing", urlHost: "example.test", pageUrl: "https://example.test/pricing",
    imageB64: "iVBORw0KGgo=", mediaType: "image/png", targetSims: [baseline as any], actorEmail: "owner10@baseline.test",
    screenshotId: "shot_bq_1", seenKeys: ["k1"],
    reactFn: async (sim: any) => {
      sawCore = !!(sim.core && sim.core.watchFor.length) && sim.simSource === "baseline"
      return { data: { reactions: [{ observation: "The hero image on this page is broken", sentiment: "frustrated", suggestedBug: { title: "Broken hero image", body: "Image does not render; expected the hero image", priority: "medium" } }] } }
    },
    resolveCitationsFn: async () => ({ citedTraitIds: [], sourceQuote: null, speaker: null, sourceTranscriptId: null, sourceDate: null, issueType: null, sourceQuoteVerified: null, recurrence: null }),
    db: dbMod.db,
  } as any)
  expect(sawCore).toBe(true)                               // the Sim is run with its QA core (existing pipeline, no new engine)
  expect(reviews).toHaveLength(1)
  const obs = reviews[0].observations[0] as any
  expect(obs.feedbackId).toBeTruthy()
  const fb = (await client.execute({ sql: "SELECT sim_id, url_path FROM feedback WHERE id=?", args: [obs.feedbackId] })).rows[0] as any
  expect(fb.url_path).toBe("/pricing")                     // only the page actually visited is reported
  expect(fb.sim_id).toBe(bq.baselineQaId(projectId))       // associated SIM identifier
  const sim = (await dbMod.listPersonas(projectId)).find((p) => p.id === fb.sim_id)!
  expect(bq.isBaselineQa(sim.simSource)).toBe(true)        // source classification: Baseline QA
})

// ── 10b. An "all clear" is not a finding (the classifier would read "no broken images…" as a hard failure) ───────────────
test("isAllClearObservation: matches all-clear phrasing, not real defects", () => {
  expect(bq.isAllClearObservation("No visible defects found: layout is clean, no broken images or visible errors")).toBe(true)
  expect(bq.isAllClearObservation("  Nothing to report on this page")).toBe(true)
  expect(bq.isAllClearObservation("The hero image is broken")).toBe(false)
  expect(bq.isAllClearObservation("No error message is shown when the form fails")).toBe(false) // a real defect, not an all-clear
  expect(bq.isAllClearObservation("The button says 'No issues' but is cut off")).toBe(false)
  expect(bq.isAllClearObservation(null)).toBe(false)
})

test("Baseline QA all-clear stays a plain observation; real defects are still flagged; customer Sims are unchanged", async () => {
  const ms = await dbMod.ensureAccount("owner11@baseline.test")
  const projectId = "proj_" + ms[0].workspaceId
  const [baseline] = await dbMod.listPersonas(projectId)
  await dbMod.upsertPersona("sim_cust_ac", projectId, {
    name: "Customer Sim", role: "User", type: "client", initials: "CS", accent: "#6366f1", summary: "", insights: [], avatar: null, simClass: null, side: null, core: null, simSource: "describe",
  })
  const customer = (await dbMod.listPersonas(projectId)).find((p) => p.id === "sim_cust_ac")!
  const noCite = async () => ({ citedTraitIds: [], sourceQuote: null, speaker: null, sourceTranscriptId: null, sourceDate: null, issueType: null, sourceQuoteVerified: null, recurrence: null })
  const run = (sim: any, urlPath: string, observation: string) => runSimReviews({
    projectId, urlPath, urlHost: "example.test", pageUrl: "https://example.test" + urlPath,
    imageB64: "iVBORw0KGgo=", mediaType: "image/png", targetSims: [sim], actorEmail: "owner11@baseline.test",
    screenshotId: "shot_" + urlPath, seenKeys: ["k"], adhoc: true,
    reactFn: async () => ({ data: { reactions: [{ observation, sentiment: "neutral" }] } }),
    resolveCitationsFn: noCite, db: dbMod.db,
  } as any)
  const stored = async (fid: string) => (await client.execute({ sql: "SELECT priority, status, suggested_bug_json FROM feedback WHERE id=?", args: [fid] })).rows[0] as any

  const ALL_CLEAR = "No visible defects found: layout is clean, no broken images or visible errors, spelling looks correct."
  // Baseline QA all-clear → plain observation: no priority, not auto-opened, no bug payload
  const ac = (await run(baseline, "/all-clear", ALL_CLEAR))[0].observations[0] as any
  const acRow = await stored(ac.feedbackId)
  expect(acRow.priority).toBeNull()
  expect(acRow.status).not.toBe("open")
  expect(ac.suggestedBug ?? null).toBeNull()

  // Baseline QA reporting a REAL defect is still flagged as before
  const real = (await run(baseline, "/real-defect", "The hero image is broken and the page shows a 500 error"))[0].observations[0] as any
  expect((await stored(real.feedbackId)).priority).toBe("high")

  // A customer-specific Sim keeps today's (classifier) behaviour — untouched, even for all-clear-sounding text that trips it
  const CUSTOMER_TEXT = "Everything on this page looks fine — nothing is broken and no errors appear anywhere."
  expect(classifySimObservation(CUSTOMER_TEXT, "neutral").flagged).toBe(true)
  const cust = (await run(customer, "/customer", CUSTOMER_TEXT))[0].observations[0] as any
  expect((await stored(cust.feedbackId)).priority).toBe("high")
})

// ── 10c. Baseline QA findings keep their own identity: distinct defects on one page stay separate ───────────────────────
test("distinct Baseline QA findings on the same page are separate reports (own Sim id); a repeat still dedups", async () => {
  const ms = await dbMod.ensureAccount("owner12@baseline.test")
  const projectId = "proj_" + ms[0].workspaceId
  const [baseline] = await dbMod.listPersonas(projectId)
  await dbMod.upsertPersona("sim_cust_dd", projectId, {
    name: "Customer Sim 2", role: "User", type: "client", initials: "C2", accent: "#6366f1", summary: "", insights: [], avatar: null, simClass: null, side: null, core: null, simSource: "describe",
  })
  const customer = (await dbMod.listPersonas(projectId)).find((p) => p.id === "sim_cust_dd")!
  const noCite = async () => ({ citedTraitIds: [], sourceQuote: null, speaker: null, sourceTranscriptId: null, sourceDate: null, issueType: null, sourceQuoteVerified: null, recurrence: null })
  const run = async (sim: any, observation: string, title: string) => ((await runSimReviews({
    projectId, urlPath: "/same-page", urlHost: "example.test", pageUrl: "https://example.test/same-page",
    imageB64: "iVBORw0KGgo=", mediaType: "image/png", targetSims: [sim], actorEmail: "owner12@baseline.test",
    screenshotId: "shot_dd", seenKeys: ["k"], adhoc: true,
    reactFn: async () => ({ data: { reactions: [{ observation, sentiment: "frustrated", suggestedBug: { title, body: observation, priority: "medium" } }] } }),
    resolveCitationsFn: noCite, db: dbMod.db,
  } as any))[0].observations[0] as any)
  const row = async (fid: string) => (await client.execute({ sql: "SELECT sim_id, recurrence_count FROM feedback WHERE id=?", args: [fid] })).rows[0] as any

  const cust = await run(customer, "The pricing table renders with overlapping columns on this page", "Overlapping pricing columns")
  const logo = await run(baseline, "The company logo text is visually clipped on the left edge", "Clipped logo")
  const contrast = await run(baseline, "The burger menu icon has very low contrast against the dark background", "Low contrast menu icon")
  expect(new Set([cust.feedbackId, logo.feedbackId, contrast.feedbackId]).size).toBe(3) // nothing collapsed into another report
  expect((await row(logo.feedbackId)).sim_id).toBe(bq.baselineQaId(projectId))            // each carries the Baseline QA Sim id
  expect((await row(contrast.feedbackId)).sim_id).toBe(bq.baselineQaId(projectId))
  expect((await row(cust.feedbackId)).sim_id).toBe("sim_cust_dd")                         // the customer Sim's report is untouched

  const again = await run(baseline, "The company logo text is visually clipped on the left edge", "Clipped logo")
  expect(again.feedbackId).toBe(logo.feedbackId)                                          // the same finding repeated still dedups
  expect(again.deduped).toBe(true)
})

// ── 11. UI + API wiring ────────────────────────────────────────────────────────────────────────────────────────────────────
const DASH = readFileSync(new URL("./public/dashboard.html", import.meta.url), "utf8")
const SERVER = readFileSync(new URL("./server.ts", import.meta.url), "utf8")

test("dashboard payloads carry simSource; both Sim lists show a System preset chip", () => {
  expect(SERVER).toContain("simSource: p.simSource ?? null,")                 // /api/dashboard sims
  expect(SERVER).toContain("simName: p?.name ?? null, simSource: p?.simSource ?? null") // tickets
  expect((DASH.match(/System preset/g) || []).length).toBeGreaterThanOrEqual(2)
  expect(DASH).toContain('s.simSource === "baseline"')
  expect(DASH).toContain('sim.simSource === "baseline"')
})

test("findings badge: Baseline QA vs plain Sim, via ticket simSource or the loaded Sim list", () => {
  const body = (src: string, start: string) => {
    const i = src.indexOf(start); let d = 0
    for (let k = src.indexOf("{", i); k < src.length; k++) { if (src[k] === "{") d++; else if (src[k] === "}" && --d === 0) return src.slice(i, k + 1) }
    throw new Error("unbalanced " + start)
  }
  const code = [body(DASH, "function tgSourceKind("), body(DASH, "function isBaselineQaFinding("), body(DASH, "function tgSourceBadgeHtml(")].join("\n")
  const make = (sims: any[]) => new Function("state", "kicon", code + "; return tgSourceBadgeHtml")({ sims }, () => "")
  const badge = make([{ id: "sim_b", simSource: "baseline" }, { id: "sim_c", simSource: "describe" }])
  expect(badge({ source: "sim", simId: "sim_b" })).toContain("Baseline QA")
  expect(badge({ source: "sim", simId: "sim_c" })).toContain(">Sim<")
  expect(badge({ source: "sim", simId: "sim_c" })).not.toContain("Baseline QA")
  expect(badge({ source: "sim", simSource: "baseline" })).toContain("Baseline QA")
  expect(badge({ source: "autosim" })).toContain("AutoSim")
})

test("the public API cannot mint a baseline Sim (not an accepted simSource)", () => {
  expect(SERVER).toContain('new Set(["describe", "from-site", "transcript", "preset"])')
})
