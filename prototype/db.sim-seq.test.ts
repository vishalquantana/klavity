// KD-3082: Sim Reports are shown as <KEY>-SIM-<n> to tell them apart from manually created / widget tickets (<KEY>-<n>).
//   • While waiting in Sim Reports, n is the Sim Report's OWN per-project count (sim_seq_num ← projects.sim_ticket_seq).
//   • When a person ACCEPTS it, it takes the next number of the Tickets sequence (seq_num ← projects.ticket_seq) and shows
//     <KEY>-SIM-<ticket number> on the Tickets board, sorting in one sequence with manual / widget tickets.
// Covers: independent counts, number-on-accept, pretty path + resolver, and the legacy backfill.
import { test, expect } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-simseq-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const m = await import("./lib/db")
const { db, applySchema, migrateV2, ensureAccount, createProject, insertFeedback, resolveWorkspaceTicket, prettyTicketPath, projectAliasInfo, backfillSimSeq, updateFeedbackMeta, assignTicketSeqOnAccept } = m as any

await applySchema(db!); await migrateV2(db!)

const nums = async (id: string) => {
  const r = await db!.execute({ sql: "SELECT seq_num, sim_seq_num FROM feedback WHERE id=?", args: [id] })
  const x = r.rows[0] as any
  return { seq: x.seq_num == null ? null : Number(x.seq_num), sim: x.sim_seq_num == null ? null : Number(x.sim_seq_num) }
}

test("schema: sim_seq_num / sim_ticket_seq columns + unique index exist", async () => {
  const fCols = new Set((await db!.execute("PRAGMA table_info(feedback)")).rows.map((r: any) => String(r.name)))
  expect(fCols.has("sim_seq_num")).toBe(true)
  const pCols = new Set((await db!.execute("PRAGMA table_info(projects)")).rows.map((r: any) => String(r.name)))
  expect(pCols.has("sim_ticket_seq")).toBe(true)
  const idx = new Set((await db!.execute("SELECT name FROM sqlite_master WHERE type='index'")).rows.map((r: any) => String(r.name)))
  expect(idx.has("feedback_proj_simseq_uidx")).toBe(true)
})

test("waiting Sim Reports use their own count and never consume Tickets numbers", async () => {
  const acc = (await ensureAccount("simseq-owner@test.local"))[0].workspaceId
  const proj = await createProject(acc, "Payments")
  const t1 = await insertFeedback({ projectId: proj.id, observation: "manual 1", source: "manual" })
  const s1 = await insertFeedback({ projectId: proj.id, simId: "sim_a", observation: "sim 1" })
  const s2 = await insertFeedback({ projectId: proj.id, simId: "sim_a", observation: "sim 2" })
  const t2 = await insertFeedback({ projectId: proj.id, observation: "widget 2", source: "widget" })

  expect(await nums(t1)).toEqual({ seq: 1, sim: null })
  expect(await nums(t2)).toEqual({ seq: 2, sim: null })   // no gap from the two waiting Sim Reports
  expect(await nums(s1)).toEqual({ seq: null, sim: 1 })   // KEY-SIM-1 in Sim Reports
  expect(await nums(s2)).toEqual({ seq: null, sim: 2 })   // KEY-SIM-2 in Sim Reports

  const info = await projectAliasInfo(proj.id)
  expect(info.ticketKey).toBeTruthy()
  expect(await prettyTicketPath({ id: t2, projectId: proj.id })).toBe(`/${info.slug}/${info.ticketKey}-2`)
  expect(await prettyTicketPath({ id: s2, projectId: proj.id })).toBe(`/${info.slug}/${info.ticketKey}-SIM-2`)
  expect((await resolveWorkspaceTicket(info.slug, `${info.ticketKey}-2`))?.id).toBe(t2)
  expect((await resolveWorkspaceTicket(info.slug, `${String(info.ticketKey).toLowerCase()}-sim-1`))?.id).toBe(s1)
  expect(await resolveWorkspaceTicket(info.slug, `${info.ticketKey}-SIM-99`)).toBeNull()
  expect(await resolveWorkspaceTicket(info.slug, `${info.ticketKey}-3`)).toBeNull()
})

