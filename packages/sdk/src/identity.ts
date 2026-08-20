// PX4 #439 / #427 / #428 — Identify API + safe fallback + browser/app info capture for the no-install widget.
//
// This module is pure and DOM-injectable (all readers take optional doc/win/nav args) so it is fully
// unit-testable without a real browser. It never touches cookies or auth storage and it hard-guards the
// best-effort fallback against grabbing unrelated third-party PII/tokens.

import type { Reporter, ClientInfo, ReportIdentity } from "@klavity/core"

// The named Reporter fields, in a fixed order. Anything outside this set is dropped (we do NOT forward
// arbitrary host keys as identity — those belong in setMetadata()).
export const REPORTER_KEYS = [
  "id", "email", "name", "org", "orgId", "role", "product", "env", "server",
] as const

const MAX_VALUE_LEN = 500

// Coerce an untrusted identify() / config / data-attr input into a bounded Reporter. Non-object input,
// or an object with no recognized non-empty fields, yields undefined. Values are String()-coerced,
// trimmed, and capped — matching the server-side sanitizer so the client never sends more than persists.
export function coerceReporter(input: unknown): Reporter | undefined {
  if (!input || typeof input !== "object") return undefined
  const src = input as Record<string, unknown>
  const out: Reporter = {}
  for (const k of REPORTER_KEYS) {
    const v = src[k]
    if (v === undefined || v === null) continue
    const s = String(v).slice(0, MAX_VALUE_LEN).trim()
    if (s) (out as Record<string, string>)[k] = s
  }
  return Object.keys(out).length ? out : undefined
}

// Project a Reporter down to the historical G5 ReportIdentity string-map so it still flows through
// ReportContext.identity (back-compat: existing consumers + the ticket body's identity lines).
export function reporterToIdentity(r: Reporter | undefined): ReportIdentity | undefined {
  if (!r) return undefined
  const out: ReportIdentity = {}
  for (const [k, v] of Object.entries(r)) if (v != null && v !== "") out[k] = String(v)
  return Object.keys(out).length ? out : undefined
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// Accept a value ONLY if it looks like a real email (bounded). Rejects tokens, JSON, anything oversized.
function safeEmail(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined
  const s = v.trim()
  return s.length >= 3 && s.length <= 200 && EMAIL_RE.test(s) ? s : undefined
}

// Accept a value ONLY if it looks like a human name label. Rejects URLs, markup, bracket/JSON chars,
// and long single tokens (likely ids/JWTs/session keys) — the guard against grabbing third-party PII.
function safeName(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined
  const s = v.trim()
  if (!s || s.length > 120) return undefined
  if (/[<>{}[\]()@/\\|]|https?:|\bBearer\b|\bey[A-Za-z0-9_-]{10,}/i.test(s)) return undefined
  // A long, space-free token is almost certainly an identifier, not a display name.
  if (!/\s/.test(s) && s.length > 40) return undefined
  return s
}

// PX4 #427 — best-effort name/email resolution when NO identity was supplied, from a few documented,
// bounded, safe sources ONLY:
//   1. <meta name="klavity:user-email"> / <meta name="klavity:user-name">  (documented, explicit)
//   2. common non-secret globals: window.currentUser / window.user  (email/name-ish props only)
// It never reads cookies or auth storage, and every candidate passes the safeEmail/safeName guards.
export function resolveFallbackReporter(
  doc: Document | undefined = typeof document !== "undefined" ? document : undefined,
  win: (Window & typeof globalThis) | undefined = typeof window !== "undefined" ? (window as any) : undefined,
): Reporter | undefined {
  const out: Reporter = {}
  // 1. documented meta tags
  try {
    if (doc) {
      const e = safeEmail(doc.querySelector('meta[name="klavity:user-email"]')?.getAttribute("content"))
      if (e) out.email = e
      const n = safeName(doc.querySelector('meta[name="klavity:user-name"]')?.getAttribute("content"))
      if (n) out.name = n
    }
  } catch { /* ignore */ }
  // 2. conservative globals — read ONLY email/name-shaped props off well-known user objects.
  if ((!out.email || !out.name) && win) {
    for (const key of ["currentUser", "user"]) {
      try {
        const g = (win as any)[key]
        if (!g || typeof g !== "object") continue
        if (!out.email) { const e = safeEmail(g.email ?? g.userEmail ?? g.emailAddress); if (e) out.email = e }
        if (!out.name) { const n = safeName(g.name ?? g.fullName ?? g.displayName ?? g.username); if (n) out.name = n }
      } catch { /* ignore a throwing getter */ }
    }
  }
  return Object.keys(out).length ? out : undefined
}

// ── PX4 #428 — browser / OS / locale capture ────────────────────────────────────────────────────────
// Conservative UA parsing (bounded regex, no external UA-parser dependency). Order matters: Edge/OPR
// must be tested before Chrome (they include "Chrome" in their UA), and Chrome before Safari.
function parseBrowser(ua: string): { browser?: string; version?: string } {
  const tests: Array<[string, RegExp]> = [
    ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
    ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
    ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
    ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
    ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+).*Safari/],
  ]
  for (const [name, re] of tests) {
    const m = ua.match(re)
    if (m) return { browser: name, version: m[1] }
  }
  return {}
}

function parseOS(ua: string): string | undefined {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11"
  if (/Windows NT/.test(ua)) return "Windows"
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS"
  if (/Android/.test(ua)) return "Android"
  if (/Mac OS X/.test(ua)) return "macOS"
  if (/CrOS/.test(ua)) return "ChromeOS"
  if (/Linux/.test(ua)) return "Linux"
  return undefined
}

// Capture the client's browser/OS/viewport/locale. Every read is guarded so a hostile or headless
// environment (missing screen/Intl/etc.) never throws — the field is simply omitted.
export function captureClientInfo(
  win: (Window & typeof globalThis) | undefined = typeof window !== "undefined" ? (window as any) : undefined,
  nav: Navigator | undefined = typeof navigator !== "undefined" ? navigator : undefined,
): ClientInfo {
  const out: ClientInfo = {}
  const ua = (nav && nav.userAgent) || ""
  if (ua) out.userAgent = ua.slice(0, 500)
  const b = parseBrowser(ua)
  if (b.browser) out.browser = b.browser
  if (b.version) out.browserVersion = b.version
  const os = parseOS(ua)
  if (os) out.os = os
  out.deviceType = /Mobi|Android|iPhone|iPod/i.test(ua) && !/iPad|Tablet/i.test(ua)
    ? "mobile"
    : (/iPad|Tablet/i.test(ua) ? "tablet" : "desktop")
  try { if (win) out.viewport = `${win.innerWidth}x${win.innerHeight}` } catch { /* ignore */ }
  try { if (win && win.screen) out.screen = `${win.screen.width}x${win.screen.height}` } catch { /* ignore */ }
  try { if (win && win.devicePixelRatio) out.devicePixelRatio = Math.round(win.devicePixelRatio * 100) / 100 } catch { /* ignore */ }
  try { if (nav && nav.language) out.locale = String(nav.language).slice(0, 35) } catch { /* ignore */ }
  try {
    if (nav && Array.isArray((nav as any).languages) && (nav as any).languages.length) {
      out.languages = (nav as any).languages.slice(0, 10).join(",").slice(0, 120)
    }
  } catch { /* ignore */ }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz) out.timezone = String(tz).slice(0, 60)
  } catch { /* ignore */ }
  return out
}
