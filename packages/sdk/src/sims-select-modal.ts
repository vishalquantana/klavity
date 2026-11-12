/**
 * sims-select-modal.ts — the "Select Sims" modal (right-click menu → "Select Sims…").
 *
 * The Sim model, end to end (see prototype/lib/sim-run-state.ts):
 *   * Sims tab → Activate / Deactivate (project-wide). New Sims start Deactivated. Only there.
 *   * Run / Stop (per user) — whether an Activated Sim reviews the pages THIS user browses. Set here, on the Sims tab card,
 *     with "Run all Sims", or by the Sims feedback card's Close (stops all).
 *
 * This modal lists every Sim with its status and ONE control: Run (stopped) or Stop (running). Deactivated Sims are listed greyed
 * out with a pointer to the Sims tab. The footer has Run all / Stop all. Changes are reported through `onChange` so the page can
 * start / stop the Sims on the feedback card right away.
 */

import { icon } from '../../core/src/icons'
import { safeRemove } from '../../core/src/safe-remove'

export type ManagedSimRun = 'running' | 'stopped'
export type ManagedSimAction = 'run' | 'stop' | 'stop_all'

export interface ManagedSim {
  id: string
  name: string
  role?: string
  initials?: string | null
  accent?: string | null
  avatar?: string | null
  /** false = Deactivated on the dashboard Sims tab: shown greyed out, can't be run. Absent (older server) = active. */
  active?: boolean
  /** This user's Run state. Absent / anything else = stopped. */
  run?: ManagedSimRun
}

export interface ManagedSimActionResult {
  applied: string[]
  skipped: Array<{ simId: string; reason: string }>
  sims: ManagedSim[]
}

export interface SelectSimsApi {
  load(): Promise<ManagedSim[]>
  act(action: ManagedSimAction, simIds?: string[]): Promise<ManagedSimActionResult>
}

