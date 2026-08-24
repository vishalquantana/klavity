# Klavity AutoSim — MCP server

Endpoint: `POST https://klavity.in/mcp` (JSON-RPC 2.0, Streamable HTTP).
Auth: `Authorization: Bearer <kci_ token>` (mint via `POST /api/ci/token`).

The server answers each POST with a single `application/json` JSON-RPC response (no SSE).
It implements `initialize`, `notifications/initialized`, `tools/list`, and `tools/call`.
Protocol version: `2025-06-18`. Every tool is scoped to the token's project — a `project_id`
argument that does not match the token's project is rejected in-band (`isError: true`).

## Claude Code / Cursor config

```json
{ "mcpServers": { "klavity": {
  "url": "https://klavity.in/mcp",
  "headers": { "Authorization": "Bearer kci_YOUR_TOKEN" } } } }
```

## Tools

- `start_qa_run { project_id, trail_id }` → `{ run_id }`
- `start_authored_run { project_id, target_url, objective }` → `{ authored_run_id }`
- `get_qa_run { project_id, run_id }` → status/verdict
- `get_qa_report { project_id, run_id, cursor? }` → structured issues
- `get_authored_run { project_id, authored_run_id }` → trail_id + verification_run_id when complete
- `list_qa_runs { project_id }` → recent runs
