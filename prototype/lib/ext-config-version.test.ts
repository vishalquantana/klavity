import { describe, expect, test } from "bun:test"
import { extConfigVersion, type ExtProjectConfig } from "./ext-config-version"

const base: ExtProjectConfig[] = [
  { id: "proj_a", name: "Site", reviewMode: "auto", monitoredUrls: ["https://site.com/*", "https://site.com/app/*"] },
  { id: "proj_b", name: "Docs", reviewMode: "off", monitoredUrls: [] },
]

describe("extConfigVersion", () => {
  test("is stable across identical input", () => {
    expect(extConfigVersion(base)).toBe(extConfigVersion(structuredClone(base)))
  })

  // KLAVITYKLA-320: every field the extension consumes must move the version, or the
  // extension will keep serving a stale cached klavConfig after a dashboard edit.
  test("changes when review mode changes", () => {
    const next = structuredClone(base)
    next[0]!.reviewMode = "manual"
    expect(extConfigVersion(next)).not.toBe(extConfigVersion(base))
  })

  test("changes when a monitored URL is added or removed", () => {
    const added = structuredClone(base)
    added[0]!.monitoredUrls.push("https://site.com/new/*")
    expect(extConfigVersion(added)).not.toBe(extConfigVersion(base))

    const removed = structuredClone(base)
    removed[0]!.monitoredUrls.pop()
    expect(extConfigVersion(removed)).not.toBe(extConfigVersion(base))
  })

  test("changes when a project is added, removed or renamed", () => {
    expect(extConfigVersion(base.slice(0, 1))).not.toBe(extConfigVersion(base))
    const renamed = structuredClone(base)
    renamed[1]!.name = "Docs v2"
    expect(extConfigVersion(renamed)).not.toBe(extConfigVersion(base))
  })

  // Churn guard: a pure reordering is not a config change and must NOT force every
  // installed extension to do a full resync.
  test("ignores project and URL ordering", () => {
    const reordered = structuredClone(base).reverse()
    reordered[1]!.monitoredUrls.reverse()
    expect(extConfigVersion(reordered)).toBe(extConfigVersion(base))
  })

  test("handles an empty project list", () => {
    expect(extConfigVersion([])).toMatch(/^[0-9a-f]{16}$/)
  })
})
