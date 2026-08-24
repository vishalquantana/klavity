// KLA-560 item 6: the server's video-vs-doc attachment classification must AGREE with the client and
// give a video/-by-extension-only file (empty browser MIME) the 100MB cap, not the 8MB doc cap — while
// staying tightened so a present non-video type never earns the video tier off its extension.
import { test, expect } from "bun:test"
import { videoMimeFromName, isVideoAttachment } from "./attachment-video"

test("videoMimeFromName derives a concrete video/* type from a known extension", () => {
  expect(videoMimeFromName("screen.mov")).toBe("video/quicktime")
  expect(videoMimeFromName("clip.MP4")).toBe("video/mp4")
  expect(videoMimeFromName("rec.webm")).toBe("video/webm")
  expect(videoMimeFromName("movie.mkv")).toBe("video/x-matroska")
  expect(videoMimeFromName("notes.pdf")).toBe("")
  expect(videoMimeFromName("noext")).toBe("")
})

test("empty-MIME .mov is classified as video by extension (the client/server agreement fix)", () => {
  expect(isVideoAttachment("", "screen.mov")).toBe(true)
  expect(isVideoAttachment(undefined, "screen.mov")).toBe(true)
  // generic octet-stream also falls back to the extension
  expect(isVideoAttachment("application/octet-stream", "screen.mov")).toBe(true)
})

test("a concrete video/* content-type is always video (extension irrelevant)", () => {
  expect(isVideoAttachment("video/mp4", "clip.mp4")).toBe(true)
  expect(isVideoAttachment("VIDEO/WEBM", "x")).toBe(true) // case-insensitive
})

test("non-video attachments keep the 8MB doc tier (fallback not loosened)", () => {
  expect(isVideoAttachment("application/octet-stream", "notes.pdf")).toBe(false)
  expect(isVideoAttachment("", "app.log")).toBe(false)
  expect(isVideoAttachment("application/pdf", "invoice.pdf")).toBe(false)
})

test("a present, NON-generic type never earns the video tier off its extension (tightened)", () => {
  // a spoofed text/plain on a .mov filename does NOT unlock the 100MB cap via the extension fallback
  expect(isVideoAttachment("text/plain", "screen.mov")).toBe(false)
})
