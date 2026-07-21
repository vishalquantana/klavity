// Robust CSS-selector computation for the on-page element picker (KLAVITYKLA-228, JTBD 1.11).
//
// When a reporter clicks the exact element that's broken, we pin it to the report as
// `annotations.selector` so the finding can later be linked back to the live DOM node. The
// selector must survive re-renders, so the strategy favours *stability* over brevity and
// deliberately avoids volatile, build-time framework hashes:
//
//   1. A usable, unique `id`                    → `#id`
//   2. A stable test attribute (data-testid…)   → `tag[data-testid="…"]`
//   3. Otherwise an ancestor path of segments up to a uniquely-anchored ancestor (or the root),
//      each segment = `tag` + stable classes + `:nth-of-type(n)` only when needed to disambiguate.
//
// Pure & DOM-only: reads standard Element properties, mutates nothing, and every uniqueness probe
// is guarded so a malformed selector can never throw. Safe to unit-test on a jsdom tree.

/** Minimal shape we need from a document/root to verify a selector resolves to exactly one node. */
export interface SelectorRoot {
  querySelectorAll(selectors: string): ArrayLike<unknown>
}

/** Escape a string for use as a CSS identifier. Prefer the platform CSS.escape; fall back for jsdom. */
export function cssEscape(ident: string): string {
  const g: any = typeof globalThis !== "undefined" ? globalThis : {}
  if (g.CSS && typeof g.CSS.escape === "function") return g.CSS.escape(ident)
  // Conservative manual escape: backslash anything that isn't a safe ident char.
  return String(ident).replace(/[^a-zA-Z0-9_-]/g, (ch) => "\\" + ch)
}

// Framework-generated class prefixes (emotion / styled-components / MUI / Next styled-jsx / chakra).
const VOLATILE_PREFIX = /^(css|sc|jsx|emotion|makeStyles|Mui[A-Z]|chakra)-/
// A trailing hash-y segment after a `-`/`_` separator: `foo-1a2b3c`, `Button__2Fj3k`.
const HASH_TAIL = /[-_][a-z0-9]*[0-9][a-z0-9]{4,}$/i
// A long hex run anywhere: emotion/styled/uuid ids.
const HEX_HASH = /[a-f0-9]{6,}/i

/**
 * True when a class name identifies the element by intent rather than by a build-time hash.
 * Rejects framework hashes, anything with characters illegal in a bare `.class` selector
 * (Tailwind arbitrary values, responsive `md:` prefixes, `w-1/2`), and idents that can't start
 * a CSS identifier.
 */
export function isStableClass(cls: string): boolean {
  if (!cls) return false
  if (/[^a-zA-Z0-9_-]/.test(cls)) return false // Tailwind arbitrary / responsive / illegal chars
  if (/^\d/.test(cls)) return false // CSS identifiers can't start with a digit
  if (VOLATILE_PREFIX.test(cls)) return false
  if (HEX_HASH.test(cls)) return false
  if (HASH_TAIL.test(cls)) return false
  if (cls.length > 40) return false
  return true
}

/** Stable, deduped class names for an element (capped so segments stay short), tolerant of SVG. */
function stableClasses(el: Element): string[] {
  const list: string[] =
    (el as any).classList && typeof (el as any).classList[Symbol.iterator] === "function"
      ? Array.from((el as any).classList as Iterable<string>)
      : String((el.getAttribute && el.getAttribute("class")) || "").split(/\s+/)
  const out: string[] = []
  for (const c of list) {
    if (isStableClass(c) && !out.includes(c)) out.push(c)
    if (out.length >= 2) break
  }
  return out
}

/** 1-based position among same-tag siblings — the input to `:nth-of-type`. */
function nthOfType(el: Element): number {
  let n = 1
  let sib = el.previousElementSibling
  while (sib) {
    if (sib.tagName === el.tagName) n++
    sib = sib.previousElementSibling
  }
  return n
}

// Stable identifying attributes, in priority order — far more durable than a positional path.
const STABLE_ATTRS = ["data-testid", "data-test", "data-cy", "data-qa"]

