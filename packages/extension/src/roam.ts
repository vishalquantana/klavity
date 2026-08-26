// ── Sim Roast / cinematic mode (ticket #714) ────────────────────────────────
//
// When the user runs "Analyse with Sims", the Sim characters (circle-with-legs
// avatars) roam the REAL page: each walks to the element a finding is about,
// draws a highlight box, points, and pops a bug bubble. The run ends in a
// "Banana Scorecard". This is a faithful port of the proven roaming engine on
// the marketing homepage (site/index.html: `.rv` character CSS + the `place()`
// smart side-placement algo + `showNote`/`step`) into the extension's dedicated
// shadow-DOM host, so it never pollutes the third-party page's DOM.
//
// Two named modes (persisted; default VISUAL; prefers-reduced-motion forces
// NON-VISUAL):
//   • VISUAL     — the walking-characters show, ending at the scorecard.
//   • NON-VISUAL — no animation; the Banana Scorecard is shown immediately with
//                  an "N found" counts summary at the top.
// Both modes converge on the same scorecard data.

export type RoamMode = 'visual' | 'nonvisual'

// Emoji glyphs written as escape sequences. Bananas ARE the product concept here
// (the "Banana Scorecard"), but the repo's emoji CI guard (scripts/check-no-emoji.mjs)
// forbids literal emoji in user-facing source — escapes keep it green.
const NANA = '\u{1F34C}' // banana
const SPARK = '\u{2728}' // sparkles
const BRUISE = '\u{1F915}' // face with head-bandage
const LOCK = '\u{1F512}' // lock
const BOLT = '\u{26A1}' // high voltage
const PLAY = '\u{25B6}' // play triangle
const NN = (n: number) => NANA.repeat(n)

export interface RoastReaction {
  simName: string
  initials: string
  accent: string
  observation?: string
  priority?: string
  citation?: { sourceQuote?: string; speaker?: string } | any
  suggestedBug?: any
}

export interface RoamOptions {
  reactions: RoastReaction[]
  mode: RoamMode
  root: ShadowRoot
  /** Deep link for the "Open in Klavity →" CTA (dashboard + project). */
  dashboardUrl: string
  /** Reuse the host's XSS guards so nothing bypasses the existing escaping. */
  esc: (s: unknown) => string
  safeColor: (c: unknown) => string
  /** Persist a mode flip from the in-card segmented toggle. */
  onSetMode?: (m: RoamMode) => void
}

// ── Pure helpers (unit-tested) ───────────────────────────────────────────────

export interface Scored extends RoastReaction {
  banana: 1 | 2 | 3
  security: boolean
}

const GAME_BREAKER =
  /(checkout|payment|purchase|pay\b|billing|auth|login|log ?in|sign ?in|500|crash|broken|infinite|can'?t|cannot|unable|fail(ed|s|ure)?|data ?loss|corrupt|blank|stuck|freeze|frozen|dead ?end)/i
const FRICTION =
  /(click|confus|slow|lag|dead ?link|hard to|difficult|unclear|missing|hidden|awkward|friction|too many|no (feedback|validation|locale)|overlap|cut ?off|truncat|inconsistent)/i
const SECURITY =
  /(security|vuln|xss|csrf|sql ?injection|inject|exploit|owasp|leak|exposed|credential|password|secret|token|api ?key|admin|privilege|escalat|auth(entication|orization)? bypass|no auth check|open redirect|ssrf|idor|pii)/i

/**
 * Severity → banana count. FIRST honours an explicit priority string carried on
 * the reaction (populated from suggestedBug.priority — the only severity signal
 * Sim reactions carry; there is no C1/C2/C3 or region field). If absent, derive
 * from the observation text with a documented keyword heuristic.
 *   3 bananas = game-breaker (C1) · 2 = friction (C2) · 1 = nit (C3)
 */
export function bananaFor(r: RoastReaction): 1 | 2 | 3 {
  const p = String(r.priority ?? '').toLowerCase().trim()
  if (p) {
    if (/(c1|p1|critical|blocker|highest|urgent|sev ?1|\bhigh\b)/.test(p)) return 3
    if (/(c3|p3|lowest|trivial|minor|\bnit\b|cosmetic|sev ?3|\blow\b)/.test(p)) return 1
    if (/(c2|p2|medium|moderate|normal|major|sev ?2|\bmed\b)/.test(p)) return 2
    // Unknown priority token → fall through to text heuristic below.
  }
  const t = String(r.observation ?? '')
  if (GAME_BREAKER.test(t)) return 3
  if (FRICTION.test(t)) return 2
  return 1
}

/**
 * Whether a finding is security/vuln-flavoured. Sim reactions carry NO explicit
 * security category, so we keyword-detect across priority + observation +
 * suggestedBug. Security findings are shown in-product to the signed-in user but
 * EXCLUDED from the shareable/export card (product policy). We err toward
 * over-excluding (privacy-safe).
 */
export function isSecurity(r: RoastReaction): boolean {
  const hay = [
    r.priority,
    r.observation,
    r?.suggestedBug?.title,
    r?.suggestedBug?.category,
    r?.suggestedBug?.type,
    r?.suggestedBug?.labels && Array.isArray(r.suggestedBug.labels) ? r.suggestedBug.labels.join(' ') : r?.suggestedBug?.labels,
  ]
    .filter(Boolean)
    .join(' ')
  return SECURITY.test(hay)
}

export function score(reactions: RoastReaction[]): Scored[] {
  return reactions.map((r) => ({ ...r, banana: bananaFor(r), security: isSecurity(r) }))
}

export interface Summary {
  total: number // total bananas
  count: number // number of findings
  c3: number
  c2: number
  c1: number
  verdictClass: 'golden' | 'mid' | 'bruised'
  verdictLabel: string
}

export function summarize(scored: Scored[]): Summary {
  const c3 = scored.filter((s) => s.banana === 3).length
  const c2 = scored.filter((s) => s.banana === 2).length
  const c1 = scored.filter((s) => s.banana === 1).length
  const total = scored.reduce((n, s) => n + s.banana, 0)
  let verdictClass: Summary['verdictClass'] = 'mid'
  let verdictLabel = `A few bruises ${NANA}`
  if (total === 0) {
    verdictClass = 'golden'
    verdictLabel = `Golden banana ${SPARK}`
  } else if (total >= 9 || c3 >= 2) {
    verdictClass = 'bruised'
    verdictLabel = `Bruised banana ${BRUISE}`
  } else if (total <= 3) {
    verdictClass = 'golden'
    verdictLabel = `Golden banana ${SPARK}`
  }
  return { total, count: scored.length, c3, c2, c1, verdictClass, verdictLabel }
}

// ── Runtime engine (DOM) ─────────────────────────────────────────────────────

export interface Char {
  el: HTMLElement
  hl: HTMLElement
  key: string
  color: string
  name: string
  initials: string
  current: Element | null
  /** Placement mode of the CURRENT step: pointing at an element vs a margin slot. */
  mode: 'idle' | 'target' | 'margin'
  /** Stable margin slot (unique per char) so margin chars never collide/re-shuffle. */
  marginSlot: number
  /** The reaction the char is currently showing — lets reposition re-resolve the quote. */
  active: Scored | null
  /** Parked = target scrolled out of view: char + highlight are hidden until it returns. */
  parked: boolean
}

interface ActiveRun {
  timers: Set<ReturnType<typeof setTimeout>>
  nodes: HTMLElement[]
  chars: Char[]
  onScroll: (() => void) | null
  onNav: (() => void) | null
  onVV: (() => void) | null // visualViewport resize/zoom/scroll handler
  raf: number | null // pending reveal requestAnimationFrame id
  lastOpts: RoamOptions | null
}

let run: ActiveRun | null = null

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b)
const overlaps = (a: any, b: any) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t

