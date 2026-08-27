// @vitest-environment jsdom
//
// KLA-727 [Snap/ext] — report data-loss negative control.
//
// The extension's report submit path used to SILENTLY DROP data the shared composer (buildModal) produces
// and the widget keeps: annotations, recordings, reporter_email, client_info, and it always shipped console
// logs (the widget gates them behind a default-OFF toggle). These tests reproduce the REAL two-stage path —
//   content.ts  submitViaSW()          → marshals the composer payload into the SUBMIT_REPORT message
//   background.ts submitToBackendWithExtras() → serializes that payload into the /api/feedback FormData
// — and assert the previously-dropped fields now survive end-to-end.
//
// NEGATIVE CONTROL: every assertion below FAILS against the pre-fix code:
//   • submitViaSW dropped `annotations`/`recordings` (destructured only {type,kind,title,description,
//     screenshots,files}) → payload.annotations undefined → FormData has no annotations_json.
//   • buildContext() always shipped consoleErrors → context.consoleErrors non-empty (no toggle gate).

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { KlavitySettings } from '@klavity/core'
// KLA-729 reconciliation: the extension no longer has a local serializer — the full payload flows through
// the SHARED core path (dispatchSubmit → submitReport). Stage 2 drives that exact path.
import { dispatchSubmit } from '@klavity/core/submit'
import { submitReport as backendSubmit } from '@klavity/core/integrations/backend'

// ── Shared chrome + fetch stubs ───────────────────────────────────────────────
let capturedSubmit: any = null
let capturedForm: FormData | null = null

function installChromeStub() {
  const store = new Map<string, unknown>()
  const noopListener = { addListener: () => {} }
  const g: any = globalThis as any
  g.chrome = {
    runtime: {
      getManifest: () => ({ name: 'klav-test', content_scripts: [{ js: [], css: [] }] }),
      // submitViaSW → sendToBackground → chrome.runtime.sendMessage: capture the SUBMIT_REPORT payload.
      sendMessage: vi.fn(async (msg: any) => { if (msg?.kind === 'SUBMIT_REPORT') capturedSubmit = msg.payload }),
      lastError: undefined,
      onMessage: noopListener,
      onInstalled: noopListener,
      onStartup: noopListener,
      onMessageExternal: noopListener,
    },
    contextMenus: { onClicked: noopListener, removeAll: (cb: () => void) => cb?.(), create: () => {} },
    tabs: { onUpdated: noopListener, onActivated: noopListener, query: () => {} },
    storage: {
      local: {
        get: (k: string | string[]) => {
          const keys = Array.isArray(k) ? k : [k]
          return Promise.resolve(Object.fromEntries(keys.map((x) => [x, store.get(x)])))
        },
        set: (obj: Record<string, unknown>) => { for (const [x, v] of Object.entries(obj)) store.set(x, v); return Promise.resolve() },
        remove: (k: string | string[]) => { for (const x of Array.isArray(k) ? k : [k]) store.delete(x); return Promise.resolve() },
      },
      sync: { get: (_k: any) => Promise.resolve({}) },
      onChanged: noopListener,
    },
    scripting: {},
    permissions: {},
  }
}

// data: URLs → a fake blob (recordings/thumbs/screenshots); the /api/feedback POST → capture the FormData.
function installFetchStub() {
  ;(globalThis as any).fetch = vi.fn(async (url: any, init?: any) => {
    const u = String(url)
    if (u.startsWith('data:')) return { blob: async () => new Blob(['x']) } as any
    capturedForm = init?.body instanceof FormData ? (init.body as FormData) : null
    return { ok: true, json: async () => ({ id: 'X', jira_key: 'KLA-1', issue_url: 'https://k/1' }), text: async () => '' } as any
  })
}

const SETTINGS: KlavitySettings = {
  integration: 'plane', backendUrl: 'https://backend.test', autoFileErrors: false,
  connectionMode: 'klavity', klavToken: 'tok',
  jira: { baseUrl: '', email: '', token: '', projectKey: '' },
  linear: { apiKey: '', teamId: '' },
  github: { token: '', repo: '' },
  plane: { token: '', host: '', workspace: '', projectId: '' },
}

