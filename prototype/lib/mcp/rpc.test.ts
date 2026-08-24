// KLA-550 — JSON-RPC dispatcher unit tests. No I/O beyond the cross-project guard (which throws
// before any DB/engine work), so nothing here launches a browser/LLM drive.
import { test, expect } from "bun:test"
import { handleMcpMessage } from "./rpc"

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

test("unknown method → -32601", async () => {
  const r: any = await handleMcpMessage({ jsonrpc: "2.0", id: 5, method: "bogus/method" }, ctx)
  expect(r.error.code).toBe(-32601)
})
