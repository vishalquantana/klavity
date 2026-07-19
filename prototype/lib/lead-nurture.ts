// lib/lead-nurture.ts — GTM lead nurture sequence (KLAVITYKLA-330).
//
// Enrolls CRO-tool leads in a 3-step email sequence via SendGrid:
//   Step 1 (immediate) — "Your friction report is ready" recap + re-run link
//   Step 2 (+1 day)    — "Connect your app for continuous checks" conversion nudge
//   Step 3 (+3 days)   — Social proof: "What breaks silently after every ship"
//
// State tables (added to applySchema in db.ts):
//   lead_nurture_sequences — one row per (email, sequence); step + next_at
//   lead_nurture_emails    — one row per sent email; sg_message_id for open/click tracking
//
// Architecture mirrors sims-digest.ts (injectable deps, hermetic tests):
//   enrollLead()                — upsert sequence row; step 1 is fired by the caller immediately
//   buildNurtureEmail()         — pure renderer for each of the 3 steps
//   recordNurtureEmailSent()    — persist send record + fire funnel_event (best-effort)
//   recordSendgridEvents()      — update opened_at/clicked_at from SendGrid webhook
//   tickLeadNurture()           — process sequences where next_at <= now (steps 2 + 3)
//   startLeadNurtureScheduler() — hourly setInterval wrapper

import type { Client } from "@libsql/client"

export const SEQUENCE_CRO = "cro"
// KLAVITYKLA-341: bug-check leads get their own nurture sequence row (distinct `sequence` value)
// so the two free tools' leads stay segmentable end-to-end (enrollment, sent-email history, and
// per-tool copy) without a schema change — `sequence` was already the segmentation column.
export const SEQUENCE_BUGCHECK = "bugcheck"
export const NURTURE_DAY_MS = 24 * 60 * 60 * 1000

/** Delay from enroll before step 2 fires (+1 day). */
export const STEP2_DELAY_MS = NURTURE_DAY_MS
/** Delay from step 2 fire before step 3 fires (+2 more days = +3 days total). */
export const STEP3_DELAY_MS = 2 * NURTURE_DAY_MS
/** Scheduler tick interval — 1 hour (matches sims-digest). */
export const NURTURE_TICK_MS = 60 * 60 * 1000

// step values stored in DB: 2 = "next to send is step 2", 3 = "next is step 3", NULL = done
const STEP_SCHED_FIRST = 2
const STEP_SCHED_LAST  = 3

// ── Email templates ───────────────────────────────────────────────────────────

const F = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"

