// Phase-1 QA Sim standards through the real pipeline (real libsql file DB): evidence integrity, traceability, evidence consolidation.
import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { unlinkSync } from "node:fs"

const DB_FILE = join(tmpdir(), `klav-sim-evidence-${Date.now()}-${randomUUID()}.db`)
const PROJECT_ID = `proj_sim_evidence_${Date.now()}`
const ACTOR = "sim-evidence@test.local"
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
process.env.TURSO_DATABASE_URL = "file:" + DB_FILE
delete process.env.TURSO_AUTH_TOKEN

const dbMod = await import("./db")
const { runSimReviews } = await import("./sim-review")

beforeAll(async () => {
  const c = dbMod.reconnectDb("file:" + DB_FILE)
  await dbMod.applySchema(c)
  await dbMod.migrateV2(c)
})

const cite = { citedTraitIds: [], sourceQuote: null, speaker: null, sourceTranscriptId: null, sourceDate: null, issueType: null, sourceQuoteVerified: null, recurrence: null }
const sim = { id: "sim_ev_1", name: "Baseline QA", insights: [], initials: "BQ", accent: "#000", simSource: "baseline" }

function run(reaction: any, over: any = {}) {
  return runSimReviews({
    projectId: PROJECT_ID, urlPath: "/pricing", urlHost: "x.test", pageUrl: "https://x.test/pricing",
    imageB64: "iVBORw0KGgo=", mediaType: "image/png", targetSims: [sim], actorEmail: ACTOR,
    screenshotId: "shot_ok", seenKeys: ["k"], adhoc: true,
    reactFn: async () => ({ data: { reactions: [reaction] } }),
    resolveCitationsFn: async () => cite, db: dbMod.db,
    ...over,
  })
}
const bug = (title: string, body: string) => ({ title, body, priority: "medium" })
const fbRow = async (id: string) => (await dbMod.db!.execute({ sql: "SELECT * FROM feedback WHERE id=?", args: [id] })).rows[0] as any

const pageMeta = { elements: [
  { id: "e1", tag: "h2", text: "Pricing", box: { x: 0.1, y: 0.1, w: 0.3, h: 0.05 } },
  { id: "e2", tag: "button", text: "Buy now", selector: "#buy", heading: "Pricing", box: { x: 0.5, y: 0.5, w: 0.2, h: 0.1 } },
  { id: "e3", tag: "button", text: "Learn more", heading: "Pricing", box: { x: 0.75, y: 0.5, w: 0.15, h: 0.1 } },
], capturedAt: 1 }

test("a finding records the page, the VERIFIED component and 'screenshot observation, not browser-verified'", async () => {
  const out = await run({
    observation: "The Buy now button is clipped on the right edge", sentiment: "negative",
    target: { elementId: "e2", text: "Buy now", selector: "#made-up" }, region: { x: 0.5, y: 0.5, w: 0.2, h: 0.1 },
    suggestedBug: bug("Buy now button clipped", "The Buy now button is clipped on the right edge"),
  }, { pageMeta })
  const id = out[0].observations[0].feedbackId!
  const row = await fbRow(id)
  expect(row.screenshot_id).toBe("shot_ok")
  const ctx = JSON.parse(row.client_context_json)
  expect(ctx.simReview.basis).toBe("screenshot")
  expect(ctx.simReview.browserVerified).toBe(false)
  expect(ctx.simReview.pageUrl).toBe("https://x.test/pricing")
  expect(ctx.simReview.component).toMatchObject({ kind: "button", text: "Buy now", selector: "#buy" })   // from the page map, not the model's "#made-up"
  expect(ctx.simReview.identification).toMatchObject({ confidence: "high", uncertain: false })
  expect(ctx.simReview.reproduced).toBe(false)
  expect(ctx.simReview.evidence.screenshot).toBe("captured")
})

