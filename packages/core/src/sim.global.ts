/**
 * Browser-global entry for the Sim component — used ONLY to build the standalone
 * `klavity-sim.js` IIFE for classic <script> consumers (the demo / prototype HTML).
 *
 * Keeping the `window` side effect here (not in sim.ts) keeps the importable
 * module pure and tree-shakeable, so it never leaks into the SDK/extension bundles.
 *
 *   bun build packages/core/src/sim.global.ts --format=iife --minify \
 *     --outfile prototype/public/klavity-sim.js
 */
import * as Sim from './sim'

declare const window: any
if (typeof window !== 'undefined') {
  window.KlavitySim = Sim
}
