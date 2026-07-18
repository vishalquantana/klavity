// CRO Sim — the "why isn't my site converting?" front door.
//
// A single ephemeral persona ("Sim") lands on a public URL like a real first-time visitor, tries to
// convert, and reports the conversion frictions that stopped them — grounded in what the page actually
// says. This is the SAME idea as the product's Sims/AutoSim, scoped down to one anonymous run so it can
// be a public, ungated top-of-funnel lead magnet (site/cro.html + /api/cro/*).
//
// This module is PURE (no I/O, no DB, no LLM client): the prompt, the output types, and the two
// functions that (a) sanitize whatever the model returns into a safe shape and (b) split it into the
// ungated preview vs. the email-gated full report. That keeps it unit-testable without a server.

export type CroSeverity = "critical" | "high" | "medium" | "low"

export interface CroFriction {
  title: string // short label, e.g. "No clear value proposition"
  severity: CroSeverity
  where: string // page location, e.g. "hero headline", "pricing section", "primary CTA"
  quote: string // verbatim page text OR a first-person visitor line ("I couldn't tell what you sell")
  why: string // why it costs conversions
  fix: string // concrete, specific suggested change
}

export interface CroPersona {
  name: string
  role: string // who they are, e.g. "Skeptical first-time buyer comparing 3 tools"
  initials: string // 2 uppercase letters
  accent: string // hex colour
  oneLiner: string // first-person summary of their visit
}

export interface CroReport {
  persona: CroPersona
  verdict: string // headline judgment / narration of the attempt
  frictions: CroFriction[] // ranked worst-first
  oneFixNow: string // the single highest-impact change
}

// The ungated slice returned by /api/cro/analyze — persona + verdict + the top 2 frictions, plus the
// count that stays locked behind the email gate.
export interface CroPreview {
  persona: CroPersona
  verdict: string
  frictionsShown: CroFriction[]
  totalFrictions: number
  hiddenCount: number
}

export const CRO_SEVERITIES: CroSeverity[] = ["critical", "high", "medium", "low"]
const SEVERITY_RANK: Record<CroSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 }

// How many frictions are visible before the email gate.
export const CRO_PREVIEW_FRICTIONS = 2
// Upper bound on frictions we keep from a single run (defends the UI + payload against a runaway model).
export const CRO_MAX_FRICTIONS = 8

// System prompt: one skeptical visitor Sim critiques a page's conversion, grounded in its text.
export const CRO_SYS =
  "You are a Klavity Sim: a specific, believable first-time visitor who just landed on a product's public web page and is trying to decide whether to sign up / buy. " +
  "Read ONLY the page text provided and behave like that visitor. Your job is a blunt-but-fair conversion-rate (CRO) critique: find the frictions that would stop a real person like you from converting. " +
  "Ground every friction in what the page actually says — quote the page verbatim where you can, or state plainly what you looked for and couldn't find. Do NOT invent features, prices, or claims the page doesn't make. " +
  "Rank frictions worst-first by conversion impact. Severity: \"critical\" = likely makes visitors bounce or fail to understand the offer; \"high\" = strong drop-off risk; \"medium\" = notable friction; \"low\" = minor polish. " +
  "Respond with ONLY a JSON object, no prose: " +
  "{\"persona\":{\"name\":string,\"role\":string,\"initials\":string(2 uppercase letters),\"accent\":string(hex colour like #6366f1),\"oneLiner\":string(a first-person sentence summarizing your visit)}," +
  "\"verdict\":string(2-3 first-person sentences narrating your attempt to convert and whether you would)," +
  "\"frictions\":[{\"title\":string(short),\"severity\":\"critical\"|\"high\"|\"medium\"|\"low\",\"where\":string(page location),\"quote\":string(verbatim page text or a first-person line),\"why\":string(why it costs conversions),\"fix\":string(one concrete change)}]," +
  "\"oneFixNow\":string(the single highest-impact change to make first)} " +
  "Return 4 to 6 frictions, most severe first."

function str(v: unknown, max: number): string {
  if (v == null) return ""
  return String(v).replace(/\s+/g, " ").trim().slice(0, max)
}

function severity(v: unknown): CroSeverity {
  const s = String(v || "").toLowerCase().trim()
  return (CRO_SEVERITIES as string[]).includes(s) ? (s as CroSeverity) : "medium"
}

// A 2-letter uppercase monogram, derived from the name when the model omits/garbles `initials`.
function initialsFrom(raw: unknown, name: string): string {
  const cleaned = String(raw || "").replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase()
  if (cleaned.length === 2) return cleaned
  const parts = name.split(/\s+/).filter(Boolean)
  const guess = ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase()
  return guess.length === 2 ? guess : "SM"
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/
function accent(v: unknown): string {
  const s = String(v || "").trim()
  return HEX_RE.test(s) ? s.toLowerCase() : "#6366f1"
}

// Coerce whatever the LLM returned into a safe, bounded CroReport. Never throws — a malformed model
// response degrades to empty strings / [] rather than breaking the endpoint.
export function normalizeCroReport(raw: any): CroReport {
  const r = raw && typeof raw === "object" ? raw : {}
  const p = r.persona && typeof r.persona === "object" ? r.persona : {}
  const name = str(p.name, 60) || "A first-time visitor"

  const frictions: CroFriction[] = Array.isArray(r.frictions) ? r.frictions : []
  const cleaned = frictions
    .filter((f) => f && typeof f === "object")
    .map((f: any) => ({
      title: str(f.title, 120),
      severity: severity(f.severity),
      where: str(f.where, 120),
      quote: str(f.quote, 400),
      why: str(f.why, 400),
      fix: str(f.fix, 400),
    }))
    // A friction with no title AND no explanation is noise — drop it.
    .filter((f) => f.title || f.why)
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .slice(0, CRO_MAX_FRICTIONS)

  return {
    persona: {
      name,
      role: str(p.role, 120) || "First-time visitor",
      initials: initialsFrom(p.initials, name),
      accent: accent(p.accent),
      oneLiner: str(p.oneLiner, 240),
    },
    verdict: str(r.verdict, 600),
    frictions: cleaned,
    oneFixNow: str(r.oneFixNow, 400),
  }
}

// Split a full report into the ungated preview (persona + verdict + top-N frictions + locked count).
export function croPreview(report: CroReport): CroPreview {
  const shown = report.frictions.slice(0, CRO_PREVIEW_FRICTIONS)
  return {
    persona: report.persona,
    verdict: report.verdict,
    frictionsShown: shown,
    totalFrictions: report.frictions.length,
    hiddenCount: Math.max(0, report.frictions.length - shown.length),
  }
}
