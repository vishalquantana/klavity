// Idempotent-submission primitives against a real (temp file) database: the claim state machine, the ATOMIC "ticket + number + key done"
// transaction (a failure rolls ALL of it back — no ticket without its key, no key without its ticket, no burned number), the guard that
// stops an attempt whose claim was taken over from creating a ticket, and atomic ticket numbering under concurrency.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-subs-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const dbm = await import("./db")
const subs = await import("./submissions")
const { reconnectDb, applySchema, insertFeedback, insertFeedbackForSubmission, feedbackById, mergeReportIntoTicketForSubmission, bumpFeedbackRecurrence, resolveMergeTarget } = dbm
const { claimSubmission, refreshClaim, releaseClaim, finishDedupedSubmission, saveEvidenceState, deterministicId, parseSubmissionKey, parseSlotMap, parseRepairSlots, slotFor, missingSlots, parseEvidence } = subs

const RUN = `${Date.now()}_${Math.random().toString(36).slice(2)}`
const ACCT = `acct_s_${RUN}`, P = `proj_s_${RUN}`
let raw: any
const q = async (sql: string, args: any[] = []) => (await raw.execute({ sql, args })).rows as any[]
beforeAll(async () => {
  raw = reconnectDb("file:" + file)
  await applySchema(raw)
  const now = Date.now()
  await raw.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at,domain) VALUES (?,?,?,?,?)", args: [ACCT, "T", `o_${RUN}@x.com`, now, null] })
  await raw.execute({ sql: "INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", args: [P, ACCT, "S", "active", "auto", 200, "named", now, now] })
})
const key = () => crypto.randomUUID()
const seqOf = async () => Number((await q("SELECT ticket_seq FROM projects WHERE id=?", [P]))[0].ticket_seq)

// ── pure helpers ──────────────────────────────────────────────────────────────────────────────────────────────────────────
test("key / slot parsing: strict, bounded, and tolerant of junk", () => {
  expect(parseSubmissionKey(null)).toBeNull(); expect(parseSubmissionKey("")).toBeNull()
  expect(parseSubmissionKey(crypto.randomUUID())).toMatch(/^[0-9a-f-]{36}$/)
  for (const bad of ["short", "x".repeat(65), "has space aaaaaaaaaaaa", "emoji-\u{1F600}-aaaaaaaaaaaa", "a/b/c/d/e/f/g/h/i/j"]) expect(parseSubmissionKey(bad)).toBe("invalid")
  expect(parseSlotMap('{"files":["file:1","file:3"],"recording":["rec:0"]}')).toEqual({ files: ["file:1", "file:3"], recording: ["rec:0"] })
  expect(parseSlotMap('{"files":["../etc/passwd"]}')).toEqual({})      // a slot must look like a slot
  expect(parseSlotMap("not json")).toEqual({}); expect(parseSlotMap(undefined)).toEqual({})
  expect(parseRepairSlots('["file:1","file:1","replay"]')).toEqual(["file:1", "replay"])
  expect(parseRepairSlots('["bogus"]')).toBeNull()
  expect(slotFor({ files: ["file:3"] }, "files", 0)).toBe("file:3"); expect(slotFor({}, "files", 2)).toBe("file:2"); expect(slotFor({}, "screenshots", 1)).toBe("shot:1"); expect(slotFor({}, "recording", 0)).toBe("rec:0")
  expect(deterministicId("p", "k", "file:1")).toBe(deterministicId("p", "k", "file:1"))
  expect(deterministicId("p", "k", "file:1")).not.toBe(deterministicId("p", "k", "file:2"))
  expect(deterministicId("p", "k", "file:1")).not.toBe(deterministicId("p2", "k", "file:1"))   // scoped per project
  expect(missingSlots({ "file:0": "ok", "file:1": "failed", replay: "pending" })).toEqual(["file:1", "replay"])
  expect(parseEvidence('{"file:0":"ok","x":"ok","file:1":"weird"}')).toEqual({ "file:0": "ok" })
})

