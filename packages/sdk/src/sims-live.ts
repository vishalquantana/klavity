/**
 * Klavity Sims Live — floating, chat-style feedback panel.
 *
 * "Customers in the room while you build."
 *
 * SURFACE: a single bottom-right launcher pill (stacked persona avatars +
 * "N findings from your Sims" + a "M high" badge) expands into a floating,
 * chat-style card that OVERLAYS the page (never reflows/pushes it). Every Sim
 * finding lives in this panel as a clickable row.
 *
 * Each row: persona avatar+name (accent colour), full finding text (clamp with a
 * "Show more" expand — text is never cut off; the panel scrolls internally),
 * priority pill (HIGH/MED/LOW), sentiment, and per-row actions:
 *   • Track as Bug  → SimsLive.onTriage(obs, simName), mark handled, remove row
 *   • Jump to on page → scroll to the resolved element + a TRANSIENT pulsing halo
 *   • Dismiss       → mark handled, remove row
 *
 * Header: count ("N findings from M Sims · K high"), filter chips (by persona /
 * by priority), and a collapse control. Empty / reviewing state: a friendly
 * "Your Sims are reviewing this page…" shimmer.
 *
 * Retired (was: scattered always-on markers/pins + a looping "walk me through"
 * tour). The on-page halo now only appears TRANSIENTLY when the user clicks
 * "Jump to on page" on a row.
 *
 * Public API on window.KlavitySims (unchanged contract):
 *   deploy(simIds, sims?, opts?)  — mount the launcher/panel
 *   setReviewing(bool)            — reviewing shimmer in launcher + panel
 *   setRunStatus(status)          — KD-1465: run status line (analysing → running → completed / failed)
 *   renderFeedback(id, name, obs) — add each new (non-duplicate) finding as a row
 *   undeploy()                    — full teardown
 *   onTriage                      — settable hook: (obs, simName) => void
 *
 * Dev split:
 *   THIS FILE  — presence UI (launcher + panel), transient jump-to halo, API
 *   sims-watch — DOM/scroll watch engine: calls setReviewing() + renderFeedback()
 *   Dev 3      — /api/sim/review backend; each review item includes observations[]
 */

import { createSim, injectSimStyles, type SimProps } from '../../core/src/sim'
import { icon } from '../../core/src/icons'
import { safeRemove } from '../../core/src/safe-remove'

// ── Public types ──────────────────────────────────────────────────────────────

/** Normalized (0–1) bounding box on the analysed viewport. */
export interface ObservationRegion {
  x: number   // left edge as fraction of viewport width
  y: number   // top  edge as fraction of viewport height
  w: number   // box width  as fraction of viewport width
  h: number   // box height as fraction of viewport height
}

/** Viewport state at the moment the screenshot was captured. */
export interface ObservationViewport {
  scrollX: number
  scrollY: number
  width: number
  height: number
}

export interface LiveSimDescriptor {
  id: string
  name: string
  initials?: string
  accent?: string
  photoUrl?: string
}

export interface LiveObservation {
  text: string
  sentiment?: string | null
  priority?: string | null
  suggestedBug?: { title?: string } | null
  /** Present when the server identified a specific page element for this observation. */
  region?: ObservationRegion | null
  /** Captured client viewport so delayed reviews can re-anchor after scrolling. */
  targetViewport?: ObservationViewport | null
}

export interface DeployOpts {
  /**
   * On-page annotations were historically critical-only. The panel now shows
   * every concern-level finding as a row; positives/neutral still persist to
   * Triage but do not surface in the panel. Retained for API compatibility.
   */
  mode?: 'critical' | 'all'
}

/** KD-1465: phase of a Sim run — screenshot capture, AI review, done, or errored. */
export type SimRunStatus = 'analysing' | 'running' | 'completed' | 'failed'

export interface KlavitySimsAPI {
  deploy(simIds: string[] | 'all', sims?: LiveSimDescriptor[], opts?: DeployOpts): void
  setReviewing(reviewing: boolean): void
  /** KD-1465: show where the current Sim run is (null clears the status line). */
  setRunStatus(status: SimRunStatus | null): void
  /** KD-1456: where ONE Sim's review is — drives its chip spinner and its "1/3" status line. */
  setSimStatus(simId: string, status: SimRunStatus | null): void
  /** KD-1456: mark a Sim paused / resumed (it stays on the page but stops reviewing). */
  setSimPaused(simId: string, paused: boolean): void
  renderFeedback(simId: string, simName: string, observations: LiveObservation[]): void
  undeploy(): void
  /** Set this to receive "Track as Bug" clicks from finding rows. */
  onTriage: ((observation: LiveObservation, simName: string) => void) | null
  /**
   * KD-1456: set this to show a Pause / Resume button for the selected Sim. Called with the Sim and
   * `pause` (true = pause it); resolve true when it worked — the panel then flips the Sim's paused state.
   */
  onPauseToggle: ((simId: string, pause: boolean) => Promise<boolean> | boolean) | null
}

// ── Internal state ────────────────────────────────────────────────────────────

const HOST_ID         = 'klav-sims-live'
const OVERLAY_HOST_ID = 'klav-sims-overlay'
const EXT_STYLE_ID    = 'klav-sims-ext-css'

let hostEl: HTMLElement | null = null
let shadowRoot: ShadowRoot | null = null
let overlayEl: HTMLElement | null = null     // full-page overlay for the transient jump-to halo
let deployAbort: AbortController | null = null

/** A Sim registered in this deploy — powers the launcher avatars + row accents. */
interface SimEntry {
  simId: string
  accent: string
  initials: string
  name: string
  photoUrl?: string
}
const simEntries = new Map<string, SimEntry>()

/** A finding shown as a panel row. */
interface Finding {
  id: string
  entry: SimEntry
  obs: LiveObservation
  rowEl: HTMLElement | null
}
const findings = new Map<string, Finding>()
let findingSeq = 0

/** Panel expanded state + active filters. */
let panelOpen = false
let personaFilter: string | null = null       // simId or null
let sevFilter: 'HIGH' | 'MED' | 'LOW' | null = null
let reviewing = false
/** KD-1465: current run phase, and findingSeq when the run started (to count its new findings). */
let runStatus: SimRunStatus | null = null
let runStartSeq = 0
let activeRuns = 0
/** KD-1456: per-Sim review phase + paused Sims (reviews are now one request per Sim). */
const simPhase = new Map<string, SimRunStatus>()
const pausedSims = new Set<string>()
let pauseBusy = false

// Cached panel DOM refs (inside the shadow root).
let launcherEl: HTMLButtonElement | null = null
let launcherAvatarsEl: HTMLElement | null = null
let launcherTxtEl: HTMLElement | null = null
let launcherBadgeEl: HTMLElement | null = null
let panelEl: HTMLElement | null = null
let panelCountEl: HTMLElement | null = null
let panelStatusEl: HTMLElement | null = null
let panelSimHeadEl: HTMLElement | null = null
let panelFiltersEl: HTMLElement | null = null
let panelListEl: HTMLElement | null = null
let announcerEl: HTMLElement | null = null

/** The one active transient jump-to halo (cleaned up on next jump / undeploy). */
let jumpHaloCleanup: (() => void) | null = null

/**
 * Observation-text dedup guard (fixes the live-Sims loop pile-up).
 *
 * A constantly-mutating page (streaming chat, a live sidebar) makes the watch
 * engine re-review the same viewport, and the server returns the SAME findings
 * each time. Without a guard, renderFeedback() keeps ADDING rows for identical
 * observations. We key each already-shown finding by
 * `simId::<normalized-text>` (trimmed / lowercased / whitespace-collapsed) and
 * skip repeats. Cleared in undeploy() so a fresh deploy starts clean.
 */
const seenObservationKeys = new Set<string>()

