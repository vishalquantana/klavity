// Browser adapter for the AutoSims AUTHOR drive. One small selector-based interface, two impls:
//   • Playwright (default) — local chromium.launch, keeps Playwright's auto-wait/actionability.
//   • Puppeteer-over-CDP — connects to a remote browser (Steel.dev) when AUTOSIM_CDP_URL is set;
//     re-adds actionability explicitly (waitForSelector visible) since Puppeteer has no Locator.
// Rationale + cost/perf: docs/bench-autosim-cost.md (Steel section) + the 2026-07-04 spike.
// The runner (trails-runner.ts) stays on Playwright for now — its heal ladder is deeply coupled to
// Playwright getByRole/getByText/networkidle; porting it is a separate, larger effort.
import type { Fingerprint, NetworkMock, TrailViewport } from "./trails-types"
import { KREF_SNAPSHOT_CAP } from "./trails-snapshot"
import { clickWithTransitionFallback } from "./trails-click"

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
  const nameOf = (el: Element): string => {
    const cand =
      el.getAttribute("aria-label") || el.getAttribute("placeholder") ||
      (el as HTMLImageElement).alt || (el.textContent || "").trim() ||
      el.getAttribute("name") || el.getAttribute("title") || (el as HTMLInputElement).value || ""
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
  screenshotJpeg(quality: number, timeoutMs: number): Promise<string> // base64, no data: prefix
  krefSnapshot(capChars?: number): Promise<string>
  count(selector: string): Promise<number>
  fingerprint(selector: string): Promise<Fingerprint>
  stableSelector(selector: string): Promise<string | null>
  click(selector: string, timeoutMs: number): Promise<void>
  fill(selector: string, value: string, timeoutMs: number): Promise<void>
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
   * KLA-111: install network stubs/blocks for this page.
   * Called once before the first navigation; patterns persist for the page's lifetime.
   * No-op when mocks is empty.
   */
  mockNetwork(mocks: NetworkMock[]): Promise<void>
}
export interface BrowserHandle {
  newPage(viewport?: TrailViewport | null): Promise<BrowserPage>
  close(): Promise<void>
  /** "local" | "steel:<region>" — for logging/evidence. */
  readonly kind: string
}

// ── Playwright impl (default) — wraps a Playwright Page, preserving current auto-wait behavior ─────
class PlaywrightPage implements BrowserPage {
  constructor(private page: import("playwright").Page) {}
  url() { return this.page.url() }
  async goto(url: string, timeoutMs: number) { await this.page.goto(url, { timeout: timeoutMs, waitUntil: "domcontentloaded" }) }
  async screenshotJpeg(quality: number, timeoutMs: number) { return (await this.page.screenshot({ type: "jpeg", quality, timeout: timeoutMs })).toString("base64") }
  async krefSnapshot(capChars = KREF_SNAPSHOT_CAP) { return cap(await this.page.evaluate(krefSnapshotBody), capChars) }
  async count(selector: string) { return await this.page.locator(selector).count() }
  async fingerprint(selector: string) { return await this.page.locator(selector).first().evaluate(fingerprintBody) }
  async stableSelector(selector: string) { try { return await this.page.locator(selector).first().evaluate(stableSelectorBody) } catch { return null } }
  async click(selector: string, timeoutMs: number) { await clickWithTransitionFallback(this.page.locator(selector), timeoutMs) }
  async fill(selector: string, value: string, timeoutMs: number) { await this.page.locator(selector).fill(value, { timeout: timeoutMs }) }
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
  async mockNetwork(mocks: NetworkMock[]) {
    // `mock.url` is a substring: any request whose full URL contains it is intercepted.
    for (const mock of mocks) {
      const pattern = (url: URL) => url.href.includes(mock.url)
      if (mock.action === "block") {
        await this.page.route(pattern, (route) => route.abort())
      } else {
        await this.page.route(pattern, (route) => route.fulfill({
          status: mock.status ?? 200,
          contentType: mock.contentType ?? "application/json",
          headers: mock.headers ?? {},
          body: mock.body ?? "",
        }))
      }
    }
  }
}

class PlaywrightHandle implements BrowserHandle {
  readonly kind = "local"
  constructor(private browser: import("playwright").Browser) {}
  async newPage(viewport?: TrailViewport | null) {
    if (viewport) {
      const context = await this.browser.newContext(playwrightContextOptionsForTrailViewport(viewport))
      return new PlaywrightPage(await context.newPage())
    }
    return new PlaywrightPage(await this.browser.newPage())
  }
  async close() { await this.browser.close().catch(() => {}) }
}

