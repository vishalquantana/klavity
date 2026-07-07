// Slack alert when an AutoSim walk finishes RED (regression).
//
// Invoked fire-and-forget from trails-runner.ts after finishWalk — a failure here must
// NEVER affect the walk result or the DB record. Same contract as lib/signup-alert.ts.
//
// Enabled by SLACK_SIGNUP_WEBHOOK_URL (reuses the existing signup-alert channel).
// KLAV_BASE_URL is used to build a deep-link into the walk-detail page.

import { safeFetch } from "./safe-fetch"
import { formatIST } from "./signup-alert"

export interface WalkRedAlertContext {
  trailName: string
  trailId: string
  projectId: string
  runId: string
  /** Human-readable reasons (from WalkSummary.reasons — always non-empty on RED). */
  reasons: string[]
  /** epoch ms when the walk finished */
  at: number
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s
}

function field(label: string, value: string) {
  return { type: "mrkdwn", text: `*${label}*\n${value}` }
}

export function buildWalkRedSlackPayload(ctx: WalkRedAlertContext, baseUrl?: string) {
  const walkUrl = baseUrl ? `${baseUrl}/autosims/walk/${ctx.runId}` : null

  const reasonSummary = ctx.reasons.length
    ? ctx.reasons.map((r) => `• ${r}`).join("\n")
    : "No reason recorded"

  const fields = [
    field("Trail", truncate(ctx.trailName, 80)),
    field("Verdict", "🔴 RED — regression detected"),
    field("Findings", truncate(reasonSummary, 300)),
    field("Time", formatIST(ctx.at)),
  ]
  if (walkUrl) {
    fields.push(field("Walk report", `<${walkUrl}|View full walk →>`))
  }

  return {
    text: `🔴 AutoSim walk RED: "${ctx.trailName}"`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "🔴 AutoSim: RED walk detected", emoji: true } },
      { type: "section", fields },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `Trail \`${ctx.trailId}\` · Run \`${ctx.runId}\` · Project \`${ctx.projectId}\`` }],
      },
    ],
  }
}

export async function notifyWalkRed(ctx: WalkRedAlertContext): Promise<void> {
  const webhook = process.env.SLACK_SIGNUP_WEBHOOK_URL
  if (!webhook) return

  try {
    const baseUrl = process.env.KLAV_BASE_URL
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
