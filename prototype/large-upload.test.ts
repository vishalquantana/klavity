// Large-file attachments: signed tokens/refs + chunk maths (lib/large-upload.ts).
import { expect, test } from "bun:test"
process.env.KLAV_SECRET ||= "test-secret-large-upload"
const L = await import("./lib/large-upload")

const tok = (over: Partial<import("./lib/large-upload").UploadToken> = {}) =>
  ({ u: L.newUploadId(), p: "proj_1", n: "big.mp4", t: "video/mp4", s: 20 * 1024 * 1024 + 5, ts: Date.now(), ...over })

test("upload token round-trips and rejects tampering / expiry", () => {
  const t = tok()
  const s = L.signUploadToken(t)
  expect(L.verifyUploadToken(s)).toEqual(t)
  // change the size inside the body but keep the old signature → rejected
  const [body, sig] = s.split(".")
  const forged = Buffer.from(JSON.stringify({ ...t, s: 1 })).toString("base64url") + "." + sig
  expect(L.verifyUploadToken(forged)).toBeNull()
  expect(L.verifyUploadToken(body + ".x")).toBeNull()
  expect(L.verifyUploadToken(L.signUploadToken(tok({ ts: Date.now() - L.UPLOAD_TOKEN_TTL_MS - 1 })))).toBeNull()
  expect(L.verifyUploadToken(undefined)).toBeNull()
})

test("an upload token is not accepted as a file ref (different purpose)", () => {
  const s = L.signUploadToken(tok())
  expect(L.verifyFileRef(s)).toBeNull()
})

test("chunk maths: exact lengths, last chunk is the remainder, out-of-range is -1", () => {
  const size = L.CHUNK_BYTES * 2 + 7
  expect(L.chunkCount(size)).toBe(3)
  expect(L.chunkLength(size, 0)).toBe(L.CHUNK_BYTES)
  expect(L.chunkLength(size, 2)).toBe(7)
  expect(L.chunkLength(size, 3)).toBe(-1)
  expect(L.chunkLength(size, -1)).toBe(-1)
  expect(L.chunkCount(L.CHUNK_BYTES)).toBe(1)
  expect(L.chunkLength(L.CHUNK_BYTES, 0)).toBe(L.CHUNK_BYTES)
})

test("validateStart: size required and capped, filename/content-type cleaned", () => {
  expect(L.validateStart({ size: 0 }).ok).toBe(false)
  expect(L.validateStart({ size: 11 }, 10).ok).toBe(false)
  const v = L.validateStart({ size: 3 * 1024 * 1024 * 1024, filename: "../a/b.mov", content_type: "Video/QuickTime", project_id: "p" })
  expect(v).toEqual({ ok: true, projectId: "p", filename: ".._a_b.mov", contentType: "video/quicktime", size: 3 * 1024 * 1024 * 1024 })
  expect((L.validateStart({ size: 5, content_type: "x y" }) as any).contentType).toBe("application/octet-stream")
})

test("parseFileRefs keeps only valid refs for the same project, de-duplicated and capped", () => {
  const mk = (k: string, p = "proj_1") => L.signFileRef({ k, p, n: "a.bin", t: "application/octet-stream", s: 10, ts: Date.now() })
  const raw = JSON.stringify([mk("k1"), mk("k1"), mk("k2", "other"), "junk", mk("k3"), mk("k4")])
  expect(L.parseFileRefs(raw, "proj_1").map((r) => r.k)).toEqual(["k1", "k3", "k4"])
  expect(L.parseFileRefs(raw, "proj_1", 2).map((r) => r.k)).toEqual(["k1", "k3"])
  expect(L.parseFileRefs("not json", "proj_1")).toEqual([])
  expect(L.parseFileRefs(null, "proj_1")).toEqual([])
})
