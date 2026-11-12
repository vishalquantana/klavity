// Compact model-readable page snapshot for AutoSims (bench: prototype/docs/bench-autosim-cost.md).
// One line per VISIBLE semantic element: `role "name" {disabled?} [ref=eN]`, indented by depth.
// Interactive elements are stamped with data-kref="eN" so every [ref=eN] the model cites is a
// REAL unique CSS selector — [data-kref="eN"] — for the current page state ONLY.
//
// INVARIANT (spec §1): kref selectors are EPHEMERAL — renumbered every capture, gone on reload.
// Persistence points (trajectory resolvedSelector, locator_cache, heal toSelector) must convert
// via stableSelectorFor() (fallback: fingerprint domPath) before storing anything.
import type { Page, Locator } from "playwright"
import type { Fingerprint, TrailStep } from "./trails-types"

export const KREF_SNAPSHOT_CAP = 24_000
const TRUNCATION_MARKER = "\n…[snapshot truncated]"

/** True iff s is exactly one stamped kref selector, e.g. `[data-kref="e12"]`. */
export function isKrefSelector(s: string | null | undefined): boolean {
  // KD-2255: the model also writes button[data-kref="e26"] / [data-kref='e6']; those are just as ephemeral
  // and were being persisted into the replay script (replay can never match them).
  return typeof s === "string" && /^[a-z0-9-]*\[data-kref=["']?e\d+["']?\]$/i.test(s.trim())
}

export type RecordedStepState = {
  stepId: string
  idx: number
  action: TrailStep["action"]
  actionValue: string | null
  selector: string | null
  target: Fingerprint | null
  checkpoint: { description: string } | null
  pageUrl: string
}

function dekref(s: string): string {
  return s.replace(/[a-z0-9-]*\[data-kref=["']?(e\d+)["']?\]/gi, "snapshot ref $1")
}

function safeSelector(selector: string | null | undefined): string | null {
  return selector ? dekref(selector) : null
}

function safeFingerprint(fp: Fingerprint | null | undefined): Fingerprint | null {
  if (!fp) return null
  return {
    ...fp,
    domPath: fp.domPath ? dekref(fp.domPath) : fp.domPath,
  }
}

export function recordedStepState(
  step: Pick<TrailStep, "id" | "idx" | "action" | "actionValue" | "target" | "checkpoint">,
  selector: string | null | undefined,
  pageUrl: string,
  target?: Fingerprint | null,
): RecordedStepState {
  return {
    stepId: step.id,
    idx: step.idx,
    action: step.action,
    actionValue: step.actionValue ?? null,
    selector: safeSelector(selector),
    target: safeFingerprint(target === undefined ? step.target : target),
    checkpoint: step.checkpoint ?? null,
    pageUrl,
  }
}

/**
 * Serialize the page to a compact ref-annotated element tree and stamp data-kref attrs.
 * Deterministic single page.evaluate; previous stamps are cleared first so re-captures
 * renumber cleanly. Output capped at `cap` chars with an explicit truncation marker.
 */
export async function captureKrefSnapshot(page: Page, cap = KREF_SNAPSHOT_CAP): Promise<string> {
  const out = await page.evaluate(() => {
    // Runs in page context: everything must be inlined.
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
      // Dropdown panel without ARIA (Bootstrap "dropdown-menu", CSS-module "_add_dropdown_menu_x1y2"):
      // emit it as a container so its items nest under it.
      if (/dropdown[-_]?menu/i.test(el.getAttribute("class") || "")) return "menu"
      return null
    }
    // Clickable elements with no semantic role (<a> without href, <div onclick>, Bootstrap
    // data-toggle, React onClick divs that only show cursor:pointer). Without a ref the model
    // cannot target them and picks a look-alike (e.g. nav "Projects" instead of the Add menu's
    // "Project"). An element wrapping other clickables is skipped so its children are listed.
    const CLICKABLE_INSIDE = "a,button,input,select,textarea,[role],[onclick],[data-toggle],[data-bs-toggle],[tabindex]"
    // React keeps an element's props on the node (__reactProps$<id>, React <17: __reactEventHandlers$<id>).
    // An onClick there is the ONLY trace of a <div onClick> with no cursor/role/attribute (PX4 header "Add").
    const reactClick = (el: Element): boolean => {
      for (const k of Object.keys(el)) {
        if (k.startsWith("__reactProps$") || k.startsWith("__reactEventHandlers$")) {
          const p = (el as any)[k]
          return !!(p && (p.onClick || p.onMouseDown || p.onPointerDown))
        }
      }
      return false
    }
    const handlers = new Set<Element>()
    document.body.querySelectorAll("*").forEach((el) => { if (reactClick(el)) handlers.add(el) })
    // Ancestors of any clickable are wrappers, not targets: list the inner clickables instead.
    const wrappers = new Set<Element>()
    for (const el of [...Array.from(handlers), ...Array.from(document.body.querySelectorAll(CLICKABLE_INSIDE))]) {
      for (let p = el.parentElement; p && !wrappers.has(p); p = p.parentElement) wrappers.add(p)
    }
    const isPointer = (el: Element | null) => !!el && getComputedStyle(el as HTMLElement).cursor === "pointer"
    const isUntypedClickable = (el: Element): boolean => {
      if (wrappers.has(el)) return false
      const t = el.tagName.toLowerCase()
      const explicit = t === "a" || handlers.has(el) || el.hasAttribute("onclick") || el.hasAttribute("data-toggle") ||
        el.hasAttribute("data-bs-toggle") || el.hasAttribute("aria-haspopup") ||
        (el.hasAttribute("tabindex") && el.getAttribute("tabindex") !== "-1")
      // cursor:pointer is inherited, so only the outermost pointer element counts.
      return explicit || (isPointer(el) && !isPointer(el.parentElement))
    }
    const inMenu = (el: Element) => !!el.closest('[class*="dropdown-menu"],[class*="dropdown_menu"],[class*="dropdownMenu"],[role="menu"],[role="listbox"]')
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
    // Short visible labels in generic containers ("Add" in <div><i/> Add</div>) whose click handler we
    // cannot see (jQuery $(..).on("click"), delegated listeners, PHP-rendered headers). Giving the label a
    // ref lets the model click it like a person would; the click bubbles to the real handler.
    const LABEL_TAGS = new Set(["span", "div", "i", "b", "strong", "small", "em", "font"])
    const ownText = (el: Element): string => Array.from(el.childNodes)
      .filter((c) => c.nodeType === 3).map((c) => c.textContent || "").join(" ").trim().replace(/\s+/g, " ")
    const walk = (el: Element, depth: number, inCtl = false) => {
      for (const child of Array.from(el.children)) {
        const t = child.tagName.toLowerCase()
        if (SKIP.has(t)) continue
        let emitted = false
        let refd = false
        if (visible(child)) {
          let role = roleOf(child)
          let clickable = false
          if (!role && isUntypedClickable(child) && nameOf(child)) {
            role = inMenu(child) ? "menuitem" : "button"
            clickable = true
          }
          const indent = "  ".repeat(Math.min(depth, 6))
          if (role) {
            let line = `${indent}${role} "${nameOf(child)}"`
            if ((child as HTMLInputElement).disabled) line += " {disabled}"
            if (clickable || INTERACTIVE.has(t) || child.getAttribute("role")) {
              const ref = `e${++n}`
              child.setAttribute("data-kref", ref)
              line += ` [ref=${ref}]`
              refd = true
            }
            lines.push(line)
            emitted = true
          } else if (!inCtl && LABEL_TAGS.has(t) && /^.{2,30}$/.test(ownText(child))) {
            const ref = `e${++n}`
            child.setAttribute("data-kref", ref)
            lines.push(`${indent}text "${ownText(child)}" [ref=${ref}]`)
            emitted = true
            refd = true
          } else if (TEXTUAL.has(t)) {
            // Structural text digest (NO ref): only direct text, only when it has no element
            // children carrying the same text — keeps asserts groundable without ballooning.
            const own = (child.textContent || "").trim().replace(/\s+/g, " ")
            if (own && own.length >= 3 && child.children.length === 0) {
              lines.push(`${indent}text "${own.slice(0, 80)}"`)
              emitted = true
            }
          }
        }
        walk(child, emitted ? depth + 1 : depth, inCtl || refd)
      }
    }
    walk(document.body, 0)
    return lines.join("\n")
  })
  if (out.length > cap) return out.slice(0, cap - TRUNCATION_MARKER.length) + TRUNCATION_MARKER
  return out
}

/**
 * Stable CSS for an element the model addressed by kref (or any locator): #id → [data-testid]
 * → tag[aria-label]. Returns null when no stable handle exists — callers fall back to the
 * step fingerprint's domPath. Mirrors the runner's persistableSelector ladder.
 */
export async function stableSelectorFor(loc: Locator): Promise<string | null> {
  try {
    return await loc.first().evaluate((el: Element) => {
      const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
      if (el.id) return "#" + CSS.escape(el.id)
      const tid = el.getAttribute("data-testid")
      if (tid) return `[data-testid="${esc(tid)}"]`
      const al = el.getAttribute("aria-label")
      if (al) return `${el.tagName.toLowerCase()}[aria-label="${esc(al)}"]`
      return null
    })
  } catch {
    return null
  }
}

/**
 * Structural 4-level CSS path for any attached element: `tag:nth-of-type(i)>...`. Runs entirely
 * inside a page.evaluate (page context) — no imports, no closures from module scope. This path
 * is stable across re-numberings of data-kref and survives elements that have NO id, testid, or
 * aria-label. Always returns a non-empty string for an attached element; returns null only if the
 * evaluate call itself throws (element detached, page closed, etc.).
 *
 * Used as the last-resort fallback before giving up persistence in the vision heal path:
 *   stableSelectorFor → fp?.domPath → structuralPathFor → null (skip upsert).
 *
 * The algorithm mirrors captureFingerprint in trails-author.ts: walk up ≤4 ancestors, counting
 * same-tag preceding siblings to build `:nth-of-type(i)` segments joined by ` > `.
 */
export async function structuralPathFor(loc: Locator): Promise<string | null> {
  try {
    // count() is synchronous snapshot — it does NOT auto-wait, so 0 means "gone right now".
    // Bail early to avoid the auto-wait behaviour of evaluate() on an unmatched locator.
    if (await loc.count() === 0) return null
    return await loc.first().evaluate((el: Element) => {
      // Everything inlined — this runs in the page context, not the module scope.
      let path = ""
      let cur: Element | null = el
      for (let d = 0; cur && d < 4; d++) {
        let i = 1
        let sib = cur.previousElementSibling
        while (sib) {
          if (sib.tagName === cur.tagName) i++
          sib = sib.previousElementSibling
        }
        const segment = cur.tagName.toLowerCase() + ":nth-of-type(" + i + ")"
        path = path ? segment + ">" + path : segment
        cur = cur.parentElement
      }
      return path || null
    })
  } catch {
    return null
  }
}
