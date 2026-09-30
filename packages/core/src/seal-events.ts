// KLA-37: keep Klavity's own pointer events out of the host page.
//
// Host apps very commonly dismiss a popover from a document-level "click outside" listener:
//
//   document.addEventListener('click', (e) => { if (!panel.contains(e.target)) close(panel) })
//
// Every piece of our chrome (launcher, composer, region overlay, annotation inputs, upload pill…) is
// mounted on document.body, and most of it sits behind a shadow root — so the retargeted e.target the
// host page sees is our host element, which is never inside their panel. Their guard therefore passes
// and they tear down the very UI state the reporter was trying to capture. PX4's list pages do exactly
// this: a document click listener that runs `$('#list1').removeClass('visible')`.
//
// sealFromHostPage() stops those events at our element, during the BUBBLE phase only. That choice is
// what makes it safe:
//   • Listeners on the sealed element itself still run — stopPropagation() only blocks ANCESTORS, and
//     never sibling listeners on the same node (that would be stopImmediatePropagation).
//   • Descendant listeners inside our own tree have already run by the time the event reaches here.
//   • Document-level CAPTURE listeners (our right-click guard, the element picker) fire BEFORE this and
//     are untouched.
//
// Only the three events that popovers actually close on are sealed. Deliberately NOT sealed:
//   • mouseup / pointerup / pointermove — a region drag that ends over our chrome still needs these to
//     reach the document handlers that finish the gesture.
//   • contextmenu — right-clicks on our own UI are already filtered by the widget's onOwnUi().
//   • keydown / paste — the composer's Esc and clipboard handlers are bound on document by design.
const SEALED_EVENTS = ["pointerdown", "mousedown", "click"] as const

export function sealFromHostPage(el: Element | null | undefined): void {
  if (!el || typeof (el as Element).addEventListener !== "function") return
  for (const type of SEALED_EVENTS) {
    try {
      el.addEventListener(type, (e: Event) => e.stopPropagation())
    } catch {
      /* exotic/cross-realm node — sealing is best-effort, never fatal */
    }
  }
}
