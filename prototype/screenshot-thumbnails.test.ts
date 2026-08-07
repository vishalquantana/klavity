// Thumbnail-on-upload feature: a small preview JPEG is stored alongside every screenshot so the
// dashboard list loads fast, falling back to the full image when no thumb exists.
//
// Covers the two pure/observable seams:
//   1. buildFeedbackForm (widget) appends `screenshot_thumbs` index-aligned 1:1 with `screenshots`.
//   2. The shipped IIFE bundle actually carries the thumbnail path (prod pulls the bundle, never builds).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { buildFeedbackForm } from "../packages/sdk/src/widget-lib.ts"

const PNG = "data:image/png;base64," + btoa("full-screenshot-bytes")   // stand-in full screenshot
const JPG = "data:image/jpeg;base64," + btoa("tiny-thumb")             // stand-in thumbnail

test("buildFeedbackForm appends one screenshot_thumbs entry per screenshot, index-aligned", () => {
  const fd = buildFeedbackForm({
    description: "x", pageUrl: "https://ex.com/p", projectId: "proj_1",
    screenshots: [PNG, PNG],
    screenshotThumbs: [JPG, JPG],
  })
  const shots = fd.getAll("screenshots")
  const thumbs = fd.getAll("screenshot_thumbs")
  expect(shots.length).toBe(2)
  expect(thumbs.length).toBe(2)
  for (const t of thumbs) expect(t).toBeInstanceOf(Blob)
})

test("buildFeedbackForm omits screenshot_thumbs entirely when none are provided (graceful fallback)", () => {
  const fd = buildFeedbackForm({
    description: "x", pageUrl: "https://ex.com/p", projectId: "proj_1",
    screenshots: [PNG],
  })
  expect(fd.getAll("screenshots").length).toBe(1)
  expect(fd.getAll("screenshot_thumbs").length).toBe(0)
})

test("the shipped widget bundle carries the thumbnail upload path", () => {
  const bundle = readFileSync(join(import.meta.dir, "..", "packages", "sdk", "dist", "klavity-widget.iife.js"), "utf8")
  expect(bundle).toContain("screenshot_thumbs")
  // a broken bundle ships silently — assert it still parses
  expect(() => new Function(bundle)).not.toThrow()
})
