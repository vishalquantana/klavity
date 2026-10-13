// KD-217: a ticket comment can carry images and videos. The composer has an Attach button (and takes pasted / dropped files), shows
// the picked files as removable chips, and sends them as multipart with the text; posted comments show image thumbnails (click →
// the media preview) and inline video players.
import { expect, test } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
function extractFn(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const esc = (x: any) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const commentAttsHtml = new Function("esc", extractFn(HTML, "function commentAttsHtml(") + "; return commentAttsHtml")(esc) as (a: any) => string

test("no attachments (or none with a link yet) renders nothing", () => {
  expect(commentAttsHtml(undefined)).toBe("")
  expect(commentAttsHtml([])).toBe("")
  expect(commentAttsHtml([{ filename: "x.png", contentType: "image/png" }])).toBe("")        // no signed url → nothing to show
})
test("images render as a clickable thumbnail button, videos as an inline player; indexes follow the shown list", () => {
  const html = commentAttsHtml([
    { filename: "a.png", contentType: "image/png", url: "https://s3/a.png" },
    { filename: "clip.mp4", contentType: "video/mp4", url: "https://s3/clip.mp4" },
    { filename: "b.jpg", contentType: "image/jpeg", url: "https://s3/b.jpg" },
  ])
  expect(html).toContain('<button type="button" class="tkt-cmt-att-img" data-i="0" title="a.png"><img src="https://s3/a.png"')
  expect(html).toContain('<video class="tkt-cmt-att-vid" src="https://s3/clip.mp4" controls')
  expect(html).toContain('data-i="2" title="b.jpg"')
})
test("file names and links are escaped", () => {
  const html = commentAttsHtml([{ filename: '"><script>x</script>.png', contentType: "image/png", url: 'https://s3/a.png?x="y' }])
  expect(html).not.toContain("<script>")
  expect(html).toContain("&quot;&gt;&lt;script&gt;")
})
test("a posted comment shows its attachments under the text and images open in the media preview", () => {
  expect(HTML).toContain("${commentAttsHtml(item.attachments)}")
  expect(HTML).toContain('el.querySelectorAll(".tkt-cmt-att-img").forEach(')
  expect(HTML).toContain('openMediaPreview({ url: a.url, name: String(a.filename || "attachment"), kind: "image", openUrl: a.url })')
  expect(HTML).toContain(".tkt-cmt-body:empty {")                                   // an attachments-only comment has no empty text gap
})
test("the composer has an Attach button, a hidden file input limited to images / videos, and a chips row", () => {
  expect(HTML).toContain('class="btn btn-ghost btn-sm tkt-cmt-attach"')
  expect(HTML).toContain('<input type="file" class="tkt-cmt-file" accept="image/*,video/*" multiple hidden>')
  expect(HTML).toContain('<div class="tkt-cmt-chips hide"></div>')
})
test("files can be added by picker, paste and drop; limits reuse the ticket attachment limits", () => {
  const fn = HTML.slice(HTML.indexOf("function addPending(list)"), HTML.indexOf("function addPending(list)") + 1500)
  expect(fn).toContain("ATTACH_MAX_FILES"); expect(fn).toContain("ATTACH_IMG_MAX"); expect(fn).toContain("ATTACH_VIDEO_MAX"); expect(fn).toContain("ATTACH_TOTAL_MAX")
  expect(fn).toContain("is not an image or video")
  expect(HTML).toContain('ta.addEventListener("paste"')
  expect(HTML).toContain('cmtForm.addEventListener("drop"')
  expect(HTML).toContain('fileInp.addEventListener("change", () => { addPending(fileInp.files); fileInp.value = "" })')
})
test("posting: text-only stays JSON; with files it is multipart (body + files); an attachments-only comment can be sent", () => {
  expect(HTML).toContain("if (!text && !pendingFiles.length) return")
  expect(HTML).toContain('const fd = new FormData(); fd.set("body", text); pendingFiles.forEach(f => fd.append("files", f))')
  expect(HTML).toContain('reqInit = { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body: text }) }')
  expect(HTML).toContain("attachments: c.attachments || [],")                         // the optimistic local copy keeps them
})

test("picked files show a preview card (thumbnail for images, first frame for videos) that can be enlarged, with a remove button; preview URLs are released", () => {
  const paint = HTML.slice(HTML.indexOf("function paintChips()"), HTML.indexOf("function paintChips()") + 1300)
  expect(paint).toContain('<img class="th" src="')
  expect(paint).toContain('<video class="th" src="')
  expect(paint).toContain('class="tkt-cmt-chip tkt-cmt-chip-p"')
  expect(paint).toContain('data-pv="')
  expect(paint).toContain('class="rm" data-rm="')
  expect(HTML).toContain("URL.createObjectURL(f)")
  expect(HTML).toContain("URL.revokeObjectURL(u)")                                     // freed when the file is removed / posted / cancelled
  expect(HTML).toContain('openMediaPreview({ url: chipUrl(f), name: f.name, kind: /^video\\//i.test(f.type || "") ? "video" : "image" })')
})
