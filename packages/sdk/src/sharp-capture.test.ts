// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import {
  planScrollStitch,
  planSeamlessScrollStitch,
  clampCaptureHeight,
  findTopFixedStickyHeaders,
  hideFixedStickyElements,
  restoreFixedStickyElements,
} from "./sharp-capture"

describe("planScrollStitch", () => {
  it("steps by viewport height and clamps the last frame flush to the bottom", () => {
    // 2000px page, 800px viewport → frames at 0, 800, and 1200 (=2000-800, the bottom-aligned last frame)
    expect(planScrollStitch(2000, 800)).toEqual([0, 800, 1200])
  })

  it("returns a single frame when the page fits in one viewport", () => {
    expect(planScrollStitch(500, 800)).toEqual([0])
    expect(planScrollStitch(800, 800)).toEqual([0])
  })

  it("an exact multiple has no overlapping final frame", () => {
    expect(planScrollStitch(1600, 800)).toEqual([0, 800])
  })

  it("the last entry always equals max(0, fullHeight - viewportHeight)", () => {
    const ys = planScrollStitch(3001, 900)
    expect(ys[ys.length - 1]).toBe(3001 - 900)
    expect(ys[0]).toBe(0)
  })

  it("degrades safely on a zero/negative viewport", () => {
    expect(planScrollStitch(2000, 0)).toEqual([0])
  })
})

describe("planSeamlessScrollStitch (sticky header crop + seamless canvas stride)", () => {
  it("when topHeaderHeight > 0: Frame 0 includes header; subsequent frames exclude header and form seamless canvas slices", () => {
    // fullHeight = 2000, viewportHeight = 800, headerHeight = 60
    const steps = planSeamlessScrollStitch(2000, 800, 60)
    expect(steps.length).toBeGreaterThan(1)

    // Step 0 covers the first viewport including the header
    expect(steps[0]).toEqual({
      scrollY: 0,
      sourceY: 0,
      sourceHeight: 800,
      canvasY: 0,
      drawHeight: 800,
    })

    // Step 1: excludes header (sourceY >= 60), draws starting at canvasY = 800
    expect(steps[1].canvasY).toBe(800)
    expect(steps[1].sourceY).toBe(60)
    expect(steps[1].scrollY).toBe(740) // 800 - 60
    expect(steps[1].drawHeight).toBe(740)

    // Verify seamless continuity across all steps
    for (let i = 1; i < steps.length; i++) {
      // Every subsequent frame crops out the header region
      expect(steps[i].sourceY).toBeGreaterThanOrEqual(60)
      // Canvas destination is strictly contiguous with previous slice
      expect(steps[i].canvasY).toBe(steps[i - 1].canvasY + steps[i - 1].drawHeight)
    }

    // Total drawn height equals fullHeight
    const lastStep = steps[steps.length - 1]
    expect(lastStep.canvasY + lastStep.drawHeight).toBe(2000)
  })

  it("returns single step when fullHeight <= viewportHeight even with header", () => {
    const steps = planSeamlessScrollStitch(600, 800, 60)
    expect(steps).toHaveLength(1)
    expect(steps[0]).toEqual({
      scrollY: 0,
      sourceY: 0,
      sourceHeight: 600,
      canvasY: 0,
      drawHeight: 600,
    })
  })

  it("with topHeaderHeight = 0: matches contiguous standard viewport steps", () => {
    const steps = planSeamlessScrollStitch(2000, 800, 0)
    expect(steps).toHaveLength(3)
    expect(steps[0].canvasY).toBe(0)
    expect(steps[1].canvasY).toBe(800)
    expect(steps[2].canvasY).toBe(1600)
    expect(steps[2].canvasY + steps[2].drawHeight).toBe(2000)
  })
})

describe("clampCaptureHeight", () => {
  it("passes a short page through unchanged", () => {
    expect(clampCaptureHeight(4000, 2)).toBe(4000)
  })

  it("caps a tall page so the canvas stays within the browser limit", () => {
    // scale 2 → max CSS height 16000/2 = 8000
    expect(clampCaptureHeight(50000, 2)).toBe(8000)
  })

  it("accounts for the capture scale (DPR)", () => {
    expect(clampCaptureHeight(50000, 1)).toBe(16000)
    expect(clampCaptureHeight(50000, 3, 15000)).toBe(5000)
  })

  it("degrades safely on a zero scale", () => {
    expect(clampCaptureHeight(4000, 0)).toBe(4000)
  })
})

describe("hideFixedStickyElements & restoreFixedStickyElements", () => {
  it("hides elements with visibility:hidden !important and opacity:0, then faithfully restores", () => {
    const div = document.createElement("div")
    div.style.visibility = "visible"
    div.style.opacity = "1"
    document.body.appendChild(div)

    const restoreItems = hideFixedStickyElements([div])
    expect(div.style.visibility).toBe("hidden")
    expect(div.style.opacity).toBe("0")
    expect(div.style.pointerEvents).toBe("none")

    restoreFixedStickyElements(restoreItems)
    expect(div.style.visibility).toBe("visible")
    expect(div.style.opacity).toBe("1")
    div.remove()
  })
})

