// Node walk worker (bun+Windows: Playwright cannot drive a browser under Bun, so replays run in a Node child process).
import { describe, test, expect } from "bun:test"
import { createHash, createHmac } from "node:crypto"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { shouldUseNodeWalkWorker, serializeWalkOptions } from "./walk-node-bridge"
import { parseWorkerOutput, WALK_RESULT_MARK, WALK_ERROR_MARK } from "./walk-worker-protocol"
import { NodeCryptoHasher, nodeBunFile } from "./walk-worker-shims"

describe("shouldUseNodeWalkWorker", () => {
  test("on for bun on Windows, off elsewhere", () => {
    expect(shouldUseNodeWalkWorker({}, { bun: "1.3" }, "win32")).toBe(true)
    expect(shouldUseNodeWalkWorker({}, { bun: "1.3" }, "linux")).toBe(false)
    expect(shouldUseNodeWalkWorker({}, { node: "22" }, "win32")).toBe(false) // already Node: Playwright works
  })
  test("AUTOSIM_NODE_WALK overrides both ways", () => {
    expect(shouldUseNodeWalkWorker({ AUTOSIM_NODE_WALK: "1" }, { bun: "1.3" }, "linux")).toBe(true)
    expect(shouldUseNodeWalkWorker({ AUTOSIM_NODE_WALK: "0" }, { bun: "1.3" }, "win32")).toBe(false)
  })
})

describe("serializeWalkOptions", () => {
  test("keeps the JSON-safe options and drops functions/signals", () => {
    const out = serializeWalkOptions({
      fixtureUrl: "https://x.test/", replay: true, deadlineMs: 120_000, scaleDeadlineWithSteps: true, runId: "walk_1", stepShots: true,
      launchArgs: ["--no-sandbox"], suppressFindings: true,
      credResolver: async () => "x", shotUploader: async () => ({ key: "k" }), signal: new AbortController().signal, liveWatch: true,
    } as any)
    expect(out).toEqual({
      fixtureUrl: "https://x.test/", replay: true, deadlineMs: 120_000, scaleDeadlineWithSteps: true, runId: "walk_1", stepShots: true,
      launchArgs: ["--no-sandbox"], suppressFindings: true,
    })
  })
  test("vision resolver becomes a flag the worker re-creates", () => {
    expect(serializeWalkOptions({ vision: async () => null } as any)).toEqual({ vision: true })
    expect(serializeWalkOptions({} as any)).toEqual({})
  })
})

describe("parseWorkerOutput", () => {
  test("takes the result line even after other log output", () => {
    const out = parseWorkerOutput(`some log\n[trails] step 3\n${WALK_RESULT_MARK}${JSON.stringify({ runId: "walk_1", verdict: "green" })}\n`)
    expect(out).toEqual({ ok: true, summary: { runId: "walk_1", verdict: "green" } })
  })
  test("surfaces the worker's error line", () => {
    const out = parseWorkerOutput(`x\n${WALK_ERROR_MARK}Error: trail not found\n`)
    expect(out).toEqual({ ok: false, error: "Error: trail not found" })
  })
  test("reports a missing or corrupt result", () => {
    expect(parseWorkerOutput("just logs\n")).toEqual({ ok: false, error: "walk worker produced no result" })
    const bad = parseWorkerOutput(`${WALK_RESULT_MARK}{not json\n`)
    expect(bad.ok).toBe(false)
  })
})

describe("worker Bun shims match Bun", () => {
  test("CryptoHasher: sha256 and keyed (HMAC) digests", () => {
    expect(new NodeCryptoHasher("sha256").update("a").update("b").digest("hex")).toBe(createHash("sha256").update("ab").digest("hex"))
    expect(new NodeCryptoHasher("sha256", "k").update("klav_uid:v1:x").digest("hex")).toBe(createHmac("sha256", "k").update("klav_uid:v1:x").digest("hex"))
    // and agrees with the real Bun implementation this test runs under
    expect(new NodeCryptoHasher("sha256", "k").update("m").digest("hex")).toBe(new Bun.CryptoHasher("sha256", "k").update("m").digest("hex"))
  })
  test("Bun.file shim reads what Bun.write wrote", async () => {
    const dir = mkdtempSync(join(tmpdir(), "klav-shim-"))
    try {
      const p = join(dir, "a.bin")
      await Bun.write(p, new Uint8Array([1, 2, 3, 250]))
      const f = nodeBunFile(p)
      expect(await f.exists()).toBe(true)
      expect([...new Uint8Array(await f.arrayBuffer())]).toEqual([1, 2, 3, 250])
      expect((await f.stat()).size).toBe(4)
      expect(await nodeBunFile(join(dir, "missing")).exists()).toBe(false)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })
})

import { platformSafeChromiumArgs } from "./walk-worker-protocol"
describe("platformSafeChromiumArgs", () => {
  const PROD = ["--single-process", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote", "--mute-audio"]
  test("drops the flags that crash Chromium on Windows", () => {
    expect(platformSafeChromiumArgs(PROD, "win32")).toEqual(["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--mute-audio"])
  })
  test("leaves Linux/macOS args untouched", () => {
    expect(platformSafeChromiumArgs(PROD, "linux")).toEqual(PROD)
    expect(platformSafeChromiumArgs(PROD, "darwin")).toEqual(PROD)
  })
  test("passes undefined through", () => { expect(platformSafeChromiumArgs(undefined, "win32")).toBeUndefined() })
})
