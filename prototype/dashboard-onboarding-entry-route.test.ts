// Regression guards for two onboarding/entry UX bugs found in a real user walkthrough:
//
//  #446 — Klavity brand icon in the onboarding header linked to `index.html`, which resolves to
//         `/index.html` (a 404 — home is served at `/`). It must point at root `/`.
//
//  #447 — After onboarding "Go to My Dashboard", a user who skipped the payment step landed on the
//         Plan/billing (pricing) view instead of Overview, reading like a paywall. The dashboard
//         `_planIntent` deep-link handler used to call openPlanDrawer() (which setView('settings')
//         + opens the plan drawer) on every `?upgrade=` arrival, hijacking the initial route. It
//         must NOT switch views on entry — it surfaces the upgrade nudge INLINE instead, so first
//         entry lands on Overview. openPlanDrawer stays wired to explicit clicks (pill / Pro-note).

import { test, expect } from "bun:test"

const DASH = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const ONBOARD = await Bun.file(import.meta.dir + "/../site/onboarding.html").text()

// Anchored, brace-matched extraction (same technique as the other dashboard-*.test.ts guards).
function extractIIFE(src: string, marker: string): string {
  const i = src.indexOf(marker)
  if (i < 0) throw new Error("marker not found: " + marker)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + marker)
}

test("#446 — onboarding brand link points at root, never index.html (which 404s)", () => {
  // The brand/logo anchor must resolve to `/`, not the invalid `/index.html` route.
  expect(ONBOARD).toContain('<a class="brand" href="/">')
  expect(ONBOARD).not.toContain('class="brand" href="index.html"')
  expect(ONBOARD).not.toContain('class="brand" href="./index.html"')
})

test("#447 — _planIntent surfaces upgrade inline and does NOT hijack the initial route", () => {
  const body = extractIIFE(DASH, "function _planIntent()")
  // The whole point: entry must not switch away from Overview. The handler must NOT call
  // openPlanDrawer (which setView('settings') + pops the plan drawer) on arrival.
  expect(body).not.toContain("openPlanDrawer,")           // old: setTimeout(openPlanDrawer, 400)
  expect(body).not.toContain("setTimeout(openPlanDrawer")
  // It must still surface the intent — an inline toast nudge (nudge preserved, route not hijacked).
  expect(body).toContain("klavToast")
})

test("#447 — openPlanDrawer still exists for explicit upgrade clicks (nudge not removed)", () => {
  // The durable inline nudge (sidebar plan pill / Pro-note links) must still be able to open the
  // Plan drawer on an explicit click — we only stopped the automatic route hijack, not the CTA.
  expect(DASH).toContain("function openPlanDrawer()")
  expect(DASH).toContain('onclick="openPlanDrawer()"')
})
