import type { Locator, Page } from "playwright"

type TransitionIntent =
  | { kind: "go"; step: number }
  | { kind: "chooseGoal"; goal: string; step: number }
  | { kind: "setView"; view: string }

const TRANSITION_SETTLE_MS = 200

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

      const attr = parse(node.getAttribute("onclick"))
      if (attr) return attr

      const prop = (node as HTMLElement).onclick
      const fromProp = typeof prop === "function" ? parse(String(prop)) : null
      if (fromProp) return fromProp
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

/**
 * Playwright's real click remains the primary action. Some Klavity shell pages use inline
 * `go(N)` / `setView(...)` transition handlers; in headless walks those clicks have been observed
 * to complete without the transition taking effect. For those known idempotent transitions, verify
 * the expected state and invoke the same page API as a narrow fallback.
 */
export async function clickWithTransitionFallback(locator: Locator, timeoutMs: number): Promise<void> {
  const target = locator.first()
  const intent = await readTransitionIntent(target).catch(() => null)

  await target.click({ timeout: timeoutMs })

  if (!intent) return
  await wait(TRANSITION_SETTLE_MS)
  if (await transitionSatisfied(target.page(), intent).catch(() => false)) return

  await invokeTransitionFallback(target.page(), intent)
  await wait(TRANSITION_SETTLE_MS)
}
