// Layer E — Klavity OS Trails findings gate.
//
// Spec §6: a wrong heal is worse than a red test. Auto-file ONLY hard, evidence-typed regressions
// (element genuinely gone after heal exhausted / network 5xx / failed explicit checkpoint), dedup-clean
// AND confidence ≥ high threshold. Everything subjective (visual diffs, AMBER heals) queues for the
// human review gate. We publish a per-project precision metric (legit-bug rate). A dismissed finding is
// excluded from precision and never re-filed.
//
// This module is split into:
//   • decideFindingAction / projectPrecision — pure / read-only.
//   • processWalkFindings / fileFindingById / dismissFinding — executor over an INJECTED Filer (mockable).
//   • buildTicketFromFinding (pure) / realFiler — the production connector adapter, mirroring the
//     auto-copy decrypt loop in server.ts (getConnector(type).createIssue + decryptSecret per secret field).

import type { Finding } from "./trails-types"
import { listFindings, setFindingConnectorError, setFindingStatus, getRunStepEvidence } from "./trails"
import { listAutoCopyConnectors, projectById } from "./db"
import { getConnector, type TicketPayload, type TicketAttachment } from "./connectors/index"
import { decryptSecret } from "./crypto"

export const AUTO_FILE_THRESHOLD = 0.9

// ── Pure decision ────────────────────────────────────────────────────────────────
// auto_file iff it's a hard regression AND clears the high-confidence bar; everything else queues.
// NOTE: "dedup-clean" is NOT re-checked here — it is enforced upstream at record time: recordFinding
// collapses duplicates (and a dismissed dedupKey can never resurface as a fresh queued row), so anything
// this function sees is already dedup-clean.
export function decideFindingAction(
  f: Pick<Finding, "kind" | "confidence">,
  threshold = AUTO_FILE_THRESHOLD,
): "auto_file" | "queue" {
  return f.kind === "regression" && f.confidence >= threshold ? "auto_file" : "queue"
}

// ── Precision (legit-bug rate) ───────────────────────────────────────────────────
// filed = settled-as-real (filed|auto_filed); dismissed = settled-as-noise. Still-queued items are
// undecided and excluded from both numerator and denominator. precision = filed/(filed+dismissed).
export async function projectPrecision(
  projectId: string,
): Promise<{ filed: number; dismissed: number; precision: number | null }> {
  const all = await listFindings(projectId)
  const filed = all.filter((f) => f.status === "filed" || f.status === "auto_filed").length
  const dismissed = all.filter((f) => f.status === "dismissed").length
  const total = filed + dismissed
  return { filed, dismissed, precision: total ? filed / total : null }
}

// ── Injectable filer ─────────────────────────────────────────────────────────────
// Files one finding to the project's external tracker; returns the external ref (e.g. "plane:PROJ-42")
// or a log-safe error if the connector push failed. Null means there was no connector to try.
export type FilerResult = { connectorRef: string } | { connectorError: string }
export type Filer = (projectId: string, finding: Finding) => Promise<FilerResult | null>

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function connectorFailureMessage(scope: string, err: unknown): string {
  return `${scope}: ${errorMessage(err)}`.slice(0, 1000)
}

function isFiled(result: FilerResult | null): result is { connectorRef: string } {
  return !!result && "connectorRef" in result
}

function failureFrom(result: FilerResult | null): string | null {
  return result && "connectorError" in result ? result.connectorError : null
}

async function recordConnectorFailure(projectId: string, findingId: string, failure: string): Promise<void> {
  const msg = failure.slice(0, 1000)
  console.warn(`[trails-findings] connector filing failed for ${projectId}/${findingId}: ${msg}`)
  await setFindingConnectorError(projectId, findingId, msg)
}

