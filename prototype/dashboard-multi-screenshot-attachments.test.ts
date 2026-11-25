// Multi-capture tickets: a report with a full-page shot + picked element + selected region must show EVERY screenshot in the
// ticket's Attachments section (it used to show only the first, labelled "Screenshot"). The list is built once
// (ticketAttachList) and shared by the render and every tile/download click handler, so indices stay aligned.
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
const shotProxyUrl = (id: string) => "/api/screenshots/" + encodeURIComponent(String(id)) + "?proxy=1"
const ticketAttachList = new Function("shotProxyUrl", extractFn(HTML, "function ticketAttachList(") + "; return ticketAttachList")(shotProxyUrl)

test("primary + extra screenshots come first, in capture order, then file attachments", () => {
  const list = ticketAttachList({
    screenshotId: "shot_1", extraScreenshotIds: ["shot_2", "shot_3"],
    attachments: [{ key: "k/doc.pdf", filename: "doc.pdf", contentType: "application/pdf" }],
  })
  expect(list.map((a: any) => a.filename)).toEqual(["Screenshot", "Screenshot 2", "Screenshot 3", "doc.pdf"])
  expect(list[1].url).toBe("/api/screenshots/shot_2?proxy=1")
  expect(list[1].contentType).toBe("image/png")
  expect(list[1].isPrimaryScreenshot).toBeUndefined() // not removable via the KD-214 primary-screenshot path
})

test("single-shot and older tickets are unchanged", () => {
  expect(ticketAttachList({ screenshotId: "shot_1" }).map((a: any) => a.filename)).toEqual(["Screenshot"])
  expect(ticketAttachList({ screenshotId: null, attachments: [] })).toEqual([])
})

test("an extra screenshot already present as an attachment (e.g. after a merge) is not duplicated", () => {
  const list = ticketAttachList({ screenshotId: "shot_1", extraScreenshotIds: ["shot_2"], attachments: [{ screenshotId: "shot_2", filename: "merged.png", contentType: "image/png", url: "/x" }] })
  expect(list.map((a: any) => a.filename)).toEqual(["Screenshot", "merged.png"])
})

test("the render and every click handler use the same list builder", () => {
  expect(extractFn(HTML, "function buildAttachmentsHtml(")).toContain("var atts = ticketAttachList(t)")
  const wire = extractFn(HTML, "function wireAttachments(")
  expect(wire.split("var atts = ticketAttachList(t)").length - 1).toBe(3) // tile click, tile download, list-item click
})