/** Normalize observation text for dedup: trim, lowercase, collapse whitespace. */
function normalizeObservationText(text: string): string {
  return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Stable dedup key for an observation within a Sim. */
function observationKey(simId: string, obs: LiveObservation): string {
  return `${simId}::${normalizeObservationText(obs.text)}`
}

function emitLiveDock(active: boolean): void {
  try {
    document.dispatchEvent(new CustomEvent('klavity:sims-live', { detail: { active } }))
  } catch { /* non-fatal: layout hints are best-effort */ }
}

// ── Panel CSS (shadow DOM) ─────────────────────────────────────────────────────

const PANEL_CSS = `
  :host { all: initial; font-family: system-ui, -apple-system, sans-serif; }

  .ksl-sr {
    position: absolute; width: 1px; height: 1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; pointer-events: none;
  }

  /* ── design tokens (mirror packages/core/demo/sims-feedback-panel.html) ── */
  .ksl-root {
    --surface:   #16110c;
    --surface-2: #1c1610;
    --surface-3: #221b13;
    --line:      #3a332b;
    --line-soft: #2a231b;
    --fg:   #f5f3ee;
    --fg-2: #cec6bd;
    --fg-3: #8a8276;
    --fg-4: #5e5852;
    --accent:   #8b5cf6;
    --accent-2: #a78bfa;
    --accent-3: #c4b5fd;
    --accent-glow: rgba(139,92,246,.28);
    --sev-h-bg: rgba(233,79,55,.22);  --sev-h-fg:#e8849a;
    --sev-m-bg: rgba(244,169,60,.20); --sev-m-fg:#e8a24a;
    --sev-l-bg: rgba(127,209,196,.15);--sev-l-fg:#7fd1c4;
    --mono: ui-monospace,'JetBrains Mono',monospace;
    --ease: cubic-bezier(.34,1.36,.64,1);
    pointer-events: none;   /* only interactive children capture events */
  }
  .ksl-root button { font-family: inherit; }

  /* ═══════════════ launcher pill ═══════════════ */
  .ksl-launcher {
    position: fixed; right: 20px; bottom: 20px;
    display: inline-flex; align-items: center; gap: 0;
    border: 0; cursor: pointer; background: transparent; padding: 0;
    pointer-events: auto;
  }
  .ksl-launcher[hidden] { display: none; }
  .ksl-pill {
    display: flex; align-items: center; gap: 10px;
    background: linear-gradient(168deg, var(--surface-2), var(--surface));
    border: 1px solid var(--accent-glow); border-radius: 999px;
    padding: 8px 16px 8px 10px;
    box-shadow: 0 18px 46px -14px rgba(0,0,0,.7), 0 0 0 4px rgba(139,92,246,.1);
    transition: transform .15s var(--ease), border-color .15s;
  }
  .ksl-launcher:hover .ksl-pill { transform: translateY(-2px); border-color: var(--accent-2); }
  .ksl-launcher:active .ksl-pill { transform: scale(.97); }
  .ksl-launcher:focus-visible { outline: none; }
  .ksl-launcher:focus-visible .ksl-pill { border-color: var(--accent-2); box-shadow: 0 18px 46px -14px rgba(0,0,0,.7), 0 0 0 3px var(--accent-2); }
  .ksl-pill-txt { font-size: 13px; font-weight: 600; color: var(--fg); white-space: nowrap; }
  .ksl-pill-txt b { color: var(--accent-3); }
  .ksl-pill-avatars { display: flex; }
  .ksl-pill-avatars .ksim { margin-left: -10px; }
  .ksl-pill-avatars .ksim:first-child { margin-left: 0; }
  .ksl-pill-badge {
    position: absolute; top: -4px; right: -4px;
    background: var(--sev-h-fg); color: #2a0e12;
    font: 700 10px/1 var(--mono); border-radius: 20px; padding: 3px 6px;
    box-shadow: 0 4px 10px rgba(0,0,0,.5);
  }
  .ksl-pill-badge[hidden] { display: none; }

  /* reviewing shimmer inside the launcher */
  .ksl-launcher.is-reviewing .ksl-pill { border-color: var(--accent-2); }
  .ksl-launcher.is-reviewing .ksl-pill-txt::after {
    content: ''; display: inline-block; width: 7px; height: 7px; margin-left: 7px;
    border-radius: 50%; background: var(--accent-2); vertical-align: middle;
    box-shadow: 0 0 0 0 rgba(167,139,250,.55);
    animation: ksl-pulse 1.4s ease-out infinite;
  }
  @keyframes ksl-pulse {
    0%   { box-shadow: 0 0 0 0 rgba(167,139,250,.55); opacity: 1; }
    70%  { box-shadow: 0 0 0 7px rgba(167,139,250,0); opacity: .85; }
    100% { box-shadow: 0 0 0 0 rgba(167,139,250,0); opacity: 1; }
  }

  /* ═══════════════ floating chat panel ═══════════════ */
  .ksl-panel {
    position: fixed; right: 20px; bottom: 20px; z-index: 1;
    width: 378px; max-width: calc(100vw - 32px);
    height: min(620px, calc(100vh - 96px));
    display: none; flex-direction: column; overflow: hidden;
    background: linear-gradient(168deg, var(--surface-2), var(--surface));
    border: 1px solid var(--line); border-radius: 18px;
    box-shadow: 0 30px 70px -20px rgba(0,0,0,.8), 0 0 0 4px rgba(139,92,246,.08);
    transform-origin: bottom right;
    color: var(--fg); pointer-events: auto;
  }
  .ksl-panel.is-open { display: flex; animation: ksl-panel-in .34s var(--ease) both; }
  @keyframes ksl-panel-in { 0% { transform: translateY(24px) scale(.9); opacity: 0; } 100% { transform: none; opacity: 1; } }

  .ksl-head { padding: 16px 16px 12px; border-bottom: 1px solid var(--line-soft); flex-shrink: 0; }
  .ksl-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 3px; }
  .ksl-title { font-size: 14.5px; font-weight: 700; }
  .ksl-count { font-size: 12.5px; color: var(--fg-3); }
  .ksl-count b { color: var(--accent-3); }
  .ksl-count .ksl-hi { color: var(--sev-h-fg); }
  /* KD-1465: Sim run status line */
  .ksl-status { display: flex; align-items: center; gap: 7px; margin-top: 6px; font-size: 12px; color: var(--fg-2); }
  .ksl-status[hidden] { display: none; }
  .ksl-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: var(--accent-2); }
  .ksl-status.is-analysing .ksl-status-dot,
  .ksl-status.is-running .ksl-status-dot { animation: ksl-pulse 1.4s ease-out infinite; }
  .ksl-status.is-completed .ksl-status-dot { background: var(--sev-l-fg); }
  .ksl-status.is-failed .ksl-status-dot { background: var(--sev-h-fg); }
  .ksl-icon-btn {
    margin-left: auto; width: 30px; height: 30px; border-radius: 8px;
    border: 1px solid var(--line); background: transparent; color: var(--fg-3);
    cursor: pointer; display: grid; place-items: center;
    transition: transform .15s var(--ease), background .15s, color .15s;
  }
  .ksl-icon-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,.06); color: var(--fg); }
  .ksl-icon-btn:active { transform: scale(.94); }
  .ksl-icon-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-icon-btn svg { width: 15px; height: 15px; }

  .ksl-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 11px; }
  .ksl-chips[hidden] { display: none; }
  .ksl-chip {
    font: 600 11px/1 system-ui,sans-serif; border-radius: 20px; padding: 6px 10px; cursor: pointer;
    border: 1px solid var(--line); background: var(--surface-2); color: var(--fg-3);
    display: inline-flex; align-items: center; gap: 5px;
    transition: transform .15s var(--ease), background .15s, border-color .15s, color .15s;
  }
  .ksl-chip:hover { transform: translateY(-1px); color: var(--fg); }
  .ksl-chip:active { transform: scale(.96); }
  .ksl-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-chip .ksl-dot { width: 8px; height: 8px; border-radius: 50%; }
  /* KD-1456: per-Sim chip spinner while that Sim's review is in progress; paused Sims are dimmed */
  .ksl-spin {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid var(--line); border-top-color: var(--accent-2);
    animation: ksl-spin .8s linear infinite;
  }
  @keyframes ksl-spin { to { transform: rotate(360deg); } }
  .ksl-chip.is-paused { opacity: .55; }
  /* KD-1456: selected Sim's header — avatar, name, status (1/3), Pause / Resume */
  .ksl-simhead { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--line-soft); flex-shrink: 0; }
  .ksl-simhead[hidden] { display: none; }
  .ksl-simhead-txt { flex: 1; min-width: 0; }
  .ksl-simhead-name { font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ksl-simhead-status { display: flex; align-items: center; gap: 6px; margin-top: 2px; font-size: 12px; color: var(--fg-3); }
  .ksl-pause {
    display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9px;
    background: transparent; border: 1px solid var(--line); color: var(--fg); font: inherit; font-size: 12.5px; cursor: pointer;
  }
  .ksl-pause:hover { border-color: var(--accent-2); }
  .ksl-pause:disabled { opacity: .5; cursor: default; }
  .ksl-pause:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-chip.is-on { background: rgba(139,92,246,.16); border-color: rgba(139,92,246,.5); color: var(--accent-3); }
  .ksl-chip.sev-on-h { background: var(--sev-h-bg); border-color: var(--sev-h-fg); color: var(--sev-h-fg); }
  .ksl-chip.sev-on-m { background: var(--sev-m-bg); border-color: var(--sev-m-fg); color: var(--sev-m-fg); }
  .ksl-chip.sev-on-l { background: var(--sev-l-bg); border-color: var(--sev-l-fg); color: var(--sev-l-fg); }
  .ksl-chips-label {
    font: 700 9.5px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase;
    color: var(--fg-4); align-self: center; margin-right: 2px;
  }

  .ksl-list { flex: 1; overflow-y: auto; padding: 12px 14px 22px; display: flex; flex-direction: column; gap: 10px; }
  .ksl-list::-webkit-scrollbar { width: 9px; }
  .ksl-list::-webkit-scrollbar-thumb { background: var(--line); border-radius: 6px; border: 2px solid var(--surface); }

  /* ── empty / reviewing state ── */
  .ksl-empty { color: var(--fg-4); font-size: 13px; text-align: center; padding: 40px 18px; line-height: 1.5; }
  .ksl-empty .ksl-empty-title { color: var(--fg-2); font-size: 14px; font-weight: 600; margin-bottom: 6px; }
  .ksl-shimmer {
    display: inline-block; margin-top: 12px; height: 8px; width: 70%; border-radius: 6px;
    background: linear-gradient(90deg, var(--surface-2) 0%, var(--surface-3) 40%, var(--accent-glow) 50%, var(--surface-3) 60%, var(--surface-2) 100%);
    background-size: 200% 100%; animation: ksl-shimmer 1.4s linear infinite;
  }
  @keyframes ksl-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── severity pill ── */
  .ksl-sev {
    display: inline-block; font: 700 9px/1 var(--mono); letter-spacing: .05em; text-transform: uppercase;
    padding: 3px 6px; border-radius: 5px; flex-shrink: 0;
  }
  .ksl-sev.h { background: var(--sev-h-bg); color: var(--sev-h-fg); }
  .ksl-sev.m { background: var(--sev-m-bg); color: var(--sev-m-fg); }
  .ksl-sev.l { background: var(--sev-l-bg); color: var(--sev-l-fg); }

  /* ── finding row ── */
  .ksl-row {
    position: relative; border: 1px solid var(--line-soft); border-left-width: 3px;
    border-radius: 12px; background: var(--surface-2); padding: 12px 13px 11px;
    text-align: left; width: 100%; display: block;
    transition: transform .15s var(--ease), background .15s, box-shadow .15s;
  }
  .ksl-row:hover { transform: translateY(-2px) scale(1.012); background: var(--surface-3); box-shadow: 0 12px 30px -12px rgba(0,0,0,.7); }
  .ksl-row .ksl-r-head { display: flex; align-items: center; gap: 9px; margin-bottom: 8px; }
  .ksl-r-name { font: 700 9.5px/1 var(--mono); letter-spacing: .09em; text-transform: uppercase;
    color: var(--fg-2); flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .ksl-r-sent { font: 600 10px/1 system-ui,sans-serif; color: var(--fg-4); text-transform: capitalize; white-space: nowrap; }
  .ksl-r-obs { font-size: 13px; line-height: 1.5; color: var(--fg-2);
    display: -webkit-box; -webkit-line-clamp: 4; line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
  .ksl-row.is-expanded .ksl-r-obs { -webkit-line-clamp: unset; line-clamp: unset; overflow: visible; }
  .ksl-r-expand { font: 600 11px/1 system-ui,sans-serif; color: var(--accent-3); margin-top: 6px;
    background: none; border: 0; padding: 2px 0; cursor: pointer; display: none; }
  .ksl-row.is-clamped .ksl-r-expand { display: inline-block; }
  .ksl-r-expand:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-r-actions { display: flex; gap: 7px; margin-top: 11px; flex-wrap: wrap; }
  .ksl-r-act {
    font: 600 11px/1 system-ui,sans-serif; border-radius: 7px; padding: 6px 9px; cursor: pointer;
    display: inline-flex; align-items: center; gap: 5px;
    transition: transform .15s var(--ease), background .15s, border-color .15s, color .15s;
  }
  .ksl-r-act:hover { transform: translateY(-1px); }
  .ksl-r-act:active { transform: scale(.96); }
  .ksl-r-act:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-r-act svg { width: 12px; height: 12px; }
  .ksl-r-act.track { background: rgba(139,92,246,.18); border: 1px solid rgba(139,92,246,.38); color: var(--accent-3); }
  .ksl-r-act.track:hover { background: rgba(139,92,246,.32); border-color: rgba(139,92,246,.6); }
  .ksl-r-act.jump { background: transparent; border: 1px solid var(--line); color: var(--fg-2); }
  .ksl-r-act.jump:hover { background: rgba(255,255,255,.06); border-color: #5a5248; color: var(--fg); }
  .ksl-r-act.dismiss { background: transparent; border: 1px solid var(--line); color: var(--fg-4); margin-left: auto; }
  .ksl-r-act.dismiss:hover { background: rgba(255,255,255,.06); color: var(--fg-2); }
  .ksl-row.is-removing { opacity: 0; transform: translateX(18px) scale(.96); pointer-events: none;
    transition: opacity .28s ease, transform .28s var(--ease); }

  @media (max-width:480px) {
    .ksl-panel { right: 12px; bottom: 12px; width: calc(100vw - 24px); }
    .ksl-launcher { right: 12px; bottom: 12px; }
  }
  @media (prefers-reduced-motion:reduce) {
    .ksl-panel.is-open,.ksl-row,.ksl-shimmer,.ksl-launcher.is-reviewing .ksl-pill-txt::after,.ksl-status-dot,.ksl-spin { animation: none !important; }
    .ksl-panel, .ksl-row, .ksl-pill, .ksl-chip, .ksl-r-act, .ksl-icon-btn { transition: none !important; }
  }
`

// ── Overlay CSS (injected into <head> — the transient jump-to halo only) ───────

const EXT_CSS = `
  /* ── Halo box — TRANSIENT highlight drawn around a flagged element on "Jump to" ── */
  .klav-halo {
    position: fixed;
    pointer-events: none;
    border-radius: 8px;
    z-index: 2147483640;
    border-width: 2px;
    border-style: solid;
    animation: klav-halo-in .38s cubic-bezier(.34,1.36,.64,1) both,
               klav-halo-pulse 2.4s ease-in-out .4s infinite;
    transition: opacity .18s ease, transform .18s ease;
  }
  @keyframes klav-halo-in {
    from { transform: scale(.84); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  @keyframes klav-halo-pulse {
    0%,100% { opacity: .75; }
    50%     { opacity: 1; }
  }
  @media (prefers-reduced-motion:reduce) {
    .klav-halo { animation: none !important; opacity: 1; transform: none; }
  }
`

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const parse = (s: string) => parseInt(s, 16)
  const [r, g, b] = h.length === 3
    ? [parse(h[0] + h[0]), parse(h[1] + h[1]), parse(h[2] + h[2])]
    : [parse(h.slice(0, 2)), parse(h.slice(2, 4)), parse(h.slice(4, 6))]
  return `rgba(${r},${g},${b},${alpha})`
}