function prefersReduced(): boolean {
  try {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/** Resolve a reaction to a live page element via its grounded citation quote. */
export function findTarget(quote: string | undefined | null): Element | null {
  const q = String(quote ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
  if (q.length < 4) return null
  const needle = q.slice(0, 48)
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement
      if (!p) return NodeFilter.FILTER_REJECT
      const tag = p.tagName
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT
      if (p.id === 'klavity-sims-host' || p.closest('#klavity-sims-host,#klavity-host,#klavity-qa-host'))
        return NodeFilter.FILTER_REJECT
      const txt = node.nodeValue || ''
      return txt.trim().length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    },
  })
  let scanned = 0
  while (walker.nextNode()) {
    if (++scanned > 4000) break
    const txt = (walker.currentNode.nodeValue || '').replace(/\s+/g, ' ').toLowerCase()
    if (txt.includes(needle)) {
      const el = (walker.currentNode.parentElement as Element) || null
      if (el && el.getBoundingClientRect().width > 0) return el
    }
  }
  return null
}

function T(fn: () => void, ms: number) {
  if (!run) return
  const id = setTimeout(() => {
    run?.timers.delete(id)
    fn()
  }, ms)
  run.timers.add(id)
  return id
}

// Viewport dims that follow the VISUAL viewport (pinch-zoom / maximize / resize),
// falling back to the layout viewport. Recomputed on every call so a maximize or
// zoom is picked up by reposition.
const vw = () => Math.round(window.visualViewport?.width ?? innerWidth)
const vh = () => Math.round(window.visualViewport?.height ?? innerHeight)

/** Homepage `inView` — is the element usefully within the current viewport? */
function inView(el: Element): boolean {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 && r.top < vh() - 40 && r.bottom > 40 && r.left < vw() && r.right > 0
}

/** Port of the homepage `place()` — puts the Sim + bubble on whichever side of the
 *  element has room so the bubble never covers the element under review. Clamps the
 *  chosen bubble box into the viewport so it can't render off-screen (small/narrow
 *  viewports, or elements larger than the viewport). */