test("without page metadata the component is NOT recorded as an exact element (medium, uncertain, no invented selector)", async () => {
  const out = await run({
    observation: "The Subscribe button looks misaligned", sentiment: "negative",
    target: { role: "button", text: "Subscribe", selector: "#sub" }, region: { x: 0.1, y: 0.6, w: 0.2, h: 0.1 },
    suggestedBug: bug("Subscribe button misaligned", "The Subscribe button looks misaligned"),
  })
  const ctx = JSON.parse((await fbRow(out[0].observations[0].feedbackId!)).client_context_json)
  expect(ctx.simReview.component).toBeNull()
  expect(ctx.simReview.identification).toMatchObject({ confidence: "medium", basis: "screenshot-only", uncertain: true })
  expect(JSON.stringify(ctx)).not.toContain("#sub")
})

test("a neighbouring element is not recorded: text says Buy now but the box sits on Learn more", async () => {
  const out = await run({
    observation: "The Buy now button text is cut off", sentiment: "negative",
    target: { elementId: "e2", text: "Buy now" }, region: { x: 0.76, y: 0.5, w: 0.13, h: 0.1 },
    suggestedBug: bug("Buy now text cut off", "The Buy now button text is cut off"),
  }, { pageMeta })
  const ctx = JSON.parse((await fbRow(out[0].observations[0].feedbackId!)).client_context_json)
  expect(ctx.simReview.component).toBeNull()
  expect(ctx.simReview.identification.confidence).not.toBe("high")
})

test("failed screenshot storage → finding has NO screenshot id and the failure is recorded (no placeholder)", async () => {
  const out = await run({
    observation: "Footer copyright year reads 2019", sentiment: "negative",
    suggestedBug: bug("Stale copyright year", "Footer copyright year reads 2019"),
  }, { screenshotId: null, evidence: { screenshot: "failed", error: "upload: S3 down", checkedAt: 1 } })
  const row = await fbRow(out[0].observations[0].feedbackId!)
  expect(row.screenshot_id).toBeNull()
  const ctx = JSON.parse(row.client_context_json)
  expect(ctx.simReview.evidence.screenshot).toBe("failed")
  expect(ctx.simReview.evidence.error).toContain("S3 down")
  const act = await dbMod.db!.execute({ sql: "SELECT screenshot_id FROM activity_events WHERE project_id=? AND type='review_run' ORDER BY created_at DESC LIMIT 1", args: [PROJECT_ID] })
  expect((act.rows[0] as any).screenshot_id).toBeNull()
})

test("a rephrased repeat merges into the original finding and appends its evidence (original reference kept)", async () => {
  const first = await run({
    observation: "The Sign up button has very low contrast against the hero background", sentiment: "negative",
    target: { role: "button", selector: "#signup", text: "Sign up" },
    suggestedBug: bug("Low contrast on Sign up button", "The Sign up button has very low contrast against the hero background"),
  }, { screenshotId: "shot_first" })
  const headId = first[0].observations[0].feedbackId!
  expect(first[0].observations[0].deduped).toBe(false)

  const again = await run({
    observation: "Contrast of the sign-up button label is too low to read against the hero", sentiment: "negative",
    target: { role: "button", selector: "#signup", text: "Sign up" },
    suggestedBug: bug("Sign-up label hard to read", "Contrast of the sign-up button label is too low to read against the hero"),
  }, { screenshotId: "shot_second" })
  const o = again[0].observations[0]
  expect(o.deduped).toBe(true)
  expect(o.feedbackId).toBe(headId)

  const head = await fbRow(headId)
  expect(head.screenshot_id).toBe("shot_first")           // original evidence untouched
  expect(Number(head.recurrence_count)).toBeGreaterThanOrEqual(2)
  const occ = await dbMod.listFeedbackOccurrences(headId)
  expect(occ.length).toBe(1)
  expect(occ[0].screenshotId).toBe("shot_second")          // new screenshot appended to the history
  expect(occ[0].evidence.screenshot).toBe("captured")
  expect(occ[0].evidence.basis).toBe("screenshot")
})