// ── claim state machine ───────────────────────────────────────────────────────────────────────────────────────────────────
test("first claim wins; a second claim while the first is fresh is 'in_progress'", async () => {
  const k = key()
  expect((await claimSubmission({ projectId: P, key: k, actor: "a@x.com", owner: "own_1" })).kind).toBe("claimed")
  const r = await claimSubmission({ projectId: P, key: k, actor: "a@x.com", owner: "own_2" })
  expect(r.kind).toBe("in_progress"); expect((r as any).retryAfterSec).toBeGreaterThan(0)
})
test("a stale claim is taken over by exactly ONE of several simultaneous retries (CAS on claimed_at)", async () => {
  const k = key(), t = Date.now()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "own_dead", now: t - 120_000, staleMs: 60_000 })
  const rs = await Promise.all(Array.from({ length: 8 }, (_, i) => claimSubmission({ projectId: P, key: k, actor: null, owner: "own_r" + i, now: t, staleMs: 60_000 })))
  expect(rs.filter((r) => r.kind === "claimed").length).toBe(1)
  expect(rs.filter((r) => r.kind === "in_progress").length).toBe(7)
  expect((rs.find((r) => r.kind === "claimed") as any).takeover).toBe(true)
})
test("a different principal is a 'conflict' (case-insensitive email compare); anonymous ≠ authenticated", async () => {
  const k = key()
  await claimSubmission({ projectId: P, key: k, actor: "Alice@X.com", owner: "o1" })
  expect((await claimSubmission({ projectId: P, key: k, actor: "alice@x.com", owner: "o2" })).kind).toBe("in_progress")   // same person
  expect((await claimSubmission({ projectId: P, key: k, actor: "bob@x.com", owner: "o3" })).kind).toBe("conflict")
  expect((await claimSubmission({ projectId: P, key: k, actor: null, owner: "o4" })).kind).toBe("conflict")
  const k2 = key(); await claimSubmission({ projectId: P, key: k2, actor: null, owner: "o1" })
  expect((await claimSubmission({ projectId: P, key: k2, actor: "bob@x.com", owner: "o2" })).kind).toBe("conflict")
})
test("the same key in ANOTHER project is independent", async () => {
  const k = key()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "o1" })
  expect((await claimSubmission({ projectId: "proj_other_" + RUN, key: k, actor: null, owner: "o2" })).kind).toBe("claimed")
})
test("refreshClaim only works for the owner; releaseClaim frees a pending claim only", async () => {
  const k = key()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "own_a" })
  expect(await refreshClaim(P, k, "own_b")).toBe(false); expect(await refreshClaim(P, k, "own_a")).toBe(true)
  await releaseClaim(P, k, "own_b"); expect((await q("SELECT 1 FROM submission_keys WHERE project_id=? AND submission_key=?", [P, k])).length).toBe(1)   // not the owner → untouched
  await releaseClaim(P, k, "own_a"); expect((await q("SELECT 1 FROM submission_keys WHERE project_id=? AND submission_key=?", [P, k])).length).toBe(0)
  expect((await claimSubmission({ projectId: P, key: k, actor: null, owner: "own_c" })).kind).toBe("claimed")                                         // freed → immediately claimable
})