test("accepting a Sim Report gives it the UPCOMING Tickets number → KEY-SIM-<ticket number>", async () => {
  const acc = (await ensureAccount("simseq-accept@test.local"))[0].workspaceId
  const proj = await createProject(acc, "Accept")
  const t1 = await insertFeedback({ projectId: proj.id, observation: "manual 1", source: "manual" })
  const s1 = await insertFeedback({ projectId: proj.id, simId: "sim_a", observation: "sim 1" })
  const s2 = await insertFeedback({ projectId: proj.id, simId: "sim_a", observation: "sim 2" })
  const t2 = await insertFeedback({ projectId: proj.id, observation: "manual 2", source: "manual" })
  expect(await nums(t2)).toEqual({ seq: 2, sim: null })

  // Dismissing keeps it waiting — no Tickets number consumed.
  expect(await updateFeedbackMeta(proj.id, s1, { status: "dismissed" })).toBe(true)
  expect(await nums(s1)).toEqual({ seq: null, sim: 1 })

  // Accept: takes the next Tickets number (3); its Sim Reports count is kept.
  expect(await updateFeedbackMeta(proj.id, s2, { status: "open" })).toBe(true)
  expect(await nums(s2)).toEqual({ seq: 3, sim: 2 })
  // Re-accept after dismissal continues the Tickets sequence.
  expect(await updateFeedbackMeta(proj.id, s1, { status: "open" })).toBe(true)
  expect(await nums(s1)).toEqual({ seq: 4, sim: 1 })
  // The next manual ticket continues after the accepted Sim Reports — one sequence, no duplicates.
  const t3 = await insertFeedback({ projectId: proj.id, observation: "manual 3", source: "manual" })
  expect(await nums(t3)).toEqual({ seq: 5, sim: null })

  // Later status changes never renumber; non-Sim rows are untouched.
  await updateFeedbackMeta(proj.id, s2, { status: "in_progress" })
  await updateFeedbackMeta(proj.id, s2, { status: "done" })
  expect(await nums(s2)).toEqual({ seq: 3, sim: 2 })
  expect(await assignTicketSeqOnAccept(proj.id, t1)).toBe(1)

  // Links: accepted → KEY-SIM-<ticket number>; it also resolves from KEY-3 and from its old waiting link.
  const info = await projectAliasInfo(proj.id)
  expect(await prettyTicketPath({ id: s2, projectId: proj.id })).toBe(`/${info.slug}/${info.ticketKey}-SIM-3`)
  expect((await resolveWorkspaceTicket(info.slug, `${info.ticketKey}-SIM-3`))?.id).toBe(s2)
  expect((await resolveWorkspaceTicket(info.slug, `${info.ticketKey}-3`))?.id).toBe(s2)
  expect((await resolveWorkspaceTicket(info.slug, `${info.ticketKey}-SIM-2`))?.id).toBe(s2)   // old waiting link

  // A waiting Sim Report keeps its own count.
  const s3 = await insertFeedback({ projectId: proj.id, simId: "sim_b", observation: "sim 3" })
  expect(await nums(s3)).toEqual({ seq: null, sim: 3 })
  expect(await prettyTicketPath({ id: s3, projectId: proj.id })).toBe(`/${info.slug}/${info.ticketKey}-SIM-3`)
  // KEY-SIM-3 now names both the accepted s2 (Tickets #3) and the waiting s3 — the accepted ticket wins.
  expect((await resolveWorkspaceTicket(info.slug, `${info.ticketKey}-SIM-3`))?.id).toBe(s2)
})

test("backfill: legacy Sim Reports get their own count 1..N and keep their Tickets number; accept keeps it", async () => {
  const acc = (await ensureAccount("simseq-legacy@test.local"))[0].workspaceId
  const proj = await createProject(acc, "Legacy")
  // Pre-KD-3082 rows: sims numbered from the Tickets counter, no sim_seq_num.
  const ids: string[] = []
  for (let i = 1; i <= 4; i++) {
    const id = "fb_legacy_" + i
    ids.push(id)
    await db!.execute({
      sql: "INSERT INTO feedback (id, project_id, sim_id, observation, created_at, status, seq_num) VALUES (?,?,?,?,?,?,?)",
      args: [id, proj.id, i % 2 === 0 ? "sim_old" : null, "legacy " + i, 1000 + i, "new", i],
    })
  }
  await db!.execute({ sql: "UPDATE projects SET ticket_seq=4 WHERE id=?", args: [proj.id] })
  await db!.execute({ sql: "DELETE FROM schema_migrations WHERE key='sim_seq_backfill_2026_11_16'" })
  await backfillSimSeq(db!)

  expect(await nums(ids[0])).toEqual({ seq: 1, sim: null })
  expect(await nums(ids[1])).toEqual({ seq: 2, sim: 1 })
  expect(await nums(ids[3])).toEqual({ seq: 4, sim: 2 })
  const info = await projectAliasInfo(proj.id)
  expect(await prettyTicketPath({ id: ids[1], projectId: proj.id })).toBe(`/${info.slug}/${info.ticketKey}-SIM-1`)   // waiting
  await updateFeedbackMeta(proj.id, ids[1], { status: "open" })
  expect(await nums(ids[1])).toEqual({ seq: 2, sim: 1 })   // already had a Tickets number — kept
  expect(await prettyTicketPath({ id: ids[1], projectId: proj.id })).toBe(`/${info.slug}/${info.ticketKey}-SIM-2`)

  // New reports continue each sequence.
  const s = await insertFeedback({ projectId: proj.id, simId: "sim_new", observation: "new sim" })
  const t = await insertFeedback({ projectId: proj.id, observation: "new ticket", source: "manual" })
  expect(await nums(s)).toEqual({ seq: null, sim: 3 })
  expect(await nums(t)).toEqual({ seq: 5, sim: null })
})
