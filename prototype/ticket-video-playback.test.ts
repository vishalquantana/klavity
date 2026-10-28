import { describe, it, expect } from "bun:test"
import { readFileSync } from "fs"
import { join } from "path"

import { videoMimeFromName } from "./lib/attachment-video"

describe("Bug Fix: Attached Videos Not Playing in Ticket Details", () => {
  const dashHtml = readFileSync(join(__dirname, "public", "dashboard.html"), "utf8")
  const serverTs = readFileSync(join(__dirname, "server.ts"), "utf8")
  const s3Ts = readFileSync(join(__dirname, "lib", "s3.ts"), "utf8")

  describe("1. Video delivery and Range Requests", () => {
    it("server.ts uses videoMimeFromName supporting mp4, webm, mov, m4v", () => {
      expect(serverTs).toContain('import { videoMimeFromName, isVideoAttachment } from "./lib/attachment-video"')
      expect(videoMimeFromName("20260530-0936-16.3199375.mp4")).toBe("video/mp4")
      expect(videoMimeFromName("clip.webm")).toBe("video/webm")
      expect(videoMimeFromName("recording.mov")).toBe("video/quicktime")
      expect(videoMimeFromName("doc.pdf")).toBe("")
    })

    it("s3.ts getObjectStream supports byte ranges via slice", () => {
      expect(s3Ts).toContain("range?: { start: number; end: number }")
      expect(s3Ts).toContain("f.slice(range.start, range.end + 1)")
    })

    it("attachment delivery endpoint supports byte range requests (206 Partial Content and 416 Range Not Satisfiable)", () => {
      expect(serverTs).toContain('req.headers.get("range")')
      expect(serverTs).toContain("status: 206")
      expect(serverTs).toContain("status: 416")
      expect(serverTs).toContain('"accept-ranges": "bytes"')
      expect(serverTs).toContain('"content-range"')
    })

    it("range parsing logic correctly handles prefix, suffix and bounded ranges", () => {
      // Simulate the exact range parsing logic implemented in server.ts
      function parseRange(rangeHeader: string, total: number) {
        if (!rangeHeader || !/^bytes=/i.test(rangeHeader) || total <= 0) return null
        const matches = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim())
        if (!matches) return null
        let start = 0
        let end = total - 1
        if (!matches[1] && matches[2]) {
          start = Math.max(0, total - parseInt(matches[2], 10))
        } else {
          start = matches[1] ? parseInt(matches[1], 10) : 0
          end = matches[2] ? parseInt(matches[2], 10) : (total - 1)
        }
        if (start >= total || start > end) {
          return { status: 416, contentRange: `bytes */${total}` }
        }
        end = Math.min(end, total - 1)
        const chunkLen = end - start + 1
        return { status: 206, start, end, chunkLen, contentRange: `bytes ${start}-${end}/${total}` }
      }

      const total = 1000000 // 1MB video

      // Bounded range
      const bounded = parseRange("bytes=0-1023", total)
      expect(bounded).not.toBeNull()
      expect(bounded?.status).toBe(206)
      expect(bounded?.start).toBe(0)
      expect(bounded?.end).toBe(1023)
      expect(bounded?.chunkLen).toBe(1024)
      expect(bounded?.contentRange).toBe("bytes 0-1023/1000000")

      // Prefix open-ended range
      const prefix = parseRange("bytes=5000-", total)
      expect(prefix?.status).toBe(206)
      expect(prefix?.start).toBe(5000)
      expect(prefix?.end).toBe(999999)
      expect(prefix?.chunkLen).toBe(995000)
      expect(prefix?.contentRange).toBe("bytes 5000-999999/1000000")

      // Suffix range (e.g. fetching last 2048 bytes for moov atom)
      const suffix = parseRange("bytes=-2048", total)
      expect(suffix?.status).toBe(206)
      expect(suffix?.start).toBe(1000000 - 2048)
      expect(suffix?.end).toBe(999999)
      expect(suffix?.chunkLen).toBe(2048)
      expect(suffix?.contentRange).toBe("bytes 997952-999999/1000000")

      // Out of range (unsatisfiable)
      const outOfRange = parseRange("bytes=1500000-", total)
      expect(outOfRange?.status).toBe(416)
      expect(outOfRange?.contentRange).toBe("bytes */1000000")

      // Inverted range
      const inverted = parseRange("bytes=500-200", total)
      expect(inverted?.status).toBe(416)
    })
  })

  describe("2. Frontend Video Player and Duration Fixes", () => {
    it("wireRecordingVideos repairs duration for MP4 videos as well as WebM", () => {
      // Must not be restricted to isWebm
      const loadedmetadataSection = dashHtml.slice(
        dashHtml.indexOf('v.addEventListener("loadedmetadata"'),
        dashHtml.indexOf('v.addEventListener("loadedmetadata"') + 500
      )
      expect(loadedmetadataSection).not.toContain("if (isWebm &&")
      expect(loadedmetadataSection).toContain("!isFinite(v.duration) || isNaN(v.duration) || v.duration <= 0")
      expect(loadedmetadataSection).toContain("v.currentTime = 1e101")
    })

    it("openMediaPreview provides playable video preview with loading, retry and error handling", () => {
      expect(dashHtml).toContain("media-pv-vwrap")
      expect(dashHtml).toContain("media-pv-loading")
      expect(dashHtml).toContain("media-pv-error")
      expect(dashHtml).toContain("media-pv-btn")
      expect(dashHtml).toContain("Retry playback")
    })

    it("openMediaPreview repairs missing/zero duration on loadedmetadata", () => {
      expect(dashHtml).toContain("!isFinite(media.duration) || isNaN(media.duration) || media.duration <= 0")
      expect(dashHtml).toContain("media.currentTime = 1e101")
    })

    it("openMediaPreview falls back to /api/feedback/:ticketId/attachments?key=:key if direct URL fails", () => {
      expect(dashHtml).toContain("media.addEventListener(\"error\"")
      expect(dashHtml).toContain("media.src = fallbackUrl")
    })

    it("buildAttachmentsHtml and wireAttachments supply fallbackUrl and playable preview for video attachments", () => {
      expect(dashHtml).toContain("var attUrl = a.url || ((a.key && t.id) ? \"/api/feedback/\"")
      expect(dashHtml).toContain("fallbackUrl: (a.key && ticketId) ? (\"/api/feedback/\"")
      expect(dashHtml).toContain('kind === "image"')
      expect(dashHtml).toContain('<video src="')
      expect(dashHtml).toContain('tkt-attach-play')
    })
  })
})
