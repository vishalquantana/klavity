// Phase-1 QA Sim standards: evidence integrity, UI traceability, same-defect matching. Pure — no DB, no S3.
import { test, expect, describe } from "bun:test"
import { storeVerifiedScreenshot, evidenceForId, componentKind, componentKey, inferQaCategory, buildSimReviewContext, defectOverlap, findSameDefect } from "./sim-evidence"

const bytes = new Uint8Array([1, 2, 3])
const okDeps = () => ({
  upload: async () => ({ key: "k1", bucket: "b", contentType: "image/png" }),
  exists: async () => true,
  insert: async () => "shot_1",
})

test("storeVerifiedScreenshot: success returns the id and a captured record", async () => {
  const r = await storeVerifiedScreenshot(okDeps(), bytes, "image/png")
  expect(r.screenshotId).toBe("shot_1")
  expect(r.evidence.screenshot).toBe("captured")
})

test("storeVerifiedScreenshot: upload failure → null id, explicit failure, no placeholder", async () => {
  const r = await storeVerifiedScreenshot({ ...okDeps(), upload: async () => { throw new Error("S3 down") } }, bytes, "image/png")
  expect(r.screenshotId).toBeNull()
  expect(r.evidence.screenshot).toBe("failed")
  expect(r.evidence.error).toContain("upload")
  expect(r.evidence.error).toContain("S3 down")
})

test("storeVerifiedScreenshot: an object that is not there after upload is NOT attached", async () => {
  let inserted = false
  const r = await storeVerifiedScreenshot({ ...okDeps(), exists: async () => false, insert: async () => { inserted = true; return "x" } }, bytes, "image/png")
  expect(r.screenshotId).toBeNull()
  expect(inserted).toBe(false)
  expect(r.evidence.error).toContain("verify")
})

test("storeVerifiedScreenshot: ledger-row failure → null id", async () => {
  const r = await storeVerifiedScreenshot({ ...okDeps(), insert: async () => { throw new Error("db locked") } }, bytes, "image/png")
  expect(r.screenshotId).toBeNull()
  expect(r.evidence.error).toContain("record")
})

test("storeVerifiedScreenshot: empty bytes never reach storage", async () => {
  let uploaded = false
  const r = await storeVerifiedScreenshot({ ...okDeps(), upload: async () => { uploaded = true; return { key: "k", bucket: "b", contentType: "image/png" } } }, new Uint8Array(0), "image/png")
  expect(uploaded).toBe(false)
  expect(r.screenshotId).toBeNull()
})

test("evidenceForId: null id is a recorded failure", () => {
  expect(evidenceForId(null).screenshot).toBe("failed")
  expect(evidenceForId("shot_1").screenshot).toBe("captured")
})

test("componentKind / componentKey", () => {
  expect(componentKind({ role: "button", text: "Sign up" })).toBe("button")
  expect(componentKind({ selector: "nav.main a" })).toBe("navigation")
  expect(componentKind({ role: "textbox" })).toBe("input")
  expect(componentKind({ role: "dialog" })).toBe("modal")
  expect(componentKind(null)).toBeNull()
  expect(componentKey({ selector: "  #Signup  BTN " })).toBe("sel:#signup btn")
  expect(componentKey({ text: "Sign Up" })).toBe(componentKey({ name: "sign  up" }))
  expect(componentKey({})).toBeNull()
})

test("inferQaCategory", () => {
  expect(inferQaCategory("There is a typo in the heading")).toBe("content")
  expect(inferQaCategory("Low contrast on the grey caption")).toBe("accessibility")
  expect(inferQaCategory("Broken image in the hero")).toBe("broken-asset")
  expect(inferQaCategory("The page looks fine")).toBe("other")
})

test("buildSimReviewContext: always a screenshot observation, never browser-verified", () => {
  const c = buildSimReviewContext({
    pageUrl: "https://x.test/pricing", urlHost: "x.test", urlPath: "/pricing",
    target: { role: "button", text: "Buy now", selector: "#buy" }, region: { x: 0.1, y: 0.2, w: 0.3, h: 0.1 },
    observation: "The Buy now button is clipped", evidence: { screenshot: "failed", error: "upload: boom", checkedAt: 1 },
  })
  expect(c.simReview.basis).toBe("screenshot")
  expect(c.simReview.browserVerified).toBe(false)
  expect(c.simReview.verification).toBe("unverified-screenshot-observation")
  expect(c.simReview.component?.kind).toBe("button")
  expect(c.simReview.pageUrl).toBe("https://x.test/pricing")
  expect(c.simReview.evidence.screenshot).toBe("failed")
  expect(c.simReview.uiState).toMatch(/no clicks/)
})

