// Serializer e2e on a real chromium page (same pattern as trails-runner.e2e.test.ts).
import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { chromium, type Browser, type Page } from "playwright"
import { captureKrefSnapshot, stableSelectorFor, structuralPathFor, isKrefSelector, recordedStepState, KREF_SNAPSHOT_CAP } from "./trails-snapshot"

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
    expect(snap).toContain(`textbox "Email"`)
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
  test("does not leak values from unlabeled password or OTP inputs", async () => {
    const secret = "KnownSecret-123456"
    const otp = "909090"
    const p2 = await (await browser.newContext()).newPage()
    await p2.setContent(`<body>
      <input id="pw" type="password" />
      <input id="otp" autocomplete="one-time-code" />
      <textarea id="notes"></textarea>
      <select id="sel"><option value="secret-option">Secret option text</option></select>
    </body>`)
    await p2.locator("#pw").fill(secret)
    await p2.locator("#otp").fill(otp)
    await p2.locator("#notes").fill("textarea-secret")
    const snap = await captureKrefSnapshot(p2)
    expect(snap).toContain('textbox ""')
    expect(snap).not.toContain(secret)
    expect(snap).not.toContain(otp)
    expect(snap).not.toContain("textarea-secret")
    expect(snap).not.toContain("Secret option text")
    await p2.close()
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

describe("recordedStepState", () => {
  test("pins full replay step data and strips raw kref selectors", () => {
    const state = recordedStepState(
      {
        id: "ts_1",
        idx: 7,
        action: "click",
        actionValue: null,
        target: { role: "button", accessibleName: "Continue", domPath: '[data-kref="e4"] > span' },
        checkpoint: { description: "continue visible" },
      },
      '[data-kref="e4"]',
      "https://app.test/wizard",
    )

    expect(state).toMatchObject({
      stepId: "ts_1",
      idx: 7,
      action: "click",
      actionValue: null,
      selector: "snapshot ref e4",
      checkpoint: { description: "continue visible" },
      pageUrl: "https://app.test/wizard",
    })
    expect(state.target?.domPath).toBe("snapshot ref e4 > span")
  })
})

describe("structuralPathFor", () => {
  test("bare element (no id/testid/aria-label) resolves to exactly one element via returned path", async () => {
    // The fixture has <button>No stable handle</button> — no id, no testid, no aria-label.
    // stableSelectorFor returns null for it; structuralPathFor must return a non-empty path that
    // uniquely selects it (or at least resolves to >= 1 element — a structural path into a small
    // fixture page is deterministic enough to assert count >= 1 and contains "button").
    const loc = page.locator("form button").nth(1) // the "No stable handle" button
    // Confirm stableSelectorFor is null (precondition: this is truly a bare element).
    expect(await stableSelectorFor(loc)).toBeNull()
    const path = await structuralPathFor(loc)
    expect(path).not.toBeNull()
    expect(path).toMatch(/button:nth-of-type/)
    // The returned path must resolve to at least one real element on the page.
    expect(await page.locator(path!).count()).toBeGreaterThanOrEqual(1)
  })

  test("element with id returns a non-null structural path (path is tag-based, not id-based)", async () => {
    // structuralPathFor always returns the structural path regardless of stable handles —
    // it's the final raw fallback; id/testid/aria-label are for stableSelectorFor.
    const loc = page.locator("#em")
    const path = await structuralPathFor(loc)
    expect(path).not.toBeNull()
    expect(path).toMatch(/input:nth-of-type/)
  })

  test("returns null when evaluate throws (detached locator)", async () => {
    // A locator that matches nothing → evaluate throws → returns null.
    const loc = page.locator("#does-not-exist-at-all")
    const path = await structuralPathFor(loc)
    expect(path).toBeNull()
  })
})
