/**
 * Klavity Sim — the shared "circle with legs" persona avatar.
 *
 * One framework-agnostic renderer used everywhere a Sim appears: the app stage
 * (.sim-char), the login greeter (.login-sim), rosters/docks, and the SDK widget.
 *
 * Identity: profile photo when available, automatic monogram fallback otherwise
 * (photo failures degrade gracefully). Persona colour = WHO. A floating emotion
 * mark (anime-style) rides on top in the emotion's colour = WHAT they felt — the
 * two signals never blur.
 *
 * Emotions are keyed to the product's reaction `sentiment` vocabulary
 * (frustrated | confused | satisfied | delighted | neutral) plus a few extras.
 *
 * No dependencies. Usage:
 *   import { createSim, injectSimStyles } from '@klavity/core/sim'
 *   injectSimStyles(document)                       // once, into a document or shadowRoot
 *   stage.appendChild(createSim({ name:'Sarah Chen', color:'#6f6cf2',
 *     photoUrl:'/a/sarah.jpg', emotion:'frustrated' }))
 */

export type SimEmotion =
  | 'frustrated'
  | 'confused'
  | 'satisfied'
  | 'delighted'
  | 'neutral'
  | 'inspired'   // feature ask / idea
  | 'alarmed'    // critical / blocker
  | 'none'

export interface SimProps {
  /** Display name. Initials are derived from it when `initials` is omitted. */
  name: string
  /** Override the derived monogram (otherwise first letters of the first two words). */
  initials?: string
  /** Profile photo URL. Falls back to the monogram if absent or it fails to load. */
  photoUrl?: string
  /** Persona / identity colour (any CSS colour). Drives head + thin ring + legs. */
  color?: string
  /** Current feeling — drives the floating mark. */
  emotion?: SimEmotion
  /** Head diameter in px (everything scales from this). Default 58. */
  size?: number
  /** Show the friendly character eyes on the monogram. Default true. */
  eyes?: boolean
  /** Show legs. Default true. */
  legs?: boolean
  /** Idle bob + leg sway + mark animation. Default true. */
  animate?: boolean
  /** Extra class(es) on the root element. */
  className?: string
}

type MarkName = 'vein' | 'q' | 'bang' | 'dots' | 'spark' | 'bulb' | 'check'

interface EmotionSpec { accent: string; mark: MarkName; label: string }

/** Emotion → colour + mark. The first five mirror the reaction `sentiment` enum. */
export const EMOTIONS: Record<Exclude<SimEmotion, 'none'>, EmotionSpec> = {
  frustrated: { accent: '#e8849a', mark: 'vein',  label: 'Frustrated' },
  confused:   { accent: '#e8a24a', mark: 'q',     label: 'Confused' },
  satisfied:  { accent: '#7fd1c4', mark: 'check', label: 'Satisfied' },
  delighted:  { accent: '#9fd6a0', mark: 'spark', label: 'Delighted' },
  neutral:    { accent: '#8a8276', mark: 'dots',  label: 'Neutral' },
  inspired:   { accent: '#8b8bf5', mark: 'bulb',  label: 'Inspired' },
  alarmed:    { accent: '#ef6b6b', mark: 'bang',  label: 'Alarmed' },
}

/** Map a raw reaction sentiment string to a SimEmotion (defensive about casing/extras). */
export function emotionFromSentiment(sentiment: string | null | undefined): SimEmotion {
  switch ((sentiment || '').toLowerCase()) {
    case 'frustrated': return 'frustrated'
    case 'confused':   return 'confused'
    case 'satisfied':  return 'satisfied'
    case 'delighted':  return 'delighted'
    case 'neutral':    return 'neutral'
    case 'inspired':   return 'inspired'
    case 'alarmed':    return 'alarmed'
    default:           return 'none'
  }
}

