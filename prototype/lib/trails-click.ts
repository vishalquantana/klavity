import type { Locator, Page } from "playwright"

type TransitionIntent =
  | { kind: "go"; step: number }
  | { kind: "chooseGoal"; goal: string; step: number }
  | { kind: "setView"; view: string }
  // Generic: element has an inline onclick that didn't match a known API name.
  // The fallback fires the handler directly, bypassing any capture-phase trusted-event guard.
  | { kind: "invoke" }

const TRANSITION_SETTLE_MS = 200

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * KLA-67: wait until no CSS transitions or Web Animations are running, or capMs elapses.
 * Uses document.getAnimations() (includes CSSTransition/CSSAnimation since Chrome 84, which
 * Playwright targets). A no-op when no animations are detected so broken-click paths exit fast.
 */
async function waitForAnimationSettle(page: Page, capMs: number): Promise<void> {
  if (capMs <= 0) return
  // Quick synchronous check: if nothing is running, return immediately (broken-click fast path).
  const hasRunning = await page.evaluate(
    () => document.getAnimations().some((a) => a.playState === "running"),
  ).catch(() => false)
  if (!hasRunning) return
  // An animation is in progress — wait for all to finish or cap to elapse.
  await page.waitForFunction(
    () => !document.getAnimations().some((a) => a.playState === "running"),
    undefined,
    { timeout: capMs },
  ).catch(() => {})
}

async function readTransitionIntent(locator: Locator): Promise<TransitionIntent | null> {
  return await locator.evaluate((el: Element) => {
    type Intent =
      | { kind: "go"; step: number }
      | { kind: "chooseGoal"; goal: string; step: number }
      | { kind: "setView"; view: string }

    const parse = (src: string | null | undefined): Intent | null => {
      if (!src) return null
      const go = src.match(/\bgo\(\s*(\d+)\s*\)/)
      if (go) return { kind: "go", step: Number(go[1]) }
      const goal = src.match(/\bchooseGoal\(\s*['"]([^'"]+)['"]\s*\)/)
      if (goal) return { kind: "chooseGoal", goal: goal[1], step: 1 }
      const view = src.match(/\b(?:klavSetView|setView)\(\s*['"]([^'"]+)['"]\s*\)/)
      if (view) return { kind: "setView", view: view[1] }
      return null
    }

    let node: Element | null = el
    for (let depth = 0; node && depth < 4; depth++, node = node.parentElement) {
      const dataGo = node.getAttribute("data-go")
      if (dataGo) return { kind: "setView", view: dataGo }

      const onclickAttr = node.getAttribute("onclick")
      const attr = parse(onclickAttr)
      if (attr) return attr

      const prop = (node as HTMLElement).onclick
      const fromProp = typeof prop === "function" ? parse(String(prop)) : null
      if (fromProp) return fromProp

      // Generic fallback: onclick exists but didn't match a known API name.
      // Signal the caller to fire the handler directly if the click had no visible effect.
      if (onclickAttr || typeof prop === "function") return { kind: "invoke" }
    }
    return null
  })
}

async function transitionSatisfied(page: Page, intent: TransitionIntent): Promise<boolean> {
  return await page.evaluate((i: TransitionIntent) => {
    const visible = (el: Element | null): boolean => {
      if (!el) return false
      const style = window.getComputedStyle(el)
      const rect = (el as HTMLElement).getBoundingClientRect()
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0
    }
    if (i.kind === "go" || i.kind === "chooseGoal") {
      return visible(document.querySelector(`.step[data-s="${i.step}"]`))
    }
    return document.body.getAttribute("data-view") === i.view || location.hash === `#${i.view}`
  }, intent)
}

async function invokeTransitionFallback(page: Page, intent: TransitionIntent): Promise<void> {
  await page.evaluate((i: TransitionIntent) => {
    const w = window as any
    if (i.kind === "go") {
      if (typeof w.go === "function") w.go(i.step)
      return
    }
    if (i.kind === "chooseGoal") {
      if (typeof w.chooseGoal === "function") w.chooseGoal(i.goal)
      else if (typeof w.go === "function") w.go(i.step)
      return
    }
    if (typeof w.setView === "function") w.setView(i.view)
    else if (typeof w.klavSetView === "function") w.klavSetView(i.view)
  }, intent)
}

