// KD-100: file attachments on the "New ticket" dialog. The real helpers are extracted from public/dashboard.html and
// run in a sandbox (pure file filtering, the upload call, the expand toggle) + source pins for the wiring that needs a
// full DOM (markup ids, create→upload ordering inside the double-submit/poll-pause window, close/open cleanup).
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

const MB = 1024 * 1024
const file = (name: string, type: string, size: number, lastModified = 1) => ({ name, type, size, lastModified }) as any

const SRC = [
  extractFn(HTML, "function _attachFmtBytes("),
  line(/^\s*const NEW_TKT_MAX_FILES = .*$/m), line(/^\s*const NEW_TKT_IMG_MAX = .*$/m), line(/^\s*const NEW_TKT_VIDEO_MAX = .*$/m), line(/^\s*const NEW_TKT_TOTAL_MAX = .*$/m),
  extractFn(HTML, "function newTktFilterFiles("),
  extractFn(HTML, "async function uploadNewTicketAttachments("),
].join("\n")
const mk = (fetchImpl: any = async () => null) =>
  new Function("fetch", "FormData", SRC + "\nreturn { newTktFilterFiles, uploadNewTicketAttachments }")(fetchImpl, FormData) as {
    newTktFilterFiles: (cur: any[], inc: any[]) => { files: any[]; rejected: string[] }
    uploadNewTicketAttachments: (id: string, files: any[]) => Promise<{ ok: boolean; error?: string }>
  }

test("images and videos are accepted; other types are rejected with a reason", () => {
  const { newTktFilterFiles } = mk()
  const r = newTktFilterFiles([], [file("a.png", "image/png", MB), file("b.mp4", "video/mp4", 5 * MB), file("c.pdf", "application/pdf", MB), file("d.txt", "", MB)])
  expect(r.files.map(f => f.name)).toEqual(["a.png", "b.mp4"])
  expect(r.rejected.length).toBe(2)
  expect(r.rejected[0]).toContain("c.pdf")
})

test("at most 5 files in total — the extras are rejected, not silently dropped", () => {
  const { newTktFilterFiles } = mk()
  const six = Array.from({ length: 6 }, (_, i) => file("p" + i + ".png", "image/png", MB, i))
  const r = newTktFilterFiles([], six)
  expect(r.files.length).toBe(5)
  expect(r.rejected).toEqual(["p5.png: you can attach up to 5 files"])
  // adding more later respects what is already held
  const r2 = newTktFilterFiles(r.files, [file("late.png", "image/png", MB, 99)])
  expect(r2.files.length).toBe(5)
  expect(r2.rejected.length).toBe(1)
})

test("per-file caps: image 8MB, video 100MB (exact cap is allowed, one byte over is not)", () => {
  const { newTktFilterFiles } = mk()
  expect(newTktFilterFiles([], [file("ok.png", "image/png", 8 * MB)]).files.length).toBe(1)
  expect(newTktFilterFiles([], [file("big.png", "image/png", 8 * MB + 1)]).rejected[0]).toContain("larger than 8.0 MB")
  expect(newTktFilterFiles([], [file("ok.mp4", "video/mp4", 100 * MB)]).files.length).toBe(1)
  expect(newTktFilterFiles([], [file("big.mp4", "video/mp4", 100 * MB + 1)]).rejected[0]).toContain("larger than 100.0 MB")
})

test("total cap 120MB across files", () => {
  const { newTktFilterFiles } = mk()
  const r = newTktFilterFiles([], [file("a.mp4", "video/mp4", 100 * MB, 1), file("b.mp4", "video/mp4", 30 * MB, 2), file("c.png", "image/png", 5 * MB, 3)])
  expect(r.files.map(f => f.name)).toEqual(["a.mp4", "c.png"])
  expect(r.rejected[0]).toContain("b.mp4: total would exceed 120.0 MB")
})

test("the same file added twice is ignored (no duplicate, no error); empty files are rejected", () => {
  const { newTktFilterFiles } = mk()
  const a = file("a.png", "image/png", MB, 7)
  const r = newTktFilterFiles([a], [file("a.png", "image/png", MB, 7), file("empty.png", "image/png", 0, 8)])
  expect(r.files).toEqual([a])
  expect(r.rejected).toEqual(["empty.png: file is empty"])
})

