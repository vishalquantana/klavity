// KLAVITYKLA-342 regression tests — the three launch-blocking Bug Check defects:
//   1. FALSE POSITIVES: the model claimed 'Broken link "GitHub"' for a link that returns 200.
//   2. NON-DETERMINISM: the same URL scanned 3x returned 0 / 8 / 0 findings.
//   3. EMPTY RESULTS: a healthy page returned an empty array with nothing to show the user.
//
// Unit level here (pure/injectable helpers + a real loopback link server); the end-to-end route
// wiring is covered in server.bugcheck.test.ts.
import { expect, test, afterAll, beforeAll } from "bun:test"
import {
  extractLinks,
  extractInventory,
  verifyLinks,
  brokenLinkFindings,
  isLinkBreakageClaim,
  filterModelFindings,
  checkedSummary,
} from "./lib/bugcheck"

let linkServer: ReturnType<typeof Bun.serve>
let LINK_BASE = ""

beforeAll(() => {
  linkServer = Bun.serve({
    port: 0,
    fetch(req) {
      const p = new URL(req.url).pathname
      if (p === "/ok") return new Response("fine", { status: 200 })
      if (p === "/gone") return new Response("nope", { status: 404 })
      if (p === "/moved") return new Response("", { status: 302, headers: { location: "/ok" } })
      // HEAD-hostile host: 405 on HEAD, 200 on GET. A naive HEAD-only checker would call this broken.
      if (p === "/headhostile") return new Response(req.method === "HEAD" ? "" : "fine", { status: req.method === "HEAD" ? 405 : 200 })
      return new Response("root", { status: 200 })
    },
  })
  LINK_BASE = `http://localhost:${linkServer.port}`
})

afterAll(() => { linkServer?.stop(true) })

// ── Bug 1: false-positive broken-link claims ───────────────────────────────────────────────────

test("BUG 1: a link that actually returns 200 is NEVER reported as broken", async () => {
  const html = `<html><body><a href="/ok">GitHub &#8599;</a></body></html>`
  const links = extractLinks(html, LINK_BASE)
  expect(links.length).toBe(1)
  expect(links[0].href).toBe(`${LINK_BASE}/ok`)
  const checks = await verifyLinks(links, (u, init) => fetch(u, init))
  expect(checks[0].ok).toBe(true)
  expect(checks[0].status).toBe(200)
  expect(brokenLinkFindings(checks)).toEqual([])
})

test("BUG 1: a link that really 404s IS reported, with the verified status in the reason", async () => {
  const html = `<a href="${LINK_BASE}/gone">Docs</a>`
  const checks = await verifyLinks(extractLinks(html, LINK_BASE), (u, init) => fetch(u, init))
  expect(checks[0].ok).toBe(false)
  const findings = brokenLinkFindings(checks)
  expect(findings.length).toBe(1)
  expect(findings[0].what).toContain("Docs")
  expect(findings[0].why).toContain("404")
  expect(findings[0].severity).toBe("high")
})

test("BUG 1: a 3xx redirect to a working page counts as healthy, not broken", async () => {
  const checks = await verifyLinks(extractLinks(`<a href="/moved">Blog</a>`, LINK_BASE), (u, init) => fetch(u, init))
  expect(checks[0].ok).toBe(true)
  expect(brokenLinkFindings(checks)).toEqual([])
})

test("BUG 1: a host that rejects HEAD but serves GET is confirmed with GET before being called broken", async () => {
  const checks = await verifyLinks(extractLinks(`<a href="/headhostile">Pricing</a>`, LINK_BASE), (u, init) => fetch(u, init))
  expect(checks[0].ok).toBe(true)
  expect(brokenLinkFindings(checks)).toEqual([])
})

test("BUG 1: model-authored broken-link claims are discarded (the model cannot know)", () => {
  // This is the exact finding the smoke test caught on klavity.in.
  expect(isLinkBreakageClaim({ what: 'Broken link "GitHub ↗"', where: "Header navigation", why: "Users hit a dead end." })).toBe(true)
  expect(isLinkBreakageClaim({ what: "Dead URL in the footer", where: "footer", why: "404" })).toBe(true)
  // Non-link breakage the model IS allowed to report must survive.
  expect(isLinkBreakageClaim({ what: 'Sync status shows literal "undefined"', where: "last sync", why: "Looks unfinished." })).toBe(false)
  expect(isLinkBreakageClaim({ what: "Broken hero button", where: ".hero-cta", why: "Primary action fails." })).toBe(false)
})

test("BUG 1: filterModelFindings drops link claims and de-dupes against verified findings", () => {
  const verified = [{ what: 'Broken link "Docs"', where: "/gone", why: "HTTP 404", severity: "high" }]
  const model = [
    { what: 'Broken link "GitHub"', where: "Header navigation", why: "dead", severity: "high" },
    { what: 'Broken link "Docs"', where: "footer", why: "404", severity: "high" },
    { what: "Active-user count shows NaN", where: "stats row", why: "Undermines trust.", severity: "low" },
  ]
  const kept = filterModelFindings(model, verified)
  expect(kept.map((f) => f.what)).toEqual(["Active-user count shows NaN"])
})

// ── Bug 3: zero findings must still say what was checked ──────────────────────────────────────

test("BUG 3: a healthy page still produces a concrete 'here is what we checked' summary", () => {
  const html = `<html><body>
    <a href="/a">A</a><a href="/b">B</a>
    <form><input name="email"><button>Go</button></form>
  </body></html>`
  const inv = extractInventory(html)
  expect(inv.links).toBe(2)
  expect(inv.forms).toBe(1)
  expect(inv.buttons).toBe(1)
  const summary = checkedSummary(inv, 2)
  expect(summary).toContain("2 links")
  expect(summary).toContain("1 form")
  expect(summary).toContain("1 button")
})

// ── Link extraction hygiene ───────────────────────────────────────────────────────────────────

test("extractLinks skips mailto/tel/javascript/fragment hrefs and de-dupes", () => {
  const html = `
    <a href="mailto:a@b.com">Mail</a>
    <a href="tel:+1">Call</a>
    <a href="javascript:void(0)">JS</a>
    <a href="#top">Top</a>
    <a href="/dup">Dup</a>
    <a href="/dup#frag">Dup again</a>`
  const links = extractLinks(html, "https://example.com")
  expect(links.map((l) => l.href)).toEqual(["https://example.com/dup"])
})

test("extractLinks caps the number of links resolved per scan", () => {
  const html = Array.from({ length: 40 }, (_, i) => `<a href="/p${i}">P${i}</a>`).join("")
  expect(extractLinks(html, "https://example.com").length).toBe(12)
})

test("verifyLinks treats a connection failure as broken, not as healthy", async () => {
  const checks = await verifyLinks(
    [{ href: "https://example.com/x", text: "X" }],
    async () => { throw new Error("ECONNREFUSED") },
  )
  expect(checks[0].ok).toBe(false)
  expect(checks[0].status).toBe(null)
  expect(brokenLinkFindings(checks)[0].why).toContain("didn't respond")
})
