import { toPng } from 'html-to-image'
import type { KlavSettings, ReportType, SubmitReportPayload, IntegrationConfig, ConsoleError, NetworkFailure } from '@klav/core'
import { DEFAULT_SETTINGS } from '@klav/core'
import { dispatchSubmit } from '@klav/core/submit'
import { buildModal } from '@klav/core/modal'
import { submitReport as jiraSubmit } from '@klav/core/integrations/jira'
import { submitReport as linearSubmit } from '@klav/core/integrations/linear'
import { submitReport as githubSubmit } from '@klav/core/integrations/github'
import { submitReport as planeSubmit } from '@klav/core/integrations/plane'
import { submitReport as backendSubmit } from '@klav/core/integrations/backend'

export type SdkConfig = Partial<KlavSettings>

let _settings: KlavSettings = DEFAULT_SETTINGS
const _consoleErrors: ConsoleError[] = []
const _networkFailures: NetworkFailure[] = []
const MAX_RING = 50

async function capturePageDataUrl(): Promise<string> {
  return toPng(document.body, {
    cacheBust: true,
    pixelRatio: 1,
    skipFonts: true,
    filter: (node) => {
      if ((node as HTMLElement).id === 'klav-sdk-host') return false
      if (node.nodeName === 'IMG') {
        const src = (node as HTMLImageElement).src ?? ''
        if (src && !src.startsWith(window.location.origin) && !src.startsWith('data:')) return false
      }
      return true
    },
  })
}

function buildContext(): SubmitReportPayload['context'] {
  return {
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    consoleErrors: [..._consoleErrors],
    networkFailures: [..._networkFailures],
  }
}

async function dispatchToIntegration(config: IntegrationConfig) {
  return dispatchSubmit(
    { type: config.type, description: config.description, context: config.context, screenshots: config.screenshots },
    _settings,
    { jira: jiraSubmit, linear: linearSubmit, github: githubSubmit, plane: planeSubmit, backend: backendSubmit },
  )
}

export function openModal(type: ReportType = 'bug') {
  const controller = buildModal(type, {
    onCaptureFull: capturePageDataUrl,
    onSubmit: async (payload) => dispatchToIntegration({
      type: payload.type,
      description: payload.description,
      context: buildContext(),
      screenshots: payload.screenshots,
      settings: _settings,
    }),
  })

  // Auto-capture on open
  setTimeout(async () => {
    try {
      const dataUrl = await capturePageDataUrl()
      controller.addScreenshot(dataUrl)
    } catch { /* ignore */ }
  }, 200)
}

function setupErrorCapture() {
  window.onerror = (msg, _src, _line, _col, err) => {
    _consoleErrors.push({ message: String(msg), stack: err?.stack, timestamp: Date.now() })
    if (_consoleErrors.length > MAX_RING) _consoleErrors.shift()
    return false
  }
  window.addEventListener('unhandledrejection', (e) => {
    _consoleErrors.push({ message: String(e.reason), stack: e.reason?.stack, timestamp: Date.now() })
    if (_consoleErrors.length > MAX_RING) _consoleErrors.shift()
  })
  const origFetch = window.fetch
  window.fetch = async (...args) => {
    const res = await origFetch(...args)
    if (res.status >= 400) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url
      _networkFailures.push({ url, status: res.status, method: 'FETCH', timestamp: Date.now() })
      if (_networkFailures.length > MAX_RING) _networkFailures.shift()
    }
    return res
  }
}

function addContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    const menu = document.createElement('div')
    menu.style.cssText = `position:fixed;left:${Math.min(e.clientX, window.innerWidth - 200)}px;top:${Math.min(e.clientY, window.innerHeight - 80)}px;background:#1e1e2e;border:1px solid #45475a;border-radius:8px;padding:4px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:system-ui;`
    menu.innerHTML = `
      <div data-action="bug" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">🐛 Report a Bug</div>
      <div data-action="feature" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">💡 Request a Feature</div>
    `
    document.body.appendChild(menu)

    const dismiss = (ev?: Event) => {
      if (!ev || !menu.contains(ev.target as Node)) {
        menu.remove()
        document.removeEventListener('click', dismiss)
      }
    }

    menu.addEventListener('click', (ev) => {
      const action = (ev.target as HTMLElement).closest('[data-action]')?.getAttribute('data-action') as ReportType | null
      menu.remove()
      document.removeEventListener('click', dismiss)
      if (action) openModal(action)
    })

    setTimeout(() => document.addEventListener('click', dismiss), 0)
  })
}

export function init(config: SdkConfig = {}) {
  _settings = {
    ...DEFAULT_SETTINGS,
    ...config,
    jira: { ...DEFAULT_SETTINGS.jira, ...config.jira },
    linear: { ...DEFAULT_SETTINGS.linear, ...config.linear },
    github: { ...DEFAULT_SETTINGS.github, ...config.github },
    plane: { ...DEFAULT_SETTINGS.plane, ...config.plane },
  }
  setupErrorCapture()
  addContextMenu()
}

// Expose on window for script-tag usage
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).KlavSnap = { init, openModal }
}

export default { init, openModal }
