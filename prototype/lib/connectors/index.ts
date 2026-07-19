// Registry: maps each connector type to its adapter.
// Pure module — no DB, no secrets, only fetch.

import { webhookConnector } from "./webhook"
import { planeConnector } from "./plane"
import { githubConnector } from "./github"
import { jiraConnector } from "./jira"
import { linearConnector } from "./linear"

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
}

// Result of pushing an outbound comment to an external tracker.
export type CommentSyncResult = {
  ok: boolean
  // The external tracker's ID for the created comment, if the API returns one.
  externalCommentId?: string | null
  // Human-readable error description (server-side only, never echoed to clients).
  error?: string
}

export type ConnectorField = {
  key: string
  label: string
  secret?: boolean
  required?: boolean
  placeholder?: string
}

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
}

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
