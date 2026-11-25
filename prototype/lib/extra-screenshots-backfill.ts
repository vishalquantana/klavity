// Backfill for multi-capture tickets created BEFORE extra_screenshots_json existed.
//
// Those reports uploaded + ledgered every screenshot, but only the first was linked to the ticket (screenshot_id). For a report
// filed through an idempotent submission (widget, since 72ccc0f6), each screenshot id is DETERMINISTIC:
//   "shot_" + deterministicId(projectId, submissionKey, "shot:<n>")
// and submission_keys records the key, the ticket id and which slots uploaded OK. So the extra screenshots can be recomputed
// EXACTLY — no time-window guessing. Every match is double-checked: the first recomputed id must equal the ticket's own
// screenshot_id, and every extra id must exist in the screenshots ledger for the same project. Anything that doesn't check out
// is skipped and reported. Tickets without a submission key (older reports, random ids) are not touched.

import type { Client } from "@libsql/client"
import { deterministicId, parseEvidence } from "./submissions"

export interface ExtraShotPlan {
  feedbackId: string
  projectId: string
  extraIds: string[]
}
export interface ExtraShotSkip { feedbackId: string; reason: string }

const SHOT_SLOT = /^shot:(\d{1,2})$/

export async function planExtraScreenshotLinks(c: Client): Promise<{ plans: ExtraShotPlan[]; skipped: ExtraShotSkip[] }> {
  const plans: ExtraShotPlan[] = []
  const skipped: ExtraShotSkip[] = []
  const keys = await c.execute(
    "SELECT project_id, submission_key, feedback_id, evidence_json FROM submission_keys WHERE feedback_id IS NOT NULL AND deduped=0",
  )
  for (const k of keys.rows as any[]) {
    const projectId = String(k.project_id), key = String(k.submission_key), feedbackId = String(k.feedback_id)
    const ev = parseEvidence(k.evidence_json)
    const slots = Object.keys(ev)
      .filter((s) => SHOT_SLOT.test(s) && ev[s] === "ok")
      .sort((a, b) => Number(SHOT_SLOT.exec(a)![1]) - Number(SHOT_SLOT.exec(b)![1]))
    if (slots.length < 2) continue // single-shot report: nothing to link
    const ids = slots.map((s) => "shot_" + deterministicId(projectId, key, s))
    const fb = (await c.execute({ sql: "SELECT project_id, screenshot_id, extra_screenshots_json FROM feedback WHERE id=?", args: [feedbackId] })).rows[0] as any
    if (!fb) { skipped.push({ feedbackId, reason: "ticket not found" }); continue }
    if (String(fb.project_id) !== projectId) { skipped.push({ feedbackId, reason: "project mismatch" }); continue }
    if (fb.extra_screenshots_json != null) continue // already linked (new intake, or an earlier backfill run)
    if (String(fb.screenshot_id ?? "") !== ids[0]) { skipped.push({ feedbackId, reason: "first screenshot does not match the ticket's screenshot_id" }); continue }
    const extraIds: string[] = []
    for (const sid of ids.slice(1)) {
      const row = (await c.execute({ sql: "SELECT project_id FROM screenshots WHERE id=?", args: [sid] })).rows[0] as any
      if (row && String(row.project_id) === projectId) extraIds.push(sid)
    }
    if (!extraIds.length) { skipped.push({ feedbackId, reason: "extra screenshots not found in the ledger" }); continue }
    if (extraIds.length < ids.length - 1) skipped.push({ feedbackId, reason: `${ids.length - 1 - extraIds.length} extra screenshot(s) missing from the ledger — linking the rest` })
    plans.push({ feedbackId, projectId, extraIds })
  }
  return { plans, skipped }
}

/** Write the plans. Guarded by `extra_screenshots_json IS NULL` so it never overwrites and re-running is a no-op. */
export async function applyExtraScreenshotLinks(c: Client, plans: ExtraShotPlan[]): Promise<number> {
  let n = 0
  for (const p of plans) {
    const r = await c.execute({
      sql: "UPDATE feedback SET extra_screenshots_json=? WHERE id=? AND project_id=? AND extra_screenshots_json IS NULL",
      args: [JSON.stringify(p.extraIds), p.feedbackId, p.projectId],
    })
    n += Number(r.rowsAffected || 0)
  }
  return n
}
