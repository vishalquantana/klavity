# Connector Field Mapping — Design Spec

**Date:** 2026-08-19
**Status:** Approved direction (mockup + scope confirmed)
**Mockup:** `~/Downloads/klavity-jira-mapping-mock.html`

## Goal

When a user connects an external tracker (Jira, Linear, Plane, GitHub), Klavity
reads that tracker's actual **issue types** and **workflow statuses**, auto-aligns
Klavity's report kinds and ticket statuses to them by name, surfaces any mismatches,
and lets the user pick the right target from the tracker's real values — inline in
the connect flow, before the connector is saved.

Today every export uses one static free-text `issue_type` string (default `"Task"`),
and status sync is hand-configured per connector. This replaces guesswork with a
metadata-driven mapping that is **consistent across all four issue-tracker connectors**.

## Scope (v1 — confirmed)

- **Both mapping tables:** report-kind → issue-type AND ticket-status → workflow-stage.
- **Inline placement:** mapping is Step 3 of the connect flow, after credentials
  validate + a successful connection Test, before the connector is persisted.
  Re-openable later from Connector settings.
- **All four connectors at once** via one shared capability interface: Jira, Linear,
  Plane, GitHub. Webhook has no metadata → mapping step is skipped for it.

### Out of scope (v1)

- Custom-field mapping beyond type + status.
- Per-project (as opposed to per-connector) mapping.
- Auto-creating missing issue types/statuses in the tracker.
- Changing the inbound (tracker → Klavity) sync beyond reusing `status_map`.

## Klavity's source vocabularies (map FROM)

- **Report kind:** `"bug" | "feature"` (`prototype/lib/label-suggest.ts` `reportType`),
  plus a `default` fallback row for anything uncategorised.
- **Ticket status:** `new | open | in_progress | done | dismissed`
  (Klavity `feedback.status`).

## Architecture

### 1. Shared capability interface (`prototype/lib/connectors/index.ts`)

Extend the `Connector` interface (currently index.ts:105-176) with two OPTIONAL
metadata methods and a capability descriptor:

```ts
export interface ConnectorMeta { id?: string; name: string; category?: string }
export interface Connector {
  // ...existing createIssue/addComment/updateIssue/listIssues...
  capabilities?: { issueTypes: boolean; statuses: boolean; typesAsLabels?: boolean }
  listIssueTypes?(cfg: any): Promise<ConnectorMeta[]>   // e.g. Jira Bug/Story/Task
  listStatuses?(cfg: any): Promise<ConnectorMeta[]>      // e.g. To Do/In Progress/Done
}
```

- Adapters with **native issue types** (Jira): `capabilities.issueTypes = true`.
- Adapters **without** native types (GitHub, Linear, Plane): `typesAsLabels = true` —
  the kind→type map instead applies a **label** on export (mockup wording adapts to
  "label" for those). This keeps one UI abstraction: "for a Bug report, tag it X."
- `capabilities.statuses = true` for all four (each exposes workflow states).

### 2. Per-adapter metadata fetch

| Connector | listIssueTypes | listStatuses |
|-----------|----------------|--------------|
| **Jira** (`jira.ts`) | `GET /rest/api/3/issue/createmeta?projectKeys={key}&expand=projects.issuetypes` → project.issuetypes[].name | `GET /rest/api/3/project/{key}/statuses` → flattened unique status names |
| **Linear** (`linear.ts`) | none (typesAsLabels) → return `[]`; kind→label uses team labels via GraphQL `issueLabels` | GraphQL `team.states.nodes { name, type }` |
| **Plane** (`plane.ts`) | none (typesAsLabels) → project labels | `GET /workspaces/{ws}/projects/{proj}/states/` → state names |
| **GitHub** (`github.ts`) | none (typesAsLabels) → repo labels via `GET /repos/{o}/{r}/labels` | fixed set `["open","closed"]` (Issues have no workflow); statuses map onto open/closed |

All calls go through the existing `safeFetch` SSRF guard and reuse each adapter's
existing auth. Each method is best-effort: on failure it throws a friendly error the
UI shows as "couldn't read your {tracker} setup — you can still map manually."

### 3. Kind-aware payload + createIssue