function esc(s: string): string {
  return String(s || "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string))
}

function brandedEmail(
  subtitle: string,
  accentTitle: string,
  bodyHtml: string,
  ctaHref: string,
  ctaLabel: string,
  unsubLink: string,
): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f3f7">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f7">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 2px 10px rgba(20,16,40,.10)">
<tr><td align="center" style="background:#1e1b4b;padding:26px 28px 18px">
<div style="${F};font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-.02em">Klavity</div>
<div style="${F};font-size:12px;font-weight:600;color:#a5b4fc;letter-spacing:.16em;text-transform:uppercase;margin-top:4px">${esc(subtitle)}</div>
</td></tr>
<tr><td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:18px 28px">
<div style="${F};font-size:18px;font-weight:700;color:#ffffff">${esc(accentTitle)}</div>
</td></tr>
<tr><td style="padding:24px 28px 8px">${bodyHtml}</td></tr>
<tr><td style="padding:8px 28px 28px;text-align:center">
<a href="${esc(ctaHref)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;${F};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px">${esc(ctaLabel)}</a>
</td></tr>
<tr><td style="padding:0 28px 24px">
<div style="border-top:1px solid #eceaf2;padding-top:14px">
<p style="margin:0;${F};font-size:11px;line-height:1.6;color:#a3a0ad">You received this because you used the Klavity CRO tool. <a href="${esc(unsubLink)}" style="color:#a3a0ad">Unsubscribe</a></p>
</div>
</td></tr>
</table>
<p style="margin:18px 0 0;${F};font-size:11px;color:#b6b3c0">Sent by Klavity &middot; <a href="https://klavity.in" style="color:#b6b3c0">klavity.in</a></p>
</td></tr>
</table>
</body></html>`
}

// KLAVITYKLA-331 — the founder's booking link, configurable per environment via CAL_BOOKING_URL.
export const DEFAULT_CAL_BOOKING_URL = "https://cal.com/klavity/15min"

/** Resolve the Cal.com booking URL and tag it with a source so bookings are attributable. */
export function calBookingLink(configured?: string, source?: string): string {
  const raw = String(configured ?? process.env.CAL_BOOKING_URL ?? "").trim()
  const base = /^https?:\/\//i.test(raw) ? raw : DEFAULT_CAL_BOOKING_URL
  if (!source) return base
  return base + (base.includes("?") ? "&" : "?") + "utm_source=klavity&utm_campaign=" + encodeURIComponent(source)
}

export interface NurtureEmailContent {
  subject: string
  html: string
  text: string
}

// KLAVITYKLA-341: per-tool copy so the step-1 recap actually matches what the person just did —
// "friction report" reads oddly to someone who just ran a bug scan, and vice versa.
function toolCopy(tool?: string): { label: string; noun: string; toolLink: string; verb: string } {
  if (tool === "bugcheck") return { label: "Bug Check", noun: "bugs", toolLink: "/bug-check", verb: "scanned" }
  return { label: "CRO", noun: "friction", toolLink: "/cro", verb: "analysed" }
}

export function buildStep1Email(opts: { analyzedUrl?: string; baseUrl?: string; tool?: string }): NurtureEmailContent {
  const url = opts.analyzedUrl || "your site"
  const base = (opts.baseUrl || "https://klavity.in").replace(/\/$/, "")
  const t = toolCopy(opts.tool)
  const toolLink = `${base}${t.toolLink}`
  const unsubLink = `${base}/unsubscribe`
  const reportNoun = t.noun === "bugs" ? "bug report" : "friction report"

  const body = `
<p style="${F};font-size:15px;line-height:1.6;color:#3f3a52;margin:0 0 14px">
  Thanks for using the Klavity ${esc(t.label)} tool on <strong>${esc(url)}</strong>.
</p>
<p style="${F};font-size:14px;line-height:1.6;color:#6b6678;margin:0 0 14px">
  Your full ${esc(reportNoun)} is ready — the real ${esc(t.noun)} we found when we ${esc(t.verb)} the page.
  Share it with your team, or re-run the check any time a new version ships.
</p>
<div style="background:#f3f1ff;border-left:3px solid #6366f1;border-radius:8px;padding:14px 16px;margin-bottom:0">
  <p style="${F};font-size:13px;line-height:1.5;color:#3f3a52;margin:0">
    <strong>What's next?</strong> What we found today is a snapshot.
    Klavity's Sims catch it <em>continuously</em> — so you know the moment something
    regresses after a deploy.
  </p>
</div>`

  const text = [
    `Thanks for using the Klavity ${t.label} tool on ${url}.`,
    "",
    `Your full ${reportNoun} is ready — the real ${t.noun} we found when we ${t.verb} the page.`,
    "Share it with your team or re-run the check any time.",
    "",
    "What's next? What we found today is a snapshot.",
    "Klavity's Sims catch it continuously — so you know the moment something regresses.",
    "",
    `Re-run the check: ${toolLink}`,
    "",
    "Sent by Klavity · klavity.in",
    `Unsubscribe: ${unsubLink}`,
  ].join("\n")

  return {
    subject: `Your ${t.label} report for ${url}`,
    html: brandedEmail(`${t.label} Report`, `Your ${reportNoun} is ready`, body, toolLink, "Re-run the check →", unsubLink),
    text,
  }
}

export function buildStep2Email(opts: { analyzedUrl?: string; baseUrl?: string; calBookingUrl?: string }): NurtureEmailContent {
  const url = opts.analyzedUrl || "your site"
  const base = (opts.baseUrl || "https://klavity.in").replace(/\/$/, "")
  const ctaLink = `${base}/onboarding?ref=cro-step2`
  const unsubLink = `${base}/unsubscribe`
  // KLAVITYKLA-331 — founder booking link. Tagged so Cal.com attributes the booking to this step.
  const bookingLink = calBookingLink(opts.calBookingUrl, "nurture-step2")

  const body = `
<p style="${F};font-size:15px;line-height:1.6;color:#3f3a52;margin:0 0 14px">
  Yesterday you found friction points on <strong>${esc(url)}</strong>.
</p>
<p style="${F};font-size:14px;line-height:1.6;color:#6b6678;margin:0 0 14px">
  The problem with manual checks? You only see what's broken <em>right now</em>.
  Every deploy is a chance for something to quietly break — and you won't know
  until a real user hits it.
</p>
<div style="background:#f3f1ff;border-left:3px solid #6366f1;border-radius:8px;padding:14px 16px;margin-bottom:0">
  <p style="${F};font-size:13px;line-height:1.5;color:#3f3a52;margin:0 0 8px"><strong>Klavity Sims analyse your product continuously.</strong></p>
  <ul style="${F};font-size:13px;line-height:1.7;color:#6b6678;margin:0;padding-left:18px">
    <li>Run after every deploy — catch regressions before users do</li>
    <li>Replay your real user journeys as persistent AI Sims</li>
    <li>File tickets automatically when something breaks</li>
  </ul>
</div>
<p style="${F};font-size:13px;line-height:1.6;color:#6b6678;margin:16px 0 0;text-align:center">
  Rather talk it through? <a href="${esc(bookingLink)}" style="color:#4f46e5;font-weight:600;text-decoration:none">Book 15 min with the founder</a>
</p>`

  const text = [
    `Yesterday you found friction points on ${url}.`,
    "",
    "The problem with manual checks? You only see what's broken right now.",
    "Every deploy is a chance for something to quietly break.",
    "",
    "Klavity Sims analyse your product continuously:",
    "  · Run after every deploy — catch regressions before users do",
    "  · Replay your real user journeys as persistent AI Sims",
    "  · File tickets automatically when something breaks",
    "",
    `Connect your app: ${ctaLink}`,
    "",
    `Rather talk it through? Book 15 min with the founder: ${bookingLink}`,
    "",
    "Sent by Klavity · klavity.in",
    `Unsubscribe: ${unsubLink}`,
  ].join("\n")

  return {
    subject: "Catch what breaks silently after you ship",
    html: brandedEmail("Continuous QA", "Connect your app for continuous checks", body, ctaLink, "Connect your app →", unsubLink),
    text,
  }
}

export function buildStep3Email(opts: { analyzedUrl?: string; baseUrl?: string }): NurtureEmailContent {
  const base = (opts.baseUrl || "https://klavity.in").replace(/\/$/, "")
  const ctaLink = `${base}/onboarding?ref=cro-step3`
  const unsubLink = `${base}/unsubscribe`

  const body = `
<p style="${F};font-size:15px;line-height:1.6;color:#3f3a52;margin:0 0 14px">
  Every week, teams ship builds they feel good about.
</p>
<p style="${F};font-size:14px;line-height:1.6;color:#6b6678;margin:0 0 14px">
  Three days later, a real user can't complete checkout. Not because the code
  broke — because the UX <em>silently degraded</em>. A form label gone. A
  button not responding on mobile. A redirect going somewhere unexpected.
</p>
<p style="${F};font-size:14px;line-height:1.6;color:#6b6678;margin:0 0 14px">
  The worst part: it was already broken in the last deploy. And the one before.
</p>
<div style="background:#f3f1ff;border-left:3px solid #6366f1;border-radius:8px;padding:14px 16px;margin-bottom:0">
  <p style="${F};font-size:13px;line-height:1.5;color:#3f3a52;margin:0">
    Klavity's Sims walk your product like a real user — after every deploy,
    on a schedule, or whenever you ask. They file a ticket the moment something
    changes that shouldn't. Free to start. No credit card.
  </p>
</div>`

  const text = [
    "Every week, teams ship builds they feel good about.",
    "",
    "Three days later, a real user can't complete checkout. Not because the code broke —",
    "because the UX silently degraded. A form label gone. A button not responding on mobile.",
    "",
    "The worst part: it was already broken in the last deploy. And the one before.",
    "",
    "Klavity's Sims walk your product like a real user — after every deploy,",
    "on a schedule, or whenever you ask. Free to start. No credit card.",
    "",
    `Start free: ${ctaLink}`,
    "",
    "Sent by Klavity · klavity.in",
    `Unsubscribe: ${unsubLink}`,
  ].join("\n")

  return {
    subject: "What breaks silently after every ship",
    html: brandedEmail("Real-user QA", "The UX breaks you didn't see coming", body, ctaLink, "Start free — no credit card →", unsubLink),
    text,
  }
}

/** Build email content for a given nurture step (1, 2, or 3). Pure — no I/O. */
export function buildNurtureEmail(step: number, opts: { analyzedUrl?: string; baseUrl?: string; tool?: string; calBookingUrl?: string }): NurtureEmailContent {
  if (step === 1) return buildStep1Email(opts)
  if (step === 2) return buildStep2Email(opts)
  if (step === 3) return buildStep3Email(opts)
  throw new Error(`Unknown nurture step: ${step}`)
}

// ── DB operations ─────────────────────────────────────────────────────────────

function nid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`
}

