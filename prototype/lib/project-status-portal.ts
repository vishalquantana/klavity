// Client Status Portal — KLAVITYKLA-205
// Provides a shareable, read-only, no-login view of a project's health for clients/stakeholders.
//
// Token storage: the share token is stored in the project's modal_config_json under
// the key "client_portal_token_hash". The raw token is 32 CSPRNG bytes (64 hex chars);
// only its SHA-256 hash is persisted — so a DB read can never reconstruct the token.
// Revoking = clearing that key from the config JSON (no migration needed).
//
// Security mirrors the walk-share-token pattern:
//   - 64-hex unguessable token, format-checked before any DB read
//   - SHA-256 hash stored, never the raw token
//   - No PII beyond project name and aggregate counts
//   - No cross-project data
//   - noindex / no-store headers on the rendered page

import { sha256hex } from "./crypto"
import { getProjectModalConfig, setProjectModalConfig, projectById } from "./db"
import { resolveBranding, type ResolvedBranding } from "./trails-branding"

// ---------------------------------------------------------------------------
// Token generation/revocation
// ---------------------------------------------------------------------------

/** Generate a 32-byte CSPRNG hex token, store its hash in the project config.
 *  Returns the raw token (shown once; never stored). */
export async function mintProjectShareToken(projectId: string): Promise<string> {
  const rawBytes = crypto.getRandomValues(new Uint8Array(32))
  const rawToken = Array.from(rawBytes).map((b) => b.toString(16).padStart(2, "0")).join("")
  const tokenHash = sha256hex(rawToken)

  const cfg = await getProjectModalConfig(projectId)
  cfg.client_portal_token_hash = tokenHash
  await setProjectModalConfig(projectId, cfg)

  return rawToken
}

/** Revoke the project share token (clear the hash from config). Returns true if there was one. */
export async function revokeProjectShareToken(projectId: string): Promise<boolean> {
  const cfg = await getProjectModalConfig(projectId)
  if (!cfg.client_portal_token_hash) return false
  delete cfg.client_portal_token_hash
  await setProjectModalConfig(projectId, cfg)
  return true
}

/** Look up a project by raw token. Format-guards first (64-char hex) — never hits DB on garbage.
 *  Returns the projectId or null. */
export async function resolveProjectShareToken(rawToken: string): Promise<string | null> {
  if (!/^[a-f0-9]{64}$/.test(rawToken)) return null
  const tokenHash = sha256hex(rawToken)

  const { db } = await import("./db")
  if (!db) return null

  // Scan projects whose modal_config_json contains this hash.
  // We use a full-text match with json_extract so we never enumerate projects.
  // The hash is unique (SHA-256 of a 32-byte random value) so at most one row matches.
  const r = await db.execute({
    sql: `SELECT id FROM projects WHERE json_extract(modal_config_json, '$.client_portal_token_hash') = ?`,
    args: [tokenHash],
  })
  if (!r.rows.length) return null
  return String((r.rows[0] as any).id)
}

/** Returns true if the project currently has a portal token set. */
export async function hasProjectShareToken(projectId: string): Promise<boolean> {
  const cfg = await getProjectModalConfig(projectId)
  return typeof cfg.client_portal_token_hash === "string" && cfg.client_portal_token_hash.length > 0
}

// ---------------------------------------------------------------------------
// Portal data aggregation
// ---------------------------------------------------------------------------

export interface TrailHealthSummary {
  trailId: string
  trailName: string
  /** 'green' | 'amber' | 'red' | 'none' (no runs yet) */
  health: "green" | "amber" | "red" | "none"
  lastRunAt: number | null
  totalRuns: number
}

/** KLAVITYKLA-223: client-safe branding surface for the portal. No secrets — logo/name/accent
 *  all render publicly. Signup backlink is the PLG carrier; white-label removes it. */
export interface PortalBranding {
  name: string | null
  accent: string
  logoDataUrl: string | null
  whiteLabel: boolean
  /** "powered by Klavity" backlink target (empty when white-label). */
  signupUrl: string
}

export interface ProjectStatusData {
  projectName: string
  generatedAt: number
  /** Agency branding for skinning the portal (KLAVITYKLA-223). */
  branding: PortalBranding
  trails: TrailHealthSummary[]
  /** Counts across all time */
  counts: {
    bugsReported: number
    bugsResolved: number
    regressionsFound: number
    recurringIssues: number
    openFindings: number
  }
  /** Recent trail run activity (last 14 days, condensed) */
  recentActivity: Array<{
    label: string   // trail name + verdict
    verdict: "green" | "amber" | "red"
    runAt: number
  }>
}