// ── atomic ticket + number + key ──────────────────────────────────────────────────────────────────────────────────────────
test("insertFeedbackForSubmission: ticket, its number and the key's 'done' land together; a replay then finds it", async () => {
  const k = key(), before = await seqOf()
  await claimSubmission({ projectId: P, key: k, actor: "a@x.com", owner: "own_t" })
  const r = await insertFeedbackForSubmission({ projectId: P, observation: "atomic ok " + k, priority: "low", actorEmail: "a@x.com" } as any, { projectId: P, key: k, owner: "own_t", evidenceJson: JSON.stringify({ "file:0": "ok" }) })
  expect("id" in r).toBe(true)
  const id = (r as any).id
  const fb: any = await feedbackById(P, id)
  expect(fb.seqNum).toBe(before + 1); expect(await seqOf()).toBe(before + 1)
  const row = (await q("SELECT state, feedback_id, deduped, evidence_json FROM submission_keys WHERE project_id=? AND submission_key=?", [P, k]))[0]
  expect(String(row.state)).toBe("done"); expect(String(row.feedback_id)).toBe(id); expect(Number(row.deduped)).toBe(0)
  const again = await claimSubmission({ projectId: P, key: k, actor: "a@x.com", owner: "own_u" })
  expect(again.kind).toBe("replay"); expect((again as any).feedbackId).toBe(id); expect((again as any).evidence).toEqual({ "file:0": "ok" })
})
test("ATOMICITY: if the ticket INSERT fails, the key stays 'pending', no ticket exists and NO ticket number is burned", async () => {
  await raw.execute("CREATE TRIGGER IF NOT EXISTS boom_trg BEFORE INSERT ON feedback WHEN NEW.observation = '__boom__' BEGIN SELECT RAISE(ABORT, 'boom'); END")
  const k = key(), before = await seqOf(), n0 = (await q("SELECT COUNT(*) AS n FROM feedback WHERE project_id=?", [P]))[0].n
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "own_x" })
  await expect(insertFeedbackForSubmission({ projectId: P, observation: "__boom__", priority: "low" } as any, { projectId: P, key: k, owner: "own_x", evidenceJson: null })).rejects.toThrow()
  const row = (await q("SELECT state, feedback_id FROM submission_keys WHERE project_id=? AND submission_key=?", [P, k]))[0]
  expect(String(row.state)).toBe("pending"); expect(row.feedback_id).toBeNull()
  expect(Number((await q("SELECT COUNT(*) AS n FROM feedback WHERE project_id=?", [P]))[0].n)).toBe(Number(n0))
  expect(await seqOf()).toBe(before)                                   // the counter bump was rolled back with the rest
  // …and the retry (same owner, same key) now succeeds and gets the number the failed attempt did not consume
  const ok = await insertFeedbackForSubmission({ projectId: P, observation: "retry ok", priority: "low" } as any, { projectId: P, key: k, owner: "own_x", evidenceJson: null })
  expect("id" in ok).toBe(true); expect(await seqOf()).toBe(before + 1)
})
test("LOST CLAIM: an attempt whose claim was taken over cannot create a ticket (nothing inserted, counter untouched)", async () => {
  const k = key(), t = Date.now()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "own_slow", now: t - 120_000, staleMs: 60_000 })
  const take = await claimSubmission({ projectId: P, key: k, actor: null, owner: "own_fast", now: t, staleMs: 60_000 })
  expect(take.kind).toBe("claimed")
  const before = await seqOf(), n0 = (await q("SELECT COUNT(*) AS n FROM feedback WHERE project_id=?", [P]))[0].n
  const r = await insertFeedbackForSubmission({ projectId: P, observation: "from the slow attempt", priority: "low" } as any, { projectId: P, key: k, owner: "own_slow", evidenceJson: null })
  expect(r).toEqual({ lost: true })
  expect(Number((await q("SELECT COUNT(*) AS n FROM feedback WHERE project_id=?", [P]))[0].n)).toBe(Number(n0)); expect(await seqOf()).toBe(before)
  // the rightful owner still can
  const ok = await insertFeedbackForSubmission({ projectId: P, observation: "from the fast attempt", priority: "low" } as any, { projectId: P, key: k, owner: "own_fast", evidenceJson: null })
  expect("id" in ok).toBe(true)
  // and after 'done', ANOTHER late attempt is also locked out
  expect(await insertFeedbackForSubmission({ projectId: P, observation: "late", priority: "low" } as any, { projectId: P, key: k, owner: "own_slow", evidenceJson: null })).toEqual({ lost: true })
})
test("a deleted ticket reopens its spent key (CAS), so the report can be created afresh", async () => {
  const k = key()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "o1" })
  const r: any = await insertFeedbackForSubmission({ projectId: P, observation: "to be deleted", priority: "low" } as any, { projectId: P, key: k, owner: "o1", evidenceJson: null })
  await raw.execute({ sql: "DELETE FROM feedback WHERE id=?", args: [r.id] })
  const again = await claimSubmission({ projectId: P, key: k, actor: null, owner: "o2" })
  expect(again.kind).toBe("claimed"); expect((again as any).takeover).toBe(true)
})
test("deduped finish: records the existing ticket, only for the claim owner", async () => {
  const k = key(), head: any = await insertFeedback({ projectId: P, observation: "head ticket", priority: "low" } as any)
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "o1" })
  expect(await finishDedupedSubmission({ projectId: P, key: k, owner: "someone_else", feedbackId: head, evidence: {} })).toBe(false)
  expect(await finishDedupedSubmission({ projectId: P, key: k, owner: "o1", feedbackId: head, evidence: { "shot:0": "ok" } })).toBe(true)
  const c: any = await claimSubmission({ projectId: P, key: k, actor: null, owner: "o3" })
  expect(c.kind).toBe("replay"); expect(c.feedbackId).toBe(head); expect(c.deduped).toBe(true)
  await saveEvidenceState(P, k, { "shot:0": "failed" })
  expect(((await claimSubmission({ projectId: P, key: k, actor: null, owner: "o4" })) as any).evidence).toEqual({ "shot:0": "failed" })
})

