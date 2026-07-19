// ── Heartbeat failure diagnosis (KLAVITYKLA-295, JTBD 6.5) ──────────────────────────────────────
// A project's "heartbeat" is the widget phoning home via POST /api/widget/ping (see server.ts /widget/ping
// + latestWidgetPing in lib/db.ts). When a project that should be reporting goes silent — the widget was
// never detected, or stopped pinging, or reports dried up — a founder needs to know WHY, not just THAT.
//
// This module is a PURE mapping: heartbeat signals → a likely-cause diagnosis + concrete fix steps. It does
// no I/O so it is trivially unit-testable and reusable by both the dashboard status surface and the
// "email my developer" route. Server-side we can only *observe* ping recency / host / config — we cannot see
// the customer's page, so causes that need the page (a missing <script>, a Content-Security-Policy directive)
// are surfaced as ranked *candidate* causes inside the fix steps rather than asserted as fact.

export type HeartbeatSignals = {
  now: number                      // current time (ms epoch) — injected so the mapping stays pure/testable
  everSeen: boolean                // has /widget.js EVER pinged for this project (a widget_pings row exists)?
  lastSeen: number | null          // ms epoch of the most recent ping, or null if never
  firstSeen: number | null         // ms epoch of the first ever ping, or null if never
  pingHost: string | null          // host the widget last pinged from (as stored), or null
  expectedHost: string | null      // host we EXPECT it on, derived from project.siteUrl / account.domain, or null
  widgetMode: string               // "support" | "leadgen" | "off"
  reportGate: string               // "anonymous" | "email" | "login"
  recentReportCount: number        // reports received inside the staleness window (real user activity proxy)
  staleAfterMs?: number            // silence longer than this ⇒ "went dark"; default 24h
}

export type HeartbeatCause =
  | "healthy"
  | "widget_disabled"   // mode=off — the widget is intentionally not running
  | "not_installed"     // never pinged — script missing OR blocked by CSP before it could load
  | "went_silent"       // was pinging, then stopped — recent deploy dropped the script / CSP change / domain moved
  | "domain_mismatch"   // pinging from a host that isn't the configured domain — wrong key / staging-only / wrong domain
  | "auth_gated"        // widget loads fine but zero reports — the report gate (email/login) is likely blocking users

export type HeartbeatDiagnosis = {
  status: "healthy" | "failing" | "disabled"
  cause: HeartbeatCause
  severity: "ok" | "warn" | "critical"
  title: string        // one-line human summary
  detail: string       // a sentence or two explaining the likely cause
  fix: string[]        // ordered, concrete remediation steps (plain text, safe for email + UI)
}

const DEFAULT_STALE_MS = 24 * 60 * 60 * 1000 // 24h

