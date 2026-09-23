// KD-163: the dashboard plays recordings/videos from PRESIGNED object-storage URLs (a different origin than
// the app), but the CSP's `media-src` only allowed 'self' blob: data:, so Chrome blocked every recording
// ("couldn't play here — download it to view"). img-src/connect-src already allow https:; media-src was the
// odd one out. Allow exactly the storage endpoint's ORIGIN (not a blanket https:) so it works for both a
// production S3/R2 host and the local MinIO (http://localhost:9000).
export function mediaSrcDirective(s3Endpoint?: string | null): string {
  const base = ["'self'", "blob:", "data:"]
  const raw = String(s3Endpoint || "").trim()
  if (raw) {
    try {
      const u = new URL(raw)
      if (u.protocol === "https:" || u.protocol === "http:") base.push(u.origin)
    } catch { /* malformed endpoint → keep the strict default */ }
  }
  return "media-src " + base.join(" ")
}