function place(c: Char, el: Element) {
  const r = el.getBoundingClientRect()
  const W = vw(),
    H = vh()
  c.hl.style.left = r.left + 'px'
  c.hl.style.top = r.top + 'px'
  c.hl.style.width = r.width + 'px'
  c.hl.style.height = r.height + 'px'
  c.hl.classList.add('on')
  c.current = el

  const BW = Math.min(214, W - 24), // bubble can't be wider than the viewport
    BH = 134,
    HEAD = 50,
    GAP = 12,
    M = 8
  const elBox = { l: r.left, t: r.top, r: r.right, b: r.bottom }
  const cxAt = clamp(r.left + r.width / 2, BW / 2 + M, W - BW / 2 - M)
  const cyAt = clamp(r.top + r.height / 2, BH / 2 + M, H - BH / 2 - M)
  const cands: Record<string, any> = {
    below: { cls: 'b-below', aim: false, simLeft: cxAt - 23, simTop: r.bottom + GAP, room: H - r.bottom, bub: { l: cxAt - BW / 2, r: cxAt + BW / 2, t: r.bottom + GAP + HEAD, b: r.bottom + GAP + HEAD + BH } },
    above: { cls: '', aim: true, simLeft: cxAt - 23, simTop: r.top - HEAD - GAP, room: r.top, bub: { l: cxAt - BW / 2, r: cxAt + BW / 2, t: r.top - HEAD - GAP - BH, b: r.top - HEAD - GAP } },
    right: { cls: 'b-right', aim: false, simLeft: r.right + GAP, simTop: cyAt - 25, room: W - r.right, bub: { l: r.right + GAP + 27, r: r.right + GAP + 27 + BW, t: cyAt - BH / 2, b: cyAt + BH / 2 } },
    left: { cls: 'b-left', aim: false, simLeft: r.left - GAP - 46, simTop: cyAt - 25, room: r.left, bub: { l: r.left - GAP - 19 - BW, r: r.left - GAP - 19, t: cyAt - BH / 2, b: cyAt + BH / 2 } },
  }
  const inVp = (b: any) => b.l >= M && b.r <= W - M && b.t >= M && b.b <= H - M
  const order = r.width < W * 0.6 ? ['right', 'left', 'below', 'above'] : ['below', 'above', 'right', 'left']
  let best: any = null
  for (const s of order) {
    const cand = cands[s]
    if (inVp(cand.bub) && !overlaps(cand.bub, elBox)) {
      best = cand
      break
    }
  }
  // Nothing fits cleanly (element bigger than viewport, or very cramped): take the
  // side with the most room — clamped below so the char (and thus its bubble) stays on-screen.
  if (!best) best = Object.values(cands).reduce((a: any, b: any) => (a.room >= b.room ? a : b))

  c.el.classList.remove('b-below', 'b-right', 'b-left', 'aim-down')
  if (best.cls) c.el.classList.add(best.cls)
  if (best.aim) c.el.classList.add('aim-down')
  c.el.style.left = clamp(best.simLeft, M, W - 46 - M) + 'px'
  c.el.style.top = clamp(best.simTop, M, H - HEAD - M) + 'px'
}

/** Move a Sim to its stable neutral margin slot (page-level / region-less findings,
 *  or a parked target that vanished). Recomputed from the CURRENT viewport so a
 *  maximize/resize/zoom keeps it in a valid on-screen spot (Bug 1). The margin
 *  bubble is CENTERED on the char, so we clamp the char's bubble-center into the
 *  viewport (finding QA-3: left-edge slots used to push the 214px bubble off-screen
 *  to ~-60px) and orient it vertically toward the side with room. */
export function placeMargin(c: Char) {
  const W = vw(),
    H = vh()
  // Use the bubble's ACTUAL rendered width (border-box incl. padding + border) —
  // not the nominal 214 — so the real on-screen box stays within [0, W] for edge
  // slots (finding QA-3 round 2: padding/border made the rendered box wider than
  // the clamp value). Falls back to 214 when it can't be measured yet.
  const bub = c.el.querySelector('.rr-bubble') as HTMLElement | null
  const measured = bub ? bub.getBoundingClientRect().width || bub.offsetWidth || 0 : 0
  const BW = Math.min(measured || 214, W - 24) // bubble can't be wider than the viewport
  const BH = 134,
    HEAD = 50,
    M = 8
  c.hl.classList.remove('on')
  c.current = null
  const spots = [
    { l: W - 260, t: 120 },
    { l: 24, t: H / 2 },
    { l: W - 260, t: H - 220 },
    { l: 24, t: 120 },
    { l: W / 2 - 23, t: H - 200 },
  ]
  const s = spots[c.marginSlot % spots.length]
  c.el.classList.remove('b-below', 'b-right', 'b-left', 'aim-down')

  // Horizontal: keep the CENTERED bubble fully on-screen. Char center = left + 23;
  // it must sit within [BW/2+M, W-BW/2-M] so the bubble's edges stay inside.
  const loCenter = BW / 2 + M
  const hiCenter = W - BW / 2 - M
  const center = clamp(s.l + 23, Math.min(loCenter, hiCenter), Math.max(loCenter, hiCenter))
  c.el.style.left = clamp(center - 23, M, W - 46 - M) + 'px'

  // Vertical: the default bubble sits ABOVE the char; if the slot is high up there's
  // no room above, so flip it BELOW (b-below). Clamp so the bubble fits either way.
  if (s.t < BH + HEAD) {
    c.el.classList.add('b-below')
    c.el.style.top = clamp(s.t, M, H - HEAD - BH - M) + 'px'
  } else {
    c.el.style.top = clamp(s.t, BH + M, H - HEAD - M) + 'px'
  }
}

function parkChar(c: Char) {
  c.parked = true
  c.el.style.opacity = '0'
  c.hl.classList.remove('on')
}
function unparkChar(c: Char) {
  if (!c.parked) return
  c.parked = false
  c.el.style.opacity = '1'
}

/** Two+ Sims citing the SAME element would stack exactly. Fan them out horizontally
 *  around the shared anchor and alternate the bubble side so both stay readable. */
export function deOverlap(chars: Char[]) {
  const groups = new Map<Element, Char[]>()
  for (const c of chars) {
    if (c.mode === 'target' && c.current && !c.parked) {
      const g = groups.get(c.current) || []
      g.push(c)
      groups.set(c.current, g)
    }
  }
  const W = vw()
  for (const g of groups.values()) {
    if (g.length < 2) continue
    g.forEach((c, i) => {
      const off = (i - (g.length - 1) / 2) * 58
      const cur = parseFloat(c.el.style.left || '0')
      c.el.style.left = clamp(cur + off, 8, W - 54) + 'px'
      if (i % 2 === 1) {
        // nudge the odd ones' bubble to the opposite side to avoid bubble overlap
        c.el.classList.remove('b-right')
        c.el.classList.add('b-left')
      }
    })
  }
}