/** Concern = bug/priority OR non-positive sentiment; positives/neutral stay off the panel. */
function isConcernObservation(obs: LiveObservation): boolean {
  if (obs.suggestedBug) return true
  const priority = String(obs.priority ?? '').trim().toLowerCase()
  if (priority && priority !== 'none') return true
  const sentiment = String(obs.sentiment ?? '').trim().toLowerCase()
  if (!sentiment) return false
  const NON_ACTIONABLE = new Set(['positive', 'satisfied', 'delighted', 'neutral', 'none'])
  return !NON_ACTIONABLE.has(sentiment)
}

function prefersReducedMotion(): boolean {
  try { return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false }
  catch { return false }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Normalize a server priority string to a HIGH/MED/LOW bucket (or null). */
function severityBucket(obs: LiveObservation): 'HIGH' | 'MED' | 'LOW' | null {
  const p = String(obs.priority ?? '').trim().toLowerCase()
  if (p === 'high' || p === 'critical' || p === 'urgent') return 'HIGH'
  if (p === 'medium' || p === 'med') return 'MED'
  if (p === 'low') return 'LOW'
  if (obs.suggestedBug) return 'HIGH'
  return null
}

const SEV_CLASS: Record<'HIGH' | 'MED' | 'LOW', string> = { HIGH: 'h', MED: 'm', LOW: 'l' }
const SEV_ORDER: Record<'HIGH' | 'MED' | 'LOW', number> = { HIGH: 0, MED: 1, LOW: 2 }

function isOwnOverlayElement(el: Element | null): boolean {
  if (!el) return false
  if (el === overlayEl || el === hostEl) return true
  if (el.id === OVERLAY_HOST_ID || el.id === HOST_ID || el.id === 'klavity-widget-host') return true
  const classList = (el as HTMLElement).classList
  return !!classList && classList.contains('klav-halo')
}

function withOverlaysHidden<T>(fn: () => T): T {
  const hiddens: { el: HTMLElement; vis: string }[] = []
  for (const el of [overlayEl, hostEl]) {
    if (!el) continue
    hiddens.push({ el, vis: el.style.visibility })
    el.style.visibility = 'hidden'
  }
  try {
    return fn()
  } finally {
    for (const { el, vis } of hiddens) el.style.visibility = vis
  }
}

function viewportFor(obs: LiveObservation): ObservationViewport {
  const v = obs.targetViewport
  return {
    scrollX: Number.isFinite(v?.scrollX) ? Number(v!.scrollX) : window.scrollX,
    scrollY: Number.isFinite(v?.scrollY) ? Number(v!.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(v?.width) ? Number(v!.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(v?.height) ? Number(v!.height) : window.innerHeight),
  }
}

function targetRectFromRegion(region: ObservationRegion, viewport: ObservationViewport): DOMRect {
  return new DOMRect(
    viewport.scrollX + region.x * viewport.width,
    viewport.scrollY + region.y * viewport.height,
    Math.max(1, region.w * viewport.width),
    Math.max(1, region.h * viewport.height),
  )
}

function rectArea(rect: DOMRect): number {
  return Math.max(0, rect.width) * Math.max(0, rect.height)
}

function overlapArea(a: DOMRect, b: DOMRect): number {
  const left = Math.max(a.left, b.left)
  const right = Math.min(a.right, b.right)
  const top = Math.max(a.top, b.top)
  const bottom = Math.min(a.bottom, b.bottom)
  return Math.max(0, right - left) * Math.max(0, bottom - top)
}

function viewportToDocumentRect(rect: DOMRect): DOMRect {
  return new DOMRect(rect.left + window.scrollX, rect.top + window.scrollY, rect.width, rect.height)
}

function isUsableTarget(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false
  if (el === document.body || el === document.documentElement || isOwnOverlayElement(el)) return false
  const rect = el.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) return false
  try {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false
  } catch { /* ignore style lookup failures */ }
  return true
}

function elementCandidatesFromPoint(clientX: number, clientY: number): HTMLElement[] {
  return withOverlaysHidden(() => {
    const seen = new Set<Element>()
    const out: HTMLElement[] = []
    const add = (el: Element | null) => {
      let cur: Element | null = el
      while (cur && cur !== document.body && cur !== document.documentElement) {
        if (!seen.has(cur) && isUsableTarget(cur)) {
          seen.add(cur)
          out.push(cur)
        }
        cur = cur.parentElement
      }
    }

    const stack = typeof document.elementsFromPoint === 'function'
      ? document.elementsFromPoint(clientX, clientY)
      : [document.elementFromPoint(clientX, clientY)].filter(Boolean) as Element[]
    for (const el of stack) add(el)
    return out
  })
}

function bestElementForRegion(region: ObservationRegion, obs: LiveObservation): HTMLElement | null {
  const viewport = viewportFor(obs)
  const targetDocRect = targetRectFromRegion(region, viewport)
  const clientX = Math.max(2, Math.min(window.innerWidth - 2, targetDocRect.left + targetDocRect.width / 2 - window.scrollX))
  const clientY = Math.max(2, Math.min(window.innerHeight - 2, targetDocRect.top + targetDocRect.height / 2 - window.scrollY))
  const candidates = elementCandidatesFromPoint(clientX, clientY)
  if (!candidates.length) return null

  const targetArea = Math.max(1, rectArea(targetDocRect))
  let best: HTMLElement | null = null
  let bestScore = -Infinity
  for (const el of candidates) {
    const rect = viewportToDocumentRect(el.getBoundingClientRect())
    const overlap = overlapArea(rect, targetDocRect)
    if (overlap <= 0) continue
    const area = Math.max(1, rectArea(rect))
    const coverage = overlap / targetArea
    const waste = Math.max(0, (area - overlap) / area)
    const tag = el.tagName.toLowerCase()
    const semanticBonus = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(tag) ? 0.18 : 0
    const sizePenalty = area > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0
    const score = coverage - waste * 0.35 + semanticBonus - sizePenalty
    if (score > bestScore) {
      best = el
      bestScore = score
    }
  }
  return best ?? candidates[0] ?? null
}

async function scrollDocumentPointIntoView(pageX: number, pageY: number): Promise<void> {
  const margin = 80
  const inView =
    pageX >= window.scrollX + margin &&
    pageX <= window.scrollX + window.innerWidth - margin &&
    pageY >= window.scrollY + margin &&
    pageY <= window.scrollY + window.innerHeight - margin
  if (inView) return

  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const maxX = Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
  const top = Math.max(0, Math.min(maxY, pageY - window.innerHeight * 0.38))
  const left = Math.max(0, Math.min(maxX, pageX - window.innerWidth * 0.45))
  try {
    window.scrollTo({ top, left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  } catch {
    window.scrollTo(left, top)
  }
  await sleep(prefersReducedMotion() ? 80 : 520)
}

const STOP_WORDS = new Set([
  'about','after','again','also','because','being','button','clear','could','easy','element','feels','from','have','into','just','like','more','page','section','that','the','their','there','this','with','would','where','while','your',
])

function tokensFrom(text: string): string[] {
  const seen = new Set<string>()
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((word) => {
      if (word.length < 4 || STOP_WORDS.has(word) || seen.has(word)) return false
      seen.add(word)
      return true
    })
}

function inferTargetFromText(obs: LiveObservation): HTMLElement | null {
  const tokens = tokensFrom(obs.text)
  if (!tokens.length) return null
  const selector = [
    'button','a','input','textarea','select','label','h1','h2','h3','h4','p','li',
    'nav','header','footer','main','section','article','form','[role]','[aria-label]','[data-testid]','div',
  ].join(',')

  let best: HTMLElement | null = null
  let bestScore = 0
  const elements = Array.from(document.querySelectorAll(selector)).slice(0, 700)
  for (const el of elements) {
    if (!isUsableTarget(el)) continue
    const rect = el.getBoundingClientRect()
    const text = [
      el.textContent || '',
      el.getAttribute('aria-label') || '',
      el.getAttribute('title') || '',
      el.getAttribute('placeholder') || '',
      el.getAttribute('data-testid') || '',
      el.id || '',
      typeof el.className === 'string' ? el.className : '',
    ].join(' ').toLowerCase()
    if (!text.trim()) continue
    const hits = tokens.reduce((sum, token) => sum + (text.includes(token) ? 1 : 0), 0)
    if (!hits) continue
    const tag = el.tagName.toLowerCase()
    const semanticBonus = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(tag) ? 0.6 : 0
    const area = Math.max(1, rect.width * rect.height)
    const hugePenalty = area > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0
    const score = hits / tokens.length + semanticBonus - hugePenalty
    if (score > bestScore) {
      best = el
      bestScore = score
    }
  }
  return best
}

async function resolveObservationTarget(obs: LiveObservation, opts: { scroll?: boolean } = {}): Promise<HTMLElement | null> {
  if (obs.region) {
    const viewport = viewportFor(obs)
    const targetDocRect = targetRectFromRegion(obs.region, viewport)
    if (opts.scroll !== false) {
      await scrollDocumentPointIntoView(targetDocRect.left + targetDocRect.width / 2, targetDocRect.top + targetDocRect.height / 2)
    }
    const byRegion = bestElementForRegion(obs.region, obs)
    if (byRegion) return byRegion
  }
  return inferTargetFromText(obs)
}

// ── Shadow host + overlay ─────────────────────────────────────────────────────

function ensureHost(): ShadowRoot {
  if (hostEl && shadowRoot) return shadowRoot
  hostEl = document.createElement('div')
  hostEl.id = HOST_ID
  hostEl.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;'
  shadowRoot = hostEl.attachShadow({ mode: 'open' })
  injectSimStyles(shadowRoot)
  const style = document.createElement('style'); style.textContent = PANEL_CSS
  shadowRoot.appendChild(style)
  document.body.appendChild(hostEl)
  return shadowRoot
}

function ensureOverlay(): HTMLElement {
  if (overlayEl) return overlayEl

  if (!document.getElementById(EXT_STYLE_ID)) {
    const s = document.createElement('style')
    s.id = EXT_STYLE_ID; s.textContent = EXT_CSS
    document.head.appendChild(s)
  }

  overlayEl = document.createElement('div')
  overlayEl.id = OVERLAY_HOST_ID
  overlayEl.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;'
  document.body.appendChild(overlayEl)
  return overlayEl
}

// ── Sim avatar (uses shared createSim) ─────────────────────────────────────────

function avatarFor(entry: SimEntry, size: number): HTMLElement {
  return createSim({
    name: entry.name, initials: entry.initials, photoUrl: entry.photoUrl,
    color: entry.accent, animate: false, legs: true, size,
  } as SimProps)
}

// ── deploy() ─────────────────────────────────────────────────────────────────

function deploy(
  simIds: string[] | 'all',
  sims: LiveSimDescriptor[] = [],
  opts: DeployOpts = {},
): void {
  void opts
  if (typeof document === 'undefined') return
  undeploy()   // clean slate

  const shadow = ensureHost()
  ensureOverlay()
  deployAbort = new AbortController()

  const visible = simIds === 'all' ? sims : sims.filter(s => (simIds as string[]).includes(s.id))
  if (!visible.length) {
    console.warn('[KlavitySims] deploy(): no matching Sims — panel not mounted.')
    undeploy(); return
  }

  visible.slice(0, 8).forEach((sim) => {
    const accent = sim.accent || '#6366f1'
    const initials = sim.initials || sim.name.slice(0, 2).toUpperCase()
    simEntries.set(sim.id, { simId: sim.id, accent, initials, name: sim.name, photoUrl: sim.photoUrl })
  })

  // Root wrapper carries the design tokens.
  const root = document.createElement('div')
  root.className = 'ksl-root'
  shadow.appendChild(root)

  // Screen reader live region
  announcerEl = document.createElement('div')
  announcerEl.className = 'ksl-sr'; announcerEl.id = 'ksl-announcer'
  announcerEl.setAttribute('aria-live', 'polite'); announcerEl.setAttribute('aria-atomic', 'true')
  root.appendChild(announcerEl)

  // ── launcher pill ──
  launcherEl = document.createElement('button')
  launcherEl.type = 'button'
  launcherEl.className = 'ksl-launcher'
  launcherEl.setAttribute('aria-label', 'Open Sims feedback panel')
  launcherEl.addEventListener('click', () => openPanel())

  const pill = document.createElement('span'); pill.className = 'ksl-pill'
  launcherAvatarsEl = document.createElement('span'); launcherAvatarsEl.className = 'ksl-pill-avatars'
  launcherTxtEl = document.createElement('span'); launcherTxtEl.className = 'ksl-pill-txt'
  pill.append(launcherAvatarsEl, launcherTxtEl)
  launcherBadgeEl = document.createElement('span'); launcherBadgeEl.className = 'ksl-pill-badge'; launcherBadgeEl.hidden = true
  launcherEl.append(pill, launcherBadgeEl)
  root.appendChild(launcherEl)

  // launcher avatar stack (up to 3)
  visible.slice(0, 3).forEach((sim) => {
    const entry = simEntries.get(sim.id)
    if (entry) launcherAvatarsEl!.appendChild(avatarFor(entry, 26))
  })

  // ── panel ──
  panelEl = document.createElement('section')
  panelEl.className = 'ksl-panel'
  panelEl.setAttribute('aria-label', 'Sims feedback')
  panelEl.setAttribute('role', 'dialog')

  const head = document.createElement('div'); head.className = 'ksl-head'
  const titleRow = document.createElement('div'); titleRow.className = 'ksl-title-row'
  const title = document.createElement('div'); title.className = 'ksl-title'; title.textContent = 'Sims feedback'
  const collapseBtn = document.createElement('button')
  collapseBtn.type = 'button'; collapseBtn.className = 'ksl-icon-btn'
  collapseBtn.title = 'Minimize'; collapseBtn.setAttribute('aria-label', 'Minimize Sims feedback panel')
  collapseBtn.innerHTML = icon('x', { size: 15 })
  collapseBtn.addEventListener('click', () => closePanel())
  titleRow.append(title, collapseBtn)

  panelCountEl = document.createElement('div'); panelCountEl.className = 'ksl-count'
  panelStatusEl = document.createElement('div'); panelStatusEl.className = 'ksl-status'; panelStatusEl.hidden = true
  panelStatusEl.setAttribute('role', 'status')
  panelFiltersEl = document.createElement('div'); panelFiltersEl.className = 'ksl-chips'
  head.append(titleRow, panelCountEl, panelStatusEl, panelFiltersEl)

  panelSimHeadEl = document.createElement('div'); panelSimHeadEl.className = 'ksl-simhead'; panelSimHeadEl.hidden = true

  panelListEl = document.createElement('div'); panelListEl.className = 'ksl-list'
  panelListEl.setAttribute('role', 'list')

  panelEl.append(head, panelSimHeadEl, panelListEl)
  root.appendChild(panelEl)

  // Escape closes the panel (when open).
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelOpen) closePanel()
  }, { signal: deployAbort.signal })

  emitLiveDock(true)
  syncSurfaces()
}

