import { test, expect, describe } from "bun:test"
import { resolveUiIdentity, sanitizePageMeta, elementListForPrompt, textSim, regionHitsElement, type PageMeta } from "./sim-ui-identity"
import { buildSimReviewContext } from "./sim-evidence"

// A small settings page. Boxes are normalised 0..1, as captured by pageElementsBody.
const RAW = {
  title: "Account settings",
  elements: [
    { tag: "a", role: "link", text: "Dashboard", box: { x: 0.02, y: 0.02, w: 0.08, h: 0.04 } },                                        // e1
    { tag: "a", role: "link", text: "Billing", box: { x: 0.12, y: 0.02, w: 0.07, h: 0.04 } },                                          // e2
    { tag: "h1", text: "Account settings", box: { x: 0.05, y: 0.12, w: 0.3, h: 0.05 } },                                               // e3
    { tag: "label", text: "Email address", heading: "Account settings", box: { x: 0.05, y: 0.22, w: 0.2, h: 0.03 } },                  // e4
    { tag: "input", name: "you@example.com", heading: "Account settings", box: { x: 0.05, y: 0.26, w: 0.4, h: 0.06 } },                // e5
    { tag: "button", text: "Save changes", heading: "Account settings", box: { x: 0.05, y: 0.4, w: 0.15, h: 0.06 } },                  // e6
    { tag: "button", text: "Cancel", heading: "Account settings", box: { x: 0.22, y: 0.4, w: 0.1, h: 0.06 } },                         // e7
    { tag: "h2", text: "Danger zone", box: { x: 0.05, y: 0.55, w: 0.3, h: 0.04 } },                                                    // e8
    { tag: "button", text: "Delete account", heading: "Danger zone", selector: "#delete-account", box: { x: 0.05, y: 0.61, w: 0.2, h: 0.06 } }, // e9
    { tag: "img", name: "Acme logo", box: { x: 0.85, y: 0.02, w: 0.1, h: 0.05 } },                                                     // e10
    { tag: "p", text: "Plan: Pro (billed monthly)", heading: "Account settings", box: { x: 0.55, y: 0.22, w: 0.35, h: 0.03 } },       // e11
  ],
}
const META = sanitizePageMeta(RAW, 1)!
const box = (id: string) => META.elements.find((e) => e.id === id)!.box
const EMPTY_AREA = { x: 0.7, y: 0.8, w: 0.2, h: 0.1 }

describe("page metadata", () => {
  test("sanitize: ids assigned, junk boxes dropped, text capped, control chars removed", () => {
    const m = sanitizePageMeta({ elements: [{ tag: "p", text: "a\u0000b" + "x".repeat(300), box: { x: 0, y: 0, w: 0.1, h: 0.1 } }, { tag: "p", text: "bad", box: { x: 0, y: 0, w: 0, h: 0.1 } }, { text: "nobox" }] })!
    expect(m.elements).toHaveLength(1)
    expect(m.elements[0].id).toBe("e1")
    expect(m.elements[0].text!.length).toBeLessThanOrEqual(90)
    expect(m.elements[0].text).not.toContain("\u0000")
    expect(sanitizePageMeta(null)).toBeNull()
    expect(sanitizePageMeta({ elements: [] })).toBeNull()
  })
  test("prompt list carries ids, text, box and section", () => {
    const p = elementListForPrompt(META)
    expect(p).toContain("e6 | button | \"Save changes\"")
    expect(p).toContain("section \"Danger zone\"")
    expect(elementListForPrompt(null)).toBe("")
  })
  test("geometry + text helpers", () => {
    expect(regionHitsElement(box("e7"), box("e6"))).toBe(false)   // neighbouring button
    expect(regionHitsElement({ x: 0.06, y: 0.41, w: 0.05, h: 0.03 }, box("e6"))).toBe(true)
    expect(textSim("Save changes", "save   CHANGES")).toBe(1)
    expect(textSim("Save", "Save changes")).toBeGreaterThanOrEqual(0.5)
    expect(textSim("Upgrade now", "Cancel")).toBe(0)
  })
})

