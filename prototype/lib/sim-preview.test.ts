// sim-preview — screenshotUrl plumbing (browser factory injected, no real Chromium) + default persona.
import { test, expect } from "bun:test"
import { screenshotUrl, defaultPreviewPersona } from "./sim-preview"

// A minimal fake BrowserHandle/BrowserPage that records the calls screenshotUrl makes.
function fakeAcquire(opts: { b64?: string; gotoThrows?: boolean; emptyShot?: boolean } = {}) {
  const calls: any = { acquired: 0, goto: [] as string[], shots: 0, closed: 0, waited: 0 }
  const acquire = async (_o?: any) => {
    calls.acquired++
    return {
      kind: "local",
      async newPage() {
        return {
          url() { return "" },
          async goto(u: string, _t: number) { if (opts.gotoThrows) throw new Error("nav fail"); calls.goto.push(u) },
          async waitMs(_ms: number) { calls.waited++ },
          async screenshotJpeg(_q: number, _t: number) { calls.shots++; return opts.emptyShot ? "" : (opts.b64 ?? "QUJD".repeat(50)) },
        } as any
      },
      async close() { calls.closed++ },
    } as any
  }
  return { acquire, calls }
}

test("screenshotUrl navigates, screenshots, and always closes the browser", async () => {
  const { acquire, calls } = fakeAcquire({ b64: "SGVsbG8".repeat(30) })
  const res = await screenshotUrl("https://example.com", { settleMs: 5 }, { acquire })
  expect(res.mediaType).toBe("image/jpeg")
  expect(res.imageB64.length).toBeGreaterThan(100)
  expect(calls.acquired).toBe(1)
  expect(calls.goto).toEqual(["https://example.com"])
  expect(calls.shots).toBe(1)
  expect(calls.waited).toBe(1)
  expect(calls.closed).toBe(1) // browser released even on the happy path
})

test("screenshotUrl closes the browser even when navigation throws", async () => {
  const { acquire, calls } = fakeAcquire({ gotoThrows: true })
  await expect(screenshotUrl("https://bad.example", { settleMs: 0 }, { acquire })).rejects.toThrow()
  expect(calls.closed).toBe(1) // finally-block release on failure
})

test("screenshotUrl rejects an empty/too-small screenshot", async () => {
  const { acquire } = fakeAcquire({ emptyShot: true })
  await expect(screenshotUrl("https://example.com", { settleMs: 0 }, { acquire })).rejects.toThrow(/empty screenshot/)
})

test("defaultPreviewPersona is an ephemeral first-visitor persona with 3 insights", () => {
  const p = defaultPreviewPersona()
  expect(p.name).toBeTruthy()
  expect(p.insights).toHaveLength(3)
  expect(p.insights.map((i) => i.kind).sort()).toEqual(["love", "pain", "want"])
  expect((p as any).id).toBeUndefined() // ephemeral — no saved-Sim id
})
