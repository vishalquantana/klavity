// KLA-739 (C1-b) — neg-controls for the one-shot legacy-OG purge. purgeOgObjectsWith is dependency-
// injected so we exercise the real paging + guard logic with fakes (no S3).

import { test, expect, describe } from "bun:test"
import { purgeOgObjectsWith, isLegacyOgKey, OG_PURGE_MARKER, type OgPurgeDeps } from "./s3"

function fakeStore(initial: string[], failKeys: string[] = []): {
  deps: (markerPresent?: boolean) => OgPurgeDeps
  deleted: string[]
  markerWritten: () => boolean
} {
  const deleted: string[] = []
  let markerPresent = false
  let wroteMarker = false
  const pageOf = (token?: string): { keys: string[]; next?: string } => {
    const start = token ? Number(token) : 0
    const keys = initial.slice(start, start + 2) // page size 2 → exercise continuation paging
    const nextStart = start + 2
    return { keys, next: nextStart < initial.length ? String(nextStart) : undefined }
  }
  return {
    deleted,
    markerWritten: () => wroteMarker,
    deps: (mp = false) => {
      markerPresent = mp
      return {
        hasMarker: async () => markerPresent,
        list: async (t) => pageOf(t),
        del: async (k) => { if (failKeys.includes(k)) throw new Error("AccessDenied"); deleted.push(k) },
        putMarker: async () => { wroteMarker = true; markerPresent = true },
      }
    },
  }
}

describe("isLegacyOgKey — only un-tiered og/* keys are legacy (C1-b residual b)", () => {
  test("legacy = og/<ref>[-<num>].png with NO tier segment", () => {
    expect(isLegacyOgKey("og/fb_a.png")).toBe(true)
    expect(isLegacyOgKey("og/fb_a-1699.png")).toBe(true)
  })
  test("NEW tier-keyed objects are NOT legacy (never purged)", () => {
    expect(isLegacyOgKey("og/fb_a-full-1699.png")).toBe(false)
    expect(isLegacyOgKey("og/fb_a-teaser-1699.png")).toBe(false)
  })
  test("any purge marker (v1/v2/…) + non-og keys are never legacy", () => {
    expect(isLegacyOgKey(OG_PURGE_MARKER)).toBe(false)
    expect(isLegacyOgKey("og/.purged-legacy-v1")).toBe(false) // stale marker is bookkeeping, not deleted
    expect(isLegacyOgKey("og/.purged-legacy-v2")).toBe(false)
    expect(isLegacyOgKey("uploads/x.png")).toBe(false)
    expect(isLegacyOgKey("")).toBe(false)
  })
})

describe("C1-b round-4 — marker bumped to v2 (a stale v1 must not skip the corrected purge)", () => {
  // NEG-CONTROL: round-2 could write v1 on a FAILED delete. If the constant stayed v1, an env with a
  // stale v1 marker would no-op forever, never retrying the surviving public object. Bumping to v2 forces
  // the corrected purge to run once more. Reverting the constant to v1 makes this test FAIL (skipped=true).
  test("v1 marker present but v2 absent → purge RUNS (retries the survivor) and writes v2", async () => {
    expect(OG_PURGE_MARKER).toBe("og/.purged-legacy-v2")
    const existing = new Set<string>(["og/.purged-legacy-v1"]) // round-2 wrote v1 (possibly on a failure)
    const deleted: string[] = []
    let wrote = false
    const res = await purgeOgObjectsWith({
      hasMarker: async () => existing.has(OG_PURGE_MARKER), // checks the CURRENT constant (v2)
      list: async () => ({ keys: ["og/fb_survivor-1.png"], next: undefined }),
      del: async (k) => { deleted.push(k) },
      putMarker: async () => { wrote = true; existing.add(OG_PURGE_MARKER) },
    })
    expect(res.skipped).toBe(false) // did NOT no-op despite the stale v1 marker
    expect(deleted).toContain("og/fb_survivor-1.png") // the surviving legacy object is retried
    expect(wrote).toBe(true)
  })
})

describe("purgeOgObjectsWith — one-shot legacy purge (C1-b)", () => {
  test("deletes EVERY legacy og/* key across pages, then writes the marker", async () => {
    const keys = ["og/fb_a-1.png", "og/fb_b-2.png", "og/fb_c-3.png", "og/fb_off-9.png", "og/fb_e-5.png"]
    const store = fakeStore(keys)
    const res = await purgeOgObjectsWith(store.deps(false))
    expect(res.skipped).toBe(false)
    expect(res.failed).toBe(0)
    expect(res.purged).toBe(5)
    expect(store.deleted.sort()).toEqual([...keys].sort())
    expect(store.markerWritten()).toBe(true)
  })

  // Residual b NEG-CONTROL: a purge that deletes EVERY og/ key would nuke fresh private tier-keyed renders.
  test("PRESERVES new tier-keyed private objects; deletes only legacy", async () => {
    const keys = ["og/fb_a-1.png", "og/fb_b-full-5.png", "og/fb_c-teaser-7.png", "og/fb_d.png"]
    const store = fakeStore(keys)
    const res = await purgeOgObjectsWith(store.deps(false))
    expect(store.deleted.sort()).toEqual(["og/fb_a-1.png", "og/fb_d.png"])
    expect(store.deleted).not.toContain("og/fb_b-full-5.png")
    expect(store.deleted).not.toContain("og/fb_c-teaser-7.png")
    expect(res.purged).toBe(2)
    expect(store.markerWritten()).toBe(true)
  })

  // Residual a NEG-CONTROL: a failed delete must NOT certify the purge done (a public object survived).
  test("a FAILED delete → marker NOT written (retry next boot)", async () => {
    const keys = ["og/fb_a-1.png", "og/fb_b-2.png", "og/fb_bad-3.png"]
    const store = fakeStore(keys, ["og/fb_bad-3.png"]) // this delete throws
    const res = await purgeOgObjectsWith(store.deps(false))
    expect(res.failed).toBe(1)
    expect(res.purged).toBe(2)
    expect(res.skipped).toBe(false)
    // The whole point: because a delete failed, the marker is NOT written so the purge runs again.
    expect(store.markerWritten()).toBe(false)
  })

  test("idempotent: a second run (marker present) deletes NOTHING and is skipped", async () => {
    const store = fakeStore(["og/fb_a-1.png", "og/fb_b-2.png"])
    const res = await purgeOgObjectsWith(store.deps(true))
    expect(res.skipped).toBe(true)
    expect(res.purged).toBe(0)
    expect(store.deleted).toEqual([])
  })

  test("never deletes the marker object itself", async () => {
    const store = fakeStore(["og/fb_a-1.png", OG_PURGE_MARKER, "og/fb_b-2.png"])
    await purgeOgObjectsWith(store.deps(false))
    expect(store.deleted).not.toContain(OG_PURGE_MARKER)
    expect(store.deleted.sort()).toEqual(["og/fb_a-1.png", "og/fb_b-2.png"])
  })
})