// ── numbering ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("insertFeedback (one batch: bump + insert) stays atomic: 20 concurrent inserts → 20 distinct, consecutive numbers", async () => {
  const P2 = `proj_n_${RUN}`, now = Date.now()
  await raw.execute({ sql: "INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", args: [P2, ACCT, "N", "active", "auto", 200, "named", now, now] })
  const ids = await Promise.all(Array.from({ length: 20 }, (_, i) => insertFeedback({ projectId: P2, observation: "n" + i, priority: "low" } as any)))
  const nums = (await q("SELECT seq_num FROM feedback WHERE project_id=? ORDER BY seq_num", [P2])).map((r) => Number(r.seq_num))
  expect(ids.length).toBe(20); expect(nums).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
  expect(Number((await q("SELECT ticket_seq FROM projects WHERE id=?", [P2]))[0].ticket_seq)).toBe(20)
})
test("a project with NO project row still gets numbered (MAX+1 fallback), exactly as before", async () => {
  const bare = `proj_bare_${RUN}`
  const a = await insertFeedback({ projectId: bare, observation: "b1", priority: "low" } as any)
  const b = await insertFeedback({ projectId: bare, observation: "b2", priority: "low" } as any)
  const nums = (await q("SELECT seq_num FROM feedback WHERE project_id=? ORDER BY seq_num", [bare])).map((r) => Number(r.seq_num))
  expect(nums).toEqual([1, 2]); expect(a).not.toBe(b)
})

// ── atomic merge of a repeat report (recurrence bump + occurrence receipt + key completion in ONE transaction) ───────────────────
const occRows = async (fid: string) => (await q("SELECT id FROM feedback_occurrences WHERE feedback_id=?", [fid])).length
const mkHead = async (o: { count?: number; status?: string; source?: string | null; simId?: string | null; dates?: string | null; obs?: string } = {}) => {
  const id: string = await insertFeedback({ projectId: P, observation: o.obs ?? ("head " + crypto.randomUUID()), priority: "low" } as any)
  await raw.execute({ sql: "UPDATE feedback SET recurrence_count=?, status=?, source=?, sim_id=?, recurrence_dates_json=? WHERE id=?", args: [o.count ?? 1, o.status ?? "new", o.source ?? null, o.simId ?? null, o.dates === undefined ? "[1000]" : o.dates, id] })
  return id
}
const mergeArgs = (target: string, key: string, owner: string, extra: any = {}) => ({ targetId: target, projectId: P, atMs: 5_000_000, allowPromote: false, occurrence: { observation: "again", screenshotId: null, sourceQuote: null, reporterEmail: null }, sub: { projectId: P, key, owner, evidenceJson: JSON.stringify({ "file:0": "pending" }) }, ...extra })
const rowOf = async (id: string) => (await q("SELECT recurrence_count, recurrence_dates_json, status, last_seen_at FROM feedback WHERE id=?", [id]))[0]

