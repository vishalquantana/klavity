/**
 * sims-select-modal.ts — the "Select Sims" management modal (right-click menu → "Select Sims…").
 *
 * ISOLATED, ADDITIVE component. It talks to the backend only through the injected `api` (the new
 * /api/widget/sim-deployments endpoint) and reports successful changes through `onChange`, so it
 * shares no state with the legacy "Deploy all Sims" flow, SimsLive, the watch engine, or AutoSims.
 *
 * Each Sim carries two independent statuses:
 *   deployment: not_deployed | deployed | deactivated
 *   execution:  not_running  | running  | paused
 *
 * Bulk actions act on the CHECKED Sims, split by compatibility — "Deploy" only ever sends the
 * undeployed ones and "Deactivate" only the deployed ones, so a mixed selection can never apply an
 * incompatible action. Pause / Resume are per-Sim row controls that never touch deployment.
 */

import { icon } from '../../core/src/icons'
import { safeRemove } from '../../core/src/safe-remove'

export type ManagedSimDeployment = 'not_deployed' | 'deployed' | 'deactivated'
export type ManagedSimExecution = 'not_running' | 'running' | 'paused'
export type ManagedSimAction = 'deploy' | 'deactivate' | 'pause' | 'resume'

export interface ManagedSim {
  id: string
  name: string
  role?: string
  initials?: string | null
  accent?: string | null
  avatar?: string | null
  deployment: ManagedSimDeployment
  execution: ManagedSimExecution
  /** false = deactivated on the dashboard Sims tab: shown greyed out, no actions. Absent (older server) = active. */
  active?: boolean
}

export interface ManagedSimActionResult {
  applied: string[]
  skipped: Array<{ simId: string; reason: string }>
  sims: ManagedSim[]
}

export interface SelectSimsApi {
  load(): Promise<ManagedSim[]>
  act(action: ManagedSimAction, simIds: string[]): Promise<ManagedSimActionResult>
}

export interface SelectSimsModalOptions {
  api: SelectSimsApi
  /** Ids to pre-check (the selection from the last time the modal was open). */
  initialSelection?: string[]
  /** Fired whenever the checked set changes — lets the host remember it across reopen. */
  onSelectionChange?: (ids: string[]) => void
  /** Fired after every successful action with the fresh server state. */
  onChange?: (sims: ManagedSim[], change: { action: ManagedSimAction; applied: string[] }) => void
  /** Where to mount. Defaults to document.body. */
  mount?: HTMLElement
}

export interface SelectSimsModalController {
  close(): void
  /** The full-viewport host element (carries data-klavity-ui so captures skip it). */
  host: HTMLElement
}

export const SELECT_SIMS_HOST_ID = 'klav-select-sims'

export const isUndeployed = (s: ManagedSim) => s.deployment !== 'deployed'
export const isDeployed = (s: ManagedSim) => s.deployment === 'deployed'
/** Deactivated on the Sims tab — it can only be re-activated there, never from this modal. */
export const isSimInactive = (s: ManagedSim) => s.active === false

/** Which bulk actions a selection allows (pure — exported for tests). */
/** Signature of the managed state: deployed Sims + their execution ("" when nothing is deployed). */
export function managedSigOf(sims: ManagedSim[]): string {
  return sims.filter((s) => s.deployment === 'deployed' && !isSimInactive(s)).map((s) => s.id + ':' + s.execution).sort().join(',')
}

/**
 * What a page should do when the server state may have changed outside its modal (dashboard Sims tab,
 * another tab, a reload). `prevSig` is null before the first sync. `fresh` = Sims that just started
 * running and should review the page now; empty on the first sync (restore only, no extra AI review).
 */
export function planManagedSync(prevSig: string | null, sims: ManagedSim[], mounted: boolean):
  { kind: 'skip'; sig: string } | { kind: 'apply'; sig: string; fresh: string[] } {
  const sig = managedSigOf(sims)
  if (sig === prevSig) return { kind: 'skip', sig }
  // Nothing deployed via Select Sims and nothing of ours on the page → leave the page (and legacy Sims) alone.
  if (!sig && !mounted) return { kind: 'skip', sig }
  const wasRunning = new Set((prevSig || '').split(',').filter((x) => x.endsWith(':running')).map((x) => x.slice(0, -':running'.length)))
  const nowRunning = sims.filter((s) => s.deployment === 'deployed' && !isSimInactive(s) && s.execution === 'running').map((s) => s.id)
  const fresh = prevSig === null ? [] : nowRunning.filter((id) => !wasRunning.has(id))
  return { kind: 'apply', sig, fresh }
}

