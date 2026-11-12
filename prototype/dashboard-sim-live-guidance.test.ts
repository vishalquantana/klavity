// KD-2864: the "Sims — live on your product" guidance on the Sims page — clear numbered steps naming the real controls.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const start = HTML.indexOf('id="simLiveStrip"')
const end = HTML.indexOf("<!-- Launch studio CTA -->", start)
const STRIP = HTML.slice(start, end)
const text = STRIP.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")

test("the section is still there, with its heading and dismiss button", () => {
  expect(start).toBeGreaterThan(-1)
  expect(STRIP).toContain("Sims — live on your product")
  expect(STRIP).toContain('id="simLiveDismiss"')
  expect(HTML).toContain('localStorage.getItem("klavSimLiveStripDismissed")')
})

test("the intro says what this is for and how many steps there are", () => {
  expect(text).toContain("Have your Sims review any page of your product, live. Three steps:")
  expect(text).not.toContain("Use the extension to ask them for a live review")
})

test("three numbered steps, in an ordered list, each with a bold title and a sentence", () => {
  expect(STRIP).toContain('<ol class="sim-live-steps">')
  expect((STRIP.match(/<li class="sim-live-step">/g) || []).length).toBe(3)
  for (const [n, title] of [["1", "Open your product"], ["2", "Run your Sims"], ["3", "Read the results"]]) {
    expect(STRIP).toMatch(new RegExp(`<span class="sim-live-n" aria-hidden="true">${n}</span>[^]*?<b>${title}</b>`))
  }
  expect(text).toContain("Go to any page of your product where the Klavity widget or extension is installed.")
  expect(text).toContain("Keep what matters, dismiss the rest.")
})

test("step 2 names the controls users actually click (as chips), not an invented 'Ask Sims to review this'", () => {
  for (const label of ["Run all Sims", "Select Sims…", "Analyze this page"]) {
    expect(STRIP).toContain(`<span class="sim-live-pill">${label}</span>`)
  }
  expect(STRIP).not.toContain("Ask Sims to review this")
  expect(text).toContain("Using the extension?")
})

test("each step is its own bordered tile, with larger readable text; the steps stack on narrow screens", () => {
  const css = HTML.slice(HTML.indexOf(".sim-live-step {"), HTML.indexOf(".sim-live-step {") + 260)
  expect(css).toContain("border: 1px solid var(--line)")
  expect(css).toContain("border-radius: 12px")
  expect(HTML.slice(HTML.indexOf(".sim-live-steps {"), HTML.indexOf(".sim-live-steps {") + 200)).toContain("repeat(auto-fit, minmax(240px, 1fr))")
  const title = HTML.slice(HTML.indexOf(".sim-live-step b {"), HTML.indexOf(".sim-live-step b {") + 120)
  expect(title).toContain("font-size: 13.5px")
})
