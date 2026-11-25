// Backfill of multi-capture tickets created before extra_screenshots_json: exact, double-checked matching only.
import { test, expect } from "bun:test"
import { createClient, type Client } from "@libsql/client"
import { applySchema } from "./db"
import { deterministicId } from "./submissions"
import { planExtraScreenshotLinks, applyExtraScreenshotLinks } from "./extra-screenshots-backfill"

const P = "proj_1"
const sid = (key: string, n: number, project = P) => "shot_" + deterministicId(project, key, `shot:${n}`)

async function fresh(): Promise<Client> {
  const c = createClient({ url: "file::memory:" })
  await applySchema(c)
  await c.execute("ALTER TABLE feedback ADD COLUMN extra_screenshots_json TEXT").catch(() => {})
  return c
}
async function shot(c: Client, id: string, project = P) {
  await c.execute({ sql: "INSERT INTO screenshots (id, project_id, s3_key, bucket, content_type, created_at) VALUES (?,?,?,?,?,?)", args: [id, project, "k/" + id, "b", "image/png", 1] })
}
async function ticket(c: Client, id: string, primary: string | null, project = P) {
  await c.execute({ sql: "INSERT INTO feedback (id, project_id, observation, screenshot_id, created_at) VALUES (?,?,?,?,?)", args: [id, project, "x", primary, 1] })
}
async function key(c: Client, k: string, feedbackId: string, evidence: Record<string, string>, opts: { deduped?: number; project?: string } = {}) {
  await c.execute({ sql: "INSERT INTO submission_keys (project_id, submission_key, state, feedback_id, deduped, evidence_json, created_at, claimed_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)",
    args: [opts.project ?? P, k, "done", feedbackId, opts.deduped ?? 0, JSON.stringify(evidence), 1, 1, 1] })
}
const extraOf = async (c: Client, id: string) => (await c.execute({ sql: "SELECT extra_screenshots_json FROM feedback WHERE id=?", args: [id] })).rows[0]?.extra_screenshots_json

test("links the 2nd+ screenshots of an old multi-capture ticket, in capture order", async () => {
  const c = await fresh()
  for (const n of [0, 1, 2]) await shot(c, sid("keyAAAAAAAAAAAAAAAA", n))
  await ticket(c, "fb1", sid("keyAAAAAAAAAAAAAAAA", 0))
  await key(c, "keyAAAAAAAAAAAAAAAA", "fb1", { "shot:2": "ok", "shot:0": "ok", "shot:1": "ok", "file:0": "ok" })
  const { plans, skipped } = await planExtraScreenshotLinks(c)
  expect(skipped).toEqual([])
  expect(plans).toEqual([{ feedbackId: "fb1", projectId: P, extraIds: [sid("keyAAAAAAAAAAAAAAAA", 1), sid("keyAAAAAAAAAAAAAAAA", 2)] }])
  expect(await applyExtraScreenshotLinks(c, plans)).toBe(1)
  expect(JSON.parse(String(await extraOf(c, "fb1")))).toEqual(plans[0].extraIds)
  // Re-running is a no-op (already linked → not planned again, and the write is guarded).
  expect((await planExtraScreenshotLinks(c)).plans).toEqual([])
  expect(await applyExtraScreenshotLinks(c, plans)).toBe(0)
})

test("skips anything that does not check out exactly", async () => {
  const c = await fresh()
  // first recomputed id != the ticket's screenshot_id → skip
  for (const n of [0, 1]) await shot(c, sid("keyBBBBBBBBBBBBBBBB", n))
  await ticket(c, "fb_mismatch", "shot_something_else")
  await key(c, "keyBBBBBBBBBBBBBBBB", "fb_mismatch", { "shot:0": "ok", "shot:1": "ok" })
  // extra screenshot not in the ledger → skip
  await shot(c, sid("keyCCCCCCCCCCCCCCCC", 0))
  await ticket(c, "fb_missing", sid("keyCCCCCCCCCCCCCCCC", 0))
  await key(c, "keyCCCCCCCCCCCCCCCC", "fb_missing", { "shot:0": "ok", "shot:1": "ok" })
  // a failed upload slot is never linked; single-shot and deduped reports are ignored
  for (const n of [0, 1]) await shot(c, sid("keyDDDDDDDDDDDDDDDD", n))
  await ticket(c, "fb_single", sid("keyDDDDDDDDDDDDDDDD", 0))
  await key(c, "keyDDDDDDDDDDDDDDDD", "fb_single", { "shot:0": "ok", "shot:1": "failed" })
  await key(c, "keyEEEEEEEEEEEEEEEE", "fb_single", { "shot:0": "ok", "shot:1": "ok" }, { deduped: 1 })
  const { plans, skipped } = await planExtraScreenshotLinks(c)
  expect(plans).toEqual([])
  expect(skipped.map((s) => s.feedbackId).sort()).toEqual(["fb_mismatch", "fb_missing"])
})

test("never links a screenshot stored for a different project", async () => {
  const c = await fresh()
  await shot(c, sid("keyFFFFFFFFFFFFFFFF", 0))
  await shot(c, sid("keyFFFFFFFFFFFFFFFF", 1), "proj_other")
  await ticket(c, "fb_x", sid("keyFFFFFFFFFFFFFFFF", 0))
  await key(c, "keyFFFFFFFFFFFFFFFF", "fb_x", { "shot:0": "ok", "shot:1": "ok" })
  const { plans } = await planExtraScreenshotLinks(c)
  expect(plans).toEqual([])
})