/** "Sarah Chen" → "SC"; "Priya" → "PR"; falls back gracefully. */
export function deriveInitials(name: string): string {
  const words = (name || '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

function markSvg(name: MarkName): string {
  switch (name) {
    case 'vein': // manga anger pop
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3 L8 6 M11 3 L14 6 M21 11 L18 8 M21 11 L18 14 M13 21 L16 18 M13 21 L10 18 M3 13 L6 16 M3 13 L6 10"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>`
    case 'spark':
      return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z"/><path d="M5.5 13c.3 1.9 1.3 2.9 3.2 3.2-1.9.3-2.9 1.3-3.2 3.2-.3-1.9-1.3-2.9-3.2-3.2 1.9-.3 2.9-1.3 3.2-3.2Z" opacity=".85"/></svg>`
    case 'bulb':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17.5h6M9.5 20.5h5"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z"/><path d="M10 9.5c.4-1 1-1.5 2-1.5" opacity=".7"/></svg>`
    case 'check':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4 10-11"/></svg>`
    case 'dots':
      return `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2.3"/><circle cx="12" cy="12" r="2.3"/><circle cx="19" cy="12" r="2.3"/></svg>`
    case 'bang':
      return `<span class="ksim-glyph">!</span>`
    case 'q':
      return `<span class="ksim-glyph">?</span>`
  }
}

const MARK_ANIM: Record<MarkName, string> = {
  vein: 'ksim-m-vein', spark: 'ksim-m-spark', bulb: 'ksim-m-bulb',
  bang: 'ksim-m-bang', q: 'ksim-m-q', dots: 'ksim-m-dots', check: 'ksim-m-check',
}

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Render the Sim as an HTML string. */
export function renderSimHTML(props: SimProps): string {
  const {
    name, photoUrl, color = '#6f6cf2', emotion = 'none',
    size = 58, eyes = true, legs = true, animate = true, className = '',
  } = props
  const initials = esc(props.initials || deriveInitials(name))
  const spec = emotion !== 'none' ? EMOTIONS[emotion] : null

  const markHTML = spec
    ? `<span class="ksim-mark ${animate ? MARK_ANIM[spec.mark] : ''}" style="color:${esc(spec.accent)}">${markSvg(spec.mark)}</span>`
    : ''

  const eyesHTML = eyes ? `<span class="ksim-eyes"><i></i><i></i></span>` : ''

  const head = photoUrl
    ? `<span class="ksim-head ksim-photo">` +
        `<img src="${esc(photoUrl)}" alt="${esc(name)}" loading="lazy" ` +
        `onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')">` +
        `<span class="ksim-ini">${initials}</span>` +
      `</span>`
    : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${initials}</span>${eyesHTML}</span>`

  const legsHTML = legs ? `<span class="ksim-legs"><i></i><i></i></span>` : ''

  const cls = ['ksim', animate ? 'is-animated' : '', className].filter(Boolean).join(' ')
  const style = `--ksim-persona:${esc(color)};--ksim-size:${size}px;` +
                (spec ? `--ksim-accent:${esc(spec.accent)};` : '')
  return `<span class="${cls}" style="${style}" data-emotion="${emotion}" title="${esc(name)}">${markHTML}${head}${legsHTML}</span>`
}

/** Render the Sim as a live DOM element. */
export function createSim(props: SimProps): HTMLElement {
  const tpl = document.createElement('template')
  tpl.innerHTML = renderSimHTML(props).trim()
  return tpl.content.firstElementChild as HTMLElement
}

/** The component stylesheet. Self-contained; scoped under `.ksim`. */
export const SIM_STYLES = `
.ksim{--ksim-size:58px;position:relative;display:inline-flex;flex-direction:column;align-items:center;line-height:1;vertical-align:bottom}
.ksim.is-animated{animation:ksim-bob 3.1s ease-in-out infinite}
@keyframes ksim-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.ksim-head{position:relative;width:var(--ksim-size);height:var(--ksim-size);border-radius:50%;display:grid;place-items:center;
  box-shadow:0 8px 22px -6px rgba(0,0,0,.7);z-index:2}
.ksim-mono{background:radial-gradient(120% 120% at 30% 22%,color-mix(in srgb,var(--ksim-persona) 72%,#fff 14%),var(--ksim-persona) 58%,color-mix(in srgb,var(--ksim-persona) 55%,#000 38%));
  box-shadow:0 8px 22px -6px rgba(0,0,0,.7),inset 0 2px 4px rgba(255,255,255,.25),inset 0 -6px 12px rgba(0,0,0,.28)}
.ksim-ini{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:700;color:#fff;letter-spacing:.02em;
  font-size:calc(var(--ksim-size)*.31);text-shadow:0 1px 2px rgba(0,0,0,.35)}
/* photo identity — thin persona ring, monogram fallback */
.ksim-photo{background:var(--ksim-persona);box-shadow:0 8px 22px -6px rgba(0,0,0,.7),0 0 0 2px var(--ksim-persona)}
.ksim-photo img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
.ksim-photo .ksim-ini{position:absolute;inset:0;display:none;place-items:center;border-radius:50%;
  background:radial-gradient(120% 120% at 30% 22%,color-mix(in srgb,var(--ksim-persona) 72%,#fff 12%),var(--ksim-persona) 60%)}
.ksim-photo.ksim-fallback .ksim-ini{display:grid}
/* character eyes (monogram) */
.ksim-eyes{position:absolute;bottom:calc(var(--ksim-size)*.16);left:50%;transform:translateX(-50%);display:flex;gap:calc(var(--ksim-size)*.1);z-index:3}
.ksim-eyes i{width:calc(var(--ksim-size)*.086);height:calc(var(--ksim-size)*.086);border-radius:50%;background:rgba(12,10,8,.8)}
.ksim-mono:has(.ksim-eyes) .ksim-ini{transform:translateY(calc(var(--ksim-size)*-.1));font-size:calc(var(--ksim-size)*.26)}
/* legs */
.ksim-legs{display:flex;gap:calc(var(--ksim-size)*.12);margin-top:calc(var(--ksim-size)*.07)}
.ksim-legs i{width:calc(var(--ksim-size)*.12);height:calc(var(--ksim-size)*.29);border-radius:calc(var(--ksim-size)*.07);
  background:color-mix(in srgb,var(--ksim-persona) 60%,#000 30%);transform-origin:top center}
.ksim.is-animated .ksim-legs i:nth-child(1){animation:ksim-la 1.6s ease-in-out infinite}
.ksim.is-animated .ksim-legs i:nth-child(2){animation:ksim-lb 1.6s ease-in-out infinite}
@keyframes ksim-la{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(7deg)}}
@keyframes ksim-lb{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-7deg)}}
/* floating emotion mark */
.ksim-mark{position:absolute;top:calc(var(--ksim-size)*-.2);right:calc(var(--ksim-size)*-.2);
  width:calc(var(--ksim-size)*.45);height:calc(var(--ksim-size)*.45);color:var(--ksim-accent);z-index:5;
  display:grid;place-items:center;filter:drop-shadow(0 2px 5px rgba(0,0,0,.55));transform-origin:center}
.ksim-mark svg{width:100%;height:100%;display:block}
.ksim-glyph{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:700;font-size:calc(var(--ksim-size)*.36);color:var(--ksim-accent)}
.ksim-m-vein{animation:ksim-vein 1.1s ease-in-out infinite}@keyframes ksim-vein{0%,100%{transform:scale(1) rotate(0)}45%{transform:scale(1.22) rotate(-6deg)}}
.ksim-m-spark{animation:ksim-tw 1.5s ease-in-out infinite}@keyframes ksim-tw{0%,100%{transform:scale(1) rotate(0);opacity:1}50%{transform:scale(1.18) rotate(18deg);opacity:.7}}
.ksim-m-bulb{animation:ksim-bulb 1.7s ease-in-out infinite}@keyframes ksim-bulb{0%,100%{filter:drop-shadow(0 0 0 transparent) drop-shadow(0 2px 5px rgba(0,0,0,.55))}50%{filter:drop-shadow(0 0 9px var(--ksim-accent)) drop-shadow(0 2px 5px rgba(0,0,0,.55))}}
.ksim-m-bang{animation:ksim-bang 1.2s ease-in-out infinite}@keyframes ksim-bang{0%,100%{transform:translateX(0) rotate(0)}25%{transform:translateX(-2px) rotate(-7deg)}75%{transform:translateX(2px) rotate(7deg)}}
.ksim-m-q{animation:ksim-q 2.2s ease-in-out infinite}@keyframes ksim-q{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}
.ksim-m-dots{animation:ksim-dots 2s linear infinite}@keyframes ksim-dots{0%,100%{opacity:.45}50%{opacity:1}}
.ksim-m-check{animation:ksim-check 2.4s ease-in-out infinite}@keyframes ksim-check{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
@media (prefers-reduced-motion: reduce){.ksim,.ksim *{animation:none !important}}
`

/**
 * Inject the stylesheet once into a document or shadow root.
 * Safe to call repeatedly — it no-ops if already present.
 */
export function injectSimStyles(target: Document | ShadowRoot = document): void {
  const host: ParentNode | null = (target as Document).head ?? (target as ShadowRoot) ?? null
  if (!host) return
  if ((host as Element).querySelector?.('style[data-ksim]')) return
  const style = document.createElement('style')
  style.setAttribute('data-ksim', '')
  style.textContent = SIM_STYLES
  host.appendChild(style)
}
