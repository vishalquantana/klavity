import type { IntegrationConfig, ReportContext, SubmitResult, ReportFileAttachment, ReportRecording, Reporter, ClientInfo } from '../types'

// Manual data-URL -> Blob (no fetch(), so a strict connect-src CSP can't block it). Shared by every
// surface that attaches recordings / file uploads to a /api/feedback submit (widget-lib re-exports it,
// KLA-729). Kept here in core so the extension + SDK + widget converge on ONE conversion.
export function dataUrlToBlob(dataUrl: string, overrideType?: string): Blob {
  const comma = dataUrl.indexOf(',')
  const header = dataUrl.slice(0, comma)
  const body = dataUrl.slice(comma + 1)
  const mimeMatch = /data:([^;,]+)/.exec(header)
  const mime = overrideType || (mimeMatch ? mimeMatch[1] : 'application/octet-stream')
  if (/;base64/i.test(header)) {
    const bin = atob(body)
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
    return new Blob([arr], { type: mime })
  }
  return new Blob([decodeURIComponent(body)], { type: mime })
}

// True when the annotations payload carries at least one drawn shape (on the hoisted index-0 entry or any
// per-image byIndex entry) OR a picked-element selector (KLAVITYKLA-228). Guards against serializing an
// empty overlay while still shipping a lone `annotations.selector`. Shared with widget-lib (KLA-729).
export function hasAnnotations(ann: any): boolean {
  if (!ann || typeof ann !== 'object') return false
  if (typeof ann.selector === 'string' && ann.selector.trim() !== '') return true
  const nonEmpty = (o: any) => o && Array.isArray(o.shapes) && o.shapes.length > 0
  if (nonEmpty(ann)) return true
  if (ann.byIndex && typeof ann.byIndex === 'object') {
    for (const k of Object.keys(ann.byIndex)) if (nonEmpty(ann.byIndex[k])) return true
  }
  return false
}

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
  // ── KLA-729: full-payload fields (all optional). Serialized only when present, so a caller that omits
  // them (the extension) produces the exact same FormData as before. These bring the npm/init SDK to parity
  // with the widget's evidence set (buildFeedbackForm in widget-lib serializes the same set via its own path).
  /** PX4 #411: explicit one-line title — server prefers it over the auto-title. */
  title?: string
  /** Source attribution: embedding page's document.referrer. */
  referrer?: string
  /** PX4 #439: resolved reporter identity → feedback.reporter_json. */
  reporter?: Reporter
  /** PX4 #428: captured browser/app info → feedback.client_info_json. */
  clientInfo?: ClientInfo
  /** PX4 #425: non-image file attachments (their own multipart `files` field). */
  files?: ReportFileAttachment[]
  /** KLAVITYKLA-438 "Record me": video recordings (`recording` field(s) + `recording_meta` JSON). */
  recordings?: ReportRecording[]
  /** KLAVITYKLA-217: per-image annotation markup → `annotations_json`. */
  annotations?: unknown
}

/**
 * Build the shared base FormData for a /api/feedback submission.
 * Both the extension path (submitReport) and the widget path (buildFeedbackForm)
 * call this, then append their own path-specific fields on top.
 *
 * KLA-729: the shared serializer now also handles the full evidence set (title/referrer/reporter/
 * clientInfo/files/recordings/annotations) so the npm/init SDK reaches parity by reusing THIS function
 * rather than duplicating serialization. Screenshots stay caller-specific (submitReport fetches blobs;
 * the widget converts data URLs) — everything else converges here.
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
  // ── KLA-729 full-payload extras ──
  if (payload.title) form.set('title', payload.title)
  if (payload.referrer) form.set('referrer', payload.referrer)
  if (payload.reporter && Object.keys(payload.reporter).length) form.set('reporter', JSON.stringify(payload.reporter))
  if (payload.clientInfo && Object.keys(payload.clientInfo).length) form.set('client_info', JSON.stringify(payload.clientInfo))
  if (payload.files) {
    for (const f of payload.files) {
      try { form.append('files', dataUrlToBlob(f.dataUrl, f.type), f.name) } catch { /* skip a malformed data URL */ }
    }
  }
  if (payload.recordings && payload.recordings.length) {
    const meta: Array<{ id: string; durationMs: number; width: number; height: number; bytes: number; mime: string; screenOnly: boolean }> = []
    for (const r of payload.recordings) {
      try {
        const ext = (r.mime || '').includes('mp4') ? 'mp4' : 'webm'
        form.append('recording', dataUrlToBlob(r.dataUrl), `recording-${r.id}.${ext}`)
        meta.push({ id: r.id, durationMs: r.durationMs, width: r.width, height: r.height, bytes: r.bytes, mime: r.mime, screenOnly: r.screenOnly })
      } catch { /* skip a malformed recording */ }
    }
    if (meta.length) form.set('recording_meta', JSON.stringify(meta))
  }
  if (hasAnnotations(payload.annotations)) form.set('annotations_json', JSON.stringify(payload.annotations))
  return form
}
// ─────────────────────────────────────────────────────────────────────────────

export async function submitReport(config: IntegrationConfig): Promise<SubmitResult> {
  const { settings, type, description, context, screenshots, projectId, replayEvents } = config
  // KLA-729: forward the full evidence set (Task/Query kind, title, reporter/clientInfo, files, recordings,
  // annotations, referrer) through the shared serializer so the persist-first backend receives the SAME
  // payload the widget sends. `kind` (Task/Query) supersedes the coarse `type` when present. All optional —
  // the extension passes none of these, so its serialized form is unchanged.
  const form = buildFeedbackFormData({
    type: config.kind ?? type,
    description,
    pageUrl: context.pageUrl,
    context,
    projectId,
    replayEvents,
    title: config.title,
    referrer: config.referrer,
    reporter: config.reporter,
    clientInfo: config.clientInfo,
    files: config.files,
    recordings: config.recordings,
    annotations: config.annotations,
  })
  // KLA-729: the required-email gate value → reporter_email (an "email"-gated project 400s without it).
  if (config.reporterEmail) form.set('reporter_email', config.reporterEmail)

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
  // KLA-729: optional lightweight JPEG previews (index-aligned) so the dashboard list loads fast. The
  // server pairs by index + tolerates a missing/partial set (falls back to the full image), so best-effort.
  if (config.screenshotThumbs) {
    for (const t of config.screenshotThumbs) {
      try { form.append('screenshot_thumbs', dataUrlToBlob(t), 'thumb.jpg') } catch { /* skip a bad thumb */ }
    }
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