test("filtering never mutates the caller's current list", () => {
  const { newTktFilterFiles } = mk()
  const cur = [file("a.png", "image/png", MB)]
  newTktFilterFiles(cur, [file("b.png", "image/png", MB)])
  expect(cur.length).toBe(1)
})

test("upload: multipart POST to /api/feedback/<id>/attachments with every file under the `files` field", async () => {
  let seen: any = null
  const { uploadNewTicketAttachments } = mk(async (url: string, init: any) => { seen = { url, init }; return { ok: true, json: async () => ({ ok: true, attachments: [] }) } })
  const f1 = new File(["x"], "a.png", { type: "image/png" }), f2 = new File(["y"], "b.mp4", { type: "video/mp4" })
  expect(await uploadNewTicketAttachments("fb_1/../x", [f1, f2])).toEqual({ ok: true })
  expect(seen.url).toBe("/api/feedback/" + encodeURIComponent("fb_1/../x") + "/attachments")
  expect(seen.init.method).toBe("POST")
  expect((seen.init.body as FormData).getAll("files").map((f: any) => f.name)).toEqual(["a.png", "b.mp4"])
})

test("upload failures resolve { ok:false, error } and never throw (server error text / network error / bad body)", async () => {
  expect(await mk(async () => ({ ok: false, json: async () => ({ error: "File x exceeds 8.0 MB." }) })).uploadNewTicketAttachments("fb", [new File(["x"], "x.png")]))
    .toEqual({ ok: false, error: "File x exceeds 8.0 MB." })
  expect(await mk(async () => { throw new Error("net") }).uploadNewTicketAttachments("fb", [new File(["x"], "x.png")])).toEqual({ ok: false, error: "Upload failed." })
  expect(await mk(async () => ({ ok: true, json: async () => { throw new Error("bad json") } })).uploadNewTicketAttachments("fb", [new File(["x"], "x.png")])).toEqual({ ok: false, error: "Upload failed." })
})

// ── wiring pins ────────────────────────────────────────────────────────────────────────────────────────────────────
test("markup: picker accepts image/video only and is multiple; drop zone, preview grid, reporter line and Expand exist", () => {
  expect(HTML).toMatch(/<input type="file" id="newTktFileInp" accept="image\/\*,video\/\*" multiple hidden>/)
  for (const id of ["newTktDrop", "newTktFilesGrid", "newTktFilesMsg", "newTktFilesCount", "newTktAttachBtn", "newTktExpand", "newTktReporterInp", "newTktModal"])
    expect(HTML).toContain(`id="${id}"`)
  // the dialog is no longer pinned to the old fixed 540px
  expect(HTML).not.toContain('<div class="modal" style="max-width:540px">')
})

test("submit: attachments upload right after a successful create, INSIDE the try (double-submit guard + poll pause still held)", () => {
  const fn = extractFn(HTML, "async function submitNewTicket(")
  const iCreate = fn.indexOf("/tickets`"), iUpload = fn.indexOf("uploadNewTicketAttachments(created.ticketId, heldFiles)"), iFinally = fn.indexOf("} finally {")
  expect(iCreate).toBeGreaterThan(-1)
  expect(iUpload).toBeGreaterThan(iCreate)
  expect(iFinally).toBeGreaterThan(iUpload)
  expect(fn).toContain("if (r && r.ok && created.ticketId && heldFiles.length)")   // never uploads when the create failed
  expect(fn).toContain("window.__klavMutating++")
})

