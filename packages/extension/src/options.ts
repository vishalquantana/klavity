import { DEFAULT_SETTINGS, parsePlaneUrl, parseJiraUrl, parseGithubUrl } from '@klavity/core'
import type { KlavitySettings, IntegrationType } from '@klavity/core'

const $ = (id: string) => document.getElementById(id) as HTMLInputElement | HTMLSelectElement
const setVal = (id: string, v: string) => { ($(id) as HTMLInputElement).value = v }
const flash = (okId: string) => document.getElementById(okId)?.classList.add('show')

function showSection(integration: IntegrationType) {
  ;['jira', 'linear', 'github', 'plane'].forEach(id => {
    const el = document.getElementById(`${id}-section`)!
    el.style.display = id === integration ? '' : 'none'
  })
}

async function load() {
  const result = await chrome.storage.sync.get('klavSettings')
  const s: KlavitySettings = { ...DEFAULT_SETTINGS, ...(result.klavSettings ?? {}) }

  ;($('integration') as HTMLSelectElement).value = s.integration
  ;($('jira-baseUrl') as HTMLInputElement).value = s.jira.baseUrl
  ;($('jira-email') as HTMLInputElement).value = s.jira.email
  ;($('jira-token') as HTMLInputElement).value = s.jira.token
  ;($('jira-projectKey') as HTMLInputElement).value = s.jira.projectKey
  ;($('linear-apiKey') as HTMLInputElement).value = s.linear.apiKey
  ;($('linear-teamId') as HTMLInputElement).value = s.linear.teamId
  ;($('github-token') as HTMLInputElement).value = s.github.token
  ;($('github-repo') as HTMLInputElement).value = s.github.repo
  ;($('plane-token') as HTMLInputElement).value = s.plane.token
  ;($('plane-host') as HTMLInputElement).value = s.plane.host || 'https://api.plane.so'
  ;($('plane-workspace') as HTMLInputElement).value = s.plane.workspace
  ;($('plane-projectId') as HTMLInputElement).value = s.plane.projectId
  ;($('backendUrl') as HTMLInputElement).value = s.backendUrl
  ;($('autoFileErrors') as HTMLInputElement).checked = s.autoFileErrors

  showSection(s.integration)
}

$('integration').addEventListener('change', (e) => {
  showSection((e.target as HTMLSelectElement).value as IntegrationType)
})

// ── paste-a-URL → auto-fill the granular fields ──
$('plane-url').addEventListener('input', (e) => {
  const parts = parsePlaneUrl((e.target as HTMLInputElement).value)
  if (!parts) return
  setVal('plane-host', parts.host)
  setVal('plane-workspace', parts.workspace)
  setVal('plane-projectId', parts.projectId)
  flash('plane-url-ok')
})
$('jira-url').addEventListener('input', (e) => {
  const parts = parseJiraUrl((e.target as HTMLInputElement).value)
  if (!parts) return
  setVal('jira-baseUrl', parts.baseUrl)
  if (parts.projectKey) setVal('jira-projectKey', parts.projectKey)
  flash('jira-url-ok')
})
$('github-url').addEventListener('input', (e) => {
  const parts = parseGithubUrl((e.target as HTMLInputElement).value)
  if (!parts) return
  setVal('github-repo', parts.repo)
  flash('github-url-ok')
})

$('save').addEventListener('click', async () => {
  const settings: KlavitySettings = {
    integration: ($('integration') as HTMLSelectElement).value as IntegrationType,
    backendUrl: ($('backendUrl') as HTMLInputElement).value.trim(),
    autoFileErrors: ($('autoFileErrors') as HTMLInputElement).checked,
    jira: {
      baseUrl: ($('jira-baseUrl') as HTMLInputElement).value.trim(),
      email: ($('jira-email') as HTMLInputElement).value.trim(),
      token: ($('jira-token') as HTMLInputElement).value.trim(),
      projectKey: ($('jira-projectKey') as HTMLInputElement).value.trim(),
    },
    linear: {
      apiKey: ($('linear-apiKey') as HTMLInputElement).value.trim(),
      teamId: ($('linear-teamId') as HTMLInputElement).value.trim(),
    },
    github: {
      token: ($('github-token') as HTMLInputElement).value.trim(),
      repo: ($('github-repo') as HTMLInputElement).value.trim(),
    },
    plane: {
      token: ($('plane-token') as HTMLInputElement).value.trim(),
      host: ($('plane-host') as HTMLInputElement).value.trim() || 'https://api.plane.so',
      workspace: ($('plane-workspace') as HTMLInputElement).value.trim(),
      projectId: ($('plane-projectId') as HTMLInputElement).value.trim(),
    },
  }
  await chrome.storage.sync.set({ klavSettings: settings })
  const status = document.getElementById('status')!
  status.textContent = '✓ Saved'
  setTimeout(() => { status.textContent = '' }, 2000)
})

load()
