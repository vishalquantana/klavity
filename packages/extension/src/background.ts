import type { BackgroundMessage, ContentMessage, KlavitySettings } from '@klavity/core'
import { DEFAULT_SETTINGS } from '@klavity/core'
import { dispatchSubmit } from '@klavity/core/submit'
import { submitReport as jiraSubmit } from '@klavity/core/integrations/jira'
import { submitReport as linearSubmit } from '@klavity/core/integrations/linear'
import { submitReport as githubSubmit } from '@klavity/core/integrations/github'
import { submitReport as planeSubmit } from '@klavity/core/integrations/plane'
import { submitReport as backendSubmit } from '@klavity/core/integrations/backend'

async function getSettings(): Promise<KlavitySettings> {
  const result = await chrome.storage.sync.get('klavSettings')
  return { ...DEFAULT_SETTINGS, ...(result.klavSettings ?? {}) }
}

function getTrackerUrl(settings: KlavitySettings): string {
  switch (settings.integration) {
    case 'jira': return settings.jira.baseUrl ? `${settings.jira.baseUrl}/browse` : ''
    case 'linear': return 'https://linear.app'
    case 'github': return settings.github.repo ? `https://github.com/${settings.github.repo}/issues` : ''
    case 'plane': {
      if (!settings.plane.workspace) return ''
      const h = (settings.plane.host || 'https://api.plane.so').replace(/\/+$/, '')
      const web = h === 'https://api.plane.so' ? 'https://app.plane.so' : h // self-hosted shares its origin
      return `${web}/${settings.plane.workspace}`
    }
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'klavity-bug', title: '🐛 Report a Bug', contexts: ['all'] })
  chrome.contextMenus.create({ id: 'klavity-feature', title: '💡 Request a Feature', contexts: ['all'] })
  chrome.contextMenus.create({ id: 'klavity-history', title: '📋 View submissions', contexts: ['all'] })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return

  if (info.menuItemId === 'klavity-history') {
    const settings = await getSettings()
    const url = getTrackerUrl(settings)
    if (url) chrome.tabs.create({ url })
    return
  }

  const reportType = info.menuItemId === 'klavity-bug' ? 'bug' : 'feature'
  chrome.tabs.sendMessage(tab.id, { kind: 'OPEN_MODAL', reportType } satisfies ContentMessage)
})

chrome.runtime.onMessage.addListener((msg: BackgroundMessage, sender, sendResponse) => {
  if (msg.kind === 'AUTO_FILE_ERROR') {
    getSettings().then(settings => {
      // Guard again on the background side in case the flag changed between
      // the content script reading it and the message arriving.
      if (!settings.autoFileErrors) return

      const body = [
        `**Page:** ${msg.pageUrl}`,
        `**Time:** ${new Date(msg.timestamp).toISOString()}`,
        '',
        msg.stack ? `**Stack trace:**\n\`\`\`\n${msg.stack}\n\`\`\`` : '',
      ].filter(Boolean).join('\n')

      const payload = {
        type: 'bug' as const,
        description: `Auto: ${msg.message}\n\n${body}`,
        context: {
          pageUrl: msg.pageUrl,
          userAgent: '',
          screenSize: '',
          viewportSize: '',
          consoleErrors: [],
          networkFailures: [],
        },
        screenshots: [],
      }

      return dispatchSubmit(payload, settings, {
        jira: jiraSubmit,
        linear: linearSubmit,
        github: githubSubmit,
        plane: planeSubmit,
        backend: backendSubmit,
      })
    }).catch(() => {
      // Fire-and-forget: silently ignore submission errors for auto-filed bugs
    })
    return true
  }

  if (msg.kind === 'CAPTURE_TAB') {
    chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
      const tabId = sender.tab?.id
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { kind: 'CAPTURE_TAB_RESULT', dataUrl } satisfies ContentMessage)
      }
    })
    return true
  }

  if (msg.kind === 'SUBMIT_REPORT') {
    getSettings().then(settings => {
      return dispatchSubmit(msg.payload, settings, {
        jira: jiraSubmit,
        linear: linearSubmit,
        github: githubSubmit,
        plane: planeSubmit,
        backend: backendSubmit,
      })
    }).then(result => {
      const tabId = sender.tab?.id
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { kind: 'SUBMIT_SUCCESS', ...result } satisfies ContentMessage)
      }
    }).catch(err => {
      const tabId = sender.tab?.id
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { kind: 'SUBMIT_ERROR', message: String(err.message) } satisfies ContentMessage)
      }
    })
    return true
  }
})