test("a failed upload warns that the ticket WAS created (never reports the whole create as failed)", () => {
  const fn = extractFn(HTML, "async function submitNewTicket(")
  expect(fn).toMatch(/if \(attachRes && !attachRes\.ok\) assignEmailWarnToast\("Ticket created, but the /)
  // the create-failure path (before the toast) still returns early and keeps the held files for a retry
  expect(fn.indexOf("if (!r || !r.ok)")).toBeLessThan(fn.indexOf("attachRes && !attachRes.ok"))
})

test("held files and preview object URLs are cleared when the dialog opens and when it closes", () => {
  expect(extractFn(HTML, "function openNewTicketModal(")).toContain("clearNewTktFiles()")
  expect(extractFn(HTML, "function closeNewTicketModal(")).toContain("clearNewTktFiles()")
  expect(extractFn(HTML, "function clearNewTktFiles(")).toContain("URL.revokeObjectURL")
  expect(extractFn(HTML, "function removeNewTktFile(")).toContain("URL.revokeObjectURL")
})

// ── Jira-style flow: paste screenshot, "Create another", Ctrl/Cmd+Enter, "KD-101 created" toast ─────────────────────
const FLOW = [
  extractFn(HTML, "function ticketKeyLabel("),
  extractFn(HTML, "function newTktImagesFromClipboard("),
  extractFn(HTML, "function newTicketCreatedLabel("),
].join("\n")
// A stub File: Bun mis-reports the name of `new File([file], name)` when it runs inside `new Function` (browsers are
// fine), so the renaming logic is exercised against a minimal File-shaped class instead.
class FakeFile { name: string; type: string; lastModified: number; constructor(public parts: any[], name: string, o: any = {}) { this.name = name; this.type = o.type || ""; this.lastModified = o.lastModified ?? 0 } }
const ff = (name: string, type: string, lastModified = 1) => ({ name, type, lastModified }) as any
const flow = new Function("File", FLOW + "\nreturn { newTktImagesFromClipboard, newTicketCreatedLabel }")(FakeFile) as {
  newTktImagesFromClipboard: (files: any) => any[]
  newTicketCreatedLabel: (lists: any[], id: string) => string
}

test("paste: clipboard images are picked up and the generic 'image.png' name is made unique; text/other files are ignored", () => {
  const a = ff("image.png", "image/png"), b = ff("image.png", "image/png")
  const out = flow.newTktImagesFromClipboard([a, b, ff("notes.txt", "text/plain")])
  expect(out.length).toBe(2)
  expect(out[0].name).not.toBe(out[1].name)
  expect(out.every(f => /^pasted-\d+-\d+\.png$/.test(f.name))).toBe(true)
  expect(out[0].type).toBe("image/png")
  expect(flow.newTktImagesFromClipboard([])).toEqual([])
  expect(flow.newTktImagesFromClipboard(null)).toEqual([])
})

test("paste: a real file name is kept; jpeg → .jpg when renaming", () => {
  const named = ff("screenshot-2026.png", "image/png")
  expect(flow.newTktImagesFromClipboard([named])[0]).toBe(named)
  const jpg = flow.newTktImagesFromClipboard([ff("image.jpeg", "image/jpeg")])[0]
  expect(jpg.name.endsWith(".jpg")).toBe(true)
})

test("created-toast label: 'KD-101' from the board list, then the dashboard list; '' when the ticket isn't loaded", () => {
  const board = [{ id: "fb_a", ticketKey: "KD", seqNum: 101 }], dash = [{ id: "fb_b", seqNum: 7 }]
  expect(flow.newTicketCreatedLabel([board, dash], "fb_a")).toBe("KD-101")
  expect(flow.newTicketCreatedLabel([board, dash], "fb_b")).toBe("#7")
  expect(flow.newTicketCreatedLabel([board, null], "fb_zzz")).toBe("")
  expect(flow.newTicketCreatedLabel([undefined as any], "fb_a")).toBe("")
})

test("Create another: checkbox exists, is reset on open, keeps the dialog open and clears only per-ticket fields", () => {
  expect(HTML).toContain('id="newTktAnother"')
  expect(extractFn(HTML, "function openNewTicketModal(")).toContain('getElementById("newTktAnother")')
  const submit = extractFn(HTML, "async function submitNewTicket(")
  expect(submit).toContain("if (createAnother) resetNewTicketForNext(); else closeNewTicketModal()")
  const reset = extractFn(HTML, "function resetNewTicketForNext(")
  expect(reset).toContain('"newTktTitleInp"')
  expect(reset).toContain('"newTktBodyInp"')
  expect(reset).toContain("clearNewTktFiles()")
  expect(reset).not.toContain("newTktPriInp")        // priority + assignee are kept for the batch
  expect(reset).not.toContain("newTktAssigneeInp")
})

test("success toast: shown after a successful create, but not stacked on the upload-failure warning", () => {
  const submit = extractFn(HTML, "async function submitNewTicket(")
  expect(submit).toContain("if (!(attachRes && !attachRes.ok) && created.ticketId) ticketCreatedToast(created.ticketId)")
  expect(submit.indexOf("ticketCreatedToast(")).toBeGreaterThan(submit.indexOf("if (!r || !r.ok)"))   // never on a failed create
  const toast = extractFn(HTML, "function ticketCreatedToast(")
  expect(toast).toContain("View ticket")
  expect(toast).toContain("openSingleTicket(ticketId)")
})

test("keyboard + paste wiring: Ctrl/Cmd+Enter submits (respecting the in-flight disabled state); image paste is intercepted only when images are present", () => {
  expect(HTML).toContain('newTktBg.addEventListener("keydown", function(e) {\n      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {')
  expect(HTML).toMatch(/if \(submitBtn && submitBtn\.disabled\) return\n\s+submitNewTicket\(\)\n\s+\}\n\s+\}\)/)
  const paste = HTML.slice(HTML.indexOf('newTktBg.addEventListener("paste"'), HTML.indexOf('newTktBg.addEventListener("keydown"'))
  expect(paste).toContain("if (!imgs.length) return")
  expect(paste.indexOf("if (!imgs.length) return")).toBeLessThan(paste.indexOf("e.preventDefault()"))
})

