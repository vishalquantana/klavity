// Attachment size caps shared by connectors that natively upload files to the external tracker.
//
// Jira Cloud's default maximum attachment size is 10 MB per file (admin-configurable, but 10 MB is
// the out-of-the-box ceiling), so a file larger than that would be rejected by the tracker anyway —
// we skip it up front and keep the permanent fallback link in the issue body instead of wasting a
// round-trip that will 413. We also cap the WHOLE batch so a report with many/large files can't turn
// one export into a multi-hundred-MB upload storm.
//
// These are best-effort limits: an over-cap file is dropped from the native upload (its body link
// still works), never a hard error that fails the export.
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024 // 10 MB per file (Jira default)
export const MAX_TOTAL_ATTACHMENT_BYTES = 25 * 1024 * 1024 // 25 MB across all files in one export

export type SizedAttachment = { filename: string; bytes: Uint8Array }

export type CapSelection<T extends SizedAttachment> = {
  // Files that fit within both the per-file and running total caps, in original order.
  accepted: T[]
  // Files dropped from native upload, each with a short human reason (per-file or total cap).
  skipped: Array<{ att: T; reason: string }>
}

// Select the attachments that fit within the per-file and cumulative-total caps. Deterministic:
// walks the list in order, admitting each file whose own size is within the per-file cap AND whose
// admission keeps the running total within the batch cap; everything else is reported as skipped
// with a reason. Never throws.
export function selectAttachmentsWithinCaps<T extends SizedAttachment>(atts: T[]): CapSelection<T> {
  const accepted: T[] = []
  const skipped: Array<{ att: T; reason: string }> = []
  let total = 0
  for (const att of atts) {
    const size = att.bytes?.byteLength ?? 0
    if (size > MAX_ATTACHMENT_BYTES) {
      skipped.push({ att, reason: `exceeds per-file cap (${size} > ${MAX_ATTACHMENT_BYTES} bytes)` })
      continue
    }
    if (total + size > MAX_TOTAL_ATTACHMENT_BYTES) {
      skipped.push({ att, reason: `exceeds total attachment cap (${MAX_TOTAL_ATTACHMENT_BYTES} bytes)` })
      continue
    }
    total += size
    accepted.push(att)
  }
  return { accepted, skipped }
}
