// KD-193: attachment upload on an existing ticket — immediate feedback (placeholder tiles + real progress), success/failure
// toasts, duplicate prevention, and re-render safety. The REAL manager functions are extracted from public/dashboard.html and run
// against a fake XMLHttpRequest / fake globals; the wiring that needs the real page is source-pinned.
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
const line = (re: RegExp) => { const m = HTML.match(re); if (!m) throw new Error("line not found: " + re); return m[0] }

const SRC = [
  "const _attachUploads = new Map()", "const _attachCtx = new Map()", "const _attachMsgs = new Map()", "let _attachSeq = 0",
  extractFn(HTML, "function attachMsgFor("),
  "const _attachRemoving = new Map()", extractFn(HTML, "function attachRemoveState("), extractFn(HTML, "function _attachSetRemoveState("),
  extractFn(HTML, "function attachAskRemove("), extractFn(HTML, "function attachCancelRemove("), extractFn(HTML, "function attachConfirmRemove("),
  extractFn(HTML, "function _attachRemoveUi("), extractFn(HTML, "function attachCancelUpload("), extractFn(HTML, "function _attachRemoveFromLists("),
  line(/^const ATTACH_MAX_FILES = .*$/m), line(/^const ATTACH_IMG_MAX = .*$/m), line(/^const ATTACH_VIDEO_MAX = .*$/m), line(/^const ATTACH_TOTAL_MAX = .*$/m),
  extractFn(HTML, "function _attachFmtBytes("), extractFn(HTML, "function attachKind("),
  extractFn(HTML, "function _attachKey("), extractFn(HTML, "function attachUploadsFor("), extractFn(HTML, "function attachInFlight("),
  extractFn(HTML, "function _attachMutating("), extractFn(HTML, "function attachPlanUpload("), extractFn(HTML, "function attachStartUpload("),
  extractFn(HTML, "function attachDismiss("), extractFn(HTML, "function attachRetry("), extractFn(HTML, "function _attachTileHtml("),
  extractFn(HTML, "function buildAttachmentsHtml("), extractFn(HTML, "function _attachApplyServerList("),
  "let state = { tickets: [] }; let _tktBoardTickets = []",
  "return { attachPlanUpload, attachStartUpload, attachRetry, attachDismiss, attachInFlight, attachUploadsFor, buildAttachmentsHtml, _attachApplyServerList, _attachCtx, _attachUploads,"
  + " attachRemoveState, attachAskRemove, attachCancelRemove, attachConfirmRemove, attachCancelUpload, _attachRemoveFromLists,"
  + " setLists(s, b) { state = s; _tktBoardTickets = b } }",
].join("\n")

class FakeXHR {
  static all: FakeXHR[] = []
  method = ""; url = ""; status = 0; responseText = ""; timeout = 0; body: FormData | null = null
  upload: any = {}
  onload: any; onerror: any; ontimeout: any; onabort: any
  constructor() { FakeXHR.all.push(this) }
  aborted = false
  abort() { this.aborted = true; this.onabort && this.onabort() }
  open(m: string, u: string) { this.method = m; this.url = u }
  send(b: FormData) { this.body = b }
  progress(loaded: number, total: number) { this.upload.onprogress && this.upload.onprogress({ lengthComputable: true, loaded, total }) }
  sent() { this.upload.onload && this.upload.onload() }
  respond(status: number, body: any) { this.status = status; this.responseText = typeof body === "string" ? body : JSON.stringify(body); this.onload && this.onload() }
}
const esc = (x: any) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
function make() {
  FakeXHR.all = []
  const win: any = { __klavMutating: 0 }
  const api = new Function("esc", "kicon", "window", "FormData", SRC)(esc, (n: string) => "<i data-k=" + n + "></i>", win, FormData) as any
  const calls: any = { change: 0, progress: 0, done: [] as any[], fail: [] as string[] }
  const hooks = { xhr: () => new FakeXHR(), onChange: () => { calls.change++ }, onProgress: () => { calls.progress++ }, onDone: (id: string, res: any) => { calls.done.push([id, res]) }, onFail: (_id: string, msg: string) => { calls.fail.push(msg) } }
  return { api, win, calls, hooks }
}
const F = (name: string, size = 1000, type = "image/png") => ({ name, size, type }) as any
const MB = 1024 * 1024