describe("UI identification (verified against page metadata)", () => {
  test("correct element: id + text + region agree → HIGH, locator comes from the page map", () => {
    const r = resolveUiIdentity({ target: { elementId: "e6", text: "Save changes" }, region: box("e6"), meta: META })
    expect(r.confidence).toBe("high"); expect(r.uncertain).toBe(false); expect(r.elementId).toBe("e6")
    expect(r.target).toMatchObject({ text: "Save changes", role: "button" })
    expect(r.section).toBe("Account settings")
  })
  test("region snaps to the real element box, not the model's rough guess", () => {
    const r = resolveUiIdentity({ target: { elementId: "e6", text: "Save changes" }, region: { x: 0.04, y: 0.39, w: 0.18, h: 0.08 }, meta: META })
    expect(r.confidence).toBe("high"); expect(r.region).toEqual(box("e6"))
  })
  test("nearby but unrelated element is NOT selected: text says Save, box sits on Cancel", () => {
    const r = resolveUiIdentity({ target: { text: "Save changes" }, region: box("e7"), meta: META })
    expect(r.confidence).not.toBe("high")
    expect(r.elementId).toBeUndefined()
    expect(r.uncertain).toBe(true)
    expect(r.reasons.join(" ")).toMatch(/different elements/)
  })
  test("chosen id contradicted by text AND region is rejected; the text+region agreement wins", () => {
    const r = resolveUiIdentity({ target: { elementId: "e6", text: "Cancel" }, region: box("e7"), meta: META })
    expect(r.confidence).toBe("high"); expect(r.elementId).toBe("e7")
  })
  test("invented element id is ignored", () => {
    const bad = resolveUiIdentity({ target: { elementId: "e99" }, region: null, meta: META })
    expect(bad.confidence).toBe("low"); expect(bad.reasons.join(" ")).toMatch(/does not exist/)
    const good = resolveUiIdentity({ target: { elementId: "e99", text: "Save changes" }, region: box("e6"), meta: META })
    expect(good.elementId).toBe("e6")
  })
  test("invented selector is dropped; the real one from the page map is used", () => {
    const r = resolveUiIdentity({ target: { elementId: "e9", text: "Delete account", selector: "#btn-delete-2" }, region: box("e9"), meta: META })
    expect(r.confidence).toBe("high"); expect(r.target!.selector).toBe("#delete-account")
    const r2 = resolveUiIdentity({ target: { elementId: "e6", text: "Save changes", selector: ".btn.primary" }, region: box("e6"), meta: META })
    expect(r2.target!.selector).toBeUndefined()
  })
  test("a single locator signal is only MEDIUM, with the closest verifiable section; never presented as exact", () => {
    const textOnly = resolveUiIdentity({ target: { text: "Billing" }, meta: META })
    expect(textOnly.confidence).toBe("medium"); expect(textOnly.uncertain).toBe(true); expect(textOnly.elementId).toBeUndefined()
    const regionOnly = resolveUiIdentity({ target: null, region: { x: 0.06, y: 0.56, w: 0.1, h: 0.02 }, meta: META })
    expect(regionOnly.confidence).toBe("medium"); expect(regionOnly.section).toBe("Danger zone")
  })
  test("nothing verifiable on the page → LOW and no component claimed", () => {
    const a = resolveUiIdentity({ target: { text: "Upgrade now" }, meta: META })
    expect(a.confidence).toBe("low"); expect(a.target).toBeNull()
    const b = resolveUiIdentity({ target: null, region: EMPTY_AREA, meta: META })
    expect(b.confidence).toBe("low")
  })
  test("page-level observation claims no element and is not flagged uncertain", () => {
    const r = resolveUiIdentity({ target: null, region: null, meta: META })
    expect(r.pageLevel).toBe(true); expect(r.target).toBeNull(); expect(r.uncertain).toBe(false)
  })
  test("screenshot only (no page metadata): never above MEDIUM, never a selector", () => {
    const both = resolveUiIdentity({ target: { text: "Save changes", selector: "#invented", role: "button" }, region: box("e6"), meta: null })
    expect(both.confidence).toBe("medium"); expect(both.basis).toBe("screenshot-only"); expect(both.target!.selector).toBeUndefined()
    const one = resolveUiIdentity({ target: { text: "Save changes" }, meta: null })
    expect(one.confidence).toBe("low"); expect(one.target).toEqual({ text: "Save changes" })   // hint only; never the recorded component
  })
})

