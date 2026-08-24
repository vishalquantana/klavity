// KLA-550 — MCP tool registry. Each tool wraps the SAME lib functions the v1 REST routes call
// (no HTTP round-trip). Every tool is scoped to the authenticated token's project via requireProject.
// One responsibility: define + execute tools; the JSON-RPC framing lives in ./rpc.
import { runWalkNow } from "../trails-trigger"
import { runAuthorNow, getAuthorSession } from "../trails-author"
import { getWalk, listRecentWalks } from "../trails"
import { buildV1RunStatus, buildV1Report } from "../v1-runs"
import { buildAuthoredRunStatus } from "../v1-authored"

export interface McpToolCtx { projectId: string }
export interface McpTool {
  name: string
  description: string
  inputSchema: object
  handler(args: any, ctx: McpToolCtx): Promise<any>
}

// The token's project is authoritative. A tool arg `project_id` must match it (IDOR guard) — this
// throws BEFORE any I/O, so a cross-project call never touches the DB or engine.
function requireProject(args: any, ctx: McpToolCtx): string {
  const p = String(args?.project_id || "")
  if (!p) throw new Error("project_id is required")
  if (p !== ctx.projectId) throw new Error("project_id does not match the authenticated token's project")
  return p
}

export const MCP_TOOLS: McpTool[] = [
  {
    name: "start_qa_run",
    description: "Start an AutoSim walk of an existing Trail. Returns a run_id immediately; poll get_qa_run.",
    inputSchema: { type: "object", required: ["project_id", "trail_id"], properties: {
      project_id: { type: "string" }, trail_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const trailId = String(args.trail_id || "")
      if (!trailId) throw new Error("trail_id is required")
      const { runId } = await runWalkNow(project, trailId)
      return { run_id: runId, status: "queued" }
    },
  },
  {
    name: "start_authored_run",
    description: "Start an objective-driven AutoSim: give a URL + natural-language objective, no pre-authored Trail. Returns an authored_run_id; poll get_authored_run.",
    inputSchema: { type: "object", required: ["project_id", "target_url", "objective"], properties: {
      project_id: { type: "string" }, target_url: { type: "string" }, objective: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const objective = String(args.objective || "").trim()
      const baseUrl = String(args.target_url || "").trim()
      if (objective.length < 10) throw new Error("objective must be at least 10 chars")
      if (!/^https?:\/\//i.test(baseUrl)) throw new Error("target_url must be an http(s) URL")
      const { sessionId } = await runAuthorNow(project, { name: objective.slice(0, 80), objective, baseUrl } as any)
      return { authored_run_id: sessionId, status: "authoring" }
    },
  },
  {
    name: "get_qa_run",
    description: "Get the status/verdict of an AutoSim run by run_id.",
    inputSchema: { type: "object", required: ["project_id", "run_id"], properties: {
      project_id: { type: "string" }, run_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const walk = await getWalk(project, String(args.run_id || ""))
      if (!walk) throw new Error("unknown run_id")
      return await buildV1RunStatus(project, walk, null)
    },
  },
  {
    name: "get_qa_report",
    description: "Fetch the structured, AI-consumable bug report for a completed run. Paginated via cursor.",
    inputSchema: { type: "object", required: ["project_id", "run_id"], properties: {
      project_id: { type: "string" }, run_id: { type: "string" }, cursor: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const walk = await getWalk(project, String(args.run_id || ""))
      if (!walk) throw new Error("unknown run_id")
      return await buildV1Report(project, walk, { baseUrl: "", cursor: args.cursor ?? null })
    },
  },
  {
    name: "get_authored_run",
    description: "Get the status of an objective-driven authored run (its trail_id + verification_run_id once it completes).",
    inputSchema: { type: "object", required: ["project_id", "authored_run_id"], properties: {
      project_id: { type: "string" }, authored_run_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const s = await getAuthorSession(project, String(args.authored_run_id || ""))
      if (!s) throw new Error("unknown authored_run_id")
      return buildAuthoredRunStatus(s)
    },
  },
  {
    name: "list_qa_runs",
    description: "List recent AutoSim runs for the project.",
    inputSchema: { type: "object", required: ["project_id"], properties: { project_id: { type: "string" } } },
    async handler(args, ctx) {
      const project = requireProject(args, ctx)
      const walks = await listRecentWalks(project)
      const runs = await Promise.all(walks.map(w => buildV1RunStatus(project, w, null)))
      return { runs }
    },
  },
]

export function getTool(name: string): McpTool | undefined {
  return MCP_TOOLS.find(t => t.name === name)
}