// ── duplicate / limit planning (pure) ─────────────────────────────────────────────────────────────────────────────────
test("plan: a file already on the ticket (same name + size, case-insensitive) is a duplicate and is skipped", () => {
  const { api } = make()
  const r = api.attachPlanUpload([F("Shot.PNG", 100), F("other.png", 200)], [{ filename: "shot.png", size: 100 }], [])
  expect(r.accept.map((f: any) => f.name)).toEqual(["other.png"])
  expect(r.duplicates).toEqual(["Shot.PNG"])
})
test("plan: a file that is ALREADY UPLOADING counts as a duplicate; a repeat inside one selection too", () => {
  const { api } = make()
  const r = api.attachPlanUpload([F("a.png", 5), F("a.png", 5), F("b.png", 6)], [], [{ name: "b.png", size: 6, status: "uploading" }])
  expect(r.accept.map((f: any) => f.name)).toEqual(["a.png"])
  expect(r.duplicates.sort()).toEqual(["a.png", "b.png"])
})
test("plan: same name but a different size is a different file", () => {
  const { api } = make()
  expect(api.attachPlanUpload([F("a.png", 6)], [{ filename: "a.png", size: 5 }], []).accept.length).toBe(1)
})
test("plan: empty files, the 5-file cap and the size limits are rejected with a reason", () => {
  const { api } = make()
  expect(api.attachPlanUpload([F("e.png", 0)], [], []).rejected).toEqual(["e.png: file is empty"])
  const six = Array.from({ length: 6 }, (_, i) => F("f" + i + ".png", 10 + i))
  const r6 = api.attachPlanUpload(six, [], [])
  expect(r6.accept.length).toBe(5); expect(r6.rejected).toEqual(["f5.png: at most 5 files at a time"])
  expect(api.attachPlanUpload([F("big.png", 8 * MB + 1)], [], []).rejected[0]).toContain("larger than 8.0 MB")
  expect(api.attachPlanUpload([F("ok.png", 8 * MB)], [], []).accept.length).toBe(1)                       // exact cap allowed
  expect(api.attachPlanUpload([F("v.mp4", 100 * MB, "video/mp4")], [], []).accept.length).toBe(1)           // video cap 100 MB
  expect(api.attachPlanUpload([F("v2.mp4", 100 * MB + 1, "video/mp4")], [], []).rejected[0]).toContain("larger than 100.0 MB")
  expect(api.attachPlanUpload([F("clip.mov", 50 * MB, "")], [], []).accept.length).toBe(1)                  // video recognised by extension
  const tot = api.attachPlanUpload([F("a.mp4", 100 * MB, "video/mp4"), F("b.mp4", 30 * MB, "video/mp4")], [], [])
  expect(tot.accept.length).toBe(1); expect(tot.rejected[0]).toContain("total would exceed 120.0 MB")
  expect(api.attachPlanUpload([F("doc.pdf", 2 * MB, "application/pdf")], [], []).accept.length).toBe(1)     // any file type may be attached here
})

