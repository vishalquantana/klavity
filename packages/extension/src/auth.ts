import type { KlavitySettings, KlavConfig, KlavMonitoredProject } from '@klavity/core'

const DEFAULT_BACKEND = 'https://klavity.in'

export function backendBase(s: Partial<KlavitySettings>): string {
  return (s.backendUrl || DEFAULT_BACKEND).replace(/\/+$/, '')
}

async function readSettings(): Promise<Partial<KlavitySettings>> {
  const r = await chrome.storage.sync.get('klavSettings')
  return (r.klavSettings as Partial<KlavitySettings>) ?? {}
}

async function persistToken(token: string, backendUrl: string): Promise<void> {
  const cur = await readSettings()
  await chrome.storage.sync.set({
    klavSettings: { ...cur, klavToken: token, backendUrl, connectionMode: 'klavity' },
  })
}

export function triggerConfigSync(): Promise<KlavConfig | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ kind: 'KLAV_SYNC_CONFIG' }, (resp: any) => {
      void chrome.runtime.lastError // SW may be asleep; reading clears the warning
      resolve(resp?.config ?? null)
    })
  })
}

/**
 * True when the user explicitly signed out of the extension. While set we skip
 * the cookie-based silent login, otherwise the klavity.in `klav_session` cookie
 * re-authenticates them on the next popup open and sign-out looks broken.
 */
export async function isSignedOutExplicitly(): Promise<boolean> {
  const r = await chrome.storage.local.get('klavSignedOut')
  return !!r.klavSignedOut
}

async function clearSignedOutFlag(): Promise<void> {
  await chrome.storage.local.remove(['klavSignedOut'])
}

/**
 * Sign in from the klavity.in session cookie. Suppressed after an explicit
 * sign-out unless `force` (the user pressed "Continue" themselves).
 */
export async function trySilentLogin(opts: { force?: boolean } = {}): Promise<boolean> {
  if (!chrome.cookies?.get) return false
  if (!opts.force && (await isSignedOutExplicitly())) return false
  const base = backendBase(await readSettings())
  try {
    const cookie = await chrome.cookies.get({ url: base, name: 'klav_session' })
    if (!cookie?.value) return false
    await clearSignedOutFlag()
    await persistToken(cookie.value, base)
    await triggerConfigSync()
    return true
  } catch {
    return false
  }
}

export async function requestCode(email: string): Promise<{ ok: boolean; error?: string }> {
  const base = backendBase(await readSettings())
  try {
    const res = await fetch(`${base}/api/auth/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: data.error || 'Could not send code.' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error. Try again.' }
  }
}

export async function verifyCode(email: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const base = backendBase(await readSettings())
  try {
    const res = await fetch(`${base}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.token) return { ok: false, error: data.error || 'Invalid or expired code.' }
    await clearSignedOutFlag()
    await persistToken(data.token, base)
    await triggerConfigSync()
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error. Try again.' }
  }
}

export async function getConfig(): Promise<KlavConfig | null> {
  const r = await chrome.storage.local.get('klavConfig')
  return (r.klavConfig as KlavConfig | undefined) ?? null
}

export async function isSignedIn(): Promise<boolean> {
  const c = await getConfig()
  return !!c?.email
}

export async function signOut(): Promise<void> {
  const cur = await readSettings()
  await chrome.storage.sync.set({ klavSettings: { ...cur, klavToken: '', connectionMode: 'direct' } })
  // Keep klavSelectedProjectId so the user's project survives a later re-login.
  await chrome.storage.local.remove(['klavConfig', 'klavSims'])
  await chrome.storage.local.set({ klavSignedOut: true })
}

export async function getSelectedProjectId(): Promise<string | null> {
  const r = await chrome.storage.local.get('klavSelectedProjectId')
  return (r.klavSelectedProjectId as string | undefined) ?? null
}

export async function setSelectedProjectId(id: string): Promise<void> {
  await chrome.storage.local.set({ klavSelectedProjectId: id })
}

export function pickProject(projects: KlavMonitoredProject[], savedId: string | null): KlavMonitoredProject | null {
  if (!projects.length) return null
  if (savedId) {
    const found = projects.find((p) => p.id === savedId)
    if (found) return found
  }
  return projects[0]
}