/** Aggregate client-appropriate project health data. No PII, no internal config, no account data. */
export async function gatherProjectStatusData(projectId: string): Promise<ProjectStatusData | null> {
  const proj = await projectById(projectId)
  if (!proj) return null

  const { db } = await import("./db")
  if (!db) return null

  // KLAVITYKLA-223: agency branding — client-safe subset. Best-effort; unbranded default on miss.
  let branding: ResolvedBranding = resolveBranding(null)
  try {
    const cfg = await getProjectModalConfig(projectId)
    branding = resolveBranding((cfg as Record<string, unknown>).agency_branding)
  } catch { /* unbranded default */ }
  const { KLAVITY_SIGNUP_URL } = await import("./trails-branding")
  const portalBranding: PortalBranding = {
    name: branding.name,
    accent: branding.accent,
    logoDataUrl: branding.logoDataUrl,
    whiteLabel: branding.whiteLabel,
    signupUrl: branding.whiteLabel ? "" : KLAVITY_SIGNUP_URL,
  }

  // 1. Trails + their last verdict
  const trailsR = await db.execute({
    sql: `SELECT t.id, t.name, t.status,
                 tr.status AS last_verdict, tr.finished_at AS last_run_at,
                 (SELECT COUNT(*) FROM trail_runs WHERE trail_id=t.id AND project_id=t.project_id AND status IN ('green','amber','red')) AS total_runs
          FROM trails t
          LEFT JOIN trail_runs tr ON tr.id = (
            SELECT id FROM trail_runs
            WHERE trail_id=t.id AND project_id=t.project_id AND status IN ('green','amber','red')
            ORDER BY finished_at DESC LIMIT 1
          )
          WHERE t.project_id = ? AND t.status != 'archived'
          ORDER BY t.created_at ASC`,
    args: [projectId],
  })

  const trails: TrailHealthSummary[] = trailsR.rows.map((row: any) => {
    const v = String(row.last_verdict || "none")
    const health = (v === "green" || v === "amber" || v === "red") ? v : "none"
    return {
      trailId: String(row.id),
      trailName: String(row.name),
      health: health as TrailHealthSummary["health"],
      lastRunAt: row.last_run_at != null ? Number(row.last_run_at) : null,
      totalRuns: Number(row.total_runs ?? 0),
    }
  })

  // 2. Bug / feedback counts — aggregate, no content exposed
  const feedbackR = await db.execute({
    sql: `SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status IN ('done','resolved') THEN 1 ELSE 0 END) AS resolved
          FROM feedback WHERE project_id = ?`,
    args: [projectId],
  })
  const totalBugs = Number((feedbackR.rows[0] as any)?.total ?? 0)
  const resolvedBugs = Number((feedbackR.rows[0] as any)?.resolved ?? 0)

  // 3. Findings (AutoSim-caught regressions) counts
  const findingsR = await db.execute({
    sql: `SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status='queued' THEN 1 ELSE 0 END) AS open
          FROM findings WHERE project_id = ?`,
    args: [projectId],
  })
  const totalFindings = Number((findingsR.rows[0] as any)?.total ?? 0)
  const openFindings = Number((findingsR.rows[0] as any)?.open ?? 0)

  // 4. Recurring issues count
  const recurringR = await db.execute({
    sql: `SELECT COUNT(*) AS n FROM feedback WHERE project_id = ? AND status != 'dismissed'
          GROUP BY project_id HAVING COUNT(*) > 1`,
    args: [projectId],
  })
  // Simple heuristic: count feedback items that share a recurrence flag or just use top-recurring
  // We'll use a DB query for findings recurrence >= 2 as a proxy
  const recurringFindingsR = await db.execute({
    sql: `SELECT COUNT(*) AS n FROM findings WHERE project_id = ? AND recurrence >= 2`,
    args: [projectId],
  })
  const recurringIssues = Number((recurringFindingsR.rows[0] as any)?.n ?? 0)

  // 5. Recent activity: last 20 terminal runs across all trails (last 14 days)
  const sinceMs = Date.now() - 14 * 24 * 3600 * 1000
  const activityR = await db.execute({
    sql: `SELECT t.name AS trail_name, tr.status, tr.finished_at
          FROM trail_runs tr
          JOIN trails t ON t.id = tr.trail_id
          WHERE tr.project_id = ?
            AND tr.status IN ('green', 'amber', 'red')
            AND tr.finished_at >= ?
          ORDER BY tr.finished_at DESC
          LIMIT 20`,
    args: [projectId, sinceMs],
  })

  const recentActivity = activityR.rows.map((row: any) => ({
    label: String(row.trail_name),
    verdict: String(row.status) as "green" | "amber" | "red",
    runAt: Number(row.finished_at),
  }))

  return {
    projectName: proj.name,
    generatedAt: Date.now(),
    branding: portalBranding,
    trails,
    counts: {
      bugsReported: totalBugs,
      bugsResolved: resolvedBugs,
      regressionsFound: totalFindings,
      recurringIssues,
      openFindings,
    },
    recentActivity,
  }
}
