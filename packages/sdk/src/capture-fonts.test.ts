// @vitest-environment jsdom
// KLA-592: RENDERED-path font quality. Two fixes, both unit-tested here:
//   (A) buildFontEmbedCss() — assemble @font-face CSS with the font bytes inlined as data: URLs so the SVG
//       renderer paints the REAL face (not a mismatched fallback that overlaps). CORS-blocked fonts skip.
//   (B) icon-font ligature detection/blanking — a glyph ("circle_call") that can't be embedded is blanked so
//       it doesn't leak as overlapping raw fallback text. Conservative: normal text is never blanked.
import { describe, it, expect } from "vitest"
import {
  primaryFontFamily,
  isIconFontFamily,
  isLigatureToken,
  shouldBlankIconGlyph,
  buildFontEmbedCss,
} from "./capture"

describe("primaryFontFamily", () => {
  it("returns the first family, lowercased & unquoted", () => {
    expect(primaryFontFamily('"Material Icons", sans-serif')).toBe("material icons")
    expect(primaryFontFamily("Inter, Arial, sans-serif")).toBe("inter")
    expect(primaryFontFamily("'Font Awesome 6 Free'")).toBe("font awesome 6 free")
    expect(primaryFontFamily("")).toBe("")
  })
})

describe("isIconFontFamily", () => {
  it("flags known icon fonts", () => {
    for (const f of [
      "Material Icons", '"Material Symbols Outlined"', "FontAwesome", "Font Awesome 6 Free",
      "icomoon", "Glyphicons Halflings", "Ionicons",
    ]) expect(isIconFontFamily(f)).toBe(true)
  })
  it("does NOT flag normal text/web fonts", () => {
    for (const f of ["Inter", "Arial", "Roboto", "Helvetica Neue", "system-ui", ""]) {
      expect(isIconFontFamily(f)).toBe(false)
    }
  })
})

describe("isLigatureToken", () => {
  it("flags underscore/hyphen-joined single tokens (icon ligatures)", () => {
    expect(isLigatureToken("circle_call")).toBe(true)
    expect(isLigatureToken("check_circle")).toBe(true)
    expect(isLigatureToken("arrow-down")).toBe(true)
  })
  it("does NOT flag prose, single plain words, or long strings", () => {
    expect(isLigatureToken("Save changes")).toBe(false) // has a space
    expect(isLigatureToken("Home")).toBe(false)          // single plain word (no _/-)
    expect(isLigatureToken("hello world foo")).toBe(false)
    expect(isLigatureToken("a".repeat(50))).toBe(false)  // too long
    expect(isLigatureToken("")).toBe(false)
  })
})

describe("shouldBlankIconGlyph (conservative)", () => {
  it("blanks a known icon font whose face was NOT embedded", () => {
    expect(shouldBlankIconGlyph({ fontFamily: '"Material Icons"', text: "circle_call" })).toBe(true)
    expect(shouldBlankIconGlyph({ fontFamily: "FontAwesome", text: "" })).toBe(true)
  })
  it("does NOT blank a known icon font we DID embed (glyph renders correctly)", () => {
    const embedded = new Set(["material icons"])
    expect(shouldBlankIconGlyph({ fontFamily: '"Material Icons", sans-serif', text: "home", embeddedFamilies: embedded })).toBe(false)
  })
  it("blanks a generic underscore ligature in a NAMED non-embedded font", () => {
    expect(shouldBlankIconGlyph({ fontFamily: '"my-iconset"', text: "circle_call" })).toBe(true)
  })
  it("does NOT blank normal text, single words, or generic-font tokens", () => {
    expect(shouldBlankIconGlyph({ fontFamily: "Inter, sans-serif", text: "Save changes" })).toBe(false)
    expect(shouldBlankIconGlyph({ fontFamily: "Inter", text: "Dashboard" })).toBe(false)
    // a lone underscore token in a GENERIC family (e.g. code in monospace) is left alone
    expect(shouldBlankIconGlyph({ fontFamily: "monospace", text: "user_name" })).toBe(false)
    expect(shouldBlankIconGlyph({ fontFamily: "Inter", text: "" })).toBe(false)
  })
})

describe("buildFontEmbedCss", () => {
  const face = (family: string, url: string) => ({
    family,
    src: `url("${url}") format("woff2")`,
    cssText: `@font-face { font-family: "${family}"; src: url("${url}") format("woff2"); }`,
  })

  it("inlines a fetchable font as a data: URL and records the family", async () => {
    const dataUrl = "data:font/woff2;base64,AAAA"
    const out = await buildFontEmbedCss({
      faces: [face("Inter", "https://cdn.example.com/inter.woff2")],
      fetchAsDataUrl: async () => dataUrl,
    })
    expect(out.cssText).toContain(dataUrl)
    expect(out.cssText).not.toContain("https://cdn.example.com/inter.woff2")
    expect(out.embeddedFamilies.has("inter")).toBe(true)
  })

  it("skips a CORS-blocked font gracefully (no throw, not embedded)", async () => {
    const out = await buildFontEmbedCss({
      faces: [face("Blocked", "https://third-party.example.com/blocked.woff2")],
      fetchAsDataUrl: async () => null, // simulates a CORS/CSP failure
    })
    expect(out.cssText).toBe("")
    expect(out.embeddedFamilies.has("blocked")).toBe(false)
  })

  it("embeds the fetchable faces and drops the blocked ones in a mixed set", async () => {
    const out = await buildFontEmbedCss({
      faces: [
        face("Inter", "https://cdn.example.com/inter.woff2"),
        face("Material Icons", "https://blocked.example.com/icons.woff2"),
      ],
      fetchAsDataUrl: async (u) => (u.includes("cdn.example.com") ? "data:font/woff2;base64,BBBB" : null),
    })
    expect(out.embeddedFamilies.has("inter")).toBe(true)
    expect(out.embeddedFamilies.has("material icons")).toBe(false)
    expect(out.cssText).toContain("data:font/woff2;base64,BBBB")
  })

  it("keeps an already-data:-URL face as-is", async () => {
    const out = await buildFontEmbedCss({
      faces: [{
        family: "Local",
        src: 'url("data:font/woff2;base64,CCCC") format("woff2")',
        cssText: '@font-face { font-family: "Local"; src: url("data:font/woff2;base64,CCCC"); }',
      }],
      fetchAsDataUrl: async () => { throw new Error("should not fetch a data: URL") },
    })
    expect(out.embeddedFamilies.has("local")).toBe(true)
    expect(out.cssText).toContain("CCCC")
  })

  it("returns empty for no faces", async () => {
    const out = await buildFontEmbedCss({ faces: [] })
    expect(out.cssText).toBe("")
    expect(out.embeddedFamilies.size).toBe(0)
  })
})
