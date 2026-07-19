/**
 * field-sync.ts — outbound labels/priority sync (KLAVITYKLA-286, JTBD 5.7)
 *
 * When a ticket that already has a successful export record has its LABELS or PRIORITY edited in
 * Klavity, this module pushes the new values to every linked external issue via the matching
 * adapter's updateIssue method. It is a direct sibling of comment-sync.ts and follows the exact
 * same design so the two behave identically operationally:
 *
 * - FIRE-AND-FORGET: the caller awaits syncFieldsToLinkedIssues but the function itself catches all
 *   errors. A sync failure NEVER surfaces to the user's label/priority-edit path.
 * - FULL-STATE, NOT DELTA: the caller passes the ticket's CURRENT {labels, priority} (both keys),
 *   never a partial delta. This lets adapters that pack a field into a shared native slot (GitHub
 *   encodes priority as a `priority:<x>` label) rebuild the complete set without clobbering.
 * - MULTI-EXPORT: a ticket can be exported to multiple connectors — we push to ALL successful
 *   exports that have a non-null externalKey.
 * - ACTIVITY LOG: each push outcome (ok/fail) is logged as an activity_event so failures are visible
 *   in the timeline and NOT silently discarded.
 * - TESTABILITY: the core logic lives in makeSyncFieldsToLinkedIssues() which accepts injected deps.
 *   syncFieldsToLinkedIssues() is the production wrapper binding real DB/crypto/connector deps.
 *   Tests call makeSyncFieldsToLinkedIssues() with fake deps to stay hermetic — no module mocks and
 *   no need to load ../db (which pulls in @libsql/client, unavailable in test isolation).
 */

import { getConnector as _getConnector, type Connector, type FieldUpdate } from "./index"
import { decryptSecret as _decryptSecret } from "../crypto"
// NOTE: ../db is NOT statically imported here (same rationale as comment-sync.ts). The production
// binding below lazy-imports it so this module — and field-sync.test.ts — load without the DB layer.

// ── Minimal local types for the dep interface (mirrors comment-sync.ts) ─────────

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

// ── Public API types ────────────────────────────────────────────────────────────

export type FieldSyncMeta = {
  /** Email of the Klavity user who made the edit (for the activity actor). */
  actorEmail: string | null
}

/** Injectable dependencies — allows hermetic unit testing without module mocks. */
export type FieldSyncDeps = {
  getConnector: (type: string) => Connector | null
  decryptSecret: (v: string) => Promise<string>
  listTicketExports: (feedbackId: string) => Promise<ExportRow[]>
  getConnectorById: (projectId: string, id: string) => Promise<ConnectorConfigRow | null>
  insertActivity: (a: ActivityRecord) => Promise<string>
}

// ── Core logic ────────────────────────────────────────────────────────────────

/**
 * Build a sync function bound to the provided dependencies.
 * Production code uses syncFieldsToLinkedIssues (which calls this with real deps).
 * Tests call this directly with fake deps to stay hermetic.
 */
export function makeSyncFieldsToLinkedIssues(deps: FieldSyncDeps) {
  return async function sync(
    projectId: string,
    feedbackId: string,
    fields: FieldUpdate,
    meta: FieldSyncMeta,
  ): Promise<void> {
    let exports: ExportRow[]
    try {
      exports = await deps.listTicketExports(feedbackId)
    } catch (e) {
      // DB read failure: log and bail. Never throw.
      console.warn(`[field-sync] listTicketExports failed for ${feedbackId}:`, e)
      return
    }

    // Only push to successful exports that produced an external key (failed exports never created an
    // issue in the external tracker, so there is nothing to update).
    const eligible = exports.filter((ex) => ex.status === "ok" && ex.externalKey != null)
    if (eligible.length === 0) return

    // Push to each eligible export independently.
    for (const ex of eligible) {
      // Each push is detached so one slow/failing adapter never delays others.
      pushOneExport(deps, projectId, feedbackId, ex, fields, meta).catch((e) => {
        // Belt-and-suspenders: pushOneExport already catches internally.
        console.warn(`[field-sync] unexpected error in pushOneExport (${ex.id}):`, e)
      })
    }
  }
}

/** Push the current field state to one export's external tracker. All errors are swallowed. */
async function pushOneExport(
  deps: FieldSyncDeps,
  projectId: string,
  feedbackId: string,
  ex: ExportRow,
  fields: FieldUpdate,
  meta: FieldSyncMeta,
): Promise<void> {
  const adapter = deps.getConnector(ex.type)
  if (!adapter) {
    // Unknown connector type (e.g. a type that was removed) — skip silently.
    console.warn(`[field-sync] no adapter for connector type "${ex.type}", skipping`)
    return
  }
  if (typeof adapter.updateIssue !== "function") {
    // Adapter does not support field updates — nothing to do.
    return
  }

  // Load connector config from DB.
  let connector: ConnectorConfigRow | null
  try {
    connector = await deps.getConnectorById(projectId, ex.connectorId)
  } catch (e) {
    console.warn(`[field-sync] getConnectorById failed (${ex.connectorId}):`, e)
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

  // Call the adapter. updateIssue is non-throwing by contract (returns { ok, error }).
  let result: { ok: boolean; error?: string }
  try {
    result = await adapter.updateIssue(ex.externalKey!, fields, cfg)
  } catch (e) {
    // Should never happen given the adapter contract, but guard anyway.
    result = { ok: false, error: e instanceof Error ? e.message : String(e) }
  }

  // Record outcome in the activity timeline so failures are visible (not silent).
  try {
    await deps.insertActivity({
      projectId,
      feedbackId,
      type: result.ok ? "fields_synced_outbound" : "fields_sync_failed_outbound",
      actorEmail: meta.actorEmail,
      meta: {
        connectorId: ex.connectorId,
        connectorType: ex.type,
        externalKey: ex.externalKey,
        labels: fields.labels,
        priority: fields.priority,
        ...(result.ok ? {} : { error: result.error ?? "unknown error" }),
      },
    })
  } catch (e) {
    // Activity log failure is non-fatal.
    console.warn(`[field-sync] insertActivity failed (${ex.connectorId}):`, e)
  }

  if (!result.ok) {
    console.warn(
      `[field-sync] outbound push failed — connector=${ex.connectorId} (${ex.type}) ` +
        `externalKey=${ex.externalKey} feedbackId=${feedbackId}: ${result.error}`,
    )
  }
}

// ── Production binding ──────────────────────────────────────────────────────────

/**
 * Push a ticket's current labels/priority to every external tracker it was exported to.
 *
 * Safe to call fire-and-forget: `syncFieldsToLinkedIssues(...).catch(() => {})`.
 * The function catches all errors internally and records them as activity events.
 *
 * @param projectId   Klavity project ID (for activity event scoping).
 * @param feedbackId  Klavity ticket (feedback) ID.
 * @param fields      The ticket's FULL current {labels, priority} state (not a delta).
 * @param meta        Edit authorship.
 */
export const syncFieldsToLinkedIssues = makeSyncFieldsToLinkedIssues({
  getConnector: _getConnector,
  decryptSecret: _decryptSecret,
  // Lazy-import ../db so this module never forces @libsql/client at load time (keeps tests hermetic).
  // import() resolves the module once and caches it for subsequent calls.
  listTicketExports: (feedbackId) => import("../db").then((m) => m.listTicketExports(feedbackId)),
  getConnectorById: (projectId, id) => import("../db").then((m) => m.getConnectorById(projectId, id)),
  insertActivity: (a) => import("../db").then((m) => m.insertActivity(a)),
})
