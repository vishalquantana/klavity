// Task 5 surface guard — pins the superadmin "Links" tab so a merge can't silently eat the UI
// while the backend stays green. Deterministic: no DOM, no server spawn.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/superadmin.html").text()

test("Links tab nav exists and toggles a dedicated view", () => {
  expect(HTML).toContain('id="tabLinks"')
  expect(HTML).toContain('id="view-links"')
})

test("create form has destination + all five UTM fields + slug + label", () => {
  for (const id of ["lkDest", "lkSource", "lkMedium", "lkCampaign", "lkTerm", "lkContent", "lkSlug", "lkLabel"]) {
    expect(HTML).toContain(`id="${id}"`)
  }
})

test("create form has a kind select (campaign/affiliate/referral) wired into the payload", () => {
  expect(HTML).toContain('id="lkKind"')
  for (const k of ["campaign", "affiliate", "referral"]) {
    expect(HTML).toContain(`value="${k}"`)
  }
  // the create POST must forward the chosen kind, not silently default to campaign
  expect(HTML).toContain('kind: val("lkKind")')
})

test("live preview surfaces both the short URL and the tagged destination", () => {
  expect(HTML).toContain('id="lkPrevShort"')
  expect(HTML).toContain('id="lkPrevDest"')
  // preview uses a client-side stampUtm mirror (single-encode via URLSearchParams)
  expect(HTML).toContain("function stampUtm(")
  expect(HTML).toContain("searchParams.set")
})

test("create posts to the real endpoint; list + drill hit the CRUD API", () => {
  expect(HTML).toContain('fetch("/api/superadmin/links"')
  expect(HTML).toContain('/api/superadmin/links/"') // detail/PATCH by id
  expect(HTML).toContain('method: "PATCH"')
})

test("table shows code, clicks and a copy control", () => {
  expect(HTML).toContain('id="lkBody"')
  expect(HTML).toContain("act-copy")
  expect(HTML).toContain("act-drill")
  expect(HTML).toContain("clickCount")
})
