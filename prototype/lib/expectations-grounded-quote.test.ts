// prototype/lib/expectations-grounded-quote.test.ts
// KLAVITYKLA-253 (JTBD B.13): carry grounded evidence through graduation.
// Verifies:
//   (1) each ingest hook (Snap / Sim / AutoSim finding) persists the source quote + verified state
//   (2) legacy rows (no quote) tolerate null; verified tri-state round-trips (true/false/null)
//   (3) the originating quote is back-filled onto an existing row and NOT overwritten by later sources
//   (4) recordFinding threads the finding's groundQuote + groundQuoteVerified onto the expectation
//   (5) buildTicketFromFinding labels "Grounded:" only when verified, "Reason:" otherwise (relabel branch)
//   (6) buildAssertUserPrompt embeds the quote + the verify instruction when a quote is present
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createClient } from "@libsql/client"

const file = join(tmpdir(), `klav-b13-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
let db: any
beforeAll(async () => { db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const { ingestSnapOrSim, ingestFinding } = await import("./expectations-ingest")
const { listExpectations, getExpectation, upsertExpectation } = await import("./expectations-db")
const G = await import("./trails-findings-gate")
const A = await import("./assertion-spec")
const T = await import("./trails")

// ── (1) + (2): each ingest hook persists the quote + verified state; null tolerated ──────────────

test("Snap ingest persists the source quote (unverified reporter text)", async () => {
  const c = createClient({ url: "file::memory:" }); await applySchema(c)
  await ingestSnapOrSim(c, {
    projectId: "p_snap", feedbackId: "fb_snap1", isSnap: true,
    title: "Finish button missing", dedupKey: "snap:key1", urlPath: "/onboarding",
    sourceQuote: "I never found a Finish button on the last step", sourceQuoteVerified: false,
  })
  const exp = (await listExpectations(c, "p_snap"))[0]
  expect(exp.sourceQuote).toBe("I never found a Finish button on the last step")
  expect(exp.sourceQuoteVerified).toBe(false)
  expect(exp.sourceQuoteRef).toBe("fb_snap1")
})

test("Sim ingest persists a VERIFIED trait-provenance quote", async () => {
  const c = createClient({ url: "file::memory:" }); await applySchema(c)
  await ingestSnapOrSim(c, {
    projectId: "p_sim", feedbackId: "fb_sim1", isSnap: false,
    title: "Pricing unclear", dedupKey: "sim:key1", urlPath: "/pricing",
    sourceQuote: "the plan says $29 but checkout shows $39", sourceQuoteVerified: true,
  })
  const exp = (await listExpectations(c, "p_sim"))[0]
  expect(exp.sourceQuote).toBe("the plan says $29 but checkout shows $39")
  expect(exp.sourceQuoteVerified).toBe(true)
  expect(exp.sourceQuoteRef).toBe("fb_sim1")
})

test("AutoSim finding ingest persists its grounded quote + verified flag", async () => {
  const c = createClient({ url: "file::memory:" }); await applySchema(c)
  await ingestFinding(c, {
    projectId: "p_auto", findingId: "find_1", title: "Checkout gone",
    dedupKey: "trail:step:element-gone", urlPath: "/checkout",
    sourceQuote: `Can't find "Checkout" on the page`, sourceQuoteVerified: false,
  })
  const exp = (await listExpectations(c, "p_auto"))[0]
  expect(exp.sourceQuote).toBe(`Can't find "Checkout" on the page`)
  expect(exp.sourceQuoteVerified).toBe(false)
  expect(exp.sourceQuoteRef).toBe("find_1")
})

test("no quote → all three quote fields stay null (legacy-tolerant)", async () => {
  const c = createClient({ url: "file::memory:" }); await applySchema(c)
  await ingestSnapOrSim(c, {
    projectId: "p_null", feedbackId: "fb_n", isSnap: true, title: "Something off", dedupKey: "k_null",
  })
  const exp = (await listExpectations(c, "p_null"))[0]
  expect(exp.sourceQuote).toBeNull()
  expect(exp.sourceQuoteVerified).toBeNull()
  expect(exp.sourceQuoteRef).toBeNull()
})

// ── (3): the originating quote is back-filled once and NOT overwritten by later corroborations ────

test("first grounded quote wins: a later source does not overwrite the birth quote", async () => {
  const c = createClient({ url: "file::memory:" }); await applySchema(c)
  // Row is born WITHOUT a quote (candidate).
  await ingestFinding(c, {
    projectId: "p_bf", findingId: "find_a", title: "Payment button gone", dedupKey: "auto:pay", urlPath: "/pay",
  })
  let exp = (await listExpectations(c, "p_bf"))[0]
  expect(exp.sourceQuote).toBeNull()
  // A Snap on the same issue (lexical match) arrives WITH a quote → back-filled.
  await ingestSnapOrSim(c, {
    projectId: "p_bf", feedbackId: "fb_a", isSnap: true, title: "Payment button gone", dedupKey: "snap:pay", urlPath: "/pay",
    sourceQuote: "the Pay button vanished after I entered my card", sourceQuoteVerified: true,
  })
  exp = (await listExpectations(c, "p_bf"))[0]
  expect(exp.sourceQuote).toBe("the Pay button vanished after I entered my card")
  expect(exp.sourceQuoteVerified).toBe(true)
  expect(exp.sourceQuoteRef).toBe("fb_a")
  // A THIRD source with a different quote must NOT overwrite the birth quote.
  await ingestSnapOrSim(c, {
    projectId: "p_bf", feedbackId: "fb_b", isSnap: true, title: "Payment button gone", dedupKey: "snap:pay",
    sourceQuote: "totally different wording", sourceQuoteVerified: false,
  })
  exp = (await listExpectations(c, "p_bf"))[0]
  expect(exp.sourceQuote).toBe("the Pay button vanished after I entered my card")
  expect(exp.sourceQuoteRef).toBe("fb_a")
})

