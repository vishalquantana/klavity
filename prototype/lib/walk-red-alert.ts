// Slack alert when an AutoSim walk finishes RED.
//
// Invoked fire-and-forget from trails-runner.ts after finishWalk — a failure here must
// NEVER affect the walk result or the DB record. Same contract as lib/signup-alert.ts.
//
// TWO kinds of RED, routed to DIFFERENT channels (KLAVITYKLA-195 fix):
//   • INFRASTRUCTURE failure (failureKind "crash" OR browserUnavailable) — the walk never really ran
//     (e.g. the Steel/remote browser could not be reached). This is NOT a product regression, so it
//     must NOT say "regression detected" and must NOT go to the regression/signup channel. Routed to
//     SLACK_ERROR_WEBHOOK_URL (via error-alert.reportError) and labelled a connection/infra failure.
//   • GENUINE regression (real RED, not crash/browserUnavailable) — routed to SLACK_ALERT_WEBHOOK_URL.
//     If SLACK_ALERT_WEBHOOK_URL is unset it falls back to SLACK_ERROR_WEBHOOK_URL — NEVER the signup
//     channel (walk alerts must never pollute signup). Signup alerts (lib/signup-alert.ts) are separate.
//
// KLAV_BASE_URL is used to build a deep-link into the walk-detail page.

import { safeFetch } from "./safe-fetch"
import { formatIST } from "./signup-alert"
import { reportError, _isNonProdEnv } from "./error-alert"
import { publishRegressionEvent } from "./regression-events"
import { db } from "./db"
import type { Client } from "@libsql/client"

export interface WalkRedAlertContext {
  trailName: string
  trailId: string
  projectId: string
  runId: string
  /** Human-readable reasons (from WalkSummary.reasons — always non-empty on RED). */
  reasons: string[]
  /** epoch ms when the walk finished */
  at: number
  /** "crash" = infra/hard failure; "regression" = genuine expectation failure. */
  failureKind?: "crash" | "regression"
  /** true when the browser could not be started/reached at all (infra). Implies infra routing. */
  browserUnavailable?: boolean
  /** DB client override (tests). Defaults to the shared `db`. */
  db?: Client | null
}

/**
 * B.6 unified regression alarm — GUARD detector. A genuine walk RED (checkpoint gone / expectation
 * failure, NOT an infra crash) is a regression the guard caught. Publish it into the shared
 * regression stream so it lands in the SAME banner/feed as the memory + sim-reopen detectors, deduped
 * per issue. Kept separate from the Slack side of notifyWalkRed so it also fires (and is testable)
 * regardless of the prod-only Slack gate. NEVER throws.
 */
export async function publishGuardRegression(
  ctx: WalkRedAlertContext, overrides: { db?: Client | null; notify?: boolean } = {},
): Promise<void> {
  if (isInfraFailure(ctx)) return // infra crash is not a product regression
  const c = overrides.db ?? ctx.db ?? db
  if (!c) return
  await publishRegressionEvent({
    projectId: ctx.projectId,
    // One issue per (trail) — repeated RED walks of the same trail collapse into one alarm/hour.
    issueKey: `guard:${ctx.trailId}`,
    source: "guard",
    title: ctx.trailName ? `${ctx.trailName} regression` : "guard regression",
    at: ctx.at,
    baseUrl: (process.env.KLAV_BASE_URL || "").replace("klavity.quantana.top", "klavity.in") || "",
    evidence: { runId: ctx.runId, trailId: ctx.trailId, reasons: ctx.reasons },
  }, { db: c, ...(overrides.notify != null ? { notify: overrides.notify } : {}) }).catch(() => {})
}

/** An infra failure is a crash OR an unavailable browser — never a real product regression. */
export function isInfraFailure(ctx: Pick<WalkRedAlertContext, "failureKind" | "browserUnavailable">): boolean {
  return ctx.failureKind === "crash" || ctx.browserUnavailable === true
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s
}

function field(label: string, value: string) {
  return { type: "mrkdwn", text: `*${label}*\n${value}` }
}

