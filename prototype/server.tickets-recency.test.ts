// KLA-833 — tickets perf + recency.
// (1) listTicketsPaginated must surface most-recently-ACTIVE tickets first: a brand-new ticket lands
//     at the top by created_at, and a re-reported/deduped ticket (last_seen_at bumped, created_at old)
//     is bumped back to the top instead of staying buried. Negative control included.
// (2) projectAccessAndRow returns the SAME access decision as projectAccess while fetching the project
//     row once (the hot /api/projects/:id/* block no longer double-fetches projectById).
import { test, expect } from "bun:test"
import { tmpdir } from "node:os"; import { join } from "node:path"
const file = join(tmpdir(), `klav-tkt-recency-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file; delete process.env.TURSO_AUTH_TOKEN
const dbm = await import("./lib/db")
await dbm.applySchema(dbm.db!); await dbm.migrateV2(dbm.db!)

// insertFeedback stamps created_at == last_seen_at == now; set both explicitly to simulate history.
async function setTimes(id: string, created: number, lastSeen: number) {
  await dbm.db!.execute({ sql: "UPDATE feedback SET created_at=?, last_seen_at=? WHERE id=?", args: [created, lastSeen, id] })
}

test("recency: a just-filed ticket sorts above older tickets", async () => {
  const P = `proj_rec_new_${Date.now()}`
  const old = await dbm.insertFeedback({ projectId: P, observation: "old bug", priority: "high" })
  await dbm.updateFeedbackMeta(P, old, { status: "open" })
  await setTimes(old, Date.now() - 3 * 86400_000, Date.now() - 3 * 86400_000)
  const fresh = await dbm.insertFeedback({ projectId: P, observation: "fresh bug", priority: "high" })
  await dbm.updateFeedbackMeta(P, fresh, { status: "open" })  // filed just now

  const r = await dbm.listTicketsPaginated(P, {})
  expect(r.tickets[0].id).toBe(fresh)
})

test("recency: a re-reported (last_seen_at bumped) ticket is surfaced above a newer-but-quiet ticket", async () => {
  const P = `proj_rec_bump_${Date.now()}`
  const old = await dbm.insertFeedback({ projectId: P, observation: "recurring bug", priority: "high" })
  await dbm.updateFeedbackMeta(P, old, { status: "open" })
  await setTimes(old, Date.now() - 10 * 86400_000, Date.now() - 10 * 86400_000)
  const newer = await dbm.insertFeedback({ projectId: P, observation: "newer but quiet bug", priority: "low" })
  await dbm.updateFeedbackMeta(P, newer, { status: "open" })
  await setTimes(newer, Date.now() - 2 * 86400_000, Date.now() - 2 * 86400_000)

  // Before the re-report the quiet newer ticket is on top (activity == created_at for both).
  const before = await dbm.listTicketsPaginated(P, {})
  expect(before.tickets[0].id).toBe(newer)

  // The old bug is re-reported now → last_seen_at jumps to the present (created_at stays old).
  await dbm.db!.execute({ sql: "UPDATE feedback SET last_seen_at=? WHERE id=?", args: [Date.now(), old] })
  const after = await dbm.listTicketsPaginated(P, {})
  // NEGATIVE CONTROL: under the old `ORDER BY f.created_at DESC` this FAILS (old stays buried last).
  expect(after.tickets[0].id).toBe(old)
})

test("projectAccessAndRow matches projectAccess for owner / member / viewer / non-member / missing", async () => {
  const owner = "owner@quantana.com.au"
  await dbm.ensureAccount(owner)
  // Create a project under the owner's account.
  const memberships = await dbm.membershipsFor(owner)
  const accountId = memberships[0]!.workspaceId
  const proj = await dbm.createProject(accountId, "Recency QA project", null)

  const member = "member@quantana.com.au"
  const viewer = "viewer@quantana.com.au"
  const stranger = "stranger@quantana.com.au"
  await dbm.addProjectMember(proj.id, accountId, member, "member")
  await dbm.addProjectMember(proj.id, accountId, viewer, "viewer")

  for (const email of [owner, member, viewer, stranger]) {
    const legacy = await dbm.projectAccess(email, proj.id)
    const combined = await dbm.projectAccessAndRow(email, proj.id)
    expect(combined.access).toBe(legacy)
    if (legacy) expect(combined.proj?.id).toBe(proj.id)
  }
  // Owner is admin, member is member, viewer + stranger are null.
  expect((await dbm.projectAccessAndRow(owner, proj.id)).access).toBe("admin")
  expect((await dbm.projectAccessAndRow(member, proj.id)).access).toBe("member")
  expect((await dbm.projectAccessAndRow(viewer, proj.id)).access).toBeNull()
  expect((await dbm.projectAccessAndRow(stranger, proj.id)).access).toBeNull()

  // Missing project → access null + proj null (so the caller 403s, never revealing existence).
  const missing = await dbm.projectAccessAndRow(owner, "proj_does_not_exist")
  expect(missing.access).toBeNull()
  expect(missing.proj).toBeNull()
})
