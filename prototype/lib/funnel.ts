// Klavity GTM funnel — KLAVITYKLA-327.
// Tracks the user journey from the free CRO tool through signup and paid conversion.
// The table is append-only; analysis queries group by event+source.

import type { Client } from "@libsql/client"
// KLA-547: milestones mirror into PostHog under their long-lived names (see MILESTONE_POSTHOG_ALIAS).
// A lib-level import is safe here: posthog.ts has no db.ts dependency by design (hermetic).
import { capturePosthog } from "./posthog"

export const FUNNEL_EVENTS = [
  "check_started",
  "check_completed",
  "lead_captured",
  "app_connected",
  "continuous_enabled",
  "checkout_started",
  "subscription_created",
  "subscription_canceled",
  // 30-day money-back guarantee: an admin requested a refund inside the window (server-owned; the
  // request emails/alerts ops — a human issues the actual Stripe refund).
  "refund_requested",
  // KLAVITYKLA-331 — founder booking CTA on the unlocked report / nurture email.
  "booking_cta_clicked",
  "meeting_booked",
  // The /bug-check Sim walk-through played all the way through. The walk is the free tool's hook
  // and the delight IS the conversion mechanism, so "did they actually watch it" is the signal that
  // tells us whether the hook is doing its job — measured against unlock/signup downstream.
  "simwalk_completed",

  // ── KLA-547 conversion milestone taxonomy ─────────────────────────────────────
  // One canonical name per funnel stage, mirrored into PostHog (same names — see
  // POSTHOG_MILESTONE_EVENTS below) so the two stores answer with one vocabulary.
  // signup: a genuinely new account (mirrors the existing PostHog signup_completed emit).
  "signup",
  // project_created: first project on an account (mirrors the existing PostHog project_created emit).
  "project_created",
  // widget_installed: the Snap widget phoned home from an external host for the FIRST time for a
  // project (widget_pings upsert transitioned null→row). Server-derived from /api/widget/ping.
  "widget_installed",
  // first_report: the project's very first persisted report, any surface (widget / extension /
  // extension-session). Mirrors the existing PostHog first_bug_filed emit.
  "first_report",
  // first_sim: the project's first Sim review that produced reactions. Mirrors the existing PostHog
  // first_sim_run emit.
  "first_sim",
  // first_autosim: the project's first AutoSim trail walk STARTED (manual or scheduled), via the
  // single runWalkNow choke point.
  "first_autosim",
  // upgrade: a paid subscription went live (mirrors the existing subscription_created emit; the
  // Stripe-webhook call site remains the writer of subscription_created itself).
  "upgrade",
] as const

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number]

// KLA-547: the ordered conversion milestones. The funnel ladder the growth scorecard and PostHog
// funnels are read from. Names here match the PostHog event names exactly (the pre-existing
// signup_completed / project_created / first_bug_filed / first_sim_run PostHog events keep their
// historical names — see MILESTONE_POSTHOG_ALIAS) so nothing already shipped breaks and old
// PostHog data stays queryable under the same names.
export const CONVERSION_MILESTONES = [
  "signup",
  "project_created",
  "widget_installed",
  "first_report",
  "first_sim",
  "first_autosim",
  "upgrade",
] as const

export type ConversionMilestone = (typeof CONVERSION_MILESTONES)[number]

/**
 * PostHog alias per milestone. The PostHog stream predates this taxonomy (KLAVITYKLA-335 fired
 * signup_completed / first_bug_filed / first_sim_run before KLA-547 existed), so renaming would
 * orphan history. The alias maps each milestone to its long-lived PostHog name; `null` means the
 * PostHog event name IS the milestone name (new events introduced by KLA-547).
 */
export const MILESTONE_POSTHOG_ALIAS: Record<ConversionMilestone, string | null> = {
  signup: "signup_completed",
  project_created: null,
  widget_installed: null,
  first_report: "first_bug_filed",
  first_sim: "first_sim_run",
  first_autosim: null,
  upgrade: "purchase",
}

/** PostHog event name for a milestone — the alias when one exists, else the milestone name. */
export function posthogEventForMilestone(m: ConversionMilestone): string {
  return MILESTONE_POSTHOG_ALIAS[m] ?? m
}

// Events that anonymous clients are allowed to fire via POST /api/track.
// Server owns the conversion events (check_completed onward) so they can't be spoofed.
// booking_cta_clicked is a pure intent signal fired from the page (KLAVITYKLA-331) — spoofing it
// buys nothing, and there is no server-side hook for a link click.
// simwalk_completed joins them for the same reason: it is a pure engagement signal with no
// server-side hook (the server cannot know the client finished playing the animation), and
// spoofing it buys an attacker nothing — it gates no conversion event.
export const CLIENT_INGESTABLE: readonly string[] = ["check_started", "booking_cta_clicked", "simwalk_completed"] as const