- Add `kind?: "bug" | "feature"` to `TicketPayload` (index.ts:24-37).
- `feedbackToTicketPayload` (server.ts:1462-1531) sets `kind` from the report's
  `reportType`.
- Each adapter's `createIssue` resolves the target type:
  `cfg.issue_type_map?.[kind] ?? cfg.issue_type_map?.default ?? cfg.issue_type ?? "<adapter default>"`.
  For `typesAsLabels` adapters, the resolved value is added to `labels` instead of the
  native type field. **Back-compat:** a connector with no `issue_type_map` behaves
  exactly as today (single `issue_type`).

### 4. Status mapping usage

- Persist `status_map: { new?, open?, in_progress?, done?, dismissed? }` → provider
  status name (or `null`/omitted = "don't sync this status").
- Outbound: when a Klavity ticket transitions and the connector has `updateIssue` +
  two-way sync enabled, translate via `status_map` before calling `updateIssue`
  (reuse the existing transition path; Jira needs a status→transition-id lookup).
- Inbound (`lib/connectors/inbound.ts`) reuses `status_map` reversed where it currently
  hard-codes provider strings.

### 5. Persistence

Add to each issue-tracker connector's stored `config`:

```jsonc
{
  "issue_type_map": { "bug": "Bug", "feature": "Story", "default": "Task" },
  "status_map": { "new": "To Do", "open": "In Progress", "in_progress": "In Progress", "done": "Done", "dismissed": null }
}
```

No schema migration — connector config is already a JSON blob. Absent maps = today's
behavior (safe default).

### 6. API endpoints (`server.ts`)

- `POST /api/connectors/meta` `{ type, config }` → `{ issueTypes: ConnectorMeta[],
  statuses: ConnectorMeta[], capabilities }` — fetches live metadata for an unsaved
  connector during the connect flow (mirrors the existing `POST /connectors/test`
  pattern at server.ts:8599-8617; admin-only; secrets handled same way).
- Auto-match runs **client-side** (see §7) from the returned lists — no server state.
- Saving the mapping is part of the existing connector create/PATCH; `issue_type_map`
  + `status_map` ride along in `config`.

### 7. Mapping UI (`prototype/public/dashboard.html`)

- New step rendered after a successful Test in the connect flow (near
  `renderConnectorFields` 7380+ / `renderTestResult` 7218).
- On entry, call `POST /api/connectors/meta`; render the two tables from the mockup.
- **Auto-match algorithm (client-side):** case-insensitive exact match → known synonym
  table (`{feature:[story,task], new:[to do,backlog,open], done:[done,closed,complete],
  in_progress:[in progress,doing], dismissed:[won't do,wont fix,cancelled,closed]}`) →
  else unmatched. Multiple candidates or zero candidates = amber "needs your input".
- **Save gate:** disabled until every amber row is resolved (or explicitly set to
  "Ignore / don't sync"). "Skip — use defaults" applies today's single-type behavior.
- Adapts labels vs types wording from `capabilities.typesAsLabels`.

## Error handling

- Metadata fetch fails → non-blocking banner + manual dropdowns fall back to a
  free-text "type a value" input (so a user is never hard-blocked by an API hiccup).
- Save validates the chosen values still exist in the last-fetched lists; a "Re-read
  {tracker}" button refetches.
- `typesAsLabels` adapters never send a native issue-type field they don't support.

## Testing

- **Adapter unit tests** (per connector): `listIssueTypes`/`listStatuses` parse mocked
  API responses into `ConnectorMeta[]`; `createIssue` picks the right type/label from
  `issue_type_map` for `kind:"bug"` vs `kind:"feature"` vs default; back-compat when
  no map present.
- **Endpoint test:** `POST /api/connectors/meta` returns shapes for each type; admin
  gating; friendly error on bad creds (loopback receiver, `KLAV_TEST_ALLOW_LOOPBACK`).
- **Status map:** outbound transition translates via `status_map`; `null` = no sync.
- **Auto-match unit test** (pure function extracted from the UI logic): exact,
  synonym, multi-candidate (amber), no-candidate (amber) cases.

## Rollout

Single feature branch, shared interface + all four adapters. Ships through the
merge-train. Default-off behavior preserved: existing connectors keep working with
their single `issue_type` until a user opens the new mapping step and saves.
