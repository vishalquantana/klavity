// Some customer pages ship libraries (e.g. priority-nav.min.js) that CLOBBER the DOM with a broken,
// non-spec polyfill:  Element.prototype.remove = function(){ this.parentNode.removeChild(this) }  — with
// NO null guard. Native .remove() is a safe no-op on a detached node, but that polyfill THROWS
// `TypeError: Cannot read properties of null (reading 'removeChild')` whenever parentNode is null. Our
// widget/modal/region hot paths call .remove() assuming native semantics, so a single detached node
// makes the whole handler throw — leaking the native context menu and stacking our menu nodes.
//
// safeRemove() detaches a node WITHOUT ever invoking the (possibly poisoned) Element.prototype.remove:
// it walks to parentNode and calls removeChild directly, guarding every hop, and swallows any throw.
// Prefer this over node.remove() anywhere prototype pollution could reach us.
export function safeRemove(node: Node | null | undefined): void {
  try {
    if (node && (node as Node).parentNode) {
      ;(node as Node).parentNode!.removeChild(node as Node)
    }
  } catch {
    /* clobbered prototype / already-detached / cross-realm node — detaching is best-effort, never fatal */
  }
}
