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

### Tickets (bugs/reports)

- `list_tickets { project_id, status?, priority?, assignee?, source?, label?, q?, page?, limit? }` → `{ tickets, total, page, limit }`
- `get_ticket { project_id, ticket_id }` → single ticket (+ `comments_count`, `attachments`, `replay_url`) — same evidence fields as the REST detail endpoint
- `create_ticket { project_id, title, assignee, description?, priority? }` → `{ ticket_id }` (assignee is required)
- `update_ticket { project_id, ticket_id, status?, priority?, assignee?, notes?, description? }` → `{ ok, ticket }`
- `list_comments { project_id, ticket_id }` → `{ ticket_id, comments }`
- `add_comment { project_id, ticket_id, body }` → `{ comment }`
- `get_ticket_activity { project_id, ticket_id }` → `{ ticket_id, events }` (comments + activity + connector exports)

## Management MCP server (account-scoped)

A SEPARATE MCP endpoint for account/workspace administration — create projects and invite members
across a whole account, rather than operating inside one project.

Endpoint: `POST https://klavity.in/api/v1/mcp-admin` (JSON-RPC 2.0, same framing as `/mcp`).
Auth: `Authorization: Bearer <kma_ token>` — an ACCOUNT-scoped management token (Dashboard →
Settings → Management API tokens). The project-scoped `kci_` token is NOT accepted here, and a
`kma_` token is NOT accepted on `/mcp` or `/api/v1/tickets`. Server name: `klavity-management`.
Rate limit: 120 requests/min/account.

```json
{ "mcpServers": { "klavity-management": {
  "url": "https://klavity.in/api/v1/mcp-admin",
  "headers": { "Authorization": "Bearer kma_YOUR_TOKEN" } } } }
```

### Management tools

- `list_projects {}` → `{ projects: [{ id, name, status, created_at }] }`
- `create_project { name, site_url? }` → `{ project: { id, name } }` (owner/admin only)
- `get_project { project_id }` → `{ id, name, status, created_at, members_count }` (404 if not in the account)
- `invite_member { project_id, email, role? }` → `{ ok: true }` (owner/admin only; role `admin`|`member`)
- `list_members {}` → `{ members: [{ email, role }] }` (role: `owner`|`admin`|`member`)
