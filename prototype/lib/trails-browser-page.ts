// Browser adapter for the AutoSims AUTHOR drive. One small selector-based interface, two impls:
//   • Playwright (default) — local chromium.launch, keeps Playwright's auto-wait/actionability.
//   • Puppeteer-over-CDP — connects to a remote browser (Steel.dev) when AUTOSIM_CDP_URL is set;
//     re-adds actionability explicitly (waitForSelector visible) since Puppeteer has no Locator.
// Rationale + cost/perf: docs/steel-remote-browser.md (Steel section) + the 2026-07-04 spike.
// The runner (trails-runner.ts) keeps a native Playwright Browser (its heal ladder is deeply coupled
// to Playwright getByRole/getByText/networkidle), but its REMOTE/Steel connect now bridges through
// puppeteer-core: Playwright's connectOverCDP HANGS against Steel, so puppeteer connects first and
// hands Playwright the resolved devtools endpoint. See acquirePlaywrightBrowser + createSteelSession.
import type { Fingerprint, NetworkMock as TrailNetworkMock, TrailViewport } from "./trails-types"
import { KREF_SNAPSHOT_CAP } from "./trails-snapshot"
import { clickWithTransitionFallback } from "./trails-click"
// ── Network mocking (KLA-111) ─────────────────────────────────────────────────────────────────────
// A Trail can declare zero or more mocks. Each mock matches browser requests by URL pattern
// (exact string, glob-style "*" wildcard, or RegExp). The first matching mock wins.
//
// Two actions:
//   stub  — reply with a canned body + optional status/contentType (default 200 + text/plain).
//   block — abort the request (like an ad-blocker); the browser sees a network error.
//
// Usage:
//   const page = await handle.newPage()
//   await page.interceptNetwork([{ url: '**/api/flags', stub: { body: '{"dark":true}', contentType: 'application/json' } }])
//   await page.goto(url, timeout)
export type NetworkMockStub = {
  /** HTTP status code. Default 200. */
  status?: number
  /** Response body as a string. Default empty string. */
  body?: string
  /** Content-Type header. Default 'text/plain'. */
  contentType?: string
}
/**
 * Describes a single network interception rule.
 * Match order: the first rule whose `url` pattern matches a request wins.
 * `url` accepts an exact URL string, a glob pattern ("**", "*"), or a RegExp.
 */
export type BrowserNetworkMock =
  | { url: string | RegExp; stub: NetworkMockStub; block?: never }
  | { url: string | RegExp; block: true; stub?: never }
export type NetworkMock = BrowserNetworkMock | TrailNetworkMock

function isBlockedMock(mock: NetworkMock): boolean {
  return Boolean((mock as any).block) || (mock as any).action === "block"
}

function stubForMock(mock: NetworkMock): NetworkMockStub {
  const raw = mock as any
  return raw.stub ?? {
    status: raw.status,
    body: raw.body,
    contentType: raw.contentType,
  }
}

/** Return true if `requestUrl` matches `pattern` (string glob or RegExp). */
export function matchesMock(pattern: string | RegExp, requestUrl: string): boolean {
  if (pattern instanceof RegExp) return pattern.test(requestUrl)
  if (!pattern.includes("*") && !/^[a-z][a-z0-9+.-]*:/i.test(pattern)) {
    return requestUrl.includes(pattern)
  }
  // Build a regex from the glob pattern. Process ** before * to avoid double-substitution:
  // replace ** with a placeholder first, then * with [^/]*, then restore the placeholder as .*
  // This prevents ".* " from having its "*" re-replaced by the single-star handler.
  const DSTAR = "\u0000DSTAR\u0000"
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // escape regex special chars (not *)
    .replace(/\*\*/g, DSTAR)                    // save ** as placeholder
    .replace(/\*/g, "[^/]*")                     // single * → within-segment glob
    .replace(new RegExp(DSTAR, "g"), ".*")        // restore ** → any-segment glob
  // When the pattern starts with ".*" (i.e. started with "**"), it must match from anywhere
  // in the URL, so we skip the "^" anchor to allow prefix-matching.
  const anchored = escaped.startsWith(".*") ? escaped + "$" : "^" + escaped + "$"
  return new RegExp(anchored).test(requestUrl)
}


