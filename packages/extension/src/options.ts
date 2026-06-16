import { DEFAULT_SETTINGS, detectTrackerUrl } from '@klavity/core'
import type { KlavitySettings, IntegrationType } from '@klavity/core'

const $ = (id: string) => document.getElementById(id) as HTMLInputElement | HTMLSelectElement
const setVal = (id: string, v: string) => { ($(id) as HTMLInputElement).value = v }

function showSection(integration: IntegrationType) {
  ;['jira', 'linear', 'github', 'plane'].forEach(id => {
    const el = document.getElementById(`${id}-section`)!
    el.style.display = id === integration ? '' : 'none'
  })
}

function setCloud(on: boolean) {
  ;($('cloudToggle') as HTMLInputElement).checked = on
  document.getElementById('cloud-fields')!.style.display = on ? '' : 'none'
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
  setCloud(!!s.backendUrl)
  ;($('autoFileErrors') as HTMLInputElement).checked = s.autoFileErrors

  showSection(s.integration)
}

$('integration').addEventListener('change', (e) => {
  showSection((e.target as HTMLSelectElement).value as IntegrationType)
})

$('cloudToggle').addEventListener('change', (e) => {
  setCloud((e.target as HTMLInputElement).checked)
})

// ── paste any tracker URL → detect the tracker, switch to it, and fill its fields ──
$('smart-url').addEventListener('input', (e) => {
  const d = detectTrackerUrl((e.target as HTMLInputElement).value)
  const ok = document.getElementById('smart-url-ok')!
  if (!d) { ok.classList.remove('show'); return }

  ;($('integration') as HTMLSelectElement).value = d.integration
  showSection(d.integration)
  if (d.plane) { setVal('plane-host', d.plane.host); setVal('plane-workspace', d.plane.workspace); setVal('plane-projectId', d.plane.projectId) }
  if (d.jira) { setVal('jira-baseUrl', d.jira.baseUrl); if (d.jira.projectKey) setVal('jira-projectKey', d.jira.projectKey) }
  if (d.github) { setVal('github-repo', d.github.repo) }

  const label: Record<string, string> = { plane: 'Plane', jira: 'Jira', github: 'GitHub', linear: 'Linear' }
  ok.textContent = d.integration === 'linear'
    ? '✓ Detected Linear — add your API key + team ID below'
    : `✓ Detected ${label[d.integration]} — fields filled, just add your token`
  ok.classList.add('show')
})

$('save').addEventListener('click', async () => {
  const cloudOn = ($('cloudToggle') as HTMLInputElement).checked
  const settings: KlavitySettings = {
    integration: ($('integration') as HTMLSelectElement).value as IntegrationType,
    backendUrl: cloudOn ? ($('backendUrl') as HTMLInputElement).value.trim() : '',
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
