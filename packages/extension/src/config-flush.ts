// ── Backend-change cache invalidation (KLAVITYKLA-320) ───────────────────────
// The Options page writes `klavSettings.backendUrl` to chrome.storage.SYNC, but every
// live call goes through the `klavConfig` cache in chrome.storage.LOCAL (built by
// syncConfig in background.ts). Without this module, pointing the extension at a new
// backend left the cache — and every already-loaded content script — talking to the OLD
// backend until someone manually ran chrome.storage.local.clear() + reloaded the page.
//
// Everything here is dependency-injected so it can be unit-tested without a browser.

const DEFAULT_BACKEND = 'https://klavity.in'

/** Cache keys that are only valid for the backend they were fetched from. */
export const BACKEND_SCOPED_KEYS = ['klavConfig', 'klavSims', 'klavSelectedProjectId'] as const

/** Trailing-slash/empty-tolerant normalisation, matching backendBase() in auth.ts. */
export function normalizeBackend(url: string | null | undefined): string {
  return (url || DEFAULT_BACKEND).replace(/\/+$/, '')
}

export function backendChanged(cached: string | null | undefined, next: string | null | undefined): boolean {
  if (!cached) return false // nothing cached yet — nothing stale to flush
  return normalizeBackend(cached) !== normalizeBackend(next)
}

/**
 * Drop every backend-scoped cache entry. Returns true when something was actually
 * cached for a different backend (i.e. a resync/broadcast is warranted).
 */
export async function flushIfBackendChanged(nextBackendUrl: string | null | undefined): Promise<boolean> {
  const r = await chrome.storage.local.get('klavConfig')
  const cached = (r.klavConfig as { backendUrl?: string } | undefined)?.backendUrl
  if (!backendChanged(cached, nextBackendUrl)) return false
  await chrome.storage.local.remove([...BACKEND_SCOPED_KEYS])
  return true
}

export interface FlushDeps {
  /** Tell open tabs to drop their in-memory copy (they accept a null config). */
  broadcastConfig: (config: null) => void
  /** Re-fetch /api/extension/config against the new backend. */
  syncConfig: () => Promise<unknown>
}

/**
 * chrome.storage.onChanged handler: when the Options page saves a different Backend
 * URL (or turns the Cloud toggle off), invalidate the cache, tell open tabs to stop
 * using it, and resync against the new backend.
 */
export async function onSettingsChanged(
  changes: Record<string, { newValue?: unknown }>,
  areaName: string,
  deps: FlushDeps,
): Promise<boolean> {
  if (areaName !== 'sync' || !changes.klavSettings) return false
  const next = (changes.klavSettings.newValue as { backendUrl?: string } | undefined)?.backendUrl
  if (!(await flushIfBackendChanged(next))) return false
  deps.broadcastConfig(null)
  await deps.syncConfig()
  return true
}
