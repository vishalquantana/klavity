// Pure helpers for assembling a Plane issue body from a feedback report.

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ── Captured dev-tools context (G2/G3/G5) ──
// Server-side sanitize + cap of the client-supplied ReportContext: bound array lengths, truncate
// strings, and coerce identity/metadata to short string maps. Returns null for absent/garbage input
// so a malformed `context` form field never poisons the row or the ticket body.
const CTX_MAX_ENTRIES = 50      // matches the client ring-buffer cap
const CTX_MAX_STR = 2000
const CTX_MAX_META_KEYS = 50

function capStr(v: any, max = CTX_MAX_STR): string { return String(v ?? '').slice(0, max) }

// Query parameter names commonly used to carry secrets in request URLs.
// These are redacted before storing networkFailures to prevent API keys / auth tokens from
// propagating into DB rows, Plane/GitHub ticket bodies, and AI prompts.
export const SENSITIVE_PARAM_NAMES = new Set([
  'token', 'api_key', 'apikey', 'api-key', 'access_token', 'auth_token', 'authtoken',
  'secret', 'password', 'passwd', 'pwd', 'key', 'authorization',
  'session_id', 'sessionid', 'session', 'private_key', 'client_secret', 'client_id',
  'oauth_token', 'bearer', 'x-api-key',
])

/**
 * Strip sensitive query parameter values from a URL string before storage.
 * Non-parseable URLs (relative, malformed, data:) are returned unchanged —
 * they can't carry structured query params and are already capped by the caller.
 */
export function redactSensitiveParams(urlStr: string): string {
  try {
    const u = new URL(urlStr)
    let changed = false
    for (const k of [...u.searchParams.keys()]) {
      if (SENSITIVE_PARAM_NAMES.has(k.toLowerCase())) {
        u.searchParams.set(k, 'REDACTED')
        changed = true
      }
    }
    return changed ? u.toString() : urlStr
  } catch {
    return urlStr // unparseable — leave as-is
  }
}

const PERF_TYPES = new Set(['longtask', 'paint', 'resource'])

export function sanitizeClientContext(raw: any): any | null {
  if (!raw || typeof raw !== 'object') return null
  const out: any = {}
  if (raw.pageUrl) out.pageUrl = capStr(raw.pageUrl, 1000)
  if (raw.userAgent) out.userAgent = capStr(raw.userAgent, 500)
  if (raw.screenSize) out.screenSize = capStr(raw.screenSize, 40)
  if (raw.viewportSize) out.viewportSize = capStr(raw.viewportSize, 40)
  if (Array.isArray(raw.consoleErrors)) {
    out.consoleErrors = raw.consoleErrors.slice(0, CTX_MAX_ENTRIES).map((e: any) => ({
      message: capStr(e?.message),
      level: ['log', 'info', 'warn', 'error'].includes(e?.level) ? e.level : 'error',
      timestamp: Number(e?.timestamp) || 0,
      ...(e?.stack ? { stack: capStr(e.stack) } : {}),
    }))
  }
  if (Array.isArray(raw.networkFailures)) {
    out.networkFailures = raw.networkFailures.slice(0, CTX_MAX_ENTRIES).map((n: any) => ({
      url: redactSensitiveParams(capStr(n?.url, 1000)),
      status: Number(n?.status) || 0,
      method: capStr(n?.method, 10),
      timestamp: Number(n?.timestamp) || 0,
      ...(n?.durationMs != null ? { durationMs: Number(n.durationMs) || 0 } : {}),
    }))
  }
  // G3 PerformanceObserver entries: longtask, paint, resource sub-resources.
  if (Array.isArray(raw.perfEntries)) {
    out.perfEntries = raw.perfEntries.slice(0, CTX_MAX_ENTRIES).map((p: any) => ({
      type: PERF_TYPES.has(p?.type) ? p.type : 'resource',
      name: capStr(p?.name, 1000),
      startMs: Number(p?.startMs) || 0,
      durationMs: Number(p?.durationMs) || 0,
      ...(p?.initiatorType ? { initiatorType: capStr(p.initiatorType, 30) } : {}),
    }))
  }
  const coerceMap = (m: any): Record<string, string> | undefined => {
    if (!m || typeof m !== 'object') return undefined
    const r: Record<string, string> = {}
    let i = 0
    for (const [k, v] of Object.entries(m)) {
      if (i++ >= CTX_MAX_META_KEYS) break
      if (v === undefined || v === null) continue
      r[String(k).slice(0, 64)] = capStr(v, 1000)
    }
    return Object.keys(r).length ? r : undefined
  }
  const identity = coerceMap(raw.identity)
  const metadata = coerceMap(raw.metadata)
  if (identity) out.identity = identity
  if (metadata) out.metadata = metadata
  return Object.keys(out).length ? out : null
}

