import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitReport } from '../../src/integrations/github'
import { DEFAULT_SETTINGS } from '../../src/types'
import type { IntegrationConfig } from '../../src/types'

const config: IntegrationConfig = {
  type: 'bug',
  description: 'Sidebar collapses unexpectedly',
  screenshots: [],
  context: {
    pageUrl: 'https://app.example.com',
    userAgent: 'TestAgent',
    screenSize: '1920x1080',
    viewportSize: '1280x800',
    consoleErrors: [],
    networkFailures: [],
  },
  settings: { ...DEFAULT_SETTINGS, github: { token: 'ghp_abc123', repo: 'acme/webapp' } },
}

describe('github.submitReport', () => {
  beforeEach(() => vi.resetAllMocks())

  it('creates a GitHub issue and returns issueKey + issueUrl', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ number: 42, html_url: 'https://github.com/acme/webapp/issues/42' }),
    } as Response)

    const result = await submitReport(config)

    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('https://api.github.com/repos/acme/webapp/issues')
    expect(JSON.parse(opts.body).labels).toContain('klavity-bug')
    expect(result.issueKey).toBe('#42')
    expect(result.issueUrl).toBe('https://github.com/acme/webapp/issues/42')
  })

  it('throws on API failure', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false, status: 404, text: async () => 'Not Found',
    } as unknown as Response)

    await expect(submitReport(config)).rejects.toThrow('GitHub API error 404')
  })
})