/** A `#id` selector when the element carries a clean, non-volatile id; otherwise null. */
function idSelectorFor(el: Element): string | null {
  const id = el.id || (el.getAttribute && el.getAttribute("id")) || ""
  if (!id) return null
  if (/[^a-zA-Z0-9_-]/.test(id)) return null // radix `:r3:`, uuids with punctuation, etc.
  if (/^\d/.test(id)) return null
  if (HEX_HASH.test(id)) return null // hashed/generated ids
  return "#" + cssEscape(id)
}

/** A `tag[data-testid="…"]` selector when a stable test attribute is present; otherwise null. */
function attrSelectorFor(el: Element): string | null {
  if (!el.getAttribute) return null
  for (const a of STABLE_ATTRS) {
    const v = el.getAttribute(a)
    if (v && !/["\\]/.test(v)) return el.tagName.toLowerCase() + "[" + a + '="' + v + '"]'
  }
  return null
}

/** One path segment: `tag` + stable classes, with `:nth-of-type(n)` only when siblings collide. */
function segmentFor(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const classes = stableClasses(el)
  let seg = tag + classes.map((c) => "." + cssEscape(c)).join("")
  const parent = el.parentElement
  if (parent) {
    const sameTag = Array.from(parent.children).filter((c) => c.tagName === el.tagName)
    if (sameTag.length > 1) {
      // If our stable classes already single us out among same-tag siblings, skip the positional index.
      const matches = classes.length
        ? sameTag.filter((c) => classes.every((cl) => (c as any).classList && (c as any).classList.contains(cl)))
        : sameTag
      if (matches.length > 1) seg += ":nth-of-type(" + nthOfType(el) + ")"
    }
  }
  return seg
}

/**
 * Compute a robust, unique CSS selector for `el`. Returns null for non-element inputs. When a
 * `root` (document) is available, the result is verified to resolve to exactly one node and the
 * shortest uniquely-resolving path is returned; without a root, a best-effort path is produced.
 */
export function computeSelector(el: Element | null | undefined, root?: SelectorRoot): string | null {
  if (!el || (el as any).nodeType !== 1) return null

  const doc: SelectorRoot | undefined =
    root ??
    ((el.ownerDocument as any) || undefined) ??
    (typeof document !== "undefined" ? (document as any) : undefined)

  const isUnique = (sel: string): boolean => {
    if (!doc) return true // no root to verify against — assume the caller's path is good enough
    try {
      return doc.querySelectorAll(sel).length === 1
    } catch {
      return false
    }
  }

  // 1. A unique id wins outright.
  const idSel = idSelectorFor(el)
  if (idSel && isUnique(idSel)) return idSel

  // 2. A unique stable test attribute is the next most durable anchor.
  const attrSel = attrSelectorFor(el)
  if (attrSel && isUnique(attrSel)) return attrSel

  // 3. Walk up, prepending segments, stopping at a uniquely-anchored ancestor or the document root.
  const parts: string[] = []
  let node: Element | null = el
  let depth = 0
  while (node && (node as any).nodeType === 1 && depth < 8) {
    const tag = node.tagName.toLowerCase()
    if (tag === "html" || tag === "body") {
      parts.unshift(tag)
      break
    }
    // An ancestor with its own unique id/attr anchors the whole path — stop climbing.
    if (node !== el) {
      const anchor = idSelectorFor(node) || attrSelectorFor(node)
      if (anchor && isUnique(anchor)) {
        parts.unshift(anchor)
        break
      }
    }
    parts.unshift(segmentFor(node))
    // Shortest-unique short-circuit: return as soon as the partial path resolves to just our element.
    const candidate = parts.join(" > ")
    if (isUnique(candidate)) return candidate
    node = node.parentElement
    depth++
  }

  return parts.join(" > ") || el.tagName.toLowerCase()
}

/**
 * Short, human-readable snippet describing a picked element for the ticket drawer (KLAVITYKLA-371).
 * Preference order: aria-label > placeholder > visible text > bare tag name. Capped at 80 chars.
 * Returns a string like "<button> Save changes" or "<input>" when no text is available.
 */
export function describeElement(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const ariaLabel = el.getAttribute("aria-label") || ""
  const placeholder = (el as HTMLInputElement).placeholder || ""
  const inner = ((el as HTMLElement).innerText || el.textContent || "").replace(/\s+/g, " ").trim()
  const label = (ariaLabel || placeholder || inner).trim().slice(0, 80)
  return label ? `<${tag}> ${label}` : `<${tag}>`
}
