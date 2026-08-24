// KLA-550 — pure JSON-RPC 2.0 dispatcher for the MCP surface. No I/O beyond calling tool handlers.
// Handles initialize / notifications/* / tools/list / tools/call. Returns a JSON-RPC response object,
// or null for notifications (no id → no reply). Tool execution errors are reported IN-BAND as
// { content, isError:true } per MCP convention; protocol errors use JSON-RPC error codes.
import { MCP_TOOLS, getTool, type McpToolCtx } from "./tools"
import { ToolError } from "./tool-error"
import { reportError } from "../error-alert"

export const MCP_PROTOCOL_VERSION = "2025-06-18"

// Mirror of server.ts `oops()` for the MCP surface: never echo raw internal exception text
// (DB/driver errors, stack traces) to the external AI agent. Log it server-side with a short
// correlation id and hand back only that id so a user can quote it for support without leaking
// internals. ToolError (expected/entitlement/validation) is surfaced verbatim by the caller — this
// is only for UNEXPECTED errors.
function mcpOops(e: unknown, label: string): string {
  const id = crypto.randomUUID().slice(0, 8)
  const message = (e as any)?.message || String(e) || "unknown error"
  console.error(`[${label} ${id}]`, message)
  void reportError({ where: "backend", message, traceId: id, route: label, stack: (e as any)?.stack })
  return `internal error (ref: ${id})`
}

const ok = (id: any, result: any) => ({ jsonrpc: "2.0", id, result })
const err = (id: any, code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } })

export async function handleMcpMessage(msg: any, ctx: McpToolCtx): Promise<object | null> {
  const { id, method, params } = msg || {}
  // Notifications (no id) get no reply.
  if (id === undefined || id === null) {
    return null
  }
  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "klavity-autosim", version: "1" },
      })
    case "tools/list":
      return ok(id, { tools: MCP_TOOLS.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) })
    case "tools/call": {
      const name = params?.name
      const tool = getTool(name)
      if (!tool) return err(id, -32602, `unknown tool: ${name}`)
      try {
        const out = await tool.handler(params?.arguments || {}, ctx)
        return ok(id, { content: [{ type: "text", text: JSON.stringify(out) }] })
      } catch (e: any) {
        // MCP convention: tool execution errors are reported in-band (isError), not as protocol errors.
        // Expected ToolErrors (entitlement wall, IDOR guard, bad args, unknown id) carry a helpful,
        // caller-safe message and are surfaced verbatim. Everything else is an UNEXPECTED internal
        // error (DB/driver outage, bug) — opaque-ify it so raw internals never reach the AI agent.
        const text = e instanceof ToolError
          ? String(e.message || "tool error")
          : mcpOops(e, `mcp-tools-call:${name}`)
        return ok(id, { content: [{ type: "text", text }], isError: true })
      }
    }
    default:
      return err(id, -32601, `method not found: ${method}`)
  }
}