export function bulkActionsFor(sims: ManagedSim[], selected: Set<string>): { deploy: string[]; deactivate: string[] } {
  const deploy: string[] = []
  const deactivate: string[] = []
  for (const s of sims) {
    if (!selected.has(s.id) || isSimInactive(s)) continue
    if (isDeployed(s)) deactivate.push(s.id)
    else deploy.push(s.id)
  }
  return { deploy, deactivate }
}

const EXECUTION_LABEL: Record<ManagedSimExecution, string> = {
  not_running: 'Not active', running: 'Active', paused: 'Paused',
}

const CSS = `
:host{all:initial}
*{box-sizing:border-box}
[hidden]{display:none!important}
.kss-backdrop{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:16px;background:rgba(25,20,15,.32);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font-family:'Hanken Grotesk',system-ui,-apple-system,sans-serif;color:#19140f;animation:kss-fade .18s ease both}
.kss-modal{position:relative;width:640px;max-width:100%;max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:#fff;border-radius:22px;box-shadow:0 30px 80px -20px rgba(25,20,15,.35),0 0 0 1px rgba(25,20,15,.06);overflow:hidden;animation:kss-pop .22s cubic-bezier(.16,1,.3,1) both}
.kss-head{padding:24px 26px 20px;border-bottom:1px solid rgba(25,20,15,.09);position:relative}
.kss-title{margin:0;font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:28px;line-height:1.15;color:#19140f}
.kss-sub{margin:8px 0 0;font-size:14px;color:#574f45}
.kss-x{position:absolute;top:18px;right:18px;width:30px;height:30px;display:grid;place-items:center;border:0;border-radius:9px;background:transparent;color:#706560;cursor:pointer}
.kss-x:hover{background:#efeae0}
.kss-search{padding:14px 24px;border-bottom:1px solid rgba(25,20,15,.09)}
.kss-search label{display:flex;align-items:center;gap:10px;height:52px;padding:0 16px;border:1.5px solid rgba(25,20,15,.18);border-radius:14px;background:#faf8f4;color:#706560;transition:border-color .15s,box-shadow .15s}
.kss-search label:focus-within{border-color:#8b8bf5;box-shadow:0 0 0 4px rgba(99,102,241,.14)}
.kss-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:15px;color:#19140f}
.kss-body{flex:1;min-height:120px;overflow-y:auto;padding:12px 16px 14px}
.kss-all{display:flex;align-items:center;gap:12px;padding:10px 4px 14px 4px;margin:0 4px 10px;border-bottom:1px solid rgba(25,20,15,.09);cursor:pointer}
.kss-all-t{font-size:14px;font-weight:600}
.kss-all-d{font-size:12px;color:#574f45;margin-top:2px}
.kss-list{display:flex;flex-direction:column;gap:8px}
.kss-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid rgba(99,102,241,.16);border-radius:14px;background:#fff;cursor:pointer;transition:background .14s,border-color .14s}
.kss-row:hover{background:#faf9ff}
.kss-row.on{border-color:rgba(99,102,241,.38);background:rgba(99,102,241,.04)}
.kss-chk{width:20px;height:20px;flex:none;display:grid;place-items:center;border-radius:6px;border:1.5px solid rgba(99,102,241,.4);background:#fff;color:#fff;transition:background .14s,border-color .14s}
.kss-chk.on,.kss-chk.mixed{background:#6366f1;border-color:#6366f1}
.kss-av{width:48px;height:48px;flex:none;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;color:#fff;background:#6366f1;overflow:hidden}
.kss-av img{width:100%;height:100%;object-fit:cover}
.kss-meta{flex:1;min-width:0}
.kss-name{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kss-role{font-size:13px;color:#574f45;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kss-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.kss-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;line-height:1;padding:4px 8px;border-radius:999px;background:#efeae0;color:#574f45}
.kss-badge::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.8}
.kss-badge.deployed{background:rgba(16,185,129,.12);color:#047857}
.kss-badge.deactivated{background:rgba(239,68,68,.1);color:#b91c1c}
.kss-badge.running{background:rgba(16,185,129,.12);color:#047857}
.kss-badge.paused{background:rgba(245,158,11,.14);color:#b45309}
.kss-row.off{cursor:default;background:#f7f5f1;border-color:rgba(25,20,15,.1)}
.kss-row.off:hover{background:#f7f5f1}
.kss-row.off .kss-av{filter:grayscale(1);opacity:.55}
.kss-row.off .kss-name,.kss-row.off .kss-role{color:#8a8178}
.kss-row.off .kss-chk{background:#efeae0;border-color:rgba(25,20,15,.14)}
.kss-hint{font-size:12px;color:#8a8178;margin-top:6px}
.kss-exec{flex:none;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:10px;border:1px solid rgba(25,20,15,.14);background:#fff;font:inherit;font-size:13px;font-weight:600;color:#19140f;cursor:pointer}
.kss-exec:hover:not(:disabled){background:#f5f3ee}
.kss-exec:disabled{opacity:.5;cursor:default}
.kss-empty,.kss-state{padding:28px 12px;text-align:center;font-size:14px;color:#574f45}
.kss-state .kss-retry{margin-top:12px}
.kss-mixed{margin:0 24px;padding:9px 12px;border-radius:10px;background:rgba(99,102,241,.07);color:#4338ca;font-size:12.5px;line-height:1.4}
.kss-foot{display:flex;align-items:center;gap:12px;padding:16px 24px;border-top:1px solid rgba(25,20,15,.09)}
.kss-count{font-size:14px;color:#574f45;margin-right:auto;white-space:nowrap}
.kss-count b{color:#19140f}
.kss-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 20px;border-radius:12px;border:0;font:inherit;font-size:15px;font-weight:600;cursor:pointer;white-space:nowrap}
.kss-btn:disabled{opacity:.5;cursor:default}
.kss-ghost{background:transparent;color:#19140f}
.kss-ghost:hover:not(:disabled){background:#f5f3ee}
.kss-primary{background:#5b5bf0;color:#fff;box-shadow:0 6px 18px -6px rgba(91,91,240,.6)}
.kss-primary:hover:not(:disabled){background:#4f4fe0}
.kss-danger{background:#fff;color:#b91c1c;border:1px solid rgba(185,28,28,.3)}
.kss-danger:hover:not(:disabled){background:rgba(239,68,68,.06)}
.kss-toast{position:absolute;left:50%;top:14px;transform:translateX(-50%);max-width:calc(100% - 48px);padding:10px 14px;border-radius:12px;font-size:13px;font-weight:550;box-shadow:0 10px 30px -10px rgba(25,20,15,.4);z-index:2;animation:kss-fade .18s ease both}
.kss-toast.ok{background:#15110d;color:#f5f3ee}
.kss-toast.err{background:#b91c1c;color:#fff}
.kss-spin{display:inline-flex;animation:kss-spin .7s linear infinite}
@keyframes kss-spin{to{transform:rotate(360deg)}}
@keyframes kss-fade{from{opacity:0}to{opacity:1}}
@keyframes kss-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
@media (max-width:560px){.kss-foot{flex-wrap:wrap}.kss-count{width:100%}.kss-btn{flex:1}}
`

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text != null) e.textContent = text
  return e
}

