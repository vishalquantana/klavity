// KLA-550 — pure JSON-RPC 2.0 dispatcher for the MCP surface. No I/O beyond calling tool handlers.
// Handles initialize / notifications/* / tools/list / tools/call. Returns a JSON-RPC response object,
// or null for notifications (no id → no reply). Tool execution errors are reported IN-BAND as
// { content, isError:true } per MCP convention; protocol errors use JSON-RPC error codes.
import { MCP_TOOLS, getTool, type McpToolCtx } from "./tools"

export const MCP_PROTOCOL_VERSION = "2025-06-18"

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
        return ok(id, { content: [{ type: "text", text: String(e?.message || e) }], isError: true })
      }
    }
    default:
      return err(id, -32601, `method not found: ${method}`)
  }
}
