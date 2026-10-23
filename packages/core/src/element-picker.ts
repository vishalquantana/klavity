// KLAVITYKLA-228/371 (JTBD 1.11): on-page element picker. Mounts a lightweight highlight overlay that
// tracks the element under the cursor; on click it computes a robust unique CSS selector + captures a
// human-readable text snippet (aria-label / placeholder / visible text) to pin onto the report as
// annotations.selector + annotations.selectorText. Esc cancels. The highlight/label/banner are
// pointer-events:none so elementFromPoint always reads the page beneath.
// KD-988: moved here from packages/sdk/src/widget.ts so the Chrome extension's composer offers the SAME
// "Pick element" as the widget. The two hosts differ only in their own UI root (never pickable) and how
// they crop a screenshot of a rect, so both are parameters.
import type { CaptureQuality, PickedTarget } from './modal'
import { computeSelector, describeElement } from './element-selector'
import { safeRemove } from './safe-remove'

export type PickerRect = { x: number; y: number; w: number; h: number }

export interface PickElementOptions {
  /** ids of the host's own UI roots (launcher, dock, panels…) — never highlighted or picked. */
  hostIds: string[]
  /** Crop a screenshot of the picked element's box (CSS viewport px). Best-effort: a rejection only
   *  drops the shot; the selector still pins the element. Absent → no element screenshot. */
  captureRect?: (rect: PickerRect) => Promise<{ dataUrl: string; quality: CaptureQuality }>
}

export function pickElementOnPage(opts: PickElementOptions): Promise<PickedTarget | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined" || !document.body) return resolve(null)
    const box = document.createElement("div")
    // KLA-763 (odd color): the element-picker highlight box + label used #6d5efc / rgba(109,94,252,…),
    // an off-brand purple that read as a DIFFERENT accent from the rest of the widget/composer (which is
    // the Klavity brand accent #6366f1 = rgb 99,102,241 everywhere else — pill, FAB, region-drag, chips).
    // Snap them to the brand accent so the picker matches the composer.
    box.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;border:2px solid #6366f1;background:rgba(99,102,241,.14);border-radius:4px;box-shadow:0 0 0 2px rgba(255,255,255,.55);display:none;"
    const label = document.createElement("div")
    label.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;font:600 11px/1.4 system-ui,-apple-system,sans-serif;color:#fff;background:#6366f1;padding:2px 7px;border-radius:5px;max-width:60vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:none;"
    const banner = document.createElement("div")
    banner.setAttribute("role", "status")
    banner.setAttribute("aria-live", "polite")
    banner.textContent = "Click the element that's broken · press Esc to cancel"
    banner.style.cssText = "position:fixed;z-index:2147483647;top:16px;left:50%;transform:translateX(-50%);pointer-events:none;font:600 13px/1.4 system-ui,-apple-system,sans-serif;color:#fff;background:#111827;padding:8px 16px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,.3);"
    document.body.append(box, label, banner)
    const rootEl = document.documentElement
    const prevCursor = rootEl.style.cursor
    rootEl.style.cursor = "crosshair"

    const isOurs = (el: Element | null): boolean => {
      for (let n: Element | null = el; n; n = n.parentElement) {
        if ((n.id && opts.hostIds.includes(n.id)) || n === box || n === label || n === banner) return true
      }
      return false
    }
    const highlight = (el: Element) => {
      const r = el.getBoundingClientRect()
      box.style.display = "block"
      box.style.left = r.left + "px"; box.style.top = r.top + "px"
      box.style.width = r.width + "px"; box.style.height = r.height + "px"
      const tag = el.tagName.toLowerCase()
      const id = el.id ? "#" + el.id : ""
      const cls = el.classList && el.classList.length ? "." + el.classList[0] : ""
      label.textContent = tag + id + cls
      label.style.display = "block"
      label.style.left = r.left + "px"
      label.style.top = Math.max(2, r.top - 22) + "px"
    }
    const onMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (!el || isOurs(el)) return
      highlight(el)
    }
    // Tear down the picker overlays + listeners. Split from resolve() so onClick can drop the highlight
    // overlays BEFORE it captures the element crop (otherwise the purple box/label paint into the shot).
    const teardown = () => {
      document.removeEventListener("mousemove", onMove, true)
      document.removeEventListener("click", onClick, true)
      document.removeEventListener("keydown", onKey, true)
      rootEl.style.cursor = prevCursor
      safeRemove(box); safeRemove(label); safeRemove(banner)
    }
    const cleanup = (result: PickedTarget | null) => { teardown(); resolve(result) }
    const onClick = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (!el || isOurs(el)) return
      e.preventDefault(); e.stopPropagation()
      const selector = computeSelector(el)
      if (!selector) { cleanup(null); return }
      // KLAVITYKLA-494: also grab a cropped screenshot of the picked element's bounding box so the report
      // carries an image of exactly what's broken (not just the selector/kref/context). Capture the rect +
      // text NOW, drop the picker overlays, then crop it via the host's captureRect.
      const r = el.getBoundingClientRect()
      const text = describeElement(el)
      teardown()
      void (async () => {
        let shot: string | undefined
        let shotQuality: CaptureQuality | undefined
        try {
          if (opts.captureRect && r.width >= 1 && r.height >= 1) {
            const { dataUrl, quality } = await opts.captureRect({ x: r.left, y: r.top, w: r.width, h: r.height })
            shot = dataUrl
            shotQuality = quality
          }
        } catch { /* the crop is best-effort — the selector still pins the element even if capture fails */ }
        // KLA-621: carry the element's rect so Retake can redo THIS element (re-resolved live from the selector,
        // rect as fallback) cropped pixel-perfect — not a full-screen grab.
        resolve({ selector, text, shot, shotQuality, rect: { x: r.left, y: r.top, w: r.width, h: r.height } })
      })()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); cleanup(null) }
    }
    // Capture phase so we win the click/keydown before the host page's own handlers.
    document.addEventListener("mousemove", onMove, true)
    document.addEventListener("click", onClick, true)
    document.addEventListener("keydown", onKey, true)
  })
}
