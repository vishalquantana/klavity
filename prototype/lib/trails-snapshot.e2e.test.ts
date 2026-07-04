// Serializer e2e on a real chromium page (same pattern as trails-runner.e2e.test.ts).
import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { chromium, type Browser, type Page } from "playwright"
import { captureKrefSnapshot, stableSelectorFor, isKrefSelector, KREF_SNAPSHOT_CAP } from "./trails-snapshot"

const FIXTURE = `<!doctype html><html><head><title>t</title>
<style>.hidden{display:none}</style><script>window.__x=1</script></head><body>
  <h1>Welcome to Acme</h1>
  <p>Short intro paragraph for the digest.</p>
  <nav>
    <a href="/pricing">Pricing</a>
    <a href="/hidden" class="hidden">Hidden link</a>
  </nav>
  <form>
    <label for="em">Email</label>
    <input id="em" type="email" placeholder="you@example.com" />
    <input type="password" name="pw" aria-label="Password" />
    <button data-testid="submit-btn" disabled>Sign in</button>
    <button>No stable handle</button>
  </form>
</body></html>`

let browser: Browser, page: Page
beforeAll(async () => {
  browser = await chromium.launch()
  page = await (await browser.newContext()).newPage()
  await page.setContent(FIXTURE)
})
afterAll(async () => { await browser.close() })

describe("captureKrefSnapshot", () => {
  test("emits refs for interactive elements and stamps matching data-kref attrs", async () => {
    const snap = await captureKrefSnapshot(page)
    // every [ref=eN] line resolves to exactly one element via [data-kref="eN"]
    const refs = [...snap.matchAll(/\[ref=(e\d+)\]/g)].map((m) => m[1])
    expect(refs.length).toBeGreaterThanOrEqual(5) // 1 link + 2 inputs + 2 buttons
    for (const r of refs) expect(await page.locator(`[data-kref="${r}"]`).count()).toBe(1)
    // refs are unique
    expect(new Set(refs).size).toBe(refs.length)
  })
  test("includes roles, accessible names, disabled state; excludes hidden/script/style", async () => {
    const snap = await captureKrefSnapshot(page)
    expect(snap).toContain(`link "Pricing"`)
    expect(snap).toContain(`textbox "you@example.com"`)
    expect(snap).toContain(`textbox "Password"`)
    expect(snap).toMatch(/button "Sign in" \{disabled\} \[ref=e\d+\]/)
    expect(snap).not.toContain("Hidden link")
    expect(snap).not.toContain("window.__x")
    expect(snap).not.toContain(".hidden{")
  })
  test("structural text (headings, labels, short paragraphs) has NO refs", async () => {
    const snap = await captureKrefSnapshot(page)
    const h1line = snap.split("\n").find((l) => l.includes("Welcome to Acme"))!
    expect(h1line).toBeDefined()
    expect(h1line).not.toContain("[ref=")
    expect(snap).toContain("Short intro paragraph")
  })
  test("re-capture renumbers cleanly (no duplicate stamps)", async () => {
    await captureKrefSnapshot(page)
    const snap2 = await captureKrefSnapshot(page)
    const refs = [...snap2.matchAll(/\[ref=(e\d+)\]/g)].map((m) => m[1])
    for (const r of refs) expect(await page.locator(`[data-kref="${r}"]`).count()).toBe(1)
  })
  test("caps output with a truncation marker", async () => {
    const big = `<body>${Array.from({ length: 3000 }, (_, i) => `<a href="/l${i}">Link number ${i} with some padding text</a>`).join("")}</body>`
    const p2 = await (await browser.newContext()).newPage()
    await p2.setContent(big)
    const snap = await captureKrefSnapshot(p2, 5_000)
    expect(snap.length).toBeLessThanOrEqual(5_000 + 40)
    expect(snap).toContain("[snapshot truncated]")
    await p2.close()
    expect(KREF_SNAPSHOT_CAP).toBe(24_000)
  })
})

describe("stableSelectorFor", () => {
  test("prefers #id, then data-testid, then aria-label; null when nothing stable", async () => {
    await captureKrefSnapshot(page)
    expect(await stableSelectorFor(page.locator("#em"))).toBe("#em")
    expect(await stableSelectorFor(page.locator('[data-testid="submit-btn"]'))).toBe('[data-testid="submit-btn"]')
    expect(await stableSelectorFor(page.locator('input[name="pw"]'))).toBe('input[aria-label="Password"]')
    expect(await stableSelectorFor(page.locator("form button").nth(1))).toBeNull()
  })
})

describe("isKrefSelector", () => {
  test("matches exactly the stamped form", () => {
    expect(isKrefSelector('[data-kref="e12"]')).toBe(true)
    expect(isKrefSelector("#em")).toBe(false)
    expect(isKrefSelector('[data-kref="e12"] > span')).toBe(false)
    expect(isKrefSelector(null)).toBe(false)
  })
})
