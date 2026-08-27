export type IntegrationType = 'jira' | 'linear' | 'github' | 'plane'
export type ReportType = 'bug' | 'feature'

// PX4 #411: the full set of issue "kinds" the enhanced composer can file. A superset of ReportType —
// ReportType stays the 2-value union used by the extension + message protocol (which only ever opens
// Bug/Feature), while the widget composer can additionally file Task/Query. Task/Query map to the
// tracker's DEFAULT issue type unless an admin overrides them per-project via the connector
// issue_type_map (see resolve-issue-type.ts). Widening is additive: 'bug'|'feature' still satisfy it.
export type IssueKind = 'bug' | 'feature' | 'task' | 'query'

// PX4 #425: a non-image file the reporter attached to the report (PDF, .log, .har, .txt, ...). Carried
// alongside `screenshots` (which stay images) and threaded to the connector so it can attach the file
// natively to the external issue. `dataUrl` is a base64 data: URL of the file bytes; `type` is the
// browser-reported MIME (may be '' for unknown types like .log/.har — the server infers from name).
export interface ReportFileAttachment {
  name: string
  type: string
  size: number
  dataUrl: string
}

// KLAVITYKLA-438 "Record me" (Phase 1): a screen+camera(PiP)+mic-narration recording captured from the
// composer and attached to the report as a video. `id` is a stable per-recording identity minted at
// capture time so Phase 2's transcript can be attached back to the exact recording. Mirrors the sdk's
// RecordingAttachment shape (packages/sdk/src/recorder.ts) — kept in core so the composer stays sdk-free.
export interface ReportRecording {
  id: string
  dataUrl: string      // data:video/webm;base64,... (or mp4 on Safari)
  mime: string
  durationMs: number
  bytes: number
  width: number
  height: number
  screenOnly: boolean  // true when camera/mic were blocked (site Permissions-Policy) → screen-only clip
}

// How the extension authenticates to the Klavity backend:
//   'klavity' — signed-in user; backend resolves their personal→team connection (token stays server-side)
//   'direct'  — no account; the extension forwards its own tracker creds (Phase 1 behavior)
export type ConnectionMode = 'klavity' | 'direct'

export interface KlavitySettings {
  integration: IntegrationType
  backendUrl: string
  autoFileErrors: boolean
  connectionMode: ConnectionMode
  klavToken: string // Klavity session/Bearer token from email→OTP login (empty until signed in)
  jira: { baseUrl: string; email: string; token: string; projectKey: string }
  linear: { apiKey: string; teamId: string }
  github: { token: string; repo: string } // "owner/repo"
  plane: { token: string; host: string; workspace: string; projectId: string } // host: API base — https://api.plane.so or a self-hosted origin
}

// KLA-720: client-direct submit mode removed — every report persists through the Klavity backend.
// When a caller (SDK/extension) hasn't configured an explicit backendUrl, dispatchSubmit falls back
// to this canonical Klavity backend rather than ever POSTing straight to an external tracker.
export const DEFAULT_BACKEND_URL = 'https://klavity.in'

export const DEFAULT_SETTINGS: KlavitySettings = {
  integration: 'jira',
  backendUrl: '',
  autoFileErrors: false,
  connectionMode: 'direct',
  klavToken: '',
  jira: { baseUrl: '', email: '', token: '', projectKey: '' },
  linear: { apiKey: '', teamId: '' },
  github: { token: '', repo: '' },
  plane: { token: '', host: 'https://api.plane.so', workspace: '', projectId: '' },
}

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error'

export interface ConsoleError {
  message: string
  stack?: string
  timestamp: number
  // Console level (G3). Optional + defaults to 'error' so pre-existing rows / consumers that only
  // ever saw errors stay valid. Errors from window.onerror / unhandledrejection keep 'error'.
  level?: ConsoleLevel
}

