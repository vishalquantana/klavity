// KLA-739 (C1-b) — neg-controls for the one-shot legacy-OG purge. purgeOgObjectsWith is dependency-
// injected so we exercise the real paging + guard logic with fakes (no S3).

import { test, expect, describe } from "bun:test"
import { purgeOgObjectsWith, OG_PURGE_MARKER, type OgPurgeDeps } from "./s3"

function fakeStore(initial: string[]): {
  deps: (markerPresent?: boolean) => OgPurgeDeps
  deleted: string[]
  markerWritten: () => boolean
} {
  const deleted: string[] = []
  let markerPresent = false
  let wroteMarker = false
  // page the keys in chunks of 2 to exercise continuation-token paging.
  const pageOf = (token?: string): { keys: string[]; next?: string } => {
    const start = token ? Number(token) : 0
    const keys = initial.slice(start, start + 2)
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
        del: async (k) => { deleted.push(k) },
        putMarker: async () => { wroteMarker = true; markerPresent = true },
      }
    },
  }
}

describe("purgeOgObjectsWith — one-shot legacy purge (C1-b)", () => {
  test("deletes EVERY listed og/* key across pages, then writes the marker", async () => {
    const keys = ["og/fb_a-1.png", "og/fb_b-2.png", "og/fb_c-3.png", "og/fb_off-9.png", "og/fb_e-5.png"]
    const store = fakeStore(keys)
    const res = await purgeOgObjectsWith(store.deps(false))
    expect(res.skipped).toBe(false)
    expect(res.purged).toBe(5)
    // NEG-CONTROL: pre-fix these public/non-tier-keyed objects (incl. the private 'off' ticket's) survive.
    expect(store.deleted.sort()).toEqual([...keys].sort())
    expect(store.markerWritten()).toBe(true)
  })

  test("idempotent: a second run (marker present) deletes NOTHING and is skipped", async () => {
    const store = fakeStore(["og/fb_a-1.png", "og/fb_b-2.png"])
    const res = await purgeOgObjectsWith(store.deps(true)) // marker already present
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
