// Coexistence: an in-page Klavity surface (embeddable widget OR script-tag SDK) always
// wins; the extension YIELDS its report UI to it so the user never sees two menus (KLA-725).
// Content scripts run in an isolated world and can't read page window vars, so we detect the
// in-page surface purely via the DOM. Cheap querySelector checks, no page-JS required.
//
// Surfaces we yield to:
//   • #klavity-widget-host — the full embeddable widget (packages/sdk/src/widget.ts)
//   • #klavity-sdk-host    — the script-tag SDK, KlavitySnap.init (packages/sdk/src/index.ts)
//   • [data-klavity-ui]    — any Klavity in-page UI marker (future-proof)
export function widgetPresent(): boolean {
  const doc = document
  if (doc.getElementById('klavity-widget-host')) return true
  if (doc.getElementById('klavity-sdk-host')) return true
  if (typeof doc.querySelector === 'function' && doc.querySelector('[data-klavity-ui]')) return true
  return false
}
