// packages/sdk/src/sims-watch.ts
// Live Sims change-detection and watch engine.
//
// Observes three signals on the current page:
//   1. Scroll (debounced ~700ms) — user explored a new viewport region
//   2. Navigation (history pushState/replaceState + popstate + hashchange) — SPA route changed
//   3. Significant DOM mutation (MutationObserver, debounced ~800ms) — a panel/dialog/
//      major content block appeared (e.g. chatbot sidebar, modal, article swap)
//
// On each meaningful change: computes a lightweight viewport hash, skips if recently reviewed
// or hash unchanged (THROTTLE), captures the viewport, POSTs to /api/sim/review, and for
// each returned Sim review calls window.KlavitySims?.renderFeedback(...) (Dev 2's UI layer).
//
// COST GUARDS (continuous AI calls cost money):
//   minIntervalMs (default 30s) — hard floor between successive /api/sim/review calls
//   seenHashes Set — skip when the viewport fingerprint matches a hash already reviewed
//   mutationEpoch — bumped on each significant mutation batch so in-place content swaps
//     (same URL / docHeight) always produce a fresh hash and aren't wrongly skipped
//   MUTATION CAP — a live-mutating page (streaming chat, live sidebar) can fire
//     "significant" mutations forever. hasSignificantMutations() now ignores the Sims'
//     own overlay nodes + streaming/small nodes (raised geometry bar), and after
//     MAX_MUTATION_REVIEWS_NO_NEW (=3) mutation reviews at the same pathname with no
//     NEW findings we stop scheduling further mutation reviews for that URL until a
//     navigation or user scroll resets the cap. (Fixes the live-Sims re-analyze loop.)
//   busy flag — blocks concurrent calls while a review is in flight
//   capture timeout (10s) — prevents a hung captureViewport() from locking busy=true
//
// Pure helpers (djb2, computeContentHash, shouldSkipReview, isSignificantNode,
// hasSignificantMutations) are exported for unit testing; DOM wiring is a thin shim.

// ── Pure helpers (unit-tested) ─────────────────────────────────────────────────────────────

/** DJB2 hash over a string — fast, stable, no dependencies. Returns unsigned 32-bit int. */
export function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0
  }
  return h >>> 0
}

/**
 * Normalize a finding's text for dedup (trim / lowercase / collapse whitespace).
 * Mirrors the client-side dedup in sims-live.ts so the watch engine's "new
 * finding?" decision matches what the UI actually renders.
 */
