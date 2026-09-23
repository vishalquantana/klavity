// KD-163: recordings download through a same-origin, member-gated route that sets Content-Disposition:
// attachment. The old link pointed at the cross-origin presigned URL, where the `download` attribute is
// ignored (the browser just navigated to the raw storage object).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")
const server = readFileSync(join(import.meta.dir, "server.ts"), "utf8")

test("the recording Download link targets the same-origin download route", () => {
  const start = html.indexOf("function buildRecordingsHtml(")
  const fn = html.slice(start, start + 3200)
  expect(fn).toContain("/api/feedback/")
  expect(fn).toContain("/recordings/")
  expect(fn).toContain("/download")
})

test("the server exposes GET /api/feedback/:id/recordings/:recId/download as an attachment, member-gated via fbRow", () => {
  expect(server).toContain('const isRecordingDownload = feedbackSubroute === "/recordings-download"')
  const i = server.indexOf("if (req.method === \"GET\" && isRecordingDownload && recordingIdParam)")
  expect(i).toBeGreaterThan(0)
  const block = server.slice(i, i + 1600)
  expect(block).toContain("attachment; filename=")
  expect(block).toContain("getObjectStream(")
  // only a recording that belongs to THIS ticket is served
  expect(block).toContain("fbRow.recordings")
})

test("the CSP media-src allows the storage origin (recordings play from presigned URLs)", () => {
  expect(server).toContain("mediaSrcDirective(process.env.S3_ENDPOINT)")
})
