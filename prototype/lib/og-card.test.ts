import { test, expect, describe } from "bun:test"
import { resolveOgType, renderOgCardHtml, injectOgMeta, escapeHtml, type OgCardData } from "./og-card"

describe("resolveOgType — type resolver mapping (KLA-738)", () => {
  test("human: report_type=bug + human provenance (no sim_id, human source)", () => {
    expect(resolveOgType({ reportType: "bug", source: "widget", reporter: { name: "Asmin" } })).toBe("human")
    expect(resolveOgType({ reportType: "bug", source: null, simId: null })).toBe("human")
    expect(resolveOgType({ reportType: "bug", source: "extension" })).toBe("human")
  })

  test("sim: a sim_id present → sim (even if report_type=bug)", () => {
    expect(resolveOgType({ reportType: "bug", simId: "sim_123" })).toBe("sim")
    expect(resolveOgType({ simId: "sim_abc", source: null })).toBe("sim")
  })

  test("sim: sim/autosim/adhoc/trail/walk source → sim", () => {
    for (const s of ["sim", "autosim", "adhoc", "ad-hoc", "trail", "trails", "walk", "SIM", "AutoSim"]) {
      expect(resolveOgType({ source: s })).toBe("sim")
    }
  })

  test("roast: a Banana-Scorecard run (roast flag or bananaScore) → roast, wins over sim", () => {
    expect(resolveOgType({ roast: true })).toBe("roast")
    expect(resolveOgType({ bananaScore: 7 })).toBe("roast")
    expect(resolveOgType({ bananaScore: 0 })).toBe("roast")
    // roast precedence over sim markers
    expect(resolveOgType({ roast: true, simId: "sim_1", source: "autosim" })).toBe("roast")
  })

  test("default: features/tasks/queries, unknown provenance, null row", () => {
    expect(resolveOgType({ reportType: "feature", source: "widget" })).toBe("default")
    expect(resolveOgType({ reportType: "task" })).toBe("default")
    expect(resolveOgType({})).toBe("default")
    expect(resolveOgType(null)).toBe("default")
    expect(resolveOgType(undefined)).toBe("default")
  })
})

describe("renderOgCardHtml — templates render without throwing (KLA-738)", () => {
  const samples: OgCardData[] = [
    { type: "human", ticketKey: "SIM-1520", title: "Checkout button dead on mobile Safari", severity: { label: "P1 · Critical", cls: "c1" }, reporter: "Asmin Rao" },
    { type: "sim", ticketKey: "SIM-1521", title: "Selected plan isn't visually obvious at checkout.", finding: "I couldn't tell which plan was selected before paying.", severity: { label: "C2 · Needs work", cls: "c2" }, simName: "Sarah Chen", simRole: "Small-business owner", initials: "SC", accent: "#8b5cf6" },
    { type: "roast", score: 7, domain: "yourapp.com", simCount: 5, critical: 2, needsWork: 3, polish: 5 },
    { type: "default" },
  ]

  for (const s of samples) {
    test(`renders ${s.type} card as a full 1200×630 document`, () => {
      const html = renderOgCardHtml(s)
      expect(html).toContain("<!doctype html>")
      expect(html).toContain("1200px")
      expect(html).toContain("630px")
      expect(html).toContain("Klav") // brand wordmark
      expect(html).toContain("<svg") // dot-ladder logo
      expect(html.length).toBeGreaterThan(500)
    })
  }

  test("human card includes ticket key, title, reporter, severity", () => {
    const html = renderOgCardHtml(samples[0])
    expect(html).toContain("SIM-1520")
    expect(html).toContain("Checkout button dead")
    expect(html).toContain("Reported by Asmin Rao")
    expect(html).toContain("P1 · Critical")
  })

  test("sim card includes persona initials, name, role, finding quote", () => {
    const html = renderOgCardHtml(samples[1])
    expect(html).toContain("SC")
    expect(html).toContain("Sarah Chen")
    expect(html).toContain("Small-business owner")
    expect(html).toContain("I couldn&#39;t tell which plan")
  })

  test("roast card includes banana score, counts, domain, emoji", () => {
    const html = renderOgCardHtml(samples[2])
    expect(html).toContain("Banana Scorecard")
    expect(html).toContain("&#127820;") // 🍌 rendered via numeric entity + color-emoji font
    expect(html).toContain("yourapp.com")
    expect(html).toContain("reviewed by 5 Sims")
  })

  test("escapes untrusted title/finding (no HTML injection)", () => {
    const html = renderOgCardHtml({ type: "human", ticketKey: "K-1", title: "<script>alert(1)</script>", severity: null, reporter: null })
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain("&lt;script&gt;")
  })

  test("escapeHtml handles quotes/amp/lt/gt", () => {
    expect(escapeHtml(`a<b>&"'`)).toBe("a&lt;b&gt;&amp;&quot;&#39;")
  })
})

describe("injectOgMeta — share page carries the right per-type og:image (KLA-738)", () => {
  const page = `<!doctype html><html><head><meta charset="utf-8"><title>Ticket · Klavity</title></head><body>x</body></html>`

  test("injects og/twitter tags with the versioned image URL before </head>", () => {
    const url = "https://klavity.in/og/fb_abc.png?v=1699"
    const out = injectOgMeta(page, { imageUrl: url, title: "Checkout broken · Klavity", description: "A bug" })
    expect(out).toContain(`property="og:image" content="${url}"`)
    expect(out).toContain(`name="twitter:image" content="${url}"`)
    expect(out).toContain(`name="twitter:card" content="summary_large_image"`)
    expect(out).toContain(`property="og:title" content="Checkout broken · Klavity"`)
    // inserted inside the head
    expect(out.indexOf("og:image")).toBeLessThan(out.indexOf("</head>"))
  })

  test("per-type: each type maps to its own /og/<ref>.png URL", () => {
    for (const [ref, ver] of [["fb_human", "10"], ["SIM-1521", "22"], ["fb_roast", "3"]] as const) {
      const url = `https://klavity.in/og/${ref}.png?v=${ver}`
      const out = injectOgMeta(page, { imageUrl: url, title: `${ref} · Klavity`, description: "d" })
      expect(out).toContain(`content="${url}"`)
    }
  })

  test("idempotent: does not double-inject when og:image already present", () => {
    const withOg = page.replace("</head>", `<meta property="og:image" content="x" /></head>`)
    const out = injectOgMeta(withOg, { imageUrl: "y", title: "t", description: "d" })
    expect(out).toBe(withOg)
    expect(out.split("og:image").length - 1).toBe(1)
  })
})