const spinner = (size = 14) => `<span class="kss-spin">${icon('loader', { size })}</span>`

/** Open the Select Sims modal. Only one instance is ever open; a second call closes the first. */
export function openSelectSimsModal(opts: SelectSimsModalOptions): SelectSimsModalController {
  document.getElementById(SELECT_SIMS_HOST_ID)?.remove()
  const host = document.createElement('div')
  host.id = SELECT_SIMS_HOST_ID
  host.setAttribute('data-klavity-ui', 'select-sims')
  ;(opts.mount || document.body).appendChild(host)
  const root = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = CSS
  root.appendChild(style)

  let sims: ManagedSim[] = []
  const selected = new Set<string>(opts.initialSelection || [])
  let query = ''
  // One action at a time: guards every button against duplicate / overlapping submissions.
  let busy: null | { action: ManagedSimAction; simId?: string } = null
  let loadState: 'loading' | 'ready' | 'error' = 'loading'
  let loadError = ''
  let toastTimer: ReturnType<typeof setTimeout> | null = null
  let closed = false

  // ── skeleton ────────────────────────────────────────────────────────────────
  const backdrop = el('div', 'kss-backdrop')
  const modal = el('div', 'kss-modal')
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.setAttribute('aria-labelledby', 'kss-title')
  backdrop.appendChild(modal)
  root.appendChild(backdrop)

  const head = el('div', 'kss-head')
  const title = el('h2', 'kss-title', 'Select Sims')
  title.id = 'kss-title'
  const sub = el('p', 'kss-sub', 'Choose which Sims should analyze this page.')
  const xBtn = el('button', 'kss-x')
  xBtn.type = 'button'
  xBtn.setAttribute('aria-label', 'Close')
  xBtn.innerHTML = icon('x', { size: 16 })
  head.append(title, sub, xBtn)

  const searchWrap = el('div', 'kss-search')
  const searchLabel = el('label')
  const searchInput = el('input')
  searchInput.type = 'search'
  searchInput.placeholder = 'Search Sims by name or role…'
  searchInput.setAttribute('aria-label', 'Search Sims')
  searchLabel.innerHTML = icon('search', { size: 17 })
  searchLabel.appendChild(searchInput)
  searchWrap.appendChild(searchLabel)

  const body = el('div', 'kss-body')
  const mixedNote = el('div', 'kss-mixed')
  mixedNote.setAttribute('role', 'note')
  mixedNote.hidden = true

  const foot = el('div', 'kss-foot')
  const count = el('div', 'kss-count')
  count.setAttribute('aria-live', 'polite')
  const cancelBtn = el('button', 'kss-btn kss-ghost', 'Cancel')
  cancelBtn.type = 'button'
  const deactivateBtn = el('button', 'kss-btn kss-danger')
  deactivateBtn.type = 'button'
  deactivateBtn.dataset.action = 'deactivate'
  const deployBtn = el('button', 'kss-btn kss-primary')
  deployBtn.type = 'button'
  deployBtn.dataset.action = 'deploy'
  foot.append(count, cancelBtn, deactivateBtn, deployBtn)

  modal.append(head, searchWrap, body, mixedNote, foot)

  // ── helpers ─────────────────────────────────────────────────────────────────
  const toast = (kind: 'ok' | 'err', text: string) => {
    modal.querySelector('.kss-toast')?.remove()
    const t = el('div', 'kss-toast ' + kind, text)
    t.setAttribute('role', kind === 'err' ? 'alert' : 'status')
    modal.appendChild(t)
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => safeRemove(t), kind === 'err' ? 5000 : 3200)
  }
  const visible = () => {
    const q = query.trim().toLowerCase()
    if (!q) return sims
    return sims.filter((s) => s.name.toLowerCase().includes(q) || (s.role || '').toLowerCase().includes(q))
  }
  const emitSelection = () => opts.onSelectionChange?.([...selected])
  const plural = (n: number) => `${n} Sim${n === 1 ? '' : 's'}`

  // ── render ──────────────────────────────────────────────────────────────────
  function renderBody() {
    body.innerHTML = ''
    if (loadState === 'loading') {
      const s = el('div', 'kss-state')
      s.innerHTML = spinner(16) + ' Loading Sims…'
      body.appendChild(s)
      return
    }
    if (loadState === 'error') {
      const s = el('div', 'kss-state', loadError || "Couldn't load Sims.")
      const retry = el('button', 'kss-btn kss-ghost kss-retry', 'Try again')
      retry.type = 'button'
      retry.addEventListener('click', () => void load())
      s.appendChild(el('br'))
      s.appendChild(retry)
      body.appendChild(s)
      return
    }
    if (!sims.length) { body.appendChild(el('div', 'kss-empty', 'No Sims in this workspace yet.')); return }
    const shown = visible()
    // Deactivated Sims are listed (greyed out) but can never be selected.
    const pickable = shown.filter((s) => !isSimInactive(s))
    // Select all — applies to the selectable Sims currently matching the search.
    const all = el('div', 'kss-all')
    all.setAttribute('role', 'checkbox')
    all.tabIndex = 0
    const nOn = pickable.filter((s) => selected.has(s.id)).length
    const allOn = pickable.length > 0 && nOn === pickable.length
    all.setAttribute('aria-checked', allOn ? 'true' : nOn ? 'mixed' : 'false')
    const allChk = el('span', 'kss-chk' + (allOn ? ' on' : nOn ? ' mixed' : ''))
    allChk.innerHTML = allOn ? icon('check', { size: 13 }) : nOn ? '<span style="width:9px;height:2px;background:#fff;border-radius:2px"></span>' : ''
    const allTxt = el('div')
    allTxt.append(el('div', 'kss-all-t', query ? 'Select all matching Sims' : 'Select all Sims'),
      el('div', 'kss-all-d', query ? `${plural(shown.length)} match your search.` : 'Select everyone available on this workspace.'))
    all.append(allChk, allTxt)
    const toggleAll = () => {
      if (busy || !pickable.length) return
      if (allOn) pickable.forEach((s) => selected.delete(s.id))
      else pickable.forEach((s) => selected.add(s.id))
      emitSelection(); render()
    }
    all.addEventListener('click', toggleAll)
    all.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAll() } })
    body.appendChild(all)

    if (!shown.length) { body.appendChild(el('div', 'kss-empty', `No Sims match "${query.trim()}".`)); return }
    const list = el('div', 'kss-list')
    for (const s of shown) list.appendChild(renderRow(s))
    body.appendChild(list)
  }

  function renderRow(s: ManagedSim): HTMLElement {
    if (isSimInactive(s)) return renderInactiveRow(s)
    const on = selected.has(s.id)
    const row = el('div', 'kss-row' + (on ? ' on' : ''))
    row.dataset.simId = s.id
    row.setAttribute('role', 'checkbox')
    row.setAttribute('aria-checked', String(on))
    row.tabIndex = 0
    const chk = el('span', 'kss-chk' + (on ? ' on' : ''))
    chk.innerHTML = on ? icon('check', { size: 13 }) : ''
    const av = el('span', 'kss-av')
    av.style.background = s.accent || '#6366f1'
    if (s.avatar && /^(https?:|data:image\/)/.test(s.avatar)) {
      const img = el('img')
      img.alt = ''
      img.src = s.avatar
      img.addEventListener('error', () => { av.textContent = initialsOf(s) })
      av.appendChild(img)
    } else av.textContent = initialsOf(s)
    const meta = el('div', 'kss-meta')
    meta.appendChild(el('div', 'kss-name', s.name))
    if (s.role) meta.appendChild(el('div', 'kss-role', s.role))
    const badges = el('div', 'kss-badges')
    // Only the execution status (Active / Paused / Not active) is shown; deployment pills are hidden.
    const exe = el('span', 'kss-badge ' + s.execution, EXECUTION_LABEL[s.execution])
    exe.dataset.kind = 'execution'
    badges.appendChild(exe)
    meta.appendChild(badges)
    row.append(chk, av, meta)

    // Individual execution control — shown ONLY while deployed and running / paused.
    if (isDeployed(s) && (s.execution === 'running' || s.execution === 'paused')) {
      const action: ManagedSimAction = s.execution === 'running' ? 'pause' : 'resume'
      const b = el('button', 'kss-exec')
      b.type = 'button'
      b.dataset.action = action
      const mine = busy?.simId === s.id
      b.disabled = !!busy
      b.setAttribute('aria-label', `${action === 'pause' ? 'Pause' : 'Resume'} ${s.name}`)
      b.innerHTML = (mine ? spinner(13) : icon(action === 'pause' ? 'pause' : 'play', { size: 13 })) +
        `<span>${action === 'pause' ? (mine ? 'Pausing…' : 'Pause') : (mine ? 'Resuming…' : 'Resume')}</span>`
      b.addEventListener('click', (e) => { e.stopPropagation(); void run(action, [s.id], s.id) })
      b.addEventListener('keydown', (e) => e.stopPropagation())
      row.appendChild(b)
    }
    // Not deployed / not running yet: no Pause button at all — Pause/Resume only appear once the Sim is deployed.

    const toggle = () => {
      if (busy) return
      selected.has(s.id) ? selected.delete(s.id) : selected.add(s.id)
      emitSelection(); render()
    }
    row.addEventListener('click', toggle)
    row.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle() } })
    return row
  }

  // Deactivated on the Sims tab: visible so the user knows it exists, but disabled — no checkbox, no
  // Pause/Resume. It has to be activated again on the Sims tab before it can be used here.
  function renderInactiveRow(s: ManagedSim): HTMLElement {
    const row = el('div', 'kss-row off')
    row.dataset.simId = s.id
    row.dataset.inactive = 'true'
    row.setAttribute('aria-disabled', 'true')
    const chk = el('span', 'kss-chk')
    chk.setAttribute('aria-hidden', 'true')
    const av = el('span', 'kss-av', initialsOf(s))
    av.style.background = s.accent || '#6366f1'
    const meta = el('div', 'kss-meta')
    meta.appendChild(el('div', 'kss-name', s.name))
    if (s.role) meta.appendChild(el('div', 'kss-role', s.role))
    const badges = el('div', 'kss-badges')
    const b = el('span', 'kss-badge deactivated', 'Deactivated')
    b.dataset.kind = 'active'
    badges.appendChild(b)
    meta.appendChild(badges)
    meta.appendChild(el('div', 'kss-hint', 'Activate this Sim on the Sims tab to use it here.'))
    row.append(chk, av, meta)
    return row
  }

  function renderFoot() {
    const { deploy, deactivate } = bulkActionsFor(sims, selected)
    const n = deploy.length + deactivate.length
    count.innerHTML = `<b>${n}</b> selected`
    const deploying = busy?.action === 'deploy'
    const deactivating = busy?.action === 'deactivate'
    // Deploy is the default/primary button; it stays visible (disabled) when nothing deployable is checked
    // unless the selection is purely deployed Sims, where Deactivate takes its place.
    deployBtn.hidden = deactivate.length > 0 && deploy.length === 0
    deployBtn.disabled = !!busy || deploy.length === 0 || loadState !== 'ready'
    deployBtn.innerHTML = deploying
      ? spinner() + ' Deploying…'
      : (deploy.length && deactivate.length ? `Deploy ${plural(deploy.length)}` : 'Deploy selected Sims') + ' ' + icon('chevron-right', { size: 15 })
    deactivateBtn.hidden = deactivate.length === 0
    deactivateBtn.disabled = !!busy
    deactivateBtn.innerHTML = deactivating
      ? spinner() + ' Deactivating…'
      : deploy.length ? `Deactivate ${plural(deactivate.length)}` : 'Deactivate selected Sims'
    cancelBtn.disabled = false
    // Mixed selection: say exactly what each button will do.
    if (deploy.length && deactivate.length) {
      mixedNote.hidden = false
      mixedNote.textContent = `Mixed selection: ${plural(deploy.length)} not deployed and ${plural(deactivate.length)} already deployed. ` +
        `Deploy only applies to the undeployed Sims; Deactivate only applies to the deployed ones.`
    } else mixedNote.hidden = true
  }

  function render() {
    if (closed) return
    // Preserve scroll position across re-renders so toggling a row deep in a long list doesn't jump.
    const top = body.scrollTop
    renderBody()
    renderFoot()
    body.scrollTop = top
  }

  // ── data ────────────────────────────────────────────────────────────────────
  async function load() {
    loadState = 'loading'; render()
    try {
      sims = await opts.api.load()
      // Drop remembered ids for Sims that no longer exist so the count is accurate on reopen.
      const ids = new Set(sims.filter((s) => !isSimInactive(s)).map((s) => s.id))
      let pruned = false
      for (const id of [...selected]) if (!ids.has(id)) { selected.delete(id); pruned = true }
      if (pruned) emitSelection()
      loadState = 'ready'
    } catch (e: any) {
      loadState = 'error'
      loadError = e?.message || "Couldn't load Sims."
    }
    render()
  }

  async function run(action: ManagedSimAction, simIds: string[], simId?: string) {
    if (busy || !simIds.length || closed) return
    busy = { action, simId }
    render()
    try {
      const res = await opts.api.act(action, simIds)
      sims = res.sims
      // Bulk actions consume the selection they applied to (the Sims changed state).
      if (action === 'deploy' || action === 'deactivate') {
        for (const id of res.applied) selected.delete(id)
        emitSelection()
      }
      busy = null
      render()
      const name = (id: string) => sims.find((s) => s.id === id)?.name || 'Sim'
      const done = res.applied.length
      const msg =
        action === 'deploy' ? `Deployed ${plural(done)}.` :
        action === 'deactivate' ? `Deactivated ${plural(done)}.` :
        action === 'pause' ? `Paused ${name(simIds[0])}.` : `Resumed ${name(simIds[0])}.`
      if (done === 0) toast('err', `Nothing changed — the selected Sims were already updated elsewhere.`)
      else toast('ok', res.skipped.length ? `${msg} ${plural(res.skipped.length)} skipped (status changed).` : msg)
      if (done) opts.onChange?.(sims, { action, applied: res.applied })
    } catch (e: any) {
      busy = null
      render()
      toast('err', e?.message || `Couldn't ${action} — please try again.`)
    }
  }

  // ── wiring ──────────────────────────────────────────────────────────────────
  function close() {
    if (closed) return
    closed = true
    if (toastTimer) clearTimeout(toastTimer)
    document.removeEventListener('keydown', onKey, true)
    safeRemove(host)
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
  document.addEventListener('keydown', onKey, true)
  xBtn.addEventListener('click', close)
  cancelBtn.addEventListener('click', close)
  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) close() })
  searchInput.addEventListener('input', () => { query = searchInput.value; render() })
  deployBtn.addEventListener('click', () => void run('deploy', bulkActionsFor(sims, selected).deploy))
  deactivateBtn.addEventListener('click', () => void run('deactivate', bulkActionsFor(sims, selected).deactivate))

  render()
  void load()
  setTimeout(() => { try { searchInput.focus() } catch { /* ignore */ } }, 0)
  return { close, host }
}

