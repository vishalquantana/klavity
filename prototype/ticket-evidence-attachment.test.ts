import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const TICKET_HTML = readFileSync(join(import.meta.dir, "public", "ticket.html"), "utf8").replace(/\r\n/g, "\n")
const SERVER_TS = readFileSync(join(import.meta.dir, "server.ts"), "utf8").replace(/\r\n/g, "\n")

function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}

test("buildTktDetail checks both screenshotId and attachments for screenshot display", () => {
  const fn = extractFn(HTML, "function buildTktDetail(t, admin, onChange, isSingle = false)")
  expect(fn).toContain("const _firstImgAtt = !t.screenshotId && Array.isArray(t.attachments)")
  expect(fn).toContain("const _hasShot = !!t.screenshotId || !!_firstImgAtt")
  expect(fn).toContain('data-shot-url="${esc(_firstImgAtt.url)}"')
  expect(fn).toContain('${_hasShot ? _shotHtml : \'<div class="t3-noshot">No screenshot on this report.</div>\'}')
})

test("buildEvidenceStrip includes attached image evidence alongside or in place of primary screenshot", () => {
  const fn = extractFn(HTML, "function buildEvidenceStrip(")
  expect(fn).toContain('attachKind(a) === "image"')
  expect(fn).toContain('items.push({ kind: "attach_img"')
  expect(fn).toContain('box.setAttribute("data-shot-url", it.att.url)')
})

test("loadTktShot supports data-shot-url for attached screenshots", () => {
  const fn = extractFn(HTML, "async function loadTktShot(")
  expect(fn).toContain('const shotUrl = box.getAttribute("data-shot-url")')
  expect(fn).toContain('if (shotUrl)')
  expect(fn).toContain('paint(shotUrl)')
})

test("wireAttachments triggers single ticket re-render when attachment is uploaded", () => {
  const fn = extractFn(HTML, "function wireAttachments(")
  expect(fn).toContain('_renderSingleTicket(ticketId)')
})

test("ticket.html standalone page displays attached screenshot evidence when screenshotId is absent", () => {
  expect(TICKET_HTML).toContain("var imgAtt = (Array.isArray(t.attachments) ? t.attachments : []).find")
  expect(TICKET_HTML).toContain('$("shotWrap").classList.remove("hide")')
  expect(TICKET_HTML).toContain('img.src = imgAtt.url')
})

test("server /api/t/:ref resolves screenshotUrl from image attachments when screenshotId is absent", () => {
  expect(SERVER_TS).toContain("const imgAtt = fbRow.attachments.find")
  expect(SERVER_TS).toContain("presignGet(String(imgAtt.key), 3600)")
})
