// KLAVITYKLA-486 — typed COGS recorders. The ONE place cost math (units × rate) is applied.
//
// Every non-LLM cost we incur per workspace is written to the `cost_events` ledger (lib/db.ts) so the
// superadmin P&L can compute margin against 100% of COGS, not just LLM spend. Rate constants come from
// env ONLY (never hardcoded at call sites); the defaults are conservative public list-ish prices:
//   - S3 storage  ~ $0.023 / GB-month
//   - S3 egress   ~ $0.09  / GB
//   - Browser/CDP ~ $0.005 / wall-clock minute (local Chromium amortized / Steel-ish)
//   - Email send  ~ $0.0006 / SendGrid message
//
// All recorders are fire-and-forget friendly: they swallow their own errors so instrumenting a hot
// path (upload, walk finally, mail send) can never break the primary operation. Bytes → GB uses the
// decimal GB (1e9) that S3 bills on, not GiB.

import { recordCostEvent } from "./db"

const GB = 1_000_000_000

function num(env: string | undefined, dflt: number): number {
  const n = Number(env)
  return Number.isFinite(n) && n >= 0 ? n : dflt
}

export function s3StorageRateUsdPerGbMonth(): number { return num(process.env.KLAV_S3_GB_MONTH_USD, 0.023) }
export function s3EgressRateUsdPerGb(): number { return num(process.env.KLAV_S3_EGRESS_GB_USD, 0.09) }
export function browserRateUsdPerMin(): number { return num(process.env.KLAV_BROWSER_MIN_USD, 0.005) }
export function emailRateUsdPerSend(): number { return num(process.env.KLAV_EMAIL_SEND_USD, 0.0006) }

/** Log bytes STORED to S3 (screenshots, attachments, recordings) for a project. */
export async function recordS3Storage(opts: { projectId?: string | null; bytes: number; meta?: Record<string, unknown> }): Promise<void> {
  try {
    const bytes = Math.max(0, Number(opts.bytes) || 0)
    if (bytes <= 0) return
    const gb = bytes / GB
    await recordCostEvent({
      kind: "s3_storage", projectId: opts.projectId ?? null, units: gb,
      costUsd: gb * s3StorageRateUsdPerGbMonth(), meta: { bytes, ...(opts.meta || {}) },
    })
  } catch (e: any) { console.error("recordS3Storage failed (non-fatal):", e?.message || e) }
}

/** Log bytes SERVED from S3 (presigned/img serve) for a project. */
export async function recordS3Egress(opts: { projectId?: string | null; bytes: number; meta?: Record<string, unknown> }): Promise<void> {
  try {
    const bytes = Math.max(0, Number(opts.bytes) || 0)
    if (bytes <= 0) return
    const gb = bytes / GB
    await recordCostEvent({
      kind: "s3_egress", projectId: opts.projectId ?? null, units: gb,
      costUsd: gb * s3EgressRateUsdPerGb(), meta: { bytes, ...(opts.meta || {}) },
    })
  } catch (e: any) { console.error("recordS3Egress failed (non-fatal):", e?.message || e) }
}

/** Log wall-clock browser minutes for one AutoSim run (project + run). This is the real AutoSim COGS
 *  beyond the reheal LLM already captured in ai_calls. */
export async function recordBrowserMinutes(opts: { projectId?: string | null; runId?: string | null; minutes: number; meta?: Record<string, unknown> }): Promise<void> {
  try {
    const minutes = Math.max(0, Number(opts.minutes) || 0)
    if (minutes <= 0) return
    await recordCostEvent({
      kind: "browser_min", projectId: opts.projectId ?? null, runId: opts.runId ?? null, units: minutes,
      costUsd: minutes * browserRateUsdPerMin(), meta: opts.meta,
    })
  } catch (e: any) { console.error("recordBrowserMinutes failed (non-fatal):", e?.message || e) }
}

/** Log one (or more) SendGrid email send(s) for a project. project may be null for pre-account sends
 *  (e.g. OTP) — those still count toward total email COGS but attribute to no workspace. */
export async function recordEmailSend(opts: { projectId?: string | null; count?: number; meta?: Record<string, unknown> }): Promise<void> {
  try {
    const count = Math.max(0, Number(opts.count ?? 1) || 0)
    if (count <= 0) return
    await recordCostEvent({
      kind: "email_send", projectId: opts.projectId ?? null, units: count,
      costUsd: count * emailRateUsdPerSend(), meta: opts.meta,
    })
  } catch (e: any) { console.error("recordEmailSend failed (non-fatal):", e?.message || e) }
}