function initialsOf(s: ManagedSim): string {
  if (s.initials) return s.initials.slice(0, 2).toUpperCase()
  const parts = s.name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase() || 'S'
}

/** Build the SelectSimsApi against the Klavity backend's /api/widget/sim-deployments endpoint. */
export function createSelectSimsApi(o: {
  backendUrl: string
  projectId: string
  getToken: () => string
  fetch?: (input: string, init?: RequestInit) => Promise<Response>
}): SelectSimsApi {
  const f = o.fetch || ((input: string, init?: RequestInit) => fetch(input, init))
  const endpoint = o.backendUrl + '/api/widget/sim-deployments'
  const headers = (json: boolean) => {
    const h: Record<string, string> = {}
    if (json) h['content-type'] = 'application/json'
    const t = o.getToken()
    if (t) h.authorization = `Bearer ${t}`
    return h
  }
  const parse = async (r: Response) => {
    const d: any = await r.json().catch(() => ({}))
    if (!r.ok || d?.ok === false) {
      if (r.status === 401) throw new Error('Sign in to Klavity to manage Sims.')
      // An older Klavity server without this endpoint answers 404 (or a login redirect).
      if (r.status === 404 || r.redirected || !d || typeof d !== 'object' || (!('ok' in d) && !('sims' in d))) {
        throw new Error('Select Sims isn’t available on this Klavity server yet. Update or restart the server and try again.')
      }
      throw new Error(d?.error || `Request failed (${r.status}).`)
    }
    return d
  }
  return {
    async load() {
      const r = await f(endpoint + '?project=' + encodeURIComponent(o.projectId), { headers: headers(false), credentials: 'include' })
      const d = await parse(r)
      return Array.isArray(d.sims) ? d.sims : []
    },
    async act(action, simIds) {
      const r = await f(endpoint, {
        method: 'POST', headers: headers(true), credentials: 'include',
        body: JSON.stringify({ project: o.projectId, action, simIds }),
      })
      const d = await parse(r)
      return {
        applied: Array.isArray(d.applied) ? d.applied : [],
        skipped: Array.isArray(d.skipped) ? d.skipped : [],
        sims: Array.isArray(d.sims) ? d.sims : [],
      }
    },
  }
}
