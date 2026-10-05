// @vitest-environment jsdom
// A blob-backed attachment (large video) must be appended to the multipart body AS-IS — no data URL
// decode (split/atob/Uint8Array/Blob), which peaked at ~500MB+ for a ~100MB video and crashed the tab.
import { describe, it, expect } from "vitest"
import { buildFeedbackForm } from "./widget-lib"

const base = { description: "d", pageUrl: "https://x.test/p", projectId: "proj_1", screenshots: [] as string[] }

describe("buildFeedbackForm — blob-backed files", () => {
  it("appends the original Blob for a video (same object, no data URL round-trip)", () => {
    const blob = new Blob([new Uint8Array(1024)], { type: "video/mp4" })
    const fd = buildFeedbackForm({ ...base, files: [{ name: "demo.mp4", type: "video/mp4", dataUrl: "", blob }] })
    const part = fd.get("files") as File
    expect(part).toBeTruthy()
    expect(part.name).toBe("demo.mp4")
    expect(part.size).toBe(1024)
    expect(part.type).toBe("video/mp4")
  })

  it("still decodes data URLs for non-blob files (unchanged behavior)", () => {
    const dataUrl = "data:text/plain;base64," + btoa("hello")
    const fd = buildFeedbackForm({ ...base, files: [{ name: "a.txt", type: "text/plain", dataUrl }] })
    const part = fd.get("files") as File
    expect(part.name).toBe("a.txt")
    expect(part.size).toBe(5)
  })
})
