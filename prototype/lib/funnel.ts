// Acquisition funnel events — the market-signal spine for the CRO / Vibe Check front door and the
// paid conversion that follows it. A single append-only table (funnel_events) records the whole
// journey so you can build a run→lead→activated→paid funnel AND attribute paid users back to the
// channel that produced them (UTMs persisted from first touch → carried to the subscription row).
//
// Self-hosted on Turso (open-core fit, no vendor). Shape is deliberately PostHog-compatible: `event`
// + a props bag + stable person keys (anonId → email → accountId), so this can be mirrored to PostHog
// later without changing any call site.
//
// This module is PURE + a thin non-throwing writer. buildFunnelRow (validate/normalize/clamp) is unit
// -tested without a DB; trackFunnel just persists what it returns and NEVER throws into a request path.

// The canonical funnel, in order. Server-trusted conversion events are emitted server-side; only the
// top-of-funnel `check_started` is accepted from the browser (see CLIENT_INGESTABLE).
export const FUNNEL_EVENTS = [
  "check_started",         // visitor submitted a URL on the tool (client-fired)
  "check_completed",       // a Sim report was produced (server)
  "lead_captured",         // email unlocked the full report (server)
  "app_connected",         // signed-in user connected a real app / created a project (server)
  "continuous_enabled",    // project switched to continuous ("auto") Sim review (server)
  "checkout_started",      // Stripe checkout session created (server)
  "subscription_created",  // first paid conversion — checkout completed (server, webhook)
  "subscription_canceled", // subscription deleted (server, webhook)
] as const

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number]

const EVENT_SET: ReadonlySet<string> = new Set(FUNNEL_EVENTS)
export function isFunnelEvent(s: unknown): s is FunnelEvent {
  return typeof s === "string" && EVENT_SET.has(s)
}

// Events the PUBLIC /api/track endpoint will accept from a browser. Everything else is server-only, so
// a hostile client can't forge `subscription_created` and pollute the funnel.
export const CLIENT_INGESTABLE: ReadonlySet<string> = new Set<FunnelEvent>(["check_started"])

export interface FunnelSource {
  source: string | null
  medium: string | null
  campaign: string | null
  referrer: string | null
}

export interface FunnelInput {
  event: string
  anonId?: string | null
  email?: string | null
  accountId?: string | null
  url?: string | null
  source?: unknown // { source|utm_source, medium|utm_medium, campaign|utm_campaign, referrer }
  props?: Record<string, unknown> | null
}

export interface FunnelRow {
  id: string
  event: FunnelEvent
  anonId: string | null
  email: string | null
  accountId: string | null
  source: string | null
  medium: string | null
  campaign: string | null
  referrer: string | null
  url: string | null
  propsJson: string
  createdAt: number
}

function clampStr(v: unknown, max: number, lower = false): string | null {
  if (v == null) return null
  let s = String(v).trim().slice(0, max)
  if (!s) return null
  return lower ? s.toLowerCase() : s
}

// Accepts either {source,medium,campaign,referrer} or raw {utm_source,...} — whichever the caller has.
export function normalizeSource(raw: any): FunnelSource {
  const r = raw && typeof raw === "object" ? raw : {}
  return {
    source: clampStr(r.source ?? r.utm_source, 80, true),
    medium: clampStr(r.medium ?? r.utm_medium, 80, true),
    campaign: clampStr(r.campaign ?? r.utm_campaign, 120),
    // referrer must be an http(s) URL to be useful; anything else is dropped.
    referrer: (() => {
      const ref = clampStr(r.referrer ?? r.ref, 300)
      return ref && /^https?:\/\//i.test(ref) ? ref : null
    })(),
  }
}

// Serialize a props bag defensively — never let a circular ref or a huge blob break tracking.
function safeProps(props: unknown): string {
  if (!props || typeof props !== "object") return "{}"
  try {
    const s = JSON.stringify(props)
    return s.length > 2000 ? "{}" : s
  } catch {
    return "{}"
  }
}

// Build a validated, bounded row. Returns null for an unknown event (so callers/endpoints can 400).
// id + now are injected so the function stays pure and deterministic under test.
export function buildFunnelRow(input: FunnelInput, id: string, now: number): FunnelRow | null {
  if (!isFunnelEvent(input.event)) return null
  const src = normalizeSource(input.source)
  return {
    id,
    event: input.event,
    anonId: clampStr(input.anonId, 64),
    email: clampStr(input.email, 200, true),
    accountId: clampStr(input.accountId, 64),
    source: src.source,
    medium: src.medium,
    campaign: src.campaign,
    referrer: src.referrer,
    url: clampStr(input.url, 500),
    propsJson: safeProps(input.props),
    createdAt: now,
  }
}

// Minimal DB client surface (matches @libsql/client) so this file needs no import from lib/db.
interface DbLike { execute(q: { sql: string; args: any[] }): Promise<unknown> }

// Persist a funnel event. Fire-and-forget: callers do `void trackFunnel(...)`. Never throws — a
// tracking failure must not affect the user-facing request.
export async function trackFunnel(db: DbLike | null | undefined, input: FunnelInput, gen?: { id?: string; now?: number }): Promise<void> {
  try {
    if (!db) return
    const id = gen?.id ?? crypto.randomUUID()
    const now = gen?.now ?? Date.now()
    const row = buildFunnelRow(input, id, now)
    if (!row) return
    await db.execute({
      sql: `INSERT INTO funnel_events (id,event,anon_id,email,account_id,source,medium,campaign,referrer,url,props_json,created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [row.id, row.event, row.anonId, row.email, row.accountId, row.source, row.medium, row.campaign, row.referrer, row.url, row.propsJson, row.createdAt],
    })
  } catch (e: any) {
    console.error("trackFunnel (non-fatal):", e?.message || e)
  }
}