// Executor: walk-scoped gate. For each still-queued finding of this run, auto-file the hard
// high-confidence regressions (never double-file an already-filed item — we only consider 'queued'),
// queue the rest. A filer failure leaves the finding queued (fail-loud, never silent-green).
export async function processWalkFindings(
  projectId: string,
  runId: string,
  deps: { filer: Filer; threshold?: number },
): Promise<{ autoFiled: string[]; queued: string[] }> {
  const findings = (await listFindings(projectId)).filter((f) => f.runId === runId && f.status === "queued")
  const autoFiled: string[] = []
  const queued: string[] = []
  for (const f of findings) {
    if (decideFindingAction(f, deps.threshold) === "auto_file") {
      const r = await deps.filer(projectId, f).catch((err) => ({
        connectorError: connectorFailureMessage("auto-file threw", err),
      }))
      if (isFiled(r)) {
        await setFindingStatus(projectId, f.id, "auto_filed", r.connectorRef)
        autoFiled.push(f.id)
        continue
      }
      const failure = failureFrom(r)
      if (failure) await recordConnectorFailure(projectId, f.id, failure)
    }
    queued.push(f.id)
  }
  return { autoFiled, queued }
}

// KLA-94: opt-in auto-file gate. Checks the per-project flag; if OFF, returns immediately (all findings
// stay queued — preserving the human-review default). If ON, delegates to processWalkFindings with the
// production connector (or an injected filer for tests). Never throws — failures are recorded on the
// finding row by processWalkFindings and this function is always called best-effort from walkTrail.
export async function maybeAutoFileWalkFindings(
  projectId: string,
  runId: string,
  filer: Filer = realFiler,
): Promise<{ autoFiled: string[]; queued: string[] }> {
  const proj = await projectById(projectId)
  if (!proj?.trailsAutofileEnabled) return { autoFiled: [], queued: [] }
  return processWalkFindings(projectId, runId, { filer })
}

// Human "file from queue": load the finding, push it, mark 'filed' with the connector ref.
// Status guard (§6 anti-slop): we ONLY file a still-'queued' finding — never a 'dismissed' one
// (a dismissal permanently suppresses it) and never an already 'filed'/'auto_filed' one (no double-file /
// duplicate ticket). Returns ok:false without ever invoking the filer in those cases.
export async function fileFindingById(
  projectId: string,
  findingId: string,
  deps: { filer: Filer },
): Promise<{ ok: boolean; connectorRef?: string }> {
  const f = (await listFindings(projectId)).find((x) => x.id === findingId)
  if (!f || f.status !== "queued") return { ok: false }
  const r = await deps.filer(projectId, f).catch((err) => ({
    connectorError: connectorFailureMessage("manual file threw", err),
  }))
  if (!isFiled(r)) {
    const failure = failureFrom(r)
    if (failure) await recordConnectorFailure(projectId, findingId, failure)
    return { ok: false }
  }
  await setFindingStatus(projectId, findingId, "filed", r.connectorRef)
  return { ok: true, connectorRef: r.connectorRef }
}

// Human "dismiss from queue": excludes it from the queue + precision; never re-filed.
// Hardening: only act on a finding that EXISTS, belongs to this project, and is currently 'queued'.
// Returns true if it transitioned to dismissed; false (no-op) for missing/foreign/non-queued ids so the
// route can answer 404 instead of a misleading 200.
export async function dismissFinding(projectId: string, findingId: string): Promise<boolean> {
  const f = (await listFindings(projectId)).find((x) => x.id === findingId)
  if (!f || f.status !== "queued") return false
  await setFindingStatus(projectId, findingId, "dismissed")
  return true
}

// ── Real connector filer ─────────────────────────────────────────────────────────
// Pure: shape a grounded TicketPayload (matching lib/connectors/index.ts) from a Trail finding.
// Body carries the grounded evidence (rationale + verbatim groundQuote) and the heal from→to diff,
// plus run/step ids, so the external ticket is auditable.
// KLA-81: severity uses the pre-computed finding.severity when present; falls back to kind-only
// derivation for legacy rows that pre-date the severity column.
export function severityForKind(kind: Finding["kind"]): string {
  return kind === "regression" ? "high" : kind === "visual" ? "low" : "medium"
}