export interface EnrollResult {
  enrolled: boolean
  sequenceId: string
}

/**
 * Insert a lead into the nurture sequence for the given tool ("cro" default, "bugcheck" —
 * KLAVITYKLA-341). Idempotent per (email, tool): second call for the same tool returns
 * enrolled=false; a lead can be enrolled in BOTH tools' sequences independently.
 * Step 1 is NOT sent here — the caller sends it immediately after enrolling.
 * Steps 2 and 3 are scheduled via next_at and processed by tickLeadNurture().
 */
export async function enrollLead(
  c: Client,
  email: string,
  opts: { source?: string; url?: string; nowMs?: number; tool?: string } = {},
): Promise<EnrollResult> {
  const now = opts.nowMs ?? Date.now()
  const sequence = opts.tool === "bugcheck" ? SEQUENCE_BUGCHECK : SEQUENCE_CRO
  const existing = await c.execute({
    sql: `SELECT id FROM lead_nurture_sequences WHERE email=? AND sequence=?`,
    args: [email, sequence],
  })
  if (existing.rows.length) {
    return { enrolled: false, sequenceId: String((existing.rows[0] as any).id) }
  }

  const id = nid("lns")
  await c.execute({
    sql: `INSERT INTO lead_nurture_sequences (id, email, sequence, step, source, url, next_at, enrolled_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, email, sequence, STEP_SCHED_FIRST, opts.source ?? null, opts.url ?? null, now + STEP2_DELAY_MS, now],
  })
  return { enrolled: true, sequenceId: id }
}

/** Record that a nurture email was sent. Also fires a funnel_event row (best-effort). */
export async function recordNurtureEmailSent(
  c: Client,
  sequenceId: string,
  step: number,
  sgMessageId?: string | null,
  nowMs?: number,
): Promise<void> {
  const now = nowMs ?? Date.now()
  await c.execute({
    sql: `INSERT INTO lead_nurture_emails (id, sequence_id, step, sg_message_id, sent_at) VALUES (?, ?, ?, ?, ?)`,
    args: [nid("lne"), sequenceId, step, sgMessageId ?? null, now],
  })
  try {
    const r = await c.execute({ sql: `SELECT email, sequence FROM lead_nurture_sequences WHERE id=?`, args: [sequenceId] })
    if (r.rows.length) {
      const email = String((r.rows[0] as any).email)
      const sequence = String((r.rows[0] as any).sequence || SEQUENCE_CRO)
      await c.execute({
        sql: `INSERT INTO funnel_events (id, event, email, props_json, created_at) VALUES (?, ?, ?, ?, ?)`,
        args: [nid("fe"), "email_sent", email, JSON.stringify({ step, sequence }), now],
      })
    }
  } catch { /* best-effort */ }
}

export interface SendgridEvent {
  sgMessageId: string
  eventType: string  // "open" | "click" | "delivered" | ...
  timestampMs: number
}

/** Process SendGrid event webhook payloads — update opened_at/clicked_at + fire funnel events. */
export async function recordSendgridEvents(c: Client, events: SendgridEvent[]): Promise<void> {
  for (const ev of events) {
    if (!ev.sgMessageId) continue
    try {
      if (ev.eventType === "open") {
        await c.execute({
          sql: `UPDATE lead_nurture_emails SET opened_at=? WHERE sg_message_id=? AND opened_at IS NULL`,
          args: [ev.timestampMs || Date.now(), ev.sgMessageId],
        })
        await insertEmailFunnelEvent(c, ev.sgMessageId, "email_opened", ev.timestampMs)
      } else if (ev.eventType === "click") {
        await c.execute({
          sql: `UPDATE lead_nurture_emails SET clicked_at=? WHERE sg_message_id=? AND clicked_at IS NULL`,
          args: [ev.timestampMs || Date.now(), ev.sgMessageId],
        })
        await insertEmailFunnelEvent(c, ev.sgMessageId, "email_clicked", ev.timestampMs)
      }
    } catch { /* best-effort per event */ }
  }
}

async function insertEmailFunnelEvent(c: Client, sgMessageId: string, event: string, ts: number): Promise<void> {
  try {
    const r = await c.execute({
      sql: `SELECT lns.email FROM lead_nurture_emails lne
            JOIN lead_nurture_sequences lns ON lns.id = lne.sequence_id
            WHERE lne.sg_message_id=? LIMIT 1`,
      args: [sgMessageId],
    })
    if (!r.rows.length) return
    const email = String((r.rows[0] as any).email)
    await c.execute({
      sql: `INSERT INTO funnel_events (id, event, email, created_at) VALUES (?, ?, ?, ?)`,
      args: [nid("fe"), event, email, ts || Date.now()],
    })
  } catch { /* best-effort */ }
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

export interface LeadNurtureDeps {
  db: Client
  /** Send email to a single recipient. */
  sendEmail: (to: string, subject: string, html: string, text: string) => Promise<void>
  baseUrl?: string
  nowMs?: () => number
}

/**
 * Find all sequences where next_at <= now and send the next scheduled step.
 * Called by startLeadNurtureScheduler() every hour.
 * Exported so tests can call it directly without a real setInterval.
 */
export async function tickLeadNurture(deps: LeadNurtureDeps): Promise<void> {
  const now = deps.nowMs ? deps.nowMs() : Date.now()

  const r = await deps.db.execute({
    sql: `SELECT id, email, step, url, sequence FROM lead_nurture_sequences
          WHERE step IS NOT NULL AND next_at IS NOT NULL AND next_at <= ? AND unsubscribed_at IS NULL
          ORDER BY next_at ASC LIMIT 100`,
    args: [now],
  })

  for (const row of r.rows as any[]) {
    const seqId = String(row.id)
    const email = String(row.email)
    const step = Number(row.step)
    const analyzedUrl = row.url ? String(row.url) : undefined
    const tool = String(row.sequence || SEQUENCE_CRO) === SEQUENCE_BUGCHECK ? "bugcheck" : "cro"

    try {
      const content = buildNurtureEmail(step, { analyzedUrl, baseUrl: deps.baseUrl, tool })
      await deps.sendEmail(email, content.subject, content.html, content.text)
      await recordNurtureEmailSent(deps.db, seqId, step, null, now)

      if (step < STEP_SCHED_LAST) {
        await deps.db.execute({
          sql: `UPDATE lead_nurture_sequences SET step=?, next_at=? WHERE id=?`,
          args: [step + 1, now + STEP3_DELAY_MS, seqId],
        })
      } else {
        await deps.db.execute({
          sql: `UPDATE lead_nurture_sequences SET step=NULL, next_at=NULL, completed_at=? WHERE id=?`,
          args: [now, seqId],
        })
      }
      console.log(`[lead-nurture] step ${step} sent to ${email}`)
    } catch (e: any) {
      console.warn(`[lead-nurture] step ${step} failed for ${email}:`, e?.message || e)
    }
  }
}

/** Start the hourly lead nurture scheduler. Returns the setInterval handle. */
export function startLeadNurtureScheduler(deps: LeadNurtureDeps): ReturnType<typeof setInterval> {
  return setInterval(() => {
    tickLeadNurture(deps).catch((e) => console.warn("[lead-nurture] tick crashed:", String((e as any)?.message || e)))
  }, NURTURE_TICK_MS)
}
