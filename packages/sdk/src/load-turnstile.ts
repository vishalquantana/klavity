// JTBD 1.7 — LAZY-LOAD Cloudflare Turnstile for the embeddable widget.
//
// Dropping the required-email gate on the default (anonymous) report path removes the accidental
// spam-shield that field provided. Turnstile replaces it: when the project's config carries a public
// site key, the widget renders an invisible/managed Turnstile challenge and forwards the resulting
// token with the submit. The server verifies it (see lib/turnstile.ts) before accepting an anonymous
// cross-origin report.
//
// We inject Cloudflare's official API script lazily (only when a site key is present) so a project
// WITHOUT Turnstile pays zero payload cost. resolveTurnstileUrl is pure + unit-tested;
// injectTurnstileScript is a thin DOM/network shim.

/** The API surface Cloudflare's script exposes on window.turnstile. */
export interface TurnstileGlobal {
  render?: (el: HTMLElement, opts: any) => string
  remove?: (id: string) => void
  reset?: (id?: string) => void
}

/** Cloudflare's official (fixed) Turnstile API endpoint. Not customer-controllable → no SSRF surface. */
export function resolveTurnstileUrl(): string {
  return "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
}

let _loadPromise: Promise<TurnstileGlobal | null> | null = null

/**
 * Inject the Turnstile API <script> once (cached promise) and resolve with window.turnstile once it
 * loads. Resolves null on any failure so callers degrade gracefully — a Turnstile-script failure must
 * never break the widget (the server still bounds abuse via rate limits, and fail-open there keeps
 * submits working). Safe to call before DOM is ready.
 */
export function injectTurnstileScript(): Promise<TurnstileGlobal | null> {
  if (_loadPromise) return _loadPromise
  _loadPromise = new Promise<TurnstileGlobal | null>((resolve) => {
    try {
      const w = window as any
      if (w.turnstile && typeof w.turnstile.render === "function") { resolve(w.turnstile as TurnstileGlobal); return }
      const s = document.createElement("script")
      s.src = resolveTurnstileUrl()
      s.async = true
      s.defer = true
      s.onload = () => {
        const g = (window as any).turnstile
        resolve(g && typeof g.render === "function" ? (g as TurnstileGlobal) : null)
      }
      s.onerror = () => resolve(null)
      ;(document.head || document.documentElement).appendChild(s)
    } catch {
      resolve(null)
    }
  })
  return _loadPromise
}

/**
 * Execute a Turnstile challenge and resolve with a fresh token, or null on any failure/timeout. Renders
 * an invisible/managed widget into a detached, off-screen container (Turnstile requires an in-DOM host
 * element), waits for the callback, then cleans up. Fail-safe: resolves null (never rejects) so the
 * caller can decide how to proceed — on the anonymous path the server fail-opens when it can't verify,
 * so a null token doesn't hard-block a legitimate user.
 */
export async function getTurnstileToken(siteKey: string, timeoutMs = 8000): Promise<string | null> {
  if (!siteKey) return null
  const ts = await injectTurnstileScript()
  if (!ts || typeof ts.render !== "function") return null
  return new Promise<string | null>((resolve) => {
    let settled = false
    let widgetId: string | null = null
    const holder = document.createElement("div")
    // Off-screen (not display:none — some challenge modes need a laid-out box) + tiny so nothing shows
    // for the invisible/managed flow. If a project uses an interactive key, Turnstile pops its own modal.
    holder.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;"
    document.body.appendChild(holder)
    const done = (token: string | null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { if (widgetId != null && ts.remove) ts.remove(widgetId) } catch { /* ignore */ }
      try { holder.remove() } catch { /* ignore */ }
      resolve(token)
    }
    const timer = setTimeout(() => done(null), timeoutMs)
    try {
      widgetId = ts.render!(holder, {
        sitekey: siteKey,
        callback: (token: string) => done(token || null),
        "error-callback": () => done(null),
        "timeout-callback": () => done(null),
      })
    } catch {
      done(null)
    }
  })
}

/** Test-only: reset the cached load promise so each test starts clean. */
export function __resetTurnstileLoaderForTests(): void {
  _loadPromise = null
}
