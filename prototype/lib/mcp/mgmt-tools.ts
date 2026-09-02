// Management MCP tool registry (account-scoped, kma_ token). Distinct from ./tools (the project-scoped
// AutoSim/ticket surface behind /mcp). These tools wrap the SAME db fns the management REST API calls
// (/api/v1/projects, /api/v1/members) — no HTTP round-trip — and enforce the SAME account-scope, IDOR,
// and role checks. Dispatched via the shared JSON-RPC handler in ./rpc with { tools: MGMT_TOOLS }.
import {
  createProject, listProjectsForAccount, projectById, addProjectMember,
  accountMembersRaw, membersOfProject,
} from "../db"
import { normalizeV1Assignee } from "../v1-tickets"
import { ToolError } from "./tool-error"
export { ToolError }

// Ctx is resolved by the server.ts /api/v1/mcp-admin entrypoint via resolveMgmtToken (kma_ bearer →
// getExtensionTokenInfo → live accountRole re-check). role is the RAW account_role (owner|admin|member).
// checkProjectQuota is injected by the server.ts /api/v1/mcp-admin entrypoint so create_project enforces
// the SAME flag-gated project quota as REST POST /api/v1/projects (the quota fn lives in server.ts and
// can't be imported into this lib without a cycle). Returns {error} when over quota, else null.
export interface MgmtToolCtx { accountId: string; email: string; role: string; checkProjectQuota?: () => Promise<{ error: string } | null> }
export interface MgmtTool {
  name: string
  description: string
  inputSchema: object
  handler(args: any, ctx: MgmtToolCtx): Promise<any>
}

// Only owners/admins may create projects or invite members (mirrors the REST 403 gate).
function requireAdmin(ctx: MgmtToolCtx) {
  if (ctx.role !== "owner" && ctx.role !== "admin") {
    throw new ToolError("Only account owners/admins can perform this action.")
  }
}

// Load a project and enforce it belongs to the token's account. Returns the project or throws the SAME
// opaque "not found" a REST 404 would (never leak that a cross-account project id exists).
async function loadOwnedProject(projectId: string, ctx: MgmtToolCtx) {
  const p = await projectById(projectId).catch(() => null)
  if (!p || p.accountId !== ctx.accountId) throw new ToolError("Project not found.")
  return p
}

export const MGMT_TOOLS: MgmtTool[] = [
  {
    name: "list_projects",
    description: "List every project in the authenticated account. Returns id, name, status, created_at.",
    inputSchema: { type: "object", properties: {} },
    async handler(_args, ctx) {
      const projects = await listProjectsForAccount(ctx.accountId)
      return { projects: projects.map((p) => ({ id: p.id, name: p.name, status: p.status, created_at: p.createdAt })) }
    },
  },
  {
    name: "create_project",
    description: "Create a new project in the account (owner/admin only). Args: name (required), site_url (optional http(s) URL).",
    inputSchema: { type: "object", required: ["name"], properties: {
      name: { type: "string" }, site_url: { type: "string" } } },
    async handler(args, ctx) {
      requireAdmin(ctx)
      const name = String(args?.name || "").trim()
      if (!name) throw new ToolError("name is required")
      if (name.length > 120) throw new ToolError("name must be 120 chars or fewer")
      let siteUrl: string | null = null
      if (args?.site_url) {
        const raw = String(args.site_url).trim()
        if (raw) {
          if (raw.length > 500 || !/^https?:\/\//i.test(raw)) throw new ToolError("site_url must be an http(s) URL (max 500 chars)")
          try { new URL(raw) } catch { throw new ToolError("site_url is not a valid URL") }
          siteUrl = raw
        }
      }
      // C2-1 parity: enforce the flag-gated project quota the REST route enforces (injected by server.ts).
      if (ctx.checkProjectQuota) {
        const q = await ctx.checkProjectQuota()
        if (q) throw new ToolError(q.error)
      }
      const created = await createProject(ctx.accountId, name, siteUrl)
      return { project: { id: created.id, name: created.name } }
    },
  },
  {
    name: "get_project",
    description: "Get a single project's detail. Args: project_id. 404s (not found) if the project is not in the token's account.",
    inputSchema: { type: "object", required: ["project_id"], properties: { project_id: { type: "string" } } },
    async handler(args, ctx) {
      const pid = String(args?.project_id || "")
      if (!pid) throw new ToolError("project_id is required")
      const p = await loadOwnedProject(pid, ctx)
      const members = await membersOfProject(p.id).catch(() => [])
      return { id: p.id, name: p.name, status: p.status, created_at: p.createdAt, members_count: members.length }
    },
  },
  {
    name: "invite_member",
    description: "Invite a member to a project (owner/admin only). Args: project_id, email, role (admin|member, default member).",
    inputSchema: { type: "object", required: ["project_id", "email"], properties: {
      project_id: { type: "string" }, email: { type: "string" }, role: { type: "string", enum: ["admin", "member"] } } },
    async handler(args, ctx) {
      requireAdmin(ctx)
      const pid = String(args?.project_id || "")
      if (!pid) throw new ToolError("project_id is required")
      const p = await loadOwnedProject(pid, ctx)
      // C3-2: real email validation (regex + length cap), shared with the REST invite route.
      const rawEmail = String(args?.email || "").trim()
      const email = rawEmail.length <= 254 ? normalizeV1Assignee(rawEmail) : ""
      if (!email) throw new ToolError("a valid email is required")
      const role = args?.role === "admin" ? "admin" : "member"
      await addProjectMember(p.id, ctx.accountId, email, role, ctx.email)
      return { ok: true }
    },
  },
  {
    name: "list_members",
    description: "List the account's members. Returns email + account role (owner|admin|member).",
    inputSchema: { type: "object", properties: {} },
    async handler(_args, ctx) {
      const members = await accountMembersRaw(ctx.accountId)
      return { members }
    },
  },
]

export function getMgmtTool(name: string): MgmtTool | undefined {
  return MGMT_TOOLS.find((t) => t.name === name)
}