export function buildTicketFromFinding(finding: Finding, baseUrl: string): TicketPayload {
  const ev = (finding.evidence ?? {}) as Record<string, unknown>
  const rationale = (ev.rationale as string) || finding.groundQuote || ""
  const fromSel = ev.fromSelector as string | null | undefined
  const toSel = ev.toSelector as string | null | undefined

  const lines: string[] = []
  if (rationale) lines.push(rationale)
  if (finding.groundQuote) lines.push(`Grounded: "${finding.groundQuote}"`)
  if (fromSel || toSel) lines.push(`Heal diff: ${fromSel ?? "(none)"} → ${toSel ?? "(none)"}`)
  lines.push(`Kind: ${finding.kind} · confidence: ${finding.confidence}`)
  lines.push(`Walk: ${finding.runId}${finding.stepId ? ` · step: ${finding.stepId}` : ""} · trail: ${finding.trailId}`)
  lines.push("Filed by Klavity OS Trails")

  return {
    title: "[Klavity Trails] " + finding.title,
    body: lines.join("\n\n"),
    priority: finding.priority ?? severityForKind(finding.kind),
    url: null,
    simName: null,
    createdAt: finding.createdAt,
    klavityUrl: `${baseUrl}/trails?project=${finding.projectId}`,
  }
}

// Best-effort: look up the step screenshot for the finding and return a TicketAttachment.
// Returns null when: finding has no stepId, step has no screenshotKey, S3 is absent, or anything throws.
async function findingScreenshotAttachment(finding: Finding, baseUrl: string): Promise<TicketAttachment | null> {
  if (!finding.stepId) return null
  try {
    const ev = await getRunStepEvidence(finding.projectId, finding.runId, finding.stepId)
    const key = ev?.screenshotKey as string | undefined
    if (!key) return null
    const { getObjectBytes } = await import("./s3")
    const obj = await getObjectBytes(key)
    const ct = (obj.contentType?.startsWith("image/") ? obj.contentType : "image/jpeg") as string
    const ext = ct === "image/png" ? "png" : "jpg"
    // The step screenshot URL is auth-gated; it serves as a contextual fallback in ticket bodies.
    const url = `${baseUrl}/api/trails/walks/${finding.runId}/steps/${finding.stepId}/screenshot`
    return { filename: `finding-${finding.id}.${ext}`, contentType: ct, bytes: obj.bytes, url }
  } catch {
    return null
  }
}

// Production filer: pick the project's first auto-copy connector, decrypt its secret fields exactly as
// the server's auto-copy hook does, call the adapter's createIssue, and return "<type>:<externalKey>".
// Returns null if the project has no auto-copy connector. NEVER called in CI against a real network.
export const realFiler: Filer = async (projectId, finding) => {
  const connectors = await listAutoCopyConnectors(projectId)
  if (!connectors.length) return null
  const baseUrl = (process.env.KLAV_BASE_URL || "https://klavity.in").replace("klavity.quantana.top", "klavity.in")
  const baseTicket = buildTicketFromFinding(finding, baseUrl)
  const attachment = await findingScreenshotAttachment(finding, baseUrl)
  const ticket: TicketPayload = attachment ? { ...baseTicket, attachments: [attachment] } : baseTicket

  if (attachment) {
    try {
      const { presignGet } = await import("./s3")
      // Extract the key from evidence again just for the presign, since attachment.url is auth-gated
      const ev = (finding.evidence ?? {}) as Record<string, unknown>
      const screenshotKey = ev.screenshotKey as string | null | undefined
      if (screenshotKey) {
        const presignedUrl = presignGet(screenshotKey, 7 * 24 * 3600)
        ticket.body += `\n\n![Screenshot](${presignedUrl})`
        // Update the attachment URL to the presigned one so integrations without native upload use it
        ticket.attachments![0].url = presignedUrl
      }
    } catch (err) {
      console.warn(`[trails-findings] failed to presign screenshot for finding ${finding.id}`, err)
    }
  }
  const failures: string[] = []
  for (const c of connectors) {
    const adapter = getConnector(c.type)
    if (!adapter) continue
    // Decrypt secret fields (mirror server.ts auto-copy loop).
    const cfg: Record<string, string> = { ...c.config }
    for (const f of adapter.fields) {
      if (f.secret && c.config[f.key]) {
        try { cfg[f.key] = await decryptSecret(c.config[f.key]) } catch { cfg[f.key] = "" }
      }
    }
    try {
      const result = await adapter.createIssue(ticket, cfg)
      return { connectorRef: `${c.type}:${result.externalKey ?? result.externalUrl ?? c.id}` }
    } catch (err) {
      failures.push(connectorFailureMessage(`${c.type} connector ${c.id}`, err))
      // Try the next connector; a total failure across all returns a persisted/logged failure.
    }
  }
  return failures.length ? { connectorError: failures.join("; ").slice(0, 1000) } : null
}
