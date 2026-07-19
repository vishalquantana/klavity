// ── Dashboard-change cache invalidation (KLAVITYKLA-320) ─────────────────────
// `config-flush.ts` handles the case where the *extension's own* Backend URL setting
// changes. This module handles the other, much more common half of the same bug: an
// ADMIN changes the project config in the dashboard (review mode, monitored URLs, a
// project added/removed) and the extension keeps serving the stale `klavConfig` cache.
//
// Before this, klavConfig was only refetched on onInstalled / onStartup / CONNECT, so
// a dashboard change could take hours (or a browser restart) to reach users.
//
// Mechanism — deliberately the cheap one, no push channel:
//   1. the backend stamps the config payload with `configVersion` (content hash);
//   2. at most once per REVALIDATE_TTL_MS we GET /api/extension/config/version, which
//      mints no token and only hashes;
//   3. if the version differs from the cached one we run the full syncConfig(), which
//      overwrites the cache AND broadcasts to open tabs.
// Steady state is therefore one tiny request per TTL, and a config edit lands within
// one TTL instead of never.
//
// Everything is dependency-injected so it can be unit-tested without a browser.

import type { KlavConfig } from '@klavity/core'

/** How long a cached config is trusted before we ask the backend if it moved. */
export const REVALIDATE_TTL_MS = 5 * 60 * 1000

export interface RevalidateDeps {
  /** Cached config, or null when nothing is cached. */
  getConfig: () => Promise<KlavConfig | null>
  /** Full refetch of /api/extension/config (writes the cache + broadcasts). */
  syncConfig: () => Promise<KlavConfig | null>
  /** Persist a mutated copy of the cached config (used to bump the freshness stamp). */
  saveConfig: (config: KlavConfig) => Promise<void>
  fetchFn?: typeof fetch
  now?: () => number
}

export function isStale(config: KlavConfig | null, now: number, ttlMs = REVALIDATE_TTL_MS): boolean {
  if (!config) return false // nothing cached → nothing to revalidate (a plain sync handles that)
  // A cache written before configVersion existed has no version to compare, so it is
  // always due for a revalidation pass (which will fall through to a full resync).
  if (!config.configVersion) return true
  const syncedAt = typeof config.syncedAt === 'number' ? config.syncedAt : 0
  return now - syncedAt >= ttlMs
}

/**
 * Revalidate the cached config against the backend, refetching it in full when the
 * backend's version differs. Returns true when a resync actually happened.
 *
 * Failures are swallowed: offline / 401 / rate-limited must never wipe a usable cache,
 * and must never bump the freshness stamp (so we retry on the next call).
 */
export async function revalidateConfig(deps: RevalidateDeps): Promise<boolean> {
  const now = (deps.now ?? Date.now)()
  const cached = await deps.getConfig()
  if (!isStale(cached, now)) return false
  const doFetch = deps.fetchFn ?? fetch

  let remoteVersion: string | undefined
  try {
    const res = await doFetch(`${cached!.backendUrl}/api/extension/config/version`, {
      headers: { Authorization: `Bearer ${cached!.token}` },
    })
    if (!res.ok) return false
    const data = await res.json() as { configVersion?: string }
    remoteVersion = typeof data?.configVersion === 'string' ? data.configVersion : undefined
  } catch {
    return false // offline — keep the cache, retry next time
  }
  if (!remoteVersion) return false

  if (remoteVersion === cached!.configVersion) {
    // Unchanged: touch the freshness stamp so we don't re-probe on every single read.
    await deps.saveConfig({ ...cached!, syncedAt: now })
    return false
  }
  await deps.syncConfig()
  return true
}
