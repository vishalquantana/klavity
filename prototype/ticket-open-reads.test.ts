// Opening a ticket renders its detail TWICE on purpose (openSingleTicket: instantly from the list row, then again once
// the full /api/feedback/:id arrives). Every read-only call the detail makes — the screenshot thumb + full URLs, the
// activity timeline and the occurrence memory — used to be fired by BOTH renders, so one open fetched each of them
// twice (and, on a slow server, queued the duplicates behind the originals). The second render now reuses the first
// render's reads; every other call (a reload after posting a comment, a split/merge refresh, a different ticket) still
// goes to the network.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}

function makeReads(fetchImpl: (url: string, init?: any) => Promise<any>) {
  const src = [
    "const _tktReads = new Map()", "let _tktReuse = false",
    extractFn(HTML, "function tktReadsReset("), extractFn(HTML, "function tktRenderReusing("), extractFn(HTML, "function tktRead("),
  ].join("\n")
  return new Function("fetch", src + "\nreturn { tktReadsReset, tktRenderReusing, tktRead }")(fetchImpl) as {
    tktReadsReset: () => void
    tktRenderReusing: <T>(fn: () => T) => T
    tktRead: (kind: string, id: string, url: string, init?: any) => Promise<any>
  }
}
const ok = (body: any) => ({ ok: true, json: async () => body })

test("the second render of one open reuses the first render's read — one request, same data", async () => {
  const urls: string[] = []
  const r = makeReads(async (u) => { urls.push(u); return ok({ n: urls.length }) })
  r.tktReadsReset()
  const first = await r.tktRead("timeline", "fb_a", "/api/feedback/fb_a/timeline")
  const second = await r.tktRenderReusing(() => r.tktRead("timeline", "fb_a", "/api/feedback/fb_a/timeline"))
  expect(urls).toEqual(["/api/feedback/fb_a/timeline"])
  expect(second).toEqual(first)
})

test("reuse also works while the first request is still in flight (slow server) — still one request", async () => {
  let n = 0
  const r = makeReads(async () => { n++; await Bun.sleep(25); return ok({ n }) })
  r.tktReadsReset()
  const a = r.tktRead("memory", "fb_a", "/m")
  const b = r.tktRenderReusing(() => r.tktRead("memory", "fb_a", "/m"))
  expect(await a).toEqual(await b)
  expect(n).toBe(1)
})

test("outside a re-render there is NO reuse: a reload after a comment / split / merge always refetches", async () => {
  let n = 0
  const r = makeReads(async () => ok({ n: ++n }))
  r.tktReadsReset()
  await r.tktRead("timeline", "fb_a", "/t")
  await r.tktRead("timeline", "fb_a", "/t")   // e.g. reloadTimeline() after posting a comment
  expect(n).toBe(2)
})

test("the re-render reuses the LATEST read, so a reload that landed between the two renders is not lost", async () => {
  let n = 0
  const r = makeReads(async () => ok({ n: ++n }))
  r.tktReadsReset()
  await r.tktRead("timeline", "fb_a", "/t")            // render 1
  await r.tktRead("timeline", "fb_a", "/t")            // comment posted → reload (fresher)
  const reused = await r.tktRenderReusing(() => r.tktRead("timeline", "fb_a", "/t"))
  expect(reused).toEqual({ n: 2 })
  expect(n).toBe(2)
})

test("a new open (reset) or a different ticket / a different kind never reuses", async () => {
  const urls: string[] = []
  const r = makeReads(async (u) => { urls.push(u); return ok({}) })
  r.tktReadsReset()
  await r.tktRead("timeline", "fb_a", "/a/t")
  await r.tktRenderReusing(async () => { await r.tktRead("timeline", "fb_b", "/b/t"); await r.tktRead("memory", "fb_a", "/a/m") })
  r.tktReadsReset()
  await r.tktRenderReusing(() => r.tktRead("timeline", "fb_a", "/a/t"))   // reset between → nothing to reuse
  expect(urls).toEqual(["/a/t", "/b/t", "/a/m", "/a/t"])
})

