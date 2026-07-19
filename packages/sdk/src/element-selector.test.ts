// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { computeSelector, isStableClass, cssEscape } from "./element-selector"

afterEach(() => {
  document.body.innerHTML = ""
})

/** Mount HTML into the jsdom body and return the element matching `sel`. */
function mount(html: string, sel: string): Element {
  document.body.innerHTML = html
  const el = document.querySelector(sel)
  if (!el) throw new Error("test fixture missing " + sel)
  return el
}

describe("isStableClass", () => {
  it("keeps intent-revealing utility/semantic classes", () => {
    expect(isStableClass("btn-primary")).toBe(true)
    expect(isStableClass("nav__link")).toBe(true)
    expect(isStableClass("mt-4")).toBe(true)
    expect(isStableClass("section-2024")).toBe(true)
  })

  it("rejects framework-generated hashes", () => {
    expect(isStableClass("css-1a2b3c")).toBe(false) // emotion
    expect(isStableClass("sc-bdVaJa")).toBe(false) // styled-components
    expect(isStableClass("jsx-1289998")).toBe(false) // styled-jsx
    expect(isStableClass("Button_root__2Fj3k")).toBe(false) // CSS modules
    expect(isStableClass("deadbeef")).toBe(false) // long hex run
  })

  it("rejects classes illegal in a bare .class selector", () => {
    expect(isStableClass("w-1/2")).toBe(false) // Tailwind fraction
    expect(isStableClass("md:flex")).toBe(false) // responsive prefix
    expect(isStableClass("2cols")).toBe(false) // leading digit
    expect(isStableClass("")).toBe(false)
  })
})

describe("cssEscape", () => {
  it("escapes characters unsafe in an identifier", () => {
    // jsdom provides CSS.escape; either the native or fallback result backslash-escapes the dot.
    expect(cssEscape("a.b")).toContain("\\.")
  })
})

describe("computeSelector", () => {
  it("returns null for non-element input", () => {
    expect(computeSelector(null)).toBeNull()
    expect(computeSelector(document.createTextNode("x") as any)).toBeNull()
  })

  it("prefers a unique id", () => {
    const el = mount('<div><button id="save-btn">Save</button></div>', "#save-btn")
    expect(computeSelector(el)).toBe("#save-btn")
  })

  it("skips a hashed/generated id and falls back to a path", () => {
    const el = mount('<main><span id="a1b2c3d4">x</span></main>', "#a1b2c3d4")
    const sel = computeSelector(el)
    expect(sel).not.toBe("#a1b2c3d4")
    expect(document.querySelectorAll(sel!).length).toBe(1)
    expect(document.querySelector(sel!)).toBe(el)
  })

  it("prefers a stable test attribute over a positional path", () => {
    const el = mount('<ul><li data-testid="row-42">x</li><li>y</li></ul>', '[data-testid="row-42"]')
    expect(computeSelector(el)).toBe('li[data-testid="row-42"]')
  })

  it("uses stable classes and ignores volatile hash classes", () => {
    const el = mount(
      '<section><button class="css-1a2b3c cta-buy">Buy</button></section>',
      ".cta-buy",
    )
    const sel = computeSelector(el)!
    expect(sel).toContain(".cta-buy")
    expect(sel).not.toContain("css-1a2b3c")
    expect(document.querySelector(sel)).toBe(el)
  })

  it("adds :nth-of-type only to disambiguate identical siblings", () => {
    const el = mount(
      '<ul id="list"><li>a</li><li>b</li><li>c</li></ul>',
      "#list li:nth-of-type(3)",
    )
    const sel = computeSelector(el)!
    expect(sel).toContain(":nth-of-type(3)")
    expect(document.querySelector(sel)).toBe(el)
  })

  it("always resolves back to exactly the picked element in a deep tree", () => {
    document.body.innerHTML = `
      <div class="app">
        <header><nav><a class="link">Home</a><a class="link">Docs</a></nav></header>
        <main>
          <article class="post">
            <div class="row"><span class="cell">1</span><span class="cell broken">2</span></div>
          </article>
        </main>
      </div>`
    const el = document.querySelector(".broken")!
    const sel = computeSelector(el)!
    expect(document.querySelectorAll(sel).length).toBe(1)
    expect(document.querySelector(sel)).toBe(el)
  })

  it("anchors the path at the nearest uniquely-id'd ancestor when local segments collide", () => {
    // Two identical `.body > a.x` subtrees mean neither `a.x` nor `div.body > a.x` is unique — the
    // walk must climb to the uniquely-id'd `#panel` to disambiguate the first one.
    document.body.innerHTML =
      '<div id="panel"><div class="body"><a class="x">A</a></div></div>' +
      '<div><div class="body"><a class="x">B</a></div></div>'
    const el = document.querySelector("#panel .x")!
    const sel = computeSelector(el)!
    expect(sel.startsWith("#panel")).toBe(true)
    expect(document.querySelectorAll(sel).length).toBe(1)
    expect(document.querySelector(sel)).toBe(el)
  })
})