/** Reposition ONE active char for the current viewport. Targeted chars re-place(),
 *  park when scrolled out, and — when their element is removed/re-rendered (SPA) —
 *  re-resolve the citation quote. If it can't be resolved THIS tick the char PARKS
 *  and keeps `mode:'target'` so later ticks retry (it does NOT permanently fall to
 *  margin — finding #714/QA-2); it unparks onto the replacement when it reappears.
 *  Chars that were page-level from the start stay `mode:'margin'`. */
export function repositionChar(c: Char) {
  if (!c.active || c.mode === 'idle') return
  if (c.mode === 'margin') {
    unparkChar(c)
    placeMargin(c)
    return
  }
  // mode === 'target'
  let el: Element | null = c.current
  const detached = !el || !(el as any).isConnected || el.getBoundingClientRect().width === 0
  if (detached) {
    const found = findTarget(c.active.citation?.sourceQuote)
    if (found && found.getBoundingClientRect().width > 0) {
      c.current = el = found
    } else {
      // Couldn't re-resolve this tick → park + KEEP RETRYING on later ticks.
      c.current = null
      parkChar(c)
      return
    }
  }
  if (!inView(el!)) {
    parkChar(c) // scrolled out of view → hide char + highlight (don't point off-screen)
    return
  }
  unparkChar(c)
  place(c, el!)
}

/** Reposition EVERY active char + de-overlap — the single source of truth called
 *  on scroll / resize / visualViewport zoom. */
function repositionAll() {
  const chars = run?.chars || []
  for (const c of chars) repositionChar(c)
  deOverlap(chars)
}

function styleId() {
  return 'klav-roam-style'
}

function injectStyle(root: ShadowRoot) {
  if (root.getElementById(styleId())) return
  const st = document.createElement('style')
  st.id = styleId()
  st.textContent = ROAM_CSS
  root.appendChild(st)
  // Track so stopRoam() removes it too — leaves literally zero injected nodes (QA-4).
  run?.nodes.push(st)
}

function spawnChars(root: ShadowRoot, opts: RoamOptions): Char[] {
  const MAX = 5
  // One character per distinct Sim (up to MAX); accents come from the server.
  const seen = new Map<string, Char>()
  const chars: Char[] = []
  const reduce = prefersReduced()
  const originX = vw() - 150 // spawn near the extension pill (top-right)
  const originY = 70
  for (const r of opts.reactions) {
    const key = (r.initials || r.simName || '?').toUpperCase()
    if (seen.has(key)) continue
    if (chars.length >= MAX) continue
    const color = opts.safeColor(r.accent)
    const el = document.createElement('div')
    el.className = 'rr-rv'
    el.style.setProperty('--rr-accent', color)
    el.innerHTML =
      `<div class="rr-bubble"></div>` +
      `<div class="rr-body">` +
      `<div class="rr-arm"><span class="rr-fin"></span></div>` +
      `<div class="rr-head" style="background:${color}">${opts.esc(key.slice(0, 2))}</div>` +
      `<div class="rr-legs"><span class="rr-leg" style="background:${color}"></span><span class="rr-leg" style="background:${color}"></span></div>` +
      `</div>`
    el.style.left = originX + chars.length * 8 + 'px'
    el.style.top = originY + chars.length * 6 + 'px'
    root.appendChild(el)
    const hl = document.createElement('div')
    hl.className = 'rr-hl'
    hl.style.borderColor = color
    hl.style.boxShadow = '0 0 0 4px ' + color + '26'
    root.appendChild(hl)
    const c: Char = { el, hl, key, color, name: r.simName || 'Sim', initials: key, current: null, mode: 'idle', marginSlot: chars.length, active: null, parked: false }
    seen.set(key, c)
    chars.push(c)
    run!.nodes.push(el, hl)
    const i = chars.length - 1
    if (reduce) {
      // Reduced motion: appear instantly, no entrance.
      el.classList.add('spawn')
    } else {
      // Entrance (like the homepage reviewer Sims): fade + rise + scale-in from the
      // spawn pill, staggered, with the site's reveal easing. The `.rr-enter` start
      // state is in CSS; removing it (next frame, staggered) animates in.
      el.classList.add('rr-enter')
      T(() => {
        el.classList.remove('rr-enter')
        el.classList.add('spawn')
      }, 90 * i + 40)
    }
  }
  return chars
}

function bubble(c: Char, opts: RoamOptions, r: Scored) {
  const b = c.el.querySelector('.rr-bubble') as HTMLElement
  const nanas = NN(r.banana)
  const sevTxt = r.banana === 3 ? 'C1 game-breaker' : r.banana === 2 ? 'C2 friction' : 'C3 nit'
  const cite = r.citation?.sourceQuote
    ? `<div class="rr-cite">“${opts.esc(String(r.citation.sourceQuote).slice(0, 80))}”</div>`
    : ''
  b.innerHTML =
    `<div class="rr-tag"><span class="rr-tav" style="background:${c.color}">${opts.esc(c.initials.slice(0, 2))}</span>${opts.esc(c.name)}${r.security ? `<span class="rr-lock" title="Security — hidden from share card">${LOCK}</span>` : ''}</div>` +
    `<div class="rr-line">${opts.esc(r.observation || '')}</div>` +
    cite +
    `<div class="rr-sev s${r.banana}">${nanas} ${sevTxt}</div>`
  c.el.classList.add('say', 'point')
}

