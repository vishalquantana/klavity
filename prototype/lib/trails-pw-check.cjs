// Test helper (NOT production): evaluates selector strings in REAL Playwright, which cannot launch under Bun on Windows
// (chromium.launch() and connectOverCDP both hang), so the Bun tests spawn this file under Node.
//
// stdin : JSON { checks: [{ html, selector }] }
// stdout: JSON [{ count, ts, tier0 }] aligned to checks, where
//   count = page.locator(selector).count()
//   ts    = the data-t marker of every matched element (fixtures tag each target with data-t="...")
//   tier0 = what resolveTarget's Tier 0 (trails-runner.ts:524-537) decides for a cached selector: bounded attach-wait, then
//           count === 1 -> cache hit (no heal). Replicated here because trails-runner imports Bun-only modules (s3.ts).
const { chromium } = require("playwright")

;(async () => {
  let input = ""
  for await (const c of process.stdin) input += c
  const { checks } = JSON.parse(input)
  const browser = await chromium.launch({ headless: true })
  const out = []
  try {
    const page = await browser.newPage()
    for (const c of checks) {
      await page.setContent(c.html)
      let count = -1, ts = [], tier0 = { hit: false, t: null }, error = null
      try {
        const loc = page.locator(c.selector)
        count = await loc.count()
        for (let i = 0; i < count; i++) ts.push(await loc.nth(i).getAttribute("data-t"))
        const l2 = page.locator(c.selector)
        try { await l2.first().waitFor({ state: "attached", timeout: 2500 }) } catch {}
        const n = await l2.count()
        if (n === 1) tier0 = { hit: true, t: await l2.first().getAttribute("data-t") }
      } catch (e) { error = String(e).slice(0, 200) }
      out.push({ count, ts, tier0, error })
    }
  } finally { await browser.close() }
  process.stdout.write(JSON.stringify(out))
})().catch((e) => { process.stderr.write(String(e)); process.exit(1) })