// ── setReviewing() ────────────────────────────────────────────────────────────

function setReviewing(value: boolean): void {
  reviewing = value
  launcherEl?.classList.toggle('is-reviewing', value)
  syncSurfaces()
  if (panelOpen) renderList()
}

// ── setRunStatus() ────────────────────────────────────────────────────────────
// KD-1465: the panel showed nothing while a Sim run was in progress. Each run now reports its
// phase here, shown on a status line in the panel header (even when findings are already listed)
// and in the launcher pill while the run is in progress.

function runStatusText(): string {
  const sims = simEntries.size
  const who = sims === 1 ? 'Sim is' : 'Sims are'
  switch (runStatus) {
    case 'analysing': return `${sims === 1 ? 'Sim is' : `${sims} Sims are`} analysing this page…`
    case 'running': return `${who} running on this page…`
    case 'completed': {
      const n = findingSeq - runStartSeq
      return `Sim run completed · ${n ? `${n} new finding${n === 1 ? '' : 's'}` : 'no new findings'}`
    }
    case 'failed': return "Sim run didn't finish — it will retry on the next change."
    default: return ''
  }
}

function setRunStatus(status: SimRunStatus | null): void {
  // The boot review and the watch engine can overlap: only report the end once every run has ended.
  if (status === 'analysing') {
    if (activeRuns === 0) runStartSeq = findingSeq
    activeRuns++
  } else if (status === 'completed' || status === 'failed') {
    activeRuns = Math.max(0, activeRuns - 1)
    if (activeRuns > 0) status = 'running'
  } else if (status === null) {
    activeRuns = 0
  }
  runStatus = status
  const inProgress = status === 'analysing' || status === 'running'
  // Drive the existing reviewing shimmer too, so the empty-state copy matches the run.
  setReviewing(inProgress)
  if (announcerEl && status) announcerEl.textContent = runStatusText()
}

