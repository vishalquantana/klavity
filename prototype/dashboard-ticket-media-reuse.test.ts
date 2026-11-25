// Ticket preview speed: the ticket renders from cache, then again when the fresh /api/feedback/:id arrives. That
// second render used to (a) get NEW presigned S3 links for every recording/attachment, so the browser re-downloaded
// the same files, (b) destroy and rebuild the <video> players, so a clip that was loading/playing restarted, and
// (c) run even when the fresh copy changed nothing. The title font (Fraunces) was also only fetched once the first
// title was on screen, so titles rendered in a fallback font and then "turned bold".
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extract(name: string) {
  const start = html.indexOf("function " + name + "(")
  expect(start).toBeGreaterThan(-1)
  let i = html.indexOf("{", start), depth = 0
  for (; i < html.length; i++) { if (html[i] === "{") depth++; else if (html[i] === "}" && --depth === 0) break }
  return html.slice(start, i + 1)
}
const fns = new Function("location", [
  extract("tktPresignLeftMs"), extract("tktKeepMediaUrls"), extract("tktFreshChanges"),
  extract("tktTakeLiveMedia"), extract("tktRestoreLiveMedia"),
  "return { tktPresignLeftMs, tktKeepMediaUrls, tktFreshChanges, tktTakeLiveMedia, tktRestoreLiveMedia }",
].join("\n"))({ origin: "http://localhost:3000" }) as any

function amzDate(ms: number) { return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "") }
function signed(key: string, signedAtMs: number, expiresSec = 3600, sig = "a") {
  return `https://s3.example.com/bucket/${key}?X-Amz-Date=${amzDate(signedAtMs)}&X-Amz-Expires=${expiresSec}&X-Amz-Signature=${sig}`
}

test("reads how long a presigned link has left (0 for plain URLs)", () => {
  const left = fns.tktPresignLeftMs(signed("v.webm", Date.now(), 3600))
  expect(left).toBeGreaterThan(3590 * 1000)
  expect(left).toBeLessThanOrEqual(3600 * 1000)
  expect(fns.tktPresignLeftMs("/api/feedback/fb_1/attachments?key=v.webm")).toBe(0)
  expect(fns.tktPresignLeftMs("not a url at all ::")).toBe(0)
})

test("keeps the cached link for the same file while it is still valid", () => {
  const cachedUrl = signed("rec.webm", Date.now() - 5 * 60 * 1000, 3600, "old")
  const cached = { recordings: [{ key: "rec.webm", url: cachedUrl }], attachments: [{ key: "a.png", url: signed("a.png", Date.now(), 3600, "old") }] }
  const fresh = { recordings: [{ key: "rec.webm", url: signed("rec.webm", Date.now(), 3600, "new") }], attachments: [{ key: "a.png", url: signed("a.png", Date.now(), 3600, "new") }] }
  fns.tktKeepMediaUrls(cached, fresh)
  expect(fresh.recordings[0].url).toBe(cachedUrl)
  expect(fresh.attachments[0].url).toContain("Signature=old")
})

test("takes the fresh link when the cached one is about to expire, or for a new file", () => {
  const nearlyExpired = signed("rec.webm", Date.now() - 55 * 60 * 1000, 3600, "old")   // ~5 min left
  const freshUrl = signed("rec.webm", Date.now(), 3600, "new")
  const fresh = { recordings: [{ key: "rec.webm", url: freshUrl }, { key: "other.webm", url: signed("other.webm", Date.now()) }] }
  fns.tktKeepMediaUrls({ recordings: [{ key: "rec.webm", url: nearlyExpired }] }, fresh)
  expect(fresh.recordings[0].url).toBe(freshUrl)
  expect(fresh.recordings[1].url).toContain("other.webm")
})

test("the second render is skipped only when the fresh copy changes nothing", () => {
  const cached = { id: "fb_1", status: "open", priority: "low", labels: ["ui"], title: "T" }
  expect(fns.tktFreshChanges(cached, { status: "open", priority: "low", labels: ["ui"] })).toBe(false)
  // low in cache, urgent in the DB → MUST re-render
  expect(fns.tktFreshChanges(cached, { status: "open", priority: "urgent" })).toBe(true)
  expect(fns.tktFreshChanges(cached, { labels: ["ui", "bug"] })).toBe(true)
  // a field the cache never had (e.g. recurrence details) → re-render
  expect(fns.tktFreshChanges(cached, { occurrenceMemory: { count: 2 } })).toBe(true)
  expect(fns.tktFreshChanges(null, { status: "open" })).toBe(true)
})

