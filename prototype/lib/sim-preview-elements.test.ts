import { test, expect } from "bun:test"
import { screenshotUrl } from "./sim-preview"
test("preview capture attaches the element map and tolerates drivers without it", async () => {
  const mk = (withEls: boolean) => ({ acquire: async () => ({ newPage: async () => ({ goto: async () => {}, url: () => "https://x.test/", waitMs: async () => {}, screenshotJpeg: async () => "A".repeat(200), ...(withEls ? { pageElements: async () => ({ elements: [{ tag: "a" }] }) } : {}) }), close: async () => {} }) as any, isUrlAllowed: () => true })
  const a = await screenshotUrl("https://x.test/", {}, mk(true) as any)
  expect((a as any).pageMeta.elements).toHaveLength(1)
  const b = await screenshotUrl("https://x.test/", {}, mk(false) as any)
  expect((b as any).pageMeta).toBeUndefined()
})