test("merge: key done (deduped, with the pending evidence), counter +1, date appended, occurrence receipt written — together", async () => {
  const head = await mkHead({ count: 1 }), k = key()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "m1" })
  const r = await mergeReportIntoTicketForSubmission(mergeArgs(head, k, "m1"))
  expect(r).toEqual({ status: "merged", id: head })
  const row = await rowOf(head)
  expect(Number(row.recurrence_count)).toBe(2); expect(JSON.parse(String(row.recurrence_dates_json))).toEqual([1000, 5_000_000]); expect(Number(row.last_seen_at)).toBe(5_000_000)
  expect(await occRows(head)).toBe(1)
  const kr = (await q("SELECT state, feedback_id, deduped, evidence_json FROM submission_keys WHERE project_id=? AND submission_key=?", [P, k]))[0]
  expect(String(kr.state)).toBe("done"); expect(String(kr.feedback_id)).toBe(head); expect(Number(kr.deduped)).toBe(1); expect(JSON.parse(String(kr.evidence_json))).toEqual({ "file:0": "pending" })
  const again = await claimSubmission({ projectId: P, key: k, actor: null, owner: "m2" })
  expect(again.kind).toBe("replay"); expect((again as any).deduped).toBe(true)
})
test("the relative SQL bump decides exactly like bumpFeedbackRecurrence (count, dates, last_seen, new→open promotion, quarantine, garbage dates)", async () => {
  const cases: Array<{ name: string; head: any; allow: boolean }> = [
    { name: "plain", head: { count: 1 }, allow: false },
    { name: "promote at 3rd sighting", head: { count: 2, status: "new" }, allow: true },
    { name: "no promote when not allowed", head: { count: 2, status: "new" }, allow: false },
    { name: "no promote below 3", head: { count: 1, status: "new" }, allow: true },
    { name: "already open stays open", head: { count: 5, status: "open" }, allow: true },
    { name: "Sim-sourced head is never promoted", head: { count: 2, status: "new", source: "sim" }, allow: true },
    { name: "studio-demo head is never promoted", head: { count: 2, status: "new", source: "Studio-Demo " }, allow: true },
    { name: "head with a sim_id is never promoted", head: { count: 2, status: "new", simId: "sim_x" }, allow: true },
    { name: "human head with an unrelated source IS promoted", head: { count: 2, status: "new", source: "widget" }, allow: true },
    { name: "garbage dates restart the list", head: { count: 1, dates: "{not json" }, allow: false },
    { name: "NULL dates restart the list", head: { count: 1, dates: null }, allow: false },
  ]
  for (const c of cases) {
    const h1 = await mkHead(c.head), h2 = await mkHead(c.head), k = key()
    expect(await bumpFeedbackRecurrence(h1, 5_000_000, { allowPromote: c.allow })).toBe(true)
    await claimSubmission({ projectId: P, key: k, actor: null, owner: "eq" })
    expect((await mergeReportIntoTicketForSubmission(mergeArgs(h2, k, "eq", { allowPromote: c.allow }))).status).toBe("merged")
    const a = await rowOf(h1), b = await rowOf(h2)
    expect({ case: c.name, count: Number(b.recurrence_count), status: String(b.status), last: Number(b.last_seen_at), dates: JSON.parse(String(b.recurrence_dates_json)) })
      .toEqual({ case: c.name, count: Number(a.recurrence_count), status: String(a.status), last: Number(a.last_seen_at), dates: JSON.parse(String(a.recurrence_dates_json)) })
  }
})
test("ATOMICITY: if the bump fails, the key stays 'pending', nothing is counted and no occurrence is written", async () => {
  const head = await mkHead({ count: 1, obs: "__boom_merge__" }), k = key()
  await raw.execute("CREATE TRIGGER IF NOT EXISTS boom_merge BEFORE UPDATE OF recurrence_count ON feedback WHEN NEW.observation = '__boom_merge__' BEGIN SELECT RAISE(ABORT, 'boom'); END")   // after the row exists
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "b1" })
  await expect(mergeReportIntoTicketForSubmission(mergeArgs(head, k, "b1"))).rejects.toThrow()
  const kr = (await q("SELECT state, feedback_id FROM submission_keys WHERE project_id=? AND submission_key=?", [P, k]))[0]
  expect(String(kr.state)).toBe("pending"); expect(kr.feedback_id).toBeNull()
  expect(Number((await rowOf(head)).recurrence_count)).toBe(1); expect(await occRows(head)).toBe(0)
  await raw.execute("DROP TRIGGER boom_merge")
  // the same attempt can be retried and then merges exactly once
  expect((await mergeReportIntoTicketForSubmission(mergeArgs(head, k, "b1"))).status).toBe("merged")
  expect(Number((await rowOf(head)).recurrence_count)).toBe(2)
})
test("a failing OCCURRENCE receipt (best-effort in the old code) does not fail or double-apply the merge", async () => {
  await raw.execute("CREATE TRIGGER IF NOT EXISTS boom_occ BEFORE INSERT ON feedback_occurrences WHEN NEW.observation = '__boom_occ__' BEGIN SELECT RAISE(ABORT, 'boom'); END")
  const head = await mkHead({ count: 1 }), k = key()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "o1" })
  const r = await mergeReportIntoTicketForSubmission(mergeArgs(head, k, "o1", { occurrence: { observation: "__boom_occ__", screenshotId: null, sourceQuote: null, reporterEmail: null } }))
  expect(r.status).toBe("merged")
  expect(Number((await rowOf(head)).recurrence_count)).toBe(2)       // counted ONCE (the failed batch rolled back; the retried batch applied)
  expect(await occRows(head)).toBe(0)
  await raw.execute("DROP TRIGGER boom_occ")
})
test("a second run for the same key (an attempt that raced / re-ran after the first one committed) does NOT count the recurrence again", async () => {
  const head = await mkHead({ count: 1 }), k = key()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "d1" })
  expect((await mergeReportIntoTicketForSubmission(mergeArgs(head, k, "d1"))).status).toBe("merged")
  expect((await mergeReportIntoTicketForSubmission(mergeArgs(head, k, "d1"))).status).toBe("lost")     // key already done → every statement is a guarded no-op
  expect((await mergeReportIntoTicketForSubmission(mergeArgs(head, k, "d2"))).status).toBe("lost")     // a different owner too
  expect(Number((await rowOf(head)).recurrence_count)).toBe(2); expect(await occRows(head)).toBe(1)
})
test("lost claim (taken over) → nothing is written; vanished head → 'head_gone' and the claim is left pending for the caller's fail-closed path", async () => {
  const head = await mkHead({ count: 1 }), k = key(), t = Date.now()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "slow", now: t - 120_000, staleMs: 60_000 })
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "fast", now: t, staleMs: 60_000 })
  expect((await mergeReportIntoTicketForSubmission(mergeArgs(head, k, "slow"))).status).toBe("lost")
  expect(Number((await rowOf(head)).recurrence_count)).toBe(1); expect(await occRows(head)).toBe(0)
  const k2 = key(); await claimSubmission({ projectId: P, key: k2, actor: null, owner: "g1" })
  expect(await mergeReportIntoTicketForSubmission(mergeArgs("fb_does_not_exist_" + RUN, k2, "g1"))).toEqual({ status: "head_gone" })
  expect(String((await q("SELECT state FROM submission_keys WHERE project_id=? AND submission_key=?", [P, k2]))[0].state)).toBe("pending")
})
test("a head that was itself merged away redirects to its live root (same as the old bump), and the key records the live root", async () => {
  const live = await mkHead({ count: 1 }), dead = await mkHead({ count: 1 }), k = key()
  await raw.execute({ sql: "UPDATE feedback SET merged_into=? WHERE id=?", args: [live, dead] })
  expect(await resolveMergeTarget(P, dead)).toBe(live); expect(await resolveMergeTarget(P, live)).toBe(live); expect(await resolveMergeTarget(P, "fb_nope_" + RUN)).toBeNull()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "r1" })
  expect(await mergeReportIntoTicketForSubmission(mergeArgs(dead, k, "r1"))).toEqual({ status: "merged", id: live })
  expect(Number((await rowOf(live)).recurrence_count)).toBe(2); expect(Number((await rowOf(dead)).recurrence_count)).toBe(1)
  expect(String((await q("SELECT feedback_id FROM submission_keys WHERE project_id=? AND submission_key=?", [P, k]))[0].feedback_id)).toBe(live)
})
test("retry hint: Retry-After tracks when the claim turns stale (within [1, 15] s)", async () => {
  const { pendingHint } = subs as any
  expect(pendingHint(60_000)).toEqual({ retryAfterSec: 15, staleInSec: 60 })        // far away → keep polling every 15 s at most
  expect(pendingHint(10_000)).toEqual({ retryAfterSec: 11, staleInSec: 10 })
  expect(pendingHint(300)).toEqual({ retryAfterSec: 2, staleInSec: 1 })
  expect(pendingHint(0)).toEqual({ retryAfterSec: 1, staleInSec: 0 })
  const k = key(), t = Date.now()
  await claimSubmission({ projectId: P, key: k, actor: null, owner: "h1", now: t - 50_000, staleMs: 60_000 })
  const r: any = await claimSubmission({ projectId: P, key: k, actor: null, owner: "h2", now: t, staleMs: 60_000 })
  expect(r.kind).toBe("in_progress"); expect(r.staleInSec).toBe(10); expect(r.retryAfterSec).toBe(11)
})
