// KLA-560 — a leaf error type shared by the MCP tool handlers and the AutoSim engine. Marks an
// error as an EXPECTED, caller-facing condition (entitlement wall, IDOR guard, bad args, unknown id)
// whose message is SAFE to surface verbatim to the external AI agent. Anything that is NOT a
// ToolError is treated by the JSON-RPC layer as an unexpected internal error and opaque-ified so raw
// DB/driver/stack text never leaks. Kept dependency-free so both mcp/ and the engine can import it
// without an import cycle (mcp/tools → trails-trigger → tool-error is fine; tool-error imports nothing).
export class ToolError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ToolError"
  }
}