async function readPageState(page: Page): Promise<string | null> {
  return await page.evaluate(() => `${location.href}\n${document.body.innerHTML}`).catch(() => null)
}

/**
 * KD-2255: goto that tolerates the app's own redirect. PX4 sends the browser to /Resources by script
 * right after the company pick; a goto issued meanwhile fails with "interrupted by another navigation"
 * and crashed the whole replay. Let the app's navigation land, then go where the step says (2 retries).
 */
export async function gotoPastRedirect(page: Page, url: string, opts: { timeout: number; waitUntil?: "load" | "domcontentloaded" }): Promise<void> {
  const where = (u: string) => { try { const x = new URL(u); return x.origin + x.pathname.replace(/\/+$/, "") } catch { return u } }
  const settle = () => page.waitForLoadState("load", { timeout: Math.min(opts.timeout, 15_000) }).catch(() => {})
  for (let i = 0; ; i++) {
    let resp: Awaited<ReturnType<Page["goto"]>> = null
    try { resp = await page.goto(url, opts) }
    catch (e) {
      if (i >= 2 || !/interrupted by another navigation/i.test(String((e as Error)?.message ?? e))) throw e
      await settle(); continue
    }
    // The server served the page we asked for, but the app's own script then sent us elsewhere (a silent
    // bounce, no error): let it land and go back. A server-side redirect (resp URL differs) is honored.
    const serverRedirected = !!resp && where(resp.url()) !== where(url)
    if (i >= 2 || serverRedirected || where(page.url()) === where(url)) return
    await settle()
  }
}

/**
 * KD-2255: `select` on a styled dropdown (select2 / chosen / a wrapper div). The visible element is a
 * <span role="combobox">, not a <select>, so Playwright's selectOption throws "Element is not a <select>
 * element" and the walk stalls after 3 identical misses. Resolve the hidden native <select> behind the
 * widget and set it there (the widget listens for its `change` event); with no backing <select>, open
 * the widget and click the visible option.
 */
export async function selectOptionAnyWidget(locator: Locator, value: string, timeoutMs: number): Promise<void> {
  const target = locator.first()
  const backing = (await target.evaluateHandle((el: Element) => {
    if (el.tagName === "SELECT") return el
    const inner = el.querySelector("select")
    if (inner) return inner
    const prev = el.closest(".select2-container, .chosen-container")?.previousElementSibling
    if (prev?.tagName === "SELECT") return prev
    const ids = [el.id, el.getAttribute("aria-labelledby"), el.querySelector("[id^='select2-']")?.id]
    for (const id of ids) {
      const m = id?.match(/^select2-(.+)-container$/)
      const s = m && document.getElementById(m[1])
      if (s?.tagName === "SELECT") return s
    }
    return null
  }, undefined, { timeout: timeoutMs })).asElement()
  if (backing) {
    // Widget-hidden <select> never becomes "visible", so skip actionability checks for it only.
    await backing.selectOption(value, { timeout: timeoutMs, force: !(await backing.isVisible()) })
    return
  }
  await clickWithTransitionFallback(target, timeoutMs)
  const page = target.page()
  await page.getByRole("option", { name: value, exact: true })
    .or(page.getByText(value, { exact: true }))
    .filter({ visible: true }).first()
    .click({ timeout: timeoutMs })
}

/**
 * Playwright's real click remains the primary action. Some Klavity shell pages use inline
 * `go(N)` / `setView(...)` transition handlers; in headless walks those clicks have been observed
 * to complete without the transition taking effect. For those known idempotent transitions, verify
 * the expected state and invoke the same page API as a narrow fallback.
 *
 * KLA-67: settleCapMs sets the budget for animation settle after the click. Pass the caller's
 * actionTimeout so slow CSS-animated panels (e.g. 6s transitions) are waited out rather than
 * triggering a premature fallback invocation. Defaults to TRANSITION_SETTLE_MS * 10 (2s) for
 * backward compatibility with callers that don't thread the action timeout through.
 */
