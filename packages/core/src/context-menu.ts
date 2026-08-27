// Shared right-click "card" context-menu presentation for BOTH surfaces:
//   • the in-page widget (packages/sdk/src/widget.ts)
//   • the browser extension content script (packages/extension/src/content.ts)
//
// KLA-726: this is the single source of truth for the polished card menu (icon chip +
// title + one-line description + right-arrow, primary/muted variants, Sim-avatar header,
// "Powered by Klavity" footer). Both callers inject CONTEXT_MENU_CSS and build rows with
// buildMenuCard() so the two can never visually drift again. Behaviour (positioning, sim
// fetching, click wiring, closeMenu) stays local to each caller — only the look is shared.
//
// Styling notes: cards use the `scale` shorthand + custom easings; `.klm-card.primary` is the
// brand-purple "Report a Bug" card; `.klm-card.muted` is the warm-beige "Browser menu" row.

// Entrance/stagger/shimmer/spinner keyframes + the full card/chip/sim-row/footer stylesheet.
// Emitted verbatim into the widget's shadow root and into the extension's document.head.
export const CONTEXT_MENU_CSS =
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}" +
  "@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}" +
  "@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}" +
  "@keyframes klm-spin{to{transform:rotate(360deg)}}" +
  ".klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}" +
  // ── Large touch cards (L6): icon chip + label + one-line description + arrow ──
  ".klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}" +
  ".klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}" +
  ".klm-card:active{scale:.96}" +
  ".klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}" +
  ".klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}" +
  ".klm-chip svg{width:16px;height:16px;display:block}" +
  ".klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}" +
  ".klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}" +
  ".klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}" +
  ".klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}" +
  ".klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}" +
  ".klm-go svg{width:14px;height:14px;display:block}" +
  ".klm-card:hover .klm-go{transform:translateX(3px)}" +
  ".klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}" +
  // primary = Report a Bug (brand purple)
  ".klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}" +
  ".klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}" +
  ".klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}" +
  ".klm-card.primary .klm-d{color:rgba(255,255,255,.85)}" +
  ".klm-card.primary .klm-go{color:rgba(255,255,255,.72)}" +
  // muted = Show browser menu (warm beige)
  ".klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}" +
  ".klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}" +
  ".klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}" +
  // Sim icons row at the top of the menu
  ".klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}" +
  ".klm-sims-chips{display:flex;align-items:center;gap:0}" +
  ".klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}" +
  ".klm-sims-chips .klm-sim-chip:first-child{margin-left:0}" +
  ".klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}" +
  ".klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}" +
  // footer wordmark
  ".klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}" +
  ".klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}" +
  ".klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"

// Lucide arrow-right (not in our generated icon set → inline) for each card's affordance.
export const MENU_ARROW_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'

export interface MenuCardOpts {
  /** Pre-rendered icon SVG (e.g. from @klavity/core/icons `icon('zap')`). */
  iconHtml: string
  /** Card title (short verb phrase). Static copy only — never untrusted data. */
  label: string
  /** One-line description under the title. Omit/empty for a label-only card. */
  desc?: string
  /** Brand-purple primary card (Report a Bug). */
  primary?: boolean
  /** Warm-beige muted card (Browser menu). */
  muted?: boolean
  /** Right-side monospace hint pill instead of the arrow (may contain <br>). */
  hint?: string
  /** Entrance-stagger delay in ms. */
  animationDelayMs?: number
}

// Builds ONE card <button> (icon chip + title + optional description + arrow/hint).
// Does NOT attach a click handler — each caller wires its own click (so closeMenu /
// pane-specific behaviour stays local). Content is static template copy; label/desc
// must always be our own strings (no untrusted innerHTML), matching the ext/widget
// DOM-hardening rules.
export function buildMenuCard(doc: Document, opts: MenuCardOpts): HTMLButtonElement {
  const b = doc.createElement("button")
  b.className = "klm-card" + (opts.primary ? " primary" : "") + (opts.muted ? " muted" : "")
  if (opts.animationDelayMs != null) b.style.animationDelay = opts.animationDelayMs + "ms"
  const right = opts.hint
    ? '<span class="klm-hint">' + opts.hint + '</span>'
    : '<span class="klm-go">' + MENU_ARROW_SVG + '</span>'
  b.innerHTML =
    '<span class="klm-chip">' + opts.iconHtml + '</span>' +
    '<span class="klm-body"><span class="klm-t">' + opts.label + '</span>' +
    (opts.desc ? '<span class="klm-d">' + opts.desc + '</span>' : '') +
    '</span>' + right
  return b
}

export interface SimChip {
  id: string
  name: string
  initials?: string
  accent?: string
}

// Deterministic accent palette so Sims without a stored colour still get a stable chip hue.
const SIM_ACCENTS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9"]

export function simAccent(seed: string, fallback?: string): string {
  if (fallback) return fallback
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return SIM_ACCENTS[h % SIM_ACCENTS.length]
}

export function simInitials(s: SimChip): string {
  return (s.initials || s.name.slice(0, 2)).toUpperCase()
}

// Renders the stacked Sim-avatar chips (+ optional "N Sims" label) into `chipsEl`.
// Mirrors the widget header. Returns the number of chips rendered.
export function renderSimChips(doc: Document, chipsEl: HTMLElement, sims: SimChip[]): number {
  chipsEl.innerHTML = ""
  sims.slice(0, 6).forEach((s, i) => {
    const chip = doc.createElement("span")
    chip.className = "klm-sim-chip"
    chip.title = s.name
    chip.style.background = simAccent(s.id || s.name, s.accent)
    chip.style.zIndex = String(10 - i)
    chip.textContent = simInitials(s)
    chipsEl.appendChild(chip)
  })
  if (sims.length > 0 && !chipsEl.parentElement?.querySelector(".klm-sims-label")) {
    const lbl = doc.createElement("span")
    lbl.className = "klm-sims-label"
    lbl.textContent = sims.length + " Sim" + (sims.length > 1 ? "s" : "")
    chipsEl.after(lbl)
  }
  return Math.min(sims.length, 6)
}
