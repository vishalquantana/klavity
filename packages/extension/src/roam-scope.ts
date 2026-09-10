// KLA-783: scheme-consistent host-permission scoping for roaming-Sim dynamic
// content-script registration.
//
// The popup requests the EXACT active origin inside the click gesture, e.g.
// `https://customer.example/*`. reconcileDynamicScripts() then has to decide, per
// monitored host, WHICH match pattern to test with chrome.permissions.contains() and
// register with chrome.scripting.registerContentScripts().
//
// The bug: reconcile used to check/register the BROADER `*://host/*` pattern. Chrome's
// permissions.contains() does NOT treat an exact HTTPS grant as covering the both-schemes
// `*://host/*` pattern (it would need http granted too), so contains() returned false →
// nothing was registered → roaming Sims never injected on later loads of a freshly-granted
// https site. Fix: check each CONCRETE scheme and register with whatever scheme was
// actually granted, so grant / check / register are all scheme-consistent.

// Extract the bare host from a monitored URL pattern ("host/path*", "https://host/…",
// "*://host/…"). Mirrors the stripping background.ts used for monitoredUrls.
export function monitoredHost(pattern: string): string {
  return String(pattern).replace(/^[a-z*]+:\/\//i, '').split('/')[0].trim()
}

// Candidate match patterns for a host, most-permissive first. `*://host/*` covers both
// schemes (admin/broad grants), then the concrete https / http scheme grants the popup
// actually requests per active origin. We check in this order and register the FIRST that
// contains() confirms, so an exact-scheme grant registers under its own scheme.
export function scopeCandidates(host: string): string[] {
  return [`*://${host}/*`, `https://${host}/*`, `http://${host}/*`]
}

// Given monitored hosts + an async contains(pattern) predicate, return the match patterns
// to register: one per host, using the most-permissive pattern that is actually granted.
// Guarantees the registered pattern is one contains() returned true for → a freshly
// granted `https://host/*` origin registers (unlike the old `*://host/*`-only check).
export async function grantedRegistrablePatterns(
  hosts: Iterable<string>,
  contains: (pattern: string) => Promise<boolean>,
): Promise<string[]> {
  const out: string[] = []
  for (const host of hosts) {
    if (!host) continue
    for (const pat of scopeCandidates(host)) {
      let ok = false
      try { ok = await contains(pat) } catch { ok = false }
      if (ok) { out.push(pat); break }
    }
  }
  return out
}
