// Auth helpers: random tokens, email allowlist, cookie (de)serialisation.

export function token(bytes = 32): string {
  const a = new Uint8Array(bytes)
  crypto.getRandomValues(a)
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("")
}

// 6-digit numeric one-time code.
export function otp(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000
  return String(n).padStart(6, "0")
}

// Allow all if no allowlist configured; otherwise require email or its domain to be listed.
export function emailAllowed(email: string): boolean {
  const domains = (process.env.KLAV_ALLOWED_DOMAINS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  const emails = (process.env.KLAV_ALLOWED_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (!domains.length && !emails.length) return true
  const e = email.toLowerCase()
  if (emails.includes(e)) return true
  const dom = e.split("@")[1] || ""
  return domains.includes(dom)
}

// Our own staff domains. Internal signers-in get a far more generous OTP request budget and skip
// the shared-office-IP throttle (see the /api/auth/request handler) — the per-IP limit exists to
// stop anonymous OTP bombing, which a trusted staff domain behind the access list doesn't warrant.
// Extra domains can be added via KLAV_INTERNAL_DOMAINS (comma-separated); the defaults always apply.
const INTERNAL_DOMAINS_DEFAULT = ["quantana.in", "quantana.com.au"]
export function isInternalEmail(email: string): boolean {
  const dom = String(email || "").toLowerCase().split("@")[1] || ""
  if (!dom) return false
  const extra = (process.env.KLAV_INTERNAL_DOMAINS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  return INTERNAL_DOMAINS_DEFAULT.includes(dom) || extra.includes(dom)
}

// Ops super-admin allowlist for /opsadmin. Distinct from project/account roles. Fail closed:
// an empty or unset OPS_ADMIN_EMAILS means nobody qualifies.
export function isOpsAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const list = (process.env.OPS_ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  return list.includes(email.toLowerCase())
}

// sameSite defaults to "Lax" — every existing caller (OIDC's callback is a cross-site top-level
// GET redirect, which Lax already covers) keeps its exact current behavior. SAML's ACS binding
// is a cross-site POST, which Lax cookies are NOT sent on — its login route passes "None"
// explicitly for the klav_sso_state cookie so it actually arrives at the callback.
export function cookie(name: string, val: string, maxAge: number, secure: boolean, sameSite: "Lax" | "None" = "Lax"): string {
  return `${name}=${val}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAge}${secure ? "; Secure" : ""}`
}
export function clearCookie(name: string, secure: boolean): string {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`
}
// KLAVITYKLA-299: non-HttpOnly cookie for the user's last-selected project.
// Not HttpOnly so the client JS can also read it for same-tab consistency; the
// server reads it as a fallback when no ?project= param is supplied.
// Max-Age = 90 days (matches typical session lifetime expectation).
export function projectCookie(projectId: string, secure: boolean): string {
  return `klav_proj=${encodeURIComponent(projectId)}; Path=/; SameSite=Lax; Max-Age=${90 * 86400}${secure ? "; Secure" : ""}`
}
export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  ;(header || "").split(";").forEach((p) => {
    const i = p.indexOf("=")
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim()
  })
  return out
}
