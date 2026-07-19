// KLAVITYKLA-304 — runtime gate for the Test-OTP login bypass.
//
// Before this, the bypass (fixed code 666666 for an allowlisted email) was a boot-time env read:
// flipping it on prod meant SSH + env edit + service restart, and — worse — a human had to remember
// to turn it back OFF. This module moves the decision to a runtime-checked setting persisted in
// schema_meta, with a REQUIRED expiry: the gate auto-disables at `enabledUntil` with no restart.
//
// Precedence:
//   1. KLAV_TEST_OTP env var — bootstrap/override for local dev + CI. Never expires, keeps the
//      existing KLAV_TEST_OTP_EMAILS allowlist semantics. Untouched by the /opsadmin control.
//   2. Runtime setting (set from /opsadmin) — {emails, enabledUntil}. Active only while
//      Date.now() < enabledUntil.
// Either path still requires the email to be allowlisted (or a registered test account); neither
// path ever accepts a code other than the fixed test code.
import { db } from "./db"

/** The fixed bypass code. Single source of truth for server.ts + the gate. */
export const TEST_OTP_CODE = "666666"

/** Durations offered by the /opsadmin control, in hours. A duration is always required. */
export const TEST_OTP_DURATIONS_H = [1, 4, 12] as const
const MAX_DURATION_H = 24

const SETTING_KEY = "test_otp_gate"

export interface TestOtpGate {
  /** Epoch ms after which the runtime gate is inert. 0 = never enabled / explicitly disabled. */
  enabledUntil: number
  /** Lowercased allowlist for the runtime gate. */
  emails: string[]
  updatedBy: string | null
  updatedAt: number
}

const EMPTY: TestOtpGate = { enabledUntil: 0, emails: [], updatedBy: null, updatedAt: 0 }

export function normalizeEmails(raw: string | string[]): string[] {
  const parts = Array.isArray(raw) ? raw : String(raw ?? "").split(/[,\s]+/)
  const out: string[] = []
  for (const p of parts) {
    const e = String(p ?? "").trim().toLowerCase()
    if (e && e.includes("@") && !out.includes(e)) out.push(e)
  }
  return out
}

/** Read the persisted runtime gate. Never throws — a missing/corrupt row reads as "off". */
export async function getTestOtpGate(): Promise<TestOtpGate> {
  if (!db) return { ...EMPTY }
  try {
    const r = await db.execute({ sql: "SELECT value FROM schema_meta WHERE key=?", args: [SETTING_KEY] })
    if (!r.rows.length) return { ...EMPTY }
    const o = JSON.parse(String((r.rows[0] as any).value))
    if (!o || typeof o !== "object" || Array.isArray(o)) return { ...EMPTY }
    return {
      enabledUntil: Number(o.enabledUntil) || 0,
      emails: normalizeEmails(Array.isArray(o.emails) ? o.emails : []),
      updatedBy: o.updatedBy ? String(o.updatedBy) : null,
      updatedAt: Number(o.updatedAt) || 0,
    }
  } catch { return { ...EMPTY } }
}

/**
 * Enable the runtime gate for `durationHours` from now. Duration is REQUIRED and capped at 24h so
 * a fat-fingered value can't leave the bypass on indefinitely.
 */
export async function enableTestOtpGate(
  emails: string | string[], durationHours: number, updatedBy?: string | null,
): Promise<TestOtpGate> {
  const list = normalizeEmails(emails)
  if (!list.length) throw new Error("At least one allowlisted email is required.")
  const h = Number(durationHours)
  if (!Number.isFinite(h) || h <= 0) throw new Error("A duration is required.")
  const capped = Math.min(h, MAX_DURATION_H)
  const gate: TestOtpGate = {
    enabledUntil: Date.now() + Math.round(capped * 3600_000),
    emails: list,
    updatedBy: updatedBy ? String(updatedBy).toLowerCase() : null,
    updatedAt: Date.now(),
  }
  await writeGate(gate)
  return gate
}

