// Klavity GTM funnel — KLAVITYKLA-327.
// Tracks the user journey from the free CRO tool through signup and paid conversion.
// The table is append-only; analysis queries group by event+source.

import type { Client } from "@libsql/client"

export const FUNNEL_EVENTS = [
  "check_started",
  "check_completed",
  "lead_captured",
  "app_connected",
  "continuous_enabled",
  "checkout_started",
  "subscription_created",
  "subscription_canceled",
  // KLAVITYKLA-331 — founder booking CTA on the unlocked report / nurture email.
  "booking_cta_clicked",
  "meeting_booked",
  // The /bug-check Sim walk-through played all the way through. The walk is the free tool's hook
  // and the delight IS the conversion mechanism, so "did they actually watch it" is the signal that
  // tells us whether the hook is doing its job — measured against unlock/signup downstream.
  "simwalk_completed",
] as const

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number]

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
