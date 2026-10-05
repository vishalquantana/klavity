// KD-195: the ticket-preview screenshot must paint from ONE same-origin request (the byte-proxy thumbnail), start the
// full-size download only AFTER the thumbnail painted, and keep the old signed-link path only as an error fallback.
// The real loadTktShot is extracted from public/dashboard.html and run against a minimal fake DOM.
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
const SHOT_PROXY_LINE = (HTML.match(/^function shotProxyUrl\(id\) \{.*\}$/m) || [])[0]
if (!SHOT_PROXY_LINE) throw new Error("shotProxyUrl not found")
const SRC = [SHOT_PROXY_LINE, extractFn(HTML, "async function loadTktShot(")].join("\n")

class FakeImg {
  listeners: Record<string, Function[]> = {}
  attrs: Record<string, string> = {}
  srcSets: string[] = []
  style: any = {}; title = ""; alt = ""; isConnected = true; complete = false; naturalWidth = 0
  set src(v: string) { this.srcSets.push(v) }
  get src() { return this.srcSets[this.srcSets.length - 1] || "" }
  addEventListener(t: string, f: Function) { (this.listeners[t] ||= []).push(f) }
  setAttribute(k: string, v: string) { this.attrs[k] = v }
  getAttribute(k: string) { return k in this.attrs ? this.attrs[k] : null }
  fire(t: string) { (this.listeners[t] || []).slice().forEach(f => f()) }
}
function setup(opts: { id?: string | null; hiComplete?: boolean; jsonUrl?: string | null; annotations?: any } = {}) {
  const id = opts.id === undefined ? "shot1" : opts.id
  const imgs: FakeImg[] = []
  const preloads: { url: string; img: FakeImg }[] = []
  const fetches: string[] = []
  const boxAttrs: Record<string, string> = id ? { "data-shot": id } : {}
  const box: any = {
    innerHTML: "", children: [] as any[],
    getAttribute: (k: string) => (k in boxAttrs ? boxAttrs[k] : null), setAttribute: (k: string, v: string) => { boxAttrs[k] = v },
    appendChild(el: any) { this.children.push(el) },
  }
  const detailEl: any = { querySelector: (sel: string) => (sel === ".tkt-shot" ? box : null) }
  const document = { createElement: (_t: string) => { const i = new FakeImg(); imgs.push(i); return i } }
  const preloadShot = (url: string) => { const i = new FakeImg(); if (opts.hiComplete) { i.complete = true; i.naturalWidth = 100 } preloads.push({ url, img: i }); return i }
  const fetchFn = async (url: string) => { fetches.push(url); return { json: async () => (opts.jsonUrl === null ? {} : { url: opts.jsonUrl ?? "https://s3.example/signed-thumb.png" }) } }
  const fn = new Function("document", "preloadShot", "fetch", "mountAnnotationOverlay", "mountPinnedSelector", "openEvidenceAnnotator", "encodeURIComponent",
    SRC + "\nreturn loadTktShot")(document, preloadShot, fetchFn, () => {}, () => {}, () => {}, encodeURIComponent) as (d: any, a: any) => Promise<void>
  return { run: () => fn(detailEl, opts.annotations ?? null), box, imgs, preloads, fetches, boxAttrs }
}

test("first paint is ONE same-origin request: the proxy thumbnail URL goes straight onto the <img> (no signed-link fetch, no preload yet)", async () => {
  const t = setup()
  await t.run()
  expect(t.fetches).toEqual([])                                           // the signed-link JSON hop is gone
  expect(t.imgs.length).toBe(1)
  expect(t.imgs[0].srcSets).toEqual(["/api/screenshots/shot1?proxy=1&thumb=1"])
  expect(t.preloads).toEqual([])                                          // the full image does NOT compete with the thumbnail
  expect(t.box.children).toEqual([t.imgs[0]])                             // painted into the box
})

test("the full image is requested only AFTER the thumbnail has loaded, then swapped in via the same proxy (data-full set)", async () => {
  const t = setup()
  await t.run()
  const img = t.imgs[0]
  img.fire("load")                                                        // thumbnail painted
  expect(t.preloads.map(p => p.url)).toEqual(["/api/screenshots/shot1?proxy=1"])
  expect(img.srcSets).toEqual(["/api/screenshots/shot1?proxy=1&thumb=1"]) // not swapped until the full bitmap arrives
  t.preloads[0].img.fire("load")                                          // full image downloaded
  expect(img.srcSets.at(-1)).toBe("/api/screenshots/shot1?proxy=1")
  expect(img.getAttribute("data-full")).toBe("/api/screenshots/shot1?proxy=1")   // what click-to-annotate / Full size use
  // the swap itself re-fires 'load' on the <img>: it must not start another preload
  img.fire("load")
  expect(t.preloads.length).toBe(1)
  expect(t.fetches).toEqual([])
})

test("if the full image was already warmed/decoded, the swap is immediate", async () => {
  const t = setup({ hiComplete: true })
  await t.run()
  t.imgs[0].fire("load")
  expect(t.imgs[0].srcSets.at(-1)).toBe("/api/screenshots/shot1?proxy=1")
})

test("an <img> that left the DOM (ticket closed meanwhile) is not swapped", async () => {
  const t = setup()
  await t.run()
  t.imgs[0].fire("load")
  t.imgs[0].isConnected = false
  t.preloads[0].img.fire("load")
  expect(t.imgs[0].srcSets).toEqual(["/api/screenshots/shot1?proxy=1&thumb=1"])
})

test("fallback: if the proxy thumbnail fails, the OLD signed-link request runs once and its URL is used", async () => {
  const t = setup()
  await t.run()
  t.imgs[0].fire("error")
  await Bun.sleep(5)
  expect(t.fetches).toEqual(["/api/screenshots/shot1?thumb=1"])
  expect(t.imgs[0].srcSets.at(-1)).toBe("https://s3.example/signed-thumb.png")
  // a second error (e.g. the signed URL also failing) must not loop
  t.imgs[0].fire("error"); await Bun.sleep(5)
  expect(t.fetches.length).toBe(1)
})

test("fallback with no usable link shows a clear message instead of a spinner forever", async () => {
  const t = setup({ jsonUrl: null })
  await t.run()
  t.imgs[0].fire("error"); await Bun.sleep(5)
  expect(t.box.innerHTML).toContain("couldn’t be loaded")
})

test("a ticket with no screenshot id shows the message and makes no request", async () => {
  const t = setup({ id: null })
  await t.run()
  expect(t.fetches).toEqual([]); expect(t.imgs).toEqual([])
})

test("loading is idempotent per box (re-render does not repaint or refetch)", async () => {
  const t = setup()
  await t.run(); await t.run()
  expect(t.imgs.length).toBe(1)
  expect(t.fetches).toEqual([])
})