/** Turn the runtime gate off immediately (env bootstrap, if set, is unaffected). */
export async function disableTestOtpGate(updatedBy?: string | null): Promise<TestOtpGate> {
  const gate: TestOtpGate = {
    ...EMPTY, updatedBy: updatedBy ? String(updatedBy).toLowerCase() : null, updatedAt: Date.now(),
  }
  await writeGate(gate)
  return gate
}

async function writeGate(gate: TestOtpGate): Promise<void> {
  if (!db) return
  await db.execute({
    sql: "INSERT INTO schema_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    args: [SETTING_KEY, JSON.stringify(gate)],
  })
}

/** True when the env bootstrap/override is set (local dev + CI path). */
export function envTestOtpEnabled(): boolean { return !!process.env.KLAV_TEST_OTP }

function envAllowlist(): string[] { return normalizeEmails(process.env.KLAV_TEST_OTP_EMAILS ?? "") }

export interface TestOtpDecision {
  /** The bypass may be used for this email right now. */
  allowed: boolean
  /** Which gate granted it — for the audit log. */
  via: "env" | "opsadmin" | null
}

/**
 * The ONE decision point: may `email` use the test-OTP bypass right now?
 *
 * `isTestAccount` is passed in (rather than queried here) so this module stays free of a
 * test-accounts import cycle. It may be a thunk, which is only awaited once a gate is actually
 * active — so the normal (bypass-off) login path costs no extra DB round-trip.
 */
export async function testOtpDecision(
  email: string, isTestAccount: boolean | (() => boolean | Promise<boolean>) = false,
): Promise<TestOtpDecision> {
  const e = String(email ?? "").trim().toLowerCase()
  if (!e) return { allowed: false, via: null }
  const isAcct = async () => (typeof isTestAccount === "function" ? !!(await isTestAccount()) : isTestAccount)
  if (envTestOtpEnabled() && (envAllowlist().includes(e) || await isAcct())) return { allowed: true, via: "env" }
  const gate = await getTestOtpGate()
  // Expiry is checked on every request — the gate goes inert the moment the clock passes
  // enabledUntil, with no restart and no sweeper job.
  if (gate.enabledUntil > Date.now() && (gate.emails.includes(e) || await isAcct())) {
    return { allowed: true, via: "opsadmin" }
  }
  return { allowed: false, via: null }
}

/**
 * Is the bypass active at all right now (either gate), ignoring the per-email allowlist? Used by
 * the AutoSim runner paths, which are already scoped to a registered Test Account row — those are
 * granted by both gates regardless of allowlist, exactly like testOtpDecision's isTestAccount branch.
 */
export async function testOtpActiveForTestAccounts(): Promise<boolean> {
  if (envTestOtpEnabled()) return true
  return (await getTestOtpGate()).enabledUntil > Date.now()
}

// ── audit trail ────────────────────────────────────────────────────────────────
// Every accepted bypass login is recorded so /opsadmin can show WHO used it and WHEN, instead of
// making an ops admin grep [TEST-OTP-USED] out of journalctl. Best-effort: an audit write never
// blocks or fails a login.

export interface TestOtpUse { id: string; createdAt: number; email: string; via: string; ip: string | null }

export async function recordTestOtpUse(email: string, via: string, ip?: string | null): Promise<void> {
  if (!db) return
  try {
    await db.execute({
      sql: "INSERT INTO test_otp_uses (id,created_at,email,via,ip) VALUES (?,?,?,?,?)",
      args: ["totp_" + crypto.randomUUID(), Date.now(), String(email).trim().toLowerCase(), via, ip ?? null],
    })
  } catch (e) { console.warn("[TEST-OTP-USED] audit write failed:", String(e)) }
}

export async function listTestOtpUses(limit = 50): Promise<TestOtpUse[]> {
  if (!db) return []
  try {
    const n = Math.max(1, Math.min(500, Number(limit) || 50))
    const r = await db.execute({ sql: `SELECT * FROM test_otp_uses ORDER BY created_at DESC LIMIT ${n}`, args: [] })
    return r.rows.map((x: any) => ({
      id: String(x.id), createdAt: Number(x.created_at), email: String(x.email),
      via: String(x.via), ip: x.ip != null ? String(x.ip) : null,
    }))
  } catch { return [] }
}
