// Registry: maps each connector type to its adapter.
// Pure module — no DB, no secrets, only fetch.

import { webhookConnector } from "./webhook"
import { planeConnector } from "./plane"
import { githubConnector } from "./github"
import { jiraConnector } from "./jira"
import { linearConnector } from "./linear"
import type { IssueKind } from "./resolve-issue-type"

// ── Types ──────────────────────────────────────────────────────────────────────

// An image to attach to the external ticket. `bytes` lets a connector upload the file NATIVELY into
// the tracker (Jira/Plane/Linear) so it lives with the ticket forever; `url` is the permanent signed
// link on our domain (`/img/<id>.<hmac>`) used in the body as a fallback and by connectors that have
// no attachment API (GitHub/webhook). Connectors should attach natively when they can, and ALWAYS
// keep the `url` working in the body so a failed/absent upload still shows the screenshot.
export type TicketAttachment = {
  filename: string
  contentType: string
  bytes: Uint8Array
  url: string
}

export type TicketPayload = {
  title: string
  body: string
  priority: string | null
  url: string | null
  simName: string | null
  createdAt: number
  klavityUrl: string
  attachments?: TicketAttachment[]
  // JTBD 2.16: Klavity ticket labels (display names), so exports carry the classification.
  // Connectors that support name-based labels attach them natively (GitHub/Jira); the rest
  // surface them in the issue body (see feedbackToTicketPayload). Omitted/empty = no labels.
  labels?: string[]
  // Connector-field-mapping: the ticket classification, used with resolveIssueType() to pick the right
  // external issue type per-connector (see issue_type_map on cfg). PX4 #411 widened this to add "task"/
  // "query" (both default to the tracker's default issue type unless the admin maps them in issue_type_map).
  kind?: IssueKind
}

export type ExportResult = {
  externalKey: string | null
  externalUrl: string | null
  // KLA-285 (JTBD 5.6): native screenshot attachment is an ENHANCEMENT — a failed upload must never
  // fail the export, because the issue body always carries the permanent signed fallback link. But it
  // must not degrade INVISIBLY either: the screenshot is the most persuasive part of a Klavity ticket,
  // and previously a silent fallback was only discoverable by opening the external issue by hand.
  // Connectors set this to a short human-readable reason when one or more attachments did not attach
  // natively; the caller records it on the ticket_exports row (status stays "ok") so it shows on the
  // export timeline as "exported, screenshot attach failed — link included in body".
  attachmentWarning?: string | null
  // KLA-551 (connector export failsafe): a configured STATE or LABEL name that could not be resolved
  // in the target tracker on THIS export. The issue was still created (defaulted state / label kept in
  // the description), and the caller records these on the connector row's pending_mappings queue +
  // "needs attention" flag so an admin can map them PERMANENTLY later (state_map/label_map). Empty/
  // omitted = everything resolved.
  unresolvedMappings?: import("./mapping-failsafe").UnresolvedMapping[]
}

// JTBD 5.10 (KLAVITYKLA-289): one issue fetched FROM an external tracker, normalised to the shape
// Klavity needs to upsert it as a ticket. The REVERSE direction of createIssue/TicketPayload.
//   - externalKey MUST equal what this connector's createIssue would store (github "#42",
//     linear "ENG-42"), because import dedupe matches on (type, externalKey) against ticket_exports —
//     the same seam inbound status-sync uses (see inbound.ts extractExternalKey / findExportByExternalKey).
//   - priority is already mapped to Klavity's vocabulary ("urgent"|"high"|"medium"|"low"|null); the
//     adapter degrades a provider that has no priority to null.
//   - status is the raw provider state string (best-effort, optional) for display/mapping; never required.
export type ImportedIssue = {
  externalKey: string
  externalUrl: string | null
  title: string
  body: string
  priority: string | null
  status?: string | null
  createdAt: number
}