// ── Assignee dropdown: every user on the project ────────────────────────────────────────────────────────────────────
const assigneeEmails = new Function(extractFn(HTML, "function newTktAssigneeEmails(") + "\nreturn newTktAssigneeEmails")() as () => never as unknown as (m: any, me: any) => string[]

test("assignee list: every project member, current user first, de-duplicated, lower-cased and sorted", () => {
  const members = [{ email: "Zed@x.com" }, { email: "amy@x.com" }, { email: "me@x.com" }, { email: "AMY@x.com" }, { email: "" }, null, { email: "bob@x.com" }]
  expect(assigneeEmails(members, "Me@X.com")).toEqual(["me@x.com", "amy@x.com", "bob@x.com", "zed@x.com"])
})

test("assignee list: the current user is always offered even when not on the roster (e.g. implicit account admin); nothing loaded yet → just me", () => {
  expect(assigneeEmails([{ email: "amy@x.com" }], "owner@x.com")).toEqual(["owner@x.com", "amy@x.com"])
  expect(assigneeEmails(undefined, "owner@x.com")).toEqual(["owner@x.com"])
  expect(assigneeEmails([], "")).toEqual([])
})

test("assignee dropdown wiring: a <select> of project users only (no free-text email / 'Someone else'), submit still reads the hidden input", () => {
  expect(HTML).toContain('<select id="newTktAssigneeSel"')
  expect(HTML).toContain('<input id="newTktAssigneeInp" type="hidden">')   // value carrier only — not user-editable
  expect(HTML).not.toContain("Someone else")
  expect(HTML).not.toContain("NEW_TKT_ASSIGNEE_OTHER")
  const open = extractFn(HTML, "function openNewTicketModal(")
  expect(open).toContain("populateNewTktAssignees()")
  const pop = extractFn(HTML, "function populateNewTktAssignees(")
  expect(pop).toContain("newTktAssigneeEmails(state && state.members, me)")
  const sync = extractFn(HTML, "function syncNewTktAssignee(")
  expect(sync).toContain("inp.value = sel.value")            // the input the submit reads follows the dropdown
  expect(extractFn(HTML, "async function submitNewTicket(")).toContain('getElementById("newTktAssigneeInp")')
  expect(HTML).toContain('assigneeSel.addEventListener("change"')
})

// ── Attachment preview (images + videos) ────────────────────────────────────────────────────────────────────────────
const PV = [
  "const _attachUploads = new Map()",                      // KD-193: buildAttachmentsHtml also renders in-flight uploads from this registry
  "const _attachMsgs = new Map()", extractFn(HTML, "function attachMsgFor("),   // …and the inline note stored per ticket
  "const _attachRemoving = new Map()", extractFn(HTML, "function attachRemoveState("), extractFn(HTML, "function _attachRemoveUi("),   // …and the remove (×) UI
  extractFn(HTML, "function _attachFmtBytes("),
  extractFn(HTML, "function attachKind("),
  extractFn(HTML, "function attachUploadsFor("),
  extractFn(HTML, "function _attachTileHtml("),
  extractFn(HTML, "function buildAttachmentsHtml("),
].join("\n")
const esc = (x: any) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const pv = new Function("esc", "kicon", PV + "\nreturn { attachKind, buildAttachmentsHtml }")(esc, (n: string) => "<i data-k=" + n + "></i>") as {
  attachKind: (a: any) => string
  buildAttachmentsHtml: (t: any) => string
}

