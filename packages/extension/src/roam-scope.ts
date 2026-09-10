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
// NOTE on ports: Chrome match patterns are PORTLESS (`http://localhost/*` matches localhost on ANY
// port; a `:port` host is not expressible), and permissions.getAll() returns portless origins. So we
// strip any :port here and match host-wide — that's the only choice registerContentScripts can express;
// port-specific monitoring (e.g. localhost:3000 vs :4000) is enforced by the content script against the
// actual URL, not at the registration layer. Hosts are lowercased (URL host matching is case-insensitive).
export function monitoredHost(pattern: string): string {
  return String(pattern).trim().replace(/^[a-z*]+:\/\//i, '').split('/')[0].split(':')[0].trim().toLowerCase()
}

// Host of a granted origin match pattern ("https://app.example.com/*" → "app.example.com",
// "*://host/*" → "host"). Strips scheme, path and port; lowercased.
export function originHost(origin: string): string {
  return String(origin).trim().replace(/^[a-z*]+:\/\//i, '').split('/')[0].split(':')[0].toLowerCase()
}

// Does a concrete host match a monitored host glob? "*" → any host; "*.base" → base or any
// subdomain of base; otherwise an exact host match.
export function hostMatchesGlob(host: string, glob: string): boolean {
  if (!host || !glob) return false
  const h = host.toLowerCase(); const g = glob.toLowerCase()
  if (g === '*') return true
  if (g.startsWith('*.')) { const base = g.slice(2); return !!base && (h === base || h.endsWith('.' + base)) }
  return h === g
}

// Scheme of a granted origin match pattern: "*" (both), "https", "http".
function originScheme(origin: string): string {
  const m = /^([a-z*]+):\/\//i.exec(String(origin).trim())
  return m ? m[1].toLowerCase() : ''
}

// Given the monitored host globs + the origins the user has actually granted
// (chrome.permissions.getAll().origins), return the granted match patterns to register:
// every granted origin whose host matches a monitored glob (returned VERBATIM — it is already
// a granted, valid match pattern). Deduped. Origins that don't match any monitored pattern
// (e.g. the extension's own manifest hosts) are omitted.
export function registrablePatterns(monitoredGlobs: Iterable<string>, grantedOrigins: Iterable<string>): string[] {
  const globs = [...monitoredGlobs].filter(Boolean)
  // Collect matching granted origins, grouped by host.
  const byHost = new Map<string, string[]>()
  const seen = new Set<string>()
  for (const origin of grantedOrigins) {
    const o = String(origin)
    if (!o || seen.has(o)) continue
    const h = originHost(o)
    if (!globs.some((g) => hostMatchesGlob(h, g))) continue
    seen.add(o)
    const arr = byHost.get(h) ?? []; arr.push(o); byHost.set(h, arr)
  }
  // Collapse overlapping coverage per host: a broad `*://host/*` grant already covers the concrete
  // https/http patterns for that host — registering both would run the content script TWICE on a page
  // that matches both. If a broad `*` pattern is present for a host, register ONLY it; otherwise keep the
  // concrete schemes (https + http don't overlap each other, so both are needed when both are granted).
  const out: string[] = []
  for (const [, origins] of byHost) {
    const broad = origins.find((o) => originScheme(o) === '*')
    if (broad) out.push(broad)
    else out.push(...origins)
  }
  return out
}
