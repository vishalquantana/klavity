/**
 * /bug-check Sim walk-through wiring guard (site/bug-check.html).
 *
 * The free tool's whole job is to make a prospect WANT the product, and the delight IS the
 * conversion mechanism — so the wiring that produces it is load-bearing marketing infrastructure,
 * not decoration. These assertions pin the things that would silently kill the scene:
 *
 *   - the walk must actually be requested (a page that never calls /api/simwalk is the old static
 *     scan with new copy, which is exactly the untrue-claim problem this shipped to fix)
 *   - the walk must NEVER block or replace the verified findings (the substance)
 *   - bubble text must be real DOM text, never baked into the screenshot, or the scene is invisible
 *     to a screen reader and the accessibility story is a lie
 *   - reduced-motion users must get a real static view, not a silently-broken animated one
 *   - the hero must describe what now happens, without reintroducing an exact-speed claim
 */
import { describe, it, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "..", "site", "bug-check.html"), "utf8")

describe("bug-check walk-through wiring", () => {
  it("requests the walk from /api/simwalk with the normalised URL", () => {
    expect(html).toContain('BASE + "/api/simwalk"')
    expect(html).toMatch(/\/api\/simwalk[\s\S]{0,400}body: JSON\.stringify\(\{ url: url \}\)/)
    expect(html).toMatch(/async function runWalk\(url\)/)
  })

  it("kicks the walk off from the submit path without awaiting it", () => {
    // `void runWalk(...)` — an awaited walk would hold the findings hostage behind a browser
    // capture and N vision calls.
    expect(html).toMatch(/void runWalk\(rawUrl\)/)
    expect(html).not.toMatch(/await runWalk\(/)
  })

  it("still runs the verified scan and still renders the findings list", () => {
    // The Sims are the show; these findings are the substance. Deleting the scan was never on.
    expect(html).toContain("/api/cro/analyze")
    expect(html).toMatch(/mode: "qa"/)
    expect(html).toContain('id="finding-list"')
    expect(html).toContain("findingList.appendChild(li)")
  })

  it("puts the walk ABOVE the findings in the DOM", () => {
    expect(html.indexOf('id="sim-walk"')).toBeGreaterThan(-1)
    expect(html.indexOf('id="sim-walk"')).toBeLessThan(html.indexOf('class="results" id="results"'))
  })

  it("renders bubble + transcript text as real text nodes, never innerHTML", () => {
    // textContent/createTextNode only: these strings are model output derived from a third party's
    // page, so an innerHTML path here would be a reflected-XSS seam AND unreadable to a screen reader.
    expect(html).toMatch(/txt\.textContent = "“" \+ beat\.observation/)
    expect(html).toMatch(/document\.createTextNode\("“" \+ beat\.observation/)
    expect(html).toMatch(/nm\.textContent = beat\.simName/)
    // The only innerHTML uses in the walk code are clears, never interpolation of model text.
    const walkJs = html.slice(html.indexOf("function resetWalk()"), html.indexOf("function setLoading("))
    for (const m of walkJs.matchAll(/\.innerHTML\s*=\s*([^\n]+)/g)) {
      expect(m[1].trim()).toBe('""')
    }
  })

  it("keeps an aria-live transcript so the whole scene is reachable without seeing it", () => {
    expect(html).toMatch(/<ol class="walk-log" id="walk-log" aria-live="polite">/)
    expect(html).toMatch(/walkLog\.appendChild\(li\)/)
    // every played beat is mirrored into the log, not just shown as a bubble
    expect(html).toMatch(/placeBeat\(beat, offset\)\s*\n\s*logBeat\(beat\)/)
  })

  it("gives the screenshot a text alternative and never puts reaction text inside the image", () => {
    const img = html.match(/<img class="walk-shot"[^>]*>/)
    expect(img).not.toBeNull()
    expect(img![0]).toContain("alt=")
    expect(img![0]).not.toMatch(/alt=""/)
  })

  it("honours prefers-reduced-motion with a real static view", () => {
    expect(html).toMatch(/prefers-reduced-motion: reduce/)
    expect(html).toMatch(/if \(prefersReducedMotion\(\)\) \{ showAll\(\); return \}/)
    expect(html).toContain(".walk-viewport.still")
    // the static view still lists every beat rather than dropping the content
    expect(html).toMatch(/walkData\.beats\.forEach\(logBeat\)/)
  })

  it("offers a skip control so nobody is trapped watching the animation", () => {
    expect(html).toContain('id="walk-skip"')
    expect(html).toMatch(/walkSkip\.addEventListener\("click", showAll\)/)
  })

  it("lands somewhere useful on every unhappy path — never a hanging spinner", () => {
    expect(html).toMatch(/function walkFailed\(msg\)/)
    // rate-limited, generic error, empty result, and timeout all resolve to walkFailed
    expect(html).toMatch(/res\.status === 429/)
    expect(html).toMatch(/if \(!data\.beats \|\| !data\.beats\.length \|\| !data\.screenshot\)/)
    expect(html).toMatch(/WALK_TIMEOUT_MS/)
    expect(html).toMatch(/controller\.abort\(\)/)
    // and the failure copy always points at the findings that DID run
    expect(html).toContain("Your scan results are below.")
  })

  it("abandons an in-flight walk when the user submits a new URL", () => {
    // Two timelines writing the same DOM produce a scene that looks broken and random.
    expect(html).toMatch(/const myRun = \+\+walkRun/)
    expect(html).toMatch(/if \(myRun !== walkRun\) return/)
  })

  it("is responsive at mobile widths", () => {
    expect(html).toMatch(/@media\(max-width:500px\)\{[\s\S]*?\.walk-viewport/)
  })

  it("has a hero that describes the walk-through and keeps the minutes framing", () => {
    const hero = html.slice(html.indexOf('<div class="hero">'), html.indexOf('<div class="tool-card">'))
    expect(hero).toMatch(/walk/i)
    expect(hero).toMatch(/AI customers/i)
    expect(hero).toContain("results in minutes")
  })

  it("uses SVG icons, never emoji, in the walk markup", () => {
    const walkSection = html.slice(html.indexOf('<section class="walk"'), html.indexOf("</section>", html.indexOf('<section class="walk"')))
    expect(walkSection).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  })
})