function hud(root: ShadowRoot): HTMLElement {
  const h = document.createElement('div')
  h.className = 'rr-hud'
  h.innerHTML =
    `<div class="rr-hud-cap">${NANA} Banana Scorecard</div>` +
    `<div class="rr-hud-big"><span class="rr-hud-total">0</span><span class="rr-hud-em">${NANA}</span></div>` +
    `<div class="rr-hud-brk">` +
    `<div class="rr-hud-b"><span class="e">${NN(3)}</span><span class="lab">Game-breakers</span><span class="c" data-c="3">0</span></div>` +
    `<div class="rr-hud-b"><span class="e">${NN(2)}</span><span class="lab">Friction</span><span class="c" data-c="2">0</span></div>` +
    `<div class="rr-hud-b"><span class="e">${NANA}</span><span class="lab">Nits</span><span class="c" data-c="1">0</span></div>` +
    `</div>` +
    `<div class="rr-hud-live"><span class="dot"></span> Sims roaming — live</div>`
  root.appendChild(h)
  run!.nodes.push(h)
  return h
}

function tick(el: Element | null) {
  if (!el || typeof (el as any).animate !== 'function') return
  ;(el as HTMLElement).animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], {
    duration: 380,
    easing: 'cubic-bezier(.16,1,.3,1)',
  })
}

// ── Public entry ─────────────────────────────────────────────────────────────

export function stopRoam() {
  if (!run) return
  run.timers.forEach((t) => clearTimeout(t))
  if (run.onScroll) {
    removeEventListener('scroll', run.onScroll)
    removeEventListener('resize', run.onScroll)
  }
  if (run.onVV && window.visualViewport) {
    window.visualViewport.removeEventListener('resize', run.onVV)
    window.visualViewport.removeEventListener('scroll', run.onVV)
  }
  if (run.onNav) removeEventListener('popstate', run.onNav)
  if (run.raf != null) cancelAnimationFrame(run.raf)
  run.nodes.forEach((n) => n.remove())
  run = null
}

export function roamRoast(opts: RoamOptions) {
  stopRoam()
  const effectiveMode: RoamMode = prefersReduced() ? 'nonvisual' : opts.mode
  const scored = score(opts.reactions)
  const sum = summarize(scored)

  run = { timers: new Set(), nodes: [], chars: [], onScroll: null, onNav: null, onVV: null, raf: null, lastOpts: opts }
  injectStyle(opts.root) // after run exists so the style node is tracked for teardown (QA-4)

  // Clean up if the user navigates away mid-roam (SPA route or back/forward).
  const onNav = () => stopRoam()
  run.onNav = onNav
  addEventListener('popstate', onNav)

  if (effectiveMode === 'nonvisual' || !scored.length) {
    reveal(opts, scored, sum, effectiveMode, { summaryFirst: true })
    return
  }

  // ── VISUAL: the walking-characters show ──
  const chars = spawnChars(opts.root, opts)
  run.chars = chars
  const hudEl = hud(opts.root)
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0 }
  let total = 0
  const bumpHud = (b: number) => {
    counts[b]++
    total += b
    const tEl = hudEl.querySelector('.rr-hud-total')!
    tEl.textContent = String(total)
    tick(tEl)
    const cEl = hudEl.querySelector(`[data-c="${b}"]`)!
    cEl.textContent = String(counts[b])
    tick(cEl)
    if (b === 3) {
      hudEl.classList.remove('shake')
      void (hudEl as HTMLElement).offsetWidth
      hudEl.classList.add('shake')
    }
  }

  // Assign each finding to a character (round-robin over the spawned set), then
  // run each character's queue sequentially while characters run in parallel.
  const perChar: Scored[][] = chars.map(() => [])
  const idxFor = new Map<string, number>()
  chars.forEach((c, i) => idxFor.set(c.key, i))
  scored.forEach((r, i) => {
    const key = (r.initials || r.simName || '?').toUpperCase()
    const ci = idxFor.has(key) ? idxFor.get(key)! : i % chars.length
    perChar[ci].push(r)
  })

  const WALK = 950
  const DWELL = 2600
  const STEP = WALK + DWELL + 300
  let maxT = 0
  perChar.forEach((queue, ci) => {
    const c = chars[ci]
    queue.forEach((r, qi) => {
      const at = 700 + ci * 220 + qi * STEP
      maxT = Math.max(maxT, at + WALK)
      T(() => {
        c.el.classList.add('walk')
        c.el.classList.remove('say', 'point')
        c.active = r
        const target = findTarget(r.citation?.sourceQuote)
        if (target && inView(target)) {
          c.mode = 'target'
          place(c, target)
        } else {
          // No citable element (or it's off-screen) → roam to this char's margin slot.
          c.mode = 'margin'
          placeMargin(c)
        }
        // De-overlap when two Sims land on the same element.
        deOverlap(run?.chars || [])
        T(() => {
          c.el.classList.remove('walk')
          bubble(c, opts, r)
          bumpHud(r.banana)
        }, WALK)
      }, at)
    })
  })

  // Reposition ALL chars (targeted + margin) on scroll / resize / visualViewport
  // zoom. Single handler → single source of truth (fixes the stranded margin char
  // after maximize, Bug 1). Passive; transforms handle the smoothness.
  const reposition = () => repositionAll()
  run.onScroll = reposition
  addEventListener('scroll', reposition, { passive: true })
  addEventListener('resize', reposition)
  if (window.visualViewport) {
    run.onVV = reposition
    window.visualViewport.addEventListener('resize', reposition)
    window.visualViewport.addEventListener('scroll', reposition)
  }

  T(() => reveal(opts, scored, sum, effectiveMode, { summaryFirst: false }), maxT + DWELL + 600)
}

// ── Reveal: the final Banana Scorecard ───────────────────────────────────────