// ── immediate feedback + progress ─────────────────────────────────────────────────────────────────────────────────────
test("starting an upload shows placeholder tiles IMMEDIATELY (before the server answers) and one request carries every file", () => {
  const { api, calls, hooks, win } = make()
  const batch = api.attachStartUpload("fb_1", [F("a.png"), F("b.png", 2000)], hooks)
  expect(calls.change).toBe(1)                                              // onChange fires synchronously → tiles are painted right away
  expect(api.attachUploadsFor("fb_1").map((u: any) => [u.name, u.status, u.pct])).toEqual([["a.png", "uploading", 0], ["b.png", "uploading", 0]])
  expect(api.attachInFlight("fb_1")).toBe(true)
  expect(win.__klavMutating).toBe(1)                                        // the liveness poll is paused while uploading
  expect(FakeXHR.all.length).toBe(1)
  const x = FakeXHR.all[0]
  expect([x.method, x.url]).toEqual(["POST", "/api/feedback/fb_1/attachments"])
  expect((x.body as FormData).getAll("files").length).toBe(2)
  expect(batch.length).toBe(2)
})
test("real upload progress: percent follows the bytes sent (capped at 99), then 'Saving…' once every byte is sent", () => {
  const { api, calls, hooks } = make()
  api.attachStartUpload("fb_1", [F("a.png")], hooks)
  const x = FakeXHR.all[0]
  x.progress(250, 1000); expect(api.attachUploadsFor("fb_1")[0].pct).toBe(25)
  x.progress(1000, 1000); expect(api.attachUploadsFor("fb_1")[0].pct).toBe(99)   // never claims 100% until the server confirms
  expect(calls.progress).toBe(2)
  x.sent()
  const u = api.attachUploadsFor("fb_1")[0]
  expect([u.phase, u.pct]).toEqual(["saving", 100])
  const html = api.buildAttachmentsHtml({ id: "fb_1", attachments: [] })
  expect(html).toContain("Saving…"); expect(html).toContain("tkt-attach-pending saving")
})
test("progress events without a known length are ignored (no NaN%)", () => {
  const { api, hooks } = make()
  api.attachStartUpload("fb_1", [F("a.png")], hooks)
  FakeXHR.all[0].upload.onprogress({ lengthComputable: false, loaded: 5, total: 0 })
  expect(api.attachUploadsFor("fb_1")[0].pct).toBe(0)
})

// ── success ───────────────────────────────────────────────────────────────────────────────────────────────────────────
test("success: tiles are removed, the server's attachments are handed to onDone, the poll guard is released", () => {
  const { api, calls, hooks, win } = make()
  api.attachStartUpload("fb_1", [F("a.png")], hooks)
  FakeXHR.all[0].respond(201, { ok: true, attachments: [{ key: "k1", filename: "a.png", size: 1000, url: "https://s3/a.png" }], duplicates: ["old.png"], ignored: ["x.png"] })
  expect(api.attachUploadsFor("fb_1")).toEqual([])
  expect(api.attachInFlight("fb_1")).toBe(false)
  expect(win.__klavMutating).toBe(0)
  expect(calls.done.length).toBe(1)
  expect(calls.done[0][0]).toBe("fb_1")
  expect(calls.done[0][1].attachments.map((a: any) => a.key)).toEqual(["k1"])
  expect(calls.done[0][1].duplicates).toEqual(["old.png"]); expect(calls.done[0][1].ignored).toEqual(["x.png"])
  expect(calls.fail).toEqual([])
})
test("a 200 with only duplicates is a success with no new attachments (the UI says 'already attached')", () => {
  const { api, calls, hooks } = make()
  api.attachStartUpload("fb_1", [F("a.png")], hooks)
  FakeXHR.all[0].respond(200, { ok: true, attachments: [], duplicates: ["a.png"], ignored: [] })
  expect(calls.done[0][1].attachments).toEqual([]); expect(calls.done[0][1].duplicates).toEqual(["a.png"])
})