// ── Per-Sim status (KD-1456) ──────────────────────────────────────────────────
// Each Sim now reviews in its own request, so each finishes on its own. Its chip spins until it's done,
// and selecting it shows "Sim is analysing… 1/3" (→ running 2/3 → completed 3/3) with Pause / Resume.

const SIM_STEP: Record<SimRunStatus, string> = {
  analysing: 'Sim is analysing… 1/3',
  running: 'Sim is running… 2/3',
  completed: 'Sim run completed 3/3',
  failed: "Sim run didn't finish — it will retry on the next change",
}

function simInProgress(simId: string): boolean {
  const p = simPhase.get(simId)
  return !pausedSims.has(simId) && (p === 'analysing' || p === 'running')
}

function simStatusText(simId: string): string {
  if (pausedSims.has(simId)) return 'Paused — not reviewing this page'
  const p = simPhase.get(simId)
  return p ? SIM_STEP[p] : 'Watching this page'
}

function setSimStatus(simId: string, status: SimRunStatus | null): void {
  if (!simEntries.has(simId)) return
  if (status) simPhase.set(simId, status); else simPhase.delete(simId)
  refreshSimSurfaces()
}

function setSimPaused(simId: string, paused: boolean): void {
  if (!simEntries.has(simId)) return
  if (paused) { pausedSims.add(simId); simPhase.delete(simId) } else pausedSims.delete(simId)
  refreshSimSurfaces()
}

