// KLA-550 — MCP tool registry unit tests. Pure: no browser/LLM/DB drive is launched.
// We assert the registry SHAPE and the cross-project guard (which throws before any I/O).
import { test, expect } from "bun:test"
import { MCP_TOOLS, getTool } from "./tools"

test("registry exposes the expected tools with schemas", () => {
  const names = MCP_TOOLS.map(t => t.name).sort()
  expect(names).toEqual([
    "get_authored_run", "get_qa_report", "get_qa_run",
    "list_qa_runs", "start_authored_run", "start_qa_run",
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
