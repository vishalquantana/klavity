// Task 3: Share-token minting/resolution + PDF rendering for Walk Reports.
// mintShareToken — generates a 32-byte hex token, stores its sha256hex hash in walk_share_tokens.
// resolveShareToken — looks up by hash, checks expiry, returns (projectId, runId) or null.
// renderWalkPdf — gathers walk data, renders HTML, runs Chromium to produce a PDF.
//   Injectable seam: KLAV_TEST_FAKE_PDF=1 returns a fake %PDF- bytes without launching Chromium.
//   Module-level _pdfRenderer can also be overridden via _setPdfRendererForTests().
import { sha256hex } from "./crypto"

// ---------------------------------------------------------------------------
// Injectable seam for route tests (subprocess env flag + module-level override)
// ---------------------------------------------------------------------------

type PdfRenderer = (projectId: string, runId: string, baseUrl: string) => Promise<Uint8Array>

let _customPdfRenderer: PdfRenderer | null = null

export function _setPdfRendererForTests(fn: PdfRenderer | null): void {
  _customPdfRenderer = fn
}

// ---------------------------------------------------------------------------
// mintShareToken
// ---------------------------------------------------------------------------

export async function mintShareToken(
  projectId: string,
  runId: string,
  createdBy?: string,
  ttlMs: number = 30 * 24 * 3600e3,
): Promise<string> {
  const { db } = await import("./db")
  if (!db) throw new Error("DB not initialised")

  // 32 random bytes → 64-char lowercase hex token
  const rawBytes = crypto.getRandomValues(new Uint8Array(32))
  const rawToken = Array.from(rawBytes).map((b) => b.toString(16).padStart(2, "0")).join("")
  const tokenHash = sha256hex(rawToken)

  const id = "wst_" + crypto.randomUUID().replace(/-/g, "")
  const now = Date.now()
  const expiresAt = now + ttlMs

  await db.execute({
    sql: `INSERT INTO walk_share_tokens (id, token_hash, run_id, project_id, created_by, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, tokenHash, runId, projectId, createdBy ?? null, expiresAt, now],
  })

  return rawToken
}

// ---------------------------------------------------------------------------
// resolveShareToken
// ---------------------------------------------------------------------------

export async function resolveShareToken(
  rawToken: string,
): Promise<{ projectId: string; runId: string } | null> {
  const { db } = await import("./db")
  if (!db) return null

  const tokenHash = sha256hex(rawToken)
  const r = await db.execute({
    sql: `SELECT project_id, run_id, expires_at, revoked_at FROM walk_share_tokens WHERE token_hash = ?`,
    args: [tokenHash],
  })
  if (!r.rows.length) return null

  const row = r.rows[0] as { project_id: string; run_id: string; expires_at: number; revoked_at: number | null }
  if (Date.now() > Number(row.expires_at)) return null
  if (row.revoked_at != null) return null

  return { projectId: String(row.project_id), runId: String(row.run_id) }
}

// ---------------------------------------------------------------------------
// revokeShareToken — mark a token as revoked by its row id (wst_…).
// Returns true if a row was found and revoked, false if not found / already revoked.
// ---------------------------------------------------------------------------

export async function revokeShareToken(tokenId: string): Promise<boolean> {
  const { db } = await import("./db")
  if (!db) throw new Error("DB not initialised")

  const r = await db.execute({
    sql: `UPDATE walk_share_tokens SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL`,
    args: [Date.now(), tokenId],
  })
  return Number(r.rowsAffected ?? 0) > 0
}

// ---------------------------------------------------------------------------
// listShareTokens — active (non-revoked, non-expired) tokens for a walk.
// token_hash is never returned — it's the secret; id (wst_…) is used for revocation.
// ---------------------------------------------------------------------------

export type ShareTokenSummary = {
  id: string
  projectId: string
  runId: string
  createdBy: string | null
  expiresAt: number
  createdAt: number
}

export async function listShareTokens(projectId: string, runId: string): Promise<ShareTokenSummary[]> {
  const { db } = await import("./db")
  if (!db) return []

  const r = await db.execute({
    sql: `SELECT id, project_id, run_id, created_by, expires_at, created_at
          FROM walk_share_tokens
          WHERE project_id = ? AND run_id = ? AND revoked_at IS NULL AND expires_at > ?
          ORDER BY created_at DESC`,
    args: [projectId, runId, Date.now()],
  })

  return r.rows.map((row: any) => ({
    id: String(row.id),
    projectId: String(row.project_id),
    runId: String(row.run_id),
    createdBy: row.created_by != null ? String(row.created_by) : null,
    expiresAt: Number(row.expires_at),
    createdAt: Number(row.created_at),
  }))
}

// ---------------------------------------------------------------------------
// purgeExpiredShareTokens — delete rows that are expired OR revoked.
// Called from the data-retention sweep so these don't accumulate.
// ---------------------------------------------------------------------------

export async function purgeExpiredShareTokens(now = Date.now()): Promise<number> {
  const { db } = await import("./db")
  if (!db) return 0

  const r = await db.execute({
    sql: `DELETE FROM walk_share_tokens WHERE expires_at < ? OR revoked_at IS NOT NULL`,
    args: [now],
  })
  return Number(r.rowsAffected ?? 0)
}

// ---------------------------------------------------------------------------
// renderWalkPdf
// ---------------------------------------------------------------------------

export async function renderWalkPdf(
  projectId: string,
  runId: string,
  baseUrl: string,
  opts?: { replayUrl?: string },
): Promise<Uint8Array> {
  // Module-level injectable seam (set via _setPdfRendererForTests in unit tests)
  if (_customPdfRenderer) return _customPdfRenderer(projectId, runId, baseUrl)

  // Env-flag fake for subprocess route tests — never active without the flag
  if (process.env.KLAV_TEST_FAKE_PDF === "1") {
    const { withPdfSlot } = await import("./trails-browser")
    return withPdfSlot(async () => {
      if (process.env.KLAV_TEST_FAKE_PDF_DELAY) {
        await new Promise((r) => setTimeout(r, parseInt(process.env.KLAV_TEST_FAKE_PDF_DELAY, 10)))
      }
      return new TextEncoder().encode("%PDF-fake-for-tests " + runId)
    })
  }

  const { gatherWalkReport, renderWalkReportHtml } = await import("./trails-report")
  const { withPdfSlot, CHROMIUM_PROD_ARGS } = await import("./trails-browser")
  const { chromium } = await import("playwright")

  const data = await gatherWalkReport(projectId, runId)
  if (!data) throw new Error("walk not found or access denied")

  const html = renderWalkReportHtml(data, { baseUrl, generatedAt: Date.now(), replayUrl: opts?.replayUrl })

  return withPdfSlot(async () => {
    const deadline = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("PDF generation timed out (30s)")), 30_000),
    )

    const renderPdf = async (): Promise<Uint8Array> => {
      const browser = await chromium.launch({ headless: true, args: CHROMIUM_PROD_ARGS })
      try {
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: "domcontentloaded" })
        // Step screenshots + fonts load from presigned/absolute URLs AFTER domcontentloaded —
        // printing immediately yields image-less PDFs. Wait for every <img> to settle (load OR
        // error, so a dead S3 link can't hang us); the outer 30s deadline still bounds everything.
        await page
          .evaluate(() =>
            Promise.all(
              Array.from(document.images)
                .filter((img) => !img.complete)
                .map((img) => new Promise((res) => { img.onload = img.onerror = () => res(null) })),
            ),
          )
          .catch(() => {})
        const pdfBytes = await page.pdf({ format: "A4" })
        await page.close()
        return pdfBytes
      } finally {
        await browser.close()
      }
    }

    return Promise.race([renderPdf(), deadline])
  })
}