export interface SelectSimsModalOptions {
  api: SelectSimsApi
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

/** Deactivated on the Sims tab — it can only be re-activated there, never from this modal. */
export const isSimInactive = (s: ManagedSim) => s.active === false
/** Running for this user (and Activated — a Deactivated Sim never runs). */
export const isSimRunning = (s: ManagedSim) => !isSimInactive(s) && s.run === 'running'

/** Signature of the running set ("" when nothing runs) — lets a sync skip no-op re-applies. */
export function managedSigOf(sims: ManagedSim[]): string {
  return sims.filter(isSimRunning).map((s) => s.id).sort().join(',')
}

/**
 * What a page should do when the server state may have changed outside it (dashboard Sims tab, another tab, a reload).
 * `prevSig` is null before the first sync. `fresh` = Sims that just started running and should review the page now — empty on
 * the first sync (a reload restores the running Sims without an extra AI review).
 */
export function planManagedSync(prevSig: string | null, sims: ManagedSim[]):
  { kind: 'skip'; sig: string } | { kind: 'apply'; sig: string; fresh: string[] } {
  const sig = managedSigOf(sims)
  if (sig === prevSig) return { kind: 'skip', sig }
  // First sync with nothing running → nothing to show (no card), nothing to tear down.
  if (prevSig === null && !sig) return { kind: 'skip', sig }
  const was = new Set((prevSig || '').split(',').filter(Boolean))
  const fresh = prevSig === null ? [] : sims.filter(isSimRunning).map((s) => s.id).filter((id) => !was.has(id))
  return { kind: 'apply', sig, fresh }
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
.kss-list{display:flex;flex-direction:column;gap:8px}
.kss-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid rgba(25,20,15,.1);border-radius:14px;background:#fff;transition:background .14s,border-color .14s}
.kss-row.is-running{border-color:rgba(16,185,129,.35);background:rgba(16,185,129,.04)}
.kss-row.pick{cursor:pointer}
.kss-row.pick:hover{background:#faf9ff}
.kss-row.on{border-color:rgba(99,102,241,.45);background:rgba(99,102,241,.05)}
.kss-row:focus-visible,.kss-all:focus-visible{outline:2px solid #8b8bf5;outline-offset:2px}
.kss-chk{width:20px;height:20px;flex:none;display:grid;place-items:center;border-radius:6px;border:1.5px solid rgba(99,102,241,.4);background:#fff;color:#fff;transition:background .14s,border-color .14s}
.kss-chk.on,.kss-chk.mixed{background:#6366f1;border-color:#6366f1}
.kss-row.off .kss-chk{visibility:hidden}
.kss-all{display:flex;align-items:center;gap:12px;padding:6px 14px 12px;margin-bottom:8px;border-bottom:1px solid rgba(25,20,15,.09);cursor:pointer;border-radius:10px}
.kss-all-t{font-size:14px;font-weight:600}
.kss-all-d{font-size:12px;color:#574f45;margin-top:2px}
.kss-av{width:48px;height:48px;flex:none;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;color:#fff;background:#6366f1;overflow:hidden}
.kss-av img{width:100%;height:100%;object-fit:cover}
.kss-meta{flex:1;min-width:0}
.kss-name{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kss-role{font-size:13px;color:#574f45;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kss-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.kss-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;line-height:1;padding:4px 8px;border-radius:999px;background:#efeae0;color:#574f45}
.kss-badge::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.8}
.kss-badge.running{background:rgba(16,185,129,.12);color:#047857}
.kss-badge.deactivated{background:rgba(239,68,68,.1);color:#b91c1c}
.kss-row.off{background:#f7f5f1;border-color:rgba(25,20,15,.1)}
.kss-row.off .kss-av{filter:grayscale(1);opacity:.55}
.kss-row.off .kss-name,.kss-row.off .kss-role{color:#8a8178}
.kss-hint{font-size:12px;color:#8a8178;margin-top:6px}
.kss-exec{flex:none;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:10px;border:1px solid rgba(16,185,129,.45);background:#fff;font:inherit;font-size:13px;font-weight:700;color:#047857;cursor:pointer}
.kss-exec:hover:not(:disabled){background:rgba(16,185,129,.06)}
.kss-exec.is-stop{border-color:rgba(185,28,28,.35);color:#b91c1c}
.kss-exec.is-stop:hover:not(:disabled){background:rgba(239,68,68,.06)}
.kss-exec:disabled{opacity:.5;cursor:default}
.kss-empty,.kss-state{padding:28px 12px;text-align:center;font-size:14px;color:#574f45}
.kss-state .kss-retry{margin-top:12px}
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
  let query = ''
  // Multi-select: the ticked Activated Sims. Run / Stop selected act only on the ticked Sims each action applies to.
  const selected = new Set<string>()
  // One action at a time: guards every button against duplicate / overlapping submissions.
  let busy: null | { action: 'run' | 'stop' | 'run_all' | 'stop_all' | 'run_sel' | 'stop_sel'; simId?: string } = null
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
  const sub = el('p', 'kss-sub', 'Run the Sims that should review the pages you browse. Stop a Sim to end its reviews — its reported issues stay.')
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

  const foot = el('div', 'kss-foot')
  const count = el('div', 'kss-count')
  count.setAttribute('aria-live', 'polite')
  const doneBtn = el('button', 'kss-btn kss-ghost', 'Done')
  doneBtn.type = 'button'
  const stopAllBtn = el('button', 'kss-btn kss-danger')
  stopAllBtn.type = 'button'
  stopAllBtn.dataset.action = 'stop_all'
  const runAllBtn = el('button', 'kss-btn kss-primary')
  runAllBtn.type = 'button'
  runAllBtn.dataset.action = 'run_all'
  // Shown instead of Run all / Stop all while Sims are ticked.
  const stopSelBtn = el('button', 'kss-btn kss-danger')
  stopSelBtn.type = 'button'
  stopSelBtn.dataset.action = 'stop_selected'
  const runSelBtn = el('button', 'kss-btn kss-primary')
  runSelBtn.type = 'button'
  runSelBtn.dataset.action = 'run_selected'
  foot.append(count, doneBtn, stopAllBtn, runAllBtn, stopSelBtn, runSelBtn)

  modal.append(head, searchWrap, body, foot)

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
  const plural = (n: number) => `${n} Sim${n === 1 ? '' : 's'}`
  const activeSims = () => sims.filter((s) => !isSimInactive(s))

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
    if (!sims.length) { body.appendChild(el('div', 'kss-empty', 'No Sims in this project yet. Create one on the Sims tab.')); return }
    const shown = visible()
    if (!shown.length) { body.appendChild(el('div', 'kss-empty', `No Sims match "${query.trim()}".`)); return }
    // Select all — ticks every Activated Sim matching the search (Deactivated ones can't be ticked).
    const pickable = shown.filter((s) => !isSimInactive(s))
    if (pickable.length) {
      const nOn = pickable.filter((s) => selected.has(s.id)).length
      const allOn = nOn === pickable.length
      const all = el('div', 'kss-all')
      all.setAttribute('role', 'checkbox')
      all.setAttribute('aria-checked', allOn ? 'true' : nOn ? 'mixed' : 'false')
      all.tabIndex = 0
      const chk = el('span', 'kss-chk' + (allOn ? ' on' : nOn ? ' mixed' : ''))
      chk.innerHTML = allOn ? icon('check', { size: 13 }) : nOn ? '<span style="width:9px;height:2px;background:#fff;border-radius:2px"></span>' : ''
      const txt = el('div')
      txt.append(el('div', 'kss-all-t', query ? 'Select all matching Sims' : 'Select all Sims'),
        el('div', 'kss-all-d', `${plural(pickable.length)} you can run or stop${query ? ' match your search' : ''}.`))
      all.append(chk, txt)
      const toggleAll = () => {
        if (busy) return
        if (allOn) pickable.forEach((s) => selected.delete(s.id)); else pickable.forEach((s) => selected.add(s.id))
        render()
      }
      all.addEventListener('click', toggleAll)
      all.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAll() } })
      body.appendChild(all)
    }
    const list = el('div', 'kss-list')
    // Activated Sims first (running before stopped), Deactivated ones last.
    const rank = (s: ManagedSim) => isSimInactive(s) ? 2 : isSimRunning(s) ? 0 : 1
    for (const s of [...shown].sort((a, b) => rank(a) - rank(b))) list.appendChild(renderRow(s))
    body.appendChild(list)
  }

  function avatarOf(s: ManagedSim): HTMLElement {
    const av = el('span', 'kss-av')
    av.style.background = s.accent || '#6366f1'
    if (s.avatar && /^(https?:|data:image\/)/.test(s.avatar)) {
      const img = el('img')
      img.alt = ''
      img.src = s.avatar
      img.addEventListener('error', () => { av.textContent = initialsOf(s) })
      av.appendChild(img)
    } else av.textContent = initialsOf(s)
    return av
  }

  function renderRow(s: ManagedSim): HTMLElement {
    if (isSimInactive(s)) return renderInactiveRow(s)
    const running = isSimRunning(s)
    const on = selected.has(s.id)
    const row = el('div', 'kss-row pick' + (running ? ' is-running' : '') + (on ? ' on' : ''))
    row.dataset.simId = s.id
    row.setAttribute('role', 'checkbox')
    row.setAttribute('aria-checked', String(on))
    row.tabIndex = 0
    const chk = el('span', 'kss-chk' + (on ? ' on' : ''))
    chk.innerHTML = on ? icon('check', { size: 13 }) : ''
    const toggle = () => { if (busy) return; on ? selected.delete(s.id) : selected.add(s.id); render() }
    row.addEventListener('click', toggle)
    row.addEventListener('keydown', (e) => { if (e.target === row && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); toggle() } })
    const meta = el('div', 'kss-meta')
    meta.appendChild(el('div', 'kss-name', s.name))
    if (s.role) meta.appendChild(el('div', 'kss-role', s.role))
    const badges = el('div', 'kss-badges')
    // KD-2869: an Activated Sim that isn't running reads "Not running" — "Stopped" wrongly suggested a Sim that was never started had been halted.
    const st = el('span', 'kss-badge' + (running ? ' running' : ''), running ? 'Running' : 'Not running')
    st.dataset.kind = 'run'
    badges.appendChild(st)
    meta.appendChild(badges)
    // The ONE control per Sim: Run (stopped) or Stop (running).
    const action: 'run' | 'stop' = running ? 'stop' : 'run'
    const b = el('button', 'kss-exec' + (running ? ' is-stop' : ''))
    b.type = 'button'
    b.dataset.action = action
    const mine = busy?.simId === s.id
    b.disabled = !!busy
    b.setAttribute('aria-label', `${running ? 'Stop' : 'Run'} ${s.name}`)
    b.innerHTML = (mine ? spinner(13) : icon(running ? 'square' : 'play', { size: 13 })) +
      `<span>${running ? (mine ? 'Stopping…' : 'Stop') : (mine ? 'Starting…' : 'Run')}</span>`
    // The row toggles the checkbox; the Run / Stop button acts on just this Sim.
    b.addEventListener('click', (e) => { e.stopPropagation(); void act(action, [s.id], s.id) })
    b.addEventListener('keydown', (e) => e.stopPropagation())
    row.append(chk, avatarOf(s), meta, b)
    return row
  }

  // Deactivated on the Sims tab: visible so the user knows it exists, but it can't be run here.
  function renderInactiveRow(s: ManagedSim): HTMLElement {
    const row = el('div', 'kss-row off')
    row.dataset.simId = s.id
    row.dataset.inactive = 'true'
    row.setAttribute('aria-disabled', 'true')
    const meta = el('div', 'kss-meta')
    meta.appendChild(el('div', 'kss-name', s.name))
    if (s.role) meta.appendChild(el('div', 'kss-role', s.role))
    const badges = el('div', 'kss-badges')
    const b = el('span', 'kss-badge deactivated', 'Deactivated')
    b.dataset.kind = 'active'
    badges.appendChild(b)
    meta.appendChild(badges)
    meta.appendChild(el('div', 'kss-hint', 'Activate this Sim on the Sims tab to run it.'))
    const spacer = el('span', 'kss-chk')   // keeps the rows aligned; hidden (a Deactivated Sim can't be ticked)
    spacer.setAttribute('aria-hidden', 'true')
    row.append(spacer, avatarOf(s), meta)
    return row
  }

  // Ticked Activated Sims, split by what each action applies to.
  function selection() {
    const sel = activeSims().filter((s) => selected.has(s.id))
    return { sel, toRun: sel.filter((s) => !isSimRunning(s)).map((s) => s.id), toStop: sel.filter(isSimRunning).map((s) => s.id) }
  }

  function renderFoot() {
    const act = activeSims()
    const nRun = act.filter(isSimRunning).length
    const ready = loadState === 'ready'
    const { sel, toRun, toStop } = selection()
    const picking = ready && sel.length > 0
    // With Sims ticked: "N selected" + Run N / Stop N (each only on the ticked Sims it applies to). Otherwise Run all / Stop all.
    runSelBtn.hidden = !picking
    runSelBtn.disabled = !!busy || !toRun.length
    runSelBtn.innerHTML = busy?.action === 'run_sel' ? spinner() + ' Starting…' : `${icon('play', { size: 15 })} Run ${toRun.length || ''}`.trimEnd()
    stopSelBtn.hidden = !picking
    stopSelBtn.disabled = !!busy || !toStop.length
    stopSelBtn.innerHTML = busy?.action === 'stop_sel' ? spinner() + ' Stopping…' : `${icon('square', { size: 14 })} Stop ${toStop.length || ''}`.trimEnd()
    if (picking) {
      count.innerHTML = `<b>${sel.length}</b> selected`
      runAllBtn.hidden = true
      stopAllBtn.hidden = true
      return
    }
    count.innerHTML = act.length ? `<b>${nRun}</b> of ${plural(act.length)} running` : 'No activated Sims'
    runAllBtn.hidden = !ready || nRun === act.length
    runAllBtn.disabled = !!busy || !act.length
    runAllBtn.innerHTML = busy?.action === 'run_all' ? spinner() + ' Starting…' : `${icon('play', { size: 15 })} Run all`
    stopAllBtn.hidden = !ready || nRun === 0
    stopAllBtn.disabled = !!busy
    stopAllBtn.innerHTML = busy?.action === 'stop_all' ? spinner() + ' Stopping…' : `${icon('square', { size: 14 })} Stop all`
  }

  function render() {
    if (closed) return
    // Preserve scroll position across re-renders so a click deep in a long list doesn't jump.
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
      // Drop ticks for Sims that no longer exist or were Deactivated meanwhile.
      const pickable = new Set(sims.filter((s) => !isSimInactive(s)).map((s) => s.id))
      for (const id of [...selected]) if (!pickable.has(id)) selected.delete(id)
      loadState = 'ready'
    } catch (e: any) {
      loadState = 'error'
      loadError = e?.message || "Couldn't load Sims."
    }
    render()
  }

  // INSTANT Run / Stop: the modal shows the result straight away (optimistic) and the server call runs in the background. Calls are
  // sent one after another (a queue), so quick successive clicks never race; the server's answer replaces the prediction once the
  // last queued call is done, and a failure reloads the real state with an error toast. The page itself (feedback card, reviews)
  // is updated from the SERVER's answer via onChange, never from the prediction.
  let queue: Promise<void> = Promise.resolve()
  let pending = 0
  function predict(action: ManagedSimAction, ids: string[]): ManagedSim[] {
    const set = new Set(ids)
    return sims.map((s) => {
      if (isSimInactive(s)) return s
      if (action === 'stop_all' || (action === 'stop' && set.has(s.id))) return { ...s, run: 'stopped' as const }
      if (action === 'run' && set.has(s.id)) return { ...s, run: 'running' as const }
      return s
    })
  }
  async function act(kind: 'run' | 'stop' | 'run_all' | 'stop_all' | 'run_sel' | 'stop_sel', simIds: string[], simId?: string) {
    void simId
    if (closed) return
    const action: ManagedSimAction = kind === 'run_all' || kind === 'run_sel' ? 'run' : kind === 'stop_sel' ? 'stop' : kind
    if (action !== 'stop_all' && !simIds.length) return
    const before = sims
    sims = predict(action, simIds)
    const changed = sims.filter((s, i) => s.run !== before[i]?.run).length
    // A multi-select action consumes the selection it applied to.
    if (kind === 'run_sel' || kind === 'stop_sel') for (const id of simIds) selected.delete(id)
    render()
    const name = (id: string) => sims.find((s) => s.id === id)?.name || 'Sim'
    toast('ok',
      kind === 'run' ? `${name(simIds[0])} is running.` :
      kind === 'stop' ? `${name(simIds[0])} is stopped. Its reported issues stay in Sim Reports.` :
      kind === 'run_all' || kind === 'run_sel' ? `${plural(changed)} running.` : `Stopped ${plural(changed)}. Their reported issues stay in Sim Reports.`)
    pending++
    queue = queue.then(async () => {
      try {
        const res = await opts.api.act(action, action === 'stop_all' ? undefined : simIds)
        pending--
        if (!pending && !closed) { sims = res.sims; render() }
        if (res.applied.length) opts.onChange?.(res.sims, { action, applied: res.applied })
        else if (res.skipped.length) toast('err', `Not started: ${res.skipped[0].reason}`)
      } catch (e: any) {
        pending--
        toast('err', e?.message || 'Couldn’t update the Sims — please try again.')
        // Put back the real state.
        try { if (!closed) { sims = await opts.api.load(); render() } } catch { if (!closed) { sims = before; render() } }
      }
    })
    await queue
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
  doneBtn.addEventListener('click', close)
  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) close() })
  searchInput.addEventListener('input', () => { query = searchInput.value; render() })
  runAllBtn.addEventListener('click', () => void act('run_all', activeSims().filter((s) => !isSimRunning(s)).map((s) => s.id)))
  stopAllBtn.addEventListener('click', () => void act('stop_all', []))
  runSelBtn.addEventListener('click', () => void act('run_sel', selection().toRun))
  stopSelBtn.addEventListener('click', () => void act('stop_sel', selection().toStop))

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
