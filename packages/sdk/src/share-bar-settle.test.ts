// @vitest-environment jsdom
// KD-3088: the default Snap must not grab a frame before Chrome's "Sharing this tab" bar has shrunk the viewport —
// that frame (old size, black band) doesn't match the page, so Mask numbers couldn't place any box on it.
import { describe, it, expect, afterEach } from "vitest"
import { watchShareBarSettle, waitForFrameToMatchViewport } from "./widget"

const setViewport = (w: number, h: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: w })
  Object.defineProperty(window, "innerHeight", { configurable: true, value: h })
}
const fakeVideo = (w: number, h: number) => ({ videoWidth: w, videoHeight: h }) as unknown as HTMLVideoElement

describe("watchShareBarSettle", () => {
  it("resolves shortly after the sharing bar resizes the page", async () => {
    const t0 = Date.now()
    const p = watchShareBarSettle(5000)
    setTimeout(() => window.dispatchEvent(new Event("resize")), 30)
    await p
    const took = Date.now() - t0
    expect(took).toBeGreaterThanOrEqual(140)   // 30ms until the resize + the 120ms layout beat
    expect(took).toBeLessThan(2000)            // not the 5s cap
  })
  it("gives up after maxMs when no bar appears", async () => {
    const t0 = Date.now()
    await watchShareBarSettle(80)
    expect(Date.now() - t0).toBeGreaterThanOrEqual(75)
  })
})

describe("waitForFrameToMatchViewport", () => {
  afterEach(() => setViewport(1024, 768))
  it("after the bar shrank the page, waits for the stream's frame to catch up to the new shape", async () => {
    // (watchShareBarSettle has already waited for the bar's resize; this is the step after it.)
    setViewport(1900, 845)
    const video = fakeVideo(1900, 915) as any                   // stale frame: old size, page + black band
    setTimeout(() => { video.videoHeight = 845 }, 120)          // the stream catches up a bit later
    const t0 = Date.now()
    const ok = await waitForFrameToMatchViewport(video, 2000, 20)
    expect(ok).toBe(true)
    expect(Date.now() - t0).toBeGreaterThanOrEqual(110)         // it did NOT grab the stale frame
    expect(video.videoHeight).toBe(845)
  })
  it("returns false (caller grabs anyway) when the shapes never match", async () => {
    setViewport(1900, 845)
    expect(await waitForFrameToMatchViewport(fakeVideo(1900, 915), 60, 20)).toBe(false)
  })
  it("returns quickly when everything already matches", async () => {
    setViewport(1440, 900)
    const t0 = Date.now()
    expect(await waitForFrameToMatchViewport(fakeVideo(2880, 1800), 1000, 20)).toBe(true)
    expect(Date.now() - t0).toBeLessThan(200)
  })
})