export interface NetworkFailure {
  url: string
  // status is the HTTP status code. 0 means the request never completed (network error / abort).
  // With full-fidelity capture (G3) this is recorded for ALL requests, not just status >= 400.
  status: number
  method: string
  timestamp: number
  // Round-trip duration in milliseconds (G3). Optional for backward compatibility.
  durationMs?: number
}

// Arbitrary site-owner-supplied identity + key/values (G5). Plumbed through the report context and
// surfaced on the ticket. Values are coerced to strings and length-capped server-/client-side.
// PX4 #439: the named identity fields (org/orgId/role/product/env/server) are additive — they were
// always allowed by the string index signature, but naming them documents the Identify API contract
// and lets `Reporter` (below) reuse the same shape. The index signature keeps arbitrary keys valid.
export interface ReportIdentity {
  id?: string
  email?: string
  name?: string
  org?: string
  orgId?: string
  role?: string
  product?: string
  env?: string
  server?: string
  [key: string]: string | undefined
}

// PX4 #439: the resolved reporter identity attached to a report by the Identify API. A typed superset
// of the historical {id,email,name} G5 identity: adds org/orgId/role/product/env/server so a filed
// ticket is attributed to the right person, org, and environment with zero extra typing. Every value
// is coerced to a capped string client-side (widget/SDK) and re-sanitized server-side. All fields are
// optional — a report with no identity omits the object entirely (full back-compat).
export interface Reporter {
  id?: string
  email?: string
  name?: string
  org?: string
  orgId?: string
  role?: string
  product?: string
  env?: string
  server?: string
}

// PX4 #428: client/browser/app info captured at report time. `userAgent` overlaps ReportContext for
// convenience; the parsed browser/os/locale fields are the value-add (readable attribution in the
// ticket + queryable columns). Optional throughout — absent fields are simply omitted.
export interface ClientInfo {
  userAgent?: string
  browser?: string          // parsed browser name, e.g. "Chrome", "Safari", "Firefox", "Edge"
  browserVersion?: string   // parsed major(.minor) version, e.g. "127" / "17.4"
  os?: string               // parsed OS, e.g. "macOS", "Windows", "Android", "iOS", "Linux"
  deviceType?: string       // "desktop" | "mobile" | "tablet"
  viewport?: string         // innerWidth x innerHeight, e.g. "1280x800"
  screen?: string           // screen.width x screen.height, e.g. "1920x1080"
  devicePixelRatio?: number // window.devicePixelRatio (rounded)
  locale?: string           // navigator.language, e.g. "en-US"
  languages?: string        // navigator.languages joined, capped
  timezone?: string         // Intl.DateTimeFormat resolved timeZone, e.g. "Australia/Sydney"
}

// A PerformanceObserver entry captured by the widget (G3 supplement). Covers signals that
// fetch/XHR wrappers cannot see: long main-thread tasks, paint timing, and browser-loaded
// sub-resources (images, scripts, stylesheets). Optional — absent on platforms that do not
// support PerformanceObserver or when the widget is not used.
export interface PerfEntry {
  // Entry type: longtask (main-thread block >50ms), paint (FP/FCP), resource (sub-resource load).
  type: 'longtask' | 'paint' | 'resource'
  // Name from the PerformanceEntry. For paint: 'first-paint' | 'first-contentful-paint'.
  // For resource: the (redacted) URL. For longtask: 'longtask'.
  name: string
  // Epoch timestamp (ms) derived from performance.timeOrigin + entry.startTime.
  startMs: number
  // Entry duration in ms (0 for paint marks).
  durationMs: number
  // Resource entries only: 'img', 'script', 'link', 'css', 'other', etc.
  initiatorType?: string
}

export interface ReportContext {
  pageUrl: string
  userAgent: string
  screenSize: string
  viewportSize: string
  consoleErrors: ConsoleError[]
  networkFailures: NetworkFailure[]
  // Custom metadata / identity (G5). Optional so existing payloads stay valid.
  identity?: ReportIdentity
  metadata?: Record<string, string>
  // PerformanceObserver entries (G3 supplement). Optional: absent on unsupported platforms.
  perfEntries?: PerfEntry[]
}