// Normalize a URL or host to a bare, comparable host: lowercase, no protocol, no path, no port, no leading www.
export function normalizeHost(input: string | null | undefined): string | null {
  if (!input) return null
  let h = String(input).trim().toLowerCase()
  if (!h) return null
  h = h.replace(/^[a-z]+:\/\//, "") // strip protocol
  h = h.split("/")[0]               // drop path
  h = h.split("?")[0].split("#")[0]
  h = h.split(":")[0]               // drop port
  h = h.replace(/^www\./, "")
  return h || null
}

const INSTALL_SNIPPET = 'Add <script async src="https://klavity.in/widget.js" data-project="<YOUR_PROJECT_ID>"></script> just before </body> on every page you want covered.'
const CSP_HINT = 'If you use a Content-Security-Policy, allow Klavity: script-src https://klavity.in and connect-src https://klavity.in — a CSP change is the most common reason a working widget suddenly stops loading.'

// Map heartbeat signals to a diagnosis. Priority order is deliberate: disabled first (explains silence with
// certainty), then the strongest actionable signal, falling through to "healthy".
export function diagnoseHeartbeat(sig: HeartbeatSignals): HeartbeatDiagnosis {
  const staleAfter = sig.staleAfterMs ?? DEFAULT_STALE_MS
  const pingHost = normalizeHost(sig.pingHost)
  const expectedHost = normalizeHost(sig.expectedHost)
  const isStale = sig.lastSeen == null || sig.now - sig.lastSeen > staleAfter
  const fresh = sig.lastSeen != null && sig.now - sig.lastSeen <= staleAfter

  // 1) Intentionally off — not a failure, but it's why nothing is arriving.
  if (sig.widgetMode === "off") {
    return {
      status: "disabled",
      cause: "widget_disabled",
      severity: "warn",
      title: "Widget is turned off",
      detail: "This project's widget mode is set to \"off\", so it isn't loading on your site and no reports can come in.",
      fix: [
        "Open Settings → Widget for this project and switch the mode to \"Support\" (or \"Lead-gen\").",
        "Reload your site and confirm the Klavity button appears.",
      ],
    }
  }

  // 2) Pinging from an unexpected host — the key is live, just not where we expect it. Catch this BEFORE
  //    staleness so a mislabeled-domain install isn't mistaken for "never installed".
  if (pingHost && expectedHost && pingHost !== expectedHost) {
    return {
      status: "failing",
      cause: "domain_mismatch",
      severity: fresh ? "warn" : "critical",
      title: `Widget is live on ${pingHost}, not ${expectedHost}`,
      detail: `Klavity is receiving pings from ${pingHost}, but this project is configured for ${expectedHost}. That usually means the snippet is only on staging, or the wrong project key is deployed on production.`,
      fix: [
        `Confirm the Klavity snippet is installed on ${expectedHost} (your production domain), not only on ${pingHost}.`,
        "Check the data-project key in the <script> tag matches THIS project — a copied key from another project sends reports to the wrong place.",
        `If ${pingHost} is correct, update this project's site URL in Settings so the domains line up.`,
      ],
    }
  }

  // 3) Never seen at all — the widget has never phoned home. Script is missing or blocked before it loads.
  if (!sig.everSeen) {
    return {
      status: "failing",
      cause: "not_installed",
      severity: "critical",
      title: "Widget has never been detected",
      detail: "Klavity has not received a single load from your site, so either the script tag isn't on the page or a Content-Security-Policy is blocking it before it can run.",
      fix: [
        INSTALL_SNIPPET,
        "Open your site, then your browser's DevTools → Network tab, and confirm widget.js loads (status 200).",
        CSP_HINT,
        "Make sure the snippet is on the live/production page a visitor actually loads — not only a local or staging build.",
      ],
    }
  }

  // 4) Was seen, then went dark — a working install stopped. Most often a deploy dropped the tag or a CSP changed.
  if (isStale) {
    const lastSeenNote = sig.lastSeen != null
      ? `The widget last loaded around ${new Date(sig.lastSeen).toISOString()} and has been silent since.`
      : "The widget has gone silent."
    return {
      status: "failing",
      cause: "went_silent",
      severity: "critical",
      title: "Widget was working but has gone silent",
      detail: `${lastSeenNote} It was installed correctly before, so something changed recently — a deploy likely removed the snippet, a CSP was tightened, or the domain moved.`,
      fix: [
        "Check your most recent deploy: confirm the Klavity <script> tag is still in the page HTML.",
        CSP_HINT,
        "Open the live site with DevTools → Network and confirm widget.js still loads (status 200, not blocked).",
        INSTALL_SNIPPET,
      ],
    }
  }

  // 5) Widget loads fine (fresh ping) but no reports are coming in AND a gate is in the way — likely the gate.
  if (fresh && sig.recentReportCount === 0 && sig.reportGate !== "anonymous") {
    const gateName = sig.reportGate === "login" ? "sign-in required" : "email required"
    return {
      status: "failing",
      cause: "auth_gated",
      severity: "warn",
      title: "Widget loads, but the report gate may be blocking users",
      detail: `The widget is loading fine, but no reports have arrived and reporting requires ${gateName}. Users may be dropping off at the gate before they can submit.`,
      fix: [
        "In Settings → Widget, consider setting the report gate to \"Anonymous\" (or \"Email\") to lower the barrier to reporting.",
        "Verify the sign-in / email step actually works end-to-end by filing a test report yourself.",
        "If reports are genuinely just quiet, no action is needed — the widget is healthy.",
      ],
    }
  }

  // 6) Fresh ping, nothing suspicious — healthy.
  return {
    status: "healthy",
    cause: "healthy",
    severity: "ok",
    title: "Widget is healthy",
    detail: "Klavity is receiving regular loads from your site. No action needed.",
    fix: [],
  }
}

// Render the diagnosis as an email-client-safe HTML body + plain-text alternative, addressed to a developer
// who is being asked to fix the install. Kept here (next to the diagnosis) so the copy stays in one place.
export function renderDeveloperEmail(input: {
  projectName: string
  diagnosis: HeartbeatDiagnosis
  dashboardUrl?: string | null
  fromName?: string | null // the person asking (e.g. the founder), for the intro line
}): { subject: string; html: string; text: string } {
  const { projectName, diagnosis } = input
  const esc = (s: string) => String(s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string))
  const who = input.fromName ? `${input.fromName} asked Klavity to send you this.` : "Klavity sent you this on behalf of your team."
  const subject = `Klavity widget needs a fix on ${projectName}: ${diagnosis.title}`

  const steps = diagnosis.fix.length ? diagnosis.fix : ["No action needed — the widget is healthy."]
  const stepsHtml = steps.map((s) => `<li style="margin:0 0 8px;line-height:1.5">${esc(s)}</li>`).join("")
  const stepsText = steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")
  const dashLink = input.dashboardUrl
    ? `<p style="margin:20px 0 0;font-size:13px"><a href="${esc(input.dashboardUrl)}" style="color:#4f46e5">Open the project in Klavity →</a></p>`
    : ""

  const f = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f3f7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f7"><tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(20,16,40,.10)">
      <tr><td style="background:#1e1b4b;padding:22px 28px">
        <div style="${f};font-size:20px;font-weight:800;color:#fff;letter-spacing:-.02em">Klavity</div>
        <div style="${f};font-size:12px;color:#a5b4fc;margin-top:2px">Widget health alert</div>
      </td></tr>
      <tr><td style="padding:26px 28px 6px">
        <p style="margin:0 0 6px;${f};font-size:12px;color:#8a8696">${esc(who)}</p>
        <h1 style="margin:0 0 4px;${f};font-size:19px;font-weight:700;color:#1d1d1f">${esc(diagnosis.title)}</h1>
        <p style="margin:6px 0 0;${f};font-size:12px;color:#8a8696">Project: <strong style="color:#3f3a52">${esc(projectName)}</strong></p>
        <p style="margin:14px 0 0;${f};font-size:14px;line-height:1.6;color:#3f3a52">${esc(diagnosis.detail)}</p>
      </td></tr>
      <tr><td style="padding:16px 28px 8px">
        <div style="${f};font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6366f1;margin-bottom:8px">How to fix it</div>
        <ol style="${f};margin:0;padding-left:20px;font-size:14px;color:#3f3a52">${stepsHtml}</ol>
        ${dashLink}
      </td></tr>
      <tr><td style="padding:18px 28px 26px">
        <div style="border-top:1px solid #eceaf2;padding-top:14px">
          <p style="margin:0;${f};font-size:11px;line-height:1.6;color:#a3a0ad">Sent by Klavity — AI that finds your bugs before your users do.</p>
        </div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`

  const text = `${who}

${diagnosis.title}
Project: ${projectName}

${diagnosis.detail}

How to fix it:
${stepsText}
${input.dashboardUrl ? `\nOpen in Klavity: ${input.dashboardUrl}\n` : ""}
— Sent by Klavity`

  return { subject, html, text }
}
