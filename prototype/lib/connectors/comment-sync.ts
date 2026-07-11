/**
 * comment-sync.ts — Phase 1 outbound comment sync (KLAVITYKLA-290)
 *
 * When a Klavity comment is posted on a ticket that has a successful export record, this module
 * pushes the comment to the linked external issue via the matching adapter's addComment method.
 *
 * Design decisions:
 * - FIRE-AND-FORGET: the caller awaits pushCommentToLinkedIssues but the function itself catches
 *   all errors. A sync failure NEVER surfaces to the user's comment-save path.
 * - INBOUND SEAM: the `source` field on CommentMeta is reserved for Phase 2. When inbound sync
 *   lands, comments originating from the external tracker will carry source:"inbound". This
 *   function skips pushing them back out to prevent echo loops. For Phase 1 this is always
 *   "klavity" (Klavity-authored), so the guard is here but never triggered yet.
 * - MULTI-EXPORT: a ticket can be exported to multiple connectors (e.g. Plane + webhook).
 *   We push to ALL successful exports that have a non-null externalKey.
 * - ACTIVITY LOG: each push outcome (ok/fail) is logged as an activity_event so failures are
 *   visible in the timeline and NOT silently discarded.
 * - TESTABILITY: The core logic is in makePushCommentToLinkedIssues() which accepts injected deps.
 *   pushCommentToLinkedIssues() is the production wrapper that binds real DB/crypto/connector deps.
 *   Tests call makePushCommentToLinkedIssues() with fake deps to stay hermetic without module mocks
 *   or needing to load the DB module (which requires @libsql/client not available in test isolation).
 */

import { getConnector as _getConnector, type Connector } from "./index"
import { decryptSecret as _decryptSecret } from "../crypto"
// NOTE: ../db is NOT statically imported here. It pulls in @libsql/client and creates a Turso
// client at module load, which is unavailable / undesirable in hermetic test isolation. The
// production binding below lazy-imports it (dynamic import is module-cached, so no repeat cost),
// keeping this module — and therefore comment-sync.test.ts — loadable without the DB layer.

// ── Minimal local types for the dep interface ──────────────────────────────────
// We define these locally rather than re-importing from ../db so that the test
// file can import this module without pulling in @libsql/client.

export type ExportRow = {
  id: string
  feedbackId: string
  projectId: string
  connectorId: string
  type: string
  externalKey: string | null
  externalUrl: string | null
  status: "ok" | "failed"
  error: string | null
  createdAt: number
  createdBy: string | null
}

export type ConnectorConfigRow = {
  id: string
  projectId: string
  type: string
  name: string
  config: Record<string, string>
  autoCopy: boolean
  enabled: boolean
  createdAt: number
  createdBy: string | null
}

export type ActivityRecord = {
  projectId: string
  feedbackId?: string | null
  type: string
  actorEmail?: string | null
  meta?: any
}

// ── Public API types ───────────────��───────────────────────────────────────────

export type CommentMeta = {
  /** Email of the Klavity user who wrote the comment. */
  authorEmail: string | null
  /** Klavity-internal comment ID (tc_xxx) for correlation. */
  klavityCommentId: string
  /**
   * INBOUND SEAM (Phase 2): when inbound comment sync is built, set this to "inbound" on
   * comments that arrived FROM the external tracker so we don't echo them back out.
   * For Phase 1 outbound-only, always pass "klavity" (or omit — defaults to "klavity").
   */
  source?: "klavity" | "inbound"
}

/** Injectable dependencies — allows hermetic unit testing without module mocks. */
export type CommentSyncDeps = {
  getConnector: (type: string) => Connector | null
  decryptSecret: (v: string) => Promise<string>
  listTicketExports: (feedbackId: string) => Promise<ExportRow[]>
  getConnectorById: (projectId: string, id: string) => Promise<ConnectorConfigRow | null>
  insertActivity: (a: ActivityRecord) => Promise<string>
}

// ���─ Core logic ─────────────────��───────────────────────────────────────────────

/**
 * Build a push function bound to the provided dependencies.
 * Production code uses pushCommentToLinkedIssues (which calls this with real deps).
 * Tests call this directly with fake deps to stay hermetic.
 */
export function makePushCommentToLinkedIssues(deps: CommentSyncDeps) {
  return async function push(
    projectId: string,
    feedbackId: string,
    commentText: string,
    meta: CommentMeta,
  ): Promise<void> {
    // INBOUND SEAM (Phase 2 guard): skip comments that arrived from an external tracker to
    // prevent echo loops. For Phase 1 this branch is never taken.
    if (meta.source === "inbound") return

    let exports: ExportRow[]
    try {
      exports = await deps.listTicketExports(feedbackId)
    } catch (e) {
      // DB read failure: log and bail. Never throw.
      console.warn(`[comment-sync] listTicketExports failed for ${feedbackId}:`, e)
      return
    }

    // Only push to successful exports that produced an external key (failed exports never
    // created an issue in the external tracker, so there is nothing to comment on).
    const eligible = exports.filter((ex) => ex.status === "ok" && ex.externalKey != null)
    if (eligible.length === 0) return

    // Push to each eligible export independently.
    for (const ex of eligible) {
      // Each push is detached so one slow/failing adapter never delays others.
      pushOneExport(deps, projectId, feedbackId, ex, commentText, meta).catch((e) => {
        // Belt-and-suspenders: pushOneExport already catches internally.
        console.warn(`[comment-sync] unexpected error in pushOneExport (${ex.id}):`, e)
      })
    }
  }
}

