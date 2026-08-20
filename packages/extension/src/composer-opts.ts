import type { IssueKind } from '@klavity/core'

// PX4 #411/#425 (ext↔widget parity): the enhanced-composer opts the extension passes to buildModal,
// derived from a project's `modalConfig.composer`. This mirrors the widget's own validation in
// packages/sdk/src/widget.ts so a project that opts in gets the SAME composer (Title field, extended
// issue-type chips, non-image file attachments) in BOTH the widget and the extension — true parity by
// construction. All fields default OFF, so a project that hasn't opted in renders the classic
// Bug/Feature composer with no Title field / file uploads, exactly as before.
export interface ExtComposerOpts {
  showTitleField: boolean
  allowFileAttachments: boolean
  issueTypes?: Array<{ value: IssueKind; label: string; mappingLabel?: string }>
}

const KNOWN_KINDS: IssueKind[] = ['bug', 'feature', 'task', 'query']

// Parse + clamp `modalConfig.composer` into the opts the extension forwards to buildModal. Defensive by
// construction: a malformed config can never break the composer — unknown issue-type values are dropped,
// labels are length-capped, and an empty/invalid list falls back to the classic Bug/Feature toggle. Kept
// as a pure function (no chrome/DOM refs) so it is unit-testable and identical to the widget's logic.
export function parseComposerOpts(modalConfig: any): ExtComposerOpts {
  const out: ExtComposerOpts = { showTitleField: false, allowFileAttachments: false }
  const composer = (modalConfig && typeof modalConfig === 'object' && typeof modalConfig.composer === 'object' && modalConfig.composer) || null
  if (!composer) return out
  out.showTitleField = composer.title === true || composer.showTitleField === true
  out.allowFileAttachments = composer.fileAttach === true || composer.allowFileAttachments === true
  if (Array.isArray(composer.issueTypes) && composer.issueTypes.length) {
    const cleaned = composer.issueTypes
      .filter((t: any) => t && typeof t.value === 'string' && (KNOWN_KINDS as string[]).includes(t.value))
      .map((t: any) => ({
        value: t.value as IssueKind,
        label: String(t.label || t.value).slice(0, 24),
        mappingLabel: t.mappingLabel ? String(t.mappingLabel).slice(0, 32) : undefined,
      }))
    if (cleaned.length) out.issueTypes = cleaned
  }
  return out
}