export async function clickWithTransitionFallback(
  locator: Locator,
  timeoutMs: number,
  settleCapMs = TRANSITION_SETTLE_MS * 10,
): Promise<void> {
  const target = locator.first()
  const intent = await readTransitionIntent(target).catch(() => null)
  const canRecoverSideEffect = !intent || intent.kind === "invoke"
  const beforeState = canRecoverSideEffect ? await readPageState(target.page()) : null

  let clickError: unknown = null
  try {
    await target.click({ timeout: timeoutMs })
  } catch (e) {
    clickError = e
  }

  // KD-2255: the target exists and is enabled but another element is drawn on top of it (overlapping
  // header on a narrow window, sticky bar, transparent overlay) or it sits outside the viewport.
  // A real mouse click would hit the cover, so click the element itself. Disabled/missing targets
  // still fail as before.
  if (clickError && /intercepts pointer events|outside of the viewport/i.test(String((clickError as Error)?.message ?? clickError))) {
    try {
      await target.evaluate((el) => { (el as HTMLElement).scrollIntoView({ block: "center" }); (el as HTMLElement).click() }, undefined, { timeout: 2_000 })
      clickError = null
    } catch { /* keep the original, more descriptive error */ }
  }

  if (clickError && !canRecoverSideEffect) throw clickError

  if (!intent) {
    if (clickError && beforeState === await readPageState(target.page())) throw clickError
    return
  }

  if (intent.kind === "invoke") {
    // Generic panel-transition fallback (KLA-58). After the click settles, check whether the
    // button is still visible. If it is, the onclick was swallowed (trusted-event capture guard
    // or similar) — fire the handler directly, bypassing the DOM event path.
    //
    // isVisible() is a non-blocking snapshot: safe to call on role-based locators whose element
    // may already be hidden (unlike evaluate(), which would hang 30s on a hidden getByRole target).
    await wait(TRANSITION_SETTLE_MS)
    if (await target.isVisible().catch(() => false)) {
      await target.evaluate((el) => {
        const h = el as HTMLElement
        if (typeof h.onclick === "function")
          h.onclick.call(h, new MouseEvent("click", { bubbles: false, cancelable: true }))
      }).catch(() => {})
    }
    // Use waitFor instead of a flat sleep: resolves as soon as the button's panel hides, giving
    // the transition exactly the time it needs (not a fixed delay). Timeout is a safety bound.
    await target.waitFor({ state: "hidden", timeout: TRANSITION_SETTLE_MS * 10 }).catch(() => {})
    if (clickError && beforeState === await readPageState(target.page())) throw clickError
    return
  }

  if (clickError) throw clickError

  // KLA-67: adaptive animation settle for known-API transitions (go/chooseGoal/setView).
  // 1. Brief initial wait to let the transition begin.
  await wait(TRANSITION_SETTLE_MS)
  if (await transitionSatisfied(target.page(), intent).catch(() => false)) return
  // 2. Wait for running CSS transitions / Web Animations to complete before re-checking.
  //    If nothing is running (broken click), waitForAnimationSettle exits immediately so
  //    the fallback fires fast. If a 6s+ transition is in flight, we wait it out.
  const remaining = Math.max(0, settleCapMs - TRANSITION_SETTLE_MS)
  await waitForAnimationSettle(target.page(), remaining)
  if (await transitionSatisfied(target.page(), intent).catch(() => false)) return

  // KLA-66: transition didn't complete after the click. Invoke the page API to keep the UI
  // moving (so later steps aren't stranded), then throw so the runner records this as a RED
  // regression finding rather than silently masking a broken click.
  await invokeTransitionFallback(target.page(), intent)
  await wait(TRANSITION_SETTLE_MS)
  throw new Error(
    `transition_regression: click on "${intent.kind}" element did not produce the expected page transition; fallback invoked`,
  )
}
