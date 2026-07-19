/**
 * import.ts — inbound issue IMPORT from an external tracker (KLAVITYKLA-289, JTBD 5.10)
 *
 * The REVERSE of the export/auto-copy path. Klavity normally EXPORTS its reports to an external
 * tracker (github/jira/linear/plane/webhook). This module pulls the OTHER direction: issues that were
 * created FIRST in the external tracker ("external-first") are imported as Klavity tickets so a team
 * that files in GitHub/Linear can manage those issues alongside Klavity-native reports.
 *
 * Design mirrors field-sync.ts / comment-sync.ts so the three behave identically operationally:
 * - DEPENDENCY-INJECTED: the core logic lives in makeImportExternalIssues() which takes injected deps.
 *   importExternalIssues() is the production wrapper binding real DB/crypto/connector deps. Tests call
 *   makeImportExternalIssues() with fakes to stay hermetic — no module mocks, no ../db load (which
 *   pulls in @libsql/client, unavailable in test isolation).
 * - DEDUPE ON (type, externalKey): each imported issue carries the SAME externalKey the outbound
 *   createIssue would store (github "#42", linear "ENG-42"). Before creating a ticket we look up an
 *   existing successful ticket_exports row for that (type, externalKey) — the same seam inbound
 *   status-sync uses — and SKIP if one exists in THIS project. So re-importing is idempotent and an
 *   issue we previously EXPORTED is never re-imported as a duplicate.
 * - LINK RECORD: every imported ticket gets a ticket_exports row (status "ok", external_key/url set)
 *   so it is linked to its external issue exactly like an exported one — that row IS the dedupe key on
 *   the next import and lets comment/field sync + the export timeline treat it uniformly.
 * - GRACEFUL DEGRADATION: non-native fields (priority, status) are best-effort. A provider with no
 *   priority imports as null; the raw external status is recorded on the activity meta, not required.
 *
 * Unlike the outbound best-effort methods, a fetch/auth failure in listIssues DOES propagate: the
 * caller (server import route) reports a generic error so the admin knows the pull failed rather than
 * silently importing nothing.
 */

import { getConnector as _getConnector, type Connector, type ImportedIssue } from "./index"
import { decryptSecret as _decryptSecret } from "../crypto"
// NOTE: ../db is NOT statically imported (same rationale as field-sync.ts) — the production binding
// lazy-imports it so this module and import.test.ts load without the DB layer.

// ── Minimal local types for the dep interface (mirrors field-sync.ts) ───────────

