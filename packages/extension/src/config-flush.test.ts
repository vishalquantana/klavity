import { describe, it, expect, vi } from 'vitest'
import { normalizeBackend, backendChanged, flushIfBackendChanged, onSettingsChanged } from './config-flush'

function makeChrome(local: Record<string, any> = {}) {
  return {
    local,
    storage: {
      local: {
        get: (key: string) => Promise.resolve({ [key]: local[key] }),
        set: (o: any) => { Object.assign(local, o); return Promise.resolve() },
        remove: (keys: string[]) => { for (const k of keys) delete local[k]; return Promise.resolve() },
      },
    },
  }
}

const cached = (backendUrl: string) => ({
  klavConfig: { email: 'a@b.com', token: 'ext_x', backendUrl, projects: [], syncedAt: 1 },
  klavSims: [{ id: 's1' }],
  klavSelectedProjectId: 'p1',
})

describe('normalizeBackend', () => {
  it('defaults to production and strips trailing slashes', () => {
    expect(normalizeBackend('')).toBe('https://klavity.in')
    expect(normalizeBackend(null)).toBe('https://klavity.in')
    expect(normalizeBackend('http://localhost:3000//')).toBe('http://localhost:3000')
  })
})

describe('backendChanged', () => {
  it('ignores trailing-slash-only differences', () => {
    expect(backendChanged('https://klavity.in', 'https://klavity.in/')).toBe(false)
  })
  it('treats an empty new value as the production default', () => {
    expect(backendChanged('https://klavity.in', '')).toBe(false)
    expect(backendChanged('https://old.example.com', '')).toBe(true)
  })
  it('is false when nothing is cached yet', () => {
    expect(backendChanged(undefined, 'https://klavity.in')).toBe(false)
  })
})

describe('flushIfBackendChanged', () => {
  it('drops every backend-scoped cache key when the backend moves', async () => {
    const c = makeChrome(cached('https://old.example.com'))
    ;(globalThis as any).chrome = c
    expect(await flushIfBackendChanged('https://klavity.in')).toBe(true)
    expect(c.local.klavConfig).toBeUndefined()
    expect(c.local.klavSims).toBeUndefined()
    expect(c.local.klavSelectedProjectId).toBeUndefined()
  })
  it('keeps the cache when the backend is unchanged', async () => {
    const c = makeChrome(cached('https://klavity.in'))
    ;(globalThis as any).chrome = c
    expect(await flushIfBackendChanged('https://klavity.in/')).toBe(false)
    expect(c.local.klavConfig).toBeDefined()
    expect(c.local.klavSims).toBeDefined()
  })
})

describe('onSettingsChanged', () => {
  const deps = () => ({ broadcastConfig: vi.fn(), syncConfig: vi.fn().mockResolvedValue(null) })

  // Regression (KLAVITYKLA-320): saving a new Backend URL in Options left klavConfig
  // pointing at the old backend, so open tabs kept calling it until a manual
  // chrome.storage.local.clear() + page reload.
  it('flushes, tells open tabs to drop their config, and resyncs on a backend change', async () => {
    const c = makeChrome(cached('https://old.example.com'))
    ;(globalThis as any).chrome = c
    const d = deps()
    const changes = { klavSettings: { newValue: { backendUrl: 'https://klavity.in' } } }
    expect(await onSettingsChanged(changes, 'sync', d)).toBe(true)
    expect(c.local.klavConfig).toBeUndefined()
    expect(d.broadcastConfig).toHaveBeenCalledWith(null)
    expect(d.syncConfig).toHaveBeenCalledTimes(1)
  })

  it('treats turning the Cloud toggle off (empty backendUrl) as a change away from a custom backend', async () => {
    ;(globalThis as any).chrome = makeChrome(cached('https://old.example.com'))
    const d = deps()
    expect(await onSettingsChanged({ klavSettings: { newValue: { backendUrl: '' } } }, 'sync', d)).toBe(true)
    expect(d.syncConfig).toHaveBeenCalled()
  })

  it('does nothing when an unrelated setting is saved', async () => {
    const c = makeChrome(cached('https://klavity.in'))
    ;(globalThis as any).chrome = c
    const d = deps()
    const changes = { klavSettings: { newValue: { backendUrl: 'https://klavity.in', autoFileErrors: true } } }
    expect(await onSettingsChanged(changes, 'sync', d)).toBe(false)
    expect(c.local.klavConfig).toBeDefined()
    expect(d.broadcastConfig).not.toHaveBeenCalled()
    expect(d.syncConfig).not.toHaveBeenCalled()
  })

  it('ignores writes to other storage areas and other keys', async () => {
    ;(globalThis as any).chrome = makeChrome(cached('https://old.example.com'))
    const d = deps()
    const changes = { klavSettings: { newValue: { backendUrl: 'https://klavity.in' } } }
    expect(await onSettingsChanged(changes, 'local', d)).toBe(false)
    expect(await onSettingsChanged({ klavRecent: { newValue: [] } }, 'sync', d)).toBe(false)
    expect(d.syncConfig).not.toHaveBeenCalled()
  })
})