export interface SubmitReportPayload {
  type: ReportType
  // PX4 #411: optional one-line issue title. When present the connector uses it verbatim as the external
  // issue summary/title; when absent the server falls back to the existing auto-title (first line of the
  // description / AI-drafted). Optional so existing payloads stay valid.
  title?: string
  // PX4 #411: the filed issue kind when it goes beyond Bug/Feature (Task/Query). Optional + additive: when
  // absent the server uses `type`. The extension only ever sets `type`; the widget composer sets this.
  kind?: IssueKind
  description: string
  context: ReportContext
  screenshots: string[] // data URLs (PNG or JPEG)
  // PX4 #425: non-image file attachments (PDF, logs, .har, ...). Optional; screenshots keep their own path.
  files?: ReportFileAttachment[]
  // KLAVITYKLA-438: "Record me" video recordings (screen+camera+mic). Optional + additive — absent when the
  // composer's recording flag is off or the reporter attached none. Threaded to /api/feedback as `recording`.
  recordings?: ReportRecording[]
  projectId?: string    // Klavity project ID; if set, report lands in that project
  // PX4 #439: the resolved reporter identity (Identify API / config / data-attrs / safe fallback). Threaded
  // to /api/feedback as `reporter` and persisted to feedback.reporter_json for connector attribution.
  // Optional + additive — no identity => object omitted, composer behaves exactly as today.
  reporter?: Reporter
  // PX4 #428: captured client/browser/app info. Threaded as `client_info` and persisted to
  // feedback.client_info_json. Optional so existing payloads stay valid.
  clientInfo?: ClientInfo
  // KLA-729 (SDK parity): structured annotation overlay markup ({ w, h, shapes, byIndex, selector }).
  // Threaded to /api/feedback as `annotations_json`. Optional + additive — absent => nothing serialized.
  annotations?: unknown
  // KLA-729: the email typed into the required-email gate. Threaded as `reporter_email`. Optional.
  reporterEmail?: string
  // KLA-729: embed-page referrer (document.referrer). Threaded as `referrer`. Optional.
  referrer?: string
  // KLA-729: lightweight per-screenshot JPEG previews (index-aligned with `screenshots`). Optional.
  // KLA-727 (ext↔widget parity) relies on this same field — the extension now generates thumbnails in the
  // content script (canvas) since the MV3 service worker has no DOM, and forwards them here.
  screenshotThumbs?: string[]
  // G1 session replay: rolling rrweb DOM-event buffer (Klavity backend integration only).
  replayEvents?: unknown[]
}

export interface SubmitResult {
  issueKey: string
  issueUrl: string
}

export interface IntegrationConfig {
  type: ReportType
  description: string
  context: ReportContext
  screenshots: string[]
  settings: KlavitySettings
  projectId?: string    // threaded from SubmitReportPayload; backend appends as project_id
  // KLA-729 (SDK parity): full-payload fields forwarded from SubmitReportPayload so the backend
  // integration (persist-first /api/feedback) receives the SAME evidence the widget sends. All optional
  // + additive — the extension omits them and its serialized form is byte-identical to before.
  title?: string
  kind?: IssueKind
  files?: ReportFileAttachment[]
  recordings?: ReportRecording[]
  reporter?: Reporter
  clientInfo?: ClientInfo
  annotations?: unknown
  reporterEmail?: string
  referrer?: string
  screenshotThumbs?: string[]
  // G1 session replay: rolling rrweb DOM-event buffer (only the Klavity backend integration uses it).
  replayEvents?: unknown[]
}

