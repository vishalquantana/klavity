import type { IntegrationConfig, ReportContext, SubmitResult } from '../types'

// ── Shared serializer ────────────────────────────────────────────────────────
// Produces a FormData containing EVERY field that both the extension (submitReport)
// and the in-page widget (buildFeedbackForm in widget-lib.ts) send to /api/feedback.
// Adding a field here propagates to BOTH paths automatically, preventing the kind of
// drift that caused KLAVITYKLA-208 (missing `type` on widget submissions).
//
// CALLERS: append their own path-specific fields on top of this base:
//   • submitReport   → plane creds (direct mode) + screenshots (fetched blobs)
//   • buildFeedbackForm → referrer + annotations_json + screenshots (data-URL blobs)
//   • submitFeedback (widget.ts) → reporter_email (set after buildFeedbackForm returns)
export interface FeedbackFormPayload {
  /** "bug" | "feature" — server routes on this; defaults to "bug" when absent */
  type?: string
  description: string
  /** Top-level page URL shortcut — also inside context, but the server reads this field directly */
  pageUrl: string
  /** Captured dev-tools context (console + network + env + identity/metadata) */
  context?: ReportContext
  /** Klavity project ID; server uses this to scope the report */
  projectId?: string
  /** Rolling rrweb DOM-event buffer; omitted when empty (server stores nothing for zero-length buffers) */
  replayEvents?: unknown[]
}

/**
 * Build the shared base FormData for a /api/feedback submission.
 * Both the extension path (submitReport) and the widget path (buildFeedbackForm)
 * call this, then append their own path-specific fields on top.
 */
export function buildFeedbackFormData(payload: FeedbackFormPayload): FormData {
  const form = new FormData()
  form.set('type', payload.type ?? 'bug')
  form.set('description', payload.description)
  form.set('page_url', payload.pageUrl)
  if (payload.context) form.set('context', JSON.stringify(payload.context))
  if (payload.projectId) form.set('project_id', payload.projectId)
  // G1 session replay: attach the rolling rrweb buffer when present.
  if (payload.replayEvents && payload.replayEvents.length) form.set('replay_events', JSON.stringify(payload.replayEvents))
  return form
}
// ─────────────────────────────────────────────────────────────────────────────

export async function submitReport(config: IntegrationConfig): Promise<SubmitResult> {
  const { settings, type, description, context, screenshots, projectId, replayEvents } = config
  // Use the shared serializer for common fields so extension + widget stay in parity by construction.
  const form = buildFeedbackFormData({ type, description, pageUrl: context.pageUrl, context, projectId, replayEvents })

  // Klavity mode: signed-in user. The backend resolves their personal→team connection,
  // so the tracker token never leaves the server — we send only a Bearer token.
  const useKlavity = settings.connectionMode === 'klavity' && !!settings.klavToken
  if (!useKlavity) {
    // Direct mode (Phase 1): forward this browser's own Plane creds over TLS.
    const { plane } = settings
    form.append('plane_token', plane.token)
    form.append('plane_workspace', plane.workspace)
    form.append('plane_project_id', plane.projectId)
    form.append('plane_host', plane.host)
  }

  for (let i = 0; i < screenshots.length; i++) {
    const blob = await (await fetch(screenshots[i])).blob()
    form.append('screenshots', blob, `screenshot-${i}.png`)
  }

  const headers: Record<string, string> = useKlavity ? { Authorization: `Bearer ${settings.klavToken}` } : {}
  const res = await fetch(`${settings.backendUrl}/api/feedback`, { method: 'POST', headers, body: form })

  if (!res.ok) throw new Error(`Klavity backend error ${res.status}: ${await res.text()}`)

  const data = await res.json() as { id: string; jira_key?: string; issue_url?: string }
  return {
    issueKey: data.jira_key ?? data.id,
    issueUrl: data.issue_url ?? settings.backendUrl,
  }
}