/** Re-draw only the chips + selected-Sim header (never the rows, so "Show more" state survives). */
function refreshSimSurfaces(): void {
  if (!panelOpen) return
  renderFilters()
  renderSimHead()
}

function renderSimHead(): void {
  if (!panelSimHeadEl) return
  const entry = personaFilter ? simEntries.get(personaFilter) : null
  panelSimHeadEl.hidden = !entry
  panelSimHeadEl.textContent = ''
  if (!entry) return
  const paused = pausedSims.has(entry.simId)

  const txt = document.createElement('div'); txt.className = 'ksl-simhead-txt'
  const name = document.createElement('div'); name.className = 'ksl-simhead-name'
  name.style.color = entry.accent; name.textContent = entry.name
  const status = document.createElement('div'); status.className = 'ksl-simhead-status'
  status.setAttribute('role', 'status')
  if (simInProgress(entry.simId)) { const s = document.createElement('span'); s.className = 'ksl-spin'; status.appendChild(s) }
  status.appendChild(document.createTextNode(simStatusText(entry.simId)))
  txt.append(name, status)
  panelSimHeadEl.append(avatarFor(entry, 34), txt)

  if (SimsLive.onPauseToggle) {
    const btn = document.createElement('button')
    btn.type = 'button'; btn.className = 'ksl-pause'; btn.disabled = pauseBusy
    // Inline glyphs (the shared icon set has no pause / play).
    btn.innerHTML = paused
      ? '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor"/></svg> Resume'
      : '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5h2v9H3zM7 1.5h2v9H7z" fill="currentColor"/></svg> Pause'
    btn.setAttribute('aria-label', `${paused ? 'Resume' : 'Pause'} ${entry.name}`)
    btn.addEventListener('click', () => { void togglePause(entry.simId, !paused) })
    panelSimHeadEl.appendChild(btn)
  }
}

async function togglePause(simId: string, pause: boolean): Promise<void> {
  const hook = SimsLive.onPauseToggle
  if (!hook || pauseBusy) return
  pauseBusy = true
  renderSimHead()
  let ok = false
  try { ok = !!(await hook(simId, pause)) } catch { ok = false }
  pauseBusy = false
  if (ok && simEntries.has(simId)) setSimPaused(simId, pause)
  else renderSimHead()
}

function renderRunStatus(): void {
  if (!panelStatusEl) return
  panelStatusEl.hidden = !runStatus
  panelStatusEl.className = 'ksl-status' + (runStatus ? ` is-${runStatus}` : '')
  panelStatusEl.textContent = ''
  if (!runStatus) return
  const dot = document.createElement('span'); dot.className = 'ksl-status-dot'
  const txt = document.createElement('span'); txt.className = 'ksl-status-txt'; txt.textContent = runStatusText()
  panelStatusEl.append(dot, txt)
}

// ── Panel open/close ──────────────────────────────────────────────────────────

function openPanel(): void {
  if (!panelEl || !launcherEl) return
  panelOpen = true
  panelEl.classList.add('is-open')
  launcherEl.hidden = true
  renderList()
}

function closePanel(): void {
  if (!panelEl || !launcherEl) return
  panelOpen = false
  panelEl.classList.remove('is-open')
  launcherEl.hidden = false
  syncSurfaces()
}

// ── Counts + launcher/header chrome ────────────────────────────────────────────

interface Counts { total: number; sims: number; high: number }

function activeCounts(): Counts {
  const live = Array.from(findings.values())
  const sims = new Set(live.map(f => f.entry.simId))
  const high = live.filter(f => severityBucket(f.obs) === 'HIGH').length
  return { total: live.length, sims: sims.size, high }
}

/** Keep launcher label + badge + header count honest with current findings. */
function syncSurfaces(): void {
  const c = activeCounts()

  if (launcherTxtEl) {
    if (runStatus === 'analysing' || runStatus === 'running') {
      launcherTxtEl.textContent = runStatusText()
    } else if (reviewing && c.total === 0) {
      launcherTxtEl.innerHTML = 'Your Sims are reviewing…'
    } else if (c.total === 0) {
      launcherTxtEl.innerHTML = 'Sims are watching this page'
    } else {
      launcherTxtEl.innerHTML = `<b>${c.total}</b> finding${c.total === 1 ? '' : 's'} from your Sims`
    }
  }
  if (launcherBadgeEl) {
    launcherBadgeEl.hidden = c.high === 0
    launcherBadgeEl.textContent = `${c.high} high`
  }

  renderRunStatus()
  if (panelOpen) renderHeader(c)
}

function renderHeader(c: Counts): void {
  if (panelCountEl) {
    if (c.total === 0) {
      panelCountEl.innerHTML = reviewing
        ? 'Your Sims are reviewing this page…'
        : 'No findings yet — your Sims are watching.'
    } else {
      panelCountEl.innerHTML =
        `<b>${c.total}</b> finding${c.total === 1 ? '' : 's'} from <b>${c.sims}</b> Sim${c.sims === 1 ? '' : 's'}` +
        (c.high > 0 ? ` · <span class="ksl-hi">${c.high} high</span>` : '')
    }
  }
  renderFilters()
}