export type ImportConnectorRow = {
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

export type ExistingExport = {
  projectId: string
  connectorId: string
  externalKey: string | null
} | null

export type FeedbackInsertArg = {
  projectId: string
  observation: string
  priority: string | null
  source: string
}

export type ActivityRecord = {
  projectId: string
  feedbackId?: string | null
  type: string
  actorEmail?: string | null
  meta?: any
}

/** Injectable dependencies — allows hermetic unit testing without module mocks. */
export type ImportDeps = {
  getConnector: (type: string) => Connector | null
  decryptSecret: (v: string) => Promise<string>
  getConnectorById: (projectId: string, id: string) => Promise<ImportConnectorRow | null>
  /** Most-recent successful export for (type, externalKey), or null. The dedupe seam. */
  findExportByExternalKey: (type: string, externalKey: string) => Promise<ExistingExport>
  insertFeedback: (f: FeedbackInsertArg) => Promise<string>
  addTicketExport: (x: {
    feedbackId: string
    projectId: string
    connectorId: string
    type: string
    externalKey: string | null
    externalUrl: string | null
    status: "ok" | "failed"
    error: string | null
    createdBy: string | null
  }) => Promise<string>
  insertActivity: (a: ActivityRecord) => Promise<string>
}

export type ImportMeta = {
  /** Email of the Klavity admin running the import (for the activity actor / export createdBy). */
  actorEmail: string | null
  /** Optional cap on how many recent external issues to fetch. */
  limit?: number
}

export type ImportSummary = {
  /** Total issues returned by the external tracker. */
  fetched: number
  /** New tickets created this run. */
  imported: number
  /** Already-linked issues skipped (dedupe). */
  skipped: number
  /** Per-issue failures that did not abort the run (e.g. a single bad row). */
  failed: number
  /** The imported issues' externalKeys (newest-first), for the client. */
  importedKeys: string[]
}

// ── Core logic ────────────────────────────────────────────────────────────────

/**
 * Build an import function bound to the provided dependencies.
 * Production uses importExternalIssues (which calls this with real deps).
 * Tests call this directly with fakes to stay hermetic.
 *
 * Throws (with a plain message) when the connector is missing/disabled or its adapter can't import —
 * these are caller-actionable configuration errors, not per-issue hiccups. A transport/auth failure
 * from listIssues also propagates. Per-ISSUE errors never abort the batch (counted in `failed`).
 */
export function makeImportExternalIssues(deps: ImportDeps) {
  return async function importIssues(
    projectId: string,
    connectorId: string,
    meta: ImportMeta,
  ): Promise<ImportSummary> {
    const connector = await deps.getConnectorById(projectId, connectorId)
    if (!connector) throw new Error("Connector not found.")
    if (!connector.enabled) throw new Error("Connector is disabled.")

    const adapter = deps.getConnector(connector.type)
    if (!adapter) throw new Error("Unknown connector type.")
    if (typeof adapter.listIssues !== "function") {
      throw new Error(`Importing is not supported for ${connector.type} connectors yet.`)
    }

    // Decrypt secret fields before calling the adapter (same as export/test paths).
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

    // Pull recent external-first issues. A transport/auth failure here propagates to the caller.
    const issues: ImportedIssue[] = await adapter.listIssues(cfg, { limit: meta.limit })

    const summary: ImportSummary = {
      fetched: issues.length,
      imported: 0,
      skipped: 0,
      failed: 0,
      importedKeys: [],
    }

    for (const issue of issues) {
      try {
        if (!issue.externalKey) {
          summary.failed++
          continue
        }

        // Dedupe: an already-linked issue in THIS project (either previously imported, or one we
        // exported) must not create a second ticket. findExportByExternalKey returns the most-recent
        // successful export for (type, externalKey); scope it to this project so an identical key
        // string in another project pointing at a different tracker never suppresses a real import.
        const prior = await deps.findExportByExternalKey(connector.type, issue.externalKey)
        if (prior && prior.projectId === projectId) {
          summary.skipped++
          continue
        }

        // Create the Klavity ticket. Title + body collapse into the observation (the ticket body);
        // priority is already mapped to Klavity's vocabulary by the adapter (null = unset).
        const body = (issue.body ?? "").trim()
        const observation = body ? `${issue.title}\n\n${body}` : issue.title
        const feedbackId = await deps.insertFeedback({
          projectId,
          observation,
          priority: issue.priority ?? null,
          source: `import:${connector.type}`,
        })

        // Record the link exactly like an export so this ticket dedupes on the next import and is
        // treated uniformly by comment/field sync + the export timeline.
        await deps.addTicketExport({
          feedbackId,
          projectId,
          connectorId,
          type: connector.type,
          externalKey: issue.externalKey,
          externalUrl: issue.externalUrl,
          status: "ok",
          error: null,
          createdBy: meta.actorEmail,
        })

        // Timeline event so an import is visible (non-fatal if it fails).
        try {
          await deps.insertActivity({
            projectId,
            feedbackId,
            type: "ticket_imported",
            actorEmail: meta.actorEmail,
            meta: {
              connectorId,
              connectorType: connector.type,
              externalKey: issue.externalKey,
              externalUrl: issue.externalUrl,
              externalStatus: issue.status ?? null,
            },
          })
        } catch (e) {
          console.warn(`[import] insertActivity failed (${issue.externalKey}):`, e)
        }

        summary.imported++
        summary.importedKeys.push(issue.externalKey)
      } catch (e) {
        // A single bad issue row must not abort the whole batch.
        summary.failed++
        console.warn(`[import] issue import failed (${issue?.externalKey}):`, e)
      }
    }

    return summary
  }
}

// ── Production binding ──────────────────────────────────────────────────────────

/**
 * Import recent external-first issues from a project's linked connector as Klavity tickets, deduping
 * on (type, externalKey) so re-import is idempotent.
 *
 * @param projectId    Klavity project ID.
 * @param connectorId  The connector to pull from (must have an importing adapter: github/linear).
 * @param meta         Actor email + optional fetch limit.
 * @returns            Counts of fetched/imported/skipped/failed + the imported keys.
 */
export const importExternalIssues = makeImportExternalIssues({
  getConnector: _getConnector,
  decryptSecret: _decryptSecret,
  // Lazy-import ../db so this module never forces @libsql/client at load time (keeps tests hermetic).
  getConnectorById: (projectId, id) => import("../db").then((m) => m.getConnectorById(projectId, id)),
  findExportByExternalKey: (type, externalKey) =>
    import("../db").then((m) => m.findExportByExternalKey(type, externalKey)),
  insertFeedback: (f) => import("../db").then((m) => m.insertFeedback(f)),
  addTicketExport: (x) => import("../db").then((m) => m.addTicketExport(x)),
  insertActivity: (a) => import("../db").then((m) => m.insertActivity(a)),
})