describe("recorded finding context", () => {
  const ev = { screenshot: "captured" as const, checkedAt: 1 }
  const ctx = (identity: any, pageUrl: string | null = "https://x.test/settings") =>
    buildSimReviewContext({ pageUrl, urlHost: "x.test", urlPath: "/settings", target: identity.target, region: identity.region, observation: "Save button clipped", evidence: ev, identity }).simReview
  test("HIGH records the exact component + page + screenshot-observation provenance", () => {
    const c = ctx(resolveUiIdentity({ target: { elementId: "e6", text: "Save changes" }, region: box("e6"), meta: META }))
    expect(c.component).toMatchObject({ kind: "button", text: "Save changes" })
    expect(c.identification).toMatchObject({ confidence: "high", uncertain: false, basis: "page-metadata" })
    expect(c.pageUrl).toBe("https://x.test/settings"); expect(c.urlPath).toBe("/settings")
    expect(c.basis).toBe("screenshot"); expect(c.browserVerified).toBe(false); expect(c.reproduced).toBe(false); expect(c.reproductionSteps).toBeNull()
    expect(c.traceability.ok).toBe(true)
  })
  test("MEDIUM records the section as uncertain and NO exact component", () => {
    const c = ctx(resolveUiIdentity({ target: { text: "Save changes" }, region: box("e7"), meta: META }))
    expect(c.component).toBeNull()
    expect(c.identification).toMatchObject({ confidence: "medium", uncertain: true })
    expect(c.identification.section).toBeTruthy()
  })
  test("LOW is flagged as missing a verified component", () => {
    const c = ctx(resolveUiIdentity({ target: { text: "Upgrade now" }, meta: META }))
    expect(c.component).toBeNull(); expect(c.traceability.missing).toContain("verified component")
  })
  test("missing page URL is flagged", () => {
    const c = ctx(resolveUiIdentity({ target: { elementId: "e6", text: "Save changes" }, region: box("e6"), meta: META }), null)
    expect(c.traceability.missing).toContain("page URL")
  })
})

// ── Before / after accuracy over a labelled fixture ───────────────────────────────────────────────────────────────
// SYNTHETIC cases: each is a model answer of the kinds seen in practice (right, neighbouring box, paraphrase, invented selector/id, text for the
// wrong element, nothing identifiable) with a hand-labelled truth. They measure the VERIFICATION step in code — not the live model.
// "before" = what the old pipeline recorded (the model's target/region stored as-is). "after" = resolveUiIdentity.
type Case = { name: string; raw: { target?: any; region?: any }; truth: string | null }
const R = (id: string, pad = 0) => { const b = box(id); return { x: b.x - pad, y: b.y - pad, w: b.w + 2 * pad, h: b.h + 2 * pad } }
const CASES: Case[] = [
  { name: "exact, id+text+region", raw: { target: { elementId: "e6", text: "Save changes" }, region: R("e6") }, truth: "e6" },
  { name: "exact, no id (text+region)", raw: { target: { text: "Cancel" }, region: R("e7") }, truth: "e7" },
  { name: "exact, loose region", raw: { target: { elementId: "e9", text: "Delete account" }, region: R("e9", 0.02) }, truth: "e9" },
  { name: "exact, short paraphrase", raw: { target: { elementId: "e6", text: "Save" }, region: R("e6") }, truth: "e6" },
  { name: "exact, nav link", raw: { target: { elementId: "e2", text: "Billing" }, region: R("e2") }, truth: "e2" },
  { name: "exact, logo image", raw: { target: { elementId: "e10", name: "Acme logo" }, region: R("e10") }, truth: "e10" },
  { name: "exact, input", raw: { target: { elementId: "e5", text: "you@example.com" }, region: R("e5") }, truth: "e5" },
  { name: "exact, label", raw: { target: { text: "Email address" }, region: R("e4") }, truth: "e4" },
  { name: "box on neighbour (Cancel) for Save", raw: { target: { text: "Save changes" }, region: R("e7") }, truth: "e6" },
  { name: "box on neighbour (Save) for Cancel", raw: { target: { text: "Cancel" }, region: R("e6") }, truth: "e7" },
  { name: "box on label, id points at input", raw: { target: { elementId: "e5", text: "you@example.com" }, region: R("e4") }, truth: "e5" },
  { name: "id of neighbour, text+region right", raw: { target: { elementId: "e7", text: "Save changes" }, region: R("e6") }, truth: "e6" },
  { name: "id of neighbour, region right, no text", raw: { target: { elementId: "e7" }, region: R("e6") }, truth: "e6" },
  { name: "invented selector on right element", raw: { target: { elementId: "e9", text: "Delete account", selector: "button.danger.btn-lg" }, region: R("e9") }, truth: "e9" },
  { name: "invented selector, no id", raw: { target: { text: "Delete account", selector: "#dlt" }, region: R("e9") }, truth: "e9" },
  { name: "invented id", raw: { target: { elementId: "e42", text: "Save changes" }, region: R("e6") }, truth: "e6" },
  { name: "paraphrased text for wrong box (nav)", raw: { target: { text: "Go to billing" }, region: R("e1") }, truth: "e2" },
  { name: "text of a different element than box", raw: { target: { text: "Delete account" }, region: R("e3") }, truth: null },
  { name: "invented component text", raw: { target: { text: "Upgrade now" }, region: EMPTY_AREA }, truth: null },
  { name: "invented component, no box", raw: { target: { text: "Subscribe banner" } }, truth: null },
  { name: "box on empty area", raw: { target: null, region: EMPTY_AREA }, truth: null },
  { name: "page-level", raw: { target: null, region: null }, truth: null },
  { name: "text only, valid element", raw: { target: { text: "Billing" } }, truth: "e2" },
  { name: "wrong id, nothing to corroborate", raw: { target: { elementId: "e1" } }, truth: "e2" },
]

