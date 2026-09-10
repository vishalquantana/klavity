// KLA-783: scheme-consistent host-permission scoping for roaming-Sim dynamic
// content-script registration.
//
// The popup requests the EXACT active origin inside the click gesture, e.g.
// `https://customer.example/*`. reconcileDynamicScripts() then decides which match patterns
// to register with chrome.scripting.registerContentScripts().
//
// Round-1 bug: reconcile checked/registered the BROAD `*://host/*` pattern; chrome's
// permissions.contains() does NOT treat an exact HTTPS grant as covering both-schemes
// `*://host/*`, so nothing registered → roaming Sims never injected on later loads.
//
// Round-2 (codex): don't GUESS candidate patterns per host — read the origins the user has
// ACTUALLY granted (chrome.permissions.getAll().origins) and register each granted origin
// whose host matches a monitored pattern. This is verbatim-a-granted-pattern (so register
// always succeeds) and correctly covers: exact single-scheme grants, BOTH schemes granted
// (register both), and wildcard-subdomain monitored patterns (a granted `https://app.foo/*`
// matches monitored `*.foo`).

// Bare host (glob-preserving) from a monitored URL pattern: "host/path", "https://host/…",
// "*://host/…", "*.example.com/*" → "host" / "*.example.com". Keeps a leading "*." subdomain
// wildcard and a bare "*"; strips scheme, path, and any :port.
export function monitoredHost(pattern: string): string {
  return String(pattern).trim().replace(/^[a-z*]+:\/\//i, '').split('/')[0].split(':')[0].trim()
}

// Host of a granted origin match pattern ("https://app.example.com/*" → "app.example.com",
// "*://host/*" → "host"). Strips scheme, path and port.
export function originHost(origin: string): string {
  return String(origin).trim().replace(/^[a-z*]+:\/\//i, '').split('/')[0].split(':')[0]
}

// Does a concrete host match a monitored host glob? "*" → any host; "*.base" → base or any
// subdomain of base; otherwise an exact host match.
export function hostMatchesGlob(host: string, glob: string): boolean {
  if (!host || !glob) return false
  if (glob === '*') return true
  if (glob.startsWith('*.')) { const base = glob.slice(2); return !!base && (host === base || host.endsWith('.' + base)) }
  return host === glob
}

// Given the monitored host globs + the origins the user has actually granted
// (chrome.permissions.getAll().origins), return the granted match patterns to register:
// every granted origin whose host matches a monitored glob (returned VERBATIM — it is already
// a granted, valid match pattern). Deduped. Origins that don't match any monitored pattern
// (e.g. the extension's own manifest hosts) are omitted.
export function registrablePatterns(monitoredGlobs: Iterable<string>, grantedOrigins: Iterable<string>): string[] {
  const globs = [...monitoredGlobs].filter(Boolean)
  const out: string[] = []
  const seen = new Set<string>()
  for (const origin of grantedOrigins) {
    const o = String(origin)
    if (!o || seen.has(o)) continue
    const h = originHost(o)
    if (globs.some((g) => hostMatchesGlob(h, g))) { seen.add(o); out.push(o) }
  }
  return out
}