/** Push one comment to one export's external tracker. All errors are swallowed. */
async function pushOneExport(
  deps: CommentSyncDeps,
  projectId: string,
  feedbackId: string,
  ex: ExportRow,
  commentText: string,
  meta: CommentMeta,
): Promise<void> {
  const adapter = deps.getConnector(ex.type)
  if (!adapter) {
    // Unknown connector type (e.g. a type that was removed) — skip silently.
    console.warn(`[comment-sync] no adapter for connector type "${ex.type}", skipping`)
    return
  }

  // Load connector config from DB.
  let connector: ConnectorConfigRow | null
  try {
    connector = await deps.getConnectorById(projectId, ex.connectorId)
  } catch (e) {
    console.warn(`[comment-sync] getConnectorById failed (${ex.connectorId}):`, e)
    return
  }

  if (!connector || !connector.enabled) {
    // Connector deleted or disabled since the export was created — skip.
    return
  }

  // Decrypt secret fields before calling the adapter.
  const cfg: Record<string, string> = { ...connector.config }
  for (const f of adapter.fields) {
    if (f.secret && connector.config[f.key]) {
      try {
        cfg[f.key] = await deps.decryptSecret(connector.config[f.key])
      } catch {
        cfg[f.key] = ""
      }
    }
  }

  // Call the adapter. addComment is non-throwing by contract (returns { ok, error }).
  let result: { ok: boolean; externalCommentId?: string | null; error?: string }
  try {
    result = await adapter.addComment(
      ex.externalKey!,
      commentText,
      { authorEmail: meta.authorEmail, klavityCommentId: meta.klavityCommentId },
      cfg,
    )
  } catch (e) {
    // Should never happen given the adapter contract, but guard anyway.
    result = { ok: false, error: e instanceof Error ? e.message : String(e) }
  }

  // Record outcome in the activity timeline so failures are visible (not silent).
  // The activity event renders as a timeline item in the dashboard via the existing
  // ticketActivityTimeline path (type "comment_synced_outbound" / "comment_sync_failed_outbound").
  try {
    await deps.insertActivity({
      projectId,
      feedbackId,
      type: result.ok ? "comment_synced_outbound" : "comment_sync_failed_outbound",
      actorEmail: meta.authorEmail,
      meta: {
        connectorId: ex.connectorId,
        connectorType: ex.type,
        externalKey: ex.externalKey,
        klavityCommentId: meta.klavityCommentId,
        ...(result.ok
          ? { externalCommentId: result.externalCommentId ?? null }
          : { error: result.error ?? "unknown error" }),
      },
    })
  } catch (e) {
    // Activity log failure is non-fatal.
    console.warn(`[comment-sync] insertActivity failed (${ex.connectorId}):`, e)
  }

  if (!result.ok) {
    console.warn(
      `[comment-sync] outbound push failed — connector=${ex.connectorId} (${ex.type}) ` +
        `externalKey=${ex.externalKey} feedbackId=${feedbackId}: ${result.error}`,
    )
  }
}

// ── Production binding ────────────────���────────────────────────────────────────

/**
 * Push a newly-added Klavity comment to every external tracker this ticket was exported to.
 *
 * Safe to call fire-and-forget: `pushCommentToLinkedIssues(...).catch(() => {})`.
 * The function catches all errors internally and records them as activity events.
 *
 * @param projectId   Klavity project ID (for activity event scoping).
 * @param feedbackId  Klavity ticket (feedback) ID.
 * @param commentText Plain-text comment body to send to the external tracker.
 * @param meta        Comment authorship + INBOUND SEAM flag.
 */
export const pushCommentToLinkedIssues = makePushCommentToLinkedIssues({
  getConnector: _getConnector,
  decryptSecret: _decryptSecret,
  // Lazy-import ../db so this module never forces @libsql/client at load time (keeps tests
  // hermetic). import() resolves the module once and caches it for subsequent calls.
  listTicketExports: (feedbackId) => import("../db").then((m) => m.listTicketExports(feedbackId)),
  getConnectorById: (projectId, id) => import("../db").then((m) => m.getConnectorById(projectId, id)),
  insertActivity: (a) => import("../db").then((m) => m.insertActivity(a)),
})
