// sim-walk — the /bug-check "Sim walk-through": turn one pasted URL into a watchable scene where
// 2-4 named Sims walk the prospect's own page and react out loud.
//
// WHY THIS EXISTS
// The free Bug Check used to be a static HTML scan: fetch, one LLM call, print a list. Accurate but
// inert — and it made the page's headline claim ("Klavity's AI users walk it like real customers")
// untrue. This module is the seam that makes the claim true: the SAME persona inference and the
// SAME vision reaction pipeline the product runs for paying customers, pointed at an anonymous
// prospect's URL, and shaped into an ordered timeline the browser can play back over a full-page
// screenshot.
//
// WHY A SCREENSHOT AND NOT THE REAL PAGE
// We cannot inject anything into someone else's site. So the walk is rendered over a full-page JPEG
// we captured ourselves: the image scroll-animates, and each Sim's speech bubble is anchored to the
// normalised region the vision model attached to that reaction. Same capture feeds the model and
// the display — otherwise the regions would be normalised against a different image than the one on
// screen and every bubble would point at the wrong thing.
//
// Everything here is PURE (no network, no LLM, no DB) so the ordering, anchoring, and degraded
// paths are unit-testable without burning a model call. The server owns I/O; this owns shape.

/** A persona as returned by the site-persona inference step. All fields are model-supplied. */
export interface WalkPersonaInput {
  name?: unknown
  role?: unknown
  initials?: unknown
  accent?: unknown
  summary?: unknown
  simClass?: unknown
  side?: unknown
}

/** One reaction as returned by reactToPage (REACT_SYS shape). */
export interface WalkReactionInput {
  observation?: unknown
  sentiment?: unknown
  targetDescription?: unknown
  region?: unknown
}

export interface WalkRegion { x: number; y: number; w: number; h: number }

export interface WalkBeat {
  /** Stable id so the client can key DOM nodes and screen-reader announcements. */
  id: string
  simName: string
  simRole: string
  initials: string
  accent: string
  observation: string
  sentiment: "frustrated" | "confused" | "satisfied" | "delighted" | "neutral"
  targetDescription: string
  /**
   * Normalised 0..1 box on the captured image, or null for page-level reactions.
   * When null the client degrades to a sequential reveal down the page rather than anchoring.
   */
  region: WalkRegion | null
}

export interface WalkCastMember {
  name: string
  role: string
  initials: string
  accent: string
  summary: string
  simClass: "user" | "client"
}

export interface AssembledWalk {
  cast: WalkCastMember[]
  beats: WalkBeat[]
  /** true when at least one beat carries a real region — drives anchored vs sequential rendering. */
  anchored: boolean
}

const SENTIMENTS = new Set(["frustrated", "confused", "satisfied", "delighted", "neutral"])
const FALLBACK_ACCENTS = ["#6366f1", "#e8843a", "#0f9d6b", "#db2777", "#8b5cf6"]

const str = (v: unknown, max: number): string => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max)

/** Deterministic accent for a name, so a Sim keeps its colour across re-runs of the same URL. */
export function accentFor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return FALLBACK_ACCENTS[h % FALLBACK_ACCENTS.length]
}

/** Only a plain hex colour is trusted — `accent` is model output rendered into a style attribute. */
export function safeAccent(accent: unknown, name: string): string {
  const s = String(accent == null ? "" : accent).trim()
  return /^#[0-9a-fA-F]{3,8}$/.test(s) ? s : accentFor(name)
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "")
  return parts.join("").toUpperCase() || "S"
}

/**
 * Coerce a model-supplied region to a usable 0..1 box, or null.
 * Rejects non-finite, inverted, zero-area and wildly out-of-range boxes rather than letting the
 * client position a bubble off-screen. Slightly-overflowing boxes are clamped, not dropped — the
 * model routinely returns e.g. h:1.02 for a full-width band and that is still a useful anchor.
 */
export function normalizeRegion(raw: unknown): WalkRegion | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  const nums = ["x", "y", "w", "h"].map((k) => Number(r[k]))
  if (nums.some((n) => !Number.isFinite(n))) return null
  let [x, y, w, h] = nums
  // A box that starts entirely outside the image is a hallucination, not a clampable overflow.
  if (x < -0.1 || y < -0.1 || x > 1 || y > 1) return null
  if (w <= 0 || h <= 0) return null
  x = Math.min(Math.max(x, 0), 1)
  y = Math.min(Math.max(y, 0), 1)
  w = Math.min(Math.max(w, 0.01), 1 - x)
  h = Math.min(Math.max(h, 0.01), 1 - y)
  if (w <= 0 || h <= 0) return null
  return { x, y, w, h }
}

export function normalizeCastMember(p: WalkPersonaInput, idx: number): WalkCastMember {
  const name = str(p?.name, 60) || `Sim ${idx + 1}`
  return {
    name,
    role: str(p?.role, 60),
    initials: (str(p?.initials, 3) || initialsOf(name)).toUpperCase(),
    accent: safeAccent(p?.accent, name),
    summary: str(p?.summary, 200),
    simClass: p?.simClass === "client" ? "client" : "user",
  }
}

/**
 * Build the playable timeline from per-persona reaction batches.
 *
 * ORDERING IS THE WHOLE POINT. The scene reads as a walk-through only if the page scrolls in one
 * direction while different Sims chime in — so beats are sorted by vertical position on the page,
 * NOT grouped by Sim. A region-less (page-level) reaction has no y of its own, so it inherits the
 * position of the beat it was authored alongside and rides along at that point in the scroll.
 *
 * `maxBeats` bounds how long the scene runs; a 4-persona page with 3 reactions each would otherwise
 * play for well over a minute and the prospect leaves before the findings below.
 */
export function assembleWalk(
  batches: Array<{ persona: WalkPersonaInput; reactions: WalkReactionInput[] }>,
  opts: { maxBeats?: number } = {},
): AssembledWalk {
  const maxBeats = opts.maxBeats ?? 8
  const cast: WalkCastMember[] = []
  const staged: Array<{ beat: WalkBeat; sortY: number; order: number }> = []
  let order = 0

  batches.forEach((batch, pi) => {
    const member = normalizeCastMember(batch?.persona || {}, pi)
    cast.push(member)
    const reactions = Array.isArray(batch?.reactions) ? batch.reactions : []
    // Fallback y for this persona's region-less beats: spread the personas down the page so a
    // fully unanchored walk still reveals top-to-bottom instead of stacking on the hero.
    let lastY = (pi + 0.5) / Math.max(batches.length, 1)
    reactions.forEach((rx, ri) => {
      const observation = str(rx?.observation, 240)
      if (!observation) return // a beat with nothing said is not a beat
      const region = normalizeRegion(rx?.region)
      if (region) lastY = region.y
      const sentiment = SENTIMENTS.has(String(rx?.sentiment)) ? (String(rx.sentiment) as WalkBeat["sentiment"]) : "neutral"
      staged.push({
        beat: {
          id: `b${pi}-${ri}`,
          simName: member.name,
          simRole: member.role,
          initials: member.initials,
          accent: member.accent,
          observation,
          sentiment,
          targetDescription: str(rx?.targetDescription, 120),
          region,
        },
        sortY: region ? region.y : lastY,
        order: order++,
      })
    })
  })

  // Stable sort: vertical position first, original emission order as the tiebreak so two Sims
  // reacting to the same band keep the order the model thought most important.
  staged.sort((a, b) => (a.sortY - b.sortY) || (a.order - b.order))
  const beats = staged.slice(0, maxBeats).map((s) => s.beat)
  return { cast, beats, anchored: beats.some((b) => b.region !== null) }
}