// ── Page-context evaluate bodies (run in the browser; NO module-scope closures). Shared verbatim by
//    both drivers — Playwright and Puppeteer both serialize a function to the page identically. ──────
/* eslint-disable */
function krefSnapshotBody(): string {
  document.querySelectorAll("[data-kref]").forEach((el) => el.removeAttribute("data-kref"))
  let n = 0
  const lines: string[] = []
  const SKIP = new Set(["script", "style", "noscript", "svg", "template", "iframe"])
  const INTERACTIVE = new Set(["a", "button", "input", "select", "textarea", "summary", "option"])
  const TEXTUAL = new Set(["label", "p", "li", "td", "th", "figcaption", "blockquote"])
  const visible = (el: Element): boolean => {
    const r = (el as HTMLElement).getBoundingClientRect?.()
    if (!r || (r.width === 0 && r.height === 0)) return false
    const s = getComputedStyle(el as HTMLElement)
    return s.display !== "none" && s.visibility !== "hidden"
  }
  const roleOf = (el: Element): string | null => {
    const explicit = el.getAttribute("role")
    if (explicit) return explicit
    const t = el.tagName.toLowerCase()
    if (t === "a" && el.hasAttribute("href")) return "link"
    if (t === "button" || (t === "input" && ["button", "submit"].includes((el as HTMLInputElement).type))) return "button"
    if (t === "input") {
      const ty = (el as HTMLInputElement).type
      return ty === "checkbox" ? "checkbox" : ty === "radio" ? "radio" : "textbox"
    }
    if (t === "select") return "combobox"
    if (t === "textarea") return "textbox"
    if (t === "summary") return "button"
    if (t === "option") return "option"
    if (/^h[1-6]$/.test(t)) return "heading"
    if (t === "img" && el.getAttribute("alt")) return "img"
    return null
  }
  const labelFor = (el: Element): string => {
    const id = el.getAttribute("id")
    if (id) {
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`)
      const text = (label?.textContent || "").trim()
      if (text) return text
    }
    const wrapping = el.closest("label")
    return (wrapping?.textContent || "").trim()
  }
  const isFormControl = (el: Element): boolean => {
    const t = el.tagName.toLowerCase()
    return t === "input" || t === "textarea" || t === "select"
  }
  const nameOf = (el: Element): string => {
    const cand = isFormControl(el)
      ? labelFor(el) || el.getAttribute("aria-label") || el.getAttribute("placeholder") ||
        el.getAttribute("name") || el.getAttribute("title") || ""
      : el.getAttribute("aria-label") || (el as HTMLImageElement).alt || (el.textContent || "").trim() ||
        el.getAttribute("name") || el.getAttribute("title") || ""
    return cand.replace(/\s+/g, " ").slice(0, 80)
  }
  const walk = (el: Element, depth: number) => {
    for (const child of Array.from(el.children)) {
      const t = child.tagName.toLowerCase()
      if (SKIP.has(t)) continue
      let emitted = false
      if (visible(child)) {
        const role = roleOf(child)
        const indent = "  ".repeat(Math.min(depth, 6))
        if (role) {
          let line = `${indent}${role} "${nameOf(child)}"`
          if ((child as HTMLInputElement).disabled) line += " {disabled}"
          // Fill-state signal (KLA: criticalpath1 stall): without it the model cannot see that its
          // own `type` succeeded (the accessible name is just the placeholder) and loops re-typing.
          // Deliberately length-only — resolved {{cred:...}} values must never enter LLM context.
          if (isFormControl(child)) {
            const iv = child as HTMLInputElement
            if (role === "checkbox" || role === "radio") { if (iv.checked) line += " {checked}" }
            else if (child.tagName.toLowerCase() === "select") {
              const sel = child as unknown as HTMLSelectElement
              const optText = (sel.selectedOptions?.[0]?.textContent || "").trim().slice(0, 40)
              if (optText) line += ` {selected: "${optText}"}`
            }
            else if (typeof iv.value === "string" && iv.value.length) line += ` {filled: ${iv.value.length} chars}`
          }
          if (INTERACTIVE.has(t) || child.getAttribute("role")) {
            const ref = `e${++n}`
            child.setAttribute("data-kref", ref)
            line += ` [ref=${ref}]`
          }
          lines.push(line)
          emitted = true
        } else if (TEXTUAL.has(t)) {
          const own = (child.textContent || "").trim().replace(/\s+/g, " ")
          if (own && own.length >= 3 && child.children.length === 0) {
            lines.push(`${indent}text "${own.slice(0, 80)}"`)
            emitted = true
          }
        }
      }
      walk(child, emitted ? depth + 1 : depth)
    }
  }
  walk(document.body, 0)
  return lines.join("\n")
}

function fingerprintBody(el: Element): Fingerprint {
  const tag = el.tagName.toLowerCase()
  const roleMap: Record<string, string> = { button: "button", a: "link", input: "textbox", select: "combobox", textarea: "textbox" }
  const text = (el.textContent || "").trim().slice(0, 80)
  const accName = el.getAttribute("aria-label") || (el as any).placeholder || text
  let path = "", cur: Element | null = el
  for (let d = 0; cur && d < 4; d++) {
    let i = 1, sib = cur.previousElementSibling
    while (sib) { if (sib.tagName === cur.tagName) i++; sib = sib.previousElementSibling }
    path = cur.tagName.toLowerCase() + ":nth-of-type(" + i + ")" + (path ? ">" + path : "")
    cur = cur.parentElement
  }
  return {
    role: el.getAttribute("role") || roleMap[tag] || undefined,
    accessibleName: accName || undefined, text: text || undefined,
    testId: el.getAttribute("data-testid") || undefined, domPath: path,
  }
}

function stableSelectorBody(el: Element): string | null {
  const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  if (el.id) return "#" + CSS.escape(el.id)
  const tid = el.getAttribute("data-testid")
  if (tid) return `[data-testid="${esc(tid)}"]`
  const al = el.getAttribute("aria-label")
  if (al) return `${el.tagName.toLowerCase()}[aria-label="${esc(al)}"]`
  return null
}
/* eslint-enable */

const cap = (s: string, c: number) => (s.length > c ? s.slice(0, c - 20) + "\n…[snapshot truncated]" : s)

// ── Interfaces the author drive programs against ─────────────────────────────────────────────────
export interface BrowserPage {
  url(): string
  goto(url: string, timeoutMs: number): Promise<void>
  /**
   * base64 JPEG, no data: prefix.
   * `opts.fullPage` captures the WHOLE scrollable document rather than just the viewport — used by
   * the /bug-check Sim walk-through, which scroll-animates the captured page in the browser and
   * anchors Sim speech bubbles to reaction regions. Regions returned by the vision model are
   * normalised against whatever image it was shown, so display and model MUST share one capture.
   */
  screenshotJpeg(quality: number, timeoutMs: number, opts?: { fullPage?: boolean }): Promise<string>
  krefSnapshot(capChars?: number): Promise<string>
  count(selector: string): Promise<number>
  fingerprint(selector: string): Promise<Fingerprint>
  stableSelector(selector: string): Promise<string | null>
  click(selector: string, timeoutMs: number): Promise<void>
  fill(selector: string, value: string, timeoutMs: number, sensitive?: boolean): Promise<void>
  selectOption(selector: string, value: string, timeoutMs: number): Promise<void>
  hover(selector: string, timeoutMs: number): Promise<void>
  keyPress(selector: string, key: string, timeoutMs: number): Promise<void>
  clearField(selector: string, timeoutMs: number): Promise<void>
  assertVisible(selector: string, timeoutMs: number): Promise<void>
  assertTextEquals(selector: string, value: string, timeoutMs: number): Promise<void>
  assertTextContains(selector: string, text: string, timeoutMs: number): Promise<void>
  assertUrlMatches(pattern: RegExp | string, timeoutMs: number): Promise<void>
  assertElementCount(selector: string, expected: number, timeoutMs: number): Promise<void>
  waitMs(ms: number): Promise<void>
  /**
   * KLA-111: Install network mocks before navigating. Subsequent requests whose URL matches a mock
   * rule are either stubbed with a canned response or aborted (blocked). Call before goto() so
   * mocks are in place for the initial page load. Calling again REPLACES all previously installed
   * mocks (idempotent: unroutes old handlers then installs fresh ones). No-op when mocks is empty.
   */
  interceptNetwork(mocks: NetworkMock[]): Promise<void>
}
export interface BrowserHandle {
  newPage(viewport?: TrailViewport | null): Promise<BrowserPage>
  close(): Promise<void>
  /** "local" | "steel:<region>" — for logging/evidence. */
  readonly kind: string
}

/**
 * Run a cleanup promise with a hard timeout; silently proceeds after ms (exported for tests).
 * Prevents a hung browser.close() / disconnect() from pinning a worker slot indefinitely.
 */
export async function safeClose(p: Promise<unknown>, ms = 5_000): Promise<void> {
  await Promise.race([
    p.then(() => {}, () => {}),
    new Promise<void>(res => { const t = setTimeout(res, ms); t.unref?.() }),
  ])
}

// ── Playwright impl (default) — wraps a Playwright Page, preserving current auto-wait behavior ─────
class PlaywrightPage implements BrowserPage {
  constructor(private page: import("playwright").Page) {}
  url() { return this.page.url() }
  async goto(url: string, timeoutMs: number) { await this.page.goto(url, { timeout: timeoutMs, waitUntil: "domcontentloaded" }) }
  async screenshotJpeg(quality: number, timeoutMs: number, opts?: { fullPage?: boolean }) { return (await this.page.screenshot({ type: "jpeg", quality, timeout: timeoutMs, fullPage: !!opts?.fullPage })).toString("base64") }
  async krefSnapshot(capChars = KREF_SNAPSHOT_CAP) { return cap(await this.page.evaluate(krefSnapshotBody), capChars) }
  async count(selector: string) { return await this.page.locator(selector).count() }
  async fingerprint(selector: string) { return await this.page.locator(selector).first().evaluate(fingerprintBody) }
  async stableSelector(selector: string) { try { return await this.page.locator(selector).first().evaluate(stableSelectorBody) } catch { return null } }
  async click(selector: string, timeoutMs: number) { await clickWithTransitionFallback(this.page.locator(selector), timeoutMs) }
  async fill(selector: string, value: string, timeoutMs: number, sensitive = false) {
    const loc = this.page.locator(selector)
    await loc.fill(value, { timeout: timeoutMs })
    if (sensitive) await loc.first().evaluate((el) => el.setAttribute("data-autosim-sensitive", "1")).catch(() => {})
  }
  async selectOption(selector: string, value: string, timeoutMs: number) { await this.page.locator(selector).selectOption(value, { timeout: timeoutMs }) }
  async hover(selector: string, timeoutMs: number) { await this.page.locator(selector).hover({ timeout: timeoutMs }) }
  async keyPress(selector: string, key: string, timeoutMs: number) { await this.page.locator(selector).press(key, { timeout: timeoutMs }) }
  async clearField(selector: string, timeoutMs: number) { await this.page.locator(selector).clear({ timeout: timeoutMs }) }
  async assertVisible(selector: string, timeoutMs: number) { await this.page.locator(selector).waitFor({ state: "visible", timeout: timeoutMs }) }
  async assertTextEquals(selector: string, value: string, timeoutMs: number) {
    const locator = this.page.locator(selector)
    await locator.waitFor({ state: "visible", timeout: timeoutMs })
    const text = (await locator.allInnerTexts()).join(" ").trim()
    if (text !== value) throw new Error(`assertTextEquals: expected "${value}" but got "${text}"`)
  }
  async assertTextContains(selector: string, text: string, timeoutMs: number) {
    const locator = this.page.locator(selector)
    await locator.waitFor({ state: "visible", timeout: timeoutMs })
    const elText = (await locator.allInnerTexts()).join(" ").trim()
    if (!elText.includes(text)) throw new Error(`assertTextContains: "${text}" not found in "${elText}"`)
  }
  async assertUrlMatches(pattern: RegExp | string, timeoutMs: number) {
    const re = pattern instanceof RegExp ? pattern : new RegExp("^" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$")
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      if (re.test(this.page.url())) return
      await this.waitMs(100)
    }
    throw new Error(`assertUrlMatches: URL "${this.page.url()}" did not match ${pattern}`)
  }
  async assertElementCount(selector: string, expected: number, timeoutMs: number) {
    const locator = this.page.locator(selector)
    await locator.first().waitFor({ state: "visible", timeout: timeoutMs })
    let n = await locator.count()
    if (n === expected) return
    // Poll a few times in case of async list rendering.
    for (let i = 0; i < 5; i++) {
      await this.waitMs(100)
      n = await locator.count()
      if (n === expected) return
    }
    throw new Error(`assertElementCount: expected ${expected} but found ${n}`)
  }
  async waitMs(ms: number) { await new Promise((r) => setTimeout(r, ms)) }
  async interceptNetwork(mocks: NetworkMock[]): Promise<void> {
    // Remove any previously installed Klavity route handlers before installing fresh ones.
    await this.page.unroute("**/*").catch(() => {})
    if (!mocks.length) return
    await this.page.route("**/*", (route) => {
      const reqUrl = route.request().url()
      for (const mock of mocks) {
        if (!matchesMock(mock.url, reqUrl)) continue
        if (isBlockedMock(mock)) { route.abort("blockedbyclient").catch(() => {}); return }
        const stub = stubForMock(mock)
        route.fulfill({
          status: stub.status ?? 200,
          contentType: stub.contentType ?? "text/plain",
          body: stub.body ?? "",
        }).catch(() => {})
        return
      }
      route.continue().catch(() => {})
    })
  }
}

class PlaywrightHandle implements BrowserHandle {
  readonly kind = "local"
  private watchdog: ReturnType<typeof setTimeout> | null = null
  private closed = false
  constructor(private browser: import("playwright").Browser, watchdogMs?: number) {
    if (watchdogMs && watchdogMs > 0) {
      this.watchdog = setTimeout(() => {
        try { (this.browser as any).process?.()?.kill?.("SIGKILL") } catch {}
        this.browser.close().catch(() => {})
      }, watchdogMs)
      this.watchdog.unref?.()
    }
  }
  async newPage(viewport?: TrailViewport | null) {
    if (viewport) {
      const context = await this.browser.newContext(playwrightContextOptionsForTrailViewport(viewport))
      return new PlaywrightPage(await context.newPage())
    }
    return new PlaywrightPage(await this.browser.newPage())
  }
  async close() {
    if (this.closed) return
    this.closed = true
    if (this.watchdog) clearTimeout(this.watchdog)
    this.watchdog = null
    await safeClose(this.browser.close())
  }
}

// ── Puppeteer-over-CDP impl — remote browser (Steel). Actionability re-added via waitForSelector. ──
class PuppeteerPage implements BrowserPage {
  constructor(private page: any) {}
  url() { return this.page.url() }
  async goto(url: string, timeoutMs: number) { await this.page.goto(url, { timeout: timeoutMs, waitUntil: "domcontentloaded" }) }
  async screenshotJpeg(quality: number, _timeoutMs: number, opts?: { fullPage?: boolean }) { return (await this.page.screenshot({ type: "jpeg", quality, encoding: "base64", fullPage: !!opts?.fullPage })) as string }
  async krefSnapshot(capChars = KREF_SNAPSHOT_CAP) { return cap(await this.page.evaluate(krefSnapshotBody), capChars) }
  async count(selector: string) { return await this.page.evaluate((s: string) => document.querySelectorAll(s).length, selector) }
  async fingerprint(selector: string) { return await this.page.$eval(selector, fingerprintBody) }
  async stableSelector(selector: string) { try { return await this.page.$eval(selector, stableSelectorBody) } catch { return null } }
  async click(selector: string, timeoutMs: number) { await this.page.waitForSelector(selector, { visible: true, timeout: timeoutMs }); await this.page.click(selector) }
  async fill(selector: string, value: string, timeoutMs: number, sensitive = false) {
    const el = await this.page.waitForSelector(selector, { visible: true, timeout: timeoutMs })
    await el.click({ clickCount: 3 }).catch(() => {}) // select existing text so type() replaces it (mirrors fill)
    await el.type(value)
    if (sensitive) await el.evaluate((node: Element) => node.setAttribute("data-autosim-sensitive", "1")).catch(() => {})
  }
  async selectOption(selector: string, value: string, timeoutMs: number) { await this.page.waitForSelector(selector, { timeout: timeoutMs }); await this.page.select(selector, value) }
  async hover(selector: string, timeoutMs: number) { await this.page.waitForSelector(selector, { visible: true, timeout: timeoutMs }); await this.page.hover(selector) }
  async keyPress(selector: string, key: string, timeoutMs: number) { await this.page.waitForSelector(selector, { visible: true, timeout: timeoutMs }); await this.page.focus(selector); await this.page.keyboard.press(key) }
  async clearField(selector: string, timeoutMs: number) {
    const el = await this.page.waitForSelector(selector, { visible: true, timeout: timeoutMs })
    await el.click({ clickCount: 3 }).catch(() => {})
    await this.page.keyboard.press("Backspace")
  }
  async assertVisible(selector: string, timeoutMs: number) { await this.page.waitForSelector(selector, { visible: true, timeout: timeoutMs }) }
  async assertTextEquals(selector: string, value: string, timeoutMs: number) {
    const el = await this.page.waitForSelector(selector, { visible: true, timeout: timeoutMs })
    if (!el) throw new Error(`assertTextEquals: selector "${selector}" not found`)
    const text = await el.evaluate((n) => (n.textContent || "").trim())
    if (text !== value) throw new Error(`assertTextEquals: expected "${value}" but got "${text}"`)
  }
  async assertTextContains(selector: string, text: string, timeoutMs: number) {
    const el = await this.page.waitForSelector(selector, { visible: true, timeout: timeoutMs })
    if (!el) throw new Error(`assertTextContains: selector "${selector}" not found`)
    const elText = await el.evaluate((n) => (n.textContent || "").trim())
    if (!elText.includes(text)) throw new Error(`assertTextContains: "${text}" not found in "${elText}"`)
  }
  async assertUrlMatches(pattern: RegExp | string, timeoutMs: number) {
    const re = pattern instanceof RegExp ? pattern : new RegExp("^" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$")
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      if (re.test(this.page.url())) return
      await this.waitMs(100)
    }
    throw new Error(`assertUrlMatches: URL "${this.page.url()}" did not match ${pattern}`)
  }
  async assertElementCount(selector: string, expected: number, timeoutMs: number) {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      const n = await this.page.evaluate((s: string) => document.querySelectorAll(s).length, selector)
      if (n === expected) return
      await this.waitMs(100)
    }
    const n = await this.page.evaluate((s: string) => document.querySelectorAll(s).length, selector)
    throw new Error(`assertElementCount: expected ${expected} but found ${n}`)
  }
  async waitMs(ms: number) { await new Promise((r) => setTimeout(r, ms)) }
  async interceptNetwork(mocks: NetworkMock[]): Promise<void> {
    // Puppeteer: enable request interception and handle each request against the mock list.
    // setRequestInterception(true) is idempotent in Puppeteer; safe to call repeatedly.
    if (!mocks.length) return
    await this.page.setRequestInterception(true)
    // Remove any previously registered Klavity listener to avoid double-handling.
    this.page.removeAllListeners("request")
    this.page.on("request", (req: any) => {
      const reqUrl: string = req.url()
      for (const mock of mocks) {
        if (!matchesMock(mock.url, reqUrl)) continue
        if (mock.block) { req.abort().catch(() => {}); return }
        req.respond({
          status: mock.stub.status ?? 200,
          contentType: mock.stub.contentType ?? "text/plain",
          body: mock.stub.body ?? "",
        }).catch(() => {})
        return
      }
      req.continue().catch(() => {})
    })
  }
}

class PuppeteerHandle implements BrowserHandle {
  readonly kind: string
  constructor(private browser: any, private release: () => Promise<void>, region: string) { this.kind = "steel:" + region }
  async newPage(viewport?: TrailViewport | null) {
    const pages = await this.browser.pages()
    const page = pages[0] ?? (await this.browser.newPage())
    if (viewport) {
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
        isMobile: !!viewport.isMobile,
        hasTouch: !!viewport.isMobile,
      }).catch(() => {})
    }
    return new PuppeteerPage(page)
  }
  async close() { await safeClose(this.browser.disconnect()); await safeClose(this.release()) }
}

// ── Factory ───────────────────────────────────────────────────────────────────────────────────────
export interface AcquireOpts { headless?: boolean; launchArgs?: string[]; watchdogMs?: number }

function mergeLocalChromiumArgs(args?: string[]): string[] {
  return Array.from(new Set(args ?? []))
}

/**
 * Raised when the walk browser cannot be started at all (local Chromium missing/OOM, or a remote CDP
 * endpoint refused). This is an INFRASTRUCTURE failure, NOT a trail regression: the walk never ran, so
 * there are no steps to inspect. Callers finalize the run RED with failureKind "crash" and surface this
 * message verbatim so the walk report explains WHY (and, on prod, what to configure) instead of showing
 * a misleading "regression or hard failure" with an empty report.
 */
export class BrowserLaunchError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = "BrowserLaunchError"
  }
}

const REMOTE_HINT =
  "To move the browser off the box, set AUTOSIM_CDP_URL (+ STEEL_API_KEY for Steel.dev) so walks run on a remote browser."

// ── Steel session helpers (shared by the authoring drive and the walk runner) ─────────────────────
// Steel exposes a per-session CDP WebSocket. The POST /v1/sessions response returns a `websocketUrl`
// that ALREADY routes to the session's region (multi-region: lax / iad). We connect to THAT url +
// &apiKey=…, rather than re-assembling `${cdpBase}?apiKey=&sessionId=` by hand, so a session created
// in a non-default region is reachable. If the response omits websocketUrl (older/self-hosted Steel),
// we fall back to the assembled base?apiKey=&sessionId= form. STEEL_REGION picks the region on create.
//
// IMPORTANT (KLAVITYKLA-195 / 278): Playwright's chromium.connectOverCDP() HANGS against Steel's
// connect proxy (it never finishes CDP target discovery over the proxy — a known Playwright bug where
// the WebSocket opens but connectOverCDP times out). puppeteer-core's raw-CDP puppeteer.connect()
// works. So the runner's remote path connects with puppeteer FIRST, reads the resolved per-browser
// devtools endpoint (`ws://…/devtools/browser/<id>`, which Playwright can attach to directly WITHOUT
// its broken discovery step), then hands that resolved endpoint to Playwright.

export interface SteelSession {
  id: string
  region: string
  /** The exact ws endpoint to connect to (websocketUrl from the API + apiKey), or null to assemble. */
  connectUrl: string
  release: () => Promise<void>
}

/** Steel CDP connect timeout (ms). Small so an unreachable/hung endpoint fails fast (never 30s+). */
const STEEL_CONNECT_TIMEOUT_MS = Number(process.env.STEEL_CONNECT_TIMEOUT_MS) || 20_000

/**
 * Create a Steel session (honoring STEEL_REGION), returning the resolved connect URL + a release fn.
 * Prefers the API-provided `websocketUrl` (region-correct); falls back to `${cdpBase}?apiKey&sessionId`.
 */
export async function createSteelSession(cdpBase: string, key: string): Promise<SteelSession> {
  const apiUrl = process.env.STEEL_API_URL ?? "https://api.steel.dev"
  const region = process.env.STEEL_REGION // e.g. "lax" (Los Angeles) or "iad" (Washington DC)
  const body = JSON.stringify(region ? { region } : {})
  const res = await fetch(`${apiUrl}/v1/sessions`, {
    method: "POST", headers: { "Steel-Api-Key": key, "Content-Type": "application/json" }, body,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new BrowserLaunchError(
      `Steel session create failed (${res.status} ${res.statusText}) at ${apiUrl}/v1/sessions${text ? `: ${text.slice(0, 200)}` : ""}. Check STEEL_API_KEY / STEEL_REGION.`,
    )
  }
  const session: any = await res.json()
  const release = async () => {
    await fetch(`${apiUrl}/v1/sessions/${session.id}/release`, { method: "POST", headers: { "Steel-Api-Key": key } }).catch(() => {})
  }
  // Prefer the region-correct websocketUrl the API returns; append apiKey if not already present.
  const apiWs: string | undefined = session.websocketUrl || session.webSocketUrl
  const connectUrl = apiWs
    ? (apiWs.includes("apiKey=") ? apiWs : `${apiWs}${apiWs.includes("?") ? "&" : "?"}apiKey=${key}`)
    : `${cdpBase}?apiKey=${key}&sessionId=${session.id}`
  return { id: session.id, region: session.region ?? region ?? "remote", connectUrl, release }
}

/**
 * Launch a local Playwright Chromium with the same resilience the post-deploy smoke script relies on:
 * headless:true defaults to the `chrome-headless-shell` build, which may NOT be installed on the prod
 * box (only the full `chromium` binary is). If the default launch fails, retry once with an explicit
 * executablePath (the full chromium that `playwright install chromium` provides). Only if BOTH fail do
 * we raise BrowserLaunchError with an actionable message — this is what turned into an instant, opaque
 * RED "hard failure" before (the throw escaped walkTrail's try, so no failureKind / report was written).
 */
export async function launchLocalChromium(
  chromium: typeof import("playwright").chromium,
  opts: AcquireOpts,
): Promise<import("playwright").Browser> {
  const headless = opts.headless ?? true
  const args = mergeLocalChromiumArgs(opts.launchArgs)
  try {
    return await chromium.launch({ headless, args })
  } catch (first) {
    // Fallback: force the full chromium binary in case chrome-headless-shell is not installed.
    try {
      return await chromium.launch({ headless, args, executablePath: chromium.executablePath() })
    } catch (second) {
      throw new BrowserLaunchError(
        `Could not start a local browser for the walk (${String((first as any)?.message ?? first)}). ` +
        `Install Playwright's Chromium on the host (\`bunx playwright install chromium\`), or run walks remotely. ${REMOTE_HINT}`,
        second,
      )
    }
  }
}

function localBrowserWatchdogMs(opts: AcquireOpts): number {
  const envMs = Number(process.env.AUTOSIM_BROWSER_WATCHDOG_MS)
  if (opts.watchdogMs != null) return opts.watchdogMs
  return Number.isFinite(envMs) && envMs > 0 ? envMs : 360_000
}

/**
 * Return a BrowserHandle (BrowserPage-based interface). Default: local Playwright.
 * When AUTOSIM_CDP_URL is set: connect to a remote browser via Puppeteer over CDP.
 *   - If STEEL_API_KEY is also set, AUTOSIM_CDP_URL is treated as the Steel connect base
 *     (e.g. wss://connect.steel.dev): a Steel session is created, connected, and released on close.
 *   - Otherwise AUTOSIM_CDP_URL is treated as a ready browser CDP ws endpoint (self-hosted).
 * Used by: trails-author (authoring drive) and sim-preview.
 */
export async function acquireBrowser(opts: AcquireOpts = {}): Promise<BrowserHandle> {
  const cdpBase = process.env.AUTOSIM_CDP_URL
  if (cdpBase) return await connectRemotePuppeteer(cdpBase, opts)
  const { chromium } = await import("playwright")
  const browser = await launchLocalChromium(chromium, opts)
  return new PlaywrightHandle(browser, localBrowserWatchdogMs(opts))
}

/**
 * Return a native Playwright Browser handle that honors AUTOSIM_CDP_URL / STEEL_API_KEY.
 * Used by trails-runner (walk engine), which depends on Playwright's BrowserContext / Page /
 * Locator / addInitScript APIs that the Puppeteer shim does not provide.
 *
 * Remote path (KLAVITYKLA-195 / 278): Playwright's connectOverCDP() HANGS against Steel's connect
 * proxy (WS opens but target discovery never completes → 30s timeout), even from the co-located box.
 * Fix: connect with puppeteer-core FIRST (raw CDP — works), read the resolved devtools browser ws
 * endpoint, then hand THAT to Playwright's connectOverCDP (skips its broken discovery). Self-hosted
 * CDP (no key) connects directly. AUTOSIM_CDP_URL unset → local chromium.launch() (tested default).
 *
 * Session lifecycle: caller gets a `close()` that both disconnects the browser AND releases any
 * Steel session, so runners only need to call `bh.close()` in their `finally` block.
 */
export interface PlaywrightBrowserHandle {
  readonly browser: import("playwright").Browser
  /** Disconnects the browser and releases any remote session (Steel). */
  readonly close: () => Promise<void>
  /** "local" | "cdp-remote" | "steel:<region>" */
  readonly kind: string
}

export function playwrightContextOptionsForTrailViewport(viewport?: TrailViewport | null): Record<string, unknown> | undefined {
  if (!viewport) return undefined
  return {
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: !!viewport.isMobile,
    hasTouch: !!viewport.isMobile,
    deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
  }
}

export interface CdpScreencastFrame {
  dataUrl: string
  sessionId: number
  metadata?: Record<string, unknown>
}

export interface CdpScreencastOptions {
  format?: "jpeg" | "png"
  quality?: number
  maxWidth?: number
  maxHeight?: number
  everyNthFrame?: number
}

/**
 * Start a best-effort Chrome DevTools Page.startScreencast stream for a Playwright page.
 * The caller owns persistence/transport; this helper only converts CDP frames to data URLs and
 * ACKs every frame immediately so Chrome keeps producing the stream.
 */
export async function startCdpScreencast(
  page: import("playwright").Page,
  onFrame: (frame: CdpScreencastFrame) => void,
  opts: CdpScreencastOptions = {},
): Promise<() => Promise<void>> {
  const session = await page.context().newCDPSession(page)
  const format = opts.format ?? "jpeg"
  const handler = (ev: any) => {
    const sessionId = Number(ev?.sessionId)
    if (Number.isFinite(sessionId)) {
      session.send("Page.screencastFrameAck", { sessionId }).catch(() => {})
    }
    if (typeof ev?.data !== "string") return
    onFrame({
      dataUrl: `data:image/${format};base64,${ev.data}`,
      sessionId,
      metadata: ev.metadata,
    })
  }
  session.on("Page.screencastFrame", handler)
  try {
    await session.send("Page.enable").catch(() => {})
    await session.send("Page.startScreencast", {
      format,
      quality: opts.quality ?? 45,
      maxWidth: opts.maxWidth ?? 1024,
      maxHeight: opts.maxHeight ?? 768,
      everyNthFrame: opts.everyNthFrame ?? 2,
    })
  } catch (e) {
    try { (session as any).off?.("Page.screencastFrame", handler) } catch {}
    try { await session.detach() } catch {}
    throw e
  }
  return async () => {
    try { (session as any).off?.("Page.screencastFrame", handler) } catch {}
    try { await session.send("Page.stopScreencast") } catch {}
    try { await session.detach() } catch {}
  }
}

/**
 * Open a LOCAL Playwright Chromium as a PlaywrightBrowserHandle (the walker seam's default + fallback).
 * Extracted so both the no-AUTOSIM_CDP_URL default path AND the remote→local fallback share one impl.
 * `kind` is passed in so the fallback can label itself "local-fallback" for evidence/logging.
 */
async function openLocalPlaywrightBrowser(
  chromium: typeof import("playwright").chromium,
  opts: AcquireOpts,
  kind: string,
): Promise<PlaywrightBrowserHandle> {
  const browser = await launchLocalChromium(chromium, opts)
  let watchdog: ReturnType<typeof setTimeout> | null = null
  const watchdogMs = localBrowserWatchdogMs(opts)
  if (watchdogMs > 0) {
    watchdog = setTimeout(() => {
      try { (browser as any).process?.()?.kill?.("SIGKILL") } catch {}
      browser.close().catch(() => {})
    }, watchdogMs)
    watchdog.unref?.()
  }
  return {
    browser,
    close: async () => {
      if (watchdog) clearTimeout(watchdog)
      watchdog = null
      await safeClose(browser.close())
    },
    kind,
  }
}

/**
 * Injectable seam for hermetic fallback testing. `acquirePlaywrightBrowser` composes a remote-acquire
 * step and a local-open step; injecting fakes lets us prove the health-check/fallback path WITHOUT a
 * real browser or a live Steel endpoint (mirrors the launchLocalChromium(chromium, …) DI already here).
 */
export interface AcquirePlaywrightDeps {
  /** Attempt the remote (Steel / self-hosted CDP) acquire. Throws on an unreachable/dead endpoint. */
  acquireRemote: (cdpBase: string, opts: AcquireOpts) => Promise<PlaywrightBrowserHandle>
  /** Open a local Playwright browser with the given kind label. */
  openLocal: (opts: AcquireOpts, kind: string) => Promise<PlaywrightBrowserHandle>
}

/**
 * Walker seam (trails-runner). Returns a native Playwright Browser handle. Routing:
 *   • AUTOSIM_CDP_URL unset → local chromium.launch() (byte-for-byte unchanged from before this seam).
 *   • AUTOSIM_CDP_URL set   → connect to the remote browser (Steel / self-hosted CDP). If that connect
 *     FAILS (dead Steel session, unreachable endpoint), we do NOT let the scheduled/CI walk turn into a
 *     missed guard: we FALL BACK to a local browser so the walk still runs. The fallback is visible in
 *     two ways — a console.warn line AND kind="local-fallback" (surfaced in the walk's browser-kind
 *     evidence). Opt out of fallback (strict remote-only) with AUTOSIM_CDP_NO_FALLBACK=1, in which case
 *     the original BrowserLaunchError propagates (RED crash) exactly as before.
 *
 * `deps` is injectable for hermetic tests; prod always uses the real remote/local impls below.
 */
export async function acquirePlaywrightBrowser(
  opts: AcquireOpts = {},
  deps?: AcquirePlaywrightDeps,
): Promise<PlaywrightBrowserHandle> {
  const cdpBase = process.env.AUTOSIM_CDP_URL
  const openLocal = deps?.openLocal
    ?? (async (o: AcquireOpts, kind: string) => openLocalPlaywrightBrowser((await import("playwright")).chromium, o, kind))

  // Default (and byte-for-byte-unchanged) path: no remote endpoint configured → local browser.
  if (!cdpBase) return await openLocal(opts, "local")

  // Remote configured. Try it; on an infra failure fall back to local so guards still run.
  const acquireRemote = deps?.acquireRemote ?? acquireRemotePlaywrightBrowser
  try {
    return await acquireRemote(cdpBase, opts)
  } catch (e) {
    const noFallback = process.env.AUTOSIM_CDP_NO_FALLBACK === "1"
    if (noFallback) throw e
    const msg = String((e as any)?.message ?? e)
    // Visible-in-logs: a dead remote endpoint must never be a silent missed walk.
    console.warn(
      `[trails-browser] remote walk browser at AUTOSIM_CDP_URL is unreachable (${msg}); ` +
      `falling back to a LOCAL browser so the walk still runs. ` +
      `Set AUTOSIM_CDP_NO_FALLBACK=1 to fail hard instead.`,
    )
    return await openLocal(opts, "local-fallback")
  }
}

/**
 * The remote (AUTOSIM_CDP_URL) acquire path for the walker seam. Throws BrowserLaunchError when the
 * remote browser cannot be reached, so acquirePlaywrightBrowser can decide to fall back to local.
 * (Callers must NOT invoke this with AUTOSIM_CDP_URL unset.)
 */
export async function acquireRemotePlaywrightBrowser(cdpBase: string, _opts: AcquireOpts = {}): Promise<PlaywrightBrowserHandle> {
  const { chromium } = await import("playwright")
  const key = process.env.STEEL_API_KEY
  if (key) {
    // KLAVITYKLA-195 / 278: Playwright's connectOverCDP() HANGS against Steel's connect proxy (the WS
    // opens but target discovery never completes → "Timeout 30000ms exceeded"). Fix: connect with
    // puppeteer-core FIRST (its raw-CDP connect works against Steel — validated by the 2026-07-04
    // spike), read the resolved per-browser devtools endpoint, then attach Playwright to THAT resolved
    // ws://…/devtools/browser/<id> — which Playwright can do directly, skipping its broken discovery.
    const session = await createSteelSession(cdpBase, key)
    const { default: puppeteer } = await import("puppeteer-core") // lazy: local path never loads it
    let pptr: any
    let resolvedWs: string
    try {
      pptr = await puppeteer.connect({ browserWSEndpoint: session.connectUrl, defaultViewport: null })
      resolvedWs = pptr.wsEndpoint() // ws://HOST:PORT/devtools/browser/<id> — Playwright attaches to this
    } catch (e) {
      try { await pptr?.disconnect?.() } catch {}
      await session.release().catch(() => {})
      throw new BrowserLaunchError(
        `Could not connect to the Steel remote browser at ${cdpBase} (${String((e as any)?.message ?? e)}). Check AUTOSIM_CDP_URL / STEEL_API_KEY / STEEL_REGION.`, e,
      )
    }
    let browser: import("playwright").Browser
    try {
      browser = await chromium.connectOverCDP(resolvedWs, { timeout: STEEL_CONNECT_TIMEOUT_MS })
    } catch (e) {
      // Fall back to the puppeteer-provided endpoint via the Steel connect url if the resolved raw
      // endpoint is not directly reachable (e.g. an internal host behind the proxy).
      try {
        browser = await chromium.connectOverCDP(session.connectUrl, { timeout: STEEL_CONNECT_TIMEOUT_MS })
      } catch (e2) {
        try { await pptr?.disconnect?.() } catch {}
        await session.release().catch(() => {})
        throw new BrowserLaunchError(
          `Connected to Steel via puppeteer but Playwright could not attach (${String((e as any)?.message ?? e)}). ` +
          `Check AUTOSIM_CDP_URL / STEEL_API_KEY / STEEL_REGION and that the resolved CDP endpoint is reachable.`, e2,
        )
      }
    }
    // Puppeteer only resolved the endpoint; Playwright now owns the browser. Disconnect puppeteer so it
    // isn't a second CDP client holding the connection (best-effort; it never closes the remote browser).
    try { await pptr?.disconnect?.() } catch {}
    return {
      browser,
      close: async () => { await safeClose(browser.close()); await safeClose(session.release()) },
      kind: "steel:" + session.region,
    }
  }
  // Self-hosted CDP endpoint (no Steel key): connect directly. Bounded so an unreachable endpoint
  // fails fast with an actionable BrowserLaunchError instead of Playwright's silent 30s hang.
  let browser: import("playwright").Browser
  try {
    browser = await chromium.connectOverCDP(cdpBase, { timeout: STEEL_CONNECT_TIMEOUT_MS })
  } catch (e) {
    throw new BrowserLaunchError(
      `Could not connect to the remote browser at AUTOSIM_CDP_URL (${String((e as any)?.message ?? e)}). Check the CDP endpoint is reachable from the host.`, e,
    )
  }
  return { browser, close: () => safeClose(browser.close()), kind: "cdp-remote" }
}

async function connectRemotePuppeteer(cdpBase: string, _opts: AcquireOpts): Promise<BrowserHandle> {
  const { default: puppeteer } = await import("puppeteer-core") // lazy: prod (flag off) never loads it
  const key = process.env.STEEL_API_KEY
  if (key) {
    const session = await createSteelSession(cdpBase, key)
    let browser: any
    try {
      browser = await puppeteer.connect({ browserWSEndpoint: session.connectUrl, defaultViewport: null })
    } catch (e) {
      await session.release().catch(() => {})
      throw new BrowserLaunchError(
        `Could not connect to the Steel remote browser at ${cdpBase} (${String((e as any)?.message ?? e)}). Check AUTOSIM_CDP_URL / STEEL_API_KEY / STEEL_REGION.`, e,
      )
    }
    return new PuppeteerHandle(browser, session.release, session.region)
  }
  const browser = await puppeteer.connect({ browserWSEndpoint: cdpBase, defaultViewport: null })
  return new PuppeteerHandle(browser, async () => {}, "remote")
}

// ── KLAVITYKLA-126: environment-determinism artifacts (HAR record/replay + Playwright tracing) ──────
// Thin, dependency-free wrappers over Playwright's BrowserContext APIs so the Playwright/CDP layer
// stays the single place that touches recordHar / routeFromHAR / tracing. All are gated + best-effort
// at the call site (trails-runner): default walk behavior is byte-identical when the flags are off.

/**
 * Context option to RECORD a HAR to `harPath`. Merge this into the object passed to
 * `browser.newContext(...)` (before any navigation). `content:'embed'` inlines response bodies so the
 * HAR is self-contained (no sidecar files) and routeFromHAR can serve them back later; `mode:'full'`
 * records the complete request/response (not just timing), which replay needs.
 */
export function harRecordContextOptions(harPath: string): Record<string, unknown> {
  return { recordHar: { path: harPath, content: "embed", mode: "full" } }
}

/**
 * REPLAY all network for a context from a previously recorded HAR (true network determinism: the same
 * Trail can no longer green/red on live backend state). Call right after newContext, before goto.
 *   notFound:'fallback' (default) — unmatched requests still hit the live network (safe).
 *   notFound:'abort'              — strict determinism: an unmatched request becomes a network error.
 * update:false — never re-record over the baseline while replaying.
 */
export async function applyHarReplay(
  context: import("playwright").BrowserContext,
  harPath: string,
  notFound: "abort" | "fallback" = "fallback",
): Promise<void> {
  await context.routeFromHAR(harPath, { url: "**/*", notFound, update: false })
}

/**
 * Start Playwright tracing (screenshots + DOM snapshots) on a context. `sources:false` keeps the trace
 * lean (no app source embedding). Pair with stopContextTracing to write the zip.
 */
export async function startContextTracing(context: import("playwright").BrowserContext): Promise<void> {
  await context.tracing.start({ screenshots: true, snapshots: true, sources: false })
}

/** Stop tracing and write the trace zip to `tracePath` (openable via `npx playwright show-trace`). */
export async function stopContextTracing(
  context: import("playwright").BrowserContext,
  tracePath: string,
): Promise<void> {
  await context.tracing.stop({ path: tracePath })
}