test("a failed read is never reused — the re-render retries", async () => {
  let n = 0
  const r = makeReads(async () => { n++; if (n === 1) return { ok: false, status: 500, json: async () => ({}) }; return ok({ n }) })
  r.tktReadsReset()
  await r.tktRead("timeline", "fb_a", "/t").catch(() => null)
  const second = await r.tktRenderReusing(() => r.tktRead("timeline", "fb_a", "/t"))
  expect(second).toEqual({ n: 2 })
  expect(n).toBe(2)
})

test("the reuse flag is cleared even if the re-render throws", async () => {
  let n = 0
  const r = makeReads(async () => ok({ n: ++n }))
  r.tktReadsReset()
  await r.tktRead("timeline", "fb_a", "/t")
  expect(() => r.tktRenderReusing(() => { throw new Error("boom") })).toThrow("boom")
  await r.tktRead("timeline", "fb_a", "/t")   // outside the window again → must fetch
  expect(n).toBe(2)
})

test("reuse can be decided up front (after an await the re-render window is already closed) — explicit reuse flag wins", async () => {
  let n = 0
  const r = makeReads(async () => ok({ n: ++n }))
  r.tktReadsReset()
  const first = await r.tktRead("shot-full", "fb_a", "/s")
  // outside any tktRenderReusing window, but the caller captured "I am the re-render" synchronously
  const second = await r.tktRead("shot-full", "fb_a", "/s", undefined, true)
  expect(second).toEqual(first)
  expect(n).toBe(1)
  // and an explicit false never reuses, even inside the window
  const third = await r.tktRenderReusing(() => r.tktRead("shot-full", "fb_a", "/s", undefined, false))
  expect(third).toEqual({ n: 2 })
})

test("wiring (source pin): loadTktShot decides reuse and starts BOTH screenshot lookups before its first await", () => {
  const shot = extractFn(HTML, "async function loadTktShot(")
  const iAwait = shot.indexOf("await ")
  const iThumb = shot.indexOf('tktRead("shot-thumb"'), iFull = shot.indexOf('tktRead("shot-full"'), iFlag = shot.indexOf("_tktReuse")
  expect(iFlag).toBeGreaterThanOrEqual(0)
  expect(iThumb).toBeGreaterThan(-1); expect(iFull).toBeGreaterThan(-1)
  expect(iFlag).toBeLessThan(iAwait)
  expect(iThumb).toBeLessThan(iAwait)
  expect(iFull).toBeLessThan(iAwait)       // the full lookup must not wait for the thumb (it would race / miss the re-render window)
})

test("wiring (source pin): openSingleTicket resets the reads, and re-renders through tktRenderReusing", () => {
  const open = extractFn(HTML, "async function openSingleTicket(")
  const iReset = open.indexOf("tktReadsReset()"), iFirst = open.indexOf("_renderSingleTicket(id)")
  expect(iReset).toBeGreaterThanOrEqual(0)
  expect(iReset).toBeLessThan(iFirst)                                   // reset BEFORE the first render
  expect(open).toMatch(/tktRenderReusing\(\s*\(\)\s*=>\s*_renderSingleTicket\(id\)\s*\)/)   // the fresh-data re-render reuses
  expect((open.match(/_renderSingleTicket\(id\)/g) || []).length).toBe(2)
})

test("wiring (source pin): timeline, memory and the screenshot thumb/full lookups go through tktRead — no raw per-render fetch left", () => {
  expect(HTML).not.toMatch(/fetch\("\/api\/feedback\/" \+ encodeURIComponent\(ticketId\) \+ "\/timeline"/)
  expect(HTML).not.toMatch(/fetch\("\/api\/feedback\/" \+ encodeURIComponent\(ticketId\) \+ "\/memory"/)
  expect(HTML).toMatch(/tktRead\("timeline", ticketId,/)
  expect(HTML).toMatch(/tktRead\("memory", ticketId,/)
  const shot = extractFn(HTML, "async function loadTktShot(")
  expect(shot).toMatch(/tktRead\("shot-thumb", id,/)
  expect(shot).toMatch(/tktRead\("shot-full", id,/)
  expect(shot).not.toContain("fetch(")
})
