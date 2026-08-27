import { advanceFeedbackToOpenIfNew, updateFeedbackTracker } from "./db"

// KLA-718 — "no lost report" / persist-first invariant: shared finalization for a report that has just
// been SUCCESSFULLY filed to an external tracker (Plane/Jira/…). Two things must happen, and they must
// happen in ONE place so the inline auto-copy success path and the export-outbox RETRY sweep can never
// drift again:
//   (1) stamp the primary Plane tracker key/url on the persisted row (so /dashboard shows it as filed);
//   (2) advance the row OUT of the 'new' triage inbox onto the Tickets board.
//
// advanceFeedbackToOpenIfNew is `WHERE status='new'` — idempotent, and it never downgrades an already
// open / in-progress / urgent row — so it is safe to call unconditionally after any successful export.
//
// The export-outbox retry sweep previously did (1) but NOT (2). An autofiled human Snap whose FIRST
// export attempt failed (tracker blip) was queued to the outbox; when a later sweep succeeded it created
// the external ticket but left the feedback row stranded at status='new'. The report was therefore
// invisible on the Tickets board even though its Plane ticket existed — exactly the "you lost my report"
// failure this fixes. Deriving both effects from the PERSISTED feedback row keeps the invariant that
// nothing external is stamped/advanced without a row to stamp it on.
export interface ExportFinalizeDeps {
  advanceFeedbackToOpenIfNew: typeof advanceFeedbackToOpenIfNew
  updateFeedbackTracker: typeof updateFeedbackTracker
}

export interface FinalizeExportOpts {
  feedbackId: string
  projectId: string
  /** connector type ("plane" | "jira" | …); tracker writeback only fires for the primary "plane" tracker. */
  connectorType?: string | null
  externalKey?: string | null
  externalUrl?: string | null
  /** true when the row already carries a plane_issue_key — don't overwrite a manually/previously set key. */
  hasExistingTrackerKey?: boolean
}

// Best-effort by contract: a failure in EITHER step is logged and swallowed — a successful external
// filing must never be turned into an error by a follow-up bookkeeping write.
export async function finalizeSuccessfulExport(
  opts: FinalizeExportOpts,
  deps: ExportFinalizeDeps = { advanceFeedbackToOpenIfNew, updateFeedbackTracker },
): Promise<void> {
  if (opts.connectorType === "plane" && !opts.hasExistingTrackerKey) {
    await deps
      .updateFeedbackTracker(opts.feedbackId, opts.externalKey ?? null, opts.externalUrl ?? null)
      .catch((e: any) => console.warn("[export-finalize] tracker writeback failed (non-fatal):", e?.message || e))
  }
  // Mirror the inline auto-copy advance (server.ts autoCopyFeedback) so a report filed on RETRY leaves
  // "New Reports" and appears on the Tickets board. Idempotent (WHERE status='new'); never downgrades.
  await deps
    .advanceFeedbackToOpenIfNew(opts.feedbackId, opts.projectId)
    .catch((e: any) => console.warn("[export-finalize] status advance failed (non-fatal):", e?.message || e))
}
