// KLA-550 — JSON-RPC dispatcher unit tests. No I/O beyond the cross-project guard (which throws
// before any DB/engine work), so nothing here launches a browser/LLM drive.
import { test, expect } from "bun:test"
import { handleMcpMessage } from "./rpc"
import { MCP_TOOLS } from "./tools"

const ctx = { projectId: "proj_me" }

test("initialize returns protocol + capabilities + serverInfo", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }, ctx)
  expect(r.jsonrpc).toBe("2.0")
  expect(r.id).toBe(1)
  expect(r.result.protocolVersion).toBe("2025-06-18")
  expect(r.result.capabilities).toHaveProperty("tools")
  expect(r.result.serverInfo).toHaveProperty("name")
})

test("notifications/initialized yields no reply", async () => {
  const r = await handleMcpMessage({ jsonrpc: "2.0", method: "notifications/initialized" }, ctx)
  expect(r).toBeNull()
})

test("tools/list returns the tool descriptors", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }, ctx)
  const names = r.result.tools.map((t: any) => t.name)
  expect(names).toContain("start_authored_run")
  expect(r.result.tools[0]).toHaveProperty("inputSchema")
})

test("tools/call unknown tool → JSON-RPC error -32602", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "nope", arguments: {} } }, ctx)
  expect(r.error.code).toBe(-32602)
})

test("tools/call surfaces a handler error as isError content, not a thrown exception", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 4, method: "tools/call",
    params: { name: "get_qa_run", arguments: { project_id: "proj_other", run_id: "x" } } }, ctx)
  expect(r.result.isError).toBe(true)
  expect(r.result.content[0].type).toBe("text")
})

test("EXPECTED ToolError (cross-project project_id) is surfaced verbatim, not opaque-ified", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 6, method: "tools/call",
    params: { name: "get_qa_run", arguments: { project_id: "proj_other", run_id: "x" } } }, ctx)
  expect(r.result.isError).toBe(true)
  const text = r.result.content[0].text
  // The helpful IDOR-guard message reaches the caller; no opaque ref is emitted.
  expect(text).toMatch(/project_id does not match/)
  expect(text).not.toMatch(/internal error \(ref:/)
})

test("UNEXPECTED internal error (raw DB failure) is opaque-ified with a ref, never echoed", async () => {
  // Inject a handler that throws a raw internal error the way a DB/driver outage would.
  const tool = MCP_TOOLS.find(t => t.name === "get_qa_run")!
  const original = tool.handler
  tool.handler = async () => { throw new Error("DB connection refused at 10.0.0.5:5432") }
  try {
    const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 7, method: "tools/call",
      params: { name: "get_qa_run", arguments: { project_id: "proj_me", run_id: "x" } } }, ctx)
    expect(r.result.isError).toBe(true)
    const text = r.result.content[0].text
    expect(text).toMatch(/^internal error \(ref: [0-9a-f]{8}\)$/)
    // The raw internal text must NOT leak to the external AI agent.
    expect(text).not.toMatch(/DB connection refused/)
    expect(text).not.toMatch(/10\.0\.0\.5/)
  } finally {
    tool.handler = original
  }
})

test("unknown method → -32601", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 5, method: "bogus/method" }, ctx)
  expect(r.error.code).toBe(-32601)
})
