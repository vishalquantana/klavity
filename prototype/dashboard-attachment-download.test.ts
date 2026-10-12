import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const SERVER_TS = readFileSync(join(import.meta.dir, "server.ts"), "utf8").replace(/\r\n/g, "\n")

function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}

test("server.ts implements GET /api/feedback/:id/attachments for attachment downloads", () => {
  expect(SERVER_TS).toContain('if (req.method === "GET" && isAttachments)')
  expect(SERVER_TS).toContain("getObjectStream(found.key)")
  expect(SERVER_TS).toContain('"content-disposition": cd')
})

test("server.ts supports ?download=1 on /api/screenshots/:id", () => {
  expect(SERVER_TS).toContain('const isDownload = url.searchParams.get("download") === "1"')
  expect(SERVER_TS).toContain('headers["content-disposition"] = `attachment; filename="${fname}')
})

test("dashboard.html defines triggerAttachmentDownload helper", () => {
  expect(HTML).toContain("function triggerAttachmentDownload(url, filename, key, ticketId, screenshotId)")
  expect(HTML).toContain('"/api/screenshots/" + encodeURIComponent(String(screenshotId)) + "?download=1"')
  expect(HTML).toContain('"/api/feedback/" + encodeURIComponent(String(ticketId)) + "/attachments?key=" + encodeURIComponent(String(key)) + "&download=1"')
  expect(HTML).toContain("a.download = safeName")
})

test("openMediaPreview includes a Download button in tools for the Issue Preview screen", () => {
  const openPv = extractFn(HTML, "function openMediaPreview(")
  expect(openPv).toContain("media-pv-btn")
  expect(openPv).toContain("Download")
  expect(openPv).toContain("triggerAttachmentDownload(o.openUrl || o.url, o.name, o.key, o.ticketId, o.screenshotId)")
})

test("buildAttachmentsHtml renders download buttons for both previewable tiles and attachment items", () => {
  const buildHtml = extractFn(HTML, "function buildAttachmentsHtml(")
  expect(buildHtml).toContain('data-tile-dl="')
  expect(buildHtml).toContain('class="tkt-attach-dl-btn"')
  expect(buildHtml).toContain('class="tkt-attach-item"')
  expect(buildHtml).toContain('download="')
  expect(buildHtml).toContain('class="tkt-attach-dl-ico"')
})

test("wireAttachments wires click events for both tile and row download icons", () => {
  const wire = extractFn(HTML, "function wireAttachments(")
  expect(wire).toContain('wrap.querySelectorAll("[data-tile-dl]")')
  expect(wire).toContain('wrap.querySelectorAll(".tkt-attach-item[data-idx]")')
  expect(wire).toContain("triggerAttachmentDownload(a.url, a.filename ||")
  expect(wire).toContain("openMediaPreview({ url: a.url, items: prevItems, index: foundIdx, name: String(a.filename || \"attachment\"), kind: attachKind(a), openUrl: a.url, annotations: a.annotations || (a.isPrimaryScreenshot ? t.annotations : null), ticketId: ticketId, key: a.key, screenshotId: a.screenshotId })")
})