// ── failure + retry ───────────────────────────────────────────────────────────────────────────────────────────────────
test("server error: the tiles turn into error tiles with the server's message, onFail fires, the guard is released", () => {
  const { api, calls, hooks, win } = make()
  api.attachStartUpload("fb_1", [F("a.png")], hooks)
  FakeXHR.all[0].respond(400, { error: "File a.png exceeds 8.0 MB." })
  const u = api.attachUploadsFor("fb_1")[0]
  expect([u.status, u.error]).toEqual(["error", "File a.png exceeds 8.0 MB."])
  expect(calls.fail).toEqual(["File a.png exceeds 8.0 MB."])
  expect(api.attachInFlight("fb_1")).toBe(false); expect(win.__klavMutating).toBe(0)
  expect(calls.done).toEqual([])
  const html = api.buildAttachmentsHtml({ id: "fb_1", attachments: [] })
  expect(html).toContain("tkt-attach-pending err"); expect(html).toContain("File a.png exceeds 8.0 MB."); expect(html).toContain("data-attach-retry"); expect(html).toContain("data-attach-dismiss")
})
test("network error, timeout and a non-JSON / non-ok reply all become a clear failure", () => {
  for (const [kind, expected] of [["error", "Network error"], ["timeout", "timed out"]] as const) {
    const { api, calls, hooks } = make()
    api.attachStartUpload("fb_x", [F("a.png")], hooks)
    const x = FakeXHR.all[0]; if (kind === "error") x.onerror(); else x.ontimeout()
    expect(calls.fail[0]).toContain(expected)
  }
  const { api, calls, hooks } = make()
  api.attachStartUpload("fb_y", [F("a.png")], hooks)
  FakeXHR.all[0].respond(502, "<html>Bad gateway</html>")
  expect(calls.fail[0]).toBe("Upload failed (HTTP 502)")
  const m2 = make(); m2.api.attachStartUpload("fb_z", [F("a.png")], m2.hooks)
  FakeXHR.all[0].respond(200, { ok: false })                                // 2xx but not ok → still a failure
  expect(m2.calls.fail).toEqual(["Upload failed (HTTP 200)"])
})
test("settling twice is harmless (a late onerror after onload does not double-release the guard)", () => {
  const { api, hooks, win } = make()
  api.attachStartUpload("fb_1", [F("a.png")], hooks)
  const x = FakeXHR.all[0]
  x.respond(201, { ok: true, attachments: [{ key: "k" }] }); x.onerror()
  expect(win.__klavMutating).toBe(0)
})
test("Retry re-sends ONLY that file as a fresh upload and clears its error tile; Remove just drops it", () => {
  const { api, calls, hooks } = make()
  const RF = (name: string, size: number) => new File([new Uint8Array(size)], name, { type: "image/png" })   // real Files so FormData keeps the names
  api.attachStartUpload("fb_1", [RF("a.png", 1000), RF("b.png", 2000)], hooks)
  FakeXHR.all[0].respond(500, { error: "boom" })
  const [ua, ub] = api.attachUploadsFor("fb_1")
  api.attachDismiss("fb_1", ub.id)                                           // Remove b
  expect(api.attachUploadsFor("fb_1").map((u: any) => u.name)).toEqual(["a.png"])
  const retried = api.attachRetry("fb_1", ua.id, hooks)
  expect(retried.length).toBe(1)
  expect(FakeXHR.all.length).toBe(2)
  expect((FakeXHR.all[1].body as FormData).getAll("files").map((f: any) => f.name)).toEqual(["a.png"])
  const now = api.attachUploadsFor("fb_1")
  expect(now.length).toBe(1); expect(now[0].status).toBe("uploading")
  FakeXHR.all[1].respond(201, { ok: true, attachments: [{ key: "k" }] })
  expect(calls.done.length).toBe(1)
})
test("Retry is blocked while another upload on that ticket is in flight", () => {
  const { api, hooks } = make()
  api.attachStartUpload("fb_1", [F("a.png")], hooks); FakeXHR.all[0].respond(500, { error: "boom" })
  const err = api.attachUploadsFor("fb_1")[0]
  api.attachStartUpload("fb_1", [F("c.png", 3000)], hooks)
  expect(api.attachRetry("fb_1", err.id, hooks)).toBeNull()
  expect(FakeXHR.all.length).toBe(2)
})
test("uploads are tracked per ticket (another ticket's state is untouched)", () => {
  const { api, hooks } = make()
  api.attachStartUpload("fb_1", [F("a.png")], hooks)
  expect(api.attachInFlight("fb_1")).toBe(true); expect(api.attachInFlight("fb_2")).toBe(false)
})

