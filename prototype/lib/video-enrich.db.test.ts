// KLA-603: DB-level tests for the post-transcription enrichment STORAGE (hermetic temp DB, mirrors
// transcribe.test.ts). Proves the two invariants the orchestrator relies on:
//   (1) the "AI summary from walkthrough" is stored in a DEDICATED column, is surfaced by feedbackById
//       (aiWalkthrough), and is written ADDITIVELY — it fills only when empty and NEVER overwrites a prior
//       summary or the reporter's observation;
//   (2) extracted key frames are APPENDED to attachments_json (preserving existing attachments) and carry
//       the keyframe marker so the orchestrator's "run once" guard works and the tracker/dashboard surface
//       them for free.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-venrich-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, insertFeedback, feedbackById, setFeedbackWalkthroughSummary, appendFeedbackAttachments } = await import("./db")

const RUN = `${Date.now()}_${Math.random().toString(36).slice(2)}`
const ACCT = `acct_${RUN}`
const P = `proj_ve_${RUN}`

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  const now = Date.now()
  await db.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at,domain) VALUES (?,?,?,?,?)", args: [ACCT, "VE Tenant", `owner_${RUN}@x.com`, now, null] })
  await db.execute({ sql: "INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", args: [P, ACCT, "VE Project", "active", "auto", 100, "named", now, now] })
})

test("setFeedbackWalkthroughSummary: stores in a dedicated column, surfaced by feedbackById; never overwrites", async () => {
  const id = await insertFeedback({ projectId: P, observation: "see video" })
  // Before enrichment → no walkthrough summary.
  let fb = await feedbackById(P, id)
  expect(fb.aiWalkthrough).toBeNull()
  expect(fb.observation).toBe("see video") // reporter text intact

  const ok = await setFeedbackWalkthroughSummary(id, P, { text: "Summary: coupon 500s\nSteps:\n1. apply coupon", draft: { summary: "coupon 500s" }, source: "attachment", at: 123 })
  expect(ok).toBe(true)
  fb = await feedbackById(P, id)
  expect(fb.aiWalkthrough).toBeTruthy()
  expect(fb.aiWalkthrough.text).toContain("coupon 500s")
  expect(fb.aiWalkthrough.source).toBe("attachment")
  // Reporter's own observation is untouched (additive column, no clobber).
  expect(fb.observation).toBe("see video")

  // Idempotent guard: a SECOND write must NOT overwrite the first (fills only when empty).
  const ok2 = await setFeedbackWalkthroughSummary(id, P, { text: "DIFFERENT summary that should be ignored" })
  expect(ok2).toBe(false)
  fb = await feedbackById(P, id)
  expect(fb.aiWalkthrough.text).toContain("coupon 500s")
  expect(fb.aiWalkthrough.text).not.toContain("DIFFERENT")
})

test("appendFeedbackAttachments: appends keyframes, preserves existing attachments, carries the marker", async () => {
  // Seed a report that already has one (non-image) attachment, like a real upload.
  const id = await insertFeedback({ projectId: P, observation: "see video", attachments: [{ key: "orig_k", filename: "log.txt", contentType: "text/plain", size: 10 }] } as any)

  const ok = await appendFeedbackAttachments(id, P, [
    { key: "kf_1", filename: "keyframe-01-at-005.jpg", contentType: "image/jpeg", size: 2000, keyframe: true, atMs: 5000 },
    { key: "kf_2", filename: "keyframe-02-at-105.jpg", contentType: "image/jpeg", size: 2100, keyframe: true, atMs: 65000 },
  ])
  expect(ok).toBe(true)

  const fb = await feedbackById(P, id)
  expect(Array.isArray(fb.attachments)).toBe(true)
  expect(fb.attachments.length).toBe(3) // original + 2 keyframes
  // Original attachment preserved.
  expect(fb.attachments[0].key).toBe("orig_k")
  // Keyframes carry the marker (drives the orchestrator's "run once" guard).
  const kfs = fb.attachments.filter((a: any) => a.keyframe === true)
  expect(kfs.length).toBe(2)
  expect(kfs[0].contentType).toBe("image/jpeg")
  expect(kfs[1].atMs).toBe(65000)
})

test("appendFeedbackAttachments: works on a report that had NO prior attachments", async () => {
  const id = await insertFeedback({ projectId: P, observation: "hi" })
  const ok = await appendFeedbackAttachments(id, P, [{ key: "kf_x", filename: "keyframe-01.jpg", contentType: "image/jpeg", size: 100, keyframe: true, atMs: 1000 }])
  expect(ok).toBe(true)
  const fb = await feedbackById(P, id)
  expect(fb.attachments.length).toBe(1)
  expect(fb.attachments[0].keyframe).toBe(true)
})
