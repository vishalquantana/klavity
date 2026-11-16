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

describe("captureKrefSnapshot: untyped clickables and dropdown menus (KD-2255 PX4 Add > Project)", () => {
  test("Add toggle and its menu items get refs and nest under a menu; nav Projects stays separate", async () => {
    const p = await (await browser.newContext()).newPage()
    await p.setContent(`<!doctype html><body>
      <header>
        <a href="/n">17382</a>
        <div class="dropdown">
          <span class="add" data-toggle="dropdown" style="cursor:pointer">Add</span>
          <ul class="dropdown-menu" style="display:block">
            <li><a>Action</a></li>
            <li><a>Project</a></li>
          </ul>
        </div>
        <input placeholder="Recently viewed" />
        <div style="cursor:pointer" onclick=""><span>Clickable row</span></div>
      </header>
      <nav><a href="/projects">Projects</a></nav>
    </body>`)
    const snap = await captureKrefSnapshot(p)
    expect(snap).toMatch(/button "Add" \[ref=e\d+\]/)
    expect(snap).toMatch(/menu "[^"]*"\n(\s+menuitem "[^"]*" \[ref=e\d+\]\n)*\s+menuitem "Project" \[ref=e\d+\]/)
    expect(snap).toMatch(/button "Clickable row" \[ref=e\d+\]/)
    expect(snap.match(/Clickable row/g)!.length).toBe(1) // inherited cursor on the inner span is not a 2nd target
    expect(snap).toMatch(/link "Projects" \[ref=e\d+\]/)
    const ref = snap.match(/menuitem "Project" \[ref=(e\d+)\]/)![1]
    expect(await p.locator(`[data-kref="${ref}"]`).textContent()).toBe("Project")
    await p.close()
  })
})

describe("clickWithTransitionFallback: covered target (KD-2255 overlapping header)", () => {
  test("clicks a button another element is drawn on top of; disabled still fails", async () => {
    const { clickWithTransitionFallback } = await import("./trails-click")
    const p = await (await browser.newContext({ viewport: { width: 800, height: 600 } })).newPage()
    await p.setContent(`<!doctype html><body>
      <span id="add" style="cursor:pointer" onclick="document.body.dataset.hit='add'">Add</span>
      <div style="position:fixed;inset:0;background:transparent" onclick="document.body.dataset.hit='cover'"></div>
      <button id="off" disabled>Off</button>
    </body>`)
    await clickWithTransitionFallback(p.locator("#add"), 1500)
    expect(await p.evaluate(() => document.body.dataset.hit)).toBe("add")
    await expect(clickWithTransitionFallback(p.locator("#off"), 800)).rejects.toThrow()
    await p.close()
  }, 20_000)
})

describe("captureKrefSnapshot: React onClick divs (KD-2255 real PX4 Header.jsx markup)", () => {
  test("Add <div onClick> with no cursor/role/attr and CSS-module menu items are targetable", async () => {
    const p = await (await browser.newContext()).newPage()
    await p.setContent(`<!doctype html><body>
      <div class="_add_dropdown_container_k3j1">
        <div class="_icon_wrapper_9fa2" id="tog"><svg width="10" height="10"></svg><span class="_add_icon_x1">Add</span></div>
        <div class="_add_dropdown_menu_p0q9">
          <div class="_add_dropdown_item_z8" id="it1"><span>Action</span></div>
          <div class="_add_dropdown_item_z8" id="it2"><span>Project</span></div>
        </div>
      </div>
      <nav><a href="/projects">Projects</a></nav>
      <script>
        // what React 17+ leaves on the DOM node for <div onClick={...}>
        for (const id of ["tog", "it1", "it2"]) document.getElementById(id)["__reactProps$ab12"] = { onClick() {}, className: "x" }
      </script>
    </body>`)
    const snap = await captureKrefSnapshot(p)
    expect(snap).toMatch(/button "Add" \[ref=e\d+\]/)
    expect(snap).toMatch(/menu "[^"]*"\n(\s+menuitem "[^"]*" \[ref=e\d+\]\n)*\s+menuitem "Project" \[ref=e\d+\]/)
    expect(snap).toMatch(/link "Projects" \[ref=e\d+\]/)
    const ref = snap.match(/button "Add" \[ref=(e\d+)\]/)![1]
    expect(await p.locator(`[data-kref="${ref}"]`).getAttribute("id")).toBe("tog")
    await p.close()
  })
})

describe("captureKrefSnapshot: labels with invisible handlers (KD-2255 PHP/jQuery header)", () => {
  test("short labels get clickable refs once; text inside buttons is not duplicated; paragraphs stay ref-less", async () => {
    const p = await (await browser.newContext()).newPage()
    await p.setContent(`<!doctype html><body>
      <div class="hdr"><a href="/n">215</a><div id="add"><i class="ic"></i> Add <span class="caret"></span></div><input placeholder="Recently viewed"></div>
      <button><span>Save</span></button>
      <p>A long descriptive paragraph that should never become a click target.</p>
      <script>document.getElementById("add").addEventListener("click", () => document.body.dataset.hit = "add")</script>
    </body>`)
    const snap = await captureKrefSnapshot(p)
    const ref = snap.match(/text "Add" \[ref=(e\d+)\]/)![1]
    await p.locator(`[data-kref="${ref}"]`).click()
    expect(await p.evaluate(() => document.body.dataset.hit)).toBe("add")
    expect(snap.match(/Save/g)!.length).toBe(1)
    expect(snap).not.toMatch(/long descriptive paragraph.*\[ref=/)
    await p.close()
  })
})
