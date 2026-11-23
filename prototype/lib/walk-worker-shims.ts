// Node-side stand-ins for the handful of Bun APIs the walker's dependency chain touches. Only the Node walk worker
// (lib/walk-worker.ts, run under Node because Playwright cannot talk to a browser under Bun on Windows) installs
// these; the server itself keeps using the real Bun. Behaviour matches Bun's for the shapes this codebase uses.
import { createHash, createHmac } from "node:crypto"
import { gzipSync, gunzipSync } from "node:zlib"
import { createReadStream } from "node:fs"
import { readFile, stat, writeFile } from "node:fs/promises"
import { Readable } from "node:stream"

type Bytes = string | Uint8Array | ArrayBuffer | ArrayBufferView

const toBuf = (d: Bytes): Buffer =>
  typeof d === "string" ? Buffer.from(d)
    : d instanceof ArrayBuffer ? Buffer.from(d)
      : Buffer.from((d as ArrayBufferView).buffer, (d as ArrayBufferView).byteOffset, (d as ArrayBufferView).byteLength)

/** `new Bun.CryptoHasher(algo[, hmacKey]).update(x).digest("hex" | "base64")` */
export class NodeCryptoHasher {
  private chunks: Buffer[] = []
  constructor(private algo: string, private key?: string | Uint8Array) {}
  update(d: Bytes): this { this.chunks.push(toBuf(d)); return this }
  digest(enc?: "hex" | "base64"): string | Buffer {
    const h = this.key !== undefined ? createHmac(this.algo, this.key) : createHash(this.algo)
    for (const c of this.chunks) h.update(c)
    return enc ? h.digest(enc) : h.digest()
  }
}

/** `Bun.file(path)` - the subset s3.ts uses for its local-disk storage mode. */
export function nodeBunFile(path: string) {
  return {
    type: "",
    async arrayBuffer(): Promise<ArrayBuffer> {
      const b = await readFile(path)
      return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer
    },
    async text(): Promise<string> { return await readFile(path, "utf8") },
    async exists(): Promise<boolean> { try { await stat(path); return true } catch { return false } },
    async stat() { return await stat(path) },
    stream(): ReadableStream<Uint8Array> { return Readable.toWeb(createReadStream(path)) as unknown as ReadableStream<Uint8Array> },
  }
}

export function installBunShim(): void {
  const g = globalThis as any
  if (g.Bun) return
  g.Bun = {
    CryptoHasher: NodeCryptoHasher,
    gzipSync: (d: Bytes) => new Uint8Array(gzipSync(toBuf(d))),
    gunzipSync: (d: Bytes) => new Uint8Array(gunzipSync(toBuf(d))),
    file: nodeBunFile,
    write: async (dest: string, data: Bytes) => { const b = toBuf(data); await writeFile(dest, b); return b.byteLength },
    spawn: () => { throw new Error("Bun.spawn is not available in the Node walk worker") },
  }
}

installBunShim()
