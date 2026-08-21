/**
 * qa-mode.ts — Pure, dependency-free helpers for the extension's QA mode overlay.
 *
 * QA mode is the authenticated, team-gated on-page review surface: a signed-in
 * Klavity team member toggles it on and sees every bug reported for the current
 * URL as pins/list rows, then closes them in place. These helpers hold the shape
 * parsing, status bucketing, count math, and coordinate normalisation so they can
 * be unit-tested without a Chrome runtime or the DOM. The rendering + fetch
 * orchestration lives in content.ts.
 *
 * The API contract (served by another agent):
 *   GET  /api/projects/:id/page-bugs?url=<href>
 *        -> { bugs: [{id, ref, title, status, severity, reporterEmail,
 *                     createdAt, screenshotUrl, pageUrl, coords?}],
 *             counts:{open,inProgress,done} }   (403 if not a project member)
 *   POST /api/feedback/:id/qa-close {resolution?} -> { status }   (team-gated)
 */

export interface QaBug {
  id: string
  ref?: string
  title?: string
  status?: string
  severity?: string
  reporterEmail?: string
  createdAt?: string | number
  screenshotUrl?: string
  pageUrl?: string
  coords?: { x: number; y: number } | null
}

export interface QaCounts {
  open: number
  inProgress: number
  done: number
}

export interface QaPageBugs {
  bugs: QaBug[]
  counts: QaCounts
}

/** Visual bucket a raw tracker status maps to. Drives pin colour (red/amber/green). */
export type QaBucket = 'open' | 'prog' | 'done'

/**
 * Normalise an arbitrary tracker status string to one of three visual buckets.
 * Tolerant of connector variance (Jira "In Progress", Plane "started", GitHub
 * "closed", snake_case, etc.). Unknown/empty -> 'open' so a bug is never hidden.
 */
export function qaStatusBucket(status: string | undefined | null): QaBucket {
  const s = String(status || '').toLowerCase().trim().replace(/[\s_]+/g, '-')
  if (!s) return 'open'
  if (/(done|closed|resolved|fixed|complete|completed|shipped|verified|cancelled|canceled)/.test(s)) return 'done'
  if (/(progress|in-prog|doing|started|review|reviewing|triage|active|wip|testing|qa)/.test(s)) return 'prog'
  return 'open'
}

/** Derive {open,inProgress,done} counts directly from a bug list. */
export function qaDeriveCounts(bugs: QaBug[]): QaCounts {
  const c: QaCounts = { open: 0, inProgress: 0, done: 0 }
  for (const b of bugs) {
    const bucket = qaStatusBucket(b?.status)
    if (bucket === 'done') c.done++
    else if (bucket === 'prog') c.inProgress++
    else c.open++
  }
  return c
}

function isSaneCounts(x: unknown): x is QaCounts {
  if (!x || typeof x !== 'object') return false
  const c = x as Record<string, unknown>
  return ['open', 'inProgress', 'done'].every((k) => typeof c[k] === 'number' && (c[k] as number) >= 0)
}

/**
 * Parse a raw /page-bugs JSON body into a validated {bugs, counts}. Silently
 * tolerates a missing/garbage body (returns empty). Counts fall back to a derived
 * count when the server omits or mangles them, so the QA bar is always correct.
 */
export function parsePageBugs(raw: unknown): QaPageBugs {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const rawBugs = Array.isArray(body.bugs) ? body.bugs : []
  const bugs: QaBug[] = rawBugs
    .filter((b): b is Record<string, unknown> => !!b && typeof b === 'object')
    .map((b) => ({
      id: String(b.id ?? b.ref ?? ''),
      ref: b.ref != null ? String(b.ref) : undefined,
      title: b.title != null ? String(b.title) : undefined,
      status: b.status != null ? String(b.status) : undefined,
      severity: b.severity != null ? String(b.severity) : undefined,
      reporterEmail: b.reporterEmail != null ? String(b.reporterEmail) : undefined,
      createdAt: typeof b.createdAt === 'number' || typeof b.createdAt === 'string' ? b.createdAt : undefined,
      screenshotUrl: b.screenshotUrl != null ? String(b.screenshotUrl) : undefined,
      pageUrl: b.pageUrl != null ? String(b.pageUrl) : undefined,
      coords: parseCoords(b.coords),
    }))
    .filter((b) => !!b.id)
  const counts = isSaneCounts(body.counts) ? (body.counts as QaCounts) : qaDeriveCounts(bugs)
  return { bugs, counts }
}

function parseCoords(raw: unknown): { x: number; y: number } | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>
  const x = Number(c.x)
  const y = Number(c.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return { x, y }
}

/**
 * Resolve on-page pixel coordinates for a pin. `coords` may arrive either as
 * absolute document pixels or as 0..1 fractions of the page (whichever the widget
 * captured). When BOTH components are within [0,1] we treat them as fractions and
 * scale by the document dimensions; otherwise they're taken as raw pixels. Returns
 * null when there's nothing usable (the bug then falls back to the list panel).
 */
export function qaResolveCoords(
  coords: { x: number; y: number } | null | undefined,
  dims: { w: number; h: number },
): { x: number; y: number } | null {
  if (!coords) return null
  const { x, y } = coords
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  const fractional = x >= 0 && x <= 1 && y >= 0 && y <= 1
  const px = fractional ? x * dims.w : x
  const py = fractional ? y * dims.h : y
  // Keep pins on-page even if a stored coord is slightly out of bounds.
  return { x: Math.max(0, Math.min(px, dims.w)), y: Math.max(0, Math.min(py, dims.h)) }
}

/** Human "2 open · 1 in-progress · 1 done", omitting zero buckets but never empty. */
export function qaCountLabel(counts: QaCounts): string {
  const parts: string[] = []
  if (counts.open) parts.push(`${counts.open} open`)
  if (counts.inProgress) parts.push(`${counts.inProgress} in-progress`)
  if (counts.done) parts.push(`${counts.done} done`)
  return parts.length ? parts.join(' · ') : 'all clear'
}

/** Total bugs across buckets. */
export function qaTotal(counts: QaCounts): number {
  return counts.open + counts.inProgress + counts.done
}

/** Compact relative time ("just now", "2h ago", "3d ago") from a date/epoch. */
export function qaTimeAgo(when: string | number | undefined, now: number = Date.now()): string {
  if (when == null) return ''
  const t = typeof when === 'number' ? when : Date.parse(when)
  if (!Number.isFinite(t)) return ''
  const diff = Math.max(0, now - t)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}
