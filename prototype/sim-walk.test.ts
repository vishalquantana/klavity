/**
 * Sim walk-through assembly guard.
 *
 * THE FEATURE: /bug-check no longer just prints a list — it plays a scene where 2-4 named Sims walk
 * the prospect's own page and react out loud. The scene is only watchable if the beats are ordered
 * the way a person actually scrolls (top of the page down, whoever is talking) and if every bubble
 * lands somewhere real. That ordering + anchoring logic lives in lib/sim-walk.ts, deliberately pure,
 * so it can be pinned here without spending a model call.
 *
 * THE DEGRADED PATHS MATTER MOST. Region data is model output: it is routinely absent (a "client"
 * Sim reacting at the outcome level has nothing to point at) and occasionally nonsense. A walk that
 * still reads well with zero usable regions is the difference between a beautiful sequential reveal
 * and a broken anchored one, so those cases are asserted as hard as the happy path.
 */
import { describe, it, expect } from "bun:test"
import { assembleWalk, normalizeRegion, safeAccent, initialsOf, accentFor } from "./lib/sim-walk"

const persona = (name: string, extra: Record<string, unknown> = {}) => ({
  name, role: "Ops Lead", initials: "OL", accent: "#6366f1", summary: "Runs the day to day.", ...extra,
})
const rx = (observation: string, region: unknown = null, extra: Record<string, unknown> = {}) => ({
  observation, region, sentiment: "frustrated", targetDescription: "the pricing table", ...extra,
})

describe("normalizeRegion", () => {
  it("accepts a well-formed 0..1 box", () => {
    expect(normalizeRegion({ x: 0.1, y: 0.2, w: 0.3, h: 0.4 })).toEqual({ x: 0.1, y: 0.2, w: 0.3, h: 0.4 })
  })

  it("clamps a slightly-overflowing box instead of dropping a usable anchor", () => {
    // Models routinely return h:1.02 for a full-width band — still the right place to point.
    const r = normalizeRegion({ x: 0, y: 0.9, w: 1, h: 1.05 })
    expect(r).not.toBeNull()
    expect(r!.y + r!.h).toBeLessThanOrEqual(1.0000001)
  })

  it("rejects a box that starts outside the image (hallucination, not overflow)", () => {
    expect(normalizeRegion({ x: 1.8, y: 0.2, w: 0.2, h: 0.2 })).toBeNull()
    expect(normalizeRegion({ x: 0.2, y: -0.9, w: 0.2, h: 0.2 })).toBeNull()
  })

  it("rejects zero-area, non-finite and non-object regions", () => {
    expect(normalizeRegion({ x: 0.2, y: 0.2, w: 0, h: 0.2 })).toBeNull()
    expect(normalizeRegion({ x: 0.2, y: 0.2, w: NaN, h: 0.2 })).toBeNull()
    expect(normalizeRegion({ x: "a", y: "b", w: "c", h: "d" })).toBeNull()
    expect(normalizeRegion(null)).toBeNull()
    expect(normalizeRegion("0.1,0.2")).toBeNull()
    expect(normalizeRegion(undefined)).toBeNull()
  })
})

