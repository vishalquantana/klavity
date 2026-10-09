// KD-193: appendFeedbackAttachments is a compare-and-swap — overlapping appends (two uploads, or an upload racing the
// video-enrich keyframes) must ALL land; before, each read the same list and the later write dropped the other's attachments.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-attcas-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, insertFeedback, feedbackById, appendFeedbackAttachments } = await import("./db")

const RUN = `${Date.now()}_${Math.random().toString(36).slice(2)}`
const ACCT = `acct_${RUN}`, P = `proj_cas_${RUN}`
let rawDb: any
beforeAll(async () => {
  rawDb = reconnectDb("file:" + file)
  await applySchema(rawDb)
  const now = Date.now()
  await rawDb.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at,domain) VALUES (?,?,?,?,?)", args: [ACCT, "CAS Tenant", `owner_${RUN}@x.com`, now, null] })
  await rawDb.execute({ sql: "INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", args: [P, ACCT, "CAS", "active", "auto", 200, "named", now, now] })
})
const att = (n: number) => ({ key: "uploads/attachments/k" + n, filename: "f" + n + ".png", contentType: "image/png", size: 100 + n })
const stored = async (id: string) => ((await feedbackById(P, id)) as any).attachments as any[]

test("many OVERLAPPING appends all land (no lost update)", async () => {
  const id = await insertFeedback({ projectId: P, observation: "cas", priority: "low" })
  const results = await Promise.all(Array.from({ length: 12 }, (_, i) => appendFeedbackAttachments(id, P, [att(i)])))
  expect(results.every(Boolean)).toBe(true)
  const list = await stored(id)
  expect(list.length).toBe(12)
  expect(new Set(list.map(a => a.key)).size).toBe(12)
})

test("an append racing a multi-item append keeps every item", async () => {
  const id = await insertFeedback({ projectId: P, observation: "cas2", priority: "low" })
  await Promise.all([appendFeedbackAttachments(id, P, [att(1), att(2), att(3)]), appendFeedbackAttachments(id, P, [att(4)]), appendFeedbackAttachments(id, P, [att(5), att(6)])])
  expect((await stored(id)).map(a => a.key).sort()).toEqual([1, 2, 3, 4, 5, 6].map(n => "uploads/attachments/k" + n))
})

test("an attachment already present (same storage key) is not added twice", async () => {
  const id = await insertFeedback({ projectId: P, observation: "dup", priority: "low" })
  await appendFeedbackAttachments(id, P, [att(1)])
  expect(await appendFeedbackAttachments(id, P, [att(1)])).toBe(true)          // nothing new → still success
  expect((await stored(id)).length).toBe(1)
  await appendFeedbackAttachments(id, P, [att(1), att(2)])                      // only the new one is added
  expect((await stored(id)).map(a => a.key)).toEqual(["uploads/attachments/k1", "uploads/attachments/k2"])
})

test("works on a ticket with NO attachments column value, preserves the existing order, and rejects bad input", async () => {
  const id = await insertFeedback({ projectId: P, observation: "empty", priority: "low" })
  expect(await appendFeedbackAttachments(id, P, [att(7)])).toBe(true)
  expect(await appendFeedbackAttachments(id, P, [att(8)])).toBe(true)
  expect((await stored(id)).map(a => a.filename)).toEqual(["f7.png", "f8.png"])
  expect(await appendFeedbackAttachments(id, P, [])).toBe(false)
  expect(await appendFeedbackAttachments("fb_does_not_exist", P, [att(9)])).toBe(false)
  expect(await appendFeedbackAttachments(id, "proj_other", [att(9)])).toBe(false)   // project-scoped
})

test("a corrupt attachments_json is treated as empty and healed by the next append", async () => {
  const id = await insertFeedback({ projectId: P, observation: "corrupt", priority: "low" })
  await rawDb.execute({ sql: "UPDATE feedback SET attachments_json=? WHERE id=?", args: ["{not json", id] })
  expect(await appendFeedbackAttachments(id, P, [att(1)])).toBe(true)
  expect((await stored(id)).length).toBe(1)
})

// ── removeFeedbackAttachment / attachmentKeyReferencedElsewhere ───────────────────────────────────────────────────────
const { removeFeedbackAttachment, attachmentKeyReferencedElsewhere } = await import("./db")

test("removeFeedbackAttachment removes exactly the entry with that key and returns it; unknown key / ticket / project → not ok", async () => {
  const id = await insertFeedback({ projectId: P, observation: "rm", priority: "low" })
  await appendFeedbackAttachments(id, P, [att(1), att(2), att(3)])
  const r = await removeFeedbackAttachment(id, P, att(2).key)
  expect(r.ok).toBe(true); expect(r.removed?.filename).toBe("f2.png")
  expect((await stored(id)).map(a => a.key)).toEqual([att(1).key, att(3).key])
  expect((await removeFeedbackAttachment(id, P, att(2).key)).ok).toBe(false)           // already gone
  expect((await removeFeedbackAttachment(id, P, "")).ok).toBe(false)
  expect((await removeFeedbackAttachment("fb_missing", P, att(1).key)).ok).toBe(false)
  expect((await removeFeedbackAttachment(id, "proj_other", att(1).key)).ok).toBe(false) // project-scoped
  expect((await stored(id)).length).toBe(2)
})
test("overlapping removals and appends all take effect (compare-and-swap, no lost update)", async () => {
  const id = await insertFeedback({ projectId: P, observation: "rm-race", priority: "low" })
  await appendFeedbackAttachments(id, P, Array.from({ length: 10 }, (_, i) => att(100 + i)))
  const ops: Promise<any>[] = []
  for (let i = 0; i < 5; i++) ops.push(removeFeedbackAttachment(id, P, att(100 + i).key))
  for (let i = 0; i < 5; i++) ops.push(appendFeedbackAttachments(id, P, [att(200 + i)]))
  const results = await Promise.all(ops)
  expect(results.every((r: any) => r === true || r?.ok === true)).toBe(true)
  expect((await stored(id)).map(a => a.key).sort()).toEqual([...Array.from({ length: 5 }, (_, i) => att(105 + i).key), ...Array.from({ length: 5 }, (_, i) => att(200 + i).key)].sort())
})
test("attachmentKeyReferencedElsewhere: true only when ANOTHER ticket holds the same storage key", async () => {
  const a = await insertFeedback({ projectId: P, observation: "ref-a", priority: "low" }), b = await insertFeedback({ projectId: P, observation: "ref-b", priority: "low" })
  await appendFeedbackAttachments(a, P, [att(301)]); await appendFeedbackAttachments(b, P, [att(301), att(302)])
  expect(await attachmentKeyReferencedElsewhere(att(301).key, a)).toBe(true)     // b also has it
  expect(await attachmentKeyReferencedElsewhere(att(302).key, a)).toBe(true)     // only b has it → "elsewhere" from a's point of view
  expect(await attachmentKeyReferencedElsewhere(att(302).key, b)).toBe(false)    // b is the only holder
  expect(await attachmentKeyReferencedElsewhere("uploads/attachments/never", a)).toBe(false)
})