// A composer payload carrying a DRAWN annotation + a recording — exactly the shape modal.ts onSubmit yields.
const ANNOTATIONS = { w: 100, h: 80, shapes: [{ type: 'rect', x: 1, y: 2, w: 3, h: 4 }], byIndex: { 0: { w: 100, h: 80, shapes: [{ type: 'rect', x: 1, y: 2, w: 3, h: 4 }] } } }
const RECORDING = { id: 'rec1', dataUrl: 'data:video/webm;base64,AAAA', mime: 'video/webm', durationMs: 1200, bytes: 42, width: 640, height: 480, screenOnly: false }

beforeEach(() => {
  capturedSubmit = null
  capturedForm = null
  installChromeStub()
  installFetchStub()
  const g: any = globalThis as any
  if (!g.requestIdleCallback) g.requestIdleCallback = (f: () => void) => setTimeout(f, 0)
  if (!g.cancelIdleCallback) g.cancelIdleCallback = (id: number) => clearTimeout(id)
})

describe('KLA-727 — extension report submit no longer drops composer data', () => {
  it('forwards annotations + recording + client_info, and does NOT attach console logs by default', async () => {
    vi.resetModules()
    const content = await import('./content')

    // Seed a console error into the capture buffer (installCapture wraps console.error at import). Pre-fix,
    // buildContext() would ship this in the report; the default-OFF toggle must strip it now.
    console.error('KLA-727-console-canary')

    // ── Stage 1: content.ts marshals the composer payload into the SUBMIT_REPORT message ──
    void content.submitViaSW({
      type: 'bug',
      description: 'Something broke',
      screenshots: [], // empty → no jsdom <img> decode needed; annotations/recording are the point here
      annotations: ANNOTATIONS,
      recordings: [RECORDING],
      reporterEmail: 'vishal@quantana.com.au',
      // attachConsole omitted → console must be stripped (default OFF, widget parity)
    })
    await vi.waitFor(() => expect(capturedSubmit).not.toBeNull())

    // Content-layer proof: the fields the extension used to DROP now ride the payload…
    expect(capturedSubmit.annotations).toEqual(ANNOTATIONS)
    expect(capturedSubmit.recordings).toHaveLength(1)
    expect(capturedSubmit.reporterEmail).toBe('vishal@quantana.com.au')
    expect(capturedSubmit.clientInfo).toBeTruthy()
    // …and console logs are NOT attached by default (toggle off).
    expect(capturedSubmit.context.consoleErrors).toEqual([])

    // ── Stage 2: the SHARED core path (dispatchSubmit → submitReport) serializes that SAME payload into
    //    the /api/feedback FormData. This is exactly what background.ts SUBMIT_REPORT now calls. ──
    await dispatchSubmit(capturedSubmit, SETTINGS, { backend: backendSubmit })
    expect(capturedForm).toBeTruthy()
    const fd = capturedForm!
    // The drop is fixed at the wire: annotations_json + recording blobs + recording_meta + client_info present.
    expect(fd.get('annotations_json')).toBe(JSON.stringify(ANNOTATIONS))
    expect(fd.getAll('recording')).toHaveLength(1)
    expect(JSON.parse(String(fd.get('recording_meta')))[0].id).toBe('rec1')
    expect(fd.get('client_info')).toBeTruthy()
    expect(fd.get('reporter_email')).toBe('vishal@quantana.com.au')

    // ── Toggle is a real gate, not a hard-strip: opting in (attachConsole:true) DOES attach the console
    //    logs. Reuses the SAME module instance so the live capture buffer (which holds the canary above)
    //    is intact — the console wrapper is installed once per module load. ──
    capturedSubmit = null
    void content.submitViaSW({ type: 'bug', description: 'opt-in', screenshots: [], attachConsole: true })
    await vi.waitFor(() => expect(capturedSubmit).not.toBeNull())
    expect(capturedSubmit.context.consoleErrors.length).toBeGreaterThan(0)
  })
})