function reveal(root_opts: RoamOptions, scored: Scored[], sum: Summary, mode: RoamMode, o: { summaryFirst: boolean }) {
  const opts = root_opts
  // Tear down any roaming characters/HUD (and their reposition listeners) but keep
  // the run alive for the card + navigation teardown.
  if (run) {
    if (run.onScroll) {
      removeEventListener('scroll', run.onScroll)
      removeEventListener('resize', run.onScroll)
    }
    if (run.onVV && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', run.onVV)
      window.visualViewport.removeEventListener('scroll', run.onVV)
    }
    run.onScroll = null
    run.onVV = null
    run.chars.forEach((c) => {
      c.el.remove()
      c.hl.remove()
    })
    run.chars = []
  }
  opts.root.querySelector('.rr-hud')?.remove() // clear the live HUD; the card supersedes it
  const overlay = document.createElement('div')
  overlay.className = 'rr-reveal'
  run?.nodes.push(overlay)
  if (!run) {
    // nonvisual path may have no run wrapper for chars, still mount + track.
    injectStyle(opts.root)
  }

  const nanaBadge = (n: number) => NN(n)
  const groups: Array<{ sev: 1 | 2 | 3; label: string }> = [
    { sev: 3, label: `${NN(3)} Game-breakers` },
    { sev: 2, label: `${NN(2)} Friction` },
    { sev: 1, label: `${NANA} Nits` },
  ]
  let findsHtml = ''
  for (const g of groups) {
    const items = scored.filter((s) => s.banana === g.sev)
    if (!items.length) continue
    findsHtml += `<div class="rr-grp">${g.label} <span class="rr-grp-n">· ${items.length}</span></div>`
    for (const s of items) {
      findsHtml +=
        `<div class="rr-find">` +
        `<span class="rr-find-av" style="background:${opts.safeColor(s.accent)}">${opts.esc((s.initials || s.simName || '?').slice(0, 2))}</span>` +
        `<div class="rr-find-txt"><span class="rr-find-nm">${opts.esc(s.simName || 'Sim')}${s.security ? ' ' + LOCK : ''}</span>${opts.esc(s.observation || '')}</div>` +
        `<span class="rr-find-ban">${nanaBadge(g.sev)}</span>` +
        `</div>`
    }
  }

  const summaryLine = o.summaryFirst || mode === 'nonvisual'
    ? `<div class="rr-summary">${sum.count} issue${sum.count === 1 ? '' : 's'} found · <b>${sum.c3}</b>×${NN(3)} · <b>${sum.c2}</b>×${NN(2)} · <b>${sum.c1}</b>×${NANA}</div>`
    : ''

  overlay.innerHTML = `
    <div class="rr-card">
      <div class="rr-card-hd">
        <span class="rr-kk">${BOLT} AutoSim roast complete</span>
        <div class="rr-modewrap">
          <button class="rr-seg${mode === 'visual' ? ' on' : ''}" data-mode="visual">Visual</button>
          <button class="rr-seg${mode === 'nonvisual' ? ' on' : ''}" data-mode="nonvisual">Non-visual</button>
        </div>
        <h2>${NANA} Banana Scorecard</h2>
        ${summaryLine}
        <div class="rr-score">${sum.total} <em>Bananas</em></div>
        <div class="rr-verdict ${sum.verdictClass}">${sum.verdictLabel}</div>
      </div>
      <div class="rr-finds">${findsHtml || `<div class="rr-empty">Your Sims had nothing to flag. Clean run ${SPARK}</div>`}</div>
      <div class="rr-cta">
        <button class="rr-btn1" data-act="open">Open in Klavity →</button>
        <div class="rr-cta-row">
          <button class="rr-btn2" data-act="replay">${PLAY} Replay roast</button>
          <button class="rr-btn2" data-act="share">Share card</button>
        </div>
        <div class="rr-sharehint" hidden></div>
      </div>
    </div>`
  opts.root.appendChild(overlay)
  // Track the rAF so stopRoam() can cancel it (QA-4: no untracked pending frame).
  const rafId = requestAnimationFrame(() => {
    if (run) run.raf = null
    overlay.classList.add('show')
  })
  if (run) run.raf = rafId

  // Segmented mode toggle — flip + persist + immediately re-render in the new mode.
  overlay.querySelectorAll<HTMLButtonElement>('.rr-seg').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = btn.dataset.mode as RoamMode
      if (m === mode) return
      opts.onSetMode?.(m)
      overlay.remove()
      roamRoast({ ...opts, mode: m })
    })
  })

  overlay.querySelector('[data-act="open"]')!.addEventListener('click', () => {
    try {
      window.open(opts.dashboardUrl, '_blank', 'noopener,noreferrer')
    } catch {
      /* ignore */
    }
  })
  overlay.querySelector('[data-act="replay"]')!.addEventListener('click', () => {
    overlay.remove()
    roamRoast({ ...opts, mode: prefersReduced() ? 'nonvisual' : 'visual' })
  })
  overlay.querySelector('[data-act="share"]')!.addEventListener('click', () => {
    const hint = overlay.querySelector('.rr-sharehint') as HTMLElement
    // GUARDRAIL: the shareable card EXCLUDES security-category findings — only
    // functional / visual / UX findings are exportable (product policy).
    const shareable = scored.filter((s) => !s.security)
    const shareSum = summarize(shareable)
    const excluded = scored.length - shareable.length
    const lines = shareable.map((s) => `${nanaBadge(s.banana)} ${s.simName}: ${s.observation}`)
    const text =
      `${NANA} Banana Scorecard — ${shareSum.total} Bananas (${shareSum.verdictLabel})\n` +
      lines.join('\n') +
      (excluded ? `\n\n(${excluded} security finding${excluded === 1 ? '' : 's'} withheld from share)` : '')
    try {
      void navigator.clipboard?.writeText(text)
    } catch {
      /* ignore */
    }
    hint.hidden = false
    hint.textContent = excluded
      ? `Copied a shareable card — ${excluded} security finding${excluded === 1 ? '' : 's'} withheld.`
      : 'Shareable card copied to clipboard.'
  })
}