export function normalizeFindingText(text: string): string {
  return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Lightweight fingerprint of the current viewport state. Used both client-side (seenHashes
 * dedup) and as the `domSig` sent to the server for per-Sim deduplication.
 *
 * scrollY is bucketed to 50px so minor scroll drift (sticky-header collapse, etc.) doesn't
 * produce a new hash — only a genuinely different viewport area does.
 *
 * epoch is incremented by the mutation observer each time significant new content is added.
 * Including it in the hash guarantees that in-place content swaps (same URL/docHeight/scroll
 * but new DOM subtree) are never wrongly skipped by the seenHashes check.
 */
export function computeContentHash(
  scrollY: number,
  docHeight: number,
  viewportW: number,
  viewportH: number,
  title: string,
  urlPath: string,
  epoch = 0,
): string {
  const bucket = Math.round(scrollY / 50) * 50
  return djb2(
    `${bucket}:${docHeight}:${viewportW}x${viewportH}:${urlPath}:${title.slice(0, 80)}:e${epoch}`,
  ).toString(36)
}

/**
 * Returns true when a review should be skipped because:
 *   – less than minIntervalMs has elapsed since the last review (throttle), OR
 *   – this exact hash was already reviewed this session (content unchanged).
 * Both checks are independent — the throttle protects against rapid bursts even when the
 * hash is fresh, and the seenHash check blocks revisiting identical viewport states after the
 * throttle window has passed.
 */
export function shouldSkipReview(
  hash: string,
  seenHashes: ReadonlySet<string>,
  lastReviewAt: number,
  nowMs: number,
  minIntervalMs: number,
): boolean {
  if (nowMs - lastReviewAt < minIntervalMs) return true
  return seenHashes.has(hash)
}

// The Sims' own dock / overlay / walker / marker nodes are injected into the page
// as it works. Their mutations must NEVER count as page changes or the engine
// would re-review itself in a loop.
const OWN_OVERLAY_IDS = new Set(['klav-sims-live', 'klav-sims-overlay', 'klavity-widget-host'])
const OWN_OVERLAY_CLASSES = ['klav-halo', 'klav-pin', 'klav-pin-marker', 'klav-walker', 'ksl-bubble', 'ksl-slot', 'ksl-review-status']

/** True when an element is (or sits inside) one of the Sims' own injected overlay/dock nodes. */
export function isOwnOverlayNode(el: Element): boolean {
  if (!el) return false
  let cur: Element | null = el
  let hops = 0
  while (cur && hops < 8) {
    const id = (cur as HTMLElement).id
    if (id && OWN_OVERLAY_IDS.has(id)) return true
    const cls = cur.className
    if (typeof cls === 'string' && cls) {
      for (const c of OWN_OVERLAY_CLASSES) if (cls.includes(c)) return true
    }
    cur = (cur as HTMLElement).parentElement ?? null
    hops++
  }
  return false
}

/**
 * True when an added DOM node qualifies as "significant new content":
 *   – a semantic landmark with role=dialog/main/complementary
 *   – a class matching a strong container pattern (modal/dialog/drawer/panel/
 *     sidebar/overlay/sheet)
 *   – a LARGE visible footprint (≥ 220 × 180 px — a genuine panel/dialog/content
 *     block, not a chat line, toast, or typing indicator)
 * Ignores metadata nodes (script/style/meta/link), the Sims' own overlay nodes,
 * and small/streaming elements.
 *
 * The class list here is intentionally NARROW: "message"/"feed"/"article"/"toast"/
 * "notification"/"chat"/"alert"/"log" were dropped because a streaming chat app
 * fires those on every token — exactly the loop we're fixing. Only container-level
 * chrome counts by class; everything else must clear the large-geometry bar.
 */
export function isSignificantNode(el: Element): boolean {
  const tag = el.tagName?.toUpperCase() ?? ''
  if (['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'NOSCRIPT'].includes(tag)) return false

  // Never treat our own dock/overlay mutations as page content.
  if (isOwnOverlayNode(el)) return false

  const role = el.getAttribute?.('role') ?? ''
  if (['dialog', 'main', 'complementary'].includes(role)) return true

  const cls = el.className
  if (typeof cls === 'string' && cls) {
    if (/(modal|dialog|drawer|panel|sidebar|overlay|sheet)/i.test(cls)) return true
  }

  // Geometry fallback — only a genuinely LARGE visible rectangle is significant.
  // Raised from 100×100 to 220×180 so a chat bubble / typing indicator / small
  // card streaming in does not qualify as a structural page change.
  if (typeof (el as HTMLElement).getBoundingClientRect === 'function') {
    const r = (el as HTMLElement).getBoundingClientRect()
    return r.width >= 220 && r.height >= 180
  }
  const h = (el as HTMLElement).offsetHeight ?? 0
  const w = (el as HTMLElement).offsetWidth ?? 0
  return h >= 180 && w >= 220
}

// Minimum count of significant added element nodes required to treat a mutation
// batch as a real page change. Kept at 1 (a single true panel/dialog is enough),
// but the raised isSignificantNode threshold + own-overlay filter above are what
// stop streaming chat mutations from ever reaching this counter.
const MIN_SIGNIFICANT_ADDED = 1

/**
 * Returns true when a MutationObserver batch contains a genuine structural
 * addition worth re-reviewing. Attribute-only mutations, character-data (text
 * streaming), tiny/streaming nodes, and the Sims' own overlay mutations are all
 * ignored. Requires at least MIN_SIGNIFICANT_ADDED significant added element nodes.
 */
export function hasSignificantMutations(mutations: MutationRecord[]): boolean {
  let significant = 0
  for (const m of mutations) {
    if (m.type !== 'childList') continue
    for (const node of Array.from(m.addedNodes)) {
      if (node.nodeType === 1 /* ELEMENT_NODE */ && isSignificantNode(node as Element)) {
        significant++
        if (significant >= MIN_SIGNIFICANT_ADDED) return true
      }
    }
  }
  return false
}

// ── DOM wiring (thin shim — manual-verify in browser) ─────────────────────────────────────

const DEFAULT_MIN_INTERVAL_MS = 30_000   // 30s between AI review calls
const DEFAULT_SCROLL_DEBOUNCE_MS = 700
const DEFAULT_MUTATION_DEBOUNCE_MS = 800
const MAX_SEEN_HASHES = 200              // cap the client-side dedup set (memory guard)
const CAPTURE_TIMEOUT_MS = 10_000       // abort a hung captureViewport() after 10s
const REVIEW_FETCH_TIMEOUT_MS = 45_000   // abort a stalled /api/sim/review before busy stays true

// Safety cap on mutation-triggered reviews for a live-mutating page.
//
// A constantly-changing app (streaming chat, live sidebar) can fire "significant"
// mutations indefinitely. To stop unbounded AI spend we count consecutive
// mutation-triggered reviews at the SAME location.pathname that yield NO new
// findings (findings whose normalized text we haven't already returned). Once we
// hit MAX_MUTATION_REVIEWS_NO_NEW at a pathname, we stop SCHEDULING further
// mutation reviews for that URL until a navigation or user scroll resets it.
// Navigation and scroll triggers are never capped.
const MAX_MUTATION_REVIEWS_NO_NEW = 3

type TriggerKind = 'scroll' | 'navigation' | 'mutation'

const benchNow = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()
const benchMs = (n: number): number => Math.round(n)
function reactionNodeCount(): number {
  if (typeof document === 'undefined') return 0
  const dockHost = document.getElementById('klav-sims-live')
  const shadowCount = dockHost?.shadowRoot?.querySelectorAll('.ksl-slot,.ksl-bubble').length ?? 0
  return shadowCount + document.querySelectorAll('#klav-sims-overlay,.klav-halo,.klav-pin,.klav-pin-marker,.klav-walker').length
}

export interface SimsWatchOptions {
  /** Base URL of the Klavity backend, e.g. "https://klavity.in". */
  backendUrl: string
  /** Project to attribute Sim reviews to. Required for adhoc mode. */
  projectId: string
  /** Restrict to specific Sim IDs. Omit to target all project Sims. */
  simIds?: string[]
  /**
   * Viewport capture function — injected for widget/extension parity.
   * Widget: `() => safeToPng(document.body, { skipFonts: true })`
   * Extension: `() => captureVisibleTab()`
   */
  captureViewport: () => Promise<string>
  /** Bearer token for Klavity API auth (widget session token or account token). */
  bearerToken?: string
  /** Minimum gap between successive review API calls in ms. Default 30 000. */
  minIntervalMs?: number
  /** Scroll debounce delay in ms. Default 700. */
  scrollDebounceMs?: number
  /** DOM mutation debounce delay in ms. Default 800. */
  mutationDebounceMs?: number
}

export interface SimsWatchController {
  /** Tear down all listeners, timers, observers, and abort any in-flight request. */
  stop: () => void
}

/**
 * Start the Live Sims change-detection engine.
 *
 * Wires scroll, navigation (pushState/replaceState/popstate/hashchange), and MutationObserver
 * signals; debounces and throttles each to avoid flooding the AI; then drives the
 * capture → /api/sim/review → window.KlavitySims.renderFeedback pipeline.
 *
 * Returns a controller with `stop()` that removes all listeners, restores patched history
 * methods, disconnects the observer, and aborts any in-flight fetch.
 */
export function startSimsWatch(opts: SimsWatchOptions): SimsWatchController {
  const minInterval = opts.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS
  const scrollDebounce = opts.scrollDebounceMs ?? DEFAULT_SCROLL_DEBOUNCE_MS
  const mutationDebounce = opts.mutationDebounceMs ?? DEFAULT_MUTATION_DEBOUNCE_MS

  let stopped = false
  let busy = false
  // lastReviewAt=0 means "never reviewed"; Date.now() >> minInterval so the first trigger runs.
  let lastReviewAt = 0
  const seenHashes = new Set<string>()
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  // Incremented on each significant mutation batch so in-place DOM swaps produce a fresh hash.
  let mutationEpoch = 0
  // AbortController for the current in-flight fetch; aborted by stop().
  let fetchAbort: AbortController | null = null

  // ── Mutation-review cap state (fixes the live-page re-analyze loop) ─────────────────────────
  // Normalized text of every finding we've already surfaced this session — lets the watch
  // engine decide whether a mutation review produced anything NEW.
  const seenFindingText = new Set<string>()
  // The pathname the mutation-review counter currently applies to.
  let mutationCapPath = ''
  // Consecutive mutation reviews at mutationCapPath that returned no NEW findings.
  let mutationNoNewCount = 0

  function currentPathname(): string {
    return typeof location !== 'undefined' ? location.pathname : ''
  }

  /** Reset the mutation-review cap — called on real navigation and user scroll. */
  function resetMutationCap(): void {
    mutationCapPath = currentPathname()
    mutationNoNewCount = 0
  }

  /** True when mutation-triggered reviews are capped for the current pathname. */
  function mutationCapReached(): boolean {
    return mutationCapPath === currentPathname() && mutationNoNewCount >= MAX_MUTATION_REVIEWS_NO_NEW
  }

  /**
   * Record the outcome of a mutation-triggered review at the given pathname.
   * Increments the no-new counter when the review surfaced 0 new findings; resets
   * it (to give the page fresh budget) whenever at least one NEW finding appeared.
   */
  function recordMutationOutcome(path: string, newFindings: number): void {
    if (mutationCapPath !== path) {
      // Pathname changed since this review was scheduled — start a fresh count.
      mutationCapPath = path
      mutationNoNewCount = 0
    }
    if (newFindings > 0) mutationNoNewCount = 0
    else mutationNoNewCount += 1
  }

  // ── Core review pipeline ─────────────────────────────────────────────────────────────────
  async function runReview(trigger: TriggerKind): Promise<void> {
    if (stopped || busy) return
    // Cap: stop unbounded mutation-triggered reviews on a live-mutating page once
    // we've had MAX_MUTATION_REVIEWS_NO_NEW at this pathname with nothing new.
    // Navigation/scroll are never capped and reset the counter (see resetMutationCap).
    if (trigger === 'mutation' && mutationCapReached()) return

    const scrollY = typeof window !== 'undefined' ? (window.scrollY ?? 0) : 0
    const docHeight = typeof document !== 'undefined'
      ? Math.max(
          document.documentElement?.scrollHeight ?? 0,
          document.body?.scrollHeight ?? 0,
        )
      : 0
    const viewportW = typeof window !== 'undefined' ? (window.innerWidth ?? 0) : 0
    const viewportH = typeof window !== 'undefined' ? (window.innerHeight ?? 0) : 0
    const title = typeof document !== 'undefined' ? (document.title ?? '') : ''
    const urlPath = typeof location !== 'undefined' ? location.pathname + location.search + location.hash : ''

    // Pathname captured at review start — used by the mutation cap so a review that
    // finishes after a navigation is still attributed to the URL it was scheduled for.
    const reviewPath = currentPathname()

    // Mutation triggers include the current epoch in the hash so a content swap at the same
    // scroll position / URL always produces a fresh hash and isn't wrongly skipped.
    const epoch = trigger === 'mutation' ? mutationEpoch : 0
    const hash = computeContentHash(scrollY, docHeight, viewportW, viewportH, title, urlPath, epoch)

    if (shouldSkipReview(hash, seenHashes, lastReviewAt, Date.now(), minInterval)) return

    busy = true
    lastReviewAt = Date.now()
    let fetchTimedOut = false
    // Optimistically mark seen — un-marked on capture / network error so the next change retries.
    seenHashes.add(hash)
    if (seenHashes.size > MAX_SEEN_HASHES) {
      const oldest = seenHashes.values().next().value
      if (oldest !== undefined) seenHashes.delete(oldest)
    }

    try {
      const benchStart = benchNow()
      const captureStart = benchNow()
      const targetViewport = typeof window !== 'undefined'
        ? { scrollX: window.scrollX || 0, scrollY: window.scrollY || 0, width: window.innerWidth || 1, height: window.innerHeight || 1 }
        : null
      // Race captureViewport against a timeout so a hung capture never locks busy=true.
      const screenshotDataUrl = await Promise.race([
        opts.captureViewport(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('sims-watch: capture timeout')), CAPTURE_TIMEOUT_MS),
        ),
      ])
      const captureMs = benchNow() - captureStart
      if (stopped) { busy = false; return }

      const ac = new AbortController()
      fetchAbort = ac
      const fetchTimer = setTimeout(() => { fetchTimedOut = true; ac.abort() }, REVIEW_FETCH_TIMEOUT_MS)

      const body: Record<string, unknown> = {
        url: typeof location !== 'undefined' ? location.href : '',
        screenshotDataUrl,
        domSig: hash,
        adhoc: true,
        projectId: opts.projectId,
      }
      if (opts.simIds?.length) body.simIds = opts.simIds

      const headers: Record<string, string> = { 'content-type': 'application/json' }
      if (opts.bearerToken) headers['authorization'] = `Bearer ${opts.bearerToken}`

      const networkStart = benchNow()
      let res: Response
      try {
        res = await fetch(`${opts.backendUrl}/api/sim/review`, {
          method: 'POST',
          headers,
          credentials: 'include',
          signal: ac.signal,
          body: JSON.stringify(body),
        })
      } finally {
        clearTimeout(fetchTimer)
        fetchAbort = null
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: {
        ok: boolean
        reviews?: Array<{ simId: string; simName: string; initials?: string; accent?: string; observations: unknown[] }>
        timing?: { simReview?: { totalMs?: number; receiveToReviewDoneMs?: number; reviewMs?: number } }
      } = await res.json()
      const networkMs = benchNow() - networkStart
      if (!data?.ok || !Array.isArray(data.reviews)) { busy = false; return }

      // Deliver each Sim review to the presence UI layer (sims-live.ts / window.KlavitySims).
      const kl = typeof window !== 'undefined' ? (window as any).KlavitySims : null
      const renderStart = benchNow()
      let observations = 0
      // Count findings whose normalized text we've never returned before — the cap
      // uses this to decide whether a mutation review is producing anything NEW.
      let newFindings = 0
      for (const review of data.reviews) {
        if (!review?.simId) continue
        const rawObs: unknown[] = Array.isArray(review.observations) ? review.observations : []
        // Server SimObservation uses .observation for text; sims-live.ts LiveObservation expects .text.
        const liveObs = rawObs.map((r: any) => ({
          text: r.observation ?? r.text ?? '',
          sentiment: r.sentiment,
          priority: r.priority,
          region: r.region,
          suggestedBug: r.suggestedBug,
          targetViewport,
        }))
        observations += liveObs.length
        for (const o of liveObs) {
          const key = `${review.simId}::${normalizeFindingText(o.text)}`
          if (o.text && !seenFindingText.has(key)) { seenFindingText.add(key); newFindings++ }
        }
        try {
          kl?.renderFeedback?.(review.simId, review.simName ?? '', liveObs)
        } catch { /* UI errors must never break the watch loop */ }
      }
      // Update the mutation cap counter for this pathname (only mutation triggers count).
      if (trigger === 'mutation') recordMutationOutcome(reviewPath, newFindings)
      const renderMs = benchNow() - renderStart
      const totalMs = benchNow() - benchStart
      const server = data.timing?.simReview
      const domNodes = reactionNodeCount()
      console.log(
        `[bench-sim-review] client trigger=${trigger} captureMs=${benchMs(captureMs)} networkMs=${benchMs(networkMs)} ` +
        `serverTotalMs=${server?.totalMs ?? '?'} serverReceiveToReviewDoneMs=${server?.receiveToReviewDoneMs ?? '?'} ` +
        `serverReviewMs=${server?.reviewMs ?? '?'} renderMs=${benchMs(renderMs)} totalMs=${benchMs(totalMs)} ` +
        `sims=${data.reviews.length} observations=${observations} domNodes=${domNodes}`,
      )
    } catch (e) {
      // AbortError without our timeout flag = intentional teardown via stop(); don't retry or log.
      if (e instanceof Error && e.name === 'AbortError' && !fetchTimedOut) { busy = false; return }
      // Capture timeout, review timeout, or network error — un-mark the hash so the next signal can retry.
      seenHashes.delete(hash)
    } finally {
      busy = false
    }
  }

  // ── Shared debounce ──────────────────────────────────────────────────────────────────────
  // A single timer shared across all signal types. Any new signal resets it.
  // Navigation signals use delayMs=0 to preempt a pending scroll/mutation timer.
  function schedule(trigger: TriggerKind, delayMs: number): void {
    if (stopped) return
    // Navigation and user scroll are legitimate "look again" signals — they reset
    // the mutation-review cap so a real route change or a new viewport gets fresh
    // review budget even after a live-mutating page exhausted its mutation cap.
    if (trigger === 'navigation' || trigger === 'scroll') resetMutationCap()
    if (debounceTimer !== null) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      void runReview(trigger)
    }, delayMs)
  }

  // ── Scroll listener ──────────────────────────────────────────────────────────────────────
  const onScroll = (): void => schedule('scroll', scrollDebounce)

  // ── MutationObserver ─────────────────────────────────────────────────────────────────────
  let observer: MutationObserver | null = null
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined' && document.body) {
    observer = new MutationObserver((mutations) => {
      if (hasSignificantMutations(mutations)) {
        mutationEpoch++  // bump epoch so in-place swaps produce a fresh hash
        schedule('mutation', mutationDebounce)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  // ── Navigation: pushState / replaceState / popstate / hashchange ─────────────────────────
  // pushState and replaceState don't fire native events so we wrap them.
  // hashchange covers #fragment SPA routers that don't use the History API.
  type HistoryMethod = typeof history.pushState
  const origPush: HistoryMethod = typeof history !== 'undefined'
    ? history.pushState.bind(history)
    : (() => {}) as unknown as HistoryMethod
  const origReplace: HistoryMethod = typeof history !== 'undefined'
    ? history.replaceState.bind(history)
    : (() => {}) as unknown as HistoryMethod

  if (typeof history !== 'undefined') {
    history.pushState = function (state: unknown, unused: string, url?: string | URL | null) {
      origPush(state, unused, url)
      schedule('navigation', 0)
    }
    history.replaceState = function (state: unknown, unused: string, url?: string | URL | null) {
      origReplace(state, unused, url)
      schedule('navigation', 0)
    }
  }

  const onPopState = (): void => schedule('navigation', 0)
  const onHashChange = (): void => schedule('navigation', 0)

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)
  }

  // ── Stop / full teardown ─────────────────────────────────────────────────────────────────
  function stop(): void {
    if (stopped) return
    stopped = true
    // Cancel any pending debounce timer.
    if (debounceTimer !== null) { clearTimeout(debounceTimer); debounceTimer = null }
    // Abort any in-flight fetch request immediately.
    fetchAbort?.abort()
    fetchAbort = null
    // Disconnect the mutation observer.
    observer?.disconnect()
    observer = null
    // Remove all window event listeners.
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
    }
    // Restore patched history methods.
    if (typeof history !== 'undefined') {
      history.pushState = origPush
      history.replaceState = origReplace
    }
    // Release memory + reset dedup/cap state so a fresh start begins clean.
    seenHashes.clear()
    seenFindingText.clear()
    mutationCapPath = ''
    mutationNoNewCount = 0
  }

  return { stop }
}