describe("safeAccent", () => {
  it("passes a plain hex colour through", () => {
    expect(safeAccent("#0f9d6b", "Ann Lee")).toBe("#0f9d6b")
  })

  it("refuses anything that is not a hex colour — accent is rendered into a style attribute", () => {
    // This is the XSS seam: the model supplies `accent` and the client writes it to style.background.
    for (const hostile of ["red;background:url(javascript:alert(1))", "url(x)", "expression(alert(1))", "", null, 42]) {
      expect(safeAccent(hostile, "Ann Lee")).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it("is deterministic, so a Sim keeps its colour across re-runs of the same URL", () => {
    expect(accentFor("Priya Nair")).toBe(accentFor("Priya Nair"))
  })
})

describe("initialsOf", () => {
  it("takes the first two words", () => {
    expect(initialsOf("Priya Nair")).toBe("PN")
    expect(initialsOf("Cher")).toBe("C")
    expect(initialsOf("  ")).toBe("S")
  })
})

describe("assembleWalk", () => {
  it("orders beats down the page, not grouped by Sim — that is what makes it read as one walk", () => {
    const walk = assembleWalk([
      { persona: persona("Ann Lee"), reactions: [rx("bottom thing", { x: 0, y: 0.8, w: 1, h: 0.1 })] },
      { persona: persona("Bob Roy"), reactions: [rx("top thing", { x: 0, y: 0.1, w: 1, h: 0.1 })] },
    ])
    expect(walk.beats.map((b) => b.observation)).toEqual(["top thing", "bottom thing"])
    expect(walk.beats.map((b) => b.simName)).toEqual(["Bob Roy", "Ann Lee"])
    expect(walk.anchored).toBe(true)
  })

  it("keeps model priority order when two Sims react to the same band", () => {
    const at = { x: 0, y: 0.4, w: 1, h: 0.1 }
    const walk = assembleWalk([
      { persona: persona("Ann Lee"), reactions: [rx("first said", at)] },
      { persona: persona("Bob Roy"), reactions: [rx("second said", at)] },
    ])
    expect(walk.beats.map((b) => b.observation)).toEqual(["first said", "second said"])
  })

  it("DEGRADED: with no regions at all it still reveals top-to-bottom, and reports anchored=false", () => {
    // Every "client"-class Sim reacting at the outcome level produces exactly this shape. The
    // client uses `anchored` to switch from pointing at elements to a plain sequential reveal.
    const walk = assembleWalk([
      { persona: persona("Ann Lee"), reactions: [rx("outcome one"), rx("outcome two")] },
      { persona: persona("Bob Roy"), reactions: [rx("outcome three")] },
    ])
    expect(walk.anchored).toBe(false)
    expect(walk.beats).toHaveLength(3)
    expect(walk.beats.every((b) => b.region === null)).toBe(true)
    // Ann's beats come before Bob's — personas are spread down the page rather than stacked.
    expect(walk.beats.map((b) => b.simName)).toEqual(["Ann Lee", "Ann Lee", "Bob Roy"])
  })

  it("DEGRADED: a region-less beat rides along at the position of the beat before it", () => {
    const walk = assembleWalk([
      { persona: persona("Ann Lee"), reactions: [
        rx("anchored low", { x: 0, y: 0.7, w: 1, h: 0.1 }),
        rx("page level follow-up"),
      ] },
    ])
    // The follow-up inherits y=0.7, so it does not teleport the scroll back to the hero.
    expect(walk.beats.map((b) => b.observation)).toEqual(["anchored low", "page level follow-up"])
  })

  it("DEGRADED: a Sim whose reaction call failed contributes no beats but stays in the cast", () => {
    const walk = assembleWalk([
      { persona: persona("Ann Lee"), reactions: [rx("said something")] },
      { persona: persona("Bob Roy"), reactions: [] },
    ])
    expect(walk.cast.map((c) => c.name)).toEqual(["Ann Lee", "Bob Roy"])
    expect(walk.beats).toHaveLength(1)
  })

  it("drops beats with no observation — an empty bubble is not a beat", () => {
    const walk = assembleWalk([
      { persona: persona("Ann Lee"), reactions: [rx(""), rx("   "), rx("real line")] },
    ])
    expect(walk.beats.map((b) => b.observation)).toEqual(["real line"])
  })

  it("bounds the scene so the prospect reaches the findings underneath", () => {
    const many = Array.from({ length: 6 }, (_, i) => rx("line " + i, { x: 0, y: i / 6, w: 1, h: 0.1 }))
    const walk = assembleWalk([
      { persona: persona("Ann Lee"), reactions: many },
      { persona: persona("Bob Roy"), reactions: many },
    ], { maxBeats: 5 })
    expect(walk.beats).toHaveLength(5)
  })

  it("normalises hostile / missing persona fields rather than trusting the model", () => {
    const walk = assembleWalk([
      { persona: { name: "  Zed   Ali ", accent: "javascript:alert(1)", simClass: "wat" } as any,
        reactions: [rx("x".repeat(400), null, { sentiment: "furious" })] },
    ])
    const c = walk.cast[0]
    expect(c.name).toBe("Zed Ali")
    expect(c.accent).toMatch(/^#[0-9a-f]{6}$/i)
    expect(c.initials).toBe("ZA")
    expect(c.simClass).toBe("user") // unknown simClass falls back rather than leaking through
    expect(walk.beats[0].observation.length).toBe(240) // capped, not unbounded model text
    expect(walk.beats[0].sentiment).toBe("neutral") // unknown sentiment never reaches a CSS class
  })

  it("names an unnamed persona rather than rendering a blank avatar", () => {
    const walk = assembleWalk([{ persona: {}, reactions: [rx("hi")] }])
    expect(walk.cast[0].name).toBe("Sim 1")
    expect(walk.cast[0].initials).toBe("S1")
  })

  it("returns an empty, non-throwing walk when nothing came back at all", () => {
    expect(assembleWalk([])).toEqual({ cast: [], beats: [], anchored: false })
    expect(assembleWalk([{ persona: persona("Ann Lee"), reactions: null as any }]).beats).toEqual([])
  })
})
