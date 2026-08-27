import { describe, it, expect, vi, beforeEach } from 'vitest'
import { dispatchSubmit } from '../src/submit'
import type { KlavitySettings, SubmitReportPayload } from '../src/types'
import { DEFAULT_SETTINGS, DEFAULT_BACKEND_URL } from '../src/types'

const mockPayload: SubmitReportPayload = {
  type: 'bug',
  description: 'button broken',
  screenshots: [],
  context: {
    pageUrl: 'https://example.com',
    userAgent: 'TestAgent',
    screenSize: '1920x1080',
    viewportSize: '1280x800',
    consoleErrors: [],
    networkFailures: [],
  },
}

describe('dispatchSubmit (KLA-720: persist-first only)', () => {
  beforeEach(() => vi.resetAllMocks())

  it('routes to the backend handler when backendUrl is set', async () => {
    const mockBackend = vi.fn().mockResolvedValue({ issueKey: 'PROJ-2', issueUrl: 'https://klav.io/PROJ-2' })
    const settings: KlavitySettings = { ...DEFAULT_SETTINGS, backendUrl: 'https://klav.io' }
    const result = await dispatchSubmit(mockPayload, settings, { backend: mockBackend })
    expect(mockBackend).toHaveBeenCalledOnce()
    expect(result.issueKey).toBe('PROJ-2')
  })

  // NEGATIVE CONTROL (KLA-720): even with integration='plane' and NO backendUrl — the old client-direct
  // trigger — dispatchSubmit MUST route to the backend and NEVER call a direct-tracker handler. The spy
  // "direct" handlers must receive ZERO calls; the backend handler receives the report. This is the exact
  // path that caused the customer's report to reach Plane + email but be invisible in Klavity.
  it('NEVER calls a direct tracker handler even when integration=plane and backendUrl is absent', async () => {
    const backend = vi.fn().mockResolvedValue({ issueKey: 'K-1', issueUrl: '' })
    const directPlane = vi.fn().mockResolvedValue({ issueKey: 'PLANE-1', issueUrl: '' })
    const directJira = vi.fn().mockResolvedValue({ issueKey: 'JIRA-1', issueUrl: '' })

    const settings: KlavitySettings = { ...DEFAULT_SETTINGS, integration: 'plane', backendUrl: '' }
    // Pass the direct spies alongside backend — a regression that reintroduced the fallback would call them.
    const result = await dispatchSubmit(mockPayload, settings, { backend, plane: directPlane, jira: directJira } as any)

    expect(backend).toHaveBeenCalledOnce()
    expect(directPlane).not.toHaveBeenCalled()
    expect(directJira).not.toHaveBeenCalled()
    expect(result.issueKey).toBe('K-1')
  })

  it('defaults an absent backendUrl to the canonical Klavity backend (never silently drops)', async () => {
    const backend = vi.fn(async (cfg: any) => {
      // The handler must receive a usable backend URL so the report is actually persisted.
      expect(cfg.settings.backendUrl).toBe(DEFAULT_BACKEND_URL)
      return { issueKey: 'K-2', issueUrl: '' }
    })
    const settings: KlavitySettings = { ...DEFAULT_SETTINGS, integration: 'plane', backendUrl: '' }
    await dispatchSubmit(mockPayload, settings, { backend })
    expect(backend).toHaveBeenCalledOnce()
  })

  it('forwards project_id to the backend handler', async () => {
    const backend = vi.fn(async (cfg: any) => { expect(cfg.projectId).toBe('proj_X'); return { issueKey: '1', issueUrl: '' } })
    await dispatchSubmit(
      { ...mockPayload, projectId: 'proj_X' } as any,
      { ...DEFAULT_SETTINGS, backendUrl: 'https://k', connectionMode: 'klavity', klavToken: 't' },
      { backend },
    )
    expect(backend).toHaveBeenCalledOnce()
  })

  it('throws a clear error when no backend handler is wired up (never falls back to direct)', async () => {
    const settings: KlavitySettings = { ...DEFAULT_SETTINGS, integration: 'linear', backendUrl: '' }
    await expect(dispatchSubmit(mockPayload, settings, {})).rejects.toThrow('No backend handler')
  })
})
