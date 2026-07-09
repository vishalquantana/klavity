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
  return typeof s === "string" && /^\[data-kref="e\d+"\]$/.test(s.trim())
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
  return s.replace(/\[data-kref="(e\d+)"\]/g, "snapshot ref $1")
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
            if (INTERACTIVE.has(t) || child.getAttribute("role")) {
              const ref = `e${++n}`
              child.setAttribute("data-kref", ref)
              line += ` [ref=${ref}]`
            }
            lines.push(line)
            emitted = true
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
        walk(child, emitted ? depth + 1 : depth)
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
