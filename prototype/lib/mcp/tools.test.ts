// KLA-550 — MCP tool registry unit tests. Pure: no browser/LLM/DB drive is launched.
// We assert the registry SHAPE and the cross-project guard (which throws before any I/O).
//
// The C2-2 hook tests below stub the db layer via mock.module (registered BEFORE ./tools is imported
// so the tool handlers bind the stubs, not the real Turso client) and assert the injected side-effect
// hooks fire after the DB writes. Neg-control: without ctx.hooks?.onX() calls in the tools, the
// spies below never flip to true.
import { test, expect, mock } from "bun:test"

const dbCalls: any = {}
mock.module("../db", () => ({
  insertFeedback: async () => "fb_hooktest_1",
  updateFeedbackMeta: async () => true,
  insertActivity: async () => {},
  feedbackById: async () => ({ id: "fb_hooktest_1", projectId: "proj_me", status: "new", priority: "medium", assignee: null, createdAt: 1 }),
  projectAccess: async () => null, // assignee is treated as a NON-member; actor access must come from ctx.access
  effectiveTicketTitle: (row: any) => String(row?.title || "Untitled"),
  listTicketsPaginated: async () => ({ tickets: [], total: 0, page: 1, totalPages: 1 }),
  labelsForFeedbackBatch: async () => ({}),
  labelsForFeedback: async () => [],
  listTicketComments: async () => [],
  insertTicketComment: async () => ({ id: "c_hooktest_1", author: null, body: "x", createdAt: 1 }),
  ticketActivityTimeline: async () => [],
}))
void dbCalls

import { MCP_TOOLS, getTool } from "./tools"

test("registry exposes the expected tools with schemas", () => {
  const names = MCP_TOOLS.map(t => t.name).sort()
  expect(names).toEqual([
    "add_comment", "create_ticket",
    "get_authored_run", "get_qa_report", "get_qa_run", "get_ticket", "get_ticket_activity",
    "list_comments", "list_qa_runs", "list_tickets",
    "start_authored_run", "start_qa_run", "update_ticket",
  ])
  for (const t of MCP_TOOLS) {
    expect(typeof t.description).toBe("string")
    expect(t.inputSchema).toHaveProperty("type", "object")
  }
})

test("start_qa_run rejects a project_id that mismatches the token ctx", async () => {
  const tool = getTool("start_qa_run")!
  await expect(tool.handler({ project_id: "proj_other", trail_id: "t1" }, { projectId: "proj_me" }))
    .rejects.toThrow(/project/i)
})

// ── C2-2: MCP mutations fire the same side effects as REST, via the injected ctx.hooks. ──

test("C2-2: create_ticket invokes ctx.hooks.onTicketCreated after the DB write", async () => {
  let created: any = null
  const ctx = {
    projectId: "proj_me", email: "me@test.local", access: "admin" as const,
    hooks: { onTicketCreated: (fid: string, info: any) => { created = { fid, info } } },
  }
  const out = await getTool("create_ticket")!.handler(
    { project_id: "proj_me", title: "Bug X", assignee: "assignee@test.local", priority: "high" }, ctx,
  )
  expect(out.ticket_id).toBe("fb_hooktest_1")
  expect(created).toBeTruthy()
  expect(created.fid).toBe("fb_hooktest_1")
  expect(created.info.priority).toBe("high")
  expect(created.info.assignee).toBe("assignee@test.local")
})

test("C2-2: update_ticket new→open invokes ctx.hooks.onTicketUpdated with prevRow + meta", async () => {
  let updated: any = null
  const ctx = {
    projectId: "proj_me", email: "me@test.local", access: "admin" as const,
    hooks: { onTicketUpdated: (fid: string, info: any) => { updated = { fid, info } } },
  }
  const out = await getTool("update_ticket")!.handler(
    { project_id: "proj_me", ticket_id: "fb_hooktest_1", status: "open" }, ctx,
  )
  expect(out.ok).toBe(true)
  expect(updated).toBeTruthy()
  expect(updated.fid).toBe("fb_hooktest_1")
  expect(updated.info.meta.status).toBe("open")
  expect(updated.info.prevRow.status).toBe("new")
})

test("C2-2: add_comment invokes ctx.hooks.onTicketComment after insert", async () => {
  let commented: any = null
  const ctx = {
    projectId: "proj_me", email: "me@test.local", access: "member" as const,
    hooks: { onTicketComment: (fid: string, text: string, cid: string) => { commented = { fid, text, cid } } },
  }
  await getTool("add_comment")!.handler(
    { project_id: "proj_me", ticket_id: "fb_hooktest_1", body: "repro on staging" }, ctx,
  )
  expect(commented).toBeTruthy()
  expect(commented.fid).toBe("fb_hooktest_1")
  expect(commented.text).toBe("repro on staging")
  expect(commented.cid).toBe("c_hooktest_1")
})

// ── C1-1 defense-in-depth: the assign guard is driven by the ACTOR's ctx.access, not a fresh lookup.
// A null-access actor (revoked member — the /mcp entrypoint already 403s this) cannot assign a
// non-member; an admin actor can. Neg-control: reverting create_ticket to `await projectAccess(me)`
// would make BOTH cases depend on the assignee lookup instead of the actor. ──
test("C1-1: create_ticket with null actor access cannot assign a non-member", async () => {
  const ctx = { projectId: "proj_me", email: "me@test.local", access: null }
  await expect(getTool("create_ticket")!.handler(
    { project_id: "proj_me", title: "T", assignee: "nonmember@test.local" }, ctx as any,
  )).rejects.toThrow(/admin/i)
})

test("C1-1: create_ticket with admin actor access can assign a non-member", async () => {
  const ctx = { projectId: "proj_me", email: "me@test.local", access: "admin" as const }
  const out = await getTool("create_ticket")!.handler(
    { project_id: "proj_me", title: "T", assignee: "nonmember@test.local" }, ctx,
  )
  expect(out.ticket_id).toBe("fb_hooktest_1")
})

// ── QA round-2 C3: null actor access cannot assign even an EXISTING member (canAssignV1 short-circuits
// on null access BEFORE the assignee lookup). Neg-control: without the `if (!actorAccess) return false`
// guard, the assignee membership lookup would let this succeed. ──
test("C3: create_ticket with null actor access cannot assign an in-project member", async () => {
  const ctx = { projectId: "proj_me", email: "removed@test.local", access: null }
  await expect(getTool("create_ticket")!.handler(
    { project_id: "proj_me", title: "T", assignee: "member@test.local" }, ctx as any,
  )).rejects.toThrow(/admin/i)
})

// ── QA round-2 C2: a side-effect hook that THROWS must not fail an already-committed mutation. ──
test("C2: create_ticket succeeds even when onTicketCreated hook throws", async () => {
  const ctx = {
    projectId: "proj_me", email: "me@test.local", access: "admin" as const,
    hooks: { onTicketCreated: () => { throw new Error("boom") } },
  }
  const out = await getTool("create_ticket")!.handler(
    { project_id: "proj_me", title: "Bug", assignee: "assignee@test.local", priority: "low" }, ctx,
  )
  expect(out.ticket_id).toBe("fb_hooktest_1")
})
