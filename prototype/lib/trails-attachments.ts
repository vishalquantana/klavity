// AutoSim file-upload fixtures. An `upload` trajectory step names a fixture; the trail carries a
// manifest (name → storage key + filename). Both the authoring drive and the runner re-fetch the
// bytes from S3 and materialize them to a temp file on the box running the browser, then hand the
// path to page.setInputFiles(). Downloads are cached per run and cleaned up when the run ends.
import { getObjectBytes } from "./s3"
import { tmpdir } from "os"
import { join } from "path"
import { mkdtemp, writeFile, rm } from "fs/promises"

export interface AttachmentRef {
  /** storage key in S3 */
  key: string
  /** original filename (with extension) — what the file input will see */
  filename: string
  contentType?: string
}
/** name → where the bytes live. Stored on the Trail so the runner can replay uploads. */
export type AttachmentManifest = Record<string, AttachmentRef>

/** Resolve a fixture NAME to local file paths for page.setInputFiles(). */
export type FileResolver = (name: string) => Promise<string[]>

/**
 * Build a FileResolver over a manifest. Materializes each referenced fixture to a temp file exactly
 * once (cached by name) and returns its path. Call the returned `cleanup()` in a finally block to
 * remove the temp dir. `download` is injectable so tests need not touch S3.
 */
export function makeFileResolver(
  manifest: AttachmentManifest | null | undefined,
  opts: { download?: (key: string) => Promise<{ bytes: Uint8Array }> } = {},
): { resolve: FileResolver; cleanup: () => Promise<void> } {
  const download = opts.download ?? (async (key: string) => await getObjectBytes(key))
  const cache = new Map<string, string>()
  let dir: string | null = null

  const resolve: FileResolver = async (name: string) => {
    const cached = cache.get(name)
    if (cached) return [cached]
    const ref = manifest?.[name]
    if (!ref) throw new Error(`upload: no attachment named "${name}" is attached to this AutoSim`)
    if (!dir) dir = await mkdtemp(join(tmpdir(), "klav-autosim-"))
    // Preserve the original filename so the site sees a sensible name/extension.
    const safe = ref.filename.replace(/[^A-Za-z0-9._-]/g, "_").slice(-120) || "upload.bin"
    const path = join(dir, safe)
    const { bytes } = await download(ref.key)
    await writeFile(path, bytes)
    cache.set(name, path)
    return [path]
  }
  const cleanup = async () => {
    if (dir) { await rm(dir, { recursive: true, force: true }).catch(() => {}); dir = null }
    cache.clear()
  }
  return { resolve, cleanup }
}