test("attachKind: content type first, then extension; anything else is not previewable", () => {
  expect(pv.attachKind({ contentType: "image/png" })).toBe("image")
  expect(pv.attachKind({ contentType: "video/mp4" })).toBe("video")
  expect(pv.attachKind({ contentType: "application/octet-stream", filename: "clip.MOV" })).toBe("video")
  expect(pv.attachKind({ filename: "shot.JPEG" })).toBe("image")
  expect(pv.attachKind({ contentType: "application/pdf", filename: "spec.pdf" })).toBe("")
  expect(pv.attachKind({ filename: "noext" })).toBe("")
  expect(pv.attachKind(null)).toBe("")
})

test("detail attachments: images and videos render as preview tiles, other files stay download rows, no double entry", () => {
  const html = pv.buildAttachmentsHtml({ attachments: [
    { filename: "a.png", contentType: "image/png", url: "https://s3/a.png", size: 10 },
    { filename: "b.mp4", contentType: "video/mp4", url: "https://s3/b.mp4", size: 20 },
    { filename: "spec.pdf", contentType: "application/pdf", url: "https://s3/spec.pdf", size: 30 },
  ] })
  expect((html.match(/class="tkt-attach-thumb"/g) || []).length).toBe(2)
  expect(html).toContain('<img src="https://s3/a.png"')
  expect(html).toContain('<video src="https://s3/b.mp4#t=0.1" preload="metadata" muted playsinline>')
  expect(html).toContain('class="tkt-attach-play"')                     // video tile has a play badge
  expect(html).toContain('data-idx="0"')
  expect(html).toContain('data-idx="1"')
  expect(html).toContain('class="tkt-attach-item" href="https://s3/spec.pdf"')   // pdf: plain link row
  expect((html.match(/class="tkt-attach-item"/g) || []).length).toBe(1)          // the previewable ones are NOT also listed as rows
  expect(html).toContain('<span class="tkt-attach-count">3</span>')
})

test("detail attachments: a previewable file with no URL (unavailable) stays a non-clickable row; names are HTML-escaped", () => {
  const html = pv.buildAttachmentsHtml({ attachments: [
    { filename: "gone.png", contentType: "image/png" },
    { filename: '<img src=x onerror=alert(1)>.png', contentType: "image/png", url: "https://s3/x.png" },
  ] })
  expect(html).toContain("tkt-attach-unavailable")
  expect(html).not.toContain("<img src=x")
  expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;.png")
})

test("viewer + wiring: shared viewer for both surfaces; Esc/backdrop/Close dismiss and a playing video is paused", () => {
  const open = extractFn(HTML, "function openMediaPreview(")
  expect(open).toContain('o.kind === "video" ? "video" : "img"')
  expect(open).toContain("media.controls = true")
  expect(open).toContain("nm.textContent = o.name")                     // never innerHTML for the name
  expect(extractFn(HTML, "function closeMediaPreview(")).toContain("v.pause()")
  expect(extractFn(HTML, "function _mediaPvKey(")).toContain('e.key === "Escape"')
  expect(extractFn(HTML, "function wireAttachments(")).toContain("openMediaPreview({ url: a.url")   // detail tiles
  expect(extractFn(HTML, "function renderNewTktFiles(")).toContain("openMediaPreview({ url, name: f.name")   // dialog files
  expect(extractFn(HTML, "function renderNewTktFiles(")).toContain("newtkt-play")                   // video badge in the dialog
})

test("Reporter: a read-only field below the Priority/Assignee row holding the logged-in user's email; the old header line is gone", () => {
  expect(HTML).not.toContain('id="newTktReporter"')                                  // the "Reporter: <email>" line under the title
  expect(HTML).not.toContain('"Reporter: " + state.email')
  expect(HTML).toMatch(/<input id="newTktReporterInp" type="email" readonly aria-readonly="true"/)
  // order in the markup: Priority → Assignee row, then Reporter, then Attachments
  const iPri = HTML.indexOf('id="newTktPriInp"'), iAsg = HTML.indexOf('id="newTktAssigneeSel"'), iRep = HTML.indexOf('id="newTktReporterInp"'), iAtt = HTML.indexOf('id="newTktAttach"')
  expect(iPri).toBeGreaterThan(-1)
  expect(iAsg).toBeGreaterThan(iPri)
  expect(iRep).toBeGreaterThan(iAsg)
  expect(iAtt).toBeGreaterThan(iRep)
  // filled from the logged-in user on every open
  expect(extractFn(HTML, "function openNewTicketModal(")).toContain("lockNewTktReporter()")
  const lock = extractFn(HTML, "function lockNewTktReporter(")
  expect(lock).toContain('getElementById("newTktReporterInp")')
  expect(lock).toContain("(state && state.email)")
})