test("a different defect on the same component is NOT merged", async () => {
  const out = await run({
    observation: "The Sign up button label has a typo: 'Sgin up'", sentiment: "negative",
    target: { role: "button", selector: "#signup", text: "Sign up" },
    suggestedBug: bug("Typo in Sign up button", "The Sign up button label has a typo: 'Sgin up'"),
  })
  expect(out[0].observations[0].deduped).toBe(false)
})

test("a repeat sighting whose screenshot failed is recorded as an occurrence with no screenshot and the failure", async () => {
  const first = await run({
    observation: "Hero image is missing and shows a broken icon", sentiment: "negative",
    suggestedBug: bug("Broken hero image", "Hero image is missing and shows a broken icon"),
  })
  const headId = first[0].observations[0].feedbackId!
  await run({
    observation: "Hero image is missing and shows a broken icon", sentiment: "negative",
    suggestedBug: bug("Broken hero image", "Hero image is missing and shows a broken icon"),
  }, { screenshotId: null, evidence: { screenshot: "failed", error: "verify: not found", checkedAt: 2 } })
  const occ = await dbMod.listFeedbackOccurrences(headId)
  expect(occ.length).toBe(1)
  expect(occ[0].screenshotId).toBeNull()
  expect(occ[0].evidence.screenshot).toBe("failed")
  expect(occ[0].evidence.error).toContain("not found")
})

test("verified identity: same defect re-worded merges (count + history kept); same wording on a DIFFERENT component does not", async () => {
  const a = (obs: string, id: string, shot: string, text: string, box: any) =>
    run({ observation: obs, sentiment: "negative", target: { elementId: id, text }, region: box, suggestedBug: bug(obs.slice(0, 40), obs) }, { pageMeta, screenshotId: shot })
  const e2 = pageMeta.elements[1].box, e3 = pageMeta.elements[2].box
  const first = await a("The label text on the Buy now button overflows its container", "e2", "shot_a", "Buy now", e2)
  const headId = first[0].observations[0].feedbackId!
  const countBefore = Number((await fbRow(headId)).recurrence_count)
  const occBefore = (await dbMod.listFeedbackOccurrences(headId)).length
  const second = await a("Buy now button label spills outside the button and is clipped", "e2", "shot_b", "Buy now", e2)
  const third = await a("Text is clipped on the Buy now button, it overflows the edges", "e2", "shot_c", "Buy now", e2)
  expect(second[0].observations[0].feedbackId).toBe(headId)
  expect(third[0].observations[0].feedbackId).toBe(headId)
  const head = await fbRow(headId)
  expect(Number(head.recurrence_count)).toBe(countBefore + 2)               // exactly one bump per repeat sighting
  const occ = await dbMod.listFeedbackOccurrences(headId)
  expect(occ.length).toBe(occBefore + 2)
  expect(occ.map((o: any) => o.screenshotId)).toEqual(expect.arrayContaining(["shot_b", "shot_c"]))   // each sighting keeps ITS OWN screenshot
  // Same kind of defect, same words, but on the Learn more button → a separate finding.
  const other = await a("The label text on the Learn more button overflows its container", "e3", "shot_d", "Learn more", e3)
  expect(other[0].observations[0].feedbackId).not.toBe(headId)
  expect(other[0].observations[0].deduped).toBe(false)
})

test("a failed upload never produces an attachment id, even when the page metadata is good", async () => {
  const out = await run({
    observation: "Pricing page footer shows a stray unstyled bullet list under the card", sentiment: "negative",
    target: { elementId: "e3", text: "Learn more" }, region: pageMeta.elements[2].box,
    suggestedBug: bug("Stray bullet list in footer", "Pricing page footer shows a stray unstyled bullet list under the card"),
  }, { pageMeta, screenshotId: null, evidence: { screenshot: "failed", error: "upload: timeout", checkedAt: 3 } })
  const row = await fbRow(out[0].observations[0].feedbackId!)
  expect(row.screenshot_id).toBeNull()
  const ctx = JSON.parse(row.client_context_json)
  expect(ctx.simReview.evidence).toMatchObject({ screenshot: "failed", error: "upload: timeout" })
  expect(ctx.simReview.identification.confidence).toBe("high")
})
