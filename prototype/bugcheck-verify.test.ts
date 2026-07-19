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
  isGrounded,
  MIN_EVIDENCE_LEN,
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
  const links = await extractLinks(html, LINK_BASE)
  expect(links.length).toBe(1)
  expect(links[0].href).toBe(`${LINK_BASE}/ok`)
  const checks = await verifyLinks(links, (u, init) => fetch(u, init))
  expect(checks[0].ok).toBe(true)
  expect(checks[0].status).toBe(200)
  expect(brokenLinkFindings(checks)).toEqual([])
})

test("BUG 1: a link that really 404s IS reported, with the verified status in the reason", async () => {
  const html = `<a href="${LINK_BASE}/gone">Docs</a>`
  const checks = await verifyLinks(await extractLinks(html, LINK_BASE), (u, init) => fetch(u, init))
  expect(checks[0].ok).toBe(false)
  const findings = brokenLinkFindings(checks)
  expect(findings.length).toBe(1)
  expect(findings[0].what).toContain("Docs")
  expect(findings[0].why).toContain("404")
  expect(findings[0].severity).toBe("high")
})

test("BUG 1: a 3xx redirect to a working page counts as healthy, not broken", async () => {
  const checks = await verifyLinks(await extractLinks(`<a href="/moved">Blog</a>`, LINK_BASE), (u, init) => fetch(u, init))
  expect(checks[0].ok).toBe(true)
  expect(brokenLinkFindings(checks)).toEqual([])
})