test("defectOverlap: rephrased wording of the same defect overlaps strongly", () => {
  expect(defectOverlap("The Sign up button text has very low contrast against the background", "Low contrast: the sign up button label is hard to read against its background"))
    .toBeGreaterThan(0.5)
  expect(defectOverlap("Logo is clipped at the top", "Footer links use inconsistent fonts")).toBeLessThan(0.3)
})

const filed = (id: string, observation: string, comp?: any, category?: string) => ({
  id, title: observation.slice(0, 60), observation,
  clientContext: comp || category ? { simReview: { component: comp ?? null, category } } : null,
})

test("findSameDefect: rephrased description on the same component → duplicate", () => {
  const existing = [filed("fb_1", "The Sign up button has very low contrast against the hero background", { selector: "#signup", kind: "button" }, "accessibility")]
  const id = findSameDefect({ observation: "Contrast of the sign-up button label is too low to read on the hero", target: { selector: "#signup" } }, existing)
  expect(id).toBe("fb_1")
})

test("findSameDefect: different defects on the SAME component stay separate", () => {
  const existing = [filed("fb_1", "The Sign up button has very low contrast against the background", { selector: "#signup" }, "accessibility")]
  expect(findSameDefect({ observation: "The Sign up button label has a typo: 'Sgin up'", target: { selector: "#signup" } }, existing)).toBeNull()
})

test("findSameDefect: unrelated defects on one page stay separate (Baseline QA has no traits)", () => {
  const existing = [filed("fb_1", "The company logo is clipped at the top edge", null, "responsive"), filed("fb_2", "Typo in the pricing heading: 'Pricng'", null, "content")]
  expect(findSameDefect({ observation: "Low contrast on the grey footer caption text" }, existing)).toBeNull()
})

test("findSameDefect: no component, same category + strong overlap → duplicate", () => {
  const existing = [filed("fb_2", "Typo in the pricing heading: 'Pricng' should be 'Pricing'", null, "content")]
  expect(findSameDefect({ observation: "Pricing heading has a typo: 'Pricng' instead of 'Pricing'" }, existing)).toBe("fb_2")
})

import { withMandatoryValidations, MANDATORY_VALIDATIONS, traceabilityGaps, buildSimReviewContext as _bsrc, evidenceForId as _efi } from "./sim-evidence"

describe("mandatory run-time validations", () => {
  test("added to a Sim with no core, without mutating it", () => {
    const sim = { name: "A" }
    const out = withMandatoryValidations(sim)
    expect(out.core.watchFor).toEqual(MANDATORY_VALIDATIONS)
    expect((sim as any).core).toBeUndefined()
  })
  test("leads existing watchFor and never duplicates", () => {
    const once = withMandatoryValidations({ core: { watchFor: ["typos"] } })
    expect(once.core.watchFor).toEqual([...MANDATORY_VALIDATIONS, "typos"])
    expect(withMandatoryValidations(once).core.watchFor).toEqual(once.core.watchFor)
  })
  test("traceability: element-level needs component, region, text; page-level only URL", () => {
    expect(traceabilityGaps({ pageUrl: "https://x/y", target: { text: "Save" } as any, region: { x: 0, y: 0, w: 1, h: 1 } })).toEqual([])
    expect(traceabilityGaps({ pageUrl: "https://x/y", target: { text: "Save" } as any })).toEqual(["region"])
    expect(traceabilityGaps({ pageUrl: "https://x/y" })).toEqual([])
    expect(traceabilityGaps({ pageUrl: null })).toEqual(["page URL"])
  })
  test("flag lands on simReview", () => {
    const c = _bsrc({ pageUrl: null, observation: "x", evidence: _efi(null) })
    expect(c.simReview.traceability).toEqual({ ok: false, missing: ["page URL"] })
  })
})
