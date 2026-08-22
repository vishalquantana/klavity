// GA4 Measurement Protocol — server-side `purchase` conversion (KLA-547).
//
// The Stripe webhook is the AUTHORITATIVE source of the purchase conversion: it fires no matter
// what the browser does on return (closed tab, blocked JS, ad-blockers). The client-side gtag
// `purchase` on the success page carries the SAME transaction_id so GA4 dedupes the two into one
// conversion (GA4 dedupes `purchase` by transaction_id within a property).
//
// SAFE-TO-SHIP-BEFORE-SECRET: if KLAV_GA4_API_SECRET is unset/empty this NO-OPs silently, so this
// code can land and deploy before the api_secret is minted in the GA4 Admin UI. It is
// fire-and-forget and never throws into the webhook path.

export const GA4_MEASUREMENT_ID = "G-Q9H005LW9K"
const GA4_MP_ENDPOINT = "https://www.google-analytics.com/mp/collect"

export interface Ga4PurchaseInput {
  /**
   * GA4 client_id. Prefer the REAL `_ga` cookie client id when it is available on the account so
   * the server event joins the same GA session/user as the browser. In a server-to-server webhook
   * the `_ga` cookie is not present, so callers pass a stable synthetic id derived from the Stripe
   * customer id (see syntheticClientId) — deterministic so repeat events for one customer share an id.
   */
  clientId: string
  transactionId: string
  valueCents: number
  currency: string
  plan: string
  interval?: string
}

export interface Ga4Payload {
  client_id: string
  events: Array<{
    name: "purchase"
    params: {
      transaction_id: string
      value: number
      currency: string
      items: Array<{ item_id: string; item_name: string; price: number }>
    }
  }>
}

/**
 * Deterministic, GA-shaped synthetic client_id ("<digits>.<digits>") derived from a stable seed
 * (e.g. the Stripe customer id). Same seed → same id, so multiple purchase events for one customer
 * are attributed to a single GA user rather than fragmenting into new ones. Pure function.
 */
export function syntheticClientId(seed: string): string {
  const s = String(seed || "anon")
  // Two independent 32-bit FNV-1a-ish hashes → two positive integers, joined GA-style.
  let h1 = 0x811c9dc5
  let h2 = 0xcbf29ce4
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0
    h2 = Math.imul(h2 ^ (c + 7), 0x01000193) >>> 0
  }
  return `${h1}.${h2}`
}

/** Pure builder for the GA4 MP `purchase` payload — unit-tested for shape. */
export function buildGa4PurchasePayload(input: Ga4PurchaseInput): Ga4Payload {
  const value = Math.round((input.valueCents / 100) * 100) / 100
  return {
    client_id: input.clientId,
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: input.transactionId,
          value,
          currency: input.currency,
          items: [{ item_id: input.plan, item_name: input.plan, price: value }],
        },
      },
    ],
  }
}

/** Minimal shape of the Stripe `checkout.session.completed` object we read for the mirror. */
export interface StripeSessionLike {
  amount_total?: number | null
  currency?: string | null
  subscription?: string | null
  id?: string | null
  customer?: string | null
  metadata?: { plan?: string | null; interval?: string | null } | null
}

/**
 * Pure: derive the purchase-mirror inputs from a Stripe checkout session. Returns null when the
 * event isn't fireable (no stable transaction id, or a non-positive value). Keeping this pure lets
 * the webhook's value/transaction_id/client_id logic be unit-tested without spawning the server.
 *
 * - valueCents: Stripe `amount_total` (authoritative for what was charged); catalog unit_amount fallback.
 * - transaction_id: Stripe subscription id (stable → GA4 dedupe with the client), session id fallback.
 * - clientId: synthetic, from the Stripe customer id (server-to-server has no `_ga` cookie).
 */
export function purchaseMirrorFromSession(
  sess: StripeSessionLike | null | undefined,
  fallbackAccountId: string,
  catalogUnitAmount: (plan: string, interval: string) => number | undefined,
): Ga4PurchaseInput | null {
  const plan = sess?.metadata?.plan ? String(sess.metadata.plan) : ""
  const interval = sess?.metadata?.interval ? String(sess.metadata.interval) : ""
  const amount = Number(sess?.amount_total)
  const valueCents = Number.isFinite(amount) && amount > 0 ? amount : (catalogUnitAmount(plan, interval) ?? 0)
  const currency = sess?.currency ? String(sess.currency) : "usd"
  const transactionId = sess?.subscription ? String(sess.subscription) : (sess?.id ? String(sess.id) : "")
  const clientId = syntheticClientId(sess?.customer ? String(sess.customer) : fallbackAccountId)
  if (!transactionId || !(valueCents > 0)) return null
  return { clientId, transactionId, valueCents, currency, plan, interval }
}

/**
 * Fire-and-forget GA4 Measurement Protocol `purchase`. NO-OP (returns silently) when
 * KLAV_GA4_API_SECRET is unset/empty. Never throws.
 */
export async function sendGa4Purchase(input: Ga4PurchaseInput): Promise<void> {
  const apiSecret = process.env.KLAV_GA4_API_SECRET
  if (!apiSecret) return // safe no-op before the secret exists

  try {
    const url = `${GA4_MP_ENDPOINT}?measurement_id=${encodeURIComponent(GA4_MEASUREMENT_ID)}&api_secret=${encodeURIComponent(apiSecret)}`
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildGa4PurchasePayload(input)),
    })
  } catch {
    // Analytics must never affect the webhook — swallow.
  }
}