// ── PX4 #439 reporter identity ──
// Server-side sanitize of the client-supplied `reporter` field: allow ONLY the known named keys,
// coerce each to a short string, drop empties. Returns null for absent/garbage input so a malformed
// blob never poisons the row or the ticket body.
const REPORTER_KEYS = ['id', 'email', 'name', 'org', 'orgId', 'role', 'product', 'env', 'server'] as const

export function sanitizeReporter(raw: any): Record<string, string> | null {
  if (!raw || typeof raw !== 'object') return null
  const out: Record<string, string> = {}
  for (const k of REPORTER_KEYS) {
    const v = (raw as any)[k]
    if (v === undefined || v === null) continue
    const s = capStr(v, 500).trim()
    if (s) out[k] = s
  }
  return Object.keys(out).length ? out : null
}

// ── PX4 #428 client/browser/app info ──
// Sanitize the client-supplied `client_info` field: allowlisted keys, capped strings, numeric dpr.
const CLIENT_INFO_STR_KEYS = ['userAgent', 'browser', 'browserVersion', 'os', 'deviceType', 'viewport', 'screen', 'locale', 'languages', 'timezone'] as const

export function sanitizeClientInfo(raw: any): Record<string, any> | null {
  if (!raw || typeof raw !== 'object') return null
  const out: Record<string, any> = {}
  for (const k of CLIENT_INFO_STR_KEYS) {
    const v = (raw as any)[k]
    if (v === undefined || v === null) continue
    const cap = k === 'userAgent' ? 500 : 120
    const s = capStr(v, cap).trim()
    if (s) out[k] = s
  }
  const dpr = Number((raw as any).devicePixelRatio)
  if (isFinite(dpr) && dpr > 0 && dpr < 20) out.devicePixelRatio = Math.round(dpr * 100) / 100
  return Object.keys(out).length ? out : null
}

// Human-friendly ordered field labels for the ticket body reporter block.
const REPORTER_LABELS: Record<string, string> = {
  name: 'Name', email: 'Email', id: 'User ID', org: 'Org', orgId: 'Org ID',
  role: 'Role', product: 'Product', env: 'Environment', server: 'Server',
}

// Render the reporter identity as plain-text lines for connector bodies (text). Empty array when absent.
export function reporterLines(reporter: any): string[] {
  if (!reporter || typeof reporter !== 'object') return []
  const entries = REPORTER_KEYS.filter((k) => reporter[k]).map((k) => `  ${REPORTER_LABELS[k] || k}: ${capStr(reporter[k], 500)}`)
  return entries.length ? ['Reporter:', ...entries] : []
}