function legacyRecordedExact(c: Case): boolean {
  // The old pipeline recorded any target/region the model emitted as THE component. It is "right" only when that record matches truth.
  const t = c.raw.target || {}, truthEl = c.truth ? META.elements.find((e) => e.id === c.truth)! : null
  const claims = !!(t.text || t.name || t.selector || c.raw.region)
  if (!claims) return false
  if (!truthEl) return false
  const label = truthEl.text || truthEl.name || ""
  const textOk = !(t.text || t.name) || textSim(t.text || t.name, label) >= 0.5
  const selOk = !t.selector || t.selector === truthEl.selector
  const regOk = !c.raw.region || regionHitsElement(c.raw.region, truthEl.box)
  return textOk && selOk && regOk
}

test("accuracy: wrongly-asserted exact elements before vs after (synthetic labelled fixture)", () => {
  let legacyAsserted = 0, legacyWrong = 0, newAsserted = 0, newWrong = 0, newCorrect = 0, answerable = 0
  for (const c of CASES) {
    const claims = !!((c.raw.target && (c.raw.target.text || c.raw.target.name || c.raw.target.selector || c.raw.target.elementId)) || c.raw.region)
    if (c.truth) answerable++
    if (claims) { legacyAsserted++; if (!legacyRecordedExact(c)) legacyWrong++ }
    const r = resolveUiIdentity({ target: c.raw.target, region: c.raw.region ?? null, meta: META })
    if (r.confidence === "high") {
      newAsserted++
      if (r.elementId === c.truth) newCorrect++; else newWrong++
    }
  }
  const legacyRate = legacyWrong / legacyAsserted, newRate = newWrong / Math.max(newAsserted, 1)
  console.log(`[ui-identification benchmark] cases=${CASES.length} answerable=${answerable}\n` +
    `  before: exact component asserted on ${legacyAsserted}, wrong ${legacyWrong} (${(legacyRate * 100).toFixed(0)}%)\n` +
    `  after : exact (HIGH) asserted on ${newAsserted}, wrong ${newWrong} (${(newRate * 100).toFixed(0)}%); correct exact ${newCorrect}/${answerable} answerable`)
  expect(newWrong).toBe(0)
  expect(newRate).toBeLessThan(legacyRate)
  // Recall is deliberately not maximised: when signals conflict (neighbouring box, single signal) the finding is reported as MEDIUM/LOW, not guessed.
  expect(newCorrect).toBeGreaterThanOrEqual(Math.floor(answerable * 0.6))
})
