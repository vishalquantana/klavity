// KLA-738 / KLA-739 — OG social-card DATA loader: resolve a shared ref to its typed, ANON-SAFE card
// data + a cache version. Extracted from server.ts as a dependency-injected pure orchestration so the
// C1 privacy gate + teaser redaction are unit-testable WITHOUT booting the app (the QA negative-control
// rule: a green test must reproduce the REAL access path). The impure edges (ref resolution, the DB row
// read, the anonymous access decision, persona lookup) are injected; all policy lives here.

import { resolveOgType, safeHexColor, type OgCardData, type Severity } from "./og-card"
import type { TicketViewAccess } from "./ticket-viewers"

// The subset of the feedback row the OG loader reads. `ver` is the pre-computed cache version
// (MAX(updated_at, last_seen_at, created_at)) so edits AND recurrences bust the immutable cache (C2-5).
export interface OgFeedbackRow {
  id: string
  sim_id?: string | null
  source?: string | null
  report_type?: string | null
  reporter_json?: string | null
  title?: string | null
  observation?: string | null
  suggested_bug_json?: string | null
  priority?: string | null
  source_quote?: string | null
  ver?: string | number | null
}

// Map a stored priority/severity to a display severity badge for the card.
export function ogSeverityFor(priority: string | null | undefined): Severity | null {
  switch (String(priority || "").trim().toLowerCase()) {
    case "urgent": return { label: "P1 · Critical", cls: "c1" }
    case "high":   return { label: "P2 · High", cls: "c1" }
    case "medium": return { label: "C2 · Needs work", cls: "c2" }
    case "low":    return { label: "C3 · Polish", cls: "c3" }
    default: return null
  }
}

// KLA-739 (C1): an anonymous crawler may only be served a REAL per-type card for a ticket the anon share
// endpoint would actually serve — i.e. share_mode=public ('full') or a teaser mode ('teaser'). A
// login-gated ('login', share_mode=off) or approval-pending ('pending') ref is NOT anon-serveable → the
// caller serves the default card instead (indistinguishable from an unknown ref, so no existence oracle).
export function ogAnonServeable(access: TicketViewAccess): boolean {
  return access === "full" || access === "teaser"
}

// KLA-739 (C1): redact a fully-resolved card to what an ANONYMOUS teaser viewer may see. The teaser
// exposes title + priority (severity) but WITHHOLDS: the human reporter; the Sim's verbatim finding
// (source_quote); and the Sim's persona identity (name/role/initials/accent). Only called when the anon
// access level is NOT 'full' (i.e. a teaser-mode share, never public).
export function redactOgCardForAnon(data: OgCardData): OgCardData {
  if (data.type === "human") {
    return { ...data, reporter: null }
  }
  if (data.type === "sim") {
    // Fall the finding back to the (public) title; strip all persona identity to a generic Sim.
    return { ...data, finding: data.title, simName: "A Sim", simRole: null, initials: null, accent: null }
  }
  return data
}

export interface OgDataDeps {
  /** Resolve an opaque/short ref to its feedback id + project. */
  resolveRef: (ref: string) => Promise<{ id: string; projectId: string } | null>
  /** Read the feedback row (with pre-computed `ver`) for a resolved id, or null. */
  loadRow: (projectId: string, id: string) => Promise<OgFeedbackRow | null>
  /** The ANONYMOUS (sessionEmail=null) share-access decision for this ticket. */
  anonAccess: (id: string) => Promise<TicketViewAccess>
  /** Project persona list (for a Sim card's identity), best-effort. */
  listPersonas: (projectId: string) => Promise<any[]>
  /** Compute the display title from the row. */
  effectiveTitle: (row: any) => string
}

/**
 * Resolve a shared ref to its typed OG card data + cache version. Returns null when the ref can't be
 * resolved OR (with opts.anon) when it is not anon-serveable (login-gated/pending) — the caller then
 * serves the default card. With opts.anon and a teaser-level share, the returned card is REDACTED.
 */
export async function loadOgCardData(
  deps: OgDataDeps,
  ref: string,
  opts?: { anon?: boolean },
): Promise<{ data: OgCardData; version: string; title: string; description: string } | null> {
  const resolved = await deps.resolveRef(ref).catch(() => null)
  if (!resolved) return null

  // C1: apply the anonymous access decision BEFORE reading any ticket content.
  let anonAccess: TicketViewAccess | null = null
  if (opts?.anon) {
    anonAccess = await deps.anonAccess(resolved.id).catch(() => "login" as const)
    if (!ogAnonServeable(anonAccess)) return null // login/pending → not anon-serveable → default card
  }
  const anonPublic = !opts?.anon || anonAccess === "full"

  const row = await deps.loadRow(resolved.projectId, resolved.id).catch(() => null)
  if (!row) return null

  const reporter = (() => { try { return row.reporter_json ? JSON.parse(String(row.reporter_json)) : null } catch { return null } })()
  const title = deps.effectiveTitle({ title: row.title, suggested_bug_json: row.suggested_bug_json, observation: row.observation })
  const ogType = resolveOgType({
    reportType: row.report_type != null ? String(row.report_type) : null,
    simId: row.sim_id != null ? String(row.sim_id) : null,
    source: row.source != null ? String(row.source) : null,
    reporter: reporter && reporter.name ? { name: String(reporter.name) } : null,
  })
  const version = String(row.ver ?? "1")
  const severity = ogSeverityFor(row.priority != null ? String(row.priority) : null)
  const ticketKey = String(row.id).split("-")[0]
  const description = title

  let data: OgCardData
  if (ogType === "sim") {
    const persona = (await deps.listPersonas(resolved.projectId).catch(() => [])).find((p: any) => p.id === String(row.sim_id))
    const finding = (row.source_quote && String(row.source_quote).trim()) || title
    data = {
      type: "sim", ticketKey, title, finding, severity,
      simName: persona?.name || "A Sim", simRole: persona?.role || null,
      // Accent is a CSS-context value → normalize to a strict hex here (C2-4) as well as in the template.
      initials: persona?.initials || null, accent: persona?.accent ? safeHexColor(persona.accent) : null,
    }
  } else if (ogType === "human") {
    data = { type: "human", ticketKey, title, severity, reporter: reporter?.name ? String(reporter.name) : null }
  } else {
    // default (feature/task/query or unresolved provenance) — generic branded card.
    return { data: { type: "default" }, version, title, description }
  }

  // C1: redact to the anonymous teaser level unless the ticket is anon-PUBLIC.
  if (!anonPublic) data = redactOgCardForAnon(data)
  return { data, version, title, description }
}