// ── Puppeteer-over-CDP impl — remote browser (Steel). Actionability re-added via waitForSelector. ──
class PuppeteerPage implements BrowserPage {
  constructor(private page: any) {}
  url() { return this.page.url() }
  async goto(url: string, timeoutMs: number) { await this.page.goto(url, { timeout: timeoutMs, waitUntil: "domcontentloaded" }) }
  async screenshotJpeg(quality: number, _timeoutMs: number) { return (await this.page.screenshot({ type: "jpeg", quality, encoding: "base64" })) as string }
  async krefSnapshot(capChars = KREF_SNAPSHOT_CAP) { return cap(await this.page.evaluate(krefSnapshotBody), capChars) }
  async count(selector: string) { return await this.page.evaluate((s: string) => document.querySelectorAll(s).length, selector) }
  async fingerprint(selector: string) { return await this.page.$eval(selector, fingerprintBody) }
  async stableSelector(selector: string) { try { return await this.page.$eval(selector, stableSelectorBody) } catch { return null } }
  async click(selector: string, timeoutMs: number) { await this.page.waitForSelector(selector, { visible: true, timeout: timeoutMs }); await this.page.click(selector) }
  async fill(selector: string, value: string, timeoutMs: number) {
    const el = await this.page.waitForSelector(selector, { visible: true, timeout: timeoutMs })
    await el.click({ clickCount: 3 }).catch(() => {}) // select existing text so type() replaces it (mirrors fill)
    await el.type(value)
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
  async mockNetwork(mocks: NetworkMock[]) {
    if (!mocks.length) return
    await this.page.setRequestInterception(true)
    this.page.on("request", (request: any) => {
      const url: string = request.url()
      const mock = mocks.find((m) => {
        // Support simple glob patterns (** = anything) and substring matches.
        const pat = m.url
        if (pat.includes("**")) {
          const re = new RegExp("^" + pat.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*") + "$")
          return re.test(url)
        }
        return url.includes(pat)
      })
      if (!mock) { request.continue().catch(() => {}); return }
      if (mock.action === "block") { request.abort().catch(() => {}); return }
      request.respond({
        status: mock.status ?? 200,
        contentType: mock.contentType ?? "application/json",
        headers: mock.headers ?? {},
        body: mock.body ?? "",
      }).catch(() => {})
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
  async close() { try { await this.browser.disconnect() } catch {} await this.release().catch(() => {}) }
}

// ── Factory ───────────────────────────────────────────────────────────────────────────────────────
export interface AcquireOpts { headless?: boolean; launchArgs?: string[] }

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
  return new PlaywrightHandle(await chromium.launch({ headless: opts.headless ?? true, args: opts.launchArgs ?? [] }))
}

/**
 * Return a native Playwright Browser handle that honors AUTOSIM_CDP_URL / STEEL_API_KEY.
 * Used by trails-runner (walk engine), which depends on Playwright's BrowserContext / Page /
 * Locator / addInitScript APIs that the Puppeteer shim does not provide.
 *
 * Remote path: chromium.connectOverCDP(). The 2026-07-04 spike found this hung FROM a Mac over
 * transcontinental Steel (~940ms RTT); from a co-located prod box the RTT is ~50–150ms and the
 * connection is stable. AUTOSIM_CDP_URL unset → local chromium.launch() (the tested default).
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

export async function acquirePlaywrightBrowser(opts: AcquireOpts = {}): Promise<PlaywrightBrowserHandle> {
  const { chromium } = await import("playwright")
  const cdpBase = process.env.AUTOSIM_CDP_URL
  if (!cdpBase) {
    const browser = await chromium.launch({ headless: opts.headless ?? true, args: opts.launchArgs ?? [] })
    return { browser, close: () => browser.close().catch(() => {}), kind: "local" }
  }
  const key = process.env.STEEL_API_KEY
  if (key) {
    const apiUrl = process.env.STEEL_API_URL ?? "https://api.steel.dev"
    const session: any = await (await fetch(`${apiUrl}/v1/sessions`, {
      method: "POST", headers: { "Steel-Api-Key": key, "Content-Type": "application/json" }, body: "{}",
    })).json()
    const browser = await chromium.connectOverCDP(`${cdpBase}?apiKey=${key}&sessionId=${session.id}`)
    const release = async () => {
      await fetch(`${apiUrl}/v1/sessions/${session.id}/release`, { method: "POST", headers: { "Steel-Api-Key": key } }).catch(() => {})
    }
    return {
      browser,
      close: async () => { try { await browser.close() } catch {} await release() },
      kind: "steel:" + (session.region ?? "remote"),
    }
  }
  const browser = await chromium.connectOverCDP(cdpBase)
  return { browser, close: () => browser.close().catch(() => {}), kind: "cdp-remote" }
}

async function connectRemotePuppeteer(cdpBase: string, _opts: AcquireOpts): Promise<BrowserHandle> {
  const { default: puppeteer } = await import("puppeteer-core") // lazy: prod (flag off) never loads it
  const key = process.env.STEEL_API_KEY
  if (key) {
    const apiUrl = process.env.STEEL_API_URL ?? "https://api.steel.dev"
    const session: any = await (await fetch(`${apiUrl}/v1/sessions`, {
      method: "POST", headers: { "Steel-Api-Key": key, "Content-Type": "application/json" }, body: "{}",
    })).json()
    const browser = await puppeteer.connect({ browserWSEndpoint: `${cdpBase}?apiKey=${key}&sessionId=${session.id}`, defaultViewport: null })
    const release = async () => { await fetch(`${apiUrl}/v1/sessions/${session.id}/release`, { method: "POST", headers: { "Steel-Api-Key": key } }).catch(() => {}) }
    return new PuppeteerHandle(browser, release, session.region ?? "remote")
  }
  const browser = await puppeteer.connect({ browserWSEndpoint: cdpBase, defaultViewport: null })
  return new PuppeteerHandle(browser, async () => {}, "remote")
}