export interface FunnelParams {
  event: FunnelEvent
  anonId?: string
  email?: string
  accountId?: string
  url?: string
  source?: string
  medium?: string
  campaign?: string
  referrer?: string
  props?: Record<string, unknown>
}

export interface FunnelRow {
  id: string
  event: FunnelEvent
  anon_id: string | null
  email: string | null
  account_id: string | null
  source: string | null
  medium: string | null
  campaign: string | null
  referrer: string | null
  url: string | null
  props_json: string | null
  created_at: number
}

// Extract the utm_source from a query string or fall back to "direct".
export function normalizeSource(rawUrl?: string, referrer?: string): string {
  if (rawUrl) {
    try {
      const u = new URL(rawUrl)
      const s = u.searchParams.get("utm_source")
      if (s) return s.slice(0, 100)
    } catch {}
  }
  if (referrer) {
    try {
      const r = new URL(referrer)
      return r.hostname.replace(/^www\./, "").slice(0, 100)
    } catch {}
  }
  return "direct"
}

export function buildFunnelRow(params: FunnelParams): FunnelRow {
  if (!(FUNNEL_EVENTS as readonly string[]).includes(params.event)) {
    throw new Error(`Unknown funnel event: ${params.event}`)
  }
  const source = params.source ?? normalizeSource(params.url, params.referrer)
  return {
    id: "fe_" + crypto.randomUUID(),
    event: params.event,
    anon_id: params.anonId ?? null,
    email: params.email ?? null,
    account_id: params.accountId ?? null,
    source,
    medium: params.medium ?? null,
    campaign: params.campaign ?? null,
    referrer: params.referrer ?? null,
    url: params.url ?? null,
    props_json: params.props ? JSON.stringify(params.props) : null,
    created_at: Date.now(),
  }
}

// Non-throwing — funnel writes must never surface errors to callers.
export async function trackFunnel(dbClient: Client, params: FunnelParams): Promise<void> {
  try {
    const row = buildFunnelRow(params)
    await dbClient.execute({
      sql: `INSERT INTO funnel_events
              (id,event,anon_id,email,account_id,source,medium,campaign,referrer,url,props_json,created_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        row.id, row.event, row.anon_id, row.email, row.account_id,
        row.source, row.medium, row.campaign, row.referrer, row.url,
        row.props_json, row.created_at,
      ],
    })
  } catch (e: unknown) {
    console.error("[funnel] trackFunnel error (non-fatal):", (e as Error)?.message ?? e)
  }
}

// ── KLA-547: one helper for conversion-milestone emits ───────────────────────────
// A milestone is ALWAYS written to funnel_events (the queryable store the growth scorecard /
// superadmin read) AND mirrored to PostHog under its long-lived PostHog name (see
// MILESTONE_POSTHOG_ALIAS). One call per milestone emit keeps the two stores in vocabulary lockstep
// and means a future event can't end up in only one of them. Both legs are fire-and-forget +
// non-fatal, exactly like trackFunnel/capturePosthog themselves.

export interface MilestoneParams {
  /** The taxonomy stage being emitted (must be one of CONVERSION_MILESTONES). */
  milestone: ConversionMilestone
  dbClient?: Client | null
  anonId?: string
  email?: string
  accountId?: string
  projectId?: string
  url?: string
  source?: string
  referrer?: string
  props?: Record<string, unknown>
}

/** Build the property bag a milestone carries into BOTH stores (ids + closed vocabularies only). */
export function buildMilestoneProps(p: Pick<MilestoneParams, "projectId" | "props">): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (p.projectId) out.project_id = p.projectId
  // Explicit props win over reserved keys; unknown keys pass through (closed vocabularies are the
  // caller's responsibility — mirrors how FunnelParams.props behaves for trackFunnel).
  return { ...out, ...(p.props ?? {}) }
}

/**
 * Emit one conversion milestone: funnel_events row + PostHog mirror. Never throws; safe to `void`.
 * When dbClient is missing (local dev / no DB), the PostHog leg still fires — analytics must not
 * depend on the DB being present, mirroring how capturePosthog is used standalone today.
 */
export async function trackMilestone(dbClient: Client | null | undefined, params: MilestoneParams): Promise<void> {
  const phEvent = posthogEventForMilestone(params.milestone)
  const distinctId = params.email ?? params.accountId ?? params.anonId ?? "server"
  try {
    await capturePosthog(distinctId, phEvent, buildMilestoneProps(params))
  } catch { /* non-fatal by contract */ }
  if (!dbClient) return
  await trackFunnel(dbClient, {
    event: params.milestone,
    anonId: params.anonId,
    email: params.email,
    accountId: params.accountId,
    url: params.url,
    source: params.source,
    referrer: params.referrer,
    props: buildMilestoneProps(params),
  })
}
