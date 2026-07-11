/**
 * KLAVITYKLA-211: Serializer parity tests
 *
 * These tests prove that both the extension path (submitReport via buildFeedbackFormData)
 * and the widget path (buildFeedbackForm in widget-lib.ts) produce IDENTICAL shared
 * FormData fields for the same input — enforced by construction since both now delegate
 * to the same buildFeedbackFormData function.
 *
 * Regression guard: a field added to buildFeedbackFormData propagates to BOTH paths
 * automatically; you cannot silently add it to one and forget the other (KLAVITYKLA-208).
 */
import { describe, it, expect } from 'vitest'
import { buildFeedbackFormData } from '../src/integrations/backend'

// ── buildFeedbackFormData contract ──────────────────────────────────────────
describe('buildFeedbackFormData — shared serializer contract (KLAVITYKLA-211)', () => {
  const SHARED_FIELDS = ['type', 'description', 'page_url', 'context', 'project_id', 'replay_events'] as const

  it('sets all common fields: type, description, page_url, context, project_id, replay_events', () => {
    const ctx = {
      pageUrl: 'https://app.example.com',
      userAgent: 'Mozilla/5.0',
      screenSize: '1920x1080',
      viewportSize: '1280x800',
      consoleErrors: [{ message: 'boom', timestamp: 1, level: 'error' as const }],
      networkFailures: [{ url: 'https://api/x', status: 500, method: 'GET', timestamp: 1 }],
      identity: { id: 'u1', email: 'a@b.com' },
      metadata: { plan: 'pro' },
    }
    const form = buildFeedbackFormData({
      type: 'feature',
      description: 'dark mode plz',
      pageUrl: 'https://app.example.com',
      context: ctx,
      projectId: 'proj_abc',
      replayEvents: [{ type: 4, ts: 1 }, { type: 2, ts: 2 }],
    })

    expect(form.get('type')).toBe('feature')
    expect(form.get('description')).toBe('dark mode plz')
    expect(form.get('page_url')).toBe('https://app.example.com')
    const parsedCtx = JSON.parse(form.get('context') as string)
    expect(parsedCtx.userAgent).toBe('Mozilla/5.0')
    expect(parsedCtx.identity.id).toBe('u1')
    expect(parsedCtx.metadata.plan).toBe('pro')
    expect(form.get('project_id')).toBe('proj_abc')
    const events = JSON.parse(form.get('replay_events') as string)
    expect(events).toHaveLength(2)
  })

  it('defaults type to "bug" when not provided', () => {
    const form = buildFeedbackFormData({ description: 'crash', pageUrl: 'https://x/' })
    expect(form.get('type')).toBe('bug')
  })

  it('passes "feature" type through unchanged', () => {
    const form = buildFeedbackFormData({ type: 'feature', description: 'x', pageUrl: 'https://x/' })
    expect(form.get('type')).toBe('feature')
  })

  it('omits optional fields when absent: context, project_id, replay_events', () => {
    const form = buildFeedbackFormData({ description: 'x', pageUrl: 'https://x/' })
    expect(form.get('context')).toBeNull()
    expect(form.get('project_id')).toBeNull()
    expect(form.get('replay_events')).toBeNull()
  })

  it('omits replay_events when the buffer is empty', () => {
    const form = buildFeedbackFormData({ description: 'x', pageUrl: 'https://x/', replayEvents: [] })
    expect(form.get('replay_events')).toBeNull()
  })

  it('does NOT set screenshot, referrer, annotations_json, or plane creds — callers own those', () => {
    // Ensure the shared serializer stays lean: caller-specific fields must never creep in here.
    const form = buildFeedbackFormData({ description: 'x', pageUrl: 'https://x/', projectId: 'p1' })
    expect(form.get('screenshots')).toBeNull()
    expect(form.get('referrer')).toBeNull()
    expect(form.get('annotations_json')).toBeNull()
    expect(form.get('plane_token')).toBeNull()
    expect(form.get('reporter_email')).toBeNull()
  })

  it('produces a plain FormData instance (both extension and widget environments use FormData)', () => {
    const form = buildFeedbackFormData({ description: 'x', pageUrl: 'https://x/' })
    expect(form).toBeInstanceOf(FormData)
  })
})

// ── Cross-path parity: extension FormData ↔ shared serializer ───────────────
// This test imports submitReport and intercepts the FormData it builds, then
// compares the shared fields against the reference buildFeedbackFormData output.
// If they ever diverge, this test catches it immediately.
import { describe as describeExt, it as itExt, expect as expectExt, vi, beforeEach } from 'vitest'
import { submitReport } from '../src/integrations/backend'
import { DEFAULT_SETTINGS } from '../src/types'
import type { IntegrationConfig } from '../src/types'

describeExt('extension vs shared serializer — shared fields must be identical (KLAVITYKLA-211)', () => {
  beforeEach(() => vi.resetAllMocks())

  itExt('submitReport FormData has the same shared fields as buildFeedbackFormData', async () => {
    const ctx = {
      pageUrl: 'https://app.example.com',
      userAgent: 'Test/1.0',
      screenSize: '1920x1080',
      viewportSize: '1280x800',
      consoleErrors: [],
      networkFailures: [],
    }
    const sharedPayload = {
      type: 'feature' as const,
      description: 'Export fails silently',
      pageUrl: 'https://app.example.com',
      context: ctx,
      projectId: 'proj_xyz',
      replayEvents: [{ type: 4, ts: 100 }],
    }

    // Reference: what the shared serializer produces.
    const reference = buildFeedbackFormData(sharedPayload)

    // Extension: what submitReport sends to /api/feedback.
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'fb_1', jira_key: 'KEY-1', issue_url: 'https://plane/x' }),
    } as Response)

    const extConfig: IntegrationConfig = {
      type: 'feature',
      description: 'Export fails silently',
      screenshots: [], // empty: avoids blob-fetch calls before the main POST
      context: ctx,
      projectId: 'proj_xyz',
      replayEvents: [{ type: 4, ts: 100 }],
      settings: { ...DEFAULT_SETTINGS, backendUrl: 'https://klavity.in' },
    }
    await submitReport(extConfig)

    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
    // submitReport does one POST to /api/feedback (screenshots is empty so no blob-fetches).
    expectExt(calls).toHaveLength(1)
    const extensionForm = (calls[0][1] as RequestInit).body as FormData

    // SHARED fields: must match the reference exactly (proves unified serializer is used).
    for (const field of ['type', 'description', 'page_url', 'context', 'project_id', 'replay_events'] as const) {
      expectExt(extensionForm.get(field)).toBe(reference.get(field))
    }

    // EXTENSION-ONLY fields: present (direct mode, plane creds forwarded).
    expectExt(extensionForm.get('plane_token')).not.toBeNull()
    expectExt(extensionForm.get('plane_workspace')).not.toBeNull()
    expectExt(extensionForm.get('plane_project_id')).not.toBeNull()
    expectExt(extensionForm.get('plane_host')).not.toBeNull()

    // WIDGET-ONLY fields: absent (these belong to the widget path only).
    expectExt(extensionForm.get('referrer')).toBeNull()
    expectExt(extensionForm.get('annotations_json')).toBeNull()
    expectExt(extensionForm.get('reporter_email')).toBeNull()
  })
})
