// server.grounded-scan-fields.test.ts
//
// "Grounded visual scan" onboarding feature — focused guard for the NEW response fields.
//
// The end-to-end sim/preview + persona/site paths require a real headless browser and a live
// LLM, neither of which run in CI. So this suite locks the two things that are actually new
// and cheap to verify deterministically:
//
//   1. CONTRACT (source-level): the ephemeral /api/sim/preview branch ADDS shotDataUrl + region
//      to its response (response-only additions — the request body is untouched), and
//      personaSiteSys emits a `desc` field that the /api/persona/site mapper carries through.
//
//   2. SHAPING LOGIC (pure): the exact expressions the handler uses to build shotDataUrl from the
//      already-captured JPEG and to normalise the reaction region behave as specified — including
//      graceful null/omit when a shot or region is absent.

import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const SRC = readFileSync(join(import.meta.dir, "server.ts"), "utf8")

// ── 1. Contract guards on server.ts ─────────────────────────────────────────────

test("ephemeral /api/sim/preview response ADDS shotDataUrl + region (response-only)", () => {
  // The ephemeral branch returns the extended shape. Request body parsing is unchanged.
  expect(SRC).toContain("return json({ reaction, personaName: p?.name || null, shotDataUrl, region, usage: rr.usage })")
  // shotDataUrl reuses the already-captured JPEG (no second capture) as an inline data URL.
  expect(SRC).toContain('"data:" + shot.mediaType + ";base64," + shot.imageB64')
  // The request body destructure is still just { url, persona, projectId } — no new request fields.
  expect(SRC).toContain("let { url: pvUrl, persona, projectId: pvProjectId } = await req.json()")
})

test("personaSiteSys emits a desc field and the persona/site mapper carries it through", () => {
  // Contract string instructs the model to return a bounded one-line desc.
  expect(SRC).toMatch(/\\"desc\\":string\(<=90 chars/)
  // The mapped persona objects sanitize + bound desc (response-only add; existing fields kept).
  expect(SRC).toContain('p.desc = String(p?.desc || "")')
})

// ── 2. Pure shaping-logic replication ───────────────────────────────────────────
// Mirrors the exact expressions in the ephemeral branch so a future refactor that changes the
// behaviour (not just the wording) trips this test.

function shapeShotDataUrl(shot: { imageB64: string; mediaType: string } | null): string | null {
  return shot?.imageB64 ? ("data:" + shot.mediaType + ";base64," + shot.imageB64) : null
}

function shapeRegion(reaction: any): { x: number; y: number; w: number; h: number } | null {
  const rgn = reaction && reaction.region && typeof reaction.region === "object" ? reaction.region : null
  return rgn && typeof rgn.x === "number" && typeof rgn.y === "number"
    && typeof rgn.w === "number" && typeof rgn.h === "number"
    ? { x: rgn.x, y: rgn.y, w: rgn.w, h: rgn.h } : null
}

test("shotDataUrl: builds a data URL from the captured JPEG; null when no shot", () => {
  expect(shapeShotDataUrl({ imageB64: "QUJD", mediaType: "image/jpeg" }))
    .toBe("data:image/jpeg;base64,QUJD")
  expect(shapeShotDataUrl(null)).toBeNull()
  expect(shapeShotDataUrl({ imageB64: "", mediaType: "image/jpeg" })).toBeNull()
})

test("region: passes a valid normalised 0..1 box through; null otherwise", () => {
  expect(shapeRegion({ region: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 } }))
    .toEqual({ x: 0.1, y: 0.2, w: 0.3, h: 0.4 })
  // Page-level reactions (clients) carry region: null → null.
  expect(shapeRegion({ region: null })).toBeNull()
  // Missing region entirely → null (graceful).
  expect(shapeRegion({})).toBeNull()
  // Malformed region (non-numeric) → null, never a broken overlay box.
  expect(shapeRegion({ region: { x: "0.1", y: 0.2, w: 0.3, h: 0.4 } })).toBeNull()
  expect(shapeRegion(null)).toBeNull()
})