// ── re-render safety ──────────────────────────────────────────────────────────────────────────────────────────────────
test("re-render safety: rebuilding the attachments block mid-upload still shows the tile + a disabled 'Uploading…' button; after it finishes they are gone", () => {
  const { api, hooks } = make()
  const t = { id: "fb_1", attachments: [{ key: "k0", filename: "old.png", contentType: "image/png", url: "https://s3/old.png", size: 5 }] }
  expect(api.buildAttachmentsHtml(t)).not.toContain("tkt-attach-pending")
  expect(api.buildAttachmentsHtml(t)).not.toMatch(/tkt-attach-add-btn" type="button" disabled/)
  api.attachStartUpload("fb_1", [F("new.png", 4242)], hooks)
  FakeXHR.all[0].progress(500, 1000)
  const mid = api.buildAttachmentsHtml(t)                                    // what a full re-render would paint
  expect(mid).toContain("tkt-attach-pending"); expect(mid).toContain("new.png"); expect(mid).toContain("Uploading… 50%")
  expect(mid).toMatch(/tkt-attach-add-btn" type="button" disabled aria-busy="true"/); expect(mid).toContain("Uploading…")
  expect(mid).toContain('data-ticket="fb_1"')
  expect(mid).toContain('<span class="tkt-attach-count">1</span>')           // the count is of REAL attachments, not placeholders
  FakeXHR.all[0].respond(201, { ok: true, attachments: [{ key: "k1", filename: "new.png", size: 4242 }] })
  const after = api.buildAttachmentsHtml(t)
  expect(after).not.toContain("tkt-attach-pending")
  expect(after).not.toMatch(/tkt-attach-add-btn" type="button" disabled/)
})
test("file names in upload tiles are HTML-escaped", () => {
  const { api, hooks } = make()
  api.attachStartUpload("fb_1", [F("<img src=x onerror=alert(1)>.png", 7)], hooks)
  const html = api.buildAttachmentsHtml({ id: "fb_1", attachments: [] })
  expect(html).not.toContain("<img src=x"); expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;.png")
})

// ── the finished upload lands everywhere ──────────────────────────────────────────────────────────────────────────────
test("the finished upload is merged into every in-memory copy of the ticket (overview list, board cache, open panel) without duplicates", () => {
  const { api } = make()
  const inList = { id: "fb_1", attachments: [{ key: "k0" }] }, inBoard = { id: "fb_1", attachments: [{ key: "k0" }] }, panel = { id: "fb_1" }, other = { id: "fb_2", attachments: [] }
  api.setLists({ tickets: [inList, other] }, [inBoard])
  api._attachCtx.set("fb_1", { detailEl: {}, t: panel })
  api._attachApplyServerList("fb_1", [{ key: "k1" }, { key: "k0" }])        // k0 already present
  expect(inList.attachments.map((a: any) => a.key)).toEqual(["k0", "k1"])
  expect(inBoard.attachments.map((a: any) => a.key)).toEqual(["k0", "k1"])
  expect((panel as any).attachments.map((a: any) => a.key)).toEqual(["k1", "k0"])   // the open panel's copy had none → it gets both
  expect(other.attachments).toEqual([])
})

// ── wiring pins ───────────────────────────────────────────────────────────────────────────────────────────────────────
test("wiring: the picker plans (duplicates/limits) then uploads through the manager with XHR progress — not a bare fetch", () => {
  const wire = extractFn(HTML, "function wireAttachments(")
  expect(wire).toContain("_attachCtx.set(id, { detailEl: detailEl, t: t })")
  expect(wire).toContain("attachPlanUpload(files")
  expect(wire).toContain("attachStartUpload(id, plan.accept, _attachHooks)")
  expect(wire).toContain("if (!attachInFlight(id)) input.click()")          // no second pick while one is in flight
  expect(wire).not.toContain("fetch(")                                       // the old progress-less fetch is gone
  expect(wire).toContain("[data-attach-retry]"); expect(wire).toContain("[data-attach-dismiss]")
  expect(extractFn(HTML, "function attachStartUpload(")).toContain("xhr.upload.onprogress")
})
test("toasts: success says 'Attachment uploaded successfully'; failures and skipped duplicates warn", () => {
  const hooksSrc = HTML.slice(HTML.indexOf("const _attachHooks = {"), HTML.indexOf("const _attachHooks = {") + 1600)
  expect(hooksSrc).toContain('"Attachment uploaded successfully"')
  expect(hooksSrc).toContain('" attachments uploaded successfully"')
  expect(hooksSrc).toContain('attachToast(msg, "warn")')                     // onFail
  expect(hooksSrc).toContain("already attached — skipped.")
  expect(extractFn(HTML, "function attachToast(")).toContain('setAttribute("aria-live", "polite")')
})
test("CSS: placeholder / error tiles, progress bar, spinner and a disabled Add button are styled", () => {
  for (const frag of [".tkt-attach-pending{", ".tkt-attach-pending .tkt-attach-bar i{", ".tkt-attach-pending.err{", ".tkt-attach-add-btn:disabled{", "@keyframes tktAttachPulse"])
    expect(HTML).toContain(frag)
})

// ── inline note persistence (skipped / rejected files must not vanish on the re-render the upload itself triggers) ─────
test("the inline note is stored per ticket and rendered by every rebuild of the block (and escaped)", () => {
  const { api } = make()
  const t = { id: "fb_1", attachments: [] }
  expect(api.buildAttachmentsHtml(t)).toContain('role="status" aria-live="polite"></div>')           // empty by default
  // attachSetMsg itself needs the DOM; the storage + render contract is pinned on the real source:
  const setMsg = extractFn(HTML, "function attachSetMsg(")
  expect(setMsg).toContain("_attachMsgs.set(String(ticketId), { text: text || \"\", isErr: !!isErr })")   // stored BEFORE the DOM check → survives a detached block
  expect(extractFn(HTML, "function buildAttachmentsHtml(")).toContain("esc(attachMsgFor(t.id).text)")
  expect(extractFn(HTML, "function buildAttachmentsHtml(")).toContain("attachMsgFor(t.id).isErr ? 'var(--rose)'")
})
test("the picker keeps its notes visible after the upload starts, and the server's notes are APPENDED to them", () => {
  const wire = extractFn(HTML, "function wireAttachments(")
  const iClear = wire.indexOf('if (!notes.length) attachSetMsg(id, "", false)'), iReturn = wire.indexOf("if (!plan.accept.length) return"), iStart = wire.indexOf("attachStartUpload(id, plan.accept")
  expect(iClear).toBeGreaterThan(-1); expect(iClear).toBeLessThan(iReturn); expect(iReturn).toBeLessThan(iStart)   // cleared only when the selection was clean
  const hooks = HTML.slice(HTML.indexOf("const _attachHooks = {"), HTML.indexOf("const _attachHooks = {") + 1900)
  expect(hooks).toContain("[attachMsgFor(id).text].concat(notes).filter(Boolean).join(\" \")")
})

// ── remove an UPLOADED attachment (× → inline confirm → DELETE) ─────────────────────────────────────────────────────
const withKeys = () => ({ id: "fb_1", attachments: [
  { key: "uploads/attachments/a.png", filename: "a.png", contentType: "image/png", url: "https://s3/a.png", size: 10 },
  { key: "uploads/attachments/doc.pdf", filename: "doc.pdf", contentType: "application/pdf", url: "https://s3/doc.pdf", size: 20 },
  { filename: "legacy.txt", contentType: "text/plain", url: "https://s3/legacy.txt", size: 5 },            // no storage key → can't be addressed
] })
function removeHooks(calls: any) { return { onChange: () => { calls.change++ }, onRemoved: (id: string, key: string) => calls.removed.push([id, key]), onRemoveFail: (_id: string, _key: string, msg: string) => calls.removeFail.push(msg) } }
const respondWith = (status: number, body: any, log: any[]) => (url: string, opts: any) => { log.push([url, opts]); return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) }) }

