// Shared outbound-link attribution for the widget + extension surfaces.
//
// Every "Powered by Klavity" badge / connect-entry / CTA that points back at Klavity from a
// customer's site must carry UTM params so the click is attributable ("where did this come from?").
// Without it all badge traffic lands as `direct` and we can't tell which embedding site drove it.
//
// This runs cross-origin on arbitrary (sometimes hostile) customer pages — pages that pollute DOM
// prototypes or booby-trap `location`. Every read of `location`/`document.referrer`/`URL` is wrapped
// so the helper NEVER throws; on any failure it degrades to a usable link (returns the base unchanged
// or falls back to the "widget" source). See MEMORY: hostile-page hardening.

export interface AttributionOpts {
  /** Per-link campaign, e.g. "powered_by" | "widget_connect" | "widget_cta". */
  campaign: string
  /** Surface: "widget" (SDK) or "extension" (content script). Defaults to "widget". */
  medium?: string
  /** Klavity project id — rides as utm_content so a click maps back to WHICH customer project drove it. */
  ref?: string
  /** Explicit utm_source override (mainly for tests); when absent we detect the embedding host. */
  source?: string
}

// The embedding page's hostname is the key "where did the click come from" signal. Prefer
// location.hostname; fall back to the referrer's host; finally the literal "widget" so the param is
// never empty. All reads are defensive against hostile pages.
export function detectAttributionSource(override?: string): string {
  if (override && typeof override === 'string') return override
  try {
    const loc = typeof window !== 'undefined' ? window.location : undefined
    const h = loc && loc.hostname
    if (typeof h === 'string' && h) return h
  } catch { /* location trapped/poisoned — fall through */ }
  try {
    const ref = typeof document !== 'undefined' ? document.referrer : ''
    if (typeof ref === 'string' && ref) {
      const rh = new URL(ref).hostname
      if (rh) return rh
    }
  } catch { /* referrer unparseable — fall through */ }
  return 'widget'
}

// Append UTM/attribution params to `base`, preserving any existing query + hash and never
// double-appending a param the base already carries. Values are URL-encoded by URLSearchParams.
// Returns the base unchanged if it isn't a parseable absolute URL (never throws).
export function klavityAttributionUrl(base: string, opts: AttributionOpts): string {
  let url: URL
  try {
    url = new URL(base)
  } catch {
    return base
  }
  const params: Array<[string, string]> = [
    ['utm_source', detectAttributionSource(opts.source)],
    ['utm_medium', opts.medium || 'widget'],
    ['utm_campaign', opts.campaign],
  ]
  if (opts.ref) params.push(['utm_content', opts.ref])
  try {
    for (const [k, v] of params) {
      if (v && !url.searchParams.has(k)) url.searchParams.set(k, v)
    }
    return url.toString()
  } catch {
    return base
  }
}