// Render the captured client/browser info as a compact plain-text line. Empty array when absent.
export function clientInfoLines(ci: any): string[] {
  if (!ci || typeof ci !== 'object') return []
  const bits: string[] = []
  if (ci.browser) bits.push(`${capStr(ci.browser, 60)}${ci.browserVersion ? ' ' + capStr(ci.browserVersion, 40) : ''}`)
  if (ci.os) bits.push(capStr(ci.os, 60))
  if (ci.deviceType) bits.push(capStr(ci.deviceType, 20))
  if (ci.viewport) bits.push(`viewport ${capStr(ci.viewport, 40)}`)
  if (ci.locale) bits.push(capStr(ci.locale, 35))
  if (ci.timezone) bits.push(capStr(ci.timezone, 60))
  return bits.length ? [`Client: ${bits.join(' | ')}`] : []
}

// Render reporter + client info as an HTML block for connectors whose body is HTML (escaped, safe).
export function reporterClientInfoHtml(reporter: any, ci: any): string {
  const parts: string[] = []
  const rl = reporterLines(reporter)
  if (rl.length) {
    const rows = REPORTER_KEYS.filter((k) => reporter[k]).map((k) => `<li>${escapeHtml(REPORTER_LABELS[k] || k)}: ${escapeHtml(capStr(reporter[k], 500))}</li>`).join('')
    parts.push(`<p><strong>Reporter:</strong></p><ul>${rows}</ul>`)
  }
  const cl = clientInfoLines(ci)
  if (cl.length) parts.push(`<p><strong>${escapeHtml(cl[0])}</strong></p>`)
  return parts.join('')
}

// Render the captured context as an HTML block appended to the issue body (escaped, safe).
export function clientContextHtml(ctx: any, opts: { skipIdentity?: boolean } = {}): string {
  if (!ctx) return ''
  const parts: string[] = []
  if (ctx.userAgent) parts.push(`<p><strong>Browser:</strong> ${escapeHtml(capStr(ctx.userAgent, 500))}</p>`)
  if (ctx.screenSize || ctx.viewportSize) {
    parts.push(`<p><strong>Screen:</strong> ${escapeHtml(capStr(ctx.screenSize, 40))} &nbsp;|&nbsp; <strong>Viewport:</strong> ${escapeHtml(capStr(ctx.viewportSize, 40))}</p>`)
  }
  // PX4 #439: when a dedicated reporter block is rendered from reporter_json, skip context.identity here
  // so the person isn't listed twice.
  const identityEntries = (ctx.identity && !opts.skipIdentity) ? Object.entries(ctx.identity) : []
  const metaEntries = ctx.metadata ? Object.entries(ctx.metadata) : []
  if (identityEntries.length || metaEntries.length) {
    const rows = [...identityEntries, ...metaEntries]
      .map(([k, v]) => `<li>${escapeHtml(String(k))}: ${escapeHtml(String(v))}</li>`).join('')
    parts.push(`<p><strong>User / metadata:</strong></p><ul>${rows}</ul>`)
  }
  if (Array.isArray(ctx.consoleErrors) && ctx.consoleErrors.length) {
    const rows = ctx.consoleErrors
      .map((e: any) => `<li>[${escapeHtml(String(e.level || 'error'))}] ${escapeHtml(capStr(e.message))}</li>`).join('')
    parts.push(`<p><strong>Console (${ctx.consoleErrors.length}):</strong></p><ul>${rows}</ul>`)
  }
  if (Array.isArray(ctx.networkFailures) && ctx.networkFailures.length) {
    const rows = ctx.networkFailures
      .map((n: any) => `<li>${escapeHtml(String(n.method || 'GET'))} ${escapeHtml(capStr(n.url, 1000))} → ${escapeHtml(String(n.status))}${n.durationMs != null ? ` (${escapeHtml(String(n.durationMs))}ms)` : ''}</li>`).join('')
    parts.push(`<p><strong>Network (${ctx.networkFailures.length}):</strong></p><ul>${rows}</ul>`)
  }
  if (Array.isArray(ctx.perfEntries) && ctx.perfEntries.length) {
    const rows = ctx.perfEntries.map((p: any) => {
      const type = String(p.type || 'resource')
      const name = escapeHtml(capStr(p.name, 200))
      const dur = p.durationMs != null && p.durationMs > 0 ? ` ${escapeHtml(String(p.durationMs))}ms` : ''
      const init = p.initiatorType ? ` [${escapeHtml(String(p.initiatorType))}]` : ''
      return `<li>[${escapeHtml(type)}]${init} ${name}${dur}</li>`
    }).join('')
    parts.push(`<p><strong>Performance (${ctx.perfEntries.length}):</strong></p><ul>${rows}</ul>`)
  }
  return parts.length ? `<hr/>${parts.join('')}` : ''
}