function renderFilters(): void {
  if (!panelFiltersEl) return
  const live = Array.from(findings.values())
  // KD-1456: every deployed Sim gets a chip (not only Sims with findings), so its status is visible.
  panelFiltersEl.hidden = simEntries.size === 0
  panelFiltersEl.textContent = ''
  if (!simEntries.size) return

  // persona chips: "All", then one per deployed Sim — a spinner while its review is in progress.
  const simLabel = document.createElement('span'); simLabel.className = 'ksl-chips-label'; simLabel.textContent = 'Sim'
  panelFiltersEl.appendChild(simLabel)
  const allChip = document.createElement('button')
  allChip.type = 'button'
  allChip.className = 'ksl-chip' + (personaFilter === null ? ' is-on' : '')
  allChip.setAttribute('aria-pressed', String(personaFilter === null))
  allChip.textContent = 'All'
  allChip.addEventListener('click', () => { personaFilter = null; renderList() })
  panelFiltersEl.appendChild(allChip)
  simEntries.forEach((entry) => {
    const n = live.filter(f => f.entry.simId === entry.simId).length
    const busy = simInProgress(entry.simId)
    const chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'ksl-chip' + (personaFilter === entry.simId ? ' is-on' : '') + (pausedSims.has(entry.simId) ? ' is-paused' : '')
    chip.setAttribute('aria-pressed', String(personaFilter === entry.simId))
    chip.title = `${entry.name} — ${simStatusText(entry.simId)}`
    const mark = document.createElement('span')
    if (busy) mark.className = 'ksl-spin'
    else { mark.className = 'ksl-dot'; mark.style.background = entry.accent }
    // "MC · -" while that Sim is still reviewing and has nothing yet; its count otherwise.
    chip.append(mark, document.createTextNode(`${entry.initials} · ${busy && !n ? '-' : n}`))
    chip.addEventListener('click', () => {
      personaFilter = personaFilter === entry.simId ? null : entry.simId
      renderList()
    })
    panelFiltersEl!.appendChild(chip)
  })
  if (!live.length) return

  // priority chips
  const prioLabel = document.createElement('span')
  prioLabel.className = 'ksl-chips-label'; prioLabel.style.marginLeft = '6px'; prioLabel.textContent = 'Priority'
  panelFiltersEl.appendChild(prioLabel)
  ;(['HIGH', 'MED', 'LOW'] as const).forEach(sev => {
    const n = live.filter(f => severityBucket(f.obs) === sev).length
    if (!n) return
    const chip = document.createElement('button')
    chip.type = 'button'
    const on = sevFilter === sev
    chip.className = 'ksl-chip' + (on ? ` sev-on-${SEV_CLASS[sev]}` : '')
    chip.setAttribute('aria-pressed', String(on))
    chip.textContent = `${sev} · ${n}`
    chip.addEventListener('click', () => {
      sevFilter = sevFilter === sev ? null : sev
      renderList()
    })
    panelFiltersEl!.appendChild(chip)
  })
}

// ── Finding rows ───────────────────────────────────────────────────────────────

function visibleFindings(): Finding[] {
  return Array.from(findings.values())
    .filter(f => !personaFilter || f.entry.simId === personaFilter)
    .filter(f => !sevFilter || severityBucket(f.obs) === sevFilter)
    .sort((a, b) => {
      const sa = severityBucket(a.obs); const sb = severityBucket(b.obs)
      const oa = sa ? SEV_ORDER[sa] : 3; const ob = sb ? SEV_ORDER[sb] : 3
      return oa - ob
    })
}

function buildRow(f: Finding): HTMLElement {
  const { entry, obs } = f
  const sev = severityBucket(obs)

  const row = document.createElement('div')
  row.className = 'ksl-row'
  row.setAttribute('role', 'listitem')
  row.dataset.id = f.id
  row.style.borderLeftColor = entry.accent

  // header: avatar + name + sentiment + sev pill
  const rHead = document.createElement('div'); rHead.className = 'ksl-r-head'
  rHead.appendChild(avatarFor(entry, 26))
  const name = document.createElement('span'); name.className = 'ksl-r-name'
  name.style.color = entry.accent; name.textContent = entry.name
  rHead.appendChild(name)
  const sentiment = String(obs.sentiment ?? '').trim()
  if (sentiment) {
    const sent = document.createElement('span'); sent.className = 'ksl-r-sent'; sent.textContent = sentiment
    rHead.appendChild(sent)
  }
  if (sev) {
    const pill = document.createElement('span'); pill.className = `ksl-sev ${SEV_CLASS[sev]}`
    pill.setAttribute('aria-label', `Priority: ${sev}`); pill.textContent = sev
    rHead.appendChild(pill)
  }
  row.appendChild(rHead)

  // finding text — textContent only (LLM output, XSS guard). Clamp + expand.
  const obsEl = document.createElement('div'); obsEl.className = 'ksl-r-obs'
  obsEl.textContent = obs.text || ''
  row.appendChild(obsEl)

  const expandBtn = document.createElement('button')
  expandBtn.type = 'button'; expandBtn.className = 'ksl-r-expand'; expandBtn.textContent = 'Show more'
  expandBtn.addEventListener('click', () => {
    const on = row.classList.toggle('is-expanded')
    expandBtn.textContent = on ? 'Show less' : 'Show more'
  })
  row.appendChild(expandBtn)

  // actions
  const actions = document.createElement('div'); actions.className = 'ksl-r-actions'

  const trackBtn = document.createElement('button')
  trackBtn.type = 'button'; trackBtn.className = 'ksl-r-act track'
  trackBtn.innerHTML = icon('bug', { size: 12 }) + ' Track as Bug'
  trackBtn.setAttribute('aria-label', `Track feedback from ${entry.name} as a bug`)
  trackBtn.addEventListener('click', () => {
    SimsLive.onTriage?.(obs, entry.name)
    handleAndRemoveFinding(f.id)
  })

  const jumpBtn = document.createElement('button')
  jumpBtn.type = 'button'; jumpBtn.className = 'ksl-r-act jump'
  jumpBtn.innerHTML = icon('map-pin', { size: 12 }) + ' Jump to on page'
  jumpBtn.setAttribute('aria-label', `Jump to where ${entry.name} flagged this`)
  jumpBtn.addEventListener('click', () => { void jumpToFinding(f.id) })

  const dismissBtn = document.createElement('button')
  dismissBtn.type = 'button'; dismissBtn.className = 'ksl-r-act dismiss'
  dismissBtn.textContent = 'Dismiss'
  dismissBtn.setAttribute('aria-label', `Dismiss feedback from ${entry.name}`)
  dismissBtn.addEventListener('click', () => { handleAndRemoveFinding(f.id) })

  actions.append(trackBtn, jumpBtn, dismissBtn)
  row.appendChild(actions)

  return row
}

/** Show "Show more" only when the clamped text actually overflows. */
function markClamped(scope: HTMLElement): void {
  scope.querySelectorAll('.ksl-row').forEach(row => {
    const obs = row.querySelector('.ksl-r-obs') as HTMLElement | null
    if (obs && obs.scrollHeight - obs.clientHeight > 4) row.classList.add('is-clamped')
  })
}