// Result of pushing an outbound comment to an external tracker.
export type CommentSyncResult = {
  ok: boolean
  // The external tracker's ID for the created comment, if the API returns one.
  externalCommentId?: string | null
  // Human-readable error description (server-side only, never echoed to clients).
  error?: string
}

// JTBD 5.7 (KLAVITYKLA-286): the FULL desired state of the fields we keep in sync with the
// external issue after the initial export. Both keys are always the CURRENT Klavity values (not a
// delta) so an adapter that encodes a field into a shared native slot (e.g. GitHub packs priority
// into a `priority:<x>` label) can rebuild the complete set without clobbering the others.
//   - labels:   Klavity label display names (may be empty = "no labels").
//   - priority: one of "urgent" | "high" | "medium" | "low" | null (null = unset/cleared).
export type FieldUpdate = {
  labels: string[]
  priority: string | null
}

// Result of pushing an outbound field (labels/priority) update to an external tracker.
export type FieldSyncResult = {
  ok: boolean
  // Human-readable error description (server-side only, never echoed to clients).
  error?: string
}

// Klavity->Jira #414: result of natively uploading a batch of files to an already-created external
// issue via the connector's attachFiles capability. Best-effort — the caller never fails the export
// on a non-zero `failed`/`skipped`; it surfaces `warning` on the export timeline (same seam as
// ExportResult.attachmentWarning) so a degraded upload is visible without opening the issue.
export type AttachFilesResult = {
  attached: number // files the tracker accepted
  failed: number   // files that hit an upload/transport error
  skipped: number  // files dropped up front by the size caps (see attach-caps.ts)
  warning?: string | null
}

// Klavity->Jira #414 (#433 mechanism): result of transitioning a freshly created external issue to a
// configured default status. Best-effort — the caller never fails the export on it.
export type TransitionResult = {
  ok: boolean
  applied: boolean            // true only when a transition was actually POSTed
  transitionId?: string | null // the resolved transition id, when a matching one was found
  error?: string              // server-side reason (never echoed to clients)
  // KLA-551: true when the target status NAME simply does not exist in the tracker's workflow (a
  // resolvable config problem), as opposed to a transport/auth failure. Lets the caller record the
  // name on the connector's pending-mappings queue rather than treating it as a flaky transition.
  unresolved?: boolean
}

export type ConnectorField = {
  key: string
  label: string
  secret?: boolean
  required?: boolean
  placeholder?: string
}

// Connector-field-mapping: lightweight descriptor for a remote issue-type/status option,
// returned by listIssueTypes/listStatuses so the mapping UI can render human-readable choices.
export type ConnectorMeta = { id?: string; name: string; category?: string }

// Connector-field-mapping: which optional metadata lookups a connector supports, so the UI
// knows whether to offer issue-type/status pickers (and whether the connector maps types to
// labels instead of native issue types, e.g. GitHub).
export type ConnectorCapabilities = { issueTypes: boolean; statuses: boolean; typesAsLabels?: boolean }

export interface Connector {
  type: "webhook" | "plane" | "github" | "jira" | "linear"
  label: string
  fields: ConnectorField[]
  validate(cfg: Record<string, string>): { ok: boolean; error?: string }
  createIssue(ticket: TicketPayload, cfg: Record<string, string>): Promise<ExportResult>
  /**
   * Push a Klavity-authored comment to the linked external issue.
   *
   * @param externalIssueRef  The externalKey stored in ticket_exports (issue number/key/UUID).
   * @param commentText       Plain-text body of the Klavity comment.
   * @param meta              Optional extra data (authorEmail, klavityCommentId) for audit trails.
   * @param cfg               Decrypted connector config (same shape as createIssue receives).
   *
   * Implementations MUST be non-throwing: catch their own errors and return { ok: false, error }.
   * The caller (comment-sync.ts) also wraps the call, but belt-and-suspenders here prevents any
   * adapter mistake from surfacing to the user's comment-save path.
   *
   * INBOUND SEAM: when inbound comment sync (Phase 2) is built, comments that originated from
   * the external tracker will carry `meta.source === "inbound"`. Adapters or the caller should
   * skip pushing such comments back out to prevent echo loops. For Phase 1 this flag is never set,
   * so no guard is needed yet — but the seam is documented here.
   */
  addComment(
    externalIssueRef: string,
    commentText: string,
    meta: { authorEmail?: string | null; klavityCommentId?: string },
    cfg: Record<string, string>,
  ): Promise<CommentSyncResult>

