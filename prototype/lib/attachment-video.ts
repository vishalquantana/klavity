// KLA-560 item 6: shared, pure video-classification for the /api/feedback "Attach file" path, mirroring
// the client predicate (packages/core/src/modal.ts isVideoFile / videoContentType). The server keys its
// 100MB video cap (vs the 8MB doc cap) off this so client and server AGREE on what counts as a video —
// including a browser that reports an empty file.type for a .mov (classified by extension as a fallback).

// Derive a concrete video/* content-type from a filename extension. Returns "" for a non-video/unknown
// extension. Kept in lockstep with packages/core/src/modal.ts videoContentType.
export function videoMimeFromName(name: string): string {
  const ext = /\.([a-z0-9]+)$/i.exec(name || "")?.[1]?.toLowerCase()
  switch (ext) {
    case "mp4": case "m4v": return "video/mp4"
    case "mov": return "video/quicktime"
    case "webm": return "video/webm"
    case "avi": return "video/x-msvideo"
    case "mkv": return "video/x-matroska"
    case "ogv": return "video/ogg"
    case "3gp": return "video/3gpp"
    default: return ""
  }
}

// True when an attachment should get the video (100MB) cap: a video/* content-type, OR — when the
// reported type is empty/generic (application/octet-stream) — a known video filename extension. The
// extension fallback is TIGHTENED, not loosened: a present non-generic type (e.g. a spoofed "text/plain")
// never earns the video tier off its extension; only an absent/generic type falls back to the filename.
export function isVideoAttachment(type: string | undefined, name: string | undefined): boolean {
  if (/^video\//i.test(type || "")) return true
  const generic = !type || type === "application/octet-stream"
  return generic && !!videoMimeFromName(name || "")
}