test("BUG 1: a HEAD-hostile host is healthy — we probe with GET, which is what a visitor does", async () => {
  const checks = await verifyLinks(await extractLinks(`<a href="/headhostile">Pricing</a>`, LINK_BASE), (u, init) => fetch(u, init))
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

test("extractLinks skips mailto/tel/javascript/fragment hrefs and de-dupes", async () => {
  const html = `
    <a href="mailto:a@b.com">Mail</a>
    <a href="tel:+1">Call</a>
    <a href="javascript:void(0)">JS</a>
    <a href="#top">Top</a>
    <a href="/dup">Dup</a>
    <a href="/dup#frag">Dup again</a>`
  const links = await extractLinks(html, "https://example.com")
  expect(links.map((l) => l.href)).toEqual(["https://example.com/dup"])
})

test("extractLinks caps the number of links resolved per scan", async () => {
  const html = Array.from({ length: 40 }, (_, i) => `<a href="/p${i}">P${i}</a>`).join("")
  expect((await extractLinks(html, "https://example.com")).length).toBe(12)
})

test("verifyLinks reports a NON-EXISTENT DOMAIN (DNS failure) as broken", async () => {
  const checks = await verifyLinks(
    [{ href: "https://example.com/x", text: "X" }],
    async () => { throw Object.assign(new Error("getaddrinfo ENOTFOUND example.com"), { code: "ENOTFOUND" }) },
  )
  expect(checks[0].verdict).toBe("broken")
  expect(checks[0].status).toBe(null)
  expect(brokenLinkFindings(checks)[0].why).toContain("doesn't resolve")
})


// ── KLAVITYKLA-342 FALSE POSITIVES: evidence grounding ────────────────────────────────────────
// A finding only ships if it quotes text that provably exists on the fetched page.

const PAGE = "Acme Dashboard\nWelcome back. Your last sync was undefined. NaN active users."
const f = (over: Partial<Parameters<typeof isGrounded>[0]> = {}) =>
  ({ what: "w", where: "x", why: "y", severity: "medium", ...over }) as Parameters<typeof isGrounded>[0]

test("isGrounded: a verbatim quote from the page grounds the finding", () => {
  expect(isGrounded(f({ evidence: "last sync was undefined" }), PAGE)).toBe(true)
})

test("isGrounded: whitespace/case differences still ground (models reflow text)", () => {
  expect(isGrounded(f({ evidence: "Last   Sync\n was UNDEFINED" }), PAGE)).toBe(true)
})

test("isGrounded: a fabricated quote does NOT ground — this is the false-positive gate", () => {
  expect(isGrounded(f({ evidence: "Payment declined - please retry" }), PAGE)).toBe(false)
})

test("isGrounded: a missing or empty evidence field does not ground", () => {
  expect(isGrounded(f(), PAGE)).toBe(false)
  expect(isGrounded(f({ evidence: "   " }), PAGE)).toBe(false)
})

test("isGrounded: a too-short quote is rejected even though it occurs on the page", () => {
  // "NaN" IS on the page, but a 3-char quote grounds by coincidence, not by evidence.
  expect("NaN".length).toBeLessThan(MIN_EVIDENCE_LEN)
  expect(isGrounded(f({ evidence: "NaN" }), PAGE)).toBe(false)
})

test("filterModelFindings drops ungrounded findings but keeps grounded ones", () => {
  const findings = [
    f({ what: "Sync shows undefined", evidence: "last sync was undefined" }),
    f({ what: "Checkout button fails to submit", evidence: "Payment declined" }),
  ]
  const kept = filterModelFindings(findings, [], PAGE)
  expect(kept.map((k) => k.what)).toEqual(["Sync shows undefined"])
})

test("filterModelFindings without pageText skips grounding (back-compat for non-qa callers)", () => {
  const findings = [f({ what: "Something", evidence: "not on the page at all" })]
  expect(filterModelFindings(findings, []).length).toBe(1)
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// KLAVITYKLA-347 — founder-reported quality defects, reproduced live on klavity.in.
//
//   BUG 1  A regex over the RAW source treated JS string fragments inside <script> as anchors, so
//          the scan reported our OWN SOURCE CODE as a HIGH-severity broken link.
//   BUG 2  Any non-2xx (403 bot wall) or any thrown error (timeout) was reported as "broken",
//          telling prospects their working links were dead.
//   BUG 3  Only the entered page was scanned.
// ═══════════════════════════════════════════════════════════════════════════════════════════════

import { sameOriginCrawlTargets } from "./lib/bugcheck"

// ── BUG 1: hrefs that only exist inside JavaScript are not links ───────────────────────────────

test("BUG 1 (regression): an href inside a <script> string is NOT extracted as a link", async () => {
  // VERBATIM construct from site/index.html:717 — the exact source line that produced the
  // reported false positive `https://klavity.in/'%20+%20esc(onboardingHref(url))%20+%20'`.
  const html = `<html><body>
    <a href="/pricing">Pricing</a>
    <script>
      slot.innerHTML = '<div class="hd-cta-row"><a class="btn btn-indigo" href="' + esc(onboardingHref(url)) + '">Start free</a></div>'
    </script>
  </body></html>`
  const links = await extractLinks(html, "https://klavity.in")
  expect(links.map((l) => l.href)).toEqual(["https://klavity.in/pricing"])
  // The specific garbage URL the founder saw must not appear at all.
  expect(links.some((l) => l.href.includes("onboardingHref"))).toBe(false)
})

test("BUG 1 (regression): hrefs in <style>, <template>, <noscript> and comments are not links", async () => {
  const html = `<html><body>
    <a href="/real">Real</a>
    <style>a[href="/fake-css"] { color: red }</style>
    <template><a href="/fake-template">T</a></template>
    <noscript><a href="/fake-noscript">N</a></noscript>
    <!-- <a href="/fake-comment">C</a> -->
  </body></html>`
  const links = await extractLinks(html, "https://example.com")
  expect(links.map((l) => l.href)).toEqual(["https://example.com/real"])
})

test("BUG 1 (regression): relative, root-relative, protocol-relative and absolute hrefs all resolve", async () => {
  const html = `
    <a href="about">Rel</a>
    <a href="/docs">Root</a>
    <a href="//cdn.example.org/x">Proto</a>
    <a href="https://other.test/y">Abs</a>
    <a href="../up">Up</a>`
  const links = await extractLinks(html, "https://example.com/blog/post")
  expect(links.map((l) => l.href)).toEqual([
    "https://example.com/blog/about",
    "https://example.com/docs",
    "https://cdn.example.org/x",
    "https://other.test/y",
    "https://example.com/up",
  ])
})

test("BUG 1 (regression): mailto:, tel:, javascript:, data: and #fragments are skipped", async () => {
  const html = `
    <a href="mailto:hi@klavity.in">Email</a>
    <a href="tel:+61400000000">Call</a>
    <a href="javascript:void(0)">JS</a>
    <a href="data:text/html,x">Data</a>
    <a href="sms:+61400000000">SMS</a>
    <a href="#pricing">Jump</a>
    <a href="">Empty</a>
    <a>No href</a>
    <a href="/keep">Keep</a>`
  const links = await extractLinks(html, "https://klavity.in")
  expect(links.map((l) => l.href)).toEqual(["https://klavity.in/keep"])
})

// ── BUG 2: only unambiguous failures are reported ──────────────────────────────────────────────

const one = (href: string) => [{ href, text: "Chrome Web Store" }]

test("BUG 2 (regression): a 403 bot wall is INCONCLUSIVE, never reported as broken", async () => {
  // Reproduces the reported false positive: chromewebstore.google.com 403s a datacentre GET but
  // works perfectly in a browser.
  const checks = await verifyLinks(
    one("https://chromewebstore.google.com/detail/klavity"),
    async () => new Response("blocked", { status: 403 }),
  )
  expect(checks[0].verdict).toBe("inconclusive")
  expect(brokenLinkFindings(checks)).toEqual([])
})

test("BUG 2 (regression): a timeout is INCONCLUSIVE, never reported as broken", async () => {
  const checks = await verifyLinks(
    one("https://slow.test/x"),
    async () => { throw Object.assign(new Error("The operation timed out."), { name: "TimeoutError" }) },
  )
  expect(checks[0].verdict).toBe("inconclusive")
  expect(brokenLinkFindings(checks)).toEqual([])
})

test("BUG 2 (regression): 405/429/500/401 are all INCONCLUSIVE, never reported as broken", async () => {
  for (const status of [401, 405, 408, 429, 500, 502, 503]) {
    const checks = await verifyLinks(one(`https://x.test/${status}`), async () => new Response("", { status }))
    expect(checks[0].verdict).toBe("inconclusive")
    expect(brokenLinkFindings(checks)).toEqual([])
  }
})

test("BUG 2 (regression): 404 and 410 ARE reported as broken", async () => {
  for (const status of [404, 410]) {
    const checks = await verifyLinks(one(`https://x.test/${status}`), async () => new Response("", { status }))
    expect(checks[0].verdict).toBe("broken")
    expect(brokenLinkFindings(checks).length).toBe(1)
  }
})

test("BUG 2 (regression): a TLS/connection reset is INCONCLUSIVE, not broken", async () => {
  const checks = await verifyLinks(
    one("https://x.test/tls"),
    async () => { throw Object.assign(new Error("socket connection was closed unexpectedly"), { code: "ECONNRESET" }) },
  )
  expect(checks[0].verdict).toBe("inconclusive")
  expect(brokenLinkFindings(checks)).toEqual([])
})

test("BUG 2: link checks use a browser User-Agent and GET, not a bot HEAD", async () => {
  let seenMethod = "", seenUA = ""
  await verifyLinks(one("https://x.test/ua"), async (_u, init) => {
    seenMethod = String(init.method)
    seenUA = String((init.headers as Record<string, string>)["user-agent"])
    return new Response("", { status: 200 })
  })
  expect(seenMethod).toBe("GET")
  expect(seenUA).toContain("Mozilla/5.0")
})

test("BUG 2: a broken EXTERNAL link is medium severity; a broken OWN-SITE link stays high", async () => {
  const checks = await verifyLinks(
    [
      { href: "https://klavity.in/gone", text: "Docs" },
      { href: "https://third-party.test/gone", text: "Partner" },
    ],
    async () => new Response("", { status: 404 }),
    { baseUrl: "https://klavity.in/" },
  )
  const findings = brokenLinkFindings(checks)
  expect(findings.find((f) => f.where.includes("klavity.in"))!.severity).toBe("high")
  expect(findings.find((f) => f.where.includes("third-party"))!.severity).toBe("medium")
})

// ── BUG 3: bounded same-origin crawl ───────────────────────────────────────────────────────────

test("BUG 3: crawl targets are same-origin only, deduped, and exclude the entered page", async () => {
  const links = await extractLinks(`
    <a href="/pricing">Pricing</a>
    <a href="/docs">Docs</a>
    <a href="/">Home</a>
    <a href="/pricing/">Pricing again</a>
    <a href="https://twitter.com/klavity">Twitter</a>
    <a href="/logo.png">Logo</a>
    <a href="/paper.pdf">Paper</a>`, "https://klavity.in/")
  const targets = sameOriginCrawlTargets(links, "https://klavity.in/", 4)
  expect(targets).toEqual(["https://klavity.in/pricing", "https://klavity.in/docs"])
})

test("BUG 3: crawl target count is hard-capped", async () => {
  const html = Array.from({ length: 20 }, (_, i) => `<a href="/p${i}">P${i}</a>`).join("")
  const links = await extractLinks(html, "https://klavity.in/", 50)
  expect(sameOriginCrawlTargets(links, "https://klavity.in/", 4).length).toBe(4)
})

test("BUG 3: shallow (nav/footer) paths are preferred over deep permalinks", async () => {
  const links = await extractLinks(`
    <a href="/blog/2026/07/some-long-post-slug">Deep</a>
    <a href="/pricing">Pricing</a>`, "https://klavity.in/")
  expect(sameOriginCrawlTargets(links, "https://klavity.in/", 1)).toEqual(["https://klavity.in/pricing"])
})

test("BUG 3: the checked-summary reports how many pages were read", () => {
  const inv = { links: 9, forms: 1, buttons: 3, inputs: 2 }
  expect(checkedSummary(inv, 9, 5)).toContain("5 pages")
  expect(checkedSummary(inv, 9, 1)).not.toContain("pages,")
})