// Render the captured context as plain-text lines for connectors whose body is text (G2).
export function clientContextLines(ctx: any, opts: { skipIdentity?: boolean } = {}): string[] {
  if (!ctx) return []
  const lines: string[] = []
  if (ctx.userAgent) lines.push(`Browser: ${capStr(ctx.userAgent, 500)}`)
  if (ctx.screenSize || ctx.viewportSize) lines.push(`Screen: ${capStr(ctx.screenSize, 40)} | Viewport: ${capStr(ctx.viewportSize, 40)}`)
  // PX4 #439: skip context.identity when a dedicated reporter block already renders the person.
  const identityEntries = (ctx.identity && !opts.skipIdentity) ? Object.entries(ctx.identity) : []
  const metaEntries = ctx.metadata ? Object.entries(ctx.metadata) : []
  for (const [k, v] of [...identityEntries, ...metaEntries]) lines.push(`${k}: ${v}`)
  if (Array.isArray(ctx.consoleErrors) && ctx.consoleErrors.length) {
    lines.push(`Console (${ctx.consoleErrors.length}):`)
    for (const e of ctx.consoleErrors) lines.push(`  [${e.level || 'error'}] ${capStr(e.message)}`)
  }
  if (Array.isArray(ctx.networkFailures) && ctx.networkFailures.length) {
    lines.push(`Network (${ctx.networkFailures.length}):`)
    for (const n of ctx.networkFailures) lines.push(`  ${n.method || 'GET'} ${capStr(n.url, 1000)} → ${n.status}${n.durationMs != null ? ` (${n.durationMs}ms)` : ''}`)
  }
  if (Array.isArray(ctx.perfEntries) && ctx.perfEntries.length) {
    lines.push(`Performance (${ctx.perfEntries.length}):`)
    for (const p of ctx.perfEntries) {
      const dur = p.durationMs != null && p.durationMs > 0 ? ` ${p.durationMs}ms` : ''
      const init = p.initiatorType ? ` [${p.initiatorType}]` : ''
      lines.push(`  [${p.type || 'resource'}]${init} ${capStr(p.name, 200)}${dur}`)
    }
  }
  return lines
}

export function buildIssueHtml(description: string, pageUrl: string, imageUrls: string[], clientContext?: any, sourceReferrer?: string): string {
  const parts = [
    `<p>${escapeHtml(description)}</p>`,
    `<p><strong>Page:</strong> ${escapeHtml(pageUrl)}</p>`,
  ]
  // Source attribution: where the visitor came from (document.referrer), when present.
  if (sourceReferrer) parts.push(`<p><strong>Referred from:</strong> ${escapeHtml(sourceReferrer)}</p>`)
  for (let i = 0; i < imageUrls.length; i++) {
    // imageUrls come from our own S3 upload, so they are safe to use as attribute values.
    parts.push(`<p><img src="${imageUrls[i]}" alt="screenshot ${i + 1}" /></p>`)
  }
  if (imageUrls.length) {
    const links = imageUrls.map((u, i) => `<a href="${u}">${i + 1}</a>`).join(' ')
    parts.push(`<p><strong>Screenshots:</strong> ${links}</p>`)
  }
  // G2/G3/G5: append captured dev-tools context (console + network + env + identity/metadata).
  if (clientContext) parts.push(clientContextHtml(clientContext))
  return parts.join('')
}
