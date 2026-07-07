// Task 3: Unit tests for lib/trails-share.ts (mintShareToken + resolveShareToken).
// Hermetic: uses a local SQLite file DB, no network, no Chromium.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { sha256hex } from "./crypto"

// ── Hermetic DB setup ─────────────────────────────────────────────────────────
const file = join(tmpdir(), `klav-share-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.alloc(32, 42).toString("base64")

const { reconnectDb, applySchema } = await import("./db")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
})

const { mintShareToken, resolveShareToken, _setPdfRendererForTests } = await import("./trails-share")

const PROJECT_ID = "proj_share_test"
const RUN_ID = "walk_share_001"

// ── Token mint tests ──────────────────────────────────────────────────────────

test("mintShareToken returns a 64-char lowercase hex string", async () => {
  const token = await mintShareToken(PROJECT_ID, RUN_ID)
  expect(typeof token).toBe("string")
  expect(token).toHaveLength(64)
  expect(/^[0-9a-f]{64}$/.test(token)).toBe(true)
})

test("mintShareToken returns different tokens each call", async () => {
  const t1 = await mintShareToken(PROJECT_ID, RUN_ID)
  const t2 = await mintShareToken(PROJECT_ID, RUN_ID)
  expect(t1).not.toBe(t2)
})

// ── Token resolve tests ───────────────────────────────────────────────────────

test("resolveShareToken returns projectId+runId for a valid token", async () => {
  const token = await mintShareToken(PROJECT_ID, RUN_ID)
  const result = await resolveShareToken(token)
  expect(result).not.toBeNull()
  expect(result!.projectId).toBe(PROJECT_ID)
  expect(result!.runId).toBe(RUN_ID)
})

test("resolveShareToken returns null for a tampered token", async () => {
  const token = await mintShareToken(PROJECT_ID, RUN_ID)
  // Flip the last char to tamper
  const tampered = token.slice(0, -1) + (token[63] === "f" ? "e" : "f")
  const result = await resolveShareToken(tampered)
  expect(result).toBeNull()
})

test("resolveShareToken returns null for an unknown token", async () => {
  const unknown = "b".repeat(64)
  const result = await resolveShareToken(unknown)
  expect(result).toBeNull()
})

test("resolveShareToken returns null for an expired token (ttlMs=1, wait 5ms)", async () => {
  const token = await mintShareToken(PROJECT_ID, RUN_ID, undefined, 1)
  await Bun.sleep(5)
  const result = await resolveShareToken(token)
  expect(result).toBeNull()
})

test("resolveShareToken resolves a long-lived token after some time", async () => {
  const token = await mintShareToken(PROJECT_ID, RUN_ID, undefined, 60_000)
  await Bun.sleep(2)
  const result = await resolveShareToken(token)
  expect(result).not.toBeNull()
  expect(result!.runId).toBe(RUN_ID)
})

// ── Injectable renderer seam ──────────────────────────────────────────────────

test("_setPdfRendererForTests allows overriding the renderer", async () => {
  const { renderWalkPdf } = await import("./trails-share")
  _setPdfRendererForTests(async (projectId, runId, baseUrl) => {
    return new TextEncoder().encode(`%PDF-injected ${runId} ${baseUrl}`)
  })
  try {
    const bytes = await renderWalkPdf("proj_x", "run_y", "https://test.local")
    const text = new TextDecoder().decode(bytes)
    expect(text).toContain("%PDF-injected run_y https://test.local")
  } finally {
    _setPdfRendererForTests(null)
  }
})

test("KLAV_TEST_FAKE_PDF=1 returns fake PDF bytes without Chromium", async () => {
  const prev = process.env.KLAV_TEST_FAKE_PDF
  process.env.KLAV_TEST_FAKE_PDF = "1"
  // clear module cache by reloading with a fresh dynamic import path trick
  try {
    const { renderWalkPdf } = await import("./trails-share")
    // Make sure no custom renderer is set
    _setPdfRendererForTests(null)
    const bytes = await renderWalkPdf("proj_fake", "walk_fake_001", "https://x.test")
    const text = new TextDecoder().decode(bytes)
    expect(text).toContain("%PDF-fake-for-tests")
    expect(text).toContain("walk_fake_001")
  } finally {
    process.env.KLAV_TEST_FAKE_PDF = prev ?? undefined as any
  }
})

test("renderWalkPdf succeeds while a walk holds the walk slot (KLA-59)", async () => {
  const { renderWalkPdf } = await import("./trails-share")
  const { withWalkSlot, _resetWalkPoolForTest } = await import("./trails-browser")
  
  _resetWalkPoolForTest(1, 0)
  
  const prevFake = process.env.KLAV_TEST_FAKE_PDF
  process.env.KLAV_TEST_FAKE_PDF = "1"
  
  try {
    let walkFinished = false
    let releaseWalk!: () => void
    const walkGate = new Promise<void>((res) => { releaseWalk = res })
    
    const walkPromise = withWalkSlot(async () => {
      await walkGate
      walkFinished = true
    })
    
    await Promise.resolve()
    
    // PDF render does not use the walk slot, so it should run successfully concurrently!
    const pdfBytes = await renderWalkPdf("proj_any", "walk_any", "https://x.test")
    const text = new TextDecoder().decode(pdfBytes)
    expect(text).toContain("%PDF-fake-for-tests")
    
    expect(walkFinished).toBe(false)
    
    releaseWalk()
    await walkPromise
    expect(walkFinished).toBe(true)
  } finally {
    process.env.KLAV_TEST_FAKE_PDF = prevFake ?? undefined as any
  }
})

