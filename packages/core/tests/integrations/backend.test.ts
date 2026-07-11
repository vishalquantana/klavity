import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitReport, buildFeedbackFormData } from '../../src/integrations/backend'
import { DEFAULT_SETTINGS } from '../../src/types'
import type { IntegrationConfig } from '../../src/types'

const config: IntegrationConfig = {
  type: 'bug',
  description: 'Export fails silently',
  screenshots: [], // empty to avoid data-URL fetch in this unit test
  context: { pageUrl: 'https://app.example.com', userAgent: 'Test', screenSize: '1920x1080', viewportSize: '1280x800', consoleErrors: [], networkFailures: [] },
  settings: {
    ...DEFAULT_SETTINGS,
    backendUrl: 'https://klavity.in',
    plane: { token: 'plane_tok', host: 'https://plane.quantana.top', workspace: 'qbuilder', projectId: 'proj_123' },
  },
}

// ── KLAVITYKLA-211: shared serializer tests ──────────────────────────────────
describe('buildFeedbackFormData (shared serializer)', () => {
  it('emits all common fields: type, description, page_url, context, project_id, replay_events', () => {
    const ctx = { pageUrl: 'https://app.example.com', userAgent: 'UA', screenSize: '1920x1080', viewportSize: '1280x800', consoleErrors: [], networkFailures: [] }
    const form = buildFeedbackFormData({
      type: 'feature',
      description: 'dark mode plz',
      pageUrl: 'https://app.example.com',
      context: ctx,
      projectId: 'proj_123',
      replayEvents: [{ type: 4, ts: 1 }],
    })
    expect(form.get('type')).toBe('feature')
    expect(form.get('description')).toBe('dark mode plz')
    expect(form.get('page_url')).toBe('https://app.example.com')
    expect(JSON.parse(form.get('context') as string).userAgent).toBe('UA')
    expect(form.get('project_id')).toBe('proj_123')
    expect(JSON.parse(form.get('replay_events') as string)).toHaveLength(1)
  })

  it('defaults type to "bug" when omitted', () => {
    const form = buildFeedbackFormData({ description: 'crash', pageUrl: 'https://x/' })
    expect(form.get('type')).toBe('bug')
  })

  it('omits context when absent', () => {
    const form = buildFeedbackFormData({ description: 'x', pageUrl: 'https://x/' })
    expect(form.get('context')).toBeNull()
  })

  it('omits project_id when absent', () => {
    const form = buildFeedbackFormData({ description: 'x', pageUrl: 'https://x/' })
    expect(form.get('project_id')).toBeNull()
  })

  it('omits replay_events when empty array', () => {
    const form = buildFeedbackFormData({ description: 'x', pageUrl: 'https://x/', replayEvents: [] })
    expect(form.get('replay_events')).toBeNull()
  })

  it('omits replay_events when absent', () => {
    const form = buildFeedbackFormData({ description: 'x', pageUrl: 'https://x/' })
    expect(form.get('replay_events')).toBeNull()
  })
})

// ── Parity proof: extension path uses same fields as widget path ─────────────
// This test verifies that submitReport's FormData contains exactly the same
// shared fields as buildFeedbackFormData — i.e. the two paths cannot silently
// diverge on shared fields again (KLAVITYKLA-208-style drift).
describe('extension + widget shared field parity', () => {
  it('submitReport produces the same shared fields as buildFeedbackFormData for the same input', async () => {
    // Build the reference FormData via the shared serializer directly.
    const ctx = { pageUrl: 'https://app.example.com', userAgent: 'Test', screenSize: '1920x1080', viewportSize: '1280x800', consoleErrors: [], networkFailures: [] }
    const sharedPayload = {
      type: 'bug' as const,
      description: 'Export fails silently',
      pageUrl: 'https://app.example.com',
      context: ctx,
      projectId: 'proj_123',
      replayEvents: [{ type: 4, ts: 1 }],
    }
    const reference = buildFeedbackFormData(sharedPayload)

    // Intercept the FormData that submitReport sends to /api/feedback.
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'fb_1', jira_key: '42', issue_url: 'https://plane/x' }),
    } as Response)

    const extConfig: IntegrationConfig = {
      type: 'bug',
      description: 'Export fails silently',
      screenshots: [],
      context: ctx,
      projectId: 'proj_123',
      replayEvents: [{ type: 4, ts: 1 }],
      settings: { ...DEFAULT_SETTINGS, backendUrl: 'https://klavity.in' },
    }
    // First call is the submitReport /api/feedback POST.
    // (screenshots is empty so no blob-fetch calls precede it)
    await submitReport(extConfig)
    const extensionForm = ((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit).body as FormData

    // The SHARED fields must match the reference buildFeedbackFormData output exactly.
    const sharedFields = ['type', 'description', 'page_url', 'context', 'project_id', 'replay_events'] as const
    for (const field of sharedFields) {
      expect(extensionForm.get(field)).toBe(reference.get(field))
    }

    // Extension-only fields are present (they do NOT belong to the shared serializer).
    expect(extensionForm.get('plane_token')).not.toBeNull() // direct mode sends plane creds
    // Widget-only fields are absent from the extension path (by design, not drift).
    expect(extensionForm.get('referrer')).toBeNull()
    expect(extensionForm.get('annotations_json')).toBeNull()
    expect(extensionForm.get('reporter_email')).toBeNull()
  })
})

describe('backend.submitReport', () => {
  beforeEach(() => vi.resetAllMocks())

  it('forwards report fields and Plane creds as multipart form data', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'fb_1', jira_key: '42', issue_url: 'https://plane.quantana.top/x' }),
    } as Response)

    const result = await submitReport(config)
    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('https://klavity.in/api/feedback')
    const form = opts.body as FormData
    expect(form.get('type')).toBe('bug')
    expect(form.get('description')).toBe('Export fails silently')
    expect(form.get('page_url')).toBe('https://app.example.com')
    expect(form.get('plane_token')).toBe('plane_tok')
    expect(form.get('plane_workspace')).toBe('qbuilder')
    expect(form.get('plane_project_id')).toBe('proj_123')
    expect(form.get('plane_host')).toBe('https://plane.quantana.top')
    expect(result.issueKey).toBe('42')
    expect(result.issueUrl).toBe('https://plane.quantana.top/x')
  })

  it('in Klavity mode sends a Bearer token and forwards no creds', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'fb_2', jira_key: '7', issue_url: 'https://plane.quantana.top/y' }),
    } as Response)

    const klavityConfig: IntegrationConfig = {
      ...config,
      settings: { ...config.settings, connectionMode: 'klavity', klavToken: 'sess_abc' },
    }
    await submitReport(klavityConfig)
    const [, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(opts.headers.Authorization).toBe('Bearer sess_abc')
    const form = opts.body as FormData
    expect(form.get('plane_token')).toBeNull()
    expect(form.get('description')).toBe('Export fails silently')
  })
})