  /**
   * JTBD 5.7 (KLAVITYKLA-286): sync a ticket's labels/priority to an already-linked external issue
   * AFTER the initial export, when they are later edited in Klavity. Follows the same outbound,
   * best-effort pattern as addComment: field-sync.ts binds real deps and calls this for every
   * successful export; the adapter maps each field to the provider's native slot where one exists
   * (Plane/Jira/Linear priority, GitHub/Jira labels) and falls back gracefully otherwise.
   *
   * @param externalIssueRef  The externalKey stored in ticket_exports (issue number/key/UUID).
   * @param fields            The FULL current {labels, priority} desired state (not a delta).
   * @param cfg               Decrypted connector config (same shape as createIssue receives).
   *
   * Implementations MUST be non-throwing: catch their own errors and return { ok: false, error }.
   * Optional so a connector that cannot update fields (or an external fake in tests) may omit it;
   * field-sync.ts skips any adapter without it.
   */
  updateIssue?(
    externalIssueRef: string,
    fields: FieldUpdate,
    cfg: Record<string, string>,
  ): Promise<FieldSyncResult>

  /**
   * Klavity->Jira #414: natively upload a batch of files (report screenshots AND the non-image files
   * the reporter attached — PDF/.log/.har/.txt/video/etc.) to an ALREADY-created external issue, so
   * they live with the ticket forever rather than only as body links. createIssue calls this itself
   * after the issue exists; it is also exposed on the interface so other adapters can opt in later
   * and so the caller can re-attach out of band.
   *
   * MUST be non-throwing and best-effort: enforce the shared size caps (attach-caps.ts), upload each
   * accepted file independently, and NEVER fail the export because a file did not attach — the issue
   * body always carries the permanent fallback link. Return counts + a human warning summarising any
   * skips/failures (surfaced on the export timeline, never leaking secrets).
   *
   * Optional so adapters without a native attachment API (webhook) or an unverified one may omit it.
   *
   * @param externalIssueRef  The externalKey stored by createIssue (issue key/number/UUID).
   * @param attachments       The files to upload (bytes + filename + contentType).
   * @param cfg               Decrypted connector config (same shape as createIssue receives).
   */
  attachFiles?(
    externalIssueRef: string,
    attachments: TicketAttachment[],
    cfg: Record<string, string>,
  ): Promise<AttachFilesResult>

  /**
   * Klavity->Jira #414 (#433 mechanism): transition a freshly created external issue to a configured
   * default status/workflow state. Resolves the target status NAME to the tracker's transition id
   * (Jira: GET .../transitions) and applies it (POST .../transitions). No-op when targetStatus is
   * blank or no matching transition exists.
   *
   * MUST be non-throwing and best-effort: a failed/absent transition MUST NOT fail the export — the
   * issue was already created successfully. The specific status VALUE is per-project admin config
   * (e.g. Jira connector `default_status`); this method is the generic mechanism.
   *
   * Optional so adapters without a workflow-transition concept may omit it.
   *
   * @param externalIssueRef  The externalKey stored by createIssue (issue key/number/UUID).
   * @param targetStatus      The desired status name (as configured per project).
   * @param cfg               Decrypted connector config (same shape as createIssue receives).
   */
  transitionIssue?(
    externalIssueRef: string,
    targetStatus: string,
    cfg: Record<string, string>,
  ): Promise<TransitionResult>

