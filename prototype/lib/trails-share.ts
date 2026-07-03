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
    sql: `SELECT project_id, run_id, expires_at FROM walk_share_tokens WHERE token_hash = ?`,
    args: [tokenHash],
  })
  if (!r.rows.length) return null

  const row = r.rows[0] as { project_id: string; run_id: string; expires_at: number }
  if (Date.now() > Number(row.expires_at)) return null

  return { projectId: String(row.project_id), runId: String(row.run_id) }
}

// ---------------------------------------------------------------------------
// renderWalkPdf
// ---------------------------------------------------------------------------

export async function renderWalkPdf(
  projectId: string,
  runId: string,
  baseUrl: string,
): Promise<Uint8Array> {
  // Module-level injectable seam (set via _setPdfRendererForTests in unit tests)
  if (_customPdfRenderer) return _customPdfRenderer(projectId, runId, baseUrl)

  // Env-flag fake for subprocess route tests — never active without the flag
  if (process.env.KLAV_TEST_FAKE_PDF === "1") {
    return new TextEncoder().encode("%PDF-fake-for-tests " + runId)
  }

  const { gatherWalkReport, renderWalkReportHtml } = await import("./trails-report")
  const { withWalkSlot, CHROMIUM_PROD_ARGS } = await import("./trails-browser")
  const { chromium } = await import("playwright")

  const data = await gatherWalkReport(projectId, runId)
  if (!data) throw new Error("walk not found or access denied")

  const html = renderWalkReportHtml(data, { baseUrl, generatedAt: Date.now() })

  return withWalkSlot(async () => {
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