function renderList(): void {
  if (!panelListEl || !panelOpen) { syncSurfaces(); return }
  const c = activeCounts()
  renderHeader(c)
  renderSimHead()

  const items = visibleFindings()
  panelListEl.textContent = ''

  if (!items.length) {
    const empty = document.createElement('div')
    empty.className = 'ksl-empty'
    const hasAny = findings.size > 0
    const picked = personaFilter ? simEntries.get(personaFilter) : null
    if (picked && !sevFilter) {
      // KD-1456: the selected Sim has no findings (yet) — say where it is instead of "no match".
      const t = document.createElement('div'); t.className = 'ksl-empty-title'
      t.textContent = simInProgress(picked.simId) ? `${picked.name} is still reviewing this page…`
        : pausedSims.has(picked.simId) ? `${picked.name} is paused` : `No findings from ${picked.name}`
      empty.appendChild(t)
      if (simInProgress(picked.simId)) { const sh = document.createElement('div'); sh.className = 'ksl-shimmer'; empty.appendChild(sh) }
    } else if (reviewing && !hasAny) {
      const t = document.createElement('div'); t.className = 'ksl-empty-title'
      t.textContent = 'Your Sims are reviewing this page…'
      const s = document.createElement('div'); s.textContent = 'Findings will appear here as they spot things.'
      const shimmer = document.createElement('div'); shimmer.className = 'ksl-shimmer'
      empty.append(t, s, shimmer)
    } else if (!hasAny) {
      const t = document.createElement('div'); t.className = 'ksl-empty-title'
      t.textContent = 'No findings yet'
      const s = document.createElement('div'); s.textContent = 'Your Sims are watching this page as a first-time customer would.'
      empty.append(t, s)
    } else {
      empty.textContent = 'No findings match these filters.'
    }
    panelListEl.appendChild(empty)
    findings.forEach(f => { f.rowEl = null })
    return
  }

  items.forEach(f => {
    const row = buildRow(f)
    f.rowEl = row
    panelListEl!.appendChild(row)
  })
  // rows not in the current filtered view have no live DOM node
  const shown = new Set(items.map(i => i.id))
  findings.forEach(f => { if (!shown.has(f.id)) f.rowEl = null })
  markClamped(panelListEl)
}

// ── Transient "jump to on page" halo ───────────────────────────────────────────

function clearJumpHalo(): void {
  jumpHaloCleanup?.()
  jumpHaloCleanup = null
}

async function jumpToFinding(findingId: string): Promise<void> {
  const f = findings.get(findingId)
  if (!f) return
  const targetEl = await resolveObservationTarget(f.obs, { scroll: true })
  if (!targetEl || !overlayEl) return
  drawTransientHalo(targetEl, f.entry.accent)
}

function drawTransientHalo(targetEl: HTMLElement, accent: string): void {
  clearJumpHalo()
  const ov = ensureOverlay()

  const halo = document.createElement('div')
  halo.className = 'klav-halo'
  halo.style.borderColor = accent
  halo.style.boxShadow = `0 0 0 4px ${hexToRgba(accent, .16)},0 0 24px ${hexToRgba(accent, .2)}`
  ov.appendChild(halo)

  const ctrl = new AbortController()
  const position = () => {
    const rect = targetEl.getBoundingClientRect()
    const visible = rect.width > 0 && rect.height > 0 &&
      rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth
    halo.style.display = visible ? '' : 'none'
    if (!visible) return
    halo.style.left = `${rect.left - 5}px`
    halo.style.top = `${rect.top - 5}px`
    halo.style.width = `${rect.width + 10}px`
    halo.style.height = `${rect.height + 10}px`
  }
  const schedule = () => requestAnimationFrame(position)
  position()
  window.addEventListener('scroll', schedule, { passive: true, signal: ctrl.signal })
  window.addEventListener('resize', schedule, { signal: ctrl.signal })

  // Auto-fade after a few seconds — transient by design.
  const fadeTimer = setTimeout(() => {
    halo.style.opacity = '0'
    halo.style.transition = 'opacity .3s ease'
    setTimeout(() => { if (jumpHaloCleanup === cleanup) clearJumpHalo() }, 320)
  }, 3200)

  const cleanup = () => {
    clearTimeout(fadeTimer)
    ctrl.abort()
    safeRemove(halo)
  }
  jumpHaloCleanup = cleanup
}

// ── Add / remove findings ──────────────────────────────────────────────────────

function addFinding(entry: SimEntry, obs: LiveObservation): void {
  const id = `f_${entry.simId}_${++findingSeq}`
  findings.set(id, { id, entry, obs, rowEl: null })

  if (panelOpen) {
    renderList()
  } else {
    syncSurfaces()
  }

  // Announce for screen readers.
  if (announcerEl) {
    announcerEl.textContent = ''
    requestAnimationFrame(() => {
      if (announcerEl) announcerEl.textContent = `${entry.name}: ${obs.text || ''}`
    })
  }
}

function removeFinding(findingId: string): void {
  const f = findings.get(findingId)
  if (!f) return

  const finish = () => {
    findings.delete(findingId)
    if (panelOpen) renderList()
    else syncSurfaces()
  }

  if (f.rowEl && panelOpen) {
    const row = f.rowEl
    row.classList.add('is-removing')
    setTimeout(finish, prefersReducedMotion() ? 0 : 300)
  } else {
    finish()
  }
}

/**
 * Mark an observation handled (so renderFeedback() won't re-surface it) and
 * remove its row. Shared by "Track as Bug" and "Dismiss".
 */
function handleAndRemoveFinding(findingId: string): void {
  const f = findings.get(findingId)
  if (!f) return
  seenObservationKeys.add(observationKey(f.entry.simId, f.obs))
  removeFinding(findingId)
}

// ── renderFeedback() ──────────────────────────────────────────────────────────

function renderFeedback(simId: string, simName: string, observations: LiveObservation[]): void {
  void simName
  if (!hostEl) return
  const entry = simEntries.get(simId)
  if (!entry) {
    console.warn(`[KlavitySims] renderFeedback: simId "${simId}" not registered`)
    return
  }
  if (!observations.length) return

  // Results are arriving — drop the "reviewing…" state even if setReviewing(false)
  // hasn't fired yet, so the UI never lies about state.
  setReviewing(false)

  // Keep the panel action-oriented. Non-actionable (positive/neutral) observations
  // still persist through the review pipeline, but do not create rows.
  //
  // Dedup: a live-mutating page re-reviews the same viewport and the server returns
  // the SAME findings repeatedly. Skip any observation whose normalized text we've
  // already shown for this Sim so identical findings never pile up.
  for (const obs of observations) {
    if (!isConcernObservation(obs)) continue
    const key = observationKey(simId, obs)
    if (seenObservationKeys.has(key)) continue
    seenObservationKeys.add(key)
    addFinding(entry, obs)
  }
}

// ── undeploy() ────────────────────────────────────────────────────────────────

function undeploy(): void {
  // 1. Transient halo + state
  clearJumpHalo()
  findings.clear()
  findingSeq = 0
  simEntries.clear()
  seenObservationKeys.clear()
  panelOpen = false
  personaFilter = null
  sevFilter = null
  reviewing = false
  runStatus = null
  runStartSeq = 0
  activeRuns = 0
  simPhase.clear()
  pausedSims.clear()
  pauseBusy = false

  // 2. Abort global listeners
  deployAbort?.abort(); deployAbort = null

  // 3. Drop cached refs
  launcherEl = null
  launcherAvatarsEl = null
  launcherTxtEl = null
  launcherBadgeEl = null
  panelEl = null
  panelCountEl = null
  panelStatusEl = null
  panelSimHeadEl = null
  panelFiltersEl = null
  panelListEl = null
  announcerEl = null

  // 4. Remove overlay host (transient halo lives here)
  safeRemove(overlayEl); overlayEl = null

  // 5. Remove shadow host (cleans up launcher + panel + announcer)
  safeRemove(hostEl); hostEl = null; shadowRoot = null

  // 6. Leave EXT_CSS in place — removing it mid-session can cause a flash; it only
  //    adds .klav-halo rules which harmlessly sit unused between sessions.
  emitLiveDock(false)
}

// ── Public API ────────────────────────────────────────────────────────────────

export const SimsLive: KlavitySimsAPI = {
  deploy,
  setReviewing,
  setRunStatus,
  setSimStatus,
  setSimPaused,
  renderFeedback,
  undeploy,
  onTriage: null,
  onPauseToggle: null,
}

export function installKlavitySims(): void {
  if (typeof window === 'undefined') return
  if ((window as any).KlavitySims) return
  ;(window as any).KlavitySims = SimsLive
}

if (typeof window !== 'undefined') installKlavitySims()