  /**
   * JTBD 5.10 (KLAVITYKLA-289): the REVERSE of createIssue — pull recent issues that were filed
   * FIRST in the external tracker ("external-first") so Klavity can import them as tickets and manage
   * them alongside native reports. Returns issues newest-first, normalised to ImportedIssue.
   *
   * Each issue's `externalKey` MUST match the exact key this connector's createIssue stores, so the
   * import path can dedupe against ticket_exports on (type, externalKey) and re-import cheaply without
   * creating duplicate tickets.
   *
   * Optional so adapters without a straightforward list API (or a test fake) may omit it; the import
   * route rejects a connector whose adapter lacks it. Unlike the outbound best-effort methods, this
   * MAY throw on transport/auth failure — the import route wraps it and surfaces a generic error.
   *
   * @param cfg   Decrypted connector config (same shape as createIssue receives).
   * @param opts  Optional { limit } cap on how many recent issues to fetch (adapter clamps it).
   */
  listIssues?(
    cfg: Record<string, string>,
    opts?: { limit?: number },
  ): Promise<ImportedIssue[]>

  /**
   * Codex #3: delete an external issue by its key/id. Currently used ONLY to clean up the throwaway
   * "Klavity connection test" issue that the connection-test route creates to verify credentials, so
   * a connection test (and every onboarding retry) does not leave a permanent orphan ticket behind.
   *
   * MUST be non-throwing and best-effort: catch its own errors and return { ok: false, error }. The
   * caller treats a failed delete as non-fatal (the test still "passed" — creds work). Optional so an
   * adapter without a delete API (webhook) or a test fake may omit it; the caller skips cleanup then.
   *
   * @param externalIssueRef  The externalKey returned by createIssue (issue key/number/UUID).
   * @param cfg               Decrypted connector config (same shape as createIssue receives).
   */
  deleteIssue?(
    externalIssueRef: string,
    cfg: Record<string, string>,
  ): Promise<{ ok: boolean; error?: string }>

  // Connector-field-mapping: declares which optional metadata lookups below this adapter
  // implements, so the UI can decide whether to show issue-type/status pickers at all.
  capabilities?: ConnectorCapabilities

  /**
   * Connector-field-mapping: list the remote issue types (Jira issue types, Linear/Plane
   * states-as-types, etc.) available for this connector's configured project, so the mapping UI
   * can offer them instead of free text. Optional — adapters without a native issue-type concept
   * (e.g. GitHub, which maps kind to labels) omit this.
   *
   * @param cfg  Decrypted connector config (same shape as createIssue receives).
   */
  listIssueTypes?(cfg: Record<string, string>): Promise<ConnectorMeta[]>

  /**
   * Connector-field-mapping: list the remote statuses/workflow states available for this
   * connector's configured project, for the same mapping UI as listIssueTypes. Optional.
   *
   * @param cfg  Decrypted connector config (same shape as createIssue receives).
   */
  listStatuses?(cfg: Record<string, string>): Promise<ConnectorMeta[]>
}

// Connector-field-mapping: parseJsonMap/resolveIssueType live in their own leaf module
// (resolve-issue-type.ts) so adapters can import them WITHOUT creating an import cycle through
// this file's registry (every adapter is imported at the top of index.ts; an adapter importing a
// value back out of index.ts creates a circular init order — see resolve-issue-type.ts for
// details). Re-exported here for back-compat with existing callers/tests that import from "./index".
export { parseJsonMap, resolveIssueType } from "./resolve-issue-type"
export type { IssueKind } from "./resolve-issue-type"

// ── Registry ───────────────────────────────────────────────────────────────────

const registry: Record<string, Connector> = {
  webhook: webhookConnector,
  plane: planeConnector,
  github: githubConnector,
  jira: jiraConnector,
  linear: linearConnector,
}

export function getConnector(type: string): Connector | null {
  return registry[type] ?? null
}

export function listConnectorTypes(): { type: string; label: string; fields: ConnectorField[] }[] {
  return Object.values(registry).map(({ type, label, fields }) => ({ type, label, fields }))
}
