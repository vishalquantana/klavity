import { describe, it, expect, vi } from 'vitest'
import type { KlavConfig } from '@klavity/core'
import { isStale, revalidateConfig, REVALIDATE_TTL_MS } from './config-revalidate'

const NOW = 1_700_000_000_000

function cached(overrides: Partial<KlavConfig> = {}): KlavConfig {
  return {
    email: 'vishal@quantana.com.au',
    token: 'ext_abc',
    backendUrl: 'https://klavity.in',
    projects: [{ id: 'p1', name: 'Site', reviewMode: 'auto', monitoredUrls: ['https://site.com/*'] }],
    syncedAt: NOW - REVALIDATE_TTL_MS - 1,
    configVersion: 'v-old',
    ...overrides,
  }
}

/** Deps wired to a fake cache + a fake /config/version response. */
function harness(config: KlavConfig | null, versionResponse: { ok?: boolean; body?: unknown; throws?: boolean } = {}) {
  let stored = config
  const fetchFn = vi.fn(async () => {
    if (versionResponse.throws) throw new Error('offline')
    return {
      ok: versionResponse.ok ?? true,
      json: async () => versionResponse.body ?? { configVersion: 'v-old' },
    } as unknown as Response
  })
  const syncConfig = vi.fn(async () => {
    stored = cached({ configVersion: 'v-new', syncedAt: NOW, projects: [] })
    return stored
  })
  const saveConfig = vi.fn(async (c: KlavConfig) => { stored = c })
  return {
    fetchFn, syncConfig, saveConfig,
    get stored() { return stored },
    deps: { getConfig: async () => stored, syncConfig, saveConfig, fetchFn, now: () => NOW },
  }
}

describe('isStale', () => {
  it('is false for a config synced within the TTL', () => {
    expect(isStale(cached({ syncedAt: NOW - 1000 }), NOW)).toBe(false)
  })
  it('is true once the TTL has elapsed', () => {
    expect(isStale(cached({ syncedAt: NOW - REVALIDATE_TTL_MS }), NOW)).toBe(true)
  })
  it('is true for a pre-versioning cache even if freshly synced', () => {
    expect(isStale(cached({ syncedAt: NOW, configVersion: undefined }), NOW)).toBe(true)
  })
  it('is false when nothing is cached', () => {
    expect(isStale(null, NOW)).toBe(false)
  })
})

describe('revalidateConfig', () => {
  // ── THE REGRESSION (KLAVITYKLA-320) ────────────────────────────────────────
  // An admin flips reviewMode / edits monitored URLs in the dashboard. The backend's
  // configVersion changes. The extension must drop its cached klavConfig and refetch,
  // NOT keep serving the stale projects.
  it('resyncs when the backend config version has changed', async () => {
    const h = harness(cached(), { body: { configVersion: 'v-new' } })
    expect(await revalidateConfig(h.deps)).toBe(true)
    expect(h.syncConfig).toHaveBeenCalledTimes(1)
    expect(h.stored!.configVersion).toBe('v-new')
    // and the stale project config is gone, not still being served
    expect(h.stored!.projects).toEqual([])
  })

  it('does not refetch when the backend config version is unchanged', async () => {
    const h = harness(cached(), { body: { configVersion: 'v-old' } })
    expect(await revalidateConfig(h.deps)).toBe(false)
    expect(h.syncConfig).not.toHaveBeenCalled()
    // freshness stamp is bumped so we do not probe again on the next read
    expect(h.stored!.syncedAt).toBe(NOW)
    expect(h.stored!.configVersion).toBe('v-old')
  })

  it('does not hit the network while the cache is inside its TTL', async () => {
    const h = harness(cached({ syncedAt: NOW - 1000 }))
    expect(await revalidateConfig(h.deps)).toBe(false)
    expect(h.fetchFn).not.toHaveBeenCalled()
  })

  it('probes the version endpoint on the cached backend with the ext token', async () => {
    const h = harness(cached({ backendUrl: 'http://localhost:3000' }), { body: { configVersion: 'v-old' } })
    await revalidateConfig(h.deps)
    expect(h.fetchFn).toHaveBeenCalledWith(
      'http://localhost:3000/api/extension/config/version',
      { headers: { Authorization: 'Bearer ext_abc' } },
    )
  })

  it('keeps a usable cache when the probe fails (offline)', async () => {
    const h = harness(cached(), { throws: true })
    expect(await revalidateConfig(h.deps)).toBe(false)
    expect(h.syncConfig).not.toHaveBeenCalled()
    expect(h.stored!.projects).toHaveLength(1)
    // freshness NOT bumped — we must retry on the next read rather than trust a failed probe
    expect(h.stored!.syncedAt).toBe(NOW - REVALIDATE_TTL_MS - 1)
  })

  it('keeps the cache on a non-OK response (401 / rate limited)', async () => {
    const h = harness(cached(), { ok: false })
    expect(await revalidateConfig(h.deps)).toBe(false)
    expect(h.syncConfig).not.toHaveBeenCalled()
    expect(h.stored!.syncedAt).toBe(NOW - REVALIDATE_TTL_MS - 1)
  })

  it('resyncs a pre-versioning cache so it gains a version stamp', async () => {
    const h = harness(cached({ configVersion: undefined, syncedAt: NOW }), { body: { configVersion: 'v-new' } })
    expect(await revalidateConfig(h.deps)).toBe(true)
    expect(h.stored!.configVersion).toBe('v-new')
  })

  it('is a no-op when nothing is cached', async () => {
    const h = harness(null)
    expect(await revalidateConfig(h.deps)).toBe(false)
    expect(h.fetchFn).not.toHaveBeenCalled()
  })
})