test("every uploaded attachment — preview tile AND file row — has a remove (×) button keyed by its storage key; keyless legacy entries have none", () => {
  const { api } = make()
  const html = api.buildAttachmentsHtml(withKeys())
  expect(html).toContain('data-attach-remove="uploads/attachments/a.png"')          // the image tile
  expect(html).toContain('data-attach-remove="uploads/attachments/doc.pdf"')        // the pdf row
  expect((html.match(/data-attach-remove="/g) || []).length).toBe(2)                // legacy.txt has no key → no button
  expect(html).toContain('aria-label="Remove a.png"')
  expect(html).toContain('<div class="tkt-attach-tile">')                           // the × is a sibling of the preview button, not nested in it
  const tile = html.slice(html.indexOf('<div class="tkt-attach-tile">'))
  const thumbBtn = tile.slice(0, tile.indexOf("</button>") + 9)
  expect(thumbBtn.split("<button").length - 1).toBe(1)                              // no <button> nested inside the preview <button>
})
test("clicking × asks for confirmation INLINE (no native confirm()); Cancel puts it back; only one confirmation is open at a time", () => {
  const { api } = make()
  const t = withKeys()
  api.attachAskRemove("fb_1", "uploads/attachments/a.png")
  let html = api.buildAttachmentsHtml(t)
  expect(html).toContain('data-attach-remove-yes="uploads/attachments/a.png"'); expect(html).toContain('data-attach-remove-no="uploads/attachments/a.png"'); expect(html).toContain('role="alertdialog"')
  expect(html).not.toContain('data-attach-remove="uploads/attachments/a.png"')       // its × is replaced by the confirmation
  api.attachAskRemove("fb_1", "uploads/attachments/doc.pdf")                         // asking about another moves the confirmation
  expect(api.attachRemoveState("fb_1", "uploads/attachments/a.png")).toBe("")
  expect(api.attachRemoveState("fb_1", "uploads/attachments/doc.pdf")).toBe("confirm")
  api.attachCancelRemove("fb_1", "uploads/attachments/doc.pdf")
  html = api.buildAttachmentsHtml(t)
  expect(html).not.toContain("data-attach-remove-yes"); expect(html).toContain('data-attach-remove="uploads/attachments/doc.pdf"')
})
test("confirming sends DELETE …/attachments?key=<encoded key>, shows 'Removing…', then drops it everywhere and clears the state", async () => {
  const { api, win } = make()
  const calls: any = { change: 0, removed: [], removeFail: [] }, log: any[] = []
  api.attachAskRemove("fb_1", "uploads/attachments/a b.png")
  const p = api.attachConfirmRemove("fb_1", "uploads/attachments/a b.png", removeHooks(calls), respondWith(200, { ok: true, removed: "x" }, log))
  expect(api.attachRemoveState("fb_1", "uploads/attachments/a b.png")).toBe("removing")
  expect(win.__klavMutating).toBe(1)                                                 // poll paused while the delete is in flight
  expect(api.buildAttachmentsHtml({ id: "fb_1", attachments: [{ key: "uploads/attachments/a b.png", filename: "a b.png", url: "https://s3/x" }] })).toContain("Removing…")
  await p
  expect(log[0][0]).toBe("/api/feedback/fb_1/attachments?key=uploads%2Fattachments%2Fa%20b.png")
  expect(log[0][1]).toEqual({ method: "DELETE" })
  expect(calls.removed).toEqual([["fb_1", "uploads/attachments/a b.png"]])
  expect(api.attachRemoveState("fb_1", "uploads/attachments/a b.png")).toBe("")
  expect(win.__klavMutating).toBe(0)
})
test("a double-click on Remove sends only ONE delete", async () => {
  const { api } = make(); const calls: any = { change: 0, removed: [], removeFail: [] }, log: any[] = []
  const f = respondWith(200, { ok: true }, log)
  const first = api.attachConfirmRemove("fb_1", "k", removeHooks(calls), f)
  expect(api.attachConfirmRemove("fb_1", "k", removeHooks(calls), f)).toBeNull()
  await first
  expect(log.length).toBe(1)
})
test("a failed delete restores the attachment (state cleared) and reports the server's message / a network error", async () => {
  const { api, win } = make(); const calls: any = { change: 0, removed: [], removeFail: [] }
  await api.attachConfirmRemove("fb_1", "k", removeHooks(calls), respondWith(404, { error: "Attachment not found." }, []))
  await api.attachConfirmRemove("fb_1", "k2", removeHooks(calls), () => Promise.reject(new Error("net")))
  await api.attachConfirmRemove("fb_1", "k3", removeHooks(calls), respondWith(500, {}, []))
  expect(calls.removeFail).toEqual(["Attachment not found.", "Network error — check your connection and retry.", "Couldn't remove the attachment (HTTP 500)"])
  expect(calls.removed).toEqual([]); expect(api.attachRemoveState("fb_1", "k")).toBe(""); expect(win.__klavMutating).toBe(0)
})
test("the removed attachment disappears from every in-memory copy (overview list, board cache, open panel); others are untouched", () => {
  const { api } = make()
  const mk = () => ({ id: "fb_1", attachments: [{ key: "a" }, { key: "b" }] }), inList = mk(), inBoard = mk(), panel = mk(), other = { id: "fb_2", attachments: [{ key: "a" }] }
  api.setLists({ tickets: [inList, other] }, [inBoard]); api._attachCtx.set("fb_1", { detailEl: {}, t: panel })
  api._attachRemoveFromLists("fb_1", "a")
  for (const x of [inList, inBoard, panel]) expect(x.attachments.map((a: any) => a.key)).toEqual(["b"])
  expect(other.attachments.length).toBe(1)
})

// ── cancel an upload that is still being sent ────────────────────────────────────────────────────────────────────────
test("Cancel aborts the request, drops the tiles quietly (no error tile, no failure) and releases the guard", () => {
  const { api, calls, hooks, win } = make()
  const cancelled: any[] = []; (hooks as any).onCancelled = (id: string, n: number) => cancelled.push([id, n])
  api.attachStartUpload("fb_1", [F("a.png"), F("b.png", 2000)], hooks)
  FakeXHR.all[0].progress(100, 1000)
  const id = api.attachUploadsFor("fb_1")[0].id
  expect(api.buildAttachmentsHtml({ id: "fb_1", attachments: [] })).toContain("data-attach-cancel")
  expect(api.attachCancelUpload("fb_1", id)).toBe(true)
  expect(FakeXHR.all[0].aborted).toBe(true)
  expect(api.attachUploadsFor("fb_1")).toEqual([]); expect(api.attachInFlight("fb_1")).toBe(false)
  expect(cancelled).toEqual([["fb_1", 2]]); expect(calls.fail).toEqual([]); expect(calls.done).toEqual([])
  expect(win.__klavMutating).toBe(0)
})
test("once every byte is sent ('Saving…') the upload can no longer be cancelled — and has no Cancel button", () => {
  const { api, hooks } = make()
  api.attachStartUpload("fb_1", [F("a.png")], hooks)
  FakeXHR.all[0].sent()
  const id = api.attachUploadsFor("fb_1")[0].id
  expect(api.buildAttachmentsHtml({ id: "fb_1", attachments: [] })).not.toContain("data-attach-cancel")
  expect(api.attachCancelUpload("fb_1", id)).toBe(false)
  expect(FakeXHR.all[0].aborted).toBe(false)
})
test("an abort the browser initiates (not the user's Cancel) is still reported as a failed upload", () => {
  const { api, calls, hooks } = make()
  api.attachStartUpload("fb_1", [F("a.png")], hooks)
  FakeXHR.all[0].onabort()
  expect(calls.fail).toEqual(["Upload cancelled."]); expect(api.attachUploadsFor("fb_1")[0].status).toBe("error")
})

// ── wiring pins ───────────────────────────────────────────────────────────────────────────────────────────────────────
test("wiring: × / Remove / Cancel are handled by the delegated click handler (survives re-renders) and toasts confirm the result", () => {
  const wire = extractFn(HTML, "function wireAttachments(")
  for (const frag of ['"[data-attach-remove]"', '"[data-attach-remove-yes]"', '"[data-attach-remove-no]"', '"[data-attach-cancel]"', "attachConfirmRemove(id,", "attachCancelUpload(id,"])
    expect(wire).toContain(frag)
  const hooks = HTML.slice(HTML.indexOf("const _attachHooks = {"), HTML.indexOf("const _attachHooks = {") + 2400)
  expect(hooks).toContain('attachToast("Attachment removed", "ok")'); expect(hooks).toContain("onRemoveFail"); expect(hooks).toContain("Upload cancelled")
  expect(extractFn(HTML, "function attachConfirmRemove(")).not.toContain("confirm(")      // no native confirm()
})
test("the activity timeline labels attachment added / removed", () => {
  expect(HTML).toContain("ticket_attachment_removed: (m) => \"Removed an attachment\"")
  expect(HTML).toContain("ticket_attachment_added: (m) =>")
})
