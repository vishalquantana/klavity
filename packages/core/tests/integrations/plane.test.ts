import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitReport } from '../../src/integrations/plane'
import { DEFAULT_SETTINGS } from '../../src/types'
import type { IntegrationConfig } from '../../src/types'

const config: IntegrationConfig = {
  type: 'bug',
  description: 'Export fails silently',
  screenshots: [],
  context: { pageUrl: 'https://app.example.com', userAgent: 'Test', screenSize: '1920x1080', viewportSize: '1280x800', consoleErrors: [], networkFailures: [] },
  settings: { ...DEFAULT_SETTINGS, plane: { token: 'plane_tok', host: 'https://api.plane.so', workspace: 'acme', projectId: 'proj_123' } },
}

describe('plane.submitReport', () => {
  beforeEach(() => vi.resetAllMocks())

  it('creates a Plane issue (cloud)', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'iss_plane_1', sequence_id: 7 }),
    } as Response)

    const result = await submitReport(config)
    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('https://api.plane.so/api/v1/workspaces/acme/projects/proj_123/issues/')
    expect(opts.headers['X-API-Key']).toBe('plane_tok')
    expect(result.issueKey).toBe('7')
    expect(result.issueUrl).toContain('https://app.plane.so/acme/') // cloud web UI host
  })

  it('targets a self-hosted Plane host for both API and web link', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ sequence_id: 3 }) } as Response)
    const selfHosted: IntegrationConfig = {
      ...config,
      settings: { ...DEFAULT_SETTINGS, plane: { token: 't', host: 'https://plane.quantana.top', workspace: 'qbuilder', projectId: 'b6f1d657' } },
    }
    const result = await submitReport(selfHosted)
    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('https://plane.quantana.top/api/v1/workspaces/qbuilder/projects/b6f1d657/issues/')
    expect(result.issueUrl).toBe('https://plane.quantana.top/qbuilder/projects/b6f1d657/issues/')
  })

  it('throws on API failure', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 403, text: async () => 'Forbidden' } as unknown as Response)
    await expect(submitReport(config)).rejects.toThrow('Plane API error 403')
  })
})
