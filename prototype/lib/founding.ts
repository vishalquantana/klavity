// ── KLAVITYKLA-366 — the Founding Ten spot counter ─────────────────────────────────────────────
//
// The offer (KLAVITYKLA-379 is canonical on price — do NOT change numbers here):
//   Standard Team  $249/mo · $2,490/yr   ← the ANCHOR the pricing page must keep visible
//   Founding Ten   $490/yr, annual only, LOCKED FOR LIFE, Team limits with a DAILY AutoSim cadence
//
// THE HARD RULE, in the founder's words: "a stale honest number beats an animated lie."
// Everything in this file exists to keep that true:
//   • the count comes from our OWN DB (accounts.plan = 'founding'), which IS the entitlement
//     source of truth — not from Stripe, which we do not want to hit per pageview;
//   • it is cached with a short TTL so a marketing pageview costs no DB round trip;
//   • when the count cannot be determined we return `taken: null` and every caller degrades to
//     showing the offer WITHOUT a number. We never guess, never animate a countdown, never
//     invent scarcity, and never render "undefined"/"NaN" at a visitor.
//
// The same shape drives BOTH the public pricing band and the in-app dashboard ribbon, so the app
// can never keep promoting an offer the website has closed.

/** Ten seats. Not a config knob — the offer is literally named after the number. */
export const FOUNDING_TOTAL_SPOTS = 10

export type FoundingSpots = {
  /** Always FOUNDING_TOTAL_SPOTS. */
  total: number
  /** How many founding accounts exist, or null when the count could not be determined. */
  taken: number | null
  /** total - taken, floored at 0; null when unknown. */
  remaining: number | null
  /** True ONLY when we positively know all spots are gone. Unknown is never "sold out". */
  soldOut: boolean
  /** False when the count is unavailable — callers must then omit the number entirely. */
  known: boolean
}

/**
 * Turn a raw taken-count into the display/enforcement shape.
 *
 * Defensive on input because the value ultimately comes from a SQL COUNT that a driver could hand
 * back as a string, a null, or (on a bad day) NaN. Anything that is not a finite non-negative
 * number is treated as UNKNOWN rather than coerced to 0 — coercing to 0 would advertise "10 spots
 * left" during a DB outage, which is exactly the animated lie we refuse to tell.
 */
export function computeFoundingSpots(taken: number | null | undefined): FoundingSpots {
  const n = typeof taken === "number" && Number.isFinite(taken) && taken >= 0 ? Math.floor(taken) : null
  if (n === null) {
    return { total: FOUNDING_TOTAL_SPOTS, taken: null, remaining: null, soldOut: false, known: false }
  }
  const remaining = Math.max(0, FOUNDING_TOTAL_SPOTS - n)
  return { total: FOUNDING_TOTAL_SPOTS, taken: n, remaining, soldOut: remaining === 0, known: true }
}

/**
 * The honest one-liner for the pricing band / dashboard ribbon.
 *
 * Returns "" when the count is unknown — callers render nothing rather than a placeholder or a
 * spinner. An empty string is a valid, complete UI state here: the offer still stands, we just
 * aren't quoting a number we can't stand behind.
 */
export function foundingSpotsLabel(s: FoundingSpots): string {
  if (!s.known || s.remaining === null) return ""
  if (s.remaining === 0) return `All ${s.total} spots taken`
  if (s.remaining === 1) return `Last spot — 1 of ${s.total} left`
  return `${s.remaining} of ${s.total} spots left`
}

/** The ribbon/eyebrow text above the band. Falls back to the timeless line when count is unknown. */
export function foundingRibbonLabel(s: FoundingSpots): string {
  if (s.soldOut) return "The Founding Ten is closed"
  return foundingSpotsLabel(s) || "Ten teams, then it closes"
}

/**
 * The state token the HTML keys its CSS off. Only two values, because the page must be renderable
 * with NO number at all: "soldout" hides the founding CTA and promotes the standard price; "open"
 * shows the offer (with the number if we have one, without it if we don't).
 */
export function foundingStateToken(s: FoundingSpots): "open" | "soldout" {
  return s.soldOut ? "soldout" : "open"
}

// ── Cached read ────────────────────────────────────────────────────────────────────────────────
// One 60s-TTL cache shared by the pricing page and the dashboard. Deliberately module-level: the
// number changes ten times, ever, and a visitor seeing a ≤60s-old count is precisely the "stale
// honest number" the founder asked for.

export const FOUNDING_SPOTS_TTL_MS = 60_000

type CacheSlot = { value: FoundingSpots; at: number }
let _cache: CacheSlot | null = null

/** Test seam — drop the memo so a test can observe a fresh read. */
export function resetFoundingSpotsCache(): void {
  _cache = null
}

/**
 * Read the spot count, memoised for FOUNDING_SPOTS_TTL_MS.
 *
 * On a counter error we keep serving the LAST KNOWN value if we have one (stale but honest), and
 * only fall back to "unknown" when we have never had a good read. We do NOT re-arm the TTL on a
 * failure, so the next request retries instead of pinning a stale value for a full minute.
 */
export async function getFoundingSpots(
  countFounding: () => Promise<number>,
  now: number = Date.now(),
): Promise<FoundingSpots> {
  if (_cache && now - _cache.at < FOUNDING_SPOTS_TTL_MS) return _cache.value
  try {
    const value = computeFoundingSpots(await countFounding())
    if (!value.known) {
      // Counter returned something unusable. Prefer the previous good read over a blank.
      return _cache ? _cache.value : value
    }
    _cache = { value, at: now }
    return value
  } catch {
    return _cache ? _cache.value : computeFoundingSpots(null)
  }
}

// ── Server-side enforcement ────────────────────────────────────────────────────────────────────

export type FoundingCheckoutDecision = { allowed: true } | { allowed: false; status: number; error: string }

/**
 * Gate a founding checkout attempt. A visual-only limit is a promise we can't keep: someone could
 * deep-link /api/billing/checkout as spot 11 and we would owe them a locked-for-life price we had
 * publicly closed. So the count is re-checked at the moment of purchase.
 *
 * Three deliberate decisions:
 *  1. An account that is ALREADY on `founding` is never blocked — it is one of the ten, and this
 *     path is how it re-enters checkout after a failed card. Blocking it would strand a founder.
 *  2. `taken === null` (count unavailable) FAILS CLOSED. Everywhere else in this feature unknown
 *     degrades gracefully, but here the downside is asymmetric: selling an 11th lifetime-locked
 *     seat is unwindable only by breaking a public promise, whereas a refused checkout is a retry.
 *     If the DB is unreachable we could not record the subscription anyway.
 *  3. The refusal is a plain 409 with copy a human can act on, not a generic 400.
 */
export function decideFoundingCheckout(opts: {
  taken: number | null
  currentPlan?: string | null
}): FoundingCheckoutDecision {
  if (String(opts.currentPlan || "") === "founding") return { allowed: true }
  const s = computeFoundingSpots(opts.taken)
  if (!s.known) {
    return {
      allowed: false,
      status: 503,
      error: "We can't confirm how many Founding Ten spots are left right now. Please try again in a minute — we won't sell a spot we can't verify.",
    }
  }
  if (s.soldOut) {
    return {
      allowed: false,
      status: 409,
      error: `The Founding Ten is closed — all ${s.total} spots are taken. The Team plan ($249/mo, $2,490/yr) has the same limits with hourly flow runs.`,
    }
  }
  return { allowed: true }
}
