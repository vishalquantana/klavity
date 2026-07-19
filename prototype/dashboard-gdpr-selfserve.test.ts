// KLAVITYKLA-303 regression guard — GDPR self-serve must be REACHABLE FROM THE UI.
//
// The defect: GET /api/me/export (Art. 15/20) and POST /api/me/delete (Art. 17) shipped and were
// covered by server.gdpr.test.ts, but nothing in the product referenced them — the only way to
// exercise a legal-compliance feature was curl with a session cookie, and site/privacy.html told
// users to email support. A passing backend test suite said "green" while the feature was invisible.
//
// This test pins the SURFACE, not the handlers: the Settings drawer exists, its buttons call the
// real endpoints, deletion is gated behind an explicit confirmation, and the privacy policy points
// at the in-product controls. Deterministic — no DOM, no network, no server spawn.

import { test, expect } from "bun:test"

const DASH = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const PRIVACY = await Bun.file(import.meta.dir + "/../site/privacy.html").text()

test("dashboard Settings surfaces a GDPR data & privacy drawer", () => {
  // The drawer lives in the Settings view (data-view="settings") and is NOT admin-gated:
  // erasure/export are personal rights, every logged-in user must reach them.
  const m = DASH.match(/<details class="([^"]*)" id="privacyDrawer" data-view="settings">/)
  expect(m).toBeTruthy()
  expect(m![1].split(/\s+/)).not.toContain("hide")
})

test("export button calls GET /api/me/export and downloads it", () => {
  expect(DASH).toContain('id="gdprExportBtn"')
  // The handler must hit the real, already-tested endpoint...
  expect(DASH).toContain('fetch("/api/me/export")')
  // ...and actually deliver a file to the user rather than just logging the JSON.
  const handler = DASH.slice(DASH.indexOf("expBtn.onclick"), DASH.indexOf("expBtn.onclick") + 1200)
  expect(handler).toContain("URL.createObjectURL")
  expect(handler).toMatch(/\.download\s*=/)
})

test("account deletion is gated behind an explicit type-to-confirm step", () => {
  expect(DASH).toContain('id="gdprDeleteStartBtn"')
  expect(DASH).toContain('id="gdprDeleteConfirm"')
  expect(DASH).toContain('id="gdprDeleteInput"')

  // The confirm button must start disabled in markup — a stray click can't erase an account.
  const btn = DASH.match(/<button[^>]*id="gdprDeleteConfirmBtn"[^>]*>/)![0]
  expect(btn).toContain("disabled")

  // ...and only enable on the literal word DELETE.
  const gate = DASH.slice(DASH.indexOf("inp.oninput"), DASH.indexOf("inp.oninput") + 300)
  expect(gate).toContain('"DELETE"')

  // The destructive call itself is inside the confirm handler, never the "…" opener.
  const start = DASH.indexOf("okBtn.onclick")
  expect(start).toBeGreaterThan(-1)
  const confirmHandler = DASH.slice(start, start + 1400)
  expect(confirmHandler).toContain('fetch("/api/me/delete", { method: "POST" })')
  // Session must end: we leave the app for /login after a successful erase.
  expect(confirmHandler).toContain("/login")
})

test("no NEW endpoints were invented — only the existing tested handlers are called", () => {
  // Guards against a future 'fix' that adds /api/account/export or similar instead of reusing
  // the audited handlers (acceptance criterion: "No new endpoints").
  expect(DASH).not.toContain("/api/account/export")
  expect(DASH).not.toContain("/api/account/erase")
})

test("privacy policy points at the in-product self-serve controls", () => {
  expect(PRIVACY).toMatch(/Download my data/)
  expect(PRIVACY).toMatch(/Delete my account/)
  expect(PRIVACY).toMatch(/Settings/)
  // Support email stays as a fallback.
  expect(PRIVACY).toContain("mailto:hello@quantana.com.au")
})

test("no smart quotes in the markup we added (has broken the site twice)", () => {
  const drawer = DASH.slice(DASH.indexOf('id="privacyDrawer"'), DASH.indexOf('id="trailsAutofileDrawer"'))
  expect(drawer).not.toMatch(/[‘’“”]/)
  const script = DASH.slice(DASH.indexOf("_wirePrivacy"), DASH.indexOf("_planIntent"))
  expect(script).not.toMatch(/[‘’“”]/)
})