// ── Ported CSS (scoped to the shadow root; homepage `.rv`/`.klavity-hl` + mockup)
const ROAM_CSS = `
.rr-rv{position:fixed;display:flex;flex-direction:column;align-items:center;width:46px;z-index:2147483644;pointer-events:none;
  transition:left .95s cubic-bezier(.4,0,.2,1),top .95s cubic-bezier(.4,0,.2,1),opacity .45s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1);will-change:left,top,transform}
/* entrance start-state (removed next frame → fade + rise + scale-in, like the homepage) */
.rr-rv.rr-enter{opacity:0;transform:translateY(20px) scale(.8)}
.rr-rv.spawn .rr-head{animation:rr-bob 1.1s ease-in-out infinite}
@keyframes rr-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.rr-body{position:relative;display:flex;flex-direction:column;align-items:center}
.rr-head{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:12px;color:#fff;
  box-shadow:0 8px 20px rgba(36,29,23,.32),inset 0 0 0 2px rgba(255,255,255,.5);position:relative;z-index:2;font-family:system-ui,-apple-system,sans-serif}
.rr-legs{display:flex;gap:5px;margin-top:2px}
.rr-leg{width:6px;height:14px;border-radius:3px}
.rr-rv.walk .rr-leg:nth-child(1){animation:rr-legA .34s ease-in-out infinite alternate}
.rr-rv.walk .rr-leg:nth-child(2){animation:rr-legB .34s ease-in-out infinite alternate}
@keyframes rr-legA{from{transform:rotate(-24deg)}to{transform:rotate(24deg)}}
@keyframes rr-legB{from{transform:rotate(24deg)}to{transform:rotate(-24deg)}}
.rr-arm{position:absolute;top:10px;right:30px;width:26px;height:6px;border-radius:3px;background:var(--rr-accent,#6366f1);
  transform-origin:right center;transform:rotate(-40deg);opacity:0;transition:opacity .2s}
.rr-rv.point .rr-arm{opacity:1}
.rr-fin{position:absolute;left:-6px;top:-6px;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid var(--rr-accent,#6366f1);transform:rotate(-40deg)}
.rr-rv.aim-down .rr-arm{top:auto;bottom:10px;transform:rotate(40deg)}
.rr-bubble{box-sizing:border-box;position:absolute;bottom:54px;left:50%;transform:translateX(-50%) translateY(8px);width:214px;max-width:calc(100vw - 24px);background:#FBF6EE;
  border:1px solid #EFE9DE;border-radius:14px;padding:11px 13px;box-shadow:0 18px 44px rgba(36,29,23,.24);opacity:0;max-height:46vh;overflow-y:auto;
  transition:opacity .3s,transform .3s;font-size:12.5px;line-height:1.44;color:#2D2A26;pointer-events:none;font-family:system-ui,-apple-system,sans-serif}
.rr-rv.say .rr-bubble{opacity:1;transform:translateX(-50%) translateY(0)}
.rr-bubble::after{content:"";position:absolute;bottom:-7px;left:24px;border:6px solid transparent;border-top-color:#FBF6EE;border-bottom:none}
.rr-rv.b-below .rr-bubble{bottom:auto;top:54px;left:50%;transform:translateX(-50%) translateY(-8px)}
.rr-rv.b-below.say .rr-bubble{transform:translateX(-50%) translateY(0)}
.rr-rv.b-below .rr-bubble::after{bottom:auto;top:-7px;border:6px solid transparent;border-bottom-color:#FBF6EE;border-top:none}
.rr-rv.b-right .rr-bubble{bottom:auto;top:50%;left:54px;transform:translateY(-50%) translateX(-8px)}
.rr-rv.b-right.say .rr-bubble{transform:translateY(-50%) translateX(0)}
.rr-rv.b-right .rr-bubble::after{bottom:auto;top:17px;left:-7px;border:6px solid transparent;border-right-color:#FBF6EE;border-left:none}
.rr-rv.b-left .rr-bubble{bottom:auto;top:50%;left:auto;right:54px;transform:translateY(-50%) translateX(8px)}
.rr-rv.b-left.say .rr-bubble{transform:translateY(-50%) translateX(0)}
.rr-rv.b-left .rr-bubble::after{bottom:auto;top:17px;left:auto;right:-7px;border:6px solid transparent;border-left-color:#FBF6EE;border-right:none}
.rr-tag{font-size:10px;letter-spacing:.02em;margin-bottom:5px;display:flex;align-items:center;gap:6px;color:#6B655C;font-weight:700}
.rr-tav{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:8.5px;font-weight:800}
.rr-lock{margin-left:auto}
.rr-line{color:#2D2A26;overflow-wrap:anywhere}
.rr-cite{margin-top:6px;font-size:11px;color:#8A837A;font-style:italic}
.rr-sev{margin-top:7px;display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px}
.rr-sev.s1{background:#eef1ff;color:#4f46e5}.rr-sev.s2{background:#fdf3e6;color:#b45309}.rr-sev.s3{background:#fdecec;color:#dc2626}
.rr-hl{position:fixed;border:3px solid #6366f1;border-radius:9px;pointer-events:none;z-index:2147483643;opacity:0;
  transition:opacity .3s,left .3s,top .3s,width .3s,height .3s}
.rr-hl.on{opacity:1;animation:rr-halo 2.6s ease-in-out infinite}
@keyframes rr-halo{0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.18)}50%{box-shadow:0 0 0 7px rgba(99,102,241,.05)}}
.rr-hud{position:fixed;top:16px;left:18px;z-index:2147483645;width:210px;background:rgba(255,255,255,.94);
  border:1px solid #EFE9DE;border-radius:16px;box-shadow:0 12px 34px rgba(36,29,23,.14);padding:14px;
  font-family:system-ui,-apple-system,sans-serif;color:#2D2A26}
.rr-hud.shake{animation:rr-shake .5s cubic-bezier(.16,1,.3,1)}
@keyframes rr-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px) rotate(-1deg)}40%{transform:translateX(5px) rotate(1deg)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.rr-hud-cap{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9b9082}
.rr-hud-big{display:flex;align-items:baseline;gap:8px;margin:2px 0 10px}
.rr-hud-total{font-size:38px;font-weight:800;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.rr-hud-em{font-size:24px}
.rr-hud-brk{display:flex;flex-direction:column;gap:6px}
.rr-hud-b{display:flex;align-items:center;gap:8px;font-size:11.5px;color:#6b5f4e}
.rr-hud-b .e{font-size:12px;width:44px}.rr-hud-b .lab{flex:1}.rr-hud-b .c{font-weight:800;color:#2D2A26;font-variant-numeric:tabular-nums}
.rr-hud-live{margin-top:10px;font-size:10px;color:#9b9082;display:flex;align-items:center;gap:6px}
.rr-hud-live .dot{width:7px;height:7px;border-radius:50%;background:#dc2626;animation:rr-blink 1.1s infinite}
@keyframes rr-blink{50%{opacity:.25}}
.rr-reveal{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;background:rgba(36,29,23,.3);opacity:0;transition:opacity .4s;
  font-family:system-ui,-apple-system,sans-serif}
.rr-reveal.show{opacity:1}
.rr-card{width:min(560px,92vw);max-height:90vh;overflow:auto;background:#FBF6EE;border:1px solid #EFE9DE;border-radius:22px;
  box-shadow:0 30px 80px rgba(36,29,23,.4);transform:translateY(20px) scale(.97);transition:transform .5s cubic-bezier(.16,1,.3,1);color:#2D2A26}
.rr-reveal.show .rr-card{transform:none}
.rr-card-hd{padding:20px 24px 16px;text-align:center;border-bottom:1px solid #EFE9DE;position:relative}
.rr-kk{position:absolute;top:14px;left:16px;font-size:10px;font-weight:700;color:#4f46e5;background:#eef1ff;padding:3px 9px;border-radius:999px}
.rr-modewrap{position:absolute;top:12px;right:14px;display:flex;background:#F2ECE2;border-radius:999px;padding:2px}
.rr-seg{border:0;background:transparent;font-size:11px;font-weight:700;padding:5px 11px;border-radius:999px;cursor:pointer;color:#8A837A}
.rr-seg.on{background:#fff;color:#4f46e5;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.rr-card-hd h2{margin:26px 0 4px;font-size:20px;letter-spacing:-.02em}
.rr-summary{font-size:12.5px;color:#6b5f4e;margin-bottom:6px}
.rr-summary b{color:#2D2A26}
.rr-score{font-size:44px;font-weight:800;letter-spacing:-.03em;margin:4px 0}
.rr-score em{font-size:24px;font-style:normal;color:#9b9082}
.rr-verdict{display:inline-flex;align-items:center;gap:8px;font-weight:800;font-size:14px;padding:7px 16px;border-radius:999px}
.rr-verdict.bruised{background:#fdecec;color:#dc2626}.rr-verdict.mid{background:#fdf3e6;color:#b45309}.rr-verdict.golden{background:#e9f7ef;color:#16a34a}
.rr-finds{padding:14px 20px}
.rr-grp{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#6b5f4e;margin:12px 0 8px}
.rr-grp-n{color:#9b9082;font-weight:600}
.rr-find{display:flex;gap:10px;align-items:flex-start;padding:9px 10px;background:#fff;border:1px solid #EFE9DE;border-radius:11px;margin-bottom:7px}
.rr-find-av{width:26px;height:26px;border-radius:50%;flex:none;display:grid;place-items:center;color:#fff;font-weight:800;font-size:10px;margin-top:1px}
.rr-find-txt{flex:1;font-size:12.5px;line-height:1.4;color:#2D2A26}
.rr-find-nm{font-weight:700;font-size:11px;color:#6b5f4e;display:block}
.rr-find-ban{font-size:12px;white-space:nowrap;margin-top:1px}
.rr-empty{padding:18px;text-align:center;color:#6b5f4e;font-size:13px}
.rr-cta{padding:16px 20px 22px;border-top:1px solid #EFE9DE}
.rr-btn1{width:100%;border:0;border-radius:12px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;padding:13px;font-weight:800;
  font-size:14.5px;cursor:pointer;box-shadow:0 8px 22px rgba(99,102,241,.35);transition:transform .15s}
.rr-btn1:hover{transform:translateY(-1px)}.rr-btn1:active{transform:scale(.98)}
.rr-cta-row{display:flex;gap:8px;margin-top:10px}
.rr-btn2{flex:1;border:1px solid #EFE9DE;background:#fff;border-radius:10px;padding:10px;font-weight:700;font-size:12.5px;cursor:pointer;color:#2D2A26;transition:transform .15s,border-color .15s}
.rr-btn2:hover{transform:translateY(-1px);border-color:#6366f1}.rr-btn2:active{transform:scale(.97)}
.rr-sharehint{margin-top:10px;font-size:11.5px;color:#16a34a;text-align:center}
@media (prefers-reduced-motion: reduce){.rr-rv,.rr-hl,.rr-reveal,.rr-card{transition:none}.rr-hud-live .dot{animation:none}}
`
