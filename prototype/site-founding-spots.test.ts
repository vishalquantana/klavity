// KLAVITYKLA-366 — the three UI states of the Founding Ten band, on /pricing and in the app.
//
// The markup carries BOTH CTA variants and a placeholder trio that the server substitutes per
// response (see substituteFoundingPlaceholders in server.ts). These tests assert the contract that
// makes that safe: the standard price stays visible as the anchor in every state, sold out leaves
// no dead button, and an unavailable count leaves NO number and NO placeholder text on screen.
import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { computeFoundingSpots, foundingRibbonLabel, foundingSpotsLabel, foundingStateToken } from "./lib/founding"

const PRICING = readFileSync(join(import.meta.dir, "../site/pricing.html"), "utf8")
const DASHBOARD = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8")

/** Mirror of the server's substitution so the tests exercise real rendered output, not the template. */
function render(html: string, taken: number | null): string {
  const s = computeFoundingSpots(taken)
  return html
    .replaceAll("__FOUNDING_STATE__", foundingStateToken(s))
    .replaceAll("__FOUNDING_RIBBON__", foundingRibbonLabel(s))
    .replaceAll("__FOUNDING_SPOTS_LINE__", foundingSpotsLabel(s))
}

// ── the anchor ─────────────────────────────────────────────────────────────────────────────────

test("the STANDARD Team price is visible as the anchor in every state", () => {
  for (const taken of [0, 3, 9, 10, null]) {
    const out = render(PRICING, taken)
    // The pitch is the contrast: the $2,988/yr plan for $490.
    expect(out).toContain("$2,988")
    expect(out).toContain("$249")
    expect(out).toContain("$490")
  }
})

test("prices are untouched — KLAVITYKLA-379 is canonical", () => {
  expect(PRICING).toContain("$490 billed yearly, locked for life")
  expect(DASHBOARD).toContain("Founding Team — $490/yr")
})

// ── state 1: spots remaining ───────────────────────────────────────────────────────────────────

test("spots remaining: honest count shown, founding CTA live", () => {
  const out = render(PRICING, 3)
  expect(out).toContain("7 of 10 spots left")
  expect(out).toContain('data-founding-state="open"')
  expect(out).toContain('href="/onboarding?plan=founding"')
})

// ── state 2: exactly one left ──────────────────────────────────────────────────────────────────

test("exactly one left: still open, phrased as a last spot", () => {
  const out = render(PRICING, 9)
  expect(out).toContain("Last spot — 1 of 10 left")
  expect(out).toContain('data-founding-state="open"')
  expect(out).toContain('href="/onboarding?plan=founding"')
})

// ── state 3: sold out ──────────────────────────────────────────────────────────────────────────

test("sold out: the offer closes cleanly and points at the standard price", () => {
  const out = render(PRICING, 10)
  expect(out).toContain('data-founding-state="soldout"')
  expect(out).toContain("All ten spots are taken.")
  expect(out).toContain('href="/onboarding?plan=team"')
  // No "0 spots left" scarcity theatre next to a button that still takes money.
  expect(out).not.toContain("0 of 10 spots left")
})

test("sold-out CSS hides the founding CTA — there is no dead button", () => {
  // The rule that actually does the hiding must exist; without it the soldout attribute is inert.
  expect(PRICING).toContain('.founding-band[data-founding-state="soldout"] .founding-when-open');
  expect(PRICING).toContain(".founding-when-soldout")
})

test("the in-app ribbon respects sold out — the app cannot promote a closed offer", () => {
  const out = render(DASHBOARD, 10)
  expect(out).toContain('id="foundingRibbon" data-founding-state="soldout"')
  expect(DASHBOARD).toContain('#foundingRibbon[data-founding-state="soldout"]{display:none!important}')
})

test("the in-app ribbon shows the live count while spots remain", () => {
  const out = render(DASHBOARD, 6)
  expect(out).toContain('data-founding-state="open"')
  expect(out).toContain("4 of 10 spots left")
})

// ── state 4 (the one that bites): count unavailable ────────────────────────────────────────────

/** The rendered text of the spots line only — comments and unrelated copy must not fool us. */
function spotsLine(html: string, taken: number | null): string {
  const out = render(html, taken)
  const m = out.match(/<div class="founding-spots">([^<]*)<\/div>/)
    || out.match(/<div id="foundingSpots"[^>]*>([^<]*)<\/div>/)
  if (!m) throw new Error("spots line element not found")
  return m[1]
}

test("count unavailable: the offer renders WITHOUT a number, not with a wrong one", () => {
  for (const html of [PRICING, DASHBOARD]) {
    const out = render(html, null)
    // Offer stays OPEN — a DB blip must not close a live offer either.
    expect(out).toContain('data-founding-state="open"')
    // ...but quotes no number at all. Empty, not "0", not a spinner, not a guess.
    expect(spotsLine(html, null)).toBe("")
  }
})

test("the spots line is the only place a count appears, and it is exact", () => {
  expect(spotsLine(PRICING, 3)).toBe("7 of 10 spots left")
  expect(spotsLine(PRICING, 9)).toBe("Last spot — 1 of 10 left")
  expect(spotsLine(PRICING, 10)).toBe("All 10 spots taken")
  expect(spotsLine(DASHBOARD, 6)).toBe("4 of 10 spots left")
})

test("no rendered state ever leaks undefined, NaN, or a raw placeholder", () => {
  for (const html of [PRICING, DASHBOARD]) {
    for (const taken of [0, 1, 9, 10, 11, null]) {
      // Whole document: no placeholder may survive substitution anywhere.
      expect(render(html, taken)).not.toContain("__FOUNDING_")
      // The user-visible count line: no coercion artefacts. (Scoped to this line because the
      // dashboard's own app JS legitimately mentions NaN elsewhere.)
      const line = spotsLine(html, taken)
      expect(line).not.toContain("undefined")
      expect(line).not.toContain("NaN")
      expect(line).not.toContain("null")
    }
  }
})

test("the empty spots line collapses instead of leaving a gap or a spinner", () => {
  expect(PRICING).toContain(".founding-spots:empty")
  expect(DASHBOARD).toContain("#foundingSpots:empty{display:none}")
  // Nothing in this feature may animate a countdown — a stale honest number beats an animated lie.
  const bandCss = PRICING.slice(PRICING.indexOf(".founding-band"), PRICING.indexOf(".qa-cost-anchor"))
  expect(bandCss).not.toContain("@keyframes")
  expect(bandCss).not.toContain("animation:")
})