// ── (4): recordFinding threads groundQuote + groundQuoteVerified onto the expectation ─────────────

test("recordFinding threads the finding groundQuote (unverified) to the expectation spine", async () => {
  const proj = "p_rf_quote"
  const trailId = await T.createTrail(proj, { name: "b13-trail", baseUrl: "https://example.com/" })
  const runId = await T.startWalk(proj, trailId)
  const { id } = await T.recordFinding(proj, {
    runId, trailId, kind: "regression",
    title: `Can't find "Submit" on the page`,
    groundQuote: `Can't find "Submit" on the page`, groundQuoteVerified: false,
    confidence: 0.7, dedupKey: `${trailId}:step1:element-gone`, urlPath: "/signup",
  })
  expect(id).toBeTruthy()
  await new Promise((r) => setTimeout(r, 50))
  const exps = await listExpectations(db, proj)
  const exp = exps.find((e) => e.urlPath === "/signup")
  expect(exp).toBeDefined()
  expect(exp!.sourceQuote).toBe(`Can't find "Submit" on the page`)
  expect(exp!.sourceQuoteVerified).toBe(false)
  // and the finding row itself carries the verified flag
  const findings = await T.listFindings(proj)
  const f = findings.find((x) => x.id === id)
  expect(f!.groundQuoteVerified).toBe(false)
})

// ── (5): buildTicketFromFinding relabel branch ────────────────────────────────────────────────────

test("buildTicketFromFinding: unverified quote is labeled 'Reason:' not 'Grounded:'", () => {
  const t = G.buildTicketFromFinding({
    id: "f1", projectId: "p", runId: "r1", stepId: "s1", trailId: "tr1",
    kind: "regression", title: "Checkout gone", evidence: {},
    groundQuote: `Can't find "Checkout"`, groundQuoteVerified: false,
    confidence: 0.7, dedupKey: "k", recurrence: 1, status: "queued",
    connectorRef: null, connectorError: null, createdAt: 1, updatedAt: 1,
  } as any, "https://klavity.in")
  expect(t.body).toContain(`Reason: "Can't find "Checkout""`)
  expect(t.body).not.toContain("Grounded:")
})

test("buildTicketFromFinding: verified quote keeps the 'Grounded:' label", () => {
  const t = G.buildTicketFromFinding({
    id: "f2", projectId: "p", runId: "r1", stepId: "s1", trailId: "tr1",
    kind: "regression", title: "Wrong price", evidence: {},
    groundQuote: "the plan says $29 but checkout shows $39", groundQuoteVerified: true,
    confidence: 0.9, dedupKey: "k2", recurrence: 1, status: "queued",
    connectorRef: null, connectorError: null, createdAt: 1, updatedAt: 1,
  } as any, "https://klavity.in")
  expect(t.body).toContain(`Grounded: "the plan says $29 but checkout shows $39"`)
})

test("buildTicketFromFinding: legacy finding (null verified) is 'Reason:', never falsely 'Grounded:'", () => {
  const t = G.buildTicketFromFinding({
    id: "f3", projectId: "p", runId: "r1", stepId: "s1", trailId: "tr1",
    kind: "regression", title: "Legacy", evidence: {},
    groundQuote: "some legacy rationale", groundQuoteVerified: null,
    confidence: 0.7, dedupKey: "k3", recurrence: 1, status: "queued",
    connectorRef: null, connectorError: null, createdAt: 1, updatedAt: 1,
  } as any, "https://klavity.in")
  expect(t.body).toContain(`Reason: "some legacy rationale"`)
  expect(t.body).not.toContain("Grounded:")
})

// ── (6): buildAssertUserPrompt embeds the quote + verify instruction when present ─────────────────

test("buildAssertUserPrompt includes the sourceQuote + verify instruction when present", () => {
  const prompt = A.buildAssertUserPrompt(
    { title: "Pricing unclear", area: "checkout", urlPath: "/pricing", sourceQuote: "the plan says $29 but checkout shows $39" },
    { id: "trl_1", name: "Pricing walk", base_url: "https://example.com/" },
    [{ idx: 0, action: "click", target: { role: "button" } }],
  )
  expect(prompt).toContain("the plan says $29 but checkout shows $39")
  expect(prompt).toContain("MUST verify the condition described in the sourceQuote")
})

test("buildAssertUserPrompt omits quote block for legacy (no-quote) expectations", () => {
  const prompt = A.buildAssertUserPrompt(
    { title: "Pricing unclear", area: "checkout", urlPath: "/pricing", sourceQuote: null },
    { id: "trl_1", name: "Pricing walk", base_url: "https://example.com/" },
    [{ idx: 0, action: "click", target: { role: "button" } }],
  )
  expect(prompt).not.toContain("sourceQuote")
  expect(prompt).not.toContain("MUST verify")
})

// ── enriched getExpectation returns the quote + ref (GET /api/expectations/:id surface) ────────────

test("getExpectation returns sourceQuote + verified + ref (enriched single-expectation read)", async () => {
  const c = createClient({ url: "file::memory:" }); await applySchema(c)
  const created = await upsertExpectation(c, {
    projectId: "p_enrich", title: "Enrich me", dedupKey: "k_enrich",
    source: { kind: "snap", id: "fb_enrich" },
    sourceQuote: "verbatim complaint", sourceQuoteVerified: true,
  })
  const fetched = await getExpectation(c, created.id)
  expect(fetched!.sourceQuote).toBe("verbatim complaint")
  expect(fetched!.sourceQuoteVerified).toBe(true)
  expect(fetched!.sourceQuoteRef).toBe("fb_enrich")
})