export function buildWalkRedSlackPayload(ctx: WalkRedAlertContext, baseUrl?: string) {
  const walkUrl = baseUrl ? `${baseUrl}/autosims/walk/${ctx.runId}?project=${encodeURIComponent(ctx.projectId)}` : null
  const infra = isInfraFailure(ctx)

  const reasonSummary = ctx.reasons.length
    ? ctx.reasons.map((r) => `• ${r}`).join("\n")
    : "No reason recorded"

  // Label honestly: an infra/connection failure is NOT a regression.
  const verdict = infra ? "🔌 RED — could not reach the browser (infrastructure issue)" : "🔴 RED — one or more steps failed; the app may have a regression"
  const findingsLabel = infra ? "Cause" : "What failed"
  const headerText = infra ? "🔌 AutoSim: walk failed (infrastructure issue)" : "🔴 AutoSim: walk failed — steps did not pass"

  const fields = [
    field("Trail", truncate(ctx.trailName, 80)),
    field("Verdict", verdict),
    field(findingsLabel, truncate(reasonSummary, 300)),
    field("Time", formatIST(ctx.at)),
  ]
  if (walkUrl) {
    fields.push(field("Walk report", `<${walkUrl}|View full walk →>`))
  }

  return {
    text: infra
      ? `🔌 AutoSim couldn't start the browser for trail "${ctx.trailName}" — infrastructure issue`
      : `🔴 AutoSim walk failed for trail "${ctx.trailName}" — one or more steps did not pass`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: headerText, emoji: true } },
      { type: "section", fields },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `Trail \`${ctx.trailId}\` · Run \`${ctx.runId}\` · Project \`${ctx.projectId}\`` }],
      },
    ],
  }
}

export async function notifyWalkRed(ctx: WalkRedAlertContext): Promise<void> {
  // B.6: publish the GUARD regression event into the unified stream FIRST (before the Slack gate),
  // so a genuine walk RED lands in the dashboard banner/feed and fires the founder email even when
  // the walk-Slack channel is unset. The event's own notify does nothing in non-prod (safeFetch/mail
  // are no-ops without env), so this stays test-safe. Fire-and-forget; never blocks the walk result.
  void publishGuardRegression(ctx).catch(() => {})

  // Gate: do nothing in test/CI/dev — prevents flooding Slack from test walk runs.
  // reportError (for infra path) has its own gate, but we also guard the regression
  // path here so the entire function is a no-op in non-prod envs.
  if (_isNonProdEnv()) return

  const baseUrl = (process.env.KLAV_BASE_URL || "").replace("klavity.quantana.top", "klavity.in") || undefined

  // INFRA failure → SLACK_ERROR_WEBHOOK_URL via reportError. Labelled a backend/connection failure,
  // NOT a regression, and NEVER the signup channel. reportError is a no-op when the error webhook
  // is unset (open-core safe default).
  if (isInfraFailure(ctx)) {
    const reason = ctx.reasons.length ? ctx.reasons.join(" | ") : "browser/infra unavailable"
    const walkUrl = baseUrl ? `${baseUrl}/autosims/walk/${ctx.runId}?project=${encodeURIComponent(ctx.projectId)}` : undefined
    await reportError({
      where: "backend",
      message: `AutoSim walk infra failure — "${ctx.trailName}": ${truncate(reason, 300)}`,
      route: walkUrl,
      projectId: ctx.projectId,
      traceId: ctx.runId,
    }).catch((err: any) => console.error("walk-red-alert (infra, non-fatal):", err?.message || err))
    return
  }

  // GENUINE regression → SLACK_ALERT_WEBHOOK_URL, falling back to SLACK_ERROR_WEBHOOK_URL.
  // The signup webhook is intentionally NOT a fallback here — walk alerts must never hit signup.
  const webhook = process.env.SLACK_ALERT_WEBHOOK_URL || process.env.SLACK_ERROR_WEBHOOK_URL
  if (!webhook) return

  try {
    const payload = buildWalkRedSlackPayload(ctx, baseUrl)
    const res = await safeFetch(
      webhook,
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) },
      { allowHosts: ["hooks.slack.com"] },
    )
    if (!res.ok) console.error(`walk-red-alert: webhook returned ${res.status}`)
  } catch (err: any) {
    console.error("walk-red-alert (non-fatal):", err?.message || err)
  }
}
