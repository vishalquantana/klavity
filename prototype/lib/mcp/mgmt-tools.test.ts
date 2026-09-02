// Management MCP tool registry unit tests. Pure: the db layer is stubbed via mock.module (registered
// BEFORE ./mgmt-tools is imported so the handlers bind the stubs). Covers the registry shape, the
// account-scope/IDOR guard (get_project on a cross-account id throws "not found"), the owner/admin role
// gate on create_project/invite_member, and the happy-path create/list.
import { test, expect, mock } from "bun:test"

const calls: any = { created: null, invited: null }
mock.module("../db", () => ({
  createProject: async (accountId: string, name: string, siteUrl: string | null) => {
    calls.created = { accountId, name, siteUrl }
    return { id: "proj_new_1", accountId, name, status: "active", createdAt: 1 }
  },
  listProjectsForAccount: async (accountId: string) => {
    if (accountId !== "acct_me") return []
    return [{ id: "proj_a", accountId, name: "Alpha", status: "active", createdAt: 10 }]
  },
  projectById: async (pid: string) => {
    if (pid === "proj_a") return { id: "proj_a", accountId: "acct_me", name: "Alpha", status: "active", createdAt: 10 }
    if (pid === "proj_other") return { id: "proj_other", accountId: "acct_other", name: "Other", status: "active", createdAt: 11 }
    return null
  },
  addProjectMember: async (pid: string, accountId: string, email: string, role: string, invitedBy: string) => {
    calls.invited = { pid, accountId, email, role, invitedBy }
  },
  accountMembersRaw: async (accountId: string) => [{ email: "owner@test.local", role: "owner" }],
  membersOfProject: async (_pid: string) => [{ email: "owner@test.local", role: "admin", createdAt: 1 }],
}))

import { MGMT_TOOLS, getMgmtTool } from "./mgmt-tools"

const ADMIN_CTX = { accountId: "acct_me", email: "owner@test.local", role: "owner" }
const MEMBER_CTX = { accountId: "acct_me", email: "member@test.local", role: "member" }

test("registry exposes the expected management tools with schemas", () => {
  const names = MGMT_TOOLS.map((t) => t.name).sort()
  expect(names).toEqual(["create_project", "get_project", "invite_member", "list_members", "list_projects"])
  for (const t of MGMT_TOOLS) {
    expect(typeof t.description).toBe("string")
    expect(t.inputSchema).toHaveProperty("type", "object")
  }
})

test("list_projects returns only the token account's projects", async () => {
  const out = await getMgmtTool("list_projects")!.handler({}, ADMIN_CTX)
  expect(out.projects.map((p: any) => p.id)).toEqual(["proj_a"])
  expect(out.projects[0]).toEqual({ id: "proj_a", name: "Alpha", status: "active", created_at: 10 })
})

test("create_project (owner/admin) creates in the token account and returns id+name", async () => {
  const out = await getMgmtTool("create_project")!.handler({ name: "Beta", site_url: "https://beta.example.com" }, ADMIN_CTX)
  expect(out.project).toEqual({ id: "proj_new_1", name: "Beta" })
  expect(calls.created).toEqual({ accountId: "acct_me", name: "Beta", siteUrl: "https://beta.example.com" })
})

test("create_project rejects a non-admin role (403 equivalent)", async () => {
  await expect(getMgmtTool("create_project")!.handler({ name: "Nope" }, MEMBER_CTX)).rejects.toThrow(/owner|admin/i)
})

test("create_project rejects a bad site_url", async () => {
  await expect(getMgmtTool("create_project")!.handler({ name: "X", site_url: "ftp://bad" }, ADMIN_CTX)).rejects.toThrow(/site_url/i)
})

test("get_project 404s (throws not found) on a cross-account project id (IDOR guard)", async () => {
  await expect(getMgmtTool("get_project")!.handler({ project_id: "proj_other" }, ADMIN_CTX)).rejects.toThrow(/not found/i)
})

test("get_project returns detail for an owned project", async () => {
  const out = await getMgmtTool("get_project")!.handler({ project_id: "proj_a" }, ADMIN_CTX)
  expect(out.id).toBe("proj_a")
  expect(out.members_count).toBe(1)
})

test("invite_member (owner/admin) adds a member to an owned project", async () => {
  const out = await getMgmtTool("invite_member")!.handler({ project_id: "proj_a", email: "New@Test.Local", role: "admin" }, ADMIN_CTX)
  expect(out).toEqual({ ok: true })
  expect(calls.invited).toEqual({ pid: "proj_a", accountId: "acct_me", email: "new@test.local", role: "admin", invitedBy: "owner@test.local" })
})

test("invite_member IDOR: a cross-account project id throws not found before any write", async () => {
  calls.invited = null
  await expect(getMgmtTool("invite_member")!.handler({ project_id: "proj_other", email: "x@test.local" }, ADMIN_CTX)).rejects.toThrow(/not found/i)
  expect(calls.invited).toBeNull()
})

test("invite_member rejects a non-admin role", async () => {
  await expect(getMgmtTool("invite_member")!.handler({ project_id: "proj_a", email: "x@test.local" }, MEMBER_CTX)).rejects.toThrow(/owner|admin/i)
})

test("list_members returns the account roster with native roles", async () => {
  const out = await getMgmtTool("list_members")!.handler({}, ADMIN_CTX)
  expect(out.members).toEqual([{ email: "owner@test.local", role: "owner" }])
})

// ── QA C2-1: create_project enforces the injected project quota (parity with REST). ──
test("C2-1: create_project throws when the injected quota check is over-limit", async () => {
  calls.created = null
  const ctx = { ...ADMIN_CTX, checkProjectQuota: async () => ({ error: "Project limit reached on your plan." }) }
  await expect(getMgmtTool("create_project")!.handler({ name: "Over Quota" }, ctx)).rejects.toThrow(/limit reached/i)
  expect(calls.created).toBeNull() // never created when over quota
})
test("C2-1: create_project proceeds when the quota check returns null", async () => {
  const ctx = { ...ADMIN_CTX, checkProjectQuota: async () => null }
  const out = await getMgmtTool("create_project")!.handler({ name: "Under Quota" }, ctx)
  expect(out.project.id).toBe("proj_new_1")
})

// ── QA C3-2: invite_member rejects malformed emails (was: any string with '@'). ──
test("C3-2: invite_member rejects a malformed email", async () => {
  calls.invited = null
  await expect(getMgmtTool("invite_member")!.handler({ project_id: "proj_a", email: "a@" }, ADMIN_CTX)).rejects.toThrow(/valid email/i)
  expect(calls.invited).toBeNull()
})