// Extension message protocol
export type BackgroundMessage =
  | { kind: 'CAPTURE_TAB' }
  | { kind: 'SUBMIT_REPORT'; payload: SubmitReportPayload }
  | { kind: 'AUTO_FILE_ERROR'; message: string; stack?: string; pageUrl: string; timestamp: number }
  | { kind: 'OPEN_TRACKER_URL' }
  // ── Live activation (P3b) — content asks background to act (SW holds the token + does cross-origin fetch) ──
  | { kind: 'KLAV_GET_CONFIG' }                              // read cached config from storage (no fetch)
  | { kind: 'KLAV_SYNC_CONFIG' }                             // force a re-fetch of /api/extension/config
  | { kind: 'KLAV_CAPTURE_REVIEW' }                          // captureVisibleTab for a review (separate from bug CAPTURE_TAB)
  | { kind: 'KLAV_REVIEW'; projectId: string; url: string; domSig: string; screenshotDataUrl: string; adhoc?: boolean } // POST /api/sim/review
  | { kind: 'KLAV_CONSENT'; projectId: string; status: 'granted' | 'paused' | 'revoked' }               // POST /api/consent
  | { kind: 'KLAV_RECONCILE_SCRIPTS' }                       // re-register dynamic content scripts after a host-permission grant
  | { kind: 'KLAV_DEPLOY_SIMS'; projectId: string; simIds: string[] | 'all' } // trigger sims-live deploy (Dev2 hook)

export type KlavMonitoredProject = { id: string; name: string; reviewMode: string; monitoredUrls: string[] }
export interface KlavConfig {
  email: string
  token: string                      // dedicated narrow-scope extension token (NOT the raw session id)
  backendUrl: string
  projects: KlavMonitoredProject[]
  syncedAt: number
  /**
   * Version stamp of the project config the backend served (KLAVITYKLA-320). Changes
   * whenever an admin edits reviewMode / monitored URLs in the dashboard, so the
   * extension can cheaply revalidate instead of serving a stale cache. Optional
   * because caches written by older builds won't have it (treated as "unknown" →
   * forces one full resync).
   */
  configVersion?: string
}

export type ContentMessage =
  | { kind: 'OPEN_MODAL'; reportType: ReportType }
  | { kind: 'CAPTURE_TAB_RESULT'; dataUrl: string; error?: string }
  | { kind: 'SUBMIT_SUCCESS'; issueKey: string; issueUrl: string }
  | { kind: 'SUBMIT_ERROR'; message: string }
  // ── Live activation (P3b) responses ──
  | { kind: 'KLAV_CAPTURE_REVIEW_RESULT'; dataUrl: string; error?: string }
  | { kind: 'KLAV_CONFIG_UPDATED'; config: KlavConfig | null }   // pushed after a sync so content refreshes its cache
  | { kind: 'KLAV_NUDGE_ROUTE' }                                 // tabs.onUpdated SPA backstop → re-evaluate URL
  // ── Ad-hoc "Analyze this page" (Task 4) ──
  | { kind: 'KLAV_ADHOC_REVIEW'; projectId: string }             // popup → content: run an explicit one-shot review

export type Shape =
  | { type: 'pen'; color: string; points: Array<{ x: number; y: number }> }
  | { type: 'rect'; color: string; x: number; y: number; w: number; h: number }
  | { type: 'arrow'; color: string; x1: number; y1: number; x2: number; y2: number }
  // straight line segment from (x1,y1) to (x2,y2)
  | { type: 'line'; color: string; x1: number; y1: number; x2: number; y2: number }
  | { type: 'text'; color: string; x: number; y: number; text: string; size?: number; outline?: 'black' | 'white' | 'none' }
  // circle is an axis-aligned ellipse; (x,y) is the centre, rx/ry the radii (from the drag bbox)
  | { type: 'circle'; color: string; x: number; y: number; rx: number; ry: number }
  // numbered marker pin: filled dot with a step number, dropped by the count tool
  | { type: 'count'; color: string; x: number; y: number; n: number }
  // redaction: an axis-aligned region that is pixelated (mosaic) into the baked image for privacy
  | { type: 'pixelate'; x: number; y: number; w: number; h: number }