test("openSingleTicket keeps media links, then re-renders only on a real change", () => {
  const open = extract("openSingleTicket")
  expect(open).toContain("tktKeepMediaUrls(state.tickets[ix], fresh)")
  expect(open).toContain("_changed = tktFreshChanges(state.tickets[ix], fresh)")
  expect(open).toContain("if (_changed && single && !single.classList.contains(\"hide\")) tktRenderReusing(() => _renderSingleTicket(id))")
  // the keep/compare runs BEFORE the merge overwrites the cached row
  expect(open.indexOf("tktFreshChanges(state.tickets[ix], fresh)")).toBeLessThan(open.indexOf("state.tickets[ix] = { ...state.tickets[ix], ...fresh }"))
})

test("_renderSingleTicket carries live video players across a re-render", () => {
  const render = extract("_renderSingleTicket")
  const take = render.indexOf("const _liveMedia = tktTakeLiveMedia(single, id)")
  expect(take).toBeGreaterThan(-1)
  expect(take).toBeLessThan(render.indexOf('single.innerHTML = ""'))
  const restore = render.indexOf("tktRestoreLiveMedia(single, _liveMedia)")
  expect(restore).toBeGreaterThan(render.indexOf("buildTimelineSection(t.id, t)"))
  expect(restore).toBeLessThan(render.indexOf('single.setAttribute("data-tkt-id", String(id))'))
  // players are tagged with a stable file key (not the presigned URL, which changes)
  expect(html).toContain(`data-media-key="' + esc(String(r.key || r.url || r.fallbackUrl)) + '"`)
  expect(html).toContain(`<video data-media-key="' + esc(String(a.key || attUrl)) + '"`)
})

// ── tiny fake DOM: enough for take/restore ──
class El {
  attrs: Record<string, string>; cls: Set<string>; parent: El | null = null; children: El[] = []; tag: string
  constructor(tag: string, attrs: Record<string, string> = {}, cls: string[] = []) { this.tag = tag; this.attrs = attrs; this.cls = new Set(cls) }
  get classList() { return { contains: (c: string) => this.cls.has(c) } }
  getAttribute(n: string) { return n in this.attrs ? this.attrs[n] : null }
  append(...kids: El[]) { kids.forEach(k => { k.parent = this; this.children.push(k) }); return this }
  all(): El[] { return this.children.flatMap(c => [c, ...c.all()]) }
  matches(sel: string) {
    if (sel === ".tkt-rec-vwrap[data-media-key]") return this.cls.has("tkt-rec-vwrap") && "data-media-key" in this.attrs
    if (sel === "video[data-media-key]") return this.tag === "video" && "data-media-key" in this.attrs
    if (sel === ".tkt-rec-vwrap") return this.cls.has("tkt-rec-vwrap")
    return false
  }
  querySelectorAll(sel: string) { return this.all().filter(e => e.matches(sel)) }
  closest(sel: string) { let e: El | null = this; while (e) { if (e.matches(sel)) return e; e = e.parent } return null }
  replaceWith(n: El) { const p = this.parent!; const i = p.children.indexOf(this); p.children[i] = n; n.parent = p; this.parent = null }
}
function panelWith(id: string) {
  const single = new El("div", { "data-tkt-id": id })
  const recWrap = new El("div", { "data-media-key": "rec.webm" }, ["tkt-rec-vwrap"]).append(new El("video"))
  const thumb = new El("video", { "data-media-key": "clip.mp4" })
  single.append(new El("section").append(recWrap, new El("button").append(thumb)))
  return { single, recWrap, thumb }
}

test("re-render of the SAME ticket swaps the old (loading/playing) players back in", () => {
  const first = panelWith("fb_1")
  const live = fns.tktTakeLiveMedia(first.single, "fb_1")
  expect(live.size).toBe(2)
  const second = panelWith("fb_1")   // what the re-render built from scratch
  fns.tktRestoreLiveMedia(second.single, live)
  const recs = second.single.querySelectorAll(".tkt-rec-vwrap[data-media-key]")
  expect(recs[0]).toBe(first.recWrap)
  expect(second.single.querySelectorAll("video[data-media-key]").filter(v => !v.closest(".tkt-rec-vwrap"))[0]).toBe(first.thumb)
})

test("a DIFFERENT ticket, or a failed player, is never carried over", () => {
  const other = panelWith("fb_2")
  expect(fns.tktTakeLiveMedia(other.single, "fb_1").size).toBe(0)
  const failed = panelWith("fb_1"); failed.recWrap.cls.add("tkt-rec-failed")
  const live = fns.tktTakeLiveMedia(failed.single, "fb_1")
  expect(live.has("rec|rec.webm")).toBe(false)
  expect(live.has("vid|clip.mp4")).toBe(true)
})

test("the Fraunces title font is preloaded", () => {
  expect(html).toContain('<link rel="preload" href="/fonts/fraunces-300-900-normal-latin.woff2" as="font" type="font/woff2" crossorigin />')
})
