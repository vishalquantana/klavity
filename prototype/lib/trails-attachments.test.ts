import { test, expect } from "bun:test"
import { makeFileResolver } from "./trails-attachments"
import { readFile } from "fs/promises"

const MANIFEST = {
  "receipt.pdf": { key: "attachments/1-abc.pdf", filename: "receipt.pdf", contentType: "application/pdf" },
  "logo.png": { key: "attachments/2-def.png", filename: "logo.png", contentType: "image/png" },
}

test("resolves a fixture name to a temp file with the original bytes + filename", async () => {
  const downloads: string[] = []
  const { resolve, cleanup } = makeFileResolver(MANIFEST, {
    download: async (key) => { downloads.push(key); return { bytes: new Uint8Array([1, 2, 3, 4]) } },
  })
  const paths = await resolve("receipt.pdf")
  expect(paths.length).toBe(1)
  expect(paths[0].endsWith("receipt.pdf")).toBe(true)
  expect(downloads).toEqual(["attachments/1-abc.pdf"])
  const bytes = new Uint8Array(await readFile(paths[0]))
  expect(Array.from(bytes)).toEqual([1, 2, 3, 4])
  await cleanup()
})

test("caches: resolving the same name twice downloads once and returns the same path", async () => {
  let n = 0
  const { resolve, cleanup } = makeFileResolver(MANIFEST, { download: async () => { n++; return { bytes: new Uint8Array([9]) } } })
  const a = await resolve("logo.png")
  const b = await resolve("logo.png")
  expect(a[0]).toBe(b[0])
  expect(n).toBe(1)
  await cleanup()
})

test("throws a clear error for an unknown attachment name", async () => {
  const { resolve, cleanup } = makeFileResolver(MANIFEST, { download: async () => ({ bytes: new Uint8Array() }) })
  await expect(resolve("missing.txt")).rejects.toThrow(/no attachment named "missing.txt"/)
  await cleanup()
})

test("cleanup removes the temp files", async () => {
  const { resolve, cleanup } = makeFileResolver(MANIFEST, { download: async () => ({ bytes: new Uint8Array([1]) }) })
  const [p] = await resolve("receipt.pdf")
  await cleanup()
  await expect(readFile(p)).rejects.toThrow()
})

test("empty/absent manifest resolver always rejects (no fixtures attached)", async () => {
  const { resolve } = makeFileResolver(null)
  await expect(resolve("anything")).rejects.toThrow(/no attachment named/)
})