test("Reporter tamper guard: DevTools edits (value, readonly removed, attribute changes) are re-forced to the signed-in email", () => {
  const listeners: Record<string, Function[]> = {}
  const attrs: Record<string, string> = { value: "me@x.com", "aria-readonly": "true" }
  const inp: any = {
    value: "me@x.com", readOnly: true,
    getAttribute: (k: string) => (k in attrs ? attrs[k] : null), setAttribute: (k: string, v: string) => { attrs[k] = v },
    addEventListener: (t: string, f: Function) => { (listeners[t] ||= []).push(f) },
  }
  let observerCb: Function = () => {}
  class FakeObserver { constructor(cb: Function) { observerCb = cb } observe() {} }
  const lock = new Function("document", "state", "MutationObserver", "let _newTktReporterObs = null\n" + extractFn(HTML, "function lockNewTktReporter(") + "\nreturn lockNewTktReporter")(
    { getElementById: (id: string) => (id === "newTktReporterInp" ? inp : null) }, { email: "me@x.com" }, FakeObserver) as () => void
  inp.value = "stale@x.com"; inp.readOnly = false; delete attrs["aria-readonly"]   // dialog was reopened after tampering
  lock()
  expect([inp.value, inp.readOnly, attrs["aria-readonly"]]).toEqual(["me@x.com", true, "true"])
  // 1) typing after removing readonly in DevTools → the input/change listeners restore it
  inp.readOnly = false; inp.value = "ceo@evil.test"; listeners["input"].forEach(f => f())
  expect([inp.value, inp.readOnly]).toEqual(["me@x.com", true])
  // 2) editing the value attribute / readonly / aria-readonly in the Elements panel → the MutationObserver restores it
  inp.value = "ceo@evil.test"; attrs["value"] = "ceo@evil.test"; inp.readOnly = false; attrs["aria-readonly"] = "false"; observerCb()
  expect([inp.value, attrs["value"], inp.readOnly, attrs["aria-readonly"]]).toEqual(["me@x.com", "me@x.com", true, "true"])
  // paste / drop are blocked; keydown is not (it would trap Tab)
  let prevented = 0; listeners["paste"].forEach(f => f({ preventDefault: () => prevented++ })); listeners["drop"].forEach(f => f({ preventDefault: () => prevented++ }))
  expect(prevented).toBe(2)
  expect(listeners["keydown"]).toBeUndefined()
  // the listeners are installed once, however often the dialog is reopened
  lock(); lock()
  expect(listeners["input"].length).toBe(1)
})

test("Reporter: re-asserted on open AND right before submit; the server (not the client) is the security boundary", () => {
  expect(extractFn(HTML, "function openNewTicketModal(")).toContain("lockNewTktReporter()")
  expect(extractFn(HTML, "async function submitNewTicket(")).toContain("lockNewTktReporter()")
  // the create request body never carries a reporter — the client cannot even send one by accident
  const submit = extractFn(HTML, "async function submitNewTicket(")
  const body = submit.slice(submit.indexOf("body: JSON.stringify({"), submit.indexOf("}).catch(() => null)"))
  expect(body).not.toMatch(/reporter/i)
})

test("viewer Close is a round × pinned to the overlay's top-right corner (not in the bottom bar)", () => {
  const open = extractFn(HTML, "function openMediaPreview(")
  expect(open).toContain('close.className = "media-pv-close"')
  expect(open).toContain("bg.appendChild(close)")                  // child of the overlay, not of the bottom bar
  expect(open).not.toContain("bar.appendChild(close)")
  expect(HTML).toMatch(/\.media-pv-close\{position:absolute;top:16px;right:20px;/)
})

test("Priority and Assignee captions are each ONE flex item (a bare text node + <span> stacked them and pushed Assignee down)", () => {
  expect(HTML).toContain('<span>Priority</span>\n        <select id="newTktPriInp"')
  expect(HTML).toContain('<span>Assignee <span style="color:var(--rose)">*</span></span>\n        <select id="newTktAssigneeSel"')
})

test("file names are rendered with textContent (never innerHTML) in the preview grid", () => {
  const fn = extractFn(HTML, "function renderNewTktFiles(")
  expect(fn).toContain("meta.textContent = f.name")
  expect(fn).not.toMatch(/innerHTML\s*=\s*[^"]*f\.name/)
})
